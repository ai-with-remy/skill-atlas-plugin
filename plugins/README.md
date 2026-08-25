# Skills Atlas marketplace plugins

Each subdirectory is a separate plugin listed in the marketplace catalogs:

- `.claude-plugin/marketplace.json`
- `.cursor-plugin/marketplace.json`
- `.agents/plugins/marketplace.json`

## Listed now

- `extract-skills` — discover local `SKILL.md` folders, classify into Atlas departments, approve per skill, import through Skills Atlas MCP.

## Adding a later plugin

Examples: `install-plugins`, usage tracking.

1. Create `plugins/<name>/` with `.claude-plugin/plugin.json` plus that plugin’s skills and MCP files.
2. Append an entry to each marketplace catalog. Keep marketplace `name` as `skills-atlas`.
3. Users who already added this marketplace refresh it, then install the new plugin (`<name>@skills-atlas`).
