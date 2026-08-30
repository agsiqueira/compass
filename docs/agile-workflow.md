# Agile Prototype-First Workflow

## Principle
Optimize for working end-to-end prototypes and rapid stakeholder feedback. Documentation exists to preserve decisions, contracts, safety constraints, and acceptance criteria—not to delay implementation.

## Roles
- Alex and ChatGPT: product design, stakeholder decisions, architecture, UX, acceptance review, and Codex prompts.
- Codex: implementation and technical verification.
- Clinical stakeholders: clinical content, instruments, thresholds, escalation behavior, and pilot approval.

## Milestone loop
1. Discuss one bounded product slice.
2. Update the decision log/specification.
3. Produce an implementation brief with goal, requirements, exclusions, and acceptance criteria.
4. Codex inspects the baseline before editing.
5. Codex implements on one short-lived milestone branch.
6. Run and report relevant tests honestly.
7. Review the working flow and changed-file summary.
8. Fix within the branch.
9. Merge the pull request only after approval.
10. Tag meaningful releasable milestones.

Avoid pull requests per tiny feature. Preserve a stable main branch.

## Prototype sequence
- Milestone 1: repository foundation and clickable synthetic vertical slice.
- Milestone 2: enrollment, activation, and baseline/ECOG workflow.
- Milestone 3: three daily EMA schedules and patient timeline.
- Milestone 4: deterministic alerts and low-burden nurse dashboard.
- Milestone 5: virtual human, voice/text, curated RAG, and answer tracing.
- Milestone 6: research export, reliability, accessibility, and pilot readiness.

Milestones may be rearranged after prototype feedback, but every sprint should remain demonstrable and releasable.
