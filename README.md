# agents-cli-sync

Open any repo in your coding agent GUI.

CLI coding agents like Claude Code or Codex open wherever you `cd`'d to. Desktop GUIs (T3 Code, etc.) don't — you have to click through a folder picker. This CLI fixes that: `cd` into a repo, run `coding <provider>`, and the project is registered and the app launches.

## Install

```bash
npm install -g agents-cli-sync
```

Or run without installing:

```bash
npx agents-cli-sync t3
```

## Usage

```bash
coding t3              # register cwd in T3 Code and launch it
coding t3 ./some/path  # register a specific path
coding list            # list supported providers
coding --help
```

## Supported providers

| Name | Aliases | Notes |
| ---- | ------- | ----- |
| `t3` | `t3chat`, `t3code` | [T3 Code](https://github.com/pingdotgg/t3code). Requires the desktop app to have been launched at least once (so `~/.t3/userdata/state.sqlite` exists). Honors `T3CODE_HOME`. |

### How the T3 integration works

The T3 Code desktop app doesn't expose a CLI flag, deep link, or IPC channel for adding a project from outside. Instead, this CLI writes directly to the same local SQLite database the app itself writes to when you use its folder picker:

1. Inserts a `project.created` row into `orchestration_events` (event sourcing source of truth).
2. Inserts a matching row into `projection_projects` so the project appears immediately.
3. Launches the desktop app via `open -a "T3 Code (Alpha)"` (macOS).

No modifications to the T3 Code source. If the app was already running when you ran the command, quit and relaunch it so it picks up the new project.

Platforms: macOS is tested. Linux/Windows will register the project but won't auto-launch the app yet.

## Adding a provider

Providers live in `src/providers/`. Each one exports `{ name, aliases, description, open(absPath) }` and registers itself in `src/providers/index.js`. PRs welcome.
