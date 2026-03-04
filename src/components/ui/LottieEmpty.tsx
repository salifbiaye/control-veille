'use client'
import Lottie from 'lottie-react'
import emptyAnimation from '../empty-box.json'
import { useLocale } from '@/lib/i18n/locale-provider'
import { getT } from '@/lib/i18n'

interface LottieEmptyProps {
    message?: string
    size?: number
}

export function LottieEmpty({ message, size = 380 }: LottieEmptyProps) {
    const { locale } = useLocale()
    const t = getT(locale)
    const displayMessage = message ?? t.command.noResults
    // Adapter le padding et la taille de la card en fonction de la taille du Lottie
    const isSmall = size < 100
    const isMedium = size >= 100 && size < 200

    const padding = isSmall ? 'px-6 py-8' : isMedium ? 'px-8 py-10' : 'px-12 py-16'
    const gap = isSmall ? 'gap-3' : isMedium ? 'gap-4' : 'gap-6'
    const textSize = isSmall ? 'text-xs' : isMedium ? 'text-sm' : 'text-lg'
    const maxWidth = isSmall ? '280px' : isMedium ? '400px' : '600px'

    return (
        <div className="flex items-center justify-center w-full py-12">
            <div
                className={`flex flex-col items-center justify-center ${gap} ${padding} rounded-2xl`}
                style={{
                    background: 'var(--glass-bg)',
                    border: '2px dashed var(--glass-border)',
                    maxWidth,
                    width: '100%'
                }}
            >
                <Lottie
                    animationData={emptyAnimation}
                    loop={true}
                    style={{ width: size, height: size }}
                />
                <p className={`${textSize} font-medium text-center`} style={{ color: 'var(--txt-sub)' }}>
                    {displayMessage}
                </p>
            </div>
        </div>
    )
}
