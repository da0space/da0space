import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icons } from '../constants';
import { useWallet } from '../context/WalletContext';
import { supabase } from '../lib/supabase';
import { DAO } from '../types';

const CreateProposal: React.FC = () => {
    const { account, isCorrectNetwork, connect, switchNetwork } = useWallet();
    const { daoId } = useParams<{ daoId: string }>();
    const navigate = useNavigate();

    const [dao, setDao] = useState<DAO | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [choices, setChoices] = useState(['Yes', 'No']);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isActionDisabled = !account || !isCorrectNetwork;

    useEffect(() => {
        const fetchDAO = async () => {
            if (!daoId) return;
            try {
                const { data, error } = await supabase
                    .from('daos')
                    .select('*')
                    .eq('id', daoId)
                    .single();
                if (error) throw error;
                setDao({
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    logo: data.logo,
                    proposalsCount: data.proposals_count,
                    membersCount: data.members_count,
                    bannerGradient: data.banner_gradient,
                });
            } catch (err) {
                console.error('Error fetching DAO:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDAO();
    }, [daoId]);

    const handleChoiceChange = (index: number, value: string) => {
        const newChoices = [...choices];
        newChoices[index] = value;
        setChoices(newChoices);
    };

    const addChoice = () => {
        setChoices([...choices, '']);
    };

    const removeChoice = (index: number) => {
        if (choices.length > 2) {
            setChoices(choices.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isActionDisabled) {
            if (!account) connect();
            else if (!isCorrectNetwork) switchNetwork();
            return;
        }

        if (!title || !description || choices.some(c => !c)) {
            alert('Please fill in all fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('proposals')
                .insert({
                    dao_id: daoId,
                    title,
                    description,
                    author: account,
                    status: 'Active',
                    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
                    vote_count: 0,
                    quorum: 10
                })
                .select()
                .single();

            if (error) throw error;

            // Update DAO proposal count (Internal sync or let DB trigger handle it)
            // For now, just navigate
            alert('Proposal created successfully!');
            navigate(`/dao/${daoId}/proposal/${data.id}`);

        } catch (err) {
            console.error('Error creating proposal:', err);
            alert('Failed to create proposal.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
        <div className="min-h-screen py-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm mb-12 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
                    <Link to="/" className="text-slate-500 hover:text-white transition-colors">Home</Link>
                    <Icons.ChevronRight className="w-4 h-4 text-slate-700" />
                    <Link to={`/dao/${daoId}`} className="text-slate-500 hover:text-white transition-colors">{dao.name}</Link>
                    <Icons.ChevronRight className="w-4 h-4 text-slate-700" />
                    <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">New Proposal</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <img src={dao.logo} alt={dao.name} className="w-10 h-10 rounded-xl" />
                        <span className="text-slate-400">{dao.name}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Proposal</h1>
                </div>

                {/* Form */}
                <form className="space-y-8" onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="card-blur rounded-2xl p-8 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Proposal Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. BIP-42: Community Fund Allocation"
                            disabled={isActionDisabled || isSubmitting}
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        />
                    </div>

                    {/* Description */}
                    <div className="card-blur rounded-2xl p-8 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Detailed Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Markdown supported. Describe the motivation, goals, and impact of this proposal..."
                            rows={8}
                            disabled={isActionDisabled || isSubmitting}
                            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        />
                    </div>

                    {/* Choices */}
                    <div className="card-blur rounded-2xl p-6">
                        <label className="block text-white font-semibold mb-3">Voting Choices</label>
                        <div className="space-y-3">
                            {choices.map((choice, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <span className="text-slate-400 w-6">{index + 1}.</span>
                                    <input
                                        type="text"
                                        value={choice}
                                        onChange={(e) => handleChoiceChange(index, e.target.value)}
                                        placeholder={`Choice ${index + 1}`}
                                        disabled={isActionDisabled || isSubmitting}
                                        className={`flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${isActionDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    />
                                    {choices.length > 2 && !isActionDisabled && !isSubmitting && (
                                        <button
                                            type="button"
                                            onClick={() => removeChoice(index)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                            title="Remove Choice"
                                        >
                                            <Icons.X />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {!isActionDisabled && !isSubmitting && (
                            <button
                                type="button"
                                onClick={addChoice}
                                className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                            >
                                + Add Choice
                            </button>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end space-x-4">
                        <Link
                            to={`/dao/${daoId}`}
                            className="px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`base-gradient text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg ${!account
                                ? 'shadow-blue-500/20 hover:opacity-90'
                                : !isCorrectNetwork
                                    ? 'bg-amber-500 text-black shadow-amber-500/20 hover:opacity-90 grayscale-0'
                                    : isActionDisabled
                                        ? 'opacity-50 grayscale cursor-not-allowed shadow-blue-500/10'
                                        : 'hover:opacity-90 shadow-blue-500/20'
                                }`}
                        >
                            {isSubmitting ? 'Creating...' : (!account
                                ? 'Connect Wallet'
                                : !isCorrectNetwork
                                    ? 'Switch to Base'
                                    : 'Create Proposal')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProposal;
