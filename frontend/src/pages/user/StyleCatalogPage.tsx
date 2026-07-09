import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Search, Lock, X, Crown, Star, Filter, Loader2 } from 'lucide-react';
import type { StyleTag } from '../../types';
import { STYLE_TAG_LABELS } from '../../types';
import AuthModal from '../auth/AuthModal';
import { desiredStyleApi, questionnaireApi } from '../../lib/api';

const CATALOG_ITEMS = [
  {
    id: 'catalog-short-pink',
    image: '/catalog/short_pink.png',
    title: 'ショートボブ × ピンクブラウン',
    description: '丸みのあるショートボブに、柔らかいピンクブラウンを合わせたスタイル。',
    tags: ['ショート', 'ピンク系', '要ブリーチ'] as string[],
    genreTags: ['girly', 'natural'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-medium-ash',
    image: '/catalog/medium_ash.png',
    title: 'ミディアム × アッシュグレー',
    description: '透明感抜群のアッシュグレーバレイヤージュ。',
    tags: ['ミディアム', 'アッシュ系', '要ブリーチ'],
    genreTags: ['transparent', 'cool'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-long-beige',
    image: '/catalog/long_beige.png',
    title: 'ロング × ミルクティーベージュ',
    description: '明るめのミルクティーベージュで、重たく見えないロングスタイル。',
    tags: ['ロング', 'ベージュ系', '要ブリーチ'],
    genreTags: ['natural', 'transparent'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-vivid-blue',
    image: '/catalog/vivid_blue.png',
    title: 'ロング × ビビッドブルー',
    description: 'ネイビーブルーのインナーカラーが映えるエッジの効いたスタイル。',
    tags: ['ロング', 'インナーカラー', '要ブリーチ'],
    genreTags: ['vivid', 'cool', 'street'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-anime-red',
    image: '/catalog/short_pink.png',
    title: 'ボブ × チェリーレッド',
    description: 'アニメキャラクター風の鮮やかなチェリーレッド。コスプレにも日常にも映えるスタイル。',
    tags: ['ボブ', 'レッド系', '要ブリーチ', 'デザインカラー'],
    genreTags: ['anime', 'vivid'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-kpop-lavender',
    image: '/catalog/medium_ash.png',
    title: 'ミディアム × ラベンダーグレージュ',
    description: 'K-POPアイドル風の透け感のあるラベンダーグレージュ。顔まわりレイヤーがポイント。',
    tags: ['ミディアム', 'ラベンダー系', '要ブリーチ', 'レイヤー'],
    genreTags: ['kpop', 'transparent', 'cool'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-mode-black',
    image: '/catalog/vivid_blue.png',
    title: 'ロング × モードブラック',
    description: '漆黒のストレートロングに、計算されたレイヤーと切りっぱなし前髪。モード感満載。',
    tags: ['ロング', 'ブラック系', 'ストレート'],
    genreTags: ['mode', 'cool', 'classic'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-street-highlight',
    image: '/catalog/long_beige.png',
    title: 'ショート × ストリートハイライト',
    description: 'コントラスト強めのフェイスフレーミングハイライト。個性派ストリートスタイル。',
    tags: ['ショート', 'ハイライト', '要ブリーチ'],
    genreTags: ['street', 'vivid', 'cool'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-natural-brown',
    image: '/catalog/long_beige.png',
    title: 'ミディアム × ナチュラルブラウン',
    description: 'オフィスにもOKな上品ブラウン。ツヤ感重視の大人スタイル。',
    tags: ['ミディアム', 'ブラウン系', 'ブリーチなし'],
    genreTags: ['natural', 'classic'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-girly-perm',
    image: '/catalog/short_pink.png',
    title: 'ロング × ゆるふわウェーブ',
    description: 'パーマで作るゆるふわウェーブ。フェミニンで可愛らしい印象に。',
    tags: ['ロング', 'パーマ', 'ブラウン系'],
    genreTags: ['girly', 'natural'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-anime-silver',
    image: '/catalog/medium_ash.png',
    title: 'ショート × シルバーホワイト',
    description: 'アニメ・ゲームキャラ風のシルバーホワイト。ハイブリーチ必須のハイトーンスタイル。',
    tags: ['ショート', 'シルバー系', '要ブリーチ×3'],
    genreTags: ['anime', 'vivid', 'cool'] as StyleTag[],
    isPremium: false,
  },
  {
    id: 'catalog-kpop-pink',
    image: '/catalog/short_pink.png',
    title: 'ボブ × K-POPピンク',
    description: '韓国アイドル風のパステルピンク。顔型を選ばない万能ボブとの組み合わせ。',
    tags: ['ボブ', 'ピンク系', '要ブリーチ'],
    genreTags: ['kpop', 'girly', 'vivid'] as StyleTag[],
    isPremium: false,
  },
];

const ALL_GENRE_TAGS: StyleTag[] = Object.keys(STYLE_TAG_LABELS) as StyleTag[];

export default function StyleCatalogPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<StyleTag[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingItem, setPendingItem] = useState<typeof CATALOG_ITEMS[0] | null>(null);
  const [premiumFeatureName, setPremiumFeatureName] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isPremiumUser = localStorage.getItem('isPremiumUser') === 'true';

  const toggleGenre = (genre: StyleTag) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const filteredItems = CATALOG_ITEMS.filter(item => {
    // Text search
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      const matchesText = item.title.toLowerCase().includes(lowerSearch) ||
        item.description.toLowerCase().includes(lowerSearch) ||
        item.tags.some(t => t.toLowerCase().includes(lowerSearch));
      if (!matchesText) return false;
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      const hasMatch = selectedGenres.some(g => item.genreTags.includes(g));
      if (!hasMatch) return false;
    }

    return true;
  });

  const handleSelect = (item: typeof CATALOG_ITEMS[0]) => {
    if (item.isPremium) {
      setPremiumFeatureName(item.title);
      setShowPremiumModal(true);
      return;
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      setPendingItem(item);
      setShowAuth(true);
    } else {
      syncAndNavigate(item);
    }
  };

  const syncAndNavigate = async (item: typeof CATALOG_ITEMS[0]) => {
    setIsLoading(true);
    try {
      localStorage.setItem(
        'desiredStyle',
        JSON.stringify({
          id: item.id,
          image_url: item.image,
          description: `【カタログから選択】${item.title}`,
        })
      );

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      {isLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: 'white',
        }}>
          <Loader2 size={48} className="animate-spin" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>スタイルを保存中...</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>スタイリストとのマッチングを準備しています</p>
        </div>
      )}
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
        {/* Header */}
        <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
              カタログから選ぶ
            </h1>
            <p className="text-secondary text-sm">
              なりたいイメージに近いスタイルを選んでください
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card-static" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          {/* Search */}
          <div className="flex gap-sm" style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder={isPremiumUser ? "スタイルを検索... (例: ショート、ピンク、パーマ)" : "スタイルを検索... (プレミアム限定)"}
                value={searchText}
                onChange={(e) => {
                  if (isPremiumUser) {
                    setSearchText(e.target.value);
                  } else {
                    setPremiumFeatureName('カタログフリーワード検索');
                    setShowPremiumModal(true);
                  }
                }}
                style={{ paddingLeft: '36px', paddingRight: isPremiumUser ? '12px' : '36px', width: '100%', cursor: isPremiumUser ? 'text' : 'pointer' }}
                readOnly={!isPremiumUser}
              />
              {!isPremiumUser && <Lock size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }} />}
            </div>
            <button
              className={isPremiumUser ? `btn ${showFilters ? 'btn-primary' : 'btn-secondary'}` : "btn btn-secondary"}
              onClick={() => {
                if (isPremiumUser) {
                  setShowFilters(!showFilters);
                } else {
                  setPremiumFeatureName('詳細なジャンル検索・絞り込み');
                  setShowPremiumModal(true);
                }
              }}
              style={{ position: 'relative', paddingRight: isPremiumUser ? '16px' : '32px' }}
            >
              <Filter size={16} />
              ジャンル
              {isPremiumUser && selectedGenres.length > 0 && (
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0 6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}>
                  {selectedGenres.length}
                </span>
              )}
              {!isPremiumUser && <Lock size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }} />}
            </button>
          </div>

          {/* Genre Tag Filter */}
          {showFilters && (
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-sm)' }}>
                <span className="text-xs text-secondary" style={{ fontWeight: 600 }}>ジャンルで絞り込み</span>
                {selectedGenres.length > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedGenres([])}
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                  >
                    クリア
                  </button>
                )}
              </div>
              <div className="flex gap-sm flex-wrap">
                {ALL_GENRE_TAGS.map(genre => {
                  return (
                    <button
                      key={genre}
                      className={`chip ${selectedGenres.includes(genre) ? 'chip-active' : ''}`}
                      onClick={() => toggleGenre(genre)}
                      style={{
                        cursor: 'pointer',
                        padding: '0.375rem 0.75rem',
                        fontSize: 'var(--font-size-xs)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {STYLE_TAG_LABELS[genre]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
          <span className="text-sm text-secondary">{filteredItems.length}件のスタイル</span>
        </div>

        {/* Catalog Grid */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-lg)' }}>
          {filteredItems.map((item, i) => (
            <div
              key={item.id}
              className="glass-card animate-fade-in-up hover-scale"
              style={{
                animationDelay: `${i * 80}ms`,
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                border: '1px solid var(--border-default)',
                position: 'relative',
              }}
              onClick={() => handleSelect(item)}
            >
              {/* Premium Badge */}
              {item.isPremium && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 5,
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: 'white',
                  padding: '0.25rem 0.625rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                }}>
                  <Lock size={10} />
                  Premium
                </div>
              )}

              <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    filter: item.isPremium ? 'brightness(0.7)' : 'none',
                  }}
                  className="catalog-img"
                />

                {/* Premium lock overlay */}
                {item.isPremium && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(8px)',
                    }}>
                      <Lock size={24} color="rgba(255,255,255,0.7)" />
                    </div>
                  </div>
                )}

                <div
                  className="catalog-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div className="btn btn-primary" style={{ pointerEvents: 'none' }}>
                    {item.isPremium ? (
                      <><Lock size={16} /> プレミアム限定</>
                    ) : (
                      <><CheckCircle2 size={18} /> このスタイルを選択</>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ padding: 'var(--space-md)' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                  {item.title}
                </h3>
                <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-sm)', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  {item.description}
                </p>
                <div className="flex gap-xs flex-wrap">
                  {item.tags.map((tag) => (
                    <span key={tag} className="chip chip-cyan" style={{ fontSize: '0.65rem', padding: '0.125rem 0.5rem' }}>
                      {tag}
                    </span>
                  ))}
                  {item.genreTags.map((genre) => (
                    <span key={genre} className="chip chip-pink" style={{ fontSize: '0.65rem', padding: '0.125rem 0.5rem' }}>
                      {STYLE_TAG_LABELS[genre]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
            <Search size={48} style={{ margin: '0 auto var(--space-md)', opacity: 0.3 }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
              該当するスタイルが見つかりません
            </h3>
            <p className="text-sm">検索条件やジャンルフィルターを変更してみてください</p>
          </div>
        )}
      </div>

      {/* Premium Modal */}
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
              「<strong>{premiumFeatureName}</strong>」はプレミアムプランでのみご利用いただけます。
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
                  アニメ系・K-POP系・モード系など限定スタイルへのアクセス
                </li>
                <li className="flex items-center gap-sm">
                  <Star size={12} style={{ color: '#FBBF24', flexShrink: 0 }} />
                  詳細なジャンル検索・絞り込み機能
                </li>
                <li className="flex items-center gap-sm">
                  <Star size={12} style={{ color: '#FBBF24', flexShrink: 0 }} />
                  優先的なスタイリストマッチング
                </li>
                <li className="flex items-center gap-sm">
                  <Star size={12} style={{ color: '#FBBF24', flexShrink: 0 }} />
                  AI薬剤計算・SOAP形式カルテの閲覧
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
            >
              あとで検討する
            </button>
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => {
            setShowAuth(false);
            setPendingItem(null);
          }}
          onSuccess={() => {
            setShowAuth(false);
            if (pendingItem) {
              syncAndNavigate(pendingItem);
            }
          }}
        />
      )}

      <style>{`
        .catalog-img:hover {
          transform: scale(1.05) !important;
        }
        .glass-card:hover .catalog-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
