import { sbQuery } from "supi-core-query";
// @ts-ignore
import ghor from 'ghor';
import TemplateCoreModule from './template';

import UserManager from './user';
import Config from './config';
import CommandManager from './command';
import ChannelManager from './channel';
import CronManager from './cron';

export default (async (options?: Options<Core>): Promise<Core> => {
    const { whitelist, blacklist } = options ?? {};

    function include(module: keyof Core): boolean {
        if (blacklist && blacklist.includes(module)) {
            return false;
        } else if (whitelist && !whitelist.includes(module)) {
            return false;
        }
        return true;
    }

    async function loadData<T extends typeof TemplateCoreModule>(component: T) {
        await component.loadData?.();
        return component;
    }

    let loaded: Set<string> = new Set();

    async function loadDataOnce<T extends typeof TemplateCoreModule>(component: T) {
        if (loaded.has(component.name)) return component;
        loaded.add(component.name);
        return loadData(component);
    }

    let resolve: (mod: string) => any = ghor({
        Query: async () => {
            return await (await import("supi-core-query")).default()
        },
        Config: async ({ Query }: { Query: Promise<sbQuery> }) => {
            
            Config.registerDeps({ Query: await Query })
            return await loadDataOnce(Config);
        },
        User: async ({ Query }: { Query: Promise<sbQuery> }) => {
            UserManager.registerDeps({ Query: await Query })
            return await loadDataOnce(UserManager)
        },
        Channel: async ({ Query }: { Query: Promise<sbQuery> }) => {
            ChannelManager.registerDeps({ Query: await Query })
            return await loadDataOnce(ChannelManager);
        },
        Command: async ({ Channel, Config: Conf, User }: { Channel: Promise<typeof ChannelManager>, Config: Promise<typeof Config>, User: Promise<typeof UserManager> }) => {
            CommandManager.registerDeps({ Channel: await Channel, User: await User, Config: await Conf  })
            return await loadDataOnce(CommandManager);
        },
        Cron: async ({ Config: Conf }: { Config: Promise<typeof Config> }) => {
            ChannelManager.registerDeps({ Config: await Conf })
            return await loadDataOnce(CronManager);
        },
    }, console.log);

    return {
        Query: ((include("Query")) && await resolve("Query")) || undefined,
        Config: ((include("Config")) && await resolve("Config")) || undefined,
        User: ((include("User")) && await resolve("User")) || undefined,
        Channel: ((include("Channel")) && await resolve("Channel")) || undefined,
        Command: ((include("Command")) && await resolve("Command")) || undefined,
        Cron: ((include("Cron")) && await resolve("Cron")) || undefined,
    }
});

export type Core = Partial<{
    Channel: typeof ChannelManager;
    Config: typeof Config;
    User: typeof UserManager;
    Command: typeof CommandManager;
    Cron: typeof CronManager;
    Query: sbQuery;
}>

export type Options<T> = {
    whitelist?: (keyof T)[];
    blacklist?: (keyof T)[];
}