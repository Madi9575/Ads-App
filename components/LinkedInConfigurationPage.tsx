import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { ArrowPathIcon, CheckCircleIcon, BriefcaseIcon, UsersIcon, LinkIcon } from './icons';
import Select from './common/Select';

interface LinkedInConfigurationPageProps {
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

const mockPages = [
    { value: 'page1', label: 'My Company Inc.' },
    { value: 'page2', label: 'Innovate Solutions' },
    { value: 'page3', label: 'Global Tech Corp' },
];

const mockAdAccounts = [
    { value: 'acc1', label: 'Main Ad Account - 12345' },
    { value: 'acc2', label: 'Europe Campaign Account - 67890' },
];


const LinkedInConfigurationPage: React.FC<LinkedInConfigurationPageProps> = ({ businessInfo, onBack, setCurrentView, onConfigurationComplete }) => {
    const [step, setStep] = useState<'connect' | 'select' | 'automation' | 'done'>('connect');
    const [selections, setSelections] = useState({ page: 'page1', adAccount: 'acc1' });
    const [checklist, setChecklist] = useState([
        { text: 'Création de la Page Entreprise LinkedIn', done: false },
        { text: 'Configuration du Campaign Manager', done: false },
        { text: 'Installation de l\'Insight Tag', done: false },
        { text: 'Vérification des informations de l\'entreprise', done: false },
        { text: 'Création du premier groupe de campagnes', done: false },
    ]);

    useEffect(() => {
        if (step === 'automation') {
            const timers = checklist.map((_, index) =>
                setTimeout(() => {
                    setChecklist(prev => {
                        const newList = [...prev];
                        newList[index].done = true;
                        return newList;
                    });
                }, (index + 1) * 1000)
            );

            const totalTime = (checklist.length + 1) * 1000;
            setTimeout(() => setStep('done'), totalTime);
            setTimeout(() => onConfigurationComplete(), totalTime + 500);
            return () => timers.forEach(clearTimeout);
        }
    }, [step, checklist.length, onConfigurationComplete]);

    const renderContent = () => {
        switch (step) {
            case 'connect':
                 return (
                    <div className="text-center">
                         <h3 className="text-[28px] leading-[42px] font-bold text-light-text">Connecter votre compte LinkedIn</h3>
                         <p className="text-light-text-secondary mt-2 mb-8">Vous serez redirigé vers LinkedIn pour autoriser la connexion de manière sécurisée.</p>
                         <button onClick={() => setStep('select')} className="w-full max-w-xs mx-auto bg-[#0077B5] hover:bg-[#00669c] text-white font-bold py-3 rounded-btn mt-4 shadow-md hover:shadow-lg">
                            Continuer avec LinkedIn
                         </button>
                    </div>
                );
            case 'select':
                 return (
                    <div className="w-full max-w-md mx-auto">
                        <h3 className="text-xl font-bold text-light-text mb-6 text-center">Finaliser la configuration</h3>
                        <div className="space-y-6">
                            <Select
                                label="Sélectionner une Page Entreprise"
                                name="page"
                                value={selections.page}
                                onChange={e => setSelections(s => ({...s, page: e.target.value}))}
                                options={mockPages}
                                icon={<UsersIcon className="w-5 h-5"/>}
                            />
                            <Select
                                label="Sélectionner un Compte Publicitaire"
                                name="adAccount"
                                value={selections.adAccount}
                                onChange={e => setSelections(s => ({...s, adAccount: e.target.value}))}
                                options={mockAdAccounts}
                                icon={<BriefcaseIcon className="w-5 h-5"/>}
                            />
                        </div>
                        <button onClick={() => setStep('automation')} className="mt-8 w-full bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 rounded-btn shadow-md hover:shadow-lg">
                            Lancer la configuration automatique
                        </button>
                    </div>
                 );
            case 'automation':
                return (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-light-text">Configuration Intelligente</h3>
                        <p className="text-light-text-secondary mt-2 mb-8">Votre compte LinkedIn est en cours d'optimisation...</p>
                        <div className="max-w-md mx-auto text-left space-y-3">
                            {checklist.map(item => <ChecklistItem key={item.text} text={item.text} done={item.done} />)}
                        </div>
                    </div>
                );
            case 'done':
                return (
                     <div className="text-center flex flex-col items-center justify-center h-full">
                        <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
                        <h3 className="text-2xl font-bold text-light-text">Compte LinkedIn Opérationnel !</h3>
                        <p className="text-light-text-secondary mt-2 mb-6">La configuration est terminée. Passage à l'étape suivante...</p>
                    </div>
                );
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
             <div className="glass-card p-8 rounded-3xl min-h-[400px] flex items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default LinkedInConfigurationPage;