import { LottieLoader } from '@/components/ui/LottieLoader'

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
            <LottieLoader size={350} />
        </div>
    )
}
