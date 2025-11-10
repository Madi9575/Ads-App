import React, { useState, useEffect, useMemo, FC, useRef } from 'react';
import { AreaChart, Area, ComposedChart, Line, Bar, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, BarChart } from 'recharts';
import { FilterIcon, CalendarDaysIcon, ComputerDesktopIcon, FlagIcon, ArrowPathIcon, CpuChipIcon, LightBulbIcon, CheckCircleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, SparklesIcon, EuroIcon, CursorClickIcon, LineChartIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, XIcon, SearchIcon, DevicePhoneMobileIcon, GlobeAltIcon } from './icons';
import { AnalyticsFilter, AIAnalyticsInsight, Toast, AccountPlatform } from '../types';
import * as geminiService from '../services/geminiService';
import Select from './common/Select';

// --- TYPE DEFINITIONS ---
type DeviceType = 'Mobile' | 'Desktop' | 'Tablet';
interface AnalyticsDataPoint {
    id: number;
    date: string;
    platform: AccountPlatform;
    adName: string;
    campaignId: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number; // For ROAS
    ctr: number;
    device: DeviceType;
    country: string;
}
type KpiKey = 'spend' | 'roas' | 'cpa' | 'conversions' | 'ctr';

interface FilterState {
    period: string;
    platforms: string[];
    campaignIds: string[];
    devices: string[];
    countries: string[];
    adName: string;
    roas: { min: string; max: string };
    cpa: { min: string; max: string };
    ctr: { min: string; max: string };
}

// --- MOCK DATA GENERATION ---
const platforms: AccountPlatform[] = ['Facebook', 'Google', 'TikTok', 'Instagram', 'LinkedIn'];
const devices: DeviceType[] = ['Mobile', 'Desktop', 'Tablet'];
const countries = ['France', 'USA', 'Canada', 'Allemagne', 'UK'];
const generateMockData = (): AnalyticsDataPoint[] => {
    const data: AnalyticsDataPoint[] = [];
    const ads = [ { name: 'Promo flash', campaignId: 'fb001' }, { name: 'Nouvelle collection', campaignId: 'ig001' }, { name: 'Vidéo tutoriel', campaignId: 'tk001' }, { name: 'Search Campaign Q3', campaignId: 'gg001'}];
    let idCounter = 0;
    for (let i = 365; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        for (let j = 0; j < Math.floor(Math.random() * 4) + 2; j++) {
            const platform = platforms[Math.floor(Math.random() * platforms.length)];
            const ad = ads[Math.floor(Math.random() * ads.length)];
            const spend = Math.random() * 200 + 50;
            const conversions = Math.floor(spend / (Math.random() * 20 + 15));
            const clicks = conversions * (Math.random() * 10 + 10);
            const impressions = clicks * (Math.random() * 20 + 20);
            const revenue = spend * (Math.random() * 5 + 1.5);
            data.push({ id: idCounter++, date: dateString, platform, adName: ad.name, campaignId: ad.campaignId, spend, impressions, clicks, conversions, revenue, ctr: impressions > 0 ? (clicks / impressions) * 100 : 0, device: devices[Math.floor(Math.random() * devices.length)], country: countries[Math.floor(Math.random() * countries.length)] });
        }
    }
    return data;
};

// --- HELPER FUNCTIONS & CONFIG ---
const getPeriodDates = (period: string) => {
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    switch (period) {
        case '7d': startDate.setDate(now.getDate() - 7); prevStartDate.setDate(now.getDate() - 14); break;
        case '30d': startDate.setDate(now.getDate() - 30); prevStartDate.setDate(now.getDate() - 60); break;
        case '6m': startDate.setMonth(now.getMonth() - 6); prevStartDate.setMonth(now.getMonth() - 12); break;
        case '3m': default: startDate.setMonth(now.getMonth() - 3); prevStartDate.setMonth(now.getMonth() - 6); break;
    }
    return { current: { start: startDate, end: now }, previous: { start: prevStartDate, end: startDate }};
};
const kpiConfig: Record<KpiKey, { title: string; Icon: React.ComponentType<{ className?: string }>; formatter: (v: number) => string; color: string }> = {
    spend: { title: "Dépenses", Icon: EuroIcon, formatter: v => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }), color: '#3b82f6' },
    roas: { title: "ROAS", Icon: LineChartIcon, formatter: v => v.toFixed(2) + 'x', color: '#10b981' },
    cpa: { title: "CPA", Icon: CursorClickIcon, formatter: v => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), color: '#f59e0b' },
    conversions: { title: "Conversions", Icon: CheckCircleIcon, formatter: v => v.toLocaleString('fr-FR'), color: '#8b5cf6' },
    ctr: { title: "CTR", Icon: CursorClickIcon, formatter: v => v.toFixed(2) + '%', color: '#ec4899' },
};
const initialFilters: FilterState = {
    period: '3m', platforms: [], campaignIds: [], devices: [], countries: [],
    adName: '', roas: { min: '', max: '' }, cpa: { min: '', max: '' }, ctr: { min: '', max: '' },
};

