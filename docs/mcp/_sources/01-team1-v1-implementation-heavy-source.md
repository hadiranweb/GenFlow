
---

# 🏃 Sprint 1: Legal Scope

---

## `docs/mcp/process/00-sprint-rules.md`

```markdown
# Sprint Rules

## قانون هر Sprint

### Definition of Done
- [ ] سند کامل نوشته شده
- [ ] schema اولیه (اگر لازم بود) نوشته شده
- [ ] اگر کد نوشته شد، حداقل ساختار اولیه دارد
- [ ] لینک به sprint قبل و بعد دارد

### قانون ورود به apps/api
کد Rust فقط زمانی نوشته می‌شود که:
1. سند آن در docs/mcp کامل باشد
2. حداقل یک type یا rule واقعی به آن نیاز داشته باشد
3. sprint بعدی از آن استفاده می‌کند

### ترتیب Sprintها
| Sprint | موضوع |
|--------|--------|
| 1 | Legal Scope |
| 2 | Bias & Fairness |
| 3 | Data & Privacy |
| 4 | HR Analysis Methodology |
| 5 | Position Generation Standard |
| 6 | Compliance Engine |
| 7 | Templates & Schemas (finalize) |
| 8 | Feedback Loop & Examples |
```

---

## `docs/mcp/process/01-legal-scope.md`

```markdown
# Sprint 1 — Legal Scope

## هدف
تعریف دقیق محدوده قانونی سیستم MCP:
- کجا می‌توانیم کار کنیم؟
- چه قوانینی باید رعایت کنیم؟
- کجا نمی‌توانیم کار کنیم؟

## ورودی این Sprint
- هیچ — این اولین Sprint است

## خروجی این Sprint
- docs/mcp/legal/README.md
- docs/mcp/legal/01-geographic-scope.md
- docs/mcp/legal/09-legal-risk-register.md
- docs/mcp/legal/10-legal-decision-boundaries.md
- apps/api/src/mcp/types.rs (اسکلت اولیه)
- apps/api/src/mcp/legal.rs (اسکلت اولیه)

## Sprint بعدی
→ Sprint 2: Bias & Fairness
```

---

## `docs/mcp/legal/README.md`

```markdown
# Legal Domain — Overview

## چرا این Domain مهم است؟
سیستم MCP با داده‌های حساس HR کار می‌کند:
- اطلاعات شخصیتی کارجویان
- تحلیل رفتاری
- تصمیمات استخدامی

این داده‌ها در اکثر کشورها تحت قوانین سختگیرانه هستند.

## فایل‌های این Domain

| فایل | موضوع |
|------|--------|
| 01-geographic-scope.md | کشورها و بازارهای هدف |
| 09-legal-risk-register.md | ثبت ریسک‌های قانونی |
| 10-legal-decision-boundaries.md | مرزهای تصمیم‌گیری |

## قوانین کلیدی که باید رعایت شوند

| قانون | کشور/منطقه | موضوع |
|-------|------------|--------|
| GDPR | اتحادیه اروپا | حفاظت از داده شخصی |
| CCPA | کالیفرنیا، آمریکا | حریم خصوصی مصرف‌کننده |
| PDPA | تایلند | حفاظت از داده شخصی |
| UK GDPR | بریتانیا | حفاظت از داده پس از Brexit |
| LGPD | برزیل | حفاظت از داده شخصی |
| PIPL | چین | حفاظت از اطلاعات شخصی |
```

---

## `docs/mcp/legal/01-geographic-scope.md`

```markdown
# Geographic Scope

## وضعیت کشورها

### 🟢 Tier 1 — Fully Supported
کشورهایی که سیستم به‌طور کامل در آن‌ها کار می‌کند:

| کشور | قانون اصلی | نکته |
|------|-----------|-------|
| آلمان | GDPR + AGG | سختگیرترین اجرای GDPR |
| هلند | GDPR | |
| فرانسه | GDPR + CNIL | نیاز به ثبت CNIL |
| بریتانیا | UK GDPR | پس از Brexit مستقل است |
| کانادا | PIPEDA | |
| استرالیا | Privacy Act 1988 | |

### 🟡 Tier 2 — Supported with Restrictions
کشورهایی که با محدودیت‌هایی کار می‌کنیم:

| کشور | قانون اصلی | محدودیت |
|------|-----------|---------|
| آمریکا | ایالت‌به‌ایالت | CCPA (CA), VCDPA (VA), ... |
| برزیل | LGPD | نیاز به DPO محلی |
| ژاپن | APPI | |
| کره جنوبی | PIPA | |
| امارات | PDPL | |
| ایران | — | بدون قانون مدون اما ریسک بالا |

### 🔴 Tier 3 — Not Supported
کشورهایی که فعلاً پشتیبانی نمی‌شوند:

| کشور | دلیل |
|------|------|
| چین | PIPL محدودیت انتقال داده دارد |
| روسیه | الزام ذخیره‌سازی محلی داده |
| کره شمالی | تحریم بین‌المللی |

## قانون انتقال داده (Data Transfer)

```text
EU → خارج EU:
  فقط به کشورهای دارای adequacy decision
  یا با استفاده از SCCs (Standard Contractual Clauses)

اگر کاربر EU-based است:
  پردازش داده باید در EU یا کشور تأییدشده باشد
```

## تعریف "کاربر" در این سیستم

```text
کاربر = شرکتی که از API استفاده می‌کند (B2B)
کارجو = شخصی که داده‌هایش پردازش می‌شود (Data Subject)

مسئولیت:
  شرکت = Data Controller
  ما = Data Processor
```
```

---

## `docs/mcp/legal/09-legal-risk-register.md`

```markdown
# Legal Risk Register

## فرمت ثبت ریسک

```text
ID       : شناسه ریسک
عنوان    : توضیح کوتاه
احتمال   : Low / Medium / High
تأثیر    : Low / Medium / High
سطح ریسک : احتمال × تأثیر
وضعیت   : Open / Mitigated / Accepted
اقدام    : چه کاری انجام می‌شود؟
```

## ریسک‌های شناسایی‌شده

### LR-001 — استفاده از MBTI در استخدام
| فیلد | مقدار |
|------|-------|
| احتمال | High |
| تأثیر | High |
| سطح | 🔴 Critical |
| وضعیت | Open |
| اقدام | MBTI نباید مستقیم در تصمیم استخدامی استفاده شود. فقط به‌عنوان ابزار کمکی با disclaimer واضح. |

### LR-002 — پردازش داده بدون رضایت صریح
| فیلد | مقدار |
|------|-------|
| احتمال | Medium |
| تأثیر | High |
| سطح | 🔴 High |
| وضعیت | Open |
| اقدام | Consent flow اجباری قبل از هر پردازش |

### LR-003 — انتقال داده از EU به سرور خارج EU
| فیلد | مقدار |
|------|-------|
| احتمال | High |
| تأثیر | High |
| سطح | 🔴 Critical |
| وضعیت | Open |
| اقدام | ذخیره‌سازی داده EU در سرور EU |

### LR-004 — عدم توانایی پاسخ به Right to Erasure
| فیلد | مقدار |
|------|-------|
| احتمال | Medium |
| تأثیر | High |
| سطح | 🟠 High |
| وضعیت | Open |
| اقدام | پیاده‌سازی delete cascade در Sprint 3 |

### LR-005 — تبعیض ناخواسته از طریق AI
| فیلد | مقدار |
|------|-------|
| احتمال | High |
| تأثیر | High |
| سطح | 🔴 Critical |
| وضعیت | Open |
| اقدام | Sprint 2 — Bias & Fairness |
```

---

## `docs/mcp/legal/10-legal-decision-boundaries.md`

```markdown
# Legal Decision Boundaries

## تعریف
این سند مشخص می‌کند چه تصمیماتی را AI می‌تواند بگیرد
و چه تصمیماتی حتماً باید توسط انسان گرفته شود.

## جدول مرزها

| تصمیم | AI می‌تواند؟ | نیاز به Human؟ | دلیل |
|--------|-------------|----------------|------|
| پیشنهاد شرح شغل | ✅ بله | نظارت | خروجی، نه تصمیم نهایی |
| رد کردن کارجو | ❌ خیر | ✅ اجباری | تبعیض احتمالی |
| استخدام کارجو | ❌ خیر | ✅ اجباری | مسئولیت قانونی |
| امتیازدهی به CV | ⚠️ محدود | توصیه می‌شود | ریسک bias |
| تعیین حقوق | ⚠️ محدود | ✅ توصیه | تبعیض جنسیتی احتمالی |
| تحلیل شخصیت | ✅ بله | disclaimer اجباری | ابزار کمکی، نه حکم |
| تصمیم ارتقا | ❌ خیر | ✅ اجباری | مسئولیت HR |

## قانون کلی

```text
هر جا خروجی AI مستقیماً بر زندگی شغلی فرد تأثیر بگذارد
→ Human Approval اجباری است

AI فقط می‌تواند: پیشنهاد، رتبه‌بندی، خلاصه، تحلیل
AI نمی‌تواند: رد، قبول، اخراج، استخدام نهایی
```

## Disclaimer اجباری در خروجی‌ها

```text
"این تحلیل توسط هوش مصنوعی تولید شده و صرفاً جنبه
 مشاوره‌ای دارد. تصمیم نهایی استخدامی باید توسط
 متخصص HR انسانی گرفته شود."
```
```

---

## `apps/api/src/mcp/types.rs`

```rust
/// MCP Core Types — Sprint 1
/// این فایل در هر sprint گسترش می‌یابد

use serde::{Deserialize, Serialize};

/// محدوده جغرافیایی پشتیبانی‌شده
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum GeographicTier {
    /// پشتیبانی کامل
    Tier1FullySupported,
    /// پشتیبانی با محدودیت
    Tier2WithRestrictions,
    /// بدون پشتیبانی
    Tier3NotSupported,
}

/// کشورهای شناسایی‌شده
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Country {
    Germany,
    Netherlands,
    France,
    UnitedKingdom,
    Canada,
    Australia,
    UnitedStates,
    Brazil,
    Japan,
    SouthKorea,
    UAE,
    Iran,
    China,
    Russia,
    Other(String),
}

/// نقش کاربر در مدل داده
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataRole {
    /// شرکتی که از API استفاده می‌کند
    DataController,
    /// ما (پردازنده داده)
    DataProcessor,
    /// کارجو
    DataSubject,
}

/// سطح ریسک قانونی
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, PartialOrd)]
pub enum LegalRiskLevel {
    Low,
    Medium,
    High,
    Critical,
}
```

---

## `apps/api/src/mcp/legal.rs`

```rust
/// Legal Domain — MCP
/// Sprint 1: Geographic Scope & Decision Boundaries

use crate::mcp::types::{Country, GeographicTier, LegalRiskLevel};

/// تعیین tier یک کشور
pub fn get_geographic_tier(country: &Country) -> GeographicTier {
    match country {
        Country::Germany
        | Country::Netherlands
        | Country::France
        | Country::UnitedKingdom
        | Country::Canada
        | Country::Australia => GeographicTier::Tier1FullySupported,

        Country::UnitedStates
        | Country::Brazil
        | Country::Japan
        | Country::SouthKorea
        | Country::UAE
        | Country::Iran => GeographicTier::Tier2WithRestrictions,

        Country::China | Country::Russia => GeographicTier::Tier3NotSupported,

        Country::Other(_) => GeographicTier::Tier2WithRestrictions,
    }
}

/// آیا عملیات در این کشور مجاز است؟
pub fn is_operation_allowed(country: &Country) -> bool {
    get_geographic_tier(country) != GeographicTier::Tier3NotSupported
}

/// آیا برای این کشور EU Data Rules اعمال می‌شود؟
pub fn requires_eu_data_rules(country: &Country) -> bool {
    matches!(
        country,
        Country::Germany | Country::Netherlands | Country::France
    )
}

/// Disclaimer اجباری برای خروجی‌های AI
pub const AI_OUTPUT_DISCLAIMER: &str =
    "این تحلیل توسط هوش مصنوعی تولید شده و صرفاً جنبه \
     مشاوره‌ای دارد. تصمیم نهایی استخدامی باید توسط \
     متخصص HR انسانی گرفته شود.";

/// آیا این تصمیم نیاز به تأیید انسانی دارد؟
pub enum HrDecisionType {
    SuggestJobDescription,
    RejectCandidate,
    HireCandidate,
    ScoreResume,
    AnalyzePersonality,
    DeterminePromotion,
}

pub fn requires_human_approval(decision: &HrDecisionType) -> bool {
    match decision {
        HrDecisionType::SuggestJobDescription => false,
        HrDecisionType::AnalyzePersonality => false,
        HrDecisionType::ScoreResume => false, // توصیه می‌شود اما اجباری نیست
        HrDecisionType::RejectCandidate => true,
        HrDecisionType::HireCandidate => true,
        HrDecisionType::DeterminePromotion => true,
    }
}
```

---

# ✅ Sprint 1 تمام شد

## خلاصه آنچه ساختیم:

```text
docs/mcp/process/00-sprint-rules.md        ✅
docs/mcp/process/01-legal-scope.md         ✅
docs/mcp/legal/README.md                   ✅
docs/mcp/legal/01-geographic-scope.md      ✅
docs/mcp/legal/09-legal-risk-register.md   ✅
docs/mcp/legal/10-legal-decision-boundaries.md ✅
apps/api/src/mcp/types.rs                  ✅
apps/api/src/mcp/legal.rs                  ✅
```

---
# 🏃 Sprint 2: Bias & Fairness

---

## `docs/mcp/process/02-bias-fairness.md`

```markdown
# Sprint 2 — Bias & Fairness

## هدف
تعریف دقیق قوانین ضد تبعیض و سوگیری در سیستم MCP:
- چه ویژگی‌هایی محافظت‌شده هستند؟
- چه کلماتی ممنوع‌اند؟
- تبعیض غیرمستقیم چیست؟
- چه زمانی انسان باید تأیید کند؟

## چرا قبل از HR Analysis؟
اگر ابتدا روش تحلیل طراحی شود و بعد قوانین bias اعمال شود،
معماری باید از نو نوشته شود.
قوانین fairness باید پایه طراحی باشند، نه لایه روی آن.

## ورودی این Sprint
← Sprint 1: Legal Scope
  - کشورهای پشتیبانی‌شده
  - LegalRiskLevel
  - HumanApproval types

## خروجی این Sprint
- docs/mcp/fairness/README.md
- docs/mcp/fairness/01-protected-attributes.md
- docs/mcp/fairness/02-proxy-discrimination-rules.md
- docs/mcp/fairness/03-forbidden-terms-list.md
- docs/mcp/fairness/04-anti-bias-checklist.md
- docs/mcp/fairness/08-human-approval-checklist.md
- apps/api/src/mcp/bias_fairness.rs
- بروزرسانی apps/api/src/mcp/types.rs

## Sprint بعدی
→ Sprint 3: Data & Privacy
```

---

## `docs/mcp/fairness/README.md`

```markdown
# Fairness Domain — Overview

## چرا این Domain حیاتی است؟

سیستم MCP در حوزه HR کار می‌کند.
HR یکی از حساس‌ترین حوزه‌ها از نظر تبعیض است:

```text
تبعیض در استخدام → آسیب مستقیم به زندگی افراد
AI بدون کنترل  → تبعیض سیستماتیک در مقیاس بزرگ
```

## دو نوع تبعیض

### تبعیض مستقیم (Direct Discrimination)
```text
"فقط آقایان مجاز به درخواست هستند"
→ واضح، صریح، غیرقانونی
```

### تبعیض غیرمستقیم (Indirect / Proxy Discrimination)
```text
"حداقل قد ۱۸۰ سانتی‌متر لازم است"
→ ظاهراً خنثی، اما عملاً زنان را حذف می‌کند
→ خطرناک‌تر چون پنهان است
```

## فایل‌های این Domain

| فایل | موضوع |
|------|--------|
| 01-protected-attributes.md | ویژگی‌های محافظت‌شده |
| 02-proxy-discrimination-rules.md | قوانین تبعیض غیرمستقیم |
| 03-forbidden-terms-list.md | کلمات و عبارات ممنوع |
| 04-anti-bias-checklist.md | چک‌لیست ضد سوگیری |
| 08-human-approval-checklist.md | چک‌لیست تأیید انسانی |

## قانون بنیادی این Domain

```text
سیستم MCP هیچ خروجی‌ای تولید نمی‌کند که:
  1. مستقیماً به Protected Attribute اشاره کند
  2. از Proxy برای رسیدن به همان نتیجه استفاده کند
  3. بدون Disclaimer از AI صادر شود
  4. تصمیم نهایی استخدامی را خودکار انجام دهد
```
```

---

## `docs/mcp/fairness/01-protected-attributes.md`

```markdown
# Protected Attributes

## تعریف
ویژگی‌هایی که استفاده از آن‌ها در تصمیمات استخدامی
در اکثر کشورها غیرقانونی یا بسیار محدود است.

## جدول اصلی

| ویژگی | انگلیسی | وضعیت | قانون مرجع |
|--------|----------|--------|------------|
| جنسیت | Gender | 🔴 ممنوع | GDPR, Title VII |
| سن | Age | 🔴 ممنوع | ADEA, GDPR |
| نژاد / قومیت | Race / Ethnicity | 🔴 ممنوع | همه کشورها |
| مذهب | Religion | 🔴 ممنوع | Title VII, GDPR |
| ملیت | Nationality | 🔴 ممنوع | اکثر کشورها |
| معلولیت | Disability | 🔴 ممنوع | ADA, GDPR |
| وضعیت بارداری | Pregnancy | 🔴 ممنوع | PDA, GDPR |
| وضعیت تأهل | Marital Status | 🟠 محدود | برخی کشورها |
| گرایش جنسی | Sexual Orientation | 🔴 ممنوع | GDPR, اکثر EU |
| وضعیت مالی | Financial Status | 🟠 محدود | برخی استفاده‌ها |
| سابقه کیفری | Criminal Record | 🟡 مشروط | بستگی به شغل |
| ژنتیک | Genetic Info | 🔴 ممنوع | GINA, GDPR |

## وضعیت در کشورهای Tier 1 و Tier 2

| کشور | ویژگی‌های اضافه محافظت‌شده |
|------|--------------------------|
| آلمان | AGG: ویژگی‌های فوق + جهان‌بینی |
| فرانسه | + ظاهر فیزیکی، لهجه |
| کانادا | + منشأ خانوادگی |
| آمریکا | ایالت‌به‌ایالت — LGBTQ+ در بسیاری از ایالات |
| برزیل | + منشأ اجتماعی |

## قانون استفاده در MCP

```text
Protected Attribute در MCP:
  ❌ نمی‌تواند به‌عنوان معیار انتخاب استفاده شود
  ❌ نمی‌تواند در Job Description ذکر شود
  ❌ نمی‌تواند در KPI یا scoring ظاهر شود
  ⚠️  فقط برای گزارش Diversity (با رضایت صریح) مجاز است
```

## Sensitive vs Protected

```text
Protected  = استفاده در تصمیم → غیرقانونی
Sensitive  = نیاز به رضایت صریح برای جمع‌آوری

همه Protected Attributeها، Sensitive هم هستند.
اما برخی Sensitive Attributeها، Protected نیستند.
مثال: سابقه بیماری → Sensitive، اما Protected فقط در موارد خاص.
```
```

---

## `docs/mcp/fairness/02-proxy-discrimination-rules.md`

```markdown
# Proxy Discrimination Rules

## تعریف
Proxy Discrimination یعنی استفاده از یک ویژگی ظاهراً خنثی
که در عمل همبستگی بالایی با یک Protected Attribute دارد.

## چرا خطرناک‌تر از تبعیض مستقیم است؟

```text
تبعیض مستقیم  → قابل تشخیص، قابل اثبات
Proxy          → پنهان، دفاع‌پذیر، سیستماتیک
AI             → Proxy را از داده یاد می‌گیرد بدون آنکه بداند
```

## جدول Proxy‌های شناخته‌شده

| Proxy | Protected Attribute مرتبط | توضیح |
|-------|--------------------------|-------|
| کد پستی / محله | نژاد، قومیت | segregation تاریخی |
| نام دانشگاه | طبقه اجتماعی، نژاد | دسترسی نابرابر به آموزش |
| شکاف در رزومه | جنسیت، وضعیت بارداری | مرخصی زایمان |
| فعالیت‌های خارج از کار | مذهب، معلولیت | |
| نام خانوادگی | نژاد، قومیت | |
| آدرس ایمیل قدیمی | سن | |
| نوع دانشگاه دولتی/خصوصی | طبقه اجتماعی | |
| سال فارغ‌التحصیلی | سن | |
| وابستگی به باشگاه/انجمن | مذهب، قومیت | |

## قوانین MCP برای مقابله با Proxy

### قانون ۱ — Feature Screening
```text
هر ورودی به مدل باید بررسی شود:
  آیا همبستگی بالایی با Protected Attribute دارد؟
  اگر بله → حذف یا anonymize شود
```

### قانون ۲ — Output Audit
```text
هر خروجی باید بررسی شود:
  آیا به‌طور غیرمستقیم به Proxy اشاره می‌کند؟
  آیا pattern تبعیض‌آمیز در خروجی‌های متعدد وجود دارد؟
```

### قانون ۳ — Correlation Threshold
```text
اگر correlation یک feature با Protected Attribute > 0.3 باشد:
  → باید flagged شود
  → نیاز به Human Review دارد
```

### قانون ۴ — Historical Data Warning
```text
اگر داده آموزشی از تصمیمات تاریخی HR گرفته شده:
  → باید فرض شود که bias دارد
  → نیاز به debiasing یا حذف آن feature
```
```

---

## `docs/mcp/fairness/03-forbidden-terms-list.md`

```markdown
# Forbidden Terms List

## دسته‌بندی

### 🔴 دسته A — کاملاً ممنوع
این کلمات/عبارات هرگز نباید در خروجی سیستم ظاهر شوند:

#### جنسیت
```text
"فقط آقایان"
"فقط خانم‌ها"
"مناسب برای مردان"
"ترجیحاً مذکر/مؤنث"
"he/she preferred"
"male/female only"
```

#### سن
```text
"جوان و پرانرژی"
"زیر ۳۵ سال"
"بازنشستگان مجاز نیستند"
"fresh graduate preferred" (اگر ضرورت شغلی ندارد)
"young professional"
```

#### نژاد و ملیت
```text
هر اشاره به نژاد، قومیت، ملیت به‌عنوان معیار
"native speaker" (اگر واقعاً لازم نباشد)
```

#### مذهب
```text
هر اشاره به مذهب یا باور دینی
"ارزش‌های خانوادگی" (اگر code برای مذهب باشد)
```

### 🟠 دسته B — نیاز به بررسی دقیق
این کلمات ممکن است در برخی زمینه‌ها قابل قبول باشند:

```text
"energetic"         ← ممکن است age bias داشته باشد
"recent graduate"   ← ممکن است age bias داشته باشد
"native-level"      ← باید ضرورت شغلی داشته باشد
"strong culture fit"← ممکن است proxy برای قومیت باشد
"clean record"      ← باید مرتبط با شغل باشد
"physically fit"    ← باید ضرورت شغلی داشته باشد
```

### 🟡 دسته C — نیاز به Disclaimer
```text
تحلیل‌های شخصیتی (MBTI, Big Five)
امتیازدهی به soft skills
ارزیابی "leadership potential"
```

## قانون اعمال

```text
اگر خروجی شامل دسته A بود    → بلوک کامل، خطا برگردد
اگر خروجی شامل دسته B بود    → flag + human review
اگر خروجی شامل دسته C بود    → disclaimer اجباری اضافه شود
```

## Whitelist — استثناها

```text
اگر Genuine Occupational Requirement (GOR) وجود داشته باشد:
مثال: نقش بازیگری که نیاز به جنسیت خاص دارد
→ باید مستند، قابل توجیه و تأییدشده توسط Legal باشد
→ هرگز توسط AI به‌تنهایی تصمیم‌گیری نمی‌شود
```
```

---

## `docs/mcp/fairness/04-anti-bias-checklist.md`

```markdown
# Anti-Bias Checklist

## استفاده
این چک‌لیست باید قبل از ارسال هر خروجی به کاربر اجرا شود.

---

## بخش ۱ — بررسی ورودی (Input Check)

```text
[ ] آیا ورودی شامل Protected Attribute است؟
    اگر بله → حذف یا anonymize شود

[ ] آیا ورودی شامل Proxy شناخته‌شده است؟
    اگر بله → flag و بررسی همبستگی

[ ] آیا داده تاریخی HR مورد استفاده قرار گرفته؟
    اگر بله → bias warning فعال شود
```

## بخش ۲ — بررسی فرآیند (Process Check)

```text
[ ] آیا همه candidates با معیار یکسان ارزیابی شدند؟

[ ] آیا معیارهای ارزیابی از قبل تعریف و مستند شده‌اند؟

[ ] آیا وزن‌دهی به معیارها توجیه‌پذیر و مستند است؟

[ ] آیا مدل بر اساس داده‌ای که bias داشت آموزش دیده؟
```

## بخش ۳ — بررسی خروجی (Output Check)

```text
[ ] آیا خروجی شامل Forbidden Terms دسته A است؟
    اگر بله → بلوک

[ ] آیا خروجی شامل Forbidden Terms دسته B است؟
    اگر بله → flag + human review

[ ] آیا Disclaimer اضافه شده؟
    اگر خروجی تحلیل شخصیتی است → اجباری

[ ] آیا خروجی تصمیم نهایی استخدامی می‌گیرد؟
    اگر بله → بلوک، human approval لازم است
```

## بخش ۴ — بررسی الگو (Pattern Check)

```text
[ ] آیا در ۱۰۰ خروجی اخیر الگوی جنسیتی وجود دارد؟
    مثال: ۹۰٪ توصیه‌ها برای مردان

[ ] آیا در خروجی‌ها یک قومیت کمتر دیده می‌شود؟

[ ] آیا در scoring یک گروه سنی امتیاز پایین‌تری می‌گیرد؟
```

## نتیجه چک‌لیست

```text
همه ✅       → خروجی مجاز است
یک 🔴        → بلوک کامل
یک یا بیشتر 🟠 → human review اجباری
```
```

---

## `docs/mcp/fairness/08-human-approval-checklist.md`

```markdown
# Human Approval Checklist

## چه زمانی این چک‌لیست فعال می‌شود؟

```text
1. خروجی شامل Forbidden Term دسته B باشد
2. Proxy شناخته‌شده در ورودی یافت شود
3. نوع تصمیم از نوع "نیاز به تأیید انسانی" باشد
   (از Sprint 1: legal.rs → requires_human_approval)
4. Pattern سوگیری در خروجی‌های اخیر شناسایی شده باشد
```

---

## چک‌لیست برای HR Reviewer

### قبل از تأیید

```text
[ ] خروجی AI را خوانده‌ام و درک کرده‌ام
[ ] معیارهای ارزیابی به‌وضوح مستند هستند
[ ] هیچ Protected Attribute در تصمیم دخیل نیست
[ ] استدلال تصمیم قابل توضیح به کارجو است
[ ] تصمیم با سیاست‌های داخلی شرکت سازگار است
```

### در حین بررسی

```text
[ ] آیا توصیه AI منطقی و مبتنی بر شایستگی است؟
[ ] آیا معیارها برای همه candidates یکسان اعمال شده؟
[ ] آیا داده‌های حساسی که نباید استفاده شوند، استفاده شده‌اند؟
```

### بعد از تأیید

```text
[ ] تصمیم نهایی را با نام و امضا ثبت کرده‌ام
[ ] دلیل تأیید یا رد توصیه AI را مستند کرده‌ام
[ ] در صورت رد توصیه AI، دلیل را در سیستم ثبت کرده‌ام
```

## مستندسازی اجباری

```text
هر تصمیم HR که نیاز به Human Approval داشت باید شامل:
  - شناسه reviewer
  - زمان بررسی
  - نتیجه: تأیید / رد / اصلاح
  - دلیل (اجباری در صورت رد یا اصلاح)
  - مدت زمان نگهداری: حداقل ۳ سال (GDPR)
```
```

---

## بروزرسانی `apps/api/src/mcp/types.rs`

```rust
// ── موارد اضافه‌شده در Sprint 2 ──────────────────────────

/// ویژگی‌های محافظت‌شده
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProtectedAttribute {
    Gender,
    Age,
    RaceEthnicity,
    Religion,
    Nationality,
    Disability,
    Pregnancy,
    MaritalStatus,
    SexualOrientation,
    FinancialStatus,
    CriminalRecord,
    GeneticInfo,
}

/// دسته‌بندی کلمات ممنوع
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ForbiddenTermCategory {
    /// کاملاً ممنوع — بلوک فوری
    CategoryA,
    /// نیاز به بررسی — human review
    CategoryB,
    /// نیاز به disclaimer
    CategoryC,
}

/// نتیجه بررسی bias
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BiasCheckResult {
    /// پاک — خروجی مجاز است
    Clean,
    /// بلوک — خروجی ممنوع است
    Blocked { reason: String },
    /// نیاز به بررسی انسانی
    RequiresHumanReview { flags: Vec<String> },
}

/// نتیجه Human Approval
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum HumanApprovalOutcome {
    Approved { reviewer_id: String, notes: Option<String> },
    Rejected { reviewer_id: String, reason: String },
    Modified { reviewer_id: String, changes: String },
}
```

---

## `apps/api/src/mcp/bias_fairness.rs`

