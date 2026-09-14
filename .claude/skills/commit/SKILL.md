---
name: commit
description: Stage and commit changes using this repo's commit message convention. Use when the user says "commit", "commit this", "push", "/commit", or asks for a commit message. Defines the message format so commits stay consistent across sessions.
---

# Commit

## Format

```
<type>: <subject>
```

- **lowercase**, imperative mood — `add cart merge`, not `Added` / `Adds` / `Adding`
- **≤ 60 chars**, no trailing period
- scope only when it disambiguates: `fix(checkout): ...`
- **no emoji**, no "Generated with", no marketing

### Types

| type | for |
|---|---|
| `feat` | new user-facing capability |
| `fix` | bug fix |
| `docs` | documentation, README, CLAUDE.md |
| `refactor` | restructuring, no behaviour change |
| `chore` | tooling, deps, config, gitignore |
| `test` | tests only |
| `perf` | performance only |

### Body

**Usually omit it.** Add a body only when the *why* isn't readable from the diff — a non-obvious
tradeoff, a workaround, a deliberate cut. Blank line after the subject, wrap at 72.

Never restate the diff in prose. If the body says what the code already says, delete it.

```
fix(checkout): recalculate totals from db, ignore client amounts

client-sent subtotals were trusted. a crafted request could set any
price. quantities still come from the client and are revalidated.
```

### Footer

End every commit with:

```
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
```

## Rules

1. **Stage intentionally.** Read `git status` and `git diff` first. Never blind `git add -A` — check
   what's actually being added, and that `.gitignore` is doing its job.
2. **One logical change per commit.** Unrelated changes in the tree → separate commits, not one
   `chore: updates`.
3. **Scan the staged diff for secrets** before committing: keys, tokens, `.env`, the SQLite file,
   a JWT signing key. This is the last cheap place to catch it.
4. **Never** `--no-verify`, `--amend` a pushed commit, or force-push `main`.
5. Push only when asked. `main` tracks `origin/main`; this is a solo repo, so no branch needed
   unless the user asks for one.

## Examples

```
feat: add faceted search filters
feat(pdp): variant selector with price switching
fix: forward auth cookie on ssr fetch
docs: amazon analysis and 24h feature ledger
chore: gitignore screenshots and agent logs
refactor: move price math into pricing.py
```

Bad, and why:

```
Updated stuff                  → no type, vague, capitalised
feat: Added new feature.       → past tense, trailing period
fix: bug                       → says nothing
feat: add cart + fix nav + update readme   → three commits
```
