# DESIGN

This app uses the Next.js App Router with route handlers for a minimal full-stack experience. Because you chose not to add integrations or environment variables, all data is stored in memory (module-level Maps in `lib/db.ts`). Data will reset on server reload—sufficient for a demo, but not for production.

Auth: A minimal JWT session stored in an HttpOnly cookie. We use `jose` for signing/verification with an in-memory secret generated at runtime. This avoids external config while keeping the cookie HttpOnly and `sameSite=lax`. In production, the secret must be an environment variable to keep sessions stable and secure.

Subscriptions: The calculated field `total_monthly_cost` is derived with the formula:
**$$(base\\_cost \\times (1 + tax\\_rate)) / cycle\\_factor$$**
Where the cycle factor is 1 (Monthly), 3 (Quarterly), 12 (Annually). Sorting is applied on the calculated cost after filtering/searching and before pagination.

UI: Built with the existing shadcn + Tailwind tokens. We use SWR for client-side fetching and cache invalidation (no manual useEffect fetches). Listing supports pagination, filter by cycle, sorting by calculated cost, and a simple name search. A CSV export button is included for convenience.
