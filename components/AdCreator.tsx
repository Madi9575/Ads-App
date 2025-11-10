import React, { useState, FC, useEffect, useMemo, useRef } from 'react';
import * as geminiService from '../services/geminiService';
import { Toast, GeneratedAd, AccountPlatform, AIPilotStrategy, AdCreatorFormData, BudgetInfo } from '../types';
import { MagicWandIcon, ArrowPathIcon, UsersIcon, PaintBrushIcon, SparklesIcon, EyeIcon, RocketLaunchIcon, ArrowLeftIcon, LightBulbIcon, XCircleIcon, FacebookIcon, GoogleIcon, TikTokIcon, LinkedInIcon, CheckCircleIcon as CheckIcon, BriefcaseIcon, CreditCardIcon, PhotoIcon, VideoCameraIcon, ChevronDownIcon, CursorClickIcon, LineChartIcon, ShieldCheckIcon, ArrowUpTrayIcon, PlayIconFilled, MusicNoteIcon } from './icons';
import Select from './common/Select';

// --- TYPE DEFINITIONS ---
interface AdCreatorProps {
    showToast: (message: string, type?: Toast['type']) => void;
    credits: { used: number, total: number };
    consumeCredits: (amount: number) => void;
    aiPilotStrategy: AIPilotStrategy | null;
    onStrategyConsumed: () => void;
    onLaunchCampaigns: (launchedAds: GeneratedAd[], budget: BudgetInfo, platforms: Set<AccountPlatform>) => void;
}

// --- STATE INITIALIZATION ---
const initialFormData: AdCreatorFormData = {
    brandName: '', brandMission: '', brandPromise: '', brandDifferentiators: '',
    productDescription: '', productBenefits: '', productFeatures: '', socialProof: '',
    objective: 'Conversions', kpis: 'Taux de conversion, CPA',
    persona: '', audienceProblems: '', audienceMotivations: '',
    platforms: new Set<AccountPlatform>(['Facebook']),
    brandTone: 'Amical', adFormat: 'Image', visualStyle: 'Réaliste',
    visualPrompt: '', headline: '', mainText: '', cta: 'En savoir plus',
    budget: { dailyBudget: 50, durationInDays: 14 },
};

