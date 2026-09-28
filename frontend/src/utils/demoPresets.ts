export interface DemoPreset {
  id: string;
  title: string;
  vendor: string;
  expectedRisk: 'low' | 'medium' | 'high';
  tag: string;
  description: string;
  rawText: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'clean_match',
    title: 'Clean Match (PO-1001)',
    vendor: 'Acme Office Supplies',
    expectedRisk: 'low',
    tag: 'Normal / Low Risk',
    description: 'Matches open PO-1001 ($1,250.00) exactly. Approved vendor, consistent line items. Validates cleanly.',
    rawText: `Invoice Number: INV-9001
Vendor: Acme Office Supplies
Due Date: 2026-10-15
Office chairs 5 x $150.00
Standing desks 2 x $250.00
Total Amount Due: $1250.00`,
  },
  {
    id: 'duplicate',
    title: 'Duplicate Invoice Check',
    vendor: 'Acme Office Supplies',
    expectedRisk: 'high',
    tag: 'Duplicate Flag / High Risk',
    description: 'Submits identical invoice INV-9001. Retrieve agent discovers prior matches and flags fraud duplicate alert.',
    rawText: `Invoice Number: INV-9001
Vendor: Acme Office Supplies
Due Date: 2026-10-15
Office chairs 5 x $150.00
Standing desks 2 x $250.00
Total Amount Due: $1250.00`,
  },
  {
    id: 'amount_anomaly',
    title: 'Amount Anomaly (3.3x Average)',
    vendor: 'Brightline Logistics',
    expectedRisk: 'high',
    tag: 'Anomaly / High Risk',
    description: 'Invoiced for $15,000.00 vs Brightline\'s historical average of $4,500.00 (exceeds 2.5x threshold).',
    rawText: `Invoice Number: INV-9050
Vendor: Brightline Logistics
Due Date: 2026-11-01
Freight shipping Q3 1 x $15000.00
Total Amount Due: $15000.00`,
  },
  {
    id: 'unapproved_vendor',
    title: 'Unapproved Vendor & Compliance Hold',
    vendor: 'Shadow Consulting LLC',
    expectedRisk: 'high',
    tag: 'Unapproved / Policy Hold',
    description: 'Vendor has not completed onboarding. Supplier KB surfaces compliance policy sign-off required.',
    rawText: `Invoice Number: INV-9099
Vendor: Shadow Consulting LLC
Due Date: 2026-10-20
Strategy consulting 1 x $8000.00
Total Amount Due: $8000.00`,
  },
  {
    id: 'po_number_direct_match',
    title: 'Explicit PO Reference Match',
    vendor: 'Meridian Cloud Services',
    expectedRisk: 'low',
    tag: 'PO Number Match',
    description: 'Cites explicit PO-1003 directly. Matched by PO number reference rather than amount guessing.',
    rawText: `Invoice Number: INV-9200
Vendor: Meridian Cloud Services
PO Number: PO-1003
Due Date: 2026-10-25
Cloud hosting monthly 1 x $2000.00
Total Amount Due: $2000.00`,
  },
  {
    id: 'po_vendor_mismatch',
    title: 'PO Vendor Cross-Mismatch',
    vendor: 'Sterling Print & Signage',
    expectedRisk: 'high',
    tag: 'PO Mismatch / High Risk',
    description: 'Sterling Print cites PO-1003, which actually belongs to Meridian Cloud Services. Flagged as cross-vendor mismatch.',
    rawText: `Invoice Number: INV-9201
Vendor: Sterling Print & Signage
PO Number: PO-1003
Due Date: 2026-10-28
Trade show banners 4 x $200.00
Total Amount Due: $800.00`,
  },
];