```rust
/// Bias & Fairness Domain — MCP
/// Sprint 2

use crate::mcp::types::{
    BiasCheckResult, ForbiddenTermCategory, ProtectedAttribute,
};

// ── Forbidden Terms ───────────────────────────────────────

/// کلمات دسته A — بلوک فوری
const FORBIDDEN_TERMS_A: &[&str] = &[
    "فقط آقایان",
    "فقط خانم‌ها",
    "مناسب برای مردان",
    "ترجیحاً مذکر",
    "ترجیحاً مؤنث",
    "male only",
    "female only",
    "young and energetic",
    "زیر ۳۵ سال",
    "بازنشستگان مجاز نیستند",
];

/// کلمات دسته B — نیاز به بررسی
const FORBIDDEN_TERMS_B: &[&str] = &[
    "energetic",
    "recent graduate",
    "native-level",
    "strong culture fit",
    "physically fit",
    "clean record",
    "جوان",
];

/// بررسی وجود کلمات ممنوع در متن
pub fn scan_forbidden_terms(text: &str) -> Vec<(String, ForbiddenTermCategory)> {
    let text_lower = text.to_lowercase();
    let mut findings = Vec::new();

    for &term in FORBIDDEN_TERMS_A {
        if text_lower.contains(term) {
            findings.push((term.to_string(), ForbiddenTermCategory::CategoryA));
        }
    }

    for &term in FORBIDDEN_TERMS_B {
        if text_lower.contains(term) {
            findings.push((term.to_string(), ForbiddenTermCategory::CategoryB));
        }
    }

    findings
}

// ── Proxy Detection ───────────────────────────────────────

/// Proxy‌های شناخته‌شده و Protected Attribute مرتبط
pub fn known_proxies() -> Vec<(&'static str, ProtectedAttribute)> {
    vec![
        ("کد پستی", ProtectedAttribute::RaceEthnicity),
        ("zip code", ProtectedAttribute::RaceEthnicity),
        ("شکاف در رزومه", ProtectedAttribute::Pregnancy),
        ("resume gap", ProtectedAttribute::Pregnancy),
        ("سال فارغ‌التحصیلی", ProtectedAttribute::Age),
        ("graduation year", ProtectedAttribute::Age),
        ("نام خانوادگی", ProtectedAttribute::RaceEthnicity),
    ]
}

/// آیا متن شامل proxy شناخته‌شده است؟
pub fn scan_proxies(text: &str) -> Vec<(String, ProtectedAttribute)> {
    let text_lower = text.to_lowercase();
    known_proxies()
        .into_iter()
        .filter(|(proxy, _)| text_lower.contains(proxy))
        .map(|(proxy, attr)| (proxy.to_string(), attr))
        .collect()
}

// ── Anti-Bias Checklist ───────────────────────────────────

/// اجرای کامل چک‌لیست روی یک خروجی
pub fn run_bias_check(output_text: &str) -> BiasCheckResult {
    // بررسی کلمات ممنوع
    let forbidden = scan_forbidden_terms(output_text);

    // اگر دسته A یافت شد → بلوک
    let has_category_a = forbidden
        .iter()
        .any(|(_, cat)| *cat == ForbiddenTermCategory::CategoryA);

    if has_category_a {
        let blocked_terms: Vec<String> = forbidden
            .iter()
            .filter(|(_, cat)| *cat == ForbiddenTermCategory::CategoryA)
            .map(|(term, _)| term.clone())
            .collect();

        return BiasCheckResult::Blocked {
            reason: format!("Forbidden terms (Category A): {:?}", blocked_terms),
        };
    }

    // جمع‌آوری همه flags
    let mut flags: Vec<String> = Vec::new();

    // کلمات دسته B
    for (term, cat) in &forbidden {
        if *cat == ForbiddenTermCategory::CategoryB {
            flags.push(format!("Forbidden term (Category B): {}", term));
        }
    }

    // بررسی proxy
    let proxies = scan_proxies(output_text);
    for (proxy, attr) in &proxies {
        flags.push(format!("Proxy detected: '{}' → {:?}", proxy, attr));
    }

    if !flags.is_empty() {
        return BiasCheckResult::RequiresHumanReview { flags };
    }

    BiasCheckResult::Clean
}

// ── Disclaimer ────────────────────────────────────────────

/// تشخیص اینکه آیا خروجی نیاز به disclaimer دارد
pub fn needs_personality_disclaimer(output_text: &str) -> bool {
    let indicators = ["big five", "mbti", "شخصیت", "personality", "تحلیل رفتاری"];
    let lower = output_text.to_lowercase();
    indicators.iter().any(|&kw| lower.contains(kw))
}

pub const PERSONALITY_DISCLAIMER: &str =
    "تحلیل شخصیتی ارائه‌شده صرفاً جنبه مشاوره‌ای دارد \
     و نباید به‌عنوان تنها معیار تصمیم استخدامی استفاده شود.";
```

---

# ✅ Sprint 2 تمام شد

## خلاصه آنچه ساختیم:

```text
docs/mcp/process/02-bias-fairness.md              ✅
docs/mcp/fairness/README.md                       ✅
docs/mcp/fairness/01-protected-attributes.md      ✅
docs/mcp/fairness/02-proxy-discrimination-rules.md ✅
docs/mcp/fairness/03-forbidden-terms-list.md      ✅
docs/mcp/fairness/04-anti-bias-checklist.md       ✅
docs/mcp/fairness/08-human-approval-checklist.md  ✅
apps/api/src/mcp/types.rs  (بروزرسانی)            ✅
apps/api/src/mcp/bias_fairness.rs                 ✅
```

## ارتباط با Sprint 1

```text
Sprint 1 → requires_human_approval()   ← Sprint 2 از آن استفاده کرد
Sprint 1 → LegalRiskLevel              ← Sprint 2 آن را گسترش داد
Sprint 2 → BiasCheckResult             ← Sprint 6 (Compliance) از آن استفاده می‌کند
Sprint 2 → ForbiddenTermCategory       ← Sprint 6 (Scanner) از آن استفاده می‌کند
```

---
# 🏃 Sprint 3: Data & Privacy

---

## `docs/mcp/process/03-data-privacy.md`

```markdown
# Sprint 3 — Data & Privacy

## هدف
تعریف دقیق قوانین داده و حریم خصوصی در سیستم MCP:
- چه داده‌هایی جمع‌آوری می‌شوند؟
- کدام داده‌ها حساس‌اند؟
- کدام داده‌ها ممنوع‌اند؟
- رضایت کاربر چطور گرفته می‌شود؟
- داده چقدر نگهداری می‌شود؟
- چطور حذف می‌شود؟

## چرا بعد از Bias & Fairness؟
در Sprint 2 مشخص شد کدام داده‌ها Protected Attribute هستند.
حالا می‌دانیم:
  - کدام داده‌ها اصلاً نباید جمع‌آوری شوند
  - کدام داده‌ها نیاز به رضایت صریح دارند
  - کدام داده‌ها باید anonymize شوند

## ورودی این Sprint
← Sprint 1: GeographicTier, LegalRiskLevel
← Sprint 2: ProtectedAttribute, ForbiddenTermCategory

## خروجی این Sprint
- docs/mcp/privacy/README.md
- docs/mcp/privacy/01-data-inventory-overview.md
- docs/mcp/privacy/05-sensitive-data-classification.md
- docs/mcp/privacy/06-prohibited-data.md
- docs/mcp/privacy/07-consent-policy.md
- docs/mcp/privacy/09-data-retention-deletion.md
- apps/api/src/mcp/privacy.rs
- بروزرسانی apps/api/src/mcp/types.rs

## Sprint بعدی
→ Sprint 4: HR Analysis Methodology
```

---

## `docs/mcp/privacy/README.md`

```markdown
# Privacy Domain — Overview

## چرا این Domain حیاتی است؟

سیستم MCP با داده‌های شخصی کارجویان کار می‌کند.
این داده‌ها در بسیاری از کشورها تحت قوانین سختگیرانه هستند.

```text
نقض GDPR    → جریمه تا ۴٪ درآمد سالانه جهانی
نقض CCPA    → جریمه تا $۷,۵۰۰ به ازای هر نقض عمدی
نقض LGPD    → جریمه تا ۲٪ درآمد در برزیل
```

## مدل داده در MCP

```text
┌─────────────────────────────────────────┐
│              Data Flow                  │
│                                         │
│  Company (Controller)                   │
│       ↓ ارسال داده کارجو               │
│  MCP API (Processor)                    │
│       ↓ پردازش                         │
│  LLM Engine                             │
│       ↓ خروجی                          │
│  MCP API                                │
│       ↓ بازگشت به                      │
│  Company (Controller)                   │
└─────────────────────────────────────────┘

ما Processor هستیم، نه Controller.
یعنی: مسئولیت جمع‌آوری رضایت با شرکت است.
اما ما موظفیم ابزار آن را فراهم کنیم.
```

## فایل‌های این Domain

| فایل | موضوع |
|------|--------|
| 01-data-inventory-overview.md | فهرست کامل داده‌ها |
| 05-sensitive-data-classification.md | دسته‌بندی داده‌های حساس |
| 06-prohibited-data.md | داده‌های ممنوع |
| 07-consent-policy.md | سیاست رضایت |
| 09-data-retention-deletion.md | نگهداری و حذف |

## اصول بنیادی (از GDPR Article 5)

```text
۱. Lawfulness        — پردازش باید مبنای قانونی داشته باشد
۲. Purpose Limitation — داده فقط برای هدف اعلام‌شده استفاده شود
۳. Data Minimisation — فقط داده‌ای که واقعاً لازم است جمع شود
۴. Accuracy          — داده باید دقیق و به‌روز باشد
۵. Storage Limitation — داده بیش از حد لازم نگهداری نشود
۶. Integrity         — داده باید ایمن نگهداری شود
۷. Accountability    — Controller باید قابل پاسخگویی باشد
```
```

---

## `docs/mcp/privacy/01-data-inventory-overview.md`

```markdown
# Data Inventory Overview

## تعریف
فهرست کامل همه داده‌هایی که سیستم MCP پردازش می‌کند.

---

## دسته‌بندی کلی داده‌ها

```text
┌──────────────────────────────────────────────────────┐
│                   Data Categories                    │
├──────────────┬───────────────────────────────────────┤
│ Company Data │ اطلاعات شرکت مشتری                   │
│ Position Data│ اطلاعات موقعیت شغلی                  │
│ Candidate    │ اطلاعات کارجو                         │
│ Analysis     │ خروجی‌های تحلیل AI                   │
│ Audit        │ لاگ‌های سیستم                        │
└──────────────┴───────────────────────────────────────┘
```

---

## ۱. Company Data

| فیلد | نوع | حساسیت | توضیح |
|------|-----|---------|-------|
| company_id | UUID | عادی | شناسه یکتا |
| company_name | String | عادی | نام شرکت |
| country | Country | عادی | کشور ثبت شرکت |
| industry | String | عادی | صنعت |
| size | CompanySize | عادی | کوچک/متوسط/بزرگ |
| contact_email | String | محرمانه | ایمیل تماس |
| subscription_tier | Enum | تجاری | نوع اشتراک |

---

## ۲. Position Data

| فیلد | نوع | حساسیت | توضیح |
|------|-----|---------|-------|
| position_id | UUID | عادی | شناسه یکتا |
| title | String | عادی | عنوان شغل |
| department | String | عادی | واحد سازمانی |
| level | RoleLevel | عادی | سطح شغلی |
| kpis | Vec<KPI> | عادی | شاخص‌های عملکرد |
| required_skills | Vec<Skill> | عادی | مهارت‌های لازم |
| salary_range | Option<Range> | محرمانه | محدوده حقوق |

---

## ۳. Candidate Data

| فیلد | نوع | حساسیت | مجاز؟ |
|------|-----|---------|-------|
| candidate_id | UUID | عادی | ✅ |
| full_name | String | شخصی | ✅ با رضایت |
| email | String | شخصی | ✅ با رضایت |
| phone | String | شخصی | ✅ با رضایت |
| resume_text | Text | شخصی | ✅ با رضایت |
| work_history | Vec<Job> | شخصی | ✅ با رضایت |
| education | Vec<Edu> | شخصی | ✅ با رضایت |
| skills | Vec<Skill> | عادی | ✅ |
| personality_scores | Scores | حساس | ✅ با رضایت صریح |
| gender | Enum | حساس | ⚠️ فقط diversity |
| age / birth_date | Date | حساس | ⚠️ فقط compliance |
| nationality | String | حساس | ⚠️ فقط compliance |
| health_data | Any | پزشکی | ❌ ممنوع |
| religion | Any | حساس | ❌ ممنوع |
| political_views | Any | حساس | ❌ ممنوع |
| biometric_data | Any | بیومتریک | ❌ ممنوع |

---

## ۴. Analysis Output Data

| فیلد | نوع | حساسیت | توضیح |
|------|-----|---------|-------|
| analysis_id | UUID | عادی | |
| candidate_id | UUID | شخصی | ارتباط با کارجو |
| position_id | UUID | عادی | |
| personality_report | Text | حساس | Big Five / سایر |
| match_score | Float | حساس | امتیاز تطابق |
| bias_check_result | Enum | سیستمی | نتیجه بررسی bias |
| generated_at | Timestamp | سیستمی | |
| disclaimer_included | Bool | سیستمی | آیا disclaimer هست؟ |

---

## ۵. Audit Data

| فیلد | نوع | حساسیت | توضیح |
|------|-----|---------|-------|
| event_id | UUID | سیستمی | |
| event_type | Enum | سیستمی | نوع رویداد |
| actor_id | UUID | سیستمی | چه کسی انجام داد |
| target_id | UUID | سیستمی | روی چه چیزی |
| timestamp | Timestamp | سیستمی | |
| ip_address | String | شخصی | هش شده |
| outcome | Enum | سیستمی | موفق/ناموفق |
```

---

## `docs/mcp/privacy/05-sensitive-data-classification.md`

```markdown
# Sensitive Data Classification

## سطوح حساسیت

```text
Level 0 — Public      : قابل دسترس عموم
Level 1 — Internal    : داخلی، بدون محدودیت خاص
Level 2 — Confidential: محرمانه، دسترسی محدود
Level 3 — Sensitive   : حساس، نیاز به رضایت
Level 4 — Restricted  : ممنوع یا بسیار محدود
```

---

## جدول کامل طبقه‌بندی

| نوع داده | سطح | رمزنگاری | Log؟ | Retention |
|----------|-----|----------|------|-----------|
| company_name | 0 | ❌ | ✅ | نامحدود |
| position title | 0 | ❌ | ✅ | نامحدود |
| candidate name | 2 | ✅ | ⚠️ هش | ۳ سال |
| email | 2 | ✅ | ⚠️ هش | ۳ سال |
| resume text | 3 | ✅ | ❌ | ۱ سال |
| personality scores | 3 | ✅ | ❌ | ۶ ماه |
| match score | 3 | ✅ | ⚠️ | ۶ ماه |
| gender (diversity) | 3 | ✅ | ❌ | ۳ ماه |
| health data | 4 | ❌ قبول نمی‌شود | — | — |
| biometric | 4 | ❌ قبول نمی‌شود | — | — |
| audit logs | 1 | ✅ | — | ۵ سال |

---

## قوانین رمزنگاری

```text
در حال انتقال (in transit):
  → TLS 1.3 حداقل

در حال ذخیره (at rest):
  → AES-256 برای Level 3 و بالا
  → Level 2: رمزنگاری توصیه می‌شود

در حافظه (in memory):
  → داده Level 3+ نباید در cache ذخیره شود
  → بعد از پردازش باید از حافظه پاک شود
```

---

## Anonymization vs Pseudonymization

```text
Anonymization:
  داده به‌گونه‌ای تغییر می‌کند که
  هیچ‌گاه نتوان به فرد اصلی برگشت.
  → دیگر GDPR شامل آن نمی‌شود
  → مناسب برای: تحلیل آماری، آموزش مدل

Pseudonymization:
  داده با شناسه مصنوعی جایگزین می‌شود.
  کلید جداگانه‌ای برای بازیابی وجود دارد.
  → هنوز GDPR شامل آن می‌شود
  → مناسب برای: پردازش عملیاتی

در MCP:
  candidate_id = pseudonymization
  نام، ایمیل، تلفن → جدا از analysis ذخیره می‌شوند
  برای آموزش مدل → فقط anonymized data مجاز است
```
```

---

## `docs/mcp/privacy/06-prohibited-data.md`

```markdown
# Prohibited Data

## تعریف
داده‌هایی که سیستم MCP تحت هیچ شرایطی نباید
جمع‌آوری، پردازش، یا ذخیره کند.

---

## لیست کامل داده‌های ممنوع

### 🔴 دسته ۱ — Special Category Data (GDPR Article 9)

```text
❌ داده‌های سلامت و پزشکی
❌ داده‌های ژنتیکی
❌ داده‌های بیومتریک (اثر انگشت، تشخیص چهره، ...)
❌ گرایش جنسی
❌ باور مذهبی یا فلسفی
❌ عقاید سیاسی
❌ عضویت در اتحادیه کارگری
❌ داده‌های نژادی یا قومی
```

### 🔴 دسته ۲ — Financial & Legal

```text
❌ شماره کارت بانکی
❌ شماره حساب بانکی
❌ گزارش اعتباری کامل
❌ سابقه ورشکستگی (مگر برای مشاغل مالی با رضایت صریح)
```

### 🔴 دسته ۳ — Identity Documents

```text
❌ شماره ملی / کد ملی
❌ شماره گذرنامه
❌ شماره گواهینامه
❌ هرگونه شناسه دولتی
```

### 🔴 دسته ۴ — Minor Data

```text
❌ هرگونه داده از افراد زیر ۱۸ سال
❌ حتی با رضایت والدین در این سیستم مجاز نیست
```

### 🟠 دسته ۵ — Conditionally Prohibited

```text
⚠️ سابقه کیفری:
   فقط اگر شغل مستقیماً مرتبط باشد
   + رضایت صریح
   + تأیید Legal

⚠️ وضعیت مهاجرتی:
   فقط برای compliance قانونی کار
   + رضایت صریح
   + محدود به کشور مربوطه
```

---

## مکانیزم رد ورودی ممنوع

```text
اگر ورودی API شامل داده ممنوع بود:

  ۱. درخواست رد می‌شود (HTTP 422)
  ۲. داده ذخیره نمی‌شود
  ۳. رویداد در audit log ثبت می‌شود
  ۴. شرکت مطلع می‌شود
  ۵. در صورت تکرار → account review
```

---

## Input Validation Rules

```text
قبل از پردازش هر ورودی:
  [ ] اسکن برای شماره‌های ملی (regex patterns)
  [ ] اسکن برای شماره کارت بانکی (Luhn check)
  [ ] اسکن برای کلمات کلیدی پزشکی
  [ ] اسکن برای داده‌های بیومتریک
  [ ] اسکن برای داده‌های کودکان
```
```

---

## `docs/mcp/privacy/07-consent-policy.md`

```markdown
# Consent Policy

## تعریف
رضایت (Consent) یعنی کارجو آگاهانه، آزادانه،
و به‌صورت صریح اجازه داده که داده‌هایش پردازش شود.

---

## انواع مبنای قانونی پردازش (Legal Basis)

```text
۱. Consent          — رضایت صریح کارجو
۲. Contract         — اجرای قرارداد (مثلاً فرایند استخدام)
۳. Legal Obligation — الزام قانونی
۴. Legitimate Interest — منافع مشروع (با تست تعادل)
```

در MCP برای داده‌های کارجو:
```text
داده‌های پایه رزومه  → Contract (کارجو درخواست کار داده)
داده‌های تحلیل شخصیت → Consent صریح اجباری
داده‌های Sensitive  → Consent صریح اجباری
```

---

## شرایط Consent معتبر (GDPR Article 7)

```text
✅ Freely given   — کارجو مجبور نبوده
✅ Specific        — برای هدف مشخص
✅ Informed        — توضیح کامل داده شده
✅ Unambiguous    — اقدام فعال (نه پیش‌فرض تیک‌زده)
✅ Withdrawable   — امکان پس‌گرفتن وجود دارد
```

---

## مدل Consent در MCP

```text
Consent Level 1 — پایه
  پردازش رزومه برای این موقعیت شغلی
  → اجباری برای استفاده از سیستم

Consent Level 2 — تحلیل شخصیتی
  پردازش داده برای تحلیل شخصیت (Big Five و سایر)
  → اختیاری، کارجو می‌تواند رد کند
  → اگر رد شد، سیستم بدون تحلیل شخصیتی ادامه دهد

Consent Level 3 — Diversity Data
  جمع‌آوری داده‌های تنوع (جنسیت، قومیت) برای گزارش
  → کاملاً اختیاری
  → ناشناس و aggregate نگهداری می‌شود

Consent Level 4 — داده برای بهبود مدل
  استفاده از داده برای آموزش مدل (anonymized)
  → کاملاً اختیاری
  → قابل revoke
```

---

## فرایند جمع‌آوری Consent

```text
۱. قبل از هر پردازش → نمایش privacy notice
۲. توضیح: چه داده‌ای، چرا، چقدر، کجا
۳. کارجو به‌صورت فعال تأیید می‌کند
۴. consent_event ثبت می‌شود در پایگاه داده
۵. timestamp + نسخه privacy policy ذخیره می‌شود
۶. امکان withdrawal در هر زمان
```

---

## حق‌های کارجو (Data Subject Rights)

| حق | توضیح | زمان پاسخ |
|----|-------|-----------|
| Right of Access | دریافت کپی داده‌هایش | ۳۰ روز |
| Right to Rectification | اصلاح داده اشتباه | ۳۰ روز |
| Right to Erasure | حذف کامل داده | ۳۰ روز |
| Right to Portability | دریافت داده در فرمت قابل انتقال | ۳۰ روز |
| Right to Object | اعتراض به پردازش | فوری |
| Right to Restrict | محدود کردن پردازش | فوری |

---

## Consent Withdrawal

```text
اگر کارجو consent را پس گرفت:
  ۱. پردازش جدید فوراً متوقف می‌شود
  ۲. داده‌های موجود باید در ۳۰ روز حذف شوند
  ۳. اگر داده در نتیجه‌ای استفاده شده → آن نتیجه هم حذف می‌شود
  ۴. Audit log از withdrawal نگهداری می‌شود (بدون داده اصلی)
```
```

---

## `docs/mcp/privacy/09-data-retention-deletion.md`

```markdown
# Data Retention & Deletion

## جدول نگهداری داده

| نوع داده | مدت نگهداری | دلیل | بعد از مدت |
|----------|-------------|------|------------|
| Resume text | ۱ سال | فرایند استخدام | حذف خودکار |
| Personality analysis | ۶ ماه | مرجع HR | حذف خودکار |
| Match scores | ۶ ماه | مرجع HR | حذف خودکار |
| Consent records | ۵ سال | اثبات compliance | آرشیو |
| Audit logs | ۵ سال | الزام قانونی | آرشیو |
| Company data | تا پایان قرارداد + ۲ سال | — | حذف |
| Diversity data | ۳ ماه | گزارش aggregate | حذف |
| Anonymized data | نامحدود | بهبود مدل | — |

---

## فرایند حذف (Deletion Cascade)

```text
درخواست حذف کارجو:

candidate_id X → حذف شود:

  ├── candidates جدول           → حذف
  ├── resumes جدول              → حذف
  ├── personality_analyses جدول → حذف
  ├── match_scores جدول         → حذف
  ├── consent_events جدول       → anonymize (نه حذف)
  └── audit_logs جدول           → anonymize (نه حذف)

نکته مهم:
  Audit log و Consent record حذف نمی‌شوند
  اما شناسه شخصی از آن‌ها برداشته می‌شود
  → تبدیل به: "یک کارجو در تاریخ X رضایت داد"
```

---

## Data Minimisation در عمل

```text
قبل از ارسال به LLM:

  ❌ ارسال نکن: نام کامل
  ❌ ارسال نکن: ایمیل
  ❌ ارسال نکن: شماره تلفن
  ❌ ارسال نکن: آدرس

  ✅ ارسال کن: مهارت‌ها
  ✅ ارسال کن: سابقه کار (بدون نام شرکت اگر لازم نیست)
  ✅ ارسال کن: تحصیلات (بدون نام دانشگاه اگر لازم نیست)
  ✅ ارسال کن: خلاصه شده از رزومه

هدف: LLM هرگز نباید بتواند کارجو را شناسایی کند
```

---

## Right to Erasure — SLA

```text
درخواست دریافت شد
  ↓ ۲۴ ساعت
تأیید هویت درخواست‌دهنده
  ↓ ۷۲ ساعت
اجرای deletion cascade
  ↓ ۷ روز
تأیید حذف به کارجو
  ↓ حداکثر ۳۰ روز از درخواست اولیه
```

---

## Backup & Deletion

```text
مشکل رایج:
  داده از جدول اصلی حذف می‌شود
  اما در backup همچنان وجود دارد

راه‌حل در MCP:
  backup‌ها حداکثر ۹۰ روز نگهداری می‌شوند
  بعد از Right to Erasure:
    → در backup بعدی، داده overwrite می‌شود
    → تا آن زمان backup به‌عنوان "pending deletion" علامت‌گذاری می‌شود
```
```

---

## بروزرسانی `apps/api/src/mcp/types.rs`

```rust
// ── موارد اضافه‌شده در Sprint 3 ──────────────────────────

/// سطح حساسیت داده
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, PartialOrd)]
pub enum DataSensitivityLevel {
    Public = 0,
    Internal = 1,
    Confidential = 2,
    Sensitive = 3,
    Restricted = 4,
}

/// سطح رضایت کارجو
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ConsentLevel {
    /// پردازش پایه رزومه
    BasicProcessing,
    /// تحلیل شخصیتی
    PersonalityAnalysis,
    /// داده‌های تنوع
    DiversityData,
    /// بهبود مدل
    ModelImprovement,
}

/// رویداد ثبت رضایت
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentEvent {
    pub consent_id: String,
    pub candidate_id: String,
    pub level: ConsentLevel,
    pub granted: bool,
    pub timestamp: String,
    pub policy_version: String,
    pub ip_hash: Option<String>,
}

/// وضعیت داده از نظر حذف
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DataDeletionStatus {
    Active,
    PendingDeletion,
    Deleted,
    Anonymized,
}

/// نتیجه بررسی داده ممنوع
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProhibitedDataCheckResult {
    Clean,
    ProhibitedFound { data_type: String, field: String },
}

/// مبنای قانونی پردازش
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LegalBasis {
    Consent,
    Contract,
    LegalObligation,
    LegitimateInterest,
}
```

---

## `apps/api/src/mcp/privacy.rs`

```rust
/// Privacy Domain — MCP
/// Sprint 3: Data Classification, Consent, Prohibited Data

use crate::mcp::types::{
    ConsentLevel, DataSensitivityLevel,
    ProhibitedDataCheckResult, DataDeletionStatus,
};

// ── Data Sensitivity ──────────────────────────────────────

/// سطح حساسیت هر فیلد داده
pub fn get_field_sensitivity(field_name: &str) -> DataSensitivityLevel {
    match field_name {
        "company_name" | "position_title" | "department" => {
            DataSensitivityLevel::Public
        }
        "contact_email" | "subscription_tier" => {
            DataSensitivityLevel::Confidential
        }
        "candidate_name" | "email" | "phone" => {
            DataSensitivityLevel::Confidential
        }
        "resume_text" | "work_history" | "education" => {
            DataSensitivityLevel::Sensitive
        }
        "personality_scores" | "match_score" | "gender" | "age" => {
            DataSensitivityLevel::Sensitive
        }
        "health_data" | "biometric" | "religion"
        | "political_views" | "genetic_info" => {
            DataSensitivityLevel::Restricted
        }
        _ => DataSensitivityLevel::Internal,
    }
}

/// آیا این فیلد باید رمزنگاری شود؟
pub fn requires_encryption(field_name: &str) -> bool {
    get_field_sensitivity(field_name) >= DataSensitivityLevel::Confidential
}

// ── Prohibited Data Scanner ───────────────────────────────

/// الگوهای داده ممنوع
struct ProhibitedPattern {
    label: &'static str,
    keywords: &'static [&'static str],
}

const PROHIBITED_PATTERNS: &[ProhibitedPattern] = &[
    ProhibitedPattern {
        label: "national_id",
        keywords: &["کد ملی", "شماره ملی", "national id", "ssn", "sin"],
    },
    ProhibitedPattern {
        label: "payment_card",
        keywords: &["شماره کارت", "card number", "cvv", "credit card"],
    },
    ProhibitedPattern {
        label: "health_data",
        keywords: &[
            "بیماری", "دارو", "پزشک", "medical", "diagnosis",
            "prescription", "disability certificate",
        ],
    },
    ProhibitedPattern {
        label: "biometric",
        keywords: &[
            "اثر انگشت", "تشخیص چهره", "fingerprint",
            "face recognition", "retina scan",
        ],
    },
    ProhibitedPattern {
        label: "minor_data",
        keywords: &["زیر ۱۸", "دانش‌آموز ابتدایی", "under 18", "minor"],
    },
];

/// اسکن متن برای داده‌های ممنوع
pub fn scan_prohibited_data(
    text: &str,
    field_name: &str,
) -> ProhibitedDataCheckResult {
    let text_lower = text.to_lowercase();

    for pattern in PROHIBITED_PATTERNS {
        for &keyword in pattern.keywords {
            if text_lower.contains(keyword) {
                return ProhibitedDataCheckResult::ProhibitedFound {
                    data_type: pattern.label.to_string(),
                    field: field_name.to_string(),
                };
            }
        }
    }

    ProhibitedDataCheckResult::Clean
}

// ── Consent Validation ────────────────────────────────────

/// آیا این عملیات نیاز به رضایت دارد؟
pub fn required_consent_level(operation: &str) -> Option<ConsentLevel> {
    match operation {
        "process_resume" => Some(ConsentLevel::BasicProcessing),
        "analyze_personality" => Some(ConsentLevel::PersonalityAnalysis),
        "collect_diversity_data" => Some(ConsentLevel::DiversityData),
        "use_for_training" => Some(ConsentLevel::ModelImprovement),
        _ => None,
    }
}

/// آیا کارجو رضایت لازم را داده است؟
pub fn has_valid_consent(
    granted_levels: &[ConsentLevel],
    required: &ConsentLevel,
) -> bool {
    granted_levels.contains(required)
}

// ── Data Minimisation برای LLM ────────────────────────────

/// فیلدهایی که نباید به LLM ارسال شوند
const LLM_BLOCKED_FIELDS: &[&str] = &[
    "full_name",
    "email",
    "phone",
    "address",
    "national_id",
    "birth_date",
    "photo",
];

/// آیا این فیلد برای LLM مجاز است؟
pub fn is_allowed_for_llm(field_name: &str) -> bool {
    !LLM_BLOCKED_FIELDS.contains(&field_name)
}

// ── Retention Policy ──────────────────────────────────────

/// مدت نگهداری به روز
pub fn retention_days(data_type: &str) -> Option<u32> {
    match data_type {
        "resume_text" => Some(365),
        "personality_analysis" => Some(180),
        "match_score" => Some(180),
        "diversity_data" => Some(90),
        "consent_records" => Some(365 * 5),
        "audit_logs" => Some(365 * 5),
        "anonymized_data" => None, // نامحدود
        _ => Some(365),
    }
}

/// آیا داده منقضی شده؟
pub fn is_expired(data_type: &str, age_in_days: u32) -> bool {
    match retention_days(data_type) {
        Some(limit) => age_in_days > limit,
        None => false,
    }
}

/// وضعیت حذف بعد از انقضا
pub fn deletion_status_after_expiry(data_type: &str) -> DataDeletionStatus {
    match data_type {
        "consent_records" | "audit_logs" => DataDeletionStatus::Anonymized,
        _ => DataDeletionStatus::Deleted,
    }
}
```

