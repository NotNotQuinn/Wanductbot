import AbstractController from './controllers/abstract'
import { Core } from './core'
(async()=>{
    require("../env")
    require("../db-access")
    const core: Core = await (await import("./core")).default;

    const controllers = await AbstractController.getAllControllers(core);
    controllers.forEach(controller => {
        controller.initialize()
    });

})();
