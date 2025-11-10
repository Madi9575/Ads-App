import React, { useState, useEffect, useMemo, FC } from 'react';
import * as geminiService from '../services/geminiService';
import { AnalysisHistoryItem, Toast, AnalysisReport } from '../types';
import { SearchIcon, SparklesIcon, ExclamationTriangleIcon, ArrowPathIcon } from './icons';
import Select from './common/Select';

const getFaviconUrl = (url: string) => `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;

const CompetitiveMatrix: FC<{ 
    history: AnalysisHistoryItem[]; 
    onSelect: (item: AnalysisHistoryItem) => void; 
    selectedId: string | null;
}> = ({ history, onSelect, selectedId }) => {
    
    const { avgBudget, avgCtr } = useMemo(() => {
        if (history.length === 0) return { avgBudget: 50000, avgCtr: 5 };
        const totalBudget = history.reduce((acc, item) => acc + (item.estBudget.min + item.estBudget.max) / 2, 0);
        const totalCtr = history.reduce((acc, item) => acc + item.avgCtr, 0);
        return {
            avgBudget: totalBudget / history.length,
            avgCtr: totalCtr / history.length,
        };
    }, [history]);

    const quadrants = useMemo(() => {
        const leaders: AnalysisHistoryItem[] = [];      // High budget, high CTR
        const challengers: AnalysisHistoryItem[] = [];  // Low budget, high CTR
        const spenders: AnalysisHistoryItem[] = [];     // High budget, low CTR
        const niche: AnalysisHistoryItem[] = [];        // Low budget, low CTR

        history.forEach(item => {
            const itemBudget = (item.estBudget.min + item.estBudget.max) / 2;
            if (itemBudget >= avgBudget && item.avgCtr >= avgCtr) leaders.push(item);
            else if (itemBudget < avgBudget && item.avgCtr >= avgCtr) challengers.push(item);
            else if (itemBudget >= avgBudget && item.avgCtr < avgCtr) spenders.push(item);
            else niche.push(item);
        });
        return { leaders, challengers, spenders, niche };
    }, [history, avgBudget, avgCtr]);
    
    const Quadrant: FC<{ title: string; items: AnalysisHistoryItem[]; className?: string }> = ({ title, items, className }) => (
        <div className={`p-4 relative border-black/10 ${className}`}>
            <h4 className="font-semibold text-light-text-secondary text-sm absolute top-2 left-2">{title}</h4>
            <div className="flex flex-wrap gap-3 items-center justify-center h-full">
                {items.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => onSelect(item)} 
                        title={item.competitorName}
                        className={`w-10 h-10 rounded-full bg-white p-1 transition-all duration-200 hover:scale-110 hover:shadow-lg ${selectedId === item.id ? 'ring-2 ring-light-accent ring-offset-2' : 'shadow-md'}`}
                    >
                        <img src={getFaviconUrl(item.url)} alt={item.competitorName} className="w-full h-full rounded-full" />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="relative w-full max-w-xl mx-auto aspect-square">
            <div className="absolute top-0 bottom-0 left-[-40px] w-12 flex items-center justify-center">
                <div className="transform -rotate-90 whitespace-nowrap text-xs text-light-text-secondary font-semibold tracking-wider">
                    Efficacité Créative (CTR)
                </div>
            </div>

            <div className="absolute bottom-[-40px] left-0 right-0 h-12 flex items-center justify-center">
                <div className="text-xs text-light-text-secondary font-semibold tracking-wider">
                    Investissement Publicitaire
                </div>
            </div>

            <div className="w-full h-full grid grid-cols-2 grid-rows-2 border border-black/10 rounded-2xl">
                <Quadrant title="Challengers" items={quadrants.challengers} className="border-r border-b" />
                <Quadrant title="Leaders" items={quadrants.leaders} className="border-b" />
                <Quadrant title="Acteurs de Niche" items={quadrants.niche} className="border-r" />
                <Quadrant title="Gros Dépensiers" items={quadrants.spenders} />
            </div>
        </div>
    );
};

const CompetitorBattleCard: FC<{ report: AnalysisHistoryItem }> = ({ report }) => {
    const userAverages = { ctr: 6.5, budget: 150000 };
    const budgetDiff = ((report.estBudget.min + report.estBudget.max) / 2) - userAverages.budget;
    const ctrDiff = report.avgCtr - userAverages.ctr;

    return (
        <div className="glass-card rounded-3xl p-6 animate-fade-in-up space-y-6 sticky top-8">
            <div className="flex items-center gap-4">
                <img src={getFaviconUrl(report.url)} alt={`${report.competitorName} logo`} className="w-12 h-12 rounded-lg bg-white p-1" />
                <div>
                    <h3 className="text-xl font-bold">{report.competitorName}</h3>
                    <a href={`https://${report.url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-light-accent hover:underline">{report.url}</a>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-black/5 p-3 rounded-xl"><p className="text-sm text-light-text-secondary">CTR Moyen</p><p className="text-2xl font-bold">{report.avgCtr}%</p><p className={`text-xs font-semibold ${ctrDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>{ctrDiff >= 0 ? '+' : ''}{ctrDiff.toFixed(1)}% vs vous</p></div>
                <div className="bg-black/5 p-3 rounded-xl"><p className="text-sm text-light-text-secondary">Budget Estimé</p><p className="text-2xl font-bold">~{((report.estBudget.min + report.estBudget.max) / 2 / 1000).toFixed(0)}k€</p><p className={`text-xs font-semibold ${budgetDiff >= 0 ? 'text-red-500' : 'text-green-500'}`}>{budgetDiff >= 0 ? '+' : ''}{(budgetDiff / 1000).toFixed(0)}k€ vs vous</p></div>
            </div>
            
            <div><h4 className="font-semibold text-light-text mb-3 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-amber-500"/> Avantage Concurrentiel Clé</h4><p className="text-sm bg-black/5 p-3 rounded-xl text-light-text-secondary">{report.report.strengths[0]}</p></div>
            <div><h4 className="font-semibold text-light-text mb-3 flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5 text-red-500"/> Faille Stratégique Majeure</h4><p className="text-sm bg-black/5 p-3 rounded-xl text-light-text-secondary">{report.report.opportunities[0]}</p></div>
            <div><h4 className="font-semibold text-light-text mb-3">Plan d'Action Recommandé</h4><ol className="space-y-2 text-sm text-light-text-secondary list-decimal list-inside">{report.report.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ol></div>
        </div>
    )
}

