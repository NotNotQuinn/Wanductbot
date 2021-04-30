import DB from "./db";

class User {
    ID: number;
    Name: string;
    Twitch_ID: number;
    First_Seen: Date;
    
        // should be pretty simple at the start, lets store these properties
        // twitch id
        // local id
        // name
        // started using (auto set)
    
        constructor(ID: number, Name: string, Twitch_ID: number, First_Seen: Date) {
            this.ID = ID;
            this.Name = Name;
            this.Twitch_ID = Twitch_ID;
            this.First_Seen = First_Seen;
        }
}

class UserManager {
    static Users: User[] = [];

    static get (identifier: number|string|User): User|null {
        if (identifier instanceof User) return identifier;
        else if (typeof identifier === "string") {
            return this.Users.find(user=>user.Name === identifier) ?? null;
        }
        else if (typeof identifier === "number") {
            return this.Users.find(user=>user.ID === identifier) ?? null;
        } else {

        }
        return null;
    }
}
export default UserManager;