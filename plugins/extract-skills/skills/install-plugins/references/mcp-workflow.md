# Install-plugins MCP contract

Use only these advertised Skills Atlas tools. This skill installs **team**
plugins onto the local machine. It is not the local-skill import path
(`/import-skills` or a pasted Atlas sync prompt).

Use the plugin MCP connector `skills-atlas` (Skills Atlas). Do not add a
custom MCP URL.

## `list_installable_plugins`

Read-only. Returns organizations the user can access, each marketplace name,
the local `targetDirectory`, and plugins with `key`, `name`, and `installSpec`.
Never invent an organization slug or plugin key.

## `install_plugins`

Read-only on the Skills Atlas repository. Input:

```json
{
  "orgSlug": "acme",
  "plugins": ["brand", "content"]
}
```

Omit `plugins` to install every available team plugin. The result includes:

- `targetDirectory` — write root, usually `~/.claude/atlas/<orgSlug>`
- `files[]` — `path`, `encoding: "base64"`, `content`, `bytes`
- `commands[]` — Claude CLI commands to run after writing
- `plugins[]` — `key`, `name`, `installSpec`

Write files first, then run `commands` in order. Do not add a git remote or
Forgejo URL. Success is a completed write plus successful CLI commands, not a
Git commit on Skills Atlas.
