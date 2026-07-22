باشه—کاملاً متوجه‌ام: «Sprint» یعنی یک *مرحله‌ی مکالمه* که در همین چت جلو می‌بریم و خروجی‌اش را آماده‌ی کپی‌کردن داخل ریپو می‌کنیم.

در ادامه **Sprint 1 (Legal Scope)** را به شکل ۵ فایل دقیقاً مطابق لیست شما می‌سازم + در انتها یک اسکلت خیلی سبک برای `apps/api/src/mcp/legal.rs` و `apps/api/src/mcp/types.rs` هم می‌گذارم (اختیاری).

> نکته مهم: این خروجی «مشاوره حقوقی» نیست و جایگزین وکیل/مشاور حقوقی نمی‌شود؛ هدفش این است که *اسکوپ حقوقی و مرزهای محصول* را شفاف و قابل‌اجرا کند.  
> برای بخش‌های حقوقیِ زمان‌دار و حساس، به منابع رسمی ارجاع داده‌ام (EU AI Act timeline/تعاریف، NYC LL144، قانون کلرادو SB24-205، GDPR/UK GDPR و…).

---

## چند لنگر حقوقی که این Sprint به آن‌ها تکیه می‌کند (برای اینکه سندها “روی هوا” نباشند)

- **EU AI Act**: سیستم‌های AI در استخدام/مدیریت نیروی کار به عنوان «High-risk» دیده می‌شوند و الزامات مدیریت ریسک و… دارند؛ اما *زمان‌بندی اجرا مرحله‌ای است* (قابلیت کلی از ۲ اوت ۲۰۲۶، و قواعد High-risk برای حوزه‌هایی مثل employment از ۲ دسامبر ۲۰۲۷).   
- **NYC Local Law 144**: برای استفاده از AEDT در NYC، «bias audit» (در ۱ سال اخیر)، انتشار نتایج، و **اعلان به کاندیدا حداقل ۱۰ روز کاری قبل** لازم است.   
- **Colorado SB24-205** (موثر از **۱ فوریه ۲۰۲۶**): برای «High-risk AI» در «consequential decisions» از جمله employment، تعاریف دقیق، و تکالیف developer/deployer مثل reasonable care، برنامه مدیریت ریسک، impact assessment و اطلاع‌رسانی/حق اعتراض آمده است.   
- **GDPR/UK GDPR و تصمیم‌گیری صرفاً خودکار**: محدودیت‌هایی برای “solely automated decision-making” با اثر حقوقی یا مشابه آن وجود دارد و معمولاً حق human intervention/contest و اطلاع‌رسانی مطرح است (در UK حتی مثال e-recruiting بدون مداخله انسانی ذکر می‌شود).   
- **ADA (آمریکا) و AI در استخدام**: ابزارهای الگوریتمی می‌توانند موجب حذف ناعادلانه افراد دارای معلولیت شوند و موضوع accommodation/تبعیض مطرح است.   
- **Illinois Artificial Intelligence Video Interview Act**: اگر ویدئوی مصاحبه را با AI تحلیل می‌کنید، الزامات اطلاع‌رسانی/رضایت/حذف (با مهلت ۳۰ روز) و… دارد.   

---

# خروجی Sprint 1 — فایل‌ها (آماده‌ی کپی در ریپو)

## 1) `docs/mcp/process/01-legal-scope.md`

```md
# Sprint 1 — Legal Scope (Process)
Last updated: 2026-07-21

> هدف این سند: تعیین «اسکوپ حقوقی» برای محصول/سامانه (MCP) و ایجاد یک روش ثابت برای:
> - تعیین اینکه کجا/چه زمانی قوانین خاص فعال می‌شوند
> - تعریف نقش ما (Provider/Deployer) در هر سناریو
> - ایجاد مرزهای تصمیم‌گیری (Decision Boundaries) که در محصول enforce می‌شوند
>
> این سند مشاوره حقوقی نیست؛ سند طراحی/حاکمیت محصول است.

---

## 1. تعریف مسئله (Problem Statement)

ما یک سامانه‌ی مبتنی بر LLM داریم که در حوزه‌ی HR / استخدام کمک می‌کند:
- تولید/بهبود Job Description
- تولید KPI / Role leveling / KSAO
- (احتمالی در آینده) تحلیل CV و ساخت گزارش/امتیاز/رتبه‌بندی
- (احتمالی در آینده) تعامل با کاندیدا/کارمند به صورت چت

چون این حوزه مستقیماً به «فرصت شغلی» و «عدم تبعیض» و «حریم خصوصی» مرتبط است،
حتی یک خروجی متنی ساده هم می‌تواند ریسک حقوقی ایجاد کند (مثلاً زبان تبعیض‌آمیز، یا ابزار تصمیم‌یار خودکار).

---

## 2. اصول حاکم (Legal/Policy Principles)

این اصول، حداقل استاندارد جهانی (baseline) هستند؛ سپس قوانین محلی روی آن سوار می‌شوند:

1) عدم تبعیض / عدم ایجاد اثر نامطلوب (disparate impact)
2) شفافیت: وقتی ابزار “به‌طور معنادار” در تصمیم استخدامی نقش دارد، باید قابلیت توضیح و لاگ وجود داشته باشد
3) Human oversight: تصمیم‌های adverse نباید صرفاً خودکار باشند
4) Data minimization: فقط داده لازم، برای هدف مشخص
5) Accessibility & disability fairness: خروجی/فرآیند باید قابلیت سازگاری (accommodation) داشته باشد

---

## 3. نقش‌ها و مسئولیت‌ها (Provider vs Deployer)

در بسیاری از قوانین جدید AI، تفکیک نقش‌ها مهم است:

- Provider/Developer: کسی که سیستم را می‌سازد یا عرضه می‌کند
- Deployer/Employer: کسی که از آن برای تصمیم‌های واقعی (خصوصاً استخدام) استفاده می‌کند

سیاست ما:
- ما در اسناد و API باید روشن کنیم “این قابلیت” ما را در کدام نقش قرار می‌دهد.
- اگر مشتری از API ما برای screening/ranking استفاده کند، ممکن است خودش deployer باشد و تکالیف قانونی داشته باشد؛
  اما ما هم باید guardrail و disclosure مناسب بدهیم.

---

## 4. مدل اسکوپ جغرافیایی (Geographic Scoping Model)

ما سه سطح تعریف می‌کنیم:

### Level A — Global Baseline (همیشه فعال)
قواعد پایه‌ای عدم تبعیض، لاگ، و مرزهای خروجی.

### Level B — Regulated Hotspots (قوانین مشخص برای hiring AI)
نمونه‌های مهم (watchlist اولیه):
- NYC Local Law 144 (AEDT)
- Colorado SB24-205 (High-risk AI در consequential decisions مثل employment)
- EU AI Act (employment = high-risk) + GDPR/UK GDPR محدودیت تصمیم صرفاً خودکار
- Illinois AI Video Interview Act (اگر تحلیل ویدئو انجام شود)

### Level C — Client-Specific (قراردادی)
ممکن است مشتری استاندارد داخلی/قراردادی خاص داشته باشد (مثلاً “هیچ مدل امتیازدهی کاندیدا مجاز نیست”)

---

## 5. معیار “فعال شدن قانون” (Trigger Rules)

هر قانون یک Trigger دارد که باید در Compliance Engine پیاده شود (بعداً در Sprint 6، ولی از همین Sprint تعریف می‌کنیم).
مثال Triggerها:
- job_location / candidate_location / employer_location
- آیا خروجی “score/rank/recommendation” تولید می‌شود؟
- آیا خروجی “substantial factor” در تصمیم استخدامی است؟
- آیا تعامل مستقیم با کاندیدا داریم؟ (AI disclosure)

---

## 6. خروجی‌های Sprint 1 (Done Criteria)

در این Sprint، باید ۵ خروجی سندی تولید شود:
- legal/README.md
- legal/01-geographic-scope.md
- legal/09-legal-risk-register.md
- legal/10-legal-decision-boundaries.md
- process/01-legal-scope.md (همین فایل)

و حداقل ۱ نتیجه عملی:
- یک “قالب” برای Rule IDs و Risk IDs که در اسناد بعدی هم ثابت بماند.

---

## 7. شناسه‌ها (IDs) — استاندارد نام‌گذاری

### Rule ID
Format:
`LEGAL.<JURISDICTION>.<TOPIC>.<NUMBER>`

نمونه:
- `LEGAL.NYC.AEDT.001`
- `LEGAL.CO.HIGH_RISK_AI.010`
- `LEGAL.EU.AIACT.020`
- `LEGAL.GDPR.AUTO_DECISION.010`

### Risk ID
Format:
`RISK.<DOMAIN>.<NUMBER>`

نمونه:
- `RISK.DISCRIMINATION.001`
- `RISK.TRANSPARENCY.010`
- `RISK.PRIVACY.020`

---

## 8. منابع (برای Legal Anchors) — فقط جهت رفرنس
- EU AI Act timeline: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- EU Council AI Act timeline: https://www.consilium.europa.eu/en/policies/artificial-intelligence-act/timeline-artificial-intelligence/
- NYC AEDT (LL144): https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page
- NYC final rule notice: https://rules.cityofnewyork.us/wp-content/uploads/2023/04/DCWP-NOA-for-Use-of-Automated-Employment-Decisionmaking-Tools-2.pdf
- Colorado SB24-205 (signed bill): https://content.leg.colorado.gov/sites/default/files/2024a_205_signed.pdf
- GDPR automated decision-making explainer: https://commission.europa.eu/.../are-there-restrictions-use-automated-decision-making_en
- UK ICO Article 22 guidance: https://ico.org.uk/.../rights-related-to-automated-decision-making-including-profiling/
- ADA AI hiring guidance: https://www.ada.gov/resources/ai-guidance/
- Illinois AIVIA: https://www.ilga.gov/Legislation/ILCS/Articles?ActID=4015&ChapterID=68&Print=True
```

---

## 2) `docs/mcp/legal/README.md`

```md
# Legal Module — README
Last updated: 2026-07-21

این فولدر «منبع حقیقت» (source of truth) برای اسکوپ حقوقی، ریسک‌ها، و مرزهای تصمیم‌گیری محصول است.

## هدف
- مشخص کنیم محصول در کدام کشور/ایالت/شهر با چه محدودیت‌هایی باید کار کند.
- مرزهای سخت محصول را تعریف کنیم (چه چیزهایی را سیستم *نباید* تولید/انجام دهد).
- یک Risk Register قابل ردیابی داشته باشیم که بعداً به Compliance Engine وصل شود.

## فایل‌ها
- `01-geographic-scope.md`  
  تعریف اسکوپ جغرافیایی + قاعده‌ی تشخیص اینکه کدام قانون برای کدام درخواست فعال می‌شود.

- `09-legal-risk-register.md`  
  ریسک‌ها + اثر + mitigation + مالک.

- `10-legal-decision-boundaries.md`  
  مرزهای سخت (Hard Boundaries) و خط قرمزهای محصول.

## دامنه
این فولدر در Sprint 1 فقط “Scope و Guardrail” را پوشش می‌دهد.
جزئیات Privacy/Data در Sprint 2 تکمیل می‌شود.
جزئیات Fairness/Bias در Sprint 5 تکمیل می‌شود.

## تعریف‌های کلیدی (به زبان محصول)
- **Employment-impacting output**: هر خروجی که به شکل “امتیاز/رتبه/توصیه برای استخدام/رد/ارتقا” قابل استفاده باشد.
- **Solely automated decision**: تصمیمی که بدون مداخله انسانی انجام شود و اثر حقوقی/مشابه داشته باشد.
- **AEDT**: ابزار تصمیم‌یار/تصمیم‌ساز خودکار در استخدام (تعریف دقیق بسته به قانون).

## اصل مهم
هرجا شک داریم:
- خروجی را به “advisory / draft” محدود می‌کنیم
- human review را اجباری می‌کنیم
- audit log و نسخه policy را ثبت می‌کنیم
- و تصمیم‌های adverse را “خودکار” نمی‌کنیم

## Owner
- Legal/Compliance Owner: (پر شود)
- Product Owner: (پر شود)
- Engineering Owner: (پر شود)
```

---

## 3) `docs/mcp/legal/01-geographic-scope.md`

```md
# Geographic Scope
Last updated: 2026-07-21

## 1) هدف
این سند می‌گوید:
- در کدام جغرافیا/بازار محصول “رسماً” پشتیبانی می‌شود
- در کدام جغرافیا “محدودیت/حالت امن” (safe mode) لازم است
- قوانین مهم چه triggerهایی دارند

---

## 2) Scope Tiering (مدل سطح‌بندی)

### Tier 0 — Global Baseline (همیشه)
- ممنوعیت تولید خروجی تبعیض‌آمیز
- ممنوعیت تولید معیارهای استخدامی بر اساس ویژگی‌های protected
- الزام ثبت audit log (حداقلی)

### Tier 1 — United States (baseline)
- توجه خاص به ADA-related fairness و قابلیت accommodation
- اگر خروجی در فرآیند استخدام اثر بگذارد، human oversight الزامی

> توجه: قوانین ایالتی/شهری می‌توانند Tier 2 محسوب شوند.

### Tier 2 — Regulated Hotspots (قوانین خاص AI در hiring)
#### 2.1) New York City (NYC) — AEDT / Local Law 144
Trigger پیشنهادی:
- اگر ابزار ما “score/classification/recommendation” تولید کند
- و این خروجی برای “screening/selection/promotion” در NYC استفاده شود
آنگاه: bias audit + disclosure + notice فعال می‌شود.

#### 2.2) Colorado — SB24-205
Trigger پیشنهادی:
- اگر سیستم ما “high-risk AI system” باشد (وقتی در “consequential decision” مثل employment نقش substantial factor دارد)
- و مصرف‌کننده/فرد ذینفع Colorado resident باشد
آنگاه: reasonable care + risk management program + impact assessment + notices/appeal فعال می‌شود.

#### 2.3) EU/EEA — EU AI Act + GDPR
Trigger پیشنهادی:
- اگر مشتری در اتحادیه اروپا deploy کند یا کاربر/کاندیدا در EU باشد
- و use case مربوط به employment باشد (high-risk classification در AI Act)
آنگاه: (حداقل) الزام‌های governance/traceability/human oversight باید در طراحی دیده شود.
برای تصمیم‌های adverse: محدودیت solely automated decision باید رعایت شود.

#### 2.4) United Kingdom — UK GDPR / Article 22
Trigger پیشنهادی:
- اگر تصمیم استخدامی “solely automated” باشد و اثر مشابه حقوقی داشته باشد
آنگاه: محدودیت‌ها/حقوق فردی (human intervention/contest/explanation) باید رعایت شود.

#### 2.5) Illinois — AI Video Interview Act
Trigger پیشنهادی:
- اگر feature ما شامل “تحلیل AI روی ویدئوی مصاحبه” باشد
- و موقعیت شغلی در Illinois باشد
آنگاه: notice/consent + deletion on request فعال می‌شود.

---

## 3) Supported Markets (پیشنهادی برای محصول)
تا زمانی که تیم تصمیم دیگری نگرفته:

### Phase 1 (پیشنهاد)
- US (به‌جز موارد خاص مثل NYC/Colorado/Illinois که gate دارند)
- خروجی‌ها: Job description draft / KPI draft / role leveling draft
- ممنوع: candidate scoring/ranking

### Phase 2 (پیشنهاد)
- EU/UK با حالت “human-in-the-loop” و logging کامل
- همچنان ممنوع: solely automated adverse decisions

---

## 4) Geo Resolution (قاعده تشخیص جغرافیا در runtime)
در API باید این فیلدها (یا معادل آن) وجود داشته باشد:
- `job_location`: کشور/ایالت/شهر محل نقش
- `candidate_location` (اگر داریم): محل اقامت/کار کاندیدا
- `employer_location`: محل شرکت/دفتر
- `deployment_location`: محل استفاده ابزار

Policy محافظه‌کارانه:
- اگر یکی از این‌ها در یک hotspot قرار داشت، همان hotspot rule-set فعال شود.
- اگر location نامشخص بود: safe mode (محدودسازی خروجی + human review + عدم تولید score/rank).

---

## 5) Sources (for reference)
- NYC AEDT: https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page
- NYC rules: https://rules.cityofnewyork.us/wp-content/uploads/2023/04/DCWP-NOA-for-Use-of-Automated-Employment-Decisionmaking-Tools-2.pdf
- Colorado SB24-205: https://content.leg.colorado.gov/sites/default/files/2024a_205_signed.pdf
- EU AI Act timeline: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- EU AI Act (employment high-risk context): https://ai-act-service-desk.ec.europa.eu/en/ai-act/recital-57
- GDPR automated decision-making overview: https://commission.europa.eu/.../are-there-restrictions-use-automated-decision-making_en
- UK ICO Article 22: https://ico.org.uk/.../rights-related-to-automated-decision-making-including-profiling/
- Illinois AIVIA: https://www.ilga.gov/Legislation/ILCS/Articles?ActID=4015&ChapterID=68&Print=True
```

---

## 4) `docs/mcp/legal/09-legal-risk-register.md`

```md
# Legal Risk Register
Last updated: 2026-07-21

> این رجیستر زنده است. هر ریسک یک Owner و mitigation دارد.
> هدف: “قابل عمل” باشد، نه صرفاً لیست نگرانی‌ها.

## Legend
- Likelihood: Low/Med/High
- Impact: Low/Med/High/Critical
- Severity (پیشنهادی): max(Likelihood, Impact) با وزن Impact

---

## Risks

| Risk ID | Title | Description | Jurisdictions | Likelihood | Impact | Mitigations (product/engineering) | Owner | Evidence/Notes |
|---|---|---|---|---:|---:|---|---|---|
| RISK.DISCRIMINATION.001 | Algorithmic discrimination | خروجی یا تصمیم‌یار باعث اثر نامطلوب روی گروه‌های protected شود | US/EU/UK/CO/NYC | Med | Critical | منع protected attributes + فیلتر زبان تبعیض‌آمیز + human review + audit log + fairness sprint | Compliance | CO تعریف algorithmic discrimination و protected classes را صریح می‌آورد |
| RISK.TRANSPARENCY.010 | Lack of notice/disclosure | ابزار در hiring استفاده شود ولی notice/افشا انجام نشود | NYC, CO, EU/UK | Med | High | قابلیت تولید notice template + policy gating براساس geo + ثبت نسخه policy | Product | NYC LL144 notice، CO disclosure، UK/EU automated decision rights |
| RISK.AUDIT.020 | Missing bias audit (AEDT) | خروجی ما در NYC به عنوان AEDT استفاده شود ولی bias audit سالانه/انتشار انجام نشود | NYC | Med | High | Flag “NYC_AEDT_MODE” و ممنوعیت scoring/ranking مگر compliance OK | Product/Eng | NYC LL144 rules |
| RISK.AUTO_DECISION.030 | Solely automated adverse decision | استفاده مشتری از خروجی برای رد/قبولی خودکار بدون human intervention | EU/UK (GDPR/UK GDPR) و همچنین ریسک عمومی | Med | High | Decision boundary: “no automated rejection” + require human attestation | Product | GDPR/UK GDPR محدودیت solely automated decision |
| RISK.DISABILITY.040 | Disability discrimination | مدل افراد دارای معلولیت را غیرمنصفانه حذف کند یا accommodation را نادیده بگیرد | US (ADA) | Med | High | “accommodation-friendly mode” + ممنوعیت استفاده از سیگنال‌های پزشکی/تشخیصی | Compliance | ADA guidance on AI hiring |
| RISK.VIDEO_AI.050 | Video interview AI compliance | اگر video analysis داشته باشیم و رضایت/حذف رعایت نشود | Illinois | Low (اگر feature نداریم) | High | فعلاً feature ممنوع/خاموش. اگر اضافه شد: consent+delete workflow | Product | Illinois AIVIA |
| RISK.SCOPE_CREEP.060 | Feature creep into high-risk hiring | محصول از JD generator به candidate scoring تغییر کند بدون بازطراحی compliance | همه | Med | High | Capability registry + ممنوعیت score/rank تا Sprintهای fairness/compliance کامل شود | Product | — |
| RISK.RECORDS.070 | Insufficient audit logs | نتوانیم نشان دهیم چه policy/versionی اعمال شده | CO/EU و ریسک عمومی | Med | High | audit log minimal schema + policy versioning | Eng | CO impact assessment/records، EU traceability themes |
| RISK.LOCATION.080 | Wrong geo detection | سیستم hotspot را تشخیص ندهد و rule-set غلط فعال شود | همه | Med | Med | require explicit job_location + safe mode on unknown | Eng | — |

---

## Sources (reference)
- NYC AEDT overview: https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page
- NYC final rules notice: https://rules.cityofnewyork.us/wp-content/uploads/2023/04/DCWP-NOA-for-Use-of-Automated-Employment-Decisionmaking-Tools-2.pdf
- Colorado SB24-205: https://content.leg.colorado.gov/sites/default/files/2024a_205_signed.pdf
- EU AI Act timeline: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- GDPR automated decision-making explainer: https://commission.europa.eu/.../are-there-restrictions-use-automated-decision-making_en
- UK ICO Article 22 rights: https://ico.org.uk/.../rights-related-to-automated-decision-making-including-profiling/
- ADA AI guidance: https://www.ada.gov/resources/ai-guidance/
- Illinois AIVIA: https://www.ilga.gov/Legislation/ILCS/Articles?ActID=4015&ChapterID=68&Print=True
```

---

## 5) `docs/mcp/legal/10-legal-decision-boundaries.md`

