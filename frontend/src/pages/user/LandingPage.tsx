import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Clock, ChevronRight, Star, Zap, Heart } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="page-enter">
      {/* ─── Hero Section ─── */}
      <section
        style={{
          minHeight: 'calc(100vh - var(--header-height))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--gradient-hero)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
            bottom: '-50px',
            left: '-50px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
            top: '40%',
            left: '30%',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>


          {/* Main heading */}
          <h1
            className="animate-fade-in-up"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 'var(--space-lg)',
              animationDelay: '100ms',
              animationFillMode: 'both',
            }}
          >
            <span>「美容室での失敗」を、</span>
            <br />
            <span className="text-gradient">AIの力でゼロにする。</span>
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-in-up"
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto var(--space-2xl)',
              lineHeight: 1.7,
              animationDelay: '200ms',
              animationFillMode: 'both',
            }}
          >
            <span style={{ display: 'inline-block' }}>過去の施術履歴や髪の状態を</span>
            <span style={{ display: 'inline-block' }}>AIが事前分析し、</span>
            <span style={{ display: 'inline-block' }}>最適なレシピを算出。</span>
            <br className="hide-mobile" />
            <span style={{ display: 'inline-block' }}>事前のシミュレーションと</span>
            <span style={{ display: 'inline-block' }}>的確な情報共有で、</span>
            <br className="hide-mobile" />
            <span style={{ display: 'inline-block' }}>「希望通りにならない」</span>
            <span style={{ display: 'inline-block' }}>「髪が傷んでしまった」という</span>
            <span style={{ display: 'inline-block' }}>不安をなくします。</span>
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-in-up flex items-center justify-center gap-md"
            style={{
              animationDelay: '300ms',
              animationFillMode: 'both',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/questionnaire')}
              style={{ minWidth: '200px' }}
            >
              無料で始める
              <ChevronRight size={18} />
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/stylist/dashboard')}
              style={{ minWidth: '200px' }}
            >
              美容師の方はこちら
            </button>
          </div>

          {/* Stats */}
          <div
            className="animate-fade-in-up flex items-center justify-center gap-xl"
            style={{
              marginTop: 'var(--space-3xl)',
              animationDelay: '400ms',
              animationFillMode: 'both',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '500+', label: '登録美容師' },
              { value: '98%', label: '満足度' },
              { value: '3min', label: '問診完了' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }} className="text-gradient">
                  {stat.value}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section style={{ padding: 'var(--space-3xl) 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
            <h2 className="section-title">かんたん3ステップ</h2>
            <p className="section-subtitle">
              わずか3分で、あなたにぴったりの美容師が見つかります
            </p>
          </div>

          <div className="grid grid-cols-3 gap-xl stagger">
            {[
              {
                icon: <Zap size={32} />,
                title: 'STEP 1',
                subtitle: '詳細な髪のカルテ作成',
                desc: '現在の髪の状態や過去の施術履歴を入力。ブリーチや黒染めの回数、アレルギー情報など、美容師が事前に知りたい情報を正確に共有し、施術トラブルを防ぎます。',
                gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              },
              {
                icon: <Heart size={32} />,
                title: 'STEP 2',
                subtitle: 'AI事前相談・シミュレーション',
                desc: 'なりたいスタイル画像をアップするだけで、AIが実現可能性を診断。事前チャットで不安を解消し、カラーやパーマの仕上がりイメージも事前に確認できます。',
                gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
              },
              {
                icon: <Star size={32} />,
                title: 'STEP 3',
                subtitle: 'プロへのレシピ共有 & 予約',
                desc: 'あなたの髪に最適な美容師とマッチング。予約と同時に、AIが算出した最適な薬剤レシピとカルテが美容師に共有され、当日は失敗なくスムーズに施術が開始されます。',
                gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
              },
            ].map((step) => (
              <div
                key={step.title}
                className="glass-card animate-fade-in-up"
                style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-lg)' }}
              >
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: step.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-lg)',
                    color: 'white',
                    boxShadow: `0 8px 32px ${step.gradient.includes('8B5CF6') ? 'rgba(139,92,246,0.3)' : step.gradient.includes('EC4899') ? 'rgba(236,72,153,0.3)' : 'rgba(6,182,212,0.3)'}`,
                  }}
                >
                  {step.icon}
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    color: 'var(--color-primary-light)',
                    marginBottom: 'var(--space-xs)',
                    letterSpacing: '0.1em',
                  }}
                >
                  {step.title}
                </div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                  {step.subtitle}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Value Propositions ─── */}
      <section style={{ padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
            <h2 className="section-title">HairMatchが選ばれる理由</h2>
          </div>

          <div className="grid grid-cols-3 gap-lg stagger">
            {[
              {
                icon: <Shield size={24} />,
                title: '失敗しない安心感',
                desc: 'AIが事前に施術の実現可能性を分析し、最適な薬剤を計算。あなたの髪の状態で「できること」を正確に伝え、髪を傷めるリスクを最小限にします。',
              },
              {
                icon: <Clock size={24} />,
                title: '認識のズレ・不安をゼロに',
                desc: '事前に共有された詳細な髪の履歴とAIチャットのやり取りにより、美容師は準備万端。当日のカウンセリング時間を短縮し、施術に集中できます。',
              },
              {
                icon: <Sparkles size={24} />,
                title: 'カルテ蓄積でよりパーソナルに',
                desc: '過去の施術カルテ（SOAP）や来店履歴が美容師のアプリに蓄積。通うほどにあなたの髪を深く理解した、安全で最適な提案が受けられます。',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-card animate-fade-in-up"
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-50)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary-light)',
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Footer ─── */}
      <section
        style={{
          padding: 'var(--space-3xl) 0',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.05))',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: 'var(--space-md)',
              letterSpacing: '-0.02em',
            }}
          >
            あなたの理想の髪型、
            <span className="text-gradient">今すぐ見つけよう</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', fontSize: 'var(--font-size-md)' }}>
            無料で問診を始めて、AIマッチングを体験してください
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/questionnaire')}
          >
            問診スタート
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        style={{
          padding: 'var(--space-xl) 0',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-primary)',
        }}
      >
        <div className="container flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            © 2026 HairMatch. All rights reserved.
          </div>
          <div className="flex gap-lg" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            <a href="#" style={{ color: 'var(--text-muted)' }}>利用規約</a>
            <a href="#" style={{ color: 'var(--text-muted)' }}>プライバシーポリシー</a>
            <a href="#" style={{ color: 'var(--text-muted)' }}>お問い合わせ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
