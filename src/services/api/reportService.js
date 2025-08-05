import salesRepsData from "@/services/mockData/salesReps.json";
import leadsData from "@/services/mockData/leads.json";
import { getFreshLeadsOnly } from "@/services/api/leadsService";

// Get sales reps for other services that need them
export const getSalesReps = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return salesRepsData;
};