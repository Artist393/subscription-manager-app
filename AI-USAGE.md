# AI Usage (Example Prompts)

While building this app, you could use Gemini CLI to accelerate common tasks.

- Generate a model:
  gemini cli "Generate a TypeScript interface for a Subscription with fields: name (string), billing_cycle (enum Monthly/Quarterly/Annually), is_active (boolean), base_cost (number), tax_rate (number)."

- OpenAPI scaffolding:
  gemini cli "Write an OpenAPI 3.0 YAML for GET /api/subscriptions that supports pagination (?page, ?limit), filtering by billing_cycle (?cycle), sorting by total_monthly_cost (?sort_by=cost&order=asc|desc), and search (?search)."

- Debug calculated fields in SQL (when moving to a DB):
  gemini cli "How do I compute a monthly-normalized cost in a SQL SELECT for different billing cycles before applying ORDER BY and LIMIT?"
