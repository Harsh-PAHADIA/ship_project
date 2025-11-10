# AI Agent Workflow Log


## Agents Used
- GitHub Copilot (VSCode inline completions)
- Claude Code (refactoring, generating tests)
- Cursor Agent (task list orchestration)
- OpenAI Codex (prompted to create SQL seed)


## Prompts & Outputs
- Example 1 - Copilot inline:
- Prompt: "create express route GET /routes returning seeded routes"
- Generated snippet: `router.get('/routes', async (req,res)=>{ const routes = await repo.getAll(); res.json(routes); });`


- Example 2 - Claude Code (refactor):
- Prompt: "Refactor computeCB use-case to pure function and add unit tests"
- Generated snippet: `export function computeCB(target, ghgIntensity, fuelT) { const energy = fuelT * 41000; return (target - ghgIntensity) * energy; }`


## Validation / Corrections
- Verified Copilot generated handlers for correct types and added explicit validation (zod) — Copilot omitted validation.
- Claude Code suggested edge-case tests; I added tests for zero fuel and extremely high intensities.


## Observations
- Saved time: bootstrapped boilerplate routes, hooks, and initial tests.
- Failures: agents hallucinated database column names in one case; I cross-checked against schema and corrected.
- Effective combo: Copilot for file-level boilerplate, Claude for refactor suggestions and reasoning, Cursor for task breakdown.


## Best Practices Followed
- Kept agent outputs minimal and always reviewed/typed manually.
- Used small, focused prompts.
- Wrote tests for behavior the agent produced.