```md
# Legal Decision Boundaries (Hard Lines)
Last updated: 2026-07-21

> این سند “خط قرمزهای محصول” است: چیزهایی که سیستم نباید انجام دهد/خروجی دهد.
> هدف: تبدیل‌شدن به Ruleهای قابل enforce در API.

---

## A) Boundaries — در همه جا (Global Baseline)

### LEGAL.GLOBAL.BOUNDARY.001 — No protected-attribute hiring criteria
سیستم نباید:
- معیار استخدامی/ترجیح شغلی بر اساس ویژگی‌های protected تولید کند
- متن JD را طوری بنویسد که به حذف گروهی خاص منجر شود (زبان تبعیض‌آمیز)

### LEGAL.GLOBAL.BOUNDARY.002 — No medical/diagnostic inference
سیستم نباید از کاربر بخواهد یا تولید کند:
- تحلیل پزشکی/روانی/تشخیصی از کاندیدا
- پیشنهاد “غربالگری” بر اساس سلامت/معلولیت

### LEGAL.GLOBAL.BOUNDARY.003 — No fully automated adverse decisions
سیستم نباید به گونه‌ای طراحی/ارائه شود که:
- “رد خودکار” یا “قبولی خودکار” کاندیدا را بدون human review انجام دهد
- خروجی را به عنوان تصمیم نهایی معرفی کند (فقط draft/advisory)

---

## B) NYC (Local Law 144 / AEDT) — Guardrails

### LEGAL.NYC.AEDT.001 — No scoring/ranking unless AEDT compliance asserted
اگر `job_location` یا `deployment_location` = NYC:
- تولید score/rank/recommendation برای screening/promotion **پیش‌فرض ممنوع**
- فقط خروجی‌های “draft JD / draft KPI / explanation” مجازند
- اگر مشتری ادعا کرد “bias audit + notice + publication” انجام شده، باید در request به شکل attestation ثبت شود.

### LEGAL.NYC.AEDT.010 — Notice timing support
سیستم باید بتواند:
- template اعلان به کاندیدا را تولید کند
- و یادآوری کند که notice باید پیش از استفاده ارائه شود (در NYC حداقل 10 business days طبق راهنمای رسمی/اسلایدهای DCWP).

---

## C) Colorado SB24-205 — Guardrails

### LEGAL.CO.AI.001 — Treat employment-impacting outputs as “consequential”
اگر `candidate_location` = Colorado resident یا مشتری در Colorado deploy می‌کند:
- خروجی‌هایی که “substantial factor” در employment شوند، high-risk تلقی شوند
- نیاز به: logging، disclosure، امکان appeal/human review در تصمیم adverse (حداقل در سطح طراحی محصول: فراهم‌کردن قابلیت‌ها)

### LEGAL.CO.AI.010 — AI disclosure for consumer interaction
اگر محصول/بات مستقیماً با فرد (consumer) تعامل می‌کند:
- باید امکان disclosure فراهم باشد که “در حال تعامل با AI” است (مگر obvious باشد)

---

## D) EU/UK (GDPR/UK GDPR Article 22 style constraints)

### LEGAL.EUUK.AUTO.001 — No solely automated decisions with significant effects
در EU/UK:
- سامانه نباید “solely automated” تصمیم استخدامی با اثر مشابه حقوقی تولید/اعمال کند
- اگر مشتری از خروجی برای چنین تصمیمی استفاده کند، باید human-in-the-loop + contestability را الزام/پشتیبانی کنیم (حداقل: policy + audit)

---

## E) Illinois (AI Video Interview Act) — Guardrails

### LEGAL.IL.VIDEO.001 — Video analysis feature is OFF by default
تا قبل از طراحی کامل consent+deletion:
- هر feature تحلیل AI ویدئوی مصاحبه خاموش/ممنوع

اگر فعال شد:
- باید notice + consent قبل از مصاحبه
- و deletion-on-request (مهلت قانونی) را در workflow داشته باشیم.

---

## Implementation Notes (برای اتصال به apps/api)
- این boundaries باید به صورت Rule در `apps/api/src/mcp/legal.rs` قابل evaluate باشد.
- خروجی evaluate باید شامل:
  - `allowed_capabilities[]`
  - `blocked_capabilities[]`
  - `required_attestations[]`
  - `required_notices[]`
  - `jurisdictions_triggered[]`

---

## Sources (reference)
- NYC AEDT page + notice timing reference: https://home4.nyc.gov/site/dca/about/automated-employment-decision-tools.page
- NYC rules notice (10 business days): https://rules.cityofnewyork.us/wp-content/uploads/2023/04/DCWP-NOA-for-Use-of-Automated-Employment-Decisionmaking-Tools-2.pdf
- Colorado SB24-205 definitions & duties: https://content.leg.colorado.gov/sites/default/files/2024a_205_signed.pdf
- EU Commission on automated decision-making: https://commission.europa.eu/.../are-there-restrictions-use-automated-decision-making_en
- UK ICO Article 22: https://ico.org.uk/.../rights-related-to-automated-decision-making-including-profiling/
- ADA AI guidance: https://www.ada.gov/resources/ai-guidance/
- Illinois AIVIA: https://www.ilga.gov/Legislation/ILCS/Articles?ActID=4015&ChapterID=68&Print=True
```

---

# (اختیاری) اسکلت خیلی سبک برای `apps/api` (صرفاً برای اینکه Sprint 1 “قابل اجرا” هم باشد)

> این بخش را خیلی کم‌حجم نگه می‌دارم: فقط typeها + یک evaluator stub.

## `apps/api/src/mcp/types.rs`

```rust
// apps/api/src/mcp/types.rs

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Jurisdiction {
    Global,
    Us,
    UsNyNyC,
    UsCo,
    Eu,
    Uk,
    UsIl,
}

#[derive(Debug, Clone)]
pub struct GeoContext {
    pub job_country: Option<String>,
    pub job_region: Option<String>, // state/province
    pub job_city: Option<String>,

    pub candidate_country: Option<String>,
    pub candidate_region: Option<String>,
    pub candidate_city: Option<String>,

    pub deployment_country: Option<String>,
    pub deployment_region: Option<String>,
    pub deployment_city: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Capability {
    DraftJobDescription,
    DraftKpi,
    DraftRoleLeveling,
    CandidateScoring,
    CandidateRanking,
    VideoInterviewAnalysis,
    CandidateChatbot,
}

#[derive(Debug, Clone)]
pub struct LegalEvalResult {
    pub triggered: Vec<Jurisdiction>,
    pub allowed: Vec<Capability>,
    pub blocked: Vec<Capability>,
    pub required_attestations: Vec<String>,
    pub required_notices: Vec<String>,
    pub notes: Vec<String>,
}
```

## `apps/api/src/mcp/legal.rs`

```rust
// apps/api/src/mcp/legal.rs

use super::types::{Capability, GeoContext, Jurisdiction, LegalEvalResult};

pub fn evaluate_legal_scope(geo: &GeoContext, requested: &[Capability]) -> LegalEvalResult {
    let mut triggered = vec![Jurisdiction::Global];

    // naive geo detection (replace with robust resolver later)
    let is_nyc = matches!(geo.job_city.as_deref(), Some("New York"))
        && matches!(geo.job_region.as_deref(), Some("NY"));

    let is_colorado = matches!(geo.deployment_region.as_deref(), Some("CO"))
        || matches!(geo.candidate_region.as_deref(), Some("CO"));

    if is_nyc {
        triggered.push(Jurisdiction::UsNyNyC);
    }
    if is_colorado {
        triggered.push(Jurisdiction::UsCo);
    }

    let mut allowed: Vec<Capability> = vec![];
    let mut blocked: Vec<Capability> = vec![];

    for cap in requested {
        let mut is_blocked = false;

        // NYC: block scoring/ranking by default
        if is_nyc && matches!(cap, Capability::CandidateScoring | Capability::CandidateRanking) {
            is_blocked = true;
        }

        // Illinois: video analysis off by default (regardless of geo until implemented)
        if matches!(cap, Capability::VideoInterviewAnalysis) {
            is_blocked = true;
        }

        if is_blocked {
            blocked.push(cap.clone());
        } else {
            allowed.push(cap.clone());
        }
    }

    LegalEvalResult {
        triggered,
        allowed,
        blocked,
        required_attestations: vec![
            // e.g., "NYC_LL144_BIAS_AUDIT_DONE"
        ],
        required_notices: vec![
            // e.g., "NYC_LL144_CANDIDATE_NOTICE_10_BUSINESS_DAYS"
        ],
        notes: vec![
            "This is a stub evaluator. Replace with rule registry + audit logging.".to_string()
        ],
    }
}
```

---

## Completeness pass (طبق Sprint 1 شما)
- ۵ فایل سندی تولید شد (process + legal README + geo scope + risk register + decision boundaries)
- همه‌شان قابل کپی در ریپو هستند
- boundaries طوری نوشته شد که بعداً مستقیم به ruleها و capability gating وصل شود
- منابع رسمی برای نقاط حساس (NYC/Colorado/EU/UK/Illinois/ADA) لحاظ شده‌اند   

اگر طبق همین مدل پیش برویم، Sprint 2 (Data & Privacy) را هم می‌توانم دقیقاً به همین فرم “فایل‌محور” تولید کنم، با این تفاوت که آنجا نیاز داریم Data Inventory و Data Classification را از همین ابتدا طوری بنویسیم که بعداً به PII scanner و retention policy تبدیل شود.
Sprint 2 (Data & Privacy) را به‌صورت خروجی «فایل‌محور» می‌سازم؛ آماده‌ی کپی در ریپو. این Sprint روی ۴ ستون می‌ایستد: **Data minimisation + purpose limitation + consent/choice (در جای درستش) + storage limitation/retention**. (برای GDPR/UK GDPR اصول «کمینه‌سازی داده» و «محدودیت نگهداری» صریح‌اند. ) برای کالیفرنیا هم الزام افشای مدت نگهداری و «نه بیشتر از حد لازم» صریح آمده است. 

نکته‌ی مهمِ طراحی: در فضای HR/استخدام، «رضایت» همیشه بهترین تکیه‌گاه حقوقی نیست چون **عدم توازن قدرت** می‌تواند رضایت را غیرآزاد کند (به‌خصوص employer/employee). پس ما در سندها “consent” را دو تکه می‌کنیم:  
1) **consent به‌عنوان UX/permission** (اجازه/انتخاب کاربر، granular و قابل پس‌گرفتن)  
2) **lawful basis واقعی** (که بسته به نقش شما controller/processor و سناریو تعیین می‌شود)  
این هشدار در راهنمای EDPB درباره رضایت و عدم توازن قدرت آمده است. 

---

# خروجی Sprint 2 — فایل‌ها

## 1) `docs/mcp/process/02-data-inventory.md`
این فایل “روش” ساخت Data Inventory را تعریف می‌کند (چه جدول‌هایی، چه فیلدهایی، خروجی sprint چیست).

```md
# Sprint 2 — Process: Data Inventory
Last updated: 2026-07-21

## هدف
ساختن یک «Data Inventory» که:
- برای محصول/مهندسی قابل اجرا باشد (نه فقط متن)
- بتواند بعداً به PII scanner / retention / deletion workflow وصل شود
- مبنای Notice/Disclosure و DSAR باشد

## خروجی‌های این مرحله
1) `docs/mcp/privacy/01-data-inventory-overview.md`
2) یک جدول Data Inventory (داخل همان فایل) شامل:
   - Data Category
   - Data Elements (نمونه فیلدها)
   - Subject (candidate/employer/employee/admin)
   - Source (user input / integration / system-generated)
   - Purpose
   - Storage locations (logical)
   - Retention class
   - Sensitivity class
   - Sharing/subprocessors (اگر داریم)
   - Legal notes (حداقلی)

## قواعد طراحی
- Data minimisation: فقط داده لازم برای هدف مشخص
- Purpose limitation: هر داده باید Purpose مشخص داشته باشد
- Storage limitation: مدت نگهداری تعریف‌شده و قابل دفاع
- Privacy by design: از ابتدا (نه بعداً)

(این‌ها در اصول GDPR به‌صورت روشن بیان می‌شوند و “data protection by design” هم تأکید می‌شود.)
```

(بالای فایل به اصول GDPR تکیه دارد. )

---

## 2) `docs/mcp/process/03-consent-privacy-rules.md`
این فایل “روش” تعریف ruleها را می‌دهد: consent/notice، حساس/ممنوع، retention.

```md
# Sprint 2 — Process: Consent & Privacy Rules
Last updated: 2026-07-21

## هدف
تعریف یک چارچوب یکدست برای:
- Consent/Notice (به‌عنوان UX permission + در صورت نیاز lawful consent)
- طبقه‌بندی حساسیت داده
- داده‌های ممنوع
- نگهداری/حذف (Retention/Deletion)
- واکنش به درخواست‌های حذف/دسترسی (DSAR-ready)

## تعریف‌های کلیدی
- Personal data / personal information: داده‌ای که به فرد قابل انتساب باشد (مستقیم یا غیرمستقیم).
- Sensitive data: زیرمجموعه‌ای با ریسک بالاتر (مثل سلامت/بیومتریک/گرایش جنسی/…).
- Prohibited data: داده‌هایی که محصول ما اصولاً نباید جمع‌آوری/پردازش کند (مگر با تصمیم صریح و بازطراحی).
- Consent (در این پروژه): 
  - (A) UX Permission: اجازه‌ی روشن/قابل پس‌گرفتن برای feature یا نوع پردازش
  - (B) Lawful consent: رضایت حقوقی معتبر (اگر/وقتی لازم باشد)

## خروجی‌های این مرحله (فایل‌های Sprint 2)
- `privacy/05-sensitive-data-classification.md`
- `privacy/06-prohibited-data.md`
- `privacy/07-consent-policy.md`
- `privacy/09-data-retention-deletion.md`

## اصول UX برای consent/notice
- granular (ریزدانگی)
- withdrawable (قابل پس‌گرفتن)
- no detriment (پس‌گرفتن نباید تنبیه‌وار باشد)
- avoid dark patterns
```

(برای “consent باید واقعی/آزاد/قابل پس‌گرفتن باشد” و حساسیت power-imbalance در استخدام، سندهای EDPB پشتیبان‌اند. )

---

## 3) `docs/mcp/privacy/01-data-inventory-overview.md`
این همان Data Inventory واقعیِ محصول است (نسخه ۰). در Sprintهای بعدی تکمیل می‌شود.

```md
# Privacy — Data Inventory (Overview)
Last updated: 2026-07-21

> هدف: لیست دقیق «چه داده‌ای می‌گیریم/می‌سازیم/نگه می‌داریم» + چرا + تا کی.
> این جدول باید همیشه آپدیت بماند و مبنای retention، deletion، و disclosure باشد.

## 1) فرضیات محصول (v0)
محصول یک سیستم HR-assistant مبتنی بر LLM است که:
- Draft job description / KPI / role leveling تولید می‌کند
- ممکن است ورودی‌های مربوط به نقش/شرکت/تیم/کاندیدا بگیرد
- لاگ و audit (حداقلی) برای debug/compliance نیاز دارد

## 2) Data Inventory Table (v0)

| Category | Data elements (examples) | Subject | Source | Purpose | Sensitivity | Retention class | Storage (logical) | Sharing |
|---|---|---|---|---|---|---|---|---|
| Account & Auth | email, password hash, org_id, role | admin/user | user/system | auth, access control | Confidential | R2 | DB | none |
| Org Profile | company name, industry, size range | employer/org | user | context for drafting | Internal/Confidential | R2 | DB | none |
| Job/Position Input | title, responsibilities, seniority, salary range (optional) | employer/job | user | generate drafts | Confidential | R1/R2 | DB + prompt store | (model vendor as processor) |
| Candidate Data (optional) | resume text, skills, years exp, portfolio links | candidate | user/integration | analysis/drafting | Sensitive/Confidential | R1 | secure blob store | (model vendor as processor) |
| Free-text Prompts | raw prompt content | varies | user | generate outputs | could contain sensitive | R0/R1 | prompt store | (model vendor) |
| Generated Outputs | JD draft, KPI draft, reports | employer/job | system | deliver service | Confidential | R1/R2 | DB/blob | share with org users |
| Telemetry | request_id, latency, error traces | user/system | system | reliability, security | Internal | R1 | logs | none |
| Audit Log (minimal) | who/when/what capability/policy_version | user/system | system | compliance evidence | Confidential | R3 | audit store | none |
| Support Tickets | user messages, attachments | user | user | support | could be sensitive | R1/R2 | support system | vendor |

### Retention classes (تعریف)
- R0: no-store (فقط in-memory) یا ephemeral (≤ 24h)
- R1: short (مثلاً 30–90 روز) برای debug/support
- R2: business record (مثلاً تا پایان قرارداد + X)
- R3: compliance record (طولانی‌تر، با کنترل دسترسی سخت)

> اعداد دقیق retention در فایل `09-data-retention-deletion.md` تعیین می‌شود.

## 3) Data minimisation rules (baseline)
- دریافت Candidate Data پیش‌فرض خاموش (opt-in)
- promptها باید قبل از ذخیره‌سازی، scrub حداقلی شوند (مثل حذف SSN/ID اگر detect شد)
- اگر location نامشخص است، safe mode فعال شود (از Sprint 1)

## 4) Notes
- این جدول باید برای هر integration (ATS/HRIS) یک row جدا داشته باشد.
```

(اصول minimisation و storage limitation/نگهداری محدود، مستقیماً با اصول GDPR هم‌راستاست. )

---

## 4) `docs/mcp/privacy/05-sensitive-data-classification.md`
اینجا تعریف می‌کنیم «حساس» یعنی چه (هم از نگاه EU، هم برخی ایالت‌های US مثل CO/CA).

```md
# Privacy — Sensitive Data Classification
Last updated: 2026-07-21

## 1) هدف
یک طبقه‌بندی ثابت برای:
- tagging داده‌ها در Data Inventory
- تعیین guardrail ها (prohibited / require attestation / require explicit opt-in)
- طراحی PII/sensitive scanner در آینده

## 2) Classification levels (پیشنهادی)
### Class P0 — Non-personal / Public
مثل: متن عمومی درباره role، راهنماها، template های عمومی.

### Class P1 — Personal data (standard)
مثل: نام، ایمیل کاری، سابقه شغلی عمومی (اگر به فرد قابل انتساب باشد).

### Class P2 — Sensitive personal data (high risk)
هر داده‌ای که افشایش ریسک تبعیض/آسیب بالاتر دارد.

### Class P3 — Highly sensitive / Special category
داده‌هایی که در بسیاری از قوانین به‌طور خاص محدود شده‌اند:
- سلامت/تشخیص
- داده بیومتریک برای شناسایی
- ژنتیک
- گرایش جنسی/زندگی جنسی
- باور مذهبی/نژاد/قومیت (یا inference از آن‌ها)
- (و مشابه)

## 3) Mapping به چارچوب‌های حقوقی (برای طراحی، نه مشاوره حقوقی)
### EU (GDPR special categories – خلاصه کاربردی)
- داده‌های ژنتیک، بیومتریک برای شناسایی، سلامت، زندگی جنسی/گرایش جنسی، ... در دسته “sensitive” مطرح می‌شوند.

### Colorado Privacy Act (Sensitive Data)
- تعریف شامل: نژاد/قومیت/مذهب، سلامت، گرایش جنسی/زندگی جنسی، citizenship status
- همچنین biometric داده برای شناسایی
- و حتی “Sensitive Data Inferences” (استنباط‌های حساس از روی داده‌ها) در قواعد CPA مطرح می‌شود.

### California (CCPA/CPRA)
- “Sensitive personal information” و همچنین الزام افشای مدت نگهداری/محدودیت نگهداری به “reasonably necessary”.

## 4) Engineering tags (برای کد)
برای هر فیلد/attribute در DTOها:
- `sensitivity: P0|P1|P2|P3`
- `collection_mode: required|optional|forbidden`
- `storage: no_store|ephemeral|persist`
- `allowed_purposes: [...]`

## 5) Default policy
- P3 پیش‌فرض: forbidden (مگر use case قانونی/قراردادی روشن + guardrails + human review)
- P2: opt-in + logging + access controls
- P1: minimisation + retention محدود
```

(برای مصادیق “sensitive data” در EU و CO منابع رسمی/نیمه‌رسمی داریم: EU Commission درباره sensitive data  و Colorado AG درباره CPA و حساس‌ها . برای “Sensitive Data Inferences” هم متن مقررات CPA قابل استناد است.  همچنین برای محدودیت نگهداری در CA، متن قانون 1798.100 کلیدی است. )

---

## 5) `docs/mcp/privacy/06-prohibited-data.md`
این خط قرمزهای داده‌ای است: چه چیزی را نباید جمع کنیم/پردازش کنیم.

```md
# Privacy — Prohibited Data (Default)
Last updated: 2026-07-21

## 1) هدف
کاهش ریسک از روز اول:
- اگر چیزی را جمع نکنیم، بعداً مجبور نیستیم از آن دفاع/حفاظت/حذف پیچیده انجام دهیم.
- بسیاری از داده‌ها هم “حساس” هستند هم در HR ریسک تبعیض/شکایت را بالا می‌برند.

## 2) Prohibited (P3 by default)
این موارد در ورودی کاربر/اینtegration/پرامپت‌ها نباید وارد سیستم شود (و اگر detect شد باید block/redact شود):

### 2.1) Health / medical / diagnosis
- وضعیت سلامت، پرونده پزشکی، تشخیص‌ها، داروها، اطلاعات درمانی

### 2.2) Biometric identifiers (برای شناسایی)
- facial template/face map, voiceprint, fingerprint و هر چیزی که برای شناسایی یکتا استفاده شود

### 2.3) Genetic data / biological-neural data (اگر به سمت آن رفت)
- داده ژنتیک یا داده‌های زیستی برای شناسایی

### 2.4) Sex life / sexual orientation
- هر داده مستقیم یا inferred

### 2.5) Religious beliefs / race / ethnicity (به‌عنوان فیلد تصمیم‌ساز)
- محصول نباید این‌ها را برای تولید معیار استخدامی/score استفاده کند

## 3) Prohibited (security-hardline)
این‌ها “از نظر امنیتی” هم نباید وارد شوند:
- passwordهای خام
- شماره کارت بانکی/اطلاعات پرداخت
- SSN / شماره‌های هویتی دولتی (مگر با طراحی خاص و ضرورت قطعی که فعلاً نداریم)

## 4) Handling when prohibited data appears
- best-effort detection (regex + classifier) → redact → ادامه با نسخه scrubbed
- اگر scrub قابل اعتماد نیست: block request و پیام راهنما
- ثبت یک audit finding بدون ذخیره‌ی خود داده‌ی ممنوع

## 5) Exceptions policy
هر استثنا نیاز دارد به:
- ADR جدید + threat model + retention/deletion مشخص + دسترسی محدود + تست
```

(این لیست روی تعریف‌های رسمی “حساس” تکیه دارد: EU Commission برای بیومتریک/ژنتیک/سلامت/گرایش جنسی  و Colorado AG برای CPA sensitive data  و همچنین تعریف‌های “biometric identifier”/inferences در قواعد CPA .)

---

## 6) `docs/mcp/privacy/07-consent-policy.md`
اینجا دقیقاً می‌گوییم consent/permission چطور انجام می‌شود، و کجا “attestation” بهتر از consent است.

