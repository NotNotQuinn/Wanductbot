import AbstractController from './controllers/abstract'
import { Core } from './core'
import TwitchController from './controllers/twitch'
(async()=>{
    require("../db-access")
    const core: Core = await (await import("./core")).default;

    const controller = new TwitchController(core);
    controller.connect()

})();
