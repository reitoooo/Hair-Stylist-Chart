import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Upload, X, ImageIcon, ChevronRight, ChevronLeft, SlidersHorizontal, AlertTriangle, CheckCircle2, Send, Tag, Waves } from 'lucide-react';
import type { QuestionnaireData } from '../../types';
import { generateAIResponse, createInitialContext, type ChatContext } from '../../lib/aiChatEngine';
import AuthModal from '../auth/AuthModal';
import { desiredStyleApi, questionnaireApi } from '../../lib/api';

type Step = 'upload' | 'analyzing' | 'simulator';
type Gender = 'ladies' | 'mens';

const BASE_STYLES = [
  { id: 'short', name: 'ショート' },
  { id: 'bob', name: 'ボブ' },
  { id: 'medium', name: 'ミディアム' },
  { id: 'long', name: 'ロング' },
];

const PERM_STYLES = [
  { id: 'none', name: 'なし', icon: '—', intensity: 0, gender: ['ladies', 'mens'] as Gender[] },
  { id: 'loose_wave', name: 'ゆるふわウェーブ', icon: '〰', intensity: 1, gender: ['ladies'] as Gender[] },
  { id: 'body_perm', name: 'ボディパーマ', icon: '∿', intensity: 1, gender: ['ladies', 'mens'] as Gender[] },
  { id: 'tight_curl', name: 'しっかりカール', icon: '≈', intensity: 2, gender: ['ladies'] as Gender[] },
  { id: 'spiral', name: 'スパイラル', icon: '🌀', intensity: 3, gender: ['ladies', 'mens'] as Gender[] },
  { id: 'twist_perm', name: 'ツイストパーマ', icon: '⟳', intensity: 2, gender: ['mens'] as Gender[] },
  { id: 'pin_perm', name: 'ピンパーマ', icon: '◎', intensity: 1, gender: ['mens'] as Gender[] },
];

const PRESET_COLORS = [
  '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc', '#d7ccc8', '#f5f5f5',
  '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775', '#fff176', '#ffd54f', '#ffb74d', '#ff8a65', '#a1887f', '#e0e0e0',
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e',
  '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#1976d2', '#0288d1', '#0097a7', '#00796b', '#388e3c', '#689f38', '#afb42b', '#fbc02d', '#ffa000', '#f57c00', '#e64a19', '#5d4037', '#616161',
  '#b71c1c', '#880e4f', '#4a148c', '#311b92', '#1a237e', '#0d47a1', '#01579b', '#006064', '#004d40', '#1b5e20', '#33691e', '#827717', '#f57f17', '#ff6f00', '#e65100', '#bf360c', '#3e2723', '#212121',
];

