import { homedir } from "node:os";
import { type Node, capture, run } from "../menu";

// Mirrors show_setup_menu and its submenus in bin/maitri-menu. Power Profile and
// the Default {browser,terminal,editor} menus load their options dynamically,
// matching the bash presence checks.

// Matches browser_desktop_exists: a .desktop file in any of the three app dirs.
async function browserDesktopExists(desktop: string): Promise<boolean> {
  const dirs = [
    `${homedir()}/.local/share/applications`,
    `${homedir()}/.nix-profile/share/applications`,
    "/usr/share/applications",
  ];
  for (const dir of dirs) {
    if ((await run(["test", "-f", `${dir}/${desktop}`])).ok) return true;
  }
  return false;
}

const defaultBrowserMenu: Node = {
  type: "group",
  id: "setup-default-browser",
  accessory: async () => { const v = await capture(["maitri-default-browser"]); return v ? v.replace(/\.desktop$/, "") : null; },
  title: "Browser",
  icon: "globe",
  children: async () => {
    const options: Array<[string, string, string, string]> = [
      ["chromium.desktop", "chromium", "Chromium", "browser"],
      ["google-chrome.desktop", "chrome", "Chrome", "google-chrome-logo"],
      ["brave-browser.desktop", "brave", "Brave", "globe-simple"],
      ["brave-origin-beta.desktop", "brave-origin", "Brave Origin", "globe-simple"],
      ["microsoft-edge.desktop", "edge", "Edge", "globe"],
      ["firefox.desktop", "firefox", "Firefox", "compass"],
      ["zen.desktop", "zen", "Zen", "globe-simple"],
    ];
    const nodes: Node[] = [];
    for (const [desktop, value, title, icon] of options) {
      if (await browserDesktopExists(desktop)) {
        nodes.push({
          type: "cmd",
          id: `setup-default-browser-${value}`,
          title,
          icon,
          exec: ["maitri-default-browser", value],
        });
      }
    }
    return nodes;
  },
};

const defaultTerminalMenu: Node = {
  type: "group",
  id: "setup-default-terminal",
  accessory: async () => (await capture(["maitri-default-terminal"])) || null,
  title: "Terminal",
  icon: "terminal-window",
  children: async () => {
    const options: Array<[string, string, string, string]> = [
      ["alacritty", "alacritty", "Alacritty", "terminal"],
      ["foot", "foot", "Foot", "terminal-window"],
      ["ghostty", "ghostty", "Ghostty", "ghost"],
      ["kitty", "kitty", "Kitty", "cat"],
    ];
    const nodes: Node[] = [];
    for (const [cmd, value, title, icon] of options) {
      if ((await run(["maitri-cmd-present", cmd])).ok) {
        nodes.push({
          type: "cmd",
          id: `setup-default-terminal-${value}`,
          title,
          icon,
          exec: ["maitri-default-terminal", value],
        });
      }
    }
    return nodes;
  },
};

const defaultEditorMenu: Node = {
  type: "group",
  id: "setup-default-editor",
  accessory: async () => (await capture(["maitri-default-editor"])) || null,
  title: "Editor",
  icon: "code",
  children: async () => {
    const options: Array<[string, string, string, string]> = [
      ["nvim", "nvim", "Neovim", "leaf"],
      ["code", "code", "VSCode", "code"],
      ["cursor", "cursor", "Cursor", "cursor"],
      ["zeditor", "zed", "Zed", "lightning"],
      ["sublime_text", "sublime_text", "Sublime Text", "pencil-simple"],
      ["helix", "helix", "Helix", "infinity"],
      ["vim", "vim", "Vim", "pencil-line"],
      ["emacs", "emacs", "Emacs", "atom"],
    ];
    const nodes: Node[] = [];
    for (const [cmd, value, title, icon] of options) {
      if ((await run(["maitri-cmd-present", cmd])).ok) {
        nodes.push({
          type: "cmd",
          id: `setup-default-editor-${value}`,
          title,
          icon,
          exec: ["maitri-default-editor", value],
        });
      }
    }
    return nodes;
  },
};

const defaultMenu: Node = {
  type: "group",
  id: "setup-default",
  title: "Defaults",
  icon: "sliders-horizontal",
  children: [defaultBrowserMenu, defaultTerminalMenu, defaultEditorMenu],
};

