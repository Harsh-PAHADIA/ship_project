# Reflection


Using AI agents accelerated scaffold generation and routine boilerplate: quicker route and component scaffolds, fewer typos, and helpful suggestions for test cases. However, I found that every AI output required careful verification — especially around domain logic (CB formula and pooling edge cases). For the next iteration I'd:


- Build a stricter test-suite before heavy agent use.
- Use agent-generated PRs and review them rather than copying directly.
- Store reusable snippets in a `tasks.md` for Cursor.


Efficiency gains were most noticeable for file scaffolding and unit test templates, while domain logic still required manual reasoning.