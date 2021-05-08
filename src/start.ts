import AbstractController from './controllers/abstract'
import core from './core'
(async()=>{
    require("../env")
    require("../db-access")

    const controllers = await AbstractController.getAllControllers(core);
    controllers.forEach(async controller => {
        await controller.Ready;
        controller.initialize()
    });

})();
