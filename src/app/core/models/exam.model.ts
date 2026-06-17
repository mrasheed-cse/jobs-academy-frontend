export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface ExamType {
  id: number;
  name: string;
}

export interface Organization {
  id: number;
  name: string;
  address: string;
}

export interface Department {
  id: number;
  name: string;
  organization: number;
}

export interface Position {
  id: number;
  name: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface ExamListItem {
  exam_id: string;
  title: string;
  exam_type: number;
  exam_type_name: string;
  total_questions: number;
  total_mark: number;
  pass_mark: number;
  negative_mark: number;
  duration: string;
  starting_time: string;
  last_date: string;
  // DRF's CharField(source='organization.name') etc. are OMITTED entirely
  // from the response (not even `null`) when the related object is unset —
  // confirmed by direct testing against /quiz/model-exams/. Treat as
  // optional, and check `'organization_name' in item`, not `!= null`.
  organization_name?: string;
  department_name?: string;
  position_name?: string;
  subject_name?: string;
  category: string; // plain string here (ExamListSerializer uses StringRelatedField)
  created_by: string;
  created_at: string;
}

// Shape returned by GET /quiz/model-exams/{id}/ — despite being a "detail"
// endpoint, ModelTestExamView reuses ExamListSerializer, so it returns the
// SAME lightweight shape as the list endpoint (no questions[], no status,
// no nested organization/department/position objects). Confirmed by live
// testing; do not assume this matches ExamDetail below.
export type ModelExamSummary = ExamListItem;

export interface QuestionOption {
  id: number;
  text: string;
  image: string | null;
  is_correct?: boolean;
  question?: number;
}

export interface Question {
  id: number;
  text: string;
  image: string | null;
  marks: number;
  options: QuestionOption[];
  status?: string;
  difficulty_level?: number;
  time_limit?: number;
  subject?: number;
}

export interface ExamDetail {
  exam_id: string;
  title: string;
  total_questions: number;
  created_by: number;
  creater_name: string;
  total_mark: number;
  pass_mark: number;
  negative_mark: number;
  created_at: string;
  updated_at: string;
  starting_time: string;
  last_date: string;
  category: number;
  category_name: string;
  duration: string;
  // Computed property on the backend (time-based), NOT a publish-workflow
  // status — confirmed via direct model inspection. Observed values:
  // "Upcoming" | "active" | "Ongoing" | "archived". The separate publish
  // workflow (draft/submitted_to_admin/under_review/reviewed/published)
  // lives on a related Status model — status_id below references it, but
  // this `status` field does NOT reflect publish state.
  status: string;
  status_id?: number;
  questions: Array<{ id: number; question: Question; order: number; points: number; options: QuestionOption[] }>;
  subjects: Array<{ subject: string; question_count: number }>;
  organization: number | null;
  organization_name: string | null;
  department: number | null;
  department_name: string | null;
  position: number | null;
  position_name: string | null;
  exam_type: number;
  exam_type_name: string;
}

export interface ExamStartResponse {
  exam_id: string;
  title: string;
  total_questions: number;
  duration: string;
  start_time: string;
  end_time: string;
}

export interface ExamQuestionsResponse {
  questions: Question[];
  skipped_questions: number[];
}

export interface ExamAnswer {
  question_id: number;
  selected_option_id: number | 'none';
}

export interface ExamSubmitRequest {
  answers: ExamAnswer[];
}

export interface ExamSubmitResponse {
  status: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: string;
  passed: boolean;
  percentage: string;
}

export interface ExamLeaderboardEntry {
  id: number;
  username: string;
  points: number;
  attempts: number;
  percentage: number;
  rank?: number;
  profile_image: string | null;
}

export interface ExamLeaderboardResponse {
  top_10: ExamLeaderboardEntry[];
  me: ExamLeaderboardEntry | null;
}

export interface ExamAttempt {
  id: number;
  user: number;
  user_name: string;
  exam: string;
  exam_title: string;
  total_questions: number;
  answered: number;
  pass_mark: number;
  wrong_answers: number;
  total_correct_answers: number;
  score: number;
  is_passed: boolean;
  attempt_time: string;
}
