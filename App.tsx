
import React, { useState, useEffect } from 'react';
import { UserProfile, Region, Meal, DailyLog, ShoppingItem } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import ShoppingList from './components/ShoppingList';
import Auth from './components/Auth';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'shopping' | 'history'>('home');
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: new Date().toISOString().split('T')[0],
    meals: [],
    compensationStatus: 'Balanced'
  });

  // Load from local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('fomi_profile');
    const savedAuth = localStorage.getItem('fomi_auth');
    
    if (savedAuth) {
      setIsLoggedIn(true);
    }
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('fomi_auth', email);
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('fomi_profile', JSON.stringify(profile));
  };

  const handleLogout = () => {
    localStorage.removeItem('fomi_auth');
    localStorage.removeItem('fomi_profile');
    setIsLoggedIn(false);
    setUserProfile(null);
  };

  const addMeal = (meal: Meal) => {
    const newMeals = [...dailyLog.meals, meal];
    const totalCals = newMeals.reduce((acc, m) => acc + m.calories, 0);
    
    let status: 'Under' | 'Balanced' | 'Over' = 'Balanced';
    if (totalCals > 1800) status = 'Over';
    else if (totalCals < 1000) status = 'Under';

    setDailyLog({
      ...dailyLog,
      meals: newMeals,
      compensationStatus: status
    });
  };

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {activeTab === 'home' && (
        <Dashboard 
          profile={userProfile} 
          dailyLog={dailyLog} 
          onAddMeal={addMeal}
        />
      )}
      {activeTab === 'shopping' && (
        <ShoppingList profile={userProfile} />
      )}
      {activeTab === 'history' && (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-orange-900">Nhật ký ăn uống</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50">
            <p className="text-gray-500 italic text-sm">Chuyện ăn uống của bạn và cộng đồng sẽ hiện ở đây sớm thôi!</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
