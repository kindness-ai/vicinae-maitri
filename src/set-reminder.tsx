import {
  Action,
  ActionPanel,
  Form,
  Toast,
  showToast,
  showHUD,
  closeMainWindow,
} from "@vicinae/api";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { join } from "node:path";

const exec = promisify(execFile);
const MAITRI = process.env.MAITRI_PATH || join(homedir(), ".local/share/maitri");

type Values = { minutes: string; message: string };

export default function SetReminder() {
  async function submit(values: Values) {
    const minutes = (values.minutes || "").trim();
    if (!/^[0-9]+$/.test(minutes) || Number(minutes) <= 0) {
      await showToast({ style: Toast.Style.Failure, title: "Enter a positive number of minutes" });
      return;
    }
    const args = [minutes];
    const message = (values.message || "").trim();
    if (message) args.push(message);
    try {
      await closeMainWindow();
      // maitri-reminder <minutes> [message] — user-level systemd timer, no sudo.
      await exec(join(MAITRI, "bin", "maitri-reminder"), args);
      await showHUD(`Reminder set for ${minutes} min`);
    } catch (e) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to set reminder",
        message: String(e),
      });
    }
  }

  return (
    <Form
      navigationTitle="Set maitri Reminder"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Set Reminder" onSubmit={submit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="minutes" title="Minutes" placeholder="e.g. 15" />
      <Form.TextField id="message" title="Message" placeholder="Optional reminder text" />
    </Form>
  );
}
