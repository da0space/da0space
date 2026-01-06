import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../constants';
import { useWallet } from '../context/WalletContext';

const Navbar: React.FC = () => {
    const { account, connect, disconnect, isCorrectNetwork, switchNetwork, isWalletInstalled, isConnecting } = useWallet();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <div className="sticky top-0 z-50">
            {/* Network Warning Banner */}
            {account && !isCorrectNetwork && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-6 flex items-center justify-center space-x-4 backdrop-blur-md">
                    <p className="text-amber-500 text-xs font-semibold uppercase tracking-wider">
                        Wrong network. Please switch to Base.
                    </p>
                    <button
                        onClick={switchNetwork}
                        className="bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-full hover:bg-amber-400 transition-colors uppercase"
                    >
                        Switch to Base
                    </button>
                </div>
            )}

            {/* No Wallet Warning */}
            {!isWalletInstalled && (
                <div className="bg-red-500/10 border-b border-red-500/20 py-2 px-6 flex items-center justify-center backdrop-blur-md">
                    <p className="text-red-500 text-xs font-semibold uppercase tracking-wider">
                        No wallet detected. Please install MetaMask.
                    </p>
                </div>
            )}

            <nav className="border-b border-white/5 bg-[#0a0b0d]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <Icons.Logo className="w-16 h-8 group-hover:scale-105 transition-transform" />
                        </Link>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                                Explore
                            </Link>
                            <span className="text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer">
                                Analytics
                            </span>
                            <span className="text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer">
                                Docs
                            </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden lg:flex items-center bg-white/5 rounded-xl px-4 py-2 border border-white/5 hover:border-white/10 transition-colors group">
                                <Icons.Search className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search DAOs..."
                                    className="bg-transparent text-sm text-white placeholder:text-slate-500 ml-2 outline-none w-40 focus:w-56 transition-all"
                                />
                            </div>

                            {/* Mobile Search - Small Screens */}
                            <button className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
                                <Icons.Search />
                            </button>

                            {account ? (
                                <div className="hidden sm:flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        {!isCorrectNetwork && (
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        )}
                                        <span className="text-white text-[11px] font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-wider">
                                            {formatAddress(account)}
                                        </span>
                                    </div>

                                    <button
                                        onClick={disconnect}
                                        className="p-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-400 hover:text-white transition-all group"
                                        title="Disconnect Wallet"
                                    >
                                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={connect}
                                    disabled={isConnecting || !isWalletInstalled}
                                    className={`hidden sm:flex base-gradient text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all items-center space-x-2 shadow-lg shadow-blue-500/20 ${(!isWalletInstalled || isConnecting) ? 'grayscale cursor-not-allowed opacity-50' : 'hover:opacity-90 active:scale-95'}`}
                                >
                                    <Icons.User />
                                    <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
                                </button>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-white/5 bg-[#0a0b0d] px-6 py-6 space-y-6 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col space-y-4">
                            <Link
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-slate-400 hover:text-white text-lg font-medium"
                            >
                                Explore
                            </Link>
                            <span className="text-slate-400 hover:text-white text-lg font-medium">Analytics</span>
                            <span className="text-slate-400 hover:text-white text-lg font-medium">Docs</span>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            {account ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-white font-mono text-sm">{formatAddress(account)}</span>
                                        </div>
                                        <button
                                            onClick={disconnect}
                                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { connect(); setIsMenuOpen(false); }}
                                    disabled={isConnecting || !isWalletInstalled}
                                    className="w-full base-gradient text-white font-semibold py-4 rounded-xl flex items-center justify-center space-x-2"
                                >
                                    <Icons.User />
                                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;
