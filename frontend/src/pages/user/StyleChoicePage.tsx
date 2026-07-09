import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Wand2, ImagePlus, Lock, Crown, X, Star } from 'lucide-react';

export default function StyleChoicePage() {
  const navigate = useNavigate();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const isPremiumUser = localStorage.getItem('isPremiumUser') === 'true';

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container container-sm" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            理想のスタイルを
            <span className="text-gradient">見つけよう</span>
          </h1>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            お手持ちの写真をアップするか、AIにぴったりの髪型を提案してもらいましょう
          </p>
        </div>

        {/* Choice Cards */}
        <div className="flex flex-col gap-lg">
          {/* Option A: AI Suggestion */}
          <button
            onClick={() => {
              if (isPremiumUser) {
                navigate('/suggest-style');
              } else {
                setShowPremiumModal(true);
              }
            }}
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
            }}
          >
            <div
              className="glass-card"
              style={{
                padding: 'var(--space-2xl)',
                position: 'relative',
                overflow: 'hidden',
                borderColor: 'rgba(139, 92, 246, 0.3)',
              }}
            >
              {/* Recommended badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                おすすめ
              </div>

              {/* Decorative gradient orb */}
              <div
                style={{
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                  top: '-40px',
                  right: '-40px',
                  pointerEvents: 'none',
                }}
              />

              <div className="flex items-start gap-lg">
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                  }}
                >
                  <Wand2 size={28} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="flex items-center gap-xs" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                    {!isPremiumUser && <Lock size={18} className="text-accent" style={{ color: '#F59E0B' }} />}
                    AIに提案してもらう
                  </h3>
                  <p className="text-secondary text-sm" style={{ lineHeight: 1.7, marginBottom: 'var(--space-md)' }}>
                    あなたの髪の状態・好みに合わせて、AIが実現可能なスタイルを提案します。
                    「何にしようか迷っている」方におすすめ。
                  </p>
                  <div className="flex gap-xs flex-wrap">
                    <span className="chip">トレンド提案</span>
                    <span className="chip chip-pink">実現可能性診断</span>
                    <span className="chip chip-cyan">パーソナライズ</span>
                  </div>
                </div>
                <ChevronRight size={24} style={{ color: 'var(--text-muted)', flexShrink: 0, alignSelf: 'center' }} />
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-md" style={{ padding: '0 var(--space-lg)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
            <span className="text-muted text-sm">または</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
          </div>

          {/* Option B: Upload Own Image */}
          <button
            onClick={() => navigate('/upload-style')}
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
            }}
          >
            <div
              className="glass-card"
              style={{ padding: 'var(--space-2xl)' }}
            >
              <div className="flex items-start gap-lg">
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ImagePlus size={28} style={{ color: 'var(--color-accent-light)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                    自分で画像をアップロード
                  </h3>
                  <p className="text-secondary text-sm" style={{ lineHeight: 1.7, marginBottom: 'var(--space-md)' }}>
                    Pinterest・Instagramなどで見つけた「なりたいスタイル」の写真を持ち込みできます。
                    理想のイメージがすでにある方向け。
                  </p>
                  <div className="flex gap-xs flex-wrap">
                    <span className="chip chip-cyan">持ち込み画像</span>
                    <span className="chip">自由なスタイル指定</span>
                  </div>
                </div>
                <ChevronRight size={24} style={{ color: 'var(--text-muted)', flexShrink: 0, alignSelf: 'center' }} />
              </div>
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-md" style={{ padding: '0 var(--space-lg)' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
            <span className="text-muted text-sm">または</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
          </div>

          {/* Option C: Catalog */}
          <button
            onClick={() => navigate('/catalog')}
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
            }}
          >
            <div
              className="glass-card"
              style={{ padding: 'var(--space-2xl)' }}
            >
              <div className="flex items-start gap-lg">
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary-light)' }}>
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                    カタログから選ぶ
                  </h3>
                  <p className="text-secondary text-sm" style={{ lineHeight: 1.7, marginBottom: 'var(--space-md)' }}>
                    あらかじめ用意された人気のスタイルから、お好みのものを選択します。
                    画像を用意するのが面倒な方におすすめ。
                  </p>
                  <div className="flex gap-xs flex-wrap">
                    <span className="chip chip-pink">簡単選択</span>
                    <span className="chip">人気スタイル</span>
                  </div>
                </div>
                <ChevronRight size={24} style={{ color: 'var(--text-muted)', flexShrink: 0, alignSelf: 'center' }} />
              </div>
            </div>
          </button>
        </div>
      </div>

      {showPremiumModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-lg)',
          }}
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            className="glass-card-static animate-scale-in"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: 'var(--space-xl)',
              textAlign: 'center',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setShowPremiumModal(false)}
              style={{ position: 'absolute', top: 'var(--space-sm)', right: 'var(--space-sm)' }}
            >
              <X size={18} />
            </button>

            {/* Crown icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg)',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)',
            }}>
              <Crown size={32} color="white" />
            </div>

            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
              プレミアムプラン限定
            </h2>

            <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)', lineHeight: 1.6, fontSize: 'var(--font-size-sm)' }}>
              「<strong>AI顔型診断・スタイル提案</strong>」はプレミアムプランでのみご利用いただけます。
            </p>

            <div style={{
              padding: 'var(--space-md)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-lg)',
              textAlign: 'left',
            }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-sm)', color: '#FBBF24' }}>
                ✨ プレミアムプランの特典
              </h4>
              <ul style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.8, listStyle: 'none', padding: 0 }}>
                <li className="flex items-center gap-sm">
                  <Star size={12} style={{ color: '#FBBF24', flexShrink: 0 }} />
                  AIによる顔型・骨格診断と最適スタイルの自動提案
                </li>
                <li className="flex items-center gap-sm">
                  <Star size={12} style={{ color: '#FBBF24', flexShrink: 0 }} />
                  「AIに提案してもらう」機能のアンロック
                </li>
                <li className="flex items-center gap-sm">
                  <Star size={12} style={{ color: '#FBBF24', flexShrink: 0 }} />
                  カタログのフリーワード検索・ジャンル絞り込み機能
                </li>
              </ul>
            </div>

            <button
              className="btn btn-lg btn-full"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: 'white',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                marginBottom: 'var(--space-sm)',
              }}
              onClick={() => {
                navigate('/premium');
              }}
            >
              <Crown size={18} />
              プレミアムプランにアップグレード
            </button>

            <button
              className="btn btn-ghost btn-full text-sm"
              onClick={() => setShowPremiumModal(false)}
              style={{ color: 'var(--text-secondary)' }}
            >
              あとで検討する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
