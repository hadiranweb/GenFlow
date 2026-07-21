# Sprint 1 — Legal Scope

> Status: draft  
> Owner: TBD  
> Reviewers: Product + Legal/Compliance + HR  
> Version: v0.1  
> Last updated: 2026-07-22

## هدف Sprint 1

هدف Sprint 1 این است که محدوده قانونی GenFlow روشن شود؛ یعنی قبل از طراحی تحلیل شخصیت، داده، خروجی پوزیشن یا Compliance Engine بدانیم این سیستم در چه بازارهایی استفاده می‌شود و از نظر قانون چه ریسک‌هایی دارد.

GenFlow در وضعیت فعلی یک پلتفرم decision-support برای تولید پوزیشن، KPI و تحلیل تناسب است. اما اگر خروجی آن برای screening، ranking، hiring، promotion، rejection یا termination استفاده شود، وارد حوزه پرریسک employment AI / AEDT می‌شود.

---

## فرضیات محصولی فعلی

| موضوع | فرض فعلی | ریسک |
|---|---|---|
| نقش GenFlow | ابزار تصمیم‌یار، نه تصمیم‌گیرنده نهایی | اگر به تصمیم خودکار تبدیل شود، ریسک قانونی بالا می‌رود |
| کاربر اصلی | مدیر، HR، مشاور سازمانی | اگر کاندیدا مستقیم درگیر شود، privacy و notice سخت‌تر می‌شود |
| نوع خروجی | job position، KPI، tasks، requirements، match insights | اگر خروجی برای رد/قبول فرد استفاده شود، مشمول قوانین استخدامی می‌شود |
| AI | LLM + تحلیل ساختاریافته | نیازمند disclosure، human oversight و auditability |
| وضعیت MVP | prototype / early platform | باید از ابتدا مرز decision-support ثبت شود |

---

## تصمیم کلیدی Sprint 1

تا زمانی که review حقوقی انجام نشده، GenFlow باید این مرز را حفظ کند:

```text
GenFlow must not be positioned as an automated hiring, rejection, promotion, or termination decision system.
GenFlow is a decision-support and documentation-support platform.
Human review is mandatory before any employment-related action.
```

نسخه فارسی:

```text
GenFlow تصمیم‌گیرنده استخدامی نیست؛ فقط ابزار کمک‌تصمیم، تحلیل و تولید ساختار پیشنهادی است.
تصمیم نهایی باید توسط انسان و بر اساس سیاست‌های سازمان گرفته شود.
```

---

## بازارهای هدف و سطح ریسک

| بازار / منطقه | سطح ریسک | دلیل | وضعیت برای MVP |
|---|---:|---|---|
| Internal demo / non-hiring use | پایین تا متوسط | خروجی برای تصمیم استخدامی استفاده نمی‌شود | مناسب برای MVP |
| US general | بالا | EEOC/Title VII و ریسک disparate impact در ابزارهای انتخاب نیروی انسانی | نیازمند guardrail |
| New York City | خیلی بالا | Local Law 144 برای AEDT، bias audit، notice و public summary | فقط بعد از legal review |
| California | بالا | CCPA/CPRA privacy notice و حقوق داده؛ FEHA/anti-discrimination context | نیازمند privacy notice |
| Colorado | بالا / watchlist | قانون AI برای high-risk consequential decisions از 2026 | نیازمند بررسی حقوقی به‌روز |
| EU/EEA | خیلی بالا | EU AI Act employment high-risk + GDPR profiling/automated decision-making | فقط با compliance plan |
| Canada / Quebec | متوسط تا بالا / watchlist | Law 25 و automated decision transparency برای Quebec | اگر بازار هدف باشد، legal review لازم است |
| Middle East / Iran | نامشخص / نیازمند local counsel | حساسیت داده، قانون کار، فرهنگ و پذیرش بازار | برای pilot داخلی قابل بررسی |

---

## منابع قانونی اولیه

| حوزه | منبع | نکته مرتبط با GenFlow |
|---|---|---|
| EU AI Act | Regulation (EU) 2024/1689 / EUR-Lex | AIهای مربوط به employment و worker management می‌توانند high-risk باشند، مخصوصاً recruitment، selection، promotion، termination، task allocation و performance monitoring |
| GDPR | GDPR Article 22 و privacy principles | تصمیم‌گیری صرفاً خودکار و profiling با اثر قانونی/معنادار نیازمند safeguards و human intervention است |
| EEOC / Title VII | EEOC publications on AI and adverse impact | ابزارهای algorithmic برای selection باید از نظر adverse/disparate impact بررسی شوند |
| NYC Local Law 144 | NYC DCWP AEDT | استفاده از AEDT بدون bias audit یک‌ساله، public availability و notice ممنوع است |
| California CCPA/CPRA | CPPA CCPA regulations / Notice at Collection | notice at collection باید قبل یا هنگام جمع‌آوری داده، دسته داده، هدف و retention را روشن کند |
| NIST AI RMF | NIST AI RMF Core | Governance، legal/regulatory documentation، AI inventory و monitoring باید از ابتدا دیده شود |

