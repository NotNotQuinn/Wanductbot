import TemplateCoreModule from "./template";
import * as path from "path";
import * as fs from "fs/promises";
import { User, UserIdentifier } from "./user";
import { Channel, ChannelIdentifier } from "./channel";


// TODO: Move deepFreeze into seperate module/place.
function deepFreeze (object: object) {
    const properties = Object.getOwnPropertyNames(object);
    for (const key of properties) {
        // @ts-ignore
        const value = object[key];
        if (value && typeof value === "object" && value.constructor !== RegExp) {
            deepFreeze(value);
        }
    }

    return Object.freeze(object);
}

export abstract class Command {
    constructor() {
        // @ts-ignore Commands rely on this - assignment to readonly property 'staticData'.
        this.staticData = deepFreeze( typeof this.getStaticData === "undefined" ? {} : this.getStaticData() );

        if (typeof this.data === "undefined") this.data = {};
    }

    /** Necessary: The name of the command. */
    abstract name: string;
    /** Necessary: The implimentation of the command. */
    abstract Execution: Command.ExecFunc;
    /** Necessary: The person who made the command. */
    abstract author: string;

    /** Optional: A function that returns an object, called once when the command is loaded. */
    getStaticData?: (() => ({}));
    /** Optional: Data that is saved until the command reloads. */
    data = {};
    /** Optional: A list of alternative names used to reference this command. */
    aliases: string[] = [];

    /** A frozen object that is loaded once when the command is loaded. */
    readonly staticData: ReturnType<NonNullable<this["getStaticData"]>>;
}

export namespace Command {
    export class Context {
        constructor( public user: User, public channel: Channel ) {
        }
    }

    export type ExecFunc = (context: Command.Context, ...args: string[] ) => Promise<Command.ReturnValue>;

    export type Identifier = Command | string;

    export type ReturnValue = {
        reply: string;
        success?: boolean;
    } | null;
}

export default abstract class CommandManager extends TemplateCoreModule {
    /** A map of command names to command objects. */
    static data: Map<string, Command> = new Map();
    /** A map of command aliases to command names. */
    static aliasData: Map<string, string> = new Map();

    /** Gets a command with the name. */
    static async get(identifier: Command.Identifier) {
        if (identifier instanceof Command) return identifier;
    }

    static set(name: string, cmd: Command) {
        CommandManager.data.set(name, cmd);
        for (const alias of cmd.aliases) {
            CommandManager.aliasData.set(alias, name);
        }
    };

    /** Loads a command from a file path, and returns it. */
    static load (directory: string, save = true): Command {
        const cmd: Command = require(directory)?.default;
        if (!cmd) {
            throw new Error(`Command at location '${directory}' has invalid definition, or does not export definition as default.`);
        };
        // @ts-ignore Commands rely on this - assignment to readonly property 'staticData'.
        if (typeof cmd.getStaticData !== "undefined") cmd.staticData = cmd.getStaticData();
        if (typeof cmd.data === "undefined") cmd.data = {};
        if (save) {
            let dir = path.parse(directory);
            let cmdName: string;
            if (dir.base == "index.ts") 
                cmdName = path.parse(dir.dir).name;
            else cmdName = dir.name;
            this.set(cmdName, cmd);
        }
        return cmd;
    };

    static loadData = async () => {
        CommandManager.data = new Map();
        let dir = await core.Config!.get("WB_PKG_DIR") as string;
        dir = path.join(dir, "commands");
        let files = await fs.readdir(dir);

        for (let i = 1; i < files.length; i++) {
            const file = path.join(dir, files[i])
            let cmd: Command;
            try {
                cmd = CommandManager.load(file);
            } catch (e) {
                console.error(e);
                console.warn(`Skipping loading command from file '${file}'`);
                continue;
            }
            CommandManager.set(files[i], cmd);
        }
    };

    static checkAndExecute (name: string, args: string[], channel: ChannelIdentifier, user: UserIdentifier) {

    }

}
