import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Base Mainnet Constants
const BASE_CHAIN_ID_HEX = '0x2105'; // 8453
const BASE_CHAIN_ID_DECIMAL = 8453;

const AUTH_MESSAGE = "Welcome to da0! Please sign this message to verify your identity and enter the DAO. This signature is free and does not cost any gas.";

interface WalletContextType {
    account: string | null;
    chainId: string | null;
    isCorrectNetwork: boolean;
    isConnecting: boolean;
    isWalletInstalled: boolean;
    connect: () => Promise<void>;
    switchNetwork: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [chainId, setChainId] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isWalletInstalled, setIsWalletInstalled] = useState(true);

    const checkWalletInstallation = useCallback(() => {
        const installed = typeof window !== 'undefined' && !!window.ethereum;
        setIsWalletInstalled(installed);
        return installed;
    }, []);

    const updateAccount = (accounts: string[]) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
        } else {
            setAccount(null);
        }
    };

    const handleChainChanged = (hexChainId: string) => {
        setChainId(hexChainId);
        // As per EIP-1193, it's recommended to reload the page on chain change
        window.location.reload();
    };

    const connect = async () => {
        if (!checkWalletInstallation()) return;

        setIsConnecting(true);
        try {
            // Step 1: Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) throw new Error('No accounts found');
            const targetAccount = accounts[0];

            // Step 2: Request cryptographic signature to prove ownership
            // This prevents "silent" logins and ensures the user actively authorizes the session
            await window.ethereum.request({
                method: 'personal_sign',
                params: [AUTH_MESSAGE, targetAccount],
            });

            // Step 3: Set authenticated state only after successful signature
            setAccount(targetAccount);

            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(currentChainId);
        } catch (error) {
            console.error('Failed to connect or sign:', error);
            // Ensure state is cleared if signature fails or is rejected
            setAccount(null);
        } finally {
            setIsConnecting(false);
        }
    };

    const switchNetwork = async () => {
        if (!window.ethereum) return;
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: BASE_CHAIN_ID_HEX }],
            });
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: BASE_CHAIN_ID_HEX,
                                chainName: 'Base Mainnet',
                                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                                rpcUrls: ['https://mainnet.base.org'],
                                blockExplorerUrls: ['https://basescan.org'],
                            },
                        ],
                    });
                } catch (addError) {
                    console.error('Failed to add Base network:', addError);
                }
            } else {
                console.error('Failed to switch network:', switchError);
            }
        }
    };

    // PART 1 — Wallet Disconnect logic: Simply clear the local account state
    const disconnect = () => {
        setAccount(null);
        // We don't reload the page as per requirements
    };

    useEffect(() => {
        const init = async () => {
            if (checkWalletInstallation()) {
                try {
                    // Detect wallet but DO NOT automatically log in (No silent login)
                    // We only fetch the chainId to show network warnings
                    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
                    setChainId(currentChainId);

                    // Setup listeners for network changes
                    window.ethereum.on('accountsChanged', (accounts: string[]) => {
                        // If accounts change (e.g. user switches in MetaMask), 
                        // we force a logout to require a fresh signature for the new account
                        setAccount(null);
                    });
                    window.ethereum.on('chainChanged', handleChainChanged);
                } catch (error) {
                    console.error('Initialization error:', error);
                }
            }
        };

        init();

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', updateAccount);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [checkWalletInstallation]);

    const isCorrectNetwork = chainId === BASE_CHAIN_ID_HEX;

    return (
        <WalletContext.Provider
            value={{
                account,
                chainId,
                isCorrectNetwork,
                isConnecting,
                isWalletInstalled,
                connect,
                switchNetwork,
                disconnect,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

// Global type for window.ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}
