import type { ReactElement } from "react";
import BackgroundPicker from "../background-picker";
import ThemePicker from "../theme-picker";
import UnlockPicker from "../unlock-picker";

// In-extension views pushed from the menu (and openable directly via the menu's
// fallbackText router) so the pickers aren't separate root-search commands.
export const VIEWS: Record<string, () => ReactElement> = {
  theme: ThemePicker,
  background: BackgroundPicker,
  unlock: UnlockPicker,
};
