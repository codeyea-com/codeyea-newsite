import fs from 'node:fs/promises';
import { defaultHostingServerFeatures } from '../src/schemas/hosting-server-features';
import { templateContent, templatePageDraft } from '../src/server/site-documents';
import { resolvePageAdditions } from '../src/schemas/page-additions';
const slugs=['website-hosting','wordpress-hosting','cloud-hosting','email-hosting'];
const quote=(text:string)=>"'"+text.replaceAll("'","''")+"'";
const rows=[];
for(const slug of slugs)for(const locale of ['en','ar']){
  const feature=defaultHostingServerFeatures(locale);
  let initial=null;
  if(locale==='en'){
    const source=await templateContent(slug),draft=templatePageDraft(slug,source);
    const content={...draft.content,additions:resolvePageAdditions(slug,draft.content.additions,locale)};
    initial={title:draft.title,content};
  }
  rows.push(`(${quote(slug)},${quote(locale)},${quote(JSON.stringify(feature))}::jsonb,${initial?quote(JSON.stringify(initial))+'::jsonb':'NULL::jsonb'})`);
}
const names=slugs.map(quote).join(',');
const guard=`SELECT 1 / CASE WHEN (SELECT COUNT(*) FROM "SiteDocument" WHERE kind='page' AND template=slug AND locale='ar' AND slug IN (${names}) AND version=1)=4 AND (SELECT COUNT(*) FROM "SiteDocument" WHERE locale='en' AND slug IN (${names}))=0 THEN 1 ELSE 0 END AS expected_versions;`;
const sql=`WITH payload(slug,locale,feature,initial) AS (VALUES ${rows.join(',\n')}),
prior AS MATERIALIZED (SELECT d.*,p.feature FROM "SiteDocument" d JOIN payload p USING(slug,locale) WHERE d.kind='page' AND d.template=d.slug FOR UPDATE OF d),
updated AS (UPDATE "SiteDocument" d SET
 draft=jsonb_set(d.draft,'{additions}',COALESCE(d.draft->'additions','{}'::jsonb)||jsonb_build_object('serverFeatures',p.feature)),
 published=CASE WHEN d.published IS NULL THEN NULL ELSE jsonb_set(d.published,'{content,additions}',COALESCE(d.published#>'{content,additions}','{}'::jsonb)||jsonb_build_object('serverFeatures',p.feature)) END,
 version=d.version+1,"updatedAt"=CURRENT_TIMESTAMP
 FROM prior p WHERE d.id=p.id AND d.version=1
 RETURNING d.*,jsonb_build_object('title',p.title,'draft',p.draft,'published',p.published,'version',p.version) AS previous),
created AS (INSERT INTO "SiteDocument"(id,slug,locale,kind,title,template,draft,published,version,"createdAt","updatedAt")
 SELECT 'owner23_'||md5(p.slug||p.locale),p.slug,p.locale,'page',p.initial->>'title',p.slug,p.initial->'content',p.initial,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM payload p WHERE p.initial IS NOT NULL
 RETURNING *,NULL::jsonb AS previous),
changes AS MATERIALIZED (SELECT * FROM updated UNION ALL SELECT * FROM created),
backup_revisions AS (INSERT INTO "SiteDocumentRevision"(id,"documentId",version,snapshot,"actorId") SELECT 'owner23_before_'||md5(p.id||p.version::text),p.id,p.version,jsonb_build_object('title',p.title,'draft',p.draft),'SYSTEM:owner-mobile-release-20261023' FROM prior p ON CONFLICT("documentId",version) DO NOTHING RETURNING id),
new_revisions AS (INSERT INTO "SiteDocumentRevision"(id,"documentId",version,snapshot,"actorId") SELECT 'owner23_after_'||md5(c.id||c.version::text),c.id,c.version,jsonb_build_object('title',c.title,'draft',c.draft),'SYSTEM:owner-mobile-release-20261023' FROM changes c RETURNING id),
audit AS (INSERT INTO "AuditLog"(id,"actorId","actorKind","actorLabel","entityType",action,"entityId",before,after)
 SELECT 'owner23_audit_'||md5(c.id||c.version::text),NULL,'SYSTEM','Owner-directed hosting feature CMS sync, 2026-10-23','SiteDocument','page.owner_mobile_release_synced',c.id,c.previous,jsonb_build_object('title',c.title,'draft',c.draft,'published',c.published,'version',c.version) FROM changes c RETURNING id)
SELECT slug,locale,version,jsonb_array_length(draft#>'{additions,serverFeatures,slides}') AS slides,draft#>'{additions,serverFeatures}'=published#>'{content,additions,serverFeatures}' AS public_matches_draft FROM changes ORDER BY slug,locale;`;
const verify=`SELECT 1 / CASE WHEN COUNT(*)=8 AND MIN(jsonb_array_length(draft#>'{additions,serverFeatures,slides}'))=6 AND BOOL_AND(draft#>'{additions,serverFeatures}'=published#>'{content,additions,serverFeatures}') THEN 1 ELSE 0 END AS synchronized FROM "SiteDocument" WHERE kind='page' AND slug IN (${names});`;
await fs.mkdir('.local/mobile-release',{recursive:true});
await fs.writeFile('.local/mobile-release/cms-sync-plan.json',JSON.stringify({statements:[guard,sql,verify]},null,2));
console.log('Prepared an eight-document CMS transaction with version guards, preserved fields, revisions and audit backups. No database writes performed.');
