import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Sparkles, AlertTriangle, FileSignature, ChevronDown, ChevronUp } from 'lucide-react';

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
const DEMO_HISTORY = [
  {
    id: 'visit-002',
    date: '2026-06-15',
    style_name: 'ミルクティーベージュ（根元リタッチ＋トナー）',
    stylist_name: 'AI Miyabi (サポート)',
    soap: {
      subjective: '前回より根元が伸びてきたのでリタッチしたい。全体の色落ちは綺麗なので、黄色味を抑える程度にしたい。',
      objective: '根元2cm新生部。中間〜毛先はレベル14のイエローベース。ダメージは毛先にパサつきあり。',
      assessment: 'ブリーチなしのダブルカラーでリタッチ可能。毛先は微アルカリのトナーで十分対応可能。',
      plan: '1. 根元リタッチ（ノンジアミンカラー使用）\n2. シャンプー台で中間〜毛先にベージュ系トナー\n3. 高濃度システムトリートメントで保湿',
    },
  },
  {
    id: 'visit-001',
    date: '2026-04-10',
    style_name: '全体ブリーチ＋ミルクティーベージュ',
    stylist_name: 'AI Miyabi (サポート)',
    soap: {
      subjective: '春らしく明るいミルクティーベージュにしたい。ダメージが心配。',
      objective: '全体レベル8のブラウン。過去の黒染め履歴なし。髪の体力は十分あるが乾燥気味。',
      assessment: '1回のブリーチで目標の明度に到達可能。乾燥対策として前処理・中間処理が必須。',
      plan: '1. プレトリートメント塗布\n2. 全体ブリーチ（ダメージ軽減剤添加）\n3. ベージュ＋アッシュ（3:1）でオンカラー\n4. アフタートリートメント',
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
                        
                        <div className="flex justify-end mt-md" style={{ marginTop: 'var(--space-md)' }}>
                          <button className="btn btn-ghost btn-sm text-xs">
                            このカルテを元に新しいレシピを作成
                          </button>
                        </div>
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
