import * as node_cron from 'node-cron';
import * as path from 'path';
import { promises as fs } from "fs";
import TemplateCoreModule from './template';
import { Timezone } from 'tz-offset';
import { deepFreeze } from './command'

export abstract class Cron implements Cron.Options {
    abstract author: string;
    abstract expression: string;
    abstract execution: Cron.ExecFunc<any>;
    abstract identifier: string;
    onStartup?: boolean;
    group?: string | undefined;
    scheduled?: boolean | undefined;
    timezone?: Timezone | undefined;
    getStaticData?: () => ({});
    readonly staticData: ReturnType<NonNullable<this["getStaticData"]>>;
    data: {} = {};
    constructor() {
        // @ts-ignore
        this.staticData = deepFreeze( typeof this.getStaticData === "undefined" ? {} : this.getStaticData() );
    }
}

export namespace Cron {
    export type ExecFunc<T extends Cron> = (data: T["data"] , staticData: ReturnType<NonNullable<T["getStaticData"]>>) => void;
    export interface Options extends node_cron.ScheduleOptions {
        /** 
         * Cron expression. Use `*` for any, list with commas, or range.
         * 
         * Order is:
         * 
         *     `````````````````````````````
         *       Seconds - 0-59 (optional)
         *       Mins - 0-59
         *       Hours - 0-23
         *       Day of month - 1-31
         *       Month - 1-12 (Or names)
         *       Day of week 0-7 (Or names, 0 or 7 are sunday)
         *     `````````````````````````````
         */
        expression: string;
        /** Function to execute on intervals. */
        execution: (...args: any[]) => any;
        /** Unique string to identify this cron within its group. */
        identifier: string;
        /** Group the cron belongs to. Defaults to `default`. */
        group?: string;
    };
}


export default abstract class CronManager extends TemplateCoreModule {
    static data: Map<string, Map<string, node_cron.ScheduledTask>> = new Map();

    /** Create a new cron, and register it in memory. */
    static new(cron: Cron): node_cron.ScheduledTask {

        let task = this.basicCron({
            expression: cron.expression,
            execution: () => cron.execution(cron.data, cron.staticData),
            identifier: cron.identifier,
            group: cron.group
        })

        return task;
    }

    static load (obj: { filepath: string }): { task: node_cron.ScheduledTask, cron: Cron } {
        const { filepath } = obj;
        let cronClass = require(filepath).default;

        // @ts-ignore This not an abstract class.
        let cron = new cronClass();
        return { task: CronManager.new(cron), cron };
    }

    /** Create & register a basic cron. */
    static basicCron (options: Cron.Options): node_cron.ScheduledTask {
        let { expression, execution, identifier, group } = options;

        group = group ?? "default";
        if (!this.data.has(group)) this.data.set(group, new Map());

        let task = node_cron.schedule(expression, execution, options);

        this.data.get(group)!.set(identifier, task);
        return task;
    }

    /** Get a cron based off of its group and identifier. */
    static get (identifier: string, group?: string): node_cron.ScheduledTask | null {
        let group_map = this.data.get(group ?? "default");
        let task = group_map?.get(identifier);
        return task ?? null;
    }

    static getGroup (group: string): Map<string, node_cron.ScheduledTask> | null {
        return this.data.get(group) ?? null;
    }

    /** Loads cron data on startup. */
    static loadData = async () => {
        if (!CronManager.data.has("default")) CronManager.data.set("default", new Map());

        let dir = await core.Config!.get("WB_PKG_DIR") as string;
        dir = path.join(path.resolve(dir), "crons");
        let files = await fs.readdir(dir);

        let skipped: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = path.join(dir, files[i]);
            let responce: ReturnType<typeof CronManager.load>;
            try {
                responce = CronManager.load({ filepath: file })
            } catch (e) {
                console.error(e);
                skipped.push(file);
                continue;
            }
            if (responce.cron.onStartup) responce.task.start();
        }
        if (skipped.length > 0)
            console.warn(
                `${skipped.length} cron${ skipped.length == 1 ? " was" : "s were"} skipped when loading!`,
                { files: skipped }
            );
    }
}
