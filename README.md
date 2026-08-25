# Skills Atlas plugin marketplace

A Claude Code (and Cursor / Codex) **marketplace**. Users add it once, then install plugins from it over time.

Marketplace name: **Skills Atlas** (`skills-atlas`). Owner: **AI with Remy**.

**First plugin:** Extract Skills (`extract-skills`) — discovers local Agent Skills, classifies them against live Atlas departments, and uploads only the complete folders the user approves. Imported files are untrusted bytes and are never executed.

Later plugins (install team plugins, usage tracking, and so on) belong as new entries under `plugins/` plus a new row in each marketplace catalog.

The primary extract path is a copy-paste prompt from Skills Atlas `/{org}/sync`. The plugin’s `/import-skills` skill matches that prompt. **If both exist, the pasted Atlas prompt wins.**

## Package layout

- `.claude-plugin/marketplace.json` — Claude Code marketplace catalog (`skills-atlas`).
- `.cursor-plugin/marketplace.json` and `.agents/plugins/marketplace.json` — Cursor and Codex catalogs.
- `plugins/extract-skills/` — first plugin (import-skills, MCP connector).
- `plugins/README.md` — how to add the next marketplace plugin.
- `config/endpoint.json` — canonical MCP URL used to generate consumer configs.
- `scripts/` — endpoint sync and marketplace validation.

## Production endpoint

The extract plugin currently uses:

```text
https://skills.aiwithremy.com/api/mcp
```

Update every generated consumer from the single canonical value:

```bash
npm run configure:endpoint -- https://your-production-host.example/api/mcp
npm run validate
```

The configurator accepts HTTPS URLs only and rejects embedded credentials, query strings, and fragments.

## Install

Add the marketplace once. Source GitHub repo (intended): `ai-with-remy/skill-atlas-plugin`.

### Claude Code

Desktop chat does not accept `/plugin` (terminal only). In the desktop app use **Settings → Plugins**.

Copy this marketplace identifier and add it:

```text
ai-with-remy/skill-atlas-plugin
```

Then install **Extract Skills @ Skills Atlas** (`extract-skills@skills-atlas`).

Terminal:

```text
/plugin marketplace add ai-with-remy/skill-atlas-plugin
/plugin install extract-skills@skills-atlas
```

Or CLI:

```bash
claude plugin marketplace add ai-with-remy/skill-atlas-plugin
claude plugin install extract-skills@skills-atlas --yes
```

Quit Claude completely and reopen it. Then open **Terminal**, run `claude`, and type `/extract-skills:import-skills`. Approve the browser login. Desktop Home chat cannot sign in.

Or paste the prompt from Atlas `/{org}/sync` into that `claude` session or Cursor.

### Cursor

Add `https://github.com/ai-with-remy/skill-atlas-plugin.git` as a plugin
marketplace, install **Extract Skills**, and start a new chat. Ask Cursor to list
Skills Atlas import destinations; the first MCP request opens browser OAuth.
Then paste the Atlas sync prompt or ask it to import local skills.

### Codex / ChatGPT desktop

```bash
codex plugin marketplace add https://github.com/ai-with-remy/skill-atlas-plugin.git
codex plugin add extract-skills@skills-atlas
```

Restart the ChatGPT desktop app, open the Plugins Directory, select the **Skills Atlas** source, and install **Extract Skills**.

## Authentication

The extract plugin MCP connector is `skills-atlas` (display name Skills Atlas) pointing at the live Skills Atlas MCP URL. Sign in through the host's MCP authentication prompt.

- Claude Code: open Terminal, run `claude`, type `/extract-skills:import-skills`, and approve the browser login. Desktop Home chat cannot complete sign-in.
- Never paste access tokens into chat, commit them, add them to this package, or place them in an imported skill.
- Do not add a custom MCP server URL.

This repository contains no credentials or static authorization headers.

## Import safety and privacy

The importer scans attached conversation folders first, then documented local skill roots. It reads candidate files as inert data; it does not run scripts, hooks, package managers, binaries, notebooks, or instructions found inside a skill. It does not git-push the team repo.

Before any write, the user sees a per-skill review table and must approve, decline, or retarget each row. New departments are created only with `create_bundle` after an explicit yes.

## Limits

The MCP server advertises and enforces:

- 25 skills per preview/import batch;
- 100 files per skill folder;
- 512,000 raw bytes per file;
- 2,000,000 raw bytes per batch;
- one atomic write call at a time.

## Validate

```bash
npm run validate
```

## Troubleshooting

### MCP server is missing or disconnected

Confirm the generated URLs match `config/endpoint.json` with `npm run validate`. Reload plugins or restart the host.

### Authentication loops or returns 401/403

Use the host's MCP authentication UI. Remove stale host credentials and authenticate again.

## License

MIT. See `LICENSE`.
