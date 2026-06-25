import React from 'react';
import { Member, MemberHistory, RenewalRecord } from '../types';
import { PLANS } from '../gymUtils';
import { X, Calendar, DollarSign, Clock, User, Award, ArrowUpRight, ShieldCheck, History } from 'lucide-react';

interface HistoryDrawerProps {
  member: Member | null;
  history: MemberHistory[];
  renewals: RenewalRecord[];
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function HistoryDrawer({ member, history, renewals, isOpen, onClose, darkMode }: HistoryDrawerProps) {
  if (!isOpen || !member) return null;

  const getPlanName = (pId: any) => {
    return pId === '1_month' ? '1 Month' : pId === '3_months' ? '3 Months' : '6 Months';
  };

  // Human readable date converter
  const formatD = (dStr: string) => {
    if (!dStr) return '';
    return dStr.split('-').reverse().join('-');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Sliding Panel */}
        <div className={`w-screen max-w-xl flex flex-col h-full shadow-2xl transition-transform duration-300 transform translate-x-0 ${
          darkMode ? 'bg-slate-900 border-l border-slate-800 text-white' : 'bg-white border-l border-slate-200 text-slate-900'
        }`}>
          {/* Header */}
          <div className={`p-6 border-b flex items-center justify-between ${
            darkMode ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Member Lifecycle History</h2>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Record audit and plan transactions
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-300 hover:bg-slate-800/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Quick Profile Summary */}
            <div className={`p-6 rounded-3xl border ${
              darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-600/20">
                  {member.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">{member.fullName}</h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Mobile: +91 {member.mobile}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    member.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {member.status === 'Active' ? 'Active' : 'Expired'}
                  </span>
                </div>
              </div>

              {/* Bento fields */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-900/60' : 'bg-white shadow-sm'}`}>
                  <span className={`block font-semibold mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Current Plan</span>
                  <span className="font-bold text-sm text-orange-500">{getPlanName(member.planId)} (₹{member.amountPaid})</span>
                </div>
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-900/60' : 'bg-white shadow-sm'}`}>
                  <span className={`block font-semibold mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Expiry Date</span>
                  <span className="font-bold text-sm">{formatD(member.expiryDate)}</span>
                </div>
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-900/60' : 'bg-white shadow-sm'}`}>
                  <span className={`block font-semibold mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Registered On</span>
                  <span className="font-bold">{formatD(member.joiningDate)}</span>
                </div>
                <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-900/60' : 'bg-white shadow-sm'}`}>
                  <span className={`block font-semibold mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Database ID</span>
                  <span className="font-mono text-[10px]">{member.id}</span>
                </div>
              </div>
            </div>

            {/* Timeline Audit Logs */}
            <div>
              <h4 className="text-xs uppercase font-black tracking-wider mb-4 text-slate-500">
                Action Log & Audit Trail
              </h4>
              <div className="relative border-l-2 pl-6 ml-3 space-y-6 border-slate-800">
                
                {history.map((item, index) => {
                  // Determine icon/color for history type
                  let typeColor = 'bg-slate-800 text-slate-400';
                  let borderCol = 'border-slate-800';
                  if (item.type === 'registration') {
                    typeColor = 'bg-orange-500/10 text-orange-400';
                    borderCol = 'border-orange-500/20';
                  } else if (item.type === 'renewal') {
                    typeColor = 'bg-emerald-500/10 text-emerald-400';
                    borderCol = 'border-emerald-500/20';
                  } else if (item.type === 'edit') {
                    typeColor = 'bg-blue-500/10 text-blue-400';
                    borderCol = 'border-blue-500/20';
                  }

                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[32px] top-1.5 w-4 h-4 rounded-full border-2 bg-slate-900 flex items-center justify-center ${
                        item.type === 'registration' ? 'border-orange-500' : item.type === 'renewal' ? 'border-emerald-500' : 'border-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.type === 'registration' ? 'bg-orange-500' : item.type === 'renewal' ? 'bg-emerald-500' : 'bg-slate-500'
                        }`}></span>
                      </span>

                      {/* Content block */}
                      <div className={`p-4 rounded-2xl border transition-all ${
                        darkMode ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${typeColor}`}>
                            {item.type}
                          </span>
                          <span className={`text-[10px] font-mono ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {formatD(item.date)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold leading-relaxed mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Renewals Ledger */}
            <div>
              <h4 className="text-xs uppercase font-black tracking-wider mb-3 text-slate-500">
                Payment & Renewal Ledger
              </h4>
              {renewals.length === 0 ? (
                <p className={`text-xs italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  No secondary renewals recorded yet.
                </p>
              ) : (
                <div className={`border rounded-2xl overflow-hidden ${
                  darkMode ? 'border-slate-800 bg-slate-950/20' : 'border-slate-100 bg-slate-50/50'
                }`}>
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                        <th className="px-4 py-2 font-bold">Purchase Date</th>
                        <th className="px-4 py-2 font-bold">Plan</th>
                        <th className="px-4 py-2 font-bold">Expiry Date</th>
                        <th className="px-4 py-2 font-bold text-right">Paid Amount</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                      {renewals.map((r) => (
                        <tr key={r.id} className={darkMode ? 'hover:bg-slate-900/50' : 'hover:bg-white'}>
                          <td className="px-4 py-3">{formatD(r.purchaseDate)}</td>
                          <td className="px-4 py-3 font-semibold">{getPlanName(r.planId)}</td>
                          <td className="px-4 py-3">{formatD(r.expiryDate)}</td>
                          <td className="px-4 py-3 font-black text-right font-mono text-emerald-500">₹{r.amountPaid}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Footer note */}
          <div className={`p-6 border-t text-center text-xs ${
            darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'
          }`}>
            Audited records for Bhoir Fitness & Gym
          </div>
        </div>
      </div>
    </div>
  );
}
