export interface PastExamListItem {
  id: number;
  title: string;
  exam_type: string;
  organization: string | null;
  department: string | null;
  position: string | null;
  exam_date: string;
  duration: number;
  total_questions: number;
  pass_mark: number;
  negative_mark: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  missing_explanations_count: number;
}

export interface PastExamAttempt {
  id: number;
  user: number;
  user_name: string;
  past_exam: number;
  past_exam_title: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score: number;
  attempt_time: string;
  pass_mark: number;
}

export interface PastExamSubmitResponse {
  message: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  wrong_answers: number;
  is_passed: boolean;
  score: number;
  percentage: number;
}
