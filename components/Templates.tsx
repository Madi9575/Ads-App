import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import { Template, AccountPlatform } from '../types';
import { 
    SearchIcon, XIcon, ShoppingCartIcon, RocketLaunchIcon, AcademicCapIcon, 
    HeartIcon, MagicWandIcon, CheckCircleIcon, EyeIcon, ArrowTrendingUpIcon, 
    UsersIcon, PaintBrushIcon, TargetIcon, CampaignsIcon, FilterIcon,
    FacebookIcon, TikTokIcon, GoogleIcon, InstagramIcon, LinkedInIcon, PhotoIcon, VideoCameraIcon
} from './icons';

// --- NEW MOCK DATA ---
const mockTemplates: Template[] = [
    {
        id: 'ecom001', name: 'Vente Flash 24h', description: 'Crée une urgence avec un visuel percutant pour les promotions à durée limitée.',
        category: 'E-commerce', badge: 'Populaire', icon: ShoppingCartIcon, platforms: ['Facebook', 'Instagram'],
        stats: { ctrLift: '+32%', uses: 245 },
        parameters: { style: 'Dynamique', performance: 92, objective: 'Conversions', tone: 'Urgent' },
        adCreatorSettings: {
            image: { prompt: 'Un produit high-tech sur un fond explosif de couleurs vives, avec une horloge stylisée indiquant un temps limité', style: 'Réaliste', lighting: 'Dramatique' },
            common: { headline: 'Vente Flash : -50% Pendant 24h Seulement !', description: 'Ne manquez pas notre offre exclusive. Stock limité, premiers arrivés, premiers servis. La qualité premium à moitié prix.', cta: 'Acheter maintenant' }
        }
    },
    {
        id: 'saas001', name: 'Lancement de Feature', description: 'Met en avant une nouvelle fonctionnalité avec un design épuré et orienté bénéfices.',
        category: 'SaaS', badge: 'Nouveau', icon: RocketLaunchIcon, platforms: ['LinkedIn', 'Facebook'],
        stats: { ctrLift: '+18%', uses: 78 },
        parameters: { style: 'Épuré', performance: 88, objective: 'Engagement', tone: 'Informatif' },
        adCreatorSettings: {
            video: { prompt: 'Animation motion graphics fluide montrant une interface utilisateur, un curseur clique sur un nouveau bouton et révèle une fonctionnalité impressionnante avec des icônes et des graphiques simples.', visualStyle: 'Motion Graphics' },
            common: { headline: 'Nouveau : Automatisez vos rapports !', description: 'Passez moins de temps à compiler des données et plus de temps à analyser. Découvrez notre nouvelle fonctionnalité d\'automatisation.', cta: 'Découvrir' }
        }
    },
    {
        id: 'edu001', name: 'Inscription au Cours', description: 'Un modèle inspirant pour promouvoir des cours en ligne et des formations.',
        category: 'Éducation', icon: AcademicCapIcon, platforms: ['Google', 'Facebook'],
        stats: { ctrLift: '+22%', uses: 156 },
        parameters: { style: 'Inspirant', performance: 85, objective: 'Leads', tone: 'Motivant' },
        adCreatorSettings: {
            image: { prompt: 'Une personne souriante et concentrée travaillant sur un ordinateur portable dans un café lumineux et moderne, avec des icônes de connaissance flottant autour.', style: 'Réaliste', lighting: 'Naturelle' },
            common: { headline: 'Développez vos compétences dès aujourd\'hui', description: 'Rejoignez des milliers d\'étudiants et maîtrisez de nouvelles compétences avec nos cours en ligne interactifs. Accès à vie inclus.', cta: 'S\'inscrire' }
        }
    },
    {
        id: 'health001', name: 'Consultation Bien-être', description: 'Un visuel apaisant et professionnel pour les services de santé et de bien-être.',
        category: 'Santé', badge: 'Populaire', icon: HeartIcon, platforms: ['Instagram'],
        stats: { ctrLift: '+25%', uses: 312 },
        parameters: { style: 'Apaisant', performance: 94, objective: 'Leads', tone: 'Rassurant' },
        adCreatorSettings: {
            image: { prompt: 'Une composition zen avec des pierres lisses, une orchidée et une lumière douce et diffuse, évoquant le calme et la sérénité.', style: 'Aquarelle', lighting: 'Douce' },
            common: { headline: 'Retrouvez votre équilibre intérieur', description: 'Prenez rendez-vous pour une consultation personnalisée et découvrez nos approches pour une vie plus saine et sereine.', cta: 'Réserver' }
        }
    },
    {
        id: 'tiktok001', name: 'Challenge Viral', description: 'Lancez un challenge de marque sur TikTok pour générer de l\'UGC et de la notoriété.',
        category: 'E-commerce', badge: 'Nouveau', icon: ShoppingCartIcon, platforms: ['TikTok'],
        stats: { ctrLift: '+45%', uses: 95 },
        parameters: { style: 'Authentique', performance: 95, objective: 'Notoriété', tone: 'Enthousiaste' },
        adCreatorSettings: {
            video: { prompt: 'Une vidéo filmée à la verticale, style smartphone, d\'une personne relevant un défi amusant avec un produit. Lumière naturelle, couleurs vives, musique tendance.', visualStyle: 'UGC' },
            common: { headline: 'Participez au #NotreChallenge !', description: 'Montrez-nous votre talent et tentez de gagner des cadeaux exclusifs. Utilisez notre nouveau produit pour participer.', cta: 'Voir le challenge' }
        }
    },
     {
        id: 'saas002', name: 'Webinaire B2B', description: 'Générez des leads qualifiés en invitant des professionnels à un webinaire exclusif.',
        category: 'SaaS', icon: RocketLaunchIcon, platforms: ['LinkedIn'],
        stats: { ctrLift: '+28%', uses: 189 },
        parameters: { style: 'Professionnel', performance: 91, objective: 'Leads', tone: 'Expert' },
        adCreatorSettings: {
            image: { prompt: 'Visuel professionnel avec le portrait d\'un expert, le titre du webinaire et la date. Palette de couleurs corporate, design sobre et élégant.', style: 'Graphique', lighting: 'Professionnelle' },
            common: { headline: 'Devenez un expert en 60 minutes.', description: 'Rejoignez notre webinaire gratuit pour maîtriser [Sujet]. Places limitées, réservez la vôtre dès maintenant.', cta: 'Réserver ma place' }
        }
    }
];

