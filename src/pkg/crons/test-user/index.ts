import { Cron } from '../../../core/cron';

export default class AddNewUserCron extends Cron {
    execution: Cron.ExecFunc<AddNewUserCron> = (data, staticData) => {
        console.log(++data.count);
    }
    data = {
        count: 0
    };
    /** Every second */
    expression = "* * * * * *";
    identifier = "AddNewUserCron";
    group = "wb-internal";
    author = "QuinnDT";
    onStartup = true;
}