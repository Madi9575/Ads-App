import React, { useState, useMemo, FC, useEffect } from 'react';
import { InspirationAd, Template, InspirationFilterState, AdFormat } from '../types';
import { 
    SearchIcon, MagicWandIcon, FacebookIcon, TikTokIcon, InstagramIcon, LinkedInIcon,
    PlayIconFilled, AdjustmentsHorizontalIcon, CalendarDaysIcon, 
    VideoCameraIcon, SparklesIcon, ShoppingCartIcon, GlobeAltIcon, 
    EyeIcon, HashtagIcon, ArrowPathIcon, CurrencyDollarIcon, UsersIcon, LanguageIcon, 
    HandThumbUpIcon, ChatBubbleOvalLeftEllipsisIcon, PlayIcon, ShareIcon, DownloadIcon,
    ChevronDownIcon, XIcon, CursorClickIcon, CheckCircleIcon, LightBulbIcon, MusicNoteIcon, HeartIcon
} from './icons';

// --- MOCK DATA GENERATION ---
const generateMockAds = (platform: 'Facebook' | 'TikTok' | 'Instagram' | 'LinkedIn', count = 20): InspirationAd[] => {
    const sectors = ['E-commerce', 'SaaS', 'Éducation', 'Santé', 'Finance'];
    const headlines = [
        "L'offre que vous ne pouvez pas refuser", "Transformez votre quotidien", "Le secret des experts révélé",
        "Enfin disponible en France !", "Rejoignez des milliers de clients satisfaits", "Votre futur commence ici"
    ];
    const formats: AdFormat[] = ['Image', 'Video', 'Carousel', 'Document'];
    const objectives = ['Conversions', 'Trafic', 'Notoriété', 'Leads', 'Ventes'];
    const ctas = ['En savoir plus', 'Acheter', 'S\'inscrire', 'Télécharger', 'Obtenir un devis'];
    const countries = ['France', 'USA', 'Canada', 'UK', 'Allemagne'];
    const languages = ['Français', 'Anglais'];
    const successKeys = [
        ["Visuel coloré et accrocheur", "CTA clair et direct", "Ciblage d'audience précis"],
        ["Titre interrogatif qui suscite la curiosité", "Preuve sociale (témoignages)", "Offre à durée limitée"],
        ["Utilisation de 'vous' pour s'adresser directement", "Vidéo courte et dynamique", "Bénéfices clairement listés"]
    ];
    const insights = [
        ["Les vidéos UGC génèrent 30% plus d'engagement.", "Les publicités avec des visages humains ont un meilleur CTR.", "Un fond uni met en valeur le produit."],
        ["Les carrousels sont efficaces pour le retargeting.", "Le premier mot du titre est crucial.", "L'humour fonctionne bien sur TikTok для этого сектора."],
        ["Les questions dans le texte d'annonce augmentent les commentaires.", "Les couleurs vives attirent plus l'attention sur Facebook.", "Les démos rapides performent mieux que les longues explications."]
    ];
    
    return Array.from({ length: count }, (_, i) => {
        const sector = sectors[Math.floor(Math.random() * sectors.length)];
        const ctr = parseFloat((Math.random() * 10 + 2).toFixed(2));
        const cpa = parseFloat((Math.random() * 30 + 5).toFixed(2));
        const adFormat = formats[Math.floor(Math.random() * formats.length)];

        const ad: InspirationAd = {
            id: `${platform.toLowerCase()}-${i}`,
            platform,
            performanceBadge: ['Top', 'Viral', 'Converting'][Math.floor(Math.random() * 3)] as any,
            sector,
            ctr,
            cpa,
            roas: parseFloat((Math.random() * 8 + 2).toFixed(2)),
            conversionRate: parseFloat((Math.random() * 5 + 1).toFixed(2)),
            engagement: Math.floor(Math.random() * 10000),
            likes: Math.floor(Math.random() * 100000),
            headline: headlines[Math.floor(Math.random() * headlines.length)],
            description: "Découvrez comment notre produit innovant peut résoudre vos problèmes et améliorer votre vie. Une description engageante et persuasive qui pousse à l'action.",
            duration: Math.floor(Math.random() * 30) + 7,
            dailyBudget: Math.floor(Math.random() * 200) + 50,
            format: platform === 'LinkedIn' ? adFormat : adFormat === 'Document' ? 'Image' : adFormat,
            imageUrl: `https://picsum.photos/seed/${platform}${i}/400/400`,
            objective: objectives[Math.floor(Math.random() * objectives.length)],
            cta: ctas[Math.floor(Math.random() * ctas.length)],
            country: countries[Math.floor(Math.random() * countries.length)],
            language: languages[Math.floor(Math.random() * languages.length)],
            details: {
                audience: {
                    age: ['18-24', '25-34', '35-44'][Math.floor(Math.random() * 3)],
                    gender: ['Tous', 'Femme', 'Homme'][Math.floor(Math.random() * 3)],
                    interests: ['Technologie', 'Voyages', 'Cuisine', 'Fitness', 'Mode durable'].sort(() => 0.5 - Math.random()).slice(0, 3),
                },
                performanceHistory: Array.from({ length: 5 }, (_, k) => ({
                    date: new Date(Date.now() - k * 86400000 * 7).toISOString().split('T')[0],
                    ctr: parseFloat((Math.random() * 2 + (ctr - 1)).toFixed(2)),
                    cpa: parseFloat((Math.random() * 10 + (cpa - 5)).toFixed(2)),
                })),
                successKeys: successKeys[i % successKeys.length],
                insights: insights[i % insights.length],
            }, 
            adCreatorSettings: {
                common: {
                    headline: "Titre pré-rempli inspiré de cette publicité",
                    description: "Description pré-remplie et optimisée basée sur cette publicité performante.",
                    cta: "En savoir plus",
                }
            }
        };

        if (platform === 'TikTok') {
            ad.tiktokSpecific = {
                hasTrendingSound: Math.random() > 0.5,
                isCreatorCollab: Math.random() > 0.6
            };
        }

        return ad;
    });
};

