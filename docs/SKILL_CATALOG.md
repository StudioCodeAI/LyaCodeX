# Skill Catalog

LyaCodex II integrates the public `sickn33/antigravity-awesome-skills` repository as a remote catalog.

Runtime behavior:

- the app loads `skills_index.json` from the upstream repository;
- the user searches by name, category, description, or risk;
- selecting a skill fetches its `SKILL.md`;
- the selected skill is persisted in local settings;
- Runtime Chat injects the active `SKILL.md` into the system prompt.

The integration is remote-first so the catalog follows upstream updates without bundling the full repository inside LyaCodex II.

Security notes:

- only paths below `skills/` are accepted by the backend;
- remote skills are treated as instructions, not executable code;
- destructive or high-risk actions still require the runtime approval layer;
- attribution is shown in the UI because repository content is licensed separately from code.

Source:

- Repository: `https://github.com/sickn33/antigravity-awesome-skills`
- Index: `https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main/skills_index.json`
