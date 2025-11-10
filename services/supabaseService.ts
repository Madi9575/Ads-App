import { supabase } from './supabase';
import { UserProfile, Organization, Campaign, Account, TeamMember, AnalysisReport, AnalysisHistoryItem, StudioFile, InspirationAd, Template, AccountStatus, AccountPlatform } from '../types';
import { AuthError } from '@supabase/supabase-js';

// --- HELPER FUNCTIONS ---

const generatePerformanceHistory = () => Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: Math.random() * 50 + 10 + i * 5 }));

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
    const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching campaigns:', error);
        return [];
    }
    return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        creationDate: c.created_at,
        platform: c.platform,
        status: c.status,
        dailyBudget: c.daily_budget,
        spent: c.spent,
        ctr: c.ctr,
        conversions: c.conversions,
        performanceHistory: generatePerformanceHistory() // Placeholder as there's no performance data table
    }));
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
    const { data, error } = await supabase
        .from('accounts')
        .select('name, status')
        .eq('organization_id', orgId);

    if (error) {
        console.error('Error fetching accounts:', error);
        const allPlatforms: AccountPlatform[] = ['Facebook', 'Google', 'TikTok', 'Instagram', 'LinkedIn'];
        return allPlatforms.map(p => ({ name: p, status: 'Not Configured' }));
    }

    const allPlatforms: AccountPlatform[] = ['Facebook', 'Google', 'TikTok', 'Instagram', 'LinkedIn'];
    const existingAccounts = new Map(data.map(acc => [acc.name, acc.status]));
    const accountsToUpsert = allPlatforms
        .filter(p => !existingAccounts.has(p))
        .map(p => ({ organization_id: orgId, name: p, status: 'Not Configured' }));

    if (accountsToUpsert.length > 0) {
        const { error: upsertError } = await supabase.from('accounts').upsert(accountsToUpsert);
        if (upsertError) {
            console.error('Error fetching accounts, ensuring defaults:', upsertError);
        } else {
            accountsToUpsert.forEach(acc => existingAccounts.set(acc.name, acc.status as AccountStatus));
        }
    }
    
    return allPlatforms.map(p => ({
        name: p,
        // FIX: Add type assertion to ensure the status from the map is treated as AccountStatus.
        status: (existingAccounts.get(p) as AccountStatus) || 'Not Configured'
    }));
};

export const updateAccountStatus = async (orgId: string, platform: AccountPlatform, status: AccountStatus): Promise<Account | null> => {
    const { data, error } = await supabase.from('accounts').update({ status }).match({ organization_id: orgId, name: platform }).select().single();
    if(error) { console.error("Error updating account:", error); return null; }
    return data;
};


// --- TEAM MEMBERS ---
export const getTeamMembers = async (orgId: string): Promise<TeamMember[]> => {
    const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('organization_id', orgId);
    
    if (error) {
        console.error('Error fetching team members:', error);
        return [];
    }
    return data.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        status: m.status,
        lastActivity: m.last_activity,
        tags: m.tags || []
    }));
};


// --- COMPETITOR ANALYSIS ---
export const getAnalysisHistory = async (orgId: string): Promise<AnalysisHistoryItem[]> => {
    const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching analysis history:', error);
        return [];
    }
    return data.map((item: any) => ({
        id: item.id,
        url: item.url,
        sector: item.sector,
        competitorName: item.competitor_name,
        avgCtr: item.avg_ctr,
        estBudget: item.est_budget,
        report: item.report
    }));
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
    const { data, error } = await supabase
        .from('studio_files')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching studio files:', error);
        return [];
    }
    return data;
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
