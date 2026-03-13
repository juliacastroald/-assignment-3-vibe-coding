import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

function ComposedCard({ config }) {
  if (!config) return <div className="chart-empty">Not enough data for this chart</div>

  const { data, xKey, yKey, title, yLabel } = config

  return (
    <>
      <p className="chart-title">{title}</p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 24, bottom: 40, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
          <YAxis
            tick={{ fontSize: 11 }}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10 } }}
          />
          <Tooltip formatter={(v, name) => [typeof v === 'number' ? v.toLocaleString() : v, name]} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey={yKey} name={yLabel} fill="#4361ee" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="avg" name="Running avg" stroke="#f72585" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  )
}

export default ComposedCard
