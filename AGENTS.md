# Codex Working Agreement

## Roles
- Alex and ChatGPT are product designers and stakeholders.
- Codex is the implementation agent.
- Clinicians approve clinical questions, thresholds, escalation language, and knowledge content.

## Delivery method
Use an agile, prototype-first process. Coding and end-to-end validation take priority over extensive documentation. Each milestone must remain small, reviewable, releasable, and represented by one short-lived branch and pull request.

Before editing, inspect the current baseline. Preserve working behavior and prefer additive, targeted changes. Never claim a test was run unless it was actually run.

Every implementation task must state:
1. Goal
2. Requirements
3. Scope and exclusions
4. Acceptance criteria
5. Verification performed
6. Exact changed-file summary

## Safety constraints
- Never commit real patient data, credentials, secrets, or restricted clinical documents.
- Use synthetic patients and clearly labeled nonclinical placeholder content until institutional and clinical approval.
- Deterministic check-ins, safety rules, storage, and alerts must work independently of the AI provider.
- Never let AI silently set a formal ECOG score or trigger an emergency conclusion.
- Preserve original patient reports and append corrections; do not overwrite them.
- Protect authentication, role boundaries, audit history, and de-identification behavior.
