import { useState, useEffect } from 'react';
import { Package, Save, Check, Plus, ShieldCheck } from 'lucide-react';

interface InventoryItem {
  brand_name: string;
  product_line: string;
  is_available: boolean;
  price_per_gram: number;
}

export default function InventoryManagementPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { brand_name: 'WELLA', product_line: 'Illumina Color', is_available: true, price_per_gram: 12 },
    { brand_name: 'OLAPLEX', product_line: 'Bond Multiplier', is_available: true, price_per_gram: 35 },
  ]);
  const [saved, setSaved] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newLine, setNewLine] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    const savedInv = localStorage.getItem('stylist_inventory');
    if (savedInv) {
      setInventory(JSON.parse(savedInv));
    }
  }, []);

  const toggleAvailability = (index: number) => {
    const updated = [...inventory];
    updated[index].is_available = !updated[index].is_available;
    setInventory(updated);
  };

  const addCustomItem = () => {
    if (newBrand.trim() && newLine.trim()) {
      setInventory([...inventory, {
        brand_name: newBrand.trim(),
        product_line: newLine.trim(),
        is_available: true,
        price_per_gram: parseInt(newPrice) || 0,
      }]);
      setNewBrand('');
      setNewLine('');
      setNewPrice('');
    }
  };

  const handleSave = () => {
    localStorage.setItem('stylist_inventory', JSON.stringify(inventory));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: '800px' }}>
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }} className="text-gradient">
            自店在庫・薬剤管理
          </h1>
          <p className="text-secondary">取り扱いのある薬剤を登録することで、AIが自店在庫に合わせた最適なレシピを提案します。</p>
        </div>

        <div className="glass-card-static mb-lg" style={{ marginBottom: 'var(--space-lg)', background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
          <div className="flex items-start gap-md">
            <ShieldCheck size={24} color="#10B981" />
            <div>
              <h3 className="font-bold mb-xs text-primary-light">AIレシピ連動アクティブ</h3>
              <p className="text-sm text-secondary">
                ここで有効化（チェック）されたブランド・ラインのみをAIが計算に含めます。未登録の製品は推奨されません。
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card-static" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 className="flex items-center gap-sm text-lg font-bold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
            <Package size={20} className="text-primary-light" />
            登録済みの取り扱い薬剤
          </h3>

          <div className="grid gap-sm">
            {inventory.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-md rounded-md bg-tertiary border border-default transition-all flex-mobile-col gap-mobile-sm"
                style={{ opacity: item.is_available ? 1 : 0.6 }}
              >
                <div style={{ flex: 1 }}>
                  <div className="font-bold">{item.brand_name}</div>
                  <div className="text-sm text-secondary">{item.product_line}</div>
                </div>
                <div className="flex items-center gap-md w-full-mobile" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      className="form-input"
                      value={item.price_per_gram}
                      onChange={(e) => {
                        const updated = [...inventory];
                        updated[idx].price_per_gram = parseInt(e.target.value) || 0;
                        setInventory(updated);
                      }}
                      style={{ width: '70px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', textAlign: 'right', margin: 0 }}
                    />
                    <span className="text-xs text-muted" style={{ whiteSpace: 'nowrap' }}>円/g</span>
                  </div>
                  <button 
                    className={`btn btn-sm ${item.is_available ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleAvailability(idx)}
                    style={{ minWidth: '100px' }}
                  >
                    {item.is_available ? <><Check size={14} /> 取り扱い中</> : '取り扱い停止'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-static" style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 className="text-lg font-bold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
            新しい薬剤の追加
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)', alignItems: 'end' }}>
            <div className="form-group mb-0" style={{ margin: 0 }}>
              <label className="form-label">ブランド名</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="例: WELLA" 
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
              />
            </div>
            <div className="form-group mb-0" style={{ margin: 0 }}>
              <label className="form-label">製品ライン名</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="例: Illumina Color" 
                value={newLine}
                onChange={(e) => setNewLine(e.target.value)}
              />
            </div>
            <div className="form-group mb-0" style={{ margin: 0 }}>
              <label className="form-label">単価 (円/g)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="例: 12" 
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: 'var(--space-sm)' }}>
              <button className="btn btn-secondary btn-full" onClick={addCustomItem} style={{ width: '100%' }}>
                <Plus size={16} /> リストに追加
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end sticky-bottom" style={{ position: 'sticky', bottom: 'var(--space-lg)' }}>
          <button
            className={`btn btn-lg ${saved ? 'btn-success' : 'btn-primary'} transition-all`}
            onClick={handleSave}
            style={{ width: '200px', boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)' }}
          >
            {saved ? (
              <>
                <Check size={20} />
                保存しました
              </>
            ) : (
              <>
                <Save size={20} />
                変更を保存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
