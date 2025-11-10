import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import * as geminiService from '../services/geminiService';
import { StudioFile, Toast, AspectRatio } from '../types';
import { 
    MagicWandIcon, PhotoIcon, VideoCameraIcon, ArrowUpTrayIcon, SearchIcon, EyeIcon, PaintBrushIcon, 
    PencilIcon, ArrowPathIcon, XIcon, SparklesIcon, DownloadIcon, TrashIcon, InformationCircleIcon,
    CrownIcon, MinusIcon, PlusIcon, ChevronRightIcon,
    TemplateIcon, ListBulletIcon, CpuChipIcon, UsersIcon, GlobeAltIcon, MicrophoneIcon, MusicNoteIcon,
    AdjustmentsHorizontalIcon
} from './icons';
import Select from './common/Select';

// --- MOCK DATA FOR FILE LIBRARY ---
const mockFiles: StudioFile[] = [
    { id: '1', name: 'produit-lancement.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070', size: 2300000, tags: ['produit', 'casque', 'ecommerce'], createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', name: 'video-promo.mp4', type: 'video', url: 'https://videos.pexels.com/video-files/3214539/3214539-sd_640_360_30fps.mp4', size: 12500000, tags: ['promo', 'saas', 'interface'], createdAt: new Date(Date.now() - 172800000).toISOString() },
];

// --- MOCK DATA FOR ASSET LIBRARIES ---
const assetLibraries = {
    styles: {
        title: "Style",
        categories: ['Tout', 'Mis en avant', 'Mes styles'],
        items: [
            { name: '#inkwoven', isPremium: true, image: 'https://images.unsplash.com/photo-1599423300746-b62539958745?q=80&w=200' },
            { name: '#blurredwash', isPremium: false, image: 'https://images.unsplash.com/photo-1561336313-07d383e35d25?q=80&w=200' },
            { name: '#craftmotion', isPremium: false, image: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=200' },
            { name: '#boldposter', isPremium: true, image: 'https://images.unsplash.com/photo-1582298622410-b43527582963?q=80&w=200' },
        ]
    },
    compositions: {
        title: "Composition",
        categories: ['Tout', 'Images', 'Dessins'],
        items: [
            { name: '#lake', isPremium: false, image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=200' },
            { name: '#desert', isPremium: false, image: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=200' },
            { name: '#city', isPremium: false, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=200' },
            { name: '#woman', isPremium: true, image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200' },
        ]
    },
    effects: {
        title: "Effets",
        categories: ['Tout', 'Couleur', 'Cadrage', 'Éclairage'],
        items: [
            { name: '#earthy', isPremium: false, image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=200' },
            { name: '#b&w', isPremium: false, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&grayscale' },
            { name: '#goldglow', isPremium: true, image: 'https://images.unsplash.com/photo-1598289431512-b97b0957aff5?q=80&w=200' },
            { name: '#duotone', isPremium: false, image: 'https://images.unsplash.com/photo-1568910748152-901a89279138?q=80&w=200&duotone=000000,ff00ff' },
        ]
    },
    characters: {
        title: "Personnage",
        categories: ['Tout', 'Mes personnages'],
        items: [
            { name: '@kat', isPremium: true, image: 'https://images.unsplash.com/photo-1521146764736-56c929d59c83?q=80&w=200' },
            { name: '@helena', isPremium: false, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200' },
            { name: '@rafael', isPremium: false, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200' },
            { name: '@samuel', isPremium: false, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200' },
        ]
    },
    objects: {
        title: "Objet",
        categories: ['Tout', 'Mes objets'],
        items: [
            { name: '@orangemoka', isPremium: false, image: 'https://images.unsplash.com/photo-1580661327178-9e472719a4e8?q=80&w=200' },
            { name: '@silvercream', isPremium: false, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=200' },
            { name: '@redlipstick', isPremium: true, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=200' },
            { name: '@smartwatch', isPremium: false, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200' },
        ]
    },
    colors: {
        title: "Palette de couleurs",
        categories: ['Tout', 'Froid', 'Néon', 'Pastel', 'Vibrant', 'Chaud'],
        items: [
            { name: '#blueandyellow', isPremium: false, colors: ['#3B82F6', '#1D4ED8', '#FBBF24', '#F59E0B'] },
            { name: '#greenforest', isPremium: true, colors: ['#10B981', '#059669', '#34D399', '#A7F3D0'] },
            { name: '#electricdreams', isPremium: false, colors: ['#EC4899', '#D946EF', '#FDE047', '#38BDF8'] },
            { name: '#lavender', isPremium: false, colors: ['#A78BFA', '#8B5CF6', '#C4B5FD', '#E0E7FF'] },
        ]
    }
};

// --- MAIN COMPONENT ---
const CreativeStudio: FC<{ showToast: (message: string, type?: Toast['type']) => void }> = ({ showToast }) => {
    const [files, setFiles] = useState<StudioFile[]>([]);
    const [activeMedia, setActiveMedia] = useState<StudioFile | null>(null);
    const [latestGeneration, setLatestGeneration] = useState<StudioFile[]>([]);
    
    // State to force reset generator panel
    const [generatorKey, setGeneratorKey] = useState(Date.now());

    useEffect(() => {
        const savedFiles = localStorage.getItem('studioFiles');
        if (savedFiles) setFiles(JSON.parse(savedFiles)); else setFiles(mockFiles);
    }, []);

    useEffect(() => {
        localStorage.setItem('studioFiles', JSON.stringify(files));
    }, [files]);

    const handleFileUploaded = (uploadedFile: StudioFile) => {
        setFiles(prev => [uploadedFile, ...prev]);
        setActiveMedia(uploadedFile);
        showToast('Média importé avec succès!', 'success');
    };

    const handleFilesGenerated = (generatedFiles: StudioFile[]) => {
        setFiles(prev => [...generatedFiles, ...prev]);
        setLatestGeneration(generatedFiles);
        if (generatedFiles.length > 0) {
            setActiveMedia(generatedFiles[0]);
        }
        showToast(`${generatedFiles.length} média(s) généré(s) avec succès!`, 'success');
    };

    const handleSelectMedia = (media: StudioFile) => {
        setActiveMedia(media);
        setLatestGeneration([]); // Clear generation grid when selecting from library
    }

    return (
        <div className="flex h-full p-4 sm:p-6 gap-6">
            <LibraryPanel
                files={files}
                activeMediaId={activeMedia?.id}
                onSelectMedia={handleSelectMedia}
                onNewClick={() => {
                    setActiveMedia(null);
                    setLatestGeneration([]);
                    setGeneratorKey(Date.now());
                }}
                onFileUploaded={handleFileUploaded}
            />
            <CanvasPanel
                activeMedia={activeMedia}
                latestGeneration={latestGeneration}
                onSelectFromGrid={handleSelectMedia}
            />
            <GeneratorPanel
                key={generatorKey}
                onFilesGenerated={handleFilesGenerated}
                onFileUploaded={handleFileUploaded}
                showToast={showToast}
            />
        </div>
    );
};

// --- LAYOUT COMPONENTS ---

const LibraryPanel: FC<{
    files: StudioFile[], activeMediaId?: string | null, onSelectMedia: (f: StudioFile) => void,
    onNewClick: () => void, onFileUploaded: (f: StudioFile) => void
}> = ({ files, activeMediaId, onSelectMedia, onNewClick, onFileUploaded }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio'>('all');
    const uploadRef = useRef<HTMLInputElement>(null);

    const filteredFiles = useMemo(() => files.filter(f =>
        (filter === 'all' || f.type === filter) &&
        (f.name.toLowerCase().includes(search.toLowerCase()) || f.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    ), [files, search, filter]);
    
     const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newFile: StudioFile = {
                    id: Date.now().toString(), name: file.name,
                    type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio',
                    url: event.target?.result as string, size: file.size,
                    tags: ['upload'], createdAt: new Date().toISOString()
                };
                onFileUploaded(newFile);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    return (
        <div className="w-72 flex-shrink-0 glass-card rounded-3xl p-4 flex flex-col">
            <h3 className="font-bold text-lg px-2 mb-4">Bibliothèque</h3>
            <div className="relative mb-3">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
                <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-black/5 border border-transparent rounded-btn py-2 pl-10 pr-4 focus:bg-white focus:border-light-accent/50 outline-none" />
            </div>
            <div className="flex bg-black/5 p-1 rounded-btn mb-3">
                <button onClick={() => setFilter('all')} className={`w-full text-sm font-semibold py-1 rounded-md ${filter === 'all' ? 'bg-white shadow' : ''}`}>Tous</button>
                <button onClick={() => setFilter('image')} className={`w-full text-sm font-semibold py-1 rounded-md ${filter === 'image' ? 'bg-white shadow' : ''}`}>Images</button>
                <button onClick={() => setFilter('video')} className={`w-full text-sm font-semibold py-1 rounded-md ${filter === 'video' ? 'bg-white shadow' : ''}`}>Vidéos</button>
                <button onClick={() => setFilter('audio')} className={`w-full text-sm font-semibold py-1 rounded-md ${filter === 'audio' ? 'bg-white shadow' : ''}`}>Audios</button>
            </div>
            <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                <div className="grid grid-cols-2 gap-3">
                    {filteredFiles.map(f => (
                        <div key={f.id} onClick={() => onSelectMedia(f)} className={`relative rounded-xl aspect-square overflow-hidden cursor-pointer group border-2 ${activeMediaId === f.id ? 'border-light-accent' : 'border-transparent'}`}>
                            {f.type === 'image' && <img src={f.url} className="w-full h-full object-cover" />}
                            {f.type === 'video' && <video src={f.url} className="w-full h-full object-cover" />}
                            {f.type === 'audio' && <div className="w-full h-full bg-gray-200 flex items-center justify-center"><MusicNoteIcon className="w-8 h-8 text-gray-500" /></div>}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs font-semibold truncate">{f.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <div className="flex gap-2 pt-3 border-t border-black/10 mt-3">
                <button onClick={onNewClick} className="w-full flex items-center justify-center gap-2 bg-black/10 hover:bg-black/20 font-bold py-2 px-4 rounded-btn"><SparklesIcon className="w-5 h-5" /> Nouveau</button>
                <button onClick={() => uploadRef.current?.click()} className="flex-shrink-0 p-2 bg-black/10 hover:bg-black/20 rounded-btn"><ArrowUpTrayIcon className="w-5 h-5" /></button>
                <input ref={uploadRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,audio/*"/>
            </div>
        </div>
    );
};

const CanvasPanel: FC<{ activeMedia: StudioFile | null, latestGeneration: StudioFile[], onSelectFromGrid: (f: StudioFile) => void }> = ({ activeMedia, latestGeneration, onSelectFromGrid }) => {
    
    if (latestGeneration.length > 0) {
        return (
            <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col items-center justify-center">
                 <h3 className="font-bold text-lg text-light-text mb-4">Résultats de la génération</h3>
                 <div className={`grid gap-4 w-full h-full ${latestGeneration.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {latestGeneration.map(file => (
                        <div key={file.id} className="relative group cursor-pointer" onClick={() => onSelectFromGrid(file)}>
                             {file.type === 'image' ? (
                                <img src={file.url} className="w-full h-full object-contain rounded-xl" />
                            ) : (
                                <video src={file.url} className="w-full h-full object-contain rounded-xl" muted autoPlay loop />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                <EyeIcon className="w-10 h-10 text-white"/>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        );
    }
    
    if (!activeMedia) {
        return (
            <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                <PaintBrushIcon className="w-16 h-16 text-light-text-secondary mb-4" />
                <h3 className="text-2xl font-bold">Bienvenue au Studio Créatif</h3>
                <p className="text-light-text-secondary">Générez un nouveau média ou sélectionnez un fichier pour commencer.</p>
            </div>
        );
    }
    
    return (
        <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col items-center justify-center">
            <div className="w-full h-full max-h-[80vh] flex items-center justify-center">
                 {activeMedia.type === 'image' && <img src={activeMedia.url} className="max-w-full max-h-full object-contain rounded-xl" />}
                 {activeMedia.type === 'video' && <video src={activeMedia.url} className="max-w-full max-h-full object-contain rounded-xl" controls autoPlay loop muted />}
                 {activeMedia.type === 'audio' && <audio src={activeMedia.url} controls autoPlay className="max-w-full rounded-xl" />}
            </div>
        </div>
    );
}

const GeneratorPanel: FC<{
    onFilesGenerated: (files: StudioFile[]) => void;
    onFileUploaded: (file: StudioFile) => void;
    showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}> = ({ onFilesGenerated, onFileUploaded, showToast }) => {

    const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>('image');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = async (finalPrompt: string, settings: any) => {
        setIsLoading(true);
        try {
            if (!finalPrompt) { showToast("Veuillez entrer un prompt.", 'error'); return; }

            if (settings.type === 'image') {
                const urls = await geminiService.generateImage(finalPrompt, settings.aspectRatio, settings.numImages);
                const files: StudioFile[] = urls.map((url, i) => ({
                    id: `${Date.now()}-${i}`, name: `gen-${finalPrompt.slice(0, 15)}-${i}.jpg`, type: 'image', url, size: 0,
                    tags: ['ia', 'généré', finalPrompt.split(' ')[0]], createdAt: new Date().toISOString()
                }));
                onFilesGenerated(files);
            } else if (settings.type === 'video') {
                if (window.aistudio && !settings.hasApiKey) {
                    try { await window.aistudio.openSelectKey(); settings.setHasApiKey(true); } 
                    catch (e) { showToast("La sélection de la clé API est requise pour la génération de vidéo.", 'error'); setIsLoading(false); return; }
                }
                showToast('La génération de la vidéo peut prendre plusieurs minutes...', 'info');
                const url = await geminiService.generateVideo(finalPrompt, settings.aspectRatio, settings.videoStartImage || undefined);
                onFilesGenerated([{ id: `${Date.now()}-0`, name: `vid-gen-${finalPrompt.slice(0, 15)}.mp4`, type: 'video', url, size: 0, tags: ['ia', 'généré', 'vidéo'], createdAt: new Date().toISOString() }]);
            } else if (settings.type === 'audio') {
                const url = await geminiService.generateSpeech(finalPrompt, settings.voiceName);
                onFilesGenerated([{ id: `${Date.now()}-0`, name: `aud-gen-${finalPrompt.slice(0, 15)}.wav`, type: 'audio', url, size: 0, tags: ['ia', 'généré', 'audio'], createdAt: new Date().toISOString() }]);
            }
        } catch (e: any) {
            let errorMessage = e.message || "La génération a échoué. Veuillez réessayer.";
            if (e.message?.includes('Requested entity was not found')) {
                errorMessage = "Clé API non valide pour la vidéo. Veuillez en sélectionner une autre. Documentation: ai.google.dev/gemini-api/docs/billing.";
                settings.setHasApiKey(false);
            }
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="w-96 flex-shrink-0 glass-card rounded-3xl p-4 flex flex-col">
            <h3 className="font-bold text-lg px-2 mb-4">Générateur Média IA</h3>
            <div className="flex bg-black/5 p-1 rounded-btn mb-3">
                <button onClick={() => setMediaType('image')} className={`w-full text-sm font-semibold py-1.5 rounded-md flex items-center justify-center gap-2 ${mediaType === 'image' ? 'bg-white shadow' : ''}`}><PhotoIcon className="w-5 h-5"/> Image</button>
                <button onClick={() => setMediaType('video')} className={`w-full text-sm font-semibold py-1.5 rounded-md flex items-center justify-center gap-2 ${mediaType === 'video' ? 'bg-white shadow' : ''}`}><VideoCameraIcon className="w-5 h-5"/> Vidéo</button>
                <button onClick={() => setMediaType('audio')} className={`w-full text-sm font-semibold py-1.5 rounded-md flex items-center justify-center gap-2 ${mediaType === 'audio' ? 'bg-white shadow' : ''}`}><MicrophoneIcon className="w-5 h-5"/> Audio</button>
            </div>
            {mediaType === 'image' && <ImageGeneratorPanel onGenerate={handleGenerate} onFileUploaded={onFileUploaded} isLoading={isLoading} />}
            {mediaType === 'video' && <VideoGeneratorPanel onGenerate={handleGenerate} isLoading={isLoading} />}
            {mediaType === 'audio' && <AudioGeneratorPanel onGenerate={handleGenerate} isLoading={isLoading} />}
        </div>
    );
};

// --- PANELS FOR EACH MEDIA TYPE ---

const ImageGeneratorPanel: FC<{ onGenerate: (p: string, s: any) => void, onFileUploaded: (f: StudioFile) => void, isLoading: boolean }> = ({ onGenerate, onFileUploaded, isLoading }) => {
    const [source, setSource] = useState<'ai' | 'freepik'>('ai');

    return (
         <div className="flex flex-col flex-1 min-h-0">
             <div className="flex bg-black/5 p-1 rounded-btn mb-3">
                <button onClick={() => setSource('ai')} className={`w-full text-sm font-semibold py-1 rounded-md ${source === 'ai' ? 'bg-white shadow' : ''}`}>Générateur IA</button>
                <button onClick={() => setSource('freepik')} className={`w-full text-sm font-semibold py-1 rounded-md ${source === 'freepik' ? 'bg-white shadow' : ''}`}>Bibliothèque Freepik</button>
            </div>
            {source === 'ai' ? <AIImageGenerator onGenerate={onGenerate} isLoading={isLoading} /> : <FreepikBrowser onFileUploaded={onFileUploaded} />}
         </div>
    );
}

const assetIcons = {
    styles: PaintBrushIcon,
    compositions: TemplateIcon,
    effects: SparklesIcon,
    characters: UsersIcon,
    objects: CpuChipIcon,
    colors: AdjustmentsHorizontalIcon,
};

const AIImageGenerator: FC<{ onGenerate: (p: string, s: any) => void, isLoading: boolean }> = ({ onGenerate, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const [numImages, setNumImages] = useState(1);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [modalOpenFor, setModalOpenFor] = useState<keyof typeof assetLibraries | null>(null);
    const [selections, setSelections] = useState<Record<string, string | null>>({ styles: null, compositions: null, effects: null, characters: null, objects: null, colors: null });
    
    const handleSelection = (type: string, value: string) => {
        setSelections(prev => ({ ...prev, [type]: value }));
        setModalOpenFor(null);
    }
    
    const SelectionButton: FC<{type: keyof typeof assetLibraries}> = ({ type }) => {
        const Icon = assetIcons[type];
        return (
            <button onClick={() => setModalOpenFor(type)} className="w-full flex items-center justify-between p-3 bg-black/5 hover:bg-black/10 rounded-btn text-left">
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-light-text-secondary"/>
                    <span className="font-semibold text-sm">{assetLibraries[type].title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-light-accent font-semibold truncate max-w-[100px]">{selections[type]}</span>
                    <ChevronRightIcon className="w-5 h-5 text-light-text-secondary"/>
                </div>
            </button>
        )
    }

    const handleLocalGenerate = () => {
        const appendages = Object.values(selections).filter(v => v).join(', ');
        const finalPrompt = `${prompt}${appendages ? ', ' + appendages : ''}`;
        onGenerate(finalPrompt, { type: 'image', numImages, aspectRatio });
    }

    return (
        <>
            {modalOpenFor && <AssetModal {...assetLibraries[modalOpenFor]} onSelect={(value) => handleSelection(modalOpenFor, value)} onClose={() => setModalOpenFor(null)} />}
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 -mr-4 pl-1">
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder="Décrivez votre image..." className="w-full bg-black/5 border border-transparent rounded-xl p-3 focus:bg-white focus:border-light-accent/50 outline-none" />
                <SelectionButton type="styles" />
                <SelectionButton type="compositions" />
                <SelectionButton type="effects" />
            </div>
             <div className="pt-3 border-t border-black/10 mt-3 space-y-3">
                <div className="flex items-center justify-between p-2 bg-black/5 rounded-btn">
                    <span className="font-semibold text-sm pl-2">Images</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setNumImages(p => Math.max(1, p-1))} className="p-2 rounded-md hover:bg-black/10"><MinusIcon className="w-5 h-5"/></button>
                        <span className="font-bold w-4 text-center">{numImages}</span>
                        <button onClick={() => setNumImages(p => Math.min(4, p+1))} className="p-2 rounded-md hover:bg-black/10"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                </div>
                <Select label="" name="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} options={['1:1', '16:9', '9:16', '4:3', '3:4']} direction="up" />
                <button onClick={handleLocalGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 px-4 rounded-btn transition-colors shadow-md disabled:bg-gray-400">
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />} Générer
                </button>
            </div>
        </>
    )
}

const FreepikBrowser: FC<{ onFileUploaded: (f: StudioFile) => void }> = ({ onFileUploaded }) => {
    const [query, setQuery] = useState('');
    const mockResults = useMemo(() => [
        { id: 'fp1', url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=400', name: 'developer_desk.jpg' },
        { id: 'fp2', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400', name: 'team_collaboration.jpg' },
        { id: 'fp3', url: 'https://images.unsplash.com/photo-1556740738-b6a63e2775df?q=80&w=400', name: 'payment_process.jpg' },
        { id: 'fp4', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400', name: 'modern_laptop.jpg' },
    ], []);

    const handleImport = (url: string, name: string) => {
        const newFile: StudioFile = {
            id: `freepik-${Date.now()}`, name, type: 'image', url, size: 0,
            tags: ['freepik', 'import', query], createdAt: new Date().toISOString()
        };
        onFileUploaded(newFile);
    }
    
    return (
        <div className="flex flex-col flex-1 min-h-0">
             <div className="relative mb-3">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
                <input type="text" placeholder="Rechercher sur Freepik..." value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-black/5 border border-transparent rounded-btn py-2 pl-10 pr-4 focus:bg-white focus:border-light-accent/50 outline-none" />
            </div>
            {query && (
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-4 pl-1">
                    <p className="text-xs text-light-text-secondary">Résultats simulés pour "{query}"</p>
                    <div className="grid grid-cols-2 gap-2">
                        {mockResults.map(res => (
                            <div key={res.id} className="relative aspect-square group">
                                <img src={res.url} className="w-full h-full object-cover rounded-lg" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                    <button onClick={() => handleImport(res.url, res.name)} className="bg-light-accent text-white text-xs font-bold py-1 px-3 rounded-full">Importer</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const VideoGeneratorPanel: FC<{ onGenerate: (p: string, s: any) => void, isLoading: boolean }> = ({ onGenerate, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [videoStartImage, setVideoStartImage] = useState<File | null>(null);
    const [videoStartImagePreview, setVideoStartImagePreview] = useState<string | null>(null);
    const [hasApiKey, setHasApiKey] = useState(false);

    useEffect(() => {
        const checkKey = async () => { if (window.aistudio) setHasApiKey(await window.aistudio.hasSelectedApiKey()); };
        checkKey();
    }, []);

    useEffect(() => {
        if (!videoStartImage) { setVideoStartImagePreview(null); return; }
        const objectUrl = URL.createObjectURL(videoStartImage);
        setVideoStartImagePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [videoStartImage]);

    const handleLocalGenerate = () => {
        onGenerate(prompt, { type: 'video', aspectRatio, videoStartImage, hasApiKey, setHasApiKey });
    }

    return (
        <>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 -mr-4 pl-1">
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder="Décrivez votre vidéo..." className="w-full bg-black/5 border border-transparent rounded-xl p-3 focus:bg-white focus:border-light-accent/50 outline-none" />
                <FileUploader label="Image de départ (optionnel)" file={videoStartImage} setFile={setVideoStartImage} filePreview={videoStartImagePreview} />
            </div>
            <div className="pt-3 border-t border-black/10 mt-3 space-y-3">
                <Select label="Format Vidéo" name="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} options={['16:9', '9:16']} direction="up" />
                <button onClick={handleLocalGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 px-4 rounded-btn transition-colors shadow-md disabled:bg-gray-400">
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />} Générer
                </button>
            </div>
        </>
    )
}

const voiceCatalog = [
    {
        category: 'Femme',
        voices: [
            { name: 'Aura', apiName: 'Zephyr', description: 'Apaisante et sereine' },
            { name: 'Lyra', apiName: 'Kore', description: 'Chaude et amicale' },
            { name: 'Nova', apiName: 'Nova', description: 'Vive et énergique' },
        ]
    },
    {
        category: 'Homme',
        voices: [
            { name: 'Orion', apiName: 'Puck', description: 'Clair et engageante' },
            { name: 'Atlas', apiName: 'Fenrir', description: 'Grave et puissante' },
            { name: 'Onyx', apiName: 'Onyx', description: 'Sombre et intense' },
            { name: 'Sirius', apiName: 'Charon', description: 'Mystérieux et profond' },
        ]
    },
    {
        category: 'Personnages & Styles',
        voices: [
            { name: 'Jeune Fille', apiName: 'Kore', description: 'Pétillante', stylePrefix: 'Parlez avec une voix aiguë et pétillante de jeune fille : ' },
            { name: 'Jeune Garçon', apiName: 'Puck', description: 'Enjoué', stylePrefix: 'Parlez avec une voix enjouée de jeune garçon : ' },
            { name: 'Personne Âgée', apiName: 'Fenrir', description: 'Sage', stylePrefix: 'Parlez avec une voix sage et posée de personne âgée : ' },
            { name: 'Voix de Dessin Animé', apiName: 'Puck', description: 'Amicale', stylePrefix: 'Parlez avec une voix exagérée et amicale de personnage de dessin animé : ' },
            { name: 'Voix d\'Anime', apiName: 'Nova', description: 'Énergique', stylePrefix: 'Parlez avec une voix énergique et expressive d\'héroïne d\'anime : ' }
        ]
    }
];

const AudioGeneratorPanel: FC<{ onGenerate: (p: string, s: any) => void, isLoading: boolean }> = ({ onGenerate, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(voiceCatalog[0].category);
    
    const defaultVoice = voiceCatalog[0].voices[0];
    const [selectedVoice, setSelectedVoice] = useState(defaultVoice);

    const handleLocalGenerate = () => {
        const finalPrompt = selectedVoice.stylePrefix ? `${selectedVoice.stylePrefix}${prompt}` : prompt;
        onGenerate(finalPrompt, { type: 'audio', voiceName: selectedVoice.apiName });
    }

    const currentVoices = useMemo(() => {
        return voiceCatalog.find(cat => cat.category === selectedCategory)?.voices || []
    }, [selectedCategory]);

    useEffect(() => {
        if (currentVoices.length > 0) {
            setSelectedVoice(currentVoices[0]);
        }
    }, [currentVoices]);

    return (
        <>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 -mr-4 pl-1">
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={8} placeholder="Saisissez votre script ici..." className="w-full bg-black/5 border border-transparent rounded-xl p-3 focus:bg-white focus:border-light-accent/50 outline-none" />
                
                <Select 
                    label="Catégorie de Voix"
                    name="voiceCategory"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    options={voiceCatalog.map(cat => cat.category)}
                />

                <div>
                    <label className="text-sm font-semibold text-light-text-secondary px-1">Voix</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        {currentVoices.map(v => (
                            <button 
                                key={v.name} 
                                onClick={() => setSelectedVoice(v)} 
                                className={`p-2 rounded-lg text-left transition-colors ${v.name === selectedVoice.name ? 'bg-light-accent/10 ring-2 ring-light-accent/50' : 'bg-black/5 hover:bg-black/10'}`}
                            >
                                <p className="font-semibold text-sm">{v.name}</p>
                                <p className="text-xs text-light-text-secondary">{v.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
             <div className="pt-3 border-t border-black/10 mt-3">
                 <button onClick={handleLocalGenerate} disabled={isLoading || !prompt} className="w-full flex items-center justify-center gap-2 bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 px-4 rounded-btn transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />} Générer l'Audio
                </button>
            </div>
        </>
    );
}


// --- UI MICRO-COMPONENTS ---
const FileUploader: FC<{ label: string, file: File | null, setFile: (f: File | null) => void, filePreview: string | null }> = ({ label, file, setFile, filePreview }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div>
            <label className="text-sm font-semibold text-light-text-secondary px-1">{label}</label>
            <div onClick={() => inputRef.current?.click()} className={`mt-1 h-24 w-full rounded-xl bg-black/5 flex items-center justify-center cursor-pointer border-2 border-dashed ${file ? 'border-light-accent/50' : 'border-transparent hover:border-black/20'}`}>
                <input type="file" ref={inputRef} onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="hidden" accept="image/*" />
                {filePreview ? (
                    <img src={filePreview} className="h-full w-auto object-contain p-1" />
                ) : (
                    <div className="text-center text-light-text-secondary text-xs"><ArrowUpTrayIcon className="w-6 h-6 mx-auto mb-1"/><p>Importer une image</p></div>
                )}
            </div>
            {file && <p className="text-xs text-light-text-secondary mt-1 truncate px-1">Fichier: {file.name}</p>}
        </div>
    );
}

const AssetModal: FC<{ title: string, categories: string[], items: any[], onSelect: (value: string) => void, onClose: () => void }> = ({ title, categories, items, onSelect, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20 flex items-center justify-center" onClick={onClose}>
            <div className="glass-card rounded-3xl w-[450px] h-[500px] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-black/10 flex justify-between items-center">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10"><XIcon className="w-6 h-6"/></button>
                </div>
                {/* Categories would go here */}
                <div className="flex-1 p-4 overflow-y-auto">
                     <div className="grid grid-cols-4 gap-3">
                        {items.map(item => (
                            <div key={item.name} onClick={() => onSelect(item.name)} className="relative aspect-square cursor-pointer group">
                                {item.colors ? (
                                    <div className="w-full h-full rounded-lg overflow-hidden grid grid-cols-2">{item.colors.map((c: string) => <div key={c} style={{backgroundColor: c}}></div>)}</div>
                                ) : (
                                    <img src={item.image} className="w-full h-full object-cover rounded-lg" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-end p-1.5 transition-opacity rounded-lg">
                                    <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                                </div>
                                {item.isPremium && <CrownIcon className="absolute top-1 right-1 text-amber-400" />}
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    )
}

export default CreativeStudio;