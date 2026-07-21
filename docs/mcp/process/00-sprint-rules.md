# Sprint Rules for GenFlow MCP

> وضعیت: Draft برای Sprint 1. این فایل قواعد اجرای sprintهای MCP را مشخص می‌کند و باید قبل از تکمیل هر MCP به‌روزرسانی شود.

## هدف

این سند تعیین می‌کند که هر sprint مربوط به MCPهای GenFlow چگونه تعریف، تکمیل، review و در صورت نیاز به کد Rust/API تبدیل شود.

اصل کلی:

```text
اول سند و استاندارد در docs/mcp
بعد، فقط در صورت نیاز و با معیار شفاف، پیاده‌سازی در apps/api
```

---

## ترتیب اصلاح‌شده Sprintها

پیشنهاد بازبینی‌شده این است که Bias & Fairness قبل از طراحی تحلیل HR بیاید؛ چون اگر قواعد ضدتبعیض و محدودیت‌های قانونی مشخص نباشند، طراحی تحلیل شخصیت و match score می‌تواند از ابتدا اشتباه یا پرریسک شود.

| Sprint | عنوان | خروجی اصلی | دلیل ترتیب |
|---:|---|---|---|
| 1 | Legal Scope | محدوده قانونی، بازارها، مرز تصمیم‌گیری | قبل از هر طراحی باید بدانیم سیستم در چه حوزه قانونی کار می‌کند |
| 2 | Bias & Fairness Foundation | protected attributes، proxy discrimination، forbidden terms | قبل از HR Analysis باید بدانیم چه چیزهایی نباید وارد تحلیل شود |
| 3 | Data & Privacy | data inventory، consent، retention، prohibited data | بعد از bias، دقیق‌تر می‌دانیم چه داده‌هایی ممنوع یا حساس هستند |
| 4 | HR Analysis Methodology | Big Five، MBTI limits، SWOT، Gap Analysis | تحلیل HR با آگاهی از محدودیت‌های bias/privacy طراحی می‌شود |
| 5 | Position Generation Standard | JD، KPI، Role Leveling، KSAO، O*NET/ESCO | خروجی محصول بعد از روشن شدن تحلیل و محدودیت‌ها استاندارد می‌شود |
| 6 | Compliance Engine | PII Scanner، Output Validator، Risk Scoring، Audit Log | وقتی rules مشخص شد، engine طراحی می‌شود |
| 7 | Templates & Schemas Review | نهایی‌سازی schemaها و templateها | schema هر domain زودتر نوشته می‌شود، این sprint برای review/finalize است |
| 8 | Validation & Feedback Loop | سناریوها، خروجی نمونه، feedback، improvement backlog | قبل از production باید خروجی‌ها با سناریوهای واقعی اعتبارسنجی شوند |

---

## قانون Schema در هر Sprint

Schema نباید تا Sprint 7 عقب بیفتد. هر sprint باید schemaهای مربوط به همان domain را حداقل در نسخه اولیه ایجاد یا به‌روزرسانی کند.

| Sprint | Schemaهای مرتبط |
|---:|---|
| 1 | فعلاً schema فنی لازم نیست؛ فقط legal risk و decision boundary به‌صورت جدول مستند می‌شود |
| 2 | `schemas/candidate-data-schema.md` نسخه اولیه از منظر bias/fairness |
| 3 | `schemas/manager-data-schema.md`, `schemas/business-data-schema.md`, `schemas/consent-event-schema.md` |
| 4 | به‌روزرسانی `candidate-data-schema.md` و تحلیل personality/business |
| 5 | `schemas/position-schema.md`, `schemas/kpi-schema.md` |
| 6 | `schemas/audit-log-schema.md`, `schemas/compliance-risk-score-schema.md` |
| 7 | review، normalize و finalize همه schemaها |
| 8 | `schemas/feedback-item-schema.md`, `schemas/improvement-backlog-schema.md` |

---