```md
# Privacy — Consent & Notice Policy
Last updated: 2026-07-21

## 1) هدف
- یک سیاست عملی برای گرفتن permission/notice
- تفکیک consent حقوقی از consent به‌عنوان UX
- جلوگیری از اتکا به consent در جاهایی که “آزاد” نیست (مثل رابطه کارفرما/کارمند)

## 2) Consent types (در محصول)
### C0 — No consent needed (strictly necessary)
- auth
- security logging (حداقلی)
- delivering requested output (draft JD)

### C1 — Feature permission (opt-in)
- ذخیره promptها برای بهبود تجربه
- فعال‌سازی integration های ATS/HRIS
- ارسال گزارش‌ها به ایمیل

### C2 — Sensitive processing permission (explicit opt-in)
- پردازش ورودی‌هایی که ممکن است حساس باشند (مثل CV کامل)
- هر نوع profiling پیشرفته

### C3 — “Legal consent” (اگر واقعاً لازم شد)
- مواردی که قانون صراحتاً رضایت معتبر/صریح می‌خواهد (بسته به جغرافیا/سناریو)
- در HR/استخدام، این حالت باید با احتیاط شدید استفاده شود

## 3) Employment power-imbalance warning
- در سناریوهایی که کارفرما از کارمند/کاندیدا رضایت می‌گیرد، ممکن است رضایت “آزاد” نباشد.
- بنابراین ما برای بسیاری از قابلیت‌ها به جای relying on consent:
  - از “policy gating” و “attestation” مشتری استفاده می‌کنیم
  - و human review را الزام می‌کنیم

## 4) Consent UX requirements
- روشن، granular، قابل پس‌گرفتن
- withdrawal باید ساده و بدون detriment باشد
- ثبت event:
  - who, when, what, scope, policy_version

## 5) Notices (شفافیت)
- notice at collection: چه دسته داده‌ای و برای چه هدفی
- retention: چه مدت/معیار نگهداری
- DSAR channel: مسیر درخواست حذف/دسترسی

(برای California، notice at collection و disclosure retention از نظر قانونی مهم است.)
```

(برای “consent در شرایط عدم توازن قدرت (مثل employment) مشکل‌دار است” راهنمای EDPB صریح است.  همچنین برای California، الزامات notice/retention در 1798.100 آمده است. )

---

## 7) `docs/mcp/privacy/09-data-retention-deletion.md`
این‌جا “مدت نگهداری” و “حذف” را عملی می‌کنیم (کلاس‌ها + پیش‌فرض‌ها + بکاپ‌ها).

```md
# Privacy — Data Retention & Deletion Policy
Last updated: 2026-07-21

## 1) هدف
- اجرای storage limitation: نگهداری “نه بیشتر از لازم”
- آماده‌سازی برای deletion requests (DSAR)
- جلوگیری از نگهداری بی‌هدف log/prompt

## 2) Retention principles
- برای هر category باید retention مشخص باشد (یا معیار مشخص)
- نگهداری نباید از حد “reasonably necessary” برای هدف اعلام‌شده بیشتر شود
- داده‌های حساس retention کوتاه‌تر + کنترل دسترسی سخت‌تر

## 3) Default retention schedule (پیشنهادی v0)
> این اعداد “پیشنهادی محصولی” هستند و باید با نیازهای قرارداد/قانون sync شوند.

- R0 (ephemeral): raw prompts در حالت no-store (پیش‌فرض سازمان‌های حساس)
- R1 (short): telemetry/debug logs = 30–90 روز
- R2 (business): outputs مرتبط با پروژه/نقش = مدت قرارداد + 180 روز (برای تحویل/انتقال/اختتام)
- R3 (compliance): audit events حداقلی = 1 تا 3 سال (حداقلی و بدون payload حساس)

## 4) Deletion policy (functional)
### 4.1) Soft delete vs hard delete
- Soft delete: برای جلوگیری از نمایش/استفاده
- Hard delete: حذف فیزیکی/کریپتو-شردینگ کلید

### 4.2) Backups
- بکاپ‌ها باید lifecycle داشته باشند
- deletion باید در “چرخه بکاپ” منعکس شود (مثلاً حذف از restore-path یا crypto-erasure)

### 4.3) DSAR readiness
- باید بتوانیم:
  - data export (دسترسی)
  - data deletion (تا حد ممکن)
  - record of action (audit)

## 5) Legal holds / exceptions
اگر نگهداری برای:
- امنیت (incident investigation)
- تعهد قانونی
- اختلاف/دعوی
لازم شد، retention ممکن است extend شود ولی باید:
- محدود، مستند، و audit شود.

## 6) Implementation notes (برای apps/api)
- هر record باید:
  - `created_at`
  - `retention_class`
  - `expires_at` یا `retention_rule_id`
- یک job دوره‌ای برای purge
- یک job برای “scrub old prompts” (کم‌ریسک‌تر از purge کامل در ابتدا)

## References (for compliance team)
- GDPR principles: storage limitation / data minimisation
- California Civil Code 1798.100: disclosure of retention length + not longer than reasonably necessary
- UK ICO: right to erasure guidance
```

(پایه حقوقی/اصولی این فایل: storage limitation در اصول GDPR  و الزام CA برای افشای مدت نگهداری + منع نگهداری بیش از “reasonably necessary” در 1798.100 . برای حذف/erasure هم راهنمای ICO منبع قابل اتکاست. )

---

# (اختیاری) اسکلت `apps/api` برای Sprint 2

## `apps/api/src/mcp/privacy.rs`

```rust
// apps/api/src/mcp/privacy.rs

use super::types::{GeoContext, Jurisdiction};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SensitivityClass {
    P0,
    P1,
    P2,
    P3,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CollectionMode {
    Required,
    Optional,
    Forbidden,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RetentionClass {
    R0,
    R1,
    R2,
    R3,
}

#[derive(Debug, Clone)]
pub struct DataElementPolicy {
    pub key: &'static str,                 // e.g. "candidate.resume_text"
    pub sensitivity: SensitivityClass,
    pub collection: CollectionMode,
    pub retention: RetentionClass,
    pub allowed_purposes: &'static [&'static str],
}

#[derive(Debug, Clone)]
pub struct ConsentEvent {
    pub subject_id: String,
    pub subject_type: String, // "admin" | "candidate" | "employee"
    pub consent_type: String, // "C1" | "C2" | "C3"
    pub scope: Vec<String>,   // e.g. ["store_prompts", "ats_integration"]
    pub granted: bool,
    pub policy_version: String,
    pub ts_unix_ms: i64,
}

#[derive(Debug, Clone)]
pub struct PrivacyEvalResult {
    pub triggered: Vec<Jurisdiction>,
    pub blocked_fields: Vec<String>,
    pub required_notices: Vec<String>,
    pub required_optins: Vec<String>,
    pub notes: Vec<String>,
}

/// Stub: later becomes a rule registry + scanners.
pub fn evaluate_privacy(
    _geo: &GeoContext,
    input_keys: &[String],
    policies: &[DataElementPolicy],
) -> PrivacyEvalResult {
    let mut blocked_fields = vec![];
    for k in input_keys {
        if let Some(p) = policies.iter().find(|p| p.key == k.as_str()) {
            if p.collection == CollectionMode::Forbidden {
                blocked_fields.push(k.clone());
            }
        }
    }

    PrivacyEvalResult {
        triggered: vec![Jurisdiction::Global],
        blocked_fields,
        required_notices: vec![],
        required_optins: vec![],
        notes: vec!["Stub privacy evaluator. Add scanners + geo triggers later.".to_string()],
    }
}
```

---

## Completeness pass (Sprint 2 شما)
- `process/02-data-inventory.md` ساخته شد
- `process/03-consent-privacy-rules.md` ساخته شد
- `privacy/01-data-inventory-overview.md` ساخته شد (با جدول v0)
- `privacy/05-sensitive-data-classification.md` ساخته شد (با mapping EU/CO/CA)
- `privacy/06-prohibited-data.md` ساخته شد
- `privacy/07-consent-policy.md` ساخته شد (با هشدار power-imbalance مطابق EDPB)
- `privacy/09-data-retention-deletion.md` ساخته شد (با retention کلاس‌ها + DSAR-ready)

اگر بخواهید همین حالا Sprint 3 را هم در همین سبک بسازیم، من می‌توانم “Methodology” را طوری بنویسم که از همین Sprint 2 روی **پرهیز از inference حساس** (مثل Sensitive Data Inferences در CPA) هم سوار شود. 
Sprint 3 را طوری می‌سازم که «روش تحلیل»‌ها هم **استاندارد، قابل تکرار، و کم‌ریسک** باشند و هم از همان اول با منطق محصول شما سازگار باشند: خروجی‌ها **advisory/draft**، بدون “تصمیم‌گیری استخدامی خودکار”، و بدون استنباط‌های حساس. چارچوب شواهد هم این‌هاست: تعریف Big Five از APA ، ارتباط Big Five (خصوصاً conscientiousness) با عملکرد شغلی در متاآنالیز Barrick & Mount ، استانداردهای اعتبارسنجی برای ابزارهای ارزیابی/انتخاب (به‌ویژه وقتی AI دخیل است) از SIOP ، و درباره MBTI هم هم «ممنوعیت استفاده برای hiring/selection در اخلاق/راهنمای ناشر»  و هم نقدهای مستقل (Pittenger 2005)  و شواهد تغییر type در بازآزمایی از National Academies . برای SWOT هم هم مرور پژوهشی Helms & Nixon و هم نقد کلاسیک Hill & Westbrook را مبنا می‌گذارم تا خروجی‌ها “لیست بی‌اثر” نشوند.  برای Gap Analysis هم تعریف «current vs desired state» را از World Bank می‌گیریم و برای نسخه HR-محور به منطق workforce planning در CIPD تکیه می‌کنیم. 

در ادامه فایل‌های Sprint 3 (آماده‌ی کپی در ریپو):

---

## 1) `docs/mcp/process/04-analysis-methodology.md`

```md
# Sprint 3 — HR Analysis Methodology (Process)
Last updated: 2026-07-21

> هدف: استاندارد کردن روش‌هایی که سیستم برای «تحلیل» استفاده می‌کند تا:
> - خروجی‌ها تکرارپذیر، قابل توضیح و قابل audit باشند
> - ریسک سوءاستفاده در hiring/selection کم شود
> - فشار روی LLM کم شود (پاسخ‌ها قالب‌دار و rule-driven باشند)

این سند مشاوره روان‌شناسی یا حقوقی نیست؛ سند استاندارد محصول است.

---

## 1) اصول پایه (Non-negotiables)

1) **Advisory-only**
- خروجی‌ها: draft / suggestion / hypothesis
- خروجی‌ها نباید به‌عنوان «تصمیم استخدام» یا «رد/قبولی قطعی» بیان شوند.

2) **No automated selection**
- سیستم نباید scoring/ranking کاندیدا تولید کند مگر در فازهای بعدی با طراحی compliance + validation.

3) **No sensitive inference**
- سیستم نباید از متن CV/چت/ویدئو/صدا، ویژگی‌های حساس (یا استنباط‌های حساس) را حدس بزند.
- Personality هم «استنباط از داده‌های رفتاری/متنی» پیش‌فرض ممنوع است؛ فقط «خلاصه‌سازی/تفسیر داده self-report» مجاز است.

4) **Explainability by structure**
هر خروجی تحلیلی باید این بخش‌ها را داشته باشد:
- Method (نام روش)
- Inputs used (چه چیزهایی استفاده شد)
- Assumptions
- Evidence strength (Low/Med/High)
- Limitations & risks
- Recommended next steps (human actions)

---

## 2) Method Registry (کاتالوگ روش‌ها)

### 2.1) Personality / Individual-level (Developmental use)
- Big Five (FFM): مجاز فقط با داده self-report (نمره/پروفایل کاربر)
- MBTI: مجاز فقط برای team development و به‌صورت غیرانتخابی؛ برای hiring/selection ممنوع

### 2.2) Business/Org-level analysis
- SWOT: مجاز برای تحلیل استراتژیک (اما باید به action تبدیل شود)
- Gap Analysis: مجاز برای skill/capability gap، workforce planning، فرآیندها

---

## 3) Input Policy (ورودی‌های مجاز/ممنوع)

### Allowed inputs (نمونه)
- context role/team/company (بدون داده شخصی حساس)
- self-reported Big Five scores
- اهداف کسب‌وکار، KPIهای فعلی، constraints، بودجه/زمان

### Disallowed by default
- ویدئو/صدا برای تحلیل شخصیت
- هر نوع “تشخیص روانی/پزشکی”
- داده‌های ممنوع/حساس طبق Sprint 2 (P3)

---

## 4) Output Policy (الزام‌های خروجی)

هر تحلیل باید:
- **قابل استفاده عملی** باشد (actionable)
- **از ادعاهای پیش‌بینی‌گرانه قوی** (مثل “این فرد موفق نمی‌شود”) پرهیز کند
- **زبان تبعیض‌آمیز** تولید نکند
- یک “Human review hint” داشته باشد (چه کسی/چه تیمی باید review کند)

---

## 5) QA / Validation Hooks (برای Sprintهای بعد)
- Test vectors: برای هر روش 3 سناریو نمونه + خروجی انتظار
- Audit tags:
  - `method_id`
  - `method_version`
  - `evidence_strength`
  - `inputs_used[]`
  - `policy_version`

---

## 6) Reference list (non-normative)
- Big Five definition (APA Dictionary): https://dictionary.apa.org/big-five-personality-model
- Big Five & job performance (Barrick & Mount 1991): https://doi.org/10.1111/j.1744-6570.1991.tb00688.x
- SIOP (AI assessments validation for selection, Jan 2023 PDF):
  https://www.siop.org/wp-content/uploads/2024/12/Considerations-and-Recommendations-for-the-Validation-and-Use-of-AI-Based-Assessments-for-Employee-Selection-January-2023.pdf
- MBTI ethics (do not use for hiring): https://www.myersbriggs.org/using-type-as-a-professional/mbti-code-of-ethics/home.htm
- Pittenger (2005) cautionary comments (MBTI): (cite/locate via journal databases)
```

---

## 2) `docs/mcp/hr/01-personality-analysis-big-five.md`

```md
# HR — Personality Analysis (Big Five / FFM)
Last updated: 2026-07-21

## 0) One-line policy
Big Five تحلیل «توسعه‌ای» است، نه ابزار انتخاب/حذف کاندیدا.

---

## 1) چی هست؟
مدل Big Five (یا Five-Factor Model) شخصیت را روی 5 بُعد پیوسته توصیف می‌کند:
- Openness
- Conscientiousness
- Extraversion
- Agreeableness
- Neuroticism (گاهی “emotional stability” را معکوس آن می‌گویند)

این مدل “type” نیست؛ یعنی فرد را به 16 دسته ثابت تقسیم نمی‌کند، بلکه شدت هر بُعد را نشان می‌دهد.

Sources (non-normative):
- APA definition: https://dictionary.apa.org/big-five-personality-model

---

## 2) چرا استفاده می‌کنیم؟
در فضای کار/سازمان، Big Five می‌تواند کمک کند به:
- خودشناسی شغلی (work style)
- سبک همکاری/ارتباط
- طراحی نقش (role design) و محیط کاری
- coaching و برنامه رشد

همچنین پژوهش‌ها نشان داده‌اند برخی ابعاد (خصوصاً Conscientiousness) با معیارهای عملکرد شغلی رابطه دارند؛
اما این رابطه “میانه” است و برای تصمیم‌گیری استخدامی باید ارزیابی معتبر و job-related انجام شود.

Sources (non-normative):
- Barrick & Mount (1991): https://doi.org/10.1111/j.1744-6570.1991.tb00688.x

---

## 3) ورودی مجاز (Input Standard)
### Allowed
- نمره‌های self-report (مثلاً درصد/اسکور هر trait) که خود فرد/کاربر ارائه می‌کند
- توضیحات خود فرد درباره ترجیحات کاری (به شرط عدم ورود داده حساس)

### Disallowed (default)
- استنباط Big Five از CV/چت/ویدئو/صدا
- تحلیل پزشکی/بالینی/تشخیصی

---

## 4) قالب خروجی استاندارد (Output Template)

### A) Summary (2–4 bullets)
- سبک کاری محتمل
- نقاط قوت محتمل
- ریسک‌های رفتاری محتمل (در شرایط فشار)

### B) Trait-by-trait interpretation
برای هر trait:
- معنی high/low در محیط کار
- چه نوع taskهایی مناسب‌تر است
- چه “کمک‌کار”هایی پیشنهاد می‌شود (process/tooling)

### C) Team interaction notes
- چه چیزهایی ممکن است friction بسازد
- چه توافق‌هایی friction را کم می‌کند

### D) Evidence & limitations
- evidence_strength: Low/Med/High
- محدودیت‌ها: self-report bias، context dependence
- warning: not for hiring selection

### E) Next steps (human actions)
- گفتگو با manager
- برنامه رشد 30/60/90
- اگر لازم: ارزیابی‌های job-related معتبر (خارج از این سیستم)

---

## 5) Red lines
سیستم نباید:
- “این فرد برای این کار مناسب نیست” به‌صورت قطعی بگوید
- scoring/ranking کاندیدا تولید کند
- توصیه‌ای بدهد که به تبعیض منجر شود

---

## 6) Example snippet (safe style)
- “با توجه به self-report شما، احتمالاً در کارهای نیازمند نظم و پیگیری (Conscientiousness بالا) راحت‌تر هستید؛
  پیشنهاد: برای جلوگیری از فرسودگی، زمان‌بندی recovery و تعریف Done واضح داشته باشید.”
```

---

## 3) `docs/mcp/hr/02-mbti-limitations.md`

```md
# HR — MBTI Limitations & Policy
Last updated: 2026-07-21

## 0) Policy (hard line)
MBTI برای استخدام/گزینش/اسکرینینگ استفاده نمی‌شود.

---

## 1) چرا این سند لازم است؟
MBTI بسیار رایج است و کاربران آن را درخواست می‌کنند.
اما:
- خودِ اکوسیستم MBTI (اخلاق حرفه‌ای/راهنماهای رسمی) استفاده برای screening/hiring را غیراخلاقی/نامناسب می‌داند.
- پژوهش‌های نقد نیز روی محدودیت‌های “type” و کاربردهای انتخابی تاکید دارند.

Sources (non-normative):
- MBTI Code of Ethics: https://www.myersbriggs.org/using-type-as-a-professional/mbti-code-of-ethics/home.htm
- MBTI Facts (not intended for selection): https://www.themyersbriggs.com/en-us/support/mbti-facts
- Pittenger (2005): "Cautionary Comments Regarding the Myers-Briggs Type Indicator" (Consulting Psychology Journal)

---

## 2) محدودیت‌های عملی (product-facing)
### 2.1) Type instability / retest shifts
در practice، بخشی از افراد در retest (یا با گذر زمان) type متفاوت report می‌کنند؛
پس “برچسب type” برای تصمیم‌های سنگین، ریسک بالایی دارد.

Reference (non-normative):
- National Academies (discussion of type designation changes): https://www.nationalacademies.org/read/1580/chapter/8

### 2.2) Not predictive for job performance (policy stance)
حتی منابع رسمی MBTI می‌گویند ابزار برای “پیش‌بینی عملکرد شغلی” و انتخاب طراحی نشده است.

Reference:
- MBTI Facts: https://www.themyersbriggs.com/en-us/support/mbti-facts

---

## 3) Allowed uses (within this product)
- team building (غیرانتخابی)
- conflict management / communication styles
- leadership development
- coaching (با تاکید بر اینکه “همه typeها می‌توانند همه کارها را انجام دهند”)

## 4) Disallowed uses
- screening applicants
- ranking candidates
- job placement decisions
- promotion decisions

اگر کاربر درخواست کند:
- پاسخ سیستم باید “refuse + redirect” باشد:
  - توضیح کوتاه “این استفاده ممنوع است”
  - پیشنهاد جایگزین: job analysis + structured interview + work sample (خارج از این Sprint)

---

## 5) Output template (اگر کاربر MBTI برای توسعه خواست)
- “What MBTI is / isn’t” (یک پاراگراف)
- “How to use safely” (3 bullet)
- “Team agreements” (مثلاً: زمان برای فکر کردن، نوشتاری vs شفاهی)
- “Limitations & do-not-use-for-hiring” (disclaimer)

---

## 6) Implementation hook
در compliance engine:
- capability `CandidateScoring` اگر همراه `MBTI` درخواست شد => block + audit finding
```

---

## 4) `docs/mcp/hr/05-business-swot-analysis.md`

```md
# HR / Business — SWOT Analysis Standard
Last updated: 2026-07-21

## 1) هدف
SWOT را برای “شروع گفتگو + ساختن گزینه‌های عملی” استفاده می‌کنیم،
نه صرفاً تولید یک جدول تزئینی.

پژوهش‌ها و نقدهای شناخته‌شده می‌گویند SWOT اگر به مرحله اقدام وصل نشود، خروجی‌اش اغلب در ادامه استراتژی استفاده نمی‌شود.

References (non-normative):
- Hill & Westbrook (1997) "SWOT analysis: It's time for a product recall"
- Helms & Nixon (2010) review: "Exploring SWOT analysis – where are we now?"

---

## 2) ورودی استاندارد
- Company snapshot (size, stage, product lines)
- Market context (competitors, trends)
- Constraints (budget, hiring, time)
- Strategic goal (6–12 months)

## 3) Output استاندارد (قابل اجرا)

### A) SWOT table (evidence-tagged)
برای هر bullet باید:
- evidence_tag: (Data | Interview | Assumption)
- impact: Low/Med/High

### B) Prioritization (Top 3)
- Top 3 Strengths to leverage
- Top 3 Weaknesses to fix
- Top 3 Opportunities to pursue
- Top 3 Threats to mitigate

### C) TOWS-style actions (حداقل 6 اقدام)
- SO actions (استفاده از قوت برای فرصت)
- ST actions (استفاده از قوت برای دفع تهدید)
- WO actions (استفاده از فرصت برای رفع ضعف)
- WT actions (کمینه‌کردن ضعف برای کاهش تهدید)

### D) Ownership & timeline
هر اقدام:
- owner (team/role)
- metric (KPI)
- deadline

## 4) Red flags
- bulletهای کلی مثل “بهبود کیفیت” بدون evidence و metric
- بیش از 10 bullet در هر خانه (علامت اینکه هنوز تحلیل نشده)

## 5) Example (mini)
- Strength: “High retention in core product team (Data: last 12 months)”
- Threat: “Competitor hiring spree in same geo (Assumption + market signals)”
- ST action: “Adjust comp bands for critical roles + accelerate referral pipeline”
```

