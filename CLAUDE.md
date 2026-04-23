# Verdikart — Claude working notes

## Commit messages: no AI/Claude attribution

Do **not** add any of the following to commit messages, PR bodies, code comments, user-facing copy, or any other artifact produced for this repo:

- `Co-Authored-By: Claude ...` trailers
- "Generated with Claude Code" / "🤖 Generated with Claude Code" footers in PR bodies
- Any other attribution or reference to Claude, Anthropic, or "AI-generated"

**Why:** Verdikart's product principle is *ingen AI/Claude-referanser i produktet*. Commit history and PR descriptions are part of the project's public surface and must stay free of AI attribution.

Write commit messages and PR bodies as the user would write them: subject, body explaining the why, nothing else.

## Pre-PR build verification

Before claiming `npm run build` passes, do a clean-slate production build to catch cross-file type errors that incremental TypeScript cache can hide:

```bash
rm -rf .next node_modules/.cache
NODE_ENV=production npm run build
```

Incremental tsc is fast but can miss:

- Global-script scope collisions (multiple files declaring `async function main()` without `export {}`)
- Type mismatches after file renames or new files added
- Issues that only surface with production optimizations

If only incremental builds have been run, Vercel preview may fail even when local reports clean. Clean slate once before every PR push.
