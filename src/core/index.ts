import { sbQuery } from "supi-core-query";

const core = (async()=>{
    const Query: sbQuery = await (await import("supi-core-query")).default();
    return {
        User: new (await import("./user")).default(),
        Query: Query,
        Config: new (await import("./config")).default()
    }
})();

// use core as a global object
// @ts-ignore
globalThis["core"] = core;

export default await core;
export type Core = typeof import(".").default

// define core as a global object
declare global {
    var core: Core
}
