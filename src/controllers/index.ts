import { Core } from "../core";
import AbstractController from "./abstract";
import TwitchController from "./twitch";

export default function getAllControllers(core: Core): AbstractController[] {
    return [ new TwitchController(core) ]
}