// --- TYPES FOR FILTERS ---
interface Filters {
    categories: Set<string>;
    objectives: Set<string>;
    formats: Set<'Image' | 'Video'>;
    platforms: Set<AccountPlatform>;
}

const initialFilters: Filters = {
    categories: new Set(),
    objectives: new Set(),
    formats: new Set(),
    platforms: new Set(),
};

const platformIcons: Record<AccountPlatform, React.ComponentType<{ className?: string }>> = {
    Facebook: FacebookIcon,
    TikTok: TikTokIcon,
    Google: GoogleIcon,
    Instagram: InstagramIcon,
    LinkedIn: LinkedInIcon,
};


// --- SUB-COMPONENTS ---

const FilterSidebar: FC<{ filters: Filters; setFilters: React.Dispatch<React.SetStateAction<Filters>>; templates: Template[] }> = ({ filters, setFilters, templates }) => {
    
    const filterOptions = useMemo(() => ({
        categories: [...new Set(templates.map(t => t.category))],
        objectives: [...new Set(templates.map(t => t.parameters.objective))],
        formats: ['Image', 'Video'] as ('Image' | 'Video')[],
        platforms: [...new Set(templates.flatMap(t => t.platforms))] as AccountPlatform[],
    }), [templates]);
    
    const handleToggle = (filterKey: keyof Filters, value: string) => {
        setFilters(prev => {
            const newSet = new Set(prev[filterKey] as Set<string>);
            if (newSet.has(value)) {
                newSet.delete(value);
            } else {
                newSet.add(value);
            }
            return { ...prev, [filterKey]: newSet };
        });
    };

    // By casting the result of Object.values, we ensure TypeScript correctly infers the types for the reduce operation,
    // which resolves the issue of the function's return type being 'unknown'.
    const countActiveFilters = () => (Object.values(filters) as Array<Set<unknown>>).reduce((acc, set) => acc + set.size, 0);

    return (
        <aside className="w-64 flex-shrink-0 glass-card rounded-3xl p-4 flex flex-col">
            <h3 className="text-lg font-bold flex items-center gap-2 px-2"><FilterIcon className="w-5 h-5"/> Filtres</h3>
            <div className="flex-1 overflow-y-auto mt-4 space-y-4">
                <FilterGroup title="Catégories">
                    {filterOptions.categories.map(cat => <Checkbox key={cat} label={cat} checked={filters.categories.has(cat)} onChange={() => handleToggle('categories', cat)} />)}
                </FilterGroup>
                <FilterGroup title="Objectifs">
                    {filterOptions.objectives.map(obj => <Checkbox key={obj} label={obj} checked={filters.objectives.has(obj)} onChange={() => handleToggle('objectives', obj)} />)}
                </FilterGroup>
                 <FilterGroup title="Plateformes">
                    {filterOptions.platforms.map(p => <Checkbox key={p} label={p} checked={filters.platforms.has(p)} onChange={() => handleToggle('platforms', p)} />)}
                </FilterGroup>
                 <FilterGroup title="Format">
                    {filterOptions.formats.map(f => <Checkbox key={f} label={f} checked={filters.formats.has(f)} onChange={() => handleToggle('formats', f)} />)}
                </FilterGroup>
            </div>
            {countActiveFilters() > 0 && (
                <button onClick={() => setFilters(initialFilters)} className="mt-4 text-sm font-semibold text-light-accent hover:underline">Réinitialiser les filtres</button>
            )}
        </aside>
    );
};

