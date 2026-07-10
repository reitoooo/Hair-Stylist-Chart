import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, AlertTriangle, Shield } from 'lucide-react';
import type { QuestionnaireData, HairLength, AllergyChecklistData } from '../../types';
import { HAIR_LENGTH_LABELS, DAMAGE_LEVEL_LABELS, STRAIGHTENING_DATE_OPTIONS, PERM_DATE_OPTIONS, BLACK_DYE_DATE_OPTIONS, SALON_VIBE_OPTIONS } from '../../types';

const PRESET_COLORS = [
  // Row 1: Light
  '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc', '#d7ccc8', '#f5f5f5',
  // Row 2: Mid Light
  '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775', '#fff176', '#ffd54f', '#ffb74d', '#ff8a65', '#a1887f', '#e0e0e0',
  // Row 3: Vivid
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e',
  // Row 4: Dark
  '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#1976d2', '#0288d1', '#0097a7', '#00796b', '#388e3c', '#689f38', '#afb42b', '#fbc02d', '#ffa000', '#f57c00', '#e64a19', '#5d4037', '#616161',
  // Row 5: Deep Dark
  '#b71c1c', '#880e4f', '#4a148c', '#311b92', '#1a237e', '#0d47a1', '#01579b', '#006064', '#004d40', '#1b5e20', '#33691e', '#827717', '#f57f17', '#ff6f00', '#e65100', '#bf360c', '#3e2723', '#212121',
];

const checkNeedsBleach = (hexString: string) => {
  if (!hexString) return false;
  const hexes = hexString.split(',');
  
  for (const hex of hexes) {
    if (!hex.startsWith('#')) continue;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    // If ANY of the selected colors needs bleach, return true
    if (l > 0.55 || (s > 0.5 && l > 0.35)) return true;
  }
  return false;
};

const INITIAL_DATA: QuestionnaireData = {
  hair_length: 'medium',
  has_bleach: 'no',
  bleach_count: 0,
  has_black_dye: 'no',
  has_straightening: 'no',
  has_perm: 'no',
  current_hair_color: '',
  damage_level: 1,
  additional_notes: '',
  target_color: '',
  wants_design_color: false,
  // Expanded fields
  straightening_date: '',
  straightening_count: 0,
  perm_date: '',
  perm_count: 0,
  perm_count_over_5: false,
  previous_chemicals: '',
  perm_feasibility_notes: '',
  black_dye_count: 0,
  black_dye_date: '',
  salon_vibe: '気にしない・美容師におまかせ',
  hair_type: 'normal',
};

