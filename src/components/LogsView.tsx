import React from 'react';
import { ActivityLog } from '../types';
import { UserPlus, RefreshCw, Edit, Trash2, Calendar, ShieldCheck, Mail } from 'lucide-react';

interface LogsViewProps {
  logs: ActivityLog[];
  darkMode: boolean;
}

export default function LogsView({ logs, darkMode }: LogsViewProps) {
  
  const getLogIcon = (category: string) => {
    switch (category) {
      case 'member_add':
        return {
          icon: UserPlus,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10'
        };
      case 'member_renew':
        return {
          icon: RefreshCw,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10'
        };
      case 'member_edit':
        return {
          icon: Edit,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10'
        };
      case 'member_delete':
        return {
          icon: Trash2,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10'
        };
      default:
        return {
          icon: Calendar,
          color: 'text-slate-400',
          bgColor: 'bg-slate-500/10'
        };
    }
  };

  const formatTimestamp = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + date.toLocaleDateString('en-IN');
    } catch {
      return isoStr;
    }
  };

  return (
    <div className={`border rounded-3xl overflow-hidden transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="p-6 border-b flex items-center justify-between border-slate-800/20">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-base tracking-tight">Recent Activity Log</h3>
          <span className={`text-[9px] px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wider ${
            darkMode ? 'bg-orange-600/10 text-orange-400' : 'bg-orange-50 text-orange-600'
          }`}>
            Live Audit Stream
          </span>
        </div>
      </div>

      <div className={`divide-y divide-slate-800/10 ${darkMode ? 'divide-slate-800/40' : 'divide-slate-100'}`}>
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No activities recorded in this session.
          </div>
        ) : (
          logs.map((log) => {
            const style = getLogIcon(log.category);
            const LogIcon = style.icon;
            return (
              <div 
                key={log.id} 
                className={`p-4 flex items-start gap-4 transition-colors ${
                  darkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Event Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bgColor} ${style.color}`}>
                  <LogIcon className="w-5 h-5 stroke-[2]" />
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">
                    {log.description}
                  </p>
                  <p className={`text-[10px] mt-0.5 font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Category: <span className="uppercase font-bold">{log.category.replace('_', ' ')}</span>
                  </p>
                </div>

                {/* Event Timestamp */}
                <span className={`text-[10px] font-mono whitespace-nowrap shrink-0 pt-1 ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
