import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Award, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { StylistProfile, QuestionnaireData } from '../../types';

// Demo stylist data (mirrors backend seed data)
const DEMO_STYLISTS: StylistProfile[] = [
  {
    id: 'stylist-001',
    profile_id: 'profile-stylist-001',
    display_name: '田中 ゆき',
    avatar_url: null,
    bio: 'ハイトーンカラーやバレイヤージュを得意としています。海外で培った技術で、一人ひとりの骨格やライフスタイルに合わせた独自のカラー表現をご提案します。',
    specialties: ['highlight', 'balayage', 'double_color', 'bleach', 'design_color'],
    product_brands: ['WELLA', 'THROW', 'ADMIIO', 'FIOLE'],
    years_experience: 8,
    location: '東京都渋谷区',
    portfolio_urls: [],
    rating: 4.8,
    review_count: 156,
    created_at: new Date().toISOString(),
  },
  {
    id: 'stylist-002',
    profile_id: 'profile-stylist-002',
    display_name: '鈴木 りな',
    avatar_url: null,
    bio: 'ダメージケアを重視したカラーリングのスペシャリスト。最新のケアブリーチ技術を活用し、美しい髪色と健康な髪の両立を目指します。',
    specialties: ['color', 'bleach', 'treatment', 'care_bleach', 'inner_color'],
    product_brands: ['MILBON', 'TOKIO', 'OLAPLEX', 'THROW'],
    years_experience: 5,
    location: '東京都表参道',
    portfolio_urls: [],
    rating: 4.9,
    review_count: 98,
    created_at: new Date().toISOString(),
  },
  {
    id: 'stylist-003',
    profile_id: 'profile-stylist-003',
    display_name: '山本 けんた',
    avatar_url: null,
    bio: 'K-POPやアニメ文化にインスパイアされたトレンドスタイルの提案に情熱を注いでいます。ビビッドカラーの専門家です。',
    specialties: ['vivid_color', 'bleach', 'design_color', 'men_color', 'unicorn_color'],
    product_brands: ['MANIC PANIC', 'COLORR', 'WELLA', 'N.'],
    years_experience: 6,
    location: '東京都原宿',
    portfolio_urls: [],
    rating: 4.7,
    review_count: 203,
    created_at: new Date().toISOString(),
  },
  {
    id: 'stylist-004',
    profile_id: 'profile-stylist-004',
    display_name: '中村 みお',
    avatar_url: null,
    bio: 'ナチュラルで透明感のあるカラーのスペシャリスト。本来の美しさを引き立てる柔らかなグラデーションカラーが得意です。',
    specialties: ['gradation', 'transparent_color', 'natural_highlight', 'color', 'cut'],
    product_brands: ['ILLUMINA', 'ADMIIO', 'ARIMINO', 'MILBON'],
    years_experience: 10,
    location: '東京都銀座',
    portfolio_urls: [],
    rating: 4.9,
    review_count: 312,
    created_at: new Date().toISOString(),
  },
  {
    id: 'stylist-005',
    profile_id: 'profile-stylist-005',
    display_name: '斎藤 はると',
    avatar_url: null,
    bio: '黒染めからのトーンアップや、極度のダメージヘアの修復など、複雑なカラー修正をお任せください。WELLAの元エデュケーター。',
    specialties: ['color_correction', 'bleach', 'damage_repair', 'double_color', 'dark_to_light'],
    product_brands: ['WELLA', 'OLAPLEX', 'TOKIO', 'FIOLE', 'MUCOTA'],
    years_experience: 12,
    location: '東京都新宿区',
    portfolio_urls: [],
    rating: 4.6,
    review_count: 87,
    created_at: new Date().toISOString(),
  },
];

const SPECIALTY_LABELS: Record<string, string> = {
  highlight: 'ハイライト',
  balayage: 'バラヤージュ',
  double_color: 'ダブルカラー',
  bleach: 'ブリーチ',
  design_color: 'デザインカラー',
  color: 'カラー',
  treatment: 'トリートメント',
  care_bleach: 'ケアブリーチ',
  inner_color: 'インナーカラー',
  vivid_color: 'ビビッドカラー',
  men_color: 'メンズカラー',
  unicorn_color: 'ユニコーンカラー',
  gradation: 'グラデーション',
  transparent_color: '透明感カラー',
  natural_highlight: 'ナチュラルハイライト',
  cut: 'カット',
  color_correction: 'カラー修正',
  damage_repair: 'ダメージ修復',
  dark_to_light: '暗→明チェンジ',
};

