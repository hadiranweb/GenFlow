# Legal Decision Boundaries

> Status: draft  
> Related Sprint: Sprint 1 — Legal Scope

## هدف

این سند مشخص می‌کند GenFlow چه نوع تصمیم‌هایی را می‌تواند پشتیبانی کند و چه تصمیم‌هایی فعلاً نباید انجام دهد.

## اصل بنیادین

```text
GenFlow supports decisions; it does not make employment decisions.
```

نسخه فارسی:

```text
GenFlow به تصمیم‌گیری کمک می‌کند، اما تصمیم استخدامی یا سازمانی را به‌صورت نهایی اتخاذ نمی‌کند.
```

## محدوده مجاز در MVP

| قابلیت | مجاز؟ | شرط |
|---|---|---|
| تولید شرح شغل | بله | خروجی باید توسط انسان review شود |
| تولید KPI | بله | KPI نباید معیار تبعیض‌آمیز داشته باشد |
| تحلیل کسب‌وکار | بله | داده محرمانه باید محافظت شود |
| پیشنهاد role برای نیاز سازمان | بله | صرفاً پیشنهاد، نه تصمیم قطعی |
| تحلیل شخصیت مدیر/تیم | محدود | با disclaimer و عدم استفاده برای رد/قبول |
| match insight | محدود | فقط توضیحی و نیازمند human review |

## محدوده غیرمجاز در MVP

| قابلیت | وضعیت | دلیل |
|---|---|---|
| رد خودکار کاندیدا | ممنوع | high-risk automated employment decision |
| قبول خودکار کاندیدا | ممنوع | decision authority نباید با سیستم باشد |
| رتبه‌بندی نهایی کاندیداها | ممنوع تا review | AEDT/high-risk risk |
| پیشنهاد termination | ممنوع | worker management high-risk |
| پیشنهاد promotion بدون review | ممنوع | employment decision risk |
| استفاده از protected attributes | ممنوع | discrimination/privacy risk |
| استفاده از proxyهای حساس | ممنوع تا تعریف قواعد | proxy discrimination risk |

## متن Disclaimer پیشنهادی

```text
GenFlow provides AI-assisted analysis and structured recommendations for job position design, business analysis, and HR planning. It does not make hiring, rejection, promotion, termination, or compensation decisions. All outputs must be reviewed by qualified human decision-makers before use.
```

نسخه فارسی:

```text
GenFlow تحلیل و پیشنهاد ساختاریافته مبتنی بر هوش مصنوعی برای طراحی پوزیشن، تحلیل کسب‌وکار و برنامه‌ریزی منابع انسانی ارائه می‌کند. این پلتفرم تصمیم استخدام، رد، ارتقا، خاتمه همکاری یا جبران خدمات را اتخاذ نمی‌کند. همه خروجی‌ها باید قبل از استفاده توسط تصمیم‌گیرنده انسانی واجد صلاحیت بررسی شوند.
```

## Human Review Rule

هر خروجی که یکی از موارد زیر را داشته باشد باید human review اجباری داشته باشد:

- اشاره به کاندیدا یا employee مشخص
- match score یا suitability score
- پیشنهاد job requirement حساس
- KPI مرتبط با ارزیابی عملکرد فرد
- هر نوع risk score حقوقی یا fairness
- خروجی برای بازار US/EU/NY/CA/Quebec

## Product Rule

در UI و API نباید از عبارات زیر برای GenFlow استفاده شود:

```text
hiring decision engine
candidate rejection engine
automated screening authority
automatic promotion/termination recommender
```

عبارات جایگزین مجاز:

```text
position design assistant
HR planning support
AI-assisted job documentation
decision-support platform
human-reviewed recommendations
```
