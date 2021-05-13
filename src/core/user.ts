import { sbDate, sbQuery } from 'supi-core-query';
import TemplateCoreModule from './template';
export interface rawUser {
    /** Unique numeric ID */
    ID: number;
    /** Twitch username */
    Name: string;
    /** Twitch ID */
    Twitch_ID: number;
    /** Date & time first seen */
    First_Seen: sbDate;
}

export class User {
    /** Unique numeric ID */
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

export default abstract class UserManager extends TemplateCoreModule {
    /** Maps user ID to User object. */
    static data: Map<number, User> = new Map();
    /** Maps username to user ID */
    static nameData: Map<string, number> = new Map();

    static async get (identifier: UserIdentifier): Promise<User|null> {
        if (identifier instanceof User) {
            return identifier;
        }
        let condition: string;
        if (typeof identifier === "string") {
            let id = UserManager.nameData.get(identifier);
            let candidate: User | undefined;
            if (id) candidate = UserManager.data.get(id);
            if (candidate) return candidate;
            condition = "Name = %s";
        }
        else if (typeof identifier === "number") {
            let candidate = UserManager.data.get(identifier);
            if (candidate) return candidate;
            condition = "ID = %n";
        }
        
        let possible_users: rawUser[] | undefined = await this.core?.Query?.getRecordset(rs=>rs
            .select("*")
            .from("wb_core", "user")
            // @ts-ignore identifier can be anything
            .where(condition, identifier)
            .limit(1)
        );

        if ((possible_users?.length ?? 0) < 1) return null;

        let user = new User(possible_users![0])
        UserManager.data.set(user.ID, user);
        UserManager.nameData.set(user.Name, user.ID);
        return user;
    }
}

export type UserIdentifier = User | number | string
