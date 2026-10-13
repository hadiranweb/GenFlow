#!/usr/bin/env python3
"""
تحلیل عددی دو سند «فرایند اصلی»:
  stage1 = غربالگری سریع وضعیت نود (۱۵ سؤال / ۸ محور)
  stage2 = عارضه‌یابی تفصیلی (۵۴ سؤال / ۹ محور)

هدف: قبل از کدنویسی، رفتار فرمول‌ها و ریسک‌های ساختاری روشن شود.
اجرا:  /tmp/venv/bin/python /home/user/review/analyze.py
"""
from __future__ import annotations
import yaml, statistics
from pathlib import Path

R = Path("/home/user/review")


def load(p: Path) -> dict:
    return yaml.safe_load(p.read_text(encoding="utf-8"))


def dim_map(doc: dict) -> dict:
    return {d["id"]: d for d in doc["dimensions"]}


# ---------------------------------------------------------------- بارگذاری
s1 = load(R / "stage1-screening.yaml.txt")
s2 = load(R / "stage2-diagnostics.yaml.txt")

print("=" * 78)
print("۱) شمارش و ساختار")
print("=" * 78)
for name, doc, qkey in (("مرحله ۱ (غربالگری)", s1, "questions"), ("مرحله ۲ (عارضه‌یابی)", s2, "items")):
    dims = doc["dimensions"]
    qs = doc[qkey]
    crit = [q for q in qs if q.get("critical")]
    by_dim: dict[str, int] = {}
    for q in qs:
        by_dim[q["dim"]] = by_dim.get(q["dim"], 0) + 1
    wsum = sum(d["weight"] for d in dims)
    print(f"\n{name}: {len(qs)} سؤال · {len(dims)} محور · {len(crit)} سؤال کلیدی")
    norm = ", ".join("{}={:.1f}%".format(d["id"], d["weight"] / wsum * 100) for d in dims)
    print("  جمع وزن محورها: {:.2f}  (حالت نرمال: {})".format(wsum, norm))
    print(f"  توزیع سؤال در محورها: {by_dim}")
    empty = [d["id"] for d in dims if by_dim.get(d["id"], 0) == 0]
    if empty:
        print(f"  ⚠️ محور بدون سؤال: {empty}")
    ids = [q["id"] for q in qs]
    assert len(ids) == len(set(ids)), "کد سؤال تکراری!"
    print(f"  کد سؤال‌های کلیدی: {[q['id'] for q in crit]}")

# ---------------------------------------------------------------- وزن‌دهی
print()
print("=" * 78)
print("۲) اثر دو روش وزن‌دهی در مرحله ۱ (چون تعداد سؤال محورها برابر نیست)")
print("=" * 78)
dims1 = s1["dimensions"]
qs1 = s1["questions"]
by_dim1: dict[str, list[dict]] = {}
for q in qs1:
    by_dim1.setdefault(q["dim"], []).append(q)

# روش الف: میانگین هر محور، سپس میانگین وزنی محورها (وزن محور مستقل از تعداد سؤال)
wsum1 = sum(d["weight"] for d in dims1)
print("\nالف) میانگین‌محور (سهم هر محور از امتیاز نهایی):")
for d in dims1:
    share = d["weight"] / wsum1
    print(f"   {d['id']:<11} سؤال={len(by_dim1[d['id']]):>1}  سهم={share*100:5.2f}%  سهم هر سؤال داخل محور={share/len(by_dim1[d['id']])*100:5.2f}%")

# روش ب: وزن‌دهی در سطح سؤال: (وزن محور × وزن سؤال) برای همه سؤال‌های پاسخ‌داده
prod = [(d["id"], d["weight"] * q["weight"]) for d in dims1 for q in by_dim1[d["id"]]]
tot = sum(p[1] for p in prod)
print("\nب) سطح‌سؤال (dim_weight × q_weight):")
per_dim_b: dict[str, float] = {}
for did, p in prod:
    per_dim_b[did] = per_dim_b.get(did, 0.0) + p
