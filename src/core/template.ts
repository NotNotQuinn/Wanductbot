import { sbQuery } from 'supi-core-query';
export default class TemplateCoreModule {
    static Query: sbQuery;
    static data: Array<unknown>;
    constructor(query: sbQuery) {
        TemplateCoreModule.Query = query;
    }
}
