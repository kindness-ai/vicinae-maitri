import type { LaunchProps } from "@vicinae/api";
import { MenuList } from "./lib/MenuList";
import { VIEWS } from "./lib/views";
import { root } from "./lib/tree";

// Normal launch shows the menu; a deeplink with ?fallbackText=theme|background|unlock
// opens that picker view directly (used by the dedicated keybinds).
export default function MaitriMenu(props: LaunchProps) {
  const view = props.fallbackText?.trim();
  if (view && VIEWS[view]) {
    const Comp = VIEWS[view];
    return <Comp />;
  }
  return <MenuList navigationTitle="maitri" nodes={root} global />;
}
