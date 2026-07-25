import React from 'react'

interface GenCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'light' | 'dark'
}

export function GenCard({ children, className = '', variant = 'light' }: GenCardProps) {
  return (
    <div 
      className={`
        relative rounded-xl overflow-hidden
        ${variant === 'dark' 
          ? 'bg-[#10183c]' 
          : 'bg-white'
        }
        shadow-md
        ${className}
      `}
    >
      {/* Accent Line */}
      <div 
        className="absolute top-0 right-0 w-1 h-full"
        style={{ backgroundColor: '#298581' }}
      />
      
      {/* Content */}
      <div className="p-6 pr-8">
        {children}
      </div>
    </div>
  )
}
