import React from 'react'

interface GenBadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gold' | 'outline'
}

export function GenBadge({ 
  children, 
  className = '', 
  variant = 'default' 
}: GenBadgeProps) {
  const variants = {
    default: 'bg-[#298581] text-white',
    gold: 'bg-[#ECBA3D] text-[#181c34]',
    outline: 'border border-[#298581] text-[#298581] bg-transparent',
  }
  
  return (
    <span 
      className={`
        inline-block px-3 py-1 rounded-md text-xs font-semibold
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
