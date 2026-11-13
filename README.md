# BeNT (Better New Tabs)

A customizable new tab page for Firefox and Chromium browsers. Replace the default new tab with a grid of widgets that you can add, remove, drag and resize.

## Features

| Widget | What it does |
| --- | --- |
| **To do list** | Shows your open issues from a Gitea or Forgejo instance. |
| **Service Health** | Checks whether the URLs you add are reachable. |
| **Weather** | Shows the current temperature and whether rain is expected today. |
| **Notepad** | A scratchpad that saves automatically. |
| **Circle of Fifths** | Interactive circle of fifths with the diatonic chords for each key. |
| **Bookmarks** | Quick access to your top-level bookmark folders. |

Click **Edit layout** (bottom right) to add, remove, move and resize widgets. Click **Done editing** to save the layout.

## Permissions and privacy

BeNT has no backend and no analytics. All settings are stored locally in the browser (`storage.local`).

| Permission | Why |
| --- | --- |
| `storage` | Saves your layout, notepad text, monitored URLs and Gitea settings. |
| `bookmarks` | Reads your bookmark folders for the Bookmarks widget (read only). |
| Optional host access (`http://*/*`, `https://*/*`) | Requested at runtime, only for the specific origin you enter (your Gitea instance), so the extension can call its API. |

Network requests the extension makes:

- **Gitea / Forgejo:** requests to the instance URL you configure, sending your access token in the `Authorization` header. The token is stored unencrypted in local extension storage, so use a token with read-only access to issues.
- **Open-Meteo (`api.open-meteo.com`):** the Weather widget sends your coordinates to get a forecast. It asks the browser for your location and falls back to a default location (Poznań, Poland) if you deny or the lookup fails.
- **Health check:** sends `HEAD` requests to the URLs you add. These use `no-cors`, so "up" means the server answered, not that it returned a healthy status.

## Development

Requirements:

- [Bun](https://bun.sh) (see [Build environment](#build-environment) for the version used for release builds)
- Access to the `@daglesia` npm registry (see [Private dependency](#private-dependency))

```bash
bun install
bun run dev            # Chromium, with hot reload
bun run dev:firefox    # Firefox, with hot reload
bun run compile        # type check
```

## Build instructions for reviewers

These steps produce the exact extension package submitted to addons.mozilla.org.

### Build environment

- **OS:** <OS and version, e.g. Ubuntu 24.04>
- **Bun:** 1.3.14
- **Node.js:** v24.15.0

### Steps

```bash
# 1. Install dependencies
bun install

# 2. Build the Firefox extension (Manifest V2)
bun run build:firefox
```

The built extension is written to `.output/firefox-mv2/`. To produce the upload zip and the sources zip:

```bash
bun run zip:firefox
```

The output in `.output/` contains `*-firefox.zip` (the extension) and `*-sources.zip` (the source code package).

### Private dependency

`@daglesia/daglesias-library-of-components` is hosted on a private registry (see `.npmrc` in the repository). The sources zip bundles the package tarball, and its `package.json` points to the local copy, so no registry access or authentication is needed to build from the sources zip.

The package provides only the SCSS stylesheet used by the To do list widget (`@daglesia/daglesias-library-of-components/scss`).

### Environment variables

None are required for the build.

### Linter notes

`addons-linter` reports `UNSAFE_VAR_ASSIGNMENT` (`innerHTML`) warnings in the bundled chunk. They come from the bundled React DOM library. The extension's own source contains no `innerHTML` or `dangerouslySetInnerHTML` usage.

## Project structure

```
entrypoints/
  newtab/          New tab page (React): App, widgets, modals, styles
utils/             Fetching, formatting, music theory and storage helpers
public/            Static assets and icons
wxt.config.ts      Manifest and WXT configuration
```

## License

MIT. See [LICENSE](LICENSE).