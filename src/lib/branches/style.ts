import type { Node } from "../menu";
import { capture } from "../menu";

const DL = "vicinae://launch/@kindness-ai/maitri";

// Mirrors show_style_menu and its submenus (show_font_menu, show_screensaver_menu,
// show_about_menu). The visual pickers are native extension commands; Hyprland
// look & feel opens the config file in the user's editor; fonts are listed live.
export const style: Node[] = [
  { type: "launch", id: "theme", title: "Theme", icon: "palette", deeplink: `${DL}/theme-picker` },
  { type: "launch", id: "unlock", title: "Unlock", icon: "lock-key", deeplink: `${DL}/unlock-picker` },
  {
    type: "group",
    id: "font",
    title: "Font",
    icon: "text-aa",
    children: async () => {
      const out = await capture(["maitri-font-list"]);
      return out
        .split("\n")
        .filter(Boolean)
        .map((f, i) => ({
          type: "cmd" as const,
          id: `font-${i}`,
          title: f,
          icon: "text-aa",
          exec: ["maitri-font-set", f],
        }));
    },
  },
  { type: "launch", id: "background", title: "Background", icon: "image", deeplink: `${DL}/background-picker` },
  { type: "launch", id: "hyprland", title: "Hyprland", icon: "wrench", editor: "~/.config/hypr/looknfeel.conf" },
  {
    type: "group",
    id: "screensaver",
    title: "Screensaver",
    icon: "monitor",
    children: [
      { type: "cmd", id: "screensaver-text", title: "Edit Text", icon: "file-text", exec: ["maitri-branding-screensaver", "text"] },
      { type: "cmd", id: "screensaver-image", title: "Set From Image", icon: "file-image", exec: ["maitri-branding-screensaver", "image"] },
      { type: "cmd", id: "screensaver-reset", title: "Restore Default", icon: "arrow-counter-clockwise", exec: ["maitri-branding-screensaver", "reset"] },
    ],
  },
  {
    type: "group",
    id: "about",
    title: "About",
    icon: "info",
    children: [
      { type: "cmd", id: "about-text", title: "Edit Text", icon: "file-text", exec: ["maitri-branding-about", "text"] },
      { type: "cmd", id: "about-image", title: "Set From Image", icon: "file-image", exec: ["maitri-branding-about", "image"] },
      { type: "cmd", id: "about-reset", title: "Restore Default", icon: "arrow-counter-clockwise", exec: ["maitri-branding-about", "reset"] },
    ],
  },
];
