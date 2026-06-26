import { MenuList } from "./lib/MenuList";
import { root } from "./lib/tree";

export default function MaitriMenu() {
  return <MenuList navigationTitle="maitri" nodes={root} />;
}
