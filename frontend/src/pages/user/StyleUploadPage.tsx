import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Image as ImageIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import AuthModal from '../auth/AuthModal';
import { desiredStyleApi, questionnaireApi } from '../../lib/api';

export default function StyleUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleSubmit = () => {
    // Store style data locally
    localStorage.setItem(
      'desiredStyle',
      JSON.stringify({
        id: `style-${Date.now()}`,
        image_url: preview || '',
        description,
      }),
    );

    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowAuth(true);
    } else {
      syncAndNavigate();
    }
  };

  const syncAndNavigate = async () => {
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
  };

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container container-sm" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            理想のスタイルを
            <span className="text-gradient">アップロード</span>
          </h1>
          <p className="text-secondary">
            なりたい髪型の写真をアップロードしてください。
            <br />
            Pinterest・Instagram等で保存した画像でOKです。
          </p>
        </div>

        {/* Upload Zone */}
        {!preview ? (
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">
              <Upload size={64} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
              画像をドラッグ＆ドロップ
            </h3>
            <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-md)' }}>
              または
            </p>
            <button className="btn btn-outline" type="button">
              <ImageIcon size={16} />
              ファイルを選択
            </button>
            <p className="text-muted text-xs" style={{ marginTop: 'var(--space-md)' }}>
              JPG, PNG, WebP — 最大 10MB
            </p>
          </div>
        ) : (
          <div className="animate-scale-in" style={{ textAlign: 'center' }}>
            <div className="upload-preview">
              <img src={preview} alt="Desired style preview" />
              <button
                className="remove-btn"
                onClick={() => setPreview(null)}
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {/* Description */}
        <div className="form-group" style={{ marginTop: 'var(--space-xl)' }}>
          <label className="form-label">希望スタイルの説明（任意）</label>
          <textarea
            className="form-input form-textarea"
            placeholder="例: ミルクティーベージュのハイトーン、顔まわりにレイヤーを入れたい、透明感のあるアッシュ系 など"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ minHeight: '120px' }}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between" style={{ marginTop: 'var(--space-xl)' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/questionnaire')}>
            <ChevronLeft size={18} />
            問診に戻る
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!preview}
            style={{ opacity: preview ? 1 : 0.5 }}
          >
            美容師を探す
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            syncAndNavigate();
          }}
        />
      )}
    </div>
  );
}
