// GenFlow API Client
// اتصال به Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// ===========================================
// Types
// ===========================================

export interface PersonalityAnalysisRequest {
  name: string
  age?: string
  education?: string
  work_experience?: string
  description: string
  mbti_preference?: string
  enneagram_preference?: string
}

export interface PersonalityAnalysisResponse {
  id: string
  personality_type: string
  traits: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  decision_style: string
  risk_tolerance: number
  recommended_roles: string[]
}

export interface BusinessAnalysisRequest {
  business_name: string
  industry?: string
  business_size?: string
  description: string
  challenges?: string
  goals?: string
  employee_count?: number
  annual_revenue?: string
}

export interface BusinessAnalysisResponse {
  id: string
  swot: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  bottlenecks: string[]
  processes: Array<{
    name: string
    importance: number
    bottlenecks: string[]
  }>
  recommended_positions: string[]
}

export interface PositionRequest {
  personality_analysis_id: string
  business_analysis_id: string
  priorities?: {
    time: number
    cost: number
    quality: number
  }
}

export interface PositionResponse {
  id: string
  title: string
  level: string
  summary: string
  interpretation: string
  kpis: Array<{
    name: string
    target: string
    frequency: string
    weight: number
  }>
  tasks: Array<{
    title: string
    description: string
    frequency: string
    priority: string
  }>
  requirements: {
    skills: string[]
    experience_years: number
    education: string
    personality_fit: string[]
  }
  match_scores: {
    personality_match: number
    business_fit: number
    overall_score: number
  }
}

// ===========================================
// API Functions
// ===========================================

class GenFlowAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // ─── Health ───
  async health(): Promise<{ status: string; version: string }> {
    return this.request('/health')
  }

  // ─── Personality Analysis ───
  async analyzePersonality(
    data: PersonalityAnalysisRequest
  ): Promise<PersonalityAnalysisResponse> {
    return this.request('/api/v1/analyze/personality', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ─── Business Analysis ───
  async analyzeBusiness(
    data: BusinessAnalysisRequest
  ): Promise<BusinessAnalysisResponse> {
    return this.request('/api/v1/analyze/business', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ─── Position Generation ───
  async generatePosition(
    data: PositionRequest
  ): Promise<PositionResponse> {
    return this.request('/api/v1/generate/position', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPosition(id: string): Promise<PositionResponse> {
    return this.request(`/api/v1/positions/${id}`)
  }
}

// ===========================================
// Export singleton
// ===========================================

export const genflowApi = new GenFlowAPI()

export default genflowApi
