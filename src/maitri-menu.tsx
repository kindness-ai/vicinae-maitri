import type { LaunchProps } from "@vicinae/api";
import { MenuList } from "./lib/MenuList";
import { VIEWS } from "./lib/views";
import { findNode } from "./lib/menu";
import { root } from "./lib/tree";

// Normal launch shows the menu. A deeplink with ?fallbackText=<route> jumps
// straight to a destination (used by the dedicated keybinds):
//   - theme|background|unlock → that picker view
//   - any group id (capture, toggle, hardware, share, screenrecord, system, …)
//     → that submenu, matching the old `maitri-menu <submenu>` keybinds.
export default function MaitriMenu(props: LaunchProps) {
  const route = props.fallbackText?.trim();
  if (route) {
    if (VIEWS[route]) {
      const Comp = VIEWS[route];
      return <Comp />;
    }
    const node = findNode(root, route);
    if (node?.type === "group") {
      return <MenuList navigationTitle={node.title} nodes={node.children} />;
    }
  }
  return <MenuList navigationTitle="maitri" nodes={root} global />;
}
