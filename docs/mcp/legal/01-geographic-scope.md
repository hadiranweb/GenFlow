# Geographic Scope

> Status: draft  
> Related Sprint: Sprint 1 — Legal Scope

## هدف

این سند مشخص می‌کند GenFlow برای چه بازارهایی باید آماده شود و هر بازار چه سطح ریسکی دارد.

## اولویت پیشنهادی بازارها

| Priority | Market | وضعیت پیشنهادی | دلیل |
|---:|---|---|---|
| P0 | Internal / demo / non-hiring use | شروع MVP | کمترین ریسک، مناسب برای تست محصول |
| P1 | Middle East / Persian-speaking pilot | قابل بررسی بعد از تعیین دقیق کشور | نیازمند local counsel برای قانون کار و privacy |
| P2 | US general | نیازمند guardrails | EEOC/Title VII و ریسک adverse impact |
| P3 | California | نیازمند privacy notice و data rights | CCPA/CPRA و حساسیت employment data |
| P4 | New York City | فقط با compliance plan | Local Law 144 برای AEDT |
| P5 | EU/EEA | فقط با high-risk AI compliance plan | GDPR + EU AI Act |
| Watchlist | Colorado / Quebec | بعد از تصمیم بازار | قوانین AI/automated decision در حال اهمیت بالا |

## تصمیم پیشنهادی برای MVP

برای MVP، GenFlow باید فقط در این محدوده معرفی شود:

```text
Business and HR planning assistant
Position generation support
KPI and job description drafting
No automated candidate ranking
No automated hiring/rejection/promotion/termination
```

## نکته درباره بازار EU

اگر GenFlow برای recruitment، selection، promotion، termination، task allocation یا performance monitoring استفاده شود، در EU احتمالاً وارد حوزه high-risk employment AI می‌شود. بنابراین ورود به EU بدون compliance plan توصیه نمی‌شود.

## نکته درباره NYC

اگر GenFlow به عنوان Automated Employment Decision Tool استفاده شود، باید پیش از استفاده bias audit، اطلاع‌رسانی و public availability الزامات بررسی شود.

## نکته درباره California

اگر داده افراد یا applicants/employees جمع‌آوری شود، Notice at Collection و privacy disclosures باید قبل یا هنگام جمع‌آوری داده روشن باشد.

## نکته درباره Canada / Quebec

اگر بازار Quebec هدف باشد، automated decision و privacy transparency باید جداگانه بررسی شود. این مورد فعلاً watchlist است و نیازمند مشاور حقوقی محلی است.

## خروجی تصمیم موردنیاز

کارفرما باید یکی از این مسیرها را مشخص کند:

| گزینه | توضیح |
|---|---|
| MVP فقط برای demo داخلی | کم‌ریسک‌ترین مسیر |
| MVP برای شرکت‌های فارسی‌زبان | نیازمند بررسی قوانین محلی |
| MVP برای US | نیازمند legal/privacy/fairness از ابتدا |
| MVP برای EU | نیازمند compliance architecture جدی |
| Multi-market | نیازمند segmentation و jurisdiction-aware rules |
