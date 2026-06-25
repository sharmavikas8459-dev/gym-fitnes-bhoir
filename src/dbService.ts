import fs from 'fs';
import path from 'path';
import { Member, RenewalRecord, MemberHistory, ActivityLog, GymStats, PlanId, MembershipStatus } from './types';
import { PLANS, calculateExpiryDate } from './gymUtils';

const DB_FILE = path.join(process.cwd(), 'src', 'db.json');

// Ensure parent directory and file exist with initial seed data
function initializeDatabase() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    // Seed with initial realistic gym data
    const today = new Date().toISOString().split('T')[0]; // e.g., 2026-06-25
    
    // Let's create dates relative to today (2026-06-25)
    // Rahul Sharma: Joined 3 months ago, renewed 24-06-2026, expires 24-09-2026 (Active)
    const rahulJoin = "2026-03-24";
    const rahulRenew = "2026-06-24";
    const rahulExpiry = "2026-09-24";

    // Amit Patil: Joined 1 month ago, expires today (2026-06-25)
    const amitJoin = "2026-05-25";
    const amitExpiry = "2026-06-25";

    // Sneha Kulkarni: Joined 6 months ago, expired on 2026-05-15
    const snehaJoin = "2025-11-15";
    const snehaExpiry = "2026-05-15";

    // Vivek More: Joined 3 months plan on 2026-04-15, expires 2026-07-15
    const vivekJoin = "2026-04-15";
    const vivekExpiry = "2026-07-15";

    const initialMembers: Member[] = [
      {
        id: "mem_1",
        fullName: "Rahul Sharma",
        mobile: "9823456789",
        planId: "3_months",
        joiningDate: rahulJoin,
        expiryDate: rahulExpiry,
        amountPaid: 1100,
        status: "Active",
        createdAt: new Date(rahulJoin + 'T09:00:00').toISOString()
      },
      {
        id: "mem_2",
        fullName: "Amit Patil",
        mobile: "8876543210",
        planId: "1_month",
        joiningDate: amitJoin,
        expiryDate: amitExpiry,
        amountPaid: 400,
        status: "Active",
        createdAt: new Date(amitJoin + 'T10:30:00').toISOString()
      },
      {
        id: "mem_3",
        fullName: "Sneha Kulkarni",
        mobile: "7654321098",
        planId: "6_months",
        joiningDate: snehaJoin,
        expiryDate: snehaExpiry,
        amountPaid: 2200,
        status: "Expired",
        createdAt: new Date(snehaJoin + 'T16:45:00').toISOString()
      },
      {
        id: "mem_4",
        fullName: "Vivek More",
        mobile: "9123454321",
        planId: "3_months",
        joiningDate: vivekJoin,
        expiryDate: vivekExpiry,
        amountPaid: 1100,
        status: "Active",
        createdAt: new Date(vivekJoin + 'T07:15:00').toISOString()
      }
    ];

    const initialRenewals: RenewalRecord[] = [
      {
        id: "ren_1",
        memberId: "mem_1",
        planId: "3_months",
        purchaseDate: rahulRenew,
        expiryDate: rahulExpiry,
        amountPaid: 1100,
        timestamp: new Date(rahulRenew + 'T11:00:00').toISOString()
      }
    ];

    const initialHistory: MemberHistory[] = [
      {
        id: "hist_1",
        memberId: "mem_1",
        type: "registration",
        date: rahulJoin,
        description: "Registered as a new member with 3 Months plan (₹1100)"
      },
      {
        id: "hist_2",
        memberId: "mem_1",
        type: "renewal",
        date: rahulRenew,
        description: "Renewed membership for 3 Months plan (₹1100). Expiry extended to 24-09-2026."
      },
      {
        id: "hist_3",
        memberId: "mem_2",
        type: "registration",
        date: amitJoin,
        description: "Registered as a new member with 1 Month plan (₹400)"
      },
      {
        id: "hist_4",
        memberId: "mem_3",
        type: "registration",
        date: snehaJoin,
        description: "Registered as a new member with 6 Months plan (₹2200)"
      },
      {
        id: "hist_5",
        memberId: "mem_4",
        type: "registration",
        date: vivekJoin,
        description: "Registered as a new member with 3 Months plan (₹1100)"
      }
    ];

    const initialLogs: ActivityLog[] = [
      {
        id: "log_1",
        timestamp: new Date(rahulJoin + 'T09:05:00').toISOString(),
        category: "member_add",
        description: "New member Rahul Sharma added to Bhoir Fitness",
        memberName: "Rahul Sharma"
      },
      {
        id: "log_2",
        timestamp: new Date(snehaJoin + 'T16:50:00').toISOString(),
        category: "member_add",
        description: "New member Sneha Kulkarni added to Bhoir Fitness",
        memberName: "Sneha Kulkarni"
      },
      {
        id: "log_3",
        timestamp: new Date(rahulRenew + 'T11:05:00').toISOString(),
        category: "member_renew",
        description: "Rahul Sharma renewed for 3 Months plan (₹1100)",
        memberName: "Rahul Sharma"
      }
    ];

    const dbData = {
      members: initialMembers,
      renewals: initialRenewals,
      history: initialHistory,
      logs: initialLogs
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
  }
}

