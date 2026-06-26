import { Action, ActionPanel, Color, List, Toast, closeMainWindow, showToast } from "@vicinae/api";
import { useEffect, useState } from "react";
import { capture, ph, run } from "./lib/menu";

type Bind = {
  combo: string;
  label: string;
  dispatcher: string;
  arg: string;
  special: boolean; // XF86 / media / mouse / bare keycode — sorted to the bottom
};

// Hyprland modmask bits.
function modText(mask: number): string {
  const parts: string[] = [];
  if (mask & 64) parts.push("SUPER");
  if (mask & 1) parts.push("SHIFT");
  if (mask & 4) parts.push("CTRL");
  if (mask & 8) parts.push("ALT");
  return parts.join(" ");
}

function humanize(dispatcher: string, arg: string): string {
  return (arg ? `${dispatcher} ${arg}` : dispatcher).trim();
}

export default function Keybindings() {
  const [binds, setBinds] = useState<Bind[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    capture(["hyprctl", "-j", "binds"])
      .then((out) => {
        let raw: Array<Record<string, unknown>> = [];
        try {
          raw = JSON.parse(out);
        } catch {
          raw = [];
        }
        const parsed: Bind[] = raw
          .filter((b) => b && typeof b.dispatcher === "string" && b.dispatcher)
          .map((b) => {
            const mods = modText(Number(b.modmask) || 0);
            const key = String(b.key || (b.keycode ? `code:${b.keycode}` : "")).toUpperCase();
            const combo = [mods, key].filter(Boolean).join(" + ") || (b.mouse ? "Mouse" : "");
            const dispatcher = String(b.dispatcher);
            const arg = b.arg ? String(b.arg) : "";
            const label = (typeof b.description === "string" && b.description.trim()) || humanize(dispatcher, arg);
            const special = key.startsWith("XF86") || Boolean(b.mouse) || (!mods && Boolean(b.keycode));
            return { combo, label, dispatcher, arg, special };
          })
          .filter((b) => b.label);
        // Keep config order, but push media/XF86/mouse binds to the bottom (stable sort).
        parsed.sort((a, b) => Number(a.special) - Number(b.special));
        setBinds(parsed);
      })
      .finally(() => setLoading(false));
  }, []);

  async function runBind(b: Bind) {
    // Execute the bind exactly as pressing the key would.
    const argv = ["hyprctl", "dispatch", b.dispatcher];
    if (b.arg) argv.push(b.arg);
    const r = await run(argv);
    if (!r.ok) {
      await showToast({ style: Toast.Style.Failure, title: "Failed to run shortcut", message: r.stderr.slice(0, 160) });
      return;
    }
    await closeMainWindow();
  }

  return (
    <List isLoading={loading} searchBarPlaceholder="Search keybindings…">
      {binds.map((b, i) => (
        <List.Item
          key={`${i}-${b.combo}`}
          icon={ph("keyboard", Color.PrimaryText)}
          title={b.label}
          keywords={b.combo.split(/\s+/)}
          accessories={[{ tag: { value: b.combo, color: Color.SecondaryText } }]}
          actions={
            <ActionPanel>
              <Action title="Run Shortcut" icon={ph("play", Color.PrimaryText)} onAction={() => runBind(b)} />
              <Action.CopyToClipboard title="Copy Shortcut" content={b.combo} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
