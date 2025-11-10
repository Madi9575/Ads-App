import React, { useState, useMemo, FC, useRef, useEffect } from 'react';
import { Campaign, View, AccountPlatform, AnalyticsFilter } from '../types';
import { ChartBarIcon, PencilIcon, PauseIcon, PlayIcon, PlusIcon, SearchIcon, TemplateIcon, ListBulletIcon, FacebookIcon, TikTokIcon, GoogleIcon, InstagramIcon, LinkedInIcon, XIcon, EuroIcon, CursorClickIcon, CheckCircleIcon, EllipsisVerticalIcon, TrashIcon } from './icons';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import Select from './common/Select';

// --- PLATFORM & STATUS COMPONENTS ---

const PlatformDisplay: React.FC<{ platform: AccountPlatform }> = ({ platform }) => {
    const platformConfig = {
        Facebook: { Icon: FacebookIcon, color: 'text-[#1877F2]' },
        Instagram: { Icon: InstagramIcon, color: '' },
        TikTok: { Icon: TikTokIcon, color: 'text-black' },
        Google: { Icon: GoogleIcon, color: '' },
        LinkedIn: { Icon: LinkedInIcon, color: 'text-[#0077B5]' },
    };

    const { Icon, color } = platformConfig[platform] || { Icon: () => null, color: '' };

    return (
        <div className="flex items-center gap-[7px]">
            <Icon className={`w-6 h-6 ${color}`} />
            <span className="font-medium">{platform}</span>
        </div>
    );
};

