import React, { useState } from 'react';
import { Member, RenewalRecord, PlanId } from '../types';
import { PLANS } from '../gymUtils';
import { FileText, Download, Printer, TrendingUp, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ReportsViewProps {
  members: Member[];
  renewals: RenewalRecord[];
  darkMode: boolean;
}

type ReportType = 'active' | 'expired' | 'revenue' | 'renewals';

export default function ReportsView({ members, renewals, darkMode }: ReportsViewProps) {
  const [reportType, setReportType] = useState<ReportType>('active');

  // Format YYYY-MM-DD to DD-MM-YYYY
  const fd = (dStr: string) => {
    if (!dStr) return '';
    return dStr.split('-').reverse().join('-');
  };

  const getPlanLabel = (pId: PlanId) => {
    return PLANS[pId]?.name || pId;
  };

  // Compile data based on selection
  const getReportData = () => {
    if (reportType === 'active') {
      return {
        title: 'Active Members Audit Report',
        headers: ['Member Name', 'Mobile', 'Plan', 'Joining Date', 'Expiry Date', 'Amount Paid'],
        rows: members
          .filter((m) => m.status === 'Active')
          .map((m) => [m.fullName, `+91 ${m.mobile}`, getPlanLabel(m.planId), fd(m.joiningDate), fd(m.expiryDate), `₹${m.amountPaid}`]),
        raw: members.filter((m) => m.status === 'Active')
      };
    } else if (reportType === 'expired') {
      return {
        title: 'Expired & Pending Renewals Report',
        headers: ['Member Name', 'Mobile', 'Expired Plan', 'Last Joined', 'Expired Date', 'Amount Paid'],
        rows: members
          .filter((m) => m.status === 'Expired')
          .map((m) => [m.fullName, `+91 ${m.mobile}`, getPlanLabel(m.planId), fd(m.joiningDate), fd(m.expiryDate), `₹${m.amountPaid}`]),
        raw: members.filter((m) => m.status === 'Expired')
      };
    } else if (reportType === 'revenue') {
      // Show list of registrations and renewals with their date and amount
      const rows: any[] = [];
      let total = 0;
      
      members.forEach((m) => {
        rows.push({
          date: m.joiningDate,
          name: m.fullName,
          desc: `New Registration - ${getPlanLabel(m.planId)}`,
          amount: m.amountPaid
        });
        total += m.amountPaid;
      });

      renewals.forEach((r) => {
        const m = members.find((mem) => mem.id === r.memberId);
        rows.push({
          date: r.purchaseDate,
          name: m ? m.fullName : 'Deleted Member',
          desc: `Plan Renewal - ${getPlanLabel(r.planId)}`,
          amount: r.amountPaid
        });
        total += r.amountPaid;
      });

      // Sort chronological
      rows.sort((a, b) => b.date.localeCompare(a.date));

      return {
        title: `Monthly Revenue Ledger Report (Total Booked: ₹${total})`,
        headers: ['Transaction Date', 'Member Name', 'Description', 'Receipt Total'],
        rows: rows.map((r) => [fd(r.date), r.name, r.desc, `₹${r.amount}`]),
        raw: rows
      };
    } else {
      // Renewals
      const rows = renewals.map((r) => {
        const m = members.find((mem) => mem.id === r.memberId);
        return [
          fd(r.purchaseDate),
          m ? m.fullName : 'Deleted Member',
          getPlanLabel(r.planId),
          fd(r.expiryDate),
          `₹${r.amountPaid}`
        ];
      });

      return {
        title: 'Membership Renewals Summary Report',
        headers: ['Renewal Date', 'Member Name', 'Extended Plan', 'New Expiry Date', 'Amount Paid'],
        rows,
        raw: renewals
      };
    }
  };

  const currentReport = getReportData();

  // Export to Excel (Generates CSV download)
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add title
    csvContent += `"${currentReport.title.replace(/"/g, '""')}"\n\n`;
    
    // Add headers
    csvContent += currentReport.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
    
    // Add rows
    currentReport.rows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser-native PDF print view
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Report Title Wrapper (Hidden on screen unless printing) */}
      <div className="hidden print:block text-slate-950 p-8">
        <h1 className="text-2xl font-black uppercase text-center border-b pb-4">
          BHOIR FITNESS & GYM - REPORTS PORTAL
        </h1>
        <p className="text-xs text-center font-bold mt-2">
          Owner: Nitesh Bhoir • Report Generated on: {new Date().toLocaleDateString('en-IN')}
        </p>
        <h2 className="text-lg font-bold mt-6 underline">{currentReport.title}</h2>
      </div>

      {/* Control Panel (Screen-only) */}
      <div className={`p-6 rounded-3xl border print:hidden transition-colors duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Toggle Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'active', label: 'Active Members', icon: CheckCircle2 },
              { type: 'expired', label: 'Expired & Pending', icon: Calendar },
              { type: 'revenue', label: 'Revenue Ledger', icon: TrendingUp },
              { type: 'renewals', label: 'Renewals Summary', icon: FileText }
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.type}
                  onClick={() => setReportType(btn.type as ReportType)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    reportType === btn.type
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                      : darkMode
                        ? 'bg-slate-950 text-slate-400 hover:bg-slate-800/80 hover:text-white border border-slate-800'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              id="export-excel-btn"
              onClick={exportToExcel}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                darkMode
                  ? 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Download className="w-4 h-4" />
              Export Excel (CSV)
            </button>
            <button
              id="export-pdf-btn"
              onClick={triggerPrint}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Export PDF (Print)
            </button>
          </div>

        </div>
      </div>

      {/* Rendered Report Table */}
      <div className={`border rounded-3xl overflow-hidden shadow-sm transition-colors duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-black text-base tracking-tight text-orange-500">
            {currentReport.title}
          </h3>
          <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded-md ${
            darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
          }`}>
            {currentReport.rows.length} Rows Compiled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`text-[10px] font-bold uppercase tracking-wider border-b ${
                darkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'
              }`}>
                {currentReport.headers.map((header, idx) => (
                  <th key={idx} className="px-6 py-3.5 font-bold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
              {currentReport.rows.length === 0 ? (
                <tr>
                  <td colSpan={currentReport.headers.length} className="px-6 py-12 text-center text-slate-400">
                    No records found for this report period
                  </td>
                </tr>
              ) : (
                currentReport.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={darkMode ? 'hover:bg-slate-800/20' : 'hover:bg-slate-50/50'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-6 py-3.5 font-semibold">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
