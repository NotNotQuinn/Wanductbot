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
    static data: Map<string, any> = new Map();
    constructor() {
        super();
        if (Config.module) return Config.module;
        Config.module = this;
    }

    static async get(key: string): Promise<any|null> {
        // Check memory cache
        let mem_cache_val = Config.data.get(key);
        if (typeof mem_cache_val !== "undefined") return mem_cache_val;

        // Check database
        let db_values: ConfigValue[] | undefined = await core.Query?.getRecordset?.(rs=>rs
            .select("*")
            .from("wb_core", "config")
            .where("`Key` = %s", key)
            .limit(1)
        );
        
        if ((db_values?.length ?? 0) < 1) return null;
        let db_val = this.formatValue(db_values![0]);
        
        Config.data.set(key, db_val.Value);

        return db_val.Value;
    }

    static formatValue(rawValue: ConfigValue) {
        // Set to the correct type
        switch (rawValue?.Type) {
            case "string":
                break;
            case "number":
                let original = rawValue.Value;
                rawValue.Value = Number(rawValue.Value)
                if (isNaN(rawValue.Value) || Infinity === rawValue.Value || -Infinity === rawValue.Value) {
                    let contents = rawValue.Secret ? "Config contents are secret." : `Config contents: '${original}'`
                    throw new Error(`Number config key '${rawValue.Key}' has invalid definition, and results in ${rawValue.Value}. ${contents}`)
                }
                break;
            default:
                throw new Error(`Config key '${rawValue.Key}' has invalid type definition, or type '${rawValue.Type}' is not supported.`)
        }
        return rawValue;
    }

    static loadData = async () => {
        if (!core.Query) {
            console.trace("Config data not loaded - Query is not loaded.");
            return;
        }
        const values: ConfigValue[] = await core.Query.getRecordset(rs => rs
            .select("*")
            .from("wb_core", "config")
        );
        for (let value of values) {
            try {
                value = Config.formatValue(value);
            } catch (err) {
                console.error(err);
                continue;
            }
            Config.data.set(value.Key, value.Value);
        }
    }
}