for did, val in per_dim_b.items():
    n = len(by_dim1[did])
    print(f"   {did:<11} سؤال={n:>1}  سهم={val/tot*100:5.2f}%  سهم هر سؤال={val/tot/n*100:5.2f}%")
print(f"\n   تفاوت کلیدی: «نقش و مالکیت» با ۱ سؤال،"
      f" در روش الف {dims1[0]['weight']/wsum1*100:.1f}% امتیاز را می‌گیرد و در روش ب {per_dim_b['ownership']/tot*100:.1f}%.")

# ---------------------------------------------------------------- سناریوها
print()
print("=" * 78)
print("۳) رفتار قانون «critical_ceiling = 2» در مرحله ۱")
print("=" * 78)
crit1 = [q["id"] for q in qs1 if q.get("critical")]
ZONES = (("سبز", s1["zones"]["green"]), ("زرد", s1["zones"]["yellow"]), ("قرمز", 0))


def zone_of(score: float) -> str:
    for label, thr in ZONES:
        if score >= thr:
            return label
    return "قرمز"


def stage1_score(answers: dict[str, int], scheme: str = "question") -> float:
    """answers: {qid: 0..10}; scheme: question | dimension"""
    if scheme == "question":
        num = den = 0.0
        for d in dims1:
            for q in by_dim1[d["id"]]:
                if q["id"] in answers:
                    num += d["weight"] * q["weight"] * answers[q["id"]]
                    den += d["weight"] * q["weight"]
        return num / den * 10 if den else 0.0
    num = den = 0.0
    for d in dims1:
        vals = [answers[q["id"]] for q in by_dim1[d["id"]] if q["id"] in answers]
        if vals:
            num += d["weight"] * statistics.fmean(vals)
            den += d["weight"]
    return num / den * 10 if den else 0.0


base = {q["id"]: 9 for q in qs1}                     # فرض: همه‌چیز خوب
ceiling = s1["critical_ceiling"]
cases = {
    "همه ۹ (بدون تخلف)": base,
    "همه ۹، ولی s09 (critical) = ۲": {**base, "s09": 2},
    "همه ۹، ولی s09 (critical) = ۳": {**base, "s09": 3},
    "همه ۹، ولی s02 (غیرکلیدی) = ۲": {**base, "s02": 2},
    "همه ۳ (وضعیت بد)": {q["id"]: 3 for q in qs1},
    "همه ۳، ولی s01 (critical) = ۹": {**{q["id"]: 3 for q in qs1}, "s01": 9},
}
print(f"\n{'سناریو':<34}{'امتیاز':>7}{'منطقهٔ فرمولی':>14}{'با سقف critical':>18}")
for label, ans in cases.items():
    sc = stage1_score(ans)
    z = zone_of(sc)
    violated = [c for c in crit1 if ans.get(c, 10) <= ceiling]
    z2 = "قرمز" if violated else z
    extra = f"  ← {','.join(violated)}" if violated else ""
    print(f"{label:<34}{sc:>7.1f}{z:>14}{z2:>18}{extra}")
print(f"\n  جمع سؤال‌های کلیدی مرحله ۱: {len(crit1)} از {len(qs1)}")

# ---------------------------------------------------------------- مرحله ۲
print()
print("=" * 78)
print("۴) مرحله ۲: شکاف، عارضه و دسته‌بندی")
print("=" * 78)
dims2 = s2["dimensions"]
qs2 = s2["items"]
by_dim2: dict[str, list[dict]] = {}
for q in qs2:
    by_dim2.setdefault(q["dim"], []).append(q)
wsum2 = sum(d["weight"] for d in dims2)
target = s2["target_index"]
sym = s2["symptom_threshold"]
bands = s2["severity_bands"]


