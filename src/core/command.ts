import TemplateCoreModule from "./template";
import * as path from "path";
import * as fs from "fs/promises";
import { User, UserIdentifier } from "./user";
import { Channel, ChannelIdentifier } from "./channel";


// TODO: Move deepFreeze into seperate module/place.
export function deepFreeze (object: object) {
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
        // @ts-ignore The types dont line up, because its hard coded to be '{}'.
        this.staticData = deepFreeze( typeof this.getStaticData === "undefined" ? {} : this.getStaticData() );
    }

    /** Necessary: The name of the command. */
    abstract Name: string;
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
    
    export type FailReason = 
        | "bad-format"
        | "command-fail"
        | "command-error"
        | "null-reply"
        | "no-user"
        | "no-command"
        | "no-channel"
        | "malformated-return"
    ;

    export class Context {
        constructor( public user: User, public channel: Channel ) {
        }
    }

    export type ExecFunc = (context: Command.Context, ...args: string[] ) => Promise<Command.ReturnValue>;

    export type Identifier = Command | string;

    export type ReturnValue = {
        reply?: string | null;
        success?: boolean;
    };
}

export interface Execution extends Partial<NonNullable<Command.ReturnValue>> {
    success: boolean;
    reason?: string;
    reason_code?: Command.FailReason;
}

export default abstract class CommandManager extends TemplateCoreModule {
    /** A map of command names to command objects. */
    static data: Map<string, Command> = new Map();
    /** A map of command aliases to command names. */
    static aliasData: Map<string, string> = new Map();

    private static _prefix: string | null = null;

    static get prefix (): string | null {

        if (this._prefix) return this._prefix;
        return null;
    }

    /** Gets a command with the name. */
    static async get(identifier: Command.Identifier) {
        if (identifier instanceof Command) return identifier;
        if (CommandManager.data.has(identifier)) return CommandManager.data.get(identifier);
        if (CommandManager.aliasData.has(identifier)) {
            return CommandManager.data.get(CommandManager.aliasData.get(identifier) as string)
        };
    }
    /** Register a command into memory. */
    static register(cmd: Command) {
        CommandManager.data.set(cmd.Name, cmd);
        for (const alias of cmd.aliases) {
            CommandManager.aliasData.set(alias, cmd.Name);
        }
    };

    /** Loads a command from a file path, saves, and returns it. */
    static async load (options: { filepath: string, save?: boolean }): Promise<Command> {
        const { filepath, save = true } = options;
        let dir = path.resolve(path.join(path.resolve(await this.core.Config!.get("WB_PKG_DIR") as string), "commands"), filepath);

        let cmdClass: typeof Command = require(dir)?.default;
        if (!cmdClass) {
            throw new Error(`Command at location '${dir}' has invalid definition, or does not export definition as default.`);
        };
        // @ts-ignore
        let cmd: Command = new cmdClass();
        if (save) {
            this.register(cmd);
        }
        return cmd;
    };

    /** Loads all commands in the package directory, restarting fresh each time. */
    static loadData = async () => {
        CommandManager._prefix = await CommandManager.core.Config?.get("COMMAND_PREFIX") as string ?? null;

        CommandManager.data.clear();

        let dir = await CommandManager.core.Config!.get("WB_PKG_DIR") as string;
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

    /** Parses a raw message into the command name and arguments to use for execution. */
    static parseMsg(message: string): { identifier: string | undefined; args: string[] } {
        let args = message.split(" ");
        let identifier: string | undefined = undefined;
        if (!this.prefix) {
            args.shift();
            return { identifier: undefined, args };
        };
        if (args[0]?.startsWith(this.prefix)) {
            identifier = args.shift();
            identifier = identifier?.slice(this.prefix.length);
        };
        return { args, identifier }
    }

    /** 
     * Checks if a message needs command execution, and executes if needed.
     */
    static async checkAndExecute (execData: {message: string, channel: ChannelIdentifier, user: UserIdentifier}): Promise<Execution> {
        let { message: raw_message, channel: raw_channel, user: raw_user } = execData;

        const { identifier, args } = this.parseMsg(raw_message);
        if (!identifier) return { success: false, reason: "Does not match command format.", reason_code: "bad-format" };

        const command = await CommandManager.get(identifier);
        if (!command) return { success: false, reason: "Command not found.", reason_code: "no-command" };

        const channel = await this.core.Channel!.get({ identifier: raw_channel });
        if (!channel) return { success: false, reason: "Channel not found.", reason_code: "no-channel" };

        const user = await this.core.User!.get(raw_user);
        if (!user) return { success: false, reason: "User not found.", reason_code: "no-user" };

        let context = new Command.Context(user, channel);
        let result: Command.ReturnValue;
        try {
            result = await command.Execution(context, ...args);
        } catch (e) {
            return { success: false, reason: "The command resulted in an error.", reason_code: "command-error" };
        }

        if (typeof result !== "object") return { success: false, reason: "Command result is malformatted.", reason_code: "malformated-return" };
        if (result.reply === null) return { success: true, reason: "Command reply was `null`.", reason_code: "null-reply" };

        return { success: true, ...result };
    }
}
