import { api } from "@/lib/config";
import { openPdfFromFetcher } from "@/lib/pdf";
import type { ReportData, ReportFilters, ReportOptions, ReportType } from "./report.interface";

const endpoint = "reportes";

const cleanParams = (filters: ReportFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined && value !== false));

export async function getReportOptions(): Promise<ReportOptions> {
  const { data } = await api.get<{ data: ReportOptions }>(`${endpoint}/opciones`);
  return data.data;
}

export async function getReport(type: ReportType, filters: ReportFilters): Promise<ReportData> {
  const { data } = await api.get<{ data: ReportData }>(`${endpoint}/${type}`, { params: cleanParams(filters) });
  return data.data;
}

export async function downloadReportExcel(type: ReportType, filters: ReportFilters, title: string): Promise<void> {
  const response = await api.get(`${endpoint}/${type}/excel`, {
    params: cleanParams(filters),
    responseType: "blob",
  });
  const disposition = response.headers["content-disposition"] as string | undefined;
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const regular = disposition?.match(/filename="?([^";]+)"?/i)?.[1];
  const filename = encoded ? decodeURIComponent(encoded) : regular || `${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.xlsx`;
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function openReportPdf(type: ReportType, filters: ReportFilters): Promise<void> {
  return openPdfFromFetcher(async () => {
    const response = await api.get(`${endpoint}/${type}/pdf`, {
      params: cleanParams(filters),
      responseType: "blob",
    });
    return response.data;
  }, "Preparando vista previa del reporte...");
}
