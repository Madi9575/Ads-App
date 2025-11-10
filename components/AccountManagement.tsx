import React, { useState, useMemo } from 'react';
import { View, Account, AccountStatus, AccountPlatform, Toast } from '../types';
import { 
    ExclamationTriangleIcon, CheckCircleIcon, Cog6ToothIcon, LinkIcon, 
    ArrowPathIcon, XIcon, ShieldCheckIcon, RocketLaunchIcon, SparklesIcon,
    FacebookIcon, TikTokIcon, GoogleIcon, InstagramIcon, LinkedInIcon 
} from './icons';
import FacebookConfigurationPage from './FacebookConfigurationPage';
import GoogleAdsConfigurationPage from './GoogleAdsConfigurationPage';
import TikTokConfigurationPage from './TikTokConfigurationPage';
import InstagramConfigurationPage from './InstagramConfigurationPage';
import LinkedInConfigurationPage from './LinkedInConfigurationPage';

const PlatformCard: React.FC<{
  account: Account;
  onConnect: (platform: AccountPlatform) => void;
  onManage: (platform: AccountPlatform) => void;
}> = ({ account, onConnect, onManage }) => {
    const { name, status, Icon } = account;
    
    const isConnected = status === 'Connected';

    const platformInsights: Record<AccountPlatform, { tip: string; metric?: string }> = {
        Facebook: { tip: "Idéal pour les audiences larges et le retargeting.", metric: "ROAS: 4.2x" },
        Google: { tip: "Capturez l'intention d'achat avec le Search & Shopping.", metric: "125 Conv. (7j)" },
        TikTok: { tip: "Parfait pour l'UGC, les tendances et la viralité.", metric: "Coût/Vue: 0.02€" },
        Instagram: { tip: "Engagez avec des visuels forts et des stories immersives.", metric: "Taux d'engagement: 5.8%" },
        LinkedIn: { tip: "Ciblez les professionnels et les décideurs B2B.", metric: "Coût/Lead: 25.50€" },
    };

    return (
        <div className={`glass-card p-6 rounded-3xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl border-2 ${isConnected ? 'border-green-500/30' : 'border-transparent'}`}>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3"><Icon className="w-8 h-8" /><h3 className="text-xl font-bold text-light-text">{name}</h3></div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${ isConnected ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                        {isConnected ? <CheckCircleIcon className="w-4 h-4" /> : <ExclamationTriangleIcon className="w-4 h-4" />}
                        {isConnected ? 'Connecté' : 'Action requise'}
                    </div>
                </div>
                
                {isConnected ? (
                    <div className="bg-black/5 p-3 rounded-lg text-center">
                        <p className="text-sm text-light-text-secondary">Performance Récente</p>
                        <p className="text-xl font-bold text-light-text">{platformInsights[name].metric}</p>
                    </div>
                ) : (
                    <p className="text-sm text-light-text-secondary h-16">{platformInsights[name].tip}</p>
                )}
            </div>
            
            <button
                onClick={() => (isConnected ? onManage(name) : onConnect(name))}
                className={`w-full py-2 mt-4 rounded-btn font-semibold text-sm transition-colors ${
                    isConnected ? 'bg-black/10 text-light-text hover:bg-black/20' : 'bg-light-accent hover:bg-light-accent-hover text-white shadow-md'
                }`}
            >
                {isConnected ? 'Gérer' : 'Connecter'}
            </button>
        </div>
    );
};

const AssistantCard: React.FC<{ accounts: Account[], onConnect: (platform: AccountPlatform) => void }> = ({ accounts, onConnect }) => {
    const nextAction = useMemo(() => {
        const priority: AccountPlatform[] = ['Google', 'TikTok', 'Facebook', 'LinkedIn', 'Instagram'];
        const connected = new Set(accounts.filter(a => a.status === 'Connected').map(a => a.name));
        for (const platform of priority) {
            if (!connected.has(platform)) {
                return {
                    platform,
                    ...{
                        'Google': { title: "Capturez l'intention d'achat", description: "Connectez Google Ads pour cibler les utilisateurs qui recherchent activement vos produits et services." },
                        'TikTok': { title: "Débloquez l'audience Gen Z", description: "Connectez TikTok pour lancer des campagnes virales et toucher une nouvelle génération de clients." },
                        'Facebook': { title: "Construisez votre communauté", description: "Connectez Facebook pour créer des audiences personnalisées et des campagnes de retargeting puissantes." },
                        'LinkedIn': { title: "Atteignez les professionnels", description: "Connectez LinkedIn pour vos campagnes B2B et ciblez par secteur d'activité, poste et entreprise." },
                        'Instagram': { title: "Brillez par le visuel", description: "Connectez Instagram pour transformer l'engagement visuel en conversions." },
                    }[platform]
                };
            }
        }
        return null;
    }, [accounts]);

    if (!nextAction) return null;

    return (
        <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-light-accent/10 to-transparent">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="p-3 bg-light-accent/10 rounded-full self-start">
                    <SparklesIcon className="w-8 h-8 text-light-accent" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-light-text">Prochaine Meilleure Action</h3>
                    <p className="text-sm text-light-text-secondary mt-1">
                        <strong className="text-light-text">{nextAction.title} :</strong> {nextAction.description}
                    </p>
                </div>
                <button onClick={() => onConnect(nextAction.platform)} className="bg-light-accent text-white font-bold py-2 px-5 rounded-btn shadow-md hover:bg-light-accent-hover transition-colors whitespace-nowrap">
                    Connecter {nextAction.platform}
                </button>
            </div>
        </div>
    );
};

