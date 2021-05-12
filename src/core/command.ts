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

    /** Loads a command from a file path, saves, and returns it. */
    static async load (options: { filepath: string, save?: boolean }): Promise<Command> {
        const { filepath, save = true } = options;
        let dir = path.resolve(path.join(path.resolve(await core.Config!.get("WB_PKG_DIR") as string), "commands"), filepath);

        let cmdClass: typeof Command = require(dir)?.default;
        if (!cmdClass) {
            throw new Error(`Command at location '${dir}' has invalid definition, or does not export definition as default.`);
        };
        // @ts-ignore
        let cmd: Command = new cmdClass();
        if (save) {
            this.set(cmdClass.name, cmd);
        }
        return cmd;
    };

    /** Loads all commands in the package directory, restarting fresh each time. */
    static loadData = async () => {
        CommandManager.data.clear();

        let dir = await core.Config!.get("WB_PKG_DIR") as string;
        dir = path.join(path.resolve(dir), "commands");
        let files = await fs.readdir(dir);

        let skipped: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = path.join(dir, files[i])
            let cmd: Command;
            try {
                cmd = await CommandManager.load({ filepath: file });
            } catch (e) {
                console.error(e);
                skipped.push(file);
                continue;
            }
        }
        if (skipped.length > 0)
            console.warn(
                `${skipped.length} command${ skipped.length == 1 ? " was" : "s were"} skipped when loading!`,
                { files: skipped }
            );
    };

    static checkAndExecute (name: string, args: string[], channel: ChannelIdentifier, user: UserIdentifier) {

    }

}
