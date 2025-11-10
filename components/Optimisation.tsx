import React, { FC, useState, useMemo } from 'react';
import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from 'recharts';
import { CpuChipIcon, CheckCircleIcon, LightBulbIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, RocketLaunchIcon, EuroIcon, LineChartIcon } from './icons';

// --- NEW DATA STRUCTURES & MOCK DATA ---
type Platform = 'Facebook' | 'TikTok' | 'Google';

interface OptimizationAction {
    id: string;
    title: string;
    rationale: string;
    action: {
        type: 'REALLOCATE';
        from: Platform;
        to: Platform;
        amount: number;
    };
    impact: {
        roasChange: number; // percentage change, e.g., 0.15 for +15%
        conversionsChange: number; // absolute change
    };
}

const initialBudgetData: { name: Platform; value: number }[] = [
    { name: 'Facebook', value: 4500 },
    { name: 'TikTok', value: 2500 },
    { name: 'Google', value: 3000 },
];

const optimizationActions: OptimizationAction[] = [
    { 
        id: 'rec1', 
        title: "Réallouer de Google vers TikTok",
        rationale: "Le fort engagement de l'audience 18-25 ans sur TikTok offre un ROAS potentiel plus élevé pour un investissement similaire.", 
        action: { type: 'REALLOCATE', from: 'Google', to: 'TikTok', amount: 1000 },
        impact: { roasChange: 0.15, conversionsChange: 50 } 
    },
    { 
        id: 'rec2', 
        title: "Réduire Facebook, booster TikTok",
        rationale: "La campagne 'Summer Sale' sur Facebook montre des signes de fatigue créative, tandis que la campagne UGC sur TikTok surperforme.", 
        action: { type: 'REALLOCATE', from: 'Facebook', to: 'TikTok', amount: 1000 },
        impact: { roasChange: 0.10, conversionsChange: 35 } 
    },
    { 
        id: 'rec3',
        title: "Équilibrer Google et Facebook",
        rationale: "Le coût par conversion sur Google a augmenté. Un transfert partiel vers Facebook pour le retargeting pourrait être plus rentable.", 
        action: { type: 'REALLOCATE', from: 'Google', to: 'Facebook', amount: 500 },
        impact: { roasChange: 0.05, conversionsChange: 15 }
    },
];

const initialKpis = { roas: 3.5, conversions: 850 };
const initialTotalBudget = initialBudgetData.reduce((sum, item) => sum + item.value, 0);
const COLORS: Record<Platform, string> = { Facebook: '#3b82f6', TikTok: '#ec4899', Google: '#f59e0b' };

// --- SUB-COMPONENTS ---

const KpiDisplay: FC<{ title: string; value: string; initialValue: string; icon: React.ReactNode }> = ({ title, value, initialValue, icon }) => (
    <div className="bg-black/5 p-4 rounded-xl flex-1">
        <div className="flex items-center gap-2">
            {icon}
            <h4 className="font-semibold text-light-text-secondary">{title}</h4>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-extrabold text-light-text">{value}</p>
            <p className="text-sm text-light-text-secondary">vs {initialValue}</p>
        </div>
    </div>
);

