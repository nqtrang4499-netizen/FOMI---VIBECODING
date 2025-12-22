
export enum Region {
  NORTH = 'Bắc',
  CENTRAL = 'Trung',
  SOUTH = 'Nam'
}

export interface UserProfile {
  name: string;
  region: Region;
  isLactoseIntolerant: boolean;
  preferences: string[];
  goal: 'Giảm cân' | 'Giữ dáng' | 'Tăng cơ';
}

export interface Meal {
  id: string;
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  isEatOut: boolean;
  calories: number;
  description: string;
  hackTip?: string; // Specific advice for eating out
  compensationAdvice?: string; // What to do later if you eat this
  ingredients?: string[];
}

export interface DailyLog {
  date: string;
  meals: Meal[];
  compensationStatus: 'Under' | 'Balanced' | 'Over';
}

export interface ShoppingItem {
  name: string;
  category: string;
  amount: string;
  isProtein: boolean;
  plannedUsage?: string[]; // How this bulk item is used across days
}
