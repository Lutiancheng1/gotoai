import History from '@/components/history'
import './index.css'
export default function Application() {
  return (
    <div className="application">
      <History addButton={false} header_title="" />
    </div>
  )
}
