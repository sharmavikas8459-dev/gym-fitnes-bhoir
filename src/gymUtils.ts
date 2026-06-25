import { PlanId } from './types';

// Plan definitions
export const PLANS = {
  '1_month': { name: '1 Month', price: 400, durationMonths: 1 },
  '3_months': { name: '3 Months', price: 1100, durationMonths: 3 },
  '6_months': { name: '6 Months', price: 2200, durationMonths: 6 }
};

// Add days/months to date string
export function calculateExpiryDate(joiningDateStr: string, planId: PlanId): string {
  const date = new Date(joiningDateStr);
  let monthsToAdd = 1;
  if (planId === '3_months') {
    monthsToAdd = 3;
  } else if (planId === '6_months') {
    monthsToAdd = 6;
  }
  
  // Calculate expiry date robustly
  const currentMonth = date.getMonth();
  date.setMonth(currentMonth + monthsToAdd);
  
  // Handle edge case where month overflow happens (e.g. Jan 31 + 1 month = March 3, but should be Feb 28)
  if (date.getMonth() !== (currentMonth + monthsToAdd) % 12) {
    date.setDate(0); // set to last day of previous month
  }
  
  return date.toISOString().split('T')[0];
}
