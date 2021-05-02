import AbstractController from "./abstract";
import DankIRC from "dank-twitch-irc";
import { UserIdentifier } from '../core/user';
import { Core } from '../core'

export default class TwitchController extends AbstractController {
    client: DankIRC.ChatClient;
    get channels (): Set<string> {
        return this.client.wantedChannels;
    };

    get isConnected () {
        return this.client.connected;
    }

    constructor(core: Core) {
        super(core)
        this.client = new DankIRC.ChatClient({
            username: "wanductbot",
            password: process.env.TWITCH_OAUTH
        })
    }

    async initialize () {
        this.client.on("PRIVMSG", this.handlePrivmsg);
        await this.connect();
    }

    async connect() {
        this.client.connect();
    }

    handlePrivmsg (msg: DankIRC.PrivmsgMessage) {
        console.log("message", { msg: msg.messageText, user: msg.senderUsername, channel: msg.channelName })
    }

    async dm (identifier: UserIdentifier, message: string) {
        let user = (await this.core.User.get(identifier))
        if (!user) throw new Error(`Cannot whisper user identified by '${identifier}' (type ${typeof identifier}), no such user.`);
        await this.client.whisper(user.Name, message);
    }

    async join (channel: string) {
        await this.client.join(channel)
    }

    async stop () {
        this.client.close()
    }

    async part (channel: string) {
        await this.client.part(channel)
    }
}