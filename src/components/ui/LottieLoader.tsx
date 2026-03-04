'use client'

import Lottie from 'lottie-react'
import loaderAnimation from '@/components/admin-loader.json'

export function LottieLoader({ size = 400 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center w-full py-12">
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        style={{width: size, height: size}}
      />
    </div>
  )
}
