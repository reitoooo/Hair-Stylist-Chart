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
  bleach_count: number;
  has_black_dye: boolean;
  has_straightening: boolean;
  has_perm: boolean;
  current_hair_color: string;
  damage_level: number;
  additional_notes: string;
  // Expanded fields
  straightening_date: string;
  straightening_count: number;
  perm_date: string;
  perm_count: number;
  perm_count_over_5: boolean;
  previous_chemicals: string;
  perm_feasibility_notes: string;
  black_dye_count: number;
  salon_vibe: string;
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
}

export interface StylistProfileUpdate {
  bio?: string;
  specialties?: string[];
  product_brands?: string[];
  years_experience?: number;
  location?: string;
  portfolio_urls?: string[];
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
};

export const DAMAGE_LEVEL_LABELS: Record<number, string> = {
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

export const SALON_VIBE_OPTIONS = [
  { value: '気にしない・美容師におまかせ', label: '気にしない・美容師におまかせ', icon: '🍃' },
  { value: '静かに過ごしたい', label: '静かに過ごしたい（雑誌やスマホを見たい・ゆっくり休みたい）', icon: '🎧' },
  { value: '髪の悩みやお手入れについてだけ話したい', label: '髪の悩みやお手入れについてだけ話したい', icon: '💇‍♀️' },
  { value: '楽しく会話したい', label: '楽しく会話したい', icon: '🗣️' },
];