---

## 5) `docs/mcp/hr/06-gap-analysis.md`

```md
# HR / Workforce — Gap Analysis Standard
Last updated: 2026-07-21

## 1) چی هست؟
Gap analysis یعنی مقایسه “وضعیت فعلی” با “وضعیت مطلوب” برای پیدا کردن فاصله‌ها
و تبدیل آن به برنامه اقدام.

References (non-normative):
- World Bank (definition: present vs desired future): https://openknowledge.worldbank.org/server/api/core/bitstreams/1c927558-0e53-5d2c-a68e-77cca879dec0/content
- CIPD workforce planning: identifying the gap between present and future workforce needs:
  https://www.cipd.org/uk/knowledge/factsheets/workforce-planning-factsheet/

---

## 2) Use cases در محصول
- skill gap analysis برای یک تیم/نقش
- capability gap برای رسیدن به OKR/strategy
- process gap (مثلاً hiring pipeline) — اگر داده کافی باشد

## 3) ورودی استاندارد
- target state (role expectations / goals / KPI targets)
- current state (skills inventory / performance signals)
- constraints (budget/time/headcount)
- time horizon (مثلاً 3/6/12 ماه)

## 4) Output استاندارد (قابل اقدام)

### A) Gap table
ستون‌ها:
- capability/skill
- current level (0–5)
- target level (0–5)
- delta
- business impact (Low/Med/High)
- priority (P0/P1/P2)
- recommended intervention (hire/train/process/tool)
- owner + timeline
- metric

### B) Root cause hypotheses (حداکثر 5)
- آیا مشکل skill است یا process یا incentive یا tooling؟

### C) Plan (30/60/90)
- quick wins
- mid-term
- structural fixes

## 5) Red lines
- gap analysis برای “رتبه‌بندی کاندیداها” استفاده نمی‌شود
- اگر داده حساس وارد شد => scrub/block طبق Sprint 2
```

---

# (اختیاری) اسکلت سبک `apps/api/src/mcp/hr_standards.rs`

```rust
// apps/api/src/mcp/hr_standards.rs

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AnalysisMethodId {
    BigFiveSelfReport,
    MbtiDevelopmentOnly,
    Swot,
    GapAnalysis,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EvidenceStrength {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone)]
pub struct AnalysisMeta {
    pub method: AnalysisMethodId,
    pub method_version: String,
    pub evidence_strength: EvidenceStrength,
    pub inputs_used: Vec<String>,
    pub limitations: Vec<String>,
    pub disclaimers: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct BigFiveProfile {
    // 0..100 or 0..1; choose later
    pub openness: f32,
    pub conscientiousness: f32,
    pub extraversion: f32,
    pub agreeableness: f32,
    pub neuroticism: f32,
    pub source: String, // "self_report"
}

#[derive(Debug, Clone)]
pub struct GapRow {
    pub capability: String,
    pub current_level: u8, // 0..5
    pub target_level: u8,  // 0..5
    pub impact: String,    // Low/Med/High (string for now)
    pub priority: String,  // P0/P1/P2
    pub intervention: String,
}

#[derive(Debug, Clone)]
pub struct AnalysisOutput<T> {
    pub meta: AnalysisMeta,
    pub result: T,
}
```

---

اگر همین را در ریپو بگذارید، Sprint 4 (Position Generation Standard) را می‌شود خیلی تمیز روی همین روش‌شناسی سوار کرد: هر استاندارد تولید JD/KPI/Leveling هم دقیقاً همین قالب “Method + Inputs + Limitations + Next steps” را می‌گیرد و بعداً به validator وصل می‌شود.
Sprint 4 را می‌سازم با این فرض محصول شما فعلاً روی **ساخت/اعتبارسنجی استانداردِ Position** (JD + KPI + Leveling + KSAO + mapping) تمرکز دارد و هنوز وارد **candidate scoring/ranking** نشده (طبق مرزهای Sprint 1 و 3). برای اینکه استانداردها “روی هوا” نباشند، چند لنگر بیرونی را هم داخل سندها لحاظ می‌کنم: مفهوم **essential functions** در JD طبق EEOC/ADA ، چارچوب KSAO و اتکای طراحی ارزیابی‌ها به job analysis در منابع I-O/SIOP ، ساختارهای O*NET (Content Model + Job Zones/SVP) ، و برای KPI هم SMART (ارجاع به Doran 1981)  و Balanced Scorecard به‌عنوان یک چارچوب رایج KPI . برای mapping هم از O*NET و ESCO استفاده می‌کنیم و در سند به لایسنس/attribution آن‌ها توجه می‌دهیم .

در ادامه خروجی‌های فایل‌محور Sprint 4 (آماده کپی در ریپو):

---

## 1) `docs/mcp/process/05-position-generation-standard.md`

```md
# Sprint 4 — Process: Position Generation Standard
Last updated: 2026-07-21

هدف این Sprint: استاندارد کردن “Position Object” که محصول تولید می‌کند:
- Job Description (JD)
- KPI set
- Role leveling
- KSAO profile
- (اختیاری) Mapping به taxonomy های O*NET / ESCO

این سند مشاوره حقوقی نیست؛ سند استاندارد محصول است.

---

## 1) Principles (Non-negotiables)

1) Output = Draft, not decision
- خروجی‌ها «پیشنویس/پیشنهاد» هستند، نه تصمیم استخدامی.
- خروجی‌ها نباید به candidate scoring/ranking منتهی شوند.

2) Privacy & minimisation (هم‌راستا با Sprint 2)
- ورودی‌ها باید job-centric باشند، نه شخص-centric.
- Candidate data پیش‌فرض خاموش.

3) “Essential functions” clarity
- JD باید بین “essential functions” و “nice-to-have” تمایز ایجاد کند.
- این تمایز برای ADA/Accommodation و دفاع‌پذیری مهم است (EEOC روی “essential functions” و ارزش JD نوشته‌شده قبل از جذب تاکید دارد).

4) Actionability
- KPIها باید قابل اندازه‌گیری، قابل مالکیت، و در کنترل نقش باشند.
- Leveling باید قابل کالیبراسیون باشد (نه سلیقه‌ای).

---

## 2) Inputs (Position Generation Input Contract)

### Required
- role_title
- job_family (e.g., Engineering, Sales, HR, Finance)
- role_track (IC | Manager)
- level_target (optional; if absent, system proposes)
- location (country/state/city or “remote”)
- employment_type (full-time/part-time/contract)
- core_mission (1–2 sentences)
- top_responsibilities (3–7 bullets)

### Optional
- tech_stack / tools
- team_context (size, cross-functional partners)
- reporting_line
- compensation_range (if policy allows)
- travel / on-call expectations (must be explicit if present)
- compliance flags (NYC/CO/EU safe mode etc from Sprint 1)

### Explicitly discouraged / disallowed by default
- protected attributes
- any candidate-level identifiers
- medical/biometric data

---

## 3) Outputs (Position Object)

### 3.1) JD Draft (structured)
Sections (minimum):
- Title & Summary
- Essential functions (5–10 bullets)
- Responsibilities (may overlap but must be clear)
- Requirements (must-have)
- Preferred qualifications (nice-to-have)
- Work conditions & accommodations note
- EEO / fairness language (baseline safe; expanded in Sprint 5)

### 3.2) KPI Set
- 5–8 KPIs
- mix of leading/lagging (if possible)
- each KPI includes: definition, formula, frequency, data source, owner, target guidance, gaming risks

### 3.3) Role Leveling
- track: IC/Manager
- level label (L1..L6)
- scope, autonomy, impact, complexity, collaboration, people leadership (if manager)

### 3.4) KSAO Profile
- Knowledge
- Skills
- Abilities
- Other characteristics (behaviors/work styles) — non-sensitive, job-related

### 3.5) O*NET/ESCO mapping (optional)
- suggested codes + confidence + “requires human review”
- attribution notes (license/endorsement disclaimers)

---

## 4) Definition of Done (Sprint 4)
- استانداردهای 5 فایل HR زیر تولید شود:
  - `07-job-description-standard.md`
  - `08-kpi-standard.md`
  - `09-role-leveling-standard.md`
  - `10-ksao-standard.md`
  - `11-onet-esco-mapping.md`
- هر فایل حداقل:
  - Purpose
  - Scope
  - Input/Output
  - Red lines
  - Example snippet

---

## 5) Non-normative anchors (references)
- EEOC/ADA essential functions & job description evidentiary value: https://www.eeoc.gov/publications/ada-your-responsibilities-employer
- O*NET Content Model: https://www.onetcenter.org/content.html
- O*NET Job Zones/SVP: https://www.onetonline.org/help/online/zones | https://www.onetonline.org/help/online/svp
- SMART goals (Doran 1981 reference): https://www.research.chop.edu/sites/default/files/web/sites/default/files/getting-smarter-with-goal-setting-process-maps.pdf
- Balanced Scorecard definition context: https://doi.org/10.1007/978-3-030-02006-4_378-1
```

---

## 2) `docs/mcp/hr/07-job-description-standard.md`

```md
# HR — Job Description (JD) Standard
Last updated: 2026-07-21

## 1) Purpose
تولید JD استاندارد که:
- دقیق، قابل اجرا، و قابل ارزیابی باشد
- “essential functions” را روشن کند (برای accommodation و شفافیت)
- از زبان تبعیض‌آمیز/فیلترکننده پرهیز کند
- به KPI/KSAO/Leveling قابل اتصال باشد

(EEOC اشاره می‌کند “essential functions” یعنی وظایف بنیادی و JD مکتوبِ قبل از جذب می‌تواند به عنوان evidence در تشخیص essential functions در نظر گرفته شود.)

Reference (non-normative):
- https://www.eeoc.gov/publications/ada-your-responsibilities-employer

---

## 2) Scope
### In scope
- JD برای نقش‌های جدید یا بازنویسی نقش‌های موجود
- JD برای IC و Manager
- JD برای remote / hybrid / onsite

### Out of scope (for now)
- legal classification (exempt/non-exempt) به‌صورت قطعی
- candidate scoring/ranking
- medical/fitness-for-duty requirements (مگر با طراحی حقوقی خاص)

---

## 3) Inputs
Minimum inputs:
- role_title
- role_track (IC/Manager)
- level_target (optional)
- location / remote policy
- mission statement
- 5–10 essential functions draft (اگر کاربر ندارد، سیستم پیشنهاد می‌دهد)

---

## 4) Output format (Normative)

### 4.1 Header
- Title
- Department / Job family
- Track: IC/Manager
- Level: L1..L6
- Location & work mode
- Reports to (optional)

### 4.2 Role summary (3–5 lines)
- چرا این نقش وجود دارد؟
- خروجی/اثر نقش چیست؟
- با چه تیم‌هایی زیاد کار می‌کند؟

### 4.3 Essential functions (5–10 bullets)
Rules:
- هر bullet با فعل عملی شروع شود (design/build/own/lead/…)
- قابل مشاهده/قابل ارزیابی باشد
- “روش انجام” را essential function نکنید اگر روش‌های دیگر با accommodation ممکن است (نمونه: “توانایی بلند کردن 50 پوند” را به عنوان روش ننویسید؛ خود function را توصیف کنید).

(EEOC در راهنمای فنی ADA درباره job analysis و essential functions و تفاوت function و method توضیح می‌دهد.)

Reference (non-normative):
- https://www.eeoc.gov/laws/guidance/technical-assistance-manual-employment-provisions-title-i-americans-disabilities-act

### 4.4 Responsibilities (optional)
- اگر essential functions کافی است، responsibilities را کوتاه نگه دارید.

### 4.5 Requirements (must-have)
Rules:
- باید job-related باشد
- از “سال تجربه” به عنوان proxy بی‌دلیل پرهیز شود
- “degree required” فقط اگر واقعاً ضروری است

### 4.6 Preferred qualifications (nice-to-have)
Rules:
- واضح بنویسید “preferred”
- نباید به شکل پنهان must-have شود

### 4.7 Work conditions & accommodations note
- schedule / on-call / travel (اگر هست باید صریح باشد)
- یک جمله استاندارد: “We provide reasonable accommodations…”

### 4.8 Fairness / EEO baseline language
- یک بلوک safe و خنثی (Sprint 5 توسعه می‌دهد)

---

## 5) Red lines (hard boundaries)
- ممنوع: ذکر سن، جنسیت، نژاد، مذهب، وضعیت تاهل، سلامت، یا هر ویژگی protected به عنوان شرط
- ممنوع: زبان “culture fit” بدون تعریف رفتاری/کاری
- ممنوع: “native speaker only” مگر ضرورت واقعی و قابل دفاع

---

## 6) Example snippet (safe)
Title: Backend Engineer (L3, IC)
Summary: Own backend services powering payments and reporting…
Essential functions:
- Design and implement Rust services with observability…
- Maintain SLIs/SLOs and incident response playbooks…
Requirements:
- Experience building API services…
Preferred:
- Experience with distributed tracing…
```

---

## 3) `docs/mcp/hr/08-kpi-standard.md`

```md
# HR — KPI Standard (Role-level KPIs)
Last updated: 2026-07-21

## 1) Purpose
تعریف KPIهایی که:
- به نتیجه کسب‌وکار وصل باشند
- قابل سنجش و قابل مالکیت باشند
- قابل بازی‌کردن (gaming) نباشند یا حداقل ریسکشان مدیریت شود
- برای role-level تعریف شوند (نه برای ranking افراد)

---

## 2) Evidence anchors (non-normative)
### SMART
SMART به‌عنوان چارچوب هدف‌گذاری رایج است و در بسیاری منابع به Doran (1981) ارجاع داده می‌شود.

Reference:
- https://www.research.chop.edu/sites/default/files/web/sites/default/files/getting-smarter-with-goal-setting-process-maps.pdf

### Balanced Scorecard
Balanced Scorecard یک چارچوب مدیریت/اندازه‌گیری عملکرد است که KPIها را در چند منظر (مالی، مشتری، فرایند داخلی، یادگیری/نوآوری) می‌چیند.

Reference:
- https://doi.org/10.1007/978-3-030-02006-4_378-1

---

## 3) Inputs
- role_mission
- essential functions
- business goals (OKR/strategy)
- data availability (چه دیتایی واقعاً داریم؟)

---

## 4) Output schema (Normative)

برای هر KPI:

1) `name`
2) `type`: Leading | Lagging
3) `definition` (یک جمله دقیق)
4) `formula` (قابل محاسبه)
5) `unit` (%, count, $,…)
6) `frequency` (weekly/monthly/quarterly)
7) `data_source` (system/table/report)
8) `owner` (role/team)
9) `target_guidance` (range or direction)
10) `risks`:
   - gaming risk
   - fairness risk
   - privacy risk
11) `counter_metrics` (برای جلوگیری از بهینه‌سازی مخرب)

---

## 5) KPI rules (hard rules)
- KPI باید در کنترل نقش باشد (یا حداقل influence واضح داشته باشد)
- KPI نباید افراد/کاندیداها را بر اساس protected attributes دسته‌بندی کند
- KPI نباید کارمند را به رفتار ناامن/غیراخلاقی سوق دهد
- تعداد KPIها: 5 تا 8 (بیشتر از این معمولاً focus را می‌کشد)

---

## 6) Example KPIs (Backend Lead)
- Service availability (SLO compliance) — lagging
- Mean time to recover (MTTR) — lagging
- Change failure rate — lagging
- % critical paths with tracing coverage — leading
- Incident postmortems completed within 5 business days — leading

Counter-metric example:
- If “deploy frequency” rises, counter with “change failure rate”.
```

---

## 4) `docs/mcp/hr/09-role-leveling-standard.md`

```md
# HR — Role Leveling Standard (IC/Manager)
Last updated: 2026-07-21

## 1) Purpose
ایجاد یک زبان مشترک برای سطح‌بندی نقش‌ها که:
- قابل کالیبراسیون بین تیم‌ها باشد
- به JD/KPI/KSAO وصل شود
- با استخدام “عادلانه‌تر” سازگار باشد (شفافیت انتظارات)

---

## 2) External anchor (optional, non-normative): O*NET Job Zones/SVP
O*NET مشاغل را در “Job Zones 1–5” بر اساس میزان آمادگی (آموزش/تجربه/تمرین) دسته‌بندی می‌کند و به SVP هم مرتبط است.

Reference:
- Job Zones: https://www.onetonline.org/help/online/zones
- SVP: https://www.onetonline.org/help/online/svp

---

## 3) Level model (Normative)
ما دو track داریم:
- IC track (Individual Contributor)
- M track (Manager)

و یک مقیاس سطح داخلی:
- L1 Associate / Junior
- L2 Intermediate
- L3 Senior
- L4 Staff
- L5 Principal
- L6 Distinguished (rare)

(نام‌ها قابل تغییرند، اما “ابعاد سطح‌بندی” ثابت است.)

---

## 4) Leveling dimensions (each level must specify)
برای هر level باید این ابعاد مشخص شود:

1) Scope (دامنه)
- task / feature / system / org-wide

2) Autonomy (خودگردانی)
- needs close guidance → operates independently → sets direction

3) Impact (اثر)
- local → cross-team → org-level

4) Complexity (پیچیدگی)
- well-defined → ambiguous → novel problems

5) Collaboration & communication
- within team → cross-functional → executive-ready

6) People leadership (only for Manager track)
- mentoring → managing → managing managers

---

## 5) Rules (hard)
- level را با “سال تجربه” تعریف نکنید؛ با scope/impact/autonomy تعریف کنید
- اگر level_target نامشخص است:
  - سیستم دو level پیشنهاد می‌دهد و تفاوت‌شان را با ابعاد بالا توضیح می‌دهد
- remote/onsite جزو level نیست

---

## 6) Output format
- `track`
- `level`
- `dimension_rationale` (برای هر dimension 1–2 جمله)
- `growth_to_next_level` (3 bullet)

---

## 7) Example (IC L3 vs L4)
L3: owns a service; handles ambiguous tickets; mentors juniors
L4: owns a subsystem across services; drives cross-team design; sets standards
```

---

## 5) `docs/mcp/hr/10-ksao-standard.md`

```md
# HR — KSAO Standard
Last updated: 2026-07-21

## 1) Purpose
تعریف KSAO برای هر position به شکلی که:
- job-related و قابل دفاع باشد
- به JD/KPI/Interview guide وصل شود
- تبدیل به “لیست wishlist غیرواقعی” نشود

KSAO یعنی Knowledge, Skills, Abilities, and Other Characteristics.

References (non-normative):
- APA definition of KSAOs: https://dictionary.apa.org/knowledge-skills-abilities-and-other-characteristics
- USAJOBS (KSA overview): https://help.usajobs.gov/faq/job-announcement/ksas
- SIOP (job analysis → identify relevant KSAOs): https://www.siop.org/wp-content/uploads/2024/07/SIOP-Applicant_Reactions_to_Selection_final.pdf

---

## 2) Definitions (product-facing)
- Knowledge: دانستنی‌های قابل یادگیری (facts, concepts)
- Skills: توانایی انجام کار که با تمرین رشد می‌کند (coding, negotiation)
- Abilities: ظرفیت/توانایی عمومی‌تر (reasoning, spatial ability) — با احتیاط و فقط job-related
- Other characteristics: رفتارها/ویژگی‌های کاری غیرحساس و مرتبط (reliability, attention to detail)

---

## 3) Inputs
- essential functions
- KPIs
- tools/tech stack
- constraints (compliance, safety)

---

## 4) Output schema (Normative)
برای هر KSAO:
- `category`: K | S | A | O
- `name`
- `definition`
- `job_related_evidence` (کدام essential function / KPI را پوشش می‌دهد)
- `must_have`: true/false
- `can_be_trained_in_90_days`: true/false
- `assessment_suggestions` (مثلاً: work sample / structured interview / portfolio review)

Rule:
- must_haveها حداکثر 6–8 آیتم باشند.

---

## 5) Red lines
- KSAO نباید proxy برای protected attributes باشد
- “Other characteristics” نباید وارد حوزه سلامت/تشخیص/شخصیت‌سنجی بالینی شود
- ممنوع: “culture fit” مبهم؛ اگر لازم است باید رفتاری/قابل مشاهده تعریف شود

---

## 6) Example (Backend Engineer)
K: HTTP fundamentals
S: Implement REST/gRPC endpoints in Rust
A: Debug complex production issues under time pressure (job-related)
O: Reliable incident communication (clear, timely)
```

---

## 6) `docs/mcp/hr/11-onet-esco-mapping.md`

```md
# HR — O*NET / ESCO Mapping Standard
Last updated: 2026-07-21

## 1) Purpose
اگر کاربر خواست (یا سازمان نیاز داشت) خروجی position را به taxonomyهای استاندارد نگاشت می‌کنیم تا:
- زبان مشترک بین تیم‌ها/کشورها ایجاد شود
- job matching / reporting / analytics ساده‌تر شود
- “skill extraction” به یک واژگان کنترل‌شده وصل شود

---

## 2) Data sources

### 2.1 O*NET (US)
- O*NET مشاغل را با tasks, work activities, skills/knowledge/abilities توصیف می‌کند (Content Model).

References:
- O*NET Content Model: https://www.onetcenter.org/content.html
- DOL overview: https://www.dol.gov/agencies/eta/onet?lang=en

### 2.2 ESCO (EU)
- ESCO به صورت Linked Open Data منتشر می‌شود و از طریق دانلود یا API قابل دسترسی است.

References:
- Use ESCO: https://esco.ec.europa.eu/en/use-esco
- Download ESCO: https://esco.ec.europa.eu/en/use-esco/download
- ESCO API doc (PDF): https://ec.europa.eu/esco/api/doc/esco-api-doc.pdf

---

## 3) Licensing / attribution (hard requirement)
### O*NET
- داده‌ها و وب‌سرویس‌های O*NET رایگان‌اند ولی attribution لازم است.
- همچنین نباید طوری القا کنیم که محصول ما توسط O*NET “endorse” شده.

References:
- O*NET Web Services about (attribution required): https://services.onetcenter.org/about
- O*NET Database license (CC BY 4.0): https://www.onetcenter.org/database.html
- O*NET tools developer license (no endorsement implication): https://www.onetcenter.org/license_toolsdev.html

### ESCO / European Commission sites
- محتوای وب‌سایت‌های Commission (مگر خلافش ذکر شود) تحت CC BY 4.0 است و reuse با attribution مجاز است.

Reference:
- European Commission legal notice (CC BY 4.0 reuse): https://commission.europa.eu/legal-notice_en

---

## 4) Mapping outputs (Normative)
برای هر mapping result:

### O*NET mapping result
- `onet_soc_code` (e.g., 15-1252.00)
- `onet_title`
- `confidence` (0..1)
- `evidence` (matched keywords/tasks)
- `requires_human_review` = true

### ESCO mapping result
- `esco_uri` (occupation URI)
- `esco_preferred_label`
- `confidence`
- `evidence`
- `requires_human_review` = true

---

## 5) Mapping method (v0)
1) Normalize inputs:
- role_title + essential functions + top responsibilities

2) Candidate generation:
- query O*NET by title similarity + task keywords
- query ESCO by label + description similarity

3) Re-ranking:
- score overlap between responsibilities and taxonomy tasks/skills

4) Output:
- top 3 suggestions + short rationale
- always require human review

---

## 6) Red lines
- mapping نباید برای “غربالگری خودکار کاندیدا” استفاده شود
- اگر confidence پایین است، سیستم باید “unknown” بگوید نه حدس قطعی
- attribution باید در UI/API response قابل نمایش باشد (در sprintهای بعدی)

---

## 7) Example response (compact)
O*NET: 15-1252.00 Software Developers (confidence 0.78) — evidence: API design, services…
ESCO: http://data.europa.eu/esco/occupation/... (confidence 0.64) — evidence: backend services…
```

