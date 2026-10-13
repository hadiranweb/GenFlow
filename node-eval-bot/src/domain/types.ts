/**
 * انواع دامنهٔ «نود ارزیابی» — بازنویسی مطابق فرایند اصلی (دیاگرام ۱۴۰۵/۰۷/۲۰)
 *
 * دو تفاوت بنیادی با نسخهٔ قبل:
 *  ۱) ارزیابی اولیه یک «لیبل» است، نه فیلتر: هیچ مسیری مسدود نمی‌شود و لیبل به کاربر
 *     نمایش داده نمی‌شود (فقط در پرونده/سطح مدیریت).
 *  ۲) عارضه‌یابی «دو ساید» است: پاسخ رنجی (وارد ماتریس) + توضیح متنی (اختیاری، فقط تفسیر).
 */

export type Zone = 'green' | 'yellow' | 'red' | 'unknown';
export type Confidence = 'high' | 'medium' | 'low';
export type Signal = 'red' | 'yellow' | 'green';
export type GateMode = 'weighted_scale' | 'sjt_knockout';
export type Weighting = 'question_level' | 'dimension_mean';

/** دسته‌بندی نهایی هر محور عارضه‌یابی */
export type MatrixBand = 'healthy' | 'borderline' | 'needs_fix' | 'critical';

/** پاسخ: عدد (رنج) · رشته (کلید گزینهٔ SJT بایگانی‌شده) · null (نمی‌دانم/رد کردن) */
export type AnswerValue = number | string | null;

export interface AnswerRecord {
  questionCode: string;
  value: AnswerValue;
  answeredAt: string;
  elapsedMs: number;
  signal?: Signal;
  /** ساید دوم پرسش‌های عارضه‌یابی: توضیح متنی اختیاری */
  explanation?: string;
}

export type AnswersMap = Record<string, AnswerRecord>;

export type SessionStatus =
  | 'consent_pending'
  | 'screening_in_progress'
  | 'diagnostics_in_progress'
  | 'diagnostics_done'
  | 'report_generating'
  | 'report_ready'
  | 'report_failed'
  | 'cancelled';

export type QuestionnaireKey = 'gate' | 'matrix';
export type Polarity = 'direct' | 'reverse';
export type QuestionKind = 'scored' | 'context' | 'sjt';
export type ResponseMode = 'range' | 'range+text';

export interface SjtOption {
  key: string;
  text: string;
  signal: Signal;
  rationale?: string;
}

export interface QuestionDef {
  code: string;
  text: string;
  low?: string;
  high?: string;
  polarity: Polarity;
  kind: QuestionKind;
  critical: boolean;
  dimension: string;
  /** وزن پرسش داخل محور (پیش‌فرض ۱.۰۰) */
  weight: number;
  remedyHint?: string;
  indicator?: string;
  /** range = فقط رنج · range+text = رنج + کادر توضیح اختیاری */
  response: ResponseMode;
  options?: SjtOption[];
}

export interface SectionDef {
  code: string;
  title: string;
  description?: string;
  weight: number;
  questions: QuestionDef[];
}

export interface QuestionnaireDef {
  key: QuestionnaireKey;
  mode: GateMode;
  version: string;
  title: string;
  intro: string;
  scaleMin: number;
  scaleMax: number;
  sections: SectionDef[];
  consistencyRules: ConsistencyRule[];
}

export interface ConsistencyRule {
  code: string;
  title: string;
  when: Array<{ question: string; op: '>=' | '<=' | '>' | '<' | '=='; value: number }>;
  message: string;
}

// ---------------------------------------------------------------------------
// تنظیمات
// ---------------------------------------------------------------------------

export interface UnknownGuardConfig {
  minCompleteness: number;
  requireCriticalAnswered: boolean;
  maxStraightLineRun: number;
  maxWithinDimensionDispersion: number;
  minMedianSecondsPerAnswer: number;
}

export interface ZoneConfig {
  key: Extract<Zone, 'green' | 'yellow' | 'red'>;
  min: number;
  label: string;
  description: string;
  color: string;
}

export interface CriticalCeilingConfig {
  criticalRedMax: number;
  criticalYellowMax: number;
  unansweredIsFlagged: boolean;
}

export interface MindsetGateConfig {
  knockoutOnRed: boolean;
  redCountForKnockout: number;
  minGreenRatioForPass: number;
  requireAllAxesAnswered: boolean;
  guards: { minMedianSecondsPerScenario: number; maxSamePositionShare: number; minAnswered: number };
  axisWeights?: Record<string, number>;
}

export interface GateScoringConfig {
  version: string;
  mode: GateMode;
  weighting: Weighting;
  unknown: UnknownGuardConfig;
  zones: ZoneConfig[];
  criticalCeiling: CriticalCeilingConfig;
  weightedScale: { unknown: UnknownGuardConfig; zones: ZoneConfig[] };
  mindset: MindsetGateConfig;
  behaviors: { actionToComplainTarget: number; minSelfSufficiencyRetries: number };
}

export interface SeverityBandsConfig {
  healthy: number;
  borderline: number;
  needs_fix: number;
}

export interface MatrixScoringConfig {
  version: string;
  targetIndex: number;
  symptomThreshold: number;
  severityBands: SeverityBandsConfig;
  interpretation: {
    explanationRequired: boolean;
    explanationsToAi: boolean;
    maxExplanationChars: number;
    maxExplanationsInPayload: number;
  };
  adminKeys: { deepInterpretation: boolean; aiInterpretation: boolean };
}

