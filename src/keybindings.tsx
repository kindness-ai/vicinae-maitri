import { Action, ActionPanel, Color, List } from "@vicinae/api";
import { useEffect, useState } from "react";
import { capture, ph } from "./lib/menu";

type Bind = { combo: string; action: string };

// maitri-menu-keybindings --print emits "COMBO → action" lines already sorted by
// usefulness (terminal/window/workspace first; XF86/media keys last), which is
// exactly the ordering we want — so we render that order as-is.
export default function Keybindings() {
  const [binds, setBinds] = useState<Bind[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    capture(["maitri-menu-keybindings", "--print"])
      .then((out) => {
        const parsed = out
          .split("\n")
          .filter((l) => l.includes("→"))
          .map((l) => {
            const idx = l.indexOf("→");
            return { combo: l.slice(0, idx).trim(), action: l.slice(idx + 1).trim() };
          })
          .filter((b) => b.combo && b.action);
        setBinds(parsed);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <List isLoading={loading} searchBarPlaceholder="Search keybindings…">
      {binds.map((b, i) => (
        <List.Item
          key={`${i}-${b.combo}`}
          icon={ph("keyboard", Color.PrimaryText)}
          title={b.action}
          keywords={b.combo.split(/\s+/)}
          accessories={[{ tag: { value: b.combo, color: Color.SecondaryText } }]}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy Shortcut" content={b.combo} />
              <Action.CopyToClipboard title="Copy Action" content={b.action} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
