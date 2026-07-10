import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, Clock, AlertTriangle, Package,
  ListOrdered, Send, User, FileText, FileSignature, Beaker,
  Image as ImageIcon, Upload, X, Shield, RefreshCw, CheckCircle2,
  Palette, Zap, Waves, Download
} from 'lucide-react';
import type { SOAPChart, SOAPChartUpdate, AllergyChecklist, MedicalRecord, MedicalRecordCreate } from '../../types';
import { HAIR_COLOR_PALETTE } from '../../types';

import type { ChemicalCalculationResult } from '../../types';

const TREATMENT_TYPES = [
  { id: 'color', label: 'カラー', icon: <Palette size={16} className="text-current" /> },
  { id: 'bleach', label: 'ブリーチ', icon: <Zap size={16} className="text-current" /> },
  { id: 'perm', label: 'パーマ', icon: <Waves size={16} className="text-current" /> },
];

const TONE_OPTIONS = [
  { id: 'dark', label: '暗め (1-6 Lv)' },
  { id: 'medium', label: '中間 (7-9 Lv)' },
  { id: 'light', label: '明るめ (10-12 Lv)' },
  { id: 'high_tone', label: 'ハイトーン (13+ Lv)' },
];

const LENGTH_OPTIONS = [
  { id: 'short', label: 'ショート' },
  { id: 'bob', label: 'ボブ' },
  { id: 'medium', label: 'ミディアム' },
  { id: 'long', label: 'ロング' },
  { id: 'very_long', label: 'スーパーロング' },
];

const HAIR_TYPE_OPTIONS = [
  { id: 'soft', label: '軟毛' },
  { id: 'normal', label: '普通' },
  { id: 'hard', label: '硬毛' },
];

const PRESET_COLORS = [
  '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc', '#d7ccc8', '#f5f5f5',
  '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775', '#fff176', '#ffd54f', '#ffb74d', '#ff8a65', '#a1887f', '#e0e0e0',
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e',
  '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#1976d2', '#0288d1', '#0097a7', '#00796b', '#388e3c', '#689f38', '#afb42b', '#fbc02d', '#ffa000', '#f57c00', '#e64a19', '#5d4037', '#616161',
  '#b71c1c', '#880e4f', '#4a148c', '#311b92', '#1a237e', '#0d47a1', '#01579b', '#006064', '#004d40', '#1b5e20', '#33691e', '#827717', '#f57f17', '#ff6f00', '#e65100', '#bf360c', '#3e2723', '#212121',
];

function analyzeColor(hexString: string) {
  const hexes = hexString.split(',').filter(h => h.startsWith('#'));
  if (hexes.length === 0) return { hue: 'brown', requiresBleach: false, name: '不明', isDesign: false };
  
  const hex = hexes[0];
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  
  let h = 0;
  if (max !== min) {
    if (max === r) h = (g - b) / (max - min) + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / (max - min) + 2;
    else h = (r - g) / (max - min) + 4;
    h /= 6;
  }
  
  const requiresBleach = hexes.some(hx => {
    const r2 = parseInt(hx.slice(1, 3), 16) / 255;
    const g2 = parseInt(hx.slice(3, 5), 16) / 255;
    const b2 = parseInt(hx.slice(5, 7), 16) / 255;
    const mx = Math.max(r2, g2, b2), mn = Math.min(r2, g2, b2);
    const lv = (mx + mn) / 2;
    const sv = mx === mn ? 0 : lv > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
    return lv > 0.55 || (sv > 0.5 && lv > 0.35);
  });

  let hue = 'brown';
  if (s < 0.15) {
     if (l > 0.7) hue = 'silver_gray';
     else if (l < 0.3) hue = 'black_dark';
     else hue = 'ash_greige';
  } else {
     const hDeg = h * 360;
     if (hDeg < 15 || hDeg >= 330) hue = 'red_pink';
     else if (hDeg < 45) hue = 'orange_apricot';
     else if (hDeg < 70) hue = 'yellow_beige';
     else if (hDeg < 160) hue = 'green_olive';
     else if (hDeg < 250) hue = 'blue_ash';
     else if (hDeg < 330) hue = 'purple_lavender';
  }

  const nameMap: Record<string, string> = {
    silver_gray: 'シルバー/グレー',
    black_dark: 'ブラック/ダーク',
    ash_greige: 'アッシュ/グレージュ',
    red_pink: 'レッド/ピンク',
    orange_apricot: 'オレンジ/アプリコット',
    yellow_beige: 'イエロー/ベージュ',
    green_olive: 'グリーン/オリーブ',
    blue_ash: 'ブルー/アッシュ',
    purple_lavender: 'パープル/ラベンダー',
    brown: 'ブラウン',
  };

  return { hue, requiresBleach, name: nameMap[hue] || 'カスタムカラー', isDesign: hexes.length > 1 };
}

const calculateDynamicRecipe = (customer: any) => {
  // Handle design color multi-color target
  const targetHexes = customer.target_color ? customer.target_color.split(',') : [];
  const targetDefs = targetHexes.map((hex: string) => HAIR_COLOR_PALETTE.find(c => c.hex === hex)).filter(Boolean) as typeof HAIR_COLOR_PALETTE;
  
  if (targetDefs.length === 0) {
    // default target color if none
    targetDefs.push(HAIR_COLOR_PALETTE.find(c => c.id === 'milk_tea')!);
  }

  // Determine if bleach is needed
  const targetRequiresBleach = targetDefs.some(t => t.requiresBleach);
  const needsBleachNow = targetRequiresBleach && customer.has_bleach !== 'yes';
  
  const procedure_steps = [];
  const recommended_products = [];
  let estimated_time_minutes = 90;
  
  // Step 1: Pre-treatment
  procedure_steps.push({
    title: '髪の状態チェック＆前処理',
    time: '15分',
    detail: `髪質 (${customer.hair_type === 'soft' ? '軟毛' : customer.hair_type === 'hard' ? '硬毛' : '普通毛'})、ダメージレベル (${customer.damage_level}/5) を確認。${customer.damage_level >= 3 ? '中度以上のダメージがあるため、CMC及びケラチン前処理剤（OLAPLEX等）をしっかり塗布して保護します。' : '前処理トリートメントでベースを保護します。'}`
  });
  
  if (customer.damage_level >= 3) {
    recommended_products.push({ name: 'OLAPLEX No.1 Bond Multiplier', type: 'treatment', usage: '処理剤（保護・強化）', amount_g: 15, price_per_gram: 50 });
  } else {
    recommended_products.push({ name: 'CMC PPT Protector', type: 'treatment', usage: '前処理（保護・補修）', amount_g: 20, price_per_gram: 10 });
  }

  // Step 2: Bleach (if needed)
  if (needsBleachNow) {
    procedure_steps.push({
      title: 'ブリーチ施術',
      time: '45分',
      detail: `明るいトーン (${targetDefs.map(t => t.name).join(', ')}) にするためブリーチを行います。頭皮を保護しつつ、新生部から塗布します。`
    });
    recommended_products.push({ name: 'WELLA Blondor Multi Blonde', type: 'bleach', usage: '主剤（パウダー）', amount_g: 80, price_per_gram: 12 });
    recommended_products.push({ name: '6% Oxi Developer', type: 'developer', usage: '2液（酸化剤）', amount_g: 160, price_per_gram: 3 });
    estimated_time_minutes += 45;
  } else if (customer.has_bleach === 'yes') {
    procedure_steps.push({
      title: 'リタッチまたはベース調整',
      time: '30分',
      detail: 'すでにブリーチ履歴があるため、根元の新生部のみリタッチブリーチするか、アルカリキャンセル剤で色調を整えます。'
    });
    recommended_products.push({ name: 'WELLA Blondor (リタッチ用)', type: 'bleach', usage: '新生部調整用', amount_g: 40, price_per_gram: 12 });
    recommended_products.push({ name: '3% Oxi Developer', type: 'developer', usage: '2液（弱）', amount_g: 80, price_per_gram: 3 });
    estimated_time_minutes += 30;
  }

  // Step 3: Color Formula & Neutralizing / Complementary color logic
  targetDefs.forEach((target) => {
    const isDesign = targetDefs.length > 1;
    const ratioText = isDesign ? ` (デザイン用 / 比率: 30%)` : '';
    const amt = isDesign ? 40 : 80;
    
    if (target.id.includes('pink') || target.id.includes('red') || target.id.includes('cherry')) {
      recommended_products.push({ name: `THROW Color ${target.requiresBleach ? '10-Pink' : '8-Pink'}`, type: 'color', usage: `1液（主剤）${ratioText}`, amount_g: amt, price_per_gram: 8 });
      recommended_products.push({ name: 'THROW Color 6-Violet (補正色 / 黄味消し・褪色防止: 5%)', type: 'color', usage: '1液（補正）', amount_g: Math.max(3, Math.round(amt * 0.05)), price_per_gram: 8 });
    } 
    else if (target.id.includes('olive') || target.id.includes('khaki')) {
      recommended_products.push({ name: `THROW Color ${target.requiresBleach ? '10-Matt' : '8-Matt'}`, type: 'color', usage: `1液（主剤）${ratioText}`, amount_g: amt, price_per_gram: 8 });
      recommended_products.push({ name: 'THROW Color 8-Ash (補色 / 赤味消し・透明感: 10%)', type: 'color', usage: '1液（補色）', amount_g: Math.max(5, Math.round(amt * 0.1)), price_per_gram: 8 });
    }
    else if (target.id.includes('ash') || target.id.includes('silver') || target.id.includes('gray')) {
      recommended_products.push({ name: `THROW Color ${target.requiresBleach ? '10-Ash' : '8-Ash'}`, type: 'color', usage: `1液（主剤）${ratioText}`, amount_g: amt, price_per_gram: 8 });
      recommended_products.push({ name: 'THROW Color 8-Violet (補色 / 黄味・アンダーキャンセル: 10%)', type: 'color', usage: '1液（補色）', amount_g: Math.max(5, Math.round(amt * 0.1)), price_per_gram: 8 });
    }
    else if (target.id.includes('milk_tea') || target.id.includes('beige') || target.id.includes('greige')) {
      recommended_products.push({ name: `THROW Color ${target.requiresBleach ? '9-Beige' : '8-Beige'}`, type: 'color', usage: `1液（主剤）${ratioText}`, amount_g: amt, price_per_gram: 8 });
      recommended_products.push({ name: 'THROW Color 8-Violet (補正色 / アンダートーン相殺: 8%)', type: 'color', usage: '1液（補正）', amount_g: Math.max(4, Math.round(amt * 0.08)), price_per_gram: 8 });
      recommended_products.push({ name: 'THROW Color 9-Monotone (質感調整 / スモーキー感: 15%)', type: 'color', usage: '1液（調合剤）', amount_g: Math.max(8, Math.round(amt * 0.15)), price_per_gram: 8 });
    }
    else {
      recommended_products.push({ name: `THROW Color 8-N (ナチュラルブラウン)`, type: 'color', usage: `1液（主剤）${ratioText}`, amount_g: amt, price_per_gram: 8 });
    }
  });

  const use3Percent = customer.damage_level >= 3 || !needsBleachNow;
  recommended_products.push({
    name: use3Percent ? '3% Oxi Developer' : '6% Oxi Developer',
    type: 'developer',
    usage: '2液（酸化剤）',
    amount_g: targetDefs.length * (needsBleachNow ? 160 : 80),
    price_per_gram: 3
  });

  const hasComp = recommended_products.some(p => p.name.includes('補色') || p.name.includes('補正'));
  const compDetail = hasComp 
    ? `アンダートーン（黄味や赤味）を相殺するための補色・補正色 (${recommended_products.filter(p => p.name.includes('補色') || p.name.includes('補正')).map(p => p.name.split(' (')[0]).join(', ')}) を調合。` 
    : '';

  procedure_steps.push({
    title: 'カラー塗布',
    time: '25分',
    detail: `目標カラー (${targetDefs.map(t => t.name).join(', ')}) を塗布します。${compDetail}毛髪が${customer.hair_type === 'soft' ? '軟毛で染まりやすいため、放置時間はやや短め（20分程度）にしてチェックします。' : customer.hair_type === 'hard' ? '硬毛で染まりにくいため、しっかり25分間放置して発色させます。' : '標準の25分間放置し、発色状態を確認します。'}`
  });

  // Step 4: Post-treatment
  procedure_steps.push({
    title: 'シャンプー・後処理＆仕上げ',
    time: '15分',
    detail: `しっかりと乳化させて洗い流します。アルカリ除去リンスを行い、pHを健康な弱酸性に戻します。${customer.damage_level >= 3 ? 'ハイダメージ対策として、OLAPLEX No.2 でキューティクルと毛髪内部の結合を安定させ、冷風でブローして仕上げます。' : 'トリートメントでしっかりと保湿し、ブローします。'}`
  });

  if (customer.damage_level >= 3) {
    recommended_products.push({ name: 'OLAPLEX No.2 Bond Perfector', type: 'treatment', usage: '後処理（内部結合安定化）', amount_g: 15, price_per_gram: 30 });
  }
  recommended_products.push({ name: 'pH Control Acid Rinse', type: 'treatment', usage: '後処理（アルカリ除去）', amount_g: 10, price_per_gram: 15 });

  const lengthFactor = customer.hair_length === 'very_long' ? 1.3 : customer.hair_length === 'long' ? 1.15 : customer.hair_length === 'short' ? 0.85 : 1.0;
  estimated_time_minutes = Math.round(estimated_time_minutes * lengthFactor);

  const risks = [];
  if (customer.has_black_dye === 'yes') {
    risks.push(`※過去の黒染め履歴があります（最終:${customer.black_dye_date === 'over1year' ? '1年以上前' : customer.black_dye_date === '1year' ? '1年以内' : customer.black_dye_date === '6months' ? '半年以内' : customer.black_dye_date === '3months' ? '3ヶ月以内' : '1ヶ月以内'}）。黒染め部分の染料が残留している可能性が高く、ブリーチ時に赤味やオレンジ味が強く残るか、染料ムラになるリスクがあります。補正色の配合比率を上げるか、脱染剤の使用を検討してください。`);
  }
  if (customer.has_straightening === 'yes') {
    risks.push('※縮毛矯正履歴があります。タンパク変性により薬剤の吸い込みや沈み込みが発生しやすく、部分的に暗くなりすぎる可能性があります。また、熱変性毛へのブリーチは毛髪破断リスクがあるため、放置時間を厳しく管理してください。');
  }
  if (customer.damage_level >= 4) {
    risks.push('※自己評価ダメージレベルがハイダメージ（4〜5/5）です。アルカリ剤を極力排除し、微アルカリや酸性カラーを中心に選択。PPTやCMCの処理剤による毛髪保護を徹底してください。');
  }
  if (customer.perm_count_over_5) {
    risks.push('※複数回のパーマ履歴があり毛髪の結合強度が下がっています。前処理の結合強化剤の濃度を高く設定し、コーミングの摩擦を最小限に抑えてください。');
  }
  if (risks.length === 0) {
    risks.push('健康的な髪質です。通常の手順・放置時間で問題ありませんが、放置時間中のカラーチェックは10分ごとに行ってください。');
  }

  return {
    procedure_steps,
    recommended_products,
    estimated_time_minutes,
    risk_notes: risks.join('\n')
  };
};

