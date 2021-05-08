import { sbQuery } from 'supi-core-query';
export default abstract class TemplateCoreModule {
    static Query: sbQuery;
    static data: Array<unknown> | Map<unknown, unknown>;
    constructor(query: sbQuery) {
        TemplateCoreModule.Query = query;
    }
}
