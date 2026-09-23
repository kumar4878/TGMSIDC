/// <reference types="vite/client" />
// Central API client for TGMSIDC web app.
// Reads VITE_API_URL from environment variables.

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000") + "/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data: unknown = null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let data: unknown = null;
    try { data = await res.json(); } catch { /* ignore */ }
    const message =
      (data as any)?.error ?? (data as any)?.message ?? res.statusText;
    throw new ApiError(res.status, res.statusText, message, data);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function get<T>(path: string, params?: Record<string, any>): Promise<T> {
  const qs = params
    ? "?" + new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : "";
  return request<T>(`${path}${qs}`);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: body != null ? JSON.stringify(body) : undefined });
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", body: body != null ? JSON.stringify(body) : undefined });
}

export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

// ─── API Functions ─────────────────────────────────────────────────────────

// Health
export const healthCheck = () => get<{ status: string }>("/health");

// Institutions
export const getInstitutions = () => get<any[]>("/institutions");
export const createInstitution = (body: any) => post<any>("/institutions", body);

// Vendors
export const getVendors = () => get<any[]>("/vendors");
export const getVendor = (id: string) => get<any>(`/vendors/${id}`);
export const createVendor = (body: any) => post<any>("/vendors", body);

// Equipment
export const getEquipment = () => get<any[]>("/equipment");
export const createEquipment = (body: any) => post<any>("/equipment", body);

// Rate Contracts
export const getRateContracts = (params?: { status?: string; equipmentId?: string }) =>
  get<any[]>("/rate-contracts", params);
export const getExpiringRateContracts = () => get<any[]>("/rate-contracts/expiring-soon");
export const getRateContract = (id: string) => get<any>(`/rate-contracts/${id}`);
export const createRateContract = (body: any) => post<any>("/rate-contracts", body);
export const updateRateContract = (id: string, body: any) => patch<any>(`/rate-contracts/${id}`, body);

// Indents
export const getIndents = (params?: { status?: string; facilityId?: string }) =>
  get<any[]>("/indents", params);
export const getIndent = (id: string) => get<any>(`/indents/${id}`);
export const createIndent = (body: any) => post<any>("/indents", body);
export const updateIndent = (id: string, body: any) => patch<any>(`/indents/${id}`, body);
export const approveIndent = (id: string, body: any) => post<any>(`/indents/${id}/approve`, body);
export const rejectIndent = (id: string, body: any) => post<any>(`/indents/${id}/reject`, body);

// Tenders
export const getTenders = () => get<any[]>("/tenders");
export const getTender = (id: string) => get<any>(`/tenders/${id}`);
export const createTender = (body: any) => post<any>("/tenders", body);
export const updateTender = (id: string, body: any) => patch<any>(`/tenders/${id}`, body);

// Purchase Orders
export const getPurchaseOrders = (params?: { status?: string; vendorId?: string }) =>
  get<any[]>("/purchase-orders", params);
export const getPurchaseOrder = (id: string) => get<any>(`/purchase-orders/${id}`);
export const createPurchaseOrder = (body: any) => post<any>("/purchase-orders", body);
export const updatePurchaseOrder = (id: string, body: any) => patch<any>(`/purchase-orders/${id}`, body);
export const approvePurchaseOrder = (id: string) => post<any>(`/purchase-orders/${id}/approve`);
export const cancelPurchaseOrder = (id: string, body: any) => post<any>(`/purchase-orders/${id}/cancel`, body);

// Deliveries
export const getDeliveries = (params?: { status?: string; poId?: string }) =>
  get<any[]>("/deliveries", params);
export const getDelivery = (id: string) => get<any>(`/deliveries/${id}`);
export const createDelivery = (body: any) => post<any>("/deliveries", body);
export const updateDelivery = (id: string, body: any) => patch<any>(`/deliveries/${id}`, body);
export const acceptDelivery = (id: string) => post<any>(`/deliveries/${id}/accept`);

// Dashboard
export const getDashboardSummary = () => get<any>("/dashboard/summary");
export const getProcurementPipeline = () => get<any[]>("/dashboard/procurement-pipeline");
export const getRecentActivity = () => get<any[]>("/dashboard/recent-activity");
export const getVendorPerformance = () => get<any[]>("/dashboard/vendor-performance");
export const getSLAMetrics = () => get<any>("/dashboard/sla-metrics");
// Alias for naming consistency
export const getSlaMetrics = getSLAMetrics;