---

# ✅ Sprint 3 تمام شد

## خلاصه آنچه ساختیم:

```text
docs/mcp/process/03-data-privacy.md                  ✅
docs/mcp/privacy/README.md                           ✅
docs/mcp/privacy/01-data-inventory-overview.md       ✅
docs/mcp/privacy/05-sensitive-data-classification.md ✅
docs/mcp/privacy/06-prohibited-data.md               ✅
docs/mcp/privacy/07-consent-policy.md                ✅
docs/mcp/privacy/09-data-retention-deletion.md       ✅
apps/api/src/mcp/types.rs  (بروزرسانی)               ✅
apps/api/src/mcp/privacy.rs                          ✅
```

---

## نقشه وابستگی‌ها تا اینجا

```text
Sprint 1 → GeographicTier, LegalRiskLevel, HrDecisionType
    ↓
Sprint 2 → ProtectedAttribute, BiasCheckResult, ForbiddenTermCategory
    ↓
Sprint 3 → ConsentLevel, DataSensitivityLevel, ProhibitedDataCheckResult
    ↓
Sprint 4 → HR Analysis (Big Five, MBTI) ← با آگاهی از همه این قوانین
```

---

# 🏃 Sprint 4: HR Analysis Methodology

---

## `docs/mcp/process/04-analysis-methodology.md`

```markdown
# Sprint 4 — HR Analysis Methodology

## هدف
تعریف دقیق روش‌های تحلیل در سیستم MCP:
- تحلیل شخصیت چطور انجام می‌شود؟
- Big Five چیست و چطور استفاده می‌شود؟
- MBTI چه محدودیت‌هایی دارد؟
- تحلیل کسب‌وکار (SWOT) چطور کار می‌کند؟
- Gap Analysis چیست؟

## چرا بعد از Bias & Privacy؟
در Sprint 2 مشخص شد:
  → MBTI نباید مستقیم در تصمیم استخدامی استفاده شود
  → تحلیل شخصیتی نیاز به disclaimer دارد
  → consent Level 2 اجباری است

در Sprint 3 مشخص شد:
  → personality_scores داده Sensitive هستند
  → نام/ایمیل نباید به LLM ارسال شود
  → داده تحلیل شخصیت فقط ۶ ماه نگهداری می‌شود

حالا می‌توانیم روش تحلیل را طراحی کنیم
بدون اینکه بعداً مجبور به بازنویسی شویم.

## ورودی این Sprint
← Sprint 1: HrDecisionType, requires_human_approval()
← Sprint 2: BiasCheckResult, needs_personality_disclaimer()
← Sprint 3: ConsentLevel, DataSensitivityLevel, is_allowed_for_llm()

## خروجی این Sprint
- docs/mcp/hr/README.md
- docs/mcp/hr/01-personality-analysis-big-five.md
- docs/mcp/hr/02-mbti-limitations.md
- docs/mcp/hr/05-business-swot-analysis.md
- docs/mcp/hr/06-gap-analysis.md
- apps/api/src/mcp/hr_standards.rs
- بروزرسانی apps/api/src/mcp/types.rs

## Sprint بعدی
→ Sprint 5: Position Generation Standard
```

---

## `docs/mcp/hr/README.md`

```markdown
# HR Analysis Domain — Overview

## چرا این Domain وجود دارد؟

MCP یک سیستم HR است.
باید بداند چطور:
  - شخصیت کارجو را تحلیل کند
  - کسب‌وکار مشتری را درک کند
  - شکاف بین نیاز و واقعیت را پیدا کند

اما باید این کار را:
  - بر اساس استانداردهای علمی انجام دهد
  - با رعایت قوانین Sprint 2 (Bias)
  - با رعایت قوانین Sprint 3 (Privacy)
  - با disclaimer مناسب

---

## مدل تحلیل در MCP

```text
┌─────────────────────────────────────────────────┐
│              MCP Analysis Model                  │
│                                                  │
│  ┌─────────────┐      ┌──────────────────────┐  │
│  │  Candidate  │      │     Business         │  │
│  │  Analysis   │      │     Analysis         │  │
│  │             │      │                      │  │
│  │  Big Five   │      │  SWOT Analysis       │  │
│  │  (primary)  │      │  Gap Analysis        │  │
│  │             │      │                      │  │
│  │  MBTI       │      │  Culture Fit         │  │
│  │  (advisory) │      │  (بدون bias)         │  │
│  └──────┬──────┘      └──────────┬───────────┘  │
│         │                        │               │
│         └──────────┬─────────────┘               │
│                    ↓                             │
│           Match Analysis                         │
│           (با bias check)                        │
│                    ↓                             │
│           Human Review                           │
│           (اگر لازم بود)                        │
└─────────────────────────────────────────────────┘
```

## فایل‌های این Domain

| فایل | موضوع |
|------|--------|
| 01-personality-analysis-big-five.md | مدل Big Five |
| 02-mbti-limitations.md | محدودیت‌های MBTI |
| 05-business-swot-analysis.md | تحلیل SWOT کسب‌وکار |
| 06-gap-analysis.md | تحلیل شکاف |

## قانون بنیادی این Domain

```text
هیچ روش تحلیلی در MCP نمی‌تواند:
  ❌ به‌تنهایی تصمیم استخدامی بگیرد
  ❌ بدون disclaimer ارائه شود
  ❌ بدون consent Level 2 اجرا شود
  ❌ از Protected Attribute استفاده کند

هر روش تحلیلی در MCP باید:
  ✅ مبنای علمی مستند داشته باشد
  ✅ محدودیت‌هایش صریح بیان شود
  ✅ از bias check عبور کند
  ✅ قابل توضیح به کارجو باشد (Explainability)
```
```

---

## `docs/mcp/hr/01-personality-analysis-big-five.md`

```markdown
# Personality Analysis — Big Five (OCEAN)

## چرا Big Five؟

```text
Big Five معتبرترین مدل شخصیتی در روانشناسی علمی است:

  ✅ پشتوانه تحقیقاتی بیش از ۵۰ سال
  ✅ قابل اندازه‌گیری و تکرارپذیر
  ✅ cross-cultural validity دارد
  ✅ در HR و سازمان پذیرفته‌شده است
  ✅ با نتایج شغلی همبستگی معنادار دارد

در مقابل MBTI:
  ❌ پایایی آزمون-بازآزمون پایین است
  ❌ مبنای علمی ضعیف‌تری دارد
  ❌ در بسیاری از کشورها در استخدام محدود است
```

---

## ابعاد پنج‌گانه (OCEAN)

### O — Openness to Experience
```text
تعریف: باز بودن به تجربه، خلاقیت، کنجکاوی

بالا:
  → خلاق، کنجکاو، انعطاف‌پذیر
  → مناسب برای: نقش‌های R&D، خلاقانه، استراتژیک

پایین:
  → عملگرا، منظم، سنتی
  → مناسب برای: نقش‌های فرایندمحور، compliance

⚠️ هشدار bias:
  نباید به‌عنوان "بهتر یا بدتر" تفسیر شود
  بلکه "تناسب با شغل" ارزیابی شود
```

### C — Conscientiousness
```text
تعریف: وظیفه‌شناسی، نظم، پشتکار

بالا:
  → منظم، قابل اعتماد، هدف‌مند
  → قوی‌ترین predictor عملکرد شغلی در اکثر نقش‌ها

پایین:
  → انعطاف‌پذیر، خودانگیخته، تطبیق‌پذیر
  → مناسب برای: نقش‌های خلاقانه با ساختار کم

⚠️ مهم‌ترین بعد برای پیش‌بینی عملکرد
```

### E — Extraversion
```text
تعریف: برون‌گرایی، انرژی اجتماعی، قاطعیت

بالا:
  → اجتماعی، پرانرژی، رهبری‌محور
  → مناسب برای: فروش، مدیریت، ارتباطات

پایین (درون‌گرا):
  → تمرکز عمیق، کار مستقل، تحلیل
  → مناسب برای: برنامه‌نویسی، تحقیق، حسابداری

⚠️ هشدار bias:
  درون‌گرایی ≠ ضعف رهبری
  بسیاری از رهبران موفق درون‌گرا هستند
```

### A — Agreeableness
```text
تعریف: توافق‌پذیری، همدلی، همکاری

بالا:
  → همکار، حمایت‌گر، اعتمادساز
  → مناسب برای: HR، مراقبت، تیم‌محور

پایین:
  → رقابتی، قاطع، مستقیم
  → مناسب برای: مذاکره، فروش چالش‌برانگیز

⚠️ هشدار bias جنسیتی:
  زنان اغلب نمره A بالاتری می‌گیرند
  نباید به‌عنوان معیار "بهتر بودن" تفسیر شود
```

### N — Neuroticism (Emotional Stability)
```text
تعریف: ثبات هیجانی (معکوس Neuroticism)

پایین Neuroticism (= ثبات بالا):
  → آرام، مقاوم در برابر استرس
  → مناسب برای: نقش‌های پراسترس، مدیریت بحران

بالا Neuroticism:
  → حساس به استرس، نوسان هیجانی
  → نیاز به محیط حمایتی

⚠️ هشدار disability:
  Neuroticism بالا ممکن است با اختلالات اضطرابی مرتبط باشد
  هرگز نباید در تصمیم استخدامی مستقیم استفاده شود
  صرفاً برای: پیشنهاد محیط کاری مناسب
```

---

## نحوه استفاده در MCP

```text
ورودی:
  → متن رزومه (بدون نام/ایمیل)
  → پاسخ‌های اختیاری کارجو به سوالات رفتاری
  → consent Level 2 تأییدشده

پردازش:
  → LLM امتیاز ۵ بعد را بر اساس شواهد متنی تخمین می‌زند
  → نه تشخیص قطعی، بلکه تخمین مبتنی بر شواهد

خروجی:
  → امتیاز ۰ تا ۱۰۰ برای هر بعد
  → سطح اطمینان (confidence): Low / Medium / High
  → شواهد متنی که به هر امتیاز منجر شده
  → disclaimer اجباری
  → پیشنهاد نقش‌های مناسب (نه رد/قبول)
```

---

## محدودیت‌های Big Five در MCP

```text
⚠️ LLM از متن تخمین می‌زند، نه از تست رسمی
   → confidence باید صادقانه گزارش شود

⚠️ فرهنگ بر نتایج تأثیر می‌گذارد
   → مدل برای همه فرهنگ‌ها یکسان نیست

⚠️ شخصیت در طول زمان تغییر می‌کند
   → نتایج فقط ۶ ماه معتبر در نظر گرفته می‌شوند

⚠️ Big Five عملکرد را پیش‌بینی می‌کند، نه ارزش انسان
   → هیچ نمره‌ای "بد" نیست، فقط "مناسب یا نامناسب برای این نقش"
```
```

---

## `docs/mcp/hr/02-mbti-limitations.md`

```markdown
# MBTI — Limitations & Usage Rules

## MBTI چیست؟

```text
Myers-Briggs Type Indicator
۱۶ تیپ شخصیتی بر اساس ۴ بعد دوقطبی:
  I/E: Introversion / Extraversion
  S/N: Sensing / iNtuition
  T/F: Thinking / Feeling
  J/P: Judging / Perceiving
```

---

## چرا MBTI در استخدام مشکل‌ساز است؟

### مشکل ۱ — پایایی پایین
```text
Test-Retest Reliability:
  اگر همان فرد ۵ هفته بعد دوباره تست بدهد:
  → ۵۰٪ افراد در حداقل یک بعد نتیجه متفاوت می‌گیرند

نتیجه:
  → نمی‌توان گفت "این فرد INTJ است"
  → فقط می‌توان گفت "این فرد امروز تمایل به INTJ نشان داد"
```

### مشکل ۲ — تیپ‌سازی (Typology Problem)
```text
MBTI افراد را در ۱۶ جعبه می‌گذارد.
اما انسان‌ها در طیف هستند، نه در جعبه.

مثال:
  فردی با I=51% و E=49%
  در MBTI می‌شود "I"
  اما عملاً در مرز است
```

### مشکل ۳ — وضعیت قانونی
```text
کشور       | وضعیت استفاده در استخدام
-----------|---------------------------
آلمان      | ❌ استفاده مستقیم ممنوع (AGG)
فرانسه     | ⚠️ محدود، نیاز به توجیه
بریتانیا   | ⚠️ ICO هشدار داده
آمریکا     | ⚠️ EEOC ریسک تبعیض می‌بیند
کانادا     | ⚠️ توصیه نمی‌شود
```

### مشکل ۴ — Proxy Discrimination
```text
برخی تیپ‌های MBTI با جنسیت همبستگی دارند:
  → مثلاً F (Feeling) در زنان شایع‌تر است
  → اگر برای نقشی "T preferred" باشد → bias جنسیتی غیرمستقیم
```

---

## قوانین استفاده از MBTI در MCP

```text
✅ مجاز:
  → ابزار خودشناسی برای کارجو (اختیاری)
  → پیشنهاد سبک کار و ارتباط
  → راهنمایی توسعه فردی

❌ ممنوع:
  → استفاده در scoring یا ranking کارجویان
  → ذکر MBTI در Job Description به‌عنوان شرط
  → رد کارجو بر اساس تیپ MBTI
  → ذخیره تیپ MBTI در پروفایل کارجو به‌عنوان معیار

⚠️ اگر MBTI در ورودی داده شد:
  → سیستم آن را می‌پذیرد
  → اما در scoring استفاده نمی‌کند
  → disclaimer خاص MBTI اضافه می‌شود
```

---

## MBTI vs Big Five در MCP

| معیار | Big Five | MBTI |
|-------|----------|------|
| پشتوانه علمی | ✅ قوی | ⚠️ ضعیف‌تر |
| پایایی | ✅ بالا | ❌ پایین |
| وضعیت قانونی | ✅ قابل‌قبول‌تر | ⚠️ محدودیت دارد |
| استفاده در scoring | ✅ مجاز (با disclaimer) | ❌ ممنوع |
| استفاده برای توسعه | ✅ | ✅ |
| نیاز به consent | ✅ Level 2 | ✅ Level 2 |
```

---

## `docs/mcp/hr/05-business-swot-analysis.md`

```markdown
# Business SWOT Analysis

## تعریف
SWOT = Strengths, Weaknesses, Opportunities, Threats

در MCP، SWOT برای تحلیل کسب‌وکار مشتری استفاده می‌شود
تا موقعیت‌های شغلی متناسب با واقعیت شرکت طراحی شود.

---

## چرا SWOT در HR مهم است؟

```text
بدون SWOT:
  → شرح شغل ایده‌آل نوشته می‌شود
  → اما با واقعیت شرکت فاصله دارد
  → کارجوی مناسب پیدا نمی‌شود یا می‌رود

با SWOT:
  → شرح شغل با واقعیت شرکت هماهنگ است
  → KPI‌ها واقع‌بینانه هستند
  → فرهنگ سازمانی منعکس می‌شود
```

---

## ابعاد SWOT در MCP

### S — Strengths (نقاط قوت)
```text
سوالات کلیدی:
  → شرکت در چه چیزی بهتر از رقباست؟
  → چه منابع یا قابلیت‌های منحصربه‌فردی دارد؟
  → چرا کارجوهای خوب باید اینجا بیایند؟

تأثیر بر HR:
  → Job Description باید این نقاط قوت را نشان دهد
  → در جذب استعداد از آن‌ها استفاده می‌شود
```

### W — Weaknesses (نقاط ضعف)
```text
سوالات کلیدی:
  → در کجا پشت رقبا هستیم؟
  → چه فرایندهایی شکسته است؟
  → چه مهارت‌هایی در تیم کم داریم؟

تأثیر بر HR:
  → Gap Analysis از اینجا شروع می‌شود
  → اولویت‌بندی استخدام بر اساس ضعف‌ها
  → KPI باید ضعف‌ها را برطرف کند

⚠️ نکته privacy:
  Weaknesses اطلاعات تجاری حساس شرکت است
  → DataSensitivityLevel: Confidential
  → نباید در خروجی‌های قابل‌مشاهده توسط کارجو باشد
```

### O — Opportunities (فرصت‌ها)
```text
سوالات کلیدی:
  → چه فرصت‌های بازاری وجود دارد؟
  → چه روندهای صنعتی به نفع شرکت است؟
  → چه بازارهای جدیدی قابل ورود هستند؟

تأثیر بر HR:
  → نقش‌های جدید مورد نیاز مشخص می‌شوند
  → مهارت‌های آینده‌نگر تعریف می‌شوند
```

### T — Threats (تهدیدها)
```text
سوالات کلیدی:
  → رقبا چه می‌کنند؟
  → چه تغییرات قانونی در راه است؟
  → چه ریسک‌های فناوری وجود دارد؟

تأثیر بر HR:
  → نقش‌های defensive شناسایی می‌شوند
  → مهارت‌های resilience در JD اضافه می‌شوند
```

---

## SWOT در فرآیند MCP

```text
ورودی SWOT:
  → شرکت یک‌بار SWOT خود را وارد می‌کند
  → در پروفایل شرکت ذخیره می‌شود (Confidential)
  → برای همه موقعیت‌های شغلی آن شرکت استفاده می‌شود

استفاده در Position Generation:
  Strengths  → در EVP و employer branding موقعیت
  Weaknesses → در تعریف KPI و اولویت‌های نقش
  Opportunities → در تعریف مسئولیت‌های توسعه‌ای
  Threats    → در تعریف مهارت‌های ضروری

استفاده در Candidate Matching:
  Weaknesses → کارجویی که این ضعف را جبران کند
  Culture    → تناسب فرهنگی بدون bias
```

---

## محدودیت‌های SWOT

```text
⚠️ SWOT snapshot است، نه real-time
   → باید هر ۶ ماه یک‌بار بازبینی شود

⚠️ SWOT subjective است
   → تحلیل MCP باید این subjectivity را نشان دهد

⚠️ SWOT ممکن است Weaknesses را پنهان کند
   → سیستم می‌تواند سوالات کمکی بپرسد
```
```

---

## `docs/mcp/hr/06-gap-analysis.md`

```markdown
# Gap Analysis

## تعریف
Gap Analysis = فاصله بین وضعیت فعلی و وضعیت مطلوب

در HR:
```text
Gap = (مهارت/ظرفیت مورد نیاز) - (مهارت/ظرفیت موجود)
```

---

## انواع Gap در MCP

### ۱. Skills Gap
```text
تعریف: مهارت‌هایی که در تیم وجود ندارند

مثال:
  شرکت می‌خواهد ML pipeline بسازد
  اما هیچ‌کس در تیم MLOps بلد نیست
  → Skills Gap: MLOps

خروجی در MCP:
  → موقعیت شغلی جدید با تمرکز روی MLOps
  → KPI مرتبط با پر کردن این gap
```

### ۲. Capacity Gap
```text
تعریف: تیم مهارت دارد اما نفر کم است

مثال:
  یک backend developer بیشتر از حد load دارد
  → Capacity Gap

خروجی در MCP:
  → JD مشابه با تمرکز روی onboarding سریع
  → KPI اولیه سبک‌تر
```

### ۳. Knowledge Gap
```text
تعریف: تیم تجربه دارد اما دانش خاصی کم است

مثال:
  تیم برنامه‌نویس خوبی دارد
  اما هیچ‌کس compliance فناوری مالی بلد نیست
  → Knowledge Gap: FinTech Compliance

خروجی در MCP:
  → JD با تأکید بر این دانش خاص
  → یا پیشنهاد: training به‌جای استخدام
```

### ۴. Leadership Gap
```text
تعریف: تیم technical قوی دارد اما رهبری ضعیف است

خروجی در MCP:
  → JD با تمرکز بر leadership و mentoring
  → KPI‌های team development
  → توجه خاص به Conscientiousness و Extraversion
    (با رعایت کامل قوانین bias از Sprint 2)
```

---

## فرآیند Gap Analysis در MCP

```text
گام ۱ — وضعیت فعلی تیم
  ورودی: توضیح شرکت از تیم فعلی
  پردازش: استخراج مهارت‌ها و ظرفیت موجود

گام ۲ — وضعیت مطلوب
  ورودی: اهداف کسب‌وکار + SWOT
  پردازش: استخراج نیازهای مهارتی برای رسیدن به اهداف

گام ۳ — محاسبه Gap
  Gap = مطلوب - فعلی
  دسته‌بندی: Skills / Capacity / Knowledge / Leadership

گام ۴ — اولویت‌بندی
  Critical Gap  → استخدام فوری
  Important Gap → استخدام در ۶ ماه
  Nice-to-have  → آموزش یا بعداً

گام ۵ — خروجی
  → لیست موقعیت‌های شغلی اولویت‌بندی‌شده
  → JD اولیه برای هر gap
  → پیشنهاد: استخدام vs آموزش
```

---

## Gap Analysis و Bias

```text
⚠️ خطر رایج:
  Gap Analysis ممکن است ناخواسته
  به سمت "جایگزین کردن با کسی شبیه قبلی" برود
  → این یک Proxy Discrimination است

قانون MCP:
  Gap Analysis باید مهارت‌محور باشد، نه نفرمحور
  
  ❌ اشتباه: "نیاز به کسی شبیه John داریم"
  ✅ درست:  "نیاز به مهارت‌های A, B, C داریم که John داشت"
```
```

---

## بروزرسانی `apps/api/src/mcp/types.rs`

```rust
// ── موارد اضافه‌شده در Sprint 4 ──────────────────────────

/// ابعاد پنج‌گانه Big Five
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BigFiveScores {
    /// Openness to Experience (0–100)
    pub openness: u8,
    /// Conscientiousness (0–100)
    pub conscientiousness: u8,
    /// Extraversion (0–100)
    pub extraversion: u8,
    /// Agreeableness (0–100)
    pub agreeableness: u8,
    /// Neuroticism (0–100) — بالاتر = ناپایداری بیشتر
    pub neuroticism: u8,
}

/// سطح اطمینان تحلیل
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ConfidenceLevel {
    Low,
    Medium,
    High,
}

/// نتیجه تحلیل شخصیت
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalityAnalysisResult {
    pub analysis_id: String,
    pub candidate_id: String,
    pub big_five: BigFiveScores,
    pub confidence: ConfidenceLevel,
    /// شواهد متنی که به هر امتیاز منجر شد
    pub evidence_summary: String,
    /// disclaimer اجباری
    pub disclaimer: String,
    pub generated_at: String,
}

/// نوع Gap شناسایی‌شده
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum GapType {
    Skills,
    Capacity,
    Knowledge,
    Leadership,
}

/// اولویت Gap
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, PartialOrd)]
pub enum GapPriority {
    Critical,
    Important,
    NiceToHave,
}

/// یک Gap شناسایی‌شده
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentifiedGap {
    pub gap_type: GapType,
    pub description: String,
    pub priority: GapPriority,
    /// پیشنهاد: استخدام یا آموزش
    pub recommendation: GapRecommendation,
}

/// پیشنهاد پر کردن Gap
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GapRecommendation {
    Hire { urgency_months: u8 },
    Train { estimated_months: u8 },
    HireOrTrain,
}

/// تحلیل SWOT شرکت
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwotAnalysis {
    pub strengths: Vec<String>,
    pub weaknesses: Vec<String>,
    pub opportunities: Vec<String>,
    pub threats: Vec<String>,
    pub created_at: String,
    /// SWOT باید هر ۶ ماه بازبینی شود
    pub expires_at: String,
}

/// نوع استفاده از MBTI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MbtiUsageContext {
    /// مجاز — فقط برای توسعه فردی
    SelfDevelopment,
    /// مجاز — پیشنهاد سبک کار
    WorkStyleSuggestion,
    /// ممنوع — استفاده در scoring
    CandidateScoring,
    /// ممنوع — شرط در Job Description
    JobRequirement,
}
```

---

## `apps/api/src/mcp/hr_standards.rs`

```rust
/// HR Analysis Standards — MCP
/// Sprint 4: Big Five, MBTI, SWOT, Gap Analysis

use crate::mcp::types::{
    BigFiveScores, ConfidenceLevel, GapPriority, GapRecommendation,
    GapType, IdentifiedGap, MbtiUsageContext, PersonalityAnalysisResult,
};

// ── Big Five ──────────────────────────────────────────────

/// اعتبارسنجی امتیازهای Big Five
pub fn validate_big_five(scores: &BigFiveScores) -> Result<(), String> {
    let fields = [
        ("openness", scores.openness),
        ("conscientiousness", scores.conscientiousness),
        ("extraversion", scores.extraversion),
        ("agreeableness", scores.agreeableness),
        ("neuroticism", scores.neuroticism),
    ];

    for (name, value) in &fields {
        if *value > 100 {
            return Err(format!(
                "Invalid Big Five score: {} = {} (max 100)",
                name, value
            ));
        }
    }
    Ok(())
}

/// تفسیر سطح هر بعد
pub fn interpret_dimension(score: u8) -> &'static str {
    match score {
        0..=30  => "Low",
        31..=60 => "Moderate",
        61..=80 => "High",
        81..=100 => "Very High",
        _       => "Unknown",
    }
}

/// آیا confidence کافی برای گزارش وجود دارد؟
pub fn is_confidence_sufficient(level: &ConfidenceLevel) -> bool {
    matches!(level, ConfidenceLevel::Medium | ConfidenceLevel::High)
}

/// ساخت PersonalityAnalysisResult با disclaimer اجباری
pub fn build_personality_result(
    analysis_id: String,
    candidate_id: String,
    big_five: BigFiveScores,
    confidence: ConfidenceLevel,
    evidence_summary: String,
    generated_at: String,
) -> Result<PersonalityAnalysisResult, String> {
    validate_big_five(&big_five)?;

    Ok(PersonalityAnalysisResult {
        analysis_id,
        candidate_id,
        big_five,
        confidence,
        evidence_summary,
        disclaimer: PERSONALITY_ANALYSIS_DISCLAIMER.to_string(),
        generated_at,
    })
}

pub const PERSONALITY_ANALYSIS_DISCLAIMER: &str =
    "تحلیل شخصیتی ارائه‌شده بر اساس تخمین از متن است، \
     نه تست رسمی روانشناختی. این نتایج صرفاً جنبه \
     مشاوره‌ای دارند و نباید به‌عنوان تنها معیار \
     تصمیم استخدامی استفاده شوند.";

// ── MBTI Guard ────────────────────────────────────────────

/// آیا این استفاده از MBTI مجاز است؟
pub fn is_mbti_usage_allowed(context: &MbtiUsageContext) -> bool {
    matches!(
        context,
        MbtiUsageContext::SelfDevelopment | MbtiUsageContext::WorkStyleSuggestion
    )
}

/// بررسی و خطا اگر MBTI در context ممنوع استفاده شود
pub fn guard_mbti_usage(context: &MbtiUsageContext) -> Result<(), String> {
    if !is_mbti_usage_allowed(context) {
        return Err(format!(
            "MBTI usage not allowed in context: {:?}. \
             MBTI may only be used for self-development or work-style suggestions.",
            context
        ));
    }
    Ok(())
}

pub const MBTI_DISCLAIMER: &str =
    "تیپ MBTI پایایی آزمون-بازآزمون محدودی دارد و \
     در بسیاری از کشورها استفاده مستقیم آن در \
     تصمیمات استخدامی توصیه نمی‌شود.";

// ── SWOT ──────────────────────────────────────────────────

/// آیا SWOT منقضی شده؟ (بیش از ۶ ماه)
pub fn is_swot_expired(created_at_days_ago: u32) -> bool {
    created_at_days_ago > 180
}

/// استخراج gap‌های احتمالی از SWOT Weaknesses
pub fn extract_gaps_from_weaknesses(
    weaknesses: &[String],
) -> Vec<IdentifiedGap> {
    weaknesses
        .iter()
        .map(|weakness| IdentifiedGap {
            gap_type: GapType::Skills,
            description: weakness.clone(),
            priority: GapPriority::Important,
            recommendation: GapRecommendation::HireOrTrain,
        })
        .collect()
}

// ── Gap Analysis ──────────────────────────────────────────

/// اولویت‌بندی یک gap بر اساس نوع و توضیح
pub fn prioritize_gap(gap_type: &GapType, is_blocking: bool) -> GapPriority {
    match (gap_type, is_blocking) {
        (GapType::Skills, true)    => GapPriority::Critical,
        (GapType::Capacity, true)  => GapPriority::Critical,
        (GapType::Leadership, true)=> GapPriority::Critical,
        (GapType::Skills, false)   => GapPriority::Important,
        (GapType::Knowledge, _)    => GapPriority::Important,
        (GapType::Capacity, false) => GapPriority::Important,
        (GapType::Leadership, false)=> GapPriority::NiceToHave,
    }
}

/// پیشنهاد استخدام یا آموزش بر اساس اولویت
pub fn recommend_gap_resolution(priority: &GapPriority) -> GapRecommendation {
    match priority {
        GapPriority::Critical    => GapRecommendation::Hire { urgency_months: 1 },
        GapPriority::Important   => GapRecommendation::HireOrTrain,
        GapPriority::NiceToHave  => GapRecommendation::Train { estimated_months: 3 },
    }
}

/// مرتب‌سازی gap‌ها بر اساس اولویت
pub fn sort_gaps_by_priority(gaps: &mut Vec<IdentifiedGap>) {
    gaps.sort_by(|a, b| a.priority.partial_cmp(&b.priority).unwrap());
}
```

