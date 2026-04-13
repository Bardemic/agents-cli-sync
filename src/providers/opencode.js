import { existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";

export const opencodeProvider = {
  name: "opencode",
  aliases: [],
  description: "OpenCode desktop",

  async open(workspaceRoot) {
    if (!existsSync(workspaceRoot) || !statSync(workspaceRoot).isDirectory()) {
      throw new Error(`Not a directory: ${workspaceRoot}`);
    }
    if (process.platform !== "darwin") {
      throw new Error(`OpenCode provider only supports macOS right now (got ${process.platform}).`);
    }

    const url = `opencode://open-project?directory=${encodeURIComponent(workspaceRoot)}`;
    const result = spawnSync("open", [url], { stdio: "inherit" });
    if (result.status !== 0) {
      throw new Error(
        `Failed to launch OpenCode deep link (\`open ${url}\` exited with ${result.status}). Is OpenCode installed? Does your version support the open-project deep link (PR sst/opencode#10072)?`,
      );
    }
    console.log(`Opened ${workspaceRoot} in OpenCode.`);
  },
};
