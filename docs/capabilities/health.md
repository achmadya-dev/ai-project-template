# Health checks

Use health endpoints only when the hosting platform or operations team needs them. No health route is enabled by default.

- Liveness answers whether the process can serve a minimal request; avoid dependency checks that restart healthy processes during an external outage.
- Readiness answers whether this instance can serve the traffic assigned to it. Check only dependencies required for that workload, with strict timeouts and bounded cost.

The template home page does not require a database; do not make its readiness depend on one by default. Choose route exposure, cache policy, rate limiting, and any authentication based on the platform. Return minimal information; do not disclose credentials, topology, stack traces, or database errors.

Test healthy and failed dependencies, timeouts, response status, and absence of sensitive details. Avoid creating connections or side effects during module import.
