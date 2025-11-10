import React, { useState, useEffect, useRef } from 'react';
import { View } from '../types';
import { DashboardIcon, AdCreatorIcon, CampaignsIcon, AnalyticsIcon, CompetitorsIcon, MagicWandIcon, TemplateIcon, SparklesIcon, BriefcaseIcon, PaintBrushIcon, CpuChipIcon, UsersIcon, CreditCardIcon, Cog6ToothIcon, ArrowLeftIcon, ArrowUpTrayIcon } from './icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  creditsUsed: number;
  creditsTotal: number;
  userPlan: string;
  userEmail: string;
  showToast: (message: string, type: 'info' | 'success' | 'error') => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{ view: View, icon: React.ReactElement<{ className?: string }>, currentView: View, setCurrentView: (v: View) => void, isCollapsed: boolean }> = ({ view, icon, currentView, setCurrentView, isCollapsed }) => (
    <li>
        <button
            onClick={() => setCurrentView(view)}
            title={isCollapsed ? view : undefined}
            className={`w-full flex items-center py-2.5 my-1 rounded-btn transition-all duration-200 overflow-hidden ${ isCollapsed ? 'justify-center' : 'px-4'} ${
                currentView === view
                ? 'bg-light-accent/10 text-light-accent'
                : 'text-light-text-secondary hover:bg-black/5 hover:text-light-text'
            }`}
        >
            {React.cloneElement(icon, { className: 'w-5 h-5 flex-shrink-0' })}
            <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-2'}`}>{view}</span>
        </button>
    </li>
);

const NavSection: React.FC<{ title: string, children: React.ReactNode, isCollapsed: boolean }> = ({ title, children, isCollapsed }) => (
    <div>
        <h3 className={`px-4 text-xs font-semibold text-light-text-secondary uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0 mt-0 mb-0' : 'max-h-8 opacity-100 mt-6 mb-2'}`}>{title}</h3>
        <ul>{children}</ul>
    </div>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, creditsUsed, creditsTotal, userPlan, userEmail, showToast, isSidebarCollapsed, setIsSidebarCollapsed, onLogout }) => {
  const creditsPercentage = creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0;
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const navigate = (view: View) => {
    setCurrentView(view);
    setIsDropdownOpen(false);
  };

  return (
    <aside className={`glass-card flex-shrink-0 flex flex-col border-r border-black/10 transition-all duration-300 relative z-30 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-between px-4 flex-shrink-0">
        <h1 className={`text-2xl font-bold text-light-text whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>PublicityPro</h1>
        <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="p-1.5 hover:bg-black/5 rounded-md"
            title={isSidebarCollapsed ? "Agrandir la barre latérale" : "Réduire la barre latérale"}
        >
            <ArrowLeftIcon className={`w-5 h-5 text-light-text-secondary transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`} />
        </button>
      </div>
      <div className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'justify-center items-center' : 'justify-between'}`}>
        <nav className="p-2 w-full overflow-y-auto">
          <NavSection title="Outils" isCollapsed={isSidebarCollapsed}>
            <NavItem view={View.Dashboard} icon={<DashboardIcon />} currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} />
            <NavItem view={View.AdCreator} icon={<AdCreatorIcon />} currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} />
            <NavItem view={View.CreativeStudio} icon={<PaintBrushIcon />} currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} />
            <NavItem view={View.Inspiration} icon={<SparklesIcon />} currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} />
            <NavItem view={View.Templates} icon={<TemplateIcon />} currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} />
          </NavSection>
          
          <NavSection title="Gestion" isCollapsed={isSidebarCollapsed}>
              <NavItem view={View.Campaigns} icon={<CampaignsIcon />} currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} />
              <NavItem view={View.Analytics} icon={<AnalyticsIcon />} currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} />
              <NavItem view={View.Competitors} icon={<CompetitorsIcon />} currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} />
              <NavItem view={View.OptimisationIA} icon={<CpuChipIcon />} currentView={currentView} setCurrentView={setCurrentView} isCollapsed={isSidebarCollapsed} />
          </NavSection>
        </nav>
        <div className="p-4 flex flex-col gap-[15px] w-full">
          <div className={`bg-black/5 transition-all duration-300 ${isSidebarCollapsed ? 'p-3 flex flex-col items-center gap-4 rounded-[10px] mx-[3px]' : 'p-4 rounded-3xl'}`}>
              {isSidebarCollapsed ? (
                  <>
                      <div className="flex flex-col items-center gap-2">
                          <div className="[writing-mode:vertical-rl] transform rotate-180 text-xs font-semibold text-light-accent whitespace-nowrap">
                             <span>{creditsUsed} / {creditsTotal}</span>
                          </div>
                          <div className="relative w-2 h-24 bg-black/10 rounded-full">
                              <div className="absolute bottom-0 w-full bg-gradient-to-t from-light-accent to-blue-400 rounded-full" style={{ height: `${creditsPercentage}%` }}></div>
                          </div>
                      </div>
                      <button onClick={() => setCurrentView(View.AccountManagement)} title="Acheter des crédits" className="bg-gradient-to-br from-light-accent to-blue-500 hover:opacity-90 text-white p-3 rounded-btn transition-all duration-300 shadow-md hover:shadow-lg">
                         <ArrowUpTrayIcon className="w-5 h-5" />
                      </button>
                  </>
              ) : (
                  <>
                      <h3 className="font-semibold text-light-text text-sm">Crédits IA</h3>
                      <div className="flex justify-between items-center text-xs text-light-text-secondary mt-1">
                          <span>{creditsUsed} / {creditsTotal}</span>
                          <span>{creditsPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-black/10 rounded-full h-1.5 mt-2">
                          <div className="bg-light-accent h-1.5 rounded-full" style={{ width: `${creditsPercentage}%` }}></div>
                      </div>
                      <button onClick={() => setCurrentView(View.AccountManagement)} className="mt-4 w-full bg-light-accent hover:bg-light-accent-hover text-white font-medium text-sm py-2 px-4 rounded-btn transition-all duration-300 shadow-md hover:shadow-lg">
                          Acheter des crédits
                      </button>
                  </>
              )}
          </div>
          <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`w-full flex items-center cursor-pointer p-2 rounded-btn hover:bg-black/5 overflow-hidden ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <img
                      src={`https://i.pravatar.cc/40?u=${userEmail}`}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className={`text-left whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-2'}`}>
                      <p className="font-semibold text-light-text truncate text-sm">{userEmail}</p>
                      <p className="text-sm text-light-text-secondary">{userPlan}</p>
                  </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute left-full bottom-0 ml-2 w-56 glass-card rounded-3xl z-50 animate-fade-in-up">
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
      </div>
    </aside>
  );
};

export default Sidebar;
