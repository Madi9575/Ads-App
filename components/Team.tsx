import React, { FC, useState, useMemo, useEffect, useRef } from 'react';
import { TeamMember, Toast } from '../types';
import { UsersIcon, PlusIcon, EnvelopeIcon, XIcon, SearchIcon, EllipsisVerticalIcon, PencilIcon, PaperAirplaneIcon, TrashIcon, InformationCircleIcon, TemplateIcon, ListBulletIcon, CampaignsIcon } from './icons';
import Select from './common/Select';

interface TeamProps {
    members: TeamMember[];
    setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
    showToast: (message: string, type?: Toast['type']) => void;
}

const RoleBadge: FC<{ role: TeamMember['role'] }> = ({ role }) => {
    const styles = {
        'Admin': 'bg-red-500/20 text-red-700',
        'Éditeur': 'bg-blue-500/20 text-blue-700',
        'Analyste': 'bg-green-500/20 text-green-700',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[role]}`}>{role}</span>;
}

const StatusPill: FC<{ status: TeamMember['status'] }> = ({ status }) => {
    const styles = {
        'Actif': 'bg-green-100 text-green-700',
        'En attente': 'bg-yellow-100 text-yellow-700',
        'Suspendu': 'bg-gray-200 text-gray-600',
    };
     return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
}

const Team: FC<TeamProps> = ({ members, setMembers, showToast }) => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [filterRole, setFilterRole] = useState<TeamMember['role'] | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

    const handleInvite = (emails: string[], role: TeamMember['role']) => {
        const newMembers: TeamMember[] = emails.map(email => ({
            id: new Date().toISOString() + email,
            name: 'Invitation en attente',
            email,
            role,
            status: 'En attente',
            lastActivity: `Invit. envoyée ${new Date().toLocaleDateString()}`
        }));
        setMembers(prev => [...prev, ...newMembers]);
        showToast(`${newMembers.length} invitation(s) envoyée(s) avec succès.`, 'success');
    };
    
    const handleUpdateMember = (updatedMember: TeamMember) => {
        setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
        showToast(`Le membre "${updatedMember.name}" a été mis à jour.`, 'success');
        setIsEditModalOpen(false);
        setEditingMember(null);
    };

    const handleDelete = (memberId: string) => {
        const memberToDelete = members.find(m => m.id === memberId);
        if (memberToDelete) {
            setMembers(prev => prev.filter(member => member.id !== memberId));
            showToast(`Le membre "${memberToDelete.name}" a été supprimé.`, 'success');
        }
    };
    
    const handleResendInvite = (member: TeamMember) => {
        showToast(`Invitation renvoyée à ${member.email}.`, 'info');
    };

    const filteredMembers = useMemo(() => {
        return members.filter(member => {
            const roleMatch = filterRole === 'All' || member.role === filterRole;
            const searchMatch = searchQuery === '' || 
                                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                member.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            return roleMatch && searchMatch;
        });
    }, [members, filterRole, searchQuery]);

    const teamStats = useMemo(() => ({
        active: members.filter(m => m.status === 'Actif').length,
        pending: members.filter(m => m.status === 'En attente').length,
        campaigns: members.reduce((acc, m) => acc + (m.tags?.length || 0), 0),
    }), [members]);

    return (
        <div className="p-4 sm:p-8 space-y-6">
            <header>
                <div>
                    <h2 className="text-[28px] leading-[42px] font-bold text-light-text">Hub de Collaboration</h2>
                    <p className="text-light-text-secondary">Pilotez votre équipe, assignez des rôles et suivez les performances.</p>
                </div>
            </header>

            <TeamStats stats={teamStats} />

            <div className="glass-card p-4 rounded-3xl">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-secondary" />
                        <input type="text" placeholder="Rechercher par nom, email, tag..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/50 border border-black/10 rounded-btn py-2.5 pl-10 pr-4 focus:ring-light-accent focus:border-light-accent text-sm" />
                    </div>
                     <div className="flex-shrink-0">
                         <Select 
                            name="roleFilter"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            options={[{value: 'All', label: 'Tous les rôles'}, 'Admin', 'Éditeur', 'Analyste']}
                         />
                    </div>
                    <div className="flex-shrink-0 bg-black/5 p-1 rounded-btn flex">
                        <button onClick={() => setViewMode('card')} className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-white shadow text-light-accent' : 'text-light-text-secondary'}`}><TemplateIcon className="w-5 h-5"/></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow text-light-accent' : 'text-light-text-secondary'}`}><ListBulletIcon className="w-5 h-5"/></button>
                    </div>
                    <button onClick={() => setIsInviteModalOpen(true)} className="flex items-center justify-center gap-[7px] bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-5 rounded-btn transition-all duration-300 shadow-md hover:shadow-lg">
                        <PlusIcon className="w-6 h-6"/> Inviter
                    </button>
                </div>
            </div>

            {viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMembers.map(member => <TeamMemberCard key={member.id} member={member} onEdit={() => { setEditingMember(member); setIsEditModalOpen(true); }} onResend={handleResendInvite} onDelete={handleDelete} />)}
                </div>
            ) : (
                <ListView members={filteredMembers} onEdit={(m) => { setEditingMember(m); setIsEditModalOpen(true); }} onResend={handleResendInvite} onDelete={handleDelete} />
            )}
            
            {isInviteModalOpen && <InviteModal onClose={() => setIsInviteModalOpen(false)} onInvite={handleInvite} />}
            {isEditModalOpen && editingMember && <EditModal member={editingMember} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateMember} />}
        </div>
    );
};