interface CompetitorsProps {
    showToast: (message: string, type?: Toast['type']) => void;
    history: AnalysisHistoryItem[];
    onAddAnalysis: (report: AnalysisReport, url: string, sector: string) => Promise<AnalysisHistoryItem | null>;
}
const Competitors: React.FC<CompetitorsProps> = ({ showToast, history, onAddAnalysis }) => {
    const [url, setUrl] = useState('');
    const [sector, setSector] = useState('E-commerce');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<AnalysisHistoryItem | null>(null);

    useEffect(() => {
        if (!selectedReport && history.length > 0) {
            setSelectedReport(history[0]);
        }
    }, [history, selectedReport]);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url || !sector) {
            showToast("Veuillez entrer une URL et un secteur.", "error");
            return;
        }
        setIsLoading(true);
        try {
            const report = await geminiService.getAdvancedCompetitorAnalysis(url, sector);
            const newHistoryItem = await onAddAnalysis(report, url, sector);

            if (newHistoryItem) {
                setSelectedReport(newHistoryItem);
                setUrl('');
                showToast("Analyse terminée avec succès !", "success");
            } else {
                throw new Error("L'enregistrement de l'analyse a échoué.");
            }
        } catch (error: any) {
            showToast(error.message || "L'analyse a échoué.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-8">
            <h2 className="text-[28px] leading-[42px] font-bold text-light-text">Matrice Stratégique Concurrentielle</h2>
            <div className="glass-card p-6 rounded-3xl relative z-10">
                <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-grow w-full"><label htmlFor="competitor-url" className="block text-sm font-medium text-light-text-secondary mb-1">URL du concurrent</label><input id="competitor-url" type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.concurrent.com" className="w-full bg-white/50 border border-black/10 rounded-btn p-3 focus:ring-light-accent focus:border-light-accent text-sm" /></div>
                     <div className="w-full sm:w-64"><Select label="Secteur d'activité" name="sector" value={sector} onChange={e => setSector(e.target.value)} options={['E-commerce', 'SaaS', 'Éducation', 'Santé', 'Finance', 'Tourisme']} /></div>
                    <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-[7px] bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 px-6 rounded-btn transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-wait">
                        {isLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin"/> : <SearchIcon className="w-6 h-6"/>} Analyser
                    </button>
                </form>
            </div>

            {history.length === 0 && !isLoading ? (
                <div className="text-center py-16 text-light-text-secondary">
                    <p className="font-semibold text-lg">Aucune analyse trouvée</p>
                    <p>Utilisez le formulaire ci-dessus pour analyser votre premier concurrent.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <CompetitiveMatrix history={history} onSelect={setSelectedReport} selectedId={selectedReport?.id || null} />
                    {selectedReport && <CompetitorBattleCard report={selectedReport} />}
                </div>
            )}
        </div>
    );
};

export default Competitors;
