# Import limits and batching

`list_import_destinations` returns the effective hard limits. The current
Skills Atlas service uses:

- Skills per preview/import batch: **25**
- Regular files per skill folder: **100**
- Raw bytes per file: **512,000**
- Raw bytes across a preview/import batch: **2,000,000**
- Concurrent write calls: **1**

Base64 expands request size but limits apply to decoded raw bytes. A skill that
exceeds a per-file or per-folder constraint is blocked; never split one skill
across separate plans or silently omit files.

## Preflight

Before asking for final approval:

1. enumerate every regular file;
2. calculate per-file and per-folder byte totals;
3. identify zero-byte files (allowed unless the server rejects them);
4. validate normalized relative paths;
5. compare totals with both client and server limits;
6. show blocked folders rather than planning a partial upload.

Do not compress or archive folders unless the MCP server explicitly requires an archive and supports an inert archive payload. Never execute archive contents.

## Batch order and recovery

- Preview all batches before making the first write.
- Keep each returned `planId` paired with exactly its previewed descriptors.
- Send one complete `import_skills` call per plan; do not split a file.
- Do not automatically retry a write call. First inspect whether the server
  returned a commit SHA.
- On expiry, digest mismatch, or Git conflict, re-preview the affected batch
  and ask again after showing the change.
- Keep plan IDs only in conversation/client state. Never write one into a
  discovered skill folder.