const StatusBadge: React.FC<{ status: 'Active' | 'Paused' | 'Ended' }> = ({ status }) => {
    const styles = {
        Active: 'bg-green-500/20 text-green-700',
        Paused: 'bg-yellow-500/20 text-yellow-700',
        Ended: 'bg-gray-500/20 text-gray-700',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
}

// --- NEW ACTION MENU COMPONENT ---
const ActionsMenu: FC<{
    campaign: Campaign;
    onViewStats: () => void;
    onEdit: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
}> = ({ campaign, onViewStats, onEdit, onToggleStatus, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la campagne "${campaign.name}" ? Cette action est irréversible.`)) {
            onDelete();
        }
        setIsOpen(false);
    };

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setIsOpen(p => !p)} className="p-1 rounded-full hover:bg-black/10"><EllipsisVerticalIcon className="w-5 h-5 text-light-text-secondary"/></button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-md glass-card rounded-xl shadow-lg z-10 py-1">
                    <button onClick={() => { onViewStats(); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-light-text hover:bg-black/5"><ChartBarIcon className="w-4 h-4"/> Voir Stats</button>
                    <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-light-text hover:bg-black/5"><PencilIcon className="w-4 h-4"/> Modifier</button>
                    {campaign.status !== 'Ended' && (
                        <button onClick={() => { onToggleStatus(); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-light-text hover:bg-black/5">
                            {campaign.status === 'Active' ? <PauseIcon className="w-4 h-4"/> : <PlayIcon className="w-4 h-4"/>} {campaign.status === 'Active' ? 'Mettre en pause' : 'Activer'}
                        </button>
                    )}
                    <div className="my-1 h-px bg-black/10"></div>
                    <button onClick={handleDelete} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"><TrashIcon className="w-4 h-4"/> Supprimer</button>
                </div>
            )}
        </div>
    );
}

// --- NEW CAMPAIGN CARD COMPONENT ---

const CampaignCard: React.FC<{ 
    campaign: Campaign; 
    onToggleStatus: (id: string) => void;
    onEdit: (campaign: Campaign) => void;
    onViewStats: (campaign: Campaign) => void;
    onDelete: (id: string) => void;
}> = ({ campaign, onToggleStatus, onEdit, onViewStats, onDelete }) => {
    
    const kpiData = [
        { name: 'Budget/j', value: campaign.dailyBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) },
        { name: 'Dépensé', value: campaign.spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) },
        { name: 'CTR', value: `${campaign.ctr.toFixed(1)}%` },
        { name: 'Conv.', value: campaign.conversions },
    ];

    return (
        <div className="glass-card p-4 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <PlatformDisplay platform={campaign.platform} />
                        <StatusBadge status={campaign.status} />
                    </div>
                    <ActionsMenu 
                        campaign={campaign}
                        onViewStats={() => onViewStats(campaign)}
                        onEdit={() => onEdit(campaign)}
                        onToggleStatus={() => onToggleStatus(campaign.id)}
                        onDelete={() => onDelete(campaign.id)}
                    />
                </div>
                <h3 className="font-bold text-lg text-light-text truncate" title={campaign.name}>{campaign.name}</h3>
                <p className="text-xs text-light-text-secondary mb-4">ID: {campaign.id}</p>
                
                <div className="h-16 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={campaign.performanceHistory} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                             <defs>
                                <linearGradient id={`gradient-${campaign.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '12px', padding: '8px' }}
                                labelFormatter={(label) => `Jour ${label}`}
                                formatter={(value: number) => [value, "Performance"]}
                            />
                            <Area type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} fill={`url(#gradient-${campaign.id})`} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-black/5 p-3 rounded-xl text-sm">
                    {kpiData.map(kpi => (
                        <div key={kpi.name} className="flex justify-between">
                            <span className="text-light-text-secondary">{kpi.name}</span>
                            <span className="font-semibold text-light-text">{kpi.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---

interface CampaignsProps {
    campaigns: Campaign[];
    onUpdateCampaign: (campaign: Campaign) => void;
    onDeleteCampaign: (campaignId: string) => void;
    setCurrentView: (view: View) => void;
    setAnalyticsFilter: (filter: AnalyticsFilter | null) => void;
    highlightedCampaignId: string | null;
    onHighlightDone: () => void;
}

const Campaigns: React.FC<CampaignsProps> = ({ campaigns, onUpdateCampaign, onDeleteCampaign, setCurrentView, setAnalyticsFilter, highlightedCampaignId, onHighlightDone }) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Paused' | 'Ended'>('All');
  const [platformFilter, setPlatformFilter] = useState<'All' | AccountPlatform>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [statsModalCampaign, setStatsModalCampaign] = useState<Campaign | null>(null);
  
  React.useEffect(() => {
    if (highlightedCampaignId) {
      const element = document.getElementById(highlightedCampaignId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => {
        onHighlightDone();
      }, 3000); // Highlight duration: 3 seconds
      return () => clearTimeout(timer);
    }
  }, [highlightedCampaignId, onHighlightDone]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => 
        (statusFilter === 'All' || c.status === statusFilter) && 
        (platformFilter === 'All' || c.platform === platformFilter) &&
        (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [campaigns, statusFilter, platformFilter, searchQuery]);

  const handleToggleStatus = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign && (campaign.status === 'Active' || campaign.status === 'Paused')) {
        onUpdateCampaign({ ...campaign, status: campaign.status === 'Active' ? 'Paused' : 'Active' });
    }
  };

  const handleEditClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedCampaign: Campaign) => {
    onUpdateCampaign(updatedCampaign);
    setIsEditModalOpen(false);
    setSelectedCampaign(null);
  };
  
  const handleDeepDive = (campaignId: string) => {
    setAnalyticsFilter({ campaignId });
    setCurrentView(View.Analytics);
  };
  
  if (campaigns.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h3 className="text-2xl font-bold text-light-text">Commencez votre première campagne</h3>
            <p className="text-light-text-secondary mt-2 max-w-md">Vous n'avez aucune campagne pour le moment. Utilisez notre créateur de publicité IA pour lancer votre première campagne en quelques minutes.</p>
            <button onClick={() => setCurrentView(View.AdCreator)} className="mt-6 flex items-center justify-center gap-[7px] bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-5 rounded-btn transition-all duration-300 shadow-md hover:shadow-lg">
                <PlusIcon className="w-6 h-6"/> Créer une campagne
            </button>
        </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-[28px] leading-[42px] font-bold text-light-text">Gestion des Campagnes</h2>
            <button onClick={() => setCurrentView(View.AdCreator)} className="flex items-center justify-center gap-[7px] bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-5 rounded-btn transition-all duration-300 shadow-md hover:shadow-lg">
                <PlusIcon className="w-6 h-6"/> Nouvelle campagne
            </button>
        </div>
        
        {/* --- CONTROL TOWER --- */}
        <div className="glass-card p-4 rounded-3xl flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-grow w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="w-5 h-5 text-light-text-secondary"/></div>
                <input type="text" placeholder="Rechercher par nom ou ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/50 border border-black/10 rounded-btn py-2 pl-10 pr-4"/>
            </div>
            <div className="flex-shrink-0 flex items-center gap-4 w-full md:w-auto">
                 <Select 
                    name="statusFilter"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value as any)} 
                    options={[{ value: 'All', label: 'Tous les statuts' }, 'Active', 'Paused', 'Ended']} 
                />
                <Select 
                    name="platformFilter"
                    value={platformFilter} 
                    onChange={(e) => setPlatformFilter(e.target.value as any)} 
                    options={[{ value: 'All', label: 'Toutes les plateformes' }, 'Facebook', 'Instagram', 'TikTok', 'Google', 'LinkedIn']} 
                />
            </div>
            <div className="flex-shrink-0 bg-black/5 p-1 rounded-btn flex">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow' : 'text-light-text-secondary'}`}><TemplateIcon className="w-5 h-5"/></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : 'text-light-text-secondary'}`}><ListBulletIcon className="w-5 h-5"/></button>
            </div>
        </div>

      {/* --- CAMPAIGN DISPLAY AREA --- */}
      {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} id={campaign.id} className={`transition-all duration-300 rounded-3xl ${highlightedCampaignId === campaign.id ? 'ring-4 ring-light-accent ring-offset-2 ring-offset-light-bg' : ''}`}>
                      <CampaignCard 
                          campaign={campaign} 
                          onToggleStatus={handleToggleStatus}
                          onEdit={handleEditClick}
                          onViewStats={setStatsModalCampaign}
                          onDelete={onDeleteCampaign}
                      />
                  </div>
              ))}
          </div>
      ) : (
          <div className="glass-card rounded-3xl overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="p-4 font-semibold text-sm text-light-text-secondary">Campagne</th>
                    <th className="p-4 font-semibold text-sm text-light-text-secondary">Plateforme</th>
                    <th className="p-4 font-semibold text-sm text-light-text-secondary">Statut</th>
                    <th className="p-4 font-semibold text-sm text-light-text-secondary">Budget/j</th>
                    <th className="p-4 font-semibold text-sm text-light-text-secondary">CTR</th>
                    <th className="p-4 font-semibold text-sm text-light-text-secondary">Conv.</th>
                    <th className="p-4 font-semibold text-sm text-light-text-secondary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((c) => (
                      <tr key={c.id} className="border-b border-black/10 last:border-b-0">
                        <td className="p-4 font-medium">{c.name}</td>
                        <td className="p-4"><PlatformDisplay platform={c.platform} /></td>
                        <td className="p-4"><StatusBadge status={c.status} /></td>
                        <td className="p-4">{c.dailyBudget}€</td>
                        <td className="p-4">{c.ctr.toFixed(1)}%</td>
                        <td className="p-4">{c.conversions}</td>
                        <td className="p-4 text-right">
                            <ActionsMenu
                                campaign={c}
                                onViewStats={() => setStatsModalCampaign(c)}
                                onEdit={() => handleEditClick(c)}
                                onToggleStatus={() => handleToggleStatus(c.id)}
                                onDelete={() => onDeleteCampaign(c.id)}
                            />
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </div>
      )}

      {isEditModalOpen && selectedCampaign && (
        <EditCampaignModal campaign={selectedCampaign} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveEdit} />
      )}
      
      {statsModalCampaign && (
        <CampaignStatsModal campaign={statsModalCampaign} onClose={() => setStatsModalCampaign(null)} onDeepDive={handleDeepDive} />
      )}
    </div>
  );
};

