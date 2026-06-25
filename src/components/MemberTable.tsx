import React from 'react';
import { Member, PlanId, MembershipStatus } from '../types';
import { PLANS } from '../gymUtils';
import { Edit2, RefreshCw, Trash2, Eye, Search, SlidersHorizontal, Check, AlertCircle, XCircle } from 'lucide-react';

interface MemberTableProps {
  members: Member[];
  onEdit: (member: Member) => void;
  onRenew: (member: Member) => void;
  onViewHistory: (member: Member) => void;
  onDelete: (member: Member) => void;
  darkMode: boolean;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  planFilter: string;
  setPlanFilter: (p: string) => void;
}

export default function MemberTable({
  members,
  onEdit,
  onRenew,
  onViewHistory,
  onDelete,
  darkMode,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  planFilter,
  setPlanFilter
}: MemberTableProps) {
  
  // Render status badge helper
  const renderStatusBadge = (status: MembershipStatus) => {
    if (status === 'Active') {
      return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
          darkMode 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-emerald-500/10 text-emerald-700'
        }`}>
          <Check className="w-3 h-3 stroke-[3]" />
          Active
        </span>
      );
    } else if (status === 'Expired' || status === 'Pending Renewal') {
      return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
          darkMode 
            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
            : 'bg-red-500/10 text-red-700'
        }`}>
          <XCircle className="w-3 h-3 stroke-[3]" />
          Expired / Pending
        </span>
      );
    }
    return null;
  };

  // Human readable plan formatter
  const getPlanName = (pId: PlanId) => {
    return pId === '1_month' ? '1 Month' : pId === '3_months' ? '3 Months' : '6 Months';
  };

  return (
    <div className={`border rounded-3xl overflow-hidden flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Header and Filter Bar */}
      <div className={`p-6 border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${
        darkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-3">
          <h2 className="font-black text-lg tracking-tight">Gym Members</h2>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md font-mono ${
            darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
          }`}>
            {members.length} Total
          </span>
        </div>

        {/* Filters and Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-slate-950 border-slate-800 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired / Pending</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-slate-950 border-slate-800 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="">All Plans</option>
              <option value="1_month">1 Month (₹400)</option>
              <option value="3_months">3 Months (₹1100)</option>
              <option value="6_months">6 Months (₹2200)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-[10px] uppercase font-bold tracking-wider border-b ${
              darkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'
            }`}>
              <th className="px-6 py-4">Member Name</th>
              <th className="px-6 py-4">Membership Plan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Amount Paid</th>
              <th className="px-6 py-4">Expiry Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-slate-800/40' : 'divide-slate-100'}`}>
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                  No gym members found matching criteria
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr 
                  key={member.id} 
                  className={`group transition-colors ${
                    darkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50/50'
                  }`}
                >
                  {/* Name & Mobile */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-tight">{member.fullName}</span>
                      <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        +91 {member.mobile}
                      </span>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold">
                      {getPlanName(member.planId)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {renderStatusBadge(member.status)}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-black font-mono">
                      ₹{member.amountPaid}
                    </span>
                  </td>

                  {/* Expiry */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {member.expiryDate.split('-').reverse().join('-')}
                      </span>
                      <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Joined: {member.joiningDate.split('-').reverse().join('-')}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View History */}
                      <button
                        title="View Complete History"
                        onClick={() => onViewHistory(member)}
                        className={`p-2 rounded-xl transition-colors ${
                          darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        title="Edit Details"
                        onClick={() => onEdit(member)}
                        className={`p-2 rounded-xl transition-colors ${
                          darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Renew */}
                      <button
                        title="Renew Membership"
                        onClick={() => onRenew(member)}
                        className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-xl transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        title="Delete Member"
                        onClick={() => onDelete(member)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