// --- FILTER DEFINITIONS ---
const filterOptions = {
    mediaTypes: ['Image', 'Video', 'Carousel', 'Document'],
    sectors: ['E-commerce', 'SaaS', 'Éducation', 'Santé', 'Finance'],
    objectives: ['Conversions', 'Trafic', 'Notoriété', 'Leads', 'Ventes'],
    countries: ['France', 'USA', 'Canada', 'UK', 'Allemagne'],
};

const initialFilterState: InspirationFilterState = {
    search: '',
    sortBy: 'publication_date',
    mediaTypes: [],
    sectors: [],
    objectives: [],
    countries: [],
    performanceRanges: {
        ctr: { min: '', max: '' },
        cpa: { min: '', max: '' },
        roas: { min: '', max: '' },
    },
    tiktokSpecific: {
        hasTrendingSound: null,
        isCreatorCollab: null,
    },
};


// --- SUB-COMPONENTS ---

const InspirationMetricCard: FC<{ icon: React.ComponentType<{ className?: string }>, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card rounded-xl p-2 flex items-center gap-2">
        <div className={`p-1.5 rounded-md bg-${color}-500/10`}>
            <Icon className={`w-4 h-4 text-${color}-500`} />
        </div>
        <div>
            <div className="text-xs text-light-text-secondary">{label}</div>
            <div className="text-xs font-bold text-light-text">{value}</div>
        </div>
    </div>
);

