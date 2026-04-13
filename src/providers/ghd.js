import { existsSync, statSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";

const APP_NAME_MAC = "GitHub Desktop";

export const ghdProvider = {
  name: "ghd",
  aliases: ["github-desktop", "githubdesktop"],
  description: "GitHub Desktop",

  async open(workspaceRoot) {
    if (!existsSync(workspaceRoot) || !statSync(workspaceRoot).isDirectory()) {
      throw new Error(`Not a directory: ${workspaceRoot}`);
    }

    if (process.platform === "darwin") {
      const result = spawnSync("open", ["-a", APP_NAME_MAC, workspaceRoot], { stdio: "inherit" });
      if (result.status !== 0) {
        throw new Error(
          `Failed to open GitHub Desktop (is it installed?). 'open -a "${APP_NAME_MAC}"' exited with ${result.status}.`,
        );
      }
      console.log(`Opened ${workspaceRoot} in GitHub Desktop.`);
      return;
    }

    // Linux/Windows: rely on the `github` CLI shim if available.
    const cli = spawn("github", [workspaceRoot], { detached: true, stdio: "ignore" });
    cli.on("error", () => {
      console.error(
        `Auto-launch not implemented for ${process.platform}. Install the 'github' CLI from GitHub Desktop's menu and re-run.`,
      );
    });
    cli.unref();
  },
};
