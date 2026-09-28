export interface LineItem {
  description: string;
  qty: number;
  unit_price: number;
}

export interface VendorOut {
  id: number;
  name: string;
  approved: boolean;
  avg_invoice_amount: number;
  invoice_count: number;
}

export interface VendorCreate {
  name: string;
  approved?: boolean;
}

export interface PurchaseOrderOut {
  id: number;
  po_number: string;
  vendor_id: number;
  amount: number;
  line_items: LineItem[];
  status: string;
}

export interface PurchaseOrderCreate {
  po_number: string;
  vendor_name: string;
  amount: number;
  line_items?: LineItem[];
}

export interface AuditLogOut {
  agent_name: string;
  action: string;
  detail: Record<string, any>;
  timestamp: string;
}

export interface SupplierProfile {
  payment_terms?: string;
  preferred_payment_method?: string;
  contact_email?: string | null;
  phone?: string | null;
  account_manager?: string | null;
  category?: string;
  policy_notes?: string;
  risk_notes?: string;
}

export interface ExtractedData {
  vendor_name?: string;
  invoice_number?: string;
  po_number?: string | null;
  amount?: number;
  due_date?: string | null;
  line_items?: LineItem[];
  extraction_method?: string;
}

export interface ValidationChecks {
  vendor_approved?: boolean;
  supplier_payment_terms?: string;
  supplier_policy_notes?: string;
  po_found?: boolean;
  po_match_method?: string;
  po_number?: string;
  invoice_amount?: number;
  po_amount?: number;
  amount_diff_pct?: number;
  unmatched_line_items?: string[];
  [key: string]: any;
}

export interface ValidationResult {
  passed: boolean;
  issues: string[];
  checks: ValidationChecks;
}

export interface AssessmentResult {
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'unknown' | string;
  flags: string[];
}

export interface RetrievalContext {
  vendor_found: boolean;
  vendor_id?: number | null;
  vendor_approved?: boolean;
  vendor_avg_amount?: number | null;
  vendor_invoice_count?: number;
  matched_po_id?: number | null;
  matched_po_number?: string | null;
  matched_po_amount?: number | null;
  matched_po_line_items?: LineItem[];
  po_match_method?: string | null;
  po_vendor_mismatch?: boolean;
  duplicate_invoice_ids?: number[];
  supplier_profile?: SupplierProfile | null;
  [key: string]: any;
}

export interface InvoiceOut {
  id: number;
  invoice_number: string;
  vendor_id?: number | null;
  po_id?: number | null;
  amount?: number | null;
  due_date?: string | null;
  status: 'pending_review' | 'approved' | 'rejected' | string;
  risk_level: 'low' | 'medium' | 'high' | 'unknown' | string;
  extracted_data: ExtractedData;
  validation_result: ValidationResult;
  assessment_result: AssessmentResult;
  retrieval_context: RetrievalContext;
  created_at: string;
  decided_at?: string | null;
  decided_by?: string | null;
  audit_logs: AuditLogOut[];
}

export interface InvoiceSummary {
  id: number;
  invoice_number: string;
  vendor_id?: number | null;
  amount?: number | null;
  status: 'pending_review' | 'approved' | 'rejected' | string;
  risk_level: 'low' | 'medium' | 'high' | 'unknown' | string;
  created_at: string;
}

export interface DecisionRequest {
  decided_by: string;
  note?: string | null;
}

export interface DashboardStats {
  total_invoices: number;
  pending_review: number;
  approved: number;
  rejected: number;
  high_risk_open: number;
  total_amount_pending: number;
  flagged_reasons: Record<string, number>;
}

export interface AlertOut {
  invoice_id: number;
  invoice_number: string;
  vendor_id?: number | null;
  amount?: number | null;
  risk_level: string;
  flags: string[];
  created_at: string;
}
