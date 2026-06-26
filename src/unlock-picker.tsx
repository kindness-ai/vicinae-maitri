import {
  Action,
  ActionPanel,
  Grid,
  Icon,
  Toast,
  showToast,
  closeMainWindow,
} from "@vicinae/api";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const exec = promisify(execFile);
const MAITRI = process.env.MAITRI_PATH || join(homedir(), ".local/share/maitri");
const USER_THEMES = join(homedir(), ".config/maitri/themes");
const DEFAULT_THEMES = join(MAITRI, "themes");

type Unlock = { name: string; title: string; preview?: string; reset?: boolean };

function prettify(n: string): string {
  return n.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Mirrors maitri_unlocks.lua: a Default (reset) entry, then every theme that
// ships a preview-unlock.png (user themes override the maitri-shipped ones).
function listUnlocks(): Unlock[] {
  const out: Unlock[] = [];
  const def = join(MAITRI, "default/plymouth/preview-unlock.png");
  out.push({ name: "__default__", title: "Default", reset: true, preview: existsSync(def) ? def : undefined });

  const seen = new Set<string>();
  for (const base of [USER_THEMES, DEFAULT_THEMES]) {
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base)) {
      if (seen.has(entry)) continue;
      const dir = join(base, entry);
      try {
        if (!statSync(dir).isDirectory()) continue;
      } catch {
        continue;
      }
      const preview = join(dir, "preview-unlock.png");
      const fallback = join(DEFAULT_THEMES, entry, "preview-unlock.png");
      const p = existsSync(preview) ? preview : existsSync(fallback) ? fallback : undefined;
      if (!p) continue; // only themes that ship an unlock screen
      seen.add(entry);
      out.push({ name: entry, title: prettify(entry), preview: p });
    }
  }
  return out;
}

// plymouth commands require sudo, so run them through maitri's floating terminal
// presentation wrapper (which provides an interactive sudo prompt).
async function applyUnlock(u: Unlock) {
  const cmd = u.reset ? "maitri-plymouth-reset" : `maitri-plymouth-set-by-theme ${u.name}`;
  try {
    await closeMainWindow();
    await exec(join(MAITRI, "bin", "maitri-launch-floating-terminal-with-presentation"), [cmd]);
  } catch (e) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to launch unlock setup",
      message: String(e),
    });
  }
}

export default function UnlockPicker() {
  const unlocks = listUnlocks();
  return (
    <Grid searchBarPlaceholder="Set lock screen...">
      <Grid.Section columns={3} fit={Grid.Fit.Fill}>
        {unlocks.map((u) => (
          <Grid.Item
            key={u.name}
            title={u.title}
            content={u.preview ? { source: u.preview } : { source: Icon.Lock }}
            actions={
              <ActionPanel>
                <Action title="Set Unlock Screen" onAction={() => applyUnlock(u)} />
              </ActionPanel>
            }
          />
        ))}
      </Grid.Section>
    </Grid>
  );
}