const FilterGroup: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
        <h4 className="font-semibold text-sm px-2 mb-2">{title}</h4>
        <div className="space-y-1">{children}</div>
    </div>
);

const Checkbox: FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 cursor-pointer transition-colors duration-200">
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={onChange} 
        />
        <span className={`text-sm select-none transition-colors duration-200 ${checked ? 'text-light-text font-semibold' : 'text-light-text-secondary'}`}>{label}</span>
    </label>
);

const TemplateCard: FC<{ template: Template; onPreview: () => void; }> = ({ template, onPreview }) => (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5" onClick={onPreview}>
        <div className="relative aspect-video overflow-hidden cursor-pointer">
             <img src={`https://source.unsplash.com/400x225/?${template.category},${template.parameters.style}`} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute top-3 right-3">{template.badge && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${template.badge === 'Populaire' ? 'bg-amber-500/20 text-amber-700' : 'bg-sky-500/20 text-sky-700'}`}>{template.badge}</span>}</div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                {template.platforms.map(p => { const Icon = platformIcons[p]; return <div key={p} className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full"><Icon className="w-4 h-4 text-white"/></div>; })}
            </div>
        </div>
        <div className="p-5 flex-grow flex flex-col">
             <h4 className="font-bold text-lg text-light-text">{template.name}</h4>
             <p className="text-sm text-light-text-secondary mt-1 flex-grow h-10">{template.description}</p>
             <div className="flex justify-between items-center mt-4 pt-4 border-t border-black/10 text-sm font-semibold">
                <span className="flex items-center gap-1.5 text-green-600"><ArrowTrendingUpIcon className="w-5 h-5" /> {template.stats.ctrLift}</span>
                <span className="flex items-center gap-1.5 text-light-text-secondary"><UsersIcon className="w-5 h-5" /> {template.stats.uses} Utilisations</span>
            </div>
        </div>
    </div>
);

const DeviceMockupPreview: FC<{ template: Template }> = ({ template }) => {
    const isVideo = !!template.adCreatorSettings.video;
    const platform = template.platforms[0] || 'Facebook';
    const PlatformIcon = platformIcons[platform];

    return (
         <div className="relative w-[280px] h-[580px] bg-gray-800 rounded-[40px] border-[10px] border-gray-900 shadow-2xl scale-90 mx-auto">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-gray-900 rounded-b-xl z-10"></div>
            <div className="w-full h-full bg-white overflow-hidden rounded-[30px] flex flex-col">
                <div className="p-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><PlatformIcon className="w-6 h-6"/></div>
                        <div><p className="text-sm font-semibold text-gray-800">Votre Marque</p><p className="text-xs text-gray-500">Sponsorisé</p></div>
                    </div>
                    <p className="text-sm text-gray-800 mt-2 line-clamp-2">{template.adCreatorSettings.common.description}</p>
                </div>
                <div className="flex-1 bg-gray-200">
                    {isVideo ? (
                         <video key={template.id} src={`https://videos.pexels.com/video-files/3209828/3209828-sd_640_360_25fps.mp4`} className="w-full h-full object-cover" autoPlay loop muted />
                    ) : (
                         <img src={`https://source.unsplash.com/400x400/?${template.category},${template.parameters.style}`} alt={template.name} className="w-full h-full object-cover"/>
                    )}
                </div>
                <div className="p-2 bg-gray-100 flex-shrink-0 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">votresite.com</p>
                        <p className="font-semibold text-sm line-clamp-1">{template.adCreatorSettings.common.headline}</p>
                    </div>
                    <span className="bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-md text-sm ml-2">{template.adCreatorSettings.common.cta}</span>
                </div>
            </div>
        </div>
    );
};

