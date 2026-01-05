
import React from 'react';
import { DAO, Proposal } from './types';

export const MOCK_DAOS: DAO[] = [
  {
    id: 'base-guild',
    name: 'Base Guild',
    description: 'The primary governance body for the Base ecosystem community development.',
    logo: 'https://picsum.photos/seed/base1/200',
    proposalsCount: 24,
    membersCount: 15400,
    bannerGradient: 'from-blue-600 to-indigo-900',
  },
  {
    id: 'degen-dao',
    name: 'Degen DAO',
    description: 'A community-led fund for experimental projects built exclusively on Base.',
    logo: 'https://picsum.photos/seed/degen/200',
    proposalsCount: 12,
    membersCount: 8200,
    bannerGradient: 'from-purple-600 to-pink-900',
  },
  {
    id: 'stable-base',
    name: 'StableBase',
    description: 'Protocol governance for the premiere yield-bearing stablecoin on Base.',
    logo: 'https://picsum.photos/seed/stable/200',
    proposalsCount: 45,
    membersCount: 3200,
    bannerGradient: 'from-emerald-600 to-teal-900',
  },
  {
    id: 'blue-ocean',
    name: 'Blue Ocean',
    description: 'Managing liquidity incentives for the Blue Ocean decentralized exchange.',
    logo: 'https://picsum.photos/seed/ocean/200',
    proposalsCount: 8,
    membersCount: 1200,
    bannerGradient: 'from-sky-600 to-blue-900',
  },
];

export const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    daoId: 'base-guild',
    title: 'BIP-24: Community Grant Allocation for Q3 2024',
    description: 'This proposal outlines the distribution of 50,000 USDC across 12 approved community projects focused on developer tooling and educational content on Base.',
    status: 'Active',
    endDate: '2 days left',
    voteCount: 4200,
    author: '0x1234...5678',
    quorum: 15,
    choices: [
      { name: 'Yes, approve allocation', percentage: 78 },
      { name: 'No, reject allocation', percentage: 15 },
      { name: 'Abstain', percentage: 7 },
    ]
  },
  {
    id: 'prop-2',
    daoId: 'base-guild',
    title: 'BIP-23: Strategic Partnership with Optimism Collective',
    description: 'Formalizing the shared sequencer revenue model and cross-chain governance participation with the Optimism ecosystem.',
    status: 'Closed',
    endDate: 'Ended 1 week ago',
    voteCount: 12500,
    author: '0xabcd...efgh',
    quorum: 20,
    choices: [
      { name: 'Yes', percentage: 92 },
      { name: 'No', percentage: 3 },
      { name: 'Abstain', percentage: 5 },
    ]
  },
  {
    id: 'prop-3',
    daoId: 'degen-dao',
    title: 'DDAO-12: New NFT Marketplace Listing Fee Policy',
    description: 'Reduce listing fees from 2.5% to 1.5% for verified collections on the Base Degen Marketplace to increase trading volume.',
    status: 'Active',
    endDate: '5 hours left',
    voteCount: 890,
    author: '0x9999...8888',
    quorum: 5,
    choices: [
      { name: 'Agree', percentage: 60 },
      { name: 'Disagree', percentage: 35 },
      { name: 'Abstain', percentage: 5 },
    ]
  }
];

export const Icons = {
  Logo: ({ className = "w-10 h-10" }: { className?: string }) => (
    <svg 
      viewBox="0 0 100 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      <text 
        x="0" 
        y="32" 
        fill="url(#logo-grad)" 
        className="font-black" 
        style={{ 
          fontSize: '36px', 
          fontFamily: 'Inter, sans-serif',
          letterSpacing: '-2px',
          fontVariantNumeric: 'slashed-zero'
        }}
      >
        da0
      </text>
    </svg>
  ),
  Base: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      <circle cx="12" cy="12" r="10" fill="#0052FF"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};
