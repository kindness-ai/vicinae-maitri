import {
  Action,
  ActionPanel,
  Grid,
  Icon,
  Toast,
  showToast,
  showHUD,
  closeMainWindow,
} from "@vicinae/api";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const exec = promisify(execFile);

// maitri ships to ~/.local/share/maitri; user theme overrides live under ~/.config/maitri/themes.
const MAITRI = process.env.MAITRI_PATH || join(homedir(), ".local/share/maitri");
const USER_THEMES = join(homedir(), ".config/maitri/themes");
const DEFAULT_THEMES = join(MAITRI, "themes");

type Theme = { name: string; title: string; preview?: string };

function findPreview(dir: string): string | undefined {
  for (const f of ["preview.png", "preview.jpg"]) {
    const p = join(dir, f);
    if (existsSync(p)) return p;
  }
  const bg = join(dir, "backgrounds");
  if (existsSync(bg)) {
    const imgs = readdirSync(bg)
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .sort();
    if (imgs.length) return join(bg, imgs[0]);
  }
  return undefined;
}

function prettify(name: string): string {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function listThemes(): Theme[] {
  const seen = new Set<string>();
  const themes: Theme[] = [];
  // User themes take precedence over the maitri-shipped ones.
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
      seen.add(entry);
      const preview = findPreview(dir) ?? findPreview(join(DEFAULT_THEMES, entry));
      themes.push({ name: entry, title: prettify(entry), preview });
    }
  }
  return themes.sort((a, b) => a.title.localeCompare(b.title));
}

async function applyTheme(theme: Theme) {
  try {
    await closeMainWindow();
    await exec(join(MAITRI, "bin", "maitri-theme-set"), [theme.name]);
    await showHUD(`Theme set: ${theme.title}`);
  } catch (e) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to set theme",
      message: String(e),
    });
  }
}

export default function ThemePicker() {
  const themes = listThemes();
  return (
    <Grid searchBarPlaceholder="Set maitri theme...">
      <Grid.Section columns={3} fit={Grid.Fit.Fill}>
        {themes.map((t) => (
          <Grid.Item
            key={t.name}
            title={t.title}
            content={t.preview ? { source: t.preview } : { source: Icon.Brush }}
            actions={
              <ActionPanel>
                <Action title="Apply Theme" onAction={() => applyTheme(t)} />
              </ActionPanel>
            }
          />
        ))}
      </Grid.Section>
    </Grid>
  );
}
