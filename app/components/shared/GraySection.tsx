import React from 'react'

export default function GraySection({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div className="bg-gray-100 py-4">
        {children}
    </div>
  )
}