const TeamStats: FC<{stats: {active: number, pending: number, campaigns: number}}> = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-full"><UsersIcon className="w-6 h-6 text-blue-500" /></div>
            <div><p className="text-2xl font-bold">{stats.active}</p><p className="text-sm text-light-text-secondary">Membres Actifs</p></div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-full"><PaperAirplaneIcon className="w-6 h-6 text-amber-500" /></div>
            <div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-sm text-light-text-secondary">Invitations en Attente</p></div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-green-500/10 p-3 rounded-full"><CampaignsIcon className="w-6 h-6 text-green-500" /></div>
            <div><p className="text-2xl font-bold">{stats.campaigns}</p><p className="text-sm text-light-text-secondary">Campagnes Gérées</p></div>
        </div>
    </div>
);

const TeamMemberCard: FC<{ member: TeamMember, onEdit: () => void; onResend: (m: TeamMember) => void; onDelete: (id: string) => void; }> = ({ member, onEdit, onResend, onDelete }) => (
    <div className="glass-card rounded-3xl p-4 flex flex-col text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="absolute top-3 right-3"><ActionsMenu member={member} onEdit={onEdit} onResend={onResend} onDelete={onDelete} /></div>
        <img src={`https://i.pravatar.cc/80?u=${member.email}`} alt={member.name} className="w-20 h-20 rounded-full mx-auto" />
        <p className="font-bold text-light-text mt-3">{member.name}</p>
        <p className="text-xs text-light-text-secondary">{member.email}</p>
        <div className="my-3 flex flex-col items-center gap-2">
            <RoleBadge role={member.role} />
            <StatusPill status={member.status} />
        </div>
        <div className="mt-auto pt-3 border-t border-black/10">
            <h5 className="text-xs font-semibold text-light-text-secondary mb-2">Campagnes Actives</h5>
            <div className="flex flex-wrap justify-center gap-1">
                 {member.tags?.length ? member.tags.map(tag => <span key={tag} className="text-xs bg-black/5 text-light-text-secondary font-medium px-2 py-0.5 rounded-full">{tag}</span>) : <span className="text-xs text-gray-400">Aucune</span>}
            </div>
        </div>
    </div>
);

