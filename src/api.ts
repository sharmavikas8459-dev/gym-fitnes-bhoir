import { Member, RenewalRecord, MemberHistory, ActivityLog, GymStats, PlanId, MembershipStatus } from './types';
import { PLANS, calculateExpiryDate } from './gymUtils';

const API_BASE = '/api';

// --- INITIAL SEED DATA FOR LOCAL FALLBACK ---
const INITIAL_SEED = {
  members: [
    {
      id: "mem_1",
      fullName: "Rahul Sharma",
      mobile: "9823456789",
      planId: "3_months" as PlanId,
      joiningDate: "2026-03-24",
      expiryDate: "2026-09-24",
      amountPaid: 1100,
      status: "Active" as MembershipStatus,
      createdAt: "2026-03-24T09:00:00.000Z"
    },
    {
      id: "mem_2",
      fullName: "Amit Patil",
      mobile: "8876543210",
      planId: "1_month" as PlanId,
      joiningDate: "2026-05-25",
      expiryDate: "2026-06-25",
      amountPaid: 400,
      status: "Expired" as MembershipStatus,
      createdAt: "2026-05-25T10:30:00.000Z"
    },
    {
      id: "mem_3",
      fullName: "Sneha Kulkarni",
      mobile: "7654321098",
      planId: "6_months" as PlanId,
      joiningDate: "2025-11-15",
      expiryDate: "2026-05-15",
      amountPaid: 2200,
      status: "Expired" as MembershipStatus,
      createdAt: "2025-11-15T16:45:00.000Z"
    },
    {
      id: "mem_4",
      fullName: "Vivek More",
      mobile: "9123454321",
      planId: "3_months" as PlanId,
      joiningDate: "2026-04-15",
      expiryDate: "2026-07-15",
      amountPaid: 1100,
      status: "Active" as MembershipStatus,
      createdAt: "2026-04-15T07:15:00.000Z"
    }
  ] as Member[],
  renewals: [
    {
      id: "ren_1",
      memberId: "mem_1",
      planId: "3_months" as PlanId,
      purchaseDate: "2026-06-24",
      expiryDate: "2026-09-24",
      amountPaid: 1100,
      timestamp: "2026-06-24T11:00:00.000Z"
    }
  ] as RenewalRecord[],
  history: [
    {
      id: "hist_1",
      memberId: "mem_1",
      type: "registration" as const,
      date: "2026-03-24",
      description: "Registered as a new member with 3 Months plan (₹1100)"
    },
    {
      id: "hist_2",
      memberId: "mem_1",
      type: "renewal" as const,
      date: "2026-06-24",
      description: "Renewed membership for 3 Months plan (₹1100). Expiry extended to 24-09-2026."
    },
    {
      id: "hist_3",
      memberId: "mem_2",
      type: "registration" as const,
      date: "2026-05-25",
      description: "Registered as a new member with 1 Month plan (₹400)"
    },
    {
      id: "hist_4",
      memberId: "mem_3",
      type: "registration" as const,
      date: "2025-11-15",
      description: "Registered as a new member with 6 Months plan (₹2200)"
    },
    {
      id: "hist_5",
      memberId: "mem_4",
      type: "registration" as const,
      date: "2026-04-15",
      description: "Registered as a new member with 3 Months plan (₹1100)"
    }
  ] as MemberHistory[],
  logs: [
    {
      id: "log_1",
      timestamp: "2026-03-24T09:05:00.000Z",
      category: "member_add",
      description: "New member Rahul Sharma added to Bhoir Fitness",
      memberName: "Rahul Sharma"
    },
    {
      id: "log_2",
      timestamp: "2025-11-15T16:50:00.000Z",
      category: "member_add",
      description: "New member Sneha Kulkarni added to Bhoir Fitness",
      memberName: "Sneha Kulkarni"
    },
    {
      id: "log_3",
      timestamp: "2026-06-24T11:05:00.000Z",
      category: "member_renew",
      description: "Rahul Sharma renewed for 3 Months plan (₹1100)",
      memberName: "Rahul Sharma"
    }
  ] as ActivityLog[]
};

// --- HELPER STORAGE FUNCTIONS ---
function getLocalDB() {
  const dbStr = localStorage.getItem('bhoir_gym_db');
  if (!dbStr) {
    localStorage.setItem('bhoir_gym_db', JSON.stringify(INITIAL_SEED));
    return INITIAL_SEED;
  }
  try {
    return JSON.parse(dbStr);
  } catch {
    return INITIAL_SEED;
  }
}

