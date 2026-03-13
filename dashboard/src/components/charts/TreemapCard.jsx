import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = [
  '#4361ee', '#7209b7', '#f72585', '#06d6a0', '#ffd166',
  '#118ab2', '#ef476f', '#3a86ff', '#ff006e', '#8338ec',
  '#fb5607', '#ffbe0b', '#073b4c', '#2ec4b6', '#e71d36',
]

function CustomContent({ x, y, width, height, name, index }) {
  if (width < 20 || height < 16) return null
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        fill={COLORS[index % COLORS.length]}
        fillOpacity={0.82}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
      />
      {width > 48 && height > 28 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={Math.min(12, Math.max(9, width / (name.length * 0.7)))}
          fontWeight={600}
        >
          {name}
        </text>
      )}
    </g>
  )
}

function TreemapCard({ config }) {
  if (!config) return <div className="chart-empty">Need categorical data for treemap</div>

  const { data, title } = config

  return (
    <>
      <p className="chart-title">{title}</p>
      <ResponsiveContainer width="100%" height={260}>
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          content={<CustomContent />}
        >
          <Tooltip formatter={(v) => [v, 'Count']} />
        </Treemap>
      </ResponsiveContainer>
    </>
  )
}

export default TreemapCard
