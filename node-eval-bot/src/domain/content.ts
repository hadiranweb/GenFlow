/**
 * بارگذاری تمام محتوای داده‌ای (پرسش‌نامه‌ها، سیاست‌های محاسبه، کتابخانهٔ اقدام، پرامپت‌ها)
 * در یک نقطه. اگر هر کدام نامعتبر باشد، سرویس بالا نمی‌آید — به‌جای خرابی در وسط
 * گفت‌وگوی کاربر.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { loadQuestionnaire } from './questions.js';
import type {
  CriticalCeilingConfig,
  GateMode,
  GateScoringConfig,
  MatrixScoringConfig,
  MindsetGateConfig,
  QuestionnaireDef,
  UnknownGuardConfig,
  Weighting,
  ZoneConfig,
} from './types.js';

export interface DomainAction {
  title: string;
  why: string;
  horizon: 'کوتاه‌مدت' | 'میان‌مدت' | 'بلندمدت';
}

export interface DomainVocab {
  title: string;
  owner_role: string;
  summary: string;
  actions: DomainAction[];
}

export interface ActionsVocab {
  domains: Record<string, DomainVocab>;
  severity_priority: Record<string, string>;
}

export interface ContentBundle {
  gate: QuestionnaireDef;
  matrix: QuestionnaireDef;
  gateScoring: GateScoringConfig;
  matrixScoring: MatrixScoringConfig;
  actions: ActionsVocab;
  interpretPrompt: string;
  documentPrompt: string;
}

function readText(p: string): string {
  return readFileSync(p, 'utf8');
}

function numOr(v: unknown, d: number): number {
  return Number.isFinite(Number(v)) ? Number(v) : d;
}

function parseUnknown(raw: unknown, fallback: UnknownGuardConfig): UnknownGuardConfig {
  const u = (raw ?? {}) as Record<string, unknown>;
  return {
    minCompleteness: numOr(u['min_completeness'], fallback.minCompleteness),
    requireCriticalAnswered:
      u['require_critical_answered'] !== undefined
        ? u['require_critical_answered'] !== false
        : fallback.requireCriticalAnswered,
    maxStraightLineRun: numOr(u['max_straight_line_run'], fallback.maxStraightLineRun),
    maxWithinDimensionDispersion: numOr(
      u['max_within_dimension_dispersion'],
      fallback.maxWithinDimensionDispersion,
    ),
    minMedianSecondsPerAnswer: numOr(u['min_median_seconds_per_answer'], fallback.minMedianSecondsPerAnswer),
  };
}

const DEFAULT_UNKNOWN: UnknownGuardConfig = {
  minCompleteness: 0.8,
  requireCriticalAnswered: false,
  maxStraightLineRun: 8,
  maxWithinDimensionDispersion: 0.45,
  minMedianSecondsPerAnswer: 2.5,
};

const DEFAULT_ZONES: ZoneConfig[] = [
  { key: 'green', min: 70, label: '🟢 سبز', description: 'نگرش سازنده.', color: '#16a34a' },
  { key: 'yellow', min: 40, label: '🟡 زرد', description: 'نگرش میانه.', color: '#d97706' },
  { key: 'red', min: 0, label: '🔴 قرمز', description: 'نگرش پرریسک.', color: '#dc2626' },
];

const DEFAULT_MINDSET: MindsetGateConfig = {
  knockoutOnRed: false,
  redCountForKnockout: 99,
  minGreenRatioForPass: 1,
  requireAllAxesAnswered: true,
  guards: { minMedianSecondsPerScenario: 3, maxSamePositionShare: 0.8, minAnswered: 10 },
};

const DEFAULT_CEILING: CriticalCeilingConfig = {
  criticalRedMax: 2,
  criticalYellowMax: 4,
  unansweredIsFlagged: true,
};

function parseZones(raw: unknown, ctx: string, fallback: ZoneConfig[]): ZoneConfig[] {
  if (raw === undefined || raw === null) return fallback;
  if (!Array.isArray(raw) || raw.length === 0) throw new Error(`${ctx}: بخش zones باید فهرست غیرخالی باشد`);
  return raw.map((z, i) => {
    const zone = z as Record<string, unknown>;
    const key = String(zone['key'] ?? '');
    if (!['green', 'yellow', 'red'].includes(key)) {
      throw new Error(`${ctx}: کلید ناحیهٔ شمارهٔ ${i} نامعتبر است (${key})`);
    }
    const min = Number(zone['min']);
    if (!Number.isFinite(min)) throw new Error(`${ctx}: min ناحیهٔ ${key} عدد نیست`);
    return {
      key: key as ZoneConfig['key'],
      min,
      label: String(zone['label'] ?? key),
      description: String(zone['description'] ?? ''),
      color: String(zone['color'] ?? '#6b7280'),
    };
  });
}

export function parseGateScoring(rawYaml: string): GateScoringConfig {
  const doc = YAML.parse(rawYaml) as Record<string, unknown> | null;
  if (!doc || typeof doc !== 'object') throw new Error('تنظیم محاسبهٔ ارزیابی خالی است');
  const ctx = 'scoring/gate.yaml';

  const modeRaw = String(doc['mode'] ?? 'weighted_scale');
  if (!['weighted_scale', 'sjt_knockout'].includes(modeRaw)) {
    throw new Error(`${ctx}: mode باید weighted_scale یا sjt_knockout باشد`);
  }

  const weightingRaw = String(doc['weighting'] ?? 'question_level');
  if (!['question_level', 'dimension_mean'].includes(weightingRaw)) {
    throw new Error(`${ctx}: weighting باید question_level یا dimension_mean باشد`);
  }

  const weightedRaw = (doc['weighted_scale'] ?? {}) as Record<string, unknown>;
  const weightedScale = {
    unknown: parseUnknown(weightedRaw['unknown'] ?? doc['unknown'], DEFAULT_UNKNOWN),
    zones: parseZones(weightedRaw['zones'] ?? doc['zones'], `${ctx} → weighted_scale.zones`, DEFAULT_ZONES),
  };

  const zones = parseZones(doc['zones'], `${ctx} → zones`, weightedScale.zones);
  const unknown = parseUnknown(doc['unknown'], weightedScale.unknown);

  const ceilingRaw = (doc['critical_ceiling'] ?? {}) as Record<string, unknown>;
  const criticalCeiling: CriticalCeilingConfig = {
    criticalRedMax: numOr(ceilingRaw['critical_red_max'], DEFAULT_CEILING.criticalRedMax),
    criticalYellowMax: numOr(ceilingRaw['critical_yellow_max'], DEFAULT_CEILING.criticalYellowMax),
    unansweredIsFlagged: ceilingRaw['unanswered_is_flagged'] !== false,
  };
  if (criticalCeiling.criticalRedMax > criticalCeiling.criticalYellowMax) {
    throw new Error(`${ctx}: critical_red_max باید کوچک‌تر یا مساوی critical_yellow_max باشد`);
  }

  const mindsetRaw = (doc['mindset'] ?? {}) as Record<string, unknown>;
  const mindsetGuardsRaw = (mindsetRaw['guards'] ?? {}) as Record<string, unknown>;
  const mindset: MindsetGateConfig = {
    knockoutOnRed: mindsetRaw['knockout_on_red'] === true,
    redCountForKnockout: numOr(mindsetRaw['red_count_for_knockout'], DEFAULT_MINDSET.redCountForKnockout),
    minGreenRatioForPass: numOr(mindsetRaw['min_green_ratio_for_pass'], DEFAULT_MINDSET.minGreenRatioForPass),
    requireAllAxesAnswered: mindsetRaw['require_all_axes_answered'] !== false,
    guards: {
      minMedianSecondsPerScenario: numOr(
        mindsetGuardsRaw['min_median_seconds_per_scenario'],
        DEFAULT_MINDSET.guards.minMedianSecondsPerScenario,
      ),
      maxSamePositionShare: numOr(mindsetGuardsRaw['max_same_position_share'], DEFAULT_MINDSET.guards.maxSamePositionShare),
      minAnswered: numOr(mindsetGuardsRaw['min_answered'], DEFAULT_MINDSET.guards.minAnswered),
    },
  };
  const axisWeightsRaw = (mindsetRaw['axis_weights'] ?? {}) as Record<string, unknown>;
  const axisWeights: Record<string, number> = {};
  for (const [k, v] of Object.entries(axisWeightsRaw)) {
    const n = Number(v);
    if (Number.isFinite(n)) axisWeights[k] = n;
  }
  if (Object.keys(axisWeights).length > 0) mindset.axisWeights = axisWeights;

  const behaviorsRaw = (doc['behaviors'] ?? {}) as Record<string, unknown>;

  return {
    version: String(doc['version'] ?? '0.0.0'),
    mode: modeRaw as GateMode,
    weighting: weightingRaw as Weighting,
    unknown,
    zones,
    criticalCeiling,
    weightedScale,
    mindset,
    behaviors: {
      actionToComplainTarget: numOr(behaviorsRaw['action_to_complain_target'], 2),
      minSelfSufficiencyRetries: numOr(behaviorsRaw['min_self_sufficiency_retries'], 1),
    },
  };
}

export function parseMatrixScoring(rawYaml: string): MatrixScoringConfig {
  const doc = YAML.parse(rawYaml) as Record<string, unknown> | null;
  if (!doc || typeof doc !== 'object') throw new Error('تنظیم محاسبهٔ عارضه‌یابی خالی است');
  const ctx = 'scoring/matrix.yaml';

  const bandsRaw = (doc['severity_bands'] ?? {}) as Record<string, unknown>;
  const severityBands = {
    healthy: numOr(bandsRaw['healthy'], 75),
    borderline: numOr(bandsRaw['borderline'], 60),
    needs_fix: numOr(bandsRaw['needs_fix'], 40),
  };
  if (!(severityBands.healthy > severityBands.borderline && severityBands.borderline > severityBands.needs_fix)) {
    throw new Error(`${ctx}: severity_bands باید نزولی باشد (healthy > borderline > needs_fix)`);
  }

  const interpRaw = (doc['interpretation'] ?? {}) as Record<string, unknown>;
  const adminRaw = (doc['admin_keys'] ?? {}) as Record<string, unknown>;

  return {
    version: String(doc['version'] ?? '0.0.0'),
    targetIndex: numOr(doc['target_index'], 75),
    symptomThreshold: numOr(doc['symptom_threshold'], 4),
    severityBands,
    interpretation: {
      explanationRequired: interpRaw['explanation_required'] === true,
      explanationsToAi: interpRaw['explanations_to_ai'] !== false,
      maxExplanationChars: numOr(interpRaw['max_explanation_chars'], 600),
      maxExplanationsInPayload: numOr(interpRaw['max_explanations_in_payload'], 40),
    },
    adminKeys: {
      deepInterpretation: adminRaw['deep_interpretation'] === true,
      aiInterpretation: adminRaw['ai_interpretation'] === true,
    },
  };
}

export function loadContent(dataDir: string): ContentBundle {
  const qDir = path.join(dataDir, 'questions');
  const sDir = path.join(dataDir, 'scoring');
  const vDir = path.join(dataDir, 'vocab');
  const pDir = path.join(dataDir, 'prompts');

  const gateScoring = parseGateScoring(readText(path.join(sDir, 'gate.yaml')));
  const matrixScoring = parseMatrixScoring(readText(path.join(sDir, 'matrix.yaml')));

  const gate = loadQuestionnaire(path.join(qDir, 'gate.yaml'), 'gate', gateScoring.mode);
  const matrix = loadQuestionnaire(path.join(qDir, 'matrix.yaml'), 'matrix', 'weighted_scale');

  if (matrix.key !== 'matrix') throw new Error('فایل پرسش‌نامهٔ عارضه‌یابی نامعتبر است');
  if (matrix.mode !== 'weighted_scale') throw new Error('عارضه‌یابی فقط با موتور weighted_scale پشتیبانی می‌شود');

  const actions = YAML.parse(readText(path.join(vDir, 'actions.yaml'))) as ActionsVocab;
  if (!actions || typeof actions !== 'object' || !actions.domains) {
    throw new Error('vocab/actions.yaml نامعتبر است');
  }
  const missing = matrix.sections.filter((s) => !actions.domains[s.code]).map((s) => s.code);
  if (missing.length > 0) {
    throw new Error(`vocab/actions.yaml برای این محورها اقدام ندارد: ${missing.join(', ')}`);
  }

  return {
    gate,
    matrix,
    gateScoring,
    matrixScoring,
    actions,
    interpretPrompt: readText(path.join(pDir, 'interpret.md')),
    documentPrompt: readText(path.join(pDir, 'document.md')),
  };
}
