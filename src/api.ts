import { Member, RenewalRecord, MemberHistory, ActivityLog, GymStats, PlanId } from './types';

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('bhoir_gym_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  setToken(token: string) {
    localStorage.setItem('bhoir_gym_token', token);
  },

  getToken() {
    return localStorage.getItem('bhoir_gym_token');
  },

  logout() {
    localStorage.removeItem('bhoir_gym_token');
  },

  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async getStats(): Promise<GymStats> {
    const res = await fetch(`${API_BASE}/stats`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
    return data;
  },

  async getMembers(filters?: { search?: string; status?: string; planId?: string }): Promise<Member[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.planId) params.append('planId', filters.planId);

    const res = await fetch(`${API_BASE}/members?${params.toString()}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch members');
    return data;
  },

  async getMember(id: string): Promise<{ member: Member; history: MemberHistory[]; renewals: RenewalRecord[] }> {
    const res = await fetch(`${API_BASE}/members/${id}`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch member details');
    return data;
  },

  async addMember(member: { fullName: string; mobile: string; planId: PlanId; joiningDate: string; amountPaid: number }): Promise<{ member: Member; smsMessage: string }> {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(member)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add member');
    return data;
  },

  async updateMember(id: string, member: { fullName: string; mobile: string; planId: PlanId; amountPaid: number; joiningDate: string }): Promise<Member> {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(member)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update member');
    return data;
  },

  async renewMember(id: string, renewal: { planId: PlanId; purchaseDate: string; amountPaid: number }): Promise<{ member: Member; renewal: RenewalRecord; smsMessage: string }> {
    const res = await fetch(`${API_BASE}/members/${id}/renew`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(renewal)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to renew member');
    return data;
  },

  async deleteMember(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete member');
    return data;
  },

  async getLogs(): Promise<ActivityLog[]> {
    const res = await fetch(`${API_BASE}/logs`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch logs');
    return data;
  }
};
