import { useState, useEffect } from 'react';
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

const HAIR_TYPE_OPTIONS = [
  { id: 'soft', label: '軟毛' },
  { id: 'normal', label: '普通' },
  { id: 'hard', label: '硬毛' },
];

const PRESET_COLORS = [
  '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc', '#d7ccc8', '#f5f5f5',
  '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775', '#fff176', '#ffd54f', '#ffb74d', '#ff8a65', '#a1887f', '#e0e0e0',
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e',
  '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#1976d2', '#0288d1', '#0097a7', '#00796b', '#388e3c', '#689f38', '#afb42b', '#fbc02d', '#ffa000', '#f57c00', '#e64a19', '#5d4037', '#616161',
  '#b71c1c', '#880e4f', '#4a148c', '#311b92', '#1a237e', '#0d47a1', '#01579b', '#006064', '#004d40', '#1b5e20', '#33691e', '#827717', '#f57f17', '#ff6f00', '#e65100', '#bf360c', '#3e2723', '#212121',
];

function analyzeColor(hexString: string) {
  const hexes = hexString.split(',').filter(h => h.startsWith('#'));
  if (hexes.length === 0) return { hue: 'brown', requiresBleach: false, name: '不明', isDesign: false };
  
  const hex = hexes[0];
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  
  let h = 0;
  if (max !== min) {
    if (max === r) h = (g - b) / (max - min) + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / (max - min) + 2;
    else h = (r - g) / (max - min) + 4;
    h /= 6;
  }
  
  const requiresBleach = hexes.some(hx => {
    const r2 = parseInt(hx.slice(1, 3), 16) / 255;
    const g2 = parseInt(hx.slice(3, 5), 16) / 255;
    const b2 = parseInt(hx.slice(5, 7), 16) / 255;
    const mx = Math.max(r2, g2, b2), mn = Math.min(r2, g2, b2);
    const lv = (mx + mn) / 2;
    const sv = mx === mn ? 0 : lv > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
    return lv > 0.55 || (sv > 0.5 && lv > 0.35);
  });

  let hue = 'brown';
  if (s < 0.15) {
     if (l > 0.7) hue = 'silver_gray';
     else if (l < 0.3) hue = 'black_dark';
     else hue = 'ash_greige';
  } else {
     const hDeg = h * 360;
     if (hDeg < 15 || hDeg >= 330) hue = 'red_pink';
     else if (hDeg < 45) hue = 'orange_apricot';
     else if (hDeg < 70) hue = 'yellow_beige';
     else if (hDeg < 160) hue = 'green_olive';
     else if (hDeg < 250) hue = 'blue_ash';
     else if (hDeg < 330) hue = 'purple_lavender';
  }

  const nameMap: Record<string, string> = {
    silver_gray: 'シルバー/グレー',
    black_dark: 'ブラック/ダーク',
    ash_greige: 'アッシュ/グレージュ',
    red_pink: 'レッド/ピンク',
    orange_apricot: 'オレンジ/アプリコット',
    yellow_beige: 'イエロー/ベージュ',
    green_olive: 'グリーン/オリーブ',
    blue_ash: 'ブルー/アッシュ',
    purple_lavender: 'パープル/ラベンダー',
    brown: 'ブラウン',
  };

  return { hue, requiresBleach, name: nameMap[hue] || 'カスタムカラー', isDesign: hexes.length > 1 };
}

