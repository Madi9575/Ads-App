import React, { FC, useState } from 'react';
import { CreditCardIcon, CheckCircleIcon, CpuChipIcon, ChevronDownIcon } from './icons';
// FIX: Import the Organization type to use its specific 'plan' type definition.
import { Toast, Organization } from '../types';

interface BillingProps {
    // FIX: Use the specific Organization['plan'] type for currentPlan to ensure type safety.
    currentPlan: Organization['plan'];
    // FIX: Update setUserPlan to expect a parameter of type Organization['plan'] for consistency.
    setUserPlan: (plan: Organization['plan']) => void;
    showToast: (message: string, type?: Toast['type']) => void;
}

const planDetails: { [key: string]: { price: number, priceAnnual: number, credits: number, description: string, features: string[], isPopular?: boolean } } = {
    'Starter Plan': {
        price: 29, priceAnnual: 24, credits: 200,
        description: 'Pour les freelances et petites structures qui démarrent.',
        features: [
            'Fonctionnalités de base (pub/image/vidéo)', '200 crédits IA/mois', 'Gestion de 3 campagnes actives', '1 utilisateur', 'Templates limités', 'Support email standard',
        ]
    },
    'Pro Plan': {
        price: 59, priceAnnual: 49, credits: 1000,
        description: 'Pour les indépendants et équipes optimisant leur acquisition.',
        features: [
            'Toutes les fonctionnalités du Starter', 'Campagnes illimitées', '1000 crédits IA/mois', 'Studio créatif IA étendu', 'Analyse concurrentielle basique', 'Support prioritaire par email',
        ]
    },
    'Business Plan': {
        price: 119, priceAnnual: 99, credits: 3000, isPopular: true,
        description: 'Pour agences et PME en croissance, besoin de performance et d’automatisation.',
        features: [
            'Toutes les fonctionnalités du Pro', '3000 crédits IA/mois', 'Gestion d’équipe (jusqu’à 10 membres)', 'Rapports avancés & dashboard', 'Optimisation automatique du budget (IA)', 'Support chat prioritaire & Onboarding',
        ]
    },
    'Enterprise Plan': {
        price: 0, priceAnnual: 0, credits: 0,
        description: 'Pour grandes agences ou marques souhaitant une solution sur-mesure.',
        features: [
            'Toutes les fonctionnalités du Business', 'Crédits IA et utilisateurs sur mesure', 'Accès API premium & intégrations', 'Conseiller CSM dédié', 'SLA garantie, support 24/7',
        ]
    }
};

