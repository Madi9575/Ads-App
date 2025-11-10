import { supabase } from './supabase';
import { UserProfile, Organization, Campaign, Account, TeamMember, AnalysisReport, AnalysisHistoryItem, StudioFile, InspirationAd, Template, AccountStatus, AccountPlatform } from '../types';
import { AuthError } from '@supabase/supabase-js';

// --- HELPER FUNCTIONS ---

const generatePerformanceHistory = () => Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: Math.random() * 50 + 10 + i * 5 }));

// --- MOCK DATA (to fix Supabase auth/RLS errors in dev/demo environment) ---

const mockStudioFiles: StudioFile[] = [
    { id: '1', name: 'produit-lancement.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070', size: 2300000, tags: ['produit', 'casque', 'ecommerce'], createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', name: 'video-promo.mp4', type: 'video', url: 'https://videos.pexels.com/video-files/3214539/3214539-sd_640_360_30fps.mp4', size: 12500000, tags: ['promo', 'saas', 'interface'], createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const mockTeam: TeamMember[] = [
    { id: 'tm1', name: 'Alice Durand', email: 'alice@publicity.pro', role: 'Admin', status: 'Actif', lastActivity: 'Il y a 2 heures', tags: ['Summer Sale', 'Q3 Campaigns'] },
    { id: 'tm2', name: 'Bob Martin', email: 'bob@publicity.pro', role: 'Éditeur', status: 'Actif', lastActivity: 'Hier', tags: ['TikTok UGC'] },
    { id: 'tm3', name: 'Carla Rossi', email: 'carla@publicity.pro', role: 'Analyste', status: 'En attente', lastActivity: 'Invit. envoyée il y a 3 jours' },
    { id: 'tm4', name: 'David Chen', email: 'david@publicity.pro', role: 'Analyste', status: 'Actif', lastActivity: 'Il y a 5 heures', tags: ['Google Ads', 'Reporting'] },
];

const mockHistory: AnalysisHistoryItem[] = [
    {
        id: 'ah1', url: 'nike.com', sector: 'E-commerce', competitorName: 'Nike', avgCtr: 7.8,
        estBudget: { min: 500000, max: 1000000, details: 'Forte présence sur tous les canaux' },
        report: {
            strengths: ['Notoriété de marque massive', 'Campagnes émotionnelles puissantes', 'Utilisation de célébrités'],
            opportunities: ['Cibler des niches sportives spécifiques', 'Mettre en avant la durabilité', 'Publicités comparatives sur la technologie'],
            recommendations: ['Lancer une campagne UGC locale', 'Créer du contenu sur les "coulisses"', 'Collaborer avec des micro-influenceurs'],
            benchmarks: { 'CTR moyen E-commerce': '2.5%', 'ROAS moyen': '4.0x' }
        }
    },
    {
        id: 'ah2', url: 'hubspot.com', sector: 'SaaS', competitorName: 'HubSpot', avgCtr: 4.2,
        estBudget: { min: 200000, max: 400000, details: 'Marketing de contenu et SEA très développés' },
        report: {
            strengths: ['Contenu éducatif de haute qualité (blog, academy)', 'Outils gratuits en lead magnet', 'SEO dominant'],
            opportunities: ['Cibler les PME avec une offre plus simple', 'Mettre en avant un support client plus réactif', 'Publicité sur des plateformes alternatives comme Quora/Reddit'],
            recommendations: ['Créer un outil gratuit simple', 'Lancer une campagne de comparaison de fonctionnalités', 'Faire des webinaires sur des sujets de niche'],
            benchmarks: { 'CPL moyen SaaS': '45€', 'Taux de conversion MQL > SQL': '15%' }
        }
    }
];

const getSupabaseAuthErrorMessage = (error: AuthError): string => {
    if (error.message.includes('Invalid login credentials')) {
        return "L'adresse e-mail ou le mot de passe est incorrect.";
    }
    if (error.message.includes('User already registered')) {
        return 'Cette adresse e-mail est déjà utilisée par un autre compte.';
    }
    if (error.message.includes('Password should be at least 6 characters')) {
        return 'Le mot de passe doit comporter au moins 6 caractères.';
    }
    if (error.message.includes('Email confirmation required')) {
        return 'Veuillez confirmer votre adresse e-mail pour vous connecter.';
    }
    if (error.message.includes('For security purposes, you can only request this after')) {
        const secondsMatch = error.message.match(/(\d+)/);
        const seconds = secondsMatch ? secondsMatch[1] : 'quelques';
        return `Pour des raisons de sécurité, veuillez patienter ${seconds} secondes avant de réessayer.`;
    }
    if (error.message.includes('Email rate limit exceeded')) {
        return "Trop de tentatives d'inscription. Veuillez réessayer dans un instant.";
    }
    return error.message || "Une erreur d'authentification est survenue. Veuillez réessayer.";
};

// --- AUTHENTICATION ---

export const signUpUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
    }
  });
  if (error) return { user: null, error: getSupabaseAuthErrorMessage(error) };
  return { user: data.user, error: null };
};

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: getSupabaseAuthErrorMessage(error) };
  return { user: data.user, error: null };
};

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) return { error: getSupabaseAuthErrorMessage(error) };
    return { error: null };
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out: ", error);
    return { error: "Erreur lors de la déconnexion." };
  }
  return { error: null };
};


