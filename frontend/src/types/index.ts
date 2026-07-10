/**
 * TypeScript type definitions matching the database schema.
 */

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export type UserRole = 'user' | 'stylist';

export type HairLength = 'short' | 'bob' | 'medium' | 'long' | 'very_long';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// ──────────────────────────────────────────────
// Profiles
// ──────────────────────────────────────────────

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

// ──────────────────────────────────────────────
// Questionnaire (Expanded)
// ──────────────────────────────────────────────

export interface QuestionnaireData {
  hair_length: HairLength;
  has_bleach: 'yes' | 'no' | 'unknown';
  bleach_count: number;
  has_black_dye: 'yes' | 'no' | 'unknown';
  has_straightening: 'yes' | 'no' | 'unknown';
  has_perm: 'yes' | 'no' | 'unknown';
  current_hair_color: string;
  damage_level: number;
  additional_notes?: string;
  // Expanded fields
  straightening_date: string;
  straightening_count: number;
  perm_date: string;
  perm_count: number;
  perm_count_over_5: boolean;
  previous_chemicals: string;
  perm_feasibility_notes: string;
  black_dye_count: number;
  black_dye_date: string;
  salon_vibe: string;
  hair_type: 'soft' | 'normal' | 'hard';
  wants_design_color: boolean;
  target_color: string;
}

export interface Questionnaire extends QuestionnaireData {
  id: string;
  user_id: string;
  created_at: string;
}

// ──────────────────────────────────────────────
// Allergy Checklist (Feature 6)
// ──────────────────────────────────────────────

export interface AllergyChecklistData {
  questionnaire_id: string;
  has_skin_trouble: boolean;
  skin_trouble_detail: string;
  has_allergy: boolean;
  allergy_detail: string;
  has_patch_test: boolean;
  patch_test_result: string;
  has_scalp_sensitivity: boolean;
  has_previous_reaction: boolean;
  previous_reaction_detail: string;
  consent_acknowledged: boolean;
}

export interface AllergyChecklist extends AllergyChecklistData {
  id: string;
  user_id: string;
  created_at: string;
}

// ──────────────────────────────────────────────
// Desired Styles
// ──────────────────────────────────────────────

export interface DesiredStyleCreate {
  image_url: string;
  description: string;
  questionnaire_id: string;
}

export interface DesiredStyle extends DesiredStyleCreate {
  id: string;
  user_id: string;
  created_at: string;
}

// ──────────────────────────────────────────────
// Stylist Profiles
// ──────────────────────────────────────────────

export interface StylistProfile {
  id: string;
  profile_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  specialties: string[];
  product_brands: string[];
  years_experience: number;
  location: string;
  portfolio_urls: string[];
  rating: number;
  review_count: number;
  created_at: string;
  base_price: number;
  salon_atmosphere: string;
  customer_service_style: string;
}

export interface StylistProfileUpdate {
  bio?: string;
  specialties?: string[];
  product_brands?: string[];
  years_experience?: number;
  location?: string;
  portfolio_urls?: string[];
  base_price?: number;
  salon_atmosphere?: string;
  customer_service_style?: string;
}

export interface InventoryItem {
  brand_name: string;
  product_line: string;
  is_available: boolean;
  price_per_gram: number;  // yen per gram (or ml)
}

export interface StylistInventory {
  stylist_id: string;
  items: InventoryItem[];
  updated_at: string;
}

// ──────────────────────────────────────────────
// Bookings
// ──────────────────────────────────────────────

export interface BookingCreate {
  stylist_id: string;
  desired_style_id: string;
  questionnaire_id: string;
  preferred_datetime: string;
  message: string;
}

export interface Booking {
  id: string;
  user_id: string;
  stylist_id: string;
  desired_style_id: string;
  questionnaire_id: string;
  preferred_datetime: string;
  status: BookingStatus;
  ai_recipe_id: string | null;
  message: string;
  created_at: string;
  questionnaire?: Questionnaire | null;
  desired_style?: DesiredStyle | null;
  stylist?: StylistProfile | null;
}

// ──────────────────────────────────────────────
// AI Recipes
// ──────────────────────────────────────────────

export interface RecommendedProduct {
  name: string;
  type: string;
  usage: string;
}

