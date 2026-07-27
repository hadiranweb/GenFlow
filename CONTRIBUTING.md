## 🧪 Testing

### Unit Tests (No DB Required)

```bash
cargo test --workspace --lib
```

These run without PostgreSQL or Redis.

### Integration Tests (Requires DB + Redis)

```bash
docker compose up -d db redis
cargo test --workspace
```

### Writing Tests

- **Domain logic tests** go in `receptors/genflow-receptors/tests/`
- **Service tests** use `mockall` for async traits (McpRepository, McpCache, etc.)
- **Integration tests** in `tests/` at workspace root

---

## 🌿 Git Workflow

### Branch Strategy

| Branch | Purpose | Protected |
|--------|---------|-----------|
| `main` | Stable Rust backend (source of truth) | ✅ |
| `main-platform` | 🏆 Final deliverable: Rust + Remix monorepo | ✅ |
| `arena/*` | Experimental features (clippy fixes, refactors) | ❌ |

### Commit Convention

```
feat: new feature
fix: bug fix
refactor: code restructuring
perf: performance improvement
docs: documentation
ci: CI/CD changes
chore: tooling, dependencies
```

---

## 🚢 Release Process

1. **Development** → `arena/*` branches
2. **Integration** → Merge to `main-platform`
3. **CI** → Automated build + test + audit
4. **Staging** → Auto-deploy from CI
5. **Production** → Manual approval deploy

---

## 📊 Monitoring

### Healthcheck Endpoints

| Service | Endpoint | Container |
|---------|----------|-----------|
| API | `GET /health` | `genflow-api` |
| Web | `GET /` (200) | `genflow-web` |
| DB | `pg_isready` | `genflow-db` |
| Redis | `redis-cli ping` | `genflow-redis` |

### Docker Healthchecks

All services have built-in Docker `HEALTHCHECK` instructions. Unhealthy containers are automatically restarted in production (via `autoheal`).

---

## 🗄️ Database Migrations

GenFlow uses SQLx compile-time checked queries with 11 migration files:

| Migration | Description |
|-----------|-------------|
| `001` | Organizations |
| `002` | Reference tables |
| `003` | MCP registry |
| `004` | Position generation |
| `005` | Candidate matching |
| `006` | Dashboard analytics |
| `007` | Seed data |
| `008` | AI learning |
| `009` | Enterprise security |
| `010` | Tenant context boundaries |
| `011` | Candidate organization access |

Migrations are embedded in the binary and applied automatically at startup.
