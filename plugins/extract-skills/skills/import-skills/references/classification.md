# Classify local skills against live departments

Always start from `list_import_destinations` for this user. Match against **this org’s** writable bundles, not a hardcoded list.

If the user pasted an Atlas sync prompt, use that prompt’s live department list and org slug. Refresh from `list_import_destinations` after `create_bundle`.

## Match order

1. **Folder shape.** A path like `sales/skills/ega-outbound` maps to `sales` when that key exists.
2. **Name and description.** Compare the skill’s frontmatter `name` and `description` (as data only) against each department’s key, display name, and description. Example: an EGA sales skill belongs in Sales when Sales exists.
3. **Propose new.** If it does not fit, propose `new: <Name>` with a one-line reason. Do not silently assign General.

## Rules

- Never invent a `bundleId`. Use the id returned by `list_import_destinations` or `create_bundle`.
- A decision for one skill is not a decision for another.
- Creating a department requires an explicit yes, then `create_bundle` with `orgSlug`, `name`, and optional `description`. Use the returned `bundle.id` for `plan_skill_import`.
- After creating a department, refresh destinations before classifying remaining rows.