export interface AIRecipe {
  id: string;
  booking_id: string;
  recipe_text: string;
  recommended_products: RecommendedProduct[];
  procedure_steps: string[];
  estimated_time_minutes: number;
  risk_notes: string;
  disclaimer: string;
  created_at: string;
}

// ──────────────────────────────────────────────
// Chat
// ──────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

// ──────────────────────────────────────────────
// Matching
// ──────────────────────────────────────────────

export interface MatchedStylist {
  stylist: StylistProfile;
  match_score: number;
  match_reasons: string[];
}

// ──────────────────────────────────────────────
// Chemical Calculation (Feature 4)
// ──────────────────────────────────────────────

export interface ChemicalCalculationRequest {
  damage_level: number;
  bleach_count: number;
  target_treatment: string;
  target_tone: string;
  has_straightening: boolean;
  has_perm: boolean;
  has_black_dye: boolean;
  hair_length: string;
  perm_count: number;
  hair_type: 'soft' | 'normal' | 'hard';
  wants_design_color: boolean;
}

export interface ChemicalAgent {
  id: string;
  name: string;
  type: string;
  strength: string;
  ph_range: string;
  description: string;
  risk_level: number;
  suitable_damage_max: number;
}

export interface RecommendedAgentEntry {
  agent: ChemicalAgent;
  role: string;
  mix_ratio: string;
  reason: string;
}

export interface ChemicalCalculationResult {
  id: string;
  recommended_agents: RecommendedAgentEntry[];
  processing_time_minutes: number;
  risk_score: number;
  risk_factors: string[];
  warnings: string[];
  pre_treatments: string[];
  post_treatments: string[];
  alkaline_acidic_ratio: {
    alkaline_percent: number;
    acidic_percent: number;
  };
  created_at: string;
}

// ──────────────────────────────────────────────
// SOAP Charts (Feature 5)
// ──────────────────────────────────────────────

export interface SOAPChart {
  id: string;
  booking_id: string;
  stylist_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface SOAPChartUpdate {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

// ──────────────────────────────────────────────
// Style Tags (Feature 7)
// ──────────────────────────────────────────────

export type StyleTag =
  | 'anime'
  | 'kpop'
  | 'natural'
  | 'mode'
  | 'street'
  | 'classic'
  | 'girly'
  | 'cool'
  | 'vivid'
  | 'transparent';

export const STYLE_TAG_LABELS: Record<StyleTag, string> = {
  anime: 'アニメ系',
  kpop: 'K-POP系',
  natural: 'ナチュラル',
  mode: 'モード',
  street: 'ストリート',
  classic: 'クラシック',
  girly: 'ガーリー',
  cool: 'クール',
  vivid: 'ビビッド',
  transparent: '透明感',
};

// ──────────────────────────────────────────────
// Hair option labels (for UI display)
// ──────────────────────────────────────────────

export const HAIR_LENGTH_LABELS: Record<HairLength, string> = {
  short: 'ショート',
  bob: 'ボブ',
  medium: 'ミディアム',
  long: 'ロング',
  very_long: 'スーパーロング',
  unknown: 'わからない',
};

export const DAMAGE_LEVEL_LABELS: Record<number, string> = {
  0: 'わからない',
  1: 'ほぼダメージなし',
  2: '軽いダメージ',
  3: '中程度のダメージ',
  4: 'ダメージが目立つ',
  5: 'ハイダメージ',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '承認待ち',
  approved: '承認済み',
  rejected: '不承認',
  cancelled: 'キャンセル',
};

export const STRAIGHTENING_DATE_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: '1month', label: '1ヶ月以内' },
  { value: '3months', label: '3ヶ月以内' },
  { value: '6months', label: '半年以内' },
  { value: '1year', label: '1年以内' },
  { value: 'over1year', label: '1年以上前' },
];

export const PERM_DATE_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: '1month', label: '1ヶ月以内' },
  { value: '3months', label: '3ヶ月以内' },
  { value: '6months', label: '半年以内' },
  { value: '1year', label: '1年以内' },
  { value: 'over1year', label: '1年以上前' },
];

export const BLACK_DYE_DATE_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: '1month', label: '1ヶ月以内' },
  { value: '3months', label: '3ヶ月以内' },
  { value: '6months', label: '半年以内' },
  { value: '1year', label: '1年以内' },
  { value: 'over1year', label: '1年以上前' },
];