const AdCard: FC<{ ad: InspirationAd; onUse: () => void; onViewDetails: () => void; }> = ({ ad, onUse, onViewDetails }) => {
    const PlatformIcon = {
        Facebook: FacebookIcon,
        TikTok: TikTokIcon,
        Instagram: InstagramIcon,
        LinkedIn: LinkedInIcon,
        Google: GlobeAltIcon,
    }[ad.platform];

    const badgeStyle = {
        'Top': 'bg-amber-500/20 text-amber-700',
        'Viral': 'bg-sky-500/20 text-sky-700',
        'Converting': 'bg-green-500/20 text-green-700'
    }[ad.performanceBadge];
    
    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative aspect-[4/3] rounded-t-2xl overflow-hidden bg-gray-200">
                <img src={ad.imageUrl} alt={ad.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {ad.format === 'Video' && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <PlayIconFilled className="w-12 h-12 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeStyle}`}>{ad.performanceBadge}</span>
                </div>
            </div>
            <div className="p-3 flex-grow flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                    {PlatformIcon && <PlatformIcon className="w-5 h-5 flex-shrink-0" />}
                    <h4 className="font-bold text-sm text-light-text truncate flex-1" title={ad.headline}>{ad.headline}</h4>
                </div>
                 <div className="grid grid-cols-2 gap-2 mb-3">
                    <InspirationMetricCard icon={CursorClickIcon} label="CTR" value={`${ad.ctr}%`} color="green" />
                    <InspirationMetricCard icon={CheckCircleIcon} label="Taux Conv." value={`${ad.conversionRate.toFixed(2)}%`} color="sky" />
                </div>
                <div className="flex items-center gap-2 mt-auto">
                    <button onClick={onUse} className="w-full flex items-center justify-center gap-2 bg-light-accent/10 hover:bg-light-accent/20 text-light-accent font-bold py-2 px-4 rounded-btn transition-colors">
                        <MagicWandIcon className="w-5 h-5" /> Utiliser
                    </button>
                     <button onClick={onViewDetails} title="Voir les détails" className="flex-shrink-0 p-2.5 bg-black/10 hover:bg-black/20 text-light-text rounded-btn transition-colors">
                        <EyeIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};


const FilterModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: InspirationFilterState) => void;
    currentFilters: InspirationFilterState;
    platform: 'meta' | 'tiktok' | 'linkedin';
}> = ({ isOpen, onClose, onApply, currentFilters, platform }) => {
    const [tempFilters, setTempFilters] = useState(currentFilters);

    useEffect(() => {
        setTempFilters(currentFilters);
    }, [currentFilters, isOpen]);

    if (!isOpen) return null;
    
    const handleArrayToggle = (key: 'mediaTypes' | 'sectors' | 'objectives' | 'countries', value: string) => {
         setTempFilters(prev => {
            const newValues = new Set(prev[key]);
            if (newValues.has(value as never)) newValues.delete(value as never);
            else newValues.add(value as never);
            return { ...prev, [key]: Array.from(newValues) };
        });
    };
    
    const handleRangeChange = (metric: 'ctr' | 'cpa' | 'roas', bound: 'min' | 'max', value: string) => {
        setTempFilters(prev => ({
            ...prev,
            performanceRanges: {
                ...prev.performanceRanges,
                [metric]: {
                    ...prev.performanceRanges[metric],
                    [bound]: value,
                }
            }
        }));
    };
    
    const handleTikTokToggle = (key: 'hasTrendingSound' | 'isCreatorCollab', value: boolean | null) => {
        setTempFilters(prev => ({
            ...prev,
            tiktokSpecific: {
                ...prev.tiktokSpecific,
                [key]: value
            }
        }));
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-card rounded-3xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-black/10 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Filtres Avancés</h3>
                    <button onClick={onClose} className="p-1 text-light-text-secondary hover:bg-black/5 rounded-md"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <FilterSection title="Performance">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <RangeInput label="CTR (%)" min={tempFilters.performanceRanges.ctr.min} max={tempFilters.performanceRanges.ctr.max} onMinChange={e => handleRangeChange('ctr', 'min', e.target.value)} onMaxChange={e => handleRangeChange('ctr', 'max', e.target.value)} />
                            <RangeInput label="CPA (€)" min={tempFilters.performanceRanges.cpa.min} max={tempFilters.performanceRanges.cpa.max} onMinChange={e => handleRangeChange('cpa', 'min', e.target.value)} onMaxChange={e => handleRangeChange('cpa', 'max', e.target.value)} />
                            <RangeInput label="ROAS" min={tempFilters.performanceRanges.roas.min} max={tempFilters.performanceRanges.roas.max} onMinChange={e => handleRangeChange('roas', 'min', e.target.value)} onMaxChange={e => handleRangeChange('roas', 'max', e.target.value)} />
                        </div>
                    </FilterSection>

                    <FilterSection title="Attributs Généraux">
                        <CheckboxGroup title="Type de Média" options={filterOptions.mediaTypes} selected={tempFilters.mediaTypes} onToggle={v => handleArrayToggle('mediaTypes', v)} />
                        <CheckboxGroup title="Secteur" options={filterOptions.sectors} selected={tempFilters.sectors} onToggle={v => handleArrayToggle('sectors', v)} />
                        <CheckboxGroup title="Objectif" options={filterOptions.objectives} selected={tempFilters.objectives} onToggle={v => handleArrayToggle('objectives', v)} />
                        <CheckboxGroup title="Pays" options={filterOptions.countries} selected={tempFilters.countries} onToggle={v => handleArrayToggle('countries', v)} />
                    </FilterSection>
                    
                    {platform === 'tiktok' && (
                        <FilterSection title="Spécifique à TikTok">
                             <TriStateToggle title="Son Tendance" value={tempFilters.tiktokSpecific.hasTrendingSound} onChange={v => handleTikTokToggle('hasTrendingSound', v)} />
                             <TriStateToggle title="Collaboration Créateur" value={tempFilters.tiktokSpecific.isCreatorCollab} onChange={v => handleTikTokToggle('isCreatorCollab', v)} />
                        </FilterSection>
                    )}

                </div>
                <div className="p-4 bg-black/5 flex justify-between items-center rounded-b-3xl">
                    <button onClick={() => setTempFilters(initialFilterState)} className="text-sm font-semibold text-light-text-secondary hover:underline">
                        Réinitialiser
                    </button>
                    <button onClick={() => { onApply(tempFilters); onClose(); }} className="bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-6 rounded-btn shadow-md">
                        Appliquer
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- FILTER UI MICRO-COMPONENTS ---
const FilterSection: FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0"><h4 className="font-semibold mb-3">{title}</h4><div className="space-y-3">{children}</div></div>
);

const CheckboxGroup: FC<{ title: string, options: string[], selected: string[], onToggle: (value: string) => void }> = ({ title, options, selected, onToggle }) => (
    <div><h5 className="text-sm font-medium text-light-text-secondary mb-2">{title}</h5><div className="flex flex-wrap gap-2">{options.map(opt => (<button key={opt} onClick={() => onToggle(opt)} className={`px-3 py-1.5 text-sm rounded-btn border ${selected.includes(opt) ? 'bg-light-accent/10 border-light-accent text-light-accent' : 'bg-black/5 border-transparent hover:border-black/10'}`}>{opt}</button>))}</div></div>
);

const RangeInput: FC<{ label: string, min: string, max: string, onMinChange: (e: any) => void, onMaxChange: (e: any) => void }> = ({ label, min, max, onMinChange, onMaxChange }) => (
    <div><label className="text-sm font-medium text-light-text-secondary mb-1 block">{label}</label><div className="flex items-center gap-2"><input type="number" placeholder="Min" value={min} onChange={onMinChange} className="w-full bg-white/80 border border-black/10 rounded-btn p-2 text-sm" /><span className="text-gray-400">–</span><input type="number" placeholder="Max" value={max} onChange={onMaxChange} className="w-full bg-white/80 border border-black/10 rounded-btn p-2 text-sm" /></div></div>
);

const TriStateToggle: FC<{ title: string, value: boolean | null, onChange: (value: boolean | null) => void }> = ({ title, value, onChange }) => (
    <div><h5 className="text-sm font-medium text-light-text-secondary mb-2">{title}</h5><div className="flex gap-2">{[{label: 'Tous', val: null}, {label: 'Oui', val: true}, {label: 'Non', val: false}].map(opt => (<button key={opt.label} onClick={() => onChange(opt.val)} className={`px-3 py-1.5 text-sm rounded-btn border ${value === opt.val ? 'bg-light-accent/10 border-light-accent text-light-accent' : 'bg-black/5 border-transparent hover:border-black/10'}`}>{opt.label}</button>))}</div></div>
);

const ActiveFilterPill: FC<{ label: string; onRemove: () => void; }> = ({ label, onRemove }) => (
    <div className="flex items-center gap-1 bg-light-accent/10 text-light-accent text-sm font-semibold px-2.5 py-1 rounded-full animate-fade-in-up">
        <span>{label}</span>
        <button onClick={onRemove} className="hover:bg-black/10 rounded-full"><XIcon className="w-4 h-4" /></button>
    </div>
);

const MetricItem: FC<{ icon: React.ComponentType<{className?: string}>, label: string, value: string | number, color?: string }> = ({ icon: Icon, label, value, color = 'light-text-secondary' }) => (
    <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${color === 'light-text-secondary' ? 'text-light-text-secondary' : `text-${color}-500`}`} />
        <span className="text-sm text-light-text-secondary">{label}:</span>
        <span className="text-sm font-semibold text-light-text">{value}</span>
    </div>
);

const AdDetailModal: FC<{ ad: InspirationAd; onClose: () => void; onUse: () => void; }> = ({ ad, onClose, onUse }) => {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-card rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-black/10 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold">Détails de la Publicité</h3>
                    <button onClick={onClose} className="p-1 text-light-text-secondary hover:bg-black/5 rounded-md"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: AD PREVIEW MOCKUP */}
                        <div className="bg-gray-200/50 p-3 rounded-2xl w-full max-w-sm mx-auto self-start flex items-center justify-center">
                           <AdPreviewMockup ad={ad} />
                        </div>
                        {/* Right Column: Data */}
                        <div className="space-y-6">
                            <div>
                                <h5 className="font-semibold mb-3 text-light-text">Performances Clés</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <MetricItem icon={CursorClickIcon} label="CTR" value={`${ad.ctr}%`} color="green" />
                                    <MetricItem icon={CheckCircleIcon} label="Taux Conv." value={`${ad.conversionRate.toFixed(2)}%`} color="sky" />
                                    <MetricItem icon={ArrowPathIcon} label="ROAS" value={`${ad.roas.toFixed(1)}x`} color="blue" />
                                    <MetricItem icon={CurrencyDollarIcon} label="CPA" value={`${ad.cpa.toFixed(2)}€`} color="amber" />
                                    <MetricItem icon={CalendarDaysIcon} label="Durée" value={`${ad.duration} jours`} />
                                    <MetricItem icon={CurrencyDollarIcon} label="Budget/jour" value={`${ad.dailyBudget}€`} />
                                    <MetricItem icon={HandThumbUpIcon} label="Likes" value={ad.likes?.toLocaleString('fr-FR')} />
                                    <MetricItem icon={UsersIcon} label="Engagement" value={ad.engagement.toLocaleString('fr-FR')} />
                                </div>
                            </div>
                            <div className="border-t border-black/10 pt-4">
                                <h5 className="font-semibold mb-3 text-light-text flex items-center gap-2"><UsersIcon className="w-5 h-5 text-light-text-secondary"/> Audience Cible</h5>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                                    <span>Âge: <span className="font-semibold">{ad.details.audience.age}</span></span>
                                    <span>Genre: <span className="font-semibold">{ad.details.audience.gender}</span></span>
                                    <div>Intérêts: {ad.details.audience.interests.map(i => <span key={i} className="bg-black/5 text-xs font-medium px-2 py-0.5 rounded-full ml-1">{i}</span>)}</div>
                                </div>
                            </div>
                            <div className="border-t border-black/10 pt-4">
                                <h5 className="font-semibold mb-3 text-light-text flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-light-text-secondary"/> Clés du Succès</h5>
                                <ul className="space-y-1 list-disc list-inside text-sm text-light-text-secondary">
                                    {ad.details.successKeys.map((key, i) => <li key={i}>{key}</li>)}
                                </ul>
                            </div>
                             <div className="border-t border-black/10 pt-4">
                                <h5 className="font-semibold mb-3 text-light-text flex items-center gap-2"><LightBulbIcon className="w-5 h-5 text-light-text-secondary"/> Enseignements</h5>
                                <ul className="space-y-1 list-disc list-inside text-sm text-light-text-secondary">
                                    {ad.details.insights.map((insight, i) => <li key={i}>{insight}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-black/5 flex justify-end gap-3 rounded-b-3xl flex-shrink-0">
                    <button onClick={onClose} className="bg-black/10 hover:bg-black/20 text-light-text font-semibold py-2 px-4 rounded-btn">Fermer</button>
                    <button onClick={onUse} className="bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-4 rounded-btn shadow-md">Utiliser ce modèle</button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
interface InspirationProps {
    onApplyTemplate: (settings: Template['adCreatorSettings']) => void;
}

const Inspiration: FC<InspirationProps> = ({ onApplyTemplate }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [ads, setAds] = useState<InspirationAd[]>([]);
    const [activeTab, setActiveTab] = useState<'meta' | 'tiktok' | 'linkedin'>('meta');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState<InspirationFilterState>(initialFilterState);
    const [adDetails, setAdDetails] = useState<InspirationAd | null>(null);
    
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            if (activeTab === 'meta') {
                setAds([...generateMockAds('Facebook', 10), ...generateMockAds('Instagram', 10)]);
            } else {
                const platformMap = { tiktok: 'TikTok', linkedin: 'LinkedIn' };
                setAds(generateMockAds(platformMap[activeTab] as any));
            }
            setFilters(initialFilterState);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const filteredAds = useMemo(() => {
        return ads
            .filter(ad => ad.headline.toLowerCase().includes(filters.search.toLowerCase()))
            .filter(ad => filters.mediaTypes.length === 0 || filters.mediaTypes.includes(ad.format))
            .filter(ad => filters.sectors.length === 0 || filters.sectors.includes(ad.sector))
            .filter(ad => filters.objectives.length === 0 || filters.objectives.includes(ad.objective))
            .filter(ad => filters.countries.length === 0 || filters.countries.includes(ad.country))
            .filter(ad => {
                const { min, max } = filters.performanceRanges.ctr;
                return (min === '' || ad.ctr >= parseFloat(min)) && (max === '' || ad.ctr <= parseFloat(max));
            })
            .filter(ad => {
                const { min, max } = filters.performanceRanges.cpa;
                return (min === '' || ad.cpa >= parseFloat(min)) && (max === '' || ad.cpa <= parseFloat(max));
            })
            .filter(ad => {
                const { min, max } = filters.performanceRanges.roas;
                return (min === '' || ad.roas >= parseFloat(min)) && (max === '' || ad.roas <= parseFloat(max));
            })
            .filter(ad => {
                if (activeTab !== 'tiktok' || !ad.tiktokSpecific) return true;
                const { hasTrendingSound, isCreatorCollab } = filters.tiktokSpecific;
                const soundMatch = hasTrendingSound === null || ad.tiktokSpecific.hasTrendingSound === hasTrendingSound;
                const collabMatch = isCreatorCollab === null || ad.tiktokSpecific.isCreatorCollab === isCreatorCollab;
                return soundMatch && collabMatch;
            });
    }, [ads, filters, activeTab]);
    
    
    const platformTabs = [
        { id: 'meta', name: 'Meta (FB & IG)', icon: FacebookIcon },
        { id: 'tiktok', name: 'TikTok', icon: TikTokIcon },
        { id: 'linkedin', name: 'LinkedIn', icon: LinkedInIcon },
    ] as const;
    
    return (
        <div className="flex flex-col h-full bg-light-bg p-4 sm:p-6">
            <header className="mb-6">
                 <h2 className="text-[28px] leading-[42px] font-bold text-light-text">Bibliothèque Publicitaire</h2>
                <p className="text-light-text-secondary mt-1">Parcourez plus de 100M+ de publicités sur Meta, TikTok et LinkedIn.</p>
                <div className="mt-6 border-b border-black/10">
                    <nav className="-mb-px flex space-x-6">
                        {platformTabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 py-3 px-1 border-b-2 font-semibold transition-colors ${activeTab === tab.id ? 'border-light-accent text-light-accent' : 'border-transparent text-light-text-secondary hover:text-light-text'}`}>
                                <tab.icon className="w-5 h-5" /><span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </header>
            
            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><SearchIcon className="w-5 h-5 text-light-text-secondary" /></div>
                    <input type="text" placeholder="Rechercher par mot-clé..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="w-full glass-card py-2.5 pl-11 pr-4 focus:ring-light-accent focus:border-light-accent rounded-btn border border-black/10" />
                </div>
                <button onClick={() => setIsFilterModalOpen(true)} className="flex-shrink-0 flex items-center gap-2 glass-card py-2.5 px-4 rounded-btn border border-black/10 hover:bg-black/5">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-light-text-secondary"/>
                    <span className="font-semibold">Filtres</span>
                </button>
            </div>

            <div className="flex items-center flex-wrap gap-2 mb-4 min-h-[32px]">
                 {/* Active Filter Pills Here */}
            </div>
            
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center"><ArrowPathIcon className="w-8 h-8 animate-spin text-light-accent" /></div>
            ) : (
                 <div className="flex-1 overflow-y-auto">
                    {filteredAds.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAds.map(ad => (<AdCard key={ad.id} ad={ad} onUse={() => onApplyTemplate(ad.adCreatorSettings)} onViewDetails={() => setAdDetails(ad)} />))}
                        </div>
                    ) : (
                         <div className="text-center py-16 text-light-text-secondary">
                            <p className="font-semibold text-lg">Aucun résultat trouvé</p>
                            <p>Essayez d'ajuster vos filtres pour de meilleurs résultats.</p>
                        </div>
                    )}
                 </div>
            )}

            <FilterModal 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={setFilters}
                currentFilters={filters}
                platform={activeTab}
            />

            {adDetails && (
                <AdDetailModal 
                    ad={adDetails} 
                    onClose={() => setAdDetails(null)} 
                    onUse={() => { 
                        onApplyTemplate(adDetails.adCreatorSettings);
                        setAdDetails(null); 
                    }} 
                />
            )}
        </div>
    );
};