// --- PROFILES & ORGANIZATIONS ---

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase.from('profiles').select('id, email, organization_id').eq('id', uid).single();
    if (error) { console.error('Error fetching user profile:', error); return null; }
    return data ? { id: data.id, email: data.email, organizationId: data.organization_id } : null;
};

export const getOrganizationData = async (orgId: string): Promise<Organization | null> => {
    const { data, error } = await supabase.from('organizations').select('id, owner_id, name, plan, credits').eq('id', orgId).single();
    if (error) { console.error('Error fetching organization data:', error); return null; }
    return data ? { id: data.id, ownerId: data.owner_id, name: data.name, plan: data.plan, credits: data.credits } : null;
};

export const updateOrganization = async (orgId: string, updates: Partial<Organization>): Promise<Organization | null> => {
    const dbUpdates: any = {};
    if (updates.ownerId) dbUpdates.owner_id = updates.ownerId;
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.plan) dbUpdates.plan = updates.plan;
    if (updates.credits) dbUpdates.credits = updates.credits;
    
    const { data, error } = await supabase.from('organizations').update(dbUpdates).eq('id', orgId).select().single();
    if (error) { console.error('Error updating organization:', error); return null; }
    const updated = data as any;
    return { id: updated.id, ownerId: updated.owner_id, name: updated.name, plan: updated.plan, credits: updated.credits };
};


// --- CAMPAIGNS ---

export const getCampaignsForOrg = async (orgId: string): Promise<Campaign[]> => {
    // Mocked data to prevent Supabase errors due to RLS/auth issues in the demo environment.
    const mockCampaigns: Campaign[] = [
        { id: 'fb001', name: 'Promo Flash - Été 2024', creationDate: '2024-07-15T10:00:00Z', platform: 'Facebook', status: 'Active', dailyBudget: 100, spent: 1520, ctr: 8.2, conversions: 75, performanceHistory: generatePerformanceHistory() },
        { id: 'gg001', name: 'Search Campaign Q3', creationDate: '2024-07-01T10:00:00Z', platform: 'Google', status: 'Active', dailyBudget: 250, spent: 4500, ctr: 12.5, conversions: 120, performanceHistory: generatePerformanceHistory() },
        { id: 'tk001', name: 'Challenge #SummerVibes', creationDate: '2024-06-20T10:00:00Z', platform: 'TikTok', status: 'Paused', dailyBudget: 50, spent: 850, ctr: 15.1, conversions: 210, performanceHistory: generatePerformanceHistory() },
        { id: 'ig001', name: 'Nouvelle Collection - Influenceurs', creationDate: '2024-05-10T10:00:00Z', platform: 'Instagram', status: 'Ended', dailyBudget: 150, spent: 3150, ctr: 6.8, conversions: 95, performanceHistory: generatePerformanceHistory() },
        { id: 'li001', name: 'Lead Gen B2B - SaaS', creationDate: '2024-07-18T10:00:00Z', platform: 'LinkedIn', status: 'Active', dailyBudget: 120, spent: 980, ctr: 2.1, conversions: 15, performanceHistory: generatePerformanceHistory() },
    ];
    return Promise.resolve(mockCampaigns);
};

