import { sbQuery } from 'supi-core-query';
import TemplateCoreModule from './template';

export interface ConfigValue {
    Key: string;
    Value: any;
    Type: string;
    Description: string;
    Secret: boolean;
}

export default class Config extends TemplateCoreModule {
    static module: Config;
    static data: Map<string, any>;
    constructor(query: sbQuery) {
        super(query)
        if (Config.module) return Config.module;
        Config.module = this;
        Config.data = new Map();
    }

    async get(key: string): Promise<any|null> {
        // Check memory cache
        let mem_cache_val = Config.data.get(key);
        if (typeof mem_cache_val !== "undefined") return mem_cache_val;

        // Check database
        let db_values: ConfigValue[] = await Config.Query.getRecordset(rs=>rs
            .select("*")
            .from("wb_core", "config")
            .where("`Key` = %s", key)
            .limit(1)
        );
        if (db_values.length < 1) return null;
        let db_val = db_values[0];

        // Set to the correct type
        switch (db_val.Type) {
            case "string":
                break;
            case "number":
                let original = db_val.Value;
                db_val.Value = Number(db_val.Value)
                if (isNaN(db_val.Value) || Infinity === db_val.Value || -Infinity === db_val.Value) {
                    let contents = db_val.Secret ? "Config contents are secret." : `Config contents: '${original}'`
                    throw new Error(`Number config key '${key}' has invalid definition, and results in ${db_val.Value}. ${contents}`)
                }
                break;
            default:
                throw new Error(`Config key '${db_val.Key}' has invalid type definition, or type '${db_val.Type}' is not supported.`)
        }

        Config.data.set(key, db_val.Value);

        return db_val.Value;
    } 

}
