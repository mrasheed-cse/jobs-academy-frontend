export interface PuzzleWord {
  id: number;
  word: string;
  meaning?: string;
  hint?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const FALLBACK_WORDS: PuzzleWord[] = [
  { id: 1,  word: 'AUTHORITY',    meaning: 'কর্তৃপক্ষ',    hint: 'Official power',              category: 'governance', difficulty: 'medium' },
  { id: 2,  word: 'PARLIAMENT',   meaning: 'সংসদ',          hint: 'Legislative body',            category: 'governance', difficulty: 'hard'   },
  { id: 3,  word: 'JUSTICE',      meaning: 'ন্যায়বিচার',   hint: 'Fairness and law',            category: 'governance', difficulty: 'easy'   },
  { id: 4,  word: 'ECONOMY',      meaning: 'অর্থনীতি',     hint: 'Study of money and trade',    category: 'economy',    difficulty: 'medium' },
  { id: 5,  word: 'CULTURE',      meaning: 'সংস্কৃতি',     hint: 'Traditions and arts',         category: 'society',    difficulty: 'easy'   },
  { id: 6,  word: 'HISTORY',      meaning: 'ইতিহাস',       hint: 'Record of past events',       category: 'education',  difficulty: 'easy'   },
  { id: 7,  word: 'GEOGRAPHY',    meaning: 'ভূগোল',        hint: 'Study of earth and regions',  category: 'education',  difficulty: 'medium' },
  { id: 8,  word: 'DEMOCRACY',    meaning: 'গণতন্ত্র',     hint: 'Rule by the people',          category: 'governance', difficulty: 'medium' },
  { id: 9,  word: 'TECHNOLOGY',   meaning: 'প্রযুক্তি',    hint: 'Applied science and tools',   category: 'science',    difficulty: 'medium' },
  { id: 10, word: 'EDUCATION',    meaning: 'শিক্ষা',       hint: 'Process of learning',         category: 'education',  difficulty: 'easy'   },
  { id: 11, word: 'AGRICULTURE',  meaning: 'কৃষি',         hint: 'Farming and cultivation',     category: 'economy',    difficulty: 'medium' },
  { id: 12, word: 'CONSTITUTION', meaning: 'সংবিধান',      hint: 'Fundamental laws of a state', category: 'governance', difficulty: 'hard'   },
  { id: 13, word: 'POPULATION',   meaning: 'জনসংখ্যা',    hint: 'Number of people in an area', category: 'society',    difficulty: 'medium' },
  { id: 14, word: 'ENVIRONMENT',  meaning: 'পরিবেশ',      hint: 'Natural surroundings',         category: 'science',    difficulty: 'medium' },
  { id: 15, word: 'GOVERNMENT',   meaning: 'সরকার',        hint: 'Body that rules a country',   category: 'governance', difficulty: 'easy'   },
  { id: 16, word: 'LITERATURE',   meaning: 'সাহিত্য',     hint: 'Written artistic works',       category: 'education',  difficulty: 'medium' },
  { id: 17, word: 'SCIENCE',      meaning: 'বিজ্ঞান',     hint: 'Systematic study of nature',  category: 'education',  difficulty: 'easy'   },
  { id: 18, word: 'RELIGION',     meaning: 'ধর্ম',         hint: 'Belief in a higher power',    category: 'society',    difficulty: 'easy'   },
  { id: 19, word: 'FREEDOM',      meaning: 'স্বাধীনতা',   hint: 'Right to act without restraint', category: 'governance', difficulty: 'easy' },
  { id: 20, word: 'NATIONAL',     meaning: 'জাতীয়',      hint: 'Relating to a nation',         category: 'governance', difficulty: 'easy'   },
];

export function scrambleWord(word: string): string {
  const letters = word.toUpperCase().split('');
  let scrambled: string;
  let attempts = 0;
  do {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    scrambled = letters.join('');
    attempts++;
  } while (scrambled === word.toUpperCase() && attempts < 10);
  return scrambled;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function difficultyLabel(d?: string): string {
  return d === 'easy' ? 'সহজ' : d === 'medium' ? 'মধ্যম' : d === 'hard' ? 'কঠিন' : '';
}

export function difficultyColor(d?: string): string {
  return d === 'easy' ? 'success' : d === 'medium' ? 'warning' : d === 'hard' ? 'danger' : 'secondary';
}
