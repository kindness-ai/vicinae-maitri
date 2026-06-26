import type { Node } from "../menu";
import { run } from "../menu";
import { toggles } from "./toggles";

// Mirrors show_trigger_menu (and its submenus) in bin/maitri-menu.
export const trigger: Node[] = [
  {
    type: "group",
    id: "capture",
    title: "Capture",
    icon: "camera",
    children: [
      {
        type: "cmd",
        id: "capture-screenshot",
        title: "Screenshot",
        icon: "image-square",
        exec: ["maitri-capture-screenshot"],
      },
      {
        type: "group",
        id: "screenrecord",
        title: "Screenrecord",
        icon: "monitor-play",
        children: [
          {
            type: "cmd",
            id: "screenrecord-no-audio",
            title: "With no audio",
            icon: "video-camera",
            exec: ["maitri-capture-screenrecording"],
          },
          {
            type: "cmd",
            id: "screenrecord-desktop-audio",
            title: "With desktop audio",
            icon: "speaker-high",
            exec: ["maitri-capture-screenrecording", "--with-desktop-audio"],
          },
          {
            type: "cmd",
            id: "screenrecord-desktop-mic-audio",
            title: "With desktop + microphone audio",
            icon: "microphone",
            exec: ["maitri-capture-screenrecording", "--with-desktop-audio", "--with-microphone-audio"],
          },
          {
            type: "cmd",
            id: "screenrecord-desktop-mic-webcam",
            title: "With desktop + microphone audio + webcam",
            icon: "webcam",
            exec: [
              "maitri-capture-screenrecording",
              "--with-desktop-audio",
              "--with-microphone-audio",
              "--with-webcam",
            ],
          },
        ],
      },
      {
        type: "cmd",
        id: "capture-text-extraction",
        title: "Text Extraction",
        icon: "text-aa",
        exec: ["maitri-capture-text-extraction"],
      },
      {
        type: "cmd",
        id: "capture-color",
        title: "Color",
        icon: "eyedropper",
        exec: ["bash", "-c", "pkill hyprpicker || hyprpicker -a"],
      },
    ],
  },
  {
    type: "cmd",
    id: "transcode",
    title: "Transcode",
    icon: "swap",
    exec: ["maitri-transcode"],
  },
  {
    type: "group",
    id: "share",
    title: "Share",
    icon: "share-network",
    children: [
      {
        type: "cmd",
        id: "share-clipboard",
        title: "Clipboard",
        icon: "copy",
        exec: ["maitri-menu-share", "clipboard"],
      },
      {
        type: "cmd",
        id: "share-file",
        title: "File",
        icon: "file",
        terminal: true,
        exec: ["maitri-menu-share", "file"],
      },
      {
        type: "cmd",
        id: "share-folder",
        title: "Folder",
        icon: "folder",
        terminal: true,
        exec: ["maitri-menu-share", "folder"],
      },
    ],
  },
  {
    type: "group",
    id: "toggle",
    title: "Toggle",
    icon: "seal-check",
    children: toggles,
  },
  {
    type: "group",
    id: "hardware",
    title: "Hardware",
    icon: "cpu",
    children: async () => {
      const items: Node[] = [
        {
          type: "cmd",
          id: "hardware-laptop-display",
          title: "Laptop Display",
          icon: "laptop",
          exec: ["maitri-hyprland-monitor-internal", "toggle"],
        },
        {
          type: "cmd",
          id: "hardware-mirror-display",
          title: "Mirror Display",
          icon: "monitor",
          exec: ["maitri-hyprland-monitor-internal-mirror", "toggle"],
        },
      ];

      if ((await run(["maitri-hw-hybrid-gpu"])).ok) {
        items.push({
          type: "cmd",
          id: "hardware-hybrid-gpu",
          title: "Hybrid GPU",
          icon: "graphics-card",
          terminal: true,
          exec: ["maitri-toggle-hybrid-gpu"],
        });
      }

      if ((await run(["maitri-hw-touchpad"])).ok) {
        items.push({
          type: "cmd",
          id: "hardware-touchpad",
          title: "Touchpad",
          icon: "cursor",
          exec: ["maitri-toggle-touchpad"],
        });
      }

      if (
        (await run(["maitri-hw-dell-xps-haptic-touchpad"])).ok &&
        (await run(["maitri-cmd-present", "dell-xps-touchpad-haptics"])).ok
      ) {
        items.push({
          type: "group",
          id: "hardware-touchpad-haptics",
          title: "Touchpad Haptics",
          icon: "vibrate",
          children: [
            {
              type: "cmd",
              id: "hardware-touchpad-haptics-low",
              title: "low",
              icon: "cell-signal-low",
              exec: ["dell-xps-touchpad-haptics", "set", "low"],
            },
            {
              type: "cmd",
              id: "hardware-touchpad-haptics-mid",
              title: "mid",
              icon: "cell-signal-medium",
              exec: ["dell-xps-touchpad-haptics", "set", "mid"],
            },
            {
              type: "cmd",
              id: "hardware-touchpad-haptics-high",
              title: "high",
              icon: "cell-signal-full",
              exec: ["dell-xps-touchpad-haptics", "set", "high"],
            },
          ],
        });
      }

      if ((await run(["maitri-hw-touchscreen"])).ok) {
        items.push({
          type: "cmd",
          id: "hardware-touchscreen",
          title: "Touchscreen",
          icon: "hand-tap",
          exec: ["maitri-toggle-touchscreen"],
        });
      }

      return items;
    },
  },
];
