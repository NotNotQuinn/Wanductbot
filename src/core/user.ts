import { sbQuery, sbDate } from 'supi-core-query';
import TemplateCoreModule from './template';
export interface rawUser {
    /** Uniqu numeric ID */
    ID: number;
    /** Twitch username */
    Name: string;
    /** Twitch ID */
    Twitch_ID: number;
    /** Date & time first seen */
    First_Seen: sbDate;
}

export class User {
    /** Uniqu numeric ID */
    ID: number;
    /** Twitch username */
    Name: string;
    /** Twitch ID */
    Twitch_ID: number;
    /** Date & time first seen */
    First_Seen: sbDate;
    constructor(data: rawUser) {
        this.ID = data.ID;
        this.Name = data.Name;
        this.Twitch_ID = data.Twitch_ID;
        this.First_Seen = data.First_Seen;
    }
}

export default class UserManager extends TemplateCoreModule {
    static data: User[];
    static module: UserManager;

    constructor() {
        super();
        if (UserManager.module) return UserManager.module;
        UserManager.module = this;
        return this;
    }

    async get (identifier: UserIdentifier): Promise<User|null> {
        if (identifier instanceof User) {
            return identifier;
        }
        let condition: string;
        if (typeof identifier === "string") {
            let candidate = UserManager.data.find(user=>user.Name === identifier);
            if (candidate) return candidate;
            condition = "Name = %s"
        }
        else if (typeof identifier === "number") {
            let candidate = UserManager.data.find(user=>user.ID === identifier);
            if (candidate) return candidate;
            condition = "ID = %n";
        }
        
        let possible_users: rawUser[] | undefined = await core?.Query?.getRecordset(rs=>rs
            .select("*")
            .from("wb_core", "user")
            // @ts-ignore identifier can be anything
            .where(condition, identifier)
            .limit(1)
        );

        if ((possible_users?.length ?? 0) < 1) return null;

        let user = new User(possible_users![0])
        UserManager.data.push(user);
        return user;
    }
}

export type UserIdentifier = User | number | string
