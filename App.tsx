
import React, { useState, useEffect } from 'react';
import { UserProfile, Region, Meal, DailyLog, ShoppingItem, IngredientInput } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ShoppingList from './components/ShoppingList';
import DailyLogView from './components/DailyLogView';
import IngredientSelector from './components/IngredientSelector';
import MealSuggestionsView from './components/MealSuggestionsView';
import CookingProgressView from './components/CookingProgressView';
import EnjoyMealView from './components/EnjoyMealView';
import Auth from './components/Auth';
import { Layout } from './components/Layout';

type ViewState = 'home' | 'shopping' | 'history' | 'select-ingredients' | 'meal-suggestions' | 'cooking-progress' | 'enjoy-meal';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [shoppingCart, setShoppingCart] = useState<ShoppingItem[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: new Date().toISOString().split('T')[0],
    meals: [],
    compensationStatus: 'Balanced'
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [activeCookingMeal, setActiveCookingMeal] = useState<Meal | null>(null);
  const [lastUsedIngredients, setLastUsedIngredients] = useState<IngredientInput[]>([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem('fomi_profile');
    const savedAuth = localStorage.getItem('fomi_auth');
    const savedCart = localStorage.getItem('fomi_shopping_cart');
    const savedLog = localStorage.getItem('fomi_daily_log');
    const savedSuggestions = localStorage.getItem('fomi_last_suggestions');
    const savedCooking = localStorage.getItem('fomi_active_cooking');
    const savedIngs = localStorage.getItem('fomi_last_ings');
    
    if (savedAuth) setIsLoggedIn(true);
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedCart) setShoppingCart(JSON.parse(savedCart));
    if (savedSuggestions) setAiSuggestions(JSON.parse(savedSuggestions));
    if (savedCooking) setActiveCookingMeal(JSON.parse(savedCooking));
    if (savedIngs) setLastUsedIngredients(JSON.parse(savedIngs));
    
    if (savedLog) {
      const parsedLog = JSON.parse(savedLog);
      if (parsedLog.date === new Date().toISOString().split('T')[0]) {
        setDailyLog(parsedLog);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fomi_shopping_cart', JSON.stringify(shoppingCart));
  }, [shoppingCart]);

  useEffect(() => {
    localStorage.setItem('fomi_daily_log', JSON.stringify(dailyLog));
  }, [dailyLog]);

  useEffect(() => {
    localStorage.setItem('fomi_last_suggestions', JSON.stringify(aiSuggestions));
  }, [aiSuggestions]);

  useEffect(() => {
    localStorage.setItem('fomi_last_ings', JSON.stringify(lastUsedIngredients));
  }, [lastUsedIngredients]);

  useEffect(() => {
    if (activeCookingMeal) {
      localStorage.setItem('fomi_active_cooking', JSON.stringify(activeCookingMeal));
    } else {
      localStorage.removeItem('fomi_active_cooking');
    }
  }, [activeCookingMeal]);

  const handleLogin = (id: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('fomi_auth', id);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('fomi_profile', JSON.stringify(profile));
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserProfile(null);
    setCurrentView('home');
    setActiveCookingMeal(null);
  };

  const startPreparingMeal = (meal: any, shouldGoShopping: boolean) => {
    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      name: meal.name,
      type: meal.type || 'Lunch',
      isEatOut: meal.isEatOut || false,
      calories: meal.calories,
      description: meal.description,
      hackTip: meal.hackTip,
      estimatedTime: meal.estimatedTime,
      difficulty: meal.difficulty,
      recipeSteps: meal.recipeSteps,
      ingredientsFound: meal.ingredientsFound,
      ingredientsMissing: meal.ingredientsMissing?.map((i: any) => typeof i === 'string' ? i : i.name)
    };

    if (meal.ingredientsMissing && meal.ingredientsMissing.length > 0) {
      const newItems: ShoppingItem[] = meal.ingredientsMissing.map((i: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: typeof i === 'string' ? i : i.name,
        category: 'Thực phẩm',
        amount: '1 phần',
        isProtein: false,
        price: i.estimatedPrice || 20000,
        fromMeal: meal.name,
        isBought: false
      }));
      setShoppingCart(newItems);
    } else {
      setShoppingCart([]);
    }

    setActiveCookingMeal(newMeal);
    
    if (shouldGoShopping && meal.ingredientsMissing?.length > 0) {
      setCurrentView('shopping');
    } else {
      // Nếu không đi chợ hoặc không thiếu đồ, chuyển sang nấu
      setCurrentView('cooking-progress');
    }
  };

  const finalizeMealRecord = (meal: Meal) => {
    if (dailyLog.meals.some(m => m.name.toLowerCase() === meal.name.toLowerCase())) return;
    const newMeals = [...dailyLog.meals, meal];
    updateLog(newMeals);
    // Chuyển sang màn hình chúc mừng trước khi về Home
    setCurrentView('enjoy-meal');
  };

  const cancelMealSelection = (name: string) => {
    if (activeCookingMeal?.name.toLowerCase() === name.toLowerCase()) {
      setActiveCookingMeal(null);
      setShoppingCart([]);
    }
    const newMeals = dailyLog.meals.filter(m => m.name.toLowerCase() !== name.toLowerCase());
    updateLog(newMeals);
  };

  const removeMealById = (mealId: string) => {
    const newMeals = dailyLog.meals.filter(m => m.id !== mealId);
    updateLog(newMeals);
  };

  const updateLog = (meals: Meal[]) => {
    const totalCals = meals.reduce((acc, m) => acc + m.calories, 0);
    const calorieGoal = userProfile?.calorieGoal || 2000;
    
    let status: 'Under' | 'Balanced' | 'Over' = 'Balanced';
    if (totalCals > calorieGoal + 100) status = 'Over';
    else if (totalCals < calorieGoal - 100) status = 'Under';
    
    setDailyLog({ ...dailyLog, meals, compensationStatus: status });
  };

  const handleBack = () => {
    if (currentView === 'cooking-progress') {
       // Nếu đang nấu mà quay lại, hỏi xem muốn đi chợ hay về Home
       if (shoppingCart.length > 0) setCurrentView('shopping');
       else setCurrentView('home');
    }
    else if (currentView === 'shopping' && activeCookingMeal) setCurrentView('meal-suggestions');
    else if (currentView === 'meal-suggestions') setCurrentView('select-ingredients');
    else if (currentView === 'enjoy-meal') setCurrentView('home');
    else setCurrentView('home');
  };

  const handleResumeCooking = () => {
    if (!activeCookingMeal) return;
    // Ưu tiên đi chợ nếu còn đồ chưa mua, nhưng vẫn cho phép nhảy thẳng vào nấu
    if (shoppingCart.some(i => !i.isBought)) {
      setCurrentView('shopping');
    } else {
      setCurrentView('cooking-progress');
    }
  };

  if (!isLoggedIn) return <Auth onLogin={handleLogin} />;
  if (!userProfile) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <Layout 
      onLogout={handleLogout} 
      showBack={currentView !== 'home' && currentView !== 'enjoy-meal'} 
      onBack={handleBack}
    >
      {currentView === 'home' && (
        <Dashboard 
          profile={userProfile} 
          dailyLog={dailyLog} 
          onNavigate={(view) => {
            if (view === 'resume-cooking') handleResumeCooking();
            else setCurrentView(view as ViewState);
          }}
          hasLastSuggestions={aiSuggestions.length > 0}
          activeCookingMeal={activeCookingMeal}
        />
      )}
      {currentView === 'select-ingredients' && (
        <IngredientSelector 
          profile={userProfile}
          onResults={(results, usedIngs) => {
            setAiSuggestions(results);
            setLastUsedIngredients(usedIngs);
            setCurrentView('meal-suggestions');
          }}
        />
      )}
      {currentView === 'meal-suggestions' && (
        <MealSuggestionsView 
          suggestions={aiSuggestions}
          dailyLog={dailyLog}
          activeCookingMeal={activeCookingMeal}
          onAddMeal={startPreparingMeal}
          onRemoveMeal={cancelMealSelection}
          onRegenerate={() => setCurrentView('select-ingredients')}
        />
      )}
      {currentView === 'shopping' && (
        <ShoppingList 
          profile={userProfile} 
          cart={shoppingCart} 
          setCart={setShoppingCart}
          activeMeal={activeCookingMeal}
          onStartCooking={() => setCurrentView('cooking-progress')}
        />
      )}
      {currentView === 'cooking-progress' && activeCookingMeal && (
        <CookingProgressView 
          meal={activeCookingMeal} 
          onComplete={() => finalizeMealRecord(activeCookingMeal)}
          onCancel={() => {
            setActiveCookingMeal(null);
            setCurrentView('home');
          }}
        />
      )}
      {currentView === 'enjoy-meal' && activeCookingMeal && (
        <EnjoyMealView 
          meal={activeCookingMeal} 
          onFinish={() => {
            setActiveCookingMeal(null);
            setShoppingCart([]);
            setCurrentView('home');
          }} 
        />
      )}
      {currentView === 'history' && (
        <DailyLogView 
          profile={userProfile}
          dailyLog={dailyLog} 
          onRemoveMeal={removeMealById}
        />
      )}
    </Layout>
  );
};

export default App;
