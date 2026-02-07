'use client';

import { Skeleton } from '@heroui/react';

export default function MovieCardSkeleton() {
    return (
        <article className="movie-card movie-card-loading" >
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="movie-title">
                        <Skeleton className="w-50 h-8" />
                    </h2>
                    <Skeleton className="w-12 h-6 tag" />
                </div>
                <div className="flex justify-center pb-4">
                    <Skeleton className="w-50 h-75" />
                </div>
                <div className="text-sm text-secondary mb-4 flex flex-wrap gap-2 items-center">
                    <Skeleton className="w-24 h-4" />
                    <span className="grow">
                        <Skeleton className="w-full h-4" />
                    </span>
                </div>

                <div className="text-primary text-sm line-clamp-3 mb-4">
                    <Skeleton className="w-full h-4" />
                </div>

                <div className="text-xs text-secondary space-y-1">
                    <div><Skeleton className="w-48 h-4" /></div>
                    <div><Skeleton className="w-48 h-4" /></div>
                </div>
            </div>
        </article >
    );
}