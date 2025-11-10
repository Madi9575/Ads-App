import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdCreator from './components/AdCreator';
import Campaigns from './components/Campaigns';
import { Analytics } from './components/Analytics';
import Competitors from './components/Competitors';
import Templates from './components/Templates';
import Inspiration from './components/Inspiration';
import AccountManagement from './components/AccountManagement';
import CreativeStudio from './components/CreativeStudio';
import Optimisation from './components/Optimisation';
import Team from './components/Team';
import Billing from './components/Billing';
import ToastContainer from './components/Toast';
import { View, Campaign, Toast, AIPilotStrategy, GeneratedAd, BudgetInfo, AccountPlatform, UserProfile, Organization, Account, AccountStatus, TeamMember, AnalyticsFilter, InspirationAd, Template, StudioFile, AnalysisHistoryItem, AnalysisReport } from './types';
import * as supabaseService from './services/supabaseService';
import * as geminiService from './services/geminiService';
import { User } from '@supabase/supabase-js';
import { FacebookIcon, GoogleIcon, TikTokIcon, InstagramIcon, LinkedInIcon, ArrowPathIcon } from './components/icons';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Data state - MOCKED to bypass login
  const [user, setUser] = useState<User | null>({
    id: 'mock-user-id-123',
    email: 'user@publicity.pro',
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: 'Mock User' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User);
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    id: 'mock-user-id-123',
    email: 'user@publicity.pro',
    organizationId: 'mock-org-id-456',
  });
  const [organizationData, setOrganizationData] = useState<Organization | null>({
    id: 'mock-org-id-456',
    ownerId: 'mock-user-id-123',
    name: 'PublicityPro Inc.',
    plan: 'Business Plan',
    credits: { used: 450, total: 3000 },
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [studioFiles, setStudioFiles] = useState<StudioFile[]>([]);
  const [inspirationAds, setInspirationAds] = useState<InspirationAd[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // App state
  const [isLoading, setIsLoading] = useState(true);
  const [aiPilotStrategy, setAiPilotStrategy] = useState<AIPilotStrategy | null>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [highlightedCampaignId, setHighlightedCampaignId] = useState<string | null>(null);
  const [analyticsFilter, setAnalyticsFilter] = useState<AnalyticsFilter | null>(null);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    setToasts(prevToasts => [...prevToasts, { id: Date.now(), message, type }]);
  };

  const platformIcons: Record<AccountPlatform, React.ComponentType<{ className?: string }>> = {
    Facebook: FacebookIcon, Google: GoogleIcon, TikTok: TikTokIcon, 
    Instagram: InstagramIcon, LinkedIn: LinkedInIcon
  };

  // --- ROBUST USER DATA LOADER ---
  const loadAllData = async (orgId: string) => {
    setIsLoading(true);
    // In a real scenario, Supabase calls with a mock ID would fail or return empty.
    // We will rely on empty states or mock data within components.
    const [
      campaigns, accountsData, teamMembers, analysisHistory, studioFiles, 
      inspirationAds, templates
    ] = await Promise.all([
      supabaseService.getCampaignsForOrg(orgId),
      supabaseService.getAccounts(orgId),
      supabaseService.getTeamMembers(orgId),
      supabaseService.getAnalysisHistory(orgId),
      supabaseService.getStudioFiles(orgId),
      supabaseService.getInspirationAds(),
      supabaseService.getTemplates()
    ]);

    setCampaigns(campaigns);
    setAccounts(accountsData.map(acc => ({...acc, Icon: platformIcons[acc.name as AccountPlatform]})));
    setTeamMembers(teamMembers);
    setAnalysisHistory(analysisHistory);
    setStudioFiles(studioFiles);
    setInspirationAds(inspirationAds);
    setTemplates(templates);
    setIsLoading(false);
  };

  // --- DATA LISTENER (replaces auth listener) ---
  useEffect(() => {
    if (organizationData) {
        loadAllData(organizationData.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- EVENT HANDLERS ---
  const consumeCredits = async (amount: number) => {
    if (organizationData) {
      const newUsed = organizationData.credits.used + amount;
      setOrganizationData(prev => prev ? { ...prev, credits: { ...prev.credits, used: newUsed } } : null);
      showToast(`${amount} crédits IA utilisés.`, 'info');
    }
  };

  const handleGenerateStrategy = async (prompt: string) => {
    setIsGeneratingStrategy(true);
    try {
        const strategy = await geminiService.generateCampaignStrategy(prompt);
        setAiPilotStrategy(strategy);
        setCurrentView(View.AdCreator);
    } catch (error: any) {
        showToast(error.message || "La génération de stratégie a échoué.", "error");
    } finally {
        setIsGeneratingStrategy(false);
    }
  };
  
  const handleApplyTemplate = (settings: Template['adCreatorSettings']) => {
    const partialStrategy: AIPilotStrategy = {
      productInfo: { name: '', category: '', description: '', usp: '', problem: '' },
      audience: { ageRange: '', gender: 'Tous', interests: [], platforms: [], audiencePrompt: '', incomeLevel: '' },
      creativeStrategy: { brandTone: 'Amical', targetEmotions: [] },
      objective: 'Conversions',
      budgetInfo: { dailyBudget: 50, durationInDays: 14 },
      adCreatorSettings: settings,
    };
    setAiPilotStrategy(partialStrategy);
    setCurrentView(View.AdCreator);
    showToast("Template appliqué ! Le formulaire a été pré-rempli.", 'info');
  };

  const handleLogout = async () => { showToast("La déconnexion est désactivée.", "info"); };
  const handleRefreshData = async () => { if (organizationData) await loadAllData(organizationData.id); };
  const handleNavigateToCampaign = (campaignId: string) => { setCurrentView(View.Campaigns); setHighlightedCampaignId(campaignId); };

  const handleLaunchCampaigns = async (launchedAds: GeneratedAd[], budget: BudgetInfo, platforms: Set<AccountPlatform>) => {
      if (!organizationData) return showToast("Données de l'organisation introuvables.", "error");
      
      const createdCampaigns: Campaign[] = [];
      for (const ad of launchedAds) {
          for (const platform of platforms) {
              const newCampaignData = { name: ad.variation.headline, platform, status: 'Active' as const, dailyBudget: budget.dailyBudget };
              const createdCampaign: Campaign = {
                id: `mock-campaign-${Date.now()}-${Math.random()}`,
                ...newCampaignData,
                creationDate: new Date().toISOString(),
                spent: 0,
                ctr: 0,
                conversions: 0,
                performanceHistory: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: Math.random() * 10 })),
              };
              createdCampaigns.push(createdCampaign);
          }
      }
      
      if (createdCampaigns.length > 0) {
          setCampaigns(prev => [...createdCampaigns, ...prev]);
          setCurrentView(View.Campaigns);
          showToast(`${createdCampaigns.length} nouvelle(s) campagne(s) lancée(s) !`, 'success');
      } else {
          showToast(`Échec du lancement des campagnes.`, 'error');
      }
  };

  const handleUpdateCampaign = async (campaign: Campaign) => {
    setCampaigns(campaigns.map(c => c.id === campaign.id ? campaign : c)); 
    showToast("Campagne mise à jour.", "success");
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId)); 
    showToast("Campagne supprimée.", "success");
  };
  
  const handleUpdateAccount = async (platform: AccountPlatform, status: AccountStatus) => {
    if(!organizationData) return;
    setAccounts(prev => prev.map(acc => acc.name === platform ? {...acc, status, Icon: platformIcons[platform]} : acc));
  };

  const handleSetUserPlan = async (plan: Organization['plan']) => {
    if(!organizationData) return;
    setOrganizationData(prev => prev ? { ...prev, plan } : null);
  };

  const handleAddAnalysis = async (report: AnalysisReport, url: string, sector: string): Promise<AnalysisHistoryItem | null> => {
    if (!organizationData) {
        showToast("Impossible d'enregistrer l'analyse.", 'error');
        return null;
    }
    const newHistoryItem: AnalysisHistoryItem = {
      id: `mock-analysis-${Date.now()}`,
      url, sector, ...report
    };
    setAnalysisHistory(prev => [newHistoryItem, ...prev]);
    return newHistoryItem;
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><ArrowPathIcon className="w-12 h-12 text-light-accent animate-spin" /></div>;
  }

  if (!user || !userProfile || !organizationData) {
      // This should not be reached with the mocked data
      return <div>Erreur de configuration. Impossible de charger l'application.</div>;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case View.Dashboard: return <Dashboard onApplyRecommendation={() => {}} onNavigateToCampaign={handleNavigateToCampaign} onGenerateStrategy={handleGenerateStrategy} isGeneratingStrategy={isGeneratingStrategy} campaigns={campaigns} />;
      case View.AdCreator: return <AdCreator showToast={showToast} credits={organizationData.credits} consumeCredits={consumeCredits} aiPilotStrategy={aiPilotStrategy} onStrategyConsumed={() => setAiPilotStrategy(null)} onLaunchCampaigns={handleLaunchCampaigns}/>;
      case View.Campaigns: return <Campaigns campaigns={campaigns} onUpdateCampaign={handleUpdateCampaign} onDeleteCampaign={handleDeleteCampaign} setCurrentView={setCurrentView} setAnalyticsFilter={setAnalyticsFilter} highlightedCampaignId={highlightedCampaignId} onHighlightDone={() => setHighlightedCampaignId(null)}/>;
      case View.Analytics: return <Analytics initialFilter={analyticsFilter} setInitialFilter={setAnalyticsFilter} showToast={showToast} />;
      case View.Competitors: return <Competitors showToast={showToast} history={analysisHistory} onAddAnalysis={handleAddAnalysis} />;
      case View.Templates: return <Templates onApplyTemplate={handleApplyTemplate} onViewExamples={() => {}} />;
      case View.Inspiration: return <Inspiration onApplyTemplate={handleApplyTemplate} />;
      case View.CreativeStudio: return <CreativeStudio showToast={showToast} />;
      case View.OptimisationIA: return <Optimisation />;
      case View.AccountManagement: return <AccountManagement accounts={accounts} onUpdateAccount={handleUpdateAccount} setCurrentView={setCurrentView} showToast={showToast} businessInfo={{ name: organizationData.name, category: 'E-commerce', email: userProfile.email, phone: '0102030405', website: 'mon-site.com' }} />;
      case View.Team: return <Team members={teamMembers} setMembers={setTeamMembers} showToast={showToast} />;
      case View.Billing: return <Billing currentPlan={organizationData.plan} setUserPlan={handleSetUserPlan} showToast={showToast}/>;
      default: return <Dashboard onApplyRecommendation={() => {}} onNavigateToCampaign={handleNavigateToCampaign} onGenerateStrategy={handleGenerateStrategy} isGeneratingStrategy={isGeneratingStrategy} campaigns={campaigns}/>;
    }
  };

  return (
    <div className="flex h-screen bg-light-bg overflow-hidden">
      <div className={`fixed inset-0 transition-opacity duration-300 z-20 ${isSidebarCollapsed ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'} md:hidden bg-black/20 backdrop-blur-sm`} onClick={() => setIsSidebarCollapsed(true)}></div>
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        creditsUsed={organizationData.credits.used} 
        creditsTotal={organizationData.credits.total} 
        userPlan={organizationData.plan} 
        userEmail={userProfile.email}
        showToast={showToast}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {renderCurrentView()}
        </div>
      </main>
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  );
};

export default App;