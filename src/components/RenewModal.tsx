import React, { useState, useEffect } from 'react';
import { Member, PlanId } from '../types';
import { PLANS, calculateExpiryDate } from '../gymUtils';
import { X, Calendar, DollarSign, RefreshCw, Check } from 'lucide-react';

interface RenewModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onRenew: (planId: PlanId, purchaseDate: string, amountPaid: number) => void;
  darkMode: boolean;
}

export default function RenewModal({ member, isOpen, onClose, onRenew, darkMode }: RenewModalProps) {
  const [planId, setPlanId] = useState<PlanId>('1_month');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(400);
  const [calculatedExpiry, setCalculatedExpiry] = useState('');
  const [extensionSource, setExtensionSource] = useState<'current_expiry' | 'purchase_date'>('purchase_date');

  // Set default values when modal opens or member changes
  useEffect(() => {
    if (isOpen && member) {
      setPlanId(member.planId);
      // default purchase date to today
      const today = new Date().toISOString().split('T')[0];
      setPurchaseDate(today);
      setAmountPaid(PLANS[member.planId].price);
    }
  }, [member, isOpen]);

  // Dynamic expiry calculation
  useEffect(() => {
    if (member && purchaseDate && planId) {
      const todayStr = new Date().toISOString().split('T')[0];
      
      // If current expiry is in the future, extend from current expiry date.
      // Otherwise, extend from purchase date.
      const isCurrentlyActive = member.expiryDate >= todayStr;
      const startPoint = isCurrentlyActive ? member.expiryDate : purchaseDate;
      
      setExtensionSource(isCurrentlyActive ? 'current_expiry' : 'purchase_date');
      const expiry = calculateExpiryDate(startPoint, planId);
      setCalculatedExpiry(expiry);
    }
  }, [member, purchaseDate, planId]);

  // Handle plan selection to update amount paid
  const handlePlanChange = (selectedPlan: PlanId) => {
    setPlanId(selectedPlan);
    setAmountPaid(PLANS[selectedPlan].price);
  };

  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseDate || amountPaid === undefined) {
      alert('Please fill in all required fields');
      return;
    }
    onRenew(planId, purchaseDate, Number(amountPaid));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className={`relative w-full max-w-lg p-8 rounded-3xl border shadow-2xl z-10 transition-colors duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:text-slate-300 hover:bg-slate-800/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Renew Membership</h3>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Member: <span className="font-bold text-orange-500">{member.fullName}</span> (+91 {member.mobile})
            </p>
          </div>
        </div>

        {/* Info box about current status */}
        <div className={`p-4 rounded-2xl mb-5 text-xs border ${
          member.status === 'Active' 
            ? (darkMode ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800')
            : (darkMode ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-red-500/5 border-red-500/10 text-red-800')
        }`}>
          {member.status === 'Active' ? (
            <p>
              🛡️ Member is currently <strong>Active</strong> until <strong>{member.expiryDate.split('-').reverse().join('-')}</strong>. 
              The renewed plan will seamlessly <strong>extend</strong> starting from this existing expiry date.
            </p>
          ) : (
            <p>
              ⚠️ Member is currently <strong>Expired</strong> (expired on {member.expiryDate.split('-').reverse().join('-')}). 
              The renewed plan will start from the specified <strong>Purchase Date</strong>.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Plan Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                New Plan *
              </label>
              <select
                id="renew-plan"
                value={planId}
                onChange={(e) => handlePlanChange(e.target.value as PlanId)}
                className={`w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="1_month">1 Month (₹400)</option>
                <option value="3_months">3 Months (₹1100)</option>
                <option value="6_months">6 Months (₹2200)</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Renewal Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  id="renew-amount"
                  type="number"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className={`w-full pl-9 pr-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-white font-mono' 
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Purchase/Renew Date *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  id="renew-purchase-date"
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Extended Expiry Date
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  disabled
                  value={calculatedExpiry ? calculatedExpiry.split('-').reverse().join('-') : 'Calculating...'}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm border font-semibold ${
                    darkMode 
                      ? 'bg-slate-900/50 border-slate-800 text-orange-400 font-mono' 
                      : 'bg-slate-100 border-slate-200 text-orange-600 font-mono'
                  }`}
                />
              </div>
            </div>
          </div>

          <p className={`text-[10px] italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            * Renewing will automatically compose and simulate WhatsApp/SMS alerts with receipt details to the member.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3.5 rounded-2xl text-sm font-bold border transition-colors ${
                darkMode 
                  ? 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
            <button
              id="submit-renewal-btn"
              type="submit"
              className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Process Renewal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
