import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import type { BookingStatus } from '../../types';
import { BOOKING_STATUS_LABELS } from '../../types';

interface DemoBooking {
  id: string;
  customer_name: string;
  preferred_datetime: string;
  status: BookingStatus;
  hair_summary: string;
  desired_style: string;
  created_at: string;
  refined_details?: string[];
  chat_history?: Array<{ sender: string; text: string; time: string }>;
}

const DEMO_BOOKINGS: DemoBooking[] = [
  {
    id: 'booking-001',
    customer_name: '桜田 M.',
    preferred_datetime: '2026-07-08T14:00:00',
    status: 'pending',
    hair_summary: 'ミディアム / ブリーチ2回 / ダメージLv3',
    desired_style: 'ミルクティーベージュのハイトーン',
    created_at: '2026-07-06T10:30:00',
  },
  {
    id: 'booking-002',
    customer_name: '小林 A.',
    preferred_datetime: '2026-07-09T11:00:00',
    status: 'pending',
    hair_summary: 'ロング / ブリーチ1回 / ダメージLv2',
    desired_style: 'アッシュグレーのバラヤージュ',
    created_at: '2026-07-06T09:15:00',
  },
  {
    id: 'booking-003',
    customer_name: '高橋 Y.',
    preferred_datetime: '2026-07-07T16:30:00',
    status: 'approved',
    hair_summary: 'ショート / ブリーチ3回 / ダメージLv4',
    desired_style: 'ネイビーブルーのビビッドカラー',
    created_at: '2026-07-05T18:00:00',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<DemoBooking[]>(() => {
    const list = [...DEMO_BOOKINGS];
    const lastB = sessionStorage.getItem('lastBooking');
    if (lastB) {
      const parsed = JSON.parse(lastB);
      if (!list.some(b => b.id === parsed.id)) {
        list.unshift(parsed);
      }
    }
    return list;
  });
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');

  const filtered = bookings.filter((b) => {
    if (activeTab === 'pending') return b.status === 'pending';
    if (activeTab === 'approved') return b.status === 'approved';
    return true;
  });

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(bookings.map((b) => {
      if (b.id === bookingId) {
        const updated = { ...b, status: newStatus };
        const lastB = sessionStorage.getItem('lastBooking');
        if (lastB) {
          const parsed = JSON.parse(lastB);
          if (parsed.id === bookingId) {
            sessionStorage.setItem('lastBooking', JSON.stringify(updated));
          }
        }
        return updated;
      }
      return b;
    }));
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedCount = bookings.filter((b) => b.status === 'approved').length;

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
            ダッシュボード
          </h1>
          <p className="text-secondary">予約リクエストの管理とAIレシピの確認</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
          {[
            { label: '承認待ち', value: pendingCount, color: '#FBBF24', icon: <AlertCircle size={20} /> },
            { label: '承認済み', value: approvedCount, color: '#34D399', icon: <CheckCircle size={20} /> },
            { label: '全予約', value: bookings.length, color: 'var(--color-primary-light)', icon: <Calendar size={20} /> },
          ].map((stat) => (
            <div key={stat.label} className="glass-card-static" style={{ textAlign: 'center' }}>
              <div style={{ color: stat.color, marginBottom: 'var(--space-sm)' }}>{stat.icon}</div>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tab filter */}
        <div className="flex gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
          {[
            { key: 'pending' as const, label: `承認待ち (${pendingCount})` },
            { key: 'approved' as const, label: `承認済み (${approvedCount})` },
            { key: 'all' as const, label: 'すべて' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`chip ${activeTab === tab.key ? 'chip-active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Booking Cards */}
        <div className="flex flex-col gap-md stagger">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="glass-card-static animate-fade-in-up"
              style={{
                borderLeft: `3px solid ${booking.status === 'pending' ? '#FBBF24' :
                    booking.status === 'approved' ? '#34D399' : 'var(--border-default)'
                  }`,
              }}
            >
              <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                <div>
                  <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                    <User size={16} className="text-secondary" />
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                      {booking.customer_name}
                    </h3>
                    <span className={`badge badge-${booking.status}`}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-md text-sm text-secondary">
                    <span className="flex items-center gap-xs">
                      <Calendar size={14} />
                      {new Date(booking.preferred_datetime).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short',
                      })}
                    </span>
                    <span className="flex items-center gap-xs">
                      <Clock size={14} />
                      {new Date(booking.preferred_datetime).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hair summary */}
              <div
                style={{
                  padding: 'var(--space-md)',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                <div className="text-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                  <span className="text-secondary">髪の状態: </span>
                  <span>{booking.hair_summary}</span>
                </div>
                <div className="text-sm">
                  <span className="text-secondary">希望スタイル: </span>
                  <span>{booking.desired_style}</span>
                </div>
                {booking.refined_details && booking.refined_details.length > 0 && (
                  <div className="text-sm" style={{ marginTop: 'var(--space-xs)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-xs)' }}>
                    <span className="text-secondary">こだわり条件 (AIチャット): </span>
                    <div className="flex gap-xs flex-wrap" style={{ display: 'inline-flex', marginLeft: '6px', verticalAlign: 'middle' }}>
                      {booking.refined_details.map((tag) => (
                        <span key={tag} className="chip chip-pink" style={{ fontSize: '0.65rem', padding: '0.125rem 0.5rem', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-sm flex-wrap">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate(`/stylist/recipe/${booking.id}`)}
                >
                  <Sparkles size={14} />
                  AIレシピを見る
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/stylist/client/client-${booking.id.split('-')[1]}`)}
                >
                  <User size={14} />
                  顧客カルテ (履歴)
                </button>
                {booking.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusChange(booking.id, 'approved')}
                    >
                      <CheckCircle size={14} />
                      承認
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatusChange(booking.id, 'rejected')}
                    >
                      <XCircle size={14} />
                      不承認
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
              <Calendar size={48} style={{ margin: '0 auto var(--space-md)', opacity: 0.3 }} />
              <p>表示する予約がありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
