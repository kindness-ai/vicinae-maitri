import type { Node } from "../menu";

// Mirrors show_learn_menu: keybindings opens the maitri cheatsheet, the rest
// open reference docs in the browser (maitri-launch-webapp in bash).
export const learn: Node[] = [
  { type: "launch", id: "keybindings", title: "Keybindings", icon: "keyboard", deeplink: "vicinae://launch/@kindness-ai/maitri/keybindings" },
  { type: "launch", id: "maitri", title: "maitri", icon: "book-bookmark", url: "https://github.com/kindness-ai/maitri" },
  { type: "launch", id: "hyprland", title: "Hyprland", icon: "app-window", url: "https://wiki.hypr.land/" },
  { type: "launch", id: "arch", title: "Arch", icon: "linux-logo", url: "https://wiki.archlinux.org/title/Main_page" },
  { type: "launch", id: "neovim", title: "Neovim", icon: "cube", url: "https://www.lazyvim.org/keymaps" },
  { type: "launch", id: "bash", title: "Bash", icon: "terminal", url: "https://devhints.io/bash" },
];
