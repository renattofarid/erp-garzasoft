import { api } from "@/lib/config";
import { DashboardResponse } from "./dashboard.interface";

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardResponse>("dashboard/resumen");
  return data;
}
