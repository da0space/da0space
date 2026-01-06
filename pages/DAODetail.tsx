import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icons } from '../constants';
import { useWallet } from '../context/WalletContext';
import { supabase } from '../lib/supabase';
import { DAO, Proposal } from '../types';

const DAODetail: React.FC = () => {
    const { account, isCorrectNetwork } = useWallet();
    const { daoId } = useParams<{ daoId: string }>();
    const [dao, setDao] = useState<DAO | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    const isActionDisabled = !account || !isCorrectNetwork;

    useEffect(() => {
        const fetchData = async () => {
            if (!daoId) return;
            setLoading(true);
            try {
                // Fetch DAO details
                const { data: daoData, error: daoError } = await supabase
                    .from('daos')
                    .select('*')
                    .eq('id', daoId)
                    .single();

                if (daoError) throw daoError;

                setDao({
                    id: daoData.id,
                    name: daoData.name,
                    description: daoData.description,
                    logo: daoData.logo,
                    proposalsCount: daoData.proposals_count,
                    membersCount: daoData.members_count,
                    bannerGradient: daoData.banner_gradient,
                });

                // Fetch Proposals for this DAO
                const { data: proposalsData, error: proposalsError } = await supabase
                    .from('proposals')
                    .select('*')
                    .eq('dao_id', daoId)
                    .order('created_at', { ascending: false });

                if (proposalsError) throw proposalsError;

                setProposals(proposalsData.map(p => ({
                    id: p.id,
                    daoId: p.dao_id,
                    title: p.title,
                    description: p.description,
                    status: p.status as 'Active' | 'Closed' | 'Pending',
                    endDate: p.end_date,
                    voteCount: p.vote_count,
                    author: p.author,
                    quorum: p.quorum,
                    choices: [
                        { name: 'Yes', percentage: 0 },
                        { name: 'No', percentage: 0 },
                    ]
                })));

            } catch (err) {
                console.error('Error fetching DAO details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [daoId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!dao) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400">DAO not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Banner */}
            <div className={`h-48 bg-gradient-to-r ${dao.bannerGradient} relative`}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] to-transparent"></div>
            </div>

            {/* DAO Info */}
            <div className="max-w-7xl mx-auto px-6 -mt-20 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex flex-col md:flex-row items-center md:items-end text-center md:text-left space-y-4 md:space-y-0 md:space-x-6">
                        <div className="w-32 h-32 rounded-2xl border-4 border-[#0a0b0d] bg-slate-800 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
                            {dao.logo ? (
                                <img
                                    src={dao.logo}
                                    alt={dao.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dao.name)}&background=0052FF&color=fff&bold=true`;
                                    }}
                                />
                            ) : (
                                <Icons.Logo className="w-12 h-12 opacity-20" />
                            )}
                        </div>
                        <div className="flex-1 pb-1">
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">{dao.name}</h1>
                            <p className="text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed">{dao.description}</p>
                        </div>
                    </div>

                    <Link
                        to={isActionDisabled ? '#' : `/dao/${daoId}/create`}
                        onClick={(e) => isActionDisabled && e.preventDefault()}
                        className={`base-gradient text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg text-center md:text-left ${isActionDisabled ? 'opacity-50 grayscale cursor-not-allowed shadow-blue-500/10' : 'hover:opacity-90 shadow-blue-500/20 active:scale-95'
                            }`}
                    >
                        New Proposal
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-16">
                    <div className="card-blur rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Total Proposals</div>
                        <div className="text-3xl font-bold text-white slashed-zero group-hover:text-blue-400 transition-colors">
                            {dao.proposalsCount?.toLocaleString() ?? 0}
                        </div>
                    </div>
                    <div className="card-blur rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Members</div>
                        <div className="text-3xl font-bold text-white slashed-zero group-hover:text-blue-400 transition-colors">
                            {dao.membersCount?.toLocaleString() ?? 0}
                        </div>
                    </div>
                    <div className="card-blur rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Active Proposals</div>
                        <div className="text-3xl font-bold text-emerald-400 slashed-zero">
                            {proposals.filter(p => p.status === 'Active').length}
                        </div>
                    </div>
                </div>

                {/* Proposals */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Proposals</h2>

                    {proposals.length === 0 ? (
                        <div className="card-blur rounded-2xl p-12 text-center">
                            <p className="text-slate-400">No proposals yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {proposals.map((proposal) => (
                                <Link
                                    key={proposal.id}
                                    to={`/dao/${daoId}/proposal/${proposal.id}`}
                                    className="card-blur rounded-2xl p-6 block hover:border-white/20 transition-all duration-300 group"
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${proposal.status === 'Active'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-slate-500/10 text-slate-400'
                                                    }`}>
                                                    {proposal.status}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                {proposal.title}
                                            </h3>
                                            <p className="text-slate-400 text-sm mt-2 line-clamp-2">{proposal.description}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center text-slate-400 text-sm mb-2">
                                                <Icons.Calendar />
                                                {proposal.endDate}
                                            </div>
                                            <div className="text-sm text-slate-500">{proposal.voteCount?.toLocaleString()} votes</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DAODetail;
