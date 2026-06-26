import { type Node, flagSet, processRunning } from "../menu";

// Mirrors show_toggle_menu in bin/maitri-menu. Toggles with a reliable boolean
// state show a live On/Off badge; cycles / setup actions are plain commands.
export const toggles: Node[] = [
  {
    type: "toggle",
    id: "nightlight",
    title: "Nightlight",
    icon: "moon",
    isOn: () => processRunning("hyprsunset"),
    exec: ["maitri-toggle-nightlight"],
  },
  {
    type: "toggle",
    id: "idle-lock",
    title: "Idle Lock",
    icon: "lock-key",
    isOn: () => processRunning("hypridle"),
    exec: ["maitri-toggle-idle"],
  },
  {
    type: "toggle",
    id: "top-bar",
    title: "Top Bar",
    icon: "sidebar-simple",
    isOn: () => processRunning("waybar"),
    exec: ["maitri-toggle-waybar"],
  },
  {
    type: "toggle",
    id: "screensaver",
    title: "Screensaver",
    icon: "monitor-play",
    isOn: async () => !(await flagSet("screensaver-off")),
    exec: ["maitri-toggle-screensaver"],
  },
  {
    type: "cmd",
    id: "notifications",
    title: "Notification Silencing",
    icon: "bell-slash",
    exec: ["maitri-toggle-notification-silencing"],
  },
  {
    type: "cmd",
    id: "workspace-layout",
    title: "Workspace Layout",
    icon: "squares-four",
    exec: ["maitri-hyprland-workspace-layout-toggle"],
  },
  {
    type: "cmd",
    id: "window-gaps",
    title: "Window Gaps",
    icon: "arrows-out",
    exec: ["maitri-hyprland-window-gaps-toggle"],
  },
  {
    type: "cmd",
    id: "window-ratio",
    title: "1-Window Ratio",
    icon: "square",
    exec: ["maitri-hyprland-window-single-square-aspect-toggle"],
  },
  {
    type: "cmd",
    id: "monitor-scaling",
    title: "Monitor Scaling",
    icon: "monitor",
    exec: ["maitri-hyprland-monitor-scaling-cycle"],
  },
  {
    type: "cmd",
    id: "direct-boot",
    title: "Direct Boot",
    icon: "rocket-launch",
    terminal: true,
    exec: ["maitri-config-direct-boot"],
  },
  {
    type: "cmd",
    id: "passwordless-sudo",
    title: "Passwordless Sudo",
    icon: "key",
    terminal: true,
    exec: ["maitri-sudo-passwordless"],
  },
];