// --- Edit Modal Component ---
interface EditCampaignModalProps {
    campaign: Campaign;
    onClose: () => void;
    onSave: (campaign: Campaign) => void;
}
const EditCampaignModal: FC<EditCampaignModalProps> = ({ campaign, onClose, onSave }) => {
    const [name, setName] = useState(campaign.name);
    const [dailyBudget, setDailyBudget] = useState(campaign.dailyBudget);

    const handleSave = () => {
        onSave({ ...campaign, name, dailyBudget });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="glass-card rounded-3xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-black/10 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Éditer la campagne</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-light-text-secondary">Nom de la campagne</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/50 border border-black/10 rounded-btn p-3 mt-1"/>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-light-text-secondary">Budget quotidien (€)</label>
                        <input type="number" value={dailyBudget} onChange={e => setDailyBudget(Number(e.target.value))} className="w-full bg-white/50 border border-black/10 rounded-btn p-3 mt-1"/>
                    </div>
                </div>
                <div className="p-4 bg-black/5 flex justify-end gap-3 rounded-b-3xl">
                    <button onClick={onClose} className="bg-black/10 hover:bg-black/20 text-light-text font-semibold py-2 px-4 rounded-btn">Annuler</button>
                    <button onClick={handleSave} className="bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-4 rounded-btn shadow-md hover:shadow-lg">Enregistrer</button>
                </div>
            </div>
        </div>
    );
};


