# AI integration

Use only when a product outcome justifies a model call. No model, provider, key, prompt, retention policy, or AI endpoint is configured by this template.

Before implementation, decide the provider and deployment region, allowed data, consent, retention/deletion, per-user authorization, budget, abuse limits, timeouts, and behavior on provider failure. Never send secrets or customer data to an external provider without authorization. Do not treat prompts or model output as trusted instructions or authorization.

Keep credentials and provider calls server-only, validate input and model output with domain schemas, limit request size and output tokens, and use a small provider boundary when there is a concrete need. Distinguish model output from verified facts. Log safe metadata, never prompt bodies or credentials by default. Consider idempotency and cost before retrying.

Test with synthetic data and a fake provider: success, invalid output, timeout, rate limit, and unavailable provider. Test real provider behavior only in an explicitly authorized environment with a bounded budget. Do not deploy or collect conversation history merely by adopting this guide.
