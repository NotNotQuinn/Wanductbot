import { UserIdentifier } from '../core/user';
import { Core } from '../core';
import TwitchController from './twitch';

abstract class AbstractController {
	abstract Ready: Promise<any>
	abstract get isConnected(): boolean;
	abstract get channels(): Set<string>;
	static core: Core;
	constructor(core: Core) {
		AbstractController.core = core;
	}
	/** Connect and start listening for messages. */
	abstract connect(...args: any[]): Promise<void>;
	/** Join a channel. */
	abstract join(channel: string): Promise<void>;
	/** Leave a channel. */
	abstract part(channel: string): Promise<void>;
	/** Send a private message (if able) */
	abstract dm(user: UserIdentifier, message: string): Promise<void>;
	/** Connect, and start executing commands. */
	abstract initialize(): Promise<void>;
	/** Disconnect and stop executing commands. */
	abstract stop(): Promise<void>;

	static async getAllControllers(core: Core): Promise<AbstractController[]> {
		return [ new TwitchController(core) ]
	}

}

export default AbstractController;