const ActionCard: FC<{ action: OptimizationAction; isActive: boolean; onToggle: () => void }> = ({ action, isActive, onToggle }) => (
    <div className="bg-black/5 p-4 rounded-2xl">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-light-text">{action.title}</h4>
                <p className="text-xs text-light-text-secondary mt-1">{action.rationale}</p>
            </div>
            <button 
                onClick={onToggle} 
                className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${isActive ? 'bg-green-500 text-white' : 'bg-black/10 text-light-text-secondary hover:bg-black/20'}`}
            >
                <CheckCircleIcon className="w-6 h-6"/>
            </button>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 font-semibold text-green-600">
                <ArrowTrendingUpIcon className="w-4 h-4" /> ROAS {(action.impact.roasChange * 100).toFixed(0)}%
            </span>
            <span className="flex items-center gap-1 font-semibold text-sky-600">
                <ArrowTrendingUpIcon className="w-4 h-4" /> Conv. +{action.impact.conversionsChange}
            </span>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        
        // Handle Link Hover. The item has `source` and `target` objects.
        if (item.source && item.target && item.source.name && item.target.name) {
            return (
                <div className="glass-card p-2 rounded-lg text-sm">
                    <p>{`${item.source.name.replace('Actuel - ', '')} → ${item.target.name.replace('Optimisé - ', '')}: ${item.value.toLocaleString('fr-FR')}€`}</p>
                </div>
            );
        }

        // Handle Node Hover. The item is the node object itself. It will NOT have a `source` property.
        if (item.name && typeof item.value !== 'undefined' && !item.source) {
            return (
                <div className="glass-card p-2 rounded-lg text-sm">
                    <p>{`${item.name.replace('Actuel - ', '').replace('Optimisé - ', '')}: ${item.value.toLocaleString('fr-FR')}€`}</p>
                </div>
            );
        }
    }
    return null;
};


// --- MAIN COMPONENT ---
const Optimisation: FC = () => {
    const [activeActionIds, setActiveActionIds] = useState<Set<string>>(new Set());

    const handleToggleAction = (actionId: string) => {
        setActiveActionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(actionId)) {
                newSet.delete(actionId);
            } else {
                newSet.add(actionId);
            }
            return newSet;
        });
    };
    
    const { simulatedKpis, sankeyData } = useMemo(() => {
        const activeActions = optimizationActions.filter(a => activeActionIds.has(a.id));
        
        // Calculate simulated KPIs
        const simulated = activeActions.reduce((acc, action) => {
            return {
                roas: acc.roas * (1 + action.impact.roasChange),
                conversions: acc.conversions + action.impact.conversionsChange,
            }
        }, { ...initialKpis });
        
        // Calculate budget for Sankey diagram
        const optimizedBudget = [...initialBudgetData.map(b => ({ ...b }))];
        activeActions.forEach(a => {
            const from = optimizedBudget.find(b => b.name === a.action.from);
            const to = optimizedBudget.find(b => b.name === a.action.to);
            if(from && to) {
                from.value -= a.action.amount;
                to.value += a.action.amount;
            }
        });

        // Prepare data for Sankey chart
        const nodes = [
            ...initialBudgetData.map(b => ({ name: `Actuel - ${b.name}` })),
            ...optimizedBudget.map(b => ({ name: `Optimisé - ${b.name}` })),
        ];
        
        const links: { source: number, target: number, value: number, color: string }[] = [];
        
        initialBudgetData.forEach((initial, index) => {
            let remaining = initial.value;
            // Add links for reallocated amounts
            activeActions.filter(a => a.action.from === initial.name).forEach(a => {
                const targetIndex = initialBudgetData.findIndex(b => b.name === a.action.to) + initialBudgetData.length;
                links.push({ source: index, target: targetIndex, value: a.action.amount, color: COLORS[initial.name] });
                remaining -= a.action.amount;
            });
            // Add link for the amount that stays
            if (remaining > 0) {
                 links.push({ source: index, target: index + initialBudgetData.length, value: remaining, color: COLORS[initial.name] });
            }
        });

        return { 
            simulatedKpis: simulated, 
            sankeyData: { nodes, links } 
        };
    }, [activeActionIds]);

    return (
        <div className="p-4 sm:p-8 space-y-8">
            <div>
                <h2 className="text-[28px] leading-[42px] font-bold text-light-text">Centre de Commandement IA</h2>
                <p className="text-light-text-secondary">Simulez les recommandations de l'IA et visualisez l'impact avant de valider.</p>
            </div>
            
            <div className="glass-card p-6 rounded-3xl">
                 <h3 className="text-lg font-semibold text-light-text mb-4">Simulateur d'Impact Prévisionnel</h3>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <KpiDisplay title="Dépenses Totales" value={`${initialTotalBudget.toLocaleString('fr-FR')}€`} initialValue={`${initialTotalBudget.toLocaleString('fr-FR')}€`} icon={<EuroIcon className="w-6 h-6 text-light-text-secondary"/>} />
                    <KpiDisplay title="ROAS Estimé" value={`${simulatedKpis.roas.toFixed(2)}x`} initialValue={`${initialKpis.roas.toFixed(2)}x`} icon={<LineChartIcon className="w-6 h-6 text-light-text-secondary"/>}/>
                    <KpiDisplay title="Conversions Estimées" value={`${Math.round(simulatedKpis.conversions).toLocaleString('fr-FR')}`} initialValue={`${initialKpis.conversions.toLocaleString('fr-FR')}`} icon={<CheckCircleIcon className="w-6 h-6 text-light-text-secondary"/>} />
                 </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold text-light-text mb-4">Actions Stratégiques</h3>
                    <div className="space-y-4">
                        {optimizationActions.map(action => (
                            <ActionCard 
                                key={action.id}
                                action={action}
                                isActive={activeActionIds.has(action.id)}
                                onToggle={() => handleToggleAction(action.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 glass-card p-6 rounded-3xl">
                    <h3 className="text-lg font-semibold text-light-text mb-4">Flux de Réallocation Budgétaire</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <Sankey
                                data={sankeyData}
                                nodePadding={50}
                                margin={{ top: 20, right: 100, bottom: 20, left: 100 }}
                                linkCurviness={0.5}
                                link={(props) => {
                                    const {
                                        sourceX, sourceY, targetX, targetY,
                                        sourceControlX, targetControlX, linkWidth, payload
                                    } = props;
                                    const path = `M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
                                    return (
                                        <path
                                            d={path}
                                            fill="none"
                                            stroke={payload.color}
                                            strokeWidth={linkWidth}
                                            strokeOpacity={0.4}
                                        />
                                    );
                                }}
                                node={({ x, y, width, height, index, payload }) => {
                                    const isSourceNode = payload.depth === 0;
                                    const platformName = payload.name.split(' - ')[1] as Platform;
                                    return (
                                        <Layer key={`node-${index}`}>
                                            <Rectangle x={x} y={y} width={width} height={height} fill={platformName ? COLORS[platformName] : '#ccc'} />
                                            <text
                                                x={isSourceNode ? x - 6 : x + width + 6}
                                                y={y + height / 2}
                                                textAnchor={isSourceNode ? "end" : "start"}
                                                dominantBaseline="middle"
                                                className="font-semibold"
                                                fill="#1A1C23"
                                            >
                                                {platformName}
                                            </text>
                                        </Layer>
                                    )
                                }}
                            >
                                <Tooltip content={<CustomTooltip />} />
                            </Sankey>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center">
                 <button 
                    disabled={activeActionIds.size === 0}
                    className="flex items-center justify-center gap-[7px] bg-light-accent hover:bg-light-accent-hover text-white font-bold py-3 px-8 rounded-btn transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    <RocketLaunchIcon className="w-6 h-6"/> Appliquer {activeActionIds.size > 0 ? `${activeActionIds.size} changement(s)` : ''}
                </button>
            </div>
        </div>
    );
};

export default Optimisation;