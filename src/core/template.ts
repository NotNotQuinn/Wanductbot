export default abstract class TemplateCoreModule {
    /** Data unique to this module. */
    static data: Array<unknown> | Map<unknown, unknown>;
    /** Loads data on startup. */
    static loadData?: () => Promise<void> = undefined;
}
