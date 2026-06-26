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

export interface Word {
  id: number;
  word: string;
  meaning?: string;
  bengali_meaning?: string;
  pronunciation?: string;
  part_of_speech?: string;
  examples?: string[];
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