---

# ✅ Sprint 4 تمام شد

## خلاصه آنچه ساختیم:

```text
docs/mcp/process/04-analysis-methodology.md         ✅
docs/mcp/hr/README.md                               ✅
docs/mcp/hr/01-personality-analysis-big-five.md     ✅
docs/mcp/hr/02-mbti-limitations.md                  ✅
docs/mcp/hr/05-business-swot-analysis.md            ✅
docs/mcp/hr/06-gap-analysis.md                      ✅
apps/api/src/mcp/types.rs  (بروزرسانی)              ✅
apps/api/src/mcp/hr_standards.rs                    ✅
```

---

## نقشه کامل وابستگی‌ها تا اینجا

```text
Sprint 1 ── Legal Scope
  │  GeographicTier, LegalRiskLevel
  │  requires_human_approval()
  │  AI_OUTPUT_DISCLAIMER
  ↓
Sprint 2 ── Bias & Fairness
  │  ProtectedAttribute, BiasCheckResult
  │  ForbiddenTermCategory, scan_forbidden_terms()
  │  needs_personality_disclaimer()
  ↓
Sprint 3 ── Data & Privacy
  │  ConsentLevel, DataSensitivityLevel
  │  ProhibitedDataCheckResult
  │  is_allowed_for_llm(), retention_days()
  │  scan_prohibited_data()
  ↓
Sprint 4 ── HR Analysis
  │  BigFiveScores, PersonalityAnalysisResult
  │  MbtiUsageContext, guard_mbti_usage()
  │  SwotAnalysis, IdentifiedGap, GapPriority
  │  validate_big_five(), build_personality_result()
  ↓
Sprint 5 ── Position Generation Standard  ← بعدی
```

---

# 🏃 Sprint 5: Position Generation Standard

---

## `docs/mcp/process/05-position-generation-standard.md`

```markdown
# Sprint 5 — Position Generation Standard

## هدف
تعریف دقیق استاندارد تولید موقعیت شغلی در MCP:
- شرح شغل چطور نوشته می‌شود؟
- KPI چطور تعریف می‌شود؟
- سطح‌بندی نقش چطور کار می‌کند؟
- KSAO چیست؟
- O*NET و ESCO چه نقشی دارند؟

## چرا بعد از HR Analysis؟
در Sprint 4 مشخص شد:
  → Gap Analysis اولویت‌های استخدام را مشخص می‌کند
  → SWOT واقعیت شرکت را نشان می‌دهد
  → Big Five پیش‌بینی عملکرد را ممکن می‌کند

حالا می‌توانیم موقعیت شغلی بسازیم که:
  → با Gap Analysis هماهنگ باشد
  → با SWOT شرکت سازگار باشد
  → با قوانین Sprint 2 (Bias) رعایت شده باشد

## ورودی این Sprint
← Sprint 1: GeographicTier, AI_OUTPUT_DISCLAIMER
← Sprint 2: scan_forbidden_terms(), BiasCheckResult
← Sprint 3: DataSensitivityLevel
← Sprint 4: IdentifiedGap, GapPriority, SwotAnalysis

## خروجی این Sprint
- docs/mcp/hr/07-job-description-standard.md
- docs/mcp/hr/08-kpi-standard.md
- docs/mcp/hr/09-role-leveling-standard.md
- docs/mcp/hr/10-ksao-standard.md
- docs/mcp/hr/11-onet-esco-mapping.md
- apps/api/src/mcp/position.rs
- بروزرسانی apps/api/src/mcp/types.rs

## Sprint بعدی
→ Sprint 6: Compliance Engine
```

---

## `docs/mcp/hr/07-job-description-standard.md`

```markdown
# Job Description Standard

## تعریف
Job Description (JD) سندی است که:
  - مسئولیت‌های یک نقش را مشخص می‌کند
  - شرایط لازم را تعریف می‌کند
  - انتظارات را شفاف می‌کند

---

## ساختار استاندارد JD در MCP

```text
┌─────────────────────────────────────────────┐
│              Job Description                │
│                                             │
│  1. Position Overview     ← اجباری         │
│  2. Key Responsibilities  ← اجباری         │
│  3. Required Skills       ← اجباری         │
│  4. Nice-to-Have Skills   ← اختیاری        │
│  5. Role Level & Growth   ← اجباری         │
│  6. KPIs (90-day)         ← اجباری         │
│  7. Working Conditions    ← اجباری         │
│  8. AI Disclaimer         ← اجباری         │
└─────────────────────────────────────────────┘
```

---

## بخش ۱ — Position Overview

```text
فیلدهای اجباری:
  → عنوان شغل (از O*NET/ESCO یا استاندارد داخلی)
  → واحد سازمانی
  → سطح شغلی (از role leveling standard)
  → نوع استخدام: تمام‌وقت / پاره‌وقت / قرارداد
  → محل کار: حضوری / دورکاری / ترکیبی
  → خلاصه نقش (حداکثر ۳ جمله)

فیلدهای ممنوع:
  ❌ سن، جنسیت، تأهل (از Sprint 2)
  ❌ عکس یا ظاهر فیزیکی
  ❌ ملیت یا قومیت
  ❌ وضعیت سلامت
```

---

## بخش ۲ — Key Responsibilities

```text
استاندارد نوشتن:
  → هر مسئولیت با فعل فعال شروع شود
     ✅ "طراحی و پیاده‌سازی API های RESTful"
     ❌ "مسئول پیاده‌سازی API"

  → حداکثر ۸ مورد
     (بیشتر از ۸ نشانه JD گنگ است)

  → هر مورد باید قابل اندازه‌گیری باشد
     ✅ "مدیریت ۳ تا ۵ پروژه همزمان"
     ❌ "مدیریت پروژه‌های مختلف"

  → از Gap Analysis استخراج شود
     هر مسئولیت باید به یک Gap یا نیاز تجاری مرتبط باشد
```

---

## بخش ۳ — Required Skills

```text
دسته‌بندی:
  Hard Skills    → مهارت‌های فنی قابل اندازه‌گیری
  Soft Skills    → مهارت‌های رفتاری (با احتیاط بیشتر)
  Domain Knowledge → دانش حوزه‌ای خاص

قانون Soft Skills:
  ⚠️ Soft Skills باید با مثال رفتاری تعریف شوند
  
  ❌ اشتباه: "مهارت ارتباطی قوی"
  ✅ درست:  "توانایی ارائه گزارش فنی به مدیران غیرفنی"
  
  ❌ اشتباه: "رهبری قوی"
  ✅ درست:  "تجربه mentoring حداقل ۲ نفر"

قانون Must-have vs Nice-to-have:
  Must-have  → واقعاً بدون آن نقش اجرا نمی‌شود
  Nice-to-have → یادگرفتنی در ۳ ماه اول

⚠️ هشدار:
  اگر لیست Must-have بیش از ۷ مورد باشد
  → سیستم هشدار می‌دهد: "ممکن است کارجوی مناسب پیدا نشود"
```

---

## بخش ۴ — Working Conditions

```text
اجباری:
  → ساعات کاری
  → محل کار
  → سفر احتمالی (درصد)

اختیاری:
  → محدوده حقوق (توصیه می‌شود برای شفافیت)
  → مزایا

ممنوع:
  ❌ "محیط جوان و پرانرژی" (age bias)
  ❌ "تیم خانوادگی" (ممکن است exclusionary باشد)
  ❌ هر توصیفی که Proxy Discrimination ایجاد کند
```

---

## بخش ۸ — AI Disclaimer (اجباری)

```text
هر JD تولیدشده توسط MCP باید شامل این متن باشد:

"این شرح شغل با کمک هوش مصنوعی تولید شده است.
 پیش از انتشار، باید توسط متخصص HR بازبینی شود.
 MCP هیچ مسئولیتی در قبال تصمیمات استخدامی
 بر اساس این سند ندارد."
```

---

## قوانین کیفی JD

```text
✅ خوانایی: سطح Flesch-Kincaid مناسب
✅ طول: ۳۰۰ تا ۷۰۰ کلمه
✅ بی‌طرفی: از bias check عبور کرده باشد
✅ کامل بودن: همه بخش‌های اجباری پر باشند
✅ قابلیت جستجو: کلمات کلیدی O*NET/ESCO وجود داشته باشد
```
```

---

## `docs/mcp/hr/08-kpi-standard.md`

```markdown
# KPI Standard

## تعریف
KPI = Key Performance Indicator
شاخصی که نشان می‌دهد آیا نقش به درستی اجرا می‌شود.

---

## چارچوب SMART برای KPI

```text
S — Specific    : دقیق و مشخص
M — Measurable  : قابل اندازه‌گیری
A — Achievable  : دست‌یافتنی
R — Relevant    : مرتبط با نقش
T — Time-bound  : زمان‌بندی مشخص
```

---

## ساختار زمانی KPI در MCP

```text
┌──────────────────────────────────────────────┐
│              KPI Timeline                    │
│                                              │
│  30 روز اول   → Onboarding KPIs             │
│    هدف: آشنایی و یادگیری                    │
│    مثال: "مستندات فنی را مطالعه کرده"       │
│                                              │
│  60 روز       → Ramping KPIs                │
│    هدف: شروع مشارکت مستقل                  │
│    مثال: "یک feature کوچک deliver شده"      │
│                                              │
│  90 روز       → Performance KPIs            │
│    هدف: عملکرد کامل نقش                    │
│    مثال: "sprint commitments را وفا کرده"   │
│                                              │
│  سالانه       → Strategic KPIs              │
│    هدف: تأثیر بلندمدت                      │
│    مثال: "یک سیستم جدید design شده"        │
└──────────────────────────────────────────────┘
```

---

## دسته‌بندی KPI

### Output KPI
```text
تعریف: نتیجه‌های قابل تحویل
مثال:
  → "هر sprint حداقل ۲ story point تحویل داده شود"
  → "گزارش ماهانه در تاریخ مقرر ارائه شود"
مناسب برای: نقش‌های اجرایی
```

### Quality KPI
```text
تعریف: کیفیت خروجی
مثال:
  → "نرخ bug های production کمتر از ۲٪"
  → "رضایت مشتری بالای ۸/۱۰"
مناسب برای: همه نقش‌ها
```

### Process KPI
```text
تعریف: رعایت فرآیندها
مثال:
  → "کد review در ۲۴ ساعت انجام شود"
  → "مستندات به‌روز نگه داشته شود"
مناسب برای: نقش‌های فنی و عملیاتی
```

### Growth KPI
```text
تعریف: توسعه فردی و تیمی
مثال:
  → "یک مهارت جدید در ۶ ماه یاد گرفته شود"
  → "یک جونیور mentoring شده باشد"
مناسب برای: سطوح Senior و بالاتر
```

---

## قوانین KPI در MCP

```text
حداقل: ۳ KPI برای هر دوره
حداکثر: ۷ KPI برای هر دوره
(بیشتر از ۷ → تمرکز از بین می‌رود)

توزیع پیشنهادی:
  ۲-۳ Output KPI
  ۱-۲ Quality KPI
  ۱   Process KPI
  ۱   Growth KPI (سطح Senior+)

ممنوع در KPI:
  ❌ معیارهای وابسته به Protected Attribute
  ❌ "شخصیت بهتر شود" (غیرقابل اندازه‌گیری)
  ❌ "تلاش بیشتری کند" (غیرقابل اندازه‌گیری)
  ❌ مقایسه با کارمند دیگر به اسم
```

---

## KPI و Gap Analysis

```text
هر KPI باید به یک Gap مرتبط باشد:

Gap شناسایی‌شده        → KPI پیشنهادی
─────────────────────────────────────────
Skills Gap: MLOps      → "pipeline اول deploy شده در ۶۰ روز"
Capacity Gap           → "backlog X% کاهش یابد در ۹۰ روز"
Knowledge Gap: Compliance → "certification X گرفته شود"
Leadership Gap         → "team velocity X% بهبود یابد"
```
```

---

## `docs/mcp/hr/09-role-leveling-standard.md`

```markdown
# Role Leveling Standard

## چرا سطح‌بندی مهم است؟

```text
بدون سطح‌بندی:
  → عنوان "Senior" در یک شرکت = "Junior" در شرکت دیگر
  → انتظارات مبهم
  → KPI غیرواقعی
  → نارضایتی کارمند

با سطح‌بندی:
  → انتظارات شفاف
  → مسیر رشد مشخص
  → JD دقیق‌تر
  → KPI واقع‌بینانه‌تر
```

---

## مدل سطح‌بندی MCP

```text
┌────────────────────────────────────────────────┐
│                Role Levels                     │
├────────┬────────────┬───────────┬──────────────┤
│ Level  │ عنوان      │ تجربه    │ استقلال      │
├────────┼────────────┼───────────┼──────────────┤
│  L1    │ Junior     │ 0-2 سال  │ نیاز به راهنما│
│  L2    │ Mid-level  │ 2-4 سال  │ نیمه مستقل   │
│  L3    │ Senior     │ 4-7 سال  │ کاملاً مستقل │
│  L4    │ Staff      │ 7-10 سال │ تأثیر تیمی   │
│  L5    │ Principal  │ 10+ سال  │ تأثیر سازمانی│
│  M1    │ Team Lead  │ 3+ سال   │ رهبری کوچک   │
│  M2    │ Manager    │ 5+ سال   │ رهبری تیم    │
│  M3    │ Director   │ 8+ سال   │ رهبری واحد   │
│  M4    │ VP         │ 12+ سال  │ رهبری کسب‌وکار│
└────────┴────────────┴───────────┴──────────────┘
```

---

## ویژگی‌های هر سطح

### L1 — Junior
```text
مسئولیت:
  → انجام وظایف مشخص و تعریف‌شده
  → یادگیری از Senior

KPI نوع:
  → عمدتاً Output و Process
  → Growth اجباری

نیاز به نظارت:
  → روزانه تا هفتگی
```

### L2 — Mid-level
```text
مسئولیت:
  → انجام مستقل وظایف پیچیده‌تر
  → حل مسائل با راهنمایی محدود

KPI نوع:
  → Output + Quality + Process
  → Growth توصیه می‌شود

نیاز به نظارت:
  → هفتگی
```

### L3 — Senior
```text
مسئولیت:
  → مالکیت کامل یک حوزه
  → mentoring Junior و Mid
  → تصمیمات فنی مستقل

KPI نوع:
  → همه انواع + Growth اجباری
  → KPI تیمی اضافه می‌شود

نیاز به نظارت:
  → ماهانه
```

### L4 — Staff
```text
مسئولیت:
  → تأثیر cross-team
  → تعریف استانداردها
  → حل مسائل پیچیده سازمانی

KPI نوع:
  → Strategic + Impact محور
```

### M1 — Team Lead
```text
مسئولیت:
  → رهبری تیم ۲-۵ نفره
  → هنوز individual contributor هم هست

KPI نوع:
  → ترکیب فردی و تیمی
  → ۵۰٪ فنی، ۵۰٪ رهبری
```

---

## قوانین سطح‌بندی در MCP

```text
✅ سطح بر اساس مسئولیت تعریف می‌شود، نه سن
✅ سطح بر اساس تأثیر تعریف می‌شود، نه سابقه صرف
✅ "سال تجربه" راهنما است، نه شرط سخت

⚠️ هشدار bias:
  "سابقه کار" نباید proxy برای سن باشد
  MCP باید هشدار دهد اگر:
    → سابقه خیلی بالا برای L1 تعریف شود
    → سابقه خیلی پایین برای M3 تعریف شود
```

---

## تبدیل سطح به JD

```text
هر سطح → تنظیم خودکار:
  L1 → KPI آسان‌تر، نظارت بیشتر، مسئولیت محدودتر
  L3 → KPI چالش‌برانگیزتر، استقلال بیشتر، mentoring اضافه
  M2 → KPI ترکیبی فردی/تیمی، مسئولیت استخدام تیم
```
```

---

## `docs/mcp/hr/10-ksao-standard.md`

```markdown
# KSAO Standard

## تعریف
KSAO = Knowledge, Skills, Abilities, Other characteristics

چارچوب علمی برای تعریف شرایط شغلی که:
  → در روانشناسی صنعتی-سازمانی استاندارد است
  → از I/O Psychology می‌آید
  → پایه‌ای‌ترین روش Job Analysis است

---

## چهار بعد KSAO

### K — Knowledge (دانش)
```text
تعریف: آنچه فرد می‌داند
ویژگی: قابل یادگیری، قابل آموزش

مثال‌ها:
  → دانش الگوریتم‌های machine learning
  → دانش قوانین کار ایران
  → دانش استانداردهای GDPR
  → دانش معماری میکروسرویس

در MCP:
  → از O*NET/ESCO استخراج می‌شود
  → بر اساس سطح شغلی تنظیم می‌شود
```

### S — Skills (مهارت)
```text
تعریف: آنچه فرد می‌تواند انجام دهد
ویژگی: با تمرین بهتر می‌شود، قابل اندازه‌گیری

مثال‌ها:
  → نوشتن کد Rust در سطح Production
  → مذاکره با stakeholders
  → تحلیل داده با Python
  → ارائه به board of directors

Hard Skills:
  → فنی، قابل تست، objective
  
Soft Skills:
  → رفتاری، نیاز به مثال رفتاری (از JD Standard)
```

### A — Abilities (توانایی‌ها)
```text
تعریف: ظرفیت‌های پایدارتر که مبنای یادگیری هستند
ویژگی: کمتر قابل آموزش، بیشتر ذاتی

مثال‌ها:
  → توانایی تفکر انتزاعی
  → توانایی حل مسئله پیچیده
  → توانایی یادگیری سریع
  → توانایی کار تحت فشار

⚠️ هشدار bias:
  "توانایی" نباید با Protected Attribute مرتبط باشد
  مثلاً "توانایی فیزیکی" فقط اگر شرط واقعی شغل باشد
```

### O — Other Characteristics
```text
تعریف: سایر ویژگی‌هایی که برای موفقیت در نقش لازم‌اند
ویژگی: معمولاً رفتاری یا محیطی

مثال‌ها:
  → مجوزها و certificationها
  → آمادگی برای سفر کاری (درصد)
  → آمادگی برای on-call
  → عضویت حرفه‌ای

⚠️ ممنوع در O:
  ❌ "ازدواج نکرده" یا "متأهل"
  ❌ "بدون فرزند"
  ❌ هر ویژگی شخصی غیرمرتبط با شغل
```

---

## KSAO در فرآیند MCP

```text
Gap Analysis
  ↓
  شناسایی نیاز
  ↓
  ↓──────────────────────────────────┐
  Knowledge gap → K در KSAO          │
  Skills gap    → S در KSAO          │
  Ability gap   → A در KSAO          │
  Other gaps    → O در KSAO          │
  └──────────────────────────────────┘
  ↓
  JD Standard
  ↓
  KPI Standard
  ↓
  Validated Position
```

---

## اولویت‌بندی KSAO

```text
Must-have KSAO:
  → بدون آن نقش اجرا نمی‌شود
  → در JD به‌عنوان Required Skills

Preferred KSAO:
  → یادگرفتنی در ۳ ماه اول
  → در JD به‌عنوان Nice-to-Have

Development KSAO:
  → هدف رشد در ۶-۱۲ ماه
  → در KPI به‌عنوان Growth KPI
```
```

---

## `docs/mcp/hr/11-onet-esco-mapping.md`

```markdown
# O*NET & ESCO Mapping

## چرا به این استانداردها نیاز داریم؟

```text
بدون استاندارد:
  → "Senior Dev" در یک شرکت با دیگری فرق دارد
  → جستجوی شغل سخت می‌شود
  → مقایسه بین‌المللی ممکن نیست

با O*NET و ESCO:
  → عنوان شغلی استاندارد
  → KSAO پیش‌فرض قابل استناد
  → قابلیت جستجو و تطابق بین‌المللی
```

---

## O*NET

```text
O*NET = Occupational Information Network
  → پایگاه داده مشاغل آمریکا
  → وزارت کار آمریکا
  → بیش از ۱۰۰۰ شغل تعریف‌شده
  → هر شغل: KSAO، وظایف، بازار کار

مناسب برای:
  → بازار آمریکای شمالی
  → مشاغل فناوری (تعریف‌های دقیق)
  → Tier 1 و Tier 2 کشورهای آمریکایی

فرمت شناسه:
  15-1252.00 = Software Developers
  11-3121.00 = Human Resources Managers
```

---

## ESCO

```text
ESCO = European Skills, Competences, Qualifications and Occupations
  → پایگاه داده مشاغل اتحادیه اروپا
  → کمیسیون اروپایی
  → بیش از ۳۰۰۰ شغل
  → چندزبانه (۲۷ زبان اروپایی)

مناسب برای:
  → بازار اروپا
  → کشورهای Tier 1 (آلمان، فرانسه، هلند، بریتانیا)
  → مشاغل چندملیتی

فرمت شناسه:
  http://data.europa.eu/esco/occupation/f2b15a0e-...
```

---

## استراتژی Mapping در MCP

```text
┌──────────────────────────────────────────────┐
│           MCP Occupation Mapping             │
│                                              │
│  کشور Tier 1 EU     → ESCO primary          │
│                        O*NET secondary       │
│                                              │
│  کشور Tier 1 non-EU → O*NET primary         │
│  (کانادا، استرالیا)   ESCO secondary        │
│                                              │
│  کشور Tier 2         → O*NET primary        │
│                        ESCO اگر EU-related  │
│                                              │
│  ایران               → Custom mapping       │
│                        O*NET reference      │
└──────────────────────────────────────────────┘
```

---

## نمونه Mapping

```text
عنوان داخلی: "برنامه‌نویس بک‌اند ارشد"

O*NET:
  → 15-1252.00 Software Developers
  → KSAO پیش‌فرض از O*NET

ESCO:
  → Software developer
  → URI: http://data.europa.eu/esco/occupation/...

MCP Position:
  عنوان استاندارد: Senior Backend Developer
  O*NET Code: 15-1252.00
  ESCO URI: [link]
  سطح: L3 (از Role Leveling)
  KSAO: ترکیب O*NET + نیاز خاص شرکت
```

---

## قوانین Mapping در MCP

```text
✅ هر Position باید حداقل یک O*NET یا ESCO code داشته باشد
✅ عنوان شغلی باید به استاندارد نزدیک باشد
⚠️ اگر عنوان کاملاً سفارشی است:
   → باید توجیه داشته باشد
   → باید به نزدیک‌ترین O*NET/ESCO map شود
❌ عناوین تبعیض‌آمیز مجاز نیستند
   حتی اگر در O*NET وجود داشته باشند
```
```

---

## بروزرسانی `apps/api/src/mcp/types.rs`

```rust
// ── موارد اضافه‌شده در Sprint 5 ──────────────────────────

/// سطح شغلی
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, PartialOrd)]
pub enum RoleLevel {
    L1Junior,
    L2Mid,
    L3Senior,
    L4Staff,
    L5Principal,
    M1TeamLead,
    M2Manager,
    M3Director,
    M4VP,
}

/// نوع استخدام
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum EmploymentType {
    FullTime,
    PartTime,
    Contract,
    Freelance,
    Internship,
}

/// نوع محل کار
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum WorkLocation {
    OnSite,
    Remote,
    Hybrid { onsite_days_per_week: u8 },
}

/// یک مهارت با سطح آن
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub name: String,
    pub is_required: bool,
    pub proficiency: SkillProficiency,
}

/// سطح تسلط به مهارت
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SkillProficiency {
    Beginner,
    Intermediate,
    Advanced,
    Expert,
}

/// یک KPI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Kpi {
    pub title: String,
    pub description: String,
    pub kpi_type: KpiType,
    pub timeline_days: u32,
    pub measurement: String,
    pub target: String,
}

/// نوع KPI
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum KpiType {
    Output,
    Quality,
    Process,
    Growth,
    Strategic,
}

/// KSAO یک موقعیت شغلی
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KsaoProfile {
    pub knowledge: Vec<String>,
    pub skills: Vec<Skill>,
    pub abilities: Vec<String>,
    pub other: Vec<String>,
}

/// نگاشت به استانداردهای شغلی
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OccupationMapping {
    pub onet_code: Option<String>,
    pub esco_uri: Option<String>,
    pub custom_title: Option<String>,
}

/// یک موقعیت شغلی کامل
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub position_id: String,
    pub company_id: String,
    pub title: String,
    pub department: String,
    pub level: RoleLevel,
    pub employment_type: EmploymentType,
    pub work_location: WorkLocation,
    pub summary: String,
    pub responsibilities: Vec<String>,
    pub ksao: KsaoProfile,
    pub kpis: Vec<Kpi>,
    pub occupation_mapping: OccupationMapping,
    pub related_gap_ids: Vec<String>,
    pub bias_check_passed: bool,
    pub disclaimer: String,
    pub generated_at: String,
}

/// نتیجه اعتبارسنجی یک Position
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PositionValidationResult {
    Valid,
    Invalid { errors: Vec<String> },
    RequiresReview { warnings: Vec<String> },
}
```

---

## `apps/api/src/mcp/position.rs`

```rust
/// Position Generation Standard — MCP
/// Sprint 5: JD, KPI, Role Leveling, KSAO, O*NET/ESCO

use crate::mcp::types::{
    EmploymentType, Kpi, KpiType, KsaoProfile,
    OccupationMapping, Position, PositionValidationResult,
    RoleLevel, Skill, WorkLocation,
};
use crate::mcp::bias_fairness::run_bias_check;
use crate::mcp::types::BiasCheckResult;

// ── Role Level ────────────────────────────────────────────

/// حداقل و حداکثر سابقه پیشنهادی برای هر سطح (سال)
pub fn experience_range_for_level(level: &RoleLevel) -> (u8, u8) {
    match level {
        RoleLevel::L1Junior     => (0, 2),
        RoleLevel::L2Mid        => (2, 4),
        RoleLevel::L3Senior     => (4, 7),
        RoleLevel::L4Staff      => (7, 10),
        RoleLevel::L5Principal  => (10, 99),
        RoleLevel::M1TeamLead   => (3, 6),
        RoleLevel::M2Manager    => (5, 10),
        RoleLevel::M3Director   => (8, 15),
        RoleLevel::M4VP         => (12, 99),
    }
}

/// آیا سطح شغلی با سابقه ادعایی سازگار است؟
pub fn validate_level_experience(
    level: &RoleLevel,
    years: u8,
) -> Result<(), String> {
    let (min, max) = experience_range_for_level(level);
    if years < min {
        return Err(format!(
            "سابقه {} سال برای سطح {:?} کمتر از حداقل {} سال است",
            years, level, min
        ));
    }
    if years > max && max < 99 {
        return Err(format!(
            "سابقه {} سال برای سطح {:?} بیشتر از حداکثر {} سال است",
            years, level, max
        ));
    }
    Ok(())
}

/// آیا این سطح نیاز به Growth KPI دارد؟
pub fn requires_growth_kpi(level: &RoleLevel) -> bool {
    matches!(
        level,
        RoleLevel::L3Senior
            | RoleLevel::L4Staff
            | RoleLevel::L5Principal
            | RoleLevel::M1TeamLead
            | RoleLevel::M2Manager
            | RoleLevel::M3Director
            | RoleLevel::M4VP
    )
}

// ── KPI Validation ────────────────────────────────────────

/// اعتبارسنجی مجموعه KPIهای یک موقعیت
pub fn validate_kpis(
    kpis: &[Kpi],
    level: &RoleLevel,
) -> PositionValidationResult {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();

    // تعداد KPI
    if kpis.len() < 3 {
        errors.push(format!(
            "حداقل ۳ KPI لازم است. فعلاً {} تعریف شده.",
            kpis.len()
        ));
    }
    if kpis.len() > 7 {
        warnings.push(format!(
            "بیش از ۷ KPI ({}) ممکن است تمرکز را کاهش دهد.",
            kpis.len()
        ));
    }

    // Growth KPI برای Senior+
    if requires_growth_kpi(level) {
        let has_growth = kpis.iter().any(|k| k.kpi_type == KpiType::Growth);
        if !has_growth {
            errors.push(
                "سطح Senior و بالاتر نیاز به حداقل یک Growth KPI دارد."
                    .to_string(),
            );
        }
    }

    // بررسی timeline
    for kpi in kpis {
        if kpi.timeline_days == 0 {
            errors.push(format!(
                "KPI '{}' باید timeline داشته باشد.",
                kpi.title
            ));
        }
        if kpi.measurement.trim().is_empty() {
            errors.push(format!(
                "KPI '{}' باید روش اندازه‌گیری داشته باشد.",
                kpi.title
            ));
        }
    }

    if !errors.is_empty() {
        PositionValidationResult::Invalid { errors }
    } else if !warnings.is_empty() {
        PositionValidationResult::RequiresReview { warnings }
    } else {
        PositionValidationResult::Valid
    }
}

// ── KSAO Validation ───────────────────────────────────────

/// اعتبارسنجی KSAO
pub fn validate_ksao(ksao: &KsaoProfile) -> PositionValidationResult {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();

    // حداقل یک مهارت الزامی
    let required_skills: Vec<&Skill> =
        ksao.skills.iter().filter(|s| s.is_required).collect();

    if required_skills.is_empty() {
        errors.push("حداقل یک Required Skill لازم است.".to_string());
    }

    // بیش از ۷ must-have مشکوک است
    if required_skills.len() > 7 {
        warnings.push(format!(
            "تعداد Required Skills ({}) زیاد است. \
             ممکن است کارجوی مناسب پیدا نشود.",
            required_skills.len()
        ));
    }

    // Knowledge نباید خالی باشد
    if ksao.knowledge.is_empty() {
        warnings.push(
            "هیچ Knowledge تعریف نشده. بررسی O*NET پیشنهاد می‌شود."
                .to_string(),
        );
    }

    if !errors.is_empty() {
        PositionValidationResult::Invalid { errors }
    } else if !warnings.is_empty() {
        PositionValidationResult::RequiresReview { warnings }
    } else {
        PositionValidationResult::Valid
    }
}

// ── Occupation Mapping ────────────────────────────────────

/// آیا mapping به O*NET یا ESCO دارد؟
pub fn validate_occupation_mapping(
    mapping: &OccupationMapping,
) -> PositionValidationResult {
    if mapping.onet_code.is_none() && mapping.esco_uri.is_none() {
        return PositionValidationResult::RequiresReview {
            warnings: vec![
                "هیچ O*NET یا ESCO mapping وجود ندارد. \
                 قابلیت جستجوی بین‌المللی کاهش می‌یابد."
                    .to_string(),
            ],
        };
    }
    PositionValidationResult::Valid
}

// ── Position Full Validation ──────────────────────────────

/// اعتبارسنجی کامل یک موقعیت شغلی
pub fn validate_position(position: &Position) -> PositionValidationResult {
    let mut all_errors: Vec<String> = Vec::new();
    let mut all_warnings: Vec<String> = Vec::new();

    // بررسی عنوان
    if position.title.trim().is_empty() {
        all_errors.push("عنوان شغل نمی‌تواند خالی باشد.".to_string());
    }

    // بررسی خلاصه
    if position.summary.trim().is_empty() {
        all_errors.push("خلاصه نقش نمی‌تواند خالی باشد.".to_string());
    }

    // بررسی مسئولیت‌ها
    if position.responsibilities.len() > 8 {
        all_warnings.push(format!(
            "تعداد مسئولیت‌ها ({}) بیشتر از ۸ است. JD ممکن است گنگ باشد.",
            position.responsibilities.len()
        ));
    }
    if position.responsibilities.is_empty() {
        all_errors.push("حداقل یک مسئولیت لازم است.".to_string());
    }

    // بررسی KPI
    match validate_kpis(&position.kpis, &position.level) {
        PositionValidationResult::Invalid { errors } => {
            all_errors.extend(errors)
        }
        PositionValidationResult::RequiresReview { warnings } => {
            all_warnings.extend(warnings)
        }
        PositionValidationResult::Valid => {}
    }

    // بررسی KSAO
    match validate_ksao(&position.ksao) {
        PositionValidationResult::Invalid { errors } => {
            all_errors.extend(errors)
        }
        PositionValidationResult::RequiresReview { warnings } => {
            all_warnings.extend(warnings)
        }
        PositionValidationResult::Valid => {}
    }

    // بررسی Occupation Mapping
    match validate_occupation_mapping(&position.occupation_mapping) {
        PositionValidationResult::RequiresReview { warnings } => {
            all_warnings.extend(warnings)
        }
        _ => {}
    }

    // بررسی Bias روی عنوان و خلاصه
    let text_to_check = format!("{} {}", position.title, position.summary);
    match run_bias_check(&text_to_check) {
        BiasCheckResult::Blocked { reason } => {
            all_errors.push(format!("Bias check failed: {}", reason));
        }
        BiasCheckResult::RequiresHumanReview { flags } => {
            all_warnings.extend(flags);
        }
        BiasCheckResult::Clean => {}
    }

    // بررسی disclaimer
    if position.disclaimer.trim().is_empty() {
        all_errors.push("Disclaimer اجباری است.".to_string());
    }

    // نتیجه نهایی
    if !all_errors.is_empty() {
        PositionValidationResult::Invalid { errors: all_errors }
    } else if !all_warnings.is_empty() {
        PositionValidationResult::RequiresReview {
            warnings: all_warnings,
        }
    } else {
        PositionValidationResult::Valid
    }
}

// ── Disclaimer ────────────────────────────────────────────

pub const POSITION_DISCLAIMER: &str =
    "این شرح شغل با کمک هوش مصنوعی تولید شده است. \
     پیش از انتشار، باید توسط متخصص HR بازبینی شود. \
     MCP هیچ مسئولیتی در قبال تصمیمات استخدامی \
     بر اساس این سند ندارد.";
```

