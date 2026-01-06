import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../constants';
import { useWallet } from '../context/WalletContext';
import { supabase } from '../lib/supabase';
import { DAO, Proposal } from '../types';

const Home: React.FC = () => {
    const { account, isCorrectNetwork, connect, switchNetwork } = useWallet();
    const [daos, setDaos] = useState<DAO[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    const isActionDisabled = !account || !isCorrectNetwork;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch DAOs
                const { data: daosData, error: daosError } = await supabase
                    .from('daos')
                    .select('*')
                    .order('members_count', { ascending: false });

                if (daosError) throw daosError;

                const formattedDaos: DAO[] = daosData.map(d => ({
                    id: d.id,
                    name: d.name,
                    description: d.description,
                    logo: d.logo,
                    proposalsCount: d.proposals_count,
                    membersCount: d.members_count,
                    bannerGradient: d.banner_gradient,
                }));

                setDaos(formattedDaos);

                // Fetch Proposals
                const { data: proposalsData, error: proposalsError } = await supabase
                    .from('proposals')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (proposalsError) throw proposalsError;

                const formattedProposals: Proposal[] = proposalsData.map(p => ({
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
                        { name: 'Yes', percentage: 0 }, // For now, we'll need a better way to handle choices
                        { name: 'No', percentage: 0 },
                    ]
                }));

                setProposals(formattedProposals);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleHeroAction = () => {
        if (!account) {
            connect();
        } else if (!isCorrectNetwork) {
            switchNetwork();
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/5"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
                            <Icons.Base />
                            <span className="text-sm text-slate-300">Native on Base</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent leading-tight">
                            Governance for<br />the Based Era
                        </h1>
                        <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
                            Create, vote, and manage proposals for your DAO with native Base integration. Fast, secure, and transparent.
                        </p>
                        <div className="flex items-center justify-center space-x-4">
                            <button
                                onClick={handleHeroAction}
                                className={`base-gradient text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg text-lg ${isActionDisabled ? 'shadow-blue-500/10 opacity-80' : 'shadow-blue-500/25 hover:opacity-90'
                                    }`}
                            >
                                {!account ? 'Connect to Start' : !isCorrectNetwork ? 'Switch to Base' : 'Launch App'}
                            </button>
                            <button className="bg-white/5 text-white font-semibold px-8 py-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-lg">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured DAOs */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-white">Featured DAOs</h2>
                        <button className="text-blue-400 hover:text-blue-300 font-medium flex items-center transition-colors">
                            View All <Icons.ChevronRight />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="card-blur rounded-2xl h-64 animate-pulse bg-white/5"></div>
                            ))
                        ) : daos.map((dao) => (
                            <Link
                                key={dao.id}
                                to={`/dao/${dao.id}`}
                                className="card-blur rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
                            >
                                <div className={`h-24 bg-gradient-to-r ${dao.bannerGradient} relative overflow-hidden flex items-center justify-center`}>
                                    {!dao.bannerGradient && <div className="absolute inset-0 bg-slate-800" />}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111216] to-transparent"></div>
                                    <Icons.Logo className="w-12 h-6 opacity-10 grayscale" />
                                </div>
                                <div className="p-5 -mt-8 relative flex flex-col h-[calc(100%-6rem)]">
                                    <div className="w-14 h-14 rounded-xl border-4 border-[#111216] bg-slate-800 mb-4 overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xl">
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
                                            <span className="text-white font-bold">{dao.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{dao.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">{dao.description}</p>
                                    <div className="flex items-center space-x-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-auto pt-4 border-t border-white/5">
                                        <span className="flex items-center"><Icons.Calendar className="w-3 h-3 mr-1" /> {dao.proposalsCount} Proposals</span>
                                        <span className="flex items-center"><Icons.User className="w-3 h-3 mr-1" /> {dao.membersCount.toLocaleString()} Members</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Active Proposals */}
            <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[#08090a]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-white">Active Proposals</h2>
                        <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium">All</button>
                            <button className="px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors">Active</button>
                            <button className="px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors">Closed</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="card-blur rounded-2xl h-32 animate-pulse bg-white/5"></div>
                            ))
                        ) : proposals.map((proposal) => {
                            const dao = daos.find(d => d.id === proposal.daoId);
                            return (
                                <Link
                                    key={proposal.id}
                                    to={`/dao/${proposal.daoId}/proposal/${proposal.id}`}
                                    className="card-blur rounded-2xl p-6 block hover:border-white/20 transition-all duration-300 group"
                                >
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 border border-white/5 shadow-lg group-hover:border-blue-500/30 transition-colors">
                                                {dao?.logo ? (
                                                    <img
                                                        src={dao.logo}
                                                        alt={dao.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dao.name)}&background=0052FF&color=fff&bold=true`;
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-white text-xs font-bold">{dao?.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{dao?.name}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${proposal.status === 'Active'
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-slate-500/10 text-slate-400'
                                                        }`}>
                                                        {proposal.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                                                    {proposal.title}
                                                </h3>
                                                <p className="text-slate-400 text-sm line-clamp-1 leading-relaxed">{proposal.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center justify-end space-x-1.5 text-slate-400 text-[11px] font-bold mb-2 uppercase tracking-tight">
                                                <Icons.Calendar className="w-3.5 h-3.5" />
                                                <span>Ends {proposal.endDate}</span>
                                            </div>
                                            <div className="text-xs font-medium text-slate-500 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{proposal.voteCount?.toLocaleString()} votes cast</div>
                                        </div>
                                    </div>

                                    {/* Progress bars (Optional/Static for now) */}
                                    <div className="mt-5 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
