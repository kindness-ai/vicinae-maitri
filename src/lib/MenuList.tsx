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
import { useEffect, useMemo, useState } from "react";
import { type Cmd, type Launch, type Node, type Toggle, ph, run, spawnDetached } from "./menu";
import { VIEWS } from "./views";

// A live trailing value (current selection, update badge) rendered as a tag.
function accList(acc: string | null | undefined, color?: Color) {
  return acc ? [{ tag: { value: acc, color: color ?? Color.SecondaryText } }] : [];
}

type Entry = { node: Node; trail: string[] };

// Flatten the tree into every node + its breadcrumb trail, recursing only into
// statically-defined children (async children stay navigable via their group).
function flattenAll(nodes: Node[], trail: string[] = []): Entry[] {
  const out: Entry[] = [];
  for (const node of nodes) {
    out.push({ node, trail });
    if (node.type === "group" && Array.isArray(node.children)) {
      out.push(...flattenAll(node.children, [...trail, node.title]));
    }
  }
  return out;
}

function matches(entry: Entry, query: string): boolean {
  const hay = `${entry.node.title} ${entry.trail.join(" ")} ${entry.node.keywords?.join(" ") ?? ""}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

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
  if (node.root) {
    await popToRoot();
    return;
  }
  if (node.deeplink) {
    await run(["vicinae", node.deeplink]);
    return;
  }
  if (node.app) spawnDetached(["gtk-launch", node.app]);
  else if (node.url) spawnDetached(["maitri-launch-webapp", node.url]);
  else if (node.editor) spawnDetached(["maitri-launch-editor", node.editor]);
  await closeMainWindow();
}

function Row({
  node,
  state,
  acc,
  breadcrumb,
  refresh,
}: {
  node: Node;
  state?: boolean;
  acc?: string | null;
  breadcrumb?: string;
  refresh: () => void;
}) {
  const subtitle = breadcrumb || node.subtitle;

  if (node.type === "view") {
    const Comp = VIEWS[node.view];
    return (
      <List.Item
        icon={ph(node.icon, Color.PrimaryText)}
        title={node.title}
        subtitle={subtitle}
        keywords={node.keywords}
        accessories={[...accList(acc, node.accessoryColor), { icon: Icon.ChevronRight }]}
        actions={<ActionPanel>{Comp ? <Action.Push title={`Open ${node.title}`} target={<Comp />} /> : null}</ActionPanel>}
      />
    );
  }

  if (node.type === "group") {
    return (
      <List.Item
        icon={ph(node.icon, Color.PrimaryText)}
        title={node.title}
        subtitle={subtitle}
        keywords={node.keywords}
        accessories={[...accList(acc, node.accessoryColor), { icon: Icon.ChevronRight }]}
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
        subtitle={subtitle}
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
        subtitle={subtitle}
        keywords={node.keywords}
        accessories={accList(acc, node.accessoryColor)}
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
      subtitle={subtitle}
      keywords={node.keywords}
      accessories={accList(acc, node.accessoryColor)}
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
  global,
}: {
  navigationTitle: string;
  nodes: Node[] | (() => Promise<Node[]>);
  global?: boolean; // root menu: search jumps to any action across the whole tree
}) {
  const [items, setItems] = useState<Node[] | null>(Array.isArray(nodes) ? nodes : null);
  const [loading, setLoading] = useState(!Array.isArray(nodes));
  const [states, setStates] = useState<Record<string, boolean>>({});
  const [accVals, setAccVals] = useState<Record<string, string | null>>({});
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (typeof nodes === "function") {
      setLoading(true);
      nodes()
        .then(setItems)
        .finally(() => setLoading(false));
    }
  }, []);

  // For a global menu, index every node once; otherwise just the current level.
  const flat = useMemo(() => (global && items ? flattenAll(items) : []), [global, items]);
  const resolveNodes = global ? flat.map((e) => e.node) : (items ?? []);

  // Resolve live toggle state for everything we might show.
  useEffect(() => {
    const toggles = resolveNodes.filter((n): n is Toggle => n.type === "toggle");
    if (toggles.length === 0) return;
    let cancelled = false;
    Promise.all(toggles.map(async (t) => [t.id, await t.isOn()] as const)).then((entries) => {
      if (!cancelled) setStates(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [items, tick]);

  // Resolve live trailing accessories (current selection, update badge, …).
  useEffect(() => {
    const withAcc = resolveNodes.filter((n) => typeof n.accessory === "function");
    if (withAcc.length === 0) return;
    let cancelled = false;
    Promise.all(withAcc.map(async (n) => [n.id, await n.accessory?.()] as const)).then((entries) => {
      if (!cancelled) setAccVals(Object.fromEntries(entries.map(([id, v]) => [id, v ?? null])));
    });
    return () => {
      cancelled = true;
    };
  }, [items, tick]);

  const refresh = () => setTick((t) => t + 1);

  // Empty query (or non-global) → current level. Typed query on a global menu →
  // flattened matches across the whole tree, with breadcrumb context.
  const q = query.trim();
  const displayed: Entry[] =
    global && q ? flat.filter((e) => matches(e, q)) : (items ?? []).map((node) => ({ node, trail: [] }));

  return (
    <List
      navigationTitle={navigationTitle}
      isLoading={loading}
      searchBarPlaceholder={global ? "Search maitri…" : `Search ${navigationTitle}…`}
      filtering={global ? false : undefined}
      onSearchTextChange={global ? setQuery : undefined}
    >
      {displayed.map(({ node, trail }) => (
        <Row
          key={node.id}
          node={node}
          state={states[node.id]}
          acc={accVals[node.id]}
          breadcrumb={trail.length ? trail.join(" › ") : undefined}
          refresh={refresh}
        />
      ))}
    </List>
  );
}
