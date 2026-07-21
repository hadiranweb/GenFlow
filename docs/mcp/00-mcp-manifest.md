# GenFlow MCP Manifest

> وضعیت: فایل خام / Agent Routing Scaffold. در sprint بعدی با ruleهای دقیق تکمیل می‌شود.

این فایل مشخص می‌کند Agent یا تیم هنگام انجام هر نوع task باید ابتدا کدام اسناد MCP را بخواند.

## مسیرهای پیشنهادی برای Agent

| نوع Task | فایل‌های اولویت‌دار |
|---|---|
| تعیین محدوده قانونی | `process/01-legal-scope.md`, `legal/README.md`, `legal/01-geographic-scope.md` |
| بررسی داده ورودی | `process/02-data-inventory.md`, `privacy/README.md`, `privacy/05-sensitive-data-classification.md` |
| رضایت و حریم خصوصی | `process/03-consent-privacy-rules.md`, `privacy/07-consent-policy.md`, `templates/consent-text-template.md` |
| تحلیل شخصیت/کسب‌وکار | `process/04-analysis-methodology.md`, `hr/01-personality-analysis-big-five.md`, `hr/05-business-swot-analysis.md` |
| تولید پوزیشن | `process/05-position-generation-standard.md`, `hr/07-job-description-standard.md`, `templates/job-description-template.md` |
| ضدتبعیض و Fairness | `process/06-anti-bias-fairness-rules.md`, `fairness/README.md`, `fairness/03-forbidden-terms-list.md` |
| Compliance Engine | `process/07-compliance-engine-design.md`, `compliance/README.md`, `compliance/01-compliance-engine-architecture.md` |
| بازخورد و validation | `process/08-validation-feedback-loop.md`, `templates/feedback-report-template.md`, `examples/sample-feedback-report.md` |

## TODO

- [ ] تعریف rule دقیق برای انتخاب فایل‌ها
- [ ] تعیین سطح اولویت هر سند برای Agent
- [ ] تعیین فایل‌های machine-readable
- [ ] اتصال این manifest به طراحی فنی MCP در Rust/API
