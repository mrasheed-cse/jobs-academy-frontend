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
  organization_name: string | null;
  department_name: string | null;
  position_name: string | null;
  subject_name: string | null;
  category: string;
  created_by: string;
  created_at: string;
}

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
  status: string;
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