// Demo recipe data
const DEMO_RECIPE = {
  recipe_text: `## 施術レシピ：ハイトーンベージュカラー\n\n### 事前診断\nお客様の問診によると、過去に2回のブリーチ履歴があり、黒染め履歴はありません。現在のダメージレベルは中程度（レベル3）です。\n髪の長さはミディアムで、スムーズなスタイルチェンジが期待できます。`,
  recommended_products: [
    { name: 'WELLA ブロンドール マルチブロンド', type: 'ブリーチ剤', usage: 'ステップ 3', price_per_gram: 15, amount_g: 50 },
    { name: 'OLAPLEX No.0 + No.2', type: '結合強化トリートメント', usage: 'ステップ 2 & 5', price_per_gram: 35, amount_g: 20 },
    { name: 'THROW Color 9-Beige', type: 'カラー剤', usage: 'ステップ 4', price_per_gram: 10, amount_g: 40 },
    { name: 'THROW Color 9-Monotone', type: 'カラー剤', usage: 'ステップ 4', price_per_gram: 10, amount_g: 20 },
  ],
  procedure_steps: [
    {
      title: '髪の状態チェック',
      time: '10分',
      detail: '最もダメージのある部分でストランドテストを実施。弾力と多孔性を確認し、目標の明度に到達可能か判断します。',
    },
    {
      title: '前処理',
      time: '5分',
      detail: 'OLAPLEX No.0 または TOKIO INKARAMI を塗布し、結合を強化。熱を加えずに5分間放置します。',
    },
    {
      title: 'ブリーチ塗布',
      time: '45分',
      detail: 'WELLA ブロンドール マルチブロンドパウダー + 6% オキシ（1:2）を混合。中間から毛先に先に塗布し、その後根元へ。自然放置で10分ごとにチェック。目標：レベル15-16（ペールイエロー）。',
    },
    {
      title: 'トナー（カラー）塗布',
      time: '25分',
      detail: 'THROW Color 9-Beige + 9-Monotone (2:1) + 3% オキシを混合。根元から毛先まで均一に塗布し、室温で20-25分放置します。',
    },
    {
      title: '後処理＆仕上げ',
      time: '15分',
      detail: 'しっかりとすすぎ、OLAPLEX No.2 を塗布して10分間放置。その後、保湿トリートメントを行います。キューティクルを引き締めるため、冷風でブローして仕上げます。',
    },
  ],
  estimated_time_minutes: 100,
  risk_notes: '2回のブリーチ履歴があるため、中間から毛先にかけては切れやすくなっている可能性があります。この部分のブリーチ放置時間は短めに設定してください。ストランドテストで著しいダメージが見られた場合は、リフトアップのレベルを下げて暗めのトナーを使用することを検討してください。',
  customer: {
    name: '桜田 M.',
    hair_length: 'medium',
    has_bleach: 'yes' as 'yes' | 'no' | 'unknown',
    bleach_count: 2,
    has_black_dye: 'yes' as 'yes' | 'no' | 'unknown',
    black_dye_count: 1,
    black_dye_date: '1year',
    has_straightening: 'no' as 'yes' | 'no' | 'unknown',
    straightening_count: 0,
    straightening_date: '',
    has_perm: 'yes' as 'yes' | 'no' | 'unknown',
    perm_count: 2,
    perm_date: '6months',
    perm_count_over_5: false,
    previous_chemicals: '前回はイルミナカラー サファリ 8トーン。市販のカラーシャンプー（ピンク）使用歴あり。',
    current_hair_color: '#6B4423',
    target_color: '#D4B895',
    hair_type: 'soft',
    damage_level: 3,
    desired_style: 'ミルクティーベージュのハイトーン',
    salon_vibe: '静かに過ごしたい',
  },
};

export default function RecipeViewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'recipe' | 'calculator' | 'soap' | 'record'>('recipe');

