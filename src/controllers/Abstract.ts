import { UserIdentifier } from '../core/user'
import { Core } from '../core'

abstract class AbstractController {
    abstract get isConnected(): boolean;
    abstract get channels(): Set<string>;
    core: Core;
    constructor(core: Core) {
        this.core = core;
    }
    /** Connect and start liscening for messages. */
    abstract connect(...args: any[]): Promise<void>;
    /** Join a channel. */
    abstract join(channel: string): Promise<void>;
    /** Leave a channel. */
    abstract part(channel: string): Promise<void>;
    /** Send a private message (if able) */
    abstract dm(user: UserIdentifier, message: string) : Promise<void>;
    /** Connect, and start executing commands. */
    abstract initialize(): Promise<void>;
    /** Disconnect and stop executing commands. */
    abstract stop(): Promise<void>;
}

export default AbstractController;
