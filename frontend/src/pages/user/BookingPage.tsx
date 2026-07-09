import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';

export default function BookingPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [qData, setQData] = useState<any>(null);
  const [desiredStyle, setDesiredStyle] = useState<any>(null);

  useEffect(() => {
    const savedQ = localStorage.getItem('questionnaire');
    const savedStyle = localStorage.getItem('desiredStyle');

    if (!savedQ) {
      alert('施術レシピの算出と安全なカルテ作成のため、まずは問診（履歴・アレルギー等の回答）を行ってください。');
      navigate('/questionnaire');
      return;
    }

    if (!savedStyle) {
      alert('希望のヘアスタイルが選択されていません。スタイル選択画面へ移動します。');
      navigate('/style-choice');
      return;
    }

    setQData(JSON.parse(savedQ));
    setDesiredStyle(JSON.parse(savedStyle));
  }, [navigate]);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      weekday: d.toLocaleDateString('ja-JP', { weekday: 'short' }),
    };
  });

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00',
  ];

  const handleSubmit = () => {
    // Generate a new booking record and save it to sessionStorage
    const lengthLabelMap: Record<string, string> = {
      short: 'ショート',
      bob: 'ボブ',
      medium: 'ミディアム',
      long: 'ロング',
      very_long: 'スーパーロング'
    };
    const hairLen = qData ? (lengthLabelMap[qData.hair_length] || qData.hair_length) : 'ミディアム';
    const newBooking = {
      id: `booking-${Date.now()}`,
      customer_name: 'ユーザー (あなた)',
      preferred_datetime: `${selectedDate}T${selectedTime}:00`,
      status: 'pending' as const,
      hair_summary: qData ? `${hairLen} / ブリーチ${qData.bleach_count}回 / ダメージLv${qData.damage_level}` : 'ミディアム / ブリーチ0回 / ダメージLv1',
      desired_style: desiredStyle ? desiredStyle.description : 'AI提案スタイル',
      salon_vibe: qData?.salon_vibe || '気にしない・美容師におまかせ',
      refined_details: desiredStyle?.refined_details || [],
      chat_history: desiredStyle?.chat_history || [],
      created_at: new Date().toISOString()
    };
    localStorage.setItem('lastBooking', JSON.stringify(newBooking));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        className="page-enter"
        style={{
          minHeight: 'calc(100vh - var(--header-height))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="container container-sm" style={{ textAlign: 'center' }}>
          <div
            className="animate-scale-in"
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'var(--gradient-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-xl)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle2 size={48} color="white" />
          </div>

          <h1
            className="animate-fade-in-up"
            style={{
              fontSize: 'var(--font-size-3xl)',
              fontWeight: 800,
              marginBottom: 'var(--space-md)',
              animationDelay: '200ms',
              animationFillMode: 'both',
            }}
          >
            予約リクエストを送信しました！
          </h1>

          <p
            className="text-secondary animate-fade-in-up"
            style={{
              marginBottom: 'var(--space-2xl)',
              lineHeight: 1.7,
              animationDelay: '300ms',
              animationFillMode: 'both',
            }}
          >
            美容師が内容を確認し、承認次第ご連絡します。
            <br />
            AIが施術レシピを自動生成中です...
          </p>

          <div
            className="glass-card-static animate-fade-in-up"
            style={{
              padding: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)',
              animationDelay: '400ms',
              animationFillMode: 'both',
            }}
          >
            <div className="flex flex-col gap-sm text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">予約日時</span>
                <span>{selectedDate} {selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">ステータス</span>
                <span className="badge badge-pending">承認待ち</span>
              </div>
            </div>
          </div>

          <div
            className="ai-disclaimer animate-fade-in-up"
            style={{ animationDelay: '500ms', animationFillMode: 'both' }}
          >
            ⚠️ AIレシピはあくまで参考情報です。最終的な施術判断は担当美容師が行います。
          </div>

          <div className="flex gap-md justify-center" style={{ marginTop: 'var(--space-xl)' }}>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              ホームに戻る
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/stylist/dashboard')}>
              美容師画面で確認
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container container-sm" style={{ padding: 'var(--space-xl) var(--space-lg)' }}>
        {/* Back */}
        <button
          className="btn btn-ghost"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          <ChevronLeft size={18} />
          戻る
        </button>

        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
          予約リクエスト
        </h1>
        <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
          希望の日時を選択して、予約リクエストを送信してください
        </p>

        {/* Date Selection */}
        <div className="glass-card-static" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
            <CalendarDays size={20} className="text-gradient" />
            希望日を選択
          </h3>
          <div className="flex gap-sm flex-wrap">
            {dates.map((d) => (
              <button
                key={d.value}
                className={`btn ${selectedDate === d.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedDate(d.value)}
                style={{
                  flexDirection: 'column',
                  padding: '0.75rem 1rem',
                  minWidth: '70px',
                  gap: '0.125rem',
                }}
              >
                <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>{d.weekday}</span>
                <span style={{ fontWeight: 700 }}>{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="glass-card-static animate-fade-in-up" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
              <Clock size={20} className="text-gradient" />
              希望時間を選択
            </h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 'var(--space-sm)' }}>
              {timeSlots.map((t) => (
                <button
                  key={t}
                  className={`btn ${selectedTime === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Style Preview Summary */}
        {selectedTime && desiredStyle && (
          <div className="glass-card-static animate-fade-in-up" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-sm)' }} className="text-gradient">
              選択したスタイルイメージ
            </h3>
            <div className="flex gap-md items-center" style={{ flexWrap: 'wrap' }}>
              {desiredStyle.image_url && (
                <img 
                  src={desiredStyle.image_url} 
                  alt="Preview" 
                  style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }} 
                />
              )}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{desiredStyle.description}</p>
                {desiredStyle.refined_details && desiredStyle.refined_details.length > 0 ? (
                  <div className="flex gap-xs flex-wrap" style={{ marginTop: 'var(--space-xs)' }}>
                    {desiredStyle.refined_details.map((tag: string) => (
                      <span key={tag} className="chip chip-pink" style={{ fontSize: '0.65rem', padding: '0.125rem 0.5rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-secondary text-xs" style={{ marginTop: 'var(--space-xs)' }}>こだわり条件は指定されていません</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {selectedTime && (
          <div className="glass-card-static animate-fade-in-up" style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">美容師へのメッセージ（任意）</label>
              <textarea
                className="form-input form-textarea"
                placeholder="例: 初めてのブリーチなので不安です、仕上がりのイメージについて相談したいです など"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          className="btn btn-primary btn-lg btn-full"
          onClick={handleSubmit}
          disabled={!selectedDate || !selectedTime}
          style={{
            opacity: selectedDate && selectedTime ? 1 : 0.5,
            marginTop: 'var(--space-md)',
          }}
        >
          <Send size={18} />
          予約リクエストを送信
        </button>

        {/* Disclaimer */}
        <div className="ai-disclaimer" style={{ marginTop: 'var(--space-lg)' }}>
          ⚠️ 予約リクエスト送信後、AIが施術レシピを自動生成します。生成されたレシピはあくまで参考値であり、最終的な施術責任は美容師に帰属します。
        </div>
      </div>
    </div>
  );
}
