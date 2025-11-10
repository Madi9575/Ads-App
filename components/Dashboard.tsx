import React, { useState, useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EyeIcon, CursorClickIcon, CheckCircleIcon, EuroIcon, RobotIcon, LightBulbIcon, UsersIcon, ArrowPathIcon, SparklesIcon, LineChartIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon } from './icons';
import { Campaign } from '../types';

// --- NEW SUB-COMPONENTS for the redesigned dashboard ---

const DailySummaryCard: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
    <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-light-accent/10 to-transparent">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-light-text flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-light-accent" />
                    Synthèse Quotidienne de l'IA
                </h3>
                <p className="text-sm text-light-text-secondary mt-1">Votre briefing stratégique pour aujourd'hui, basé sur les données d'hier.</p>
            </div>
            <button onClick={onRefresh} className="text-light-text-secondary hover:text-light-text transition-colors" title="Rafraîchir les données">
                <ArrowPathIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/5 p-4 rounded-xl">
                <p className="font-semibold text-green-600 flex items-center gap-1"><ArrowTrendingUpIcon className="w-4 h-4" /> POINT FORT</p>
                <p className="text-light-text-secondary mt-1">Le <strong>ROAS a grimpé de 18%</strong>, principalement grâce à la performance exceptionnelle de la campagne TikTok.</p>
            </div>
            <div className="bg-black/5 p-4 rounded-xl">
                <p className="font-semibold text-red-500 flex items-center gap-1"><ArrowTrendingDownIcon className="w-4 h-4" /> POINT FAIBLE</p>
                <p className="text-light-text-secondary mt-1">Les <strong>conversions globales ont chuté de 5%</strong>, tirées vers le bas par une baisse d'efficacité sur Google Ads.</p>
            </div>
            <div className="bg-black/5 p-4 rounded-xl">
                <p className="font-semibold text-light-accent flex items-center gap-1"><LightBulbIcon className="w-4 h-4" /> RECOMMANDATION CLÉ</p>
                <p className="text-light-text-secondary mt-1">Envisagez de <strong>réallouer 15% du budget Google</strong> vers la campagne TikTok 'UGC Summer' pour maximiser le retour sur investissement.</p>
            </div>
        </div>
    </div>
);

