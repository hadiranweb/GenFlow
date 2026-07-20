'use client'

import { useState } from 'react'
import { GenCard, GenBadge, GenButton, GenInput } from '@genflow/ui'

export default function Home() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [personalityData, setPersonalityData] = useState({
    name: '',
    description: ''
  })
  
  const [businessData, setBusinessData] = useState({
    businessName: '',
    description: ''
  })

  const handleSubmit = async () => {
    setLoading(true)
    // TODO: Connect to API
    setTimeout(() => {
      setLoading(false)
      setStep(3)
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border-default)] px-10 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
          <span className="text-xl font-semibold text-[var(--color-text-primary)]">
            GenFlow
          </span>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="px-10 py-6">
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step >= s ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {s}
              </div>
              <span className={`
                text-sm
                ${step >= s ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}
              `}>
                {s === 1 ? 'Personality' : s === 2 ? 'Business' : 'Position'}
              </span>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${step > s ? 'bg-teal-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-10 py-8 max-w-4xl mx-auto">
        
        {/* Step 1: Personality */}
        {step === 1 && (
          <GenCard>
            <GenBadge>Personality Analysis</GenBadge>
            <h1 className="text-2xl font-bold mt-4 mb-6">
              Tell us about yourself
            </h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your name</label>
                <GenInput 
                  placeholder="Full name"
                  value={personalityData.name}
                  onChange={(e) => setPersonalityData({...personalityData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Describe yourself
                </label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white
                    text-[#181c34] placeholder:text-[#9CA3AF]
                    focus:outline-none focus:ring-2 focus:ring-[#298581] focus:border-transparent
                    transition-all duration-150 resize-none"
                  rows={4}
                  placeholder="Write about your experiences, skills, and personality traits..."
                  value={personalityData.description}
                  onChange={(e) => setPersonalityData({...personalityData, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <GenButton onClick={() => setStep(2)}>
                Continue
              </GenButton>
            </div>
          </GenCard>
        )}

        {/* Step 2: Business */}
        {step === 2 && (
          <GenCard>
            <GenBadge>Business Analysis</GenBadge>
            <h1 className="text-2xl font-bold mt-4 mb-6">
              Tell us about your business
            </h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business name</label>
                <GenInput 
                  placeholder="Company name"
                  value={businessData.businessName}
                  onChange={(e) => setBusinessData({...businessData, businessName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Describe your business
                </label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white
                    text-[#181c34] placeholder:text-[#9CA3AF]
                    focus:outline-none focus:ring-2 focus:ring-[#298581] focus:border-transparent
                    transition-all duration-150 resize-none"
                  rows={4}
                  placeholder="Describe your business type, challenges, and goals..."
                  value={businessData.description}
                  onChange={(e) => setBusinessData({...businessData, description: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <GenButton variant="secondary" onClick={() => setStep(1)}>
                Back
              </GenButton>
              <GenButton onClick={handleSubmit} disabled={loading}>
                {loading ? 'Analyzing...' : 'Generate Position'}
              </GenButton>
            </div>
          </GenCard>
        )}

        {/* Step 3: Result */}
        {step === 3 && (
          <div className="space-y-6">
            <GenCard>
              <GenBadge>Recommended Position</GenBadge>
              <h1 className="text-2xl font-bold mt-4">
                Business Development Manager
              </h1>
              <p className="text-[var(--color-text-secondary)] mt-2">
                Level: Mid
              </p>
              
              <div className="mt-6 p-4 bg-[var(--color-bg-tertiary)] rounded-xl">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Responsible for business growth through process optimization and 
                  new customer acquisition.
                </p>
              </div>
            </GenCard>
            
            {/* KPIs */}
            <GenCard>
              <h3 className="font-semibold mb-4">Key Performance Indicators (KPI)</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sales Growth', target: '20% monthly growth', weight: '40%' },
                  { name: 'Customer Satisfaction', target: '85%', weight: '30%' },
                  { name: 'Response Time', target: 'Under 2 hours', weight: '30%' },
                ].map((kpi, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                    <div>
                      <span className="font-medium">{kpi.name}</span>
                      <p className="text-sm text-[var(--color-text-muted)]">{kpi.target}</p>
                    </div>
                    <GenBadge>{kpi.weight}</GenBadge>
                  </div>
                ))}
              </div>
            </GenCard>
            
            {/* Actions */}
            <div className="flex gap-4">
              <GenButton variant="secondary" onClick={() => setStep(1)}>
                Start Over
              </GenButton>
              <GenButton>
                Download PDF
              </GenButton>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
