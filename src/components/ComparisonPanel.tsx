import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { comparisonData, radarGeometry, shouldShowComparison } from "../domain/exploration.ts";
import type { Conditions, EvaluationResult } from "../domain/types.ts";

function Radar({ results, need }: { results: ReturnType<typeof comparisonData>["series"]; need: number[] }) {
  const geometry = radarGeometry(results, need);
  return <svg className="block h-auto w-full max-w-[300px]" viewBox="0 0 360 310" role="img" aria-label="Comparación en gráfico radar">
    {geometry.rings.map((points, index) => <polygon key={index} points={points} className="fill-none stroke-input stroke-1" />)}
    {geometry.axes.map((axis) => <Fragment key={axis.label}><line x1="180" y1="155" x2={axis.x} y2={axis.y} className="stroke-input" /><text x={axis.labelX} y={axis.labelY} className="fill-muted-foreground font-display text-xs" textAnchor={axis.anchor} dominantBaseline="middle">{axis.label}</text></Fragment>)}
    <polygon points={geometry.need} className="fill-none stroke-foreground [stroke-width:1.5] [stroke-dasharray:4_3]" />
    {geometry.series.map((series) => <polygon key={series.materialId} points={series.points} fill={series.color} fillOpacity=".12" stroke={series.color} strokeWidth="2" />)}
  </svg>;
}

export default function ComparisonPanel({ results, conditions, onClear }: { results: readonly EvaluationResult[]; conditions: Conditions; onClear: () => void }) {
  const visible = shouldShowComparison(results.length);
  const comparison = comparisonData(results, conditions);
  return <Card className="grid grid-cols-[minmax(220px,300px)_minmax(0,1fr)] items-start gap-4 p-3.5 [@media(max-width:640px)]:grid-cols-1 [&_h4]:m-0 [&_h4]:mb-1 [&_h4]:font-display [&_h4]:[font-stretch:85%] [&_h4]:text-[17px]" id="compare" hidden={!visible}>
    {visible && <>
      <div><h4>Comparación</h4><div className="mb-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-xs [&_i]:mr-[5px] [&_i]:inline-block [&_i]:h-[3px] [&_i]:w-3.5 [&_i]:align-middle">{comparison.series.map((series) => <span key={series.materialId}><i style={{ background: series.color }} />{series.materialId}</span>)}<span><i className="h-0! border-0 border-t-2 border-dashed border-foreground bg-none" />Lo que pide tu pieza</span></div><Radar results={comparison.series} need={comparison.need} /></div>
      <div className="min-w-0 overflow-x-auto [&_td]:font-mono [&_td]:tabular-nums [&_:is(th,td):first-child]:text-left [&_:is(th,td):first-child]:text-muted-foreground"><Table><TableHeader><TableRow><TableHead />{comparison.series.map((series) => <TableHead key={series.materialId} style={{ color: series.color }}>{series.materialId}</TableHead>)}</TableRow></TableHeader><TableBody>{comparison.rows.map((row) => <TableRow key={row.label}><TableCell>{row.label}</TableCell>{row.values.map((value, index) => <TableCell key={`${row.label}-${index}`}>{value}</TableCell>)}</TableRow>)}</TableBody></Table>
        <div className="mt-2 flex flex-wrap items-center gap-2"><Button type="button" variant="ghost" id="cmpClear" onClick={onClear}>Quitar comparación</Button></div>
      </div>
    </>}
  </Card>;
}
