# GenFlow MCP Documentation

این پوشه ساختار خام مستندات MCP برای پلتفرم **GenFlow** را نگه‌داری می‌کند.

در این sprint هدف فقط ایجاد فایل‌های خام، مسیرها و اسکلت اولیه است. محتوای دقیق حقوقی، HR، Privacy، Fairness، Compliance، Schema و Example در sprintهای بعدی تکمیل خواهد شد.

## اصل ساختار

فایل‌های ریشه مثل `01-legal-mcp.md`، `02-privacy-mcp.md` و ... نقش **Index / Overview** دارند. جزئیات اجرایی در پوشه‌های تخصصی نوشته می‌شوند:

```text
docs/mcp/
├── process/      # گام‌های عملیاتی ۱ تا ۸
├── legal/        # قوانین و محدوده‌های حقوقی
├── privacy/      # داده، رضایت، حریم خصوصی، retention
├── hr/           # استانداردهای HR، تحلیل، JD، KPI، KSAO
├── fairness/     # ضدتبعیض، bias، audit، complaint
├── compliance/   # معماری موتور انطباق و ruleها
├── templates/    # قالب خروجی‌ها و گزارش‌ها
├── schemas/      # اسکیمای داده‌ها، رویدادها و خروجی‌ها
└── examples/     # سناریوها و خروجی‌های نمونه
```

## فایل‌های راهنما

- `00-file-map.md`: نقشه کامل فایل‌ها و وابستگی‌ها
- `00-mcp-roadmap.md`: نقشه راه تکمیل MCPها
- `00-mcp-manifest.md`: راهنمای انتخاب فایل‌ها برای Agent/مدل

## وضعیت فعلی

- [x] ایجاد ساختار فایل‌ها
- [ ] تکمیل فایل‌های process
- [ ] تکمیل فایل‌های حیاتی legal/privacy/fairness/compliance
- [ ] تکمیل قالب‌ها و schemaها
- [ ] تولید نمونه‌های واقعی و feedback loop

## MCP source preservation strategy

The project keeps all MCP source drafts under `docs/mcp/_sources` so no deep research or implementation idea is lost. For v1, fast defaults can be used from Team 1 while Team 2 remains the canonical source for compliance-aware documentation and schema-first design.

Key files:

- `00-source-index.md`
- `00-mcp-v1-canonical-strategy.md`
- `00-mcp-merge-plan.md`
- `defaults/v1-fast-defaults.md`
- `technical/api-sketches-index.md`
