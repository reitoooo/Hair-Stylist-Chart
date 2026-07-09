import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Crown, Sparkles, Star, Lock } from 'lucide-react';
import { useState } from 'react';

export default function PremiumPage() {
  const navigate = useNavigate();
  const [successType, setSuccessType] = useState<'upgrade' | 'cancel' | null>(null);
  const isPremiumUser = sessionStorage.getItem('isPremiumUser') === 'true';

  const handleUpgrade = () => {
    sessionStorage.setItem('isPremiumUser', 'true');
    setSuccessType('upgrade');
    setTimeout(() => {
      navigate(-1);
    }, 2000);
  };

  const handleCancel = () => {
    sessionStorage.setItem('isPremiumUser', 'false');
    setSuccessType('cancel');
    setTimeout(() => {
      navigate(-1);
    }, 2000);
  };

  if (successType) {
    const isUpgrade = successType === 'upgrade';
    return (
      <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card-static animate-scale-in" style={{ textAlign: 'center', padding: 'var(--space-3xl)', maxWidth: '400px', width: '100%' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: isUpgrade ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-xl)',
            boxShadow: isUpgrade ? '0 0 30px rgba(245, 158, 11, 0.4)' : '0 0 30px rgba(239, 68, 68, 0.4)'
          }}>
            {isUpgrade ? <Crown size={40} color="white" /> : <Star size={40} color="white" style={{ opacity: 0.5 }} />}
          </div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            {isUpgrade ? 'アップグレード完了！' : 'プラン解約完了'}
          </h2>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
            {isUpgrade ? 'プレミアム機能が全てアンロックされました。' : '無料プランへ移行しました。'}元の画面に戻ります...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container container-sm" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
        {/* Header */}
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-lg)' }}>
          <ChevronLeft size={18} /> 戻る
        </button>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-md)',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)'
          }}>
            <Crown size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            プレミアムプラン
          </h1>
          <p className="text-secondary" style={{ lineHeight: 1.7 }}>
            もっと自分に似合うスタイルを見つけたいあなたへ。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-md" style={{ marginBottom: 'var(--space-2xl)' }}>
          {/* Free Plan */}
          <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
              無料プラン
            </h3>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>
              ¥0<span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}> / 月</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <li className="flex items-center gap-sm text-sm"><CheckCircle2 size={16} color="#34D399" /> 自分でヘアスタイル画像送る</li>
              <li className="flex items-center gap-sm text-sm"><CheckCircle2 size={16} color="#34D399" /> カタログから直接スタイル選択</li>
              <li className="flex items-center gap-sm text-sm"><CheckCircle2 size={16} color="#34D399" /> 詳細な事前カルテ作成・美容師マッチング</li>
              <li className="flex items-center gap-sm text-sm" style={{ color: 'var(--text-muted)', opacity: 0.6 }}><Lock size={14} style={{ color: '#EF4444', flexShrink: 0 }} /> AI顔型診断・スタイル提案</li>
              <li className="flex items-center gap-sm text-sm" style={{ color: 'var(--text-muted)', opacity: 0.6 }}><Lock size={14} style={{ color: '#EF4444', flexShrink: 0 }} /> カタログのフリーワード検索 & 絞り込み</li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column', border: isPremiumUser ? '2px solid rgba(255, 255, 255, 0.15)' : '2px solid rgba(245, 158, 11, 0.5)', position: 'relative' }}>
            {isPremiumUser && (
              <div style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--color-primary-light)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>
                契約中
              </div>
            )}
            {!isPremiumUser && (
              <div style={{ position: 'absolute', top: '-12px', right: '20px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>
                おすすめ
              </div>
            )}
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-md)', color: isPremiumUser ? 'var(--text-primary)' : '#F59E0B' }}>
              プレミアムプラン
            </h3>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-lg)' }}>
              ¥480<span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}> / 月</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <li className="flex items-center gap-sm text-sm"><CheckCircle2 size={16} color="#34D399" /> 無料プランの全機能</li>
              <li className="flex items-start gap-sm text-sm font-bold text-primary-light">
                <Star size={16} color="#FBBF24" style={{ flexShrink: 0, marginTop: '2px' }} />
                AI顔型診断で最適なスタイルを自動提案
              </li>
              <li className="flex items-start gap-sm text-sm font-bold text-primary-light">
                <Star size={16} color="#FBBF24" style={{ flexShrink: 0, marginTop: '2px' }} />
                カタログのフリーワード検索・ジャンル絞り込み
              </li>
            </ul>
            {isPremiumUser ? (
              <button
                className="btn btn-lg btn-full btn-secondary"
                style={{
                  marginTop: 'var(--space-xl)',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#EF4444',
                  fontWeight: 700,
                }}
                onClick={handleCancel}
              >
                プレミアムプランを解約する
              </button>
            ) : (
              <button
                className="btn btn-lg btn-full"
                style={{
                  marginTop: 'var(--space-xl)',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
                }}
                onClick={handleUpgrade}
              >
                <Sparkles size={18} />
                今すぐアップグレードする
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
