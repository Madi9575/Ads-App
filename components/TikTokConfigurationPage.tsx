import React, { useState, useEffect } from 'react';
import { View } from '../types';
import { ArrowPathIcon, CheckCircleIcon, DevicePhoneMobileIcon, DocumentTextIcon, EnvelopeIcon, MagicWandIcon, XIcon } from './icons';

interface TikTokConfigurationPageProps {
    businessInfo: { name: string; category: string; email: string; phone: string; website: string };
    onBack: () => void;
    setCurrentView: (view: View) => void;
    onConfigurationComplete: () => void;
}

const InfoItem: React.FC<{ Icon: React.ComponentType<{ className?: string }>, title: string, description: string }> = ({ Icon, title, description }) => (
    <div className="flex items-center gap-[7px]">
        <div className="flex-shrink-0 bg-light-accent/10 p-3 rounded-full">
            <Icon className="w-6 h-6 text-light-accent" />
        </div>
        <div>
            <h4 className="font-semibold text-light-text">{title}</h4>
            <p className="text-sm text-light-text-secondary">{description}</p>
        </div>
    </div>
);

const ChecklistItem: React.FC<{ text: string; done: boolean }> = ({ text, done }) => (
    <div className={`flex items-center gap-[7px] transition-all duration-500 ${done ? 'opacity-100' : 'opacity-50'}`}>
        {done ? <CheckCircleIcon className="w-6 h-6 text-green-400" /> : <ArrowPathIcon className="w-6 h-6 text-light-text-secondary animate-spin" />}
        <span className={`${done ? 'text-light-text' : 'text-light-text-secondary'}`}>{text}</span>
    </div>
);

const TwoFactorAuthModal: React.FC<{ onVerify: () => void; onClose: () => void; }> = ({ onVerify, onClose }) => {
    const [code, setCode] = useState('');
    return (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="glass-card rounded-3xl p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold">Vérification 2-Facteurs</h3>
                <p className="text-sm text-light-text-secondary mt-2 mb-4">Un code a été envoyé à votre appareil. Veuillez le saisir ci-dessous.</p>
                <input 
                    type="text" 
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    maxLength={6}
                    placeholder="_ _ _ _ _ _"
                    className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-white/50 border border-black/10 rounded-btn p-3"
                />
                <button 
                    onClick={onVerify} 
                    disabled={code.length < 6}
                    className="mt-4 w-full bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 rounded-btn disabled:bg-gray-400"
                >
                    Vérifier
                </button>
                 <button onClick={onClose} className="mt-2 text-xs text-light-text-secondary hover:underline">Annuler</button>
            </div>
        </div>
    );
};