---

اگر خواستید، در همین sprint می‌توانم یک **اسکلت فنی خیلی سبک** هم بدهم برای:
- `PositionDraft` struct
- `Kpi` struct
- `RoleLevel` enum + dimensions
- `KsaoItem` struct
تا Sprint 6/7 راحت‌تر به validator و schema وصلش کنید.
اسپرینت بعدی = **Sprint 5: Bias & Fairness**. این اسپرینت را طوری می‌نویسم که هم برای تولید JD/KPI/Leveling قابل اعمال باشد، هم بعداً مستقیم به **scanner/validator** وصل شود.

لنگرهای حقوقی/استانداردی که این Sprint روی آن‌ها سوار است (برای اینکه قواعد “سلیقه‌ای” نشوند):

- EEOC صراحتاً می‌گوید قوانین فدرال منع تبعیض (مثل Title VII و…) در استفاده از AI هم اعمال می‌شوند، و **تبعیض می‌تواند هم intentional باشد هم از نوع disparate impact**.   
- EEOC در منابعش دسته‌های محافظت‌شده را برای تبعیض شغلی (مثل race/color/religion/sex… و…) فهرست می‌کند و حتی اشاره می‌کند پرسش/عملکردهایی که به این ویژگی‌ها نزدیک می‌شوند می‌توانند **قرینه قصد تبعیض** باشند.   
- در «Uniform Guidelines on Employee Selection Procedures (UGESP)» و تفسیر EEOC، قاعده‌ی سرانگشتی **۴/۵ (۸۰٪)** برای تشخیص adverse impact ذکر شده (و این‌که تضمین “بی‌تبعیض بودن” نیست).   
- برای disability، هم EEOC و هم ADA.gov هشدار می‌دهند ابزارهای الگوریتمی/AI می‌توانند افراد دارای معلولیت را ناعادلانه screen-out کنند و موضوع reasonable accommodation مطرح است.   
- برای UK، لیست “protected characteristics” در راهنمای رسمی GOV.UK آمده است.   
- برای EU هم کمیسیون اروپا grounds رایج تبعیض را (sex، racial/ethnic origin، religion/belief، disability، age، sexual orientation) به‌عنوان واقعیت روزمره و حوزه اقدام ضدتبعیض بیان می‌کند.   

در ادامه فایل‌های Sprint 5 (آماده‌ی کپی در ریپو):

---

## 1) `docs/mcp/process/06-anti-bias-fairness-rules.md`

```md
# Sprint 5 — Process: Anti-bias & Fairness Rules
Last updated: 2026-07-21

هدف: تعریف قواعد “قابل اجرا” برای جلوگیری از خروجی‌های تبعیض‌آمیز در HR.
این سند مشاوره حقوقی نیست؛ سند استاندارد محصول است.

---

## 1) Scope
این Sprint شامل:
- تعریف Protected Attributes (برای چند جغرافیا + baseline جهانی)
- قواعد proxy discrimination (ویژگی‌های جایگزین/همبسته)
- لیست forbidden terms (برای JD و سوالات و KPIها)
- چک‌لیست ضدسوگیری (قبل از خروجی)
- چک‌لیست human approval (چه زمانی review انسانی اجباری است)

خارج از Scope (فعلاً):
- ساخت bias audit آماری واقعی روی داده‌های مشتری (NYC LL144 و …) — در Sprint 6/8

---

## 2) Key definitions (product-facing)
- Protected attribute: ویژگی/هویت/وضعیتی که تبعیض بر اساس آن (مستقیم یا غیرمستقیم) ممنوع/پرریسک است.
- Direct discrimination: خروجی صریحاً شرط/ترجیح بر اساس protected attribute ایجاد کند.
- Indirect / proxy discrimination: خروجی/قواعد “ظاهراً خنثی” ولی در عمل به حذف نامتناسب گروه‌ها منجر شود (disparate impact).
- Screening language: عباراتی که افراد را از درخواست منصرف می‌کند یا عملاً گروهی را حذف می‌کند.

---

## 3) Rule design principles
1) Baseline safe-mode:
   - اگر شک داریم => خروجی خنثی‌تر + require human review
2) “No asking for protected attributes”:
   - سیستم نباید از کاربر بخواهد سن/مذهب/نژاد/… را وارد کند.
3) Exceptions must be explicit:
   - هر استثناء (مثل شرط سن به علت قانون) باید با justification روشن و audit ثبت شود.
4) Evidence tagging:
   - هر یافته fairness باید: rule_id, severity, snippet, suggestion داشته باشد.

---

## 4) Rule IDs (naming)
Format:
FAIR.<TOPIC>.<NUMBER>

Examples:
- FAIR.PROTECTED.001
- FAIR.PROXY.010
- FAIR.TERMS.020
- FAIR.HUMAN_REVIEW.100

---

## 5) Outputs of Sprint 5 (Done)
- fairness/01-protected-attributes.md
- fairness/02-proxy-discrimination-rules.md
- fairness/03-forbidden-terms-list.md
- fairness/04-anti-bias-checklist.md
- fairness/08-human-approval-checklist.md

و یک نتیجه قابل اتصال:
- تعریف “finding schema” برای engine:
  - rule_id
  - severity (Low/Med/High/Critical)
  - category (direct/proxy/harassment/accessibility)
  - message
  - evidence_snippet
  - suggested_rewrite
```

---

## 2) `docs/mcp/fairness/01-protected-attributes.md`

```md
# Fairness — Protected Attributes (Baseline)
Last updated: 2026-07-21

هدف: یک لیست عملیاتی برای guardrail های محصول.
این لیست “حداقل” است؛ قوانین ایالتی/شهری/کشوری می‌توانند موارد بیشتری اضافه کنند.

---

## 1) Global baseline (always treat as protected)
- Race / ethnicity / color
- National origin / nationality (و زبان/لهجه به عنوان proxy)
- Religion / belief
- Sex / gender (including pregnancy-related)
- Sexual orientation
- Gender identity / transgender status
- Age
- Disability (physical, sensory, mental health as disability status)
- Genetic information

Notes:
- “Association”: تبعیض به خاطر ارتباط با فردی از یک گروه محافظت‌شده هم پرریسک است.
- “Perceived”: حتی اگر ویژگی واقعی نباشد ولی برداشت شود (perceived), باز هم ریسک وجود دارد.

---

## 2) United States (EEOC-covered bases) — practical mapping
(برای محصول: همان global baseline را enforce می‌کنیم)

- Title VII: race, color, religion, sex, national origin
- Sex includes pregnancy, sexual orientation, transgender status (EEOC wording)
- ADEA: age 40+
- ADA: disability
- GINA: genetic information

Operational note:
- marital status / number of children در فدرال همیشه protected نیست، اما می‌تواند evidence تبعیض باشد و در بسیاری قوانین ایالتی/محلی protected است؛
  در محصول ما => treat as “restricted topic”.

---

## 3) UK (Equality Act protected characteristics — product mapping)
طبق GOV.UK:
- age
- disability
- gender reassignment
- marriage and civil partnership
- pregnancy and maternity
- race (includes colour, nationality, ethnic or national origin)
- religion or belief
- sex
- sexual orientation

---

## 4) EU baseline (anti-discrimination grounds — product mapping)
به عنوان baseline اروپایی:
- sex
- racial or ethnic origin
- religion or belief
- disability
- age
- sexual orientation

---

## 5) Engineering tags
هر اشاره/شرط/ترجیح مرتبط با موارد بالا باید:
- flagged شود
- یا block شود (اگر در requirement یا screening language باشد)
- یا به human review برود (اگر ambiguous)

Output categories:
- DIRECT_PROTECTED
- PROXY_PROTECTED
- HARASSMENT / HOSTILE_LANGUAGE
- ACCESSIBILITY_RISK (disability-related)
```

---

## 3) `docs/mcp/fairness/02-proxy-discrimination-rules.md`

```md
# Fairness — Proxy Discrimination Rules
Last updated: 2026-07-21

هدف: جلوگیری از “تبعیض غیرمستقیم” (indirect/proxy) و زبان‌هایی که اثر adverse impact دارند.

---

## 1) Core rule (normative)
سیستم نباید requirement/قانون/فیلترهایی تولید کند که:
- ظاهراً خنثی‌اند
- اما به طور قابل پیش‌بینی گروهی از افراد محافظت‌شده را نامتناسب حذف می‌کنند
مگر اینکه:
- job-related + business-necessity justification ارائه شود
- و گزینه کم‌تبعیض‌تر بررسی شود
- و خروجی به human review برود

---

## 2) Common proxies (examples)
### 2.1) Proxies for age
- “recent graduate”، “young”، “digital native”، “high energy young team”
- “max X years experience” (اگر بی‌دلیل)
- “graduation year must be after …”

### 2.2) Proxies for sex / gender / pregnancy
- “must be single”, “no kids”, “willing to work late nights (no exceptions)”
- “female/male preferred”
- نقش‌واژه‌های جنسیتی (he/she) اگر نسخه خنثی ممکن است

### 2.3) Proxies for race / national origin
- “native speaker only”
- محدودیت‌های ملیتی/قومیتی
- ZIP code / neighborhood / address filtering (در سیستم‌های انتخابی)
- name-based heuristics

### 2.4) Proxies for religion
- “must work Sundays” بدون امکان accommodation
- سوالات/اشارات مذهبی در ارزیابی

### 2.5) Proxies for disability
- تست‌های زمان‌دار/keyboard-only بدون alternative
- requirementهای فیزیکی که “روش” هستند نه “essential function”
- “must have perfect vision/hearing” بدون ضرورت واقعی

---

## 3) Enforcement rules in text generation (JD/KPI)
### FAIR.PROXY.010 — Avoid “screening language”
اگر متن شامل عباراتی باشد که گروهی را منصرف/حذف می‌کند => flag + rewrite پیشنهادی.

### FAIR.PROXY.020 — Language requirements must be job-related
- “Fluent in X language” فقط اگر وظیفه job-related دارد
- “Native speaker only” => forbidden by default (rewrite to “professional proficiency”)

### FAIR.PROXY.030 — Degree requirements must be justified
- اگر “degree required” آمده:
  - سیستم باید یک justification خطی اضافه کند یا پیشنهاد دهد به “degree or equivalent experience”

### FAIR.PROXY.040 — Experience years must be bounded carefully
- سال تجربه:
  - بهتر: “demonstrated ability to …”
  - اگر لازم: range منطقی + job-related rationale

---

## 4) Hooks for selection procedures (future)
اگر در آینده وارد “selection” شدیم:
- adverse impact assessment و 4/5ths rule به عنوان heuristic مطرح می‌شود
- اما 4/5ths تضمین عدم disparate impact نیست

(در Sprint 6 این‌ها به rule-matrix و audit وصل می‌شود.)

---

## 5) Output format (finding)
- rule_id
- proxy_type (age/race/…)
- offending_snippet
- risk
- suggested_rewrite
- requires_human_review (true/false)
```

---

## 4) `docs/mcp/fairness/03-forbidden-terms-list.md`

```md
# Fairness — Forbidden Terms / Phrases List (v0)
Last updated: 2026-07-21

هدف: یک لیست عملیاتی برای scanner.
این لیست باید با test vectors و false-positive کنترل شود.

---

## 1) Hard-forbidden (block)
### 1.1) Direct protected-attribute requirements
- “male only”, “female only”
- “Christian only”, “Muslim only”, …
- “white only”, “Aryan”, …
- “no foreigners”, “only [nationality]”
- “under 30”, “age < …” (مگر استثناء قانونی واضح)
- “no disabled”, “must have no disability”

### 1.2) Harassment / slurs
- هر slur نژادی/جنسیتی/همجنس‌گراهراسی/… => block

### 1.3) Medical/diagnostic exclusion language
- “must be mentally healthy”, “no depression/anxiety”, …
- (طبق Sprint 2 هم داده حساس/ممنوع است)

---

## 2) Soft-forbidden (flag + suggest rewrite)
### 2.1) Age-coded
- “young”, “energetic young team”, “digital native”, “recent graduate”
Rewrite: “comfortable learning new tools”, “able to work in a fast-paced environment” (اگر واقعاً job-related)

### 2.2) Gender-coded
- “rockstar/ninja” (گاهی gender-coded تلقی می‌شود) => flag
Rewrite: “highly skilled”, “expert”

### 2.3) National origin / accent
- “native speaker” => flag/block (default)
Rewrite: “professional proficiency in …”

### 2.4) Family status / caregiving
- “no kids”, “must be single” => block/flag
Rewrite: “requires on-call rotation of X; scheduling flexibility available per policy”

### 2.5) Disability risk language
- “must type fast” اگر essential function نیست => flag
Rewrite: “able to produce written communication effectively (assistive tech allowed)”

---

## 3) Allowed exceptions (must be explicit + audited)
- سن حداقلی برای الزامات قانونی (مثلاً سرو الکل) => فقط با justification
- وظایف فیزیکی اگر واقعاً essential function هستند => باید به صورت function بیان شود نه “روش”
- زبان اگر job requires (مثلاً پشتیبانی مشتریان فارسی‌زبان) => “fluency” مجاز، “native only” ممنوع

---

## 4) Scanner implementation notes
- Normalize: lowercase + trim + unicode normalization
- Match modes:
  - exact phrase
  - keyword + context window (±5 tokens)
- Output:
  - severity: High برای hard-forbidden
  - severity: Med برای soft-forbidden
  - suggested rewrite template
```

---

## 5) `docs/mcp/fairness/04-anti-bias-checklist.md`

```md
# Fairness — Anti-bias Checklist (Generator QA)
Last updated: 2026-07-21

این چک‌لیست قبل از ارائه خروجی به کاربر باید pass شود (یا به human review برود).

---

## A) Job Description checklist
1) آیا هیچ requirement/ترجیحی بر اساس protected attributes وجود دارد؟ (must be NO)
2) آیا language “screening” وجود دارد؟ (young/recent graduate/native speaker/…)
3) آیا “essential functions” از “nice-to-have” جدا شده؟
4) آیا degree/years experience بی‌دلیل سخت‌گیرانه است؟
5) آیا work conditions (shift/on-call/travel) شفاف است و امکان accommodation را نفی نمی‌کند؟
6) آیا از اصطلاحات مبهم مثل “culture fit” بدون تعریف رفتاری پرهیز شده؟
7) آیا متن از نظر pronoun/gender neutrality قابل قبول است؟
8) آیا یک جمله “reasonable accommodations” وجود دارد؟

---

## B) KPI checklist
1) آیا KPIها به outcomes کار وصل‌اند و افراد را بر اساس ویژگی‌های protected دسته‌بندی نمی‌کنند؟
2) آیا KPIها “gaming risk” دارند؟ counter-metric دارد؟
3) آیا KPIها افراد را به رفتار ناامن/غیراخلاقی تشویق نمی‌کنند؟

---

## C) Leveling checklist
1) آیا سطح بر اساس scope/impact/autonomy تعریف شده نه “سن/سال تجربه”؟
2) آیا expectations به شکل قابل مشاهده/قابل ارزیابی نوشته شده؟

---

## D) KSAO checklist
1) آیا KSAOها job-related هستند؟
2) آیا “Other characteristics” وارد حوزه سلامت/تشخیص/شخصیت‌سازی نمی‌شود؟
3) آیا must-haveها محدود و واقع‌گرایانه‌اند؟

---

## Outcome
- PASS
- PASS_WITH_WARNINGS (requires user acknowledgement)
- REQUIRE_HUMAN_REVIEW
- BLOCK
```

---

## 6) `docs/mcp/fairness/08-human-approval-checklist.md`

```md
# Fairness — Human Approval Checklist (When review is mandatory)
Last updated: 2026-07-21

هدف: مشخص کنیم چه زمانی خروجی باید قبل از نمایش/استفاده، توسط انسان بررسی شود.

---

## 1) Mandatory human review triggers
### FAIR.HUMAN_REVIEW.100 — Any protected attribute involvement
اگر:
- خروجی شامل protected attribute شد
- یا درخواست کاربر شامل آن شد
=> human review یا block (بسته به شدت)

### FAIR.HUMAN_REVIEW.110 — Any hard-forbidden term hit
اگر scanner به “hard-forbidden” برخورد کرد => BLOCK + audit finding

### FAIR.HUMAN_REVIEW.120 — High-risk geography mode
اگر geo hotspot فعال است (NYC/CO/EU/UK یا هر policy gate) => require review برای خروجی‌های حساس (مثل requirements سخت‌گیرانه)

### FAIR.HUMAN_REVIEW.130 — Accommodation/accessibility risk
اگر خروجی شامل آزمون/فرآیند ارزیابی زمان‌دار/غیرقابل دسترس شد => review

### FAIR.HUMAN_REVIEW.140 — Ambiguous selection language
اگر متن به سمت “reject/hire only if …” رفت => review و rewrite به draft/advisory

---

## 2) Review roles (suggested)
- HR reviewer: job-relatedness / leveling consistency
- Legal/Compliance reviewer: protected attributes / disparate impact risks
- Hiring manager: essential functions accuracy

---

## 3) Reviewer actions
- Approve
- Approve with edits (edits must be captured)
- Reject + request regeneration with constraints

---

## 4) Audit log minimum fields
- reviewer_id
- timestamp
- decision
- rationale (short)
- policy_version
- findings_snapshot (ids فقط، بدون ذخیره متن حساس)
```

---

# (اختیاری) اسکلت خیلی سبک برای `apps/api/src/mcp/bias_fairness.rs`

اگر خواستید همین Sprint را “قابل اتصال” کنید:

```rust
// apps/api/src/mcp/bias_fairness.rs

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Severity { Low, Medium, High, Critical }

#[derive(Debug, Clone)]
pub struct Finding {
    pub rule_id: String,
    pub severity: Severity,
    pub category: String,         // "DIRECT_PROTECTED" | "PROXY_PROTECTED" | ...
    pub message: String,
    pub evidence_snippet: String,
    pub suggested_rewrite: Option<String>,
}

pub struct ForbiddenPhrase {
    pub phrase: &'static str,
    pub rule_id: &'static str,
    pub severity: Severity,
    pub suggested_rewrite: Option<&'static str>,
}

/// v0: ساده (contains). بعداً: tokenizer + context windows + regex/aho-corasick
pub fn scan_forbidden_phrases(text: &str, phrases: &[ForbiddenPhrase]) -> Vec<Finding> {
    let t = text.to_lowercase();
    let mut out = vec![];

    for p in phrases {
        if t.contains(&p.phrase.to_lowercase()) {
            out.push(Finding {
                rule_id: p.rule_id.to_string(),
                severity: p.severity.clone(),
                category: "FAIR.TERMS".to_string(),
                message: format!("Forbidden/flagged phrase detected: {}", p.phrase),
                evidence_snippet: p.phrase.to_string(),
                suggested_rewrite: p.suggested_rewrite.map(|s| s.to_string()),
            });
        }
    }

    out
}
```

---

اگر آماده‌اید، Sprint 6 (Compliance Engine) را جلو می‌برم؛ اما این بار پیشنهاد می‌کنم از همان ابتدا، ruleهای Sprint 1/2/5 را به یک **rules matrix ساده (YAML/JSON)** هم تبدیل کنیم تا بعداً موتور انطباق “صرفاً glue” باشد نه بازنویسی سندها.
اسپرینت 6 (Compliance Engine) را جلو می‌برم و خروجی را دقیقاً فایل‌محور می‌دهم. طراحی این اسپرینت را طوری چیدم که با چارچوب‌های شناخته‌شده‌ی **مدیریت ریسک AI** (NIST AI RMF)، **مدیریت چرخه‌ی عمر داده و حریم خصوصی** (NIST Privacy Framework)، **حفاظت از PII** (NIST SP 800-122) و **بهترین‌عمل‌های لاگ/آدیت** (OWASP Logging) هم‌راستا باشد. 

در ادامه، فایل‌های Sprint 6 آماده‌ی کپی در ریپو هستند.

---

## 1) `docs/mcp/process/07-compliance-engine-design.md`

