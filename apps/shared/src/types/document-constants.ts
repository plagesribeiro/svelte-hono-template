/**
 * Supported document MIME types
 */
export const SUPPORTED_DOCUMENT_MIME_TYPES = [
	'application/pdf',
	'application/msword', // .doc
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
] as const

/**
 * Type for supported document MIME types
 */
export type SupportedDocumentMimeType = (typeof SUPPORTED_DOCUMENT_MIME_TYPES)[number]

/**
 * Human-readable file type names
 */
export const SUPPORTED_DOCUMENT_EXTENSIONS = ['PDF', 'DOC', 'DOCX'] as const
