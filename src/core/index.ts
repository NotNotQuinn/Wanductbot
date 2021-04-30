const core = (async()=>{
    const Query = await (await import("supi-core-query")).default();
    return {
        User: await import("./user")
    }
})();

export default core;