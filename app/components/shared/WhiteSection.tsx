import React from 'react'

export default function WhiteSection({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div className="py-4">
        {children}
    </div>
  )
}
