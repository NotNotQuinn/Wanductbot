import initCore from './core';
// @ts-ignore
import '../env';
// @ts-ignore
import '../db-access';
import getAllControllers from './controllers';

(async()=>{
    await initCore();
    const controllers = getAllControllers();

    for (let i = 0; i < controllers.length; i++) {
        let controller = controllers[i];
        console.time(`Controller load`)
        await controller.Ready;
        await controller.initialize()
        console.timeEnd(`Controller load`)
    }
})();