// Ensure database is initialized
initializeDatabase();

// Helper to read DB
function readDB() {
  initializeDatabase();
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

// Helper to write DB
function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Automatically derive and update active status
function getAutoStatus(expiryDateStr: string): MembershipStatus {
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);
  const expiry = new Date(expiryDateStr);
  
  if (expiry >= today) {
    return 'Active';
  } else {
    return 'Expired'; // Treat expired and pending renewal as 'Expired' / 'Pending Renewal'
  }
}

export const dbService = {
  // Get all members with filters
  getMembers(search?: string, status?: string, planId?: string) {
    const db = readDB();
    let members = db.members.map((m: Member) => {
      // Auto status update on demand
      const computedStatus = getAutoStatus(m.expiryDate);
      if (m.status !== computedStatus) {
        m.status = computedStatus;
      }
      return m;
    });

    // Save back if status changes
    writeDB(db);

    if (search) {
      const s = search.toLowerCase();
      members = members.filter((m: Member) => 
        m.fullName.toLowerCase().includes(s) || 
        m.mobile.includes(s)
      );
    }

    if (status) {
      if (status === 'Active') {
        members = members.filter((m: Member) => m.status === 'Active');
      } else if (status === 'Expired' || status === 'Pending Renewal') {
        members = members.filter((m: Member) => m.status === 'Expired');
      }
    }

    if (planId) {
      members = members.filter((m: Member) => m.planId === planId);
    }

    // Sort by recent first
    return members.sort((a: Member, b: Member) => b.createdAt.localeCompare(a.createdAt));
  },

  getMember(id: string): { member: Member | null; history: MemberHistory[]; renewals: RenewalRecord[] } {
    const db = readDB();
    const member = db.members.find((m: Member) => m.id === id) || null;
    if (member) {
      // update status just in case
      member.status = getAutoStatus(member.expiryDate);
    }
    const history = db.history.filter((h: MemberHistory) => h.memberId === id)
      .sort((a: MemberHistory, b: MemberHistory) => b.date.localeCompare(a.date));
    const renewals = db.renewals.filter((r: RenewalRecord) => r.memberId === id)
      .sort((a: RenewalRecord, b: RenewalRecord) => b.timestamp.localeCompare(a.timestamp));
    
    return { member, history, renewals };
  },

  addMember(fullName: string, mobile: string, planId: PlanId, joiningDate: string, amountPaid: number) {
    const db = readDB();
    const id = 'mem_' + Date.now();
    const expiryDate = calculateExpiryDate(joiningDate, planId);
    const status = getAutoStatus(expiryDate);
    
    const newMember: Member = {
      id,
      fullName,
      mobile,
      planId,
      joiningDate,
      expiryDate,
      amountPaid,
      status,
      createdAt: new Date().toISOString()
    };

    db.members.push(newMember);

    // Track Registration in history
    const historyId = 'hist_' + Date.now();
    const planLabel = PLANS[planId].name;
    const historyRecord: MemberHistory = {
      id: historyId,
      memberId: id,
      type: 'registration',
      date: joiningDate,
      description: `Registered as a new member with ${planLabel} plan (₹${amountPaid})`
    };
    db.history.push(historyRecord);

    // Track activity log
    const logId = 'log_' + Date.now();
    const logRecord: ActivityLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      category: 'member_add',
      description: `New member ${fullName} added with ${planLabel} plan.`,
      memberName: fullName
    };
    db.logs.push(logRecord);

    writeDB(db);
    return newMember;
  },

  updateMember(id: string, fullName: string, mobile: string, planId: PlanId, amountPaid: number, joiningDate: string) {
    const db = readDB();
    const index = db.members.findIndex((m: Member) => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const prev = db.members[index];
    const expiryDate = calculateExpiryDate(joiningDate, planId);
    const status = getAutoStatus(expiryDate);

    // History tracking of edits
    const historyId = 'hist_' + Date.now();
    const changes: string[] = [];
    if (prev.fullName !== fullName) changes.push(`Name changed from "${prev.fullName}" to "${fullName}"`);
    if (prev.mobile !== mobile) changes.push(`Mobile changed from "${prev.mobile}" to "${mobile}"`);
    if (prev.planId !== planId) changes.push(`Plan changed from ${PLANS[prev.planId].name} to ${PLANS[planId].name}`);
    if (prev.amountPaid !== amountPaid) changes.push(`Paid Amount changed from ₹${prev.amountPaid} to ₹${amountPaid}`);
    if (prev.joiningDate !== joiningDate) changes.push(`Joining date changed from ${prev.joiningDate} to ${joiningDate}`);

    const updated: Member = {
      ...prev,
      fullName,
      mobile,
      planId,
      amountPaid,
      joiningDate,
      expiryDate,
      status
    };

    db.members[index] = updated;

    if (changes.length > 0) {
      const historyRecord: MemberHistory = {
        id: historyId,
        memberId: id,
        type: 'edit',
        date: new Date().toISOString().split('T')[0],
        description: `Member details updated: ${changes.join(', ')}`
      };
      db.history.push(historyRecord);
    }

    // Activity log
    const logId = 'log_' + Date.now();
    db.logs.push({
      id: logId,
      timestamp: new Date().toISOString(),
      category: 'member_edit',
      description: `Details updated for member ${fullName}`,
      memberName: fullName
    });

    writeDB(db);
    return updated;
  },

  renewMember(id: string, planId: PlanId, purchaseDate: string, amountPaid: number) {
    const db = readDB();
    const index = db.members.findIndex((m: Member) => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const member = db.members[index];
    const oldExpiry = member.expiryDate;
    
    // Auto calculate new expiry date:
    // If current plan is active, extend from current expiry. If expired, extend from purchase/renewal date.
    const todayStr = new Date().toISOString().split('T')[0];
    const startPoint = (oldExpiry >= todayStr) ? oldExpiry : purchaseDate;
    const newExpiry = calculateExpiryDate(startPoint, planId);
    const newStatus = getAutoStatus(newExpiry);

    // Update member details
    member.planId = planId;
    member.amountPaid = amountPaid;
    member.expiryDate = newExpiry;
    member.status = newStatus;
    
    // Create renewal record
    const renewalId = 'ren_' + Date.now();
    const newRenewal: RenewalRecord = {
      id: renewalId,
      memberId: id,
      planId,
      purchaseDate,
      expiryDate: newExpiry,
      amountPaid,
      timestamp: new Date().toISOString()
    };
    db.renewals.push(newRenewal);

    // Add to history
    const historyId = 'hist_' + Date.now();
    const planLabel = PLANS[planId].name;
    const historyRecord: MemberHistory = {
      id: historyId,
      memberId: id,
      type: 'renewal',
      date: purchaseDate,
      description: `Renewed membership for ${planLabel} plan (₹${amountPaid}). Expiry extended from ${oldExpiry} to ${newExpiry}.`
    };
    db.history.push(historyRecord);

    // Activity log
    const logId = 'log_' + Date.now();
    db.logs.push({
      id: logId,
      timestamp: new Date().toISOString(),
      category: 'member_renew',
      description: `${member.fullName} renewed for ${planLabel} plan (₹${amountPaid})`,
      memberName: member.fullName
    });

    writeDB(db);
    return { member, renewal: newRenewal };
  },

  deleteMember(id: string) {
    const db = readDB();
    const member = db.members.find((m: Member) => m.id === id);
    if (!member) throw new Error('Member not found');

    db.members = db.members.filter((m: Member) => m.id !== id);
    // Keep history and renewals, or cleanup? Standard cleanup or keep orphans?
    // Let's filter history/renewals to keep database tidy, or we can keep it as required.
    // Clean up to keep data structured
    db.history = db.history.filter((h: MemberHistory) => h.memberId !== id);
    db.renewals = db.renewals.filter((r: RenewalRecord) => r.memberId !== id);

    // Log deletion
    const logId = 'log_' + Date.now();
    db.logs.push({
      id: logId,
      timestamp: new Date().toISOString(),
      category: 'member_delete',
      description: `Member ${member.fullName} permanently deleted from records`,
      memberName: member.fullName
    });

    writeDB(db);
    return { success: true };
  },

  getActivityLogs() {
    const db = readDB();
    return db.logs.sort((a: ActivityLog, b: ActivityLog) => b.timestamp.localeCompare(a.timestamp)).slice(0, 50);
  },

  getStats(): GymStats {
    const db = readDB();
    const todayStr = new Date().toISOString().split('T')[0];
    
    let totalMembers = 0;
    let activeMembers = 0;
    let expiredMembers = 0;
    let pendingRenewals = 0;
    let expiringToday = 0;
    let monthlyRevenue = 0;

    const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM

    db.members.forEach((m: Member) => {
      totalMembers++;
      const status = getAutoStatus(m.expiryDate);
      if (status === 'Active') {
        activeMembers++;
      } else {
        expiredMembers++;
        pendingRenewals++; // Expired counts as pending renewal as requested
      }

      if (m.expiryDate === todayStr) {
        expiringToday++;
      }
    });

    // Calculate monthly revenue from registrations and renewals purchased this month
    // registrations
    db.members.forEach((m: Member) => {
      if (m.joiningDate.startsWith(currentYearMonth)) {
        // Find if they have a subsequent renewal this month. If they registered this month, add registration fee.
        monthlyRevenue += m.amountPaid;
      }
    });
    
    // renewals this month
    db.renewals.forEach((r: RenewalRecord) => {
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
};
