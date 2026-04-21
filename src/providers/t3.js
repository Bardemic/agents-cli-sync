import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

const APP_NAME_MAC = "T3 Code (Alpha)";
const DEFAULT_MODEL_SELECTION = { provider: "codex", model: "gpt-5.4" };

export const t3Provider = {
  name: "t3",
  aliases: ["t3chat", "t3code"],
  description: "T3 Code (https://github.com/pingdotgg/t3code)",

  async open(workspaceRoot) {
    if (!existsSync(workspaceRoot) || !statSync(workspaceRoot).isDirectory()) {
      throw new Error(`Not a directory: ${workspaceRoot}`);
    }

    const runtime = readServerRuntime();
    if (!runtime) {
      throw new Error("T3 Code server runtime not found. Launch T3 Code before using ide t3.");
    }

    const sessionCookieName = await readSessionCookieName(runtime);
    const cookie = readSessionCookie(sessionCookieName);
    if (!cookie) {
      throw new Error(
        `T3 Code session cookie ${sessionCookieName} not found. Sign in to T3 Code before using ide t3.`,
      );
    }

    await openViaHttp(runtime, cookie, workspaceRoot);
    launchDesktopApp();
    console.log(`Opened ${workspaceRoot} in T3 Code.`);
  },
};

function readServerRuntime() {
  const home = process.env.T3CODE_HOME || path.join(os.homedir(), ".t3");
  const file = path.join(home, "userdata", "server-runtime.json");
  if (!existsSync(file)) return null;
  try {
    const runtime = JSON.parse(readFileSync(file, "utf8"));
    if (!runtime?.port || !runtime?.host) return null;
    return runtime;
  } catch {
    return null;
  }
}

async function readSessionCookieName(runtime) {
  const origin = runtime.origin || `http://${runtime.host}:${runtime.port}`;
  const sessionState = await fetchJson(`${origin}/api/auth/session`, {
    headers: {
      Accept: "application/json",
    },
  });
  const cookieName = sessionState?.auth?.sessionCookieName;
  if (typeof cookieName !== "string" || cookieName.trim().length === 0) {
    throw new Error("T3 Code auth session endpoint did not include a session cookie name.");
  }
  return cookieName;
}

function readSessionCookie(cookieName) {
  const candidates = [
    path.join(os.homedir(), "Library/Application Support/t3code/Cookies"),
    path.join(os.homedir(), ".config/t3code/Cookies"),
  ];
  for (const dbPath of candidates) {
    if (!existsSync(dbPath)) continue;
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });
    try {
      const row = db
        .prepare("SELECT value FROM cookies WHERE name = ? LIMIT 1")
        .get(cookieName);
      if (row?.value) return { name: cookieName, value: row.value };
    } finally {
      db.close();
    }
  }
  return null;
}

async function openViaHttp(runtime, cookie, workspaceRoot) {
  const origin = runtime.origin || `http://${runtime.host}:${runtime.port}`;
  const headers = {
    "Content-Type": "application/json",
    Cookie: `${cookie.name}=${cookie.value}`,
    Accept: "application/json",
  };

  const snapshot = await fetchJson(`${origin}/api/orchestration/snapshot`, { headers });
  const existing = snapshot.projects?.find(
    (p) => p.workspaceRoot === workspaceRoot && !p.deletedAt,
  );

  const projectId = existing?.id ?? randomUUID();
  const projectCreated = !existing;

  if (projectCreated) {
    await dispatchCommand(origin, headers, {
      type: "project.create",
      commandId: randomUUID(),
      projectId,
      title: path.basename(workspaceRoot) || workspaceRoot,
      workspaceRoot,
      defaultModelSelection: DEFAULT_MODEL_SELECTION,
      createdAt: new Date().toISOString(),
    });
  }

  return { projectId, projectCreated };
}

async function fetchJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${init?.method ?? "GET"} ${url} → ${res.status} ${res.statusText} ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function dispatchCommand(origin, headers, command) {
  return fetchJson(`${origin}/api/orchestration/dispatch`, {
    method: "POST",
    headers,
    body: JSON.stringify(command),
  });
}

function launchDesktopApp() {
  if (process.platform === "darwin") {
    spawn("open", ["-a", APP_NAME_MAC], { detached: true, stdio: "ignore" }).unref();
    return;
  }
  console.log(
    `(Auto-launch not implemented for ${process.platform}. Start T3 Code manually.)`,
  );
}