const TemplatePreviewModal: FC<{ template: Template; onClose: () => void; onApply: () => void; }> = ({ template, onClose, onApply }) => (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="glass-card rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            <div className="md:w-[45%] p-8 flex flex-col overflow-y-auto">
                <div>
                    <h3 className="text-2xl font-bold">{template.name}</h3>
                    <p className="text-light-text-secondary mt-2 text-sm">{template.description}</p>
                </div>
                 <div className="my-6 space-y-4 border-y border-black/10 py-6">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-light-text-secondary">ADN Stratégique</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2"><CampaignsIcon className="w-5 h-5 text-light-text-secondary"/> Objectif: <strong className="text-light-text">{template.parameters.objective}</strong></div>
                        <div className="flex items-center gap-2"><PaintBrushIcon className="w-5 h-5 text-light-text-secondary"/> Style: <strong className="text-light-text">{template.parameters.style}</strong></div>
                        <div className="flex items-center gap-2"><UsersIcon className="w-5 h-5 text-light-text-secondary"/> Ton: <strong className="text-light-text">{template.parameters.tone}</strong></div>
                        <div className="flex items-center gap-2">{!!template.adCreatorSettings.video ? <VideoCameraIcon className="w-5 h-5 text-light-text-secondary"/> : <PhotoIcon className="w-5 h-5 text-light-text-secondary"/>} Format: <strong className="text-light-text">{!!template.adCreatorSettings.video ? 'Vidéo' : 'Image'}</strong></div>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-light-text-secondary mb-2">Contenu Généré</h4>
                    <div className="space-y-3 text-sm bg-black/5 p-4 rounded-xl">
                        <p><strong>Titre:</strong> {template.adCreatorSettings.common.headline}</p>
                        <p><strong>Texte:</strong> {template.adCreatorSettings.common.description}</p>
                        <p><strong>Prompt visuel:</strong> {template.adCreatorSettings.image?.prompt || template.adCreatorSettings.video?.prompt}</p>
                    </div>
                </div>
                <div className="mt-auto pt-6">
                     <button onClick={onApply} className="w-full flex items-center justify-center bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 px-4 rounded-btn transition-all duration-300 shadow-md hover:shadow-lg">
                        <MagicWandIcon className="w-5 h-5 mr-2" /> Utiliser ce Modèle
                    </button>
                </div>
            </div>
            <div className="md:w-[55%] bg-black/5 p-8 flex items-center justify-center rounded-r-3xl"><DeviceMockupPreview template={template} /></div>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white"><XIcon className="w-6 h-6" /></button>
    </div>
);


// --- MAIN COMPONENT ---
interface TemplatesProps {
    onApplyTemplate: (settings: Template['adCreatorSettings']) => void;
    onViewExamples: (category: Template['category']) => void;
}

const Templates: FC<TemplatesProps> = ({ onApplyTemplate, onViewExamples }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const filteredTemplates = useMemo(() => {
        return mockTemplates.filter(template => {
            const searchMatch = !searchQuery || template.name.toLowerCase().includes(searchQuery.toLowerCase()) || template.description.toLowerCase().includes(searchQuery.toLowerCase());
            const categoryMatch = filters.categories.size === 0 || filters.categories.has(template.category);
            const objectiveMatch = filters.objectives.size === 0 || filters.objectives.has(template.parameters.objective);
            const format = !!template.adCreatorSettings.video ? 'Video' : 'Image';
            const formatMatch = filters.formats.size === 0 || filters.formats.has(format);
            const platformMatch = filters.platforms.size === 0 || template.platforms.some(p => filters.platforms.has(p));
            return searchMatch && categoryMatch && objectiveMatch && formatMatch && platformMatch;
        });
    }, [searchQuery, filters]);

    return (
        <div className="flex h-full p-4 sm:p-6 gap-6">
            <FilterSidebar filters={filters} setFilters={setFilters} templates={mockTemplates} />
            <main className="flex-1 flex flex-col">
                <header className="mb-6">
                    <h2 className="text-[28px] leading-[42px] font-bold text-light-text">Bibliothèque de Modèles</h2>
                    <p className="text-light-text-secondary mt-1">Le point de départ de vos campagnes les plus performantes.</p>
                    <div className="relative mt-4">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><SearchIcon className="w-5 h-5 text-light-text-secondary" /></div>
                        <input type="text" placeholder="Rechercher un modèle..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full max-w-lg glass-card py-2.5 pl-11 pr-4 focus:ring-light-accent focus:border-light-accent rounded-btn border border-black/10" />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredTemplates.map(template => (
                                <TemplateCard 
                                    key={template.id} 
                                    template={template} 
                                    onPreview={() => setSelectedTemplate(template)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-light-text-secondary">
                            <h3 className="text-xl font-semibold">Aucun modèle trouvé</h3>
                            <p>Essayez d'ajuster vos filtres ou votre recherche.</p>
                        </div>
                    )}
                </div>
            </main>
            {selectedTemplate && (
                <TemplatePreviewModal
                    template={selectedTemplate}
                    onClose={() => setSelectedTemplate(null)}
                    onApply={() => {
                        onApplyTemplate(selectedTemplate.adCreatorSettings);
                        setSelectedTemplate(null);
                    }}
                />
            )}
        </div>
    );
};

export default Templates;