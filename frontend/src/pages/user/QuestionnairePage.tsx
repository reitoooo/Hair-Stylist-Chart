import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, AlertTriangle, Shield } from 'lucide-react';
import type { QuestionnaireData, HairLength, AllergyChecklistData } from '../../types';
import { HAIR_LENGTH_LABELS, DAMAGE_LEVEL_LABELS, STRAIGHTENING_DATE_OPTIONS, PERM_DATE_OPTIONS, SALON_VIBE_OPTIONS } from '../../types';

const INITIAL_DATA: QuestionnaireData = {
  hair_length: 'medium',
  bleach_count: 0,
  has_black_dye: false,
  has_straightening: false,
  has_perm: false,
  current_hair_color: '',
  damage_level: 1,
  additional_notes: '',
  // Expanded fields
  straightening_date: '',
  straightening_count: 0,
  perm_date: '',
  perm_count: 0,
  perm_count_over_5: false,
  previous_chemicals: '',
  perm_feasibility_notes: '',
  black_dye_count: 0,
  salon_vibe: '気にしない・美容師におまかせ',
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
    { label: 'アレルギー', key: 'allergy' },
    { label: '過ごし方', key: 'vibe' },
    { label: '確認', key: 'confirm' },
  ];

  const hasAllergyRisk = allergyData.has_skin_trouble || allergyData.has_allergy ||
    allergyData.has_scalp_sensitivity || allergyData.has_previous_reaction;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const qId = `q-${Date.now()}`;
      localStorage.setItem('questionnaire', JSON.stringify({ ...data, id: qId }));
      localStorage.setItem('allergyChecklist', JSON.stringify({ ...allergyData, questionnaire_id: qId }));
      navigate('/style-choice');
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

              <div className="flex flex-col gap-sm">
                {(Object.entries(HAIR_LENGTH_LABELS) as [HairLength, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    className={`btn ${data.hair_length === key ? 'btn-primary' : 'btn-secondary'} btn-full`}
                    onClick={() => setData({ ...data, hair_length: key })}
                    style={{ justifyContent: 'flex-start', padding: '1rem 1.25rem', fontSize: 'var(--font-size-md)' }}
                  >
                    {data.hair_length === key && <Check size={18} />}
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
                {/* Bleach count */}
                <div className="form-group">
                  <label className="form-label">ブリーチ回数</label>
                  <div className="flex gap-sm flex-wrap">
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        className={`chip ${(n === 5 ? data.bleach_count >= 5 : data.bleach_count === n) ? 'chip-active' : ''}`}
                        onClick={() => setData({ ...data, bleach_count: n })}
                        style={{ cursor: 'pointer', fontSize: 'var(--font-size-sm)', padding: '0.5rem 1rem' }}
                      >
                        {n === 0 ? 'なし' : n === 5 ? '5回以上' : `${n}回`}
                      </button>
                    ))}
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

                {/* Boolean toggles */}
                {[
                  { key: 'has_black_dye' as const, label: '黒染め（暗染め含む）の履歴' },
                  { key: 'has_straightening' as const, label: '縮毛矯正の履歴' },
                  { key: 'has_perm' as const, label: 'パーマの履歴' },
                ].map((item) => (
                  <div key={item.key} className="form-group">
                    <label className="form-label">{item.label}</label>
                    <div className="flex gap-sm">
                      <button
                        className={`chip ${data[item.key] ? 'chip-active' : ''}`}
                        onClick={() => {
                          if (item.key === 'has_black_dye') {
                            setData({ ...data, has_black_dye: true, black_dye_count: data.black_dye_count || 1 });
                          } else {
                            setData({ ...data, [item.key]: true });
                          }
                        }}
                        style={{ cursor: 'pointer', padding: '0.5rem 1.5rem' }}
                      >
                        あり
                      </button>
                      <button
                        className={`chip ${!data[item.key] ? 'chip-active' : ''}`}
                        onClick={() => {
                          if (item.key === 'has_black_dye') {
                            setData({ ...data, has_black_dye: false, black_dye_count: 0 });
                          } else {
                            setData({ ...data, [item.key]: false });
                          }
                        }}
                        style={{ cursor: 'pointer', padding: '0.5rem 1.5rem' }}
                      >
                        なし
                      </button>
                    </div>
                    {item.key === 'has_black_dye' && data.has_black_dye && (
                      <div className="flex items-center gap-sm animate-fade-in-up" style={{ marginTop: 'var(--space-sm)' }}>
                        <span className="text-secondary text-sm">黒染めの回数：</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="form-input"
                          style={{ width: '100px', padding: '0.375rem 0.75rem' }}
                          value={data.black_dye_count || 1}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                            setData({ ...data, black_dye_count: val });
                          }}
                        />
                        <span className="text-secondary text-sm">回</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Detailed Treatment History (NEW) */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                詳細な施術履歴
              </h2>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-xl)' }}>
                より正確な診断のために、施術の詳細を教えてください（任意）
              </p>

              <div className="flex flex-col gap-lg">
                {/* Straightening details */}
                {data.has_straightening && (
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
                              className={`chip ${data.straightening_count === n ? 'chip-active' : ''}`}
                              onClick={() => setData({ ...data, straightening_count: n })}
                              style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                            >
                              {n === 6 ? '6回以上' : `${n}回`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Perm details */}
                {data.has_perm && (
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

                {/* Skip message if no history */}
                {!data.has_straightening && !data.has_perm && (
                  <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-xl)',
                    color: 'var(--text-muted)',
                  }}>
                    <p>前のステップで縮毛矯正またはパーマの履歴を「あり」にすると、詳細入力が表示されます。</p>
                    <p className="text-sm" style={{ marginTop: 'var(--space-sm)' }}>
                      該当しない場合は「次へ」で進んでください。
                    </p>
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
                今の髪色とダメージの程度を教えてください
              </p>

              <div className="flex flex-col gap-lg">
                <div className="form-group">
                  <label className="form-label">現在の髪色</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="例: 暗めの茶色、金髪、黒など"
                    value={data.current_hair_color}
                    onChange={(e) => setData({ ...data, current_hair_color: e.target.value })}
                  />
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

          {/* Step 4: Allergy & Risk Check (NEW) */}
          {step === 4 && (
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

          {/* Step 5: Salon Vibe (NEW) */}
          {step === 5 && (
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

          {/* Step 6: Confirmation */}
          {step === 6 && (
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
                    <span className="text-secondary">ブリーチ回数</span>
                    <span>{data.bleach_count === 0 ? 'なし' : `${data.bleach_count}回`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">黒染め</span>
                    <span>{data.has_black_dye ? `あり（${data.black_dye_count}回）` : 'なし'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">縮毛矯正</span>
                    <span>
                      {data.has_straightening
                        ? `あり（${data.straightening_count}回${data.straightening_date ? ` / 最終${STRAIGHTENING_DATE_OPTIONS.find(o => o.value === data.straightening_date)?.label || ''}` : ''}）`
                        : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">パーマ</span>
                    <span>
                      {data.has_perm
                        ? `あり（${data.perm_count}回${data.perm_count_over_5 ? ' ⚠️' : ''}${data.perm_date ? ` / 最終${PERM_DATE_OPTIONS.find(o => o.value === data.perm_date)?.label || ''}` : ''}）`
                        : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">現在の髪色</span>
                    <span>{data.current_hair_color || '未入力'}</span>
                  </div>
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
            disabled={step === 4 && !allergyData.consent_acknowledged}
            style={{ opacity: (step === 4 && !allergyData.consent_acknowledged) ? 0.5 : 1 }}
          >
            {step === steps.length - 1 ? '次へ：スタイル選択' : '次へ'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
