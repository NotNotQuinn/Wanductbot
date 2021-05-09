// @ts-nocheck
import { sbQuery } from "supi-core-query";

import UserManager from './user';
import Config from './config';
import CommandManager from './command';

export default (async (options: Options<Core>) => {
    function include(module: keyof Core): boolean {
        if (blacklist && blacklist.includes(module)) {
            return false;
        } else if (whitelist && !whitelist.includes(module)) {
            return false;
        }
        return true;
    } 

    const { whitelist, blacklist} = options;

    if (typeof core !== "object") globalThis["core"] = {};

    if (include("Query")) core.Query = await (await import("supi-core-query")).default();
    if (include("Config")) core.Config = new Config();
    if (include("User")) core.User = new UserManager();
    if (include("Command")) core.Command = new CommandManager();
});

export type Core = Partial<{
    Query: sbQuery;
    Config: Config;
    User: UserManager;
    Command: CommandManager;
}>

export type Options<T> = {
    whitelist?: (keyof T)[];
    blacklist?: (keyof T)[];
}

// define core as a global object
declare global {
    var core: Core
}
