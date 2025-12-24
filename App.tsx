
import React, { useState, useEffect } from 'react';
import { UserProfile, Region, Meal, DailyLog, ShoppingItem, IngredientInput } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ShoppingList from './components/ShoppingList';
import HealthTrackingView from './components/HealthTrackingView';
import IngredientSelector from './components/IngredientSelector';
import MealSuggestionsView from './components/MealSuggestionsView';
import DayMenuView from './components/DayMenuView';
import CookingProgressView from './components/CookingProgressView';
import EnjoyMealView from './components/EnjoyMealView';
import EatOutInput from './components/EatOutInput';
import EatOutCheckInView from './components/EatOutCheckInView';
import DayPlanConfig from './components/DayPlanConfig';
import Auth from './components/Auth';
import { Layout } from './components/Layout';
import { generateDailyPlan } from './services/geminiService';
import { Home, ShoppingBag, Utensils, Activity, ChefHat } from 'lucide-react';

type ViewState = 'home' | 'shopping' | 'health-tracking' | 'select-ingredients' | 'meal-suggestions' | 'day-menu' | 'cooking-progress' | 'enjoy-meal' | 'eat-out' | 'eat-out-check-in' | 'day-plan-config';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [planMode, setPlanMode] = useState<'single' | 'day'>('single');
  const [shoppingCart, setShoppingCart] = useState<ShoppingItem[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: new Date().toISOString().split('T')[0],
    meals: [],
    compensationStatus: 'Cân bằng'
  });
  const [pastLogs, setPastLogs] = useState<DailyLog[]>([]);
  
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [activeCookingMeal, setActiveCookingMeal] = useState<Meal | null>(null);
  const [lastUsedIngredients, setLastUsedIngredients] = useState<IngredientInput[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('fomi_profile');
    const savedCart = localStorage.getItem('fomi_shopping_cart');
    const savedLog = localStorage.getItem('fomi_daily_log');
    const savedSuggestions = localStorage.getItem('fomi_last_suggestions');
    const savedCooking = localStorage.getItem('fomi_active_cooking');
    const savedIngs = localStorage.getItem('fomi_last_ings');
    const savedPastLogs = localStorage.getItem('fomi_past_logs');
    
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedCart) setShoppingCart(JSON.parse(savedCart));
    if (savedSuggestions) setAiSuggestions(JSON.parse(savedSuggestions));
    if (savedCooking) setActiveCookingMeal(JSON.parse(savedCooking));
    if (savedIngs) setLastUsedIngredients(JSON.parse(savedIngs));
    if (savedPastLogs) setPastLogs(JSON.parse(savedPastLogs));
    
    if (savedLog) {
      const parsedLog = JSON.parse(savedLog);
      if (parsedLog.date === new Date().toISOString().split('T')[0]) {
        setDailyLog(parsedLog);
      } else {
        setPastLogs(prev => {
            const newPast = [...prev, parsedLog];
            localStorage.setItem('fomi_past_logs', JSON.stringify(newPast));
            return newPast;
        });
        setDailyLog({
            date: new Date().toISOString().split('T')[0],
            meals: [],
            compensationStatus: 'Cân bằng'
        });
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

  useEffect(() => {
    if (userProfile) {
        localStorage.setItem('fomi_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

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

  const handleGeneratePlan = async (calories: number, flavors: string[]) => {
    if (userProfile) {
       setIsGeneratingPlan(true);
       const plan = await generateDailyPlan(userProfile, calories, flavors);
       setAiSuggestions(plan);
       setPlanMode('day');
       setIsGeneratingPlan(false);
       setCurrentView('meal-suggestions');
    }
  };

  const addToMenu = (meal: any) => {
    const newMeal: Meal = {
      id: Math.random().toString(36).substr(2, 9),
      name: meal.name,
      type: meal.type || 'Bữa trưa',
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
    
    if (!dailyLog.meals.some(m => m.name.toLowerCase() === newMeal.name.toLowerCase())) {
        const newMeals = [...dailyLog.meals, newMeal];
        updateLog(newMeals);
    }
  };

  const startPreparingMeal = (meal: Meal, shouldGoShopping: boolean) => {
    if (meal.isEatOut) {
        setActiveCookingMeal(meal);
        setCurrentView('eat-out-check-in');
        return;
    }

    if (meal.ingredientsMissing && meal.ingredientsMissing.length > 0) {
      const newItems: ShoppingItem[] = meal.ingredientsMissing.map((i: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: typeof i === 'string' ? i : i.name,
        category: 'Thực phẩm',
        amount: '1 phần',
        isProtein: false,
        price: 20000,
        fromMeal: meal.name,
        isBought: false
      }));
      setShoppingCart(prev => {
         const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
         const uniqueNewItems = newItems.filter(i => !existingNames.has(i.name.toLowerCase()));
         return [...prev, ...uniqueNewItems];
      });
    }

    setActiveCookingMeal(meal);
    if (shouldGoShopping && meal.ingredientsMissing && meal.ingredientsMissing.length > 0) {
      setCurrentView('shopping');
    } else {
      setCurrentView('cooking-progress');
    }
  };

  const handleUpdateMealInLog = (originalMealId: string, newMealData: Partial<Meal>) => {
    const updatedMeals = dailyLog.meals.map(m => {
        if (m.id === originalMealId) {
            return { ...m, ...newMealData };
        }
        return m;
    });
    updateLog(updatedMeals);
  };

  const finalizeMealRecord = (meal: Meal) => {
    setCurrentView('enjoy-meal');
  };

  const removeMealById = (mealId: string) => {
    const newMeals = dailyLog.meals.filter(m => m.id !== mealId);
    updateLog(newMeals);
  };

  const updateWeight = (weight: number) => {
    if (!userProfile) return;
    const newRecord = { date: new Date().toISOString(), weight };
    const updatedHistory = [...(userProfile.healthHistory || []), newRecord];
    const updatedProfile = { ...userProfile, healthHistory: updatedHistory, weight };
    setUserProfile(updatedProfile);
  };

  const updateLog = (meals: Meal[]) => {
    const totalCals = meals.reduce((acc, m) => acc + m.calories, 0);
    const calorieGoal = userProfile?.calorieGoal || 2000;
    
    let status: 'Thiếu' | 'Cân bằng' | 'Vượt' = 'Cân bằng';
    if (totalCals > calorieGoal + 100) status = 'Vượt';
    else if (totalCals < calorieGoal - 100) status = 'Thiếu';
    
    setDailyLog({ ...dailyLog, meals, compensationStatus: status });
  };

  const handleBack = () => {
    if (currentView === 'cooking-progress') {
       if (shoppingCart.length > 0) setCurrentView('shopping');
       else setCurrentView('day-menu'); 
    }
    else if (currentView === 'eat-out-check-in') setCurrentView('day-menu');
    else if (currentView === 'shopping' && activeCookingMeal) setCurrentView('day-menu');
    else if (currentView === 'day-menu') setCurrentView('meal-suggestions');
    else if (currentView === 'meal-suggestions') {
       if (planMode === 'day') setCurrentView('day-plan-config');
       else setCurrentView('select-ingredients');
    }
    else if (currentView === 'day-plan-config') setCurrentView('home');
    else if (currentView === 'enjoy-meal') setCurrentView('home');
    else if (currentView === 'eat-out') setCurrentView('home');
    else setCurrentView('home');
  };

  const handleResumeCooking = () => {
    if (!activeCookingMeal) return;
    if (activeCookingMeal.isEatOut) {
        setCurrentView('eat-out-check-in');
        return;
    }
    if (shoppingCart.some(i => !i.isBought)) {
      setCurrentView('shopping');
    } else {
      setCurrentView('cooking-progress');
    }
  };

  // Logic xác định prop onNext cho Layout
  const getNextAction = () => {
      // Ở trang Home: return undefined để ẩn nút Next
      if (currentView === 'home') return undefined;

      if (currentView === 'meal-suggestions') {
          return () => setCurrentView('day-menu');
      }
      return undefined;
  };

  if (!isLoggedIn) return <Auth onLogin={handleLogin} />;
  if (!userProfile) return <Onboarding onComplete={handleOnboardingComplete} />;

  const isMenuOrCooking = currentView === 'day-menu' || currentView === 'cooking-progress' || currentView === 'eat-out-check-in';

  return (
    <Layout 
      onLogout={handleLogout} 
      showBack={currentView !== 'home' && currentView !== 'enjoy-meal' && currentView !== 'health-tracking' && currentView !== 'shopping' && !isMenuOrCooking} 
      onBack={handleBack}
      onNext={getNextAction()}
    >
      <div key={currentView} className="view-transition-enter h-full overflow-y-auto">
        {currentView === 'home' && (
          <Dashboard 
            profile={userProfile} 
            dailyLog={dailyLog} 
            onNavigate={(view, subMode) => {
              if (view === 'resume-cooking') handleResumeCooking();
              else {
                 if (subMode) setPlanMode(subMode);
                 setCurrentView(view as ViewState);
              }
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
        {currentView === 'day-plan-config' && (
           <DayPlanConfig 
             profile={userProfile}
             onBack={() => setCurrentView('home')}
             onConfirm={handleGeneratePlan}
             isGenerating={isGeneratingPlan}
           />
        )}
        {currentView === 'meal-suggestions' && (
          <MealSuggestionsView 
            suggestions={aiSuggestions}
            dailyLog={dailyLog}
            activeCookingMeal={activeCookingMeal}
            onAddMeal={(meal) => addToMenu(meal)} 
            onRemoveMeal={(name) => {}}
            onRegenerate={() => {
               if (planMode === 'day') setCurrentView('day-plan-config');
               else setCurrentView('select-ingredients');
            }}
          />
        )}
        {currentView === 'day-menu' && (
           <DayMenuView 
             dailyLog={dailyLog}
             onStartProcess={startPreparingMeal}
             onRemoveMeal={removeMealById}
           />
        )}
        {currentView === 'eat-out' && (
           <EatOutInput 
             onBack={() => setCurrentView('home')}
             onConfirm={(meal) => {
                addToMenu(meal);
                setCurrentView('home'); 
             }}
           />
        )}
        {currentView === 'eat-out-check-in' && activeCookingMeal && (
            <EatOutCheckInView 
                meal={activeCookingMeal}
                onUpdateMeal={handleUpdateMealInLog}
                onComplete={() => finalizeMealRecord(activeCookingMeal)}
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
              setCurrentView('day-menu');
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
        {currentView === 'health-tracking' && (
          <HealthTrackingView 
            profile={userProfile}
            dailyLog={dailyLog} 
            allLogs={pastLogs}
            onRemoveMeal={removeMealById}
            onUpdateWeight={updateWeight}
          />
        )}
      </div>
      
      {/* Expanded Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2 pb-6 z-50 shadow-2xl flex justify-around items-end">
          <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'home' ? 'text-emerald-600 -translate-y-2' : 'text-gray-300'}`}>
              <div className={`p-2 rounded-2xl transition-all ${currentView === 'home' ? 'bg-emerald-50 shadow-lg' : 'bg-transparent'}`}>
                  <Home size={24} strokeWidth={currentView === 'home' ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${currentView === 'home' ? 'opacity-100' : 'opacity-0'}`}>Trang chủ</span>
          </button>

          <button onClick={() => setCurrentView('shopping')} className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'shopping' ? 'text-emerald-600 -translate-y-2' : 'text-gray-300'}`}>
              <div className={`p-2 rounded-2xl transition-all ${currentView === 'shopping' ? 'bg-emerald-50 shadow-lg' : 'bg-transparent'}`}>
                  <ShoppingBag size={24} strokeWidth={currentView === 'shopping' ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${currentView === 'shopping' ? 'opacity-100' : 'opacity-0'}`}>Đi chợ</span>
          </button>

          <button onClick={() => setCurrentView('day-menu')} className={`flex flex-col items-center gap-1 p-2 transition-all ${isMenuOrCooking ? 'text-emerald-600 -translate-y-2' : 'text-gray-300'}`}>
              <div className={`p-2 rounded-2xl transition-all ${isMenuOrCooking ? 'bg-emerald-50 shadow-lg' : 'bg-transparent'}`}>
                  {activeCookingMeal ? <ChefHat size={24} strokeWidth={isMenuOrCooking ? 2.5 : 2} /> : <Utensils size={24} strokeWidth={isMenuOrCooking ? 2.5 : 2} />}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isMenuOrCooking ? 'opacity-100' : 'opacity-0'}`}>{activeCookingMeal ? 'Đang nấu' : 'Thực đơn'}</span>
          </button>

          <button onClick={() => setCurrentView('health-tracking')} className={`flex flex-col items-center gap-1 p-2 transition-all ${currentView === 'health-tracking' ? 'text-emerald-600 -translate-y-2' : 'text-gray-300'}`}>
              <div className={`p-2 rounded-2xl transition-all ${currentView === 'health-tracking' ? 'bg-emerald-50 shadow-lg' : 'bg-transparent'}`}>
                  <Activity size={24} strokeWidth={currentView === 'health-tracking' ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${currentView === 'health-tracking' ? 'opacity-100' : 'opacity-0'}`}>Sức khỏe</span>
          </button>
      </div>
    </Layout>
  );
};

export default App;
