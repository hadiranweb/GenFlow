import React from 'react'

interface GenInputProps {
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
}

export function GenInput({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false
}: GenInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full px-4 py-2.5 rounded-lg
        bg-white border border-[#E5E7EB]
        text-[#181c34] placeholder:text-[#9CA3AF]
        focus:outline-none focus:ring-2 focus:ring-[#298581] focus:border-transparent
        disabled:bg-[#F1F5F9] disabled:cursor-not-allowed
        transition-all duration-150
        ${className}
      `}
    />
  )
}
