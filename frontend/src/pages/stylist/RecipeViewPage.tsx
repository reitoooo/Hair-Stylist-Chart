import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, Clock, AlertTriangle, Package,
  ListOrdered, Send, User, FileText, FileSignature, Beaker
} from 'lucide-react';
import type { SOAPChart, SOAPChartUpdate, AllergyChecklist } from '../../types';

// Demo recipe data
const DEMO_RECIPE = {
  recipe_text: `## 施術レシピ：ハイトーンベージュカラー\n\n### 事前診断\nお客様の問診によると、過去に2回のブリーチ履歴があり、黒染め履歴はありません。現在のダメージレベルは中程度（レベル3）です。\n髪の長さはミディアムで、スムーズなスタイルチェンジが期待できます。`,
  recommended_products: [
    { name: 'WELLA ブロンドール マルチブロンド', type: 'ブリーチ剤', usage: 'ステップ 3' },
    { name: 'OLAPLEX No.0 + No.2', type: '結合強化トリートメント', usage: 'ステップ 2 & 5' },
    { name: 'THROW Color 9-Beige', type: 'カラー剤', usage: 'ステップ 4' },
    { name: 'THROW Color 9-Monotone', type: 'カラー剤', usage: 'ステップ 4' },
  ],
  procedure_steps: [
    {
      title: '髪の状態チェック',
      time: '10分',
      detail: '最もダメージのある部分でストランドテストを実施。弾力と多孔性を確認し、目標の明度に到達可能か判断します。',
    },
    {
      title: '前処理',
      time: '5分',
      detail: 'OLAPLEX No.0 または TOKIO INKARAMI を塗布し、結合を強化。熱を加えずに5分間放置します。',
    },
    {
      title: 'ブリーチ塗布',
      time: '45分',
      detail: 'WELLA ブロンドール マルチブロンドパウダー + 6% オキシ（1:2）を混合。中間から毛先に先に塗布し、その後根元へ。自然放置で10分ごとにチェック。目標：レベル15-16（ペールイエロー）。',
    },
    {
      title: 'トナー（カラー）塗布',
      time: '25分',
      detail: 'THROW Color 9-Beige + 9-Monotone (2:1) + 3% オキシを混合。根元から毛先まで均一に塗布し、室温で20-25分放置します。',
    },
    {
      title: '後処理＆仕上げ',
      time: '15分',
      detail: 'しっかりとすすぎ、OLAPLEX No.2 を塗布して10分間放置。その後、保湿トリートメントを行います。キューティクルを引き締めるため、冷風でブローして仕上げます。',
    },
  ],
  estimated_time_minutes: 100,
  risk_notes: '2回のブリーチ履歴があるため、中間から毛先にかけては切れやすくなっている可能性があります。この部分のブリーチ放置時間は短めに設定してください。ストランドテストで著しいダメージが見られた場合は、リフトアップのレベルを下げて暗めのトナーを使用することを検討してください。',
  customer: {
    name: '桜田 M.',
    hair_length: 'ミディアム',
    bleach_count: 2,
    has_black_dye: false,
    has_straightening: false,
    current_hair_color: 'ブラウン（レベル8）',
    damage_level: 3,
    desired_style: 'ミルクティーベージュのハイトーン',
  },
};