export default function StylistListPage() {
  const navigate = useNavigate();
  const [stylists] = useState<StylistProfile[]>(DEMO_STYLISTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'experience' | 'reviews'>('match');
  const [showFilters, setShowFilters] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);

  useEffect(() => {
    const qData = localStorage.getItem('questionnaire');
    if (qData) {
      setQuestionnaire(JSON.parse(qData));
    }
  }, []);

  const calculateMatchScore = (stylist: StylistProfile): { score: number; reason: string | null } => {
    if (!questionnaire) return { score: 50, reason: null }; // Default score if no data

    let score = 50; // Base score
    const reasons: string[] = [];

    // Rule 1: High Damage / Bleach
    if (questionnaire.damage_level >= 4 || questionnaire.bleach_count >= 3) {
      if (stylist.specialties.includes('damage_repair') || stylist.specialties.includes('care_bleach')) {
        score += 30;
        reasons.push('ハイダメージケアの専門家です');
      } else {
        score -= 20; // Penalize if they don't have damage repair skills for high damage clients
      }
    }

    // Rule 2: Black Dye History
    if (questionnaire.has_black_dye) {
      if (stylist.specialties.includes('color_correction') || stylist.specialties.includes('dark_to_light')) {
        score += 35;
        reasons.push('複雑な黒染め修正が得意です');
      } else {
        score -= 20; // Penalize for black dye if no correction skills
      }
    }

    // Rule 3: Straightening + Bleach (High Risk)
    if (questionnaire.has_straightening && questionnaire.bleach_count > 0) {
      if (stylist.specialties.includes('damage_repair')) {
        score += 20;
        reasons.push('縮毛矯正×ブリーチ毛の扱いが得意です');
      }
    }

    // Rule 4: Match desired style color (mock check based on specialties)
    const desiredStyleStr = localStorage.getItem('desiredStyle');
    if (desiredStyleStr) {
      const desiredStyle = JSON.parse(desiredStyleStr);
      if (desiredStyle.description?.includes('アッシュ') || desiredStyle.description?.includes('透明感')) {
        if (stylist.specialties.includes('transparent_color')) {
          score += 15;
          reasons.push('ご希望の透明感カラーが得意です');
        }
      }
    }

    // Add rating bonus (up to 10 points)
    score += (stylist.rating - 4.0) * 10;

    return { 
      score: Math.min(Math.max(Math.round(score), 10), 98), // Cap between 10 and 98 (98 looks more realistic than 100)
      reason: reasons.length > 0 ? reasons[0] : null 
    };
  };

  const stylistsWithScores = stylists.map(s => ({
    ...s,
    match: calculateMatchScore(s)
  }));

  const filtered = stylistsWithScores
    .filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.display_name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.specialties.some((sp) => sp.toLowerCase().includes(q) || (SPECIALTY_LABELS[sp] || '').includes(q)) ||
        s.product_brands.some((b) => b.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'match') return b.match.score - a.match.score;
      if (sortBy === 'experience') return b.years_experience - a.years_experience;
      if (sortBy === 'reviews') return b.review_count - a.review_count;
      return b.rating - a.rating;
    });

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            あなたに<span className="text-gradient">ぴったり</span>の美容師
          </h1>
          <p className="text-secondary">
            AIがあなたの髪の状態と希望スタイルに合う美容師をマッチングしました
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="名前・エリア・得意メニューで検索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px', width: '100%' }}
            />
          </div>
          <button
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} btn-icon`}
            onClick={() => setShowFilters(!showFilters)}
            style={{ padding: '0.75rem' }}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Sort Options */}
        {showFilters && (
          <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="flex gap-sm flex-wrap">
              <span className="text-secondary text-sm" style={{ alignSelf: 'center' }}>並び替え:</span>
              {[
                { key: 'match' as const, label: 'おすすめ順 (AI)' },
                { key: 'rating' as const, label: '評価順' },
                { key: 'experience' as const, label: '経験年数順' },
                { key: 'reviews' as const, label: 'レビュー数順' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  className={`chip ${sortBy === opt.key ? 'chip-active' : ''}`}
                  onClick={() => setSortBy(opt.key)}
                  style={{ cursor: 'pointer' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results count */}
        <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-md)' }}>
          {filtered.length}人の美容師が見つかりました
        </p>

        {/* Stylist Cards */}
        <div className="flex flex-col gap-md stagger">
          {filtered.map((stylist) => (
            <div
              key={stylist.id}
              className="stylist-card animate-fade-in-up"
              onClick={() => navigate(`/stylists/${stylist.id}`)}
            >
              <div className="flex gap-lg" style={{ flexWrap: 'wrap', position: 'relative' }}>
                {/* AI Match Badge */}
                {questionnaire && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: stylist.match.score >= 80 ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
                    color: stylist.match.score >= 80 ? 'white' : 'var(--text-primary)',
                    border: stylist.match.score >= 80 ? 'none' : '1px solid var(--border-default)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: stylist.match.score >= 80 ? 'var(--shadow-glow)' : 'var(--shadow-md)',
                    zIndex: 2
                  }}>
                    <Sparkles size={12} style={{ color: stylist.match.score >= 80 ? 'white' : 'var(--color-primary-light)' }} />
                    マッチ度 {stylist.match.score}%
                  </div>
                )}

                {/* Avatar */}
                <div className="stylist-avatar">
                  {stylist.display_name.charAt(0)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                      {stylist.display_name}
                    </h3>
                    <div className="rating" style={{ fontSize: 'var(--font-size-sm)' }}>
                      <Star size={14} fill="currentColor" />
                      <span>{stylist.rating}</span>
                      <span className="text-muted text-xs">({stylist.review_count})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-md text-sm text-secondary" style={{ marginBottom: 'var(--space-xs)' }}>
                    <span className="flex items-center gap-xs">
                      <MapPin size={14} />
                      {stylist.location}
                    </span>
                    <span className="flex items-center gap-xs">
                      <Clock size={14} />
                      {stylist.years_experience}年
                    </span>
                    <span className="flex items-center gap-xs">
                      <Award size={14} />
                      {stylist.product_brands.length}ブランド
                    </span>
                  </div>

                  {/* Match Reason Highlight */}
                  {questionnaire && stylist.match.reason && (
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(139, 92, 246, 0.1)', 
                      color: 'var(--text-accent)', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      marginBottom: 'var(--space-sm)'
                    }}>
                      <Sparkles size={12} />
                      {stylist.match.reason}
                    </div>
                  )}

                  <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
                    {stylist.bio}
                  </p>

                  {/* Specialties */}
                  <div className="flex gap-xs flex-wrap">
                    {stylist.specialties.slice(0, 4).map((sp) => (
                      <span key={sp} className="chip">
                        {SPECIALTY_LABELS[sp] || sp}
                      </span>
                    ))}
                    {stylist.specialties.length > 4 && (
                      <span className="chip chip-pink">+{stylist.specialties.length - 4}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
