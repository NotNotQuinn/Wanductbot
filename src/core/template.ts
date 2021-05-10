export default abstract class TemplateCoreModule {
    static data: Array<unknown> | Map<unknown, unknown>;
    static loadData?: () => Promise<void> = undefined;
}
