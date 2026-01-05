
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DAODetail from './pages/DAODetail';
import ProposalDetail from './pages/ProposalDetail';
import CreateProposal from './pages/CreateProposal';
import { Icons } from './constants';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col selection:bg-blue-500/30 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dao/:daoId" element={<DAODetail />} />
            <Route path="/dao/:daoId/proposal/:proposalId" element={<ProposalDetail />} />
            <Route path="/dao/:daoId/create" element={<CreateProposal />} />
          </Routes>
        </main>
        <footer className="py-16 px-6 border-t border-white/5 bg-[#08090a]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
              <div className="flex flex-col items-center md:items-start space-y-4">
                <Icons.Logo className="w-28 h-10 opacity-80 grayscale hover:grayscale-0 transition-all duration-300" />
                <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
                  The definitive governance layer for communities built on Base. Transparent, native, and efficient.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest">Platform</h4>
                  <ul className="space-y-2 text-slate-500 text-sm">
                    <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Explorer</span></li>
                    <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Analytics</span></li>
                    <li><span className="hover:text-blue-400 cursor-pointer transition-colors">API</span></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest">Community</h4>
                  <ul className="space-y-2 text-slate-500 text-sm">
                    <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Discord</span></li>
                    <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Twitter (X)</span></li>
                    <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Blog</span></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest">Legal</h4>
                  <ul className="space-y-2 text-slate-500 text-sm">
                    <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Privacy</span></li>
                    <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Terms</span></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-slate-600 text-xs gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-500 slashed-zero tracking-tighter">da0</span>
                <span>© 2024 Base Governance Protocol. All rights reserved.</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> All Systems Operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
