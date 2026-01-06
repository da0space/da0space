import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icons } from '../constants';
import { useWallet } from '../context/WalletContext';
import { supabase } from '../lib/supabase';
import { DAO, Proposal, Vote } from '../types';

const ProposalDetail: React.FC = () => {
    const { account, isCorrectNetwork, connect, switchNetwork } = useWallet();
    const { daoId, proposalId } = useParams<{ daoId: string; proposalId: string }>();

    const [dao, setDao] = useState<DAO | null>(null);
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [isVoting, setIsVoting] = useState(false);

    const isActionDisabled = !account || !isCorrectNetwork;

    useEffect(() => {
        const fetchData = async () => {
            if (!daoId || !proposalId) return;
            setLoading(true);
            try {
                // Fetch DAO
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

                // Fetch Proposal
                const { data: propData, error: propError } = await supabase
                    .from('proposals')
                    .select('*')
                    .eq('id', proposalId)
                    .single();
                if (propError) throw propError;

                // Fetch Votes for this proposal to calculate results
                const { data: votesData, error: votesError } = await supabase
                    .from('votes')
                    .select('id, voter_address, choice_index, choice_name, created_at')
                    .eq('proposal_id', proposalId);
                if (votesError) throw votesError;

                // Mock choices for now (in real app they'd be in the DB)
                const choices = [
                    { name: 'Yes', percentage: 0 },
                    { name: 'No', percentage: 0 },
                ];

                if (votesData.length > 0) {
                    const yesCount = votesData.filter(v => v.choice_index === 0).length;
                    const noCount = votesData.filter(v => v.choice_index === 1).length;
                    const total = votesData.length;
                    choices[0].percentage = Math.round((yesCount / total) * 100);
                    choices[1].percentage = Math.round((noCount / total) * 100);
                }

                setProposal({
                    id: propData.id,
                    daoId: propData.dao_id,
                    title: propData.title,
                    description: propData.description,
                    status: propData.status as 'Active' | 'Closed' | 'Pending',
                    endDate: propData.end_date,
                    voteCount: propData.vote_count,
                    author: propData.author,
                    quorum: propData.quorum,
                    choices,
                });

                setVotes(votesData.map(v => ({
                    id: v.id || Math.random().toString(),
                    voterAddress: v.voter_address,
                    choiceName: v.choice_name,
                    createdAt: v.created_at
                })));

            } catch (err) {
                console.error('Error fetching proposal context:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [daoId, proposalId]);

    const handleVoteAction = async () => {
        if (!account) {
            connect();
            return;
        }
        if (!isCorrectNetwork) {
            switchNetwork();
            return;
        }
        if (selectedChoice === null || !proposal) return;

        setIsVoting(true);
        try {
            const { error } = await supabase
                .from('votes')
                .insert({
                    proposal_id: proposal.id,
                    voter_address: account,
                    choice_index: selectedChoice,
                    choice_name: proposal.choices[selectedChoice].name
                });

            if (error) {
                if (error.code === '23505') {
                    alert('You have already voted on this proposal!');
                } else {
                    throw error;
                }
                return;
            }

            // Update local state (Optimistic)
            setProposal(prev => prev ? ({ ...prev, voteCount: (prev.voteCount || 0) + 1 }) : null);

            // Refresh votes list
            const { data: newVotesData } = await supabase
                .from('votes')
                .select('*')
                .eq('proposal_id', proposal.id)
                .order('created_at', { ascending: false });

            if (newVotesData) {
                setVotes(newVotesData.map(v => ({
                    id: v.id,
                    voterAddress: v.voter_address,
                    choiceName: v.choice_name,
                    createdAt: v.created_at
                })));
            }

            alert('Vote cast successfully!');

        } catch (err) {
            console.error('Error casting vote:', err);
            alert('Failed to cast vote.');
        } finally {
            setIsVoting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!dao || !proposal) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400">Proposal not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm mb-12 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                    <Link to="/" className="text-slate-500 hover:text-white transition-colors">Home</Link>
                    <Icons.ChevronRight className="w-4 h-4 text-slate-700" />
                    <Link to={`/dao/${daoId}`} className="text-slate-500 hover:text-white transition-colors">{dao.name}</Link>
                    <Icons.ChevronRight className="w-4 h-4 text-slate-700" />
                    <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">Proposal Detail</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <img src={dao.logo} alt={dao.name} className="w-10 h-10 rounded-xl" />
                        <span className="text-slate-400">{dao.name}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${proposal.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-500/10 text-slate-400'
                            }`}>
                            {proposal.status}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">{proposal.title}</h1>
                    <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <span>By {proposal.author}</span>
                        <span className="flex items-center">
                            <Icons.Calendar />
                            {proposal.endDate}
                        </span>
                        <span>{proposal.voteCount?.toLocaleString()} votes</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="card-blur rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                            <p className="text-slate-300 leading-relaxed">{proposal.description}</p>
                        </div>

                        <div className="card-blur rounded-2xl p-6 border border-white/5">
                            <h2 className="text-xl font-bold text-white mb-6">Cast Your Vote</h2>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {proposal.choices.map((choice, idx) => (
                                    <button
                                        key={idx}
                                        disabled={isActionDisabled && !!account}
                                        onClick={() => setSelectedChoice(idx)}
                                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-3 group ${selectedChoice === idx
                                            ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                            : 'border-white/5 hover:border-white/10 bg-white/5'
                                            } ${isActionDisabled && account ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedChoice === idx ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
                                            {idx === 0 ? <Icons.Check /> : <Icons.Settings className="rotate-45" />}
                                        </div>
                                        <span className={`font-bold uppercase tracking-widest text-xs ${selectedChoice === idx ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'}`}>{choice.name}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleVoteAction}
                                disabled={proposal.status !== 'Active' || isVoting || (selectedChoice === null && account && isCorrectNetwork)}
                                className={`w-full py-4 rounded-xl font-semibold transition-all ${proposal.status !== 'Active'
                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                    : !account
                                        ? 'base-gradient text-white shadow-lg shadow-blue-500/20 hover:opacity-90'
                                        : !isCorrectNetwork
                                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 hover:opacity-90'
                                            : selectedChoice !== null
                                                ? 'base-gradient text-white shadow-lg shadow-blue-500/20 hover:opacity-90'
                                                : 'bg-white/5 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {isVoting ? 'Voting...' : (
                                    proposal.status !== 'Active'
                                        ? 'Voting Closed'
                                        : !account
                                            ? 'Connect Wallet'
                                            : !isCorrectNetwork
                                                ? 'Switch to Base'
                                                : 'Vote'
                                )}
                            </button>
                        </div>

                        {/* PART 2 — Voters Section */}
                        <div className="card-blur rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Voters</h2>
                            {votes.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No votes cast yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {votes.map((vote) => (
                                        <div key={vote.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                    <Icons.User className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-mono text-xs">{vote.voterAddress.slice(0, 6)}...{vote.voterAddress.slice(-4)}</p>
                                                    <p className="text-slate-500 text-[10px]">{new Date(vote.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${vote.choiceName === 'Yes' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {vote.choiceName}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card-blur rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Current Results</h2>
                            <div className="space-y-4">
                                {proposal.choices.map((choice, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-slate-300">{choice.name}</span>
                                            <span className="text-white font-medium">{choice.percentage}%</span>
                                        </div>
                                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-slate-600'}`}
                                                style={{ width: `${choice.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card-blur rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Information</h2>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Quorum</span>
                                    <span className="text-white">{proposal.quorum}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Votes</span>
                                    <span className="text-white">{proposal.voteCount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Status</span>
                                    <span className={proposal.status === 'Active' ? 'text-emerald-400' : 'text-slate-400'}>
                                        {proposal.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalDetail;
