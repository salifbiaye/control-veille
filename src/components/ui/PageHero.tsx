import React from 'react';

interface PageHeroProps {
    label: string;
    title: string;
    description: string;
    accentColor?: string;
    children?: React.ReactNode;
}

export function PageHero({
    label,
    title,
    description,
    accentColor = 'var(--brand)',
    children,
}: PageHeroProps) {
    return (
        <div className="relative overflow-hidden mb-8 page-hero rounded-b-3xl"
            style={{
                border: `1px solid var(--chrome-border)`,
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                boxShadow: `0 8px 32px -4px color-mix(in srgb, ${accentColor} 8%, transparent)`
            }}>

            {/* Blob principal */}
            <div className="absolute top-0 right-0 w-[500px] h-full pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 90% 30%, color-mix(in srgb, ${accentColor} 13%, transparent) 0%, transparent 65%)` }} />

            {/* Blob secondaire */}
            <div className="absolute bottom-0 left-0 w-[350px] h-[130%] pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 5% 90%, color-mix(in srgb, ${accentColor} 7%, transparent) 0%, transparent 60%)` }} />

            {/* Dot grid */}
            <div className="absolute inset-0 pointer-events-none page-hero-grid" />

            {/* Barre accent gauche */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${accentColor} 80%, transparent), transparent)` }} />

            <div className="relative px-6 sm:px-8 pt-8 pb-6">
                {/* Label pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 border"
                    style={{
                        color: accentColor,
                        background: `color-mix(in srgb, ${accentColor} 9%, transparent)`,
                        borderColor: `color-mix(in srgb, ${accentColor} 25%, transparent)`,
                        boxShadow: `0 0 12px color-mix(in srgb, ${accentColor} 9%, transparent)`,
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: accentColor }} />
                    {label}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 page-hero-title">
                    {title}
                </h1>

                {/* Description */}
                <p className="text-sm max-w-xl leading-relaxed mb-4 page-hero-desc">
                    {description}
                </p>

                {children && (
                    <div className="flex flex-wrap items-center gap-2">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