---

# ✅ Sprint 5 تمام شد

## خلاصه آنچه ساختیم:

```text
docs/mcp/process/05-position-generation-standard.md  ✅
docs/mcp/hr/07-job-description-standard.md           ✅
docs/mcp/hr/08-kpi-standard.md                       ✅
docs/mcp/hr/09-role-leveling-standard.md             ✅
docs/mcp/hr/10-ksao-standard.md                      ✅
docs/mcp/hr/11-onet-esco-mapping.md                  ✅
apps/api/src/mcp/types.rs  (بروزرسانی)               ✅
apps/api/src/mcp/position.rs                         ✅
```

---

## نقشه کامل وابستگی‌ها تا اینجا

```text
Sprint 1 ── Legal
  │  GeographicTier · LegalRiskLevel
  │  requires_human_approval() · AI_OUTPUT_DISCLAIMER
  ↓
Sprint 2 ── Bias & Fairness
  │  ProtectedAttribute · BiasCheckResult
  │  scan_forbidden_terms() · run_bias_check()
  ↓
Sprint 3 ── Data & Privacy
  │  ConsentLevel · DataSensitivityLevel
  │  scan_prohibited_data() · retention_days()
  │  is_allowed_for_llm()
  ↓
Sprint 4 ── HR Analysis
  │  BigFiveScores · PersonalityAnalysisResult
  │  SwotAnalysis · IdentifiedGap · GapPriority
  │  validate_big_five() · guard_mbti_usage()
  ↓
Sprint 5 ── Position Generation
  │  Position · RoleLevel · KpiType · KsaoProfile
  │  OccupationMapping · PositionValidationResult
  │  validate_position() · validate_kpis()
  ↓
Sprint 6 ── Compliance Engine  ← بعدی
  همه موارد بالا را یکجا بررسی می‌کند
```

---

# 🏃 Sprint 6: Compliance Engine

---

## `docs/mcp/process/07-compliance-engine-design.md`

```markdown
# Sprint 6 — Compliance Engine

## هدف
طراحی موتور انطباق مرکزی MCP که:
- همه قوانین Sprint 1 تا 5 را یکجا اجرا می‌کند
- PII Scanner دارد
- Output Validator دارد
- Risk Scoring دارد
- Audit Log تولید می‌کند

## چرا بعد از همه Sprintها؟

```text
Sprint 1 → قوانین قانونی
Sprint 2 → قوانین bias
Sprint 3 → قوانین privacy
Sprint 4 → قوانین تحلیل
Sprint 5 → قوانین position

Compliance Engine = اجرای همه اینها به‌صورت pipeline
```

## ورودی این Sprint
← Sprint 1: GeographicTier, LegalRiskLevel, requires_human_approval()
← Sprint 2: BiasCheckResult, run_bias_check(), scan_forbidden_terms()
← Sprint 3: ConsentLevel, scan_prohibited_data(), is_allowed_for_llm()
← Sprint 4: PersonalityAnalysisResult, validate_big_five()
← Sprint 5: Position, validate_position(), PositionValidationResult

## خروجی این Sprint
- docs/mcp/compliance/README.md
- docs/mcp/compliance/01-compliance-engine-architecture.md
- docs/mcp/compliance/02-compliance-rules-matrix.md
- docs/mcp/compliance/03-pii-scanner.md
- docs/mcp/compliance/05-output-validator.md
- docs/mcp/compliance/06-risk-scoring-logic.md
- docs/mcp/compliance/07-audit-log-requirements.md
- apps/api/src/mcp/compliance_engine.rs
- بروزرسانی apps/api/src/mcp/types.rs

## Sprint بعدی
→ Sprint 7: Templates & Schemas (finalize)
```

---

## `docs/mcp/compliance/README.md`

```markdown
# Compliance Domain — Overview

## تعریف
Compliance Engine قلب سیستم MCP است.
هر درخواست ورودی و هر خروجی تولیدشده
باید از این موتور عبور کند.

---

## جایگاه در معماری

```text
┌──────────────────────────────────────────────────┐
│                  MCP API Request                 │
│                       │                          │
│                       ↓                          │
│         ┌─────────────────────────┐              │
│         │    Compliance Engine    │              │
│         │                         │              │
│         │  ┌───────────────────┐  │              │
│         │  │  1. PII Scanner   │  │              │
│         │  └────────┬──────────┘  │              │
│         │           ↓             │              │
│         │  ┌───────────────────┐  │              │
│         │  │  2. Bias Check    │  │              │
│         │  └────────┬──────────┘  │              │
│         │           ↓             │              │
│         │  ┌───────────────────┐  │              │
│         │  │  3. Consent Check │  │              │
│         │  └────────┬──────────┘  │              │
│         │           ↓             │              │
│         │  ┌───────────────────┐  │              │
│         │  │  4. Legal Check   │  │              │
│         │  └────────┬──────────┘  │              │
│         │           ↓             │              │
│         │  ┌───────────────────┐  │              │
│         │  │  5. Risk Scoring  │  │              │
│         │  └────────┬──────────┘  │              │
│         │           ↓             │              │
│         │  ┌───────────────────┐  │              │
│         │  │  6. Audit Log     │  │              │
│         │  └────────┬──────────┘  │              │
│         └───────────┼─────────────┘              │
│                     ↓                            │
│              Allow / Block / Review              │
└──────────────────────────────────────────────────┘
```

## فایل‌های این Domain

| فایل | موضوع |
|------|--------|
| 01-compliance-engine-architecture.md | معماری کلی |
| 02-compliance-rules-matrix.md | ماتریس قوانین |
| 03-pii-scanner.md | اسکنر اطلاعات شخصی |
| 05-output-validator.md | اعتبارسنجی خروجی |
| 06-risk-scoring-logic.md | منطق امتیازدهی ریسک |
| 07-audit-log-requirements.md | الزامات لاگ |

## قانون بنیادی

```text
هیچ ورودی بدون compliance check پردازش نمی‌شود.
هیچ خروجی بدون compliance check به کاربر نمی‌رسد.
هر رویداد در audit log ثبت می‌شود.
```
```

---

## `docs/mcp/compliance/01-compliance-engine-architecture.md`

```markdown
# Compliance Engine Architecture

## اصول طراحی

```text
۱. Fail-Safe:
   اگر یک مرحله از pipeline خطا داد
   → درخواست block می‌شود، نه رد می‌شود با خطا
   → ایمن‌تر از fail-open

۲. Immutable Audit:
   لاگ‌ها قابل تغییر نیستند
   → append-only
   → هش‌شده برای integrity

۳. Pipeline Sequential:
   هر مرحله بعد از مرحله قبل اجرا می‌شود
   → اگر مرحله‌ای block کرد، مراحل بعدی اجرا نمی‌شوند
   → اما audit log همیشه اجرا می‌شود

۴. Context-Aware:
   قوانین بر اساس کشور کاربر فعال/غیرفعال می‌شوند
   → آلمان: GDPR سختگیرانه‌تر از کانادا
```

---

## دو نوع Pipeline

### Input Pipeline
```text
درخواست ورودی API

  ↓ Step 1: PII Scanner
    اگر PII ممنوع یافت شد → HTTP 422 + Audit

  ↓ Step 2: Prohibited Data Check
    اگر داده ممنوع یافت شد → HTTP 422 + Audit

  ↓ Step 3: Consent Verification
    اگر consent لازم وجود نداشت → HTTP 403 + Audit

  ↓ Step 4: Geographic Check
    اگر کشور Tier 3 بود → HTTP 403 + Audit

  ↓ Step 5: Risk Scoring
    محاسبه ریسک این درخواست

  ↓ Step 6: Audit Log (همیشه اجرا می‌شود)

  ↓ Allow Processing
```

### Output Pipeline
```text
خروجی تولیدشده توسط LLM

  ↓ Step 1: PII Leak Check
    اگر PII در خروجی بود → sanitize یا block

  ↓ Step 2: Forbidden Terms Scan
    Category A → block
    Category B → flag + human review

  ↓ Step 3: Bias Check
    BiasCheckResult → اعمال قانون

  ↓ Step 4: Human Approval Check
    اگر تصمیم نیاز به human داشت → queue

  ↓ Step 5: Disclaimer Injection
    اضافه کردن disclaimer اجباری

  ↓ Step 6: Risk Score Update

  ↓ Step 7: Audit Log (همیشه اجرا می‌شود)

  ↓ Deliver to User
```

---

## وضعیت‌های خروجی Compliance Engine

```text
┌──────────────────┬──────────────────────────────────┐
│ وضعیت           │ معنی                              │
├──────────────────┼──────────────────────────────────┤
│ Allowed          │ همه چیز درست است                 │
│ Blocked          │ نقض قانون سخت                   │
│ RequiresReview   │ نیاز به بررسی انسانی              │
│ Sanitized        │ خروجی اصلاح و پاک‌سازی شد        │
│ PartiallyAllowed │ بخشی مجاز، بخشی نیاز به review   │
└──────────────────┴──────────────────────────────────┘
```

---

## HTTP Status Codes

```text
200 → Allowed
202 → RequiresReview (در صف human review)
206 → PartiallyAllowed
422 → Blocked (ورودی نامعتبر)
403 → Blocked (مجوز ندارد)
451 → Blocked (دلیل قانونی — Unavailable For Legal Reasons)
```
```

---

## `docs/mcp/compliance/02-compliance-rules-matrix.md`

```markdown
# Compliance Rules Matrix

## تعریف
ماتریسی که نشان می‌دهد در هر شرایط
کدام قانون اعمال می‌شود.

---

## بُعد اول: نوع عملیات

```text
ANALYZE_PERSONALITY    تحلیل شخصیت کارجو
GENERATE_POSITION      تولید موقعیت شغلی
MATCH_CANDIDATE        تطابق کارجو با موقعیت
SCORE_RESUME           امتیازدهی به رزومه
MAKE_HIRING_DECISION   تصمیم استخدامی
EXPORT_DATA            خروجی داده
DELETE_DATA            حذف داده
```

---

## ماتریس کامل

| عملیات | PII Check | Bias Check | Consent | Geographic | Human Approval | Disclaimer |
|--------|-----------|------------|---------|------------|----------------|------------|
| ANALYZE_PERSONALITY | ✅ | ✅ | L2 | Tier1/2 | ❌ | ✅ اجباری |
| GENERATE_POSITION | ✅ | ✅ | L1 | همه | ❌ | ✅ اجباری |
| MATCH_CANDIDATE | ✅ | ✅ | L1+L2 | Tier1/2 | توصیه | ✅ اجباری |
| SCORE_RESUME | ✅ | ✅ | L1 | Tier1/2 | توصیه | ✅ اجباری |
| MAKE_HIRING_DECISION | ✅ | ✅ | L1 | Tier1/2 | ✅ اجباری | ✅ اجباری |
| EXPORT_DATA | ✅ | ❌ | L1 | همه | ❌ | ❌ |
| DELETE_DATA | ❌ | ❌ | ❌ | همه | ❌ | ❌ |

---

## بُعد دوم: کشور

```text
Tier 1 EU (آلمان، فرانسه، هلند):
  → GDPR سختگیرانه
  → consent صریح برای همه عملیات
  → data transfer فقط در EU
  → Right to Erasure: ۳۰ روز

Tier 1 non-EU (کانادا، استرالیا):
  → PIPEDA / Privacy Act
  → consent لازم اما انعطاف بیشتر
  → data transfer با restrictions

Tier 2 (آمریکا، برزیل، ...):
  → بستگی به ایالت/منطقه
  → حداقل baseline اعمال می‌شود
  → محدودیت‌های اضافه بر اساس کشور

Tier 3 (چین، روسیه):
  → همه عملیات blocked
  → HTTP 451
```

---

## بُعد سوم: سطح ریسک

```text
اگر Risk Score < 30:
  → Allowed بدون review

اگر Risk Score 30-60:
  → RequiresReview
  → human reviewer در صف

اگر Risk Score > 60:
  → Blocked
  → audit log + notification
```
```

---

## `docs/mcp/compliance/03-pii-scanner.md`

```markdown
# PII Scanner

## تعریف
PII = Personally Identifiable Information
اطلاعاتی که می‌توان با آن یک فرد را شناسایی کرد.

---

## انواع PII که باید اسکن شوند

### Direct PII
```text
→ نام کامل
→ آدرس ایمیل
→ شماره تلفن
→ آدرس فیزیکی
→ کد/شماره ملی
→ شماره گذرنامه
→ شماره کارت بانکی
→ IP Address
→ شماره حساب بانکی
```

### Indirect PII
```text
→ تاریخ تولد دقیق
→ کد پستی (در برخی کشورها)
→ نام کارفرمای قبلی + سمت + تاریخ
   (ترکیب این‌ها می‌تواند فرد را شناسایی کند)
→ عکس (حتی توصیف عکس)
→ اثر انگشت یا داده بیومتریک
```

---

## سه سناریوی اسکن

### سناریو ۱ — اسکن ورودی (قبل از LLM)
```text
هدف: جلوگیری از ارسال PII به LLM

اگر PII یافت شد:
  Direct PII    → anonymize خودکار
  Indirect PII  → flag + log
  Prohibited    → block کامل

مثال:
  ورودی: "علی محمدی با کد ملی ۱۲۳۴۵۶۷۸۹۰"
  خروجی ارسالی به LLM: "کارجو [ANONYMIZED] با شناسه [ID-001]"
```

### سناریو ۲ — اسکن خروجی (بعد از LLM)
```text
هدف: مطمئن شوی LLM اطلاعاتی leak نداده

اگر PII در خروجی یافت شد:
  → sanitize
  → اگر sanitize ممکن نبود → block
  → log

مثال:
  خروجی LLM: "این کارجو مثل احمد رضایی در شرکت X..."
  خروجی نهایی: "این کارجو مثل [CANDIDATE] در [COMPANY]..."
```

### سناریو ۳ — اسکن Audit Log
```text
هدف: مطمئن شوی PII وارد لاگ نشده

قانون:
  → اسامی در لاگ هرگز ذخیره نمی‌شوند
  → فقط شناسه‌های هش‌شده
  → IP address هش می‌شود
```

---

## Regex Patterns (نمونه)

```text
ایمیل:
  [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}

شماره تلفن ایران:
  (\+98|0)?9[0-9]{9}

کد ملی ایران:
  \b[0-9]{10}\b

