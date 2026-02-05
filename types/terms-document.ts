export interface ITermsDocument {
  _id?: string
  type: 'terms' | 'privacy'
  version: string
  effectiveDate: string
  content: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ITermsDocumentRequest {
  type: 'terms' | 'privacy'
  version: string
  effectiveDate: string
  content: string
}
