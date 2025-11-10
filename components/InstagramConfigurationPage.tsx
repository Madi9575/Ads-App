import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { ArrowPathIcon, CheckCircleIcon, InstagramIcon, FacebookIcon, LinkIcon } from './icons';

interface InstagramConfigurationPageProps {
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

const InstagramConfigurationPage: React.FC<InstagramConfigurationPageProps> = ({ businessInfo, onBack, setCurrentView, onConfigurationComplete }) => {
    const [step, setStep] = useState<'connect' | 'automation' | 'done'>('connect');
    const [checklist, setChecklist] = useState([
        { text: 'Conversion en compte Professionnel', done: false },
        { text: 'Liaison à la Page Facebook Business', done: false },
        { text: 'Configuration des options de contact', done: false },
        { text: 'Activation des Insights Instagram', done: false },
        { text: 'Configuration d\'Instagram Shopping', done: false },
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
            case 'connect':
                return (
                     <div className="text-center">
                        <div className="flex justify-center items-center gap-4 mb-6">
                            <InstagramIcon className="w-16 h-16"/>
                            <LinkIcon className="w-8 h-8 text-light-text-secondary"/>
                            <FacebookIcon className="w-16 h-16"/>
                        </div>
                         <h3 className="text-[28px] leading-[42px] font-bold text-light-text">Lier Instagram via Facebook</h3>
                         <p className="text-light-text-secondary mt-2 mb-8 max-w-md mx-auto">Pour accéder aux fonctionnalités professionnelles, votre compte Instagram doit être lié à une Page Facebook Business.</p>
                         <button onClick={() => setStep('automation')} className="w-full max-w-xs mx-auto bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3 rounded-btn mt-4 shadow-md hover:shadow-lg">
                            Continuer avec Facebook
                         </button>
                    </div>
                );
            case 'automation':
                return (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-light-text">Liaison en cours...</h3>
                        <p className="text-light-text-secondary mt-2 mb-8">Votre compte Instagram est en cours de configuration...</p>
                        <div className="max-w-md mx-auto text-left space-y-3">
                            {checklist.map(item => <ChecklistItem key={item.text} text={item.text} done={item.done} />)}
                        </div>
                    </div>
                );
             case 'done':
                return (
                     <div className="text-center flex flex-col items-center justify-center h-full">
                        <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
                        <h3 className="text-2xl font-bold text-light-text">Compte Instagram Prêt !</h3>
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
    )
};

export default InstagramConfigurationPage;