export default function ChemicalCalculatorPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  // Form state
  const [damageLevel, setDamageLevel] = useState(3);
  const [bleachCount, setBleachCount] = useState(0);
  const [targetTreatment, setTargetTreatment] = useState('color');
  const [targetTone, setTargetTone] = useState('medium');
  const [hasStraightening, setHasStraightening] = useState(false);
  const [hasPerm, setHasPerm] = useState(false);
  const [hasBlackDye, setHasBlackDye] = useState(false);
  const [hairLength, setHairLength] = useState('medium');
  const [hairType, setHairType] = useState('normal');
  const [permCount, setPermCount] = useState(0);
  const [currentColor, setCurrentColor] = useState('#111111');
  const [targetColor, setTargetColor] = useState('#d4b895');

  const [result, setResult] = useState<ChemicalCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Sync with booking data
  useEffect(() => {
    if (bookingId) {
      const lastB = sessionStorage.getItem('lastBooking');
      if (lastB) {
        try {
          const parsed = JSON.parse(lastB);
          if (parsed.id === bookingId) {
            const q = parsed.questionnaire;
            if (q) {
              setDamageLevel(q.damage_level || 3);
              setBleachCount(q.bleach_count >= 0 ? q.bleach_count : 0);
              setHasStraightening(q.has_straightening === 'yes');
              setHasPerm(q.has_perm === 'yes');
              setHasBlackDye(q.has_black_dye === 'yes');
              setHairLength(q.hair_length || 'medium');
              setPermCount(q.perm_count >= 0 ? q.perm_count : 0);
              setHairType(q.hair_type || 'normal');
              
              if (q.current_hair_color && q.current_hair_color !== 'consult') {
                setCurrentColor(q.current_hair_color);
              }
              if (q.target_color && q.target_color !== 'consult') {
                setTargetColor(q.target_color);
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [bookingId]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setTimeout(() => {
      const targetDef = analyzeColor(targetColor);

      // Calculate risk score based on damage and color incompatibility
      let targetRisk = 0;
      if (targetDef.requiresBleach && bleachCount === 0) {
        targetRisk = 2.5; // High risk to achieve light tone without bleaching
      }

      const riskScore = Math.min(10,
        damageLevel * 1.2 +
        Math.min(bleachCount * 0.8, 4) +
        (hasStraightening && targetTreatment === 'perm' ? 3 : 0) +
        (permCount >= 5 ? 2 : 0) +
        targetRisk
      );

      // Propose main and complementary color agents
      const recAgents = [];
      
      if (targetTreatment === 'color') {
        let colorAgentName = '';
        let compAgentName = '';
        let compRatio = '';
        
        if (targetDef.hue === 'red_pink') {
          colorAgentName = `THROW Color ${targetDef.requiresBleach ? '10-Pink' : '8-Pink'}`;
          compAgentName = 'THROW Color 6-Violet (補正用)';
          compRatio = '5%';
        } else if (targetDef.hue === 'green_olive') {
          colorAgentName = `THROW Color ${targetDef.requiresBleach ? '10-Matt' : '8-Matt'}`;
          compAgentName = 'THROW Color 8-Ash (補色用)';
          compRatio = '10%';
        } else if (targetDef.hue === 'blue_ash' || targetDef.hue === 'silver_gray') {
          colorAgentName = `THROW Color ${targetDef.requiresBleach ? '10-Ash' : '8-Ash'}`;
          compAgentName = 'THROW Color 8-Violet (補色用)';
          compRatio = '10%';
        } else if (targetDef.hue === 'yellow_beige' || targetDef.hue === 'ash_greige') {
          colorAgentName = `THROW Color ${targetDef.requiresBleach ? '9-Beige' : '8-Beige'}`;
          compAgentName = 'THROW Color 8-Violet (補正用)';
          compRatio = '8%';
        } else {
          colorAgentName = 'THROW Color 8-N (ナチュラルブラウン)';
        }

        if (targetDef.isDesign) {
          colorAgentName += ' (デザイン用メイン)';
        }

        recAgents.push({
          agent: {
            id: 'agent-color-main',
            name: colorAgentName,
            type: 'color',
            strength: damageLevel >= 4 ? 'low' : damageLevel >= 3 ? 'low' : 'medium',
            ph_range: damageLevel >= 4 ? '6.0-6.5' : damageLevel >= 3 ? '7.5-8.0' : '8.0-9.0',
            description: `目標色（${targetDef.name}）用主剤`,
            risk_level: damageLevel >= 4 ? 0 : 1,
            suitable_damage_max: 5,
          },
          role: '1液 (主剤)',
          mix_ratio: '2液と1:1',
          reason: `希望色 ${targetDef.name} および髪質(${hairType === 'soft' ? '軟毛' : hairType === 'hard' ? '硬毛' : '普通'})に基づいて算定`,
        });

        if (compAgentName) {
          recAgents.push({
            agent: {
              id: 'agent-color-comp',
              name: compAgentName,
              type: 'color',
              strength: 'low',
              ph_range: '7.5-8.0',
              description: 'アンダートーン相殺・色持ち用補色',
              risk_level: 0,
              suitable_damage_max: 5,
            },
            role: '1液 (補色 / 補正色)',
            mix_ratio: `調合比率: ${compRatio}`,
            reason: '黄味や赤味のアンダートーンを相殺',
          });
        }
      } else {
        // Fallback or generic agent (bleach/perm)
        recAgents.push({
          agent: {
            id: 'agent-1',
            name: targetTreatment === 'bleach' ? 'WELLA Blondor Multi Blonde' : 'アリミノ コスメカール (システアミン系)',
            type: targetTreatment === 'bleach' ? 'bleach' : 'perm',
            strength: damageLevel >= 4 ? 'low' : damageLevel >= 3 ? 'low' : 'medium',
            ph_range: targetTreatment === 'bleach' ? '11.0-12.0' : damageLevel >= 3 ? '7.0-7.5' : '8.0-8.5',
            description: '施術タイプに合わせて選択された主剤',
            risk_level: damageLevel >= 4 ? 0 : damageLevel >= 3 ? 1 : 2,
            suitable_damage_max: damageLevel >= 4 ? 5 : damageLevel >= 3 ? 4 : 3,
          },
          role: '1液 (主剤)',
          mix_ratio: targetTreatment === 'bleach' ? '2液と1:2' : '加温10-15分',
          reason: `ダメージレベル ${damageLevel}/5 に基づき選択`,
        });
      }

      // Add developer and treatment agents
      const use3Percent = damageLevel >= 3 || targetTreatment !== 'bleach';
      recAgents.push({
        agent: {
          id: 'agent-dev',
          name: use3Percent ? '3% オキシデベロッパー' : '6% オキシデベロッパー',
          type: 'developer',
          strength: use3Percent ? 'low' : 'medium',
          ph_range: '2.5-3.5',
          description: '酸化剤 (デベロッパー)',
          risk_level: use3Percent ? 0 : 1,
          suitable_damage_max: 5,
        },
        role: '2液 (酸化剤)',
        mix_ratio: targetTreatment === 'bleach' ? '1:2' : '1:1',
        reason: 'ダメージ度合いとトーンアップ必要性から濃度を調整',
      });

      if (damageLevel >= 3) {
        recAgents.push({
          agent: {
            id: 'agent-treat',
            name: 'OLAPLEX No.1 Bond Multiplier',
            type: 'treatment',
            strength: 'low',
            ph_range: '3.0-4.0',
            description: '結合強化トリートメント',
            risk_level: 0,
            suitable_damage_max: 5,
          },
          role: '結合保護剤',
          mix_ratio: '剤総量に対して5%混入',
          reason: 'ハイダメージ毛の内部結合を保護',
        });
      }

      const mockResult: ChemicalCalculationResult = {
        id: `calc-${Date.now()}`,
        recommended_agents: recAgents,
        processing_time_minutes: Math.round((targetTreatment === 'bleach' ? 45 : targetTreatment === 'perm' ? 20 : 35) * (hairLength === 'long' ? 1.2 : hairLength === 'short' ? 0.7 : 1)),
        risk_score: Math.round(riskScore * 10) / 10,
        risk_factors: [
          ...(damageLevel >= 3 ? ['中〜高ダメージ'] : []),
          ...(bleachCount >= 2 ? ['複数回のブリーチ履歴'] : []),
          ...(hasStraightening && targetTreatment === 'perm' ? ['縮毛矯正 ＋ パーマ — 高リスク'] : []),
          ...(permCount >= 5 ? ['5回以上のパーマ履歴 — 構造的な懸念'] : []),
          ...(hasBlackDye ? ['黒染め履歴 — ムラの原因になる可能性'] : []),
        ],
        warnings: [
          ...(hasStraightening && targetTreatment === 'perm'
            ? ['警告: 縮毛矯正毛へのパーマは非常に高リスクです。事前のストランドテストを強く推奨します。']
            : []),
          ...(targetTreatment === 'color' && targetDef.requiresBleach && bleachCount === 0
            ? [`警告: 希望の明るい色（${targetDef.name}）を出すためには、現在のベースからブリーチ施術を追加する必要があります。`]
            : []),
          ...(targetTreatment === 'color' && hasBlackDye && targetDef.requiresBleach
            ? ['警告: 黒染め履歴がある髪へのハイトーンカラー・ブリーチは、染料が残留しているため強烈なオレンジ味や染まりムラになる危険性が極めて高いです。アンダーカラー補正に注意してください。']
            : []),
        ],
        pre_treatments: [
          ...(damageLevel >= 3 ? ['CMC (Ceramide) 前処理'] : []),
          ...(damageLevel >= 2 ? ['OLAPLEX No.0 or equivalent bond reinforcement (5分放置)'] : []),
        ],
        post_treatments: [
          'pH調整用酸リンス',
          '保湿トリートメントマスク — 5-10分放置',
          ...(damageLevel >= 2 ? ['OLAPLEX No.2 Bond Perfector — 流し後に10分放置'] : []),
        ],
        alkaline_acidic_ratio: {
          alkaline_percent: damageLevel >= 4 ? 20 : damageLevel >= 3 ? 40 : 60,
          acidic_percent: damageLevel >= 4 ? 80 : damageLevel >= 3 ? 60 : 40,
        },
        created_at: new Date().toISOString(),
      };

      // Phase 2: Apply Inventory Matching
      const inventoryStr = localStorage.getItem('stylist_inventory');
      if (inventoryStr) {
        try {
          const inventory: { brand_name: string; product_line: string; is_available: boolean }[] = JSON.parse(inventoryStr);
          mockResult.recommended_agents.forEach(rec => {
            const agentType = rec.agent.type;
            
            // Basic matching rule
            for (const item of inventory) {
              if (!item.is_available) continue;
              const brand = item.brand_name.toUpperCase();
              
              if (agentType === 'treatment' && brand.includes('OLAPLEX')) {
                rec.agent.name = `[${item.brand_name} ${item.product_line}] ${rec.agent.name}`;
                break;
              }
              if (agentType === 'alkaline' && ['WELLA', 'ARIMINO', 'MILBON'].includes(brand)) {
                rec.agent.name = `[${item.brand_name} ${item.product_line}] ${rec.agent.name}`;
                break;
              }
            }
          });
        } catch (e) {
          console.error('Failed to parse inventory', e);
        }
      }

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

              {/* Color Details (Current and Target Color) */}
              {targetTreatment === 'color' && (
                <>
                  <div className="form-group">
                    <label className="form-label">現在の髪色</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: '2px', marginBottom: 'var(--space-sm)' }}>
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCurrentColor(color)}
                          style={{
                            aspectRatio: '1/1',
                            width: '100%',
                            background: color,
                            border: currentColor === color ? '2px solid white' : 'none',
                            boxShadow: currentColor === color ? '0 0 0 2px var(--color-primary)' : 'none',
                            cursor: 'pointer',
                            borderRadius: '2px',
                            transform: currentColor === color ? 'scale(1.2)' : 'scale(1)',
                            zIndex: currentColor === color ? 10 : 1,
                            transition: 'transform 0.1s'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">希望の髪色 (複数選択でデザインカラー)</label>
                    
                    {targetColor && (
                      <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xs)', flexWrap: 'wrap' }}>
                        {targetColor.split(',').map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{c}</span>
                            <button
                              onClick={() => {
                                const newColors = targetColor.split(',').filter(hc => hc !== c);
                                setTargetColor(newColors.join(','));
                              }}
                              style={{ marginLeft: '4px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '10px' }}
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: '2px', marginBottom: 'var(--space-sm)' }}>
                      {PRESET_COLORS.map(color => {
                        const isSelected = targetColor ? targetColor.split(',').includes(color) : false;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              const currentColors = targetColor ? targetColor.split(',') : [];
                              if (isSelected) {
                                setTargetColor(currentColors.filter(c => c !== color).join(','));
                              } else if (currentColors.length < 3) {
                                setTargetColor([...currentColors, color].join(','));
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
                          />
                        );
                      })}
                    </div>
                  </div>
                </>
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
              
              {/* Hair Type */}
              <div className="form-group">
                <label className="form-label">髪質</label>
                <div className="flex gap-xs flex-wrap">
                  {HAIR_TYPE_OPTIONS.map(h => (
                    <button
                      key={h.id}
                      className={`chip ${hairType === h.id ? 'chip-active' : ''}`}
                      onClick={() => setHairType(h.id)}
                      style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                    >
                      {h.label}
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

              {/* History Toggles */}
              <div className="form-group">
                <label className="form-label">特殊な施術履歴</label>
                <div className="flex gap-xs flex-wrap">
                  <button
                    className={`chip ${hasStraightening ? 'chip-active' : ''}`}
                    onClick={() => setHasStraightening(!hasStraightening)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    {hasStraightening ? '✓ 縮毛矯正あり' : '+ 縮毛矯正'}
                  </button>
                  <button
                    className={`chip ${hasPerm ? 'chip-active' : ''}`}
                    onClick={() => setHasPerm(!hasPerm)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    {hasPerm ? '✓ パーマあり' : '+ パーマ'}
                  </button>
                  <button
                    className={`chip ${hasBlackDye ? 'chip-active' : ''}`}
                    onClick={() => setHasBlackDye(!hasBlackDye)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    {hasBlackDye ? '✓ 黒染めあり' : '+ 黒染め'}
                  </button>
                </div>
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
                <p>フォームを入力して<br />「AI薬剤計算を実行」をクリック</p>
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

                {/* Estimated Cost */}
                {(() => {
                  const inventoryStr = localStorage.getItem('stylist_inventory');
                  let inventoryItems: { brand_name: string; product_line: string; price_per_gram: number; is_available: boolean }[] = [];
                  try { if (inventoryStr) inventoryItems = JSON.parse(inventoryStr); } catch {}
                  
                  const defaultPrices: Record<string, number> = { 'alkaline': 10, 'acidic': 8, 'developer': 2, 'treatment': 30, 'bleach': 15, 'neutral': 12 };
                  const defaultAmounts: Record<string, number> = { 'alkaline': 40, 'acidic': 40, 'developer': 60, 'treatment': 15, 'bleach': 50, 'neutral': 40 };
                  
                  let totalCost = 0;
                  const costItems = result.recommended_agents.map(entry => {
                    const t = entry.agent.type || 'alkaline';
                    const amount = defaultAmounts[t] || 30;
                    
                    let price = defaultPrices[t] || 10;
                    for (const inv of inventoryItems) {
                      if (inv.is_available && entry.agent.name.includes(inv.brand_name)) {
                        price = inv.price_per_gram || price;
                        break;
                      }
                    }
                    
                    const subtotal = amount * price;
                    totalCost += subtotal;
                    return { name: entry.agent.name, amount, price, subtotal };
                  });

                  return (
                    <div className="glass-card-static animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💰 薬剤原価見積もり
                      </h3>
                      <div className="flex flex-col gap-xs" style={{ marginBottom: 'var(--space-md)' }}>
                        {costItems.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs" style={{ padding: '0.3rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <span className="text-secondary" style={{ maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                            <span className="text-secondary">{item.amount}g × ¥{item.price}/g</span>
                            <span className="font-semibold">¥{item.subtotal.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center" style={{ paddingTop: 'var(--space-sm)', borderTop: '2px solid var(--border-default)' }}>
                        <span className="font-bold">合計原価</span>
                        <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                          ¥{totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })()}

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
