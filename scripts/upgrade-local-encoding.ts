// Local-only, lossless Unicode upgrade. Retains the original database as a disabled backup.
import {readFileSync} from 'node:fs';
import {Client} from 'pg';
import {spawnSync} from 'node:child_process';
const name=process.argv[2];
if(!['codeyea','codeyea_test'].includes(name))throw new Error('Explicit local database name required');
const runtime=JSON.parse(readFileSync('.local/runtime.json','utf8'));
const config={host:'127.0.0.1',port:runtime.port,user:'postgres',password:runtime.superPassword};
const admin=new Client({...config,database:'postgres'});await admin.connect();
const source=new Client({...config,database:name});await source.connect();
const encoding=(await source.query('SHOW server_encoding')).rows[0].server_encoding;
if(encoding==='UTF8'){console.log(name+': already UTF8');await source.end();await admin.end();process.exit(0)}
const next=name+'_utf8',backup=name+'_win1252_backup';
const quote=(v:string)=>'"'+v.replaceAll('"','""')+'"';
if((await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',[backup])).rowCount)throw new Error('Backup already exists; inspect before resuming');
const exists=(await admin.query('SELECT 1 FROM pg_database WHERE datname=$1',[next])).rowCount;
if(!exists)await admin.query('CREATE DATABASE '+quote(next)+' OWNER '+quote(name)+" TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C'");
let frozen=false,switched=false;
const target=new Client({...config,database:next});
try {
 const url=new URL('postgresql://127.0.0.1:'+runtime.port+'/'+next);url.username='postgres';url.password=runtime.superPassword;
 const migrate=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{env:{...process.env,DIRECT_URL:url.toString()},stdio:'pipe'});
 if(migrate.status!==0)throw new Error('Replacement schema migration failed');
 await target.connect();
 await admin.query('ALTER DATABASE '+quote(name)+' ALLOW_CONNECTIONS false');frozen=true;
 await admin.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid<>$2',[name,(await source.query('SELECT pg_backend_pid() AS pid')).rows[0].pid]);
 const tables=(await source.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows.map(r=>r.tablename as string);
 for(const table of tables.filter(t=>t!=='_prisma_migrations'))if(Number((await target.query('SELECT count(*) AS n FROM '+quote(table))).rows[0].n)!==0)throw new Error('Replacement contains data; refusing overwrite');
 await target.query('BEGIN');await target.query("SET LOCAL session_replication_role='replica'");
 for(const table of tables){
  const rows=(await source.query('SELECT row_to_json(t) AS data FROM '+quote(table)+' t')).rows.map(r=>r.data);
  await target.query('DELETE FROM '+quote(table));
  // json_populate_record preserves timestamps, JSON, enums and nullable fields without JS coercion.
  for(const row of rows)await target.query('INSERT INTO '+quote(table)+' SELECT * FROM json_populate_record(NULL::'+quote(table)+',$1::json)',[JSON.stringify(row)]);
  const digest='SELECT to_jsonb(t)::text AS row FROM '+quote(table)+' t';
  const canonical=(result:{rows:{row:string}[]})=>JSON.stringify(result.rows.map(r=>r.row).sort());
  if(canonical(await source.query(digest))!==canonical(await target.query(digest)))throw new Error('Copy verification failed: '+table);
 }
 await target.query('COMMIT');
 for(const table of tables)await target.query('ALTER TABLE '+quote(table)+' OWNER TO '+quote(name));
 await target.query('GRANT USAGE ON SCHEMA public TO '+quote(name));
 await target.end();await source.end();
 await admin.query('ALTER DATABASE '+quote(name)+' RENAME TO '+quote(backup));
 await admin.query('ALTER DATABASE '+quote(next)+' RENAME TO '+quote(name));switched=true;
 await admin.query('REVOKE CONNECT ON DATABASE '+quote(name)+' FROM PUBLIC');
 await admin.query('GRANT CONNECT ON DATABASE '+quote(name)+' TO '+quote(name));
 console.log(name+': UTF8 verified; all '+tables.length+' tables identical; original retained as disabled '+backup);
} catch(error){if(frozen&&!switched)await admin.query('ALTER DATABASE '+quote(name)+' ALLOW_CONNECTIONS true').catch(()=>{});throw error}
finally{await target.end().catch(()=>{});await source.end().catch(()=>{});await admin.end()}
