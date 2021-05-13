import AbstractController from "./abstract";
import * as DankIRC from "dank-twitch-irc";
import { Core } from "../core";
import { UserIdentifier } from "../core/user";

export default class TwitchController extends AbstractController {
    client!: DankIRC.ChatClient;
    Ready: Promise<any>;
    constructor(core: Core) {
        super(core)
        this.Ready = (async()=>{
            this.client = new DankIRC.ChatClient({
                username: (await this.core.Config!.get("TWITCH_USERNAME")) ?? (()=>{ throw new Error("Could not load twitch username.") })(),
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
        this.client.on("PRIVMSG", (msg) => this.handlePrivmsg(msg));
        await this.connect();
        await this.joinAllActive();
    }

    async connect() {
        await this.client.connect();
    }

    async dm (identifier: UserIdentifier, message: string) {
        let user = (await this.core.User?.get(identifier))
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

    async send(channel: string, message: string) {
        this.client.say(channel, message);
    }

    async joinAllActive() {
        let channels: string[] = await this.core.Query!.getRecordset(rs=>rs
            .select("Name")
            .from("wb_core", "channel")
            .flat("Name")
        );
        for(const channel of channels) {
            this.join(channel);
        }
    }

    async handlePrivmsg (msg: DankIRC.PrivmsgMessage): Promise<void> {
        // FIXME: use platforms instead, the database is mostly set up. however the code needs to be done.
        if (msg.senderUsername == "wanductbot") return;
        if (this.core.Command === undefined) return;
        let response: FuncReturn<NonNullable<Core["Command"]>["checkAndExecute"]>;
        try {
            response = await this.core.Command!.checkAndExecute({
                message: msg.messageText,
                channel: msg.channelName,
                user: msg.senderUsername
            });
        } catch (e) {
            console.error("Command execution failed!", e);
            return;
        }
        if (typeof response.reply === "string") {
            await this.send(msg.channelName, response.reply)
        }
    }
    
}

/** A better version of ReturnType => it takes into account async functions. */
type FuncReturn<T extends (...args: any[]) => any> = T extends (...args: any[]) => Promise<infer R> ? R : ReturnType<T>;
