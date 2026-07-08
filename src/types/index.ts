import { Timestamp } from 'firebase/firestore'

export type QuestionType =
  | 'short'
  | 'long'
  | 'radio'
  | 'checkbox'
  | 'ox'
  | 'omr'
  | 'dropdown'
  | 'date'
  | 'number'
  | 'info'

export type FormType = 'enrollment' | 'generic' | 'quiz'

export interface Question {
  id: string
  type: QuestionType
  label: string
  required: boolean
  options?: string[]
  linkUrl?: string
  linkText?: string
  correctAnswer?: string | string[]
  points?: number
  omrCount?: number
  branching?: Record<string, string>
}

export interface Section {
  id: string
  title: string
  questions: Question[]
}

export interface Form {
  id?: string
  title: string
  description: string
  type: FormType
  isActive: boolean
  createdAt?: Timestamp
  sections: Section[]
}

export interface Post {
  id: string
  tag: string
  title: string
  date: string
  read: string
  excerpt: string
  coverImage: string
  content: string
  pinned?: boolean
  views?: number
  published?: boolean
}

export interface Response {
  id?: string
  formId: string
  respondentName: string
  submittedAt?: Timestamp
  answers: Record<string, string | string[]>
  score?: number
  totalScore?: number
}
