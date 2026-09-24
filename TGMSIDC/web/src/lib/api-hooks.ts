/**
 * React Query hooks wrapping the TGMSIDC API client.
 * Drop-in replacement for @workspace/api-client-react (orval-generated package).
 * Hooks accept an optional trailing `options` arg (ignored) for backward compat.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";

// ─── Type aliases ────────────────────────────────────────────────────────────
export type Institution = any;
export type Vendor = any;
export type Equipment = any;
export type RateContract = any;
export type Indent = any;
export type Tender = any;
export type PurchaseOrder = any;
export type Delivery = any;
export type CreateIndentBody = any;

// ─── Query Key Factories (both naming conventions) ───────────────────────────
export const getListInstitutionsQueryKey       = ()           => ["institutions"]               as const;
export const getListVendorsQueryKey            = ()           => ["vendors"]                    as const;
export const getGetVendorQueryKey              = (id: string) => ["vendors", id]                as const;
export const getListEquipmentQueryKey          = ()           => ["equipment"]                  as const;
export const getListRateContractsQueryKey      = (p?: any)   => ["rate-contracts", p]           as const;
export const getGetRateContractQueryKey        = (id: string) => ["rate-contracts", id]         as const;
export const getGetExpiringRateContractsQueryKey = ()         => ["rate-contracts", "expiring"] as const;
export const getExpiringRateContractsQueryKey  = getGetExpiringRateContractsQueryKey;
export const getListIndentsQueryKey            = (p?: any)   => ["indents", p]                  as const;
export const getGetIndentQueryKey              = (id: string) => ["indents", id]                as const;
export const getListTendersQueryKey            = ()           => ["tenders"]                    as const;
export const getGetTenderQueryKey              = (id: string) => ["tenders", id]                as const;
export const getListPurchaseOrdersQueryKey     = (p?: any)   => ["purchase-orders", p]          as const;
export const getGetPurchaseOrderQueryKey       = (id: string) => ["purchase-orders", id]        as const;
export const getListDeliveriesQueryKey         = (p?: any)   => ["deliveries", p]               as const;
export const getGetDeliveryQueryKey            = (id: string) => ["deliveries", id]             as const;

// Dashboard — both getGet* and get* names exported for compat
export const getGetDashboardSummaryQueryKey    = ()           => ["dashboard", "summary"]       as const;
export const getDashboardSummaryQueryKey       = getGetDashboardSummaryQueryKey;
export const getGetProcurementPipelineQueryKey = ()           => ["dashboard", "pipeline"]      as const;
export const getProcurementPipelineQueryKey    = getGetProcurementPipelineQueryKey;
export const getGetRecentActivityQueryKey      = ()           => ["dashboard", "activity"]      as const;
export const getRecentActivityQueryKey         = getGetRecentActivityQueryKey;
export const getGetVendorPerformanceQueryKey   = ()           => ["dashboard", "vendor-perf"]   as const;
export const getVendorPerformanceQueryKey      = getGetVendorPerformanceQueryKey;
export const getGetSlaMetricsQueryKey          = ()           => ["dashboard", "sla"]           as const;
export const getSLAMetricsQueryKey             = getGetSlaMetricsQueryKey;

// ─── Institution Hooks ────────────────────────────────────────────────────────
export const useListInstitutions = (_opts?: any) =>
  useQuery({ queryKey: getListInstitutionsQueryKey(), queryFn: api.getInstitutions });

export const useCreateInstitution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, ...rest }: { data?: any; [k: string]: any }) => api.createInstitution(data ?? rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institutions"] }),
  });
};

// ─── Vendor Hooks ─────────────────────────────────────────────────────────────
export const useListVendors = (_opts?: any) =>
  useQuery({ queryKey: getListVendorsQueryKey(), queryFn: api.getVendors });

export const useGetVendor = (id: string, _opts?: any) =>
  useQuery({ queryKey: getGetVendorQueryKey(id), queryFn: () => api.getVendor(id), enabled: !!id });

export const useGetVendorPerformance = (_opts?: any) =>
  useQuery({ queryKey: getGetVendorPerformanceQueryKey(), queryFn: api.getVendorPerformance });

export const useCreateVendor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, ...rest }: { data?: any; [k: string]: any }) => api.createVendor(data ?? rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
};

// ─── Equipment Hooks ──────────────────────────────────────────────────────────
export const useListEquipment = (_opts?: any) =>
  useQuery({ queryKey: getListEquipmentQueryKey(), queryFn: api.getEquipment });

export const useCreateEquipment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, ...rest }: { data?: any; [k: string]: any }) => api.createEquipment(data ?? rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["equipment"] }),
  });
};

// ─── Rate Contract Hooks ──────────────────────────────────────────────────────
export const useListRateContracts = (
  params?: { status?: string; equipmentId?: string },
  _opts?: any
) =>
  useQuery({
    queryKey: getListRateContractsQueryKey(params),
    queryFn: () => api.getRateContracts(params),
  });

export const useGetExpiringRateContracts = (_opts?: any) =>
  useQuery({ queryKey: getGetExpiringRateContractsQueryKey(), queryFn: api.getExpiringRateContracts });

export const useGetRateContract = (id: string, _opts?: any) =>
  useQuery({ queryKey: getGetRateContractQueryKey(id), queryFn: () => api.getRateContract(id), enabled: !!id });

export const useCreateRateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, ...rest }: { data?: any; [k: string]: any }) => api.createRateContract(data ?? rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rate-contracts"] }),
  });
};

export const useUpdateRateContract = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, ...rest }: { id: string; data?: any; [k: string]: any }) => api.updateRateContract(id, data ?? rest),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["rate-contracts"] });
      qc.invalidateQueries({ queryKey: getGetRateContractQueryKey(id) });
    },
  });
};

// ─── Indent Hooks ─────────────────────────────────────────────────────────────
export const useListIndents = (
  params?: { status?: string; facilityId?: string },
  _opts?: any
) =>
  useQuery({
    queryKey: getListIndentsQueryKey(params),
    queryFn: () => api.getIndents(params),
  });

export const useGetIndent = (id: string, _opts?: any) =>
  useQuery({ queryKey: getGetIndentQueryKey(id), queryFn: () => api.getIndent(id), enabled: !!id });

export const useCreateIndent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, ...rest }: { data?: any; [k: string]: any }) => api.createIndent(data ?? rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["indents"] }),
  });
};

export const useUpdateIndent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, ...rest }: { id: string; data?: any; [k: string]: any }) => api.updateIndent(id, data ?? rest),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["indents"] });
      qc.invalidateQueries({ queryKey: getGetIndentQueryKey(id) });
    },
  });
};

export const useApproveIndent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, ...rest }: { id: string; data?: any; [k: string]: any }) => api.approveIndent(id, data ?? rest),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["indents"] });
      qc.invalidateQueries({ queryKey: getGetIndentQueryKey(id) });
    },
  });
};

export const useRejectIndent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, ...rest }: { id: string; data?: any; [k: string]: any }) => api.rejectIndent(id, data ?? rest),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["indents"] });
      qc.invalidateQueries({ queryKey: getGetIndentQueryKey(id) });
    },
  });
};

// ─── Tender Hooks ─────────────────────────────────────────────────────────────
export const useListTenders = (_opts?: any) =>
  useQuery({ queryKey: getListTendersQueryKey(), queryFn: api.getTenders });

export const useGetTender = (id: string, _opts?: any) =>
  useQuery({ queryKey: getGetTenderQueryKey(id), queryFn: () => api.getTender(id), enabled: !!id });

export const useCreateTender = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, ...rest }: { data?: any; [k: string]: any }) => api.createTender(data ?? rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenders"] }),
  });
};

export const useUpdateTender = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, ...rest }: { id: string; data?: any; [k: string]: any }) => api.updateTender(id, data ?? rest),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["tenders"] });
      qc.invalidateQueries({ queryKey: getGetTenderQueryKey(id) });
    },
  });
};

// ─── Purchase Order Hooks ─────────────────────────────────────────────────────
export const useListPurchaseOrders = (
  params?: { status?: string; vendorId?: string },
  _opts?: any
) =>
  useQuery({
    queryKey: getListPurchaseOrdersQueryKey(params),
    queryFn: () => api.getPurchaseOrders(params),
  });

export const useGetPurchaseOrder = (id: string, _opts?: any) =>
  useQuery({ queryKey: getGetPurchaseOrderQueryKey(id), queryFn: () => api.getPurchaseOrder(id), enabled: !!id });

export const useCreatePurchaseOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, ...rest }: { data?: any; [k: string]: any }) => api.createPurchaseOrder(data ?? rest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      qc.invalidateQueries({ queryKey: ["indents"] });
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, ...rest }: { id: string; data?: any; [k: string]: any }) => api.updatePurchaseOrder(id, data ?? rest),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      qc.invalidateQueries({ queryKey: getGetPurchaseOrderQueryKey(id) });
    },
  });
};

export const useApprovePurchaseOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.approvePurchaseOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });
};

export const useCancelPurchaseOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, ...rest }: { id: string; data?: any; [k: string]: any }) => api.cancelPurchaseOrder(id, data ?? rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });
};

// ─── Delivery Hooks ───────────────────────────────────────────────────────────
export const useListDeliveries = (
  params?: { status?: string; poId?: string },
  _opts?: any
) =>
  useQuery({
    queryKey: getListDeliveriesQueryKey(params),
    queryFn: () => api.getDeliveries(params),
  });

export const useGetDelivery = (id: string, _opts?: any) =>
  useQuery({ queryKey: getGetDeliveryQueryKey(id), queryFn: () => api.getDelivery(id), enabled: !!id });

export const useCreateDelivery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data, ...rest }: { data?: any; [k: string]: any }) => api.createDelivery(data ?? rest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

export const useUpdateDelivery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, ...rest }: { id: string; data?: any; [k: string]: any }) => api.updateDelivery(id, data ?? rest),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: getGetDeliveryQueryKey(id) });
    },
  });
};

export const useAcceptDelivery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.acceptDelivery(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

// ─── Dashboard Hooks ──────────────────────────────────────────────────────────
export const useGetDashboardSummary = (_opts?: any) =>
  useQuery({ queryKey: getGetDashboardSummaryQueryKey(), queryFn: api.getDashboardSummary });

export const useGetProcurementPipeline = (_opts?: any) =>
  useQuery({ queryKey: getGetProcurementPipelineQueryKey(), queryFn: api.getProcurementPipeline });

export const useGetRecentActivity = (_opts?: any) =>
  useQuery({ queryKey: getGetRecentActivityQueryKey(), queryFn: api.getRecentActivity });

export const useGetSlaMetrics = (_opts?: any) =>
  useQuery({ queryKey: getGetSlaMetricsQueryKey(), queryFn: api.getSLAMetrics });

// Alias: some pages use useGetSLAMetrics (uppercase SLA)
export const useGetSLAMetrics = useGetSlaMetrics;

