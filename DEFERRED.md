# Deferred backend decisions

| Topic | Default now | Later |
|-------|-------------|-------|
| Curriculum progress sync | 501 stub; localStorage on front | API + DB |
| Opaque Redis/DB sessions | JWT cookie (`asid`) | Revocable server sessions |
| Refresh-token rotation | None (7-day JWT) | Optional shorter TTL + refresh |
| Multi-provider / email-password | Google only | Additional IdPs |
| Firebase / Identity Platform | Out of scope v1 | Revisit if multi-IdP / MFA needed |
| Search | Off | Future feature |
| NestJS | Not used (Fastify) | — |
| Cloud SQL | Not used (Neon) | — |
