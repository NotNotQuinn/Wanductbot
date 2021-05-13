import TemplateCoreModule from "./template";

export type ChannelIdentifier = string | number | Channel;

export class ChannelManager extends TemplateCoreModule {
    /** All loaded channels. */
    static data: Channel[] = [];

    /** 
     * Get a channel object based off of the ID, or Name.
     * If the indentifier is already channel, it will be returned with no changes.
     */
    static async get(data: { identifier: ChannelIdentifier }): Promise<Channel | null> {
        const { identifier } = data;

        let condition: [string, number|string];

        if (identifier instanceof Channel) return identifier;
        else if (typeof identifier === "string") {
            let candidate = this.data.find(i=> i.Name === identifier) ?? null;
            if (candidate) return candidate;
            condition = ["Name = %s", identifier];
        } else if (typeof identifier === "number") {
            let candidate = this.data.find(i=> i.ID = identifier);
            if (candidate) return candidate;
            condition = ["ID = %n", identifier];
        } else {
            throw new Error(`Invalid channel identifier type '${typeof identifier}'.`)
        }

        let [candidate]: rawChannel[] = await this.core.Query!.getRecordset(rs => rs
            .select("*")
            .from("wb_core", "channel")
            // @ts-ignore types are wrong
            .where(...condition)
            .limit(1)
        )

        if (!candidate) return null;

        let chan = new Channel(candidate);
        this.data.push(chan);
        return chan;
    }

    static loadData = async () => {
        let channels: rawChannel[] = await ChannelManager.core.Query!.getRecordset(rs => rs
            .select("*")
            .from("wb_core", "channel")
        )

        for (let i = 0; i < channels.length; i++) {
            ChannelManager.data.push( new Channel(channels[i]) );
        }
    }
}

export namespace ChannelManager {
    export const rawChannel: rawChannel|null = null;
    export const Channel: Channel|null = null;
}

export interface rawChannel {
    ID: number;
    Name: string;
    Platform: number;
    Specific_ID: number | null;
}

export class Channel {
    /** Internal ID of channel. */
    ID: number;
    /** Name of channel. */
    Name: string;
    /** The platform that the channel belongs to. */
    Platform: number;
    /** The ID of the channel specifically on the platform. (e.g. twitch ID) */
    Specific_ID: number | null;
    constructor(data: rawChannel) {
        this.ID = data.ID;
        this.Name = data.Name;
        // TODO: get platform object
        this.Platform = data.Platform;
        this.Specific_ID = data.Specific_ID;
    }
}


export default ChannelManager;
