import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import LandingPage from './pages/user/LandingPage';
import QuestionnairePage from './pages/user/QuestionnairePage';
import StyleUploadPage from './pages/user/StyleUploadPage';
import StylistListPage from './pages/user/StylistListPage';
import StylistDetailPage from './pages/user/StylistDetailPage';
import StyleChoicePage from './pages/user/StyleChoicePage';
import StyleCatalogPage from './pages/user/StyleCatalogPage';
import SuggestStylePage from './pages/user/SuggestStylePage';
import PremiumPage from './pages/user/PremiumPage';
import BookingPage from './pages/user/BookingPage';
import StylistDashboard from './pages/stylist/DashboardPage';
import RecipeViewPage from './pages/stylist/RecipeViewPage';
import ProfileEditPage from './pages/stylist/ProfileEditPage';
import ChemicalCalculatorPage from './pages/stylist/ChemicalCalculatorPage';
import ClientHistoryPage from './pages/stylist/ClientHistoryPage';
import ClientListPage from './pages/stylist/ClientListPage';
import InventoryManagementPage from './pages/stylist/InventoryManagementPage';
import AuthModal from './pages/auth/AuthModal';
import './styles/index.css';

function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isStylistView = location.pathname.startsWith('/stylist/');
  const isPremiumUser = localStorage.getItem('isPremiumUser') === 'true';

  return (
    <header className="app-header">
      <div className="container flex items-center justify-between" style={{ maxWidth: '100%' }}>
        <Link to="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="StyleRecipe Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
          <span>StyleRecipe</span>
        </Link>

        <nav className="hide-mobile">
          <ul className="nav-links">
            {!isStylistView ? (
              <>
                <li>
                  <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link to="/questionnaire" className={`nav-link ${location.pathname === '/questionnaire' ? 'active' : ''}`}>
                    問診
                  </Link>
                </li>
                <li>
                  <Link to="/stylists" className={`nav-link ${location.pathname.startsWith('/stylists') ? 'active' : ''}`}>
                    美容師を探す
                  </Link>
                </li>
                <li>
                  <Link to="/premium" className={`nav-link ${location.pathname === '/premium' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    プレミアム
                    {isPremiumUser && <Crown size={14} style={{ color: '#F59E0B' }} />}
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/stylist/dashboard" className={`nav-link ${location.pathname === '/stylist/dashboard' ? 'active' : ''}`}>
                    ダッシュボード
                  </Link>
                </li>
                <li>
                  <Link to="/stylist/clients" className={`nav-link ${location.pathname.startsWith('/stylist/client') ? 'active' : ''}`}>
                    顧客リスト
                  </Link>
                </li>
                <li>
                  <Link to="/stylist/inventory" className={`nav-link ${location.pathname === '/stylist/inventory' ? 'active' : ''}`}>
                    薬剤管理
                  </Link>
                </li>
                <li>
                  <Link to="/stylist/profile" className={`nav-link ${location.pathname === '/stylist/profile' ? 'active' : ''}`}>
                    プロフィール
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-sm">
          {!isStylistView && (
            <button
              className="btn btn-ghost btn-sm hide-mobile"
              onClick={() => {
                const token = localStorage.getItem('authToken');
                if (token) {
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('userId');
                  localStorage.removeItem('userName');
                  window.location.reload();
                } else {
                  setShowAuthModal(true);
                }
              }}
            >
              {localStorage.getItem('authToken') ? 'ログアウト' : 'ログイン'}
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(isStylistView ? '/' : '/stylist/dashboard')}
          >
            {isStylistView ? 'ユーザー画面' : '美容師画面'}
          </button>

          <button
            className="btn btn-icon btn-ghost hide-desktop"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-default)',
            padding: 'var(--space-md)',
            zIndex: 99,
            animation: 'fadeInDown 0.2s ease-out',
          }}
        >
          {!isStylistView ? (
            <div className="flex flex-col gap-sm">
              <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ホーム</Link>
              <Link to="/questionnaire" className="nav-link" onClick={() => setMobileMenuOpen(false)}>問診</Link>
              <Link to="/stylists" className="nav-link" onClick={() => setMobileMenuOpen(false)}>美容師を探す</Link>
              <Link to="/premium" className="nav-link" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                プレミアム
                {isPremiumUser && <Crown size={14} style={{ color: '#F59E0B' }} />}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              <Link to="/stylist/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>ダッシュボード</Link>
              <Link to="/stylist/clients" className="nav-link" onClick={() => setMobileMenuOpen(false)}>顧客リスト</Link>
              <Link to="/stylist/inventory" className="nav-link" onClick={() => setMobileMenuOpen(false)}>薬剤管理</Link>
              <Link to="/stylist/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>プロフィール</Link>
            </div>
          )}
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            window.location.reload();
          }}
          title="ログイン / 会員登録"
          subtitle="アカウントを作成して、さらに便利にアプリを使いましょう。"
        />
      )}
    </header>
  );
}

function DebugPanel() {
  const [open, setOpen] = useState(false);

  const clearData = () => {
    localStorage.clear();
    alert('すべてのデータ（問診・スタイル・ログイン状態）を消去し、初期状態に戻しました。');
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    alert('ログアウトしました（Authトークンを削除）');
    window.location.reload();
  };

  const togglePremium = () => {
    const isPremium = localStorage.getItem('isPremiumUser') === 'true';
    localStorage.setItem('isPremiumUser', isPremium ? 'false' : 'true');
    alert(`プレミアムプランを ${isPremium ? 'オフ' : 'オン'} にしました。`);
    window.location.reload();
  };

  return (
    <div className="debug-panel" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {open ? (
        <div className="glass-card-static" style={{ padding: 'var(--space-md)', width: '240px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary-light)' }}>🔧 テスト用デバッグツール</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} style={{ padding: '0.25rem' }}>✕</button>
          </div>
          <div className="flex flex-col gap-xs">
            <button className="btn btn-secondary btn-sm btn-full" onClick={handleLogout} style={{ fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#EF4444' }}>
              ログアウト (Auth解除)
            </button>
            <button className="btn btn-secondary btn-sm btn-full" onClick={clearData} style={{ fontSize: '0.75rem' }}>
              全データをリセット
            </button>
            <button className="btn btn-secondary btn-sm btn-full" onClick={togglePremium} style={{ fontSize: '0.75rem' }}>
              プレミアムプランの切替
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-primary btn-icon"
          onClick={() => setOpen(true)}
          style={{ width: '48px', height: '48px', borderRadius: '50%', boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)' }}
        >
          🔧
        </button>
      )}
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppHeader />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* User (toC) routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/style-choice" element={<StyleChoicePage />} />
          <Route path="/catalog" element={<StyleCatalogPage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/suggest-style" element={<SuggestStylePage />} />
          <Route path="/upload-style" element={<StyleUploadPage />} />
          <Route path="/stylists" element={<StylistListPage />} />
          <Route path="/stylists/:id" element={<StylistDetailPage />} />
          <Route path="/booking/:stylistId" element={<BookingPage />} />

          {/* Stylist (toB) routes */}
          <Route path="/stylist/dashboard" element={<StylistDashboard />} />
          <Route path="/stylist/recipe/:bookingId" element={<RecipeViewPage />} />
          <Route path="/stylist/chemicals/:bookingId" element={<ChemicalCalculatorPage />} />
          <Route path="/stylist/clients" element={<ClientListPage />} />
          <Route path="/stylist/client/:clientId" element={<ClientHistoryPage />} />
          <Route path="/stylist/inventory" element={<InventoryManagementPage />} />
          <Route path="/stylist/profile" element={<ProfileEditPage />} />
        </Routes>
      </main>
      <DebugPanel />
    </BrowserRouter>
  );
}

export default App;
