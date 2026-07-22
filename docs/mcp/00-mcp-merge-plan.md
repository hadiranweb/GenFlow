# MCP Merge Plan

> Status: v0.1 draft  
> Purpose: برنامه ادغام خروجی‌های Team 1 و Team 2 با File Map اصلی.

## اصل راهبردی

```text
Team 2 = canonical documentation and compliance architecture
Team 1 = fast v1 defaults and implementation-heavy sketches
File Map = folder and file contract
```

## Plan by domain

| Domain | Canonical file source | V1 default source | Notes |
|---|---|---|---|
| Sprint rules | Team 1 + assistant review | Team 1 | باید `process/00-sprint-rules.md` باقی بماند |
| Legal scope | Team 2 | Team 1 risk items | Team 2 provider/deployer و triggerها را بهتر دیده |
| Geographic scope | Team 2 | Team 1 tier examples | از واژه Fully Supported با احتیاط استفاده شود |
| Risk register | Team 2 | Team 1 LR items | Risk IDs باید normalize شوند |
| Decision boundaries | Team 2 | Team 1 disclaimers | Capability gating تیم 2 حفظ شود |
| Data inventory | Team 2 | Team 1 field tables | Team 1 data tables به عنوان detail اضافه شوند |
| Privacy/consent | Team 2 | Team 1 consent levels | Power imbalance warning تیم 2 ضروری است |
| Protected attributes | Team 2 | Team 1 country-specific examples | Team 2 global baseline بهتر است |
| Proxy rules | Team 2 | Team 1 proxy threshold ideas | Thresholdها v1 default هستند، نه legal fact |
| Forbidden terms | Team 2 | Team 1 term lists | تیم 1 لیست مفصل‌تری برای v1 scanner دارد |
| HR methodology | Team 2 | Team 1 practical Big Five/SWOT details | No sensitive inference باید حفظ شود |
| Position standard | Team 2 | Team 1 validator ideas | Essential functions و KSAO تیم 2 canonical است |
| Compliance engine | Team 2 | Team 1 pipeline code | Team 2 rule matrix و finding schema مبنا است |
| Schemas | Team 2 | Team 1 examples | JSON Schema 2020-12 مبنا باشد |
| Feedback loop | Team 2 | Team 1 sample reports | Team 2 issue categories مبنا باشد |

## Commit approach

این commit یک commit بزرگ مستندسازی است:

```text
docs(mcp): preserve MCP sources and define v1 merge strategy
```

## بعد از این commit

1. یک pass جدا برای canonicalize کردن Sprint 1 انجام شود.
2. بعد defaultهای v1 از Team 1 به rule/config قابل اجرا تبدیل شوند.
3. سپس schemaها و DTOهای Rust هم‌راستا شوند.