function saveLocalDB(db: typeof INITIAL_SEED) {
  localStorage.setItem('bhoir_gym_db', JSON.stringify(db));
}

function getAutoStatus(expiryDateStr: string): MembershipStatus {
  const todayStr = new Date().toISOString().split('T')[0];
  return expiryDateStr >= todayStr ? 'Active' : 'Expired';
}

function formatToIndianDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

function generateReceiptMessage(memberName: string, mobile: string, planName: string, price: number, purchaseDate: string, expiryDate: string) {
  const purchaseFormatted = formatToIndianDate(purchaseDate);
  const expiryFormatted = formatToIndianDate(expiryDate);
  
  return `Welcome to Bhoir Fitness & Gym.

Member Name: ${memberName}
Plan: ${planName} (₹${price})
Purchase Date: ${purchaseFormatted}
Expiry Date: ${expiryFormatted}

Thank you for joining Bhoir Fitness & Gym.
For support, contact Nitesh Bhoir.`;
}

// --- HYBRID ROUTER TRIGGER ---
let useFallback = localStorage.getItem('bhoir_gym_use_local_fallback') === 'true';

function setFallbackMode(val: boolean) {
  useFallback = val;
  if (val) {
    localStorage.setItem('bhoir_gym_use_local_fallback', 'true');
    console.warn('⚡ API Server is unreachable or static. Switched automatically to offline Client-Side Local Storage Fallback.');
  } else {
    localStorage.removeItem('bhoir_gym_use_local_fallback');
  }
}

