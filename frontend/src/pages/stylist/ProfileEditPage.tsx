import { useState } from 'react';
import { Save, Plus, X, User, Briefcase, Package, MapPin } from 'lucide-react';

export default function ProfileEditPage() {
  const [profile, setProfile] = useState({
    display_name: '田中 ゆき',
    bio: 'ハイトーンカラーやバレイヤージュを得意としています。海外で培った技術で、一人ひとりの骨格やライフスタイルに合わせた独自のカラー表現をご提案します。',
    specialties: ['highlight', 'balayage', 'double_color', 'bleach', 'design_color'],
    product_brands: ['WELLA', 'THROW', 'ADMIIO', 'FIOLE'],
    years_experience: 8,
    location: '東京都渋谷区',
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [saved, setSaved] = useState(false);

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties.includes(newSpecialty.trim())) {
      setProfile({ ...profile, specialties: [...profile.specialties, newSpecialty.trim()] });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (sp: string) => {
    setProfile({ ...profile, specialties: profile.specialties.filter((s) => s !== sp) });
  };

  const addBrand = () => {
    if (newBrand.trim() && !profile.product_brands.includes(newBrand.trim())) {
      setProfile({ ...profile, product_brands: [...profile.product_brands, newBrand.trim()] });
      setNewBrand('');
    }
  };

  const removeBrand = (brand: string) => {
    setProfile({ ...profile, product_brands: profile.product_brands.filter((b) => b !== brand) });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: '700px' }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            プロフィール編集
          </h1>
          <p className="text-secondary">あなたのスキルと取り扱い情報を更新して、マッチング精度を向上させましょう</p>
        </div>

        {/* Avatar & Name */}
        <div className="glass-card-static" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            <User size={18} />
            基本情報
          </h3>
          <div className="flex items-center gap-lg" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="stylist-avatar stylist-avatar-lg">
              {profile.display_name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div className="form-group">
                <label className="form-label">表示名</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label flex items-center gap-sm">
              <MapPin size={14} />
              エリア
            </label>
            <input
              type="text"
              className="form-input"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="例: 渋谷, 東京"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
            <label className="form-label flex items-center gap-sm">
              <Briefcase size={14} />
              経験年数
            </label>
            <input
              type="number"
              className="form-input"
              value={profile.years_experience}
              onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) || 0 })}
              min="0"
              max="50"
              style={{ maxWidth: '120px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">自己紹介</label>
            <textarea
              className="form-input form-textarea"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="あなたの得意分野やこだわりを書いてください"
              style={{ minHeight: '120px' }}
            />
          </div>
        </div>

        {/* Specialties */}
        <div className="glass-card-static" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            <Briefcase size={18} />
            得意メニュー
          </h3>
          <div className="flex gap-sm flex-wrap" style={{ marginBottom: 'var(--space-md)' }}>
            {profile.specialties.map((sp) => (
              <span key={sp} className="chip" style={{ padding: '0.375rem 0.75rem' }}>
                {sp}
                <button
                  onClick={() => removeSpecialty(sp)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: '0.25rem',
                    display: 'inline-flex',
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-sm">
            <input
              type="text"
              className="form-input"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              placeholder="メニューを追加"
              onKeyDown={(e) => e.key === 'Enter' && addSpecialty()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-outline btn-sm" onClick={addSpecialty}>
              <Plus size={16} />
              追加
            </button>
          </div>
        </div>

        {/* Product Brands */}
        <div className="glass-card-static" style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            <Package size={18} />
            取扱い薬剤メーカー
          </h3>
          <div className="flex gap-sm flex-wrap" style={{ marginBottom: 'var(--space-md)' }}>
            {profile.product_brands.map((brand) => (
              <span key={brand} className="chip chip-cyan" style={{ padding: '0.375rem 0.75rem' }}>
                {brand}
                <button
                  onClick={() => removeBrand(brand)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: 0,
                    marginLeft: '0.25rem',
                    display: 'inline-flex',
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-sm">
            <input
              type="text"
              className="form-input"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              placeholder="ブランドを追加"
              onKeyDown={(e) => e.key === 'Enter' && addBrand()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-outline btn-sm" onClick={addBrand}>
              <Plus size={16} />
              追加
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          className={`btn ${saved ? 'btn-success' : 'btn-primary'} btn-lg btn-full`}
          onClick={handleSave}
        >
          <Save size={18} />
          {saved ? '保存しました！' : 'プロフィールを保存'}
        </button>
      </div>
    </div>
  );
}
