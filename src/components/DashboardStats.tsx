import React from 'react';
import { GymStats } from '../types';
import { Users, UserCheck, UserMinus, AlertTriangle, IndianRupee, Activity } from 'lucide-react';

interface DashboardStatsProps {
  stats: GymStats;
  darkMode: boolean;
}

export default function DashboardStats({ stats, darkMode }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Active Members',
      value: stats.activeMembers,
      sub: `${((stats.activeMembers / (stats.totalMembers || 1)) * 100).toFixed(0)}% of total`,
      icon: UserCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Expiring Today',
      value: stats.expiringToday,
      sub: stats.expiringToday > 0 ? 'Action required' : 'All clear today',
      icon: AlertTriangle,
      color: stats.expiringToday > 0 ? 'text-orange-500 font-bold' : 'text-slate-400',
      bgColor: stats.expiringToday > 0 ? 'bg-orange-500/10' : 'bg-slate-500/5',
      borderColor: stats.expiringToday > 0 ? 'border-orange-500/20' : 'border-slate-800/10',
      highlight: stats.expiringToday > 0
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue}`,
      sub: `${new Date().toLocaleString('default', { month: 'long' })} bookings`,
      icon: IndianRupee,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    {
      title: 'Expired / Pending',
      value: stats.expiredMembers,
      sub: `${stats.pendingRenewals} renewals pending`,
      icon: UserMinus,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`relative p-6 rounded-3xl border transition-all duration-300 overflow-hidden ${
              darkMode
                ? 'bg-slate-900 border-slate-800/80 shadow-lg'
                : 'bg-white border-slate-200/80 shadow-sm shadow-slate-100'
            } ${card.highlight && darkMode ? 'ring-1 ring-orange-500/30' : ''}`}
          >
            {/* Glowing background bubble */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl -z-10 ${
              darkMode ? 'opacity-30' : 'opacity-10'
            } ${card.color.includes('emerald') ? 'bg-emerald-500' : card.color.includes('orange') ? 'bg-orange-500' : card.color.includes('red') ? 'bg-red-500' : 'bg-slate-500'}`}></div>

            <div className="flex items-start justify-between mb-4">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                darkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {card.title}
              </span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bgColor} ${card.color}`}>
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight">
                {card.value}
              </span>
            </div>
            
            <p className={`text-xs mt-2 font-medium ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {card.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