export const createCampaign = async (campaignData: Partial<Campaign>, orgId: string): Promise<Campaign | null> => {
    const { data, error } = await supabase.from('campaigns').insert({
        name: campaignData.name, platform: campaignData.platform, status: campaignData.status, daily_budget: campaignData.dailyBudget,
        organization_id: orgId, spent: 0, ctr: 0, conversions: 0,
    }).select().single();
    if (error) { console.error('Error creating campaign:', error); return null; }
    const created = data as any;
    return { 
        id: created.id, name: created.name, creationDate: created.created_at, platform: created.platform,
        status: created.status, dailyBudget: created.daily_budget, spent: created.spent, ctr: created.ctr,
        conversions: created.conversions, performanceHistory: generatePerformanceHistory() 
    };
};

export const updateCampaign = async (campaignId: string, updates: Partial<Campaign>): Promise<Campaign | null> => {
    const dbUpdates: { [key: string]: any } = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dailyBudget !== undefined) dbUpdates.daily_budget = updates.dailyBudget;
    const { data, error } = await supabase.from('campaigns').update(dbUpdates).eq('id', campaignId).select().single();
    if (error) { console.error('Error updating campaign:', error); return null; }
    const updated = data as any;
    return {
        id: updated.id, name: updated.name, creationDate: updated.created_at, platform: updated.platform, status: updated.status,
        dailyBudget: updated.daily_budget, spent: updated.spent, ctr: updated.ctr, conversions: updated.conversions,
        performanceHistory: generatePerformanceHistory(),
    };
};

export const deleteCampaign = async (campaignId: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);
    if (error) { console.error('Error deleting campaign:', error); return { error: "La suppression de la campagne a échoué." }; }
    return { error: null };
};

// --- ACCOUNTS (AccountManagement) ---
export const getAccounts = async (orgId: string): Promise<Pick<Account, 'name' | 'status'>[]> => {
    // Mocked data to prevent Supabase errors.
    const allPlatforms: AccountPlatform[] = ['Facebook', 'Google', 'TikTok', 'Instagram', 'LinkedIn'];
    const mockAccounts = [
        { name: 'Facebook', status: 'Connected' },
        { name: 'Google', status: 'Connected' },
        { name: 'TikTok', status: 'Pending' },
        { name: 'Instagram', status: 'Not Configured' },
        { name: 'LinkedIn', status: 'Not Configured' },
    ];
    // Ensure all platforms are represented
    const existingPlatforms = new Set(mockAccounts.map(a => a.name));
    allPlatforms.forEach(p => {
        if (!existingPlatforms.has(p)) {
            mockAccounts.push({ name: p, status: 'Not Configured' });
        }
    });

    return Promise.resolve(mockAccounts as Pick<Account, 'name' | 'status'>[]);
};

export const updateAccountStatus = async (orgId: string, platform: AccountPlatform, status: AccountStatus): Promise<Account | null> => {
    const { data, error } = await supabase.from('accounts').update({ status }).match({ organization_id: orgId, name: platform }).select().single();
    if(error) { console.error("Error updating account:", error); return null; }
    return data;
};


// --- TEAM MEMBERS ---
export const getTeamMembers = async (orgId: string): Promise<TeamMember[]> => {
    // Mocked data to prevent Supabase errors.
    return Promise.resolve(mockTeam);
};


// --- COMPETITOR ANALYSIS ---
export const getAnalysisHistory = async (orgId: string): Promise<AnalysisHistoryItem[]> => {
    // Mocked data to prevent Supabase errors.
    return Promise.resolve(mockHistory);
};

export const createAnalysisHistory = async (report: AnalysisReport, url: string, sector: string, orgId: string): Promise<AnalysisHistoryItem | null> => {
    const newHistory = {
        organization_id: orgId, url, sector, competitor_name: report.competitorName,
        avg_ctr: report.avgCtr, est_budget: report.estBudget, report: report.report
    };
    const { data, error } = await supabase.from('analysis_history').insert(newHistory).select().single();
    if (error) { console.error('Error creating analysis history:', error); return null; }
    const created = data as any;
    return { id: created.id, url: created.url, sector: created.sector, competitorName: created.competitor_name, avgCtr: created.avg_ctr, estBudget: created.est_budget, report: created.report };
};

// --- CREATIVE STUDIO ---
export const getStudioFiles = async (orgId: string): Promise<StudioFile[]> => {
    // Mocked data to prevent Supabase errors.
    return Promise.resolve(mockStudioFiles);
};

// --- GLOBAL DATA (Inspiration & Templates) ---
export const getInspirationAds = async (): Promise<InspirationAd[]> => {
    // This is a placeholder as these are not in the DB schema yet.
    return [];
};

export const getTemplates = async (): Promise<Template[]> => {
     // This is a placeholder as these are not in the DB schema yet.
    return [];
};
