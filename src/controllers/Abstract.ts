import { Core } from '../core';
import { UserIdentifier } from '../core/user';

export default abstract class AbstractController {
	core: Core = {};
	abstract Ready: Promise<any>
	abstract get isConnected(): boolean;
	abstract get channels(): Set<string>;
	/** Connect and start listening for messages. */
	abstract connect(...args: any[]): Promise<void>;
	/** Join a channel. */
	abstract join(channel: string): Promise<void>;
	/** Leave a channel. */
	abstract part(channel: string): Promise<void>;
	/** Send a message in a channel. */
	abstract send(channel: string, message: string): Promise<void>;
	/** Send a private message (if able) */
	abstract dm(user: UserIdentifier, message: string): Promise<void>;
	/** Connect, and start executing commands. */
	abstract initialize(): Promise<void>;
	/** Disconnect and stop executing commands. */
	abstract stop(): Promise<void>;
	/** Join all channels it should join. */
	abstract joinAllActive(): Promise<void>;
	constructor(core: Core) {
		Object.assign(this.core, core);
	}
}
