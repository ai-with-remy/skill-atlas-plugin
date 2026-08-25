# Standard local skill paths

Check only paths that exist. Expand the home directory using the host environment; never assume a username. A candidate is a directory containing a regular file named `SKILL.md`.

## Scan order

1. Every folder attached to this conversation (for example Local or OS). Walk those trees for `SKILL.md`.
2. Standard skill roots below that exist on this host.

## macOS / Linux

- `~/.claude/skills/`
- `~/.cursor/skills/`
- `~/.codex/skills/`
- `~/.agents/skills/`
- `.claude/skills/`, `.cursor/skills/`, and `.agents/skills/` from the current directory up to the repo root

## Windows (same layout under `%USERPROFILE%\`)

- `%USERPROFILE%\.claude\skills\`
- `%USERPROFILE%\.cursor\skills\`
- `%USERPROFILE%\.codex\skills\`
- `%USERPROFILE%\.agents\skills\`

## Do not scan

Plugin caches, `~/.cursor/skills-cursor/`, `~/.claude/atlas/`, `.git`, `node_modules`, and Remy-machine-specific trees such as `~/Desktop/OS/` unless the user attached that folder to this conversation or explicitly named it.

Plugin-installed skills are distributable packages rather than ordinary authored local skills. Scan a plugin source checkout only when the user supplies or approves its path.

Ask before scanning any other path. Do not probe arbitrary system directories.

## Candidate rules

- A candidate is a directory with a regular `SKILL.md` file.
- A candidate may contain `references/`, `assets/`, `scripts/`, `agents/`, and other support files.
- Do not treat loose Markdown files as complete skills.
- Deduplicate by resolved real path. One folder found via two harnesses is one row; record every discovery location on that row.
- Show symlinks, resolve them without executing anything, and do not follow a target outside an approved root.