const powerMenu: Node = {
  type: "group",
  id: "setup-power",
  accessory: async () => (await capture(["powerprofilesctl", "get"])) || null,
  title: "Power Profile",
  icon: "lightning",
  children: async () => {
    const list = await capture(["maitri-powerprofiles-list"]);
    return list
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map(
        (profile): Node => ({
          type: "cmd",
          id: `setup-power-${profile}`,
          title: profile,
          icon: "lightning",
          exec: ["powerprofilesctl", "set", profile],
        }),
      );
  },
};

const systemMenu: Node = {
  type: "group",
  id: "setup-system",
  title: "System Sleep",
  icon: "moon",
  children: [
    { type: "cmd", id: "setup-system-suspend", title: "Toggle Suspend", icon: "bed", exec: ["maitri-toggle-suspend"] },
    {
      type: "cmd",
      id: "setup-system-hibernate-enable",
      title: "Enable Hibernate",
      icon: "snowflake",
      terminal: true,
      exec: ["maitri-hibernation-setup"],
    },
    {
      type: "cmd",
      id: "setup-system-hibernate-disable",
      title: "Disable Hibernate",
      icon: "snowflake",
      terminal: true,
      exec: ["maitri-hibernation-remove"],
    },
  ],
};

const securityMenu: Node = {
  type: "group",
  id: "setup-security",
  title: "Security",
  icon: "shield",
  children: [
    {
      type: "cmd",
      id: "setup-security-fingerprint",
      title: "Fingerprint",
      icon: "fingerprint",
      terminal: true,
      exec: ["maitri-setup-security-fingerprint"],
    },
    {
      type: "cmd",
      id: "setup-security-fido2",
      title: "Fido2",
      icon: "usb",
      terminal: true,
      exec: ["maitri-setup-security-fido2"],
    },
  ],
};

const configMenu: Node = {
  type: "group",
  id: "setup-config",
  title: "Config",
  icon: "gear",
  children: [
    { type: "launch", id: "setup-config-hyprland", title: "Hyprland", icon: "wind", editor: "~/.config/hypr/hyprland.conf" },
    { type: "launch", id: "setup-config-hypridle", title: "Hypridle", icon: "moon", editor: "~/.config/hypr/hypridle.conf" },
    { type: "launch", id: "setup-config-hyprlock", title: "Hyprlock", icon: "lock", editor: "~/.config/hypr/hyprlock.conf" },
    { type: "launch", id: "setup-config-hyprsunset", title: "Hyprsunset", icon: "sun-horizon", editor: "~/.config/hypr/hyprsunset.conf" },
    { type: "launch", id: "setup-config-swayosd", title: "Swayosd", icon: "sliders-horizontal", editor: "~/.config/swayosd/config.toml" },
    { type: "launch", id: "setup-config-vicinae", title: "Vicinae", icon: "rocket-launch", editor: "~/.config/vicinae/settings.json" },
    { type: "launch", id: "setup-config-waybar", title: "Waybar", icon: "sidebar-simple", editor: "~/.config/waybar/config.jsonc" },
    { type: "launch", id: "setup-config-xcompose", title: "XCompose", icon: "keyboard", editor: "~/.config/X11/Xcompose" },
  ],
};

export const setup: Node[] = [
  { type: "cmd", id: "setup-audio", title: "Audio", icon: "speaker-high", exec: ["maitri-launch-audio"] },
  { type: "cmd", id: "setup-wifi", title: "Wifi", icon: "wifi-high", exec: ["maitri-launch-wifi"] },
  { type: "cmd", id: "setup-bluetooth", title: "Bluetooth", icon: "bluetooth", exec: ["maitri-launch-bluetooth"] },
  powerMenu,
  systemMenu,
  { type: "launch", id: "setup-monitors", title: "Monitors", icon: "monitor", editor: "~/.config/hypr/monitors.conf" },
  { type: "launch", id: "setup-keybindings", title: "Keybindings", icon: "keyboard", editor: "~/.config/hypr/bindings.conf" },
  { type: "launch", id: "setup-input", title: "Input", icon: "cursor", editor: "~/.config/hypr/input.conf" },
  defaultMenu,
  { type: "cmd", id: "setup-dns", title: "DNS", icon: "network", terminal: true, exec: ["maitri-setup-dns"] },
  securityMenu,
  configMenu,
];