const StatButton: React.FC<{ title: string; value: string; change: number; Icon: React.ComponentType<{ className?: string }>; onClick: () => void; isActive: boolean; }> = ({ title, value, change, Icon, onClick, isActive }) => {
    const isPositive = change >= 0;
    return (
        <button onClick={onClick} className={`p-4 rounded-2xl text-left transition-all duration-300 w-full ${isActive ? 'bg-white shadow-lg' : 'bg-black/5 hover:bg-black/10'}`}>
            <div className="flex justify-between items-center">
                <p className="font-semibold text-light-text-secondary">{title}</p>
                <Icon className={`w-6 h-6 ${isActive ? 'text-light-accent' : 'text-light-text-secondary'}`} />
            </div>
            <p className="text-3xl font-extrabold text-light-text mt-2">{value}</p>
            <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />}
                <span>{Math.abs(change).toFixed(1)}% vs période préc.</span>
            </div>
        </button>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

interface DashboardProps {
    onApplyRecommendation: (type: 'budget' | 'audience', payload?: any) => void;
    onNavigateToCampaign: (campaignId: string) => void;
    onGenerateStrategy: (prompt: string) => Promise<void>;
    isGeneratingStrategy: boolean;
    campaigns: Campaign[];
}

const Dashboard: React.FC<DashboardProps> = ({ onApplyRecommendation, onNavigateToCampaign, onGenerateStrategy, isGeneratingStrategy, campaigns }) => {
    const [selectedKpi, setSelectedKpi] = useState<'spent' | 'ctr' | 'conversions'>('spent');
    
    const kpiConfig = {
        spent: { title: "Dépenses", Icon: EuroIcon, formatter: (v: number) => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }), color: '#3b82f6' },
        ctr: { title: "CTR", Icon: CursorClickIcon, formatter: (v: number) => v.toFixed(2) + '%', color: '#8b5cf6' },
        conversions: { title: "Conversions", Icon: CheckCircleIcon, formatter: (v: number) => v.toLocaleString('fr-FR'), color: '#22c55e' },
    };

    const dashboardData = useMemo(() => {
        const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
        const avgCtr = campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length : 0;

        const chartData = Array.from({ length: 7 }, (_, i) => {
            const day = i + 1;
            const values = campaigns.map(c => c.performanceHistory.find(p => p.day === day)?.value || 0);
            return {
                day,
                spent: values.reduce((sum, v) => sum + v * 10, 0),
                ctr: values.reduce((sum,v) => sum+v,0) / (values.length || 1) / 10,
                conversions: values.reduce((sum, v) => sum + Math.floor(v/5), 0)
            };
        });

        return {
            totalSpend, totalConversions, avgCtr,
            spendChange: 12.5, conversionsChange: -3.2, ctrChange: 8.1,
            chartData,
            topCampaigns: [...campaigns].sort((a, b) => b.conversions - a.conversions).slice(0, 3),
        };
    }, [campaigns]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <DailySummaryCard onRefresh={() => {}} />

            <AIPilot onGenerateStrategy={onGenerateStrategy} isGenerating={isGeneratingStrategy} />
            
            <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                     <StatButton title="Dépenses" value={kpiConfig.spent.formatter(dashboardData.totalSpend)} change={dashboardData.spendChange} Icon={EuroIcon} onClick={() => setSelectedKpi('spent')} isActive={selectedKpi === 'spent'} />
                     <StatButton title="CTR Moyen" value={kpiConfig.ctr.formatter(dashboardData.avgCtr)} change={dashboardData.ctrChange} Icon={CursorClickIcon} onClick={() => setSelectedKpi('ctr')} isActive={selectedKpi === 'ctr'} />
                     <StatButton title="Conversions" value={kpiConfig.conversions.formatter(dashboardData.totalConversions)} change={dashboardData.conversionsChange} Icon={CheckCircleIcon} onClick={() => setSelectedKpi('conversions')} isActive={selectedKpi === 'conversions'} />
                </div>
                <div className="md:col-span-3 glass-card p-6 rounded-3xl h-[400px] flex flex-col">
                    <h3 className="font-semibold text-lg">Performance Globale</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboardData.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={kpiConfig[selectedKpi].color} stopOpacity={0.8}/><stop offset="95%" stopColor={kpiConfig[selectedKpi].color} stopOpacity={0}/></linearGradient></defs>
                            <XAxis dataKey="day" tickFormatter={(v) => `Jour ${v}`} stroke="#6B7280" />
                            <YAxis stroke="#6B7280" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}/>
                            <Area type="monotone" dataKey={selectedKpi} stroke={kpiConfig[selectedKpi].color} fill="url(#colorUv)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

interface AIPilotProps {
    onGenerateStrategy: (prompt: string) => Promise<void>;
    isGenerating: boolean;
}

const AIPilot: React.FC<AIPilotProps> = ({ onGenerateStrategy, isGenerating }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isGenerating) {
            onGenerateStrategy(prompt);
        }
    };

    return (
        <div className="relative glass-card p-6 rounded-3xl overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <SparklesIcon className="w-8 h-8 text-light-accent" />
                    <div>
                        <h3 className="text-xl font-bold text-light-text">Pilote IA</h3>
                        <p className="text-sm text-light-text-secondary">Lancez votre prochaine campagne en une seule phrase.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Vendre des écouteurs sans fil haut de gamme aux jeunes professionnels."
                        className="w-full bg-white/50 border border-black/10 rounded-btn p-3 focus:ring-light-accent focus:border-light-accent text-sm flex-grow"
                        disabled={isGenerating}
                    />
                    <button type="submit" disabled={isGenerating || !prompt.trim()} className="flex-shrink-0 flex items-center justify-center gap-2 bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 px-6 rounded-btn transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-wait">
                        {isGenerating ? (
                            <ArrowPathIcon className="w-6 h-6 animate-spin" />
                        ) : (
                            <SparklesIcon className="w-6 h-6" />
                        )}
                        <span>Générer</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Dashboard;