## قانون ورود به `apps/api`

کد Rust فقط زمانی نوشته می‌شود که هر سه شرط زیر برقرار باشد:

1. سند مربوط در `docs/mcp` حداقل به وضعیت `review-ready` رسیده باشد.
2. حداقل یک endpoint، validator، type، rule یا workflow واقعی به آن نیاز داشته باشد.
3. type/struct/rule نوشته‌شده در sprint فعلی یا sprint بعدی مصرف مشخص داشته باشد.

اگر این شروط برقرار نباشد، خروجی sprint فقط در `docs/mcp` باقی می‌ماند.

### مثال

```text
در Sprint 1، چون فقط Legal Scope را تعریف می‌کنیم، معمولاً کد Rust لازم نیست.
در Sprint 6، چون Risk Scoring و Audit Log به validator واقعی نیاز دارند، ورود به apps/api منطقی است.
```

---

## Definition of Done برای هر Sprint

یک sprint زمانی Done محسوب می‌شود که موارد زیر انجام شده باشد:

- [ ] فایل process مربوطه تکمیل شده باشد.
- [ ] فایل‌های module/index مرتبط به‌روزرسانی شده باشند.
- [ ] منابع معتبر یا internal decisionها ثبت شده باشند.
- [ ] ریسک‌های اصلی در قالب جدول مشخص شده باشند.
- [ ] اگر domain به schema نیاز دارد، schema اولیه همان sprint نوشته شده باشد.
- [ ] اگر کد Rust نوشته شده، حداقل یک تست یا check مرتبط داشته باشد.
- [ ] وضعیت review مشخص شده باشد: `draft`, `review-ready`, `approved`, `deprecated`.
- [ ] لینک به sprint قبلی و بعدی مشخص شده باشد.
- [ ] open questions و تصمیم‌های لازم از کارفرما ثبت شده باشد.

---

## Review Policy

| نوع سند | Reviewer پیشنهادی |
|---|---|
| Legal | مشاور حقوقی / تصمیم‌گیرنده حقوقی کارفرما |
| Privacy | مسئول داده / مشاور حریم خصوصی |
| HR | متخصص HR / مشاور سازمانی |
| Fairness | HR + Legal + Product |
| Compliance Engine | Tech Lead + Legal/Compliance |
| API/Rust | Backend Lead |

تا زمانی که سند Legal/Privacy/Fairness تأیید نشده، نباید برای آن تصمیم نهایی محصول یا validator سخت‌گیرانه نوشته شود.

---

## Versioning اسناد

هر فایل MCP باید در صورت نهایی شدن، metadata ساده داشته باشد:

```text
Status: draft | review-ready | approved | deprecated
Owner: TBD
Last reviewed: YYYY-MM-DD
Version: v0.1
```

اگر سند approved تغییر اساسی کند:

```text
v0.1 → v0.2 برای اصلاح کوچک
v0.x → v1.0 برای نسخه قابل اتکا
v1.x → v2.0 برای تغییر مبنایی قانون/استاندارد
```

---

## i18n / l10n Policy

GenFlow ممکن است برای بازارهای چندزبانه استفاده شود. بنابراین:

- شناسه‌های فنی، fieldها و enumها بهتر است انگلیسی باشند.
- توضیحات محصولی می‌توانند فارسی و انگلیسی باشند.
- templateهای نهایی باید قابلیت زبان مقصد داشته باشند.
- خروجی‌های HR و Legal برای کارفرمای فارسی‌زبان باید نسخه فارسی قابل فهم داشته باشند.
- در صورت هدف‌گذاری EU/US، نسخه انگلیسی legal/compliance نیز لازم است.

---

## Sprint 1 Decision

برای Sprint 1، طبق این قواعد:

```text
تمرکز فقط روی docs/mcp است.
کد جدید در apps/api نوشته نمی‌شود مگر اینکه بعد از review نیاز واقعی تعریف شود.
```