const Billing: FC<BillingProps> = ({ currentPlan, setUserPlan, showToast }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
    const creditsUsed = 450; // Mocked for display
    const creditsTotal = planDetails[currentPlan]?.credits || 1000;
    const creditsPercentage = (creditsUsed / creditsTotal) * 100;

    const handleChoosePlan = (planName: string) => {
        if (planName === currentPlan) return;
        // FIX: Add a type assertion to ensure the string 'planName' matches the expected Organization['plan'] type.
        setUserPlan(planName as Organization['plan']);
        showToast(`Vous êtes maintenant abonné au ${planName}.`, 'success');
    }

    return (
        <div className="p-4 sm:p-8 max-w-screen-2xl mx-auto">
            <header className="mb-12">
                 <div className="mb-6">
                    <h2 className="text-[28px] leading-[42px] font-bold text-light-text">Facturation & Abonnements</h2>
                    <p className="text-light-text-secondary">Gérez votre plan et optimisez vos dépenses.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-3xl">
                        <h3 className="font-bold mb-4">Votre Abonnement Actuel</h3>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-2xl font-extrabold text-light-accent">{currentPlan}</p>
                                <p className="text-lg font-semibold">{planDetails[currentPlan]?.price}€ / mois</p>
                                <p className="text-sm text-light-text-secondary mt-1">Prochaine facture le 28/08/2024</p>
                            </div>
                             <div className="flex flex-col items-end gap-2">
                                <button className="text-sm font-semibold bg-black/10 hover:bg-black/20 text-light-text py-2 px-4 rounded-btn">Gérer l'abonnement</button>
                                <button className="text-sm text-light-text-secondary hover:underline">Voir l'historique</button>
                            </div>
                        </div>
                    </div>
                     <div className="glass-card p-6 rounded-3xl">
                        <h3 className="font-bold mb-2 flex items-center gap-2"><CpuChipIcon className="w-5 h-5 text-light-text-secondary"/> Utilisation des Crédits IA</h3>
                        
                        <div className="mt-2">
                            <span className="font-extrabold text-4xl text-light-text">{creditsUsed.toLocaleString()}</span>
                            <span className="text-xl font-semibold text-light-text-secondary"> / {creditsTotal.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                            <p className="text-sm text-light-text-secondary">Réinitialisation le 28/08</p>
                            <button className="text-sm font-semibold bg-light-accent hover:bg-light-accent-hover text-white py-2.5 px-6 rounded-2xl shadow-md">Acheter des crédits</button>
                        </div>

                        <div className="w-full bg-black/10 rounded-full h-2.5 overflow-hidden mt-4">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-500 ${creditsPercentage > 100 ? 'bg-red-500' : 'bg-light-accent'}`} 
                                style={{ width: `${Math.min(creditsPercentage, 100)}%` }}>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold">Passez au niveau supérieur</h2>
                <div className="inline-flex items-center rounded-full bg-white p-1 mt-4 border border-gray-300">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-200 ${
                            billingCycle === 'monthly'
                                ? 'bg-light-text text-white'
                                : 'bg-transparent text-light-text'
                        }`}
                    >
                        Mensuel
                    </button>
                    <button
                        onClick={() => setBillingCycle('annually')}
                        className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                            billingCycle === 'annually'
                                ? 'bg-light-text text-white'
                                : 'bg-transparent text-light-text'
                        }`}
                    >
                        Annuel -20%
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(planDetails).map(([name, plan]) => (
                    <div key={name} className={`relative glass-card rounded-3xl p-6 border-2 transition-all flex flex-col ${currentPlan === name ? 'border-light-accent' : 'border-transparent'}`}>
                        {plan.isPopular && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-light-accent text-white text-xs font-bold px-3 py-1 rounded-full">LE PLUS POPULAIRE</span>}
                        {currentPlan === name && <span className="absolute top-3 right-3 bg-light-accent/10 text-light-accent text-xs font-bold px-3 py-1 rounded-full">Plan Actuel</span>}
                        
                        <div className="flex-grow">
                            <h3 className="text-2xl font-semibold text-center">{name}</h3>
                            <p className="text-center text-light-text-secondary mt-2 h-12">{plan.description}</p>
                            
                            <div className="text-center my-6">
                                {name === 'Enterprise Plan' ? (
                                    <p className="text-4xl font-extrabold">Sur devis</p>
                                ) : (
                                    <p className="text-5xl font-extrabold">
                                        {billingCycle === 'annually' ? plan.priceAnnual : plan.price}€
                                        <span className="text-lg font-medium text-light-text-secondary">/ mois</span>
                                    </p>
                                )}
                            </div>
                            
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-[7px]">
                                        <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-light-text-secondary text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <button 
                            onClick={() => {
                                if (name === 'Enterprise Plan') {
                                    showToast('Veuillez nous contacter pour un devis personnalisé.', 'info');
                                } else {
                                    handleChoosePlan(name);
                                }
                            }}
                            disabled={currentPlan === name}
                            className={`w-full font-bold py-3 rounded-btn transition-all duration-300 mt-4 ${currentPlan === name ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-light-accent hover:bg-light-accent-hover text-white shadow-md hover:shadow-lg'}`}
                        >
                            {currentPlan === name 
                                ? 'Votre plan actuel' 
                                : name === 'Enterprise Plan' 
                                    ? 'Nous contacter' 
                                    : 'Mettre à niveau'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Billing;
