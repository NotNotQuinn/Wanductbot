import AbstractController from "./abstract";
import DankIRC from "dank-twitch-irc";

export class TwitchController extends AbstractController {
    client: DankIRC.ChatClient;
    channels: string[];
    constructor() {
        super()
        this.channels = [];
        this.client = new DankIRC.ChatClient({
            username: "wanductbot",
            password: process.env.TWITCH_OAUTH
        })
        this.client.on("PRIVMSG", this.handlePrivmsg)
    }
    async connect() {
        this.client.connect();

    }
    handlePrivmsg (msg: DankIRC.PrivmsgMessage) {
        
    }
}