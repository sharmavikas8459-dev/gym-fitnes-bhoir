import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Member, RenewalRecord, MemberHistory, ActivityLog, GymStats, PlanId } from './types';
import Login from './components/Login';
import DashboardStats from './components/DashboardStats';
import MemberTable from './components/MemberTable';
import MemberModal from './components/MemberModal';
import RenewModal from './components/RenewModal';
import HistoryDrawer from './components/HistoryDrawer';
import ReportsView from './components/ReportsView';
import LogsView from './components/LogsView';

import { 
  Dumbbell, 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  FileText, 
  LogOut, 
  Moon, 
  Sun, 
  Plus, 
  Search, 
  Clock, 
  ShieldAlert, 
  Check, 
  Copy, 
  MessageSquare, 
  PhoneCall, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Authentication & Theme States
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Core Data States
  const [stats, setStats] = useState<GymStats>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    pendingRenewals: 0,
    expiringToday: 0,
    monthlyRevenue: 0
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // Search & Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  // Active Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'reports' | 'logs'>('dashboard');

  // Modals & Drawers States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<MemberHistory[]>([]);
  const [selectedRenewals, setSelectedRenewals] = useState<RenewalRecord[]>([]);

  // Deletion Confirmation Dialog State
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Simulated WhatsApp Notification Bar state (shows the last sent alert)
  const [lastNotification, setLastNotification] = useState<{
    memberName: string;
    mobile: string;
    message: string;
    timestamp: string;
  } | null>(null);
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // On Mount: Check token, load dark mode preference
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      // Token is present, assume logged in
      setUser({
        username: 'bhoir3777',
        name: 'Nitesh Bhoir',
        role: 'Gym Owner'
      });
    }

    const savedTheme = localStorage.getItem('bhoir_gym_theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
    }
    setAuthChecked(true);
  }, []);

  // Fetch core dashboard and lists whenever active tab or search changes
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, activeTab, search, statusFilter, planFilter]);

  const fetchDashboardData = async () => {
    try {
      // In parallel, fetch stats, members list, and logs
      const [fetchedStats, fetchedMembers, fetchedLogs] = await Promise.all([
        api.getStats(),
        api.getMembers({ search, status: statusFilter, planId: planFilter }),
        api.getLogs()
      ]);
      
      setStats(fetchedStats);
      setMembers(fetchedMembers);
      setLogs(fetchedLogs);
    } catch (err: any) {
      console.error("Error loading dashboard metrics:", err);
    }
  };

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    localStorage.setItem('bhoir_gym_theme', nextTheme ? 'dark' : 'light');
  };

  // Register or Update a Member
  const handleSaveMember = async (memberData: {
    fullName: string;
    mobile: string;
    planId: PlanId;
    joiningDate: string;
    amountPaid: number;
  }) => {
    try {
      if (selectedMember) {
        // Edit flow
        await api.updateMember(selectedMember.id, memberData);
      } else {
        // Add flow
        const result = await api.addMember(memberData);
        
        // Show simulated notification alert!
        if (result.smsMessage) {
          setLastNotification({
            memberName: memberData.fullName,
            mobile: memberData.mobile,
            message: result.smsMessage,
            timestamp: new Date().toLocaleTimeString()
          });
          setShowNotificationAlert(true);
        }
      }

      setIsMemberModalOpen(false);
      setSelectedMember(null);
      fetchDashboardData();
    } catch (err: any) {
      alert("Error saving member details: " + err.message);
    }
  };

  // Renew a Member
  const handleRenewMember = async (planId: PlanId, purchaseDate: string, amountPaid: number) => {
    if (!selectedMember) return;
    try {
      const result = await api.renewMember(selectedMember.id, { planId, purchaseDate, amountPaid });
      
      // Update simulated notification alerts
      if (result.smsMessage) {
        setLastNotification({
          memberName: selectedMember.fullName,
          mobile: selectedMember.mobile,
          message: result.smsMessage,
          timestamp: new Date().toLocaleTimeString()
        });
        setShowNotificationAlert(true);
      }

      setIsRenewModalOpen(false);
      setSelectedMember(null);
      fetchDashboardData();
    } catch (err: any) {
      alert("Error processing renewal: " + err.message);
    }
  };

  // View Member History Lifecycle
  const handleViewHistory = async (member: Member) => {
    try {
      const result = await api.getMember(member.id);
      setSelectedMember(result.member);
      setSelectedHistory(result.history);
      setSelectedRenewals(result.renewals);
      setIsHistoryDrawerOpen(true);
    } catch (err: any) {
      alert("Error fetching history details: " + err.message);
    }
  };

  // Initiate Deletion Process (Shows Confirmation Dialog)
  const handleInitiateDelete = (member: Member) => {
    setMemberToDelete(member);
  };

  // Complete Deletion
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      await api.deleteMember(memberToDelete.id);
      setMemberToDelete(null);
      fetchDashboardData();
    } catch (err: any) {
      alert("Error removing member: " + err.message);
    }
  };

  // Copy WhatsApp Receipt text
  const handleCopyNotification = () => {
    if (!lastNotification) return;
    navigator.clipboard.writeText(lastNotification.message);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Dumbbell className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen flex overflow-hidden font-sans transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`w-64 border-r shrink-0 hidden md:flex flex-col backdrop-blur-xl transition-colors duration-300 ${
        darkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Brand Logo */}
        <div className={`p-6 border-b transition-colors duration-300 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
              <Dumbbell className="w-6 h-6 stroke-[2.5] text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-none uppercase">
                Bhoir Fitness
              </h1>
              <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-1 block">
                Gym Admin Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-4 pb-2 tracking-wider">
            Main Desk
          </div>
          <button
            id="nav-dashboard-tab"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-orange-600/15 text-orange-500 border border-orange-500/20 font-bold'
                : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          
          <button
            id="nav-members-tab"
            onClick={() => setActiveTab('members')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'bg-orange-600/15 text-orange-500 border border-orange-500/20 font-bold'
                : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Members Ledger</span>
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-6 pb-2 tracking-wider">
            Financials
          </div>

          <button
            id="nav-reports-tab"
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-orange-600/15 text-orange-500 border border-orange-500/20 font-bold'
                : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Reports & Exports</span>
          </button>

          <button
            id="nav-logs-tab"
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-orange-600/15 text-orange-500 border border-orange-500/20 font-bold'
                : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-100'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Activity Audits</span>
          </button>
        </nav>

        {/* Profile and Logout */}
        <div className={`p-4 border-t transition-colors duration-300 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`p-4 rounded-2xl flex items-center gap-3 ${
            darkMode ? 'bg-slate-950/40' : 'bg-slate-50'
          }`}>
            <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
              NB
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Nitesh Bhoir</p>
              <p className={`text-[10px] truncate ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Gym Owner</p>
            </div>
            <button 
              id="admin-logout-btn"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Header Top Bar */}
        <header className={`h-16 border-b shrink-0 flex items-center justify-between px-6 lg:px-8 transition-colors duration-300 ${
          darkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-100 shadow-sm shadow-slate-100/50'
        }`}>
          {/* Dynamic Search Bar */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border w-64 md:w-96 transition-all focus-within:ring-1 focus-within:ring-orange-500 ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                id="header-search-bar"
                type="text"
                placeholder="Search member name or mobile..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  // Auto focus members tab if admin starts searching from elsewhere
                  if (activeTab !== 'members' && activeTab !== 'reports') {
                    setActiveTab('members');
                  }
                }}
                className="bg-transparent border-none text-xs w-full focus:outline-none focus:ring-0 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Register Member Trigger */}
            <button
              id="register-member-btn"
              onClick={() => {
                setSelectedMember(null);
                setIsMemberModalOpen(true);
              }}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-orange-600/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              NEW REGISTRATION
            </button>
          </div>
        </header>

        {/* Page Tab Contents */}
        <div className="p-6 lg:p-8 space-y-8 flex-1">
          
          {/* Active Navigation Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight leading-none uppercase">
                {activeTab === 'dashboard' ? 'Overview' : activeTab === 'members' ? 'Gym Members Ledger' : activeTab === 'reports' ? 'Auditing reports' : 'System Operations Logs'}
              </h2>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeTab === 'dashboard' 
                  ? 'Active memberships, revenue figures, and gym timings summary.' 
                  : activeTab === 'members' 
                    ? 'Search, edit, renew, or view member lifecycle history logs.' 
                    : activeTab === 'reports' 
                      ? 'Select report type and export professional spreadsheets or PDFs.' 
                      : 'Live technical stream of registrations, renewals, and deletions.'}
              </p>
            </div>
          </div>

          {/* Render Tab Views */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Widgets */}
              <DashboardStats stats={stats} darkMode={darkMode} />

              {/* Gym Info & Quick Timing cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gym Info Panel */}
                <div className={`p-6 rounded-3xl border lg:col-span-2 transition-colors duration-300 ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="font-black text-base tracking-tight mb-4 flex items-center gap-2 text-orange-500">
                    <Dumbbell className="w-5 h-5" />
                    BHOIR FITNESS & GYM PROFILE
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold">
                    <div className="space-y-1">
                      <span className={`block text-xs uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Facility Name</span>
                      <span>Bhoir Fitness & Gym</span>
                    </div>
                    <div className="space-y-1">
                      <span className={`block text-xs uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Managing Owner</span>
                      <span>Nitesh Bhoir</span>
                    </div>
                    <div className="space-y-1">
                      <span className={`block text-xs uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Registered Desk</span>
                      <span>(Owner Contact Number)</span>
                    </div>
                    <div className="space-y-1">
                      <span className={`block text-xs uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Database Connection</span>
                      <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-bold uppercase">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                        Relational JSON DB Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timings Card */}
                <div className={`p-6 rounded-3xl border transition-colors duration-300 ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="font-black text-base tracking-tight mb-4 flex items-center gap-2 text-orange-500">
                    <Clock className="w-5 h-5" />
                    GYM WORK TIMINGS
                  </h3>
                  <div className="space-y-3.5 text-xs font-bold">
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Mon to Sat Morning</span>
                      <span className="text-orange-500">07:00 AM - 12:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Mon to Sat Evening</span>
                      <span className="text-orange-500">05:00 PM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-800/20 pt-2 text-slate-500">
                      <span>Sunday</span>
                      <span className="uppercase text-red-500">Holiday</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent stream on Dashboard */}
              <div className="grid grid-cols-1 gap-6">
                <LogsView logs={logs.slice(0, 5)} darkMode={darkMode} />
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              <MemberTable 
                members={members} 
                onEdit={(m) => {
                  setSelectedMember(m);
                  setIsMemberModalOpen(true);
                }} 
                onRenew={(m) => {
                  setSelectedMember(m);
                  setIsRenewModalOpen(true);
                }} 
                onViewHistory={handleViewHistory} 
                onDelete={handleInitiateDelete} 
                darkMode={darkMode}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                planFilter={planFilter}
                setPlanFilter={setPlanFilter}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <ReportsView members={members} renewals={selectedRenewals} darkMode={darkMode} />
          )}

          {activeTab === 'logs' && (
            <LogsView logs={logs} darkMode={darkMode} />
          )}

        </div>
      </main>

      {/* 3. RIGHT PANEL (LAST NOTIFICATION & COPYSHEET) */}
      <aside className={`w-80 border-l shrink-0 hidden xl:flex flex-col p-6 transition-colors duration-300 ${
        darkMode ? 'bg-slate-950/70 border-slate-800/80' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-orange-500" />
          <h3 className="font-black text-sm tracking-tight uppercase">ALERTS ENGINE</h3>
        </div>

        <p className={`text-xs font-semibold mb-6 leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Simulates and monitors SMS/WhatsApp receipt broadcasts triggered on member purchases & renewals.
        </p>

        {lastNotification ? (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className={`p-4 rounded-2xl border flex-1 flex flex-col justify-between ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/10 pb-2 mb-3">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Simulated Send Success
                </span>
                <span className="text-[9px] font-mono text-slate-500">{lastNotification.timestamp}</span>
              </div>

              {/* Render message template in phone preview style */}
              <div className={`p-4 rounded-xl font-mono text-xs overflow-y-auto whitespace-pre-wrap max-h-96 leading-relaxed flex-1 ${
                darkMode ? 'bg-slate-950 text-slate-300' : 'bg-white border text-slate-700 shadow-inner'
              }`}>
                {lastNotification.message}
              </div>

              {/* Action */}
              <button
                id="copy-whatsapp-text-btn"
                onClick={handleCopyNotification}
                className="w-full mt-4 py-2.5 bg-orange-600/15 hover:bg-orange-600 text-orange-500 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-4 h-4" />
                    COPIED RECEIPT!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    COPY FOR WHATSAPP
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[10px] text-center text-slate-500 leading-snug">
              This message has been generated dynamically based on receipt and logged to activities. You can paste this directly to members' WhatsApp.
            </p>
          </div>
        ) : (
          <div className={`p-6 rounded-2xl border text-center my-auto ${
            darkMode ? 'bg-slate-900/40 border-slate-800/50 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400'
          }`}>
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-xs font-bold uppercase tracking-wide">No alerts generated</p>
            <p className="text-[10px] mt-1 leading-normal">
              Register or renew a member to generate and inspect WhatsApp templates here.
            </p>
          </div>
        )}
      </aside>

      {/* 4. DIALOGS & MODALS */}
      
      {/* Add / Edit Member Modal */}
      <MemberModal 
        member={selectedMember} 
        isOpen={isMemberModalOpen} 
        onClose={() => {
          setIsMemberModalOpen(false);
          setSelectedMember(null);
        }} 
        onSubmit={handleSaveMember} 
        darkMode={darkMode}
      />

      {/* Renew Member Modal */}
      <RenewModal 
        member={selectedMember} 
        isOpen={isRenewModalOpen} 
        onClose={() => {
          setIsRenewModalOpen(false);
          setSelectedMember(null);
        }} 
        onRenew={handleRenewMember} 
        darkMode={darkMode}
      />

      {/* History Drawer Details */}
      <HistoryDrawer 
        member={selectedMember} 
        history={selectedHistory} 
        renewals={selectedRenewals} 
        isOpen={isHistoryDrawerOpen} 
        onClose={() => {
          setIsHistoryDrawerOpen(false);
          setSelectedMember(null);
          setSelectedHistory([]);
          setSelectedRenewals([]);
        }} 
        darkMode={darkMode}
      />

      {/* Confirmation Dialog for Member Deletion */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMemberToDelete(null)}></div>
          <div className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl z-10 transition-colors duration-300 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <ShieldAlert className="w-6 h-6 stroke-[2]" />
              <h3 className="text-lg font-black tracking-tight">Confirm Deletion</h3>
            </div>
            
            <p className="text-xs leading-relaxed mb-6 font-semibold">
              Are you sure you want to permanently remove member <strong className="text-red-500">"{memberToDelete.fullName}"</strong> from Bhoir Fitness database? This action is irreversible and will also purge their lifecycle history.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-colors ${
                  darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Yes, Delete Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating In-App WhatsApp Notification Toast */}
      {showNotificationAlert && lastNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 bg-orange-600 text-white rounded-2xl shadow-2xl flex flex-col gap-2 animate-bounce">
          <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider">SMS / WhatsApp Prepared</span>
            <button 
              onClick={() => setShowNotificationAlert(false)} 
              className="text-white/60 hover:text-white text-xs font-black p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] leading-snug">
            Receipt generated successfully for <strong>{lastNotification.memberName}</strong> (+91 {lastNotification.mobile}). Check details in the right side panel to copy message.
          </p>
        </div>
      )}

    </div>
  );
}