```md
# Sprint 6 — Process: Compliance Engine Design
Last updated: 2026-07-21

هدف این Sprint:
- تعریف یک موتور انطباق (Compliance Engine) که بتواند
  - قبل از تولید خروجی (pre-check)
  - حین تولید (inference-time constraints / safe-mode)
  - بعد از تولید (post-check / validation)
  تصمیم ALLOW/BLOCK/REVIEW بگیرد.
- تولید خروجی‌های قابل audit: findings، risk score، required actions، audit event.

این سند مشاوره حقوقی نیست؛ سند استاندارد محصول است.

---

## 1) Non-negotiables
1) Separation of concerns:
   - operational logs ≠ audit logs
   - security logging ≠ compliance evidence
2) Least data:
   - موتور انطباق نباید با “ذخیره بیشتر داده” بهتر شود.
3) Deterministic shape:
   - خروجی engine باید ساختاری و قابل تست باشد (نه متن آزاد).
4) Policy versioning:
   - هر ارزیابی باید policy_version(s) را ثبت کند.

---

## 2) Inputs to engine (ComplianceContext)
- geo context (Sprint 1)
- requested capabilities (draft JD/KPI/leveling/…)
- input artifacts:
  - raw user prompt (optional, ideally ephemeral)
  - structured inputs (PositionInput DTO)
- generated artifacts:
  - model output text (اگر تولید شده)
  - structured outputs (PositionDraft, KPIs, …)
- runtime flags:
  - safe_mode (on unknown geo)
  - no_store (privacy mode)
  - client attestations (NYC/… if applicable)

---

## 3) Engine pipeline (high-level)
Phase A — Pre-check
- geo + capability gating (LEGAL rules)
- prohibited/sensitive input detection (PRIV rules)
- consent/notice requirements (PRIV rules)

Phase B — Generation constraints
- if safe_mode: restrict prompt + restrict allowed sections
- enforce “advisory-only” language requirements

Phase C — Post-check
- output validation (FAIR + LEGAL + PRIV)
- forbidden terms scanner
- structural validation (schemas/templates)
- risk scoring
- decision

Phase D — Audit
- emit audit event (minimal, redacted)

---

## 4) Rule lifecycle (how we add rules)
For every new rule:
1) Add a normative doc (legal/privacy/fairness)
2) Add a rule row into rules matrix (compliance/02)
3) Add test vectors (docs/mcp/examples or engine tests)
4) Implement rule in apps/api (or config-driven) + unit test

---

## 5) Decisions (engine outcomes)
- ALLOW
- ALLOW_WITH_WARNINGS
- REQUIRE_HUMAN_REVIEW
- BLOCK

Decision must be explainable via findings.

---

## 6) Done (Sprint 6 deliverables)
- docs:
  - compliance/01-compliance-engine-architecture.md
  - compliance/02-compliance-rules-matrix.md
  - compliance/03-pii-scanner.md
  - compliance/05-output-validator.md
  - compliance/06-risk-scoring-logic.md
  - compliance/07-audit-log-requirements.md
- apps/api:
  - `apps/api/src/mcp/compliance_engine.rs` (skeleton)

---

## References (non-normative)
- NIST AI RMF 1.0: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10
- NIST Privacy Framework: https://www.nist.gov/privacy-framework/privacy-framework
- NIST SP 800-122 (PII): https://csrc.nist.gov/pubs/sp/800/122/final
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
```

---

## 2) `docs/mcp/compliance/01-compliance-engine-architecture.md`

```md
# Compliance — Engine Architecture
Last updated: 2026-07-21

## 1) Purpose
تعریف معماری موتور انطباق برای enforce کردن:
- Legal boundaries (Sprint 1)
- Privacy rules (Sprint 2)
- Bias/Fairness rules (Sprint 5)
روی ورودی/خروجی‌های HR generation (Sprint 4).

---

## 2) Components

### 2.1) Policy Registry (source of truth)
- policy versions:
  - legal_policy_version
  - privacy_policy_version
  - fairness_policy_version
- rules matrix (config-driven or compiled)

### 2.2) Compliance Engine (core)
- Rule evaluator
- PII/Sensitive scanner (input/output)
- Output validator (structure + content)
- Risk scoring
- Decision maker
- Required actions generator (notice/attestation/human review)

### 2.3) Audit Service (evidence store)
- immutable-ish audit events
- access-controlled
- exportable for compliance review

### 2.4) Operational logging (separate)
- performance telemetry
- error traces
- security events
(بدون ذخیره payload حساس)

---

## 3) Data flow (request lifecycle)

1) API receives request (PositionInput / templates / free text)
2) Pre-check:
   - determine jurisdictions triggered
   - capability gating
   - scan input for prohibited/sensitive
3) Generate (LLM) with constraints
4) Post-check:
   - validate content & structure
   - run fairness scanners
   - run PII scanner on output (defense-in-depth)
5) Score risk
6) Produce decision + required actions
7) Emit audit event (redacted)

---

## 4) Trust boundaries & storage classes
- Prompt payload: prefer ephemeral (R0/R1) — see Sprint 2
- Output payload: business records (R2)
- Audit events: compliance records (R3), minimal + hashed references

---

## 5) Extensibility
Rule types:
- Geo/capability rules (LEGAL)
- Data classification rules (PRIV)
- Forbidden phrase / proxy discrimination rules (FAIR)
- Template/schema validation rules (HR standards)

Each rule returns findings with:
- rule_id, severity, category, evidence_snippet, suggested_fix, requires_human_review

---

## References (non-normative)
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- NIST SP 800-122 (PII): https://csrc.nist.gov/pubs/sp/800/122/final
```

---

## 3) `docs/mcp/compliance/02-compliance-rules-matrix.md`

```md
# Compliance — Rules Matrix (v0)
Last updated: 2026-07-21

هدف: یک جدول/کانفیگ واحد که بگوید:
- چه چیزی trigger می‌شود
- چه ruleهایی اجرا می‌شوند
- خروجی engine چه actionهایی می‌دهد

این فایل، پلِ docs → code است.

---

## 1) Decision actions (canonical)
- BLOCK
- REQUIRE_HUMAN_REVIEW
- ALLOW_WITH_WARNINGS
- ALLOW
و actionهای جانبی:
- REQUIRE_NOTICE:<id>
- REQUIRE_ATTESTATION:<id>
- REDACT:<type>

---

## 2) Canonical findings schema (engine contract)
- rule_id
- severity: Low | Med | High | Critical
- category: LEGAL | PRIVACY | FAIRNESS | SECURITY | STRUCTURE
- message
- evidence_snippet (redacted)
- suggested_rewrite (optional)
- requires_human_review: bool
- tags: [..]

---

## 3) Matrix (human-readable)

### 3.1) Legal capability gating
| Rule ID | Trigger | Applies to | Action |
|---|---|---|---|
| LEGAL.NYC.AEDT.001 | geo=NYC AND capability in {CandidateScoring, CandidateRanking} | request | BLOCK (unless attestation present) |
| LEGAL.GLOBAL.BOUNDARY.003 | request implies automated adverse decision | request/output | REQUIRE_HUMAN_REVIEW or BLOCK |

### 3.2) Privacy (prohibited / sensitive)
| Rule ID | Trigger | Applies to | Action |
|---|---|---|---|
| PRIV.PROHIBITED.001 | SSN or gov-id detected in input/output | input/output | REDACT + ALLOW_WITH_WARNINGS (or BLOCK if cannot redact) |
| PRIV.PROHIBITED.010 | medical/diagnostic content detected | input/output | BLOCK |
| PRIV.SENSITIVE.020 | candidate CV full-text provided without opt-in | input | REQUIRE_ATTESTATION/OPTIN + REQUIRE_HUMAN_REVIEW (org policy) |

### 3.3) Fairness (terms + proxies)
| Rule ID | Trigger | Applies to | Action |
|---|---|---|---|
| FAIR.TERMS.001 | hard-forbidden phrase match | output | BLOCK |
| FAIR.PROXY.010 | proxy discrimination phrase | output | REQUIRE_HUMAN_REVIEW + suggested rewrite |
| FAIR.HUMAN_REVIEW.120 | hotspot geo active | output | REQUIRE_HUMAN_REVIEW (on sensitive sections) |

### 3.4) Structure / templates
| Rule ID | Trigger | Applies to | Action |
|---|---|---|---|
| STRUCT.JD.001 | JD missing “essential functions” section | output | ALLOW_WITH_WARNINGS or REQUIRE_HUMAN_REVIEW |
| STRUCT.KPI.010 | KPI missing formula or data_source | output | ALLOW_WITH_WARNINGS |

---

## 4) Config-first representation (YAML sketch)
این YAML صرفاً اسکچ است تا بعداً ماشین‌خوان شود.

```yaml
rules:
  - id: "LEGAL.NYC.AEDT.001"
    when: "geo.nyc == true && capability in ['CandidateScoring','CandidateRanking']"
    action: "BLOCK"
    unless_attestation: ["NYC_LL144_BIAS_AUDIT_DONE"]

  - id: "PRIV.PROHIBITED.001"
    when: "pii.contains in ['SSN','GOV_ID']"
    action: "REDACT_OR_BLOCK"
    redact_types: ["SSN","GOV_ID"]

  - id: "FAIR.TERMS.001"
    when: "forbidden_terms.hard_match == true"
    action: "BLOCK"
```

---

## References (non-normative)
- NIST Privacy Framework: https://www.nist.gov/privacy-framework/privacy-framework
```

---

## 4) `docs/mcp/compliance/03-pii-scanner.md`

```md
# Compliance — PII / Sensitive Scanner (v0)
Last updated: 2026-07-21

## 1) Purpose
- جلوگیری از ذخیره/خروجی دادن PII یا داده حساس ناخواسته
- Redaction قبل از logging/audit
- defense-in-depth: هم input هم output scan شود

---

## 2) Scanner outputs (contract)
Scanner باید خروجی ساختاری بدهد:
- hit_type: EMAIL | PHONE | SSN | CREDIT_CARD | BANK | ADDRESS | GOV_ID | IP | OTHER
- confidence: 0..1
- location: offsets (start,end) یا token indices
- redaction: suggested replacement (e.g., "[REDACTED:SSN]")
- severity: Low/Med/High

---

## 3) Detection methods (v0 → v1)
### v0 (fast)
- regex patterns (email, phone, ssn, cc)
- keyword + regex (passport, driver license)
- simple checksum for credit card (Luhn)

### v1 (better)
- Aho–Corasick phrase sets + context windows
- ML classifier for “likely PII text blob”
- language-aware patterns (US/EU formats)

---

## 4) Redaction policy
- redact in-memory before:
  - storing prompts
  - writing audit events
  - emitting error logs
- minimal retention of raw payload (prefer no-store)

---

## 5) False positives / negatives
- scanner is best-effort
- اگر confidence پایین است:
  - flag + human review (به‌جای BLOCK)
- اگر category پرریسک است (SSN/medical):
  - سخت‌گیرانه‌تر (block/redact)

---

## 6) Test vectors (examples)
Input: "My SSN is 123-45-6789"
Expected: hit_type=SSN, redact => "My SSN is [REDACTED:SSN]"

Input: "Reach me at name@company.com"
Expected: EMAIL hit

---

## References (non-normative)
- NIST SP 800-122 (PII): https://csrc.nist.gov/pubs/sp/800/122/final
```

---

## 5) `docs/mcp/compliance/05-output-validator.md`

```md
# Compliance — Output Validator (v0)
Last updated: 2026-07-21

## 1) Purpose
قبل از return کردن خروجی به کاربر:
- boundaryها enforce شوند (LEGAL)
- داده ممنوع/حساس leak نشود (PRIV)
- زبان تبعیض‌آمیز/proxy حذف شود (FAIR)
- خروجی با استانداردهای JD/KPI/Leveling سازگار باشد (STRUCT)

---

## 2) Validator layers

### Layer A — Structural validation
- JD:
  - title present
  - role summary present
  - essential functions present
  - requirements vs preferred separated
- KPI:
  - name, definition, formula, frequency, data_source
- Leveling:
  - track + level + dimensions rationale

### Layer B — Legal boundaries
- no automated adverse decision language
- no restricted capabilities in hotspot modes

### Layer C — Fairness checks
- forbidden terms scanner
- proxy discrimination patterns (age-coded, nationality-coded, disability risks)
- pronoun neutrality (configurable)

### Layer D — Privacy checks
- run PII scanner on output
- block prohibited categories (medical/biometric)
- redact standard PII patterns

---

## 3) Standard validator result (contract)
- status: PASS | WARN | REQUIRE_REVIEW | FAIL
- findings[]
- redactions_applied[]
- required_actions[] (notice, attestation, review)

---

## 4) Rewrite strategy
If FAIL/WARN:
- return suggested rewrite blocks for the offending snippet
- keep deterministic templates for rewrite (reduces LLM load)

---

## References (non-normative)
- OWASP Logging Cheat Sheet (avoid sensitive logging): https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
```

---

## 6) `docs/mcp/compliance/06-risk-scoring-logic.md`

```md
# Compliance — Risk Scoring Logic (v0)
Last updated: 2026-07-21

## 1) Purpose
یک risk score ساده، قابل توضیح و قابل audit بسازیم تا:
- تصمیم ALLOW/REVIEW/BLOCK قابل دفاع باشد
- backlog بهبود (چه ruleهایی زیاد hit می‌خورند) قابل مدیریت شود

---

## 2) Inputs to risk scoring
- triggered jurisdictions (NYC/CO/EU/UK/…)
- requested capabilities
- findings severities
- presence of sensitive/prohibited data
- safe_mode (unknown geo) flag

---

## 3) Score model (simple & explainable)
Score range: 0..100

### Base risk by capability (example)
- Draft JD/KPI/Leveling: +10
- Any candidate analysis: +30
- Any scoring/ranking: +60

### Jurisdiction bump
- hotspot triggered: +10..+20

### Findings bump
- Low: +2 each
- Med: +8 each
- High: +20 each
- Critical: +40 each

### Sensitive data bump
- P2 present: +15
- P3 present: +50 (and typically BLOCK)

Clamp: min(100)

---

## 4) Risk buckets
- 0–19: LOW (ALLOW)
- 20–49: MED (ALLOW_WITH_WARNINGS)
- 50–79: HIGH (REQUIRE_HUMAN_REVIEW)
- 80–100: CRITICAL (BLOCK)

---

## 5) Output (contract)
- risk_score
- risk_bucket
- rationale:
  - top 3 contributing factors (rule ids / categories)

---

## References (non-normative)
- NIST AI RMF 1.0 (risk management concepts): https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10
```

---

## 7) `docs/mcp/compliance/07-audit-log-requirements.md`

```md
# Compliance — Audit Log Requirements (v0)
Last updated: 2026-07-21

## 1) Purpose
Audit log باید بتواند پاسخ دهد:
- چه کسی چه درخواستی داد؟
- کدام policy/rules اجرا شد؟
- چه findingsی تولید شد؟
- سیستم چه تصمیمی گرفت و چرا؟
- چه redactionهایی انجام شد؟
بدون اینکه payload حساس را ذخیره کند.

---

## 2) Separation (hard rule)
- audit logs را از operational logs جدا نگه دارید.
- audit log = evidence trail
- ops log = debugging/monitoring

---

## 3) Tamper resistance (pragmatic)
حداقل‌ها:
- append-only storage
- restricted write access
- immutable retention window

بهتر:
- hash chaining per org/day
- periodic export to WORM storage (later)

---

## 4) Audit event schema (minimum)
Fields:
- event_id (uuid)
- ts
- actor_id / actor_role
- org_id / workspace_id
- request_id
- geo_context (coarse; no precise address)
- requested_capabilities[]
- policy_versions:
  - legal
  - privacy
  - fairness
- decision (ALLOW/WARN/REVIEW/BLOCK)
- risk_score + bucket
- findings[] (ids + severities + categories; snippets redacted)
- required_actions[] (notice/attestation/review)
- redactions_applied[] (types only)
- reviewer fields (if human review happened)

---

## 5) Logging safety requirements
- never log secrets / tokens
- prevent log injection (encode/escape dangerous chars)
- avoid storing raw prompts in audit logs
- store references/hashes to payloads if needed

---

## 6) Retention & access
- retention class R3 (see Sprint 2)
- least privilege access
- export for compliance reviews

---

## References (non-normative)
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- OWASP Poor Logging Practice: https://owasp.org/www-community/vulnerabilities/Poor_Logging_Practice
```

---

# (اختیاری) اسکلت فنی — `apps/api/src/mcp/compliance_engine.rs`

> اسکلت زیر عمداً “کم‌حجم اما شکل‌دار” است: Rule trait، Context، Finding، Report، و چند stub برای scan/validate/score/audit.

```rust
// apps/api/src/mcp/compliance_engine.rs

use super::types::{Capability, GeoContext, Jurisdiction};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Severity {
    Low,
    Med,
    High,
    Critical,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Decision {
    Allow,
    AllowWithWarnings,
    RequireHumanReview,
    Block,
}

#[derive(Debug, Clone)]
pub struct Finding {
    pub rule_id: String,
    pub severity: Severity,
    pub category: String, // "LEGAL" | "PRIVACY" | "FAIRNESS" | "STRUCTURE" | "SECURITY"
    pub message: String,
    pub evidence_snippet: String,          // must be redacted
    pub suggested_rewrite: Option<String>, // optional
    pub requires_human_review: bool,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PiiType {
    Email,
    Phone,
    Ssn,
    CreditCard,
    GovId,
    IpAddress,
    Address,
    Other,
}

#[derive(Debug, Clone)]
pub struct PiiHit {
    pub pii_type: PiiType,
    pub start: usize,
    pub end: usize,
    pub confidence: f32,
}

#[derive(Debug, Clone)]
pub struct Redaction {
    pub pii_type: PiiType,
    pub start: usize,
    pub end: usize,
    pub replacement: String,
}

#[derive(Debug, Clone)]
pub struct PolicyVersions {
    pub legal: String,
    pub privacy: String,
    pub fairness: String,
}

#[derive(Debug, Clone)]
pub struct ComplianceContext {
    pub request_id: String,
    pub actor_id: String,
    pub org_id: String,

    pub geo: GeoContext,
    pub requested_capabilities: Vec<Capability>,

    /// Raw prompt or free text. Prefer ephemeral/no-store.
    pub input_text: Option<String>,

    /// Structured input (JSON string for now; later DTO)
    pub input_structured: Option<String>,

    /// Generated output text (if any)
    pub output_text: Option<String>,

    pub safe_mode: bool,
    pub no_store: bool,

    pub policy_versions: PolicyVersions,
    pub client_attestations: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct ComplianceReport {
    pub triggered: Vec<Jurisdiction>,
    pub decision: Decision,
    pub risk_score: u8,          // 0..100
    pub risk_bucket: String,     // "LOW" | "MED" | "HIGH" | "CRITICAL"
    pub findings: Vec<Finding>,
    pub required_actions: Vec<String>, // NOTICE:/ATTEST:/REVIEW:
    pub redactions: Vec<Redaction>,
    pub notes: Vec<String>,
}

/// Rule interface: keep small & testable
pub trait Rule {
    fn id(&self) -> &'static str;
    fn severity(&self) -> Severity;
    fn category(&self) -> &'static str;
    fn evaluate(&self, ctx: &ComplianceContext) -> Vec<Finding>;
}

/// v0 engine: runs rules, scans pii, scores risk, decides
pub fn run_compliance(ctx: &ComplianceContext, rules: &[Box<dyn Rule>]) -> ComplianceReport {
    let mut triggered = vec![Jurisdiction::Global];

    // TODO: plug in the legal geo resolver from Sprint 1 evaluator.
    // For now, safe mode implies stricter path.
    if ctx.safe_mode {
        // keep only global; later add "UnknownGeo" jurisdiction bucket if desired
    }

    // Run rules
    let mut findings: Vec<Finding> = vec![];
    for r in rules {
        findings.extend(r.evaluate(ctx));
    }

    // PII scan (defense in depth)
    let mut redactions: Vec<Redaction> = vec![];
    if let Some(t) = &ctx.input_text {
        let (hits, reds) = scan_and_redact_pii(t);
        if !hits.is_empty() {
            redactions.extend(reds);
            findings.push(Finding {
                rule_id: "PRIV.PROHIBITED.001".to_string(),
                severity: Severity::Med,
                category: "PRIVACY".to_string(),
                message: "PII-like patterns detected in input; redaction recommended.".to_string(),
                evidence_snippet: "[REDACTED]".to_string(),
                suggested_rewrite: None,
                requires_human_review: false,
                tags: vec!["pii_scan".to_string()],
            });
        }
    }
    if let Some(t) = &ctx.output_text {
        let (hits, reds) = scan_and_redact_pii(t);
        if !hits.is_empty() {
            redactions.extend(reds);
            findings.push(Finding {
                rule_id: "PRIV.PROHIBITED.001".to_string(),
                severity: Severity::Med,
                category: "PRIVACY".to_string(),
                message: "PII-like patterns detected in output; redaction recommended.".to_string(),
                evidence_snippet: "[REDACTED]".to_string(),
                suggested_rewrite: None,
                requires_human_review: true, // safer default
                tags: vec!["pii_scan".to_string()],
            });
        }
    }

    // Risk scoring (simple, explainable)
    let risk_score = score_risk(ctx, &findings);
    let risk_bucket = bucket_risk(risk_score).to_string();

    // Decision (simple policy)
    let decision = decide(risk_score, &findings);

    // Required actions (stub)
    let mut required_actions: Vec<String> = vec![];
    if decision == Decision::RequireHumanReview {
        required_actions.push("REVIEW:HUMAN_REQUIRED".to_string());
    }

    // TODO: emit audit event (separate module/store)

    ComplianceReport {
        triggered,
        decision,
        risk_score,
        risk_bucket,
        findings,
        required_actions,
        redactions,
        notes: vec!["Stub compliance engine. Replace with rule registry + test vectors.".to_string()],
    }
}

fn scan_and_redact_pii(text: &str) -> (Vec<PiiHit>, Vec<Redaction>) {
    // v0: minimal patterns; replace with robust implementation later
    let mut hits = vec![];
    let mut reds = vec![];

    // SSN: 123-45-6789
    if let Some((s, e)) = find_simple(text, "###-##-####") {
        hits.push(PiiHit { pii_type: PiiType::Ssn, start: s, end: e, confidence: 0.9 });
        reds.push(Redaction { pii_type: PiiType::Ssn, start: s, end: e, replacement: "[REDACTED:SSN]".into() });
    }

    (hits, reds)
}

/// Super naive pattern matcher: '#' means digit. Replace with regex later.
fn find_simple(haystack: &str, pattern: &str) -> Option<(usize, usize)> {
    let h = haystack.as_bytes();
    let p = pattern.as_bytes();
    if p.len() == 0 || h.len() < p.len() {
        return None;
    }
    for i in 0..=(h.len() - p.len()) {
        let mut ok = true;
        for j in 0..p.len() {
            let pc = p[j] as char;
            let hc = h[i + j] as char;
            if pc == '#' {
                if !hc.is_ascii_digit() { ok = false; break; }
            } else if pc != hc {
                ok = false; break;
            }
        }
        if ok {
            return Some((i, i + p.len()));
        }
    }
    None
}

fn score_risk(ctx: &ComplianceContext, findings: &[Finding]) -> u8 {
    let mut score: i32 = 0;

    // base by capability
    for cap in &ctx.requested_capabilities {
        score += match cap {
            Capability::DraftJobDescription
            | Capability::DraftKpi
            | Capability::DraftRoleLeveling => 10,
            Capability::CandidateChatbot => 30,
            Capability::CandidateScoring
            | Capability::CandidateRanking => 60,
            Capability::VideoInterviewAnalysis => 80,
        };
    }

    // findings
    for f in findings {
        score += match f.severity {
            Severity::Low => 2,
            Severity::Med => 8,
            Severity::High => 20,
            Severity::Critical => 40,
        };
    }

    if ctx.safe_mode { score += 10; }

    if score < 0 { score = 0; }
    if score > 100 { score = 100; }
    score as u8
}

fn bucket_risk(score: u8) -> &'static str {
    match score {
        0..=19 => "LOW",
        20..=49 => "MED",
        50..=79 => "HIGH",
        _ => "CRITICAL",
    }
}

fn decide(score: u8, findings: &[Finding]) -> Decision {
    if findings.iter().any(|f| f.severity == Severity::Critical) {
        return Decision::Block;
    }
    match score {
        0..=19 => Decision::Allow,
        20..=49 => Decision::AllowWithWarnings,
        50..=79 => Decision::RequireHumanReview,
        _ => Decision::Block,
    }
}
```

