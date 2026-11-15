# Domain and invariants

## Current domain

No business domain is configured or implemented. Authentication defines two basic roles: an administrator can create ordinary user accounts; an ordinary user cannot create accounts. The email and username are required when an administrator creates an account. Usernames are normalized to lowercase for login and uniqueness.

## Undecided

Tenants, business-specific authorization, inventory, pricing, units, document posting, rounding, ledgers, taxes, approvals, and business audit rules are not decided. Do not assume domain rules without accepted criteria.

When adding a domain, record its terms, invariants, valid and invalid examples, exceptions, and the acceptance criteria or tests that prove them.
