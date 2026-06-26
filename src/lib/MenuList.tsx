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
  popToRoot,
  showHUD,
  showToast,
  useNavigation,
} from "@vicinae/api";
import { useEffect, useState } from "react";
import { type Cmd, type Group, type Launch, type Node, type Toggle, ph, run, spawnDetached } from "./menu";

async function execNode(exec: string[], terminal: boolean | undefined, hud: string | undefined) {
  // Launch-and-leave: spawn DETACHED so the child survives the worker teardown
  // that closeMainWindow() triggers, then close immediately. Awaiting the child
  // would hold the menu open until the launched app/terminal exits.
  if (terminal) {
    spawnDetached(["maitri-launch-floating-terminal-with-presentation", exec.join(" ")]);
  } else {
    spawnDetached(exec);
  }
  if (hud) await showHUD(hud);
  else await closeMainWindow();
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
  // Drop back to Vicinae's main search (apps + all commands).
  if (node.root) {
    await popToRoot();
    return;
  }
  // Opening another Vicinae command replaces this view (fast) — no close needed.
  if (node.deeplink) {
    await run(["vicinae", node.deeplink]);
    return;
  }
  // External launches are fire-and-forget: spawn detached, then close now.
  if (node.app) spawnDetached(["gtk-launch", node.app]);
  else if (node.url) spawnDetached(["maitri-launch-webapp", node.url]);
  else if (node.editor) spawnDetached(["maitri-launch-editor", node.editor]);
  await closeMainWindow();
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
