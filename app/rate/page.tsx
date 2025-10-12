'use client'

import { useState } from 'react'
import RateModal from '@/components/RateModal'

export default function RatePage() {
  const [showModal, setShowModal] = useState(true)

  return (
    <main className="min-h-screen bg-gray-50">
      {showModal && <RateModal onClose={() => window.location.href = '/'} />}
    </main>
  )
}

