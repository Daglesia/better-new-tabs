# AMO submission text

## Summary (max 250 chars)

Replace your new tab with a customizable grid of widgets: Gitea to-do list, service health, weather, notepad, circle of fifths and bookmarks.

## Description

BeNT (Better New Tabs) replaces the new tab page with a grid of widgets you can add, remove, drag and resize.

Widgets:
- To do list: open issues from Gitea or Forgejo repos you can access
- Service Health: checks whether the URLs you add are reachable
- Weather: current temperature and whether rain is expected today
- Notepad: a scratchpad that saves automatically
- Circle of Fifths: interactive, with the diatonic chords for each key
- Bookmarks: quick access to your top-level bookmark folders

Click "Edit layout" (bottom right) to rearrange widgets, then "Done editing" to save.

Privacy: no backend, no analytics. All settings stay in local browser storage.

## Category

Tabs, Bookmarks

## Privacy policy

BeNT has no backend and collects no analytics. All settings (layout, notepad text, monitored URLs, Gitea settings) are stored locally in the browser and never sent to the developer. The extension makes these network requests: to the Gitea/Forgejo instance you configure (sending your access token, which is stored unencrypted in local extension storage); to api.open-meteo.com for weather (a default location is used unless you opt in to sending your coordinates); and HEAD requests to URLs you add to Service Health. The Bookmarks widget reads your bookmarks locally and does not transmit them.

## Notes to reviewers

Build: see README.md ("Build instructions for reviewers"). Tested on Windows 11
Pro N 24H2 with Bun 1.3.14 and Node v24.15.0. Run `bun install`, then
`bun run build:firefox`. The private package
@daglesia/daglesias-library-of-components (license: MIT) is bundled in the
sources zip as a tarball, so no registry access is needed. bun.lock is
intentionally omitted from the sources zip because it contains the private
registry URL; direct dependencies are pinned to exact versions instead.

Permissions: `storage` (layout and settings), `bookmarks` (read-only, used by
the Bookmarks widget). Optional host permissions are requested at runtime only
for the Gitea instance URL the user enters. No data is sent to the developer;
there is no backend or analytics. Network calls: the user-configured Gitea
instance, api.open-meteo.com (weather, coordinates only), and HEAD requests to
user-added URLs (service health).

Data collection: `none` is declared as required. `authenticationInfo` (the
Gitea token, sent only to the instance the user configures) and `locationInfo`
(coordinates sent to Open-Meteo) are optional. The extension requests each only
after a user action, and without them it uses the default location and doesn't
send a token anywhere.

The addons-linter UNSAFE_VAR_ASSIGNMENT (innerHTML) warnings come from the
bundled React DOM library, not from the extension's own code. The extension
source contains no innerHTML or dangerouslySetInnerHTML usage.

To test the To do list widget: open the widget, click "Connect Gitea", and enter
<DEMO URL> with token <DEMO TOKEN> (read-only, scope read:issue). All other
widgets work without configuration.