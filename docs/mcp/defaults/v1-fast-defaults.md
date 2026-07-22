# MCP v1 Fast Defaults

> Status: v0.1 draft  
> Purpose: defaultهای سریع برای نسخه v1، با نگه‌داشتن مسیر ارتقا به compliance عمیق‌تر.

## v1 positioning

GenFlow v1 باید به عنوان ابزار زیر معرفی شود:

```text
AI-assisted HR documentation and position design support.
Not an automated hiring, rejection, promotion, termination, or compensation decision system.
```

نسخه فارسی:

```text
GenFlow ابزار کمک‌تصمیم و تولید مستندات منابع انسانی است؛ تصمیم استخدام، رد، ارتقا، خاتمه همکاری یا حقوق و مزایا را به‌صورت خودکار اتخاذ نمی‌کند.
```

## v1 allowed capabilities

| Capability | Default status | Notes |
|---|---|---|
| DraftJobDescription | Allowed | با disclaimer و fairness scan |
| DraftKpi | Allowed | بدون داده کاندیدا |
| DraftRoleLeveling | Allowed | بر اساس scope/impact/autonomy، نه سن |
| KSAOProfile | Allowed | فقط job-related |
| BusinessSwotAnalysis | Allowed | داده شرکت Confidential محسوب شود |
| GapAnalysis | Allowed | skill/capability-based، نه person-based |
| CandidateScoring | Disabled by default | فقط بعد از compliance/fairness review |
| CandidateRanking | Disabled by default | high-risk |
| VideoInterviewAnalysis | Disabled by default | نیازمند consent/legal workflow |
| AutomatedHiringDecision | Blocked | ممنوع در v1 |
| AutomatedRejectionDecision | Blocked | ممنوع در v1 |

## v1 default risk buckets

| Risk score | Bucket | Action |
|---:|---|---|
| 0-19 | LOW | Allow |
| 20-49 | MED | Allow with warnings |
| 50-79 | HIGH | Require human review |
| 80-100 | CRITICAL | Block |

## v1 default human-review triggers

- Geo hotspot: NYC, Colorado, EU/UK, Illinois video use, Quebec watchlist
- Any candidate scoring/ranking request
- Any protected attribute involvement
- Any hard-forbidden term
- Any proxy discrimination warning
- Any medical/biometric/health inference
- Any output that sounds like final hiring/rejection/promotion/termination

## v1 data posture

- Candidate data: optional/off by default
- Raw prompts: no-store preferred
- PII in prompts: redact or block
- Sensitive data: block by default unless explicitly designed
- Audit logs: store minimal metadata, not raw payloads

## v1 default source priority

```text
If a quick product decision is needed:
  use Team 1 defaults.
If a compliance/legal documentation decision is needed:
  use Team 2 canonical framing.
If there is conflict:
  choose the safer Team 2 rule and document the v1 tradeoff.
```
