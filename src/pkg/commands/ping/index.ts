import { Command } from '../../../core/command';

export default class PingCommand extends Command {
    Execution: Command.ExecFunc = async () => {
        ++this.data.count;
        return {
            reply: `Pong! ${this.data.count}x`
        };
    }
    data = { count: 0 };
    Author = "QuinnDT";
}