
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
  flavors: string[];
  goal: 'Giảm cân' | 'Giữ dáng' | 'Tăng cơ';
}

export interface IngredientInput {
  name: string;
  isMandatory: boolean;
}

export interface Meal {
  id: string;
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  isEatOut: boolean;
  calories: number;
  description: string;
  hackTip?: string;
  estimatedTime?: string;
  difficulty?: string;
  recipeSteps?: string[];
  ingredientsFound?: string[];
  ingredientsMissing?: string[];
}

export interface DailyLog {
  date: string;
  meals: Meal[];
  compensationStatus: 'Under' | 'Balanced' | 'Over';
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  amount: string;
  isProtein: boolean;
  price?: number;
  fromMeal?: string;
  isBought: boolean;
}
