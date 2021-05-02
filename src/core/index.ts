const core = (async()=>{
    const Query = await (await import("supi-core-query")).default();
    return {
        User: new (await import("./user")).default(Query)
    }
})();

export default core;
/**
 * This removes the Promise around a type.
 * 
 * `UnwrapPromise<Promise< YOUR_TYPE_HERE >> = YOUR_TYPE_HERE`
 * 
 * if `any` cannot go into your type, then it will become `unknown`
 */
type UnwrapPromise<T extends Promise<any>> = T extends Promise<infer U> ? U : unknown;

export type Core = UnwrapPromise<typeof import(".").default>
