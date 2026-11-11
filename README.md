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

- **OS:** Ubuntu 24.04 / macOS / Windows 11 (any works) <!-- TODO: state the OS you built on -->
- **Bun:** 1.x <!-- TODO: pin the exact version, e.g. 1.2.x -->
- **Node.js:** 20 or newer (needed by some WXT tooling) <!-- TODO: confirm -->

### Steps

```bash
# 1. Install dependencies from the committed bun.lock
bun install --frozen-lockfile

# 2. Build the Firefox extension
bun run build:firefox
```

The built extension is written to `.output/firefox-mv*/` (the folder name depends on the manifest version WXT selects). To produce the upload zip and the sources zip:

```bash
bun run zip:firefox
```

The output in `.output/` contains `*-firefox.zip` (the extension) and `*-sources.zip` (the source code package).

### Private dependency

One dependency, `@daglesia/daglesias-library-of-components`, is published to a private-scope registry configured in `.npmrc`:

```
@daglesia:registry=https://git.daglesia.com/api/packages/magdalena/npm/
```

<!-- TODO: pick ONE and delete the other before submitting:
  (a) Public registry: "The package is public and installs without authentication."
  (b) Bundled: "The sources zip includes the package tarball under vendor/; see package.json." -->

The package provides only the SCSS stylesheet used by the To do list widget (`@daglesia/daglesias-library-of-components/scss`).

### Environment variables

None are required for the build.

## Project structure

```
entrypoints/
  newtab/          New tab page (React): App, widgets, modals, styles
utils/             Fetching, formatting, music theory and storage helpers
public/            Static assets and icons
wxt.config.ts      Manifest and WXT configuration
```

## License

<!-- TODO: add a LICENSE file and name it here, e.g. MIT -->