import fs from 'node:fs/promises';
import {resolvePageAdditions} from '../src/schemas/page-additions';
import {templateContent,templatePageDraft} from '../src/server/site-documents';

// Produces reviewed content SQL only. No connection, credentials, or database writes.
const quote=(s:string)=>"'"+s.replaceAll("'","''")+"'";
const versions:Record<string,number>={'brand-design':2,ecommerce:1,'website-design':1};
const rows=[];
for(const slug of Object.keys(versions))for(const locale of ['en','ar']){
  const additions=resolvePageAdditions(slug,undefined,locale);
  const patch={galleryCaptions:additions.galleryCaptions,...(additions.faq?{faq:additions.faq}:{})};
  let initial=null;
  if(locale==='en'){
    const template=await templateContent(slug),base=templatePageDraft(slug,template);
    initial={title:base.title,content:{...base.content,additions}};
  }
  rows.push(`(${quote(slug)},${quote(locale)},${quote(JSON.stringify(patch))}::jsonb,${initial?quote(JSON.stringify(initial))+'::jsonb':'NULL::jsonb'},${locale==='ar'?versions[slug]:'NULL::integer'})`);
}
const payload=`payload(slug,locale,patch,initial,expected_version) AS (VALUES ${rows.join(',\n')})`;
const guard=`SELECT 1 / CASE WHEN (SELECT COUNT(*) FROM "SiteDocument" WHERE locale='ar' AND kind='page' AND ((slug='brand-design' AND version=2) OR (slug IN ('website-design','ecommerce') AND version=1)))=3 AND (SELECT COUNT(*) FROM "SiteDocument" WHERE locale='en' AND slug IN ('brand-design','website-design','ecommerce'))=0 THEN 1 ELSE 0 END AS expected_content_versions;`;
const sql=`WITH ${payload},
prior AS MATERIALIZED (SELECT d.*,p.patch,p.expected_version FROM "SiteDocument" d JOIN payload p USING(slug,locale) WHERE d.kind='page' AND d.template=d.slug FOR UPDATE OF d),
updated AS (UPDATE "SiteDocument" d SET
 draft=jsonb_set(d.draft,'{additions}',p.patch||COALESCE(d.draft->'additions','{}'::jsonb)),
 published=CASE WHEN d.published IS NULL THEN NULL ELSE jsonb_set(d.published,'{content,additions}',p.patch||COALESCE(d.published#>'{content,additions}','{}'::jsonb)) END,
 version=d.version+1,"updatedAt"=CURRENT_TIMESTAMP
 FROM prior p WHERE d.id=p.id AND d.version=p.expected_version
 RETURNING d.*,jsonb_build_object('title',p.title,'draft',p.draft,'published',p.published,'version',p.version) AS previous),
created AS (INSERT INTO "SiteDocument"(id,slug,locale,kind,title,template,draft,published,version,"createdAt","updatedAt")
 SELECT 'review22_'||md5(p.slug||p.locale),p.slug,p.locale,'page',p.initial->>'title',p.slug,p.initial->'content',p.initial,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM payload p WHERE p.initial IS NOT NULL
 RETURNING *,NULL::jsonb AS previous),
changes AS MATERIALIZED (SELECT * FROM updated UNION ALL SELECT * FROM created),
backup_revisions AS (INSERT INTO "SiteDocumentRevision"(id,"documentId",version,snapshot,"actorId")
 SELECT 'review22_before_'||md5(p.id||p.version::text),p.id,p.version,jsonb_build_object('title',p.title,'draft',p.draft),'SYSTEM:owner-directed-review-20261022' FROM prior p
 ON CONFLICT("documentId",version) DO NOTHING RETURNING id),
new_revisions AS (INSERT INTO "SiteDocumentRevision"(id,"documentId",version,snapshot,"actorId")
 SELECT 'review22_after_'||md5(c.id||c.version::text),c.id,c.version,jsonb_build_object('title',c.title,'draft',c.draft),'SYSTEM:owner-directed-review-20261022' FROM changes c RETURNING id),
audit AS (INSERT INTO "AuditLog"(id,"actorId","actorKind","actorLabel","entityType",action,"entityId",before,after)
 SELECT 'review22_audit_'||md5(c.id||c.version::text),NULL,'SYSTEM','Owner-directed bilingual content sync, 2026-10-22','SiteDocument','page.owner_review_synced',c.id,c.previous,jsonb_build_object('title',c.title,'draft',c.draft,'published',c.published,'version',c.version) FROM changes c RETURNING id)
SELECT slug,locale,version,jsonb_array_length(draft->'additions'->'galleryCaptions') AS captions,COALESCE(jsonb_array_length(draft->'additions'->'faq'->'items'),0) AS faq,published IS NOT NULL AS live FROM changes ORDER BY slug,locale;`;
const verify=`SELECT slug,locale,version,jsonb_array_length(draft->'additions'->'galleryCaptions') AS captions,COALESCE(jsonb_array_length(draft->'additions'->'faq'->'items'),0) AS faq,md5((draft-'additions'-'templateHash')::text) AS field_hash FROM "SiteDocument" WHERE slug IN ('brand-design','website-design','ecommerce') ORDER BY slug,locale;`;
await fs.mkdir('.local/live-corrections',{recursive:true});
await fs.writeFile('.local/live-corrections/cms-sync-20261022.json',JSON.stringify({statements:[guard,sql,verify]},null,2));
console.log(JSON.stringify({statements:[guard,sql,verify]}));
