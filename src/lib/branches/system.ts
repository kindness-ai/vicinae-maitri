import type { Node } from "../menu";

// Mirrors show_system_menu in bin/maitri-menu. Power-state actions confirm first.
export const system: Node[] = [
  { type: "cmd", id: "screensaver", title: "Screensaver", icon: "monitor-play", exec: ["maitri-launch-screensaver", "force"] },
  { type: "cmd", id: "lock", title: "Lock", icon: "lock", exec: ["maitri-system-lock"] },
  { type: "cmd", id: "suspend", title: "Suspend", icon: "moon", exec: ["systemctl", "suspend"] },
  { type: "cmd", id: "hibernate", title: "Hibernate", icon: "snowflake", exec: ["systemctl", "hibernate"] },
  {
    type: "cmd",
    id: "logout",
    title: "Logout",
    icon: "sign-out",
    destructive: true,
    confirm: { title: "Log out?", message: "All apps will be closed." },
    exec: ["maitri-system-logout"],
  },
  {
    type: "cmd",
    id: "restart",
    title: "Restart",
    icon: "arrow-clockwise",
    destructive: true,
    confirm: { title: "Restart now?" },
    exec: ["maitri-system-reboot"],
  },
  {
    type: "cmd",
    id: "shutdown",
    title: "Shutdown",
    icon: "power",
    destructive: true,
    confirm: { title: "Shut down now?" },
    exec: ["maitri-system-shutdown"],
  },
];
