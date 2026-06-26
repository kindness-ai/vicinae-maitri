import type { Node } from "../menu";

// Mirrors show_update_menu (and its submenus) in bin/maitri-menu.
export const update: Node[] = [
  { type: "cmd", id: "up-maitri", title: "maitri", icon: "download-simple", terminal: true, exec: ["maitri-update"] },
  {
    type: "group",
    id: "up-channel",
    title: "Channel",
    icon: "git-branch",
    children: [
      { type: "cmd", id: "up-channel-stable", title: "Stable", icon: "circle", terminal: true, exec: ["maitri-channel-set", "stable"] },
      { type: "cmd", id: "up-channel-rc", title: "RC", icon: "circle", terminal: true, exec: ["maitri-channel-set", "rc"] },
      { type: "cmd", id: "up-channel-edge", title: "Edge", icon: "circle", terminal: true, exec: ["maitri-channel-set", "edge"] },
      { type: "cmd", id: "up-channel-dev", title: "Dev", icon: "circle", terminal: true, exec: ["maitri-channel-set", "dev"] },
    ],
  },
  {
    type: "group",
    id: "up-config",
    title: "Config",
    icon: "sliders-horizontal",
    subtitle: "Use default config",
    children: [
      { type: "cmd", id: "up-config-hyprland", title: "Hyprland", icon: "gear", terminal: true, exec: ["maitri-refresh-hyprland"] },
      { type: "cmd", id: "up-config-hypridle", title: "Hypridle", icon: "gear", terminal: true, exec: ["maitri-refresh-hypridle"] },
      { type: "cmd", id: "up-config-hyprlock", title: "Hyprlock", icon: "gear", terminal: true, exec: ["maitri-refresh-hyprlock"] },
      { type: "cmd", id: "up-config-hyprsunset", title: "Hyprsunset", icon: "gear", terminal: true, exec: ["maitri-refresh-hyprsunset"] },
      { type: "cmd", id: "up-config-plymouth", title: "Plymouth", icon: "paint-roller", terminal: true, exec: ["maitri-refresh-plymouth"] },
      { type: "cmd", id: "up-config-swayosd", title: "Swayosd", icon: "gear", terminal: true, exec: ["maitri-refresh-swayosd"] },
      { type: "cmd", id: "up-config-tmux", title: "Tmux", icon: "terminal", terminal: true, exec: ["maitri-refresh-tmux"] },
      { type: "cmd", id: "up-config-vicinae", title: "Vicinae", icon: "rocket-launch", terminal: true, exec: ["maitri-refresh-vicinae"] },
      { type: "cmd", id: "up-config-waybar", title: "Waybar", icon: "stack", terminal: true, exec: ["maitri-refresh-waybar"] },
    ],
  },
  { type: "cmd", id: "up-extra-themes", title: "Extra Themes", icon: "swatches", terminal: true, exec: ["maitri-theme-update"] },
  {
    type: "group",
    id: "up-process",
    title: "Process",
    icon: "arrows-clockwise",
    subtitle: "Restart",
    children: [
      { type: "cmd", id: "up-process-hypridle", title: "Hypridle", icon: "gear", exec: ["maitri-restart-hypridle"] },
      { type: "cmd", id: "up-process-hyprsunset", title: "Hyprsunset", icon: "sun", exec: ["maitri-restart-hyprsunset"] },
      { type: "cmd", id: "up-process-mako", title: "Mako", icon: "bell-ringing", exec: ["maitri-restart-mako"] },
      { type: "cmd", id: "up-process-swayosd", title: "Swayosd", icon: "gear", exec: ["maitri-restart-swayosd"] },
      { type: "cmd", id: "up-process-vicinae", title: "Vicinae", icon: "rocket-launch", exec: ["maitri-restart-vicinae"] },
      { type: "cmd", id: "up-process-waybar", title: "Waybar", icon: "stack", exec: ["maitri-restart-waybar"] },
    ],
  },
  {
    type: "group",
    id: "up-hardware",
    title: "Hardware",
    icon: "cpu",
    subtitle: "Restart",
    children: [
      { type: "cmd", id: "up-hardware-audio", title: "Audio", icon: "speaker-high", terminal: true, exec: ["maitri-restart-pipewire"] },
      { type: "cmd", id: "up-hardware-wifi", title: "Wi-Fi", icon: "wifi-high", terminal: true, exec: ["maitri-restart-wifi"] },
      { type: "cmd", id: "up-hardware-bluetooth", title: "Bluetooth", icon: "bluetooth", terminal: true, exec: ["maitri-restart-bluetooth"] },
      { type: "cmd", id: "up-hardware-trackpad", title: "Trackpad", icon: "mouse", terminal: true, exec: ["maitri-restart-trackpad"] },
    ],
  },
  { type: "cmd", id: "up-firmware", title: "Firmware", icon: "cpu", terminal: true, exec: ["maitri-update-firmware"] },
  {
    type: "group",
    id: "up-password",
    title: "Password",
    icon: "key",
    subtitle: "Update Password",
    children: [
      { type: "cmd", id: "up-password-drive", title: "Drive Encryption", icon: "hard-drive", terminal: true, exec: ["maitri-drive-password"] },
      { type: "cmd", id: "up-password-user", title: "User", icon: "user", terminal: true, exec: ["passwd"] },
    ],
  },
  { type: "cmd", id: "up-timezone", title: "Timezone", icon: "globe", terminal: true, exec: ["maitri-tz-select"] },
  { type: "cmd", id: "up-time", title: "Time", icon: "clock", terminal: true, exec: ["maitri-update-time"] },
];
