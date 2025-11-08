// Queue related types shared between frontend and backend

export interface ReviewField {
	fieldName: string
	status: 'approved' | 'rejected' | 'flagged'
	reason?: string
	confidence?: number
	finalValue?: string
	aiValues?: Array<{
		model: string
		value: string
		confidence?: number
		page?: number
		sourceText?: string
	}>
	documentId?: string
	extractAgentRunId?: string
	humanReview?: {
		decision: string
		finalValue: string
		reviewedAt: number
		reviewedBy: string
	}
}

// Types are imported directly from the schema in services that need them

export interface FieldDiscrepancy {
	fieldName: string
	models: {
		model: string
		value: string
		confidence: number
		page?: number
		sourceText?: string
	}[]
	hasConsensus: boolean
	consensusValue?: string
	highestConfidenceModel?: string
	highestConfidence?: number
}

export interface ReviewResult {
	status: 'approved' | 'rejected' | 'flagged_for_review'
	confidence: number
	reviewedFields: ReviewField[]
	processingTime: number
	requiresHumanIntervention?: boolean
	humanReviewCompleted?: boolean
	humanReviewTimestamp?: number
	humanReviewCount?: number
}

export interface QueueItem {
	id: string
	documentId: string
	documentName: string
	workstreamRunId: string
	workstreamName: string
	companyName?: string
	createdAt: string
	extractResults: unknown[] // Will be typed properly in the service
	discrepancies: FieldDiscrepancy[]
	totalFields: number
	discrepancyCount: number
	avgConfidence: number
	priority: 'high' | 'medium' | 'low'
	status: 'pending' | 'reviewing' | 'resolved'
	reviewResult?: ReviewResult
	extractionAgentName?: string // Name of the extraction agent that defines document type
}

export interface DocumentData extends QueueItem {
	flaggedFields: number
}

export interface DocumentTypeGroup {
	documentType: string
	documents: DocumentData[]
}

export interface WorkstreamRunGroup {
	workstreamRunId: string
	workstreamName: string
	companyName?: string
	createdAt?: string
	documentTypes: DocumentTypeGroup[]
}

export interface CompanyGroup {
	companyId: string
	companyName: string
	workstreamRuns: WorkstreamRunGroup[]
}

export interface QueueStats {
	total: number
	high: number
	medium: number
	low: number
	pending: number
	reviewing: number
	resolved: number
	approved?: number
}

export interface PaginationInfo {
	page: number
	limit: number
	total: number
	totalPages: number
}

export interface FlatQueueStructure {
	workstreamRuns: WorkstreamRunGroup[]
	approvedRuns: WorkstreamRunGroup[]
	stats: QueueStats
	pagination?: PaginationInfo
}

export interface QueueResult {
	queueItems: QueueItem[]
	stats: QueueStats
}

// Note: SubmitReviewRequest and SubmitReviewResponse types are now exported from api-schemas/reviewQueue.schema.ts

export enum DocumentType {
	COI = 'COI Doc',
	SPA = 'SPA Doc',
	NDA = 'NDA Doc',
	TERM_SHEET = 'Term Sheet',
	OTHER = 'Other Doc',
}

// Extended types for completed review items with full traceability
export interface AIModelValue {
	model: string
	value: string
	confidence: number
}

export interface CompletedFieldReview {
	fieldName: string
	status: 'reviewed' | 'approved' | 'corrected' | 'rejected'
	finalValue: string
	originalValue: string
	reason: 'ai-disagreement' | 'low-confidence' | 'manual-review' | 'validation-error' | 'other'
	humanDecision: 'approved' | 'corrected' | 'rejected'
	reviewerId: string
	reviewerName?: string
	reviewedAt: string
	aiValues: AIModelValue[]
	confidence?: number
	notes?: string
}

export interface CompletedReviewDocument {
	documentId: string
	fileName: string
	documentType: string
	status: 'approved' | 'partially-approved' | 'rejected'
	completedAt: string
	processingDate: string
	reviewedFields: CompletedFieldReview[]
	totalFields: number
	reviewedFieldsCount: number
	approvedFieldsCount: number
	correctedFieldsCount: number
	rejectedFieldsCount: number
	reviewSummary?: string
	overallConfidence: number
	processingTime: number
	metadata?: {
		companyName?: string
		workstreamName?: string
		workstreamRunId?: string
	}
}

export interface CompletedReviewItemProps {
	document: CompletedReviewDocument
	showMetadata?: boolean
	showFieldDetails?: boolean
	compact?: boolean
	onViewDetails?: (documentId: string) => void
	onReviewField?: (documentId: string, fieldName: string) => void
}

// Document review modal types
export interface ReviewData {
	id: string
	documentId: string
	workflowName: string
	documentName: string
	field: string
	priority: 'high' | 'medium' | 'low'
	timestamp: string
	extractResults: Array<{
		model: string
		fields: Array<{
			id: string
			name: string
			extractedValue: string
			confidence: number
			error?: string
			page?: number
			sourceText?: string
		}>
	}>
	discrepancies: FieldDiscrepancy[]
	reviewResult?: {
		reviewedFields: Array<{
			fieldName: string
			aiValues?: Array<{
				model: string
				value: string
				confidence?: number
				page?: number
				sourceText?: string
			}>
			documentId?: string
			extractAgentRunId?: string
		}>
	}
}
