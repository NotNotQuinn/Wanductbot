export default abstract class TemplateCoreModule {
    static data: Array<unknown> | Map<unknown, unknown>;
    loadData?: () => Promise<void> = undefined;
}
