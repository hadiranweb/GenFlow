# MCP Roadmap

> وضعیت: Draft به‌روزشده بر اساس بازبینی Sprint Planning.

## هدف

این roadmap ترتیب تکمیل مستندات و پیاده‌سازی MCPهای GenFlow را مشخص می‌کند. اصل اصلی این است که ابتدا اسناد و استانداردها در `docs/mcp` تکمیل شوند و سپس، فقط در صورت وجود نیاز واقعی، بخش فنی در `apps/api` پیاده‌سازی شود.

## ترتیب Sprintها

| Sprint | عنوان | تمرکز اصلی | خروجی docs | خروجی apps/api |
|---:|---|---|---|---|
| 1 | Legal Scope | محدوده جغرافیایی، بازار هدف، قوانین اصلی، مرز decision-support | `process/01-legal-scope.md`, `legal/*` | معمولاً هیچ کدی لازم نیست |
| 2 | Bias & Fairness Foundation | protected attributes، proxy discrimination، forbidden terms، audit logic پایه | `process/06-anti-bias-fairness-rules.md`, `fairness/*` | فقط اگر validator اولیه لازم شد |
| 3 | Data & Privacy | data inventory، consent، retention، prohibited data | `process/02-data-inventory.md`, `process/03-consent-privacy-rules.md`, `privacy/*` | typeهای consent/data در صورت نیاز |
| 4 | HR Analysis Methodology | Big Five، MBTI limitations، SWOT، Gap Analysis، Human Review | `process/04-analysis-methodology.md`, `hr/01..06` | typeهای تحلیل در صورت مصرف واقعی |
| 5 | Position Generation Standard | JD، KPI، role leveling، KSAO، O*NET/ESCO | `process/05-position-generation-standard.md`, `hr/07..11`, templates | schema/DTO در صورت نیاز endpoint |
| 6 | Compliance Engine | PII scanner، consent orchestrator، output validator، risk score، audit log | `process/07-compliance-engine-design.md`, `compliance/*` | شروع منطقی validator/risk/audit code |
| 7 | Templates & Schemas Review | review و نهایی‌سازی schemaها و templateها | `templates/*`, `schemas/*` | هم‌ترازسازی Rust structs با schemaها |
| 8 | Validation & Feedback Loop | سناریوهای نمونه، خروجی‌ها، بازخورد، backlog | `process/08-validation-feedback-loop.md`, `examples/*` | feedback workflow در صورت نیاز |

## اصلاحات نسبت به نسخه اولیه

- Bias & Fairness قبل از HR Analysis قرار گرفت.
- Schemaها به sprintهای مربوط به domain منتقل شدند و Sprint 7 فقط مرحله review/finalize است.
- عبارت‌های مبهم مثل «شاید» و «احتمالاً» با قانون مشخص ورود به `apps/api` جایگزین شدند.
- فایل meta زیر اضافه شد:

```text
docs/mcp/process/00-sprint-rules.md
```

## وابستگی‌ها

```text
Legal Scope
  ↓
Bias & Fairness Foundation
  ↓
Data & Privacy
  ↓
HR Analysis Methodology
  ↓
Position Generation Standard
  ↓
Compliance Engine
  ↓
Templates & Schemas Review
  ↓
Validation & Feedback Loop
```

## معیار کلی موفقیت

MCP زمانی قابل استفاده برای Agent و تیم توسعه است که:

- هر فایل حیاتی حداقل در وضعیت `review-ready` باشد.
- قواعد legal/privacy/fairness به matrix قابل اجرا تبدیل شده باشند.
- schemaهای اصلی با نیازهای API و محصول هم‌راستا باشند.
- حداقل چند scenario واقعی برای validation وجود داشته باشد.
