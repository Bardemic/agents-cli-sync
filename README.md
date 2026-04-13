# sync-ide

One CLI command to open any interface for coding from your active path.

Agent Orchestrators:
- T3 Code
- Codex
- OpenCode GUI
- Superset

IDEs:
- Cursor
- Orchids
- Virtual Studio Code
- Zed

Else:
- Github Desktop

## Install

```bash
npm install -g ide-open
```

## Usage

```bash
cd ~/repos/my-project
ide [choice]      # cursor, t3, zed, ghd, codex, orchids, vscode, opencode, superset
ide list          # show every supported provider
ide --help
```

## Unsupported platforms

These don't expose any way to open a specific directory from outside the app without a hacky workaround:

- **Cursor (Glass)**
- **Conductor**
- **Claude Desktop**

> *If you work on one of these, please add a way to open a target directory from the command line, deep link, etc :D*

&nbsp;

&nbsp;

![CLI](https://raw.githubusercontent.com/Bardemic/agents-cli-sync/main/CLI.png)