// Form state
  const [damageLevel, setDamageLevel] = useState(3);
  const [bleachCount, setBleachCount] = useState(0);
  const [targetTreatment, setTargetTreatment] = useState('color');
  const [targetTone, setTargetTone] = useState('medium');
  const [hasStraightening, setHasStraightening] = useState(false);
  const [hasPerm, setHasPerm] = useState(false);
  const [hasBlackDye, setHasBlackDye] = useState(false);
  const [hairLength, setHairLength] = useState('medium');
  const [hairType, setHairType] = useState('normal');
  const [permCount, setPermCount] = useState(0);
  const [straighteningCount, setStraighteningCount] = useState(0);
  const [blackDyeCount, setBlackDyeCount] = useState(0);
  const [currentColor, setCurrentColor] = useState('#111111');
  const [targetColor, setTargetColor] = useState('#d4b895');

  const [calcResult, setCalcResult] = useState<ChemicalCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Features: Allergy & SOAP
  const [allergyData, setAllergyData] = useState<AllergyChecklist | null>(null);
  const [soapChart, setSoapChart] = useState<SOAPChart | null>(null);
  const [isEditingSoap, setIsEditingSoap] = useState(false);
  const [soapEditForm, setSoapEditForm] = useState<SOAPChartUpdate>({});
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);

  // Feature: Medical Record (最終カルテ)
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [recordEditForm, setRecordEditForm] = useState<Partial<MedicalRecordCreate>>({
    actual_recipe: '',
    private_notes: '',
    before_image_urls: [],
    after_image_urls: [],
  });

  const handleImageUpload = (type: 'before' | 'after') => {
    // Mock image upload
    const mockUrl = `https://images.unsplash.com/photo-${Date.now()}?auto=format&fit=crop&q=80&w=300`;
    setRecordEditForm(prev => ({
      ...prev,
      [type === 'before' ? 'before_image_urls' : 'after_image_urls']: [
        ...(prev[type === 'before' ? 'before_image_urls' : 'after_image_urls'] || []),
        mockUrl
      ]
    }));
  };

  const removeImage = (type: 'before' | 'after', index: number) => {
    setRecordEditForm(prev => {
      const field = type === 'before' ? 'before_image_urls' : 'after_image_urls';
      const arr = [...(prev[field] || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };

  const [recipe] = useState(() => {
    const defaultRec = { ...DEMO_RECIPE };
    const lastB = sessionStorage.getItem('lastBooking');
    if (lastB) {
      const parsed = JSON.parse(lastB);
      if (parsed.id === bookingId) {
        const q = parsed.questionnaire;
        const customer = {
          name: parsed.customer_name,
          hair_length: (() => {
            const raw = q ? q.hair_length : (parsed.hair_summary.split(' / ')[0] || 'medium');
            const map: Record<string, string> = {
              'ショート': 'short', 'ボブ': 'bob', 'ミディアム': 'medium', 'ロング': 'long', 'スーパーロング': 'very_long',
              'short': 'short', 'bob': 'bob', 'medium': 'medium', 'long': 'long', 'very_long': 'very_long'
            };
            return map[raw] || 'medium';
          })(),
          has_bleach: q ? q.has_bleach : (parsed.hair_summary.includes('ブリーチ') ? 'yes' : 'no'),
          bleach_count: q ? q.bleach_count : (parseInt(parsed.hair_summary.split(' / ')[1]?.replace('ブリーチ', '')?.replace('回', '')) || 0),
          has_black_dye: q ? q.has_black_dye : (parsed.hair_summary.includes('黒染め') && !parsed.hair_summary.includes('黒染め: なし') ? 'yes' : 'no'),
          black_dye_count: q ? q.black_dye_count : 0,
          black_dye_date: q ? q.black_dye_date : '',
          has_straightening: q ? q.has_straightening : (parsed.hair_summary.includes('縮毛矯正') ? 'yes' : 'no'),
          straightening_count: q ? q.straightening_count : 0,
          straightening_date: q ? q.straightening_date : '',
          has_perm: q ? q.has_perm : (parsed.hair_summary.includes('パーマ') ? 'yes' : 'no'),
          perm_count: q ? q.perm_count : 0,
          perm_date: q ? q.perm_date : '',
          perm_count_over_5: q ? q.perm_count_over_5 : false,
          previous_chemicals: q?.previous_chemicals || '前回はイルミナカラー サファリ 8トーン。',
          current_hair_color: q?.current_hair_color || '#6B4423',
          damage_level: q ? q.damage_level : (parseInt(parsed.hair_summary.split(' / ')[2]?.replace('ダメージLv', '')) || 3),
          desired_style: parsed.desired_style || 'ミルクティーベージュのハイトーン',
          salon_vibe: parsed.salon_vibe || '静かに過ごしたい',
          target_color: q?.target_color || '#D4B895',
          hair_type: q?.hair_type || 'soft',
        };

        const dynamicDetails = calculateDynamicRecipe(customer);
        defaultRec.customer = customer;
        defaultRec.procedure_steps = dynamicDetails.procedure_steps;
        defaultRec.recommended_products = dynamicDetails.recommended_products;
        defaultRec.estimated_time_minutes = dynamicDetails.estimated_time_minutes;
        defaultRec.risk_notes = dynamicDetails.risk_notes;

        (defaultRec as any).refined_details = parsed.refined_details || [];
        (defaultRec as any).chat_history = parsed.chat_history || [];
      }
    } else {
      const dynamicDetails = calculateDynamicRecipe(defaultRec.customer);
      defaultRec.procedure_steps = dynamicDetails.procedure_steps;
      defaultRec.recommended_products = dynamicDetails.recommended_products;
      defaultRec.estimated_time_minutes = dynamicDetails.estimated_time_minutes;
      defaultRec.risk_notes = dynamicDetails.risk_notes;
    }
    return defaultRec;
  });

  // Load mock allergy data
  useEffect(() => {
    const savedAllergy = sessionStorage.getItem('allergyChecklist');
    if (savedAllergy) {
      setAllergyData(JSON.parse(savedAllergy));
    } else {
      setAllergyData({
        id: 'mock-a-1',
        user_id: 'mock-u-1',
        questionnaire_id: 'mock-q-1',
        has_skin_trouble: true,
        skin_trouble_detail: '乾燥肌で痒みが出やすい',
        has_allergy: false,
        allergy_detail: '',
        has_patch_test: false,
        patch_test_result: '',
        has_scalp_sensitivity: true,
        has_previous_reaction: false,
        previous_reaction_detail: '',
        consent_acknowledged: true,
        created_at: new Date().toISOString()
      });
    }
  }, []);

  
  useEffect(() => {
    if (recipe && recipe.customer) {
      const c = recipe.customer;
      setDamageLevel(c.damage_level || 3);
      setBleachCount(c.bleach_count >= 0 ? c.bleach_count : 0);
      setHasStraightening(c.has_straightening === 'yes');
      setHasPerm(c.has_perm === 'yes');
      setHasBlackDye(c.has_black_dye === 'yes');
      setHairLength(c.hair_length || 'medium');
      setPermCount(c.perm_count >= 0 ? c.perm_count : 0);
      setStraighteningCount(c.straightening_count >= 0 ? c.straightening_count : 0);
      setBlackDyeCount(c.black_dye_count >= 0 ? c.black_dye_count : 0);
      setHairType(c.hair_type || 'normal');
      if (c.current_hair_color && c.current_hair_color !== 'consult') setCurrentColor(c.current_hair_color);
      if (c.target_color && c.target_color !== 'consult') setTargetColor(c.target_color);
    }
  }, [recipe]);

  // Auto-infer target tone from selected target color(s) mathematically
  useEffect(() => {
    if (targetColor) {
      const hexList = targetColor.split(',').filter(h => h.startsWith('#'));
      if (hexList.length > 0) {
        let maxL = 0;
        hexList.forEach(hex => {
          const r = parseInt(hex.slice(1, 3), 16) / 255;
          const g = parseInt(hex.slice(3, 5), 16) / 255;
          const b = parseInt(hex.slice(5, 7), 16) / 255;
          const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
          if (l > maxL) maxL = l;
        });

        if (maxL >= 0.75) {
          setTargetTone('high_tone');
        } else if (maxL >= 0.55) {
          setTargetTone('light');
        } else if (maxL >= 0.35) {
          setTargetTone('medium');
        } else {
          setTargetTone('dark');
        }
      }
    }
  }, [targetColor]);

  const importCustomerData = () => {
    if (recipe && recipe.customer) {
      const c = recipe.customer;
      setDamageLevel(c.damage_level || 3);
      setBleachCount(c.bleach_count >= 0 ? c.bleach_count : 0);
      setHasStraightening(c.has_straightening === 'yes');
      setHasPerm(c.has_perm === 'yes');
      setHasBlackDye(c.has_black_dye === 'yes');
      setHairLength(c.hair_length || 'medium');
      setPermCount(c.perm_count >= 0 ? c.perm_count : 0);
      setStraighteningCount(c.straightening_count >= 0 ? c.straightening_count : 0);
      setBlackDyeCount(c.black_dye_count >= 0 ? c.black_dye_count : 0);
      setHairType(c.hair_type || 'normal');
      if (c.current_hair_color && c.current_hair_color !== 'consult') setCurrentColor(c.current_hair_color);
      if (c.target_color && c.target_color !== 'consult') setTargetColor(c.target_color);
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: 'stylist', text: chatInput, time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setChatInput('');
  };

  const handleGenerateSoap = () => {
    setIsGeneratingSoap(true);
    // Simulate AI generation API call
    setTimeout(() => {
      const generated: SOAPChart = {
        id: `soap-${Date.now()}`,
        booking_id: bookingId || '',
        stylist_id: 'stylist-001',
        subjective: `【希望スタイルのこだわり条件（AIカウンセリングより）】\n${(recipe as any).refined_details?.map((d: string) => `  ・${d}`).join('\n') || '  ・特になし'}\n\n【希望のヘアスタイル】\n  ${recipe.customer.desired_style}`,
        objective: `【髪質の状態診断】\n  ・髪の長さ: ${recipe.customer.hair_length}\n  ・ブリーチ履歴: ${recipe.customer.has_bleach === 'yes' ? `${recipe.customer.bleach_count === -1 ? '回数不明' : `${recipe.customer.bleach_count}回`}` : recipe.customer.has_bleach === 'unknown' ? '不明' : 'なし'}\n  ・黒染め履歴: ${recipe.customer.has_black_dye === 'yes' ? `あり（回数: ${recipe.customer.black_dye_count === -1 ? '不明' : `${recipe.customer.black_dye_count}回`} / 時期: ${recipe.customer.black_dye_date || '不明'}）` : recipe.customer.has_black_dye === 'unknown' ? '不明' : 'なし'}\n  ・縮毛矯正履歴: ${recipe.customer.has_straightening === 'yes' ? `あり（回数: ${recipe.customer.straightening_count === -1 ? '不明' : `${recipe.customer.straightening_count}回`} / 時期: ${recipe.customer.straightening_date || '不明'}）` : recipe.customer.has_straightening === 'unknown' ? '不明' : 'なし'}\n  ・パーマ履歴: ${recipe.customer.has_perm === 'yes' ? `あり（回数: ${recipe.customer.perm_count === -1 ? '不明' : `${recipe.customer.perm_count}回`}${recipe.customer.perm_count_over_5 ? ' ※5回以上' : ''} / 時期: ${recipe.customer.perm_date || '不明'}）` : recipe.customer.has_perm === 'unknown' ? '不明' : 'なし'}\n  ・自己評価ダメージレベル: ${recipe.customer.damage_level}/5${recipe.customer.previous_chemicals ? `\n  ・前回の使用薬剤: ${recipe.customer.previous_chemicals}` : ''}`,
        assessment: `【総合施術リスク判定: ${recipe.customer.damage_level >= 3 ? '中リスク' : '低リスク'}】\n${recipe.customer.damage_level >= 3 ? '  ・中程度のダメージが検出されました。低アルカリの優しい薬剤を使用し、十分な前処理を行ってください。' : '  ・健康的な髪状態であり、通常の施術は問題なく進行可能です。'}`,
        plan: `【施術計画】\n  1. 最もダメージの激しい箇所でストランドテストを実施\n  2. 髪の弾力と多孔性を評価\n  3. 薬剤使用に関するクライアントの同意を確認\n  4. AI推奨レシピに沿って施術を進行`,
        is_ai_generated: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSoapChart(generated);
      setSoapEditForm({
        subjective: generated.subjective,
        objective: generated.objective,
        assessment: generated.assessment,
        plan: generated.plan,
      });
      setIsGeneratingSoap(false);
      setActiveTab('soap');
    }, 1500);
  };

  const saveSoap = () => {
    if (soapChart) {
      setSoapChart({
        ...soapChart,
        ...soapEditForm,
        is_ai_generated: false,
        updated_at: new Date().toISOString(),
      });
    }
    setIsEditingSoap(false);
  };

  const handleSaveRecord = () => {
    // Mock save logic
    const newRecord: MedicalRecord = {
      id: `record-${Date.now()}`,
      booking_id: bookingId || '',
      stylist_id: 'stylist-001',
      user_id: 'user-123',
      actual_recipe: recordEditForm.actual_recipe || '',
      private_notes: recordEditForm.private_notes || '',
      before_image_urls: recordEditForm.before_image_urls || [],
      after_image_urls: recordEditForm.after_image_urls || [],
      created_at: new Date().toISOString(),
    };
    setMedicalRecord(newRecord);
    setIsEditingRecord(false);
  };


  const handleCalculate = async () => {
    setIsCalculating(true);
    setTimeout(() => {
      const targetDef = analyzeColor(targetColor);

      // Calculate risk score based on damage and color incompatibility
      let targetRisk = 0;
      if (targetDef.requiresBleach && bleachCount === 0) {
        targetRisk = 2.5; // High risk to achieve light tone without bleaching
      }

      const riskScore = Math.min(10,
        damageLevel * 1.2 +
        Math.min(bleachCount * 0.8, 4) +
        (hasStraightening && targetTreatment === 'perm' ? 3 : 0) +
        (straighteningCount >= 3 ? 1.5 : 0) +
        (permCount >= 5 ? 2 : 0) +
        (hasBlackDye && blackDyeCount >= 3 ? 1.5 : 0) +
        targetRisk
      );

      // Propose main and complementary color agents
      const recAgents = [];
      
      if (targetTreatment === 'color') {
        let colorAgentName = '';
        let compAgentName = '';
        let compRatio = '';
        
        if (targetDef.hue === 'red_pink') {
          colorAgentName = `THROW Color ${targetDef.requiresBleach ? '10-Pink' : '8-Pink'}`;
          compAgentName = 'THROW Color 6-Violet (補正用)';
          compRatio = '5%';
        } else if (targetDef.hue === 'green_olive') {
          colorAgentName = `THROW Color ${targetDef.requiresBleach ? '10-Matt' : '8-Matt'}`;
          compAgentName = 'THROW Color 8-Ash (補色用)';
          compRatio = '10%';
        } else if (targetDef.hue === 'blue_ash' || targetDef.hue === 'silver_gray') {
          colorAgentName = `THROW Color ${targetDef.requiresBleach ? '10-Ash' : '8-Ash'}`;
          compAgentName = 'THROW Color 8-Violet (補色用)';
          compRatio = '10%';
        } else if (targetDef.hue === 'yellow_beige' || targetDef.hue === 'ash_greige') {
          colorAgentName = `THROW Color ${targetDef.requiresBleach ? '9-Beige' : '8-Beige'}`;
          compAgentName = 'THROW Color 8-Violet (補正用)';
          compRatio = '8%';
        } else {
          colorAgentName = 'THROW Color 8-N (ナチュラルブラウン)';
        }

        if (targetDef.isDesign) {
          colorAgentName += ' (デザイン用メイン)';
        }

        recAgents.push({
          agent: {
            id: 'agent-color-main',
            name: colorAgentName,
            type: 'color',
            strength: damageLevel >= 4 ? 'low' : damageLevel >= 3 ? 'low' : 'medium',
            ph_range: damageLevel >= 4 ? '6.0-6.5' : damageLevel >= 3 ? '7.5-8.0' : '8.0-9.0',
            description: `目標色（${targetDef.name}）用主剤`,
            risk_level: damageLevel >= 4 ? 0 : 1,
            suitable_damage_max: 5,
          },
          role: '1液 (主剤)',
          mix_ratio: '2液と1:1',
          reason: `希望色 ${targetDef.name} および髪質(${hairType === 'soft' ? '軟毛' : hairType === 'hard' ? '硬毛' : '普通'})に基づいて算定`,
        });

        if (compAgentName) {
          recAgents.push({
            agent: {
              id: 'agent-color-comp',
              name: compAgentName,
              type: 'color',
              strength: 'low',
              ph_range: '7.5-8.0',
              description: 'アンダートーン相殺・色持ち用補色',
              risk_level: 0,
              suitable_damage_max: 5,
            },
            role: '1液 (補色 / 補正色)',
            mix_ratio: `調合比率: ${compRatio}`,
            reason: '黄味や赤味のアンダートーンを相殺',
          });
        }
      } else {
        // Fallback or generic agent (bleach/perm)
        recAgents.push({
          agent: {
            id: 'agent-1',
            name: targetTreatment === 'bleach' ? 'WELLA Blondor Multi Blonde' : 'アリミノ コスメカール (システアミン系)',
            type: targetTreatment === 'bleach' ? 'bleach' : 'perm',
            strength: damageLevel >= 4 ? 'low' : damageLevel >= 3 ? 'low' : 'medium',
            ph_range: targetTreatment === 'bleach' ? '11.0-12.0' : damageLevel >= 3 ? '7.0-7.5' : '8.0-8.5',
            description: '施術タイプに合わせて選択された主剤',
            risk_level: damageLevel >= 4 ? 0 : damageLevel >= 3 ? 1 : 2,
            suitable_damage_max: damageLevel >= 4 ? 5 : damageLevel >= 3 ? 4 : 3,
          },
          role: '1液 (主剤)',
          mix_ratio: targetTreatment === 'bleach' ? '2液と1:2' : '加温10-15分',
          reason: `ダメージレベル ${damageLevel}/5 に基づき選択`,
        });
      }

      // Add developer and treatment agents
      const use3Percent = damageLevel >= 3 || targetTreatment !== 'bleach';
      recAgents.push({
        agent: {
          id: 'agent-dev',
          name: use3Percent ? '3% オキシデベロッパー' : '6% オキシデベロッパー',
          type: 'developer',
          strength: use3Percent ? 'low' : 'medium',
          ph_range: '2.5-3.5',
          description: '酸化剤 (デベロッパー)',
          risk_level: use3Percent ? 0 : 1,
          suitable_damage_max: 5,
        },
        role: '2液 (酸化剤)',
        mix_ratio: targetTreatment === 'bleach' ? '1:2' : '1:1',
        reason: 'ダメージ度合いとトーンアップ必要性から濃度を調整',
      });

      if (damageLevel >= 3) {
        recAgents.push({
          agent: {
            id: 'agent-treat',
            name: 'OLAPLEX No.1 Bond Multiplier',
            type: 'treatment',
            strength: 'low',
            ph_range: '3.0-4.0',
            description: '結合強化トリートメント',
            risk_level: 0,
            suitable_damage_max: 5,
          },
          role: '結合保護剤',
          mix_ratio: '剤総量に対して5%混入',
          reason: 'ハイダメージ毛の内部結合を保護',
        });
      }

      const mockResult: ChemicalCalculationResult = {
        id: `calc-${Date.now()}`,
        recommended_agents: recAgents,
        processing_time_minutes: Math.round((targetTreatment === 'bleach' ? 45 : targetTreatment === 'perm' ? 20 : 35) * (hairLength === 'long' ? 1.2 : hairLength === 'short' ? 0.7 : 1)),
        risk_score: Math.round(riskScore * 10) / 10,
        risk_factors: [
          ...(damageLevel >= 3 ? ['中〜高ダメージ'] : []),
          ...(bleachCount >= 2 ? ['複数回のブリーチ履歴'] : []),
          ...(hasStraightening && targetTreatment === 'perm' ? ['縮毛矯正 ＋ パーマ — 高リスク'] : []),
          ...(hasStraightening ? [`縮毛矯正履歴 (計${straighteningCount === 6 ? '6回以上' : `${straighteningCount}回`})`] : []),
          ...(hasPerm ? [`パーマ履歴 (計${permCount === 6 ? '6回以上' : `${permCount}回`})`] : []),
          ...(hasBlackDye ? [`黒染め履歴 (計${blackDyeCount === 5 ? '5回以上' : `${blackDyeCount}回`})`] : []),
        ],
        warnings: [
          ...(hasStraightening && targetTreatment === 'perm'
            ? ['警告: 縮毛矯正毛へのパーマは非常に高リスクです。事前のストランドテストを強く推奨します。']
            : []),
          ...(targetTreatment === 'color' && targetDef.requiresBleach && bleachCount === 0
            ? [`警告: 希望の明るい色（${targetDef.name}）を出すためには、現在のベースからブリーチ施術を追加する必要があります。`]
            : []),
          ...(targetTreatment === 'color' && hasBlackDye && targetDef.requiresBleach
            ? ['警告: 黒染め履歴がある髪へのハイトーンカラー・ブリーチは、染料が残留しているため強烈なオレンジ味や染まりムラになる危険性が極めて高いです。アンダーカラー補正に注意してください。']
            : []),
        ],
        pre_treatments: [
          ...(damageLevel >= 3 ? ['CMC (Ceramide) 前処理'] : []),
          ...(damageLevel >= 2 ? ['OLAPLEX No.0 or equivalent bond reinforcement (5分放置)'] : []),
        ],
        post_treatments: [
          'pH調整用酸リンス',
          '保湿トリートメントマスク — 5-10分放置',
          ...(damageLevel >= 2 ? ['OLAPLEX No.2 Bond Perfector — 流し後に10分放置'] : []),
        ],
        alkaline_acidic_ratio: {
          alkaline_percent: damageLevel >= 4 ? 20 : damageLevel >= 3 ? 40 : 60,
          acidic_percent: damageLevel >= 4 ? 80 : damageLevel >= 3 ? 60 : 40,
        },
        created_at: new Date().toISOString(),
      };

      // Phase 2: Apply Inventory Matching
      const inventoryStr = localStorage.getItem('stylist_inventory');
      if (inventoryStr) {
        try {
          const inventory: { brand_name: string; product_line: string; is_available: boolean }[] = JSON.parse(inventoryStr);
          mockResult.recommended_agents.forEach(rec => {
            const agentType = rec.agent.type;
            
            // Basic matching rule
            for (const item of inventory) {
              if (!item.is_available) continue;
              const brand = item.brand_name.toUpperCase();
              
              if (agentType === 'treatment' && brand.includes('OLAPLEX')) {
                rec.agent.name = `[${item.brand_name} ${item.product_line}] ${rec.agent.name}`;
                break;
              }
              if (agentType === 'alkaline' && ['WELLA', 'ARIMINO', 'MILBON'].includes(brand)) {
                rec.agent.name = `[${item.brand_name} ${item.product_line}] ${rec.agent.name}`;
                break;
              }
            }
          });
        } catch (e) {
          console.error('Failed to parse inventory', e);
        }
      }

      setCalcResult(mockResult);
      setIsCalculating(false);
    }, 1500);
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return '#10B981';
    if (score <= 6) return '#F59E0B';
    return '#EF4444';
  };

const getRiskLabel = (score: number) => {
    if (score <= 3) return 'LOW';
    if (score <= 6) return 'MODERATE';
    return 'HIGH';
  };

  const hasAllergyRisk = allergyData && (
    allergyData.has_skin_trouble ||
    allergyData.has_allergy ||
    allergyData.has_scalp_sensitivity ||
    allergyData.has_previous_reaction
  );

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--header-height))' }}>
      <div className="container" style={{ padding: 'var(--space-xl) var(--space-lg)', maxWidth: '1000px' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/stylist/dashboard')}>
            <ChevronLeft size={18} /> ダッシュボードに戻る
          </button>
          <div className="flex items-center gap-sm">
            <button 
              className="btn btn-ghost"
              onClick={() => navigate(`/stylist/client/client-${bookingId?.split('-')[1]}`)}
            >
              <User size={16} /> 過去の履歴を見る
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={handleGenerateSoap}
              disabled={isGeneratingSoap}
            >
              <FileSignature size={16} /> 
              {isGeneratingSoap ? 'AIカルテ生成中...' : 'SOAPカルテを自動生成'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-lg">
          
          {/* LEFT COLUMN: Customer Info & Allergy */}
          <div className="flex flex-col gap-md" style={{ gridColumn: 'span 1' }}>
            
            {/* Allergy Alert (Feature 6) */}
            {allergyData && (
              <div className="glass-card-static animate-fade-in-up" style={{ 
                border: hasAllergyRisk ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                background: hasAllergyRisk ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)'
              }}>
                <h3 className="flex items-center gap-sm" style={{ 
                  fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)',
                  color: hasAllergyRisk ? '#F87171' : '#34D399'
                }}>
                  <AlertTriangle size={18} />
                  アレルギー情報
                </h3>
                
                <div className="flex flex-col gap-sm" style={{ fontSize: 'var(--font-size-xs)' }}>
                  <div className="flex justify-between">
                    <span className="text-secondary">肌トラブル</span>
                    <span style={{ color: allergyData.has_skin_trouble ? '#F87171' : 'inherit', fontWeight: allergyData.has_skin_trouble ? 700 : 'normal' }}>
                      {allergyData.has_skin_trouble ? `あり${allergyData.skin_trouble_detail ? `（${allergyData.skin_trouble_detail}）` : ''}` : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">アレルギー</span>
                    <span style={{ color: allergyData.has_allergy ? '#F87171' : 'inherit', fontWeight: allergyData.has_allergy ? 700 : 'normal' }}>
                      {allergyData.has_allergy ? `あり${allergyData.allergy_detail ? `（${allergyData.allergy_detail}）` : ''}` : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">過去の副反応</span>
                    <span style={{ color: allergyData.has_previous_reaction ? '#F87171' : 'inherit', fontWeight: allergyData.has_previous_reaction ? 700 : 'normal' }}>
                      {allergyData.has_previous_reaction ? `あり${allergyData.previous_reaction_detail ? `（${allergyData.previous_reaction_detail}）` : ''}` : 'なし'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">パッチテスト</span>
                    <span>{allergyData.has_patch_test ? `実施済${allergyData.patch_test_result ? `（${allergyData.patch_test_result}）` : ''}` : '未実施'}</span>
                  </div>
                  
                  {hasAllergyRisk && (
                    <div style={{ marginTop: 'var(--space-xs)', padding: 'var(--space-xs) var(--space-sm)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)', color: '#F87171', fontSize: '0.65rem' }}>
                      施術前に必ずクライアントと確認し、パッチテストを推奨してください。
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Summary */}
            <div className="glass-card-static">
              <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                <User size={18} /> 顧客カルテ
              </h3>
              <div className="flex flex-col gap-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">お名前</span><span className="font-semibold">{recipe.customer.name}</span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">希望スタイル</span><span className="font-semibold">{recipe.customer.desired_style}</span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">希望のカラー</span>
                  <div className="flex items-center gap-1">
                    {recipe.customer.target_color && recipe.customer.target_color !== 'consult' ? (
                      recipe.customer.target_color.split(',').map((c: string, i: number) => (
                        <div key={i} className="rounded-full border border-subtle shadow-sm" style={{ backgroundColor: c, width: '16px', height: '16px' }} title={c} />
                      ))
                    ) : (
                      <span className="font-semibold text-secondary">未指定</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">現在の髪色</span>
                  <div className="flex items-center gap-2">
                    {recipe.customer.current_hair_color && recipe.customer.current_hair_color !== 'consult' ? (
                      <div className="rounded-full border border-subtle shadow-sm" style={{ backgroundColor: recipe.customer.current_hair_color, width: '16px', height: '16px' }} />
                    ) : (
                      <span className="font-semibold text-secondary">未指定</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">髪の長さ</span>
                  <span className="font-semibold">
                    {recipe.customer.hair_length === 'short' ? 'ショート' :
                     recipe.customer.hair_length === 'bob' ? 'ボブ' :
                     recipe.customer.hair_length === 'medium' ? 'ミディアム' :
                     recipe.customer.hair_length === 'long' ? 'ロング' :
                     recipe.customer.hair_length === 'very_long' ? 'スーパーロング' :
                     recipe.customer.hair_length}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">髪質</span>
                  <span className="font-semibold">{recipe.customer.hair_type === 'soft' ? '軟毛' : recipe.customer.hair_type === 'hard' ? '硬毛' : recipe.customer.hair_type === 'normal' ? '普通毛' : '未指定'}</span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">ブリーチ</span>
                  <span className="font-semibold">
                    {recipe.customer.has_bleach === 'yes'
                      ? `あり（${recipe.customer.bleach_count === -1 ? '回数不明' : recipe.customer.bleach_count >= 5 ? '5回以上' : `${recipe.customer.bleach_count}回`}）`
                      : recipe.customer.has_bleach === 'unknown'
                      ? 'わからない'
                      : 'なし'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">黒染め</span>
                  <span className="font-semibold">
                    {recipe.customer.has_black_dye === 'yes'
                      ? `あり（${recipe.customer.black_dye_count === -1 ? '回数不明' : recipe.customer.black_dye_count >= 5 ? '5回以上' : `${recipe.customer.black_dye_count}回`}${recipe.customer.black_dye_date ? ` / ${recipe.customer.black_dye_date === 'over1year' ? '1年以上前' : recipe.customer.black_dye_date === '1year' ? '1年以内' : recipe.customer.black_dye_date === '6months' ? '半年以内' : recipe.customer.black_dye_date === '3months' ? '3ヶ月以内' : '1ヶ月以内'}` : ''}）`
                      : recipe.customer.has_black_dye === 'unknown'
                      ? 'わからない'
                      : 'なし'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">縮毛矯正</span>
                  <span className="font-semibold">
                    {recipe.customer.has_straightening === 'yes'
                      ? `あり（${recipe.customer.straightening_count === -1 ? '回数不明' : recipe.customer.straightening_count >= 6 ? '6回以上' : `${recipe.customer.straightening_count}回`}${recipe.customer.straightening_date ? ` / ${recipe.customer.straightening_date === 'over1year' ? '1年以上前' : recipe.customer.straightening_date === '1year' ? '1年以内' : recipe.customer.straightening_date === '6months' ? '半年以内' : recipe.customer.straightening_date === '3months' ? '3ヶ月以内' : '1ヶ月以内'}` : ''}）`
                      : recipe.customer.has_straightening === 'unknown'
                      ? 'わからない'
                      : 'なし'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">パーマ</span>
                  <span className="font-semibold">
                    {recipe.customer.has_perm === 'yes'
                      ? `あり（${recipe.customer.perm_count === -1 ? '回数不明' : recipe.customer.perm_count >= 6 ? '6回以上' : `${recipe.customer.perm_count}回`}${recipe.customer.perm_count_over_5 ? ' ⚠️' : ''}${recipe.customer.perm_date ? ` / ${recipe.customer.perm_date === 'over1year' ? '1年以上前' : recipe.customer.perm_date === '1year' ? '1年以内' : recipe.customer.perm_date === '6months' ? '半年以内' : recipe.customer.perm_date === '3months' ? '3ヶ月以内' : '1ヶ月以内'}` : ''}）`
                      : recipe.customer.has_perm === 'unknown'
                      ? 'わからない'
                      : 'なし'}
                  </span>
                </div>
                {recipe.customer.previous_chemicals && (
                  <div className="flex flex-col border-b pb-xs border-subtle">
                    <span className="text-secondary mb-1">前回の使用薬剤（わかる範囲）</span>
                    <span className="font-semibold bg-tertiary p-xs rounded text-xs leading-normal">{recipe.customer.previous_chemicals}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-xs border-subtle">
                  <span className="text-secondary">ダメージレベル</span><span className="font-semibold">{recipe.customer.damage_level}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">過ごし方のご希望</span>
                  <span className="font-semibold text-primary-light" style={{ maxWidth: '60%', textAlign: 'right', lineHeight: 1.3 }}>
                    {recipe.customer.salon_vibe}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    importCustomerData();
                    setActiveTab('calculator');
                  }}
                  className="btn btn-primary btn-sm flex items-center justify-center gap-xs"
                  style={{ 
                    marginTop: 'var(--space-md)', 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    padding: '0.6rem 1rem',
                    fontWeight: 'bold',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <Download size={14} />
                  顧客データを計算シミュレータに反映
                </button>
              </div>
              
              {(recipe as any).refined_details && (recipe as any).refined_details.length > 0 && (
                <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-default)' }}>
                  <span className="text-secondary text-xs font-semibold block mb-xs">こだわり条件 (AIチャット):</span>
                  <div className="flex gap-xs flex-wrap">
                    {(recipe as any).refined_details.map((tag: string) => (
                      <span key={tag} className="chip chip-pink" style={{ padding: '0.125rem 0.5rem', fontSize: '0.65rem' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Chat History Logs */}
            {(recipe as any).chat_history && (recipe as any).chat_history.length > 0 && (
              <div className="glass-card-static">
                <h3 className="flex items-center gap-sm" style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                  <Sparkles size={16} className="text-gradient" /> AI相談ログ
                </h3>
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }} className="hide-scrollbar">
                  {(recipe as any).chat_history.map((msg: any, i: number) => (
                    <div key={i} style={{ 
                      padding: '0.5rem 0.6rem', fontSize: '0.7rem', borderRadius: 'var(--radius-md)', maxWidth: '90%',
                      alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.sender === 'user' ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
                      color: msg.sender === 'user' ? 'white' : 'var(--text-primary)'
                    }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.6rem', marginBottom: '2px', opacity: 0.8 }}>
                        {msg.sender === 'user' ? 'お客様' : 'AI Miyabi'}
                      </p>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Recipe / SOAP Tabs */}
          <div className="flex flex-col gap-lg" style={{ gridColumn: 'span 2' }}>
            
            {/* Tabs */}
            <div className="flex border-b border-default" style={{ marginBottom: 'var(--space-sm)' }}>
              <button 
                className={`px-lg py-sm font-semibold transition-colors ${activeTab === 'recipe' ? 'text-primary-light border-b-2 border-primary' : 'text-secondary hover:text-primary'}`}
                style={{ padding: '0.75rem 1.5rem', borderBottom: activeTab === 'recipe' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                onClick={() => setActiveTab('recipe')}
              >
                <Sparkles size={16} className="inline-block mr-xs" style={{ marginRight: '6px' }} /> AI施術レシピ
              </button>
              <button 
                className={`px-lg py-sm font-semibold transition-colors ${activeTab === 'calculator' ? 'text-primary-light border-b-2 border-primary' : 'text-secondary hover:text-primary'}`}
                style={{ padding: '0.75rem 1.5rem', borderBottom: activeTab === 'calculator' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                onClick={() => setActiveTab('calculator')}
              >
                <Beaker size={16} className="inline-block mr-xs" style={{ marginRight: '6px' }} /> AI薬剤計算
              </button>
              <button 
                className={`px-lg py-sm font-semibold transition-colors ${activeTab === 'soap' ? 'text-primary-light border-b-2 border-primary' : 'text-secondary hover:text-primary'}`}
                style={{ padding: '0.75rem 1.5rem', borderBottom: activeTab === 'soap' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                onClick={() => setActiveTab('soap')}
              >
                <FileSignature size={16} className="inline-block mr-xs" style={{ marginRight: '6px' }} /> SOAPカルテ
              </button>
              <button 
                className={`px-lg py-sm font-semibold transition-colors ${activeTab === 'record' ? 'text-primary-light border-b-2 border-primary' : 'text-secondary hover:text-primary'}`}
                style={{ padding: '0.75rem 1.5rem', borderBottom: activeTab === 'record' ? '2px solid var(--color-primary)' : '2px solid transparent' }}
                onClick={() => setActiveTab('record')}
              >
                <FileText size={16} className="inline-block mr-xs" style={{ marginRight: '6px' }} /> 最終カルテ(実績)
              </button>
            </div>

            {/* TAB CONTENT: AI RECIPE */}
            {activeTab === 'recipe' && (
              <div className="recipe-card animate-fade-in-up">
                <div className="recipe-header flex justify-between items-center">
                  <h2 className="flex items-center gap-sm text-xl font-bold">
                    <Sparkles size={20} className="text-primary-light" />
                    AI推奨レシピ
                  </h2>
                  <span className="flex items-center gap-xs text-secondary text-sm">
                    <Clock size={14} /> 推定 {recipe.estimated_time_minutes}分
                  </span>
                </div>

                <div className="recipe-body">
                  <div className="ai-disclaimer mb-xl" style={{ marginBottom: 'var(--space-xl)' }}>
                    ⚠️ このレシピはAIが生成した参考情報です。最終的な施術判断は美容師の専門的な判断に基づいて行ってください。
                  </div>

                  {/* Procedure Steps */}
                  <h3 className="flex items-center gap-sm text-lg font-semibold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
                    <ListOrdered size={18} /> 施術手順
                  </h3>
                  <div className="mb-xl" style={{ marginBottom: 'var(--space-xl)' }}>
                    {recipe.procedure_steps.map((step, i) => (
                      <div key={i} className="recipe-step">
                        <div className="recipe-step-number">{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div className="flex items-center gap-sm mb-xs" style={{ marginBottom: '4px' }}>
                            <span className="font-semibold">{step.title}</span>
                            <span className="chip text-xs px-2 py-0.5">{step.time}</span>
                          </div>
                          <p className="text-secondary text-sm leading-relaxed">{step.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommended Products */}
                  <h3 className="flex items-center gap-sm text-lg font-semibold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
                    <Package size={18} /> 推奨薬剤
                  </h3>
                  <div className="grid grid-cols-2 gap-sm mb-xl" style={{ marginBottom: 'var(--space-xl)' }}>
                    {recipe.recommended_products.map((p, i) => (
                      <div key={i} className="bg-tertiary p-md rounded-md border border-subtle" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div className="font-semibold text-sm mb-xs" style={{ marginBottom: '4px' }}>{p.name}</div>
                        <div className="flex gap-sm text-xs" style={{ marginBottom: '4px' }}>
                          <span className="chip chip-cyan">{p.type}</span>
                          <span className="text-muted">{p.usage}</span>
                        </div>
                        <div className="flex justify-between text-xs text-secondary" style={{ marginTop: '4px' }}>
                          <span>{p.amount_g}g × ¥{p.price_per_gram}/g</span>
                          <span className="font-semibold" style={{ color: 'var(--color-primary-light)' }}>¥{(p.amount_g * p.price_per_gram).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 薬剤原価合計 */}
                  <div style={{ padding: 'var(--space-md)', background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-xl)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">薬剤原価見積もり</span>
                      <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                        ¥{recipe.recommended_products.reduce((sum, p) => sum + p.amount_g * p.price_per_gram, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Risk Notes */}
                  <h3 className="flex items-center gap-sm text-lg font-semibold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
                    <AlertTriangle size={18} color="#FBBF24" /> リスク・注意事項
                  </h3>
                  <div style={{ padding: 'var(--space-md)', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {recipe.risk_notes}
                  </div>
                </div>
              </div>
            )}

            
            {/* TAB CONTENT: CALCULATOR */}
            {activeTab === 'calculator' && (
              <div className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-md">
                  <h2 className="text-xl font-bold flex items-center gap-sm">
                    <Beaker className="text-primary" size={24} />
                    AI薬剤計算シミュレータ
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-lg">
          {/* Input Form */}
          <div className="glass-card-static">
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
              髪の状態入力
            </h3>

            <div className="flex flex-col gap-lg">
              {/* Treatment Type */}
              <div className="form-group">
                <label className="form-label">施術タイプ</label>
                <div className="flex gap-sm">
                  {TREATMENT_TYPES.map(t => (
                    <button
                      key={t.id}
                      className={`btn ${targetTreatment === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => setTargetTreatment(t.id)}
                      style={{ flex: 1 }}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Tone (for color/bleach) */}
              {targetTreatment !== 'perm' && (
                <div className="form-group">
                  <label className="form-label">ターゲットトーン</label>
                  <div className="flex gap-xs flex-wrap">
                    {TONE_OPTIONS.map(t => (
                      <button
                        key={t.id}
                        className={`chip ${targetTone === t.id ? 'chip-active' : ''}`}
                        onClick={() => setTargetTone(t.id)}
                        style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Details (Current and Target Color) */}
              {targetTreatment === 'color' && (
                <>
                  <div className="form-group">
                    <label className="form-label">希望の髪色 (複数選択でデザインカラー)</label>
                    
                    {targetColor && (
                      <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xs)', flexWrap: 'wrap' }}>
                        {targetColor.split(',').map((c, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{c}</span>
                            <button
                              onClick={() => {
                                const newColors = targetColor.split(',').filter(hc => hc !== c);
                                setTargetColor(newColors.join(','));
                              }}
                              style={{ marginLeft: '4px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '10px' }}
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: '2px', marginBottom: 'var(--space-sm)' }}>
                      {PRESET_COLORS.map(color => {
                        const isSelected = targetColor ? targetColor.split(',').includes(color) : false;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              const currentColors = targetColor ? targetColor.split(',') : [];
                              if (isSelected) {
                                setTargetColor(currentColors.filter(c => c !== color).join(','));
                              } else if (currentColors.length < 3) {
                                setTargetColor([...currentColors, color].join(','));
                              }
                            }}
                            style={{
                              aspectRatio: '1/1',
                              width: '100%',
                              background: color,
                              border: isSelected ? '2px solid white' : 'none',
                              boxShadow: isSelected ? '0 0 0 2px var(--color-primary)' : 'none',
                              cursor: 'pointer',
                              borderRadius: '2px',
                              transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                              zIndex: isSelected ? 10 : 1,
                              transition: 'transform 0.1s'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">現在の髪色</label>
                    {currentColor && (
                      <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: currentColor }} />
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{currentColor}</span>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(18, 1fr)', gap: '2px', marginBottom: 'var(--space-sm)' }}>
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCurrentColor(color)}
                          style={{
                            aspectRatio: '1/1',
                            width: '100%',
                            background: color,
                            border: currentColor === color ? '2px solid white' : 'none',
                            boxShadow: currentColor === color ? '0 0 0 2px var(--color-primary)' : 'none',
                            cursor: 'pointer',
                            borderRadius: '2px',
                            transform: currentColor === color ? 'scale(1.2)' : 'scale(1)',
                            zIndex: currentColor === color ? 10 : 1,
                            transition: 'transform 0.1s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Hair Length */}
              <div className="form-group">
                <label className="form-label">髪の長さ</label>
                <div className="flex gap-xs flex-wrap">
                  {LENGTH_OPTIONS.map(l => (
                    <button
                      key={l.id}
                      className={`chip ${hairLength === l.id ? 'chip-active' : ''}`}
                      onClick={() => setHairLength(l.id)}
                      style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Type */}
              <div className="form-group">
                <label className="form-label">髪質</label>
                <div className="flex gap-xs flex-wrap">
                  {HAIR_TYPE_OPTIONS.map(h => (
                    <button
                      key={h.id}
                      className={`chip ${hairType === h.id ? 'chip-active' : ''}`}
                      onClick={() => setHairType(h.id)}
                      style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bleach Count */}
              <div className="form-group">
                <label className="form-label">ブリーチ回数</label>
                <div className="flex gap-xs flex-wrap">
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      className={`chip ${bleachCount === n ? 'chip-active' : ''}`}
                      onClick={() => setBleachCount(n)}
                      style={{ cursor: 'pointer' }}
                    >
                      {n === 0 ? 'なし' : n === 5 ? '5+' : `${n}回`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Black Dye (黒染め) */}
              <div className="form-group">
                <label className="form-label">黒染め履歴</label>
                <div className="flex gap-xs flex-wrap" style={{ marginBottom: hasBlackDye ? 'var(--space-xs)' : '0' }}>
                  <button
                    className={`chip ${!hasBlackDye ? 'chip-active' : ''}`}
                    onClick={() => setHasBlackDye(false)}
                    style={{ cursor: 'pointer' }}
                  >
                    なし
                  </button>
                  <button
                    className={`chip ${hasBlackDye ? 'chip-active' : ''}`}
                    onClick={() => setHasBlackDye(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    あり
                  </button>
                </div>
                {hasBlackDye && (
                  <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-xs)' }}>
                    <div className="flex gap-xs flex-wrap">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          className={`chip ${blackDyeCount === n ? 'chip-active' : ''}`}
                          onClick={() => setBlackDyeCount(n)}
                          style={{ cursor: 'pointer' }}
                        >
                          {n === 5 ? '5+' : `${n}回`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Straightening (縮毛矯正) */}
              <div className="form-group">
                <label className="form-label">縮毛矯正履歴</label>
                <div className="flex gap-xs flex-wrap" style={{ marginBottom: hasStraightening ? 'var(--space-xs)' : '0' }}>
                  <button
                    className={`chip ${!hasStraightening ? 'chip-active' : ''}`}
                    onClick={() => setHasStraightening(false)}
                    style={{ cursor: 'pointer' }}
                  >
                    なし
                  </button>
                  <button
                    className={`chip ${hasStraightening ? 'chip-active' : ''}`}
                    onClick={() => setHasStraightening(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    あり
                  </button>
                </div>
                {hasStraightening && (
                  <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-xs)' }}>
                    <div className="flex gap-xs flex-wrap">
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <button
                          key={n}
                          className={`chip ${straighteningCount === n ? 'chip-active' : ''}`}
                          onClick={() => setStraighteningCount(n)}
                          style={{ cursor: 'pointer' }}
                        >
                          {n === 6 ? '6+' : `${n}回`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Perm (パーマ) */}
              <div className="form-group">
                <label className="form-label">パーマ履歴</label>
                <div className="flex gap-xs flex-wrap" style={{ marginBottom: hasPerm ? 'var(--space-xs)' : '0' }}>
                  <button
                    className={`chip ${!hasPerm ? 'chip-active' : ''}`}
                    onClick={() => setHasPerm(false)}
                    style={{ cursor: 'pointer' }}
                  >
                    なし
                  </button>
                  <button
                    className={`chip ${hasPerm ? 'chip-active' : ''}`}
                    onClick={() => setHasPerm(true)}
                    style={{ cursor: 'pointer' }}
                  >
                    あり
                  </button>
                </div>
                {hasPerm && (
                  <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-xs)' }}>
                    <div className="flex gap-xs flex-wrap">
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <button
                          key={n}
                          className={`chip ${permCount === n ? 'chip-active' : ''}`}
                          onClick={() => setPermCount(n)}
                          style={{ cursor: 'pointer' }}
                        >
                          {n === 6 ? '6+' : `${n}回`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Damage Level */}
              <div className="form-group">
                <label className="form-label">ダメージレベル: {damageLevel}/5</label>
                <input
                  type="range"
                  min="1" max="5" step="1"
                  value={damageLevel}
                  onChange={(e) => setDamageLevel(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>軽い</span><span>重い</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={handleCalculate}
                disabled={isCalculating}
                style={{ marginTop: 'var(--space-sm)' }}
              >
                {isCalculating ? (
                  <><RefreshCw size={18} className="animate-spin" /> 計算中...</>
                ) : (
                  <><Sparkles size={18} /> AI薬剤計算を実行</>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-lg">
            {!calcResult && !isCalculating && (
              <div className="glass-card-static flex flex-col items-center justify-center" style={{ flex: 1, textAlign: 'center', color: 'var(--text-muted)', minHeight: '400px' }}>
                <Beaker size={48} style={{ opacity: 0.2, marginBottom: 'var(--space-md)' }} />
                <p>左のフォームを入力して<br />「AI薬剤計算を実行」をクリック</p>
              </div>
            )}

            {isCalculating && (
              <div className="glass-card-static flex flex-col items-center justify-center" style={{ flex: 1, textAlign: 'center', minHeight: '400px' }}>
                <div className="pulse-animation" style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-accent), #0891B2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 'var(--space-lg)',
                  boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
                }}>
                  <Beaker size={28} color="white" />
                </div>
                <h3 style={{ fontWeight: 700 }}>AIが最適処方を計算中...</h3>
                <p className="text-secondary text-sm">ダメージレベル・履歴・施術内容を照合しています</p>
              </div>
            )}

            {calcResult && !isCalculating && (
              <>
                {/* Risk Score */}
                <div className="glass-card-static animate-fade-in-up">
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={20} />
                      リスク評価
                    </h3>
                    <div style={{
                      fontSize: 'var(--font-size-2xl)', fontWeight: 800,
                      color: getRiskColor(calcResult?.risk_score),
                    }}>
                      {calcResult?.risk_score}/10
                    </div>
                  </div>

                  {/* Risk bar */}
                  <div style={{
                    height: '8px', borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)', overflow: 'hidden',
                    marginBottom: 'var(--space-md)',
                  }}>
                    <div style={{
                      height: '100%', width: `${calcResult?.risk_score * 10}%`,
                      background: `linear-gradient(90deg, #10B981, ${getRiskColor(calcResult?.risk_score)})`,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>

                  <span className="badge" style={{
                    background: `${getRiskColor(calcResult?.risk_score)}20`,
                    color: getRiskColor(calcResult?.risk_score),
                    padding: '0.25rem 0.75rem',
                  }}>
                    {getRiskLabel(calcResult?.risk_score)} RISK
                  </span>

                  {/* Warnings */}
                  {calcResult.warnings.length > 0 && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      {calcResult.warnings.map((w, i) => (
                        <div key={i} style={{
                          padding: 'var(--space-sm) var(--space-md)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--font-size-xs)',
                          color: '#F87171',
                          display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start',
                        }}>
                          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                          {w}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Risk factors */}
                  {calcResult?.risk_factors.length > 0 && (
                    <div style={{ marginTop: 'var(--space-md)' }}>
                      <span className="text-xs text-secondary" style={{ fontWeight: 600 }}>リスク要因:</span>
                      <ul style={{ margin: 'var(--space-xs) 0 0 var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {calcResult?.risk_factors.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Alkaline/Acidic Ratio */}
                <div className="glass-card-static animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Beaker size={16} />
                    アルカリ／酸性 バランス
                  </h3>
                  <div style={{
                    height: '24px', borderRadius: 'var(--radius-full)', overflow: 'hidden',
                    display: 'flex', marginBottom: 'var(--space-sm)',
                  }}>
                    <div style={{
                      width: `${calcResult.alkaline_acidic_ratio.alkaline_percent}%`,
                      background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700, color: 'white',
                    }}>
                      {calcResult.alkaline_acidic_ratio.alkaline_percent}%
                    </div>
                    <div style={{
                      width: `${calcResult.alkaline_acidic_ratio.acidic_percent}%`,
                      background: 'linear-gradient(90deg, #06B6D4, #22D3EE)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700, color: 'white',
                    }}>
                      {calcResult.alkaline_acidic_ratio.acidic_percent}%
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--color-primary-light)' }}>🔹 アルカリ</span>
                    <span style={{ color: 'var(--color-accent-light)' }}>🔸 酸性・ケア</span>
                  </div>
                </div>

                {/* Recommended Agents */}
                <div className="glass-card-static animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>推奨薬剤</h3>
                    <span className="flex items-center gap-xs text-xs text-secondary">
                      <Clock size={12} />
                      推定 {calcResult.processing_time_minutes}分
                    </span>
                  </div>

                  <div className="flex flex-col gap-sm">
                    {calcResult?.recommended_agents.map((entry, i) => (
                      <div key={i} style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xs)' }}>
                          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{entry.agent.name}</span>
                          <span className="chip chip-cyan" style={{ fontSize: '0.6rem' }}>{entry.agent.ph_range}</span>
                        </div>
                        <div className="flex items-center gap-sm text-xs" style={{ marginBottom: 'var(--space-xs)' }}>
                          <span className="chip" style={{ fontSize: '0.6rem' }}>{entry.role}</span>
                          <span className="text-muted">{entry.mix_ratio}</span>
                        </div>
                        <p className="text-xs text-secondary">{entry.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estimated Cost */}
                {(() => {
                  const inventoryStr = localStorage.getItem('stylist_inventory');
                  let inventoryItems: { brand_name: string; product_line: string; price_per_gram: number; is_available: boolean }[] = [];
                  try { if (inventoryStr) inventoryItems = JSON.parse(inventoryStr); } catch {}
                  
                  const defaultPrices: Record<string, number> = { 'alkaline': 10, 'acidic': 8, 'developer': 2, 'treatment': 30, 'bleach': 15, 'neutral': 12 };
                  const defaultAmounts: Record<string, number> = { 'alkaline': 40, 'acidic': 40, 'developer': 60, 'treatment': 15, 'bleach': 50, 'neutral': 40 };
                  
                  let totalCost = 0;
                  const costItems = calcResult?.recommended_agents.map(entry => {
                    const t = entry.agent.type || 'alkaline';
                    const amount = defaultAmounts[t] || 30;
                    
                    let price = defaultPrices[t] || 10;
                    for (const inv of inventoryItems) {
                      if (inv.is_available && entry.agent.name.includes(inv.brand_name)) {
                        price = inv.price_per_gram || price;
                        break;
                      }
                    }
                    
                    const subtotal = amount * price;
                    totalCost += subtotal;
                    return { name: entry.agent.name, amount, price, subtotal };
                  });

                  return (
                    <div className="glass-card-static animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💰 薬剤原価見積もり
                      </h3>
                      <div className="flex flex-col gap-xs" style={{ marginBottom: 'var(--space-md)' }}>
                        {costItems.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs" style={{ padding: '0.3rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <span className="text-secondary" style={{ maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                            <span className="text-secondary">{item.amount}g × ¥{item.price}/g</span>
                            <span className="font-semibold">¥{item.subtotal.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center" style={{ paddingTop: 'var(--space-sm)', borderTop: '2px solid var(--border-default)' }}>
                        <span className="font-bold">合計原価</span>
                        <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                          ¥{totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Pre/Post Treatments */}
                <div className="glass-card-static animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
                    前後処理
                  </h3>
                  {calcResult.pre_treatments.length > 0 && (
                    <div style={{ marginBottom: 'var(--space-md)' }}>
                      <span className="text-xs" style={{ fontWeight: 600, color: '#10B981' }}>前処理:</span>
                      <ul style={{ margin: 'var(--space-xs) 0 0 var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        {calcResult.pre_treatments.map((t, i) => (
                          <li key={i} className="flex items-center gap-xs">
                            <CheckCircle2 size={10} style={{ color: '#10B981' }} />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <span className="text-xs" style={{ fontWeight: 600, color: 'var(--color-accent-light)' }}>後処理:</span>
                    <ul style={{ margin: 'var(--space-xs) 0 0 var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                      {calcResult.post_treatments.map((t, i) => (
                        <li key={i} className="flex items-center gap-xs">
                          <CheckCircle2 size={10} style={{ color: 'var(--color-accent-light)' }} />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Disclaimer */}
                <div className="ai-disclaimer" style={{ fontSize: 'var(--font-size-xs)' }}>
                  ⚠️ このレシピはAIが生成した参考情報です。最終的な薬剤選定は美容師の専門的な判断に基づいて行ってください。
                </div>
              </>
            )}
          </div>
        </div>
              </div>
            )}

            {/* TAB CONTENT: SOAP CHART (Feature 5) */}
            {activeTab === 'soap' && (
              <div className="animate-fade-in-up">
                {!soapChart ? (
                  <div className="glass-card-static flex flex-col items-center justify-center" style={{ minHeight: '300px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FileSignature size={48} style={{ opacity: 0.2, marginBottom: 'var(--space-md)' }} />
                    <p style={{ marginBottom: 'var(--space-md)' }}>カルテがまだ作成されていません</p>
                    <button className="btn btn-primary" onClick={handleGenerateSoap}>
                      <Sparkles size={16} /> AIから自動生成する
                    </button>
                  </div>
                ) : (
                  <div className="glass-card-static" style={{ position: 'relative' }}>
                    {soapChart.is_ai_generated && (
                      <div className="badge badge-pending" style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)' }}>
                        <Sparkles size={12} /> AI生成 (未編集)
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-lg" style={{ marginBottom: 'var(--space-lg)' }}>
                      <h2 className="text-xl font-bold">SOAPカルテ</h2>
                      {!isEditingSoap ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => setIsEditingSoap(true)}>
                          編集する
                        </button>
                      ) : (
                        <div className="flex gap-sm">
                          <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingSoap(false)}>キャンセル</button>
                          <button className="btn btn-primary btn-sm" onClick={saveSoap}>保存</button>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-md" style={{ gridTemplateColumns: '1fr' }}>
                      
                      {/* S: Subjective */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ color: '#F472B6', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(244, 114, 182, 0.2)', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem' }}>S</span>
                          主観的情報
                        </h4>
                        {isEditingSoap ? (
                          <textarea className="form-input form-textarea w-full text-sm" value={soapEditForm.subjective} onChange={e => setSoapEditForm({...soapEditForm, subjective: e.target.value})} rows={4} />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{soapChart.subjective}</div>
                        )}
                      </div>

                      {/* O: Objective */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ color: '#60A5FA', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(96, 165, 250, 0.2)', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem' }}>O</span>
                          客観的情報
                        </h4>
                        {isEditingSoap ? (
                          <textarea className="form-input form-textarea w-full text-sm" value={soapEditForm.objective} onChange={e => setSoapEditForm({...soapEditForm, objective: e.target.value})} rows={5} />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{soapChart.objective}</div>
                        )}
                      </div>

                      {/* A: Assessment */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ color: '#FBBF24', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.2)', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem' }}>A</span>
                          評価・見立て
                        </h4>
                        {isEditingSoap ? (
                          <textarea className="form-input form-textarea w-full text-sm" value={soapEditForm.assessment} onChange={e => setSoapEditForm({...soapEditForm, assessment: e.target.value})} rows={4} />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{soapChart.assessment}</div>
                        )}
                      </div>

                      {/* P: Plan */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ color: '#34D399', marginBottom: 'var(--space-sm)' }}>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem' }}>P</span>
                          施術計画
                        </h4>
                        {isEditingSoap ? (
                          <textarea className="form-input form-textarea w-full text-sm" value={soapEditForm.plan} onChange={e => setSoapEditForm({...soapEditForm, plan: e.target.value})} rows={4} />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{soapChart.plan}</div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MEDICAL RECORD (Feature 8) */}
            {activeTab === 'record' && (
              <div className="animate-fade-in-up">
                {!medicalRecord && !isEditingRecord ? (
                  <div className="glass-card-static flex flex-col items-center justify-center" style={{ minHeight: '300px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={48} style={{ opacity: 0.2, marginBottom: 'var(--space-md)' }} />
                    <p style={{ marginBottom: 'var(--space-md)' }}>施術後の最終カルテがまだ登録されていません</p>
                    <button className="btn btn-primary" onClick={() => {
                      setRecordEditForm(prev => ({
                        ...prev,
                        actual_recipe: recipe.recommended_products.map(p => `${p.name} (${p.usage})`).join('\n')
                      }));
                      setIsEditingRecord(true);
                    }}>
                      <Sparkles size={16} /> 最終カルテを作成する
                    </button>
                  </div>
                ) : (
                  <div className="glass-card-static" style={{ position: 'relative' }}>
                    <div className="flex items-center justify-between mb-lg" style={{ marginBottom: 'var(--space-lg)' }}>
                      <h2 className="text-xl font-bold text-gradient">施術実績・最終カルテ</h2>
                      {!isEditingRecord ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                          if (!medicalRecord?.actual_recipe) {
                            // Pre-fill with AI recipe text
                            setRecordEditForm(prev => ({
                              ...prev,
                              actual_recipe: recipe.recommended_products.map(p => `${p.name} (${p.usage})`).join('\n')
                            }));
                          } else {
                            setRecordEditForm({
                              actual_recipe: medicalRecord.actual_recipe,
                              private_notes: medicalRecord.private_notes,
                              before_image_urls: medicalRecord.before_image_urls,
                              after_image_urls: medicalRecord.after_image_urls,
                            });
                          }
                          setIsEditingRecord(true);
                        }}>
                          編集する
                        </button>
                      ) : (
                        <div className="flex gap-sm">
                          {medicalRecord && (
                            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingRecord(false)}>キャンセル</button>
                          )}
                          <button className="btn btn-primary btn-sm" onClick={handleSaveRecord}>保存</button>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-md" style={{ gridTemplateColumns: '1fr' }}>
                      {/* 実際の使用薬剤・レシピ */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ color: 'var(--color-primary-light)', marginBottom: 'var(--space-sm)' }}>
                          実際の使用薬剤・レシピ
                        </h4>
                        {isEditingRecord ? (
                          <textarea 
                            className="form-input form-textarea w-full text-sm" 
                            placeholder="例: イルミナカラー オーシャン8 + サファリ8 (1:1) 4.5%オキシ"
                            value={recordEditForm.actual_recipe} 
                            onChange={e => setRecordEditForm({...recordEditForm, actual_recipe: e.target.value})} 
                            rows={5} 
                          />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{medicalRecord?.actual_recipe || '未登録'}</div>
                        )}
                      </div>

                      {/* 美容師用非公開メモ */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>
                          非公開メモ（次回への引継ぎ事項など）
                        </h4>
                        {isEditingRecord ? (
                          <textarea 
                            className="form-input form-textarea w-full text-sm" 
                            placeholder="例: 毛先の入りが早かったので次回は時間短め。K-POPアイドルの話題で盛り上がった。"
                            value={recordEditForm.private_notes} 
                            onChange={e => setRecordEditForm({...recordEditForm, private_notes: e.target.value})} 
                            rows={4} 
                          />
                        ) : (
                          <div className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">{medicalRecord?.private_notes || 'なし'}</div>
                        )}
                      </div>

                      {/* Before / After 写真 */}
                      <div className="bg-tertiary p-md rounded-lg border border-default" style={{ padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                        <h4 className="flex items-center gap-xs font-semibold mb-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                          <ImageIcon size={16} /> Before / After 写真
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-md">
                          {/* Before Images */}
                          <div>
                            <div className="text-xs font-semibold text-secondary mb-xs">Before</div>
                            <div className="flex flex-wrap gap-sm">
                              {(isEditingRecord ? recordEditForm.before_image_urls : medicalRecord?.before_image_urls)?.map((_, i) => (
                                <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <ImageIcon size={24} />
                                  </div>
                                  {isEditingRecord && (
                                    <button onClick={() => removeImage('before', i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}>
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {isEditingRecord && (
                                <button 
                                  onClick={() => handleImageUpload('before')}
                                  style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-default)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent' }}
                                  className="text-secondary hover:text-primary hover:border-primary transition-colors"
                                >
                                  <Upload size={16} className="mb-xs" />
                                  <span style={{ fontSize: '10px' }}>アップロード</span>
                                </button>
                              )}
                              {!isEditingRecord && !(medicalRecord?.before_image_urls?.length) && (
                                <div className="text-xs text-muted">画像なし</div>
                              )}
                            </div>
                          </div>

                          {/* After Images */}
                          <div>
                            <div className="text-xs font-semibold text-secondary mb-xs">After</div>
                            <div className="flex flex-wrap gap-sm">
                              {(isEditingRecord ? recordEditForm.after_image_urls : medicalRecord?.after_image_urls)?.map((_, i) => (
                                <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <ImageIcon size={24} />
                                  </div>
                                  {isEditingRecord && (
                                    <button onClick={() => removeImage('after', i)} style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '2px', cursor: 'pointer' }}>
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              {isEditingRecord && (
                                <button 
                                  onClick={() => handleImageUpload('after')}
                                  style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-default)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent' }}
                                  className="text-secondary hover:text-primary hover:border-primary transition-colors"
                                >
                                  <Upload size={16} className="mb-xs" />
                                  <span style={{ fontSize: '10px' }}>アップロード</span>
                                </button>
                              )}
                              {!isEditingRecord && !(medicalRecord?.after_image_urls?.length) && (
                                <div className="text-xs text-muted">画像なし</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Chat with Client Section */}
            <div className="glass-card-static mt-lg" style={{ marginTop: 'var(--space-lg)' }}>
              <h3 className="flex items-center gap-sm text-lg font-semibold mb-md" style={{ marginBottom: 'var(--space-md)' }}>
                <FileText size={18} /> 顧客への事前メッセージ
              </h3>
              <div style={{ minHeight: '120px', maxHeight: '200px', overflowY: 'auto', padding: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-xl)' }}>
                    <p className="text-sm">レシピの内容を確認し、お客様に事前メッセージを送信できます</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-sm">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="chat-bubble sent" style={{ maxWidth: '85%' }}>
                        <div className="text-xs text-muted mb-xs" style={{ marginBottom: '4px', opacity: 0.7 }}>{msg.time}</div>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="chat-input-area" style={{ borderTop: '1px solid var(--border-subtle)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', margin: '0 calc(-1 * var(--space-lg)) calc(-1 * var(--space-lg))', padding: 'var(--space-md) var(--space-lg)' }}>
                <input
                  className="chat-input flex-1"
                  type="text"
                  placeholder="メッセージを入力..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                />
                <button className="btn btn-primary btn-sm" onClick={sendChat}>
                  <Send size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
