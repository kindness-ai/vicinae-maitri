import {
  Action,
  ActionPanel,
  Grid,
  Toast,
  showToast,
  showHUD,
  closeMainWindow,
} from "@vicinae/api";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const exec = promisify(execFile);
const MAITRI = process.env.MAITRI_PATH || join(homedir(), ".local/share/maitri");
const IMG = /\.(png|jpe?g|gif|bmp|webp)$/i;

function currentThemeName(): string | undefined {
  try {
    return readFileSync(join(homedir(), ".config/maitri/current/theme.name"), "utf8").trim();
  } catch {
    return undefined;
  }
}

// Mirrors maitri's background selector: current theme backgrounds, then the
// user's per-theme backgrounds dir, de-duped by filename.
function listBackgrounds(): string[] {
  const dirs = [join(homedir(), ".config/maitri/current/theme/backgrounds")];
  const theme = currentThemeName();
  if (theme) dirs.push(join(homedir(), ".config/maitri/backgrounds", theme));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const d of dirs) {
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      if (!IMG.test(f) || seen.has(f)) continue;
      const p = join(d, f);
      try {
        if (!statSync(p).isFile()) continue;
      } catch {
        continue;
      }
      seen.add(f);
      out.push(p);
    }
  }
  return out.sort((a, b) => basename(a).localeCompare(basename(b)));
}

function title(p: string): string {
  return basename(p)
    .replace(IMG, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function setBackground(path: string) {
  try {
    await closeMainWindow();
    await exec(join(MAITRI, "bin", "maitri-theme-bg-set"), [path]);
    await showHUD("Background updated");
  } catch (e) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to set background",
      message: String(e),
    });
  }
}

export default function BackgroundPicker() {
  const backgrounds = listBackgrounds();
  return (
    <Grid searchBarPlaceholder="Set background...">
      <Grid.Section columns={3} fit={Grid.Fit.Fill}>
        {backgrounds.map((p) => (
          <Grid.Item
            key={p}
            title={title(p)}
            content={{ source: p }}
            actions={
              <ActionPanel>
                <Action title="Set Background" onAction={() => setBackground(p)} />
              </ActionPanel>
            }
          />
        ))}
      </Grid.Section>
    </Grid>
  );
}
