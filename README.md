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

On a `v*` tag (or a published GitHub release), CI builds a prebuilt bundle and
attaches it to the release so end users don't need a Node toolchain. The asset is
**`maitri-vicinae-extension.tar.gz`** (with a `maitri-vicinae-extension.tar.gz.sha256`
checksum alongside it). Its contents sit at the archive root, so maitri unpacks it
directly into `~/.local/share/vicinae/extensions/maitri/`:

```bash
tar -xzf maitri-vicinae-extension.tar.gz -C ~/.local/share/vicinae/extensions/maitri
```

See [RELEASING.md](RELEASING.md) for how releases are cut.