---

### نکته‌ی اجرای دقیق (که عمداً از همین Sprint رعایتش کردیم)
- **آدیت‌لاگ باید جدا از لاگ‌های عملیاتی باشد** و حتماً payload حساس را ذخیره نکند؛ این همان چیزی است که OWASP رویش تأکید دارد.   
- برای تعریف “PII” و اینکه چرا باید redact/حداقل‌سازی کنیم، تکیه‌ی ما روی چارچوب NIST SP 800-122 است.   

اگر دستور بدهی، اسپرینت 7 (Templates & Schemas) را هم دقیقاً با همین رویکرد می‌سازم، ولی این بار خروجی‌ها را **schema-first** می‌دهم (JSON Schema/OpenAPI-ish) تا `Rust structs/DTOs` از روی آن‌ها هم‌راستا شوند.
اسپرینت 7 = **Templates & Schemas**: از اینجا به بعد خروجی‌های متنی شما «قالب‌دار» می‌شوند و داده‌ها هم «اسکیما-محور»، تا هم به LLM فشار نیاید و هم Validator/Compliance Engine بتواند **قطعی** تصمیم بگیرد.

در این Sprint من اسکیماها را بر پایه‌ی **JSON Schema (Draft 2020-12)** می‌نویسم (با `$schema`)  و طوری طراحی می‌کنم که بعداً مستقیم در **OpenAPI 3.1** هم قابل استفاده باشد.   
برای timestampها هم استاندارد **RFC 3339** را معیار می‌گیرم تا فرمت زمان‌ها یک‌دست و قابل audit باشد. 

---

# خروجی Sprint 7 — Templates

## 1) `docs/mcp/templates/job-description-template.md`
```md
# Job Description Template (v0)
Last updated: 2026-07-21
Template version: JD-TPL-0.1

> Policy: این خروجی یک Draft است و برای تصمیم‌گیری خودکار استخدامی استفاده نمی‌شود.

---

## 1) Header
- **Title:** {{role_title}}
- **Job family:** {{job_family}}
- **Track:** {{track}} (IC | Manager)
- **Level:** {{level}}
- **Location / Work mode:** {{location}} (Remote/Hybrid/Onsite)
- **Employment type:** {{employment_type}}
- **Reports to:** {{reports_to | optional}}

---

## 2) Role Summary (3–5 lines)
{{role_summary}}

---

## 3) Essential Functions (5–10 bullets)
> Must be observable + job-related. Avoid “method-only” constraints when alternatives can exist.

- {{essential_function_1}}
- {{essential_function_2}}
- {{essential_function_3}}
- {{essential_function_4}}
- {{essential_function_5}}
- {{essential_function_6 | optional}}
- ...

---

## 4) Responsibilities (optional)
- {{responsibility_1}}
- {{responsibility_2}}
- {{responsibility_3}}

---

## 5) Must-have Requirements (max 6–10 bullets)
> Rules:
> - job-related
> - avoid proxies for protected attributes
> - prefer “demonstrated ability” over arbitrary “years”

- {{requirement_1}}
- {{requirement_2}}
- {{requirement_3}}
- ...

---

## 6) Preferred Qualifications (nice-to-have)
- {{preferred_1}}
- {{preferred_2}}
- ...

---

## 7) Work Conditions / Schedule
- **On-call:** {{on_call | yes/no/rotation_details}}
- **Travel:** {{travel | none/percent}}
- **Time zone constraints:** {{timezone_constraints | optional}}

---

## 8) Tools / Tech stack (optional)
- {{tool_1}}
- {{tool_2}}
- ...

---

## 9) Accommodations & Accessibility Note (baseline)
We provide reasonable accommodations in accordance with applicable law. If you need accommodations during the application or interview process, please let us know.

---

## 10) Fairness / EEO baseline note (placeholder)
We are committed to equal opportunity and inclusive hiring. (Expanded rules in docs/mcp/fairness)
```

---

## 2) `docs/mcp/templates/kpi-template.md`
```md
# KPI Template (v0)
Last updated: 2026-07-21
Template version: KPI-TPL-0.1

> KPIها برای “مدیریت عملکرد نقش” هستند، نه برای رتبه‌بندی افراد بر اساس ویژگی‌های حساس/محافظت‌شده.

---

## KPI: {{kpi_name}}

- **Type:** {{leading_or_lagging}} (Leading | Lagging)
- **Definition:** {{definition}}
- **Formula:** {{formula}}
- **Unit:** {{unit}}
- **Frequency:** {{frequency}} (weekly/monthly/quarterly)
- **Data source:** {{data_source}}
- **Owner:** {{owner_role_or_team}}

### Target guidance
- {{target_guidance}}

### Risks
- **Gaming risk:** {{gaming_risk}}
- **Fairness risk:** {{fairness_risk}}
- **Privacy risk:** {{privacy_risk}}

### Counter-metrics (optional)
- {{counter_metric_1}}
- {{counter_metric_2}}

### Notes (optional)
- {{notes}}
```

---

## 3) `docs/mcp/templates/position-report-template.md`
```md
# Position Report Template (v0)
Last updated: 2026-07-21
Template version: POS-REPORT-TPL-0.1

> این گزارش یک Draft است و نیاز به بازبینی انسانی دارد.

---

## 1) Position Snapshot
- Title: {{role_title}}
- Track/Level: {{track}} / {{level}}
- Location/Work mode: {{location}}
- Mission: {{mission}}

---

## 2) JD Draft
{{jd_draft_or_link}}

---

## 3) KPI Set
{{kpi_list_or_link}}

---

## 4) Role Leveling Rationale
- Scope: {{scope_rationale}}
- Autonomy: {{autonomy_rationale}}
- Impact: {{impact_rationale}}
- Complexity: {{complexity_rationale}}
- Collaboration: {{collaboration_rationale}}
- People leadership (if manager): {{people_leadership_rationale}}

---

## 5) KSAO Profile (summary)
### Must-have
- {{ksao_must_have_1}}
- {{ksao_must_have_2}}
- ...

### Trainable (90 days)
- {{ksao_trainable_1}}
- ...

---

## 6) Fairness & Compliance Notes (generated)
- Hotspot geo triggered: {{jurisdictions_triggered}}
- Findings summary: {{findings_summary}}
- Required actions: {{required_actions}}
- Human review required: {{human_review_required}}

---

## 7) Open questions for human reviewer
- {{question_1}}
- {{question_2}}
- {{question_3}}
```

---

## 4) `docs/mcp/templates/fairness-review-checklist.md`
```md
# Fairness Review Checklist (v0)
Last updated: 2026-07-21
Template version: FAIR-REVIEW-TPL-0.1

Reviewer: {{reviewer_name_or_id}}
Date (RFC3339): {{timestamp}}
Position: {{role_title}} ({{track}}/{{level}})
Geo: {{geo_context}}

---

## A) Direct discrimination checks (must be NO)
- [ ] Any requirement based on protected attributes?
- [ ] Any “only X nationality/ethnicity/religion/sex/age” language?
- [ ] Any disability exclusion language (“no disabled”, “must be perfectly healthy”)?

## B) Proxy discrimination checks (flag + rewrite)
- [ ] Age-coded language (recent graduate, young, digital native, …)
- [ ] “Native speaker only” / accent-based exclusion
- [ ] Degree/years experience used as an unjustified filter
- [ ] Physical requirements stated as “methods” vs essential functions

## C) Accessibility / accommodation
- [ ] Work conditions stated clearly (on-call/travel/shift)
- [ ] Accommodation note present
- [ ] No assessment steps that screen out disabled candidates without alternatives

## D) Final decision
- [ ] Approve
- [ ] Approve with edits (edits attached)
- [ ] Reject and regenerate with constraints
- [ ] Escalate to compliance/legal

Notes:
{{review_notes}}
```

---

# خروجی Sprint 7 — Schemas (Markdown با JSON Schema داخل)

> همه اسکیماها Draft 2020-12 هستند.   
> `timestamp`ها RFC3339 هستند. 

## 5) `docs/mcp/schemas/candidate-data-schema.md`
```md
# Candidate Data Schema (v0)
Last updated: 2026-07-21
Schema id: mcp.schema.candidate-data@0.1

> Default policy: candidate data optional/opt-in. Prohibited/sensitive categories blocked by engine.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "mcp.schema.candidate-data@0.1",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "schema_version": { "type": "string", "const": "0.1" },

    "candidate_id": { "type": "string", "description": "Internal/opaque id (not govt id)." },
    "full_name": { "type": "string" },
    "email": { "type": "string", "format": "email" },

    "location": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "country": { "type": "string" },
        "region": { "type": "string" },
        "city": { "type": "string" }
      }
    },

    "resume_text": {
      "type": "string",
      "maxLength": 200000,
      "description": "Optional. Should be scrubbed for prohibited PII where possible."
    },

    "skills": {
      "type": "array",
      "items": { "type": "string", "maxLength": 128 },
      "maxItems": 200
    },

    "work_history": {
      "type": "array",
      "maxItems": 50,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "company": { "type": "string" },
          "title": { "type": "string" },
          "start_date": { "type": "string", "description": "YYYY-MM or RFC3339 date", "maxLength": 32 },
          "end_date": { "type": "string", "description": "YYYY-MM or RFC3339 date or null", "maxLength": 32 }
        },
        "required": ["company", "title"]
      }
    },

    "links": {
      "type": "array",
      "items": { "type": "string", "maxLength": 2048 },
      "maxItems": 30
    },

    "consent": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "opt_in_candidate_data_processing": { "type": "boolean" },
        "timestamp": { "type": "string", "description": "RFC3339 timestamp" }
      },
      "required": ["opt_in_candidate_data_processing"]
    }
  },
  "required": ["schema_version"]
}
```
```

---

## 6) `docs/mcp/schemas/position-schema.md`
```md
# Position Schema (v0)
Last updated: 2026-07-21
Schema id: mcp.schema.position@0.1

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "mcp.schema.position@0.1",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "schema_version": { "type": "string", "const": "0.1" },

    "position_id": { "type": "string" },
    "role_title": { "type": "string", "minLength": 2, "maxLength": 140 },
    "job_family": { "type": "string", "minLength": 2, "maxLength": 140 },

    "track": { "type": "string", "enum": ["IC", "Manager"] },
    "level": { "type": "string", "enum": ["L1","L2","L3","L4","L5","L6"] },

    "location": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "work_mode": { "type": "string", "enum": ["Remote","Hybrid","Onsite"] },
        "country": { "type": "string" },
        "region": { "type": "string" },
        "city": { "type": "string" }
      },
      "required": ["work_mode"]
    },

    "employment_type": { "type": "string", "enum": ["FullTime","PartTime","Contract"] },

    "mission": { "type": "string", "minLength": 10, "maxLength": 2000 },

    "role_summary": { "type": "string", "minLength": 10, "maxLength": 4000 },

    "essential_functions": {
      "type": "array",
      "minItems": 3,
      "maxItems": 12,
      "items": { "type": "string", "minLength": 3, "maxLength": 400 }
    },

    "requirements_must_have": {
      "type": "array",
      "maxItems": 14,
      "items": { "type": "string", "minLength": 3, "maxLength": 300 }
    },

    "requirements_preferred": {
      "type": "array",
      "maxItems": 20,
      "items": { "type": "string", "minLength": 3, "maxLength": 300 }
    },

    "work_conditions": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "on_call": { "type": "string", "maxLength": 300 },
        "travel": { "type": "string", "maxLength": 200 },
        "timezone_constraints": { "type": "string", "maxLength": 200 }
      }
    },

    "tools_tech_stack": {
      "type": "array",
      "maxItems": 40,
      "items": { "type": "string", "maxLength": 100 }
    },

    "accommodations_note": { "type": "string", "maxLength": 800 },

    "ksao": {
      "type": "array",
      "maxItems": 60,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "category": { "type": "string", "enum": ["K","S","A","O"] },
          "name": { "type": "string", "maxLength": 140 },
          "definition": { "type": "string", "maxLength": 800 },
          "must_have": { "type": "boolean" },
          "can_be_trained_in_90_days": { "type": "boolean" },
          "job_related_evidence": { "type": "string", "maxLength": 400 }
        },
        "required": ["category", "name", "must_have"]
      }
    },

    "taxonomy_mappings": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "onet": {
          "type": "array",
          "maxItems": 3,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "soc_code": { "type": "string", "maxLength": 20 },
              "title": { "type": "string", "maxLength": 200 },
              "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
              "requires_human_review": { "type": "boolean" }
            },
            "required": ["soc_code", "confidence", "requires_human_review"]
          }
        },
        "esco": {
          "type": "array",
          "maxItems": 3,
          "items": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "uri": { "type": "string", "maxLength": 2048 },
              "label": { "type": "string", "maxLength": 200 },
              "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
              "requires_human_review": { "type": "boolean" }
            },
            "required": ["uri", "confidence", "requires_human_review"]
          }
        }
      }
    }
  },
  "required": ["schema_version", "role_title", "track", "location", "mission", "essential_functions"]
}
```
```

---

## 7) `docs/mcp/schemas/kpi-schema.md`
```md
# KPI Schema (v0)
Last updated: 2026-07-21
Schema id: mcp.schema.kpi@0.1

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "mcp.schema.kpi@0.1",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "schema_version": { "type": "string", "const": "0.1" },

    "kpis": {
      "type": "array",
      "minItems": 3,
      "maxItems": 12,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "name": { "type": "string", "minLength": 3, "maxLength": 120 },
          "type": { "type": "string", "enum": ["Leading", "Lagging"] },
          "definition": { "type": "string", "minLength": 5, "maxLength": 800 },
          "formula": { "type": "string", "minLength": 1, "maxLength": 400 },
          "unit": { "type": "string", "maxLength": 40 },
          "frequency": { "type": "string", "enum": ["Weekly", "Monthly", "Quarterly"] },
          "data_source": { "type": "string", "minLength": 1, "maxLength": 200 },
          "owner": { "type": "string", "minLength": 1, "maxLength": 120 },

          "target_guidance": { "type": "string", "maxLength": 400 },

          "risks": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "gaming": { "type": "string", "maxLength": 400 },
              "fairness": { "type": "string", "maxLength": 400 },
              "privacy": { "type": "string", "maxLength": 400 }
            }
          },

          "counter_metrics": {
            "type": "array",
            "maxItems": 6,
            "items": { "type": "string", "maxLength": 120 }
          }
        },
        "required": ["name", "type", "definition", "formula", "frequency", "data_source", "owner"]
      }
    }
  },
  "required": ["schema_version", "kpis"]
}
```
```

---

## 8) `docs/mcp/schemas/audit-log-schema.md`
```md
# Audit Log Schema (v0)
Last updated: 2026-07-21
Schema id: mcp.schema.audit-event@0.1

> Note: audit logs باید payload حساس را ذخیره نکنند (فقط اسنیپت‌های redacted / هش / شناسه‌ها).

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "mcp.schema.audit-event@0.1",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "schema_version": { "type": "string", "const": "0.1" },

    "event_id": { "type": "string" },
    "timestamp": { "type": "string", "description": "RFC3339 timestamp" },

    "org_id": { "type": "string" },
    "actor_id": { "type": "string" },
    "actor_role": { "type": "string" },

    "request_id": { "type": "string" },

    "geo": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "job_country": { "type": "string" },
        "job_region": { "type": "string" },
        "job_city": { "type": "string" },
        "deployment_country": { "type": "string" },
        "deployment_region": { "type": "string" },
        "deployment_city": { "type": "string" }
      }
    },

    "requested_capabilities": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 30
    },

    "policy_versions": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "legal": { "type": "string" },
        "privacy": { "type": "string" },
        "fairness": { "type": "string" }
      },
      "required": ["legal", "privacy", "fairness"]
    },

    "decision": { "type": "string", "enum": ["ALLOW", "ALLOW_WITH_WARNINGS", "REQUIRE_HUMAN_REVIEW", "BLOCK"] },

    "risk": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "score": { "type": "integer", "minimum": 0, "maximum": 100 },
        "bucket": { "type": "string", "enum": ["LOW", "MED", "HIGH", "CRITICAL"] }
      },
      "required": ["score", "bucket"]
    },

    "findings": {
      "type": "array",
      "maxItems": 200,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "rule_id": { "type": "string" },
          "severity": { "type": "string", "enum": ["Low", "Med", "High", "Critical"] },
          "category": { "type": "string", "enum": ["LEGAL", "PRIVACY", "FAIRNESS", "SECURITY", "STRUCTURE"] },
          "message": { "type": "string", "maxLength": 600 },
          "evidence_snippet_redacted": { "type": "string", "maxLength": 200 },
          "requires_human_review": { "type": "boolean" }
        },
        "required": ["rule_id", "severity", "category", "message"]
      }
    },

    "required_actions": {
      "type": "array",
      "maxItems": 50,
      "items": { "type": "string", "maxLength": 120 }
    },

    "redactions_applied": {
      "type": "array",
      "maxItems": 50,
      "items": { "type": "string", "maxLength": 60 }
    },

    "review": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "review_required": { "type": "boolean" },
        "reviewer_id": { "type": "string" },
        "review_timestamp": { "type": "string", "description": "RFC3339 timestamp" },
        "review_decision": { "type": "string", "enum": ["APPROVE", "APPROVE_WITH_EDITS", "REJECT", "ESCALATE"] }
      }
    }
  },
  "required": ["schema_version", "event_id", "timestamp", "org_id", "request_id", "policy_versions", "decision", "risk"]
}
```
```

---

## 9) `docs/mcp/schemas/compliance-risk-score-schema.md`
```md
# Compliance Risk Score Schema (v0)
Last updated: 2026-07-21
Schema id: mcp.schema.compliance-report@0.1

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "mcp.schema.compliance-report@0.1",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "schema_version": { "type": "string", "const": "0.1" },

    "triggered_jurisdictions": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 20
    },

    "decision": { "type": "string", "enum": ["ALLOW", "ALLOW_WITH_WARNINGS", "REQUIRE_HUMAN_REVIEW", "BLOCK"] },

    "risk_score": { "type": "integer", "minimum": 0, "maximum": 100 },
    "risk_bucket": { "type": "string", "enum": ["LOW", "MED", "HIGH", "CRITICAL"] },

    "top_factors": {
      "type": "array",
      "maxItems": 10,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "factor_type": { "type": "string", "enum": ["CAPABILITY", "JURISDICTION", "FINDING", "DATA_SENSITIVITY", "SAFE_MODE"] },
          "ref": { "type": "string", "description": "capability name or rule_id or jurisdiction id" },
          "points": { "type": "integer", "minimum": 0, "maximum": 100 }
        },
        "required": ["factor_type", "ref", "points"]
      }
    },

    "findings": { "type": "array" },
    "required_actions": { "type": "array" }
  },
  "required": ["schema_version", "decision", "risk_score", "risk_bucket"]
}
```
```

---

# (اختیاری) خروجی فنی برای `apps/api` (DTO اسکلت)
اگر بخواهید همین Sprint 7 را فوراً به Rust هم وصل کنید، پیشنهاد من:
- DTOها را دقیقاً mirror همین schemaها نگه دارید (Serde)
- بعداً validatorها را به JSON Schema validation یا validator دستی وصل کنید (انتخاب شما)

```rust
// apps/api/src/mcp/dtos.rs (sketch)

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyVersions {
    pub legal: String,
    pub privacy: String,
    pub fairness: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ComplianceDecision {
    Allow,
    AllowWithWarnings,
    RequireHumanReview,
    Block,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceRisk {
    pub score: u8,        // 0..100
    pub bucket: String,   // LOW/MED/HIGH/CRITICAL
}
```

---

اگر طبق نقشه قبلی جلو برویم، اسپرینت بعدی می‌شود **Sprint 8: Feedback Loop & Examples** (سناریوهای نمونه + خروجی نمونه + قالب feedback report + workflow بازبینی).
اسپرینت 8 = **Feedback Loop & Examples**. این اسپرینت عملاً “کالیبراسیون سیستم” است: چند سناریوی واقعی‌نما + خروجی نمونه + یک قالب استاندارد برای بازخورد + یک روند تبدیل بازخورد به backlog (قانون/قالب/اسکیما/کد).

در ادامه ۵ فایل دقیقاً مطابق لیست شما (آماده‌ی کپی در ریپو) + یک اسکلت اختیاری برای `apps/api` می‌دهم.

---

# 1) `docs/mcp/process/08-validation-feedback-loop.md`

```md
# Sprint 8 — Validation / Feedback Loop (Process)
Last updated: 2026-07-21

هدف: تعریف یک چرخه‌ی بازخورد که خروجی‌های LLM را به شکل سیستماتیک بهتر کند
بدون اینکه:
- داده حساس/PII ذخیره شود
- تصمیم‌گیری استخدامی خودکار اتفاق بیفتد
- سندها و کد drift کنند

این سند مشاوره حقوقی نیست؛ سند فرآیند محصول است.

---

## 1) نقش‌ها (Roles)
- **Generator (system)**: تولید PositionDraft + KPI + Leveling + KSAO
- **Compliance Engine**: pre/post checks + findings + decision
- **HR Reviewer**: بررسی job-relatedness، clarity، leveling consistency
- **Hiring Manager**: بررسی accuracy نسبت به نیاز واقعی تیم
- **Compliance/Legal Reviewer**: بررسی fairness، proxy discrimination، hotspot rules
- **Ops/Eng**: تبدیل یافته‌ها به rule/template/schema changes

---

## 2) ورودی‌ها (Inputs)
برای هر “case” باید این‌ها ثبت شود:
- scenario_id
- position_input (structured)
- geo_context (Sprint 1)
- policy_versions (legal/privacy/fairness)
- safe_mode/no_store flags (Sprint 2)
- generator output (structured + rendered template)
- compliance report (decision + findings + risk score)

> قانون: در مثال‌ها و بازخوردها **candidate data** و هر PII واقعی نباید ذخیره شود.
> اگر ناچار به مثال هستیم: داده‌ی مصنوعی + scrubbed.

---

## 3) خروجی‌ها (Outputs)
برای هر case:
- **review report** بر اساس قالب `templates/feedback-report-template.md`
- **issue tags** برای triage:
  - TEMPLATE_DEFECT
  - SCHEMA_GAP
  - RULE_MISSING
  - RULE_TOO_STRICT (false positive)
  - PROMPT_ISSUE
  - POLICY_CLARIFICATION
  - UX_NOTICE_NEEDED

- **action plan**:
  - change docs (normative)
  - update rules matrix
  - update scanners/validators
  - add/adjust test vectors

---

## 4) مراحل چرخه (Loop Steps)

### Step A — Generate (controlled)
- تولید فقط از روی schemaها/قالب‌ها (Sprint 7)
- enforce “advisory-only” language
- no candidate scoring/ranking

### Step B — Run Compliance Engine
- input scan (PII/prohibited)
- output scan (fairness terms/proxies + structure)
- decision (ALLOW/WARN/REVIEW/BLOCK)
- audit event (minimal)

### Step C — Human Review
- reviewer خروجی را با checklist ها چک می‌کند:
  - fairness-review-checklist (Sprint 7 template)
  - anti-bias-checklist (Sprint 5)
  - JD/KPI/Leveling/KSAO standards (Sprint 4)

### Step D — Record Feedback (structured)
- مشکلات به “یافته‌های دقیق” تبدیل می‌شوند:
  - snippet (redacted)
  - recommended rewrite
  - severity
  - category
  - expected behavior (golden)

### Step E — Triage & Backlog
هر feedback باید به یکی از این مسیرها تبدیل شود:
1) **Template fix** (مثلاً بخش essential functions کم‌رنگ است)
2) **Rule fix** (عبارت proxy جدید)
3) **Schema fix** (فیلد لازم نداریم/داریم زیاد)
4) **Engine behavior** (risk scoring یا decision mapping)
5) **Docs clarification** (مرزها/استثناها)

