import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Search, ArrowRight, Clock, Banknote } from 'lucide-react';

const DEMO_CLIENTS = [
  {
    id: 'user-001',
    name: '桜田 M.',
    last_visit: '2026-06-15T14:00:00',
    total_visits: 3,
    tags: ['ハイトーン', 'ブリーチ履歴2回'],
    next_booking: '2026-07-08T14:00:00',
    total_cost: 2505,
  },
  {
    id: 'user-002',
    name: '小林 A.',
    last_visit: '2026-05-10T11:00:00',
    total_visits: 1,
    tags: ['バラヤージュ', 'ダメージ気にしてる'],
    next_booking: '2026-07-09T11:00:00',
    total_cost: 1120,
  },
  {
    id: 'user-003',
    name: '高橋 Y.',
    last_visit: '2026-06-01T16:30:00',
    total_visits: 5,
    tags: ['常連', 'ビビッドカラー', 'アニメ好き'],
    next_booking: null,
    total_cost: 5830,
  },
];

export default function ClientListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = DEMO_CLIENTS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tags.some(t => t.includes(searchTerm))
  );

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: '900px' }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }} className="text-gradient">
            顧客リスト (CRM)
          </h1>
          <p className="text-secondary">過去の来店履歴やカルテ情報を確認・管理します</p>
        </div>

        <div className="flex gap-sm mb-lg" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="flex-1" style={{ position: 'relative' }}>
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input w-full" 
              placeholder="顧客名やタグで検索..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-md">
          {filteredClients.map(client => (
            <div 
              key={client.id} 
              className="glass-card-interactive flex justify-between items-center"
              onClick={() => navigate(`/stylist/client/${client.id}`)}
            >
              <div className="flex items-center gap-md">
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-xs">{client.name}</h3>
                  <div className="flex gap-sm text-sm text-secondary mb-xs">
                    <span className="flex items-center gap-xs"><Calendar size={14} /> 最終来店: {new Date(client.last_visit).toLocaleDateString()}</span>
                    <span className="flex items-center gap-xs"><User size={14} /> 来店回数: {client.total_visits}回</span>
                  </div>
                  <div className="flex gap-xs">
                    {client.tags.map(tag => (
                      <span key={tag} className="chip chip-pink text-xs" style={{ padding: '2px 8px' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-sm text-sm">
                <span className="flex items-center gap-xs text-xs text-secondary">
                  <Banknote size={14} /> 薬剤原価累計: ¥{client.total_cost.toLocaleString()}
                </span>
                {client.next_booking ? (
                  <span className="text-primary-light flex items-center gap-xs font-semibold">
                    <Clock size={14} /> 次回予約: {new Date(client.next_booking).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-muted">次回予約なし</span>
                )}
                <ArrowRight className="text-secondary" />
              </div>
            </div>
          ))}

          {filteredClients.length === 0 && (
            <div className="glass-card-static text-center text-muted p-xl">
              <p>該当する顧客が見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