export default function SuggestStylePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [qData, setQData] = useState<QuestionnaireData | null>(null);
  
  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Simulator state
  const [selectedStyle, setSelectedStyle] = useState<string>(BASE_STYLES[0].id);
  const [selectedColor, setSelectedColor] = useState<string>('#d7ccc8'); // Default to a light brown
  const [selectedPerm, setSelectedPerm] = useState<string>('none');
  const [genderFilter, setGenderFilter] = useState<Gender>('ladies');
  const [showWarning, setShowWarning] = useState(false);
  const [permWarning, setPermWarning] = useState('');
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Trigger image regeneration loader on style/color/perm change
  useEffect(() => {
    setRegeneratingImage(true);
    const timer = setTimeout(() => {
      setRegeneratingImage(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedStyle, selectedColor, selectedPerm]);

  // AI Suggestion Chat State
  const [chatContext, setChatContext] = useState<ChatContext>(createInitialContext());
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string; imageUrl?: string }>>([
    {
      sender: 'ai',
      text: 'AIスタイリストのMiyabiです！診断結果に基づき、似合わせスタイルをご提案しました。\n\n💬 こんな相談ができます：\n• 「どんな髪型が似合う？」— 顔型分析に基づく提案\n• 「パーマをかけたい」— パーマの種類や可否判断\n• 「ダメージを抑えたい」— ケア方法の提案\n• 「朝のスタイリングを楽にしたい」— ライフスタイル相談\n\n何でもお気軽にご相談ください！',
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [refinedDetails, setRefinedDetails] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to add custom styling tags
  const addRefinedDetail = (detail: string) => {
    setRefinedDetails(prev => {
      if (prev.includes(detail)) return prev;
      return [...prev, detail];
    });
  };

  // Helper to remove a tag
  const removeRefinedDetail = (detail: string) => {
    setRefinedDetails(prev => prev.filter(item => item !== detail));
  };

  // Automatic chat scroll
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    const saved = localStorage.getItem('questionnaire');
    if (saved) {
      const parsed = JSON.parse(saved);
      setQData(parsed);
      if (parsed.hair_length && BASE_STYLES.some(s => s.id === parsed.hair_length)) {
        setSelectedStyle(parsed.hair_length);
      }
      if (parsed.target_color) {
        setSelectedColor(parsed.target_color);
      }
    }
  }, []);

  // Update checkWarning to work with hex colors
  useEffect(() => {
    if (qData) {
      const r = parseInt(selectedColor.slice(1, 3), 16) / 255;
      const g = parseInt(selectedColor.slice(3, 5), 16) / 255;
      const b = parseInt(selectedColor.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
      const requiresBleach = l > 0.55 || (s > 0.5 && l > 0.35);

      if (requiresBleach && qData.has_black_dye) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }
  }, [selectedColor, qData]);

  // Check perm feasibility
  useEffect(() => {
    if (selectedPerm === 'none') {
      setPermWarning('');
      return;
    }
    if (qData) {
      if (qData.has_straightening && qData.damage_level >= 3) {
        setPermWarning('縮毛矯正の履歴とダメージレベルの高さから、パーマは高リスクです。担当美容師と必ずご相談ください。');
      } else if (qData.perm_count_over_5) {
        setPermWarning('パーマ5回以上の履歴があるため、髪の強度に注意が必要です。低ダメージのパーマ液をおすすめします。');
      } else if (qData.damage_level >= 4) {
        setPermWarning('ダメージレベルが高いため、パーマ的施術は慎重に行う必要があります。');
      } else {
        setPermWarning('');
      }
    }
  }, [selectedPerm, qData]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFaceImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const startAnalysis = () => {
    if (!faceImage) return;
    setStep('analyzing');
    setTimeout(() => {
      setStep('simulator');
    }, 3000);
  };

  // AI Chat handler using the new engine
  const handleSendMessage = (messageText: string, imageUrl?: string) => {
    if (!messageText.trim() && !imageUrl) return;

    const userMsg = {
      sender: 'user' as const,
      text: messageText,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      imageUrl
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(messageText, chatContext, qData, imageUrl);

      // Apply style/color/perm changes from AI
      if (response.styleChange) setSelectedStyle(response.styleChange);
      if (response.colorChange) setSelectedColor(response.colorChange);
      if (response.permChange) setSelectedPerm(response.permChange);

      // Add tags
      response.tags.forEach(tag => addRefinedDetail(tag));

      // Update context
      setChatContext(prev => ({
        ...prev,
        currentStyle: response.styleChange || prev.currentStyle,
        currentColor: response.colorChange || prev.currentColor,
        currentPerm: response.permChange || prev.currentPerm,
      }));

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai' as const,
          text: response.text,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    handleSendMessage('こんな感じの色にしたいです', url);
    e.target.value = '';
  };

  const handleComplete = () => {
    const styleName = BASE_STYLES.find(s => s.id === selectedStyle)?.name;
    const permName = PERM_STYLES.find(p => p.id === selectedPerm)?.name;

    localStorage.setItem(
      'simulator_result',
      JSON.stringify({
        style: selectedStyle,
        color: selectedColor,
        perm: selectedPerm,
      })
    );

    localStorage.setItem(
      'desiredStyle',
      JSON.stringify({
        id: `style-ai-${Date.now()}`,
        image_url: faceImage || '',
        description: `【AIシミュレーション結果】${styleName} × カラー: ${selectedColor}${selectedPerm !== 'none' ? ` × ${permName}` : ''}`,
        is_ai_suggested: true,
        color_hex: selectedColor,
        perm_type: selectedPerm,
        refined_details: refinedDetails,
        chat_history: chatMessages
      }),
    );
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowAuth(true);
    } else {
      syncAndNavigate();
    }
  };

  const syncAndNavigate = async () => {
    // Simulate syncing to backend
    const qData = localStorage.getItem('questionnaire');
    if (qData) {
      try {
        await questionnaireApi.create(JSON.parse(qData));
      } catch (e) {
        console.error("Failed to sync questionnaire", e);
      }
    }
    
    const styleData = localStorage.getItem('desiredStyle');
    if (styleData) {
      try {
        await desiredStyleApi.create(JSON.parse(styleData));
      } catch (e) {
        console.error("Failed to sync style", e);
      }
    }

    const redirectUrl = localStorage.getItem('redirectAfterStyleSelection');
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterStyleSelection');
      navigate(redirectUrl);
    } else {
      navigate('/stylists');
    }
  };

  // Get perm CSS effect
  const getPermOverlayStyle = (): React.CSSProperties => {
    const perm = PERM_STYLES.find(p => p.id === selectedPerm);
    if (!perm || perm.intensity === 0) return {};
    const intensity = perm.intensity;
    return {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: '30%',
      backgroundImage: `repeating-linear-gradient(${intensity > 1 ? '0deg' : '10deg'}, transparent, transparent ${12 - intensity * 2}px, rgba(255,255,255,0.04) ${12 - intensity * 2}px, rgba(255,255,255,0.04) ${14 - intensity * 2}px)`,
      maskImage: 'radial-gradient(ellipse at top, black 40%, transparent 70%)',
      WebkitMaskImage: 'radial-gradient(ellipse at top, black 40%, transparent 70%)',
      pointerEvents: 'none' as const,
      zIndex: 3,
      animation: `permWave ${3 - intensity * 0.5}s ease-in-out infinite alternate`,
    };
  };

  const filteredPermStyles = PERM_STYLES.filter(p => p.gender.includes(genderFilter));

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))', display: 'flex', flexDirection: 'column' }}>
      
      {/* ─── STEP 1: UPLOAD ─── */}
      {step === 'upload' && (
        <div className="container container-sm" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
              顔写真を<span className="text-gradient">アップロード</span>
            </h1>
            <p className="text-secondary">
              あなたの顔写真を使って、AIが似合う髪型をシミュレーションします。<br />
              正面を向いた、明るい写真がおすすめです。
            </p>
          </div>

          {!faceImage ? (
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">
                <Upload size={64} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                写真をドラッグ＆ドロップ
              </h3>
              <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-md)' }}>
                または
              </p>
              <button className="btn btn-outline" type="button">
                <ImageIcon size={16} />
                ファイルを選択
              </button>
            </div>
          ) : (
            <div className="animate-scale-in" style={{ textAlign: 'center' }}>
              <div className="upload-preview" style={{ maxWidth: '300px', margin: '0 auto', aspectRatio: '3/4', objectFit: 'cover' }}>
                <img src={faceImage} alt="Face preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                <button
                  className="remove-btn"
                  onClick={() => setFaceImage(null)}
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <div className="flex justify-between" style={{ marginTop: 'var(--space-xl)' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/style-choice')}>
              <ChevronLeft size={18} />
              戻る
            </button>
            <button
              className="btn btn-primary"
              onClick={startAnalysis}
              disabled={!faceImage}
              style={{ opacity: faceImage ? 1 : 0.5 }}
            >
              シミュレーションを開始
              <Sparkles size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: ANALYZING ─── */}
      {step === 'analyzing' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="pulse-animation" style={{ margin: '0 auto var(--space-xl)', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)' }}>
              <Sparkles size={40} color="white" />
            </div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-md)' }} className="animate-fade-in-up">
              AIが顔型・パーソナルカラーを分析中...
            </h2>
            <p className="text-secondary animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              問診データ（ブリーチ履歴等）と照合しています
            </p>
          </div>
        </div>
      )}

      {/* ─── STEP 3: SIMULATOR STUDIO ─── */}
      {step === 'simulator' && (
        <div className="container animate-fade-in" style={{ padding: 'var(--space-md)', maxWidth: '1024px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--header-height))' }}>
          
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} className="text-gradient" />
              シミュレーション・スタジオ
            </h2>
            <div className="badge badge-success flex items-center gap-xs">
              <CheckCircle2 size={14} /> AI 診断・シミュレーター連動中
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-lg" style={{ flex: 1, alignItems: 'stretch' }}>
            
            {/* COLUMN 1: Visual Simulator & Controls */}
            <div className="flex flex-col gap-md" style={{ minWidth: 0 }}>
              {/* Main Preview Area */}
              <div
                className="glass-card-static"
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: 0,
                  minHeight: '340px',
                  maxHeight: '400px',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                {/* AI Image Regeneration Overlay */}
                {regeneratingImage && (
                  <div 
                    className="flex flex-col items-center justify-center animate-fade-in"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(10, 10, 15, 0.75)',
                      backdropFilter: 'blur(8px)',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--space-md)'
                    }}
                  >
                    <div className="pulse-animation" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
                      <Sparkles size={22} color="white" className="animate-pulse" />
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
                      AI画像生成中...
                    </span>
                  </div>
                )}

                {faceImage && (
                  <img 
                    src={faceImage} 
                    alt="Simulated face" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                )}
                
                {/* Color tint overlay */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: '30%',
                    background: selectedColor,
                    mixBlendMode: 'color',
                    opacity: 0.6,
                    maskImage: 'radial-gradient(ellipse at top, black 40%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at top, black 40%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Perm wave overlay */}
                {selectedPerm !== 'none' && <div style={getPermOverlayStyle()} />}

                {/* Style Indicator Overlay */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-full)', color: 'white', fontSize: '0.7rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
                  {BASE_STYLES.find(s => s.id === selectedStyle)?.name}
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', background: selectedColor, borderRadius: '50%', margin: '0 4px', border: '1px solid rgba(255,255,255,0.5)' }} />
                  {selectedPerm !== 'none' && ` × ${PERM_STYLES.find(p => p.id === selectedPerm)?.name}`}
                </div>

                {/* Warning Alert */}
                {showWarning && (
                  <div className="animate-fade-in-up" style={{ position: 'absolute', bottom: '12px', left: '12px', width: 'calc(100% - 24px)', background: 'var(--gradient-warning)', padding: '0.625rem', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.7rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 10 }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ flex: 1, wordBreak: 'break-word', lineHeight: 1.4 }}><strong>AI診断:</strong> 黒染めの履歴があるため、この明るさのカラーは1回の施術では難しい可能性があります。</span>
                  </div>
                )}

                {/* Perm Warning */}
                {permWarning && !showWarning && (
                  <div className="animate-fade-in-up" style={{ position: 'absolute', bottom: '12px', left: '12px', width: 'calc(100% - 24px)', background: 'var(--gradient-danger)', padding: '0.625rem', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.7rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 10 }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ flex: 1, wordBreak: 'break-word', lineHeight: 1.4 }}><strong>⚠️ パーマリスク:</strong> {permWarning}</span>
                  </div>
                )}
              </div>

              {/* Controls Area */}
              <div className="glass-card-static" style={{ padding: 'var(--space-sm) var(--space-md)', width: '100%', minWidth: 0 }}>
                {/* Style Selector */}
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <div className="flex items-center gap-sm text-sm text-secondary" style={{ marginBottom: 'var(--space-xs)', fontWeight: 600, fontSize: '0.75rem' }}>
                    <SlidersHorizontal size={12} />
                    ベーススタイル
                  </div>
                  <div className="flex gap-xs hide-scrollbar" style={{ overflowX: 'auto', width: '100%', paddingBottom: '4px' }}>
                    {BASE_STYLES.map(style => (
                      <button
                        key={style.id}
                        className={`btn ${selectedStyle === style.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setSelectedStyle(style.id)}
                        style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', fontSize: '0.7rem', padding: '0.375rem 0.75rem' }}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <div className="flex items-center gap-sm text-sm text-secondary" style={{ marginBottom: 'var(--space-xs)', fontWeight: 600, fontSize: '0.75rem' }}>
                    <Sparkles size={12} />
                    髪色
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: '2px', overflowX: 'auto', width: '100%', padding: '8px 0', margin: '-8px 0' }}>
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          width: '100%',
                          aspectRatio: '1/1',
                          minWidth: '14px',
                          background: color,
                          border: selectedColor === color ? '2px solid white' : 'none',
                          boxShadow: selectedColor === color ? '0 0 0 2px var(--color-primary)' : 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          padding: 0,
                          transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                          zIndex: selectedColor === color ? 10 : 1,
                          position: 'relative'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Perm Selector (NEW) */}
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xs)' }}>
                    <div className="flex items-center gap-sm text-sm text-secondary" style={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      <Waves size={12} />
                      パーマ
                    </div>
                    <div className="flex gap-xs">
                      <button
                        className={`chip ${genderFilter === 'ladies' ? 'chip-active' : ''}`}
                        onClick={() => { setGenderFilter('ladies'); setSelectedPerm('none'); }}
                        style={{ cursor: 'pointer', fontSize: '0.6rem', padding: '0.125rem 0.5rem' }}
                      >
                        レディース
                      </button>
                      <button
                        className={`chip ${genderFilter === 'mens' ? 'chip-active' : ''}`}
                        onClick={() => { setGenderFilter('mens'); setSelectedPerm('none'); }}
                        style={{ cursor: 'pointer', fontSize: '0.6rem', padding: '0.125rem 0.5rem' }}
                      >
                        メンズ
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-xs hide-scrollbar" style={{ overflowX: 'auto', width: '100%', paddingBottom: '4px' }}>
                    {filteredPermStyles.map(perm => (
                      <button
                        key={perm.id}
                        className={`btn ${selectedPerm === perm.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setSelectedPerm(perm.id)}
                        style={{ flexShrink: 0, borderRadius: 'var(--radius-full)', fontSize: '0.65rem', padding: '0.375rem 0.625rem', gap: '0.25rem' }}
                      >
                        <span>{perm.icon}</span>
                        {perm.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: AI Stylist Chat & Tags */}
            <div className="flex flex-col glass-card-static" style={{ padding: 'var(--space-md)', justifyContent: 'space-between', height: '100%', minHeight: '400px', width: '100%', minWidth: 0 }}>
              
              <div className="flex flex-col" style={{ flex: 1, overflow: 'hidden' }}>
                {/* AI Header */}
                <div className="flex items-center gap-md" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
                    <Sparkles size={18} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>AIスタイリスト Miyabi</h3>
                    <span className="text-xs text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                      オンライン・相談対応中
                    </span>
                  </div>
                </div>

                {/* Refined Details list (Tags) */}
                <div style={{ marginBottom: 'var(--space-sm)' }}>
                  <div className="flex items-center gap-xs text-xs text-secondary" style={{ marginBottom: '4px', fontWeight: 600, fontSize: '0.65rem' }}>
                    <Tag size={10} />
                    こだわり条件 ({refinedDetails.length})
                  </div>
                  {refinedDetails.length === 0 ? (
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '4px var(--space-sm)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-default)' }}>
                      チャットで相談すると条件として登録されます
                    </div>
                  ) : (
                    <div className="flex gap-xs flex-wrap" style={{ maxHeight: '60px', overflowY: 'auto', padding: '2px' }}>
                      {refinedDetails.map(tag => (
                        <span key={tag} className="chip chip-pink" style={{ padding: '0.125rem 0.5rem', fontSize: '0.6rem' }}>
                          {tag}
                          <button 
                            onClick={() => removeRefinedDetail(tag)} 
                            style={{ all: 'unset', cursor: 'pointer', marginLeft: '4px', fontWeight: 'bold', opacity: 0.7 }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat History Box */}
                <div 
                  style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    background: 'rgba(0,0,0,0.2)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: 'var(--space-sm)', 
                    marginBottom: 'var(--space-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-sm)',
                    minHeight: '200px',
                    maxHeight: '400px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`chat-bubble ${msg.sender === 'user' ? 'sent' : 'received'}`}
                      style={{ 
                        padding: '0.5rem 0.75rem', 
                        fontSize: '0.75rem',
                        animationDelay: '50ms',
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        background: msg.sender === 'user' ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
                        color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                        maxWidth: '85%'
                      }}
                    >
                      {msg.imageUrl && (
                        <div style={{ marginBottom: '8px' }}>
                          <img src={msg.imageUrl} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: '4px' }} />
                        </div>
                      )}
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                      <span style={{ display: 'block', fontSize: '0.55rem', textAlign: 'right', marginTop: '2px', opacity: 0.6 }}>
                        {msg.time}
                      </span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="chat-bubble received" style={{ padding: '0.5rem 0.75rem', alignSelf: 'flex-start', background: 'var(--bg-elevated)' }}>
                      <div className="flex gap-xs items-center" style={{ height: '14px' }}>
                        <span className="animate-pulse" style={{ width: '5px', height: '5px', background: 'var(--text-secondary)', borderRadius: '50%' }} />
                        <span className="animate-pulse" style={{ width: '5px', height: '5px', background: 'var(--text-secondary)', borderRadius: '50%', animationDelay: '200ms' }} />
                        <span className="animate-pulse" style={{ width: '5px', height: '5px', background: 'var(--text-secondary)', borderRadius: '50%', animationDelay: '400ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Chat Input & Suggestions */}
              <div>
                <div className="flex gap-xs hide-scrollbar" style={{ overflowX: 'auto', marginBottom: 'var(--space-sm)', paddingBottom: '4px', width: '100%' }}>
                  {[
                    'どんな髪型が似合う？',
                    'パーマをかけたい',
                    '前髪をシースルーにしたい',
                    'ダメージを抑えたい',
                    '朝のスタイリングを楽にしたい',
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      className="chip"
                      onClick={() => handleSendMessage(suggestion)}
                      style={{ flexShrink: 0, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.6rem', padding: '0.25rem 0.5rem', background: 'var(--bg-tertiary)' }}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>

                <div className="flex gap-sm">
                  <input type="file" accept="image/*" hidden ref={chatFileInputRef} onChange={handleImageSelect} />
                  <button 
                    className="btn btn-secondary btn-icon" 
                    onClick={() => chatFileInputRef.current?.click()}
                    style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem' }}
                    title="画像をアップロード"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <input
                    type="text"
                    className="chat-input flex-1"
                    placeholder="相談内容を入力..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage(chatInput);
                    }}
                    style={{ fontSize: '0.875rem', padding: '0.625rem 1rem', flex: 1, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleSendMessage(chatInput)}
                    style={{ padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-full)' }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Actions */}
          <div className="flex flex-mobile-col gap-md gap-mobile-sm" style={{ marginTop: 'var(--space-md)' }}>
            <button 
              className="btn btn-secondary btn-lg" 
              onClick={() => setStep('upload')}
              style={{ flex: 1 }}
            >
              <ChevronLeft size={18} />
              写真を再アップロード
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleComplete}
              style={{ flex: 2 }}
            >
              このスタイルで美容師を探す
              <ChevronRight size={18} />
            </button>
          </div>

        </div>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            syncAndNavigate();
          }}
        />
      )}
    </div>
  );
}