def band(score: float) -> str:
    if score >= bands["healthy"]:
        return "مطلوب"
    if score >= bands["borderline"]:
        return "مرزی"
    if score >= bands["needs_fix"]:
        return "نیازمند اصلاح"
    return "بحرانی"


def stage2(answers: dict[str, int]) -> dict:
    axes = {}
    for d in dims2:
        vals = [answers[q["id"]] for q in by_dim2[d["id"]] if q["id"] in answers]
        ax = statistics.fmean(vals) * 10 if vals else 0.0
        axes[d["id"]] = ax
    overall = sum(d["weight"] * axes[d["id"]] for d in dims2) / wsum2
    symptoms = [q for q in qs2 if q["id"] in answers and answers[q["id"]] <= sym]
    crit_sym = [q for q in symptoms if q.get("critical")]
    return {"axes": axes, "overall": overall, "symptoms": symptoms, "crit_symptoms": crit_sym}


profiles = {
    "الف) نود بالغ": {q["id"]: 8 for q in qs2},
    "ب) نود متوسط": {q["id"]: 6 for q in qs2},
    "ج) مالی ضعیف (finance=۳، بقیه ۸)": {q["id"]: (3 if q["dim"] == "finance" else 8) for q in qs2},
    "د) یک عارضهٔ کلیدی (d801=۲)": {q["id"]: (2 if q["id"] == "d801" else 8) for q in qs2},
}
for pname, ans in profiles.items():
    r = stage2(ans)
    print(f"\n{pname} — امتیاز کل: {r['overall']:.1f} · عارضه‌ها (≤{sym}): {len(r['symptoms'])}"
          f" (کلیدی: {len(r['crit_symptoms'])})")
    rows = sorted(dims2, key=lambda d: r["axes"][d["id"]])
    for d in rows[:4]:
        sc = r["axes"][d["id"]]
        gap = max(0.0, target - sc)
        prio = gap * d["weight"]
        print(f"    {d['title']:<26} {sc:5.1f}  {band(sc):<14} شکاف تا هدف={gap:5.1f}  اولویت={prio:5.1f}")

# ---------------------------------------------------------------- نگاشت
print()
print("=" * 78)
print("۵) نگاشت محورهای دو مرحله (برای گزارش پیوسته)")
print("=" * 78)
ids1 = {d["id"] for d in dims1}
ids2 = {d["id"] for d in dims2}
both = ids1 & ids2
print(f"  مشترک بین دو مرحله: {sorted(both)}")
print(f"  فقط مرحله ۱: {sorted(ids1 - ids2)}")
print(f"  فقط مرحله ۲: {sorted(ids2 - ids1)}")
print("  → محورهای «استراتژی» و «ریسک» در غربالگری سنجیده نمی‌شوند؛")
print("    «نقش و مالکیت» در عارضه‌یابی محور مستقل ندارد (داخل strategy/people پخش شده).")

# ---------------------------------------------------------------- بار پاسخ
print()
print("=" * 78)
print("۶) بار پاسخ‌دهی و زمان")
print("=" * 78)
n1, n2 = len(qs1), len(qs2)
for label, n in (("غربالگری", n1), ("عارضه‌یابی", n2)):
    print(f"  {label}: {n} سؤال → با ۸ ثانیه/سؤال ≈ {n*8/60:.0f} دقیقه · با ۱۲ ثانیه ≈ {n*12/60:.0f} دقیقه")
print(f"  جمع دو مرحله: {n1+n2} سؤال → ≈ {(n1+n2)*8/60:.0f}–{(n1+n2)*12/60:.0f} دقیقه")
if "critical_ceiling" in s1:
    print(f"\n  نکته: «critical_ceiling» فقط در مرحله ۱ تعریف شده؛ مرحله ۲ قانونی برای"
          f" {sum(1 for q in qs2 if q.get('critical'))} سؤال کلیدی‌اش ندارد.")