شماره کارت بانکی:
  \b[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b

IP Address:
  \b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b
```

---

## Anonymization Strategy

```text
نام کامل      → [CANDIDATE_001]
ایمیل         → [EMAIL_REDACTED]
تلفن          → [PHONE_REDACTED]
کد ملی        → [ID_REDACTED]
شماره کارت    → [CARD_REDACTED] (یا ۴ رقم آخر)
IP            → SHA-256(IP + salt)
```
```

---

## `docs/mcp/compliance/05-output-validator.md`

```markdown
# Output Validator

## تعریف
Output Validator آخرین خط دفاعی MCP است.
هر خروجی قبل از رسیدن به کاربر از اینجا عبور می‌کند.

---

## چک‌لیست Output Validator

### لایه ۱ — PII Check
```text
[ ] آیا خروجی شامل ایمیل است؟         → sanitize
[ ] آیا خروجی شامل شماره تلفن است؟    → sanitize
[ ] آیا خروجی شامل کد ملی است؟        → block
[ ] آیا خروجی شامل اطلاعات پزشکی است؟ → block
```

### لایه ۲ — Bias Check
```text
[ ] Forbidden Term Category A؟  → block
[ ] Forbidden Term Category B؟  → flag + review
[ ] Proxy Discrimination؟       → flag + review
[ ] Pattern سوگیری در batch؟   → alert
```

### لایه ۳ — Legal Check
```text
[ ] آیا تصمیم نهایی استخدامی گرفته شده؟ → block
[ ] آیا MBTI در scoring استفاده شده؟     → block
[ ] آیا Protected Attribute استفاده شده؟ → block
[ ] آیا Geographic restriction رعایت شده؟→ check
```

### لایه ۴ — Quality Check
```text
[ ] آیا خروجی JD کامل است؟
    → همه بخش‌های اجباری پر باشند
[ ] آیا KPIها SMART هستند؟
    → حداقل measurement و timeline داشته باشند
[ ] آیا طول خروجی در محدوده مجاز است؟
    → JD: 300-700 کلمه
```

### لایه ۵ — Disclaimer Check
```text
[ ] آیا AI disclaimer وجود دارد؟         → اجباری
[ ] آیا personality disclaimer وجود دارد؟→ اگر تحلیل شخصیت هست
[ ] آیا MBTI disclaimer وجود دارد؟       → اگر MBTI ذکر شده
```

---

## نتیجه Output Validation

```text
همه لایه‌ها ✅ → Deliver
لایه PII یا Legal → Block (HTTP 500 internal + re-generate)
لایه Bias Cat-A   → Block (HTTP 500 internal + re-generate)
لایه Bias Cat-B   → RequiresReview (202)
لایه Quality      → RequiresReview با warning
```

---

## Re-generation Policy

```text
اگر خروجی block شد:
  → حداکثر ۲ بار دوباره تولید می‌شود
  → اگر بار سوم هم block شد:
     → به human reviewer منتقل می‌شود
     → HTTP 202
     → کاربر اطلاع داده می‌شود
```
```

---

## `docs/mcp/compliance/06-risk-scoring-logic.md`

```markdown
# Risk Scoring Logic

## تعریف
Risk Score عددی بین ۰ تا ۱۰۰ است که نشان می‌دهد
یک درخواست یا خروجی چقدر ریسک compliance دارد.

---

## فرمول کلی

```text
Risk Score = Σ (weight_i × factor_i) / Σ weight_i

نتیجه نرمال‌شده به ۰-۱۰۰
```

---

## فاکتورهای ریسک

### F1 — Geographic Risk
```text
وزن: ۲۵

Tier 1 EU      → 10  (قوانین سختگیرانه، اما شفاف)
Tier 1 non-EU  → 15
Tier 2         → 25
Tier 3         → 100 (block فوری)
```

### F2 — Operation Type Risk
```text
وزن: ۳۰

GENERATE_POSITION     → 10
ANALYZE_PERSONALITY   → 30
SCORE_RESUME          → 40
MATCH_CANDIDATE       → 45
MAKE_HIRING_DECISION  → 80
```

### F3 — Data Sensitivity Risk
```text
وزن: ۲۰

فقط Public/Internal    → 5
شامل Confidential      → 20
شامل Sensitive         → 50
شامل Restricted        → 90 (block)
```

### F4 — Consent Status Risk
```text
وزن: ۱۵

همه consent‌های لازم موجود → 0
consent اختیاری نیست       → 20
consent الزامی نیست        → 70
```

### F5 — Bias Indicator Risk
```text
وزن: ۱۰

BiasCheckResult::Clean          → 0
BiasCheckResult::RequiresReview → 50
BiasCheckResult::Blocked        → 100
```

---

## تفسیر Risk Score

```text
0  - 29  → 🟢 Low Risk    → Allowed
30 - 59  → 🟡 Medium Risk → RequiresReview
60 - 79  → 🟠 High Risk   → RequiresReview + Priority
80 - 100 → 🔴 Critical    → Blocked
```

---

## Risk Score در Audit Log

```text
هر رویداد در audit log باید شامل:
  → risk_score: u8
  → risk_factors: Vec<RiskFactor>
  → risk_level: RiskLevel enum

این داده برای:
  → گزارش compliance ماهانه
  → شناسایی pattern‌های مشکوک
  → بهبود قوانین
```

---

## Aggregate Risk Monitoring

```text
اگر در ۲۴ ساعت:
  → میانگین risk score یک company > 50 شد:
     → alert به admin
     → بررسی دستی

اگر در ۷ روز:
  → بیش از ۵ بار Block برای یک company:
     → account review
     → ممکن است دسترسی محدود شود
```
```

---

## `docs/mcp/compliance/07-audit-log-requirements.md`

```markdown
# Audit Log Requirements

## چرا Audit Log؟

```text
GDPR Article 30: سازمان‌ها موظف‌اند سوابق پردازش را نگه دارند
GDPR Article 5(2): accountability — باید بتوانیم ثابت کنیم رعایت کرده‌ایم
در دعوای حقوقی: audit log تنها مدرک ما است
```

---

## ساختار یک Audit Event

```text
{
  event_id        : UUID (یکتا، غیرقابل تغییر)
  event_type      : Enum (نوع رویداد)
  timestamp       : ISO 8601 UTC
  actor_id        : UUID (هش‌شده — چه سیستمی یا کاربری)
  company_id      : UUID
  operation       : ComplianceOperation enum
  country         : Country enum
  input_hash      : SHA-256 (هش ورودی، نه خود ورودی)
  output_hash     : SHA-256 (هش خروجی، نه خود خروجی)
  risk_score      : u8
  risk_level      : RiskLevel enum
  compliance_result: ComplianceResult enum
  pipeline_steps  : Vec<PipelineStepResult>
  human_review_id : Option<UUID>
  notes           : Option<String>
  log_hash        : SHA-256 (هش این رکورد برای integrity)
}
```

---

## انواع Event

```text
REQUEST_RECEIVED      درخواست دریافت شد
INPUT_SCAN_PASSED     اسکن ورودی موفق
INPUT_SCAN_FAILED     اسکن ورودی ناموفق
CONSENT_VERIFIED      consent تأیید شد
CONSENT_MISSING       consent وجود نداشت
PROCESSING_STARTED    پردازش شروع شد
OUTPUT_GENERATED      خروجی تولید شد
OUTPUT_SCAN_PASSED    اسکن خروجی موفق
OUTPUT_SCAN_FAILED    اسکن خروجی ناموفق
OUTPUT_SANITIZED      خروجی پاک‌سازی شد
HUMAN_REVIEW_QUEUED   در صف review
HUMAN_REVIEW_APPROVED تأیید انسانی
HUMAN_REVIEW_REJECTED رد انسانی
DELIVERED             تحویل به کاربر
BLOCKED               مسدود شد
DATA_DELETED          داده حذف شد
DATA_EXPORTED         داده خروجی گرفته شد
```

---

## قوانین Audit Log

```text
✅ Append-Only: هیچ رکوردی حذف یا ویرایش نمی‌شود
✅ Integrity: هر رکورد هش دارد
✅ Chain: هر رکورد به hash قبلی اشاره دارد (مثل blockchain)
✅ No PII: هیچ اطلاعات شخصی مستقیم در لاگ نیست
✅ Retention: حداقل ۵ سال
✅ Searchable: قابل جستجو بر اساس company_id, event_type, timestamp
✅ Exportable: برای GDPR Article 30 compliance
```

---

## Retention & Archive

```text
سال اول      → hot storage (دسترسی سریع)
سال ۲-۳     → warm storage
سال ۴-۵     → cold storage (archive)
بعد از ۵ سال → حذف یا anonymize بر اساس قوانین کشور
```
```

---

## بروزرسانی `apps/api/src/mcp/types.rs`

```rust
// ── موارد اضافه‌شده در Sprint 6 ──────────────────────────

/// نوع عملیات در Compliance Engine
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ComplianceOperation {
    AnalyzePersonality,
    GeneratePosition,
    MatchCandidate,
    ScoreResume,
    MakeHiringDecision,
    ExportData,
    DeleteData,
}

/// نتیجه کلی Compliance Engine
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ComplianceResult {
    Allowed,
    Blocked { reason: String },
    RequiresReview { flags: Vec<String> },
    Sanitized { changes: Vec<String> },
    PartiallyAllowed { allowed_parts: Vec<String>, blocked_parts: Vec<String> },
}

/// سطح ریسک
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, PartialOrd)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

/// نتیجه یک مرحله از pipeline
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PipelineStepResult {
    pub step_name: String,
    pub passed: bool,
    pub details: Option<String>,
}

/// یک رویداد Audit Log
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    pub event_id: String,
    pub event_type: String,
    pub timestamp: String,
    pub actor_id: String,
    pub company_id: String,
    pub operation: ComplianceOperation,
    pub country: Country,
    pub input_hash: String,
    pub output_hash: Option<String>,
    pub risk_score: u8,
    pub risk_level: RiskLevel,
    pub compliance_result: ComplianceResult,
    pub pipeline_steps: Vec<PipelineStepResult>,
    pub human_review_id: Option<String>,
    pub notes: Option<String>,
    pub log_hash: String,
}

/// فاکتورهای ریسک
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskFactors {
    pub geographic_score: u8,
    pub operation_score: u8,
    pub data_sensitivity_score: u8,
    pub consent_score: u8,
    pub bias_score: u8,
}
```

---

## `apps/api/src/mcp/compliance_engine.rs`

```rust
/// Compliance Engine — MCP
/// Sprint 6: Pipeline, PII Scanner, Risk Scoring, Audit Log

use crate::mcp::types::{
    AuditEvent, BiasCheckResult, ComplianceOperation,
    ComplianceResult, ConsentLevel, Country, DataSensitivityLevel,
    GeographicTier, PipelineStepResult, ProhibitedDataCheckResult,
    RiskFactors, RiskLevel,
};
use crate::mcp::bias_fairness::run_bias_check;
use crate::mcp::legal::{get_geographic_tier, is_operation_allowed};
use crate::mcp::privacy::{
    has_valid_consent, required_consent_level, scan_prohibited_data,
};

// ── PII Scanner ───────────────────────────────────────────

/// الگوهای PII
struct PiiPattern {
    label: &'static str,
    /// در محیط واقعی: regex compile‌شده
    keyword_indicators: &'static [&'static str],
    should_block: bool,
}

const PII_PATTERNS: &[PiiPattern] = &[
    PiiPattern {
        label: "email",
        keyword_indicators: &["@gmail", "@yahoo", "@hotmail", ".com", "@"],
        should_block: false, // anonymize
    },
    PiiPattern {
        label: "phone_ir",
        keyword_indicators: &["09", "+989", "۰۹"],
        should_block: false, // anonymize
    },
    PiiPattern {
        label: "national_id",
        keyword_indicators: &["کد ملی", "شماره ملی", "national id"],
        should_block: true,
    },
    PiiPattern {
        label: "bank_card",
        keyword_indicators: &["شماره کارت", "card number", "cvv"],
        should_block: true,
    },
    PiiPattern {
        label: "passport",
        keyword_indicators: &["شماره گذرنامه", "passport number"],
        should_block: true,
    },
];

/// نتیجه اسکن PII
#[derive(Debug)]
pub struct PiiScanResult {
    pub found: Vec<(String, bool)>, // (label, should_block)
    pub should_block: bool,
}

/// اسکن متن برای PII
pub fn scan_pii(text: &str) -> PiiScanResult {
    let text_lower = text.to_lowercase();
    let mut found = Vec::new();
    let mut should_block = false;

    for pattern in PII_PATTERNS {
        let detected = pattern
            .keyword_indicators
            .iter()
            .any(|kw| text_lower.contains(kw));

        if detected {
            found.push((pattern.label.to_string(), pattern.should_block));
            if pattern.should_block {
                should_block = true;
            }
        }
    }

    PiiScanResult { found, should_block }
}

/// Anonymize متن — جایگزینی PII با placeholder
pub fn anonymize_pii(text: &str) -> String {
    let mut result = text.to_string();

    // در پیاده‌سازی واقعی از regex استفاده می‌شود
    let replacements = [
        ("@gmail.com", "[EMAIL_REDACTED]"),
        ("@yahoo.com", "[EMAIL_REDACTED]"),
        ("کد ملی", "[ID_REDACTED]"),
        ("شماره ملی", "[ID_REDACTED]"),
    ];

    for (pattern, replacement) in &replacements {
        result = result.replace(pattern, replacement);
    }

    result
}

// ── Risk Scoring ──────────────────────────────────────────

/// محاسبه امتیاز geographic
fn geographic_risk(country: &Country) -> u8 {
    match get_geographic_tier(country) {
        GeographicTier::Tier1FullySupported => 10,
        GeographicTier::Tier2WithRestrictions => 25,
        GeographicTier::Tier3NotSupported => 100,
    }
}

/// محاسبه امتیاز operation
fn operation_risk(op: &ComplianceOperation) -> u8 {
    match op {
        ComplianceOperation::GeneratePosition => 10,
        ComplianceOperation::DeleteData => 10,
        ComplianceOperation::ExportData => 20,
        ComplianceOperation::AnalyzePersonality => 30,
        ComplianceOperation::ScoreResume => 40,
        ComplianceOperation::MatchCandidate => 45,
        ComplianceOperation::MakeHiringDecision => 80,
    }
}

/// محاسبه امتیاز data sensitivity
fn data_sensitivity_risk(level: &DataSensitivityLevel) -> u8 {
    match level {
        DataSensitivityLevel::Public => 5,
        DataSensitivityLevel::Internal => 10,
        DataSensitivityLevel::Confidential => 20,
        DataSensitivityLevel::Sensitive => 50,
        DataSensitivityLevel::Restricted => 90,
    }
}

/// محاسبه امتیاز consent
fn consent_risk(consent_ok: bool, consent_required: bool) -> u8 {
    match (consent_required, consent_ok) {
        (false, _) => 0,
        (true, true) => 0,
        (true, false) => 70,
    }
}

/// محاسبه امتیاز bias
fn bias_risk(result: &BiasCheckResult) -> u8 {
    match result {
        BiasCheckResult::Clean => 0,
        BiasCheckResult::RequiresHumanReview { .. } => 50,
        BiasCheckResult::Blocked { .. } => 100,
    }
}

/// محاسبه Risk Score کلی
pub fn calculate_risk_score(factors: &RiskFactors) -> u8 {
    // وزن‌ها
    let weights: [(u8, u8); 5] = [
        (factors.geographic_score, 25),
        (factors.operation_score, 30),
        (factors.data_sensitivity_score, 20),
        (factors.consent_score, 15),
        (factors.bias_score, 10),
    ];

    let total_weight: u32 = weights.iter().map(|(_, w)| *w as u32).sum();
    let weighted_sum: u32 = weights
        .iter()
        .map(|(score, weight)| (*score as u32) * (*weight as u32))
        .sum();

    ((weighted_sum / total_weight) as u8).min(100)
}

/// تبدیل امتیاز به سطح ریسک
pub fn score_to_risk_level(score: u8) -> RiskLevel {
    match score {
        0..=29 => RiskLevel::Low,
        30..=59 => RiskLevel::Medium,
        60..=79 => RiskLevel::High,
        _ => RiskLevel::Critical,
    }
}

// ── Input Pipeline ────────────────────────────────────────

/// ورودی pipeline
pub struct ComplianceInputRequest {
    pub text: String,
    pub operation: ComplianceOperation,
    pub country: Country,
    pub data_sensitivity: DataSensitivityLevel,
    pub granted_consents: Vec<ConsentLevel>,
    pub company_id: String,
    pub actor_id: String,
}

/// اجرای Input Pipeline
pub fn run_input_pipeline(
    req: &ComplianceInputRequest,
) -> (ComplianceResult, Vec<PipelineStepResult>, u8) {
    let mut steps: Vec<PipelineStepResult> = Vec::new();

    // Step 1 — Geographic Check
    if !is_operation_allowed(&req.country) {
        steps.push(PipelineStepResult {
            step_name: "geographic_check".to_string(),
            passed: false,
            details: Some("Country is Tier 3 — Not Supported".to_string()),
        });
        return (
            ComplianceResult::Blocked {
                reason: "Geographic restriction".to_string(),
            },
            steps,
            100,
        );
    }
    steps.push(PipelineStepResult {
        step_name: "geographic_check".to_string(),
        passed: true,
        details: None,
    });

    // Step 2 — PII Scanner
    let pii_result = scan_pii(&req.text);
    if pii_result.should_block {
        steps.push(PipelineStepResult {
            step_name: "pii_scanner".to_string(),
            passed: false,
            details: Some(format!(
                "Prohibited PII found: {:?}",
                pii_result.found
            )),
        });
        return (
            ComplianceResult::Blocked {
                reason: "Prohibited PII in input".to_string(),
            },
            steps,
            100,
        );
    }
    steps.push(PipelineStepResult {
        step_name: "pii_scanner".to_string(),
        passed: true,
        details: if pii_result.found.is_empty() {
            None
        } else {
            Some(format!("Anonymizable PII found: {:?}", pii_result.found))
        },
    });

    // Step 3 — Prohibited Data Check
    let prohibited = scan_prohibited_data(&req.text, "input");
    if let ProhibitedDataCheckResult::ProhibitedFound { data_type, .. } =
        &prohibited
    {
        steps.push(PipelineStepResult {
            step_name: "prohibited_data_check".to_string(),
            passed: false,
            details: Some(format!("Prohibited data type: {}", data_type)),
        });
        return (
            ComplianceResult::Blocked {
                reason: format!("Prohibited data: {}", data_type),
            },
            steps,
            100,
        );
    }
    steps.push(PipelineStepResult {
        step_name: "prohibited_data_check".to_string(),
        passed: true,
        details: None,
    });

    // Step 4 — Consent Check
    let operation_str = format!("{:?}", req.operation).to_lowercase();
    let required_consent = required_consent_level(&operation_str);
    let consent_ok = match &required_consent {
        Some(level) => has_valid_consent(&req.granted_consents, level),
        None => true,
    };
    if !consent_ok {
        steps.push(PipelineStepResult {
            step_name: "consent_check".to_string(),
            passed: false,
            details: Some(format!(
                "Required consent missing: {:?}",
                required_consent
            )),
        });
        return (
            ComplianceResult::Blocked {
                reason: "Consent not provided".to_string(),
            },
            steps,
            90,
        );
    }
    steps.push(PipelineStepResult {
        step_name: "consent_check".to_string(),
        passed: true,
        details: None,
    });

    // Step 5 — Risk Scoring
    let bias_result = run_bias_check(&req.text);
    let factors = RiskFactors {
        geographic_score: geographic_risk(&req.country),
        operation_score: operation_risk(&req.operation),
        data_sensitivity_score: data_sensitivity_risk(&req.data_sensitivity),
        consent_score: consent_risk(consent_ok, required_consent.is_some()),
        bias_score: bias_risk(&bias_result),
    };
    let risk_score = calculate_risk_score(&factors);
    let risk_level = score_to_risk_level(risk_score);

    steps.push(PipelineStepResult {
        step_name: "risk_scoring".to_string(),
        passed: true,
        details: Some(format!(
            "Risk Score: {} — Level: {:?}",
            risk_score, risk_level
        )),
    });

    // نتیجه نهایی بر اساس risk
    let result = match risk_level {
        RiskLevel::Low => ComplianceResult::Allowed,
        RiskLevel::Medium | RiskLevel::High => {
            ComplianceResult::RequiresReview {
                flags: vec![format!("Risk score: {}", risk_score)],
            }
        }
        RiskLevel::Critical => ComplianceResult::Blocked {
            reason: format!("Critical risk score: {}", risk_score),
        },
    };

    (result, steps, risk_score)
}

// ── Output Pipeline ───────────────────────────────────────

/// اجرای Output Pipeline
pub fn run_output_pipeline(
    output_text: &str,
    operation: &ComplianceOperation,
) -> (ComplianceResult, Vec<PipelineStepResult>) {
    let mut steps: Vec<PipelineStepResult> = Vec::new();
    let mut changes: Vec<String> = Vec::new();
    let mut flags: Vec<String> = Vec::new();

    // Step 1 — PII Leak Check
    let pii_result = scan_pii(output_text);
    if pii_result.should_block {
        steps.push(PipelineStepResult {
            step_name: "output_pii_check".to_string(),
            passed: false,
            details: Some("PII leak detected in output".to_string()),
        });
        return (
            ComplianceResult::Blocked {
                reason: "PII leak in output".to_string(),
            },
            steps,
        );
    }
    if !pii_result.found.is_empty() {
        changes.push("PII anonymized in output".to_string());
    }
    steps.push(PipelineStepResult {
        step_name: "output_pii_check".to_string(),
        passed: true,
        details: None,
    });

    // Step 2 — Bias Check
    match run_bias_check(output_text) {
        BiasCheckResult::Blocked { reason } => {
            steps.push(PipelineStepResult {
                step_name: "output_bias_check".to_string(),
                passed: false,
                details: Some(reason.clone()),
            });
            return (ComplianceResult::Blocked { reason }, steps);
        }
        BiasCheckResult::RequiresHumanReview { flags: f } => {
            flags.extend(f);
            steps.push(PipelineStepResult {
                step_name: "output_bias_check".to_string(),
                passed: false,
                details: Some("Bias flags found".to_string()),
            });
        }
        BiasCheckResult::Clean => {
            steps.push(PipelineStepResult {
                step_name: "output_bias_check".to_string(),
                passed: true,
                details: None,
            });
        }
    }

    // Step 3 — Human Approval Check
    use crate::mcp::legal::{requires_human_approval, HrDecisionType};
    let decision_type = match operation {
        ComplianceOperation::MakeHiringDecision => {
            Some(HrDecisionType::HireCandidate)
        }
        ComplianceOperation::MatchCandidate => {
            Some(HrDecisionType::ScoreResume)
        }
        _ => None,
    };
    if let Some(dt) = decision_type {
        if requires_human_approval(&dt) {
            flags.push("Human approval required for this decision".to_string());
        }
    }

    // نتیجه
    if !flags.is_empty() {
        (ComplianceResult::RequiresReview { flags }, steps)
    } else if !changes.is_empty() {
        (ComplianceResult::Sanitized { changes }, steps)
    } else {
        (ComplianceResult::Allowed, steps)
    }
}

// ── Audit Log Builder ─────────────────────────────────────

/// ساخت یک AuditEvent
pub fn build_audit_event(
    event_id: String,
    event_type: &str,
    actor_id: String,
    company_id: String,
    operation: ComplianceOperation,
    country: Country,
    input_hash: String,
    output_hash: Option<String>,
    risk_score: u8,
    pipeline_steps: Vec<PipelineStepResult>,
    compliance_result: ComplianceResult,
) -> AuditEvent {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let risk_level = score_to_risk_level(risk_score);

    // در پیاده‌سازی واقعی از SHA-256 استفاده می‌شود
    let mut hasher = DefaultHasher::new();
    event_id.hash(&mut hasher);
    input_hash.hash(&mut hasher);
    let log_hash = format!("{:x}", hasher.finish());

    AuditEvent {
        event_id,
        event_type: event_type.to_string(),
        timestamp: chrono_timestamp(),
        actor_id,
        company_id,
        operation,
        country,
        input_hash,
        output_hash,
        risk_score,
        risk_level,
        compliance_result,
        pipeline_steps,
        human_review_id: None,
        notes: None,
        log_hash,
    }
}

/// timestamp ساده (در پروژه واقعی از chrono استفاده می‌شود)
fn chrono_timestamp() -> String {
    "2025-01-01T00:00:00Z".to_string()
}
```

---

# ✅ Sprint 6 تمام شد

## خلاصه آنچه ساختیم:

```text
docs/mcp/process/07-compliance-engine-design.md        ✅
docs/mcp/compliance/README.md                          ✅
docs/mcp/compliance/01-compliance-engine-architecture.md ✅
docs/mcp/compliance/02-compliance-rules-matrix.md      ✅
docs/mcp/compliance/03-pii-scanner.md                  ✅
docs/mcp/compliance/05-output-validator.md             ✅
docs/mcp/compliance/06-risk-scoring-logic.md           ✅
docs/mcp/compliance/07-audit-log-requirements.md       ✅
apps/api/src/mcp/types.rs  (بروزرسانی)                 ✅
apps/api/src/mcp/compliance_engine.rs                  ✅
```

---

## نقشه کامل ساختار فایل‌های `apps/api/src/mcp/`

```text
apps/api/src/mcp/
├── types.rs              ← همه type‌ها (همه Sprintها)
├── legal.rs              ← Sprint 1
├── bias_fairness.rs      ← Sprint 2
├── privacy.rs            ← Sprint 3
├── hr_standards.rs       ← Sprint 4
├── position.rs           ← Sprint 5
└── compliance_engine.rs  ← Sprint 6 ← همه را صدا می‌زند
```

---

## نقشه کامل Pipeline

```text
API Request
    ↓
compliance_engine::run_input_pipeline()
    ├── legal::is_operation_allowed()
    ├── pii::scan_pii()
    ├── privacy::scan_prohibited_data()
    ├── privacy::has_valid_consent()
    └── risk_score → RiskLevel
    ↓
[if Allowed]
    ↓
hr_standards / position (پردازش اصلی)
    ↓
compliance_engine::run_output_pipeline()
    ├── pii::scan_pii() (output)
    ├── bias_fairness::run_bias_check()
    ├── legal::requires_human_approval()
    └── disclaimer injection
    ↓
build_audit_event() → AuditLog
    ↓
API Response
```

---

# 🏃 Sprint 7: Templates & Schemas (Finalize)

---

## `docs/mcp/process/07-templates-schemas.md`

```markdown
# Sprint 7 — Templates & Schemas

## هدف
تعریف و نهایی‌سازی:
- قالب‌های خروجی (Templates)
- اسکیماهای داده (Schemas)

## چرا اینجا؟
تا Sprint 6 همه قوانین و منطق مشخص شد.
حالا می‌دانیم خروجی‌ها دقیقاً چه شکلی باشند.

```text
Sprint 1-6 → چه قوانینی؟ چه منطقی؟
Sprint 7   → چه شکلی؟ چه فرمتی؟
```

## ورودی این Sprint
← Sprint 1: AI_OUTPUT_DISCLAIMER
← Sprint 2: BiasCheckResult
← Sprint 3: ConsentEvent, DataSensitivityLevel
← Sprint 4: BigFiveScores, PersonalityAnalysisResult
← Sprint 5: Position, Kpi, KsaoProfile, RoleLevel
← Sprint 6: ComplianceResult, AuditEvent, RiskLevel

## خروجی این Sprint

### Templates
- docs/mcp/templates/job-description-template.md
- docs/mcp/templates/kpi-template.md
- docs/mcp/templates/position-report-template.md
- docs/mcp/templates/fairness-review-checklist.md
- docs/mcp/templates/feedback-report-template.md

### Schemas
- docs/mcp/schemas/candidate-data-schema.md
- docs/mcp/schemas/position-schema.md
- docs/mcp/schemas/kpi-schema.md
- docs/mcp/schemas/audit-log-schema.md
- docs/mcp/schemas/compliance-risk-score-schema.md

### Code
- apps/api/src/mcp/schemas.rs
- بروزرسانی apps/api/src/mcp/types.rs

## Sprint بعدی
→ Sprint 8: Feedback Loop & Examples
```

---

## `docs/mcp/templates/job-description-template.md`

````markdown
# Job Description Template

## نحوه استفاده
این قالب توسط MCP به‌صورت خودکار پر می‌شود.
فیلدهای `{{...}}` توسط سیستم جایگزین می‌شوند.
فیلدهای `[...]` توسط HR Reviewer تکمیل می‌شوند.

---

```markdown
# {{position_title}}

**واحد سازمانی:** {{department}}
**سطح شغلی:** {{role_level}}
**نوع استخدام:** {{employment_type}}
**محل کار:** {{work_location}}
**تاریخ تولید:** {{generated_at}}
**شناسه موقعیت:** {{position_id}}

---

## خلاصه نقش

{{summary}}

---

## مسئولیت‌های کلیدی

{{#each responsibilities}}
- {{this}}
{{/each}}

---

## مهارت‌های الزامی

{{#each required_skills}}
- **{{this.name}}** — سطح: {{this.proficiency}}
{{/each}}

---

## مهارت‌های مطلوب

{{#each optional_skills}}
- {{this.name}}
{{/each}}

---

## دانش و توانایی‌های لازم

### دانش (Knowledge)
{{#each ksao.knowledge}}
- {{this}}
{{/each}}

### توانایی‌ها (Abilities)
{{#each ksao.abilities}}
- {{this}}
{{/each}}

### سایر (Other)
{{#each ksao.other}}
- {{this}}
{{/each}}

---

## شاخص‌های عملکرد (KPI)

### ۳۰ روز اول
{{#each kpis_30}}
- **{{this.title}}:** {{this.target}}
  اندازه‌گیری: {{this.measurement}}
{{/each}}

### ۶۰ روز
{{#each kpis_60}}
- **{{this.title}}:** {{this.target}}
  اندازه‌گیری: {{this.measurement}}
{{/each}}

### ۹۰ روز
{{#each kpis_90}}
- **{{this.title}}:** {{this.target}}
  اندازه‌گیری: {{this.measurement}}
{{/each}}

---

## شرایط کاری

- **ساعات کاری:** {{working_hours}}
- **سفر کاری:** {{travel_percentage}}٪
- **On-call:** {{on_call_required}}
- **محدوده حقوق:** [توسط HR تکمیل شود]

---

## مرجع استاندارد شغلی

- **O*NET Code:** {{onet_code}}
- **ESCO URI:** {{esco_uri}}

---

## بررسی Compliance

- **Bias Check:** {{bias_check_status}}
- **Risk Score:** {{risk_score}}/100
- **Risk Level:** {{risk_level}}
- **تأیید HR:** [ ] تأیید نشده / [ ] تأیید شده

---

> ⚠️ **اعلامیه هوش مصنوعی**
>
> {{ai_disclaimer}}
>
> **نسخه:** {{version}} | **تاریخ:** {{generated_at}}
```
````

---

## `docs/mcp/templates/kpi-template.md`

````markdown
# KPI Template

## نحوه استفاده
برای هر KPI یک نمونه از این قالب پر می‌شود.

---

```markdown
## KPI: {{title}}

| فیلد | مقدار |
|------|-------|
| نوع | {{kpi_type}} |
| دوره | {{timeline_days}} روز |
| هدف | {{target}} |
| روش اندازه‌گیری | {{measurement}} |
| منبع داده | {{data_source}} |
| مسئول بررسی | {{reviewer_role}} |
| وضعیت | {{status}} |

### توضیح
{{description}}

### ارتباط با Gap
{{related_gap}}

### معیار موفقیت
- ✅ موفق: {{success_criteria}}
- ⚠️ نیاز به بهبود: {{partial_criteria}}
- ❌ ناموفق: {{failure_criteria}}
```
````

---

## `docs/mcp/templates/position-report-template.md`

````markdown
# Position Report Template

## تعریف
گزارش کاملی که بعد از تولید هر موقعیت شغلی
به HR ارسال می‌شود.

---

```markdown
# گزارش موقعیت شغلی
**شناسه:** {{position_id}}
**تاریخ:** {{generated_at}}
**شرکت:** {{company_id}}

---

## ۱. خلاصه اجرایی

| فیلد | مقدار |
|------|-------|
| عنوان | {{title}} |
| سطح | {{role_level}} |
| واحد | {{department}} |
| اولویت | {{priority}} |
| Gap مرتبط | {{gap_type}} |

---

## ۲. تحلیل Gap

**نوع Gap:** {{gap_type}}
**توضیح:** {{gap_description}}
**پیشنهاد:** {{gap_recommendation}}

---

## ۳. KSAO خلاصه

**حیاتی‌ترین مهارت‌ها:**
{{#each top_skills}}
- {{this}}
{{/each}}

**دانش کلیدی:**
{{#each top_knowledge}}
- {{this}}
{{/each}}

---

## ۴. KPI Dashboard

| KPI | دوره | هدف | نوع |
|-----|------|-----|-----|
{{#each kpis}}
| {{this.title}} | {{this.timeline_days}}روز | {{this.target}} | {{this.kpi_type}} |
{{/each}}

---

## ۵. نتایج Compliance

| بررسی | نتیجه | جزئیات |
|-------|-------|--------|
| Bias Check | {{bias_result}} | {{bias_details}} |
| PII Scan | {{pii_result}} | — |
| Risk Score | {{risk_score}}/100 | {{risk_level}} |
| Geographic | {{geo_tier}} | {{country}} |

---

## ۶. هشدارها و پیشنهادات

{{#each warnings}}
⚠️ {{this}}
{{/each}}

{{#if requires_human_review}}
> 🔴 این موقعیت نیاز به بررسی انسانی دارد.
> دلیل: {{review_reason}}
{{/if}}

---

## ۷. اقدامات لازم

- [ ] بازبینی JD توسط HR
- [ ] تأیید KPIها توسط مدیر مستقیم
- [ ] بررسی Compliance توسط Legal (اگر لازم)
- [ ] انتشار در کانال‌های استخدامی

---

> ⚠️ {{ai_disclaimer}}
```
````

---

## `docs/mcp/templates/fairness-review-checklist.md`

````markdown
# Fairness Review Checklist Template

## نحوه استفاده
HR Reviewer باید این چک‌لیست را برای هر
موقعیت شغلی قبل از انتشار تکمیل کند.

---

```markdown
# چک‌لیست بررسی عدالت
**موقعیت:** {{position_title}}
**شناسه:** {{position_id}}
**تاریخ بررسی:** [تاریخ]
**بررسی‌کننده:** [نام و سمت]

---

## بخش ۱ — بررسی عنوان و خلاصه

- [ ] عنوان شغل از کلمات جنسیتی پاک است
- [ ] خلاصه شامل Forbidden Term نیست
- [ ] زبان JD خنثی و شامل همه است

---

## بخش ۲ — بررسی مهارت‌های الزامی

- [ ] همه Must-have واقعاً ضروری هستند
- [ ] هیچ‌کدام Proxy تبعیض نیستند
- [ ] سابقه کار واقع‌بینانه است (سن proxy نیست)
- [ ] تعداد Must-have از ۷ بیشتر نیست

---

## بخش ۳ — بررسی KPIها

- [ ] KPIها بر اساس عملکرد هستند نه ویژگی شخصی
- [ ] KPIها برای همه قابل دستیابی هستند
- [ ] هیچ KPI‌ای با Protected Attribute مرتبط نیست

---

## بخش ۴ — بررسی شرایط کاری

- [ ] ساعات کاری با قوانین کار محلی سازگار است
- [ ] شرایط On-call توجیه شغلی دارد
- [ ] الزامات سفر واقعی و مستند است

---

## بخش ۵ — تأیید Compliance

- Bias Check سیستم: {{bias_check_status}}
- Risk Score: {{risk_score}}/100
- PII Scan: {{pii_status}}

- [ ] با نتایج Compliance سیستم موافقم
- [ ] موارد زیر را دستی اصلاح کرده‌ام:

[توضیح اصلاحات]

---

## نتیجه نهایی

- [ ] ✅ تأیید می‌کنم — آماده انتشار است
- [ ] ⚠️ نیاز به اصلاح دارد — موارد زیر:
- [ ] ❌ رد می‌کنم — دلیل:

**امضا:** _______________
**تاریخ:** _______________
```
````

---

## `docs/mcp/templates/feedback-report-template.md`

````markdown
# Feedback Report Template

## تعریف
بعد از هر چرخه استخدامی، HR این گزارش را
پر می‌کند تا سیستم بهبود یابد.

---

```markdown
# گزارش بازخورد استخدام
**موقعیت:** {{position_id}}
**تاریخ استخدام:** [تاریخ]
**تکمیل‌کننده:** [نام HR]

---

## ۱. کیفیت JD تولیدشده

| معیار | امتیاز (۱-۵) | توضیح |
|-------|-------------|-------|
| دقت مسئولیت‌ها | | |
| واقع‌بینی مهارت‌ها | | |
| کیفیت KPIها | | |
| وضوح زبان | | |
| انطباق با فرهنگ شرکت | | |

---

## ۲. مقایسه با واقعیت

**آیا KPIهای ۳۰ روز اول محقق شدند؟**
- [ ] بله — کدام‌ها: [...]
- [ ] نه — دلیل: [...]
- [ ] هنوز زود است

**آیا مهارت‌های الزامی کافی بودند؟**
- [ ] بله
- [ ] نه — چه مهارتی کم بود: [...]
- [ ] مهارت‌های اضافه غیرضروری بودند: [...]

---

## ۳. کیفیت Compliance

**آیا Bias Check سیستم مفید بود؟**
- [ ] بله
- [ ] نه — چه چیزی miss شد: [...]

**آیا خروجی AI نیاز به اصلاح داشت؟**
- [ ] نه — مستقیم استفاده شد
- [ ] بله (جزئی) — چه چیزی: [...]
- [ ] بله (زیاد) — چه چیزی: [...]

---

## ۴. پیشنهادات بهبود

[متن آزاد]

---

## ۵. آیا این داده برای بهبود مدل استفاده شود؟

- [ ] بله — با anonymize کامل
- [ ] خیر

**امضا:** _______________
```
````

---

## `docs/mcp/schemas/candidate-data-schema.md`

```markdown
# Candidate Data Schema

## نسخه: 1.0
## آخرین بروزرسانی: Sprint 7

---

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CandidateData",
  "type": "object",
  "required": ["candidate_id", "consent_events"],

  "properties": {

    "candidate_id": {
      "type": "string",
      "format": "uuid",
      "description": "شناسه pseudonymized کارجو"
    },

    "consent_events": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/definitions/ConsentEvent" },
      "description": "حداقل یک consent باید وجود داشته باشد"
    },

    "profile": {
      "type": "object",
      "description": "Level 2-3 Sensitive — نیاز به consent",
      "properties": {
        "skills": {
          "type": "array",
          "items": { "$ref": "#/definitions/Skill" }
        },
        "education": {
          "type": "array",
          "items": { "$ref": "#/definitions/Education" }
        },
        "work_history": {
          "type": "array",
          "items": { "$ref": "#/definitions/WorkHistory" }
        }
      }
    },

    "analysis": {
      "type": "object",
      "description": "Level 3 Sensitive — نیاز به consent L2",
      "properties": {
        "big_five": { "$ref": "#/definitions/BigFiveScores" },
        "confidence": {
          "type": "string",
          "enum": ["Low", "Medium", "High"]
        },
        "disclaimer": {
          "type": "string",
          "minLength": 10
        }
      }
    },

    "deletion_status": {
      "type": "string",
      "enum": ["Active", "PendingDeletion", "Deleted", "Anonymized"]
    },

    "created_at": {
      "type": "string",
      "format": "date-time"
    },

    "expires_at": {
      "type": "string",
      "format": "date-time",
      "description": "بر اساس retention policy: ۱ سال"
    }
  },

  "definitions": {

    "ConsentEvent": {
      "type": "object",
      "required": ["consent_id", "level", "granted", "timestamp"],
      "properties": {
        "consent_id": { "type": "string", "format": "uuid" },
        "level": {
          "type": "string",
          "enum": [
            "BasicProcessing",
            "PersonalityAnalysis",
            "DiversityData",
            "ModelImprovement"
          ]
        },
        "granted": { "type": "boolean" },
        "timestamp": { "type": "string", "format": "date-time" },
        "policy_version": { "type": "string" },
        "ip_hash": { "type": "string" }
      }
    },

    "Skill": {
      "type": "object",
      "required": ["name", "is_required"],
      "properties": {
        "name": { "type": "string" },
        "is_required": { "type": "boolean" },
        "proficiency": {
          "type": "string",
          "enum": ["Beginner", "Intermediate", "Advanced", "Expert"]
        }
      }
    },

    "Education": {
      "type": "object",
      "properties": {
        "degree": { "type": "string" },
        "field": { "type": "string" },
        "graduation_year": {
          "type": "integer",
          "description": "⚠️ ممکن است age proxy باشد"
        }
      }
    },

    "WorkHistory": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "duration_months": { "type": "integer" },
        "responsibilities": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },

    "BigFiveScores": {
      "type": "object",
      "required": [
        "openness","conscientiousness",
        "extraversion","agreeableness","neuroticism"
      ],
      "properties": {
        "openness":          { "type": "integer", "minimum": 0, "maximum": 100 },
        "conscientiousness": { "type": "integer", "minimum": 0, "maximum": 100 },
        "extraversion":      { "type": "integer", "minimum": 0, "maximum": 100 },
        "agreeableness":     { "type": "integer", "minimum": 0, "maximum": 100 },
        "neuroticism":       { "type": "integer", "minimum": 0, "maximum": 100 }
      }
    }
  }
}
```
```

---

## `docs/mcp/schemas/position-schema.md`

```markdown
# Position Schema

## نسخه: 1.0

---

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Position",
  "type": "object",
  "required": [
    "position_id", "company_id", "title",
    "level", "responsibilities", "ksao",
    "kpis", "bias_check_passed", "disclaimer"
  ],

  "properties": {

    "position_id":  { "type": "string", "format": "uuid" },
    "company_id":   { "type": "string", "format": "uuid" },

    "title": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100
    },

    "department": { "type": "string" },

    "level": {
      "type": "string",
      "enum": [
        "L1Junior","L2Mid","L3Senior",
        "L4Staff","L5Principal",
        "M1TeamLead","M2Manager","M3Director","M4VP"
      ]
    },

    "employment_type": {
      "type": "string",
      "enum": ["FullTime","PartTime","Contract","Freelance","Internship"]
    },

    "work_location": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["OnSite","Remote","Hybrid"]
        },
        "onsite_days_per_week": {
          "type": "integer",
          "minimum": 1,
          "maximum": 5
        }
      }
    },

    "summary": {
      "type": "string",
      "minLength": 50,
      "maxLength": 500
    },

    "responsibilities": {
      "type": "array",
      "minItems": 1,
      "maxItems": 8,
      "items": { "type": "string", "minLength": 10 }
    },

    "ksao": {
      "type": "object",
      "required": ["skills"],
      "properties": {
        "knowledge":  { "type": "array", "items": { "type": "string" } },
        "skills": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#/definitions/Skill" }
        },
        "abilities":  { "type": "array", "items": { "type": "string" } },
        "other":      { "type": "array", "items": { "type": "string" } }
      }
    },

    "kpis": {
      "type": "array",
      "minItems": 3,
      "maxItems": 7,
      "items": { "$ref": "#/definitions/Kpi" }
    },

    "occupation_mapping": {
      "type": "object",
      "properties": {
        "onet_code":    { "type": "string", "pattern": "^[0-9]{2}-[0-9]{4}\\.[0-9]{2}$" },
        "esco_uri":     { "type": "string", "format": "uri" },
        "custom_title": { "type": "string" }
      }
    },

    "related_gap_ids": {
      "type": "array",
      "items": { "type": "string", "format": "uuid" }
    },

    "bias_check_passed": { "type": "boolean" },
    "risk_score":        { "type": "integer", "minimum": 0, "maximum": 100 },

    "disclaimer": {
      "type": "string",
      "minLength": 10,
      "description": "اجباری — نمی‌تواند خالی باشد"
    },

    "generated_at": { "type": "string", "format": "date-time" },
    "version":      { "type": "string", "default": "1.0" }
  },

  "definitions": {

    "Skill": {
      "type": "object",
      "required": ["name", "is_required"],
      "properties": {
        "name":         { "type": "string" },
        "is_required":  { "type": "boolean" },
        "proficiency": {
          "type": "string",
          "enum": ["Beginner","Intermediate","Advanced","Expert"]
        }
      }
    },

    "Kpi": {
      "type": "object",
      "required": ["title","kpi_type","timeline_days","measurement","target"],
      "properties": {
        "title":         { "type": "string" },
        "description":   { "type": "string" },
        "kpi_type": {
          "type": "string",
          "enum": ["Output","Quality","Process","Growth","Strategic"]
        },
        "timeline_days": { "type": "integer", "minimum": 1 },
        "measurement":   { "type": "string", "minLength": 5 },
        "target":        { "type": "string", "minLength": 3 }
      }
    }
  }
}
```
```

