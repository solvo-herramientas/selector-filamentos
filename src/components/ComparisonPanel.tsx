import { Fragment } from "react";
import { comparisonData, radarGeometry, shouldShowComparison } from "../domain/exploration.ts";
import type { Conditions, EvaluationResult } from "../domain/types.ts";

function Radar({ results, need }: { results: ReturnType<typeof comparisonData>["series"]; need: number[] }) {
  const geometry = radarGeometry(results, need);
  return <svg className="radar" viewBox="0 0 360 310" role="img" aria-label="Comparación en gráfico radar">
    {geometry.rings.map((points, index) => <polygon key={index} points={points} fill="none" stroke="var(--line)" strokeWidth="1" />)}
    {geometry.axes.map((axis) => <Fragment key={axis.label}><line x1="180" y1="155" x2={axis.x} y2={axis.y} stroke="var(--line)" /><text x={axis.labelX} y={axis.labelY} fontSize="12" fill="var(--muted)" textAnchor={axis.anchor} dominantBaseline="middle" fontFamily="Archivo, sans-serif">{axis.label}</text></Fragment>)}
    <polygon points={geometry.need} fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="4 3" />
    {geometry.series.map((series) => <polygon key={series.materialId} points={series.points} fill={series.color} fillOpacity=".12" stroke={series.color} strokeWidth="2" />)}
  </svg>;
}

export default function ComparisonPanel({ results, conditions, onClear }: { results: readonly EvaluationResult[]; conditions: Conditions; onClear: () => void }) {
  const visible = shouldShowComparison(results.length);
  const comparison = comparisonData(results, conditions);
  return <div className="compare" id="compare" hidden={!visible}>
    {visible && <>
      <div><h4>Comparación</h4><div className="key">{comparison.series.map((series) => <span key={series.materialId}><i style={{ background: series.color }} />{series.materialId}</span>)}<span><i style={{ background: "none", borderTop: "2px dashed var(--ink)", height: 0 }} />Lo que pide tu pieza</span></div><Radar results={comparison.series} need={comparison.need} /></div>
      <div className="ctab"><table><thead><tr><th />{comparison.series.map((series) => <th key={series.materialId} style={{ color: series.color }}>{series.materialId}</th>)}</tr></thead><tbody>{comparison.rows.map((row) => <tr key={row.label}><td>{row.label}</td>{row.values.map((value, index) => <td key={`${row.label}-${index}`}>{value}</td>)}</tr>)}</tbody></table>
        <div className="tools" style={{ marginTop: 8 }}><button type="button" className="btn ghost" id="cmpClear" onClick={onClear}>Quitar comparación</button></div>
      </div>
    </>}
  </div>;
}
