import {
  Action,
  ActionPanel,
  Alert,
  Color,
  Icon,
  List,
  Toast,
  closeMainWindow,
  confirmAlert,
  showHUD,
  showToast,
  useNavigation,
} from "@vicinae/api";
import { useEffect, useState } from "react";
import { type Cmd, type Group, type Launch, type Node, type Toggle, ph, run } from "./menu";

async function execNode(exec: string[], terminal: boolean | undefined, hud: string | undefined) {
  if (terminal) {
    // Hand off to maitri's floating-terminal presentation wrapper (interactive / sudo).
    await run(["maitri-launch-floating-terminal-with-presentation", exec.join(" ")]);
    await closeMainWindow();
    return;
  }
  await closeMainWindow();
  const r = await run(exec);
  if (r.ok) {
    if (hud) await showHUD(hud);
  } else {
    await showToast({ style: Toast.Style.Failure, title: "Command failed", message: r.stderr.slice(0, 200) });
  }
}

async function runCmd(node: Cmd) {
  if (node.confirm) {
    const ok = await confirmAlert({
      title: node.confirm.title,
      message: node.confirm.message,
      primaryAction: {
        title: node.title,
        style: node.destructive ? Alert.ActionStyle.Destructive : Alert.ActionStyle.Default,
      },
    });
    if (!ok) return;
  }
  await execNode(node.exec, node.terminal, node.hud);
}

async function runLaunch(node: Launch) {
  await closeMainWindow();
  if (node.deeplink) await run(["vicinae", node.deeplink]);
  else if (node.app) await run(["gtk-launch", node.app]);
  else if (node.url) await run(["maitri-launch-webapp", node.url]);
  else if (node.editor) await run(["maitri-launch-editor", node.editor]);
}

function Row({ node, state, refresh }: { node: Node; state?: boolean; refresh: () => void }) {
  const { push } = useNavigation();

  if (node.type === "group") {
    return (
      <List.Item
        icon={ph(node.icon, Color.PrimaryText)}
        title={node.title}
        subtitle={node.subtitle}
        keywords={node.keywords}
        accessories={[{ icon: Icon.ChevronRight }]}
        actions={
          <ActionPanel>
            <Action.Push
              title={`Open ${node.title}`}
              target={<MenuList navigationTitle={node.title} nodes={node.children} />}
            />
          </ActionPanel>
        }
      />
    );
  }

  if (node.type === "toggle") {
    const on = state ?? false;
    return (
      <List.Item
        icon={ph(node.icon, Color.PrimaryText)}
        title={node.title}
        subtitle={node.subtitle}
        keywords={node.keywords}
        accessories={[{ tag: { value: on ? (node.onLabel ?? "On") : (node.offLabel ?? "Off"), color: on ? Color.Green : Color.SecondaryText } }]}
        actions={
          <ActionPanel>
            <Action
              title={on ? `Turn Off ${node.title}` : `Turn On ${node.title}`}
              onAction={async () => {
                await run(node.exec);
                refresh();
              }}
            />
          </ActionPanel>
        }
      />
    );
  }

  if (node.type === "launch") {
    return (
      <List.Item
        icon={ph(node.icon, Color.PrimaryText)}
        title={node.title}
        subtitle={node.subtitle}
        keywords={node.keywords}
        actions={
          <ActionPanel>
            <Action title={node.title} onAction={() => runLaunch(node)} />
          </ActionPanel>
        }
      />
    );
  }

  // cmd
  return (
    <List.Item
      icon={ph(node.icon, node.destructive ? Color.Red : Color.PrimaryText)}
      title={node.title}
      subtitle={node.subtitle}
      keywords={node.keywords}
      actions={
        <ActionPanel>
          <Action
            title={node.title}
            style={node.destructive ? Action.Style.Destructive : Action.Style.Regular}
            onAction={() => runCmd(node)}
          />
        </ActionPanel>
      }
    />
  );
}

export function MenuList({
  navigationTitle,
  nodes,
}: {
  navigationTitle: string;
  nodes: Node[] | (() => Promise<Node[]>);
}) {
  const [items, setItems] = useState<Node[] | null>(Array.isArray(nodes) ? nodes : null);
  const [loading, setLoading] = useState(!Array.isArray(nodes));
  const [states, setStates] = useState<Record<string, boolean>>({});
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (typeof nodes === "function") {
      setLoading(true);
      nodes()
        .then(setItems)
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (!items) return;
    const toggles = items.filter((n): n is Toggle => n.type === "toggle");
    if (toggles.length === 0) return;
    let cancelled = false;
    Promise.all(toggles.map(async (t) => [t.id, await t.isOn()] as const)).then((entries) => {
      if (!cancelled) setStates(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [items, tick]);

  const refresh = () => setTick((t) => t + 1);

  return (
    <List navigationTitle={navigationTitle} isLoading={loading} searchBarPlaceholder={`Search ${navigationTitle}…`}>
      {(items ?? []).map((node) => (
        <Row key={node.id} node={node} state={states[node.id]} refresh={refresh} />
      ))}
    </List>
  );
}