---

## منابع URL برای Source Register

| ID | URL | استفاده در Sprint 1 |
|---|---|---|
| SRC-EU-AIA-001 | https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng | EU AI Act و high-risk employment AI |
| SRC-GDPR-001 | https://eur-lex.europa.eu/eli/reg/2016/679/oj | GDPR و Article 22 |
| SRC-EEOC-001 | https://www.eeoc.gov/eeoc-publications | EEOC AI/adverse impact publications |
| SRC-NYC-001 | https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page | NYC Local Law 144 / AEDT |
| SRC-CPPA-001 | https://cppa.ca.gov/regulations/pdf/ccpa_statute_eff_20260101.pdf | CCPA/CPRA notice/privacy duties |
| SRC-NIST-001 | https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ | NIST AI RMF Core |

---

## Classification اولیه GenFlow

| Use Case | Legal Classification | Risk | مجاز در MVP؟ |
|---|---|---:|---|
| تولید شرح شغل عمومی بدون داده کاندیدا | HR documentation support | متوسط | بله |
| تولید KPI و tasks برای نقش جدید | HR planning support | متوسط | بله |
| تحلیل شخصیت مدیر برای پیشنهاد سبک نقش | Personality-informed decision support | متوسط تا بالا | فقط با disclaimer |
| تحلیل رزومه کاندیدا و تولید match score | Employment selection support | بالا | فقط بعد از privacy/fairness review |
| رتبه‌بندی خودکار کاندیداها | AEDT / high-risk employment AI | خیلی بالا | خیر در MVP |
| رد/قبول خودکار کاندیدا | Automated employment decision | خیلی بالا | ممنوع تا اطلاع ثانوی |
| پیشنهاد promotion/termination | Worker management high-risk AI | خیلی بالا | ممنوع تا اطلاع ثانوی |

---

## تصمیمات لازم از کارفرما

| سؤال | چرا لازم است؟ | وضعیت |
|---|---|---|
| بازار هدف اصلی کجاست؟ ایران، US، EU، Canada یا ترکیبی؟ | تعیین قوانین پایه | Open |
| آیا سیستم با داده کاندیدا کار می‌کند یا فقط مدیر/کسب‌وکار؟ | تعیین privacy و employment risk | Open |
| آیا خروجی match score برای تصمیم استخدام استفاده می‌شود؟ | تعیین AEDT/high-risk classification | Open |
| آیا کارفرما مشاور حقوقی برای review دارد؟ | تأیید legal assumptions | Open |
| زبان خروجی رسمی چیست؟ فارسی، انگلیسی یا دو زبانه؟ | i18n/legal notice | Open |
| آیا قرار است سیستم برای سازمان‌های بزرگ فروخته شود؟ | نیاز به audit-ready docs | Open |

---

## خروجی‌های Sprint 1

- `docs/mcp/process/00-sprint-rules.md`
- `docs/mcp/process/01-legal-scope.md`
- `docs/mcp/legal/README.md`
- `docs/mcp/legal/01-geographic-scope.md`
- `docs/mcp/legal/09-legal-risk-register.md`
- `docs/mcp/legal/10-legal-decision-boundaries.md`
- به‌روزرسانی `docs/mcp/00-mcp-roadmap.md`

---

## Definition of Done Sprint 1

- [ ] بازار هدف اولیه از کارفرما دریافت شود.
- [ ] decision-support boundary تأیید شود.
- [ ] legal risk register نسخه اولیه تکمیل شود.
- [ ] قوانین اصلی US/EU/NY/CA در سطح scope ثبت شوند.
- [ ] تصمیم شود که Sprint 2 با Bias & Fairness شروع شود.
- [ ] هنوز کدی در `apps/api` نوشته نشود، مگر نیاز فنی واقعی تعریف شود.

---

## Sprint بعدی

```text
Sprint 2: Bias & Fairness Foundation
```

تمرکز Sprint 2:

- protected attributes
- proxy discrimination
- forbidden terms
- human approval checklist
- bias audit implications
