import AbstractController from "./Abstract";
import DankIRC from "dank-twitch-irc";

class TwitchController extends AbstractController {
    client: DankIRC.ChatClient;
    constructor() {
        super()
        this.client = new DankIRC.ChatClient({
            username: "wanductbot",
            password: process.env.TWITCH_OAUTH
        })
    }
    async connect(a:1) {
        
    }
}