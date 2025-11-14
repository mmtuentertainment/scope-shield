// T024: TypeScript definitions for change order entities

/**
 * Change Order entity
 * Represents a generated change order document
 */
export interface ChangeOrder {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Sequential number per client (#001, #002, etc.) */
  changeOrderNumber: string;
  /** Client name (from email or user-entered) */
  clientName: string;
  /** Client email address */
  clientEmail: string;
  /** Freelancer name (from settings) */
  freelancerName: string;
  /** Timestamp of generation (ISO 8601) */
  dateCreated: string;
  /** Summary of original project scope (max 500 chars) */
  originalScope: string;
  /** List of scope creep requests (detected text) */
  requestedChanges: string[];
  /** Estimated additional cost (user-editable) */
  costEstimate: string;
  /** Updated project timeline (user-editable) */
  revisedTimeline: string;
  /** Payment conditions (default "Net 30", user-editable) */
  paymentTerms: string;
  /** Custom notes from freelancer */
  additionalNotes: string;
  /** Document status */
  status: 'draft' | 'generated' | 'exported';
  /** When exported (ISO 8601, nullable) */
  exportedAt: string | null;
  /** Export format (nullable) */
  exportFormat: 'pdf' | 'text' | 'clipboard' | null;
}

/**
 * Freelancer Settings entity
 * Stores user preferences
 */
export interface FreelancerSettings {
  /** User's professional name for change orders */
  freelancerName: string;
  /** Default hourly rate for pricing calculator (USD) */
  hourlyRate: number;
  /** Default export method */
  defaultExportMethod: 'clipboard' | 'pdf' | 'text';
  /** Whether to auto-export after editing */
  autoExportEnabled: boolean;
  /** Seconds to wait before auto-export */
  autoExportDelay: number;
  /** Last update timestamp (ISO 8601) */
  lastUpdated: string | null;
}

/**
 * Export History entry
 * Tracks exported change orders
 */
export interface ExportHistory {
  /** Reference to ChangeOrder ID */
  changeOrderId: string;
  /** Timestamp (ISO 8601) */
  exportedAt: string;
  /** Export format */
  exportFormat: 'pdf' | 'text' | 'clipboard';
  /** Who received it (optional) */
  recipientEmail?: string;
}

/**
 * Change Order Template
 * Represents document structure
 */
export interface ChangeOrderTemplate {
  /** Template identifier */
  templateId: string;
  /** Ordered list of document sections */
  sections: TemplateSection[];
  /** Typography, spacing, colors */
  formatting: TemplateFormatting;
  /** Variable substitution mappings */
  placeholders: Record<string, string>;
}

/**
 * Template Section
 * Individual section in change order template
 */
export interface TemplateSection {
  /** Section identifier */
  id: string;
  /** Display title */
  title: string;
  /** HTML content with placeholders */
  content: string;
  /** Display order */
  order: number;
}

/**
 * Template Formatting
 * Typography and styling for templates
 */
export interface TemplateFormatting {
  /** Font family */
  fontFamily: string;
  /** Body text size (px) */
  bodyFontSize: number;
  /** Heading size (px) */
  headingFontSize: number;
  /** Line spacing */
  lineSpacing: number;
  /** Margins (px) */
  margins: number;
}
