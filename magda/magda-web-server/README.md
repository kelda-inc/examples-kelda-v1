# Debugging

## VS Code

Debugging using VS Code should already be set up using the `.vscode/launch.json`
file.

1. Run `kelda dev` and open the `magda-web-server` directory in VS
   Code.

2. Set a breakpoint in `src/index.ts` (for example, inside
   `app.get("/server-config.js", ...)`).

3. Hit F5 to attach the debugger, or open the debugging pane on the left (the
   one with the literal bug) and click the run button at the top.

4. Hit the web app in the browser and your breakpoint should get hit.

## Intellij IDEA

These instructions might require Ultimate (the paid version). In general, it
seems Intellij doesn't work quite as well as VS Code. I've had some problems
with old breakpoints triggerring or breakpoints triggerring incorrectly. This
doesn't appear to be related to Kelda.

To set up:

1. Go to settings (`Ctrl-Alt-S`) and then Plugins. Install the NodeJS plugin.

2. Open the `magda-web-server` dir in Intellij.

3. Go to Run > Edit Configurations. Click the plus icon in the upper left corner
   and choose "Attach to Node.js/Chrome".

4. The default settings should be right (Host: localhost, Port: 9229, started
   with --inspect).

5. Under "Remote URLs of local files", add a Remote URL of `/usr/src/app` for
   the `magda-web-server` directory.

To run, start `kelda dev` like normal and then go to Run > Debug
(`Alt-Shift-F9`) and run the new configuration. Set some breakpoints and hit
them!
