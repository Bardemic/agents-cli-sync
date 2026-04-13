import { existsSync, statSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";

const BUNDLED_CURSOR_CLI_MAC = "/Applications/Cursor.app/Contents/Resources/app/bin/cursor";

function openInCursor(workspaceRoot, extraArgs = []) {
  if (!existsSync(workspaceRoot) || !statSync(workspaceRoot).isDirectory()) {
    throw new Error(`Not a directory: ${workspaceRoot}`);
  }

  const cli = resolveCursorCli();
  if (!cli) {
    throw new Error(
      "Could not find the `cursor` CLI. Install Cursor and run the `Cursor: Install 'cursor' command` action from the command palette.",
    );
  }

  spawn(cli, [...extraArgs, workspaceRoot], { detached: true, stdio: "ignore" }).unref();
}

function resolveCursorCli() {
  const onPath = spawnSync("which", ["cursor"], { encoding: "utf8" });
  if (onPath.status === 0 && onPath.stdout.trim()) return onPath.stdout.trim();
  if (process.platform === "darwin" && existsSync(BUNDLED_CURSOR_CLI_MAC)) return BUNDLED_CURSOR_CLI_MAC;
  return null;
}

export const cursorProvider = {
  name: "cursor",
  aliases: [],
  description: "Cursor IDE (classic)",

  async open(workspaceRoot) {
    openInCursor(workspaceRoot, ["--classic"]);
    console.log(`Opened ${workspaceRoot} in Cursor (classic).`);
  },
};

export const cursorGlassProvider = {
  name: "cursor-glass",
  aliases: ["cursorglass", "cursor-v3"],
  description: "Cursor Glass (v3) — multi-workbench mode",

  async open(workspaceRoot) {
    openInCursor(workspaceRoot, ["--glass"]);
    console.log(`Opened ${workspaceRoot} in Cursor Glass.`);
  },
};
