# Triage Labels

These labels organize incoming issues through evaluation and into implementation.

## Label definitions

| Label | Meaning | Next action |
|-------|---------|-------------|
| `needs-triage` | Maintainer needs to evaluate | Triage the issue, then apply `ready-for-agent`, `ready-for-human`, `needs-info`, or `wontfix` |
| `needs-info` | Waiting on reporter to provide more context | Comment asking for info; remove this label once received |
| `ready-for-agent` | Fully specified, AFK-ready. An agent can pick it up with no human context | Agent picks it up for implementation |
| `ready-for-human` | Needs human implementation | Assign to a human contributor |
| `wontfix` | Will not be actioned | Close the issue |

## How to apply

When triaging an issue, choose **one** terminal state:
- `ready-for-agent` — AI can handle this
- `ready-for-human` — needs a person
- `needs-info` — waiting on reporter
- `wontfix` — won't fix

Remove `needs-triage` once you've moved it to a terminal state.