const TikTokConfigurationPage: React.FC<TikTokConfigurationPageProps> = ({ businessInfo, onBack, setCurrentView, onConfigurationComplete }) => {
    const [formState, setFormState] = useState({
        email: businessInfo.email || '',
        password: '',
        companyName: businessInfo.name || '',
        country: 'France',
        phone: businessInfo.phone || '',
    });
    const [profileState, setProfileState] = useState({
        bio: '',
        website: businessInfo.website || '',
        contactEmail: businessInfo.email || '',
    });
    const [step, setStep] = useState<'form' | '2fa' | 'automation' | 'done'>('form');
    const [checklist, setChecklist] = useState([
        { text: 'Compte Business créé', done: false },
        { text: 'Vérification 2FA réussie', done: false },
        { text: 'Configuration du compte publicitaire', done: false },
        { text: 'Activation des analytics business', done: false },
        { text: 'Profil optimisé par l\'IA', done: false },
    ]);

    const handleGenerateBio = () => {
        setProfileState(p => ({ ...p, bio: `Votre expert en ${businessInfo.category}. 🚀 Découvrez nos solutions innovantes sur notre site web ! #business #${businessInfo.category.toLowerCase()}` }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('2fa');
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
                }, (index + 1) * 1000)
            );

            const totalTime = (checklist.length + 1) * 1000;
            setTimeout(() => setStep('done'), totalTime);
            setTimeout(() => onConfigurationComplete(), totalTime + 500);
            return () => timers.forEach(clearTimeout);
        }
    }, [step, checklist.length, onConfigurationComplete]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h2 className="text-[28px] leading-[42px] font-bold text-light-text mb-2">Configuration du Compte TikTok Business</h2>
            <p className="text-light-text-secondary mb-8">Créez et configurez votre présence professionnelle sur TikTok en quelques clics.</p>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Panel: Information */}
                <div className="space-y-8">
                    <div className="glass-card p-6 rounded-3xl">
                        <h3 className="text-xl font-semibold mb-4">Fonctionnalités Business</h3>
                        <div className="space-y-4">
                            <InfoItem Icon={CheckCircleIcon} title="Accès aux publicités" description="Lancez des campagnes ciblées directement depuis la plateforme." />
                            <InfoItem Icon={CheckCircleIcon} title="Analytics avancés" description="Obtenez des insights détaillés sur vos followers et la performance de votre contenu." />
                            <InfoItem Icon={CheckCircleIcon} title="Profil professionnel" description="Ajoutez un site web, un email de contact et une catégorie à votre profil." />
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-3xl">
                        <h3 className="text-xl font-semibold mb-4">Processus de Vérification</h3>
                        <div className="space-y-4">
                            <InfoItem Icon={EnvelopeIcon} title="1. Vérification par Email" description="Un lien de confirmation sera envoyé pour valider votre compte." />
                            <InfoItem Icon={DevicePhoneMobileIcon} title="2. Sécurité 2-Facteurs" description="Un code est requis pour sécuriser votre compte et accéder à toutes les fonctionnalités." />
                            <InfoItem Icon={DocumentTextIcon} title="3. Vérification de l'Entreprise" description="Des documents peuvent être requis pour valider votre entreprise." />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form/Automation */}
                <div className="glass-card p-8 rounded-3xl relative">
                    {step === 'form' && (
                        <form onSubmit={handleFormSubmit}>
                            <h3 className="text-xl font-semibold mb-2">Créez votre compte</h3>
                            <p className="text-sm text-light-text-secondary mb-6">Connectez-vous à un compte existant ou créez-en un nouveau.</p>
                            <div className="space-y-4">
                                <input type="email" placeholder="Adresse email" value={formState.email} onChange={e => setFormState(p => ({ ...p, email: e.target.value }))} className="w-full bg-white/50 border border-black/10 rounded-btn p-3" />
                                <input type="password" placeholder="Mot de passe" value={formState.password} onChange={e => setFormState(p => ({ ...p, password: e.target.value }))} className="w-full bg-white/50 border border-black/10 rounded-btn p-3" />
                                <hr className="border-white/20" />
                                <h3 className="text-lg font-semibold pt-2">Optimisation du Profil</h3>
                                <div className="flex items-center gap-4">
                                    <img src="https://i.pravatar.cc/60?u=tiktok" alt="avatar" className="w-16 h-16 rounded-full" />
                                    <div className="w-full">
                                         <label className="text-sm text-light-text-secondary">Photo de profil</label>
                                         <input type="file" className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-btn file:border-0 file:text-xs file:font-semibold file:bg-light-accent/20 file:text-light-accent hover:file:bg-light-accent/30"/>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                         <label className="text-sm text-light-text-secondary">Bio</label>
                                         <button type="button" onClick={handleGenerateBio} className="flex items-center gap-[7px] text-xs text-light-accent font-semibold hover:underline"><MagicWandIcon className="w-6 h-6" /> Générer avec l'IA</button>
                                    </div>
                                    <textarea rows={3} placeholder="Votre bio ici..." value={profileState.bio} onChange={e => setProfileState(p => ({...p, bio: e.target.value}))} className="w-full bg-white/50 border border-black/10 rounded-btn p-3"></textarea>
                                </div>
                                <input type="url" placeholder="Site Web (optionnel)" value={profileState.website} onChange={e => setProfileState(p => ({...p, website: e.target.value}))} className="w-full bg-white/50 border border-black/10 rounded-btn p-3" />
                            </div>
                            <button type="submit" className="mt-6 w-full bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 rounded-btn shadow-md hover:shadow-lg">Créer et Configurer le Compte</button>
                        </form>
                    )}
                    {step === '2fa' && <TwoFactorAuthModal onVerify={() => setStep('automation')} onClose={() => setStep('form')} />}
                    {step === 'automation' && (
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-light-text">Configuration Intelligente</h3>
                            <p className="text-light-text-secondary mt-2 mb-8">Votre compte TikTok est en cours d'optimisation...</p>
                            <div className="max-w-md mx-auto text-left space-y-3">
                                {checklist.map(item => <ChecklistItem key={item.text} text={item.text} done={item.done} />)}
                            </div>
                        </div>
                    )}
                    {step === 'done' && (
                         <div className="text-center flex flex-col items-center justify-center h-full">
                            <CheckCircleIcon className="w-16 h-16 text-green-400 mb-4" />
                            <h3 className="text-2xl font-bold text-light-text">Compte TikTok Opérationnel !</h3>
                            <p className="text-light-text-secondary mt-2 mb-6">La configuration est terminée. Passage à l'étape suivante...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TikTokConfigurationPage;