export default function RecipeViewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'recipe' | 'soap'>('recipe');

  // Features: Allergy & SOAP
  const [allergyData, setAllergyData] = useState<AllergyChecklist | null>(null);
  const [soapChart, setSoapChart] = useState<SOAPChart | null>(null);
  const [isEditingSoap, setIsEditingSoap] = useState(false);
  const [soapEditForm, setSoapEditForm] = useState<SOAPChartUpdate>({});
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);

  const [recipe] = useState(() => {
    const defaultRec = { ...DEMO_RECIPE };
    const lastB = sessionStorage.getItem('lastBooking');
    if (lastB) {
      const parsed = JSON.parse(lastB);
      if (parsed.id === bookingId) {
        defaultRec.customer = {
          name: parsed.customer_name,
          hair_length: parsed.hair_summary.split(' / ')[0] || 'ミディアム',
          bleach_count: parseInt(parsed.hair_summary.split(' / ')[1]?.replace('ブリーチ', '')?.replace('回', '')) || 0,
          has_black_dye: parsed.hair_summary.includes('黒染め') && !parsed.hair_summary.includes('黒染め: なし'),
          has_straightening: parsed.hair_summary.includes('縮毛矯正'),
          current_hair_color: '自己申告ベース',
          damage_level: parseInt(parsed.hair_summary.split(' / ')[2]?.replace('ダメージLv', '')) || 1,
          desired_style: parsed.desired_style,
        };
        (defaultRec as any).refined_details = parsed.refined_details || [];
        (defaultRec as any).chat_history = parsed.chat_history || [];
      }
    }
    return defaultRec;
  });

  // Load mock allergy data
  useEffect(() => {
    const savedAllergy = sessionStorage.getItem('allergyChecklist');
    if (savedAllergy) {
      setAllergyData(JSON.parse(savedAllergy));
    }
  }, []);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: 'stylist', text: chatInput, time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setChatInput('');
  };

  const handleGenerateSoap = () => {
    setIsGeneratingSoap(true);
    // Simulate AI generation API call
    setTimeout(() => {
      const generated: SOAPChart = {
        id: `soap-${Date.now()}`,
        booking_id: bookingId || '',
        stylist_id: 'stylist-001',
        subjective: `【希望スタイルのこだわり条件（AIカウンセリングより）】\n${(recipe as any).refined_details?.map((d: string) => `  ・${d}`).join('\n') || '  ・特になし'}\n\n【希望のヘアスタイル】\n  ${recipe.customer.desired_style}`,
        objective: `【髪質の状態診断】\n  ・髪の長さ: ${recipe.customer.hair_length}\n  ・ブリーチ履歴: ${recipe.customer.bleach_count}回\n  ・黒染め履歴: ${recipe.customer.has_black_dye ? 'あり' : 'なし'}\n  ・縮毛矯正履歴: ${recipe.customer.has_straightening ? 'あり' : 'なし'}\n  ・自己評価ダメージレベル: ${recipe.customer.damage_level}/5`,
        assessment: `【総合施術リスク判定: ${recipe.customer.damage_level >= 3 ? '中リスク' : '低リスク'}】\n${recipe.customer.damage_level >= 3 ? '  ・中程度のダメージが検出されました。低アルカリの優しい薬剤を使用し、十分な前処理を行ってください。' : '  ・健康的な髪状態であり、通常の施術は問題なく進行可能です。'}`,
        plan: `【施術計画】\n  1. 最もダメージの激しい箇所でストランドテストを実施\n  2. 髪の弾力と多孔性を評価\n  3. 薬剤使用に関するクライアントの同意を確認\n  4. AI推奨レシピに沿って施術を進行`,
        is_ai_generated: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSoapChart(generated);
      setSoapEditForm({
        subjective: generated.subjective,
        objective: generated.objective,
        assessment: generated.assessment,
        plan: generated.plan,
      });
      setIsGeneratingSoap(false);
      setActiveTab('soap');
    }, 1500);
  };

  const saveSoap = () => {
    if (soapChart) {
      setSoapChart({
        ...soapChart,
        ...soapEditForm,
        is_ai_generated: false,
        updated_at: new Date().toISOString(),
      });
    }
    setIsEditingSoap(false);
  };

  const hasAllergyRisk = allergyData && (
    allergyData.has_skin_trouble ||
    allergyData.has_allergy ||
    allergyData.has_scalp_sensitivity ||
    allergyData.has_previous_reaction
  );

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: '1000px' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/stylist/dashboard')}>
            <ChevronLeft size={18} /> ダッシュボードに戻る
          </button>
          <div className="flex items-center gap-sm">
            <button 
              className="btn btn-ghost"
              onClick={() => navigate(`/stylist/client/client-${bookingId?.split('-')[1]}`)}
            >
              <User size={16} /> 過去の履歴を見る
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate(`/stylist/chemicals/${bookingId}`)}
            >
              <Beaker size={16} /> AI薬剤計算ツール
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleGenerateSoap}
              disabled={isGeneratingSoap}
            >
              <FileSignature size={16} /> 
              {isGeneratingSoap ? 'AIカルテ生成中...' : 'SOAPカルテを自動生成'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-lg">
          
          {/* LEFT COLUMN: Customer Info & Allergy */}
          <div className="flex flex-col gap-md" style={{ gridColumn: 'span 1' }}>
            
            {/* Allergy Alert (Feature 6) */}
            {allergyData && (
              <div className="glass-card-static animate-fade-in-up" style={{ 
                border: hasAllergyRisk ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                background: hasAllergyRisk ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'
              }}>
                <h3 className="flex items-center gap-sm" style={{ 
                  fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)',
                  color: hasAllergyRisk ? '#F87171' : '#34D399'
                }}>
                  <AlertTriangle size={18} />
                  アレルギー情報
                </h3>
                
                <div className="flex flex-col gap-sm" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <div className="flex justify-between">
                    <span className="text-secondary">肌トラブル</span>
                    <span style={{ color: allergyData.has_skin_trouble ? '#F87171' : 'inherit', fontWeight: allergyData.has_skin_trouble ? 700 : 'normal' }}>
                      {allergyData.has_skin_trouble ? `あり${allergyData.skin_trouble_detail ? `（${allergyData.skin_trouble_detail}）` : ''}` : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">アレルギー</span>
                    <span style={{ color: allergyData.has_allergy ? '#F87171' : 'inherit', fontWeight: allergyData.has_allergy ? 700 : 'normal' }}>
                      {allergyData.has_allergy ? `あり${allergyData.allergy_detail ? `（${allergyData.allergy_detail}）` : ''}` : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">過去の副反応</span>
                    <span style={{ color: allergyData.has_previous_reaction ? '#F87171' : 'inherit', fontWeight: allergyData.has_previous_reaction ? 700 : 'normal' }}>
                      {allergyData.has_previous_reaction ? `あり${allergyData.previous_reaction_detail ? `（${allergyData.previous_reaction_detail}）` : ''}` : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">パッチテスト</span>
                    <span>{allergyData.has_patch_test ? `実施済${allergyData.patch_test_result ? `（${allergyData.patch_test_result}）` : ''}` : '未実施'}</span>
                  </div>
                  
                  {hasAllergyRisk && (
                    <div style={{ marginTop: 'var(--space-xs)', padding: 'var(--space-xs) var(--space-sm)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', color: '#F87171', fontSize: '0.65rem' }}>
                      施術前に必ずクライアントと確認し、パッチテストを推奨してください。
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Summary */}
            <div className="glass-card-static">
              <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                <User size={18} /> 顧客カルテ
              </h3>
              <div className="flex flex-col gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">お名前</span><span className="font-semibold">{recipe.customer.name}</span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">希望スタイル</span><span className="font-semibold">{recipe.customer.desired_style}</span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">髪の長さ</span><span className="font-semibold">{recipe.customer.hair_length}</span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">ブリーチ回数</span><span className="font-semibold">{recipe.customer.bleach_count}回</span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">黒染め</span><span className="font-semibold">{recipe.customer.has_black_dye ? 'あり' : 'なし'}</span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">縮毛矯正</span><span className="font-semibold">{recipe.customer.has_straightening ? 'あり' : 'なし'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">ダメージレベル</span><span className="font-semibold">{recipe.customer.damage_level}/5</span>
                </div>
              </div>
              
              {(recipe as any).refined_details && (recipe as any).refined_details.length > 0 && (
                <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-default)' }}>
                  <span className="text-secondary text-xs font-semibold block mb-xs">こだわり条件 (AIチャット):</span>
                  <div className="flex gap-xs flex-wrap">
                    {(recipe as any).refined_details.map((tag: string) => (
                      <span key={tag} className="chip chip-pink" style={{ padding: '0.125rem 0.5rem', fontSize: '0.65rem' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Chat History Logs */}
            {(recipe as any).chat_history && (recipe as any).chat_history.length > 0 && (
              <div className="glass-card-static">
                <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                  <Sparkles size={16} className="text-gradient" /> AI相談ログ
                </h3>
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }} className="hide-scrollbar">
                  {(recipe as any).chat_history.map((msg: any, i: number) => (
                    <div key={i} style={{ 
                      padding: '0.5rem 0.6rem', fontSize: '0.7rem', borderRadius: 'var(--radius-md)', maxWidth: '90%',
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.sender === 'user' ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
                      color: msg.sender === 'user' ? 'white' : 'var(--text-primary)'
                    }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.6rem', marginBottom: '2px', opacity: 0.8 }}>
                        {msg.sender === 'user' ? 'お客様' : 'AI Miyabi'}
                      </p>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Recipe / SOAP Tabs */}
          <div className="flex flex-col gap-lg" style={{ gridColumn: 'span 2' }}>
            
            {/* Tabs */}
            <div className="flex border-b border-default" style={{ marginBottom: 'var(--space-sm)' }}>
              <button 
                className={`px-lg py-sm font-semibold transition-colors ${activeTab === 'recipe' ? 'text-primary-light border-b-2 border-primary' : 'text-secondary hover:text-primary'}`}
                style={{ padding: '0.75rem 1.5rem', borderBottom: activeTab === 'recipe' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                onClick={() => setActiveTab('recipe')}
              >
                <Sparkles size={16} className="inline-block mr-xs" style={{ marginRight: '6px' }} /> AI施術レシピ
              </button>
              <button 
                className={`px-lg py-sm font-semibold transition-colors ${activeTab === 'soap' ? 'text-primary-light border-b-2 border-primary' : 'text-secondary hover:text-primary'}`}
                style={{ padding: '0.75rem 1.5rem', borderBottom: activeTab === 'soap' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                onClick={() => setActiveTab('soap')}
              >
                <FileSignature size={16} className="inline-block mr-xs" style={{ marginRight: '6px' }} /> SOAPカルテ
              </button>
            </div>

            {/* TAB CONTENT: AI RECIPE */}
            {activeTab === 'recipe' && (
              <div className="recipe-card animate-fade-in-up">
                <div className="recipe-header flex justify-between items-center">
                  <h2 className="flex items-center gap-sm text-xl font-bold">
                    <Sparkles size={20} className="text-primary-light" />
                    AI推奨レシピ
                  </h2>
                  <span className="flex items-center gap-xs text-secondary text-sm">
                    <Clock size={14} /> 推定 {recipe.estimated_time_minutes}分
                  </span>
                </div>

                <div className="recipe-body">
                  <div className="ai-disclaimer mb-xl" style={{ marginBottom: 'var(--space-xl)' }}>
                    ⚠️ このレシピはAIが生成した参考情報です。最終的な施術判断は美容師の専門的な判断に基づいて行ってください。
                  </div>

                  {/* Procedure Steps */}
                  <h3 className="flex items-center gap-sm text-lg font-semibold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
                    <ListOrdered size={18} /> 施術手順
                  </h3>
                  <div className="mb-xl" style={{ marginBottom: 'var(--space-xl)' }}>
                    {recipe.procedure_steps.map((step, i) => (
                      <div key={i} className="recipe-step">
                        <div className="recipe-step-number">{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div className="flex items-center gap-sm mb-xs" style={{ marginBottom: '4px' }}>
                            <span className="font-semibold">{step.title}</span>
                            <span className="chip text-xs px-2 py-0.5">{step.time}</span>
                          </div>
                          <p className="text-secondary text-sm leading-relaxed">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommended Products */}
                  <h3 className="flex items-center gap-sm text-lg font-semibold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
                    <Package size={18} /> 推奨薬剤
                  </h3>
                  <div className="grid grid-cols-2 gap-sm mb-xl" style={{ marginBottom: 'var(--space-xl)' }}>
                    {recipe.recommended_products.map((p, i) => (
                      <div key={i} className="bg-tertiary p-md rounded-md border border-subtle" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div className="font-semibold text-sm mb-xs" style={{ marginBottom: '4px' }}>{p.name}</div>
                        <div className="flex gap-sm text-xs">
                          <span className="chip chip-cyan">{p.type}</span>
                          <span className="text-muted">{p.usage}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Risk Notes */}
                  <h3 className="flex items-center gap-sm text-lg font-semibold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
                    <AlertTriangle size={18} color="#FBBF24" /> リスク・注意事項
                  </h3>
                  <div style={{ padding: 'var(--space-md)', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {recipe.risk_notes}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SOAP CHART (Feature 5) */}
            {activeTab === 'soap' && (
              <div className="animate-fade-in-up">
                {!soapChart ? (
                  <div className="glass-card-static flex flex-col items-center justify-center" style={{ minHeight: '300px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FileSignature size={48} style={{ opacity: 0.2, marginBottom: 'var(--space-md)' }} />
                    <p style={{ marginBottom: 'var(--space-md)' }}>カルテがまだ作成されていません</p>
                    <button className="btn btn-primary" onClick={handleGenerateSoap}>
                      <Sparkles size={16} /> AIから自動生成する
                    </button>
                  </div>
                ) : (
                  <div className="glass-card-static" style={{ position: 'relative' }}>
                    {soapChart.is_ai_generated && (
                      <div className="badge badge-pending" style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)' }}>
                        <Sparkles size={12} /> AI生成 (未編集)
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-lg" style={{ marginBottom: 'var(--space-lg)' }}>
                      <h2 className="text-xl font-bold">SOAPカルテ</h2>
                      {!isEditingSoap ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingSoap(true)}>
                          編集する
                        </button>
                      ) : (
                        <div className="flex gap-sm">
                          <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingSoap(false)}>キャンセル</button>
                          <button className="btn btn-primary btn-sm" onClick={saveSoap}>保存</button>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-md" style={{ gridTemplateColumns: '1fr' }}>
                      
                      {/* S: Subjective */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ color: '#F472B6', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(244, 114, 182, 0.2)', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem' }}>S</span>
                          主観的情報
                        </h4>
                        {isEditingSoap ? (
                          <textarea className="form-input form-textarea w-full text-sm" value={soapEditForm.subjective} onChange={e => setSoapEditForm({...soapEditForm, subjective: e.target.value})} rows={4} />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{soapChart.subjective}</div>
                        )}
                      </div>

                      {/* O: Objective */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ color: '#60A5FA', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(96, 165, 250, 0.2)', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem' }}>O</span>
                          客観的情報
                        </h4>
                        {isEditingSoap ? (
                          <textarea className="form-input form-textarea w-full text-sm" value={soapEditForm.objective} onChange={e => setSoapEditForm({...soapEditForm, objective: e.target.value})} rows={5} />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{soapChart.objective}</div>
                        )}
                      </div>

                      {/* A: Assessment */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ color: '#FBBF24', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.2)', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem' }}>A</span>
                          評価・見立て
                        </h4>
                        {isEditingSoap ? (
                          <textarea className="form-input form-textarea w-full text-sm" value={soapEditForm.assessment} onChange={e => setSoapEditForm({...soapEditForm, assessment: e.target.value})} rows={4} />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{soapChart.assessment}</div>
                        )}
                      </div>

                      {/* P: Plan */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ color: '#34D399', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem' }}>P</span>
                          施術計画
                        </h4>
                        {isEditingSoap ? (
                          <textarea className="form-input form-textarea w-full text-sm" value={soapEditForm.plan} onChange={e => setSoapEditForm({...soapEditForm, plan: e.target.value})} rows={4} />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{soapChart.plan}</div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat with Client Section */}
            <div className="glass-card-static mt-lg" style={{ marginTop: 'var(--space-lg)' }}>
              <h3 className="flex items-center gap-sm text-lg font-semibold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
                <FileText size={18} /> 顧客への事前メッセージ
              </h3>
              <div style={{ minHeight: '120px', maxHeight: '200px', overflowY: 'auto', padding: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-xl)' }}>
                    <p className="text-sm">レシピの内容を確認し、お客様に事前メッセージを送信できます</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-sm">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="chat-bubble sent" style={{ maxWidth: '85%' }}>
                        <div className="text-xs text-muted mb-xs" style={{ marginBottom: '4px', opacity: 0.7 }}>{msg.time}</div>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="chat-input-area" style={{ borderTop: '1px solid var(--border-subtle)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', margin: '0 calc(-1 * var(--space-lg)) calc(-1 * var(--space-lg))', padding: 'var(--space-md) var(--space-lg)' }}>
                <input
                  className="chat-input flex-1"
                  type="text"
                  placeholder="メッセージを入力..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                />
                <button className="btn btn-primary btn-sm" onClick={sendChat}>
                  <Send size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
