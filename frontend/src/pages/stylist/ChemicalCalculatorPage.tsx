import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, Beaker, AlertTriangle, Shield, Clock,
  RefreshCw, CheckCircle2,
} from 'lucide-react';
import type { ChemicalCalculationResult } from '../../types';

const TREATMENT_TYPES = [
  { id: 'color', label: 'カラー', icon: '🎨' },
  { id: 'bleach', label: 'ブリーチ', icon: '⚡' },
  { id: 'perm', label: 'パーマ', icon: '🌀' },
];

const TONE_OPTIONS = [
  { id: 'dark', label: '暗め (1-6 Lv)' },
  { id: 'medium', label: '中間 (7-9 Lv)' },
  { id: 'light', label: '明るめ (10-12 Lv)' },
  { id: 'high_tone', label: 'ハイトーン (13+ Lv)' },
];

const LENGTH_OPTIONS = [
  { id: 'short', label: 'ショート' },
  { id: 'bob', label: 'ボブ' },
  { id: 'medium', label: 'ミディアム' },
  { id: 'long', label: 'ロング' },
  { id: 'very_long', label: 'スーパーロング' },
];

export default function ChemicalCalculatorPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  // Form state — pre-filled from booking if available
  const [damageLevel, setDamageLevel] = useState(3);
  const [bleachCount, setBleachCount] = useState(1);
  const [targetTreatment, setTargetTreatment] = useState('color');
  const [targetTone, setTargetTone] = useState('medium');
  const [hasStraightening, setHasStraightening] = useState(false);
  const [hasPerm, setHasPerm] = useState(false);
  const [hasBlackDye, setHasBlackDye] = useState(false);
  const [hairLength, setHairLength] = useState('medium');
  const [permCount, setPermCount] = useState(0);

  const [result, setResult] = useState<ChemicalCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    // Simulate API call (in production, call chemicalApi.calculate)
    setTimeout(() => {
      // Client-side mock of the calculation for demo
      const riskScore = Math.min(10,
        damageLevel * 1.2 +
        Math.min(bleachCount * 0.8, 4) +
        (hasStraightening && targetTreatment === 'perm' ? 3 : 0) +
        (permCount >= 5 ? 2 : 0)
      );

      const mockResult: ChemicalCalculationResult = {
        id: `calc-${Date.now()}`,
        recommended_agents: [
          {
            agent: {
              id: 'agent-1',
              name: damageLevel >= 4 ? 'Acidic Color (Acid-based)' : damageLevel >= 3 ? 'Low-Alkaline Color' : 'Medium-Alkaline Oxidation Color',
              type: damageLevel >= 4 ? 'acidic' : 'alkaline',
              strength: damageLevel >= 4 ? 'low' : damageLevel >= 3 ? 'low' : 'medium',
              ph_range: damageLevel >= 4 ? '3.5-6.0' : damageLevel >= 3 ? '7.5-8.0' : '8.0-9.0',
              description: 'Primary color/treatment agent selected based on hair condition',
              risk_level: damageLevel >= 4 ? 0 : damageLevel >= 3 ? 1 : 2,
              suitable_damage_max: damageLevel >= 4 ? 5 : damageLevel >= 3 ? 4 : 3,
            },
            role: 'Primary Agent',
            mix_ratio: '1:1 with developer',
            reason: `Selected based on damage level ${damageLevel}/5`,
          },
          {
            agent: {
              id: 'agent-dev',
              name: damageLevel >= 3 ? '3% Developer (10 Vol)' : '6% Developer (20 Vol)',
              type: 'developer',
              strength: damageLevel >= 3 ? 'low' : 'medium',
              ph_range: '2.5-3.5',
              description: 'Oxidizing developer',
              risk_level: damageLevel >= 3 ? 0 : 1,
              suitable_damage_max: 5,
            },
            role: 'Developer (Oxidizer)',
            mix_ratio: 'See primary agent ratio',
            reason: 'Volume adjusted for damage level',
          },
          {
            agent: {
              id: 'agent-treat',
              name: 'OLAPLEX No.1 Bond Multiplier',
              type: 'treatment',
              strength: 'low',
              ph_range: '3.0-4.0',
              description: 'Bond protection treatment',
              risk_level: 0,
              suitable_damage_max: 5,
            },
            role: 'Bond Protection',
            mix_ratio: '1.5ml per 30g',
            reason: 'Protect bonds during processing',
          },
        ],
        processing_time_minutes: Math.round((targetTreatment === 'bleach' ? 45 : targetTreatment === 'perm' ? 20 : 35) * (hairLength === 'long' ? 1.2 : hairLength === 'short' ? 0.7 : 1)),
        risk_score: Math.round(riskScore * 10) / 10,
        risk_factors: [
          ...(damageLevel >= 3 ? ['Moderate to high damage level'] : []),
          ...(bleachCount >= 2 ? ['Multiple bleach history'] : []),
          ...(hasStraightening && targetTreatment === 'perm' ? ['Straightening + Perm combination — HIGH RISK'] : []),
          ...(permCount >= 5 ? ['5+ perm treatments — structural concern'] : []),
          ...(hasBlackDye ? ['Black dye history — may cause uneven results'] : []),
        ],
        warnings: [
          ...(hasStraightening && targetTreatment === 'perm'
            ? ['CRITICAL: Straightened hair + perm is extremely high risk. Recommend strand test before proceeding.']
            : []),
        ],
        pre_treatments: [
          ...(damageLevel >= 3 ? ['CMC (Ceramide) pre-treatment'] : []),
          ...(damageLevel >= 2 ? ['OLAPLEX No.0 or equivalent bond reinforcement (5 min)'] : []),
        ],
        post_treatments: [
          'pH-balancing acid rinse',
          'Moisturizing treatment mask — 5-10 min',
          ...(damageLevel >= 2 ? ['OLAPLEX No.2 Bond Perfector — 10 min after rinse'] : []),
        ],
        alkaline_acidic_ratio: {
          alkaline_percent: damageLevel >= 4 ? 20 : damageLevel >= 3 ? 40 : 60,
          acidic_percent: damageLevel >= 4 ? 80 : damageLevel >= 3 ? 60 : 40,
        },
        created_at: new Date().toISOString(),
      };
      setResult(mockResult);
      setIsCalculating(false);
    }, 1500);
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return '#10B981';
    if (score <= 6) return '#F59E0B';
    return '#EF4444';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return 'LOW';
    if (score <= 6) return 'MODERATE';
    return 'HIGH';
  };

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: '960px' }}>
        {/* Header */}
        <button
          className="btn btn-ghost"
          onClick={() => navigate(bookingId ? `/stylist/recipe/${bookingId}` : '/stylist/dashboard')}
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          <ChevronLeft size={18} />
          戻る
        </button>

        <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-accent), #0891B2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
          }}>
            <Beaker size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
              AI薬剤計算
            </h1>
            <p className="text-secondary text-sm">
              髪の状態に基づき、最適な薬剤処方をAIが提案します
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-lg">
          {/* Input Form */}
          <div className="glass-card-static">
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
              髪の状態入力
            </h3>

            <div className="flex flex-col gap-lg">
              {/* Treatment Type */}
              <div className="form-group">
                <label className="form-label">施術タイプ</label>
                <div className="flex gap-sm">
                  {TREATMENT_TYPES.map(t => (
                    <button
                      key={t.id}
                      className={`btn ${targetTreatment === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => setTargetTreatment(t.id)}
                      style={{ flex: 1 }}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Tone (for color/bleach) */}
              {targetTreatment !== 'perm' && (
                <div className="form-group">
                  <label className="form-label">ターゲットトーン</label>
                  <div className="flex gap-xs flex-wrap">
                    {TONE_OPTIONS.map(t => (
                      <button
                        key={t.id}
                        className={`chip ${targetTone === t.id ? 'chip-active' : ''}`}
                        onClick={() => setTargetTone(t.id)}
                        style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Damage Level */}
              <div className="form-group">
                <label className="form-label">ダメージレベル: {damageLevel}/5</label>
                <input
                  type="range"
                  min="1" max="5" step="1"
                  value={damageLevel}
                  onChange={(e) => setDamageLevel(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>軽い</span><span>重い</span>
                </div>
              </div>

              {/* Bleach Count */}
              <div className="form-group">
                <label className="form-label">ブリーチ回数</label>
                <div className="flex gap-xs flex-wrap">
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      className={`chip ${bleachCount === n ? 'chip-active' : ''}`}
                      onClick={() => setBleachCount(n)}
                      style={{ cursor: 'pointer' }}
                    >
                      {n === 0 ? 'なし' : n === 5 ? '5+' : `${n}回`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Length */}
              <div className="form-group">
                <label className="form-label">髪の長さ</label>
                <div className="flex gap-xs flex-wrap">
                  {LENGTH_OPTIONS.map(l => (
                    <button
                      key={l.id}
                      className={`chip ${hairLength === l.id ? 'chip-active' : ''}`}
                      onClick={() => setHairLength(l.id)}
                      style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boolean toggles */}
              <div className="flex flex-col gap-sm">
                {[
                  { label: '縮毛矯正の履歴', value: hasStraightening, set: setHasStraightening },
                  { label: 'パーマの履歴', value: hasPerm, set: setHasPerm },
                  { label: '黒染めの履歴', value: hasBlackDye, set: setHasBlackDye },
                ].map(item => (
                  <label key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                    <input
                      type="checkbox"
                      checked={item.value}
                      onChange={e => item.set(e.target.checked)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>

              {/* Perm count (if perm history) */}
              {hasPerm && (
                <div className="form-group animate-fade-in-up">
                  <label className="form-label">パーマ回数</label>
                  <div className="flex gap-xs flex-wrap">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <button
                        key={n}
                        className={`chip ${permCount === n ? 'chip-active' : ''}`}
                        onClick={() => setPermCount(n)}
                        style={{ cursor: 'pointer' }}
                      >
                        {n === 6 ? '6+' : `${n}回`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleCalculate}
                disabled={isCalculating}
                style={{ marginTop: 'var(--space-sm)' }}
              >
                {isCalculating ? (
                  <><RefreshCw size={18} className="animate-spin" /> 計算中...</>
                ) : (
                  <><Sparkles size={18} /> AI薬剤計算を実行</>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-lg">
            {!result && !isCalculating && (
              <div className="glass-card-static flex flex-col items-center justify-center" style={{ flex: 1, textAlign: 'center', color: 'var(--text-muted)', minHeight: '400px' }}>
                <Beaker size={48} style={{ opacity: 0.2, marginBottom: 'var(--space-md)' }} />
                <p>左のフォームを入力して<br />「AI薬剤計算を実行」をクリック</p>
              </div>
            )}

            {isCalculating && (
              <div className="glass-card-static flex flex-col items-center justify-center" style={{ flex: 1, textAlign: 'center', minHeight: '400px' }}>
                <div className="pulse-animation" style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-accent), #0891B2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 'var(--space-lg)',
                  boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
                }}>
                  <Beaker size={28} color="white" />
                </div>
                <h3 style={{ fontWeight: 700 }}>AIが最適処方を計算中...</h3>
                <p className="text-secondary text-sm">ダメージレベル・履歴・施術内容を照合しています</p>
              </div>
            )}

            {result && !isCalculating && (
              <>
                {/* Risk Score */}
                <div className="glass-card-static animate-fade-in-up">
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={20} />
                      リスク評価
                    </h3>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)', fontWeight: 800,
                      color: getRiskColor(result.risk_score),
                    }}>
                      {result.risk_score}/10
                    </div>
                  </div>

                  {/* Risk bar */}
                  <div style={{
                    height: '8px', borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)', overflow: 'hidden',
                    marginBottom: 'var(--space-md)',
                  }}>
                    <div style={{
                      height: '100%', width: `${result.risk_score * 10}%`,
                      background: `linear-gradient(90deg, #10B981, ${getRiskColor(result.risk_score)})`,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>

                  <span className="badge" style={{
                    background: `${getRiskColor(result.risk_score)}20`,
                    color: getRiskColor(result.risk_score),
                    padding: '0.25rem 0.75rem',
                  }}>
                    {getRiskLabel(result.risk_score)} RISK
                  </span>

                  {/* Warnings */}
                  {result.warnings.length > 0 && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      {result.warnings.map((w, i) => (
                        <div key={i} style={{
                          padding: 'var(--space-sm) var(--space-md)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--font-size-xs)',
                          color: '#F87171',
                          display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start',
                        }}>
                          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                          {w}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Risk factors */}
                  {result.risk_factors.length > 0 && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      <span className="text-xs text-secondary" style={{ fontWeight: 600 }}>リスク要因:</span>
                      <ul style={{ margin: 'var(--space-xs) 0 0 var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {result.risk_factors.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Alkaline/Acidic Ratio */}
                <div className="glass-card-static animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Beaker size={16} />
                    アルカリ／酸性 バランス
                  </h3>
                  <div style={{
                    height: '24px', borderRadius: 'var(--radius-full)', overflow: 'hidden',
                    display: 'flex', marginBottom: 'var(--space-sm)',
                  }}>
                    <div style={{
                      width: `${result.alkaline_acidic_ratio.alkaline_percent}%`,
                      background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700, color: 'white',
                    }}>
                      {result.alkaline_acidic_ratio.alkaline_percent}%
                    </div>
                    <div style={{
                      width: `${result.alkaline_acidic_ratio.acidic_percent}%`,
                      background: 'linear-gradient(90deg, #06B6D4, #22D3EE)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700, color: 'white',
                    }}>
                      {result.alkaline_acidic_ratio.acidic_percent}%
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--color-primary-light)' }}>🔹 アルカリ</span>
                    <span style={{ color: 'var(--color-accent-light)' }}>🔸 酸性・ケア</span>
                  </div>
                </div>

                {/* Recommended Agents */}
                <div className="glass-card-static animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>推奨薬剤</h3>
                    <span className="flex items-center gap-xs text-xs text-secondary">
                      <Clock size={12} />
                      推定 {result.processing_time_minutes}分
                    </span>
                  </div>

                  <div className="flex flex-col gap-sm">
                    {result.recommended_agents.map((entry, i) => (
                      <div key={i} style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xs)' }}>
                          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{entry.agent.name}</span>
                          <span className="chip chip-cyan" style={{ fontSize: '0.6rem' }}>{entry.agent.ph_range}</span>
                        </div>
                        <div className="flex items-center gap-sm text-xs" style={{ marginBottom: 'var(--space-xs)' }}>
                          <span className="chip" style={{ fontSize: '0.6rem' }}>{entry.role}</span>
                          <span className="text-muted">{entry.mix_ratio}</span>
                        </div>
                        <p className="text-xs text-secondary">{entry.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pre/Post Treatments */}
                <div className="glass-card-static animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                    前後処理
                  </h3>
                  {result.pre_treatments.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                      <span className="text-xs" style={{ fontWeight: 600, color: '#10B981' }}>前処理:</span>
                      <ul style={{ margin: 'var(--space-xs) 0 0 var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {result.pre_treatments.map((t, i) => (
                          <li key={i} className="flex items-center gap-xs">
                            <CheckCircle2 size={10} style={{ color: '#10B981' }} />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <span className="text-xs" style={{ fontWeight: 600, color: 'var(--color-accent-light)' }}>後処理:</span>
                    <ul style={{ margin: 'var(--space-xs) 0 0 var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                      {result.post_treatments.map((t, i) => (
                        <li key={i} className="flex items-center gap-xs">
                          <CheckCircle2 size={10} style={{ color: 'var(--color-accent-light)' }} />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Disclaimer */}
                <div className="ai-disclaimer" style={{ fontSize: 'var(--font-size-xs)' }}>
                  ⚠️ このレシピはAIが生成した参考情報です。最終的な薬剤選定は美容師の専門的な判断に基づいて行ってください。
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
