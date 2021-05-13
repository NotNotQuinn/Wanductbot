# Wanductbot

A Twitch bot meant for developers.

Heavily inspired by [supibot](https://github.com/supinic/supibot).

## Structure overview

### Files

- `/src/` - Typescript source files.
  - `/src/core/` - An independent group of files, loaded to a global 
    object `core` anything.
  - `/src/controllers/` - An abstract interface for text based messaging.
  - `/src/pkg/` - The location of all commands and other related files.
    (location can be configured)
- `/docs/` - Documentation. WIP.
- `/init/` - Initialization to set up db/config. WIP.

### Database

- `wb_core`
  - Bot should be able to run with only this database.
  - Holds things like users, channels, config. - Very necessary



##### [License](./LICENSE)
