import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { ArrowPathIcon, CheckCircleIcon, SearchIcon, RocketLaunchIcon, FlagIcon } from './icons';

interface GoogleAdsConfigurationPageProps {
    businessInfo: { name: string; category: string; email: string; phone: string; website: string };
    onBack: () => void;
    setCurrentView: (view: View) => void;
    onConfigurationComplete: () => void;
}

const ChecklistItem: React.FC<{ text: string; done: boolean }> = ({ text, done }) => (
    <div className={`flex items-center gap-[7px] transition-all duration-500 ${done ? 'opacity-100' : 'opacity-50'}`}>
        {done ? <CheckCircleIcon className="w-6 h-6 text-green-400" /> : <ArrowPathIcon className="w-6 h-6 text-light-text-secondary animate-spin" />}
        <span className={`${done ? 'text-light-text' : 'text-light-text-secondary'}`}>{text}</span>
    </div>
);

const GoogleAdsConfigurationPage: React.FC<GoogleAdsConfigurationPageProps> = ({ businessInfo, onBack, setCurrentView, onConfigurationComplete }) => {
    const [step, setStep] = useState<'form' | 'automation' | 'done'>('form');
    const [customerId, setCustomerId] = useState('');
    const [isIdValid, setIsIdValid] = useState(false);

    const [checklist, setChecklist] = useState([
        { text: 'Compte Google Ads créé', done: false },
        { text: 'Facturation configurée', done: false },
        { text: 'Objectifs business sélectionnés', done: false },
        { text: 'Tracking des conversions activé', done: false },
        { text: 'Lien avec Google Analytics 4', done: false },
        { text: 'Première campagne test initialisée', done: false },
    ]);

    useEffect(() => {
        // Simple regex for XXX-XXX-XXXX format
        const idRegex = /^\d{3}-\d{3}-\d{4}$/;
        setIsIdValid(idRegex.test(customerId));
    }, [customerId]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isIdValid) {
            setStep('automation');
        }
    };

    useEffect(() => {
        if (step === 'automation') {
            const timers = checklist.map((_, index) =>
                setTimeout(() => {
                    setChecklist(prev => {
                        const newList = [...prev];
                        newList[index].done = true;
                        return newList;
                    });
                }, (index + 1) * 900)
            );

            const totalTime = (checklist.length + 1) * 900;
            setTimeout(() => setStep('done'), totalTime);
            setTimeout(() => onConfigurationComplete(), totalTime + 500);
            return () => timers.forEach(clearTimeout);
        }
    }, [step, checklist.length, onConfigurationComplete]);


    const renderContent = () => {
        switch (step) {
            case 'form':
                return (
                    <div className="w-full max-w-md mx-auto text-center">
                        <RocketLaunchIcon className="w-12 h-12 text-light-accent mx-auto mb-4"/>
                        <h3 className="text-xl font-semibold">Connecter votre compte Google Ads</h3>
                        <p className="text-sm text-light-text-secondary mt-2 mb-6">Entrez votre ID client Google Ads pour lier votre compte. Vous le trouverez dans le coin supérieur droit de votre interface Google Ads.</p>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                             <div>
                                <label htmlFor="customer-id" className="sr-only">ID Client Google Ads</label>
                                <input 
                                    id="customer-id"
                                    type="text" 
                                    placeholder="Ex: 123-456-7890" 
                                    value={customerId}
                                    onChange={e => setCustomerId(e.target.value)}
                                    className={`w-full bg-white/50 border rounded-btn p-3 text-center text-lg tracking-widest ${isIdValid ? 'border-green-500' : 'border-black/10'}`} 
                                />
                                {!isIdValid && customerId.length > 0 && <p className="text-xs text-red-500 mt-1">Format invalide. Le format attendu est XXX-XXX-XXXX.</p>}
                            </div>
                            <button type="submit" disabled={!isIdValid} className="w-full bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 rounded-btn shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Lier le compte et configurer
                            </button>
                        </form>
                    </div>
                );
            case 'automation':
                return (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-light-text">Configuration Intelligente</h3>
                        <p className="text-light-text-secondary mt-2 mb-8">Votre compte Google Ads est en cours d'optimisation par notre IA...</p>
                        <div className="max-w-md mx-auto text-left space-y-3">
                            {checklist.map(item => <ChecklistItem key={item.text} text={item.text} done={item.done} />)}
                        </div>
                    </div>
                );
             case 'done':
                return (
                     <div className="text-center flex flex-col items-center justify-center h-full">
                        <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
                        <h3 className="text-2xl font-bold text-light-text">Compte Google Ads Opérationnel !</h3>
                        <p className="text-light-text-secondary mt-2 mb-6">Votre compte est configuré, vérifié et prêt à diffuser des annonces.</p>
                    </div>
                )
        }
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
             <div className="glass-card p-8 rounded-3xl min-h-[400px] flex items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default GoogleAdsConfigurationPage;