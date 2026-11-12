import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { parseTransit } from '../src/domain.ts';
const origin=process.argv[2];
if(!origin || !/^https?:\/\//.test(origin))throw new Error('Usage: npm run replay -- https://<verified-deployment-origin>');
const response=await fetch(new URL('/api/transit',origin));
assert.equal(response.status,200);const record=await response.json();assert.equal(record.available,true);
const pairs=await Promise.all(['tripupdates','vehiclepositions'].map(async kind=>{
 const url=new URL('/api/transit/raw',origin);url.searchParams.set('kind',kind);url.searchParams.set('snapshot',record.latest.id);
 const result=await fetch(url);assert.equal(result.status,200);const bytes=new Uint8Array(await result.arrayBuffer());
 assert.equal(createHash('sha256').update(bytes).digest('hex'),result.headers.get('x-content-sha256'));
 return bytes;
}));
const labels=Object.fromEntries(record.latest.routes.map(r=>[r.route_id,r.label.replace(/ · direction .+$/,'')]));
// Replay at the actual original capture time, not the current clock. This is not a new live observation.
const replay=parseTransit(pairs[0],pairs[1],labels,record.latest.fetched_at);
for(const key of ['source_ts','vehicle_source_ts','input_trips','input_positions','invalid_positions','missing_delay','cancelled_trips','duplicate_trips','invalid_trips'])assert.deepEqual(replay[key],record.latest[key],key);
assert.deepEqual(replay.routes,record.latest.routes);assert.deepEqual(replay.positions,record.latest.positions);
console.log(JSON.stringify({verified:'Persisted raw bytes reproduce the accepted normalized snapshot',snapshot:record.latest.id,source_time:new Date(record.latest.source_ts).toISOString(),trip_entities:replay.input_trips,valid_positions:replay.positions.length},null,2));
