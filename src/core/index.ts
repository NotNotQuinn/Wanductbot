import { sbQuery } from "supi-core-query";

import TemplateCoreModule from './template';

import UserManager from './user';
import Config from './config';
import CommandManager from './command';
import Channel from './channel';
import CronManager from './cron';

export default (async (options?: Options<Core>) => {
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

    if (typeof core !== "object") globalThis["core"] = {};

    // Order here is important. 1. Query 2. Config 3. User 4. Channel 5. Command & Cron
    if (include("Query")) core.Query = await (await import("supi-core-query")).default();
    if (include("Config")) core.Config = await loadData(Config);
    if (include("User")) core.User = await loadData(UserManager);
    if (include("Channel")) core.Channel = await loadData(Channel);
    if (include("Command")) core.Command = await loadData(CommandManager);
    if (include("Cron")) core.Cron = await loadData(CronManager);
});

export type Core = Partial<{
    Channel: typeof Channel;
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

// define core as a global object
declare global {
    var core: Core;
}
