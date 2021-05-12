import AbstractController from "./abstract";
import * as DankIRC from "dank-twitch-irc";
import { UserIdentifier } from '../core/user';

export default class TwitchController extends AbstractController {
    client!: DankIRC.ChatClient;
    Ready: Promise<any>;
    constructor() {
        super()
        this.Ready = (async()=>{
            this.client = new DankIRC.ChatClient({
                username: (await core.Config?.get("TWITCH_USERNAME")) ?? (()=>{ throw new Error("Could not load twitch username.") })(),
                password: process.env.TWITCH_OAUTH
            })
        })();
    }

    get channels (): Set<string> {
        return this.client.wantedChannels;
    };

    get isConnected () {
        return this.client.connected;
    }

    async initialize () {
        this.client.on("PRIVMSG", this.handlePrivmsg);
        await this.connect();
        await this.join("wanduct");
    }

    async connect() {
        await this.client.connect();
    }

    async dm (identifier: UserIdentifier, message: string) {
        let user = (await core.User?.get(identifier))
        if (!user) throw new Error(`Cannot whisper user identified by ${typeof identifier} '${identifier}', no such user.`);
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

    handlePrivmsg (msg: DankIRC.PrivmsgMessage) {
        if (core.Command === undefined) return;
        try {
            core.Command?.checkAndExecute({ message: msg.messageText, channel: msg.channelName, user: msg.senderUsername });
        } catch (e) {
            console.error("Command execution failed!", e);
        }
    }

}