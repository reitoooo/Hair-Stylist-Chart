import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Scissors, Crown } from 'lucide-react';
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
import './styles/index.css';

function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStylistView = location.pathname.startsWith('/stylist/');
  const isPremiumUser = sessionStorage.getItem('isPremiumUser') === 'true';

  return (
    <header className="app-header">
      <div className="container flex items-center justify-between" style={{ maxWidth: '100%' }}>
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scissors size={24} />
            HairMatch
          </span>
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
                  <Link to="/stylist/profile" className={`nav-link ${location.pathname === '/stylist/profile' ? 'active' : ''}`}>
                    プロフィール
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-sm">
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
              <Link to="/stylist/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>プロフィール</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function DebugPanel() {
  const [open, setOpen] = useState(false);

  const clearData = () => {
    sessionStorage.removeItem('questionnaire');
    sessionStorage.removeItem('desiredStyle');
    sessionStorage.removeItem('allergyChecklist');
    sessionStorage.removeItem('lastBooking');
    alert('問診データとスタイル選択データを消去しました。');
    window.location.reload();
  };

  const togglePremium = () => {
    const isPremium = sessionStorage.getItem('isPremiumUser') === 'true';
    sessionStorage.setItem('isPremiumUser', isPremium ? 'false' : 'true');
    alert(`プレミアムプランを ${isPremium ? 'オフ' : 'オン'} にしました。`);
    window.location.reload();
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {open ? (
        <div className="glass-card-static" style={{ padding: 'var(--space-md)', width: '240px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary-light)' }}>🔧 テスト用デバッグツール</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} style={{ padding: '0.25rem' }}>✕</button>
          </div>
          <div className="flex flex-col gap-xs">
            <button className="btn btn-secondary btn-sm btn-full" onClick={clearData} style={{ fontSize: '0.75rem' }}>
              問診データをクリア
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

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/stylist/client/:clientId" element={<ClientHistoryPage />} />
          <Route path="/stylist/profile" element={<ProfileEditPage />} />
        </Routes>
      </main>
      <DebugPanel />
    </BrowserRouter>
  );
}

export default App;
