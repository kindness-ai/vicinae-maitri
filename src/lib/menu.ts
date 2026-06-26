import { homedir } from "node:os";
import { join } from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { Color, Image } from "@vicinae/api";

const execFileP = promisify(execFile);

// maitri ships to ~/.local/share/maitri unless MAITRI_PATH overrides it.
export const MAITRI = process.env.MAITRI_PATH || join(homedir(), ".local/share/maitri");

/** A Phosphor icon (bundled under assets/phosphor) referenced by its name, e.g. ph("gear"). */
export function ph(name: string, tintColor?: Color): Image.ImageLike {
  return tintColor ? { source: `phosphor/${name}.svg`, tintColor } : { source: `phosphor/${name}.svg` };
}

function resolveExe(cmd: string): string {
  if (cmd.includes("/")) return cmd;
  if (cmd.startsWith("maitri-")) return join(MAITRI, "bin", cmd);
  return cmd;
}

/** Run a command (argv). Bare maitri-* names resolve to the maitri bin dir; PATH is augmented too. */
export async function run(argv: string[]): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  const [cmd, ...rest] = argv;
  try {
    const { stdout, stderr } = await execFileP(resolveExe(cmd), rest, {
      env: { ...process.env, PATH: `${join(MAITRI, "bin")}:${process.env.PATH ?? ""}` },
    });
    return { ok: true, stdout, stderr };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    return { ok: false, stdout: err?.stdout ?? "", stderr: err?.stderr ?? String(e) };
  }
}

/** Capture stdout of a command, trimmed. Returns "" on failure. */
export async function capture(argv: string[]): Promise<string> {
  const r = await run(argv);
  return r.ok ? r.stdout.trim() : "";
}

/** True when a maitri toggle flag file is set (~/.local/state/maitri/toggles/<flag>). */
export async function flagSet(flag: string): Promise<boolean> {
  return (await run(["maitri-toggle-enabled", flag])).ok;
}

/** True when a process with the given name is running. */
export async function processRunning(name: string): Promise<boolean> {
  return (await run(["pgrep", "-x", name])).ok;
}

/** Fire a command detached (survives the extension worker teardown) and return
 * immediately — for launch-and-leave actions where the menu should close now. */
export function spawnDetached(argv: string[]): void {
  const [cmd, ...rest] = argv;
  const child = spawn(resolveExe(cmd), rest, {
    detached: true,
    stdio: "ignore",
    env: { ...process.env, PATH: `${join(MAITRI, "bin")}:${process.env.PATH ?? ""}` },
  });
  child.unref();
}

// ---- Menu node model -------------------------------------------------------

interface Base {
  id: string;
  title: string;
  icon: string; // phosphor icon name
  subtitle?: string;
  keywords?: string[]; // extra search terms
}

/** A submenu: pushes a child list. children may be static or loaded on demand. */
export interface Group extends Base {
  type: "group";
  children: Node[] | (() => Promise<Node[]>);
}

/** Runs a maitri command. */
export interface Cmd extends Base {
  type: "cmd";
  exec: string[];
  terminal?: boolean; // run in a floating terminal (interactive / needs sudo)
  confirm?: { title: string; message?: string }; // ask before running
  destructive?: boolean; // red icon + destructive confirm styling
  hud?: string; // HUD message on success
}

/** A live on/off toggle: shows current state, flips on activation. */
export interface Toggle extends Base {
  type: "toggle";
  isOn: () => Promise<boolean>;
  exec: string[];
  onLabel?: string;
  offLabel?: string;
}

/** Opens something: a Vicinae deeplink, an app, a URL, or a config file in the editor. */
export interface Launch extends Base {
  type: "launch";
  root?: boolean; // open Vicinae's main search (popToRoot)
  deeplink?: string;
  app?: string;
  url?: string;
  editor?: string; // path to open in the user's editor
}

export type Node = Group | Cmd | Toggle | Launch;

export const accent = Color.Blue;
