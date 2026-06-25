export type PlanId = '1_month' | '3_months' | '6_months';

export interface MembershipPlan {
  id: PlanId;
  name: string;
  durationMonths: number;
  price: number;
}

export type MembershipStatus = 'Active' | 'Expired' | 'Pending Renewal';

export interface Member {
  id: string;
  fullName: string;
  mobile: string;
  planId: PlanId;
  joiningDate: string; // YYYY-MM-DD
  expiryDate: string;  // YYYY-MM-DD
  amountPaid: number;
  status: MembershipStatus;
  createdAt: string;
}

export interface RenewalRecord {
  id: string;
  memberId: string;
  planId: PlanId;
  purchaseDate: string; // YYYY-MM-DD
  expiryDate: string;   // YYYY-MM-DD
  amountPaid: number;
  timestamp: string;
}

export interface MemberHistory {
  id: string;
  memberId: string;
  type: 'registration' | 'renewal' | 'edit' | 'status_change';
  date: string;
  description: string;
  details?: {
    planId?: PlanId;
    amountPaid?: number;
    previousPlanId?: PlanId;
    previousExpiry?: string;
    newExpiry?: string;
    fieldChanged?: string;
    oldValue?: string;
    newValue?: string;
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  description: string;
  category: 'member_add' | 'member_renew' | 'member_edit' | 'member_delete' | 'notification';
  memberName?: string;
}

export interface GymStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  pendingRenewals: number;
  expiringToday: number;
  monthlyRevenue: number;
}
