export interface PracticeSessionSummary {
  id: number;
  user: string;
  duration: string;
  score: number;
}

export interface PuzzleScoreSummary {
  puzzle__title: string;
  total_puzzle_score: number;
}

export interface GameActivityResponse {
  identity: {
    // Note: despite the field name, the backend returns the username here
    // for authenticated users (not the actual phone number) — known
    // backend quirk, don't rely on this for display; use AuthService's
    // currentUser() instead.
    phone_number: string;
    access_token_active: boolean;
  };
  stats: {
    total_practice_score: number;
    quiz_rank: number | null;
    total_puzzle_score: number;
    current_points: number;
    total_rewards_taka: number;
  };
  history: {
    practice: PracticeSessionSummary[];
    puzzles: PuzzleScoreSummary[];
  };
}