export const SALON_VIBE_OPTIONS = [
  { value: '気にしない・美容師におまかせ', label: '気にしない・美容師におまかせ', icon: '🍃' },
  { value: '静かに過ごしたい', label: '静かに過ごしたい（雑誌やスマホを見たい・ゆっくり休みたい）', icon: '🎧' },
  { value: '髪の悩みやお手入れについてだけ話したい', label: '髪の悩みやお手入れについてだけ話したい', icon: '💇‍♀️' },
  { value: '楽しく会話したい', label: '楽しく会話したい', icon: '🗣️' },
];

export interface HairColorDef {
  id: string;
  name: string;
  hex: string;
  category: 'high_tone' | 'mid_tone' | 'dark_tone';
  requiresBleach: boolean;
  minBleachCount: number;
}

export const HAIR_COLOR_PALETTE: HairColorDef[] = [
  // High Tone (Requires Bleach)
  { id: 'white_blonde', name: 'ホワイトブロンド', hex: '#F0E6D2', category: 'high_tone', requiresBleach: true, minBleachCount: 2 },
  { id: 'silver_ash', name: 'シルバーアッシュ', hex: '#C0C4C9', category: 'high_tone', requiresBleach: true, minBleachCount: 2 },
  { id: 'milk_tea', name: 'ミルクティーベージュ', hex: '#D4B895', category: 'high_tone', requiresBleach: true, minBleachCount: 1 },
  { id: 'pink_beige', name: 'ピンクベージュ', hex: '#E6B3B3', category: 'high_tone', requiresBleach: true, minBleachCount: 1 },
  { id: 'ash_gray', name: 'ハイトーンアッシュ', hex: '#9BA3B5', category: 'high_tone', requiresBleach: true, minBleachCount: 1 },
  
  // Mid Tone
  { id: 'greige', name: 'グレージュ', hex: '#A9A59F', category: 'mid_tone', requiresBleach: true, minBleachCount: 1 },
  { id: 'apricot', name: 'アプリコットオレンジ', hex: '#F3B08C', category: 'mid_tone', requiresBleach: true, minBleachCount: 1 },
  { id: 'pink_brown', name: 'ピンクブラウン', hex: '#D98C9B', category: 'mid_tone', requiresBleach: false, minBleachCount: 0 },
  { id: 'red_brown', name: 'レッドブラウン', hex: '#8B3A3A', category: 'mid_tone', requiresBleach: false, minBleachCount: 0 },
  { id: 'olive_ash', name: 'オリーブアッシュ', hex: '#7a8b75', category: 'mid_tone', requiresBleach: false, minBleachCount: 0 },
  { id: 'khaki_beige', name: 'カーキベージュ', hex: '#8F9779', category: 'mid_tone', requiresBleach: false, minBleachCount: 0 },
  { id: 'lavender_ash', name: 'ラベンダーアッシュ', hex: '#A291A8', category: 'mid_tone', requiresBleach: false, minBleachCount: 0 },
  { id: 'chocolate', name: 'ショコラブラウン', hex: '#5D4037', category: 'mid_tone', requiresBleach: false, minBleachCount: 0 },

  // Dark Tone
  { id: 'natural_brown', name: 'ナチュラルブラウン', hex: '#6B4423', category: 'dark_tone', requiresBleach: false, minBleachCount: 0 },
  { id: 'dark_greige', name: 'ダークグレージュ', hex: '#5C5A57', category: 'dark_tone', requiresBleach: false, minBleachCount: 0 },
  { id: 'cherry_red', name: 'チェリーレッド', hex: '#6B2737', category: 'dark_tone', requiresBleach: false, minBleachCount: 0 },
  { id: 'blue_black', name: 'ブルーブラック', hex: '#1C2331', category: 'dark_tone', requiresBleach: false, minBleachCount: 0 },
  { id: 'black', name: '地毛/黒髪', hex: '#111111', category: 'dark_tone', requiresBleach: false, minBleachCount: 0 },
];

// ──────────────────────────────────────────────
// Medical Records (カルテ)
// ──────────────────────────────────────────────

export interface MedicalRecordCreate {
  booking_id: string;
  stylist_id: string;
  user_id: string;
  actual_recipe: string;
  before_image_urls: string[];
  after_image_urls: string[];
  private_notes: string;
}

export interface MedicalRecord extends MedicalRecordCreate {
  id: string;
  created_at: string;
}