const OnboardingWizard: React.FC<{ accounts: Account[], setCurrentView: (v: View) => void, onConnect: (p: AccountPlatform) => void }> = ({ accounts, setCurrentView, onConnect }) => {
    const connectedCount = accounts.filter(a => a.status === 'Connected').length;
    let currentStep = 1;
    if (connectedCount >= 2) currentStep = 3;
    else if (connectedCount === 1) currentStep = 2;
    
    const steps = [
        { id: 1, title: "Connectez votre 1ère plateforme", description: "Commencez par lier votre compte publicitaire principal.", action: () => onConnect('Facebook') },
        { id: 2, title: "Connectez une 2ème plateforme", description: "Débloquez l'analyse cross-canal en ajoutant un autre compte.", action: () => onConnect('Google') },
        { id: 3, title: "Lancez votre 1ère campagne IA", description: "Utilisez nos outils pour créer une publicité optimisée.", action: () => setCurrentView(View.AdCreator) },
    ];

    if (currentStep > steps.length) return null;

    return (
        <div className="glass-card p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4">Guide de Démarrage Rapide</h3>
            <div className="flex flex-col md:flex-row gap-4">
                {steps.map((step, index) => {
                    const isDone = step.id < currentStep;
                    const isActive = step.id === currentStep;
                    return (
                        <div key={step.id} className={`flex-1 p-4 rounded-xl transition-all ${isActive ? 'bg-light-accent/10' : 'bg-black/5'}`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-light-accent text-white' : 'bg-gray-300 text-gray-600'}`}>
                                    {isDone ? <CheckCircleIcon className="w-4 h-4"/> : step.id}
                                </div>
                                <h4 className="font-semibold">{step.title}</h4>
                            </div>
                            <p className="text-xs text-light-text-secondary mt-2 mb-3">{step.description}</p>
                            {isActive && (
                                <button onClick={step.action} className="text-sm font-bold text-light-accent hover:underline">
                                    {step.id === 3 ? 'Créer une campagne' : 'Connecter'} &rarr;
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


interface AccountManagementProps {
    accounts: Account[];
    onUpdateAccount: (platform: AccountPlatform, status: AccountStatus) => void;
    setCurrentView: (view: View) => void;
    showToast: (message: string, type?: Toast['type']) => void;
    businessInfo: { name: string; category: string; email: string; phone: string; website: string };
}

const AccountManagement: React.FC<AccountManagementProps> = ({ accounts, onUpdateAccount, setCurrentView, showToast, businessInfo }) => {
    const [configuringPlatform, setConfiguringPlatform] = useState<AccountPlatform | null>(null);

    const handleConfigurationComplete = (platform: AccountPlatform) => {
        onUpdateAccount(platform, 'Connected');
        showToast(`Compte ${platform} configuré avec succès !`, 'success');
        setConfiguringPlatform(null);
    };

    if (configuringPlatform) {
        const props = {
            businessInfo,
            onBack: () => setConfiguringPlatform(null),
            setCurrentView,
            onConfigurationComplete: () => handleConfigurationComplete(configuringPlatform),
        };
        switch (configuringPlatform) {
            case 'Facebook':
                return <FacebookConfigurationPage {...props} />;
            case 'Google':
                return <GoogleAdsConfigurationPage {...props} />;
            case 'TikTok':
                return <TikTokConfigurationPage {...props} />;
            case 'Instagram':
                return <InstagramConfigurationPage {...props} />;
            case 'LinkedIn':
                return <LinkedInConfigurationPage {...props} />;
            default:
                setConfiguringPlatform(null); // Fallback for unhandled platforms
                return null;
        }
    }
    
    return (
        <div className="p-4 sm:p-8 space-y-8">
            <header>
                <div>
                    <h2 className="text-[28px] leading-[42px] font-bold text-light-text">Centre de Connexions</h2>
                    <p className="text-light-text-secondary">Unifiez vos plateformes publicitaires pour débloquer la pleine puissance de l'IA.</p>
                </div>
            </header>
            
            <OnboardingWizard accounts={accounts} setCurrentView={setCurrentView} onConnect={setConfiguringPlatform} />

            <AssistantCard accounts={accounts} onConnect={setConfiguringPlatform} />

            <div>
                <h3 className="text-xl font-bold mb-4">Vos Plateformes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map(account => (
                        <PlatformCard
                            key={account.name}
                            account={account}
                            onConnect={setConfiguringPlatform}
                            onManage={() => showToast(`Gestion de ${account.name} bientôt disponible.`, 'info')}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccountManagement;