export interface Notice {
  id: number;
  government_job: number;
  title: string;
  description: string;
  pdf: string | null;
  link: string | null;
  created_at: string;
  updated_at: string;
}

export interface GovernmentJob {
  id: number;
  organization: { id: number; name: string; address: string } | null;
  department: { id: number; name: string; organization: number } | null;
  positions: Array<{ id: number; name: string }>;
  organization_id?: number;
  department_id?: number;
  position_ids?: number[];
  pdf: string | null;
  notices: Notice[];
  title: string;
  location: string;
  description: string;
  deadline: string;
  posted_on: string;
  official_link: string | null;
}

export interface NewsCategory {
  id: number;
  name: string;
}

export interface NewsImage {
  id: number;
  image_url: string;
}

export interface NewsItem {
  id: number;
  category: number;
  title: string;
  content: string;
  author: number;
  created_at: string;
  updated_at: string;
  published_date: string;
  send_notification: boolean;
  notification_delay_hours: number;
  notification_datetime: string | null;
  notification_expire_at: string | null;
  auto_notification_sent: boolean;
  images: NewsImage[];
}

export interface WrittenExam {
  id: number;
  title: string;
  subjects?: string[];
  total_marks?: number;
  duration?: number;
  exam_date?: string;
  description?: string;
  organization?: string;
  created_at?: string;
}

export interface WordPuzzle {
  id: number;
  word: string;
  scrambled?: string;
  hint?: string;
  difficulty?: string;
  category?: string;
}

// --- Language Center: dictionary models, matching the real backend
// serializers exactly (verified by direct testing against the live
// endpoints' actual response shapes, not assumed from naming) ---

export interface DictLanguage {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface DictPartOfSpeech {
  id: number;
  name: string;
}

export interface DictWordForm {
  id: number;
  form: string;
  label: string;
}

export interface DictBanglaMeaning {
  id: number;
  meaning: string;
  note: string;
}

export interface DictExampleTranslation {
  id: number;
  language: DictLanguage;
  translated_text: string;
}

export interface DictExampleSentence {
  id: number;
  sentence: string;
  translations: DictExampleTranslation[];
}

export interface DictDefinitionTranslation {
  id: number;
  language: DictLanguage;
  translated_text: string;
}

export interface DictDefinition {
  id: number;
  definition_text: string;
  translations: DictDefinitionTranslation[];
}

export interface DictSense {
  id: number;
  short_definition: string;
  usage_note: string;
  synonyms: string[];
  antonyms: string[];
  bangla_meanings: DictBanglaMeaning[];
  definitions: DictDefinition[];
  examples: DictExampleSentence[];
}

// Shape returned by GET /api/word-of-the-day/, GET /api/words/{id}/
// (WordSerializer) - the full nested representation.
export interface DictWord {
  id: number;
  text: string;
  phonetic_uk: string;
  phonetic_us: string;
  language: DictLanguage;
  part_of_speech: DictPartOfSpeech | null;
  forms: DictWordForm[];
  senses: DictSense[];
}

// Shape returned by GET /api/words/az/ (WordAZSerializer, grouped by
// first letter) - flat, part_of_speech is a plain string here.
export interface DictWordAZEntry {
  id: number;
  text: string;
  phonetic_uk: string;
  phonetic_us: string;
  part_of_speech: string | null;
}

// Shape returned by GET /api/words/search/ (WordListSerializer).
export interface DictWordSearchResult {
  id: number;
  text: string;
  part_of_speech: DictPartOfSpeech | null;
}

// Input shape for POST /api/language/{id}/words/create/
export interface DictWordCreateSense {
  short_definition: string;
  usage_note?: string;
  bangla_meanings?: string[];
  definition_text?: string;
  examples?: string[];
  examples_bn?: string[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictWordCreateRequest {
  word: string;
  pos: string;
  phonetic_uk?: string;
  phonetic_us?: string;
  forms?: Array<{ form: string; label: string }>;
  senses: DictWordCreateSense[];
}

export interface DictExcelUploadResult {
  language: string;
  created_senses: number;
  errors: Array<{ row: number; error: string }>;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  ad_free: boolean;
  free_model_test: boolean;
  paid_model_test: boolean;
  daily_previous_year_questions: number;
  upcoming_special_model_tests: number;
  prize_winning_special_exam: boolean;
  daily_live_exam_room_access: number;
  prices: Array<{ id: number; duration: string; price: number }>;
}

export interface UserSubscription {
  id: number;
  plan: number;
  plan_name?: string;
  price?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}
