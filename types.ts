
export enum Region {
  NORTH = 'Bắc',
  CENTRAL = 'Trung',
  SOUTH = 'Nam'
}

export interface HealthRecord {
  date: string;
  weight: number;
  note?: string;
}

export interface UserProfile {
  name: string;
  region: Region;
  isLactoseIntolerant: boolean;
  preferences: string[];
  flavors: string[];
  allergies: string[]; // Thêm trường dị ứng
  goal: 'Giảm cân' | 'Giữ dáng' | 'Tăng cơ';
  // Dữ liệu cơ thể
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'Nam' | 'Nữ';
  activityLevel?: 'Ít vận động' | 'Vận động nhẹ' | 'Vận động vừa' | 'Vận động mạnh';
  calorieGoal?: number;
  healthHistory?: HealthRecord[];
}

export interface IngredientInput {
  name: string;
  isMandatory: boolean;
}

export interface Meal {
  id: string;
  name: string;
  type: 'Bữa sáng' | 'Bữa trưa' | 'Bữa tối' | 'Ăn nhẹ';
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
  compensationStatus: 'Thiếu' | 'Cân bằng' | 'Vượt';
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
