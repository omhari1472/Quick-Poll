import { Suspense } from 'react'
import { HomeFeed } from '@/components/pages/HomeFeed'
import { HomeFeedSkeleton } from '@/components/ui/Skeleton'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<HomeFeedSkeleton />}>
        <HomeFeed />
      </Suspense>
    </main>
  )
}
