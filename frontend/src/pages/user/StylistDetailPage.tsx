import { useNavigate, useParams } from 'react-router-dom';
import { Star, MapPin, Clock, ChevronLeft, CalendarDays } from 'lucide-react';

// Same demo data (would come from API in production)
const DEMO_STYLISTS: Record<string, any> = {
  'stylist-001': {
    id: 'stylist-001', display_name: '田中 ゆき', avatar_url: null,
    bio: 'ハイトーンカラーやバレイヤージュを得意としています。海外で培った技術で、一人ひとりの骨格やライフスタイルに合わせた独自のカラー表現をご提案します。ロンドンのサスーンアカデミーで学び、グローバルな視点を取り入れたスタイルを作ります。',
    specialties: ['highlight', 'balayage', 'double_color', 'bleach', 'design_color'],
    product_brands: ['WELLA', 'THROW', 'ADMIIO', 'FIOLE'],
    years_experience: 8, location: '東京都渋谷区', rating: 4.8, review_count: 156,
  },
  'stylist-002': {
    id: 'stylist-002', display_name: '鈴木 りな', avatar_url: null,
    bio: 'ダメージケアを重視したカラーリングのスペシャリスト。OLAPLEXやTOKIO INKARAMIなど最新のケアブリーチ技術を活用し、髪の健康を保ちながら美しいハイトーンカラーを実現します。髪の毛を傷めないカラーリングを第一に考えています。',
    specialties: ['color', 'bleach', 'treatment', 'care_bleach', 'inner_color'],
    product_brands: ['MILBON', 'TOKIO', 'OLAPLEX', 'THROW'],
    years_experience: 5, location: '東京都表参道', rating: 4.9, review_count: 98,
  },
  'stylist-003': {
    id: 'stylist-003', display_name: '山本 けんた', avatar_url: null,
    bio: 'K-POPやアニメ文化にインスパイアされたトレンドスタイルの提案に情熱を注いでいます。ビビッドカラーやクリエイティブなブリーチデザインの専門家です。ユニコーンカラーやスプリットカラーなど、個性的なスタイルはお任せください。',
    specialties: ['vivid_color', 'bleach', 'design_color', 'men_color', 'unicorn_color'],
    product_brands: ['MANIC PANIC', 'COLORR', 'WELLA', 'N.'],
    years_experience: 6, location: '東京都原宿', rating: 4.7, review_count: 203,
  },
  'stylist-004': {
    id: 'stylist-004', display_name: '中村 みお', avatar_url: null,
    bio: 'ナチュラルで透明感のあるカラーのスペシャリスト。本来の美しさを引き立てる柔らかなグラデーションカラーが得意です。細い髪や敏感な頭皮の方にも安心して受けていただけるよう、長期的な髪の健康を優先した優しいアプローチを心がけています。',
    specialties: ['gradation', 'transparent_color', 'natural_highlight', 'color', 'cut'],
    product_brands: ['ILLUMINA', 'ADMIIO', 'ARIMINO', 'MILBON'],
    years_experience: 10, location: '東京都銀座', rating: 4.9, review_count: 312,
  },
  'stylist-005': {
    id: 'stylist-005', display_name: '斎藤 はると', avatar_url: null,
    bio: '黒染めからのトーンアップや、極度のダメージヘアの修復など、複雑なカラー修正をお任せください。WELLAのエデュケーター経験もある12年目のスタイリストです。他店で断られたような難しい施術でも、一度ご相談ください。',
    specialties: ['color_correction', 'bleach', 'damage_repair', 'double_color', 'dark_to_light'],
    product_brands: ['WELLA', 'OLAPLEX', 'TOKIO', 'FIOLE', 'MUCOTA'],
    years_experience: 12, location: '東京都新宿区', rating: 4.6, review_count: 87,
  },
};