const INITIAL_ALLERGY: AllergyChecklistData = {
  questionnaire_id: '',
  has_skin_trouble: false,
  skin_trouble_detail: '',
  has_allergy: false,
  allergy_detail: '',
  has_patch_test: false,
  patch_test_result: '',
  has_scalp_sensitivity: false,
  has_previous_reaction: false,
  previous_reaction_detail: '',
  consent_acknowledged: false,
};

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuestionnaireData>(INITIAL_DATA);
  const [allergyData, setAllergyData] = useState<AllergyChecklistData>(INITIAL_ALLERGY);

  const steps = [
    { label: '髪の長さ', key: 'length' },
    { label: '施術履歴', key: 'history' },
    { label: '詳細履歴', key: 'detail_history' },
    { label: '現在の状態', key: 'condition' },
    { label: '希望のカラー', key: 'target_color' },
    { label: 'アレルギー', key: 'allergy' },
    { label: '過ごし方', key: 'vibe' },
    { label: '確認', key: 'confirm' },
  ];

  const hasAllergyRisk = allergyData.has_skin_trouble || allergyData.has_allergy ||
    allergyData.has_scalp_sensitivity || allergyData.has_previous_reaction;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      const qId = `q-${Date.now()}`;
      localStorage.setItem('questionnaire', JSON.stringify({ ...data, id: qId }));
      localStorage.setItem('allergyChecklist', JSON.stringify({ ...allergyData, questionnaire_id: qId }));
      navigate('/style-choice');
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 0:
        return data.hair_length !== ('' as any);
      case 1:
        return data.has_bleach !== ('' as any) &&
               data.has_black_dye !== ('' as any) && 
               data.has_straightening !== ('' as any) && 
               data.has_perm !== ('' as any);
      case 2:
        let valid = true;
        if (data.has_bleach === 'yes') {
          if (data.bleach_count <= 0 && data.bleach_count !== -1) valid = false;
        }
        if (data.has_black_dye === 'yes') {
          if (!data.black_dye_date || (data.black_dye_count <= 0 && data.black_dye_count !== -1)) valid = false;
        }
        if (data.has_straightening === 'yes') {
          if (!data.straightening_date || (data.straightening_count <= 0 && data.straightening_count !== -1)) valid = false;
        }
        if (data.has_perm === 'yes') {
          if (!data.perm_date || (data.perm_count <= 0 && data.perm_count !== -1)) valid = false;
        }
        return valid;
      case 3:
        return data.current_hair_color !== '' && data.damage_level !== -1 && data.hair_type !== ('' as any);
      case 4:
        return data.target_color !== '';
      case 5:
        return allergyData.consent_acknowledged;
      case 6:
        return data.salon_vibe !== ('' as any);
      default:
        return true;
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate('/');
  };

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container container-sm" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
        {/* Step Indicator */}
        <div className="step-indicator">
          {steps.map((s, i) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`step ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
                <div className="step-number">
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`step-connector ${i < step ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div
          className="glass-card-static animate-fade-in-up"
          style={{ marginTop: 'var(--space-xl)', minHeight: '400px' }}
          key={step}
        >
          {/* Step 0: Hair Length */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                現在の髪の長さは？
              </h2>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
                一番近いものを選んでください
              </p>

              <div className="grid grid-cols-2 gap-md mt-sm">
                {(Object.entries(HAIR_LENGTH_LABELS) as [HairLength, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    className={`btn ${data.hair_length === key ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setData({ ...data, hair_length: key })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Treatment History (Basic) */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                直近1〜2年の施術履歴
              </h2>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
                当てはまるものをすべて選んでください
              </p>

              <div className="flex flex-col gap-lg">
                {/* Boolean toggles */}
                {[
                  { key: 'has_bleach' as const, label: 'ブリーチの履歴（過去1〜2年以内）' },
                  { key: 'has_black_dye' as const, label: '黒染め（暗染め含む）の履歴' },
                  { key: 'has_straightening' as const, label: '縮毛矯正の履歴' },
                  { key: 'has_perm' as const, label: 'パーマの履歴' },
                ].map((item) => (
                  <div key={item.key} className="form-group">
                    <label className="form-label">{item.label}</label>
                    <div className="flex gap-sm">
                      <button
                        className={`chip ${data[item.key] === 'yes' ? 'chip-active' : ''}`}
                        onClick={() => setData({ ...data, [item.key]: 'yes' })}
                        style={{ cursor: 'pointer', padding: '0.5rem 1.5rem' }}
                      >
                        あり
                      </button>
                      <button
                        className={`chip ${data[item.key] === 'no' ? 'chip-active' : ''}`}
                        onClick={() => setData({ ...data, [item.key]: 'no' })}
                        style={{ cursor: 'pointer', padding: '0.5rem 1.5rem' }}
                      >
                        なし
                      </button>
                      <button
                        className={`chip ${data[item.key] === 'unknown' ? 'chip-active' : ''}`}
                        onClick={() => setData({ ...data, [item.key]: 'unknown' })}
                        style={{ cursor: 'pointer', padding: '0.5rem 1.5rem' }}
                      >
                        わからない
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Detailed History */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-sm">詳細な履歴</h2>
              <p className="text-secondary mb-xl">より正確な提案のため、可能な範囲でお答えください</p>

              <div className="flex flex-col gap-lg">
                {/* Bleach details */}
                {data.has_bleach === 'yes' && (
                  <div style={{
                    padding: 'var(--space-lg)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                  }}>
                    <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-accent-light)' }}>
                      ブリーチの詳細
                    </h4>
                    <div className="flex flex-col gap-md">
                      <div className="form-group">
                        <label className="form-label">おおよその施術回数</label>
                        <div className="flex gap-sm flex-wrap">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              className={`chip ${(n === 5 ? data.bleach_count >= 5 : data.bleach_count === n) ? 'chip-active' : ''}`}
                              onClick={() => setData({ ...data, bleach_count: n })}
                              style={{ cursor: 'pointer', fontSize: 'var(--font-size-sm)', padding: '0.5rem 1rem' }}
                            >
                              {n === 5 ? '5回以上' : `${n}回`}
                            </button>
                          ))}
                          <button
                            className={`chip ${data.bleach_count === -1 ? 'chip-active' : ''}`}
                            onClick={() => setData({ ...data, bleach_count: -1 })}
                            style={{ cursor: 'pointer', fontSize: 'var(--font-size-sm)', padding: '0.5rem 1rem' }}
                          >
                            わからない
                          </button>
                        </div>
                        {data.bleach_count >= 5 && (
                          <div className="flex items-center gap-sm animate-fade-in-up" style={{ marginTop: 'var(--space-sm)' }}>
                            <span className="text-secondary text-sm">詳細な回数：</span>
                            <input
                              type="number"
                              min="5"
                              max="20"
                              className="form-input"
                              style={{ width: '100px', padding: '0.375rem 0.75rem' }}
                              value={data.bleach_count}
                              onChange={(e) => {
                                const val = Math.max(5, Math.min(20, parseInt(e.target.value) || 5));
                                setData({ ...data, bleach_count: val });
                              }}
                            />
                            <span className="text-secondary text-sm">回</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Black Dye details */}
                {data.has_black_dye === 'yes' && (
                  <div style={{
                    padding: 'var(--space-lg)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                  }}>
                    <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-accent-light)' }}>
                      黒染め（暗染め含む）の詳細
                    </h4>
                    <div className="flex flex-col gap-md">
                      <div className="form-group">
                        <label className="form-label">最後に施術した時期</label>
                        <select
                          className="form-input form-select"
                          value={data.black_dye_date}
                          onChange={(e) => setData({ ...data, black_dye_date: e.target.value })}
                        >
                          {BLACK_DYE_DATE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">おおよその施術回数</label>
                        <div className="flex gap-sm flex-wrap">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              className={`chip ${(n === 5 ? data.black_dye_count >= 5 : data.black_dye_count === n) ? 'chip-active' : ''}`}
                              onClick={() => setData({ ...data, black_dye_count: n })}
                              style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                            >
                              {n === 5 ? '5回以上' : `${n}回`}
                            </button>
                          ))}
                          <button
                            className={`chip ${data.black_dye_count === -1 ? 'chip-active' : ''}`}
                            onClick={() => setData({ ...data, black_dye_count: -1 })}
                            style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                          >
                            わからない
                          </button>
                        </div>
                        {data.black_dye_count > 0 && (
                          <div className="flex items-center gap-sm" style={{
                            marginTop: 'var(--space-sm)',
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-xs)',
                            color: '#FBBF24',
                          }}>
                            <AlertTriangle size={14} />
                            黒染めの色素は髪に長く残るため、ご希望のカラー（特に明るい色）にするにはブリーチ等の追加施術が必要になる可能性が高いです。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Straightening details */}
                {data.has_straightening === 'yes' && (
                  <div style={{
                    padding: 'var(--space-lg)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                  }}>
                    <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-accent-light)' }}>
                      縮毛矯正の詳細
                    </h4>
                    <div className="flex flex-col gap-md">
                      <div className="form-group">
                        <label className="form-label">最後に施術した時期</label>
                        <select
                          className="form-input form-select"
                          value={data.straightening_date}
                          onChange={(e) => setData({ ...data, straightening_date: e.target.value })}
                        >
                          {STRAIGHTENING_DATE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">施術回数（これまでの合計）</label>
                        <div className="flex gap-sm flex-wrap">
                          {[1, 2, 3, 4, 5, 6].map(n => (
                            <button
                              key={n}
                              className={`chip ${(n === 6 ? data.straightening_count >= 6 : data.straightening_count === n) ? 'chip-active' : ''}`}
                              onClick={() => setData({ ...data, straightening_count: n })}
                              style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                            >
                              {n === 6 ? '6回以上' : `${n}回`}
                            </button>
                          ))}
                          <button
                            className={`chip ${data.straightening_count === -1 ? 'chip-active' : ''}`}
                            onClick={() => setData({ ...data, straightening_count: -1 })}
                            style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                          >
                            わからない
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Perm details */}
                {data.has_perm === 'yes' && (
                  <div style={{
                    padding: 'var(--space-lg)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                  }}>
                    <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--color-accent-light)' }}>
                      パーマの詳細
                    </h4>
                    <div className="flex flex-col gap-md">
                      <div className="form-group">
                        <label className="form-label">最後に施術した時期</label>
                        <select
                          className="form-input form-select"
                          value={data.perm_date}
                          onChange={(e) => setData({ ...data, perm_date: e.target.value })}
                        >
                          {PERM_DATE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">施術回数（これまでの合計）</label>
                        <div className="flex gap-sm flex-wrap">
                          {[1, 2, 3, 4, 5, 6].map(n => (
                            <button
                              key={n}
                              className={`chip ${data.perm_count === n ? 'chip-active' : ''} ${n >= 5 ? 'chip-warning' : ''}`}
                              onClick={() => setData({
                                ...data,
                                perm_count: n,
                                perm_count_over_5: n >= 5,
                              })}
                              style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                            >
                              {n === 6 ? '6回以上' : `${n}回`}
                            </button>
                          ))}
                          <button
                            className={`chip ${data.perm_count === -1 ? 'chip-active' : ''}`}
                            onClick={() => setData({ ...data, perm_count: -1 })}
                            style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                          >
                            わからない
                          </button>
                        </div>
                        {data.perm_count_over_5 && (
                          <div className="flex items-center gap-sm" style={{
                            marginTop: 'var(--space-sm)',
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-xs)',
                            color: '#FBBF24',
                          }}>
                            <AlertTriangle size={14} />
                            パーマ5回以上の場合、髪の構造が弱っている可能性があります。施術時に美容師と相談してください。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Previous chemicals */}
                <div className="form-group">
                  <label className="form-label">前回の施術で使用された薬剤（わかる範囲で）</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="例: THROW カラー、OLAPLEXトリートメント、縮毛矯正はサイステアミン系 など"
                    value={data.previous_chemicals}
                    onChange={(e) => setData({ ...data, previous_chemicals: e.target.value })}
                    style={{ minHeight: '80px' }}
                  />
                  <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                    ※ わからない場合は空欄で構いません
                  </span>
                </div>

                {data.has_bleach !== 'yes' && data.has_black_dye !== 'yes' && data.has_straightening !== 'yes' && data.has_perm !== 'yes' && (
                  <div className="text-center text-secondary py-xl">
                    <p>ブリーチ・黒染め・縮毛矯正・パーマの履歴がないため、詳細な回数や時期の入力は不要です。</p>
                    <p className="text-sm mt-sm">前回使用された薬剤がわかる場合のみご記入いただき、次へお進みください。</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Current Condition */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                現在の髪の状態
              </h2>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
                今の髪色、ダメージの程度、髪質、デザインカラーの希望を教えてください
              </p>

              <div className="flex flex-col gap-lg">
                <div className="form-group">
                  <label className="form-label">髪質</label>
                  <div className="flex gap-sm">
                    {[
                      { value: 'soft', label: '軟毛（細くてやわらかい）' },
                      { value: 'normal', label: '普通' },
                      { value: 'hard', label: '硬毛（太くて硬い）' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        className={`chip ${data.hair_type === opt.value ? 'chip-active' : ''}`}
                        onClick={() => setData({ ...data, hair_type: opt.value as 'soft' | 'normal' | 'hard' })}
                        style={{ cursor: 'pointer', padding: '0.5rem 1rem', flex: 1 }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">デザインカラーの希望</label>
                  <div className="flex gap-sm">
                    <button
                      className={`chip ${data.wants_design_color ? 'chip-active' : ''}`}
                      onClick={() => setData({ ...data, wants_design_color: true })}
                      style={{ cursor: 'pointer', padding: '0.5rem 1rem', flex: 1 }}
                    >
                      あり（ハイライト、インナーなど）
                    </button>
                    <button
                      className={`chip ${!data.wants_design_color ? 'chip-active' : ''}`}
                      onClick={() => setData({ ...data, wants_design_color: false })}
                      style={{ cursor: 'pointer', padding: '0.5rem 1rem', flex: 1 }}
                    >
                      なし（全体カラーのみ）
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">現在の髪色</label>
                  <p className="text-secondary text-xs" style={{ marginBottom: 'var(--space-sm)' }}>
                    カラーパレットから選ぶか、カラーピッカーで詳細に指定できます
                  </p>
                  
                  {/* Visual Grid Palette */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: '2px', marginBottom: 'var(--space-md)' }}>
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setData({ ...data, current_hair_color: color })}
                        style={{
                          aspectRatio: '1/1',
                          width: '100%',
                          background: color,
                          border: data.current_hair_color === color ? '2px solid white' : 'none',
                          boxShadow: data.current_hair_color === color ? '0 0 0 2px var(--color-primary)' : 'none',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          transform: data.current_hair_color === color ? 'scale(1.2)' : 'scale(1)',
                          zIndex: data.current_hair_color === color ? 10 : 1,
                          transition: 'transform 0.1s'
                        }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-md" style={{ marginTop: 'var(--space-md)' }}>
                    {/* Native Color Picker (Wheel/Spectrum) */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: 'var(--space-sm)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', width: 'fit-content' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: data.current_hair_color?.startsWith('#') ? data.current_hair_color : 'transparent',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        border: '2px solid rgba(255,255,255,0.8)'
                      }} />
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>カラーピッカーで詳細に選択</span>
                      <input
                        type="color"
                        value={data.current_hair_color?.startsWith('#') ? data.current_hair_color : '#333333'}
                        onChange={(e) => setData({ ...data, current_hair_color: e.target.value })}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                    </label>

                    {/* Don't know button */}
                    <button
                      type="button"
                      onClick={() => setData({ ...data, current_hair_color: 'consult' })}
                      className={`btn ${data.current_hair_color === 'consult' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: 'var(--space-sm) var(--space-lg)' }}
                    >
                      わからない
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">ダメージレベル（自己評価）</label>
                  <div className="flex flex-col gap-sm">
                    {Object.entries(DAMAGE_LEVEL_LABELS).map(([level, label]) => (
                      <button
                        key={level}
                        className={`btn ${data.damage_level === Number(level) ? 'btn-primary' : 'btn-secondary'} btn-full`}
                        onClick={() => setData({ ...data, damage_level: Number(level) })}
                        style={{
                          justifyContent: 'flex-start',
                          padding: '0.875rem 1.25rem',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        <span
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: data.damage_level === Number(level) ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {level}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Target Color (NEW) */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                希望の髪色
              </h2>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
                パレットから選ぶか、カラーピッカー（グラデーションやサークル）で詳細な色を指定できます
              </p>

              <div className="flex flex-col gap-lg">
                <div className="form-group">
                  <label className="form-label">理想の髪色</label>
                  
                  <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={data.wants_design_color}
                        onChange={(e) => {
                          const isDesign = e.target.checked;
                          setData({
                            ...data,
                            wants_design_color: isDesign,
                            target_color: isDesign ? data.target_color : (data.target_color ? data.target_color.split(',')[0] : '')
                          });
                        }}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>インナーカラーやハイライトなど、デザインカラー（複数色）を希望する</span>
                    </label>
                  </div>

                  {data.target_color && (
                    <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                      <span className="text-secondary text-sm">選択中のカラー:</span>
                      {data.target_color.split(',').map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.2)' }} />
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{c}</span>
                          {data.wants_design_color && (
                            <button
                              onClick={() => {
                                const newColors = data.target_color.split(',').filter(hc => hc !== c);
                                setData({ ...data, target_color: newColors.join(',') });
                              }}
                              style={{ marginLeft: '4px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '10px' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Visual Grid Palette */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: '2px', marginBottom: 'var(--space-md)' }}>
                    {PRESET_COLORS.map(color => {
                      const isSelected = data.target_color ? data.target_color.split(',').includes(color) : false;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            if (data.wants_design_color) {
                              const currentColors = data.target_color ? data.target_color.split(',') : [];
                              if (isSelected) {
                                setData({ ...data, target_color: currentColors.filter(c => c !== color).join(',') });
                              } else if (currentColors.length < 3) {
                                setData({ ...data, target_color: [...currentColors, color].join(',') });
                              }
                            } else {
                              setData({ ...data, target_color: color });
                            }
                          }}
                          style={{
                            aspectRatio: '1/1',
                            width: '100%',
                            background: color,
                            border: isSelected ? '2px solid white' : 'none',
                            boxShadow: isSelected ? '0 0 0 2px var(--color-primary)' : 'none',
                            cursor: 'pointer',
                            borderRadius: '2px',
                            transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                            zIndex: isSelected ? 10 : 1,
                            transition: 'transform 0.1s'
                          }}
                          aria-label={`Select target color ${color}`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
                    {/* Native Color Picker (Wheel/Spectrum) */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: 'var(--space-sm) var(--space-lg)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', width: 'fit-content' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        border: '2px solid rgba(255,255,255,0.8)'
                      }} />
                      <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>カラーピッカーで自由に選択</span>
                      <input
                        type="color"
                        value="#8C92AC"
                        onChange={(e) => {
                          const newColor = e.target.value;
                          if (data.wants_design_color) {
                            const currentColors = data.target_color ? data.target_color.split(',').filter(c => c !== 'consult') : [];
                            if (!currentColors.includes(newColor) && currentColors.length < 3) {
                              setData({ ...data, target_color: [...currentColors, newColor].join(',') });
                            }
                          } else {
                            setData({ ...data, target_color: newColor });
                          }
                        }}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                    </label>

                    {/* Consult button */}
                    <button
                      type="button"
                      onClick={() => setData({ ...data, target_color: 'consult' })}
                      className={`btn ${data.target_color === 'consult' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: 'var(--space-sm) var(--space-lg)', height: '66px' }}
                    >
                      相談して決めたい
                    </button>

                    {data.target_color && checkNeedsBleach(data.target_color) && (
                      <span className="animate-fade-in" style={{ fontSize: '0.75rem', color: '#FBBF24', background: 'rgba(251, 191, 36, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                        ⚠️ 要ブリーチ（ハイトーン・高彩度）
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Allergy & Risk Check */}
          {step === 5 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={24} style={{ color: 'var(--color-accent-light)' }} />
                アレルギー・リスクチェック
              </h2>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
                薬剤による事故を防ぐため、以下の項目をお答えください
              </p>

              <div className="flex flex-col gap-lg">
                {[
                  { key: 'has_skin_trouble' as const, label: '肌トラブル（かぶれ・湿疹等）の経験', detailKey: 'skin_trouble_detail' as const, detailPlaceholder: '例: カラー剤でかぶれた、頭皮が赤くなった等' },
                  { key: 'has_allergy' as const, label: 'アレルギーの有無', detailKey: 'allergy_detail' as const, detailPlaceholder: '例: ジアミンアレルギー、金属アレルギー等' },
                  { key: 'has_scalp_sensitivity' as const, label: '頭皮の敏感さ', detailKey: null, detailPlaceholder: '' },
                  { key: 'has_previous_reaction' as const, label: '過去の薬剤による副反応', detailKey: 'previous_reaction_detail' as const, detailPlaceholder: '例: パーマ液で頭皮がヒリヒリした、カラー後に痒みが出た等' },
                ].map((item) => (
                  <div key={item.key} className="form-group">
                    <label className="form-label">{item.label}</label>
                    <div className="flex gap-sm">
                      <button
                        className={`chip ${allergyData[item.key] ? 'chip-active' : ''}`}
                        onClick={() => setAllergyData({ ...allergyData, [item.key]: true })}
                        style={{ cursor: 'pointer', padding: '0.5rem 1.5rem' }}
                      >
                        あり
                      </button>
                      <button
                        className={`chip ${!allergyData[item.key] ? 'chip-active' : ''}`}
                        onClick={() => setAllergyData({ ...allergyData, [item.key]: false })}
                        style={{ cursor: 'pointer', padding: '0.5rem 1.5rem' }}
                      >
                        なし
                      </button>
                    </div>
                    {allergyData[item.key] && item.detailKey && (
                      <input
                        type="text"
                        className="form-input animate-fade-in-up"
                        placeholder={item.detailPlaceholder}
                        value={allergyData[item.detailKey] as string}
                        onChange={(e) => setAllergyData({ ...allergyData, [item.detailKey!]: e.target.value })}
                        style={{ marginTop: 'var(--space-sm)' }}
                      />
                    )}
                  </div>
                ))}

                {/* Patch test */}
                <div className="form-group">
                  <label className="form-label">パッチテストの経験</label>
                  <div className="flex gap-sm">
                    <button
                      className={`chip ${allergyData.has_patch_test ? 'chip-active' : ''}`}
                      onClick={() => setAllergyData({ ...allergyData, has_patch_test: true })}
                      style={{ cursor: 'pointer', padding: '0.5rem 1.5rem' }}
                    >
                      あり
                    </button>
                    <button
                      className={`chip ${!allergyData.has_patch_test ? 'chip-active' : ''}`}
                      onClick={() => setAllergyData({ ...allergyData, has_patch_test: false })}
                      style={{ cursor: 'pointer', padding: '0.5rem 1.5rem' }}
                    >
                      なし
                    </button>
                  </div>
                  {allergyData.has_patch_test && (
                    <input
                      type="text"
                      className="form-input animate-fade-in-up"
                      placeholder="結果: 異常なし、軽い赤みあり、等"
                      value={allergyData.patch_test_result}
                      onChange={(e) => setAllergyData({ ...allergyData, patch_test_result: e.target.value })}
                      style={{ marginTop: 'var(--space-sm)' }}
                    />
                  )}
                </div>

                {/* Warning banner */}
                {hasAllergyRisk && (
                  <div className="animate-fade-in-up" style={{
                    padding: 'var(--space-md)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    gap: 'var(--space-sm)',
                    alignItems: 'flex-start',
                  }}>
                    <AlertTriangle size={18} style={{ color: '#F87171', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: 'var(--font-size-sm)', color: '#F87171' }}>
                      <strong>リスク要因が検出されました。</strong>
                      <br />
                      施術前にパッチテストの実施を強くおすすめします。この情報は担当の美容師にのみ共有され、安全な施術計画に活用されます。
                    </div>
                  </div>
                )}

                {/* Consent */}
                <div style={{
                  padding: 'var(--space-md)',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={allergyData.consent_acknowledged}
                      onChange={(e) => setAllergyData({ ...allergyData, consent_acknowledged: e.target.checked })}
                      style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }}
                    />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      上記の内容に回答しました。施術に関するリスクを理解し、アレルギー情報が担当美容師と共有されることに同意します。
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Salon Vibe */}
          {step === 6 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                サロンでの過ごし方のご希望
              </h2>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
                美容室での時間をどのように過ごしたいか教えてください
              </p>

              <div className="flex flex-col gap-sm">
                {SALON_VIBE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`btn ${data.salon_vibe === opt.value ? 'btn-primary' : 'btn-secondary'} btn-full`}
                    onClick={() => setData({ ...data, salon_vibe: opt.value })}
                    style={{
                      justifyContent: 'flex-start',
                      padding: '1rem 1.25rem',
                      fontSize: 'var(--font-size-md)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', marginRight: 'var(--space-sm)' }}>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Confirmation */}
          {step === 7 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                入力内容の確認
              </h2>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
                以下の内容で美容師に伝達されます
              </p>

              {/* Basic info */}
              <div style={{
                padding: 'var(--space-lg)',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-md)',
              }}>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                  基本情報
                </h4>
                <div className="flex flex-col gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <div className="flex justify-between">
                    <span className="text-secondary">髪の長さ</span>
                    <span>{HAIR_LENGTH_LABELS[data.hair_length]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">ブリーチ</span>
                    <span>
                      {data.has_bleach === 'yes'
                        ? `あり（${data.bleach_count === -1 ? '回数不明' : data.bleach_count >= 5 ? '5回以上' : `${data.bleach_count}回`}）`
                        : data.has_bleach === 'unknown'
                        ? 'わからない'
                        : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">黒染め</span>
                    <span>
                      {data.has_black_dye === 'yes'
                        ? `あり（${data.black_dye_count === -1 ? '回数不明' : data.black_dye_count >= 5 ? '5回以上' : `${data.black_dye_count}回`}${data.black_dye_date ? ` / 最終${BLACK_DYE_DATE_OPTIONS.find(o => o.value === data.black_dye_date)?.label || ''}` : ''}）`
                        : data.has_black_dye === 'unknown'
                        ? 'わからない'
                        : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">縮毛矯正</span>
                    <span>
                      {data.has_straightening === 'yes'
                        ? `あり（${data.straightening_count === -1 ? '回数不明' : data.straightening_count >= 6 ? '6回以上' : `${data.straightening_count}回`}${data.straightening_date ? ` / 最終${STRAIGHTENING_DATE_OPTIONS.find(o => o.value === data.straightening_date)?.label || ''}` : ''}）`
                        : data.has_straightening === 'unknown'
                        ? 'わからない'
                        : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">パーマ</span>
                    <span>
                      {data.has_perm === 'yes'
                        ? `あり（${data.perm_count === -1 ? '回数不明' : data.perm_count >= 6 ? '6回以上' : `${data.perm_count}回`}${data.perm_count_over_5 ? ' ⚠️' : ''}${data.perm_date ? ` / 最終${PERM_DATE_OPTIONS.find(o => o.value === data.perm_date)?.label || ''}` : ''}）`
                        : data.has_perm === 'unknown'
                        ? 'わからない'
                        : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">現在の髪色</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {data.current_hair_color === 'consult' ? (
                        <span style={{ fontSize: '0.8em', fontWeight: 600 }}>わからない</span>
                      ) : (
                        <>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: data.current_hair_color, border: '1px solid rgba(255,255,255,0.2)' }} />
                          <span style={{ textTransform: 'uppercase', fontSize: '0.8em' }}>{data.current_hair_color || '未入力'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">希望の髪色</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end', maxWidth: '60%' }}>
                      {data.target_color === 'consult' ? (
                        <span style={{ fontSize: '0.8em', fontWeight: 600 }}>相談して決めたい</span>
                      ) : data.target_color ? data.target_color.split(',').map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.2)' }} />
                          <span style={{ textTransform: 'uppercase', fontSize: '0.8em' }}>{c}</span>
                        </div>
                      )) : <span style={{ fontSize: '0.8em' }}>未入力</span>}
                    </div>
                  </div>
                  {data.wants_design_color && (
                    <div className="flex justify-between items-center">
                      <span className="text-secondary">デザインカラー</span>
                      <span style={{ fontSize: '0.8em', color: 'var(--color-primary-light)', fontWeight: 600 }}>希望する</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-secondary">ダメージ</span>
                    <span>{DAMAGE_LEVEL_LABELS[data.damage_level]}</span>
                  </div>
                  {data.previous_chemicals && (
                    <div className="flex justify-between">
                      <span className="text-secondary">前回の薬剤</span>
                      <span style={{ maxWidth: '200px', textAlign: 'right' }}>{data.previous_chemicals}</span>
                    </div>
                  )}
                  <div className="flex justify-between" style={{ marginTop: 'var(--space-xs)', paddingTop: 'var(--space-xs)', borderTop: '1px solid var(--border-default)' }}>
                    <span className="text-secondary">過ごし方のご希望</span>
                    <span style={{ maxWidth: '200px', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary-light)' }}>
                      {SALON_VIBE_OPTIONS.find(o => o.value === data.salon_vibe)?.label || data.salon_vibe}
                    </span>
                  </div>
                </div>
              </div>

              {/* Required Menu Proposal (NEW) */}
              {(data.target_color && data.target_color !== 'consult') && (
                <div className="animate-fade-in-up" style={{
                  padding: 'var(--space-md)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  marginBottom: 'var(--space-md)',
                }}>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: 'var(--space-sm)', color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ✨ AIメニュー診断
                  </h4>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {(() => {
                      const needsBleach = checkNeedsBleach(data.target_color);
                      const hasBlackDye = data.has_black_dye === 'yes';
                      const unknownBlackDye = data.has_black_dye === 'unknown';
                      
                      if (unknownBlackDye && needsBleach) {
                        return (
                          <p>ブリーチが必要なカラーですが、黒染め履歴が不明なため、当日の髪の状態によってはご希望に添えない、または「黒染め落とし」等の追加メニューが必要になる可能性があります。</p>
                        );
                      } else if (hasBlackDye && needsBleach) {
                        return (
                          <div>
                            <p style={{ marginBottom: '4px' }}>黒染め履歴があるため、希望の明るさ・鮮やかさにするには<strong>「黒染め落とし（またはブリーチ）＋カラー」</strong>が必要です。</p>
                            <p style={{ color: '#FBBF24', fontSize: 'var(--font-size-xs)' }}>※髪のダメージや抜け具合によっては、1回で希望色にならない場合があります。</p>
                          </div>
                        );
                      } else if (needsBleach) {
                        return (
                          <p>このカラーを実現するには<strong>「ブリーチ＋カラー（ダブルカラー）」</strong>が必要です。</p>
                        );
                      } else if (hasBlackDye && !needsBleach) {
                        return (
                          <p>黒染め履歴があるため、希望のカラーにする場合でも<strong>「ブリーチなしダブルカラー」や「明るめのカラー剤でのトーンアップ」</strong>が必要になる可能性があります。</p>
                        );
                      } else {
                        return (
                          <p>このカラーは<strong>「通常の全体カラー（ワンメイク）」</strong>で実現可能な可能性が高いです。</p>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Allergy info */}
              <div style={{
                padding: 'var(--space-lg)',
                background: hasAllergyRisk ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: hasAllergyRisk ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid var(--border-default)',
              }}>
                <h4 style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  marginBottom: 'var(--space-md)',
                  color: hasAllergyRisk ? '#F87171' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  {hasAllergyRisk && <AlertTriangle size={14} />}
                  アレルギー・リスク情報
                </h4>
                <div className="flex flex-col gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                  <div className="flex justify-between">
                    <span className="text-secondary">肌トラブル</span>
                    <span>{allergyData.has_skin_trouble ? `あり${allergyData.skin_trouble_detail ? `（${allergyData.skin_trouble_detail}）` : ''}` : 'なし'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">アレルギー</span>
                    <span>{allergyData.has_allergy ? `あり${allergyData.allergy_detail ? `（${allergyData.allergy_detail}）` : ''}` : 'なし'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">頭皮の敏感さ</span>
                    <span>{allergyData.has_scalp_sensitivity ? 'あり' : 'なし'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">過去の副反応</span>
                    <span>{allergyData.has_previous_reaction ? `あり${allergyData.previous_reaction_detail ? `（${allergyData.previous_reaction_detail}）` : ''}` : 'なし'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">パッチテスト</span>
                    <span>{allergyData.has_patch_test ? `実施済み${allergyData.patch_test_result ? `（${allergyData.patch_test_result}）` : ''}` : '未実施'}</span>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
                <label className="form-label">補足メモ（任意）</label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="例: 特定の薬剤にアレルギーがある、頭皮が敏感、前回の施術でトラブルがあった、など"
                  value={data.additional_notes}
                  onChange={(e) => setData({ ...data, additional_notes: e.target.value })}
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between" style={{ marginTop: 'var(--space-lg)' }}>
          <button className="btn btn-ghost" onClick={handleBack}>
            <ChevronLeft size={18} />
            戻る
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!canGoNext()}
            style={{ opacity: !canGoNext() ? 0.5 : 1 }}
          >
            {step === steps.length - 1 ? '次へ：スタイル選択' : '次へ'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
