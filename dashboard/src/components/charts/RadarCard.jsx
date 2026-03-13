import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer,
} from 'recharts'

const COLOR = '#7209b7'

function RadarCard({ config }) {
  if (!config) return <div className="chart-empty">Need at least 3 numeric columns for radar chart</div>

  const { data, title } = config

  return (
    <>
      <p className="chart-title">{title}</p>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="col" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar name="Relative Mean" dataKey="value" stroke={COLOR} fill={COLOR} fillOpacity={0.3} />
          <Tooltip formatter={(v) => [`${v}%`, 'Relative Mean']} />
        </RadarChart>
      </ResponsiveContainer>
    </>
  )
}

export default RadarCard
