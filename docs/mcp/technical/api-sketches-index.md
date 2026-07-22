# API / Rust Sketches Index

> Status: v0.1 draft  
> Purpose: نگه‌داری مسیر کدهای پیشنهادی بدون تبدیل فوری آن‌ها به production code.

## اصل تصمیم

کدهای Rust که در خروجی تیم‌ها آمده‌اند ارزشمندند، اما فعلاً باید به عنوان sketch نگه‌داری شوند؛ نه production implementation.

دلیل:

- بخشی از کدها placeholder هستند.
- برخی module pathها با ساختار واقعی API هنوز هماهنگ نیستند.
- اگر مستقیم وارد `apps/api` شوند ممکن است `clippy -D warnings` یا build را خراب کنند.
- قبل از production باید schemaها و endpointها مشخص شوند.

## Team 2 API sketches

در فایل زیر نگه‌داری شده‌اند:

```text
docs/mcp/_sources/02-team2-compliance-docs-heavy-source.md
```

بخش‌های مهم:

| Sprint | Suggested files in source | Use |
|---|---|---|
| Sprint 1 | `apps/api/src/mcp/types.rs`, `legal.rs` | Geo/capability legal evaluator sketch |
| Sprint 2 | `privacy.rs` | Data policy and privacy evaluator sketch |
| Sprint 3 | `hr_standards.rs` | HR methodology types sketch |
| Sprint 5 | `bias_fairness.rs` | Finding and forbidden phrase scanner sketch |
| Sprint 6 | `compliance_engine.rs` | Rule trait, context, finding, report, risk scoring sketch |
| Sprint 7 | `dtos.rs` | DTO sketch for policy versions and compliance decision |
| Sprint 8 | `feedback.rs` | Feedback workflow sketch |

## Team 1 API sketches

در فایل زیر نگه‌داری شده‌اند:

```text
docs/mcp/_sources/01-team1-v1-implementation-heavy-source.md
```

بخش‌های مهم:

| Sprint | Suggested files in source | Use |
|---|---|---|
| Sprint 1 | `types.rs`, `legal.rs` | Country tier, risk level, human approval defaults |
| Sprint 2 | `bias_fairness.rs` | Forbidden terms, proxy scanner, bias check defaults |
| Sprint 3 | `privacy.rs` | Sensitivity, consent, prohibited data, retention defaults |
| Sprint 4 | `hr_standards.rs` | Big Five, MBTI guard, SWOT, Gap Analysis |
| Sprint 5 | `position.rs` | JD/KPI/KSAO/Position validators |
| Sprint 6 | `compliance_engine.rs` | Full pipeline default implementation |
| Sprint 7 | `schemas.rs` | Schema validation and report builders |
| Sprint 8 | `feedback.rs`, `mod.rs` | Feedback and module registry |

## Promotion path to `apps/api`

یک sketch فقط وقتی به `apps/api` منتقل می‌شود که:

1. schema مربوطه در `docs/mcp/schemas` وجود داشته باشد.
2. endpoint یا validator واقعی تعریف شده باشد.
3. تست حداقلی وجود داشته باشد.
4. کد با Rust موجود و CI سازگار باشد.

## پیشنهاد فاز بعدی

اولین کد production-safe بهتر است این باشد:

```text
apps/api/src/mcp/types.rs
apps/api/src/mcp/registry.rs
apps/api/src/mcp/legal.rs
```

اما فقط در حد capability registry و evaluator ساده، بدون اتصال به تصمیم استخدامی.
