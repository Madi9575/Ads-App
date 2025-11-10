import React from 'react';

export enum View {
  Dashboard = 'Dashboard',
  AdCreator = 'Ad Creator',
  CreativeStudio = 'Studio Créatif',
  Inspiration = 'Inspiration',
  Templates = 'Templates',
  Campaigns = 'Campagnes',
  Analytics = 'Analytics',
  Competitors = 'Concurrents',
  OptimisationIA = 'Optimisation IA',
  AccountManagement = 'Gestion de Compte',
  // FIX: Add missing views for Team and Billing.
  Team = 'Équipe',
  Billing = 'Facturation',
}

export type AccountPlatform = 'Facebook' | 'Instagram' | 'TikTok' | 'Google' | 'LinkedIn';

export interface Campaign {
  id: string;
  name: string;
  creationDate: string;
  platform: AccountPlatform;
  status: 'Active' | 'Paused' | 'Ended';
  dailyBudget: number;
  spent: number;
  ctr: number;
  conversions: number;
  performanceHistory: { day: number; value: number }[];
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'E-commerce' | 'SaaS' | 'Éducation' | 'Santé' | 'Tous';
  badge?: 'Populaire' | 'Nouveau';
  icon: React.ComponentType<{ className?: string }>;
  platforms: AccountPlatform[];
  stats: {
    ctrLift: string;
    uses: number;
  };
  parameters: {
    style: string;
    performance: number;
    objective: string;
    tone: string;
  };
  // For pre-filling AdCreator
  adCreatorSettings: {
    image?: {
        prompt: string;
        style: string;
        lighting: string;
    };
    video?: {
        prompt: string;
        visualStyle: string;
    };
    common: {
        headline: string;
        description: string;
        cta: string;
    }
  };
}

export interface AnalysisReport {
  competitorName: string;
  avgCtr: number;
  estBudget: {
    min: number;
    max: number;
    details: string;
  };
  report: {
    strengths: string[];
    opportunities: string[];
    recommendations: string[];
    benchmarks: {
      [key: string]: string;
    };
  };
}

export interface AnalysisHistoryItem extends AnalysisReport {
  id: string;
  url: string;
  sector: string;
}

export type AdFormat = 'Image' | 'Video' | 'Carousel' | 'Document';

export interface InspirationAd {
  id: string;
  platform: 'Facebook' | 'TikTok' | 'Google' | 'Instagram' | 'LinkedIn';
  performanceBadge: 'Top' | 'Viral' | 'Converting';
  sector: string;
  ctr: number;
  cpa: number;
  roas: number;
  conversionRate: number;
  engagement: number;
  likes?: number;
  headline: string;
  description: string;
  duration: number; // in days
  dailyBudget: number;
  format: AdFormat;
  imageUrl: string;
  dataSource?: 'real' | 'simulated';
  objective: string;
  cta: string;
  country: string;
  language: string;
  tiktokSpecific?: {
    hasTrendingSound: boolean;
    isCreatorCollab: boolean;
  };
  details: {
    audience: {
      age: string;
      gender: string;
      interests: string[];
    };
    performanceHistory: { date: string; ctr: number; cpa: number }[];
    successKeys: string[];
    insights: string[];
  };
  adCreatorSettings: Template['adCreatorSettings'];
}

export interface InspirationFilterState {
  search: string;
  sortBy: string;
  mediaTypes: AdFormat[];
  sectors: string[];
  objectives: string[];
  countries: string[];
  performanceRanges: {
    ctr: { min: string; max: string };
    cpa: { min: string; max: string };
    roas: { min: string; max: string };
  };
  tiktokSpecific: {
    hasTrendingSound: boolean | null; // null = any
    isCreatorCollab: boolean | null; // null = any
  };
}


export type AccountStatus = 'Connected' | 'Pending' | 'Not Configured';

export interface Account {
  name: AccountPlatform;
  status: AccountStatus;
  Icon: React.ComponentType<{ className?: string }>;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AnalyticsFilter {
    campaignId?: string;
}

export interface StudioFile {
  id:string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string; // data URL or object URL
  size: number;
  tags: string[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Éditeur' | 'Analyste';
  status: 'Actif' | 'En attente' | 'Suspendu';
  lastActivity: string;
  tags?: string[];
}

export interface PredictiveAnalysis {
  scores: {
    ctr: number;
    engagement: number;
    conversion: number;
  };
  recommendations: string[];
}

// --- AI Campaign Creator Specific Types ---
export type CampaignObjective = 
    'Conversions' | 'Trafic' | 'Notoriété' | 'Engagement' | 
    'Leads' | 'Messages' | 'Portée' | 'Installations app' | 
    'Ventes' | 'Considération produit' | 'Promotion app';

export interface OptimizedAdVariation {
  headline: string;
  description: string;
  rationale: string;
}

export interface AdOptimizationResponse {
  best_pick_index: number;
  variations: OptimizedAdVariation[];
}

export interface GeneratedAd {
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    variation: OptimizedAdVariation;
    isBestPick: boolean;
}

export interface BudgetInfo {
    dailyBudget: number;
    durationInDays: number;
}

// This is the new comprehensive data structure for the Ad Creator form
export interface AdCreatorFormData {
    // Step 1: Strategy
    brandName: string;
    brandMission: string;
    brandPromise: string;
    brandDifferentiators: string;
    productDescription: string;
    productBenefits: string;
    productFeatures: string;
    socialProof: string;
    objective: CampaignObjective;
    kpis: string;
    // Step 2: Audience
    persona: string;
    audienceProblems: string;
    audienceMotivations: string;
    platforms: Set<AccountPlatform>;
    // Step 3: Creative
    brandTone: string;
    adFormat: 'Image' | 'Video';
    visualStyle: string;
    visualPrompt: string;
    headline: string;
    mainText: string;
    cta: string;
    // Step 4: Budget
    budget: BudgetInfo;
}

// This is the strategy generated by the AI Pilot from a single prompt
// It can be used to pre-fill the AdCreatorFormData
export interface AIPilotStrategy {
  productInfo: {
      name: string;
      category: string;
      description: string;
      usp: string;
      problem: string;
  };
  audience: {
      ageRange: string;
      gender: 'Tous' | 'Homme' | 'Femme';
      interests: string[];
      platforms: AccountPlatform[];
      audiencePrompt: string;
      incomeLevel: 'Bas' | 'Moyen' | 'Élevé' | '';
  };
  creativeStrategy: {
      brandTone: string;
      targetEmotions: string[];
  };
  objective: CampaignObjective;
  budgetInfo: BudgetInfo;
  adCreatorSettings: {
      image?: { prompt: string; style: string; };
      video?: { prompt: string; visualStyle: string; };
      common: { headline: string; description: string; cta: string; };
  };
}

// --- Database Data Structures (Supabase/PostgreSQL) ---
export interface UserProfile {
    id: string;
    email: string;
    organizationId: string;
}

export interface Organization {
    id: string;
    ownerId: string;
    name: string;
    plan: 'Starter Plan' | 'Pro Plan' | 'Business Plan';
    credits: {
        used: number;
        total: number;
    };
}

// --- AI Analytics Insight ---
export interface AIAnalyticsInsight {
    summary: string;
    positivePoints: string[];
    areasForImprovement: string[];
    recommendations: { title: string; description: string; impact: string; }[];
}