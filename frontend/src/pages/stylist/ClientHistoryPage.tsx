import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Sparkles, AlertTriangle, FileSignature, ChevronDown, ChevronUp, Package, Image as ImageIcon, Lock, Shield, Beaker, Clock, CheckCircle2 } from 'lucide-react';

// モックデータ：顧客の基本情報
const DEMO_CLIENT = {
  id: 'client-001',
  name: '桜田 M.',
  total_visits: 5,
  last_visit: '2026-06-15',
  hair_type: '太め・硬め',
  allergy_risk: true,
  memo: 'ジアミンアレルギーの疑いあり。パッチテストでは軽い赤みが出たため、ノンジアミンカラーを推奨。',
};

// モックデータ：過去の来店履歴（タイムライン）
const DEMO_HISTORY: Array<{
  id: string; date: string; style_name: string; stylist_name: string;
  soap: { subjective: string; objective: string; assessment: string; plan: string };
  ai_analysis?: {
    risk_score: number;
    alkaline_acidic_ratio: { alkaline_percent: number; acidic_percent: number };
    processing_time_minutes: number;
    pre_treatments?: string[];
    post_treatments?: string[];
  };
  record?: {
    actual_products: Array<{ name: string; amount_g: number; price_per_gram: number }>;
    private_notes: string; before_images: string[]; after_images: string[];
  };
}> = [
  {
    id: 'visit-002',
    date: '2026-06-15',
    style_name: '\u30df\u30eb\u30af\u30c6\u30a3\u30fc\u30d9\u30fc\u30b8\u30e5\uff08\u6839\u5143\u30ea\u30bf\u30c3\u30c1\uff0b\u30c8\u30ca\u30fc\uff09',
    stylist_name: 'AI Miyabi (\u30b5\u30dd\u30fc\u30c8)',
    soap: {
      subjective: '\u524d\u56de\u3088\u308a\u6839\u5143\u304c\u4f38\u3073\u3066\u304d\u305f\u306e\u3067\u30ea\u30bf\u30c3\u30c1\u3057\u305f\u3044\u3002\u5168\u4f53\u306e\u8272\u843d\u3061\u306f\u7dba\u9e97\u306a\u306e\u3067\u3001\u9ec4\u8272\u5473\u3092\u6291\u3048\u308b\u7a0b\u5ea6\u306b\u3057\u305f\u3044\u3002',
      objective: '\u6839\u5143 2cm \u65b0\u751f\u90e8\u3002\u4e2d\u9593\u301c\u6bdb\u5148\u306f\u30ec\u30d9\u30eb14\u306e\u30a4\u30a8\u30ed\u30fc\u30d9\u30fc\u30b9\u3002\u30c0\u30e1\u30fc\u30b8\u306f\u6bdb\u5148\u306b\u30d1\u30b5\u3064\u304d\u3042\u308a\u3002',
      assessment: 'ブリーチなしのダブルカラーでリタッチ可能。毛先は微アルカリのトナーで十分対応可能。',
      plan: '1. 根元リタッチ（ノンジアミンカラー使用）\n2. シャンプー台で中間〜毛先にベージュ系トナー\n3. 高濃度システムトリートメントで保湿',
    },
    ai_analysis: {
      risk_score: 3.5,
      alkaline_acidic_ratio: { alkaline_percent: 40, acidic_percent: 60 },
      processing_time_minutes: 35,
      pre_treatments: ['CMC (Ceramide) 前処理'],
      post_treatments: ['pH調整用酸リンス', '保湿トリートメントマスク — 5-10分放置'],
    },
    record: {
      actual_products: [
        { name: 'WELLA Illumina Color 8/69', amount_g: 40, price_per_gram: 12 },
        { name: 'THROW Color 9-Beige', amount_g: 30, price_per_gram: 10 },
        { name: '3% \u30aa\u30ad\u30b7 (10 Vol)', amount_g: 60, price_per_gram: 2 },
        { name: 'OLAPLEX No.2', amount_g: 15, price_per_gram: 35 },
      ],
      private_notes: '\u6bdb\u5148\u306e\u5165\u308a\u304c\u65e9\u304b\u3063\u305f\u306e\u3067\u6b21\u56de\u306f\u653e\u7f6e\u77ed\u3081\u306b\u3002K-POP\u306b\u30cf\u30de\u3063\u3066\u3044\u308b\u3068\u306e\u3053\u3068\u3001\u97d3\u56fd\u98a8\u30ec\u30a4\u30e4\u30fc\u30ab\u30c3\u30c8\u3082\u6b21\u56de\u63d0\u6848\u3067\u304d\u308b\u304b\u3082\u3002',
      before_images: ['before-002-1.jpg'],
      after_images: ['after-002-1.jpg'],
    },
  },
  {
    id: 'visit-001',
    date: '2026-04-10',
    style_name: '\u5168\u4f53\u30d6\u30ea\u30fc\u30c1\uff0b\u30df\u30eb\u30af\u30c6\u30a3\u30fc\u30d9\u30fc\u30b8\u30e5',
    stylist_name: 'AI Miyabi (\u30b5\u30dd\u30fc\u30c8)',
    soap: {
      subjective: '\u6625\u3089\u3057\u304f\u660e\u308b\u3044\u30df\u30eb\u30af\u30c6\u30a3\u30fc\u30d9\u30fc\u30b8\u30e5\u306b\u3057\u305f\u3044\u3002\u30c0\u30e1\u30fc\u30b8\u304c\u5fc3\u914d\u3002',
      objective: '\u5168\u4f53\u30ec\u30d9\u30eb8\u306e\u30d6\u30e9\u30a6\u30f3\u3002\u904e\u53bb\u306e\u9ed2\u67d3\u3081\u5c65\u6b74\u306a\u3057\u3002\u9aea\u306e\u4f53\u529b\u306f\u5341\u5206\u3042\u308b\u304c\u4e7e\u71e5\u6c17\u5473\u3002',
      assessment: '1回のブリーチで目標の明度に到達可能。乾燥対策として前処理・中間処理が必須。',
      plan: '1. プレトリートメント塗布\n2. 全体ブリーチ（ダメージ軽減剤添加）\n3. ベージュ＋アッシュ（3:1）でオンカラー\n4. アフタートリートメント',
    },
    ai_analysis: {
      risk_score: 6.8,
      alkaline_acidic_ratio: { alkaline_percent: 80, acidic_percent: 20 },
      processing_time_minutes: 90,
      pre_treatments: ['OLAPLEX No.0 or equivalent bond reinforcement (5分放置)', 'CMC (Ceramide) 前処理'],
      post_treatments: ['pH調整用酸リンス', 'OLAPLEX No.2 Bond Perfector — 流し後に10分放置', '保湿トリートメントマスク — 5-10分放置'],
    },
    record: {
      actual_products: [
        { name: 'WELLA \u30d6\u30ed\u30f3\u30c9\u30fc\u30eb \u30de\u30eb\u30c1\u30d6\u30ed\u30f3\u30c9', amount_g: 50, price_per_gram: 15 },
        { name: '6% \u30aa\u30ad\u30b7 (20 Vol)', amount_g: 100, price_per_gram: 2 },
        { name: 'THROW Color 9-Beige + 9-Monotone', amount_g: 60, price_per_gram: 10 },
        { name: 'OLAPLEX No.0 + No.2', amount_g: 20, price_per_gram: 35 },
        { name: 'CMC Ceramide', amount_g: 10, price_per_gram: 8 },
      ],
      private_notes: '\u521d\u56de\u30ab\u30a6\u30f3\u30bb\u30ea\u30f3\u30b0\u3067\u306f\u5c11\u3057\u7dca\u5f35\u6c17\u5473\u3002\u97f3\u697d\u597d\u304d\u3002\u6b21\u56de\u306f\u30ea\u30e9\u30c3\u30af\u30b9\u3067\u304d\u308b\u30c8\u30fc\u30af\u3067\u3002\u30d6\u30ea\u30fc\u30c1\u306e\u53cd\u5fdc\u304c\u826f\u597d\u3060\u3063\u305f\u306e\u3067\u6b21\u56de\u306f\u30cf\u30a4\u30c8\u30fc\u30f3\u3082\u63d0\u6848\u53ef\u3002',
      before_images: ['before-001-1.jpg'],
      after_images: ['after-001-1.jpg', 'after-001-2.jpg'],
    },
  }
];

