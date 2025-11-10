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
import { supabase } from './services/supabase';
import { FacebookIcon, GoogleIcon, TikTokIcon, InstagramIcon, LinkedInIcon, ArrowPathIcon } from './components/icons';
import LoginScreen from './components/LoginScreen';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Data state
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organizationData, setOrganizationData] = useState<Organization | null>(null);
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
  
  // --- AUTH & DATA LISTENER ---
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        setIsLoading(true);
        const profile = await supabaseService.getUserProfile(currentUser.id);
        setUserProfile(profile);

        if (profile?.organizationId) {
          const orgData = await supabaseService.getOrganizationData(profile.organizationId);
          setOrganizationData(orgData);
          if (orgData) {
            await loadAllData(orgData.id);
          }
        } else {
            // Pas d'organisation trouvée, arrêter le chargement
            setIsLoading(false);
        }
      } else {
        // No user, reset all data states
        setUserProfile(null);
        setOrganizationData(null);
        setCampaigns([]);
        setAccounts([]);
        setTeamMembers([]);
        setAnalysisHistory([]);
        setStudioFiles([]);
        setInspirationAds([]);
        setTemplates([]);
        setIsLoading(false);
      }
    });
    
    // Check initial session to avoid flicker
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            setIsLoading(false);
        }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- ROBUST USER DATA LOADER ---
  const loadAllData = async (orgId: string) => {
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

  // --- EVENT HANDLERS ---
  const consumeCredits = async (amount: number) => {
    if (organizationData) {
      const newUsed = organizationData.credits.used + amount;
      const updatedOrg = await supabaseService.updateOrganization(organizationData.id, { credits: { ...organizationData.credits, used: newUsed } });
      if (updatedOrg) setOrganizationData(updatedOrg);
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

  const handleLogout = async () => { 
      const { error } = await supabaseService.signOutUser();
      if(error) showToast(error, 'error');
      else showToast("Vous avez été déconnecté.", 'info');
  };
  
  const handleRefreshData = async () => { if (organizationData) await loadAllData(organizationData.id); };
  const handleNavigateToCampaign = (campaignId: string) => { setCurrentView(View.Campaigns); setHighlightedCampaignId(campaignId); };

  const handleLaunchCampaigns = async (launchedAds: GeneratedAd[], budget: BudgetInfo, platforms: Set<AccountPlatform>) => {
      if (!organizationData) return showToast("Données de l'organisation introuvables.", "error");
      
      const createdCampaigns: Campaign[] = [];
      for (const ad of launchedAds) {
          for (const platform of platforms) {
              const newCampaignData = { name: ad.variation.headline, platform, status: 'Active' as const, dailyBudget: budget.dailyBudget };
              const createdCampaign = await supabaseService.createCampaign(newCampaignData, organizationData.id);
              if (createdCampaign) createdCampaigns.push(createdCampaign);
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
    const updated = await supabaseService.updateCampaign(campaign.id, campaign);
    if(updated) setCampaigns(campaigns.map(c => c.id === campaign.id ? updated : c)); 
    showToast("Campagne mise à jour.", "success");
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    const { error } = await supabaseService.deleteCampaign(campaignId);
    if(!error) {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId)); 
        showToast("Campagne supprimée.", "success");
    } else {
        showToast(error, 'error');
    }
  };
  
  const handleUpdateAccount = async (platform: AccountPlatform, status: AccountStatus) => {
    if(!organizationData) return;
    const updated = await supabaseService.updateAccountStatus(organizationData.id, platform, status);
    if(updated) setAccounts(prev => prev.map(acc => acc.name === platform ? {...acc, status, Icon: platformIcons[platform]} : acc));
  };

  const handleSetUserPlan = async (plan: Organization['plan']) => {
    if(!organizationData) return;
    const updated = await supabaseService.updateOrganization(organizationData.id, { plan });
    if(updated) setOrganizationData(updated);
  };

  const handleAddAnalysis = async (report: AnalysisReport, url: string, sector: string): Promise<AnalysisHistoryItem | null> => {
    if (!organizationData) {
        showToast("Impossible d'enregistrer l'analyse.", 'error');
        return null;
    }
    const newHistoryItem = await supabaseService.createAnalysisHistory(report, url, sector, organizationData.id);
    if (newHistoryItem) {
        setAnalysisHistory(prev => [newHistoryItem, ...prev]);
        return newHistoryItem;
    }
    return null;
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><ArrowPathIcon className="w-12 h-12 text-light-accent animate-spin" /></div>;
  }

  if (!user) {
      return <LoginScreen showToast={showToast} />;
  }

  if (!organizationData) {
      return <div className="flex h-screen w-full items-center justify-center text-center p-4">
          <div>
              <h2 className="text-2xl font-bold">Organisation non trouvée</h2>
              <p className="text-light-text-secondary mt-2">Nous n'avons pas pu charger les données de votre organisation. Cela peut se produire si l'inscription n'est pas finalisée.</p>
              <button onClick={handleLogout} className="mt-4 bg-light-accent text-white font-semibold py-2 px-4 rounded-btn">Se déconnecter</button>
          </div>
      </div>;
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
      case View.AccountManagement: return <AccountManagement accounts={accounts} onUpdateAccount={handleUpdateAccount} setCurrentView={setCurrentView} showToast={showToast} businessInfo={{ name: organizationData.name, category: 'E-commerce', email: userProfile?.email || '', phone: '0102030405', website: 'mon-site.com' }} />;
      // FIX: Corrected typo from `setMembers` to `setTeamMembers` to match the state setter function.
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
        userEmail={userProfile?.email || ''}
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