function getHeaders() {
  const token = localStorage.getItem('bhoir_gym_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// Helper wrapper to run server calls with transparent client fallback on failure
async function request<T>(apiCall: () => Promise<T>, fallbackCall: () => T): Promise<T> {
  if (useFallback) {
    return fallbackCall();
  }
  try {
    const result = await apiCall();
    return result;
  } catch (err: any) {
    // If the error indicates a non-JSON structure or fetch failure (DNS/offline/404 HTML response)
    const isFetchFail = err instanceof TypeError || err.message?.includes('fetch') || err.message?.includes('NetworkError');
    const isHTMLResponse = err.message?.includes('Unexpected token') || err.message?.includes('is not valid JSON');
    
    if (isFetchFail || isHTMLResponse) {
      setFallbackMode(true);
      return fallbackCall();
    }
    throw err;
  }
}

// --- EXPORTED API CLIENT WITH TRANSPARENT COMPATIBILITY ---
export const api = {
  setToken(token: string) {
    localStorage.setItem('bhoir_gym_token', token);
  },

  getToken() {
    return localStorage.getItem('bhoir_gym_token');
  },

  logout() {
    localStorage.removeItem('bhoir_gym_token');
    // Also reset fallback mode just in case they re-attempt with a live backend in the future
    localStorage.removeItem('bhoir_gym_use_local_fallback');
    useFallback = false;
  },

  async login(username: string, password: string) {
    return request(
      async () => {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('Non-JSON response from server');
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        if (data.token) {
          this.setToken(data.token);
        }
        return data;
      },
      () => {
        const lowerUser = username.toLowerCase();
        if (lowerUser === 'bhoir3777' && password === 'swara3777') {
          const token = 'bhoir_secure_token_' + Date.now();
          this.setToken(token);
          return {
            success: true,
            token,
            user: {
              username: 'bhoir3777',
              name: 'Nitesh Bhoir',
              role: 'Gym Owner'
            }
          };
        } else {
          throw new Error('Invalid username or password');
        }
      }
    );
  },

  async getStats(): Promise<GymStats> {
    return request(
      async () => {
        const res = await fetch(`${API_BASE}/stats`, { headers: getHeaders() });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Non-JSON response');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
        return data;
      },
      () => {
        const db = getLocalDB();
        const todayStr = new Date().toISOString().split('T')[0];
        
        let totalMembers = 0;
        let activeMembers = 0;
        let expiredMembers = 0;
        let pendingRenewals = 0;
        let expiringToday = 0;
        let monthlyRevenue = 0;

        const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM

        db.members.forEach((m) => {
          totalMembers++;
          const status = getAutoStatus(m.expiryDate);
          if (status === 'Active') {
            activeMembers++;
          } else {
            expiredMembers++;
            pendingRenewals++;
          }
          if (m.expiryDate === todayStr) {
            expiringToday++;
          }
        });

        // registrations revenue this month
        db.members.forEach((m) => {
          if (m.joiningDate.startsWith(currentYearMonth)) {
            monthlyRevenue += m.amountPaid;
          }
        });

        // renewals revenue this month
        db.renewals.forEach((r) => {
          if (r.purchaseDate.startsWith(currentYearMonth)) {
            monthlyRevenue += r.amountPaid;
          }
        });

        return {
          totalMembers,
          activeMembers,
          expiredMembers,
          pendingRenewals,
          expiringToday,
          monthlyRevenue
        };
      }
    );
  },

  async getMembers(filters?: { search?: string; status?: string; planId?: string }): Promise<Member[]> {
    return request(
      async () => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.planId) params.append('planId', filters.planId);

        const res = await fetch(`${API_BASE}/members?${params.toString()}`, { headers: getHeaders() });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Non-JSON response');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch members');
        return data;
      },
      () => {
        const db = getLocalDB();
        let list = db.members.map((m) => {
          const compStatus = getAutoStatus(m.expiryDate);
          if (m.status !== compStatus) {
            m.status = compStatus;
          }
          return m;
        });

        // Save status corrections back to DB
        saveLocalDB(db);

        if (filters?.search) {
          const s = filters.search.toLowerCase();
          list = list.filter((m) => m.fullName.toLowerCase().includes(s) || m.mobile.includes(s));
        }

        if (filters?.status) {
          if (filters.status === 'Active') {
            list = list.filter((m) => m.status === 'Active');
          } else {
            list = list.filter((m) => m.status === 'Expired');
          }
        }

        if (filters?.planId) {
          list = list.filter((m) => m.planId === filters.planId);
        }

        return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    );
  },

  async getMember(id: string): Promise<{ member: Member; history: MemberHistory[]; renewals: RenewalRecord[] }> {
    return request(
      async () => {
        const res = await fetch(`${API_BASE}/members/${id}`, { headers: getHeaders() });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Non-JSON response');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch member details');
        return data;
      },
      () => {
        const db = getLocalDB();
        const member = db.members.find((m) => m.id === id);
        if (!member) throw new Error('Member not found');
        
        member.status = getAutoStatus(member.expiryDate);
        
        const history = db.history.filter((h) => h.memberId === id).sort((a, b) => b.date.localeCompare(a.date));
        const renewals = db.renewals.filter((r) => r.memberId === id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

        return { member, history, renewals };
      }
    );
  },

  async addMember(member: { fullName: string; mobile: string; planId: PlanId; joiningDate: string; amountPaid: number }): Promise<{ member: Member; smsMessage: string }> {
    return request(
      async () => {
        const res = await fetch(`${API_BASE}/members`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(member)
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Non-JSON response');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add member');
        return data;
      },
      () => {
        const db = getLocalDB();
        const id = 'mem_' + Date.now();
        const expiryDate = calculateExpiryDate(member.joiningDate, member.planId);
        const status = getAutoStatus(expiryDate);

        const newMember: Member = {
          id,
          fullName: member.fullName,
          mobile: member.mobile,
          planId: member.planId,
          joiningDate: member.joiningDate,
          expiryDate,
          amountPaid: member.amountPaid,
          status,
          createdAt: new Date().toISOString()
        };

        db.members.push(newMember);

        // Audit trace
        const planLabel = PLANS[member.planId].name;
        db.history.push({
          id: 'hist_' + Date.now(),
          memberId: id,
          type: 'registration',
          date: member.joiningDate,
          description: `Registered as a new member with ${planLabel} plan (₹${member.amountPaid})`
        });

        db.logs.push({
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          category: 'member_add',
          description: `New member ${member.fullName} added with ${planLabel} plan.`,
          memberName: member.fullName
        });

        saveLocalDB(db);

        const smsMessage = generateReceiptMessage(member.fullName, member.mobile, planLabel, member.amountPaid, member.joiningDate, expiryDate);

        return { member: newMember, smsMessage };
      }
    );
  },

  async updateMember(id: string, member: { fullName: string; mobile: string; planId: PlanId; amountPaid: number; joiningDate: string }): Promise<Member> {
    return request(
      async () => {
        const res = await fetch(`${API_BASE}/members/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(member)
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Non-JSON response');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update member');
        return data;
      },
      () => {
        const db = getLocalDB();
        const index = db.members.findIndex((m) => m.id === id);
        if (index === -1) throw new Error('Member not found');

        const prev = db.members[index];
        const expiryDate = calculateExpiryDate(member.joiningDate, member.planId);
        const status = getAutoStatus(expiryDate);

        const changes: string[] = [];
        if (prev.fullName !== member.fullName) changes.push(`Name changed from "${prev.fullName}" to "${member.fullName}"`);
        if (prev.mobile !== member.mobile) changes.push(`Mobile changed from "${prev.mobile}" to "${member.mobile}"`);
        if (prev.planId !== member.planId) changes.push(`Plan changed from ${PLANS[prev.planId].name} to ${PLANS[member.planId].name}`);
        if (prev.amountPaid !== member.amountPaid) changes.push(`Paid Amount changed from ₹${prev.amountPaid} to ₹${member.amountPaid}`);
        if (prev.joiningDate !== member.joiningDate) changes.push(`Joining date changed from ${prev.joiningDate} to ${member.joiningDate}`);

        const updated: Member = {
          ...prev,
          fullName: member.fullName,
          mobile: member.mobile,
          planId: member.planId,
          amountPaid: member.amountPaid,
          joiningDate: member.joiningDate,
          expiryDate,
          status
        };

        db.members[index] = updated;

        if (changes.length > 0) {
          db.history.push({
            id: 'hist_' + Date.now(),
            memberId: id,
            type: 'edit',
            date: new Date().toISOString().split('T')[0],
            description: `Member details updated: ${changes.join(', ')}`
          });
        }

        db.logs.push({
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          category: 'member_edit',
          description: `Details updated for member ${member.fullName}`,
          memberName: member.fullName
        });

        saveLocalDB(db);
        return updated;
      }
    );
  },

  async renewMember(id: string, renewal: { planId: PlanId; purchaseDate: string; amountPaid: number }): Promise<{ member: Member; renewal: RenewalRecord; smsMessage: string }> {
    return request(
      async () => {
        const res = await fetch(`${API_BASE}/members/${id}/renew`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(renewal)
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Non-JSON response');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to renew member');
        return data;
      },
      () => {
        const db = getLocalDB();
        const index = db.members.findIndex((m) => m.id === id);
        if (index === -1) throw new Error('Member not found');

        const member = db.members[index];
        const oldExpiry = member.expiryDate;

        const todayStr = new Date().toISOString().split('T')[0];
        const startPoint = (oldExpiry >= todayStr) ? oldExpiry : renewal.purchaseDate;
        const newExpiry = calculateExpiryDate(startPoint, renewal.planId);
        const newStatus = getAutoStatus(newExpiry);

        member.planId = renewal.planId;
        member.amountPaid = renewal.amountPaid;
        member.expiryDate = newExpiry;
        member.status = newStatus;

        const renewalId = 'ren_' + Date.now();
        const newRenewal: RenewalRecord = {
          id: renewalId,
          memberId: id,
          planId: renewal.planId,
          purchaseDate: renewal.purchaseDate,
          expiryDate: newExpiry,
          amountPaid: renewal.amountPaid,
          timestamp: new Date().toISOString()
        };
        db.renewals.push(newRenewal);

        const planLabel = PLANS[renewal.planId].name;
        db.history.push({
          id: 'hist_' + Date.now(),
          memberId: id,
          type: 'renewal',
          date: renewal.purchaseDate,
          description: `Renewed membership for ${planLabel} plan (₹${renewal.amountPaid}). Expiry extended from ${oldExpiry} to ${newExpiry}.`
        });

        db.logs.push({
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          category: 'member_renew',
          description: `${member.fullName} renewed for ${planLabel} plan (₹${renewal.amountPaid})`,
          memberName: member.fullName
        });

        saveLocalDB(db);

        const smsMessage = generateReceiptMessage(member.fullName, member.mobile, planLabel, renewal.amountPaid, renewal.purchaseDate, newExpiry);

        return { member, renewal: newRenewal, smsMessage };
      }
    );
  },

  async deleteMember(id: string): Promise<{ success: boolean }> {
    return request(
      async () => {
        const res = await fetch(`${API_BASE}/members/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Non-JSON response');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete member');
        return data;
      },
      () => {
        const db = getLocalDB();
        const member = db.members.find((m) => m.id === id);
        if (!member) throw new Error('Member not found');

        db.members = db.members.filter((m) => m.id !== id);
        db.history = db.history.filter((h) => h.memberId !== id);
        db.renewals = db.renewals.filter((r) => r.memberId !== id);

        db.logs.push({
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          category: 'member_delete',
          description: `Member ${member.fullName} permanently deleted from records`,
          memberName: member.fullName
        });

        saveLocalDB(db);
        return { success: true };
      }
    );
  },

  async getLogs(): Promise<ActivityLog[]> {
    return request(
      async () => {
        const res = await fetch(`${API_BASE}/logs`, { headers: getHeaders() });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Non-JSON response');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch logs');
        return data;
      },
      () => {
        const db = getLocalDB();
        return [...db.logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 50);
      }
    );
  }
};
