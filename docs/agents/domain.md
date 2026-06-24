# Domain Documentation

## Layout

This project uses a **single-context** layout:

- **`CONTEXT.md`** — at the repo root. Describes the project's domain, architecture, and key concepts.
- **`docs/adr/`** — at the repo root. Contains Architectural Decision Records (ADRs) in the format `NNNN-brief-title.md`.

## Consumer rules

Skills that read domain docs (`improve-codebase-architecture`, `diagnosing-bugs`, `tdd`) assume this layout and will:

1. Read `CONTEXT.md` to understand the domain
2. Search `docs/adr/` for past decisions relevant to the task
3. Refer to decision context when suggesting changes

## What to put in CONTEXT.md

- Overview of what the project does
- Core concepts and terminology
- Technology stack and key dependencies
- Architectural principles
- How to run/test the project
- Known limitations or constraints

## What to put in docs/adr/

ADRs capture **why** a decision was made, not just what the code does.

Format:
```markdown
# ADR 0001: Brief title

## Context
[Why this decision was needed]

## Decision
[What was decided]

## Consequences
[Positive and negative outcomes]
```

Example: `docs/adr/0001-use-typescript.md`