// --- ANALYTICS PROPS ---
interface AnalyticsProps {
    initialFilter: AnalyticsFilter | null;
    setInitialFilter: (filter: AnalyticsFilter | null) => void;
    showToast: (message: string, type?: Toast['type']) => void;
}

// --- MAIN COMPONENT ---
export const Analytics: FC<AnalyticsProps> = ({ initialFilter, setInitialFilter, showToast }) => {
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [tempFilters, setTempFilters] = useState<FilterState>(initialFilters);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [selectedKpi, setSelectedKpi] = useState<KpiKey>('roas');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiInsight, setAiInsight] = useState<AIAnalyticsInsight | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const masterData = useMemo(() => generateMockData(), []);
    
    useEffect(() => {
        if (initialFilter?.campaignId) {
            const newCampaignIds = [initialFilter.campaignId];
            setFilters(f => ({ ...f, campaignIds: newCampaignIds }));
            setTempFilters(f => ({ ...f, campaignIds: newCampaignIds }));
            setInitialFilter(null);
        }
    }, [initialFilter, setInitialFilter]);

    const { currentData, previousData, dateRanges } = useMemo(() => {
        const dates = getPeriodDates(filters.period);
        const filterFn = (data: AnalyticsDataPoint[], range: { start: Date, end: Date }) => data.filter(d => {
            const recordDate = new Date(d.date);
            if (recordDate < range.start || recordDate > range.end) return false;
            if (filters.platforms.length > 0 && !filters.platforms.includes(d.platform)) return false;
            if (filters.campaignIds.length > 0 && !filters.campaignIds.includes(d.campaignId)) return false;
            if (filters.devices.length > 0 && !filters.devices.includes(d.device)) return false;
            if (filters.countries.length > 0 && !filters.countries.includes(d.country)) return false;
            if (filters.adName && !d.adName.toLowerCase().includes(filters.adName.toLowerCase())) return false;
            
            const roas = d.spend > 0 ? d.revenue / d.spend : 0;
            const cpa = d.conversions > 0 ? d.spend / d.conversions : 0;
            
            if (filters.roas.min && roas < parseFloat(filters.roas.min)) return false;
            if (filters.roas.max && roas > parseFloat(filters.roas.max)) return false;
            if (filters.cpa.min && cpa < parseFloat(filters.cpa.min)) return false;
            if (filters.cpa.max && cpa > parseFloat(filters.cpa.max)) return false;
            if (filters.ctr.min && d.ctr < parseFloat(filters.ctr.min)) return false;
            if (filters.ctr.max && d.ctr > parseFloat(filters.ctr.max)) return false;

            return true;
        });
        return { currentData: filterFn(masterData, dates.current), previousData: filterFn(masterData, dates.previous), dateRanges: dates };
    }, [filters, masterData]);

    const calculateMetrics = (data: AnalyticsDataPoint[]) => {
        const spend = data.reduce((acc, d) => acc + d.spend, 0);
        const revenue = data.reduce((acc, d) => acc + d.revenue, 0);
        const conversions = data.reduce((acc, d) => acc + d.conversions, 0);
        const clicks = data.reduce((acc, d) => acc + d.clicks, 0);
        const impressions = data.reduce((acc, d) => acc + d.impressions, 0);
        return {
            spend, conversions, clicks, impressions,
            cpa: conversions > 0 ? spend / conversions : 0,
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            roas: spend > 0 ? revenue / spend : 0,
        };
    };

    const analytics = useMemo(() => {
        const currentMetrics = calculateMetrics(currentData);
        const previousMetrics = calculateMetrics(previousData);

        const getChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? Infinity : 0;
            return ((current - previous) / previous) * 100;
        };
        
        const groupAndSum = (data: AnalyticsDataPoint[], groupBy: keyof AnalyticsDataPoint) => Object.values(
            data.reduce((acc, d) => {
                const key = d[groupBy] as string;
                if (!acc[key]) acc[key] = { name: key, spend: 0, revenue: 0, conversions: 0 };
                acc[key].spend += d.spend;
                acc[key].revenue += d.revenue;
                acc[key].conversions += d.conversions;
                return acc;
            }, {} as Record<string, any>)
        ).map((d: any) => ({ ...d, roas: d.spend > 0 ? d.revenue / d.spend : 0 }));

        return {
            kpis: {
                spend: { value: currentMetrics.spend, change: getChange(currentMetrics.spend, previousMetrics.spend) },
                roas: { value: currentMetrics.roas, change: getChange(currentMetrics.roas, previousMetrics.roas) },
                cpa: { value: currentMetrics.cpa, change: getChange(currentMetrics.cpa, previousMetrics.cpa) * -1 },
                conversions: { value: currentMetrics.conversions, change: getChange(currentMetrics.conversions, previousMetrics.conversions) },
                ctr: { value: currentMetrics.ctr, change: getChange(currentMetrics.ctr, previousMetrics.ctr) },
            },
            performanceBreakdown: {
                byPlatform: groupAndSum(currentData, 'platform'), byDevice: groupAndSum(currentData, 'device'),
                byCountry: groupAndSum(currentData, 'country').sort((a,b) => b.conversions - a.conversions).slice(0,5),
            },
            mainChartData: (() => {
                const numPoints = 30;
                const timeSpan = dateRanges.current.end.getTime() - dateRanges.current.start.getTime();
                const interval = timeSpan / numPoints;
                
                const points = Array.from({length: numPoints}, (_, i) => {
                    const date = new Date(dateRanges.current.start.getTime() + i * interval);
                    return { date: date.toLocaleDateString('fr-CA'), current: 0, previous: 0 };
                });
                
                const processData = (data: AnalyticsDataPoint[], key: 'current' | 'previous', offset = 0) => {
                    data.forEach(d => {
                        const pointIndex = Math.floor((new Date(d.date).getTime() + offset - dateRanges.current.start.getTime()) / interval);
                        if (points[pointIndex]) {
                            const metrics = calculateMetrics([d]);
                            points[pointIndex][key] += metrics[selectedKpi] || 0;
                        }
                    });
                }
                
                processData(currentData, 'current');
                processData(previousData, 'previous', timeSpan);

                return points;
            })(),
            overallScore: Math.round(((currentMetrics.roas / (previousMetrics.roas || 1)) + (currentMetrics.conversions / (previousMetrics.conversions || 1))) / 2 * 50)
        };
    }, [currentData, previousData, dateRanges, selectedKpi]);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setAiInsight(null);
        setIsAdvancedOpen(false);
    };

    const handleResetFilters = () => {
        setTempFilters(initialFilters);
        setFilters(initialFilters);
        setAiInsight(null);
    };

    const handleRunAIAnalysis = async () => {
        setIsAnalyzing(true); setAiInsight(null);
        try {
            const dataSummary = JSON.stringify({ 
                filters, 
                kpis: analytics.kpis, 
                topPlatform: analytics.performanceBreakdown.byPlatform.sort((a,b) => b.spend - a.spend)[0], 
                topCountry: analytics.performanceBreakdown.byCountry[0]
            });
            const insight = await geminiService.getAnalyticsInsights(dataSummary);
            setAiInsight(insight);
            showToast("Analyse IA terminée.", "success");
        } catch (error: any) {
            showToast(error.message || "L'analyse IA a échoué.", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-[28px] leading-[42px] font-bold text-light-text">Analytics & Rapports</h2>
                    <p className="text-light-text-secondary">Explorez vos données, découvrez des insights et optimisez vos performances.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsAdvancedOpen(true)} className="flex items-center gap-2 glass-card py-2 px-4 rounded-btn border border-black/10 hover:bg-black/5">
                        <AdjustmentsHorizontalIcon className="w-5 h-5"/>
                        <span className="font-semibold">Filtres</span>
                    </button>
                    <button onClick={handleRunAIAnalysis} disabled={isAnalyzing} className="flex items-center gap-2 bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-4 rounded-btn shadow-md disabled:bg-gray-400">
                        {isAnalyzing ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        <span>Analyse IA</span>
                    </button>
                </div>
            </header>

            {aiInsight && <AIInsightCard insight={aiInsight} onClose={() => setAiInsight(null)} />}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {(Object.keys(kpiConfig) as KpiKey[]).map(key => (
                    <KpiCard
                        key={key}
                        title={kpiConfig[key].title}
                        value={kpiConfig[key].formatter(analytics.kpis[key].value)}
                        change={analytics.kpis[key].change}
                        Icon={kpiConfig[key].Icon}
                        onClick={() => setSelectedKpi(key)}
                        isActive={selectedKpi === key}
                        isCpa={key === 'cpa'}
                    />
                ))}
            </div>

            <div className="glass-card p-6 rounded-3xl h-[400px]">
                <h3 className="font-semibold mb-4">{kpiConfig[selectedKpi].title} - Tendance sur { { '7d': '7 jours', '30d': '30 jours', '3m': '3 mois', '6m': '6 mois' }[filters.period] }</h3>
                {isLoading ? <div className="h-full flex items-center justify-center"><ArrowPathIcon className="w-8 h-8 animate-spin text-light-accent"/></div> : (
                    <ResponsiveContainer width="100%" height="90%">
                        <ComposedChart data={analytics.mainChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}/>
                            <Legend />
                            <Area type="monotone" dataKey="current" name="Période actuelle" stroke={kpiConfig[selectedKpi].color} fill={kpiConfig[selectedKpi].color} fillOpacity={0.2} />
                            <Line type="monotone" dataKey="previous" name="Période précédente" stroke="#9ca3af" strokeDasharray="5 5" />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BreakdownCard title="Répartition par Plateforme" data={analytics.performanceBreakdown.byPlatform} dataKey="roas" />
                <BreakdownCard title="Répartition par Appareil" data={analytics.performanceBreakdown.byDevice} dataKey="conversions" />
            </div>

            {isAdvancedOpen && <AdvancedFilterModal 
                onClose={() => setIsAdvancedOpen(false)} 
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                filters={tempFilters}
                setFilters={setTempFilters}
                masterData={masterData}
            />}
        </div>
    );
};


// --- SUB-COMPONENTS ---
const KpiCard: FC<{ title: string; value: string; change: number; Icon: React.ComponentType<{ className?: string }>; onClick: () => void; isActive: boolean; isCpa?: boolean; }> = ({ title, value, change, Icon, onClick, isActive, isCpa }) => {
    const isPositive = isCpa ? change <= 0 : change >= 0; // For CPA, lower is better
    const changeIsFinite = isFinite(change);
    return (
        <button onClick={onClick} className={`p-4 rounded-2xl text-left transition-all w-full ${isActive ? 'bg-white shadow-lg' : 'bg-black/5 hover:bg-black/10'}`}>
            <div className="flex justify-between items-center">
                <p className="font-semibold text-light-text-secondary">{title}</p>
                <Icon className={`w-6 h-6 ${isActive ? 'text-light-accent' : 'text-light-text-secondary'}`} />
            </div>
            <p className="text-3xl font-extrabold text-light-text mt-2">{value}</p>
            {changeIsFinite &&
                <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <ArrowTrendingUpIcon className="w-4 h-4 mr-1" /> : <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />}
                    <span>{Math.abs(change).toFixed(1)}%</span>
                </div>
            }
        </button>
    );
};

const AIInsightCard: FC<{ insight: AIAnalyticsInsight, onClose: () => void }> = ({ insight, onClose }) => (
    <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-light-accent/10 to-transparent relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10"><XIcon className="w-5 h-5"/></button>
        <h3 className="text-xl font-bold text-light-text flex items-center gap-2 mb-3">
            <SparklesIcon className="w-6 h-6 text-light-accent" />
            Analyse Stratégique de l'IA
        </h3>
        <p className="text-sm font-semibold mb-4">{insight.summary}</p>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-black/5 p-4 rounded-xl">
                <p className="font-semibold text-green-600 flex items-center gap-1.5"><ArrowTrendingUpIcon className="w-4 h-4" /> Points Forts</p>
                <ul className="list-disc list-inside text-light-text-secondary mt-1 space-y-1">
                    {insight.positivePoints.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
            </div>
            <div className="bg-black/5 p-4 rounded-xl">
                <p className="font-semibold text-red-500 flex items-center gap-1.5"><ArrowTrendingDownIcon className="w-4 h-4" /> Axes d'Amélioration</p>
                <ul className="list-disc list-inside text-light-text-secondary mt-1 space-y-1">
                     {insight.areasForImprovement.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
            </div>
            <div className="bg-black/5 p-4 rounded-xl">
                <p className="font-semibold text-light-accent flex items-center gap-1.5"><LightBulbIcon className="w-4 h-4" /> Recommandations</p>
                 <ul className="list-disc list-inside text-light-text-secondary mt-1 space-y-1">
                    {insight.recommendations.map((p, i) => <li key={i}><strong>{p.title}:</strong> {p.description} (Impact: {p.impact})</li>)}
                </ul>
            </div>
        </div>
    </div>
);

const BreakdownCard: FC<{ title: string, data: any[], dataKey: string }> = ({ title, data, dataKey }) => {
    const formattedData = data.map(item => ({...item, [dataKey]: item[dataKey] || 0}));
    return (
        <div className="glass-card p-6 rounded-3xl">
            <h3 className="font-semibold mb-4">{title}</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}/>
                        <Bar dataKey={dataKey} fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AdvancedFilterModal: FC<{
    onClose: () => void; onApply: () => void; onReset: () => void;
    filters: FilterState; setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    masterData: AnalyticsDataPoint[];
}> = ({ onClose, onApply, onReset, filters, setFilters, masterData }) => {
    const uniqueCampaigns = useMemo(() => [...new Set(masterData.map(d => d.campaignId))], [masterData]);
    const uniqueCountries = useMemo(() => [...new Set(masterData.map(d => d.country))], [masterData]);

    const handleArrayToggle = (key: 'platforms' | 'campaignIds' | 'devices' | 'countries', value: string) => {
        setFilters(prev => {
            const newValues = new Set(prev[key] as string[]);
            if (newValues.has(value)) newValues.delete(value);
            else newValues.add(value);
            return { ...prev, [key]: Array.from(newValues) };
        });
    };
    
    const handleRangeChange = (metric: 'roas' | 'cpa' | 'ctr', bound: 'min' | 'max', value: string) => {
        setFilters(prev => ({ ...prev, performanceRanges: { ...prev.performanceRanges, [metric]: { ...(prev.performanceRanges as any)[metric], [bound]: value } } }));
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-card rounded-3xl w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-black/10 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2"><FilterIcon className="w-5 h-5"/> Filtres Avancés</h3>
                    <button onClick={onClose} className="p-1 text-light-text-secondary hover:bg-black/5 rounded-md"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <Select label="Période" name="period" value={filters.period} onChange={e => setFilters(f => ({ ...f, period: e.target.value }))} options={[{value: '7d', label: '7 derniers jours'}, {value: '30d', label: '30 derniers jours'}, {value: '3m', label: '3 derniers mois'}, {value: '6m', label: '6 derniers mois'}]} icon={<CalendarDaysIcon className="w-5 h-5"/>}/>
                        <MultiSelectPopover label="Plateformes" options={platforms} selected={filters.platforms} onToggle={v => handleArrayToggle('platforms', v)} icon={<ComputerDesktopIcon className="w-5 h-5"/>}/>
                        <MultiSelectPopover label="Campagnes" options={uniqueCampaigns} selected={filters.campaignIds} onToggle={v => handleArrayToggle('campaignIds', v)} icon={<SearchIcon className="w-5 h-5"/>}/>
                    </div>
                    <div className="space-y-4">
                         <MultiSelectPopover label="Appareils" options={devices} selected={filters.devices} onToggle={v => handleArrayToggle('devices', v)} icon={<DevicePhoneMobileIcon className="w-5 h-5"/>}/>
                         <MultiSelectPopover label="Pays" options={uniqueCountries} selected={filters.countries} onToggle={v => handleArrayToggle('countries', v)} icon={<GlobeAltIcon className="w-5 h-5"/>}/>
                         <div>
                            <label className="block text-sm font-medium text-light-text-secondary mb-1">Nom de l'annonce</label>
                            <input type="text" value={filters.adName} onChange={e => setFilters(f => ({...f, adName: e.target.value}))} className="w-full bg-white/50 border border-black/10 rounded-btn p-3 focus:ring-light-accent focus:border-light-accent text-sm" />
                         </div>
                    </div>
                     <div className="space-y-4">
                         <RangeInput label="ROAS" min={filters.roas.min} max={filters.roas.max} onMinChange={e => handleRangeChange('roas', 'min', e.target.value)} onMaxChange={e => handleRangeChange('roas', 'max', e.target.value)} />
                         <RangeInput label="CPA (€)" min={filters.cpa.min} max={filters.cpa.max} onMinChange={e => handleRangeChange('cpa', 'min', e.target.value)} onMaxChange={e => handleRangeChange('cpa', 'max', e.target.value)} />
                         <RangeInput label="CTR (%)" min={filters.ctr.min} max={filters.ctr.max} onMinChange={e => handleRangeChange('ctr', 'min', e.target.value)} onMaxChange={e => handleRangeChange('ctr', 'max', e.target.value)} />
                     </div>
                </div>
                 <div className="p-4 bg-black/5 flex justify-between items-center rounded-b-3xl">
                    <button onClick={onReset} className="text-sm font-semibold text-light-text-secondary hover:underline">Réinitialiser</button>
                    <div className="flex gap-2">
                       <button onClick={onClose} className="bg-black/10 hover:bg-black/20 text-light-text font-semibold py-2 px-4 rounded-btn">Annuler</button>
                       <button onClick={onApply} className="bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-6 rounded-btn shadow-md">Appliquer</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MultiSelectPopover: FC<{ label: string, options: readonly string[], selected: string[], onToggle: (v: string) => void, icon?: React.ReactNode }> = ({ label, options, selected, onToggle, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <div ref={ref} className="relative">
            <label className="block text-sm font-medium text-light-text-secondary mb-1">{label}</label>
            <div className="relative">
                {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
                <button onClick={() => setIsOpen(!isOpen)} className={`w-full bg-white/50 border border-black/10 rounded-btn p-3 text-sm focus:outline-none flex items-center justify-between text-left ${icon ? 'pl-10' : ''}`}>
                    <span className="truncate">{selected.length > 0 ? `${selected.length} sélectionné(s)` : `Tous les ${label.toLowerCase()}`}</span>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white/80 backdrop-blur-md shadow-lg rounded-2xl max-h-60 overflow-auto py-2 border border-black/10">
                    <ul>
                        {options.map(opt => (
                            <li key={opt} onClick={() => onToggle(opt)} className="cursor-pointer select-none relative py-2 px-4 text-sm flex items-center gap-3 hover:bg-light-accent/10">
                                <input type="checkbox" checked={selected.includes(opt)} readOnly className="pointer-events-none" />
                                <span>{opt}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const RangeInput: FC<{ label: string, min: string, max: string, onMinChange: (e: any) => void, onMaxChange: (e: any) => void }> = ({ label, min, max, onMinChange, onMaxChange }) => (
    <div><label className="block text-sm font-medium text-light-text-secondary mb-1">{label}</label><div className="flex items-center gap-2"><input type="number" placeholder="Min" value={min} onChange={onMinChange} className="w-full bg-white/50 border border-black/10 rounded-btn p-3 text-sm" /><span className="text-gray-400">–</span><input type="number" placeholder="Max" value={max} onChange={onMaxChange} className="w-full bg-white/50 border border-black/10 rounded-btn p-3 text-sm" /></div></div>
);

export default Analytics;