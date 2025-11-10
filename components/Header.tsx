import React, { useState, useEffect, useRef } from 'react';
import { View } from '../types';
import { BellIcon, Cog6ToothIcon, UsersIcon, CreditCardIcon, RefreshIcon } from './icons';

interface HeaderProps {
  currentView: View;
  userPlan: string;
  userEmail: string;
  setCurrentView: (view: View) => void;
  showToast: (message: string, type: 'info' | 'success' | 'error') => void;
  onRefresh: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, userPlan, userEmail, setCurrentView, showToast, onRefresh, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    onRefresh();
    showToast("Données actualisées.", 'info');
    setTimeout(() => setIsRefreshing(false), 1500); // Animation duration
  };

  const navigate = (view: View) => {
    setCurrentView(view);
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-16 glass-card flex items-center justify-between px-8 flex-shrink-0">
      <h2 className="text-[28px] leading-[42px] font-bold text-light-text">{currentView}</h2>
      <div className="flex items-center space-x-6">
         <button onClick={handleRefresh} className="text-light-text-secondary hover:text-light-text transition-colors" title="Rafraîchir les données">
            <RefreshIcon className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
         </button>
         <button className="relative text-light-text-secondary hover:text-light-text transition-colors">
            <BellIcon className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-light-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-light-accent"></span>
            </span>
        </button>
        <div className="w-px h-8 bg-black/10"></div>
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 cursor-pointer p-1 rounded-btn hover:bg-black/5">
                <img
                    src={`https://i.pravatar.cc/40?u=${userEmail}`}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full"
                />
                <div>
                    <p className="font-semibold text-light-text truncate max-w-[150px] text-sm">{userEmail}</p>
                    <p className="text-sm text-light-text-secondary">{userPlan}</p>
                </div>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-3xl z-50 animate-fade-in-up">
                <div className="p-2">
                  <div className="px-2 py-2">
                    <p className="font-semibold text-light-text text-sm truncate">{userEmail}</p>
                    <p className="text-xs text-light-text-secondary truncate">{userEmail}</p>
                  </div>
                  <div className="my-1 h-px bg-black/10"></div>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate(View.AccountManagement); }} className="block px-2 py-2 text-sm text-light-text-secondary hover:bg-black/5 hover:text-light-text rounded-btn flex items-center gap-[7px]"><Cog6ToothIcon className="w-5 h-5"/>{View.AccountManagement}</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate(View.Team); }} className="block px-2 py-2 text-sm text-light-text-secondary hover:bg-black/5 hover:text-light-text rounded-btn flex items-center gap-[7px]"><UsersIcon className="w-5 h-5"/>{View.Team}</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate(View.Billing); }} className="block px-2 py-2 text-sm text-light-text-secondary hover:bg-black/5 hover:text-light-text rounded-btn flex items-center gap-[7px]"><CreditCardIcon className="w-5 h-5"/>{View.Billing}</a>
                  <div className="my-1 h-px bg-black/10"></div>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="block w-full text-left px-2 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-btn">Déconnexion</a>
                </div>
              </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