const AdPreviewMockup: FC<{ ad: InspirationAd }> = ({ ad }) => {
    const PlatformIcon = {
        Facebook: FacebookIcon,
        TikTok: TikTokIcon,
        Instagram: InstagramIcon,
        LinkedIn: LinkedInIcon,
        Google: GlobeAltIcon,
    }[ad.platform];

    switch (ad.platform) {
        case 'Facebook':
            return (
                <div className="bg-white p-3 rounded-lg w-full text-black">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-black/10">{PlatformIcon && <PlatformIcon className="w-6 h-6" />}</div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{ad.sector} Company</p>
                            <p className="text-xs text-gray-500">Sponsorisé</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{ad.description}</p>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                        <img src={ad.imageUrl} alt={ad.headline} className="w-full h-full object-cover" />
                        {ad.format === 'Video' && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><PlayIconFilled className="w-12 h-12 text-white/80" /></div>}
                    </div>
                    <div className="flex justify-around items-center border-t border-gray-200 pt-2 mt-2 text-gray-600 font-semibold text-sm">
                        <div className="flex items-center gap-1"><HandThumbUpIcon className="w-5 h-5"/> J'aime</div>
                        <div className="flex items-center gap-1"><ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5"/> Commenter</div>
                        <div className="flex items-center gap-1"><ShareIcon className="w-5 h-5"/> Partager</div>
                    </div>
                </div>
            );
        case 'Instagram':
            return (
                <div className="bg-black p-2 rounded-lg w-full text-white">
                     <div className="flex items-center justify-between p-2">
                         <div className="flex items-center gap-2">
                            <img src={`https://i.pravatar.cc/40?u=${ad.id}`} alt="avatar" className="w-8 h-8 rounded-full" />
                            <p className="font-semibold text-sm">company_profile</p>
                        </div>
                        <p className="text-xl font-bold -mt-2">...</p>
                    </div>
                    <div className="relative aspect-square rounded-sm overflow-hidden bg-gray-800">
                        <img src={ad.imageUrl} alt={ad.headline} className="w-full h-full object-cover" />
                        {ad.format === 'Video' && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><PlayIconFilled className="w-12 h-12 text-white/80" /></div>}
                    </div>
                    <div className="p-2 space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <HeartIcon className="w-6 h-6"/>
                                <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6"/>
                                <ShareIcon className="w-6 h-6"/>
                            </div>
                        </div>
                        <p className="text-sm font-semibold">{ad.likes?.toLocaleString('fr-FR')} J'aime</p>
                        <p className="text-sm"><strong className="font-semibold">company_profile</strong> {ad.headline}</p>
                    </div>
                </div>
            );
        case 'TikTok':
            return (
                <div className="relative aspect-[9/16] w-[220px] mx-auto rounded-xl overflow-hidden bg-gray-800">
                    <img src={ad.imageUrl} alt={ad.headline} className="w-full h-full object-cover" />
                    {ad.format === 'Video' && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><PlayIconFilled className="w-12 h-12 text-white/40" /></div>}
                    <div className="absolute inset-0 text-white p-3 flex flex-col justify-end pointer-events-none bg-gradient-to-t from-black/70 to-transparent">
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
                            <div className="flex flex-col items-center"><img src={`https://i.pravatar.cc/40?u=${ad.id}`} alt="avatar" className="w-10 h-10 rounded-full border-2 border-white" /></div>
                            <div className="flex flex-col items-center"><HeartIcon className="w-8 h-8" /><span className="text-xs font-bold">{ad.likes ? (ad.likes / 1000).toFixed(1) + 'K' : '1.2M' }</span></div>
                            <div className="flex flex-col items-center"><ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" /><span className="text-xs font-bold">{ad.engagement ? (ad.engagement / 1000).toFixed(1) + 'K' : '4.5K'}</span></div>
                            <div className="flex flex-col items-center"><ShareIcon className="w-8 h-8" /><span className="text-xs font-bold">{'8.2K'}</span></div>
                        </div>
                        <div className="w-full pr-14">
                            <p className="font-bold text-sm">@company_profile</p>
                            <p className="text-xs mt-1 line-clamp-2">{ad.headline}</p>
                            <div className="flex items-center gap-2 mt-1"><MusicNoteIcon className="w-4 h-4" /> <p className="text-xs">Son original - company_profile</p></div>
                        </div>
                    </div>
                </div>
            );
        default: // Fallback to the original generic preview
            return (
                <div className="bg-white p-3 rounded-2xl shadow-inner w-full max-w-sm mx-auto self-start">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-black/10">
                            {PlatformIcon && <PlatformIcon className="w-6 h-6 text-gray-600" />}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{ad.sector} Company</p>
                            <p className="text-xs text-gray-500">Sponsorisé</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{ad.description}</p>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                        <img src={ad.imageUrl} alt={ad.headline} className="w-full h-full object-cover" />
                        {ad.format === 'Video' && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <PlayIconFilled className="w-12 h-12 text-white/80" />
                            </div>
                        )}
                    </div>
                    <div className="mt-2 flex justify-between items-center text-xs text-gray-500 bg-gray-100 p-2 rounded-lg">
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="uppercase font-bold tracking-wider">VOTRESITE.COM</span>
                            <span className="font-semibold text-gray-800 line-clamp-1">{ad.headline}</span>
                        </div>
                        <span className="bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-md flex-shrink-0 ml-2">En savoir plus</span>
                    </div>
                </div>
            );
    }
};

export default Inspiration;