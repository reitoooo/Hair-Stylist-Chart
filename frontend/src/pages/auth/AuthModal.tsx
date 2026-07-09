import { useState } from 'react';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export default function AuthModal({
  onClose,
  onSuccess,
  title = "アカウントを作成して結果を見る",
  subtitle = "AIがあなたにぴったりの美容師をマッチングしました。結果を保存して確認しましょう。"
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 認証シミュレーション
    localStorage.setItem('authToken', 'mock-token-123');
    localStorage.setItem('userId', 'user-' + Date.now());
    localStorage.setItem('userName', isLogin ? 'ゲスト' : name);
    onSuccess();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-lg)',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card-static animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: 'var(--space-2xl)',
          position: 'relative',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-focus)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn btn-ghost btn-icon"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--gradient-primary)', margin: '0 auto var(--space-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles color="white" size={28} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>
            {title}
          </h2>
          <p className="text-secondary text-sm">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {/* Debug/Test Buttons */}
          <div style={{
            background: 'var(--bg-elevated)', 
            padding: 'var(--space-sm)', 
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-default)',
            marginBottom: 'var(--space-sm)'
          }}>
            <p className="text-xs text-muted" style={{ marginBottom: 'var(--space-xs)', textAlign: 'center' }}>開発・テスト用モックアカウント</p>
            <div className="flex gap-sm justify-center flex-wrap">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                onClick={() => {
                  setIsLogin(true);
                  setEmail('test@example.com');
                  setPassword('password123');
                }}
              >
                無料ユーザー
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                onClick={() => {
                  setIsLogin(true);
                  setEmail('premium@example.com');
                  setPassword('password123');
                  localStorage.setItem('isPremiumUser', 'true');
                }}
              >
                プレミアムユーザー
              </button>
            </div>
          </div>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">お名前</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '40px', width: '100%' }}
                  placeholder="例: 山田 花子"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">メールアドレス</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">パスワード</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: 'var(--space-sm)' }}>
            {isLogin ? 'ログイン' : '無料で登録して結果を見る'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          <button
            type="button"
            className="btn btn-ghost text-sm"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? '新しくアカウントを作成する' : 'すでにアカウントをお持ちの方はこちら'}
          </button>
        </div>
      </div>
    </div>
  );
}
