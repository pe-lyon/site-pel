export const dynamic = 'force-dynamic'

import TopBar from '@/components/layout/TopBar'
import HemicycleView from '@/components/hemicycle/HemicycleView'

export default function HemicyclePage() {
  return (
    <div>
      <TopBar title="Hémicycle" />
      <div className="p-6">
        <HemicycleView />
      </div>
    </div>
  )
}