export default function ClientHistoryPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [expandedVisit, setExpandedVisit] = useState<string | null>(DEMO_HISTORY[0].id);

  const toggleVisit = (id: string) => {
    setExpandedVisit(expandedVisit === id ? null : id);
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
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: '900px' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ChevronLeft size={18} /> 戻る
          </button>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Client ID: {clientId || DEMO_CLIENT.id}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-lg">
          
          {/* LEFT COLUMN: Client Summary */}
          <div className="flex flex-col gap-md" style={{ gridColumn: 'span 1' }}>
            <div className="glass-card-static">
              <div className="flex flex-col items-center" style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: 'var(--space-sm)'
                }}>
                  {DEMO_CLIENT.name.charAt(0)}
                </div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>{DEMO_CLIENT.name}</h2>
                <div className="flex gap-xs" style={{ marginTop: 'var(--space-xs)' }}>
                  <span className="badge badge-approved">累計 {DEMO_CLIENT.total_visits} 回</span>
                </div>
              </div>

              <div className="flex flex-col gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">最終来店</span>
                  <span className="font-semibold">{DEMO_CLIENT.last_visit}</span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">髪質</span>
                  <span className="font-semibold">{DEMO_CLIENT.hair_type}</span>
                </div>
              </div>

              {DEMO_CLIENT.allergy_risk && (
                <div style={{
                  marginTop: 'var(--space-md)',
                  padding: 'var(--space-sm)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div className="flex items-center gap-xs" style={{ color: '#F87171', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>
                    <AlertTriangle size={14} /> アレルギー注意
                  </div>
                  <div style={{ color: '#F87171', fontSize: '0.75rem', lineHeight: 1.5 }}>
                    {DEMO_CLIENT.memo}
                  </div>
                </div>
              )}
            </div>
            
            {/* LTV & Engagement (Mock metrics for lock-in visualization) */}
            <div className="glass-card-static">
              <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                <Sparkles size={16} className="text-primary-light" /> エンゲージメント
              </h3>
              <div className="text-xs text-secondary mb-sm">
                データが蓄積されているため、他店への移行リスクは低いです。
              </div>
              <div className="w-full bg-tertiary rounded-full h-2 mb-xs" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="bg-primary h-2 rounded-full" style={{ width: '85%', background: 'var(--gradient-primary)' }}></div>
              </div>
              <div className="text-right text-xs font-semibold text-primary-light">定着率: 85%</div>
            </div>
          </div>

          {/* RIGHT COLUMN: Visit History Timeline */}
          <div className="flex flex-col gap-md" style={{ gridColumn: 'span 2' }}>
            <h2 className="flex items-center gap-sm text-xl font-bold mb-sm">
              <Calendar size={20} className="text-secondary-light" />
              来店・カルテ履歴
            </h2>

            <div className="flex flex-col gap-lg" style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute', top: '10px', bottom: '10px', left: '20px',
                width: '2px', background: 'var(--border-subtle)', zIndex: 0
              }}></div>

              {DEMO_HISTORY.map((visit, idx) => (
                <div key={visit.id} className="animate-fade-in-up stagger" style={{ position: 'relative', zIndex: 1, paddingLeft: '50px' }}>
                  
                  {/* Timeline Node */}
                  <div style={{
                    position: 'absolute', left: '11px', top: '16px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: idx === 0 ? 'var(--color-primary)' : 'var(--bg-elevated)',
                    border: `4px solid ${idx === 0 ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-default)'}`,
                    boxShadow: idx === 0 ? 'var(--shadow-glow)' : 'none'
                  }}></div>

                  <div 
                    className="glass-card-static" 
                    style={{ 
                      padding: '0', 
                      overflow: 'hidden',
                      borderColor: expandedVisit === visit.id ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-default)',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {/* Header: Click to expand */}
                    <div 
                      className="flex justify-between items-center" 
                      style={{ padding: 'var(--space-md) var(--space-lg)', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                      onClick={() => toggleVisit(visit.id)}
                    >
                      <div>
                        <div className="text-sm text-secondary mb-xs">{visit.date}</div>
                        <div className="font-bold text-lg">{visit.style_name}</div>
                      </div>
                      <div className="text-secondary">
                        {expandedVisit === visit.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* Expandable SOAP Content */}
                    {expandedVisit === visit.id && (
                      <div style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-md">
                          <FileSignature size={16} className="text-secondary-light" />
                          保存されたSOAPカルテ
                        </h4>
                        
                        <div className="grid gap-md" style={{ gridTemplateColumns: '1fr' }}>
                          <div className="bg-elevated p-sm rounded-md" style={{ padding: 'var(--space-sm)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                            <div className="text-xs font-bold mb-xs" style={{ color: '#F472B6' }}>S (主観的情報)</div>
                            <div className="text-sm text-secondary">{visit.soap.subjective}</div>
                          </div>
                          
                          <div className="bg-elevated p-sm rounded-md" style={{ padding: 'var(--space-sm)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                            <div className="text-xs font-bold mb-xs" style={{ color: '#60A5FA' }}>O (客観的情報)</div>
                            <div className="text-sm text-secondary">{visit.soap.objective}</div>
                          </div>
                          
                          <div className="bg-elevated p-sm rounded-md" style={{ padding: 'var(--space-sm)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                            <div className="text-xs font-bold mb-xs" style={{ color: '#FBBF24' }}>A (評価・見立て)</div>
                            <div className="text-sm text-secondary">{visit.soap.assessment}</div>
                          </div>
                          
                          <div className="bg-elevated p-sm rounded-md" style={{ padding: 'var(--space-sm)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                            <div className="text-xs font-bold mb-xs" style={{ color: '#34D399' }}>P (施術計画)</div>
                            <div className="text-sm text-secondary whitespace-pre-wrap">{visit.soap.plan}</div>
                          </div>
                        </div>

                        {/* ─── AI分析結果 (AI薬剤計算の反映) ─── */}
                        {visit.ai_analysis && (
                          <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px dashed var(--border-subtle)' }}>
                            <div className="flex items-center justify-between mb-md">
                              <h4 className="flex items-center gap-xs font-semibold">
                                <Sparkles size={16} className="text-primary-light" />
                                適用されたAI分析
                              </h4>
                              <span className="flex items-center gap-xs text-xs text-secondary">
                                <Clock size={12} /> 推定 {visit.ai_analysis.processing_time_minutes}分
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-md">
                              {/* リスク評価 */}
                              <div style={{ padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
                                  <h5 className="text-xs font-bold flex items-center gap-xs">
                                    <Shield size={14} /> リスク評価
                                  </h5>
                                  <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: getRiskColor(visit.ai_analysis.risk_score) }}>
                                    {visit.ai_analysis.risk_score}/10
                                  </span>
                                </div>
                                <div style={{ height: '6px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden', marginBottom: 'var(--space-xs)' }}>
                                  <div style={{
                                    height: '100%', width: `${visit.ai_analysis.risk_score * 10}%`,
                                    background: `linear-gradient(90deg, #10B981, ${getRiskColor(visit.ai_analysis.risk_score)})`,
                                    borderRadius: 'var(--radius-full)'
                                  }} />
                                </div>
                                <div className="text-right">
                                  <span className="badge" style={{ background: `${getRiskColor(visit.ai_analysis.risk_score)}20`, color: getRiskColor(visit.ai_analysis.risk_score), fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                                    {getRiskLabel(visit.ai_analysis.risk_score)} RISK
                                  </span>
                                </div>
                              </div>

                              {/* アルカリ/酸性 バランス */}
                              <div style={{ padding: 'var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                                <h5 className="text-xs font-bold flex items-center gap-xs" style={{ marginBottom: 'var(--space-sm)' }}>
                                  <Beaker size={14} /> アルカリ/酸性バランス
                                </h5>
                                <div style={{ height: '16px', borderRadius: 'var(--radius-full)', overflow: 'hidden', display: 'flex', marginBottom: 'var(--space-xs)' }}>
                                  <div style={{
                                    width: `${visit.ai_analysis.alkaline_acidic_ratio.alkaline_percent}%`,
                                    background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'white'
                                  }}>
                                    {visit.ai_analysis.alkaline_acidic_ratio.alkaline_percent}%
                                  </div>
                                  <div style={{
                                    width: `${visit.ai_analysis.alkaline_acidic_ratio.acidic_percent}%`,
                                    background: 'linear-gradient(90deg, #06B6D4, #22D3EE)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'white'
                                  }}>
                                    {visit.ai_analysis.alkaline_acidic_ratio.acidic_percent}%
                                  </div>
                                </div>
                                <div className="flex justify-between text-[0.6rem]">
                                  <span style={{ color: 'var(--color-primary-light)' }}>🔹 アルカリ</span>
                                  <span style={{ color: 'var(--color-accent-light)' }}>🔸 酸性・ケア</span>
                                </div>
                              </div>
                            </div>

                            {/* 前後処理 */}
                            {(visit.ai_analysis.pre_treatments || visit.ai_analysis.post_treatments) && (
                              <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                                <div className="grid grid-cols-2 gap-sm">
                                  {visit.ai_analysis.pre_treatments && visit.ai_analysis.pre_treatments.length > 0 && (
                                    <div>
                                      <div className="text-[0.65rem] font-bold mb-xs" style={{ color: '#10B981' }}>前処理</div>
                                      <ul className="text-xs text-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {visit.ai_analysis.pre_treatments.map((t, i) => (
                                          <li key={i} className="flex items-start gap-xs">
                                            <CheckCircle2 size={12} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                                            <span>{t}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {visit.ai_analysis.post_treatments && visit.ai_analysis.post_treatments.length > 0 && (
                                    <div>
                                      <div className="text-[0.65rem] font-bold mb-xs" style={{ color: 'var(--color-accent-light)' }}>後処理</div>
                                      <ul className="text-xs text-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {visit.ai_analysis.post_treatments.map((t, i) => (
                                          <li key={i} className="flex items-start gap-xs">
                                            <CheckCircle2 size={12} style={{ color: 'var(--color-accent-light)', flexShrink: 0, marginTop: '2px' }} />
                                            <span>{t}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-md" style={{ marginTop: 'var(--space-md)' }}>
                          <button className="btn btn-ghost btn-sm text-xs border-subtle" style={{ border: '1px solid var(--border-subtle)' }}>
                            この履歴から新しいレシピを作成
                          </button>
                        </div>

                        {/* ─── 施術実績・使用薬剤・コスト ─── */}
                        {visit.record && (
                          <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-subtle)' }}>
                            {/* 使用薬剤・コスト */}
                            <h4 className="flex items-center gap-xs font-semibold mb-md">
                              <Package size={16} className="text-primary-light" />
                              使用薬剤・コスト
                            </h4>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                              <table style={{ width: '100%', fontSize: 'var(--font-size-xs)', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>薬剤名</th>
                                    <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>使用量</th>
                                    <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>単価</th>
                                    <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>小計</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {visit.record.actual_products.map((p, pi) => (
                                    <tr key={pi} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                      <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-primary)' }}>{p.name}</td>
                                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{p.amount_g}g</td>
                                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>¥{p.price_per_gram}/g</td>
                                      <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>¥{(p.amount_g * p.price_per_gram).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr>
                                    <td colSpan={3} style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>薬剤原価合計</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--color-primary-light)' }}>
                                      ¥{visit.record.actual_products.reduce((sum, p) => sum + p.amount_g * p.price_per_gram, 0).toLocaleString()}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>

                            {/* Before / After */}
                            <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ marginTop: 'var(--space-md)' }}>
                              <ImageIcon size={16} /> Before / After
                            </h4>
                            <div className="grid grid-cols-2 gap-md" style={{ marginBottom: 'var(--space-md)' }}>
                              <div>
                                <div className="text-xs font-semibold text-secondary mb-xs">Before</div>
                                <div className="flex gap-sm">
                                  {visit.record.before_images.map((_img, ii) => (
                                    <div key={ii} style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <ImageIcon size={20} style={{ color: 'var(--color-primary-light)', opacity: 0.5 }} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-secondary mb-xs">After</div>
                                <div className="flex gap-sm">
                                  {visit.record.after_images.map((_img, ii) => (
                                    <div key={ii} style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(52, 211, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <ImageIcon size={20} style={{ color: '#34D399', opacity: 0.5 }} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* 非公開メモ */}
                            <div style={{ padding: 'var(--space-sm) var(--space-md)', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.15)', borderRadius: 'var(--radius-md)' }}>
                              <div className="flex items-center gap-xs text-xs font-semibold mb-xs" style={{ color: '#FBBF24' }}>
                                <Lock size={12} /> 美容師専用メモ（非公開）
                              </div>
                              <div className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>{visit.record.private_notes}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div style={{ paddingLeft: '50px', paddingTop: 'var(--space-sm)' }}>
                <button className="btn btn-ghost btn-full text-secondary border-dashed" style={{ border: '1px dashed var(--border-default)' }}>
                  さらに過去の履歴を読み込む
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
