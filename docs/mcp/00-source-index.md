# MCP Source Index

> Status: v0.1 draft  
> Purpose: نگه‌داری همه منابع خام و تصمیم‌های ادغام، تا هیچ داده‌ای از تیم‌ها از دست نرود.

این پوشه سه منبع اصلی MCP را نگه می‌دارد:

| Source | File | Role | How to use |
|---|---|---|---|
| File Map | `_sources/00-file-map-source.md` | نقشه ساختار فایل‌ها | مرجع مسیرها، اولویت فایل‌ها و وابستگی‌ها |
| Team 1 Draft | `_sources/01-team1-v1-implementation-heavy-source.md` | نسخه سریع و implementation-heavy | منبع defaultهای v1، نمونه کد، pipeline و logicهای آماده |
| Team 2 Draft | `_sources/02-team2-compliance-docs-heavy-source.md` | نسخه عمیق و compliance-docs-heavy | منبع canonical docs، triggerها، rule design، schema-first و منابع حقوقی |

## اصل تصمیم

```text
داده عمیق حذف نمی‌شود؛ داخل _sources نگه‌داری می‌شود.
برای v1 سریع، از defaultهای تیم 1 استفاده می‌کنیم.
برای سند رسمی و قابل دفاع، تیم 2 مبنا است.
```

## فایل‌های تصمیم‌گیرنده

- `00-mcp-v1-canonical-strategy.md`: استراتژی ترکیب تیم 1 و تیم 2
- `00-mcp-merge-plan.md`: برنامه ادغام و اولویت استفاده از هر منبع
- `defaults/v1-fast-defaults.md`: defaultهای سریع برای v1
- `technical/api-sketches-index.md`: محل نگه‌داری و ارجاع به اسکچ‌های API/Rust