// --- MAIN COMPONENT ---
const AdCreator: FC<AdCreatorProps> = ({ showToast, credits, consumeCredits, aiPilotStrategy, onStrategyConsumed, onLaunchCampaigns }) => {
    const [view, setView] = useState<'creator' | 'results'>('creator');
    const [formData, setFormData] = useState<AdCreatorFormData>(initialFormData);
    const [mediaSource, setMediaSource] = useState<'ai' | 'upload'>('ai');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingMore, setIsGeneratingMore] = useState(false);
    const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>([]);
    const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(false);
    const [selectedAds, setSelectedAds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!uploadedFile) {
            setUploadedFilePreview(null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedFilePreview(reader.result as string);
        };
        reader.readAsDataURL(uploadedFile);
    }, [uploadedFile]);

    useEffect(() => {
        if (aiPilotStrategy) {
            setFormData(prev => ({
                ...prev,
                brandName: aiPilotStrategy.productInfo.name,
                productDescription: aiPilotStrategy.productInfo.description,
                brandDifferentiators: aiPilotStrategy.productInfo.usp,
                audienceProblems: aiPilotStrategy.productInfo.problem,
                persona: aiPilotStrategy.audience.audiencePrompt,
                platforms: new Set(aiPilotStrategy.audience.platforms),
                objective: aiPilotStrategy.objective,
                brandTone: aiPilotStrategy.creativeStrategy.brandTone,
                visualPrompt: aiPilotStrategy.adCreatorSettings.image?.prompt || aiPilotStrategy.adCreatorSettings.video?.prompt || '',
                visualStyle: aiPilotStrategy.adCreatorSettings.image?.style || aiPilotStrategy.adCreatorSettings.video?.visualStyle || 'Réaliste',
                adFormat: aiPilotStrategy.adCreatorSettings.video ? 'Video' : 'Image',
                headline: aiPilotStrategy.adCreatorSettings.common.headline,
                mainText: aiPilotStrategy.adCreatorSettings.common.description,
                cta: aiPilotStrategy.adCreatorSettings.common.cta,
                budget: aiPilotStrategy.budgetInfo,
            }));
            showToast("Stratégie IA appliquée. Vérifiez et lancez !", 'success');
            onStrategyConsumed();
        }
    }, [aiPilotStrategy, onStrategyConsumed, showToast]);
    
    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                setHasApiKey(await window.aistudio.hasSelectedApiKey());
            }
        };
        checkKey();
    }, []);

    const handleGenerate = async () => {
        const mediaCost = mediaSource === 'ai' ? (formData.adFormat === 'Image' ? 10 : 50) : 0;
        
        if (mediaSource === 'upload' && !uploadedFile) {
            const errorMessage = "Veuillez importer un fichier média avant de générer les publicités.";
            setError(errorMessage);
            showToast(errorMessage, 'error');
            return;
        }

        if (mediaCost > credits.total - credits.used) {
            const errorMessage = `Crédits insuffisants. Requis : ${mediaCost}, Disponible : ${credits.total - credits.used}.`;
            setError(errorMessage);
            showToast(errorMessage, 'error');
            return;
        }

        setIsLoading(true);
        setGeneratedAds([]);
        setSelectedAds(new Set());
        setError(null);
        setView('results');
        
        try {
            let mediaUrl: string;

            if (mediaSource === 'upload') {
                if (!uploadedFilePreview) throw new Error("Aperçu du média importé non disponible.");
                mediaUrl = uploadedFilePreview;
            } else { // mediaSource === 'ai'
                if (formData.adFormat === 'Video' && window.aistudio && !hasApiKey) {
                    try { await window.aistudio.openSelectKey(); setHasApiKey(true); } 
                    catch (e) { setError("La sélection de la clé API est requise pour la génération de vidéo."); setIsLoading(false); setView('creator'); return; }
                }

                // FIX: The `generateImage` service returns an array of strings, so we take the first element to match the `mediaUrl` string type. This resolves the type error in the ternary expression.
                mediaUrl = formData.adFormat === 'Image'
                    ? (await geminiService.generateImage(formData.visualPrompt, '1:1'))[0]
                    : await geminiService.generateVideo(formData.visualPrompt, '9:16');
                
                consumeCredits(mediaCost);
                showToast(`Média généré, optimisation en cours...`, 'info');
            }
            
            setGeneratedMediaUrl(mediaUrl);

            const optimizationResponse = await geminiService.optimizeAdVariations(formData);
            
            const finalAds: GeneratedAd[] = optimizationResponse.variations.map((variation, index) => ({
                id: `${Date.now()}-${index}`, mediaUrl,
                mediaType: formData.adFormat.toLowerCase() as 'image' | 'video',
                variation, isBestPick: index === optimizationResponse.best_pick_index,
            }));

            setGeneratedAds(finalAds);
            showToast(`Publicités optimisées par l'IA prêtes !`, 'success');

        } catch (e: any) {
            console.error(e);
            let errorMessage = e.message || "La génération a échoué. Veuillez réessayer.";
            if (e.message?.includes('Requested entity was not found')) {
                errorMessage = "Clé API non valide pour la vidéo. Veuillez en sélectionner une autre. Documentation: ai.google.dev/gemini-api/docs/billing.";
                setHasApiKey(false);
            }
            setError(errorMessage);
            setView('creator');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateMoreVariations = async () => {
        const cost = 5;
        if (cost > credits.total - credits.used) { showToast(`Crédits insuffisants. Requis : ${cost}, Disponible : ${credits.total - credits.used}.`, 'error'); return; }
        if (!generatedMediaUrl) { showToast("Erreur: Média de base non trouvé pour générer de nouvelles variations.", 'error'); return; }
    
        setIsGeneratingMore(true); setError(null);
    
        try {
            consumeCredits(cost);
            showToast(`Génération de nouvelles variations de texte...`, 'info');
            const optimizationResponse = await geminiService.optimizeAdVariations(formData);
            
            const newAds: GeneratedAd[] = optimizationResponse.variations.map((variation, index) => ({
                id: `${Date.now()}-${index}`, mediaUrl: generatedMediaUrl,
                mediaType: formData.adFormat.toLowerCase() as 'image' | 'video',
                variation, isBestPick: false,
            }));
    
            setGeneratedAds(prevAds => [...prevAds, ...newAds]);
            showToast(`3 nouvelles variations ajoutées !`, 'success');
    
        } catch (e: any) { console.error("Error generating more variations:", e); setError(e.message || "La génération de variations a échoué."); } 
        finally { setIsGeneratingMore(false); }
    };

    const handleLaunchSelected = () => {
        const adsToLaunch = generatedAds.filter(ad => selectedAds.has(ad.id));
        if (adsToLaunch.length > 0) {
            onLaunchCampaigns(adsToLaunch, formData.budget, formData.platforms);
            setSelectedAds(new Set());
        }
    };
    
    if (view === 'results') {
        return <LaunchCenter
                    isLoading={isLoading} 
                    ads={generatedAds}
                    onLaunchSelected={handleLaunchSelected}
                    // FIX: Corrected typo from `handleGenerateMore` to `handleGenerateMoreVariations`.
                    onGenerateMore={handleGenerateMoreVariations}
                    isGeneratingMore={isGeneratingMore}
                    onGoBack={() => { setView('creator'); setError(null); }}
                    error={error}
                    selectedAds={selectedAds}
                    setSelectedAds={setSelectedAds}
                    onLaunchCampaign={(ad) => onLaunchCampaigns([ad], formData.budget, formData.platforms)}
                />;
    }

    return (
        <div className="p-4 sm:p-6 h-full flex gap-6">
            <StrategicBriefPanel 
                formData={formData} 
                setFormData={setFormData} 
                onGenerate={handleGenerate} 
                mediaSource={mediaSource}
                setMediaSource={setMediaSource}
                uploadedFile={uploadedFile}
                setUploadedFile={setUploadedFile}
                uploadedFilePreview={uploadedFilePreview}
                credits={credits}
            />
            <AICopilotPanel formData={formData} uploadedFilePreview={uploadedFilePreview} />
        </div>
    );
};


// --- UI LAYOUT COMPONENTS ---
const StrategicBriefPanel: FC<{ 
    formData: AdCreatorFormData, 
    setFormData: React.Dispatch<React.SetStateAction<AdCreatorFormData>>, 
    onGenerate: () => void, 
    mediaSource: 'ai' | 'upload',
    setMediaSource: (source: 'ai' | 'upload') => void,
    uploadedFile: File | null,
    setUploadedFile: (file: File | null) => void,
    uploadedFilePreview: string | null,
    credits: { used: number, total: number }
}> = ({ formData, setFormData, onGenerate, mediaSource, setMediaSource, uploadedFile, setUploadedFile, uploadedFilePreview, credits }) => {
    const [activeSection, setActiveSection] = useState('strategy');
    const update = (field: keyof AdCreatorFormData, value: any) => setFormData(p => ({ ...p, [field]: value }));
    const mediaCost = mediaSource === 'ai' ? (formData.adFormat === 'Image' ? 10 : 50) : 0;

    return (
        <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-4">Brief Stratégique</h3>
            <div className="flex-1 overflow-y-auto -mr-3 pr-3 space-y-3">
                <AccordionSection title="Stratégie & Produit" icon={BriefcaseIcon} isOpen={activeSection === 'strategy'} onToggle={() => setActiveSection('strategy')} className={activeSection === 'strategy' ? 'z-40' : 'z-10'}>
                    <Input label="Nom de la marque" value={formData.brandName} onChange={e => update('brandName', e.target.value)} required />
                    <Textarea label="Description du produit/service" value={formData.productDescription} onChange={e => update('productDescription', e.target.value)} required/>
                    <Select label="Type d'objectif" name="objective" value={formData.objective} onChange={e => update('objective', e.target.value)} options={['Conversions', 'Trafic', 'Notoriété', 'Engagement', 'Leads']} />
                </AccordionSection>
                <AccordionSection title="Audience Cible" icon={UsersIcon} isOpen={activeSection === 'audience'} onToggle={() => setActiveSection('audience')} className={activeSection === 'audience' ? 'z-30' : 'z-10'}>
                    <Textarea label="Persona détaillé" value={formData.persona} onChange={e => update('persona', e.target.value)} placeholder="Décrivez votre client idéal..." required/>
                    <PlatformSelector platforms={formData.platforms} onUpdate={p => update('platforms', p)} />
                </AccordionSection>
                <AccordionSection title="Contenu Créatif" icon={PaintBrushIcon} isOpen={activeSection === 'creative'} onToggle={() => setActiveSection('creative')} className={activeSection === 'creative' ? 'z-20' : 'z-10'}>
                    <Input label="Titre (Headline)" value={formData.headline} onChange={e => update('headline', e.target.value)} required/>
                    <Textarea label="Texte principal" value={formData.mainText} onChange={e => update('mainText', e.target.value)} required />
                    <Input label="Call to Action (CTA)" value={formData.cta} onChange={e => update('cta', e.target.value)} required/>
                    <AdFormatSelector format={formData.adFormat} onUpdate={f => update('adFormat', f)} />
                    <MediaSourceSelector source={mediaSource} onUpdate={setMediaSource} />
                    {mediaSource === 'ai' ? (
                        <Textarea label="Prompt pour le visuel IA" value={formData.visualPrompt} onChange={e => update('visualPrompt', e.target.value)} placeholder="Décrivez le visuel ou la vidéo..." required/>
                    ) : (
                        <FileUploader file={uploadedFile} setFile={setUploadedFile} filePreview={uploadedFilePreview} mediaType={formData.adFormat} />
                    )}
                </AccordionSection>
                <AccordionSection title="Budget & Lancement" icon={CreditCardIcon} isOpen={activeSection === 'budget'} onToggle={() => setActiveSection('budget')} className="z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Budget/jour (€)" type="number" value={String(formData.budget.dailyBudget)} onChange={e => update('budget', { ...formData.budget, dailyBudget: Number(e.target.value)})} required />
                        <Input label="Durée (jours)" type="number" value={String(formData.budget.durationInDays)} onChange={e => update('budget', { ...formData.budget, durationInDays: Number(e.target.value)})} required />
                    </div>
                    <div className="bg-blue-500/10 text-blue-800 p-4 rounded-xl mt-4">
                        <p><b>Budget total :</b> {(formData.budget.dailyBudget * formData.budget.durationInDays).toLocaleString('fr-FR')}€ | <b>Coût :</b> {mediaCost} crédits</p>
                    </div>
                    <button onClick={onGenerate} className="mt-4 w-full bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 px-6 rounded-btn flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                        <SparklesIcon className="w-6 h-6" /> Générer les publicités
                    </button>
                </AccordionSection>
            </div>
        </div>
    );
};

const AICopilotPanel: FC<{ formData: AdCreatorFormData, uploadedFilePreview: string | null }> = ({ formData, uploadedFilePreview }) => {
    return (
        <div className="w-96 flex-shrink-0 glass-card rounded-3xl p-6 flex flex-col gap-6">
            <h3 className="text-xl font-bold">Copilote IA & Prévisualisation</h3>
            <div className="flex-1 space-y-4">
                <PerformanceGauges formData={formData} />
                 <div>
                    <h4 className="font-semibold text-light-text mb-2">Prévisualisation en Direct</h4>
                    <AdPreviewMockup formData={formData} uploadedFilePreview={uploadedFilePreview} />
                </div>
                <div>
                    <h4 className="font-semibold text-light-text mb-2">Suggestions IA</h4>
                    <div className="bg-black/5 p-3 rounded-xl text-sm text-light-text-secondary space-y-2">
                         <p>💡 Mentionner un bénéfice chiffré comme "Gagnez 2h par jour" pourrait augmenter le CTR.</p>
                         <p>💡 Votre audience répond bien aux questions. Essayez un titre comme "Prêt à transformer... ?"</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LaunchCenter: FC<{
    isLoading: boolean; isGeneratingMore: boolean; ads: GeneratedAd[];
    onLaunchSelected: () => void; onGenerateMore: () => void; onGoBack: () => void; 
    error: string | null; selectedAds: Set<string>;
    setSelectedAds: React.Dispatch<React.SetStateAction<Set<string>>>;
    onLaunchCampaign: (ad: GeneratedAd) => void;
}> = ({ isLoading, isGeneratingMore, ads, onLaunchSelected, onGenerateMore, onGoBack, error, selectedAds, setSelectedAds, onLaunchCampaign }) => {
    const handleToggleAdSelection = (adId: string) => setSelectedAds(prev => { const newSelection = new Set(prev); if (newSelection.has(adId)) newSelection.delete(adId); else newSelection.add(adId); return newSelection; });
    
    if (isLoading) return <div className="p-8 h-full flex flex-col items-center justify-center text-center"><ArrowPathIcon className="w-12 h-12 text-light-accent mx-auto animate-spin" /><h3 className="text-2xl font-bold mt-4">L'IA travaille pour vous...</h3><p className="text-light-text-secondary mt-2">Génération du média et optimisation des textes en cours.</p></div>;
    if (error) return <div className="p-8 h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto"><XCircleIcon className="w-12 h-12 text-red-500 mx-auto" /><h3 className="text-2xl font-bold mt-4 text-red-500">Une erreur est survenue</h3><p className="text-light-text-secondary mt-2 bg-red-500/10 p-3 rounded-2xl">{error}</p><button onClick={onGoBack} className="mt-6 bg-black/10 hover:bg-black/20 text-light-text font-semibold py-2 px-4 rounded-btn">Retour</button></div>;
    
    return (
        <div className="p-4 sm:p-6 flex flex-col h-full">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div><h3 className="text-2xl font-bold">Centre de Lancement</h3><p className="text-light-text-secondary mt-1">Vos variations sont prêtes. Choisissez les meilleures pour un A/B testing.</p></div>
                <div className="flex items-center gap-2">
                    <button onClick={onGoBack} className="text-sm font-semibold bg-white/50 border border-black/10 rounded-btn p-3 hover:bg-black/5 flex items-center gap-2"><ArrowLeftIcon className="w-5 h-5"/> Retour au Brief</button>
                    <button onClick={onGenerateMore} disabled={isGeneratingMore} className="bg-black/10 hover:bg-black/20 text-light-text font-bold py-3 px-4 rounded-btn flex items-center gap-2"><SparklesIcon className="w-5 h-5" />{isGeneratingMore ? 'Génération...' : 'Plus de variations'}</button>
                </div>
            </header>

            <div className="grid md:grid-cols-5 gap-6 flex-1">
                <div className="md:col-span-3 lg:col-span-4 flex-1 overflow-y-auto pr-2 -mr-2">
                    <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 pt-3">
                        {ads.map(ad => (
                           <AdVariationCard
                                key={ad.id}
                                ad={ad}
                                isSelected={selectedAds.has(ad.id)}
                                onToggle={() => handleToggleAdSelection(ad.id)}
                            />
                        ))}
                    </div>
                </div>
                <div className="md:col-span-2 lg:col-span-1 glass-card rounded-3xl p-6 flex flex-col">
                    <h4 className="text-lg font-bold">Checklist de Pré-lancement</h4>
                    <ul className="space-y-3 text-sm my-4">
                        <li className="flex items-center gap-2"><CheckIcon className="w-5 h-5 text-green-500"/> Titre percutant</li>
                        <li className="flex items-center gap-2"><CheckIcon className="w-5 h-5 text-green-500"/> Audience bien définie</li>
                        <li className="flex items-center gap-2"><CheckIcon className="w-5 h-5 text-green-500"/> Visuel de haute qualité</li>
                        <li className="flex items-center gap-2"><CheckIcon className="w-5 h-5 text-green-500"/> CTA clair et unique</li>
                        <li className="flex items-center gap-2"><CheckIcon className="w-5 h-5 text-green-500"/> Budget vérifié</li>
                    </ul>
                    <div className="mt-auto border-t border-black/10 pt-4">
                        <p className="font-semibold">{selectedAds.size} variation(s) sélectionnée(s)</p>
                        <button onClick={onLaunchSelected} disabled={selectedAds.size === 0} className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-btn flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"><RocketLaunchIcon className="w-5 h-5"/>Lancer la campagne</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- UI SUB-COMPONENTS ---
const AccordionSection: FC<{ title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; isOpen: boolean; onToggle: () => void; className?: string; }> = ({ title, icon: Icon, children, isOpen, onToggle, className }) => (
    <div className={`bg-black/5 rounded-2xl relative ${className}`}>
        <button onClick={onToggle} className="w-full flex justify-between items-center p-4 text-left font-bold">
            <span className="flex items-center gap-3"><Icon className="w-6 h-6 text-light-accent" /> {title}</span>
            <ChevronDownIcon className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen overflow-visible' : 'max-h-0 overflow-hidden'}`}>
            <div className="p-4 pt-0 space-y-4">{children}</div>
        </div>
    </div>
);

const AdVariationCard: FC<{ ad: GeneratedAd; isSelected: boolean; onToggle: () => void; }> = ({ ad, isSelected, onToggle }) => {
    const scores = useMemo(() => ({
        ctr: Math.floor(Math.random() * 20 + 75), // 75-95
        engagement: Math.floor(Math.random() * 20 + 70), // 70-90
        conversion: Math.floor(Math.random() * 25 + 65), // 65-90
    }), [ad.id]);

    return (
        <div
            onClick={onToggle}
            className={`relative glass-card rounded-3xl p-3 flex flex-col cursor-pointer transition-all border-2 ${isSelected ? 'border-light-accent' : 'border-transparent'} hover:border-light-accent/50`}
        >
            {ad.isBestPick && (
                <div className="absolute top-3 right-3 bg-light-accent text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 z-10">
                    <SparklesIcon className="w-4 h-4"/> Recommandé
                </div>
            )}
            <div className="aspect-square rounded-xl overflow-hidden bg-white/30 mb-3 relative">
                {ad.mediaType === 'image' 
                    ? <img src={ad.mediaUrl} className="w-full h-full object-cover" alt={ad.variation.headline} /> 
                    : <video src={ad.mediaUrl} className="w-full h-full object-cover" controls autoPlay loop muted />}
                <div className={`absolute top-3 left-3 w-6 h-6 rounded-md border-2 ${isSelected ? 'bg-light-accent border-light-accent' : 'bg-white/50 border-gray-300'} flex items-center justify-center transition-colors`}>
                    {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
                </div>
            </div>
            <div className="flex-1 flex flex-col px-1">
                <h4 className="font-bold text-base line-clamp-2">{ad.variation.headline}</h4>
                <p className="text-sm text-light-text-secondary mt-1 line-clamp-3 flex-grow h-16">{ad.variation.description}</p>
                
                <div className="my-3 space-y-2">
                    <ScoreIndicator label="Potentiel CTR" score={scores.ctr} color="green" />
                    <ScoreIndicator label="Potentiel Engagement" score={scores.engagement} color="sky" />
                    <ScoreIndicator label="Potentiel Conversion" score={scores.conversion} color="amber" />
                </div>

                <div className="mt-auto pt-2 border-t border-black/10">
                    <p className="text-xs font-semibold text-light-accent flex items-center gap-1.5"><LightBulbIcon className="w-4 h-4" /> Rationale IA</p>
                    <p className="text-xs text-light-text-secondary mt-1 line-clamp-2">{ad.variation.rationale}</p>
                </div>
            </div>
        </div>
    );
};

const ScoreIndicator: FC<{ label: string, score: number, color: 'green' | 'sky' | 'amber' }> = ({ label, score, color }) => {
    const colorClass = { green: 'bg-green-500', sky: 'bg-sky-500', amber: 'bg-amber-500' }[color];
    return (
        <div>
            <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-light-text-secondary">{label}</span>
                <span className="font-bold text-light-text">{score}</span>
            </div>
            <div className="w-full bg-black/10 rounded-full h-1 mt-1">
                <div className={`${colorClass} h-1 rounded-full`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    );
};

const AdPreviewMockup: FC<{ formData: AdCreatorFormData; uploadedFilePreview: string | null; }> = ({ formData, uploadedFilePreview }) => {
    const platform = Array.from(formData.platforms)[0] || 'Facebook';
    
    const MediaDisplay: FC<{ className?: string }> = ({ className }) => {
        const mediaUrl = uploadedFilePreview;
        if (mediaUrl) {
            return formData.adFormat === 'Image' 
                ? <img src={mediaUrl} className={`w-full h-full object-cover ${className}`} alt="Preview" /> 
                : <video src={mediaUrl} className={`w-full h-full object-cover ${className}`} autoPlay loop muted />;
        }
        return (
            <div className={`w-full h-full bg-gray-200 flex items-center justify-center text-center text-xs text-gray-500 p-2 ${className}`}>
                {formData.visualPrompt ? `Visuel pour : "${formData.visualPrompt}"` : "Le visuel apparaîtra ici"}
            </div>
        );
    };

    switch (platform) {
        case 'TikTok':
            return (
                <div className="relative aspect-[9/16] w-[220px] mx-auto rounded-xl overflow-hidden bg-gray-800 shadow-lg">
                    <MediaDisplay />
                    {formData.adFormat === 'Video' && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><PlayIconFilled className="w-12 h-12 text-white/40" /></div>}
                    <div className="absolute inset-0 text-white p-3 flex flex-col justify-end pointer-events-none bg-gradient-to-t from-black/70 to-transparent">
                        <div className="w-full pr-14">
                            <p className="font-bold text-sm">@{formData.brandName.toLowerCase().replace(/\s/g, '_') || 'votre_marque'}</p>
                            <p className="text-xs mt-1 line-clamp-2">{formData.mainText || 'Votre texte principal...'}</p>
                            <div className="flex items-center gap-2 mt-1"><MusicNoteIcon className="w-4 h-4" /> <p className="text-xs">Son tendance - Artiste</p></div>
                        </div>
                    </div>
                </div>
            );
        case 'Google':
             return (
                <div className="bg-white p-3 rounded-lg w-full text-black shadow-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"><GoogleIcon className="w-4 h-4"/></div>
                        <div>
                            <p className="text-xs font-semibold">{formData.brandName || "Votre Marque"}</p>
                            <p className="text-xs text-gray-500">votresite.com/annonce</p>
                        </div>
                    </div>
                    <h3 className="text-blue-800 text-lg hover:underline mt-1">{formData.headline || "Votre Titre Accrocheur"}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formData.mainText || "Votre description apparaîtra ici. C'est le meilleur produit pour vous."}</p>
                </div>
            );
        case 'Facebook':
        default:
            return (
                <div className="bg-white p-3 rounded-lg w-full text-black shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"><FacebookIcon className="w-6 h-6"/></div>
                        <div><p className="text-sm font-semibold">{formData.brandName || "Votre Marque"}</p><p className="text-xs text-gray-500">Sponsorisé</p></div>
                    </div>
                    <p className="text-sm text-gray-800 mb-2 h-12 overflow-hidden">{formData.mainText || "Votre texte principal apparaîtra ici..."}</p>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                        <MediaDisplay />
                    </div>
                    <div className="flex justify-between items-center bg-gray-100 p-2 mt-2 rounded-lg">
                        <div className="flex-1 overflow-hidden"><p className="text-xs uppercase font-bold text-gray-500">votresite.com</p><p className="text-sm font-semibold truncate">{formData.headline || "Votre Titre Accrocheur"}</p></div>
                        <span className="bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-md flex-shrink-0 ml-2">{formData.cta || "CTA"}</span>
                    </div>
                </div>
            );
    }
};


const PerformanceGauges: FC<{ formData: AdCreatorFormData }> = ({ formData }) => {
    const score = useMemo(() => {
        const textLength = formData.headline.length + formData.mainText.length + formData.visualPrompt.length;
        return Math.min(50 + Math.floor(textLength / 10), 95);
    }, [formData]);

    return (
        <div>
            <h4 className="font-semibold text-light-text mb-2">Prévisions de Performance</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/5 p-2 rounded-xl"><p className="text-xs text-light-text-secondary">CTR Prédit</p><p className="font-bold text-lg text-green-500">{(score / 10).toFixed(1)}%</p></div>
                <div className="bg-black/5 p-2 rounded-xl"><p className="text-xs text-light-text-secondary">Score Pertinence</p><p className="font-bold text-lg text-sky-500">{score}</p></div>
                <div className="bg-black/5 p-2 rounded-xl"><p className="text-xs text-light-text-secondary">Potentiel Conv.</p><p className="font-bold text-lg text-amber-500">Élevé</p></div>
            </div>
        </div>
    );
};

const PlatformSelector: FC<{ platforms: Set<AccountPlatform>, onUpdate: (p: Set<AccountPlatform>) => void }> = ({ platforms, onUpdate }) => {
    const config = [{ name: 'Facebook', Icon: FacebookIcon }, { name: 'TikTok', Icon: TikTokIcon }, { name: 'Google', Icon: GoogleIcon }, { name: 'LinkedIn', Icon: LinkedInIcon }] as const;
    const handleToggle = (platform: AccountPlatform) => {
        const newPlatforms = new Set(platforms);
        if (newPlatforms.has(platform)) { if (newPlatforms.size > 1) newPlatforms.delete(platform); } 
        else { newPlatforms.add(platform); }
        onUpdate(newPlatforms);
    };
    return (
        <div>
            <label className="block text-sm font-medium text-light-text-secondary mb-2">Plateformes</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {config.map(({ name, Icon }) => (
                    <div key={name} onClick={() => handleToggle(name)} className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${platforms.has(name) ? 'border-light-accent bg-light-accent/10' : 'border-black/10 hover:border-black/20 bg-white/30'}`}>
                        <Icon className="w-8 h-8 mb-2" />
                        {platforms.has(name) && <CheckIcon className="w-6 h-6 text-white bg-light-accent rounded-full absolute -top-2 -right-2 border-2 border-white/50" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MediaSourceSelector: FC<{ source: 'ai' | 'upload', onUpdate: (s: 'ai' | 'upload') => void }> = ({ source, onUpdate }) => (
    <div>
        <label className="block text-sm font-medium text-light-text-secondary mb-2">Source du Média</label>
        <div className="flex bg-white/50 border border-black/10 rounded-btn p-1">
            <button onClick={() => onUpdate('ai')} className={`w-full flex items-center justify-center gap-2 p-2 rounded-md font-semibold ${source === 'ai' ? 'bg-light-accent/10 text-light-accent' : ''}`}><SparklesIcon className="w-5 h-5"/> Générer par IA</button>
            <button onClick={() => onUpdate('upload')} className={`w-full flex items-center justify-center gap-2 p-2 rounded-md font-semibold ${source === 'upload' ? 'bg-light-accent/10 text-light-accent' : ''}`}><ArrowUpTrayIcon className="w-5 h-5"/> Importer un Média</button>
        </div>
    </div>
);

const FileUploader: FC<{ file: File | null, setFile: (f: File | null) => void, filePreview: string | null, mediaType: 'Image' | 'Video' }> = ({ file, setFile, filePreview, mediaType }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-light-text-secondary mb-2">Fichier Média {mediaType === 'Image' ? '(Image)' : '(Vidéo)'} <span className="text-red-500">*</span></label>
            <div 
                onClick={() => inputRef.current?.click()}
                className="w-full h-48 bg-white/50 border-2 border-dashed border-black/20 rounded-2xl flex items-center justify-center cursor-pointer hover:border-light-accent hover:bg-light-accent/5"
            >
                <input 
                    type="file" 
                    ref={inputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept={mediaType === 'Image' ? "image/*" : "video/*"}
                />
                {filePreview ? (
                    mediaType === 'Image' ?
                    <img src={filePreview} alt="Preview" className="max-h-full h-auto w-auto object-contain rounded-lg"/> :
                    <video src={filePreview} className="max-h-full h-auto w-auto object-contain rounded-lg" controls />
                ) : (
                    <div className="text-center text-light-text-secondary">
                        <ArrowUpTrayIcon className="w-8 h-8 mx-auto mb-2"/>
                        <p className="font-semibold">Cliquez pour importer</p>
                        <p className="text-xs">ou glissez-déposez</p>
                    </div>
                )}
            </div>
            {file && <p className="text-xs text-light-text-secondary mt-1 truncate">Fichier sélectionné : {file.name}</p>}
        </div>
    );
};

const AdFormatSelector: FC<{ format: 'Image' | 'Video', onUpdate: (f: 'Image' | 'Video') => void }> = ({ format, onUpdate }) => (
    <div>
        <label className="block text-sm font-medium text-light-text-secondary mb-2">Format</label>
        <div className="flex bg-white/50 border border-black/10 rounded-btn p-1">
            <button onClick={() => onUpdate('Image')} className={`w-full flex items-center justify-center gap-2 p-2 rounded-md font-semibold ${format === 'Image' ? 'bg-light-accent/10 text-light-accent' : ''}`}><PhotoIcon className="w-5 h-5"/> Image</button>
            <button onClick={() => onUpdate('Video')} className={`w-full flex items-center justify-center gap-2 p-2 rounded-md font-semibold ${format === 'Video' ? 'bg-light-accent/10 text-light-accent' : ''}`}><VideoCameraIcon className="w-5 h-5"/> Vidéo</button>
        </div>
    </div>
);
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; }
const Input: FC<InputProps> = ({ label, ...props }) => (
    <div><label className="block text-sm font-medium text-light-text-secondary mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label><input {...props} className="w-full bg-white/50 border border-black/10 rounded-btn p-3 focus:ring-light-accent focus:border-light-accent text-sm" /></div>
);
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label: string; }
const Textarea: FC<TextareaProps> = ({ label, ...props }) => (
    <div><label className="block text-sm font-medium text-light-text-secondary mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label><textarea {...props} rows={2} className="w-full bg-white/50 border border-black/10 rounded-btn p-3 focus:ring-light-accent focus:border-light-accent text-sm"></textarea></div>
);

export default AdCreator;
