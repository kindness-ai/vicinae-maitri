import type { Node } from "./menu";
import { install } from "./branches/install";
import { learn } from "./branches/learn";
import { remove } from "./branches/remove";
import { setup } from "./branches/setup";
import { style } from "./branches/style";
import { system } from "./branches/system";
import { trigger } from "./branches/trigger";
import { update } from "./branches/update";

// The maitri menu root — mirrors show_main_menu in bin/maitri-menu, same order.
export const root: Node[] = [
  { type: "launch", id: "apps", title: "Apps", icon: "squares-four", subtitle: "Launch an application", deeplink: "vicinae://toggle" },
  { type: "group", id: "learn", title: "Learn", icon: "graduation-cap", subtitle: "Keybindings, docs", children: learn },
  { type: "group", id: "trigger", title: "Trigger", icon: "lightning", subtitle: "Capture, share, toggles, hardware", children: trigger },
  { type: "group", id: "style", title: "Style", icon: "palette", subtitle: "Theme, background, font, lock screen", children: style },
  { type: "group", id: "setup", title: "Setup", icon: "sliders-horizontal", subtitle: "Audio, network, defaults, security", children: setup },
  { type: "group", id: "install", title: "Install", icon: "package", subtitle: "Packages, apps, dev environments", children: install },
  { type: "group", id: "remove", title: "Remove", icon: "trash", subtitle: "Uninstall packages and apps", children: remove },
  { type: "group", id: "update", title: "Update", icon: "arrows-clockwise", subtitle: "maitri, config, firmware, time", children: update },
  { type: "cmd", id: "about", title: "About", icon: "info", subtitle: "About this machine", exec: ["maitri-launch-about"] },
  { type: "group", id: "system", title: "System", icon: "power", subtitle: "Lock, suspend, restart, shutdown", children: system },
];