const SPECIALTY_LABELS: Record<string, string> = {
  highlight: 'ハイライト', balayage: 'バラヤージュ', double_color: 'ダブルカラー',
  bleach: 'ブリーチ', design_color: 'デザインカラー', color: 'カラー',
  treatment: 'トリートメント', care_bleach: 'ケアブリーチ', inner_color: 'インナーカラー',
  vivid_color: 'ビビッドカラー', men_color: 'メンズカラー', unicorn_color: 'ユニコーンカラー',
  gradation: 'グラデーション', transparent_color: '透明感カラー',
  natural_highlight: 'ナチュラルハイライト', cut: 'カット',
  color_correction: 'カラー修正', damage_repair: 'ダメージ修復', dark_to_light: '暗→明チェンジ',
};

export default function StylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const stylist = DEMO_STYLISTS[id || ''];

  if (!stylist) {
    return (
      <div className="container" style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
        <h2>美容師が見つかりません</h2>
        <button className="btn btn-primary" onClick={() => navigate('/stylists')} style={{ marginTop: 'var(--space-lg)' }}>
          一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container container-md" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
        {/* Back button */}
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/stylists')}
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          <ChevronLeft size={18} />
          美容師一覧に戻る
        </button>

        {/* Profile Header */}
        <div
          className="glass-card-static"
          style={{
            textAlign: 'center',
            padding: 'var(--space-2xl)',
            marginBottom: 'var(--space-lg)',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.04))',
          }}
        >
          <div className="stylist-avatar stylist-avatar-lg" style={{ margin: '0 auto var(--space-lg)' }}>
            {stylist.display_name.charAt(0)}
          </div>

          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            {stylist.display_name}
          </h1>

          <div className="flex items-center justify-center gap-md text-secondary" style={{ marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
            <span className="flex items-center gap-xs">
              <MapPin size={16} />
              {stylist.location}
            </span>
            <span className="flex items-center gap-xs">
              <Clock size={16} />
              経験{stylist.years_experience}年
            </span>
            <span className="rating flex items-center gap-xs">
              <Star size={16} fill="currentColor" />
              {stylist.rating}
              <span className="text-muted">({stylist.review_count}件)</span>
            </span>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-md" style={{ flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                const hasQuestionnaire = sessionStorage.getItem('questionnaire');
                const hasStyle = sessionStorage.getItem('desiredStyle');
                if (!hasQuestionnaire) {
                  sessionStorage.setItem('redirectAfterStyleSelection', `/booking/${stylist.id}`);
                  alert('施術レシピの算出と安全なカルテ作成のため、まずは問診（履歴・アレルギー等の回答）を行ってください。');
                  navigate('/questionnaire');
                } else if (!hasStyle) {
                  sessionStorage.setItem('redirectAfterStyleSelection', `/booking/${stylist.id}`);
                  alert('希望のヘアスタイルが選択されていません。スタイル選択画面へ移動します。');
                  navigate('/style-choice');
                } else {
                  navigate(`/booking/${stylist.id}`);
                }
              }}
            >
              <CalendarDays size={18} />
              この美容師に予約する
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="glass-card-static" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            自己紹介
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--font-size-sm)' }}>
            {stylist.bio}
          </p>
        </div>

        {/* Specialties */}
        <div className="glass-card-static" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            得意メニュー
          </h3>
          <div className="flex gap-sm flex-wrap">
            {stylist.specialties.map((sp: string) => (
              <span key={sp} className="chip" style={{ fontSize: 'var(--font-size-sm)', padding: '0.5rem 1rem' }}>
                {SPECIALTY_LABELS[sp] || sp}
              </span>
            ))}
          </div>
        </div>

        {/* Product Brands */}
        <div className="glass-card-static" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            取扱いブランド
          </h3>
          <div className="flex gap-sm flex-wrap">
            {stylist.product_brands.map((brand: string) => (
              <span key={brand} className="chip chip-cyan" style={{ fontSize: 'var(--font-size-sm)', padding: '0.5rem 1rem' }}>
                {brand}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            padding: 'var(--space-md)',
            background: 'rgba(10, 10, 15, 0.9)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-default)',
            margin: '0 calc(-1 * var(--space-lg))',
            marginTop: 'var(--space-xl)',
          }}
        >
          <div className="flex gap-sm" style={{ maxWidth: 'var(--max-width-md)', margin: '0 auto' }}>
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={() => navigate(`/booking/${stylist.id}`)}
            >
              <CalendarDays size={18} />
              予約リクエストを送る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