const ListView: FC<{ members: TeamMember[], onEdit: (m: TeamMember) => void; onResend: (m: TeamMember) => void; onDelete: (id: string) => void; }> = ({ members, onEdit, onResend, onDelete }) => (
    <div className="glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-white/20">
                        <th className="p-4 font-semibold text-sm text-light-text-secondary tracking-wider">Membre</th>
                        <th className="p-4 font-semibold text-sm text-light-text-secondary tracking-wider">Rôle & Tags</th>
                        <th className="p-4 font-semibold text-sm text-light-text-secondary tracking-wider">Statut</th>
                        <th className="p-4 font-semibold text-sm text-light-text-secondary tracking-wider">Dernière activité</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {members.map(member => (
                        <tr key={member.id} className="border-b border-white/20 last:border-b-0 hover:bg-white/30">
                            <td className="p-4">
                                <div className="flex items-center gap-[7px]">
                                    <img src={`https://i.pravatar.cc/40?u=${member.email}`} alt={member.name} className="w-10 h-10 rounded-full" />
                                    <div><p className="font-medium text-light-text">{member.name}</p><p className="text-xs text-light-text-secondary">{member.email}</p></div>
                                </div>
                            </td>
                            <td className="p-4 align-top">
                                <RoleBadge role={member.role} />
                                <div className="flex flex-wrap gap-1 mt-1.5">{member.tags?.map(tag => <span key={tag} className="text-xs bg-black/5 text-light-text-secondary font-medium px-2 py-0.5 rounded-full">{tag}</span>)}</div>
                            </td>
                            <td className="p-4 align-top"><StatusPill status={member.status} /></td>
                            <td className="p-4 align-top text-sm text-light-text-secondary">{member.lastActivity}</td>
                            <td className="p-4 text-center align-top"><ActionsMenu member={member} onEdit={() => onEdit(member)} onResend={onResend} onDelete={onDelete} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ActionsMenu: FC<{ member: TeamMember; onEdit: () => void; onResend: (member: TeamMember) => void; onDelete: (id: string) => void; }> = ({ member, onEdit, onResend, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    return (
        <div ref={ref} className="relative inline-block">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-black/10"><EllipsisVerticalIcon className="w-5 h-5"/></button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white glass-card rounded-xl shadow-lg z-10 py-1">
                    <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-light-text hover:bg-black/5"><PencilIcon className="w-4 h-4"/> Modifier</button>
                    {member.status === 'En attente' && <button onClick={() => { onResend(member); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-light-text hover:bg-black/5"><PaperAirplaneIcon className="w-4 h-4"/> Renvoyer l'invitation</button>}
                    <button onClick={() => { onDelete(member.id); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"><TrashIcon className="w-4 h-4"/> Supprimer</button>
                </div>
            )}
        </div>
    );
};

interface InviteModalProps { onClose: () => void; onInvite: (emails: string[], role: TeamMember['role']) => void; }
const InviteModal: FC<InviteModalProps> = ({ onClose, onInvite }) => {
    const [emails, setEmails] = useState('');
    const [role, setRole] = useState<TeamMember['role']>('Éditeur');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emailList = emails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e);
        if (emailList.length > 0) {
            onInvite(emailList, role);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="glass-card rounded-3xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/20 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Inviter de nouveaux membres</h3>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-black/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-light-text-secondary">Adresses email</label>
                        <textarea rows={3} placeholder="Séparez les emails par une virgule ou un saut de ligne." value={emails} onChange={e => setEmails(e.target.value)} required className="w-full bg-white/50 border border-black/10 rounded-btn p-3 mt-1"/>
                    </div>
                    <Select label="Rôle" name="role" value={role} onChange={e => setRole(e.target.value as TeamMember['role'])} options={['Admin', 'Éditeur', 'Analyste']} />
                </div>
                <div className="p-4 bg-white/20 flex justify-end gap-3 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="bg-black/10 hover:bg-black/20 text-light-text font-semibold py-2 px-4 rounded-btn">Annuler</button>
                    <button type="submit" className="bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-4 rounded-btn flex items-center gap-[7px] shadow-md"><EnvelopeIcon className="w-5 h-5"/> Envoyer les invitations</button>
                </div>
            </form>
        </div>
    );
};

interface EditModalProps { member: TeamMember; onClose: () => void; onSave: (member: TeamMember) => void; }
const EditModal: FC<EditModalProps> = ({ member, onClose, onSave }) => {
    const [name, setName] = useState(member.name);
    const [role, setRole] = useState(member.role);
    const [tags, setTags] = useState(member.tags?.join(', ') || '');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...member, name, role, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSave} className="glass-card rounded-3xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/20 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Modifier le membre</h3>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-black/10"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-light-text-secondary">Nom complet</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white/50 border border-black/10 rounded-btn p-3 mt-1"/>
                    </div>
                     <Select label="Rôle" name="role" value={role} onChange={e => setRole(e.target.value as TeamMember['role'])} options={['Admin', 'Éditeur', 'Analyste']} />
                     <div>
                        <label className="text-sm font-medium text-light-text-secondary">Tags (séparés par des virgules)</label>
                        <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-white/50 border border-black/10 rounded-btn p-3 mt-1"/>
                    </div>
                </div>
                <div className="p-4 bg-white/20 flex justify-end gap-3 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="bg-black/10 hover:bg-black/20 text-light-text font-semibold py-2 px-4 rounded-btn">Annuler</button>
                    <button type="submit" className="bg-light-accent hover:bg-light-accent-hover text-white font-bold py-2 px-4 rounded-btn shadow-md">Enregistrer</button>
                </div>
            </form>
        </div>
    );
};

export default Team;