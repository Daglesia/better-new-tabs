# AMO submission text

## Summary (max 250 chars)

Replace your new tab with a customizable grid of widgets: Gitea to-do list, service health, weather, notepad, circle of fifths and bookmarks.

## Description

BeNT (Better New Tabs) replaces the new tab page with a grid of widgets you can add, remove, drag and resize.

Widgets:
- To do list: open issues from your Gitea or Forgejo instance
- Service Health: checks whether the URLs you add are reachable
- Weather: current temperature and whether rain is expected today
- Notepad: a scratchpad that saves automatically
- Circle of Fifths: interactive, with the diatonic chords for each key
- Bookmarks: quick access to your top-level bookmark folders

Click "Edit layout" (bottom right) to rearrange widgets, then "Done editing" to save.

Privacy: no backend, no analytics. All settings stay in local browser storage.

## Category

Tabs (or Productivity)

## Privacy policy

Use the "Permissions and privacy" section of README.md.

## Notes to reviewers

Build: see README.md ("Build instructions for reviewers"). Requires Bun and
Node 20+. Run `bun install`, then `bun run build:firefox`. The private package
@daglesia/daglesias-library-of-components is bundled in the sources zip as a
tarball, so no registry access is needed.

Permissions: `storage` (layout and settings), `bookmarks` (read-only, used by
the Bookmarks widget). Optional host permissions are requested at runtime only
for the Gitea instance URL the user enters. No data is sent to the developer;
there is no backend or analytics. Network calls: the user-configured Gitea
instance, api.open-meteo.com (weather, coordinates only), and HEAD requests to
user-added URLs (service health).

Data collection: `data_collection_permissions` declares `none` as required;
`authenticationInfo` (Gitea token, sent only to the user's own instance) and
`locationInfo` (coordinates sent to Open-Meteo) are optional.

The addons-linter UNSAFE_VAR_ASSIGNMENT (innerHTML) warnings come from the
bundled React DOM library, not from the extension's own code. The extension
source contains no innerHTML or dangerouslySetInnerHTML usage.

To test the To do list widget you need a Gitea/Forgejo instance and an access
token. All other widgets work without configuration.