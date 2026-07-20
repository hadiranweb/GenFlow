import React from 'react'

interface GenButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function GenButton({ 
  children, 
  onClick, 
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md'
}: GenButtonProps) {
  const variants = {
    primary: `
      bg-[#298581] text-white 
      hover:bg-[#1A6B62] 
      active:bg-[#166b62]
    `,
    secondary: `
      bg-[#F1F5F9] text-[#181c34] 
      hover:bg-[#E5E7EB]
    `,
    ghost: `
      bg-transparent text-[#298581] 
      hover:bg-[#F1F5F9]
    `,
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-lg font-medium transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
