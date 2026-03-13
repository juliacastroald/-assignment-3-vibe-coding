import BarCard      from './charts/BarCard'
import LineCard     from './charts/LineCard'
import PieCard      from './charts/PieCard'
import ScatterCard  from './charts/ScatterCard'
import AreaCard     from './charts/AreaCard'
import RadarCard    from './charts/RadarCard'
import TreemapCard  from './charts/TreemapCard'
import ComposedCard from './charts/ComposedCard'

const CARD_MAP = {
  bar:      BarCard,
  line:     LineCard,
  pie:      PieCard,
  scatter:  ScatterCard,
  area:     AreaCard,
  radar:    RadarCard,
  treemap:  TreemapCard,
  composed: ComposedCard,
}

function ChartGrid({ charts, selectedCharts }) {
  const isOdd = selectedCharts.length % 2 !== 0

  return (
    <div className="chart-grid">
      {selectedCharts.map((key, i) => {
        const Card = CARD_MAP[key]
        const isLastOdd = isOdd && i === selectedCharts.length - 1
        return (
          <div key={key} className={`chart-card${isLastOdd ? ' full-width' : ''}`}>
            <Card config={charts[key]} />
          </div>
        )
      })}
    </div>
  )
}

export default ChartGrid
