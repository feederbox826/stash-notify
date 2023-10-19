// imports
import { CommandInt } from "../types/CommandInt";
// commands
import { checknotify } from "./checknotify";
import { notify } from "./notify";

// command list
// prettier-ignore
export const CommandList: CommandInt[] = [
  checknotify, notify
];
