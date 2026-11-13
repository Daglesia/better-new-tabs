# Project instructions

OpenCode equivalent of `.clinerules/rules.md`, with the ignore rules from
`.clineignore` folded in.

## Scope discipline

- Only read or modify files directly relevant to the current task.
- Do not explore unrelated directories "just to understand the codebase" unless
  explicitly asked.
- Never read or list ignored paths (`node_modules`, `build/`, `dist/`, `.wxt/`,
  `.output/`, `.git/`, `.env*`, `*.min.js`, `*.map`, `bun.lock`). Trust
  `.clineignore` / `.gitignore`; they are enforced as deny rules in
  `opencode.jsonc`.
- If you're unsure which files are relevant, ask before searching broadly.

## Planning

- Before making changes, state a short plan: which files you will touch and why.
- Keep the plan to 3-6 steps. If it grows longer than that, the task is too big
  — say so and propose splitting it.
- Do not switch from Plan to Act until the plan has been confirmed.

## Execution

- Make one logical change at a time, then run the relevant check before moving
  on. Use `bun compile` (or `bunx tsc --noEmit`) for type checks, `bun build`
  for a build.
- After any failing test or build, read the actual error output and fix that
  specific error — do not rewrite unrelated code "while you're in there."
- Do not install new dependencies, change project structure, or refactor
  unrelated code without asking first.

## Communication

- If a task is ambiguous, ask one specific clarifying question rather than
  guessing and proceeding.
- If you hit the same error twice in a row, stop and explain what you've tried
  instead of retrying blindly.
- Summarize what changed at the end of a task in a few bullet points, not a full
  re-explanation of the code.

## Project

- Browser extension built with WXT + React 19 + TypeScript.
- Source lives in `entrypoints/`, `utils/`, `assets/`, `public/`; config in
  `wxt.config.ts` and `tsconfig.json`.
