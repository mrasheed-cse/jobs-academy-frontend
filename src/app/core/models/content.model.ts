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
