# Legal MCP Index

> Status: draft  
> Version: v0.1  
> Related Sprint: Sprint 1 — Legal Scope

## هدف

پوشه `legal/` محل نگه‌داری اسناد قانونی مربوط به GenFlow است. این اسناد برای تعیین محدوده بازار، ریسک‌های قانونی، مرز decision-support و الزامات ابتدایی compliance استفاده می‌شوند.

## اصل راهنما

GenFlow باید تا زمان review حقوقی، به عنوان ابزار تصمیم‌یار معرفی شود، نه ابزار تصمیم‌گیرنده استخدامی.

```text
Decision-support: allowed with safeguards
Automated employment decision: not allowed in MVP
```

## فایل‌های اصلی Sprint 1

| فایل | نقش |
|---|---|
| `01-geographic-scope.md` | تعیین بازارها و حوزه‌های قانونی هدف |
| `09-legal-risk-register.md` | فهرست ریسک‌های قانونی اولیه |
| `10-legal-decision-boundaries.md` | مرزهای تصمیم‌گیری مجاز و غیرمجاز |

## فایل‌هایی که در Sprintهای بعدی تکمیل می‌شوند

| فایل | Sprint پیشنهادی |
|---|---:|
| `03-us-federal-eeoc.md` | Sprint 2 |
| `04-california-ccpa-feha.md` | Sprint 3 |
| `05-new-york-nyc-local-law-144.md` | Sprint 2 یا 6 |
| `06-eu-gdpr.md` | Sprint 3 |
| `07-eu-ai-act.md` | Sprint 6 |
| `08-middle-east-iran-considerations.md` | بعد از تعیین بازار هدف |

## Legal Source Register اولیه

| Source ID | Jurisdiction | Source | URL |
|---|---|---|---|
| SRC-EU-AIA-001 | EU | EU AI Act Regulation 2024/1689 | https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng |
| SRC-GDPR-001 | EU | GDPR Regulation 2016/679 | https://eur-lex.europa.eu/eli/reg/2016/679/oj |
| SRC-EEOC-001 | US Federal | EEOC AI / adverse impact publications | https://www.eeoc.gov/eeoc-publications |
| SRC-NYC-001 | NYC | DCWP AEDT Local Law 144 page | https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page |
| SRC-CPPA-001 | California | CPPA CCPA regulations effective 2026 | https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf |
| SRC-NIST-001 | US / Governance | NIST AI RMF Core | https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ |

## Open Questions

- بازار هدف اول GenFlow چیست؟
- آیا GenFlow برای candidate screening استفاده خواهد شد؟
- آیا match score روی تصمیم انسانی اثر مستقیم دارد؟
- آیا کارفرما legal reviewer معرفی می‌کند؟
