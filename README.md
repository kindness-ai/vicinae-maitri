# vicinae-maitri

[Vicinae](https://vicinae.com) extension providing maitri desktop commands as native
launcher UI. Part of the maitri launcher migration from Walker/Elephant to Vicinae.

## Commands

- **Set maitri Theme** — visual grid of maitri themes (with background previews); selecting
  one runs `maitri-theme-set <name>`.

## Develop

Requires Node 20+ and a running Vicinae server.

```bash
npm install
npm run dev      # vici develop — hot reloads into the running Vicinae
```

The command appears in Vicinae root search with a `(Dev)` suffix while `dev` is running.

## Build / install locally

```bash
npm install
npm run build    # vici build — installs into ~/.local/share/vicinae/extensions/
```

No server restart is needed; the command becomes searchable immediately.

## Distribution

CI builds a prebuilt bundle that maitri drops into `~/.local/share/vicinae/extensions/`
so end users don't need a Node toolchain. See the maitri repo's install pipeline.
