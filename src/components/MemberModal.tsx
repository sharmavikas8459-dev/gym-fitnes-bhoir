import React, { useState, useEffect } from 'react';
import { Member, PlanId } from '../types';
import { PLANS, calculateExpiryDate } from '../gymUtils';
import { X, Calendar, DollarSign, User, Phone, Check } from 'lucide-react';

interface MemberModalProps {
  member: Member | null; // null means "Add New", otherwise "Edit"
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: {
    fullName: string;
    mobile: string;
    planId: PlanId;
    joiningDate: string;
    amountPaid: number;
  }) => void;
  darkMode: boolean;
}

export default function MemberModal({ member, isOpen, onClose, onSubmit, darkMode }: MemberModalProps) {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [planId, setPlanId] = useState<PlanId>('1_month');
  const [joiningDate, setJoiningDate] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(400);
  const [calculatedExpiry, setCalculatedExpiry] = useState('');

  // Set default values when modal opens or member changes
  useEffect(() => {
    if (isOpen) {
      if (member) {
        setFullName(member.fullName);
        setMobile(member.mobile);
        setPlanId(member.planId);
        setJoiningDate(member.joiningDate);
        setAmountPaid(member.amountPaid);
      } else {
        setFullName('');
        setMobile('');
        setPlanId('1_month');
        // default to today's local date
        const today = new Date().toISOString().split('T')[0];
        setJoiningDate(today);
        setAmountPaid(400);
      }
    }
  }, [member, isOpen]);

  // Dynamic expiry date and price calculation based on plan/joining date
  useEffect(() => {
    if (joiningDate && planId) {
      const expiry = calculateExpiryDate(joiningDate, planId);
      setCalculatedExpiry(expiry);

      // Auto update amountPaid ONLY if we are adding a NEW member
      if (!member) {
        setAmountPaid(PLANS[planId].price);
      }
    }
  }, [joiningDate, planId, member]);

  // Handle plan change to set default price
  const handlePlanChange = (selectedPlan: PlanId) => {
    setPlanId(selectedPlan);
    setAmountPaid(PLANS[selectedPlan].price);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobile || !joiningDate || amountPaid === undefined) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit({
      fullName,
      mobile,
      planId,
      joiningDate,
      amountPaid: Number(amountPaid)
    });
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

        <h3 className="text-xl font-black tracking-tight mb-6">
          {member ? 'Edit Member Details' : 'Register New Gym Member'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Full Name *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="member-fullname"
                type="text"
                required
                placeholder="Enter member's full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Mobile Number (10 digits) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                id="member-mobile"
                type="tel"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-slate-950 border-slate-800 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Plan & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Membership Plan *
              </label>
              <select
                id="member-plan"
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
                Amount Paid (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  id="member-amount-paid"
                  type="number"
                  required
                  placeholder="Cost"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className={`w-full pl-9 pr-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-white font-mono' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 font-mono'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Joining Date & Auto-Calculated Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Joining Date *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  id="member-joining-date"
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
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
                Auto Expiry Date
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
                      ? 'bg-slate-900/50 border-slate-800 text-orange-400' 
                      : 'bg-slate-100 border-slate-200 text-orange-600'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
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
              id="submit-member-btn"
              type="submit"
              className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-500 active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {member ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