### Step F — Regression tests
برای هر fix:
- add a test vector
- ensure old good examples still pass

---

## 5) معیار “Done” برای این Sprint
- حداقل 1 سناریو واقعی‌نما + 1 خروجی نمونه + 1 گزارش بازخورد نمونه
- قالب feedback report آماده
- هر مثال شامل:
  - position_input
  - output (structured + rendered)
  - compliance report summary
  - reviewer decisions + edits

---

## 6) Metrics (برای کنترل کیفیت)
- % outputs requiring human review
- top recurring findings (rule_id frequency)
- false positives rate (reviewer says “acceptable” ولی scanner flag کرده)
- time-to-fix (feedback → merged policy/rule/template)
- drift checks (schema vs DTO vs docs)

---

## 7) Guardrails (privacy & safety)
- no_store mode برای promptهای آزاد
- redact snippets در feedback
- store hashes/references، نه متن خام (در صورت نیاز)

```

---

# 2) `docs/mcp/examples/scenario-smb-tech-startup.md`

```md
# Example Scenario — SMB Tech Startup (v0)
Last updated: 2026-07-21
Scenario id: EX.SMB.TECH_STARTUP.001

هدف: یک سناریوی واقعی‌نما که خروجی‌های JD/KPI/Leveling/KSAO را تست کند.

---

## 1) Company snapshot
- Type: B2B SaaS
- Stage: Series A
- Headcount: ~45
- Product: workflow automation for mid-market ops teams
- Current stack: Rust (services), Postgres, Redis, Kafka, Kubernetes, OpenTelemetry
- Primary customers: US-based
- Security posture: basic SOC2 roadmap (not certified yet)

---

## 2) Hiring goal
Need: **Backend Lead (IC track, senior+staff-ish)** to own backend platform reliability and delivery.

Non-goals:
- No candidate scoring/ranking
- No personality inference
- No use of candidate PII

---

## 3) Constraints & preferences
- Work mode: Hybrid (Austin, TX) but open to Remote (US) for exceptional candidates
- On-call: Yes, rotation (clear expectations)
- Travel: minimal (0–10%)
- Must be inclusive language (avoid “rockstar/ninja”, avoid proxies)
- Degree not required; equivalent experience acceptable

---

## 4) Position input (structured)
```json
{
  "schema_version": "0.1",
  "role_title": "Backend Lead",
  "job_family": "Engineering",
  "track": "IC",
  "level": "L4",
  "location": { "work_mode": "Hybrid", "country": "US", "region": "TX", "city": "Austin" },
  "employment_type": "FullTime",
  "mission": "Own backend services and reliability foundations to support growth from 45 to 120 employees while maintaining uptime and fast iteration.",
  "top_responsibilities": [
    "Own core backend services and data flows",
    "Drive reliability and observability standards (SLOs, tracing, alerting)",
    "Lead incident response improvements and postmortem quality",
    "Mentor backend engineers and raise engineering standards",
    "Partner with product and data teams on roadmap and delivery"
  ],
  "constraints": {
    "on_call": "Yes, weekly rotation; clear escalation policy",
    "travel": "0-10%",
    "timezone_constraints": "US time zones preferred"
  },
  "tech_stack": ["Rust", "Postgres", "Kafka", "Kubernetes", "OpenTelemetry"]
}
```

---

## 5) Geo & policy context
- job_location: US/TX/Austin
- deployment_location: US
- safe_mode: false
- no_store: true (prefer)

Triggered hotspots (expected):
- None (NYC/CO/EU/UK not triggered)

Expected compliance stance:
- Allow or AllowWithWarnings (depending on wording)
```

---

# 3) `docs/mcp/examples/sample-generated-position-backend-lead.md`

```md
# Sample Generated Output — Backend Lead (v0)
Last updated: 2026-07-21
Based on scenario: EX.SMB.TECH_STARTUP.001

> Note: This is a DRAFT output. Requires human review.

---

## A) Compliance summary (expected)
- Decision: ALLOW_WITH_WARNINGS
- Risk score: 32 (MED)
- Top factors:
  - Capability: DraftJobDescription/DraftKpi/DraftRoleLeveling (+10)
  - Findings: a few MED warnings (+8 each)
- Required actions:
  - REVIEW:HR_REVIEW_RECOMMENDED

Findings (example):
- STRUCT.JD.001 (Med): Essential functions count should be 5–10 (ok)
- FAIR.PROXY.040 (Low/Med): “X years experience” detected (rewrite suggested)
- FAIR.TERMS.020 (Med): “rockstar” detected (rewrite suggested)

---

## B) Position object (structured) — Position Schema v0.1
```json
{
  "schema_version": "0.1",
  "role_title": "Backend Lead",
  "job_family": "Engineering",
  "track": "IC",
  "level": "L4",
  "location": { "work_mode": "Hybrid", "country": "US", "region": "TX", "city": "Austin" },
  "employment_type": "FullTime",
  "mission": "Own backend services and reliability foundations to support growth while maintaining uptime and delivery speed.",
  "role_summary": "You will lead the technical direction of our backend services as a senior individual contributor. You will own reliability, observability, and service design standards, mentor engineers, and partner with product and data teams to deliver roadmap outcomes safely and quickly.",
  "essential_functions": [
    "Design and implement backend services and APIs that are reliable, observable, and secure by default.",
    "Own service-level objectives (SLOs), dashboards, alerting, and incident response processes for critical systems.",
    "Lead postmortems and drive measurable improvements to reduce recurrence and time-to-recovery.",
    "Improve developer experience by standardizing service templates, CI/CD practices, and operational runbooks.",
    "Collaborate with product, data, and frontend teams to plan and deliver cross-functional initiatives."
  ],
  "requirements_must_have": [
    "Demonstrated experience building and operating production API services (language/tooling flexible).",
    "Ability to troubleshoot distributed systems issues and communicate clearly during incidents.",
    "Experience with observability practices (metrics, logging, tracing) and reliability fundamentals."
  ],
  "requirements_preferred": [
    "Experience with Rust in production services.",
    "Experience with Kafka-based event-driven architectures.",
    "Experience defining SLOs/SLIs and running on-call rotations."
  ],
  "work_conditions": {
    "on_call": "Yes — on-call rotation with clear escalation and compensating time.",
    "travel": "0–10%",
    "timezone_constraints": "US time zones preferred"
  },
  "tools_tech_stack": ["Rust", "Postgres", "Kafka", "Kubernetes", "OpenTelemetry"],
  "accommodations_note": "We provide reasonable accommodations in accordance with applicable law. If you need accommodations during the application or interview process, please let us know.",
  "ksao": [
    {
      "category": "K",
      "name": "HTTP and API design fundamentals",
      "definition": "Knowledge of designing stable, secure APIs and versioning strategies.",
      "must_have": true,
      "can_be_trained_in_90_days": false,
      "job_related_evidence": "Essential functions: API/service design ownership"
    },
    {
      "category": "S",
      "name": "Incident response leadership (technical)",
      "definition": "Skill in coordinating technical mitigation, clear comms, and follow-up actions.",
      "must_have": true,
      "can_be_trained_in_90_days": true,
      "job_related_evidence": "Essential functions: incident response + postmortems"
    },
    {
      "category": "A",
      "name": "Debug complex production systems under uncertainty",
      "definition": "Ability to reason about multi-service failures and prioritize mitigations.",
      "must_have": true,
      "can_be_trained_in_90_days": true,
      "job_related_evidence": "Essential functions: reliability ownership"
    },
    {
      "category": "O",
      "name": "Clear, calm technical communication",
      "definition": "Other characteristic: communicates risk and status clearly during incidents and planning.",
      "must_have": true,
      "can_be_trained_in_90_days": true,
      "job_related_evidence": "Cross-functional collaboration + incident comms"
    }
  ],
  "taxonomy_mappings": {
    "onet": [
      { "soc_code": "15-1252.00", "title": "Software Developers", "confidence": 0.72, "requires_human_review": true }
    ],
    "esco": []
  }
}
```

---

## C) Rendered Job Description (from template)
Title: Backend Lead  
Job family: Engineering  
Track: IC | Level: L4  
Location / Work mode: Austin, TX (Hybrid)  
Employment type: Full time

Role Summary  
You will lead the technical direction of our backend services as a senior individual contributor. You will own reliability, observability, and service design standards, mentor engineers, and partner with product and data teams to deliver roadmap outcomes safely and quickly.

Essential Functions
- Design and implement backend services and APIs that are reliable, observable, and secure by default.
- Own SLOs, dashboards, alerting, and incident response processes for critical systems.
- Lead postmortems and drive measurable improvements to reduce recurrence and time-to-recovery.
- Improve developer experience via service templates, CI/CD practices, and operational runbooks.
- Collaborate with product, data, and frontend teams to deliver cross-functional initiatives.

Must-have Requirements
- Demonstrated experience building and operating production API services (language/tooling flexible).
- Ability to troubleshoot distributed systems issues and communicate clearly during incidents.
- Experience with observability practices (metrics, logging, tracing) and reliability fundamentals.

Preferred Qualifications
- Rust in production services
- Kafka-based event-driven architectures
- Defining SLOs/SLIs and running on-call rotations

Work Conditions
- On-call: Yes — rotation with clear escalation and compensating time
- Travel: 0–10%
- Time zone: US time zones preferred

Accommodations
We provide reasonable accommodations in accordance with applicable law. If you need accommodations during the application or interview process, please let us know.

---

## D) KPI set (structured) — KPI Schema v0.1
```json
{
  "schema_version": "0.1",
  "kpis": [
    {
      "name": "SLO compliance for critical services",
      "type": "Lagging",
      "definition": "Percent of time critical services meet defined SLOs.",
      "formula": "minutes_meeting_slo / total_minutes",
      "unit": "%",
      "frequency": "Monthly",
      "data_source": "Observability platform (SLO dashboards)",
      "owner": "Backend platform (IC lead)",
      "target_guidance": "Maintain >= 99.9% for tier-1 services (adjust per service).",
      "risks": {
        "gaming": "Ignoring non-measured failure modes; focusing only on SLO window.",
        "fairness": "Low (role KPI, not candidate filter).",
        "privacy": "Low (system metrics only)."
      },
      "counter_metrics": ["Customer-reported incidents", "Error budget burn rate"]
    },
    {
      "name": "Mean time to recover (MTTR) for tier-1 incidents",
      "type": "Lagging",
      "definition": "Average time to restore service for tier-1 incidents.",
      "formula": "avg(incident_end - incident_start)",
      "unit": "minutes",
      "frequency": "Monthly",
      "data_source": "Incident tracker",
      "owner": "On-call rotation (with IC lead owning process)",
      "target_guidance": "Reduce trend quarter-over-quarter without increasing change failures.",
      "risks": {
        "gaming": "Under-classifying severity or ending incidents early.",
        "fairness": "Low",
        "privacy": "Low"
      },
      "counter_metrics": ["Change failure rate", "Postmortem quality score (review-based)"]
    }
  ]
}
```

---

## E) Role leveling rationale (compact)
- Scope: Owns backend subsystem standards across multiple services
- Autonomy: Sets direction; executes independently; aligns stakeholders
- Impact: Cross-team reliability & delivery velocity
- Complexity: Ambiguous incident and architecture tradeoffs
- Collaboration: Cross-functional planning and incident comms
```

---

# 4) `docs/mcp/templates/feedback-report-template.md`

```md
# Feedback Report Template (v0)
Last updated: 2026-07-21
Template version: FEEDBACK-TPL-0.1

Report id: {{report_id}}
Scenario id: {{scenario_id}}
Reviewer: {{reviewer_id}}
Timestamp (RFC3339): {{timestamp}}
Policy versions:
- Legal: {{legal_policy_version}}
- Privacy: {{privacy_policy_version}}
- Fairness: {{fairness_policy_version}}

---

## 1) What was reviewed
- Artifact: {{artifact_type}} (JD / KPI / Leveling / KSAO / Full Position Report)
- Position: {{role_title}} ({{track}}/{{level}})
- Geo context: {{geo_context}}
- Safe mode: {{safe_mode}}
- No-store: {{no_store}}

---

## 2) Compliance engine result (as received)
- Decision: {{decision}}
- Risk score / bucket: {{risk_score}} / {{risk_bucket}}
- Required actions: {{required_actions}}

Findings (summary):
- {{finding_1}}
- {{finding_2}}
- {{finding_3}}

---

## 3) Reviewer decision
- [ ] Approve
- [ ] Approve with edits
- [ ] Reject (regenerate)
- [ ] Escalate to compliance/legal

Decision rationale (2–6 bullets):
- {{rationale_bullet_1}}
- {{rationale_bullet_2}}

---

## 4) Issues found (structured)
> Each issue should be actionable and map to: template/rule/schema/prompt/docs.

### Issue {{n}}
- Category: {{TEMPLATE_DEFECT|RULE_MISSING|RULE_TOO_STRICT|SCHEMA_GAP|PROMPT_ISSUE|POLICY_CLARIFICATION}}
- Severity: {{Low|Med|High|Critical}}
- Affected artifact: {{JD|KPI|Leveling|KSAO}}
- Evidence snippet (redacted): {{snippet}}
- Why it matters: {{explanation}}
- Suggested fix (rewrite or rule): {{suggested_fix}}
- Expected behavior (golden): {{expected_behavior}}
- Requires human review going forward?: {{true|false}}

---

## 5) Edits applied (if any)
- Before (redacted): {{before}}
- After: {{after}}
- Edit type: {{rewrite|remove|add_clarification|restructure}}

---

## 6) Regression test vectors to add
- {{test_vector_1}}
- {{test_vector_2}}

---

## 7) Follow-up actions / owners
- Owner (Eng): {{owner_eng}}
- Owner (HR): {{owner_hr}}
- Owner (Compliance): {{owner_compliance}}
- Due date: {{due_date}}
```

---

# 5) `docs/mcp/examples/sample-feedback-report.md`

```md
# Sample Feedback Report — Backend Lead (v0)
Last updated: 2026-07-21
Report id: FB.EX.001
Scenario id: EX.SMB.TECH_STARTUP.001
Reviewer: hr_reviewer_01
Timestamp (RFC3339): 2026-07-21T00:00:00Z
Policy versions:
- Legal: legal@0.1
- Privacy: privacy@0.1
- Fairness: fairness@0.1

---

## 1) What was reviewed
- Artifact: Full Position Report (JD + KPI + Leveling + KSAO)
- Position: Backend Lead (IC/L4)
- Geo context: US/TX/Austin (Hybrid)
- Safe mode: false
- No-store: true

---

## 2) Compliance engine result (as received)
- Decision: ALLOW_WITH_WARNINGS
- Risk score / bucket: 32 / MED
- Required actions: REVIEW:HR_REVIEW_RECOMMENDED

Findings (summary):
- FAIR.TERMS.020 (Med): “rockstar” flagged
- FAIR.PROXY.040 (Med): “X years experience” flagged
- STRUCT.KPI.010 (Low): KPI missing counter-metric (for one KPI)

---

## 3) Reviewer decision
- [x] Approve with edits

Decision rationale:
- JD structure and essential functions are strong and job-related.
- Two phrases may reduce inclusivity and create proxy discrimination risk.
- KPI set is usable; add counter-metric to prevent gaming.

---

## 4) Issues found (structured)

### Issue 1
- Category: RULE_MISSING
- Severity: Med
- Affected artifact: JD
- Evidence snippet (redacted): "[... rockstar ...]"
- Why it matters: Gender-coded / exclusionary language reduces applicant pool and may introduce bias.
- Suggested fix (rewrite or rule): Add rewrite template: "rockstar" → "highly skilled engineer" / "experienced engineer".
- Expected behavior (golden): Output should avoid slang-coded hiring language by default.
- Requires human review going forward?: false (once rule exists)

### Issue 2
- Category: RULE_TOO_STRICT
- Severity: Low
- Affected artifact: JD
- Evidence snippet (redacted): "[... 7+ years experience ...]"
- Why it matters: Years of experience can be a weak proxy; however sometimes it’s used as shorthand.
- Suggested fix (rewrite or rule): Change validator behavior to:
  - flag as warning
  - propose rewrite: "Demonstrated ability to …" OR "Relevant experience (roughly senior level)" without hard cutoff
- Expected behavior (golden): Prefer competency language; avoid rigid hard cutoffs unless justified.
- Requires human review going forward?: false

### Issue 3
- Category: TEMPLATE_DEFECT
- Severity: Low
- Affected artifact: KPI
- Evidence snippet (redacted): "[... KPI without counter-metric ...]"
- Why it matters: بدون counter-metric، KPI ممکن است behavior مخرب ایجاد کند.
- Suggested fix (rewrite or rule): Template requires at least 1 counter-metric for lagging KPIs.
- Expected behavior (golden): Each lagging KPI suggests a balancing measure.

---

## 5) Edits applied
- Before (redacted): "We’re looking for a backend rockstar..."
- After: "We’re looking for an experienced backend engineer who can lead reliability and delivery standards..."

- Before (redacted): "7+ years of experience required"
- After: "Demonstrated experience building and operating production backend services; senior-level ownership of reliability preferred."

---

## 6) Regression test vectors to add
- Input contains “rockstar/ninja” → output rewrite suggestion must trigger
- Input contains “X+ years required” → warning + suggested competency rewrite

---

## 7) Follow-up actions / owners
- Owner (Eng): eng_01
- Owner (HR): hr_01
- Owner (Compliance): compliance_01
- Due date: 2026-07-28
```

---

## (اختیاری) اسکلت سبک برای `apps/api` — feedback types + workflow

### `apps/api/src/mcp/feedback.rs`

```rust
// apps/api/src/mcp/feedback.rs

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ReviewDecision {
    Approve,
    ApproveWithEdits,
    RejectRegenerate,
    Escalate,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum IssueCategory {
    TemplateDefect,
    SchemaGap,
    RuleMissing,
    RuleTooStrict,
    PromptIssue,
    PolicyClarification,
    UxNoticeNeeded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Severity {
    Low,
    Med,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackIssue {
    pub category: IssueCategory,
    pub severity: Severity,
    pub affected_artifact: String, // "JD" | "KPI" | "LEVELING" | "KSAO"
    pub evidence_snippet_redacted: String,
    pub why_it_matters: String,
    pub suggested_fix: String,
    pub expected_behavior: String,
    pub requires_human_review_going_forward: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackReport {
    pub report_id: String,
    pub scenario_id: String,
    pub reviewer_id: String,
    pub timestamp_rfc3339: String,

    pub policy_versions: super::dtos::PolicyVersions,

    pub engine_decision: String,
    pub risk_score: u8,
    pub risk_bucket: String,
    pub required_actions: Vec<String>,

    pub reviewer_decision: ReviewDecision,
    pub rationale: Vec<String>,

    pub issues: Vec<FeedbackIssue>,

    pub edits_before_redacted: Option<String>,
    pub edits_after: Option<String>,
}
```

### Workflow endpoints (پیشنهادی برای آینده)
- `POST /api/v1/feedback/submit` (stores FeedbackReport, R1/R3 minimal)
- `POST /api/v1/review/{request_id}/decision` (stores reviewer decision + links audit event)

---

با این اسپرینت، شما یک “چرخه کامل” دارید: **سناریو → تولید → انطباق → بازبینی انسانی → گزارش ساختاری → backlog**. اگر طبق برنامه شما جلو برویم، بعد از این معمولاً دو مسیر ارزشمند داریم:

1) افزایش تعداد مثال‌ها (۵–۱۰ سناریو) برای پوشش job familyهای مختلف  
2) اضافه‌کردن test vectors و اجرای اتوماتیک validator روی examples (مثل یک suite سبک)
