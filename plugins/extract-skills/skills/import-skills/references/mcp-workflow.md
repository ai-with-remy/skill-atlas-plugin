# Skills Atlas MCP workflow contract

Use only these advertised Skills Atlas tools. If one is absent, stop rather
than improvising with storage, database, or Git tools.

If the user pasted a Skills Atlas sync prompt from `/{org}/sync`, that prompt
wins. This contract matches it.

## Connect

The plugin ships the MCP server key `skills-atlas` (shown as **Skills Atlas**).
That is the OAuth connector to use.

- Call `list_import_destinations` in this conversation. Do not spawn a
  subagent, Task, or background run.
- Do not add a custom MCP server URL. Do not ask the user to paste a token.
- Ignore leftover custom connectors, including **Skills Atlas Test 1**. They
  are not this plugin.
- If login cannot open, tell the user: Settings → Plugins → Extract Skills →
  Connectors, click Connect on **Skills Atlas**. Or type `/mcp` and authorize
  `skills-atlas`.

## `list_import_destinations`

Read-only. Returns editable organizations, connected repositories, writable
bundles, and limits. Never invent a destination ID. Call this first.

## `create_bundle`

Writes a new department after an explicit yes. Input `orgSlug`, `name`,
optional `description`. Use the returned `bundle.id` as `bundleId` for later
`plan_skill_import`. Never create a department the user did not approve.

## `plan_skill_import`

Read-only with respect to the destination Git repository. Creates a short-lived server plan from an
`orgSlug`, `bundleId`, and up to the advertised number of skill descriptors.
Each descriptor contains:

- `name` and `description`;
- all normalized relative file paths;
- exact raw byte sizes;
- lowercase SHA-256 digests.

The result labels each skill `create` or `conflict`, returns allowed actions,
and includes `planId` plus expiry. Preview all selected batches and show every
conflict before requesting write approval. One `bundleId` per call.

## `import_skills`

Writes one bounded, atomic Git commit from a valid `planId`. Every decision
must identify the previewed source `name`, use an advertised action, and include
the complete folder unless skipped:

```json
{
  "name": "local-skill",
  "action": "create | overwrite | rename | skip",
  "renameTo": "required only for rename",
  "files": [
    {
      "path": "SKILL.md",
      "encoding": "base64",
      "content": "base64 of the exact previewed raw bytes"
    }
  ]
}
```

The server aligns frontmatter names for renames, verifies every digest, scans
text for credentials, and rejects stale destination state. Omit `files` only
for `skip`.

## Approval binding

The `planId` binds approval to destination and Git blob state for 15 minutes.
If the server reports expiry or stale state, discard prior approval, re-preview,
show the differences, and ask again. Do not translate missing decisions to a
default. Do not send skipped folder bytes.

## Upload semantics

- Preserve relative paths using `/` separators.
- Reject empty, absolute, drive-prefixed, `.`/`..`, NUL-containing, or escaping paths.
- Base64-encode every file directly from raw bytes, including UTF-8 text. Do
  not round-trip text through a string, normalize line endings, or rewrite
  frontmatter between preview and import.
- Re-read raw bytes immediately before encoding. If their size or SHA-256 no
  longer matches the preview descriptor, create a new preview.
- Never log payload bytes, auth headers, OAuth tokens, or signed URLs.
- Only a result containing a Git commit SHA and imported paths establishes
  success for that batch.
- Never git-push the team repository.

## Team plugin install

`list_installable_plugins` and `install_plugins` install Atlas **team** plugins
onto the local machine. They are documented in
`skills/install-plugins/references/mcp-workflow.md`. Do not use them during an
import. Do not treat this import skill as the team-plugin installer.

## Authentication

Use the MCP client's OAuth flow on the plugin connector `skills-atlas`. Never
ask the user to paste a token into chat. Never place credentials in plugin
files, candidate folders, manifests, previews, or logs. Never add a custom MCP
URL to work around a missing Connect button.