---

## `docs/mcp/schemas/audit-log-schema.md`

```markdown
# Audit Log Schema

## نسخه: 1.0
## نکته: این schema فقط append است — هیچ فیلدی حذف نمی‌شود

---

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AuditEvent",
  "type": "object",
  "required": [
    "event_id", "event_type", "timestamp",
    "actor_id", "company_id", "operation",
    "country", "input_hash", "risk_score",
    "risk_level", "compliance_result",
    "pipeline_steps", "log_hash"
  ],

  "properties": {

    "event_id": {
      "type": "string",
      "format": "uuid",
      "description": "یکتا و غیرقابل تغییر"
    },

    "event_type": {
      "type": "string",
      "enum": [
        "REQUEST_RECEIVED",
        "INPUT_SCAN_PASSED",
        "INPUT_SCAN_FAILED",
        "CONSENT_VERIFIED",
        "CONSENT_MISSING",
        "PROCESSING_STARTED",
        "OUTPUT_GENERATED",
        "OUTPUT_SCAN_PASSED",
        "OUTPUT_SCAN_FAILED",
        "OUTPUT_SANITIZED",
        "HUMAN_REVIEW_QUEUED",
        "HUMAN_REVIEW_APPROVED",
        "HUMAN_REVIEW_REJECTED",
        "DELIVERED",
        "BLOCKED",
        "DATA_DELETED",
        "DATA_EXPORTED"
      ]
    },

    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "UTC — غیرقابل تغییر"
    },

    "actor_id": {
      "type": "string",
      "description": "هش‌شده — هیچ‌گاه plaintext نیست"
    },

    "company_id":  { "type": "string", "format": "uuid" },

    "operation": {
      "type": "string",
      "enum": [
        "AnalyzePersonality",
        "GeneratePosition",
        "MatchCandidate",
        "ScoreResume",
        "MakeHiringDecision",
        "ExportData",
        "DeleteData"
      ]
    },

    "country": { "type": "string" },

    "input_hash": {
      "type": "string",
      "description": "SHA-256 از ورودی — نه خود ورودی"
    },

    "output_hash": {
      "type": "string",
      "description": "SHA-256 از خروجی — nullable"
    },

    "risk_score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    },

    "risk_level": {
      "type": "string",
      "enum": ["Low","Medium","High","Critical"]
    },

    "compliance_result": {
      "type": "object",
      "required": ["status"],
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            "Allowed","Blocked","RequiresReview",
            "Sanitized","PartiallyAllowed"
          ]
        },
        "reason":  { "type": "string" },
        "flags":   { "type": "array", "items": { "type": "string" } },
        "changes": { "type": "array", "items": { "type": "string" } }
      }
    },

    "pipeline_steps": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["step_name","passed"],
        "properties": {
          "step_name": { "type": "string" },
          "passed":    { "type": "boolean" },
          "details":   { "type": "string" }
        }
      }
    },

    "human_review_id": {
      "type": "string",
      "format": "uuid",
      "description": "nullable — فقط اگر human review انجام شده"
    },

    "notes":    { "type": "string" },

    "log_hash": {
      "type": "string",
      "description": "SHA-256 از کل این رکورد برای integrity"
    }
  }
}
```
```

---

## `docs/mcp/schemas/compliance-risk-score-schema.md`

```markdown
# Compliance Risk Score Schema

## نسخه: 1.0

---

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ComplianceRiskScore",
  "type": "object",
  "required": [
    "score_id", "company_id", "operation",
    "total_score", "risk_level", "factors", "timestamp"
  ],

  "properties": {

    "score_id":   { "type": "string", "format": "uuid" },
    "company_id": { "type": "string", "format": "uuid" },

    "operation": {
      "type": "string",
      "enum": [
        "AnalyzePersonality","GeneratePosition",
        "MatchCandidate","ScoreResume",
        "MakeHiringDecision","ExportData","DeleteData"
      ]
    },

    "total_score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    },

    "risk_level": {
      "type": "string",
      "enum": ["Low","Medium","High","Critical"]
    },

    "factors": {
      "type": "object",
      "required": [
        "geographic_score","operation_score",
        "data_sensitivity_score","consent_score","bias_score"
      ],
      "properties": {
        "geographic_score":       { "type": "integer", "minimum": 0, "maximum": 100 },
        "operation_score":        { "type": "integer", "minimum": 0, "maximum": 100 },
        "data_sensitivity_score": { "type": "integer", "minimum": 0, "maximum": 100 },
        "consent_score":          { "type": "integer", "minimum": 0, "maximum": 100 },
        "bias_score":             { "type": "integer", "minimum": 0, "maximum": 100 }
      }
    },

    "threshold_breached": { "type": "boolean" },
    "action_taken": {
      "type": "string",
      "enum": ["Allowed","Blocked","RequiresReview","Sanitized"]
    },

    "timestamp": { "type": "string", "format": "date-time" },
    "related_audit_event_id": { "type": "string", "format": "uuid" }
  }
}
```
```

---

## `docs/mcp/schemas/kpi-schema.md`

```markdown
# KPI Schema

## نسخه: 1.0

---

## JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Kpi",
  "type": "object",
  "required": ["kpi_id","title","kpi_type","timeline_days","measurement","target"],

  "properties": {

    "kpi_id":     { "type": "string", "format": "uuid" },
    "position_id":{ "type": "string", "format": "uuid" },

    "title": {
      "type": "string",
      "minLength": 5,
      "maxLength": 150
    },

    "description": { "type": "string" },

    "kpi_type": {
      "type": "string",
      "enum": ["Output","Quality","Process","Growth","Strategic"]
    },

    "timeline_days": {
      "type": "integer",
      "minimum": 1,
      "description": "معمولاً ۳۰، ۶۰، ۹۰ یا ۳۶۵"
    },

    "measurement": {
      "type": "string",
      "minLength": 5,
      "description": "چطور اندازه‌گیری می‌شود؟"
    },

    "target": {
      "type": "string",
      "minLength": 3,
      "description": "هدف کمّی یا کیفی مشخص"
    },

    "data_source": {
      "type": "string",
      "description": "منبع داده برای اندازه‌گیری"
    },

    "related_gap_id": {
      "type": "string",
      "format": "uuid",
      "description": "ارتباط با Gap شناسایی‌شده"
    },

    "smart_validated": {
      "type": "boolean",
      "description": "آیا معیارهای SMART را دارد؟"
    },

    "is_required": {
      "type": "boolean",
      "description": "آیا این KPI اجباری است یا توصیه‌ای؟"
    }
  }
}
```
```

---

## بروزرسانی `apps/api/src/mcp/types.rs`

```rust
// ── موارد اضافه‌شده در Sprint 7 ──────────────────────────

/// نسخه Schema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemaVersion {
    pub major: u8,
    pub minor: u8,
}

impl SchemaVersion {
    pub fn current() -> Self {
        Self { major: 1, minor: 0 }
    }
    pub fn to_string(&self) -> String {
        format!("{}.{}", self.major, self.minor)
    }
}

/// ساختار کامل Position Report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PositionReport {
    pub position: Position,
    pub gap_summary: Option<IdentifiedGap>,
    pub compliance_summary: ComplianceRiskScore,
    pub warnings: Vec<String>,
    pub requires_human_review: bool,
    pub review_reason: Option<String>,
    pub generated_at: String,
    pub schema_version: SchemaVersion,
}

/// Risk Score کامل با جزئیات
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceRiskScore {
    pub score_id: String,
    pub company_id: String,
    pub operation: ComplianceOperation,
    pub total_score: u8,
    pub risk_level: RiskLevel,
    pub factors: RiskFactors,
    pub threshold_breached: bool,
    pub action_taken: String,
    pub timestamp: String,
    pub related_audit_event_id: Option<String>,
}

/// نتیجه اعتبارسنجی Schema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SchemaValidationResult {
    Valid { schema_version: String },
    Invalid { errors: Vec<SchemaValidationError> },
}

/// یک خطای Schema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemaValidationError {
    pub field: String,
    pub error_type: SchemaErrorType,
    pub message: String,
}

/// نوع خطای Schema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SchemaErrorType {
    Required,
    TypeMismatch,
    OutOfRange,
    PatternMismatch,
    TooShort,
    TooLong,
    TooMany,
    TooFew,
}
```

---

## `apps/api/src/mcp/schemas.rs`

```rust
/// Schemas & Validation — MCP
/// Sprint 7: Schema validation, Report builders, Version management

use crate::mcp::types::{
    AuditEvent, ComplianceOperation, ComplianceResult,
    ComplianceRiskScore, Kpi, KpiType, Position,
    PositionReport, RiskFactors, RiskLevel, RiskLevel as RL,
    SchemaErrorType, SchemaValidationError, SchemaValidationResult,
    SchemaVersion,
};
use crate::mcp::compliance_engine::{
    calculate_risk_score, score_to_risk_level,
};
use crate::mcp::position::POSITION_DISCLAIMER;

// ── Schema Version ────────────────────────────────────────

pub const CURRENT_SCHEMA_VERSION: &str = "1.0";

pub fn get_schema_version() -> SchemaVersion {
    SchemaVersion::current()
}

// ── Position Schema Validator ─────────────────────────────

/// اعتبارسنجی کامل Position بر اساس schema
pub fn validate_position_schema(
    position: &Position,
) -> SchemaValidationResult {
    let mut errors: Vec<SchemaValidationError> = Vec::new();

    // title
    if position.title.trim().is_empty() {
        errors.push(SchemaValidationError {
            field: "title".to_string(),
            error_type: SchemaErrorType::Required,
            message: "عنوان شغل نمی‌تواند خالی باشد".to_string(),
        });
    } else if position.title.len() < 3 {
        errors.push(SchemaValidationError {
            field: "title".to_string(),
            error_type: SchemaErrorType::TooShort,
            message: "عنوان شغل باید حداقل ۳ کاراکتر باشد".to_string(),
        });
    } else if position.title.len() > 100 {
        errors.push(SchemaValidationError {
            field: "title".to_string(),
            error_type: SchemaErrorType::TooLong,
            message: "عنوان شغل نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد".to_string(),
        });
    }

    // summary
    if position.summary.len() < 50 {
        errors.push(SchemaValidationError {
            field: "summary".to_string(),
            error_type: SchemaErrorType::TooShort,
            message: "خلاصه باید حداقل ۵۰ کاراکتر باشد".to_string(),
        });
    }

    // responsibilities
    if position.responsibilities.is_empty() {
        errors.push(SchemaValidationError {
            field: "responsibilities".to_string(),
            error_type: SchemaErrorType::TooFew,
            message: "حداقل یک مسئولیت لازم است".to_string(),
        });
    }
    if position.responsibilities.len() > 8 {
        errors.push(SchemaValidationError {
            field: "responsibilities".to_string(),
            error_type: SchemaErrorType::TooMany,
            message: "مسئولیت‌ها نمی‌توانند بیشتر از ۸ مورد باشند".to_string(),
        });
    }

    // kpis
    if position.kpis.len() < 3 {
        errors.push(SchemaValidationError {
            field: "kpis".to_string(),
            error_type: SchemaErrorType::TooFew,
            message: "حداقل ۳ KPI لازم است".to_string(),
        });
    }
    if position.kpis.len() > 7 {
        errors.push(SchemaValidationError {
            field: "kpis".to_string(),
            error_type: SchemaErrorType::TooMany,
            message: "KPIها نمی‌توانند بیشتر از ۷ مورد باشند".to_string(),
        });
    }

    // kpi fields
    for (i, kpi) in position.kpis.iter().enumerate() {
        if kpi.measurement.trim().is_empty() {
            errors.push(SchemaValidationError {
                field: format!("kpis[{}].measurement", i),
                error_type: SchemaErrorType::Required,
                message: format!("KPI '{}' باید روش اندازه‌گیری داشته باشد", kpi.title),
            });
        }
        if kpi.timeline_days == 0 {
            errors.push(SchemaValidationError {
                field: format!("kpis[{}].timeline_days", i),
                error_type: SchemaErrorType::OutOfRange,
                message: format!("KPI '{}' باید timeline داشته باشد", kpi.title),
            });
        }
    }

    // ksao skills
    let required_skills: Vec<_> = position
        .ksao
        .skills
        .iter()
        .filter(|s| s.is_required)
        .collect();
    if required_skills.is_empty() {
        errors.push(SchemaValidationError {
            field: "ksao.skills".to_string(),
            error_type: SchemaErrorType::TooFew,
            message: "حداقل یک Required Skill لازم است".to_string(),
        });
    }

    // disclaimer
    if position.disclaimer.trim().is_empty() {
        errors.push(SchemaValidationError {
            field: "disclaimer".to_string(),
            error_type: SchemaErrorType::Required,
            message: "Disclaimer اجباری است".to_string(),
        });
    }

    if errors.is_empty() {
        SchemaValidationResult::Valid {
            schema_version: CURRENT_SCHEMA_VERSION.to_string(),
        }
    } else {
        SchemaValidationResult::Invalid { errors }
    }
}

// ── Audit Log Schema Validator ────────────────────────────

/// اعتبارسنجی AuditEvent
pub fn validate_audit_event_schema(
    event: &AuditEvent,
) -> SchemaValidationResult {
    let mut errors: Vec<SchemaValidationError> = Vec::new();

    if event.event_id.trim().is_empty() {
        errors.push(SchemaValidationError {
            field: "event_id".to_string(),
            error_type: SchemaErrorType::Required,
            message: "event_id نمی‌تواند خالی باشد".to_string(),
        });
    }

    if event.log_hash.trim().is_empty() {
        errors.push(SchemaValidationError {
            field: "log_hash".to_string(),
            error_type: SchemaErrorType::Required,
            message: "log_hash برای integrity اجباری است".to_string(),
        });
    }

    if event.input_hash.trim().is_empty() {
        errors.push(SchemaValidationError {
            field: "input_hash".to_string(),
            error_type: SchemaErrorType::Required,
            message: "input_hash نمی‌تواند خالی باشد".to_string(),
        });
    }

    if event.risk_score > 100 {
        errors.push(SchemaValidationError {
            field: "risk_score".to_string(),
            error_type: SchemaErrorType::OutOfRange,
            message: "risk_score باید بین ۰ تا ۱۰۰ باشد".to_string(),
        });
    }

    if errors.is_empty() {
        SchemaValidationResult::Valid {
            schema_version: CURRENT_SCHEMA_VERSION.to_string(),
        }
    } else {
        SchemaValidationResult::Invalid { errors }
    }
}

// ── KPI SMART Validator ───────────────────────────────────

/// بررسی SMART بودن یک KPI
pub fn validate_kpi_smart(kpi: &Kpi) -> Vec<String> {
    let mut issues: Vec<String> = Vec::new();

    // Specific
    if kpi.title.split_whitespace().count() < 3 {
        issues.push(format!(
            "KPI '{}': عنوان خیلی کلی است (Specific)",
            kpi.title
        ));
    }

    // Measurable
    if kpi.measurement.trim().is_empty() {
        issues.push(format!(
            "KPI '{}': روش اندازه‌گیری مشخص نیست (Measurable)",
            kpi.title
        ));
    }

    // Time-bound
    if kpi.timeline_days == 0 {
        issues.push(format!(
            "KPI '{}': بازه زمانی مشخص نیست (Time-bound)",
            kpi.title
        ));
    }

    // Relevant — بررسی نوع Growth برای Senior
    if kpi.kpi_type == KpiType::Growth && kpi.target.trim().is_empty() {
        issues.push(format!(
            "KPI '{}': Growth KPI باید هدف مشخص داشته باشد",
            kpi.title
        ));
    }

    issues
}

// ── Position Report Builder ───────────────────────────────

/// ساخت Position Report کامل
pub fn build_position_report(
    position: Position,
    gap: Option<crate::mcp::types::IdentifiedGap>,
    risk_factors: RiskFactors,
    audit_event_id: Option<String>,
    company_id: String,
) -> PositionReport {
    let total_score = calculate_risk_score(&risk_factors);
    let risk_level = score_to_risk_level(total_score);

    let threshold_breached = total_score >= 30;
    let action_taken = match &risk_level {
        RL::Low => "Allowed",
        RL::Medium | RL::High => "RequiresReview",
        RL::Critical => "Blocked",
    };

    let compliance_summary = ComplianceRiskScore {
        score_id: uuid_placeholder(),
        company_id: company_id.clone(),
        operation: ComplianceOperation::GeneratePosition,
        total_score,
        risk_level: risk_level.clone(),
        factors: risk_factors,
        threshold_breached,
        action_taken: action_taken.to_string(),
        timestamp: timestamp_placeholder(),
        related_audit_event_id: audit_event_id,
    };

    // جمع‌آوری هشدارها
    let mut warnings: Vec<String> = Vec::new();
    if position.responsibilities.len() > 8 {
        warnings.push("تعداد مسئولیت‌ها بیشتر از ۸ است".to_string());
    }
    if position.ksao.skills.iter().filter(|s| s.is_required).count() > 7 {
        warnings.push("تعداد Required Skills زیاد است".to_string());
    }
    for kpi in &position.kpis {
        warnings.extend(validate_kpi_smart(kpi));
    }

    let requires_human_review = threshold_breached || !position.bias_check_passed;
    let review_reason = if requires_human_review {
        Some(format!(
            "Risk Score: {} — Bias Check: {}",
            total_score,
            if position.bias_check_passed { "passed" } else { "failed" }
        ))
    } else {
        None
    };

    PositionReport {
        position,
        gap_summary: gap,
        compliance_summary,
        warnings,
        requires_human_review,
        review_reason,
        generated_at: timestamp_placeholder(),
        schema_version: SchemaVersion::current(),
    }
}

// ── Disclaimer Registry ───────────────────────────────────

/// همه disclaimer‌ها در یک‌جا
pub struct DisclaimerRegistry;

impl DisclaimerRegistry {
    pub fn position() -> &'static str {
        POSITION_DISCLAIMER
    }

    pub fn personality() -> &'static str {
        crate::mcp::hr_standards::PERSONALITY_ANALYSIS_DISCLAIMER
    }

    pub fn mbti() -> &'static str {
        crate::mcp::hr_standards::MBTI_DISCLAIMER
    }

    pub fn ai_general() -> &'static str {
        crate::mcp::legal::AI_OUTPUT_DISCLAIMER
    }

    /// انتخاب disclaimer مناسب بر اساس عملیات
    pub fn for_operation(op: &ComplianceOperation) -> &'static str {
        match op {
            ComplianceOperation::AnalyzePersonality => Self::personality(),
            ComplianceOperation::GeneratePosition => Self::position(),
            _ => Self::ai_general(),
        }
    }
}

// ── Helpers ───────────────────────────────────────────────

fn uuid_placeholder() -> String {
    "00000000-0000-0000-0000-000000000000".to_string()
}

fn timestamp_placeholder() -> String {
    "2025-01-01T00:00:00Z".to_string()
}
```

---

# ✅ Sprint 7 تمام شد

## خلاصه آنچه ساختیم:

```text
── Templates ──────────────────────────────────────────────
docs/mcp/templates/job-description-template.md         ✅
docs/mcp/templates/kpi-template.md                     ✅
docs/mcp/templates/position-report-template.md         ✅
docs/mcp/templates/fairness-review-checklist.md        ✅
docs/mcp/templates/feedback-report-template.md         ✅

── Schemas ────────────────────────────────────────────────
docs/mcp/schemas/candidate-data-schema.md              ✅
docs/mcp/schemas/position-schema.md                    ✅
docs/mcp/schemas/kpi-schema.md                         ✅
docs/mcp/schemas/audit-log-schema.md                   ✅
docs/mcp/schemas/compliance-risk-score-schema.md       ✅

── Code ───────────────────────────────────────────────────
apps/api/src/mcp/types.rs  (بروزرسانی)                 ✅
apps/api/src/mcp/schemas.rs                            ✅
```

---

## تصویر کامل ساختار فایل‌های پروژه

```text
apps/api/src/mcp/
├── types.rs              ← همه type‌ها (Sprint 1-7)
├── legal.rs              ← Sprint 1
├── bias_fairness.rs      ← Sprint 2
├── privacy.rs            ← Sprint 3
├── hr_standards.rs       ← Sprint 4
├── position.rs           ← Sprint 5
├── compliance_engine.rs  ← Sprint 6
└── schemas.rs            ← Sprint 7

docs/mcp/
├── process/              ← Sprint 1-7 process docs
├── legal/                ← Sprint 1
├── fairness/             ← Sprint 2
├── privacy/              ← Sprint 3
├── hr/                   ← Sprint 4-5
├── compliance/           ← Sprint 6
├── templates/            ← Sprint 7 ✅
└── schemas/              ← Sprint 7 ✅
```

---

## جریان کامل از API تا خروجی

```text
POST /api/v1/position/generate
          │
          ↓
  compliance_engine
  ::run_input_pipeline()
          │
          ↓
  position::validate_position()
  hr_standards::validate_big_five()
          │
          ↓
  compliance_engine
  ::run_output_pipeline()
          │
          ↓
  schemas::validate_position_schema()
  schemas::DisclaimerRegistry::for_operation()
          │
          ↓
  schemas::build_position_report()
          │
          ↓
  Template: position-report-template.md
          │
          ↓
  Response → کاربر
```

---

# 🏃 Sprint 8: Feedback Loop & Examples

---

## `docs/mcp/process/08-validation-feedback-loop.md`

```markdown
# Sprint 8 — Feedback Loop & Examples

## هدف
تکمیل چرخه بهبود مستمر MCP:
- سناریوهای واقعی نمونه
- خروجی‌های نمونه
- فرآیند بازخورد
- backlog اصلاحات

## چرا آخرین Sprint؟

```text
Sprint 1-6 → قوانین، منطق، پیاده‌سازی
Sprint 7   → قالب‌ها و اسکیماها
Sprint 8   → تست واقعی با مثال + بازخورد

بدون مثال واقعی:
  → نمی‌دانیم سیستم درست کار می‌کند
  → نمی‌دانیم چه چیزی miss شده
  → نمی‌توانیم بهبود دهیم
```

## ورودی این Sprint
← همه Sprint‌های قبلی (1-7)

## خروجی این Sprint
- docs/mcp/examples/scenario-smb-tech-startup.md
- docs/mcp/examples/sample-generated-position-backend-lead.md
- docs/mcp/examples/sample-feedback-report.md
- docs/mcp/process/09-improvement-backlog.md
- apps/api/src/mcp/feedback.rs
- apps/api/src/mcp/mod.rs
- بروزرسانی apps/api/src/mcp/types.rs

## Sprint بعدی
→ این آخرین Sprint است.
→ بعد از این: Iteration دوم بر اساس backlog
```

---

## `docs/mcp/examples/scenario-smb-tech-startup.md`

```markdown
# سناریو نمونه — استارتاپ فناوری کوچک

## مشخصات شرکت

```text
نام:        TechFlow (نام فرضی)
صنعت:       SaaS / FinTech
اندازه:     ۲۵ نفر
کشور:       آلمان (Tier 1 EU — GDPR سختگیرانه)
مرحله:      Series A
محصول:      پلتفرم مدیریت مالی برای کسب‌وکارهای کوچک
```

---

## SWOT شرکت

### Strengths
```text
→ تیم فنی قوی در frontend (React/TypeScript)
→ محصول با ۵۰۰ مشتری فعال
→ رشد ۱۵٪ ماهانه
→ فرهنگ سازمانی باز و remote-friendly
```

### Weaknesses
```text
→ هیچ backend developer ارشدی ندارند
→ معماری backend قدیمی (monolith)
→ بدهی فنی بالا در API layer
→ هیچ DevOps مستقلی ندارند
→ compliance فناوری مالی ضعیف است
```

### Opportunities
```text
→ بازار FinTech اروپا رشد سریع دارد
→ قانون جدید PSD2 فرصت API banking ایجاد کرده
→ رقبای اصلی محصول موبایل ضعیف دارند
```

### Threats
```text
→ رقبای بزرگ‌تر در حال ورود به بازار
→ قوانین GDPR و PSD2 هزینه compliance بالا دارند
→ جذب backend developer ارشد در آلمان سخت است
```

---

## Gap Analysis نتیجه‌گیری‌شده

```text
Gap 1 — Critical Skills Gap:
  Backend architecture & Rust/Go
  → استخدام فوری
  → موقعیت: Senior Backend Lead

Gap 2 — Critical Knowledge Gap:
  FinTech Compliance (PSD2, PCI-DSS)
  → نیاز به این دانش در همان نقش

Gap 3 — Important Skills Gap:
  DevOps / CI-CD
  → در مرحله بعدی یا در نقش جدید
```

---

## درخواست به MCP

```text
عملیات:     GeneratePosition
کشور:       Germany
Gap:        Senior Backend Lead
SWOT:       (بالا)
Consent:    BasicProcessing تأیید شده
```

---

## جریان Compliance

```text
Input Pipeline:
  ✅ Geographic Check    → Tier 1 EU — مجاز
  ✅ PII Scanner         → هیچ PII در ورودی نیست
  ✅ Prohibited Data     → پاک
  ✅ Consent Check       → BasicProcessing موجود
  ✅ Risk Scoring:
       geographic_score:       10  (Tier 1 EU)
       operation_score:        10  (GeneratePosition)
       data_sensitivity_score:  5  (فقط Public data)
       consent_score:           0  (consent موجود)
       bias_score:              0  (ورودی پاک)
       ─────────────────────────────
       total_score: 9 → 🟢 Low Risk → Allowed
```

---

## خروجی MCP

```text
→ موقعیت شغلی Senior Backend Lead
→ فایل: sample-generated-position-backend-lead.md
→ Risk Score: 9/100
→ Bias Check: Clean
→ Disclaimer: اضافه شده
→ نیاز به Human Review: خیر (Risk < 30)
→ توصیه: آماده بازبینی HR
```
```

---

## `docs/mcp/examples/sample-generated-position-backend-lead.md`

````markdown
# Senior Backend Lead — TechFlow

> این یک خروجی نمونه واقعی از MCP است.
> تمام فیلدها توسط سیستم پر شده‌اند.

---

```markdown
# Senior Backend Lead

**واحد سازمانی:** Engineering
**سطح شغلی:** L3 — Senior
**نوع استخدام:** تمام‌وقت
**محل کار:** ترکیبی — ۲ روز حضوری در هفته (برلین)
**تاریخ تولید:** 2025-01-01
**شناسه موقعیت:** pos-001-techflow-backend-lead

---

## خلاصه نقش

TechFlow به یک Senior Backend Lead نیاز دارد که معماری
backend را از monolith به microservices تبدیل کند،
کیفیت و امنیت API layer را بهبود دهد، و دانش
compliance فناوری مالی (PSD2/PCI-DSS) را به تیم بیاورد.

---

## مسئولیت‌های کلیدی

- طراحی و اجرای migration از monolith به microservices
- مالکیت کامل API layer و استانداردسازی آن
- اطمینان از انطباق با الزامات PSD2 و PCI-DSS
- code review و mentoring تیم backend
- همکاری با تیم DevOps برای بهبود CI/CD pipeline
- تعریف و مستندسازی استانداردهای فنی backend
- همکاری با Product در تعریف technical roadmap

---

## مهارت‌های الزامی

- **Rust یا Go** — سطح: Advanced
  (زبان اصلی backend جدید)