// ---------------------------------------------------------------------------
// نتیجهٔ ارزیابی اولیه (لیبل — فقط سطح مدیریت)
// ---------------------------------------------------------------------------

export interface CriticalCeilingHit {
  questionCode: string;
  text: string;
  dimension: string;
  dimensionTitle: string;
  value: number | null;
  ceiling: 'red' | 'yellow';
}

export interface CriticalCeilingResult {
  applied: boolean;
  ceiling: 'none' | 'yellow' | 'red';
  hits: CriticalCeilingHit[];
}

export interface GateScoreResult {
  mode: GateMode;
  weighting?: Weighting;
  score0to100: number;
  zone: Zone;
  verdict: 'pass' | 'hold' | 'knock_out' | 'unknown' | 'label';
  confidence: Confidence;
  needsConversation: boolean;
  completeness: number;
  dimensionScores: Array<{ code: string; title: string; score: number; weight: number; answered: number; total: number }>;
  guards: Array<{ code: string; title: string; triggered: boolean; detail?: string }>;
  formulaVersion: string;
  weightsSnapshot: Record<string, number>;
  thresholdsSnapshot: Array<{ key: string; min: number }>;
  answeredCount: number;
  totalScoredQuestions: number;
  /** قانون سقف پرسش‌های کلیدی (فقط موتور مقیاس) */
  criticalCeiling?: CriticalCeilingResult;
  signalCounts?: { red: number; yellow: number; green: number };
  axisSignals?: AxisSignalSummary[];
  knockouts?: KnockoutRecord[];
  behavior?: BehaviorStats & {
    selfSufficiency: number;
    actionToComplainRatio: number | null;
    actionToComplainTarget: number;
  };
}

/** انواع موتور بایگانی‌شدهٔ SJT (فعال نیست؛ برای سازگاری و تست) */
export interface AxisSignalSummary {
  code: string;
  title: string;
  weight: number;
  answered: number;
  total: number;
  red: number;
  yellow: number;
  green: number;
  score0to100: number;
  greenRatio: number;
}

export interface KnockoutRecord {
  questionCode: string;
  scenario: string;
  axisCode: string;
  axisTitle: string;
  optionKey: string;
  optionText: string;
  rationale?: string;
  indicator?: string;
}

export interface BehaviorStats {
  invalidAttempts: number;
  backMoves: number;
  resumes: number;
  helpViews: number;
  totalAnswerSeconds: number;
  answeredScenarios: number;
}

// ---------------------------------------------------------------------------
// نتیجهٔ عارضه‌یابی
// ---------------------------------------------------------------------------

export interface SymptomRecord {
  questionCode: string;
  text: string;
  dimension: string;
  dimensionTitle: string;
  value: number;
  critical: boolean;
  explanation?: string;
}

export interface DomainPriority {
  code: string;
  title: string;
  score0to100: number;
  band: MatrixBand;
  weight: number;
  gap: number;
  priority: number;
  criticalWeakCount: number;
}

export interface MatrixDomainResult {
  code: string;
  title: string;
  weight: number;
  score0to100: number;
  band: MatrixBand;
  answerRate: number;
  answered: number;
  total: number;
  dispersion: number;
  criticalGaps: Array<{ questionCode: string; text: string; value: number }>;
  strengths: Array<{ questionCode: string; text: string; value: number }>;
  /** پرسش کلیدی این محور زیر آستانهٔ عارضه */
  criticalBelowThreshold: boolean;
}

export interface MatrixResult {
  overall0to100: number;
  band: MatrixBand;
  gapToTarget: number;
  targetIndex: number;
  bottleneck: { code: string; title: string; score0to100: number };
  strongest: { code: string; title: string; score0to100: number };
  domains: MatrixDomainResult[];
  priorities: DomainPriority[];
  symptoms: SymptomRecord[];
  severityCounts: { critical: number; warning: number; acceptable: number; healthy: number };
  answeredCount: number;
  totalQuestions: number;
  explanationsCount: number;
  formulaVersion: string;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// تفسیر
// ---------------------------------------------------------------------------

export interface Finding {
  title: string;
  evidence: string;
  implication: string;
}

export interface RiskFinding extends Finding {
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface Interpretation {
  headline: string;
  verdict: {
    band: MatrixBand;
    statement: string;
    confidence: Confidence;
    needsConversation: boolean;
  };
  narrative: string[];
  strengths: Finding[];
  risks: RiskFinding[];
  bottlenecks: Array<{ domainCode: string; domainTitle: string; score0to100: number; why: string }>;
  /** ناسازگاری بین عدد و توضیح کاربر — ارزشمندترین بخش تحلیل */
  inconsistencies: string[];
  openQuestions: string[];
  nextActions: Array<{ title: string; why: string; ownerRole: string; horizon: 'کوتاه‌مدت' | 'میان‌مدت' | 'بلندمدت' }>;
  limitations: string[];
  meta: {
    provider: string;
    model: string;
    status: 'ok' | 'fallback' | 'failed';
    tier: 'range_only' | 'deep_ai';
    awaitingHumanReview: boolean;
    generatedAt: string;
    error?: string;
  };
}

/** گروه‌بندی توضیحات برای بستهٔ ارسالی به مدل */
export interface ExplanationPayloadItem {
  questionCode: string;
  dimensionTitle: string;
  rangeValue: number;
  text: string;
}
