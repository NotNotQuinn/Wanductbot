import './core';
import '../env';
import '../db-access';
import AbstractController from './controllers/abstract';

(async()=>{
    const controllers = await AbstractController.getAllControllers(core);

    for (let i = 0; i < controllers.length; i++) {
        let controller = controllers[i];
        await controller.Ready;
        controller.initialize()
        
    }

})();
