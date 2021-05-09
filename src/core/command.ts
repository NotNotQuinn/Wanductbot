import TemplateCoreModule from "./template";

export abstract class Command {
    /** The person who made the command. */
    abstract Author: string;
    /** The implimentation of the command. */
    abstract Execution: Command.ExecFunc;
    /** A function that returns an object, called once when the command is loaded. */
    getStaticData?: () => object;
    /** Data that is saved until the command reloads. */
    data: {} = {};
    /** A frozen object that is loaded once when the command is loaded. */
    readonly staticData!: ReturnType<NonNullable<this["getStaticData"]>>;
}

export namespace Command {
    export class Context {
    }
    export type ExecFunc = (context: Command.Context, ...args: string[] ) => Promise<Command.ReturnValue>;

    export type Identifier = Command | string;

    export type ReturnValue = {
        reply: string;
        success?: boolean;
    } | null;
}

export default class CommandManager extends TemplateCoreModule {
    static module?: CommandManager;
    constructor() {
        super();
        if (CommandManager.module) return CommandManager.module;
        CommandManager.module = this;
    }
    async get(identifier: Command.Identifier) {
        if (identifier instanceof Command) return identifier;
    }

    loadData = async () => {
        let dir = await core.Config!.get("WB_PKG_DIR") as string;

    }
}