// --- Campaign Stats Modal ---
interface CampaignStatsModalProps {
  campaign: Campaign;
  onClose: () => void;
  onDeepDive: (campaignId: string) => void;
}

const CampaignStatsModal: FC<CampaignStatsModalProps> = ({ campaign, onClose, onDeepDive }) => {
  const kpiData = [
    { title: 'Budget Journalier', value: campaign.dailyBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }), Icon: EuroIcon },
    { title: 'Dépenses Totales', value: campaign.spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }), Icon: EuroIcon },
    { title: 'CTR', value: `${campaign.ctr.toFixed(2)}%`, Icon: CursorClickIcon },
    { title: 'Conversions', value: campaign.conversions.toLocaleString('fr-FR'), Icon: CheckCircleIcon },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card rounded-3xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-black/10 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">Statistiques de la campagne</h3>
            <div className="flex items-center gap-4 mt-2">
              <PlatformDisplay platform={campaign.platform} />
              <StatusBadge status={campaign.status} />
            </div>
            <p className="text-sm text-light-text-secondary mt-1">{campaign.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10"><XIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {kpiData.map(({ title, value, Icon }) => (
              <div key={title} className="bg-black/5 p-4 rounded-xl">
                <p className="text-sm font-semibold text-light-text-secondary flex items-center gap-1 whitespace-nowrap"><Icon className="w-4 h-4" /> {title}</p>
                <p className="text-3xl font-extrabold text-light-text mt-1">{value}</p>
              </div>
            ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={campaign.performanceHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-modal-${campaign.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 10 }} label={{ value: 'Jour', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 10 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}
                  labelFormatter={(label) => `Jour ${label}`}
                  formatter={(value: number) => [value, "Performance"]}
                />
                <Area type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2.5} fill={`url(#gradient-modal-${campaign.id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-4 bg-black/5 flex justify-end gap-3 rounded-b-3xl">
          <button onClick={() => onDeepDive(campaign.id)} className="bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-4 rounded-btn flex items-center gap-2 shadow-md">
            <ChartBarIcon className="w-5 h-5" /> Voir dans Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
