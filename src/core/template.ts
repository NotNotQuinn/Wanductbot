import { Core } from ".";

type CoreDeps<T extends keyof Core> = {
    [Key in T]-?: Core[Key];
};

export default abstract class TemplateCoreModule {
    static core: Core = {};
    /** Data unique to this module. */
    static data: Array<unknown> | Map<unknown, unknown>;
    /** Loads data on startup. */
    static loadData?: () => Promise<void> = undefined;
    static registerDeps<T extends keyof Core>(deps: CoreDeps<T>): void {
        Object.assign(this.core, deps);
    };

}
