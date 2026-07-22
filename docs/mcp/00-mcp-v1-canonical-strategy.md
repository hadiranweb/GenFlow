# GenFlow MCP v1 Canonical Strategy

> Status: v0.1 draft  
> Goal: ترکیب کامل داده‌های تیم 1 و تیم 2 بدون از دست دادن عمق مستندات، با اولویت استفاده سریع در v1.

## تصمیم اصلی

ما دو نوع داده داریم:

1. **داده سریع / عملیاتی**  
   برای اینکه v1 سریع بالا بیاید، default ruleها، code sketchها، pipelineها و نمونه‌های تیم 1 استفاده می‌شوند.

2. **داده عمیق / قابل دفاع**  
   برای اینکه سیستم بعداً قابل audit، توسعه و فروش سازمانی باشد، مستندات عمیق، منابع حقوقی، triggerها، schema-first و rule design تیم 2 نگه‌داری و به مرور canonical می‌شوند.

## قانون ترکیب

| Layer | Primary source | Secondary source | Reason |
|---|---|---|---|
| File structure | File Map | Team 2 | نقشه فایل‌ها باید پایدار بماند |
| Legal canonical docs | Team 2 | Team 1 | تیم 2 دقیق‌تر، trigger-based و منبع‌محور است |
| Privacy canonical docs | Team 2 | Team 1 | تیم 2 consent/lawful basis و power imbalance را بهتر دیده است |
| Bias & Fairness docs | Team 2 | Team 1 | تیم 2 برای protected/proxy/disparate impact بهتر است؛ تیم 1 برای forbidden terms مفید است |
| HR methodology | Team 2 | Team 1 | تیم 2 محتاط‌تر است؛ تیم 1 برای جزئیات Big Five/SWOT/Gap عملی‌تر است |
| Position generation | Team 2 | Team 1 | تیم 2 essential functions، KSAO، O*NET/ESCO و license را بهتر دیده است |
| Compliance engine docs | Team 2 | Team 1 | تیم 2 معماری و rule matrix بهتر دارد؛ تیم 1 pipeline code مفصل‌تر دارد |
| Templates & Schemas | Team 2 | Team 1 | تیم 2 schema-first و OpenAPI/RFC3339-ready است |
| Feedback loop | Team 2 | Team 1 | تیم 2 issue taxonomy و workflow بهتر دارد؛ تیم 1 نمونه‌ها را غنی‌تر کرده است |
| Rust/API sketches | Team 1 + Team 2 | Final API design later | هر دو نگه‌داری می‌شوند ولی فعلاً source-of-truth کد production نیستند |

## اصل استفاده در v1

```text
V1 uses fast defaults.
Canonical docs preserve the deeper compliance reasoning.
Production code must be promoted from sketches only after review.
```

## سیاست ورود به apps/api

برای این commit، هدف اصلی **نگه‌داری و مستندسازی** است. کدهای API/Rust تیم‌ها به عنوان sketch نگه‌داری می‌شوند و مستقیماً production logic محسوب نمی‌شوند.

ورود کد به `apps/api` در آینده وقتی انجام شود که:

1. schema مربوطه مشخص شده باشد.
2. endpoint یا validator واقعی مصرف‌کننده داشته باشد.
3. تست حداقلی نوشته شود.
4. CI با `cargo fmt`, `cargo clippy -- -D warnings`, `cargo test` سبز بماند.

## نتیجه برای این commit

این commit باید:

- همه sourceها را نگه دارد.
- استراتژی ترکیب را ثبت کند.
- defaultهای سریع v1 را مشخص کند.
- اسکچ‌های API را index کند.
- هنوز محصول را به compliance production متعهد نکند.
