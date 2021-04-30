# Wanductbot

A Twitch bot meant for developers.

# Inspiration

Based off of supibot, a bot made by supinic. I forked supibot and started learning about it, and how it works and I 
got inspired and thinking of ways to optimise, and this is a general layout of the project structure

# file structure

 - `/dist/*`
    - JS compiled code.

 - `/src/core`
    - like supi-core, but not a seperate package, however can still be used as a sperate entity via `require("wanductbot/core")`
    - includes things like database access, executing commands, etc.
    - must have its own index file, linked database: `wb_core`

 - `/src/pkg`
    - bot should be able to run without any files in this directory. (although there will be nothing happening, lol)

 - `/src/pkg/commands` 
    - chat commands for the bot

 - `/src/pkg/commands/*` 
    - will contain directories with the name that can be captured like so using regex: `(?<name>[-_a-zA-z0-9]*)$`
    - each directory will contain at least one file, called `execution.js` (or something)
    - possibly including more, such as tests, static data, sql table definitions (that it uses in `wb_command_data`)

 - `/src/pkg/crons` 
    - Contains time based things, like chat message reminders, etc, etc. (idea)

 - `/src/pkg/crons/*`
    - directories with the same naming scheme as commands.
    - containing files like create, info, sql - etc. very similar to commands, hmm...

 - `/src/pkg/modules` 
    - code that will run automatically on subscribed events, like messages in specific channels, and even online/offline (idea from supibot)

 - `/src/pkg/modules/*`
    - idk lol, somewhat similar to commands. check out supibot.
 - `/docs`
    - documents ideas (like this), practaces, and other things like setup instructions and interesting things
    - anything I think someone starting out would need to know to work on, create, or fork the bot.
    - as well as just to understand it, there should be at least one good starting point that will introduce some heavily used ideas more in depth than the readme.

 - `/sql`
    - sql files that contain table and database definitions as well as default data

 - `/sql/defintions`
    - github:supinic/supibot/init/definitions

 - `/sql/data`
    - github:supinic/supibot/init/initial-data

 - `/init`
    - things that automatically setup the bot, look into supinics supibot/init folder

 - `/src/controllers`
    - A directory that contains abstractions for comunicating with text-based chat platforms as well as a template for generalising them.

 - `/src/controllers/all.js`
    - A file that contains all common/default funcitonallity for a controller (but doesnt connect to anything).
    - Look into github:supinic/supibot/controllers/template.js

# database structure 

- database `wb_core`
  - will contain things _NEEDED_ for the bot to work, and only that. bare minimum.
  - e.g. Config, possibly go through supibots `data` table as inspiration, however can be reduced.
  - should be possible to start and run the bot ONLY using this database 
  - (testing is _very_ important for this, as I want people to be able to take this and expand upon and just try it out on their own)
- database `wb_command_data`
  - an idea
  - each command could be linked to its own database, entirely isolated, managed by commands and
  - with a way to access it from 
- database `wb_data`
  - A place to store data used for advanced functions.

##### [License](./LICENSE)
```
MIT License

Copyright (c) 2021 Quinn T <https://github.com/notnotquinn>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
