# Legal Risk Register

> Status: draft  
> Related Sprint: Sprint 1 — Legal Scope

## هدف

این فایل ریسک‌های قانونی اولیه GenFlow را ثبت می‌کند تا در sprintهای بعدی به rule، checklist یا validator تبدیل شوند.

## Risk Register اولیه

| Risk ID | ریسک | حوزه | شدت | احتمال | کنترل پیشنهادی | Owner | وضعیت |
|---|---|---|---|---|---|---|---|
| LEG-001 | معرفی GenFlow به عنوان تصمیم‌گیرنده استخدامی | Employment AI | Critical | Medium | decision-support disclaimer و human review اجباری | Product/Legal | Open |
| LEG-002 | استفاده از match score برای رد/قبول خودکار | Hiring decision | Critical | Medium | ممنوعیت automated rejection در MVP | Product | Open |
| LEG-003 | عدم اطلاع‌رسانی استفاده از AI | Transparency | High | Medium | AI Usage Disclosure و consent flow | Product/Privacy | Open |
| LEG-004 | جمع‌آوری داده‌های حساس یا protected attributes | Privacy/Fairness | Critical | Medium | prohibited data list و PII scanner | Privacy/Fairness | Open |
| LEG-005 | سوگیری غیرمستقیم از طریق proxyها | Bias | High | High | Sprint 2 proxy discrimination rules | Fairness | Open |
| LEG-006 | عدم انجام bias audit در حوزه NYC AEDT | NYC LL144 | Critical | Low/Medium | AEDT classification و audit requirement | Legal | Open |
| LEG-007 | ورود به EU بدون high-risk compliance plan | EU AI Act | Critical | Medium | EU market gate و compliance plan | Legal/Compliance | Open |
| LEG-008 | عدم رعایت privacy notice در California | CCPA/CPRA | High | Medium | Notice at Collection template | Privacy | Open |
| LEG-009 | عدم ثبت audit log برای خروجی‌های حساس | Compliance | High | Medium | Audit log requirements در Sprint 6 | Backend/Compliance | Open |
| LEG-010 | استفاده نامناسب از MBTI/شخصیت برای تصمیم استخدام | HR/Fairness | High | Medium | MBTI limitations و human review | HR/Fairness | Open |

## Severity Definition

| Severity | معنی |
|---|---|
| Low | ریسک محصولی یا مستندسازی، بدون اثر مستقیم قانونی |
| Medium | نیازمند policy یا review، اما قابل کنترل در MVP |
| High | ممکن است باعث ادعای تبعیض، privacy issue یا customer risk شود |
| Critical | ممکن است محصول را در یک بازار غیرقابل عرضه کند یا نیازمند audit/legal approval باشد |

## کنترل فوری Sprint 1

سه کنترل باید از همین sprint ثبت شوند:

1. Decision-support boundary
2. No automated hiring/rejection in MVP
3. Human review required for employment-related outputs
