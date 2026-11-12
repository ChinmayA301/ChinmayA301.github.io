import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
const origin=process.argv[2];
if(!origin || !/^https:\/\//.test(origin))throw new Error('Usage: npm run acceptance -- https://<verified-origin>');
async function read(path){const r=await fetch(new URL(path,origin));assert.equal(r.status,200,path);return r.json();}
const [health,seismic,transit]=await Promise.all([read('/api/health'),read('/api/seismic'),read('/api/transit')]);
assert.equal(seismic.available,true);assert.equal(transit.available,true);
const sourceUrl=`https://raw.githubusercontent.com/ChinmayA301/Live-Seismic-ML-Pipeline/${seismic.snapshots[0].commit_sha}/reports/_metrics.json`;
const sourceResponse=await fetch(sourceUrl);assert.equal(sourceResponse.status,200);
assert.deepEqual(seismic.snapshots[0].metrics,await sourceResponse.json());
const sourceTimes=[...new Set(transit.runs.filter(r=>r.status==='success').map(r=>r.source_ts))];
assert(sourceTimes.length>=2,'At least two distinct scheduled source snapshots are required');
assert.equal((await fetch(new URL('/api/transit?route=invalid-selector',origin))).status,400);
assert.equal((await fetch(new URL('/api/transit',origin),{method:'POST'})).status,405);
for(const p of transit.forecasts){assert.equal(p.target_at-p.issued_at,600_000);assert(p.issued_at>=transit.latest.fetched_at);assert.equal(p.feature_ts,transit.latest.source_ts);}
const evidence={captured_at:new Date().toISOString(),origin,checks:{public_api:true,seismic_metrics_match_pinned_upstream:true,distinct_successful_source_times:sourceTimes.length,invalid_selector_rejected:true,public_writes_rejected:true,forecast_issue_clock_separate_from_source_clock:true},
 seismic:{report_revisions:seismic.snapshots.length,latest_report_sha:seismic.snapshots[0].commit_sha,generated_at:new Date(seismic.snapshots[0].generated_at).toISOString(),source_url:sourceUrl},
 transit:{source_time:new Date(transit.latest.source_ts).toISOString(),fetched_at:new Date(transit.latest.fetched_at).toISOString(),accepted_route_directions:transit.latest.routes.length,valid_vehicle_positions:transit.latest.positions.length,forecast_count:transit.forecasts.length,settled_forecasts:transit.evaluation.reduce((n,r)=>n+r.n,0),fitted_models:transit.models.length,archive_objects:transit.archive.snapshots},
 limitations:['This is a timestamped acceptance capture, not a continuously updated report.','Empty model/evaluation counts mean history is still accumulating; no predictive gain is asserted.']};
await mkdir(new URL('../evidence/',import.meta.url),{recursive:true});
await writeFile(new URL('../evidence/acceptance.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence,null,2));
