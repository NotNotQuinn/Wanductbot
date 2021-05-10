import AbstractController from "./abstract";
import * as DankIRC from "dank-twitch-irc";
import { UserIdentifier } from '../core/user';

export default class TwitchController extends AbstractController {
    static client: DankIRC.ChatClient;
    Ready: Promise<any>;
    constructor() {
        super()
        this.Ready = (async()=>{
            TwitchController.client = new DankIRC.ChatClient({
                username: (await core.Config?.get("TWITCH_USERNAME")) ?? (()=>{ throw new Error("Could not load twitch username.") })(),
                password: process.env.TWITCH_OAUTH
            })
        })();
    }

    get channels (): Set<string> {
        return TwitchController.client.wantedChannels;
    };

    get isConnected () {
        return TwitchController.client.connected;
    }

    async initialize () {
        TwitchController.client.on("PRIVMSG", this.handlePrivmsg);
        await this.connect();
        this.join("wanduct");
    }

    async connect() {
        TwitchController.client.connect();
    }

    async dm (identifier: UserIdentifier, message: string) {
        let user = (await core.User?.get(identifier))
        if (!user) throw new Error(`Cannot whisper user identified by '${identifier}' (type ${typeof identifier}), no such user.`);
        await TwitchController.client.whisper(user.Name, message);
    }

    async join (channel: string) {
        await TwitchController.client.join(channel)
    }

    async stop () {
        TwitchController.client.close()
    }

    async part (channel: string) {
        await TwitchController.client.part(channel)
    }

    handlePrivmsg (msg: DankIRC.PrivmsgMessage) {
        console.log("message", { msg: msg.messageText, user: msg.senderUsername, channel: msg.channelName })
    }

}