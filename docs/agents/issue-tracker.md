# Issue Tracker Configuration

## Local Markdown

Issues for this project are tracked locally as markdown files under `.scratch/`.

### Structure

```
.scratch/
├── feature-name-1/
│   ├── issue-123.md
│   └── issue-124.md
└── feature-name-2/
    └── issue-125.md
```

### Creating an issue

Create a new markdown file under `.scratch/<feature>/` with the format:

```markdown
# Issue title

## Description
[Issue description]

## Context
[Relevant context]

## Steps to reproduce (if applicable)
[Steps]

## Labels
- needs-triage
```

### Workflow

Skills interact with issues through:
- **Triage**: Apply labels to organize work
- **To-issues**: Convert PRs/notes into issues
- **QA**: Reference issues for testing

---

## Related

- See `docs/agents/triage-labels.md` for label definitions
