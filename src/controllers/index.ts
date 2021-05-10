import AbstractController from "./abstract";
import TwitchController from "./twitch";

export default function getAllControllers(): AbstractController[] {
    return [ new TwitchController() ]
}