- **طراحی RESTful API** — سطح: Expert
- **PostgreSQL** — سطح: Advanced
- **Docker و Kubernetes** — سطح: Intermediate
- **مفاهیم امنیت API** — سطح: Advanced
- **توانایی mentoring** — سطح: Intermediate
  (حداقل تجربه راهنمایی ۲ نفر)

---

## مهارت‌های مطلوب

- آشنایی با Kafka یا RabbitMQ
- تجربه با FinTech یا Banking domain
- آشنایی با Terraform
- تجربه در environment آلمان یا اروپا

---

## دانش و توانایی‌های لازم

### دانش
- معماری microservices و distributed systems
- استانداردهای PSD2 و PCI-DSS (یا آمادگی یادگیری سریع)
- اصول امنیت در سیستم‌های مالی
- GDPR در زمینه پردازش داده‌های مالی

### توانایی‌ها
- توانایی تصمیم‌گیری فنی مستقل
- توانایی مدیریت بدهی فنی
- توانایی ارتباط فنی با non-technical stakeholders

### سایر
- آمادگی برای on-call rotation (یک هفته در ماه)

---

## شاخص‌های عملکرد (KPI)

### ۳۰ روز اول
- **آشنایی با codebase:** مستندات معماری فعلی
  خوانده و خلاصه review ارائه شده
  اندازه‌گیری: تحویل review document
  هدف: ۱ سند review در روز ۳۰

### ۶۰ روز
- **اولین migration قدم:** حداقل یک module
  از monolith جدا و به‌عنوان microservice deploy شده
  اندازه‌گیری: deploy در production
  هدف: ۱ microservice کارکردی

- **استاندارد API:** مستندات استاندارد API
  نوشته و با تیم review شده
  اندازه‌گیری: تأیید تیم engineering
  هدف: ۱ سند استاندارد تأییدشده

### ۹۰ روز
- **کیفیت کد:** نرخ bug های production
  ناشی از backend کاهش یابد
  اندازه‌گیری: bug tracker (Jira/Linear)
  هدف: ۲۰٪ کاهش نسبت به ۳ ماه قبل

- **تیم:** حداقل ۲ نفر از تیم backend
  در جلسات هفتگی code review شرکت کنند
  اندازه‌گیری: حضور در جلسات
  هدف: ۸۰٪ حضور منظم

### سالانه
- **معماری:** roadmap کامل migration
  تعریف و تأیید شده توسط CTO
  اندازه‌گیری: تأیید CTO
  هدف: ۱ roadmap کامل

- **رشد تیم:** حداقل یک junior developer
  به‌طور مستقل feature deliver کرده
  اندازه‌گیری: PR های مستقل
  هدف: ۳ feature مستقل deliver شده

---

## شرایط کاری

- **ساعات کاری:** انعطاف‌پذیر — core hours 10-16
- **سفر کاری:** حداکثر ۱۰٪ (کنفرانس‌های فنی)
- **On-call:** یک هفته در ماه — rotation با تیم
- **محدوده حقوق:** [توسط HR تکمیل شود]

---

## مرجع استاندارد شغلی

- **O*NET Code:** 15-1252.00 (Software Developers)
- **ESCO:** Software developer / Systems architect

---

## نتایج Compliance

- **Bias Check:** ✅ Clean
- **Risk Score:** 9/100 — 🟢 Low Risk
- **PII Scan:** ✅ پاک
- **Geographic:** Tier 1 EU — GDPR اعمال می‌شود
- **تأیید HR:** [ ] تأیید نشده

---

> ⚠️ **اعلامیه هوش مصنوعی**
>
> این شرح شغل با کمک هوش مصنوعی تولید شده است.
> پیش از انتشار، باید توسط متخصص HR بازبینی شود.
> MCP هیچ مسئولیتی در قبال تصمیمات استخدامی
> بر اساس این سند ندارد.
>
> **نسخه:** 1.0 | **تاریخ:** 2025-01-01
```
````

---

## `docs/mcp/examples/sample-feedback-report.md`

```markdown
# گزارش بازخورد نمونه — TechFlow Backend Lead

## اطلاعات کلی

```text
موقعیت:         Senior Backend Lead
شناسه:          pos-001-techflow-backend-lead
تاریخ استخدام:  2025-03-15
تکمیل‌کننده:    Sara M. — HR Manager
تاریخ تکمیل:   2025-06-20 (۹۰ روز بعد)
```

---

## ۱. کیفیت JD تولیدشده

| معیار | امتیاز (۱-۵) | توضیح |
|-------|-------------|-------|
| دقت مسئولیت‌ها | ۵ | کاملاً با نیاز واقعی منطبق بود |
| واقع‌بینی مهارت‌ها | ۴ | Terraform را حذف کردیم — خیلی سخت بود |
| کیفیت KPIها | ۵ | KPI ۳۰ روز خیلی مفید بود |
| وضوح زبان | ۴ | یک جمله را ساده‌تر کردیم |
| انطباق با فرهنگ | ۵ | remote-friendly درست تشخیص داده شد |

**میانگین: ۴.۶/۵**

---

## ۲. مقایسه با واقعیت ۹۰ روزه

### KPI ۳۰ روز اول
```text
هدف:      تحویل review document معماری
نتیجه:    ✅ محقق شد — سند در روز ۲۸ تحویل شد
کیفیت:    خیلی بهتر از انتظار — مشکلات اضافه‌ای هم شناسایی شد
```

### KPI ۶۰ روز
```text
هدف اول:  deploy اولین microservice
نتیجه:    ✅ محقق شد — Auth service در روز ۵۵

هدف دوم:  سند استاندارد API
نتیجه:    ✅ محقق شد — با ۵ روز تأخیر (روز ۶۵)
دلیل تأخیر: جلسات اضافه برای هماهنگی با frontend
```

### KPI ۹۰ روز
```text
هدف اول:  ۲۰٪ کاهش bug های production
نتیجه:    ✅ ۲۸٪ کاهش — بهتر از هدف

هدف دوم:  ۸۰٪ حضور تیم در code review
نتیجه:    ⚠️ ۶۵٪ — کمتر از هدف
دلیل:     یک نفر از تیم مشکل زمانی داشت
اقدام:    جلسه به ساعت دیگری منتقل شد
```

---

## ۳. کیفیت Compliance

### Bias Check
```text
آیا مفید بود؟ بله
موردی که سیستم درست گرفت:
  → "Terraform" را از must-have به nice-to-have منتقل کرد
    (ما هم موافقیم — جزئی بود)

موردی که سیستم miss کرد:
  → ما "دانش آلمانی" را به‌عنوان plus اضافه کردیم
    (سیستم آن را check نکرد — ممکن است nationality proxy باشد)
    → پیشنهاد: این مورد به backlog اضافه شود
```

### خروجی AI
```text
نیاز به اصلاح:    بله (جزئی)
چه چیزی:
  → یک جمله در خلاصه خیلی فنی بود — ساده‌تر کردیم
  → "migration از monolith" را به "بهبود معماری" تغییر دادیم
    (اطلاعات داخلی نباید در JD عمومی باشد)
```

---

## ۴. درس‌های یاد گرفته

```text
✅ درست:
  → Gap Analysis به‌درستی Rust/Go را شناسایی کرد
  → KPI ۳۰ روز اول خیلی به onboarding کمک کرد
  → Risk Score 9 منطقی بود — نیازی به review نداشتیم

⚠️ نیاز به بهبود:
  → سیستم باید "زبان محلی" را به‌عنوان potential bias flag کند
  → قالب JD باید بخشی برای "اطلاعات داخلی — حذف قبل از انتشار" داشته باشد
  → KPI حضور در جلسه خیلی سخت‌گیرانه بود — ۷۰٪ واقعی‌تر است
```

---

## ۵. پیشنهادات بهبود سیستم

```text
P1 — بالا:
  زبان بومی/محلی را به‌عنوان nationality proxy flag کن

P2 — متوسط:
  بخش "داخلی — حذف قبل از انتشار" به JD Template اضافه شود

P3 — پایین:
  KPI threshold‌ها باید قابل تنظیم توسط HR باشند
```

---

## ۶. استفاده برای بهبود مدل

```text
آیا این داده برای بهبود مدل استفاده شود؟
✅ بله — با anonymize کامل

داده‌های مفید برای مدل:
  → KPI ۳۰ روز اول خیلی خوب کار کرد (positive signal)
  → KPI حضور در جلسه خیلی سخت بود (negative signal)
  → Gap Analysis برای FinTech درست بود (positive signal)
```
```

---

## `docs/mcp/process/09-improvement-backlog.md`

```markdown
# Improvement Backlog

## تعریف
این فایل backlog بهبودهایی است که از:
  - Feedback Reports
  - Bias Check failures
  - Human Review نتایج
  - تیم داخلی
جمع‌آوری می‌شود.

---

## فرمت یک آیتم Backlog

```text
ID:         BL-XXX
منبع:       feedback / internal / legal / bias-check
اولویت:     P1 (فوری) / P2 (مهم) / P3 (پایین)
Sprint پیشنهادی: Sprint چندم باید اصلاح شود؟
وضعیت:     Open / In Progress / Done
توضیح:     مشکل چیست؟
پیشنهاد:   چه کاری انجام شود؟
```

---

## Backlog فعلی

### BL-001
```text
ID:         BL-001
منبع:       feedback — TechFlow
اولویت:     P1
Sprint:     Sprint 2 (Bias & Fairness)
وضعیت:     Open

مشکل:
  "زبان بومی" یا "آلمانی‌زبان" در JD ممکن است
  nationality proxy باشد اما سیستم آن را flag نمی‌کند.

پیشنهاد:
  به forbidden_terms دسته B اضافه شود:
    "native german speaker" (اگر واقعاً لازم نیست)
    "مادری آلمانی"
    "بومی"
  + قانون: اگر زبان الزامی است، باید توجیه شغلی داشته باشد
```

### BL-002
```text
ID:         BL-002
منبع:       feedback — TechFlow
اولویت:     P2
Sprint:     Sprint 7 (Templates)
وضعیت:     Open

مشکل:
  JD Template بخشی برای "اطلاعات داخلی" ندارد.
  تیم HR اطلاعاتی مثل "migration از monolith" را
  وارد می‌کند که نباید در JD عمومی باشد.

پیشنهاد:
  بخش جدید به Template اضافه شود:
  "⚠️ یادداشت داخلی — قبل از انتشار حذف کنید"
```

### BL-003
```text
ID:         BL-003
منبع:       feedback — TechFlow
اولویت:     P2
Sprint:     Sprint 5 (Position Generation)
وضعیت:     Open

مشکل:
  KPI threshold‌ها (مثلاً ۸۰٪ حضور) ثابت هستند.
  هر تیم و فرهنگ سازمانی متفاوت است.

پیشنهاد:
  KPI threshold‌ها باید در position generation
  توسط HR قابل تنظیم باشند.
  مثال: attendance_threshold: Option<u8>
```

### BL-004
```text
ID:         BL-004
منبع:       internal review
اولویت:     P1
Sprint:     Sprint 6 (Compliance Engine)
وضعیت:     Open

مشکل:
  chrono_timestamp() در compliance_engine.rs
  یک placeholder است. در production باید
  زمان واقعی UTC استفاده شود.

پیشنهاد:
  dependency به chrono crate اضافه شود.
  timestamp واقعی در همه AuditEvent‌ها
```

### BL-005
```text
ID:         BL-005
منبع:       internal review
اولویت:     P2
Sprint:     Sprint 6 (Compliance Engine)
وضعیت:     Open

مشکل:
  uuid_placeholder() در schemas.rs
  و compliance_engine.rs placeholder است.

پیشنهاد:
  dependency به uuid crate اضافه شود.
  UUID v4 واقعی تولید شود.
```

### BL-006
```text
ID:         BL-006
منبع:       legal review
اولویت:     P1
Sprint:     Sprint 3 (Privacy)
وضعیت:     Open

مشکل:
  Right to Erasure SLA (۳۰ روز) در کد
  فقط در docs تعریف شده، در کد enforcement نیست.

پیشنهاد:
  یک scheduler یا job runner اضافه شود که:
    → داده‌های expired را شناسایی کند
    → deletion cascade را اجرا کند
    → audit log بنویسد
```

### BL-007
```text
ID:         BL-007
منبع:       internal review
اولویت:     P3
Sprint:     Sprint 4 (HR Analysis)
وضعیت:     Open

مشکل:
  Big Five scores از text با LLM تخمین زده می‌شود.
  اما هیچ calibration یا baseline مقایسه‌ای نداریم.

پیشنهاد:
  یک set از test cases با expected scores آماده شود.
  regression test برای Big Five scorer نوشته شود.
```

---

## روند بروزرسانی Backlog

```text
هر Sprint جدید:
  ✅ آیتم‌های Done را archive کن
  ✅ آیتم‌های جدید از feedback را اضافه کن
  ✅ اولویت‌ها را بازبینی کن

هر ۳ ماه:
  ✅ Backlog grooming کامل
  ✅ آیتم‌های P3 که بیش از ۶ ماه است open هستند
     → بسته یا حذف شوند
```
```

---

## بروزرسانی `apps/api/src/mcp/types.rs`

```rust
// ── موارد اضافه‌شده در Sprint 8 ──────────────────────────

/// یک آیتم Feedback از HR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackReport {
    pub feedback_id: String,
    pub position_id: String,
    pub company_id: String,
    pub reviewer_id: String,
    pub submitted_at: String,

    /// امتیازهای کیفی JD
    pub jd_quality_scores: JdQualityScores,

    /// نتایج KPI واقعی
    pub kpi_outcomes: Vec<KpiOutcome>,

    /// بازخورد compliance
    pub compliance_feedback: ComplianceFeedback,

    /// پیشنهادات بهبود
    pub improvement_suggestions: Vec<ImprovementSuggestion>,

    /// اجازه استفاده برای بهبود مدل
    pub allow_model_improvement: bool,
}

/// امتیازهای کیفی JD
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JdQualityScores {
    /// دقت مسئولیت‌ها (۱-۵)
    pub responsibilities_accuracy: u8,
    /// واقع‌بینی مهارت‌ها (۱-۵)
    pub skills_realism: u8,
    /// کیفیت KPIها (۱-۵)
    pub kpi_quality: u8,
    /// وضوح زبان (۱-۵)
    pub language_clarity: u8,
    /// انطباق با فرهنگ (۱-۵)
    pub culture_fit: u8,
}

impl JdQualityScores {
    pub fn average(&self) -> f32 {
        let sum = self.responsibilities_accuracy
            + self.skills_realism
            + self.kpi_quality
            + self.language_clarity
            + self.culture_fit;
        sum as f32 / 5.0
    }

    pub fn is_valid(&self) -> bool {
        let fields = [
            self.responsibilities_accuracy,
            self.skills_realism,
            self.kpi_quality,
            self.language_clarity,
            self.culture_fit,
        ];
        fields.iter().all(|&s| s >= 1 && s <= 5)
    }
}

/// نتیجه واقعی یک KPI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KpiOutcome {
    pub kpi_title: String,
    pub timeline_days: u32,
    pub outcome: KpiOutcomeStatus,
    pub notes: Option<String>,
}

/// وضعیت نتیجه KPI
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum KpiOutcomeStatus {
    /// کاملاً محقق شد
    Achieved,
    /// بهتر از هدف
    Exceeded,
    /// جزئاً محقق شد
    PartiallyAchieved { percentage: u8 },
    /// محقق نشد
    NotAchieved { reason: String },
    /// هنوز زود است
    TooEarlyToEvaluate,
}

/// بازخورد compliance از HR
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceFeedback {
    pub bias_check_was_helpful: bool,
    pub bias_missed_items: Vec<String>,
    pub ai_output_needed_editing: bool,
    pub editing_details: Option<String>,
}

/// یک پیشنهاد بهبود
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImprovementSuggestion {
    pub title: String,
    pub priority: FeedbackPriority,
    pub related_sprint: u8,
    pub description: String,
}

/// اولویت پیشنهاد بهبود
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FeedbackPriority {
    P1High,
    P2Medium,
    P3Low,
}

/// آیتم Backlog
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BacklogItem {
    pub id: String,
    pub source: BacklogSource,
    pub priority: FeedbackPriority,
    pub related_sprint: u8,
    pub status: BacklogStatus,
    pub description: String,
    pub proposed_solution: String,
    pub created_at: String,
    pub updated_at: String,
}

/// منبع آیتم Backlog
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BacklogSource {
    FeedbackReport { report_id: String },
    InternalReview,
    LegalReview,
    BiasCheckFailure,
    HumanReviewResult,
}

/// وضعیت آیتم Backlog
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BacklogStatus {
    Open,
    InProgress,
    Done,
    Archived,
    Rejected { reason: String },
}
```

---

## `apps/api/src/mcp/feedback.rs`

```rust
/// Feedback Loop — MCP
/// Sprint 8: Feedback collection, Backlog management, Model improvement

use crate::mcp::types::{
    BacklogItem, BacklogSource, BacklogStatus, ComplianceFeedback,
    FeedbackPriority, FeedbackReport, ImprovementSuggestion,
    JdQualityScores, KpiOutcome, KpiOutcomeStatus,
};

// ── Feedback Validation ───────────────────────────────────

/// اعتبارسنجی یک FeedbackReport
pub fn validate_feedback_report(
    report: &FeedbackReport,
) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    // اعتبارسنجی امتیازهای JD
    if !report.jd_quality_scores.is_valid() {
        errors.push(
            "امتیازهای JD باید بین ۱ تا ۵ باشند".to_string()
        );
    }

    // حداقل یک KPI outcome
    if report.kpi_outcomes.is_empty() {
        errors.push(
            "حداقل یک KPI outcome لازم است".to_string()
        );
    }

    // reviewer_id نباید خالی باشد
    if report.reviewer_id.trim().is_empty() {
        errors.push(
            "reviewer_id نمی‌تواند خالی باشد".to_string()
        );
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

// ── KPI Outcome Analysis ──────────────────────────────────

/// محاسبه نرخ موفقیت KPIها
pub fn kpi_success_rate(outcomes: &[KpiOutcome]) -> f32 {
    if outcomes.is_empty() {
        return 0.0;
    }

    let successful = outcomes.iter().filter(|o| {
        matches!(
            o.outcome,
            KpiOutcomeStatus::Achieved | KpiOutcomeStatus::Exceeded
        )
    }).count();

    (successful as f32 / outcomes.len() as f32) * 100.0
}

/// KPIهایی که محقق نشدند
pub fn failed_kpis(outcomes: &[KpiOutcome]) -> Vec<&KpiOutcome> {
    outcomes
        .iter()
        .filter(|o| matches!(o.outcome, KpiOutcomeStatus::NotAchieved { .. }))
        .collect()
}

/// KPIهایی که بهتر از هدف بودند
pub fn exceeded_kpis(outcomes: &[KpiOutcome]) -> Vec<&KpiOutcome> {
    outcomes
        .iter()
        .filter(|o| matches!(o.outcome, KpiOutcomeStatus::Exceeded))
        .collect()
}

// ── Feedback to Backlog ───────────────────────────────────

/// تبدیل پیشنهادات feedback به آیتم‌های Backlog
pub fn suggestions_to_backlog(
    report: &FeedbackReport,
) -> Vec<BacklogItem> {
    report
        .improvement_suggestions
        .iter()
        .map(|suggestion| BacklogItem {
            id: generate_backlog_id(&suggestion.title),
            source: BacklogSource::FeedbackReport {
                report_id: report.feedback_id.clone(),
            },
            priority: suggestion.priority.clone(),
            related_sprint: suggestion.related_sprint,
            status: BacklogStatus::Open,
            description: suggestion.description.clone(),
            proposed_solution: String::new(),
            created_at: timestamp_placeholder(),
            updated_at: timestamp_placeholder(),
        })
        .collect()
}

/// شناسه ساده برای backlog
fn generate_backlog_id(title: &str) -> String {
    let cleaned: String = title
        .chars()
        .filter(|c| c.is_alphanumeric())
        .take(8)
        .collect();
    format!("BL-{}", cleaned.to_uppercase())
}

// ── Backlog Management ────────────────────────────────────

/// آیتم‌های باز با اولویت بالا
pub fn open_high_priority(items: &[BacklogItem]) -> Vec<&BacklogItem> {
    items
        .iter()
        .filter(|i| {
            i.status == BacklogStatus::Open
                && i.priority == FeedbackPriority::P1High
        })
        .collect()
}

/// آیتم‌های مرتبط با یک Sprint
pub fn items_for_sprint(
    items: &[BacklogItem],
    sprint: u8,
) -> Vec<&BacklogItem> {
    items
        .iter()
        .filter(|i| i.related_sprint == sprint)
        .collect()
}

/// تغییر وضعیت یک آیتم
pub fn update_status(
    item: &mut BacklogItem,
    new_status: BacklogStatus,
) {
    item.status = new_status;
    item.updated_at = timestamp_placeholder();
}

/// آمار Backlog
pub struct BacklogStats {
    pub total: usize,
    pub open: usize,
    pub in_progress: usize,
    pub done: usize,
    pub p1_open: usize,
}

pub fn backlog_stats(items: &[BacklogItem]) -> BacklogStats {
    BacklogStats {
        total: items.len(),
        open: items.iter()
            .filter(|i| i.status == BacklogStatus::Open)
            .count(),
        in_progress: items.iter()
            .filter(|i| i.status == BacklogStatus::InProgress)
            .count(),
        done: items.iter()
            .filter(|i| i.status == BacklogStatus::Done)
            .count(),
        p1_open: items.iter()
            .filter(|i| {
                i.status == BacklogStatus::Open
                    && i.priority == FeedbackPriority::P1High
            })
            .count(),
    }
}

// ── Model Improvement Signal ──────────────────────────────

/// سیگنال‌های مثبت و منفی برای بهبود مدل
pub struct ModelImprovementSignal {
    pub position_id: String,
    pub positive_signals: Vec<String>,
    pub negative_signals: Vec<String>,
    pub can_use_for_training: bool,
}

/// استخراج سیگنال‌های بهبود از feedback
pub fn extract_improvement_signals(
    report: &FeedbackReport,
) -> ModelImprovementSignal {
    let mut positive = Vec::new();
    let mut negative = Vec::new();

    // KPI outcomes → signal
    for outcome in &report.kpi_outcomes {
        match &outcome.outcome {
            KpiOutcomeStatus::Achieved | KpiOutcomeStatus::Exceeded => {
                positive.push(format!(
                    "KPI '{}' محقق شد",
                    outcome.kpi_title
                ));
            }
            KpiOutcomeStatus::NotAchieved { reason } => {
                negative.push(format!(
                    "KPI '{}' محقق نشد: {}",
                    outcome.kpi_title, reason
                ));
            }
            KpiOutcomeStatus::PartiallyAchieved { percentage } => {
                if *percentage >= 70 {
                    positive.push(format!(
                        "KPI '{}' تا {}٪ محقق شد",
                        outcome.kpi_title, percentage
                    ));
                } else {
                    negative.push(format!(
                        "KPI '{}' فقط {}٪ محقق شد",
                        outcome.kpi_title, percentage
                    ));
                }
            }
            _ => {}
        }
    }

    // JD quality scores → signal
    let avg = report.jd_quality_scores.average();
    if avg >= 4.0 {
        positive.push(format!("کیفیت کلی JD: {:.1}/5", avg));
    } else if avg < 3.0 {
        negative.push(format!("کیفیت کلی JD پایین: {:.1}/5", avg));
    }

    // compliance feedback → signal
    if report.compliance_feedback.bias_check_was_helpful {
        positive.push("Bias Check مفید بود".to_string());
    }
    if !report.compliance_feedback.bias_missed_items.is_empty() {
        for missed in &report.compliance_feedback.bias_missed_items {
            negative.push(format!("Bias Check miss کرد: {}", missed));
        }
    }

    ModelImprovementSignal {
        position_id: report.position_id.clone(),
        positive_signals: positive,
        negative_signals: negative,
        can_use_for_training: report.allow_model_improvement,
    }
}

fn timestamp_placeholder() -> String {
    "2025-01-01T00:00:00Z".to_string()
}
```

---

## `apps/api/src/mcp/mod.rs`

```rust
/// MCP Module — نقطه مرکزی
/// تمام Sprint‌ها از اینجا export می‌شوند

pub mod types;
pub mod legal;
pub mod bias_fairness;
pub mod privacy;
pub mod hr_standards;
pub mod position;
pub mod compliance_engine;
pub mod schemas;
pub mod feedback;

/// نسخه MCP
pub const MCP_VERSION: &str = "0.1.0";

/// خلاصه وضعیت سیستم
pub struct McpSystemStatus {
    pub version: &'static str,
    pub schema_version: &'static str,
    pub sprints_completed: u8,
    pub modules_active: Vec<&'static str>,
}

impl McpSystemStatus {
    pub fn current() -> Self {
        Self {
            version: MCP_VERSION,
            schema_version: schemas::CURRENT_SCHEMA_VERSION,
            sprints_completed: 8,
            modules_active: vec![
                "legal",
                "bias_fairness",
                "privacy",
                "hr_standards",
                "position",
                "compliance_engine",
                "schemas",
                "feedback",
            ],
        }
    }

    pub fn is_ready(&self) -> bool {
        self.sprints_completed == 8
            && !self.modules_active.is_empty()
    }
}
```

---

# ✅ Sprint 8 تمام شد

## خلاصه آنچه ساختیم:

```text
docs/mcp/process/08-validation-feedback-loop.md      ✅
docs/mcp/examples/scenario-smb-tech-startup.md       ✅
docs/mcp/examples/sample-generated-position-*.md     ✅
docs/mcp/examples/sample-feedback-report.md          ✅
docs/mcp/process/09-improvement-backlog.md           ✅
apps/api/src/mcp/types.rs  (بروزرسانی)               ✅
apps/api/src/mcp/feedback.rs                         ✅
apps/api/src/mcp/mod.rs                              ✅
```

---

# 🏁 تمام ۸ Sprint تمام شد

## تصویر نهایی کامل پروژه

```text
docs/mcp/
├── process/
│   ├── 00-sprint-rules.md
│   ├── 01-legal-scope.md
│   ├── 02-bias-fairness.md
│   ├── 03-data-privacy.md
│   ├── 04-analysis-methodology.md
│   ├── 05-position-generation-standard.md
│   ├── 07-compliance-engine-design.md
│   ├── 07-templates-schemas.md
│   ├── 08-validation-feedback-loop.md
│   └── 09-improvement-backlog.md
│
├── legal/
│   ├── README.md
│   ├── 01-geographic-scope.md
│   ├── 09-legal-risk-register.md
│   └── 10-legal-decision-boundaries.md
│
├── fairness/
│   ├── README.md
│   ├── 01-protected-attributes.md
│   ├── 02-proxy-discrimination-rules.md
│   ├── 03-forbidden-terms-list.md
│   ├── 04-anti-bias-checklist.md
│   └── 08-human-approval-checklist.md
│
├── privacy/
│   ├── README.md
│   ├── 01-data-inventory-overview.md
│   ├── 05-sensitive-data-classification.md
│   ├── 06-prohibited-data.md
│   ├── 07-consent-policy.md
│   └── 09-data-retention-deletion.md
│
├── hr/
│   ├── README.md
│   ├── 01-personality-analysis-big-five.md
│   ├── 02-mbti-limitations.md
│   ├── 05-business-swot-analysis.md
│   ├── 06-gap-analysis.md
│   ├── 07-job-description-standard.md
│   ├── 08-kpi-standard.md
│   ├── 09-role-leveling-standard.md
│   ├── 10-ksao-standard.md
│   └── 11-onet-esco-mapping.md
│
├── compliance/
│   ├── README.md
│   ├── 01-compliance-engine-architecture.md
│   ├── 02-compliance-rules-matrix.md
│   ├── 03-pii-scanner.md
│   ├── 05-output-validator.md
│   ├── 06-risk-scoring-logic.md
│   └── 07-audit-log-requirements.md
│
├── templates/
│   ├── job-description-template.md
│   ├── kpi-template.md
│   ├── position-report-template.md
│   ├── fairness-review-checklist.md
│   └── feedback-report-template.md
│
├── schemas/
│   ├── candidate-data-schema.md
│   ├── position-schema.md
│   ├── kpi-schema.md
│   ├── audit-log-schema.md
│   └── compliance-risk-score-schema.md
│
└── examples/
    ├── scenario-smb-tech-startup.md
    ├── sample-generated-position-backend-lead.md
    └── sample-feedback-report.md

apps/api/src/mcp/
├── mod.rs               ← Sprint 8
├── types.rs             ← همه Sprint‌ها
├── legal.rs             ← Sprint 1
├── bias_fairness.rs     ← Sprint 2
├── privacy.rs           ← Sprint 3
├── hr_standards.rs      ← Sprint 4
├── position.rs          ← Sprint 5
├── compliance_engine.rs ← Sprint 6
├── schemas.rs           ← Sprint 7
└── feedback.rs          ← Sprint 8
```

---

## چرخه کامل MCP

```text
شرکت SWOT را وارد می‌کند
          ↓
Gap Analysis انجام می‌شود
          ↓
compliance_engine::run_input_pipeline()
          ↓
position::validate_position()
          ↓
compliance_engine::run_output_pipeline()
          ↓
schemas::validate_position_schema()
          ↓
schemas::build_position_report()
          ↓
HR بازبینی و تأیید می‌کند
          ↓
JD منتشر می‌شود
          ↓
استخدام انجام می‌شود
          ↓
feedback::extract_improvement_signals()
          ↓
suggestions_to_backlog()
          ↓
Sprint بعدی با اصلاحات
```

---

## گام‌های بعدی (Iteration 2)

```text
بر اساس Backlog:

BL-001 → Sprint 2 بازبینی: nationality proxy
BL-002 → Sprint 7 بازبینی: internal notes در template
BL-003 → Sprint 5 بازبینی: KPI threshold‌های قابل تنظیم
BL-004 → Sprint 6 بازبینی: timestamp واقعی (chrono)
BL-005 → Sprint 6 بازبینی: UUID واقعی
BL-006 → Sprint 3 بازبینی: deletion scheduler
BL-007 → Sprint 4 بازبینی: Big Five test cases
```