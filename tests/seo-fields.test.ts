import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seoTextSchema} from '../src/schemas/seo-text';
import {pageMetadata} from '../src/content/structured-data';
import {publicRobots} from '../src/content/seo';

const base={title:'Search engine optimization',description:'A concise service description.'};
test('SEO fields allow bounded editorial, canonical, robots, social, and registered image values',()=>{
 const parsed=seoTextSchema.parse({...base,focusPhrase:'technical SEO services',canonicalPath:'/services/',index:true,follow:true,socialTitle:'SEO for growing teams',socialDescription:'A social summary.',socialImage:{mediaId:'office',alt:'Design team',decorative:false}});
 assert.equal(parsed.canonicalPath,'/services/');
 assert.equal(parsed.socialImage?.mediaId,'office');
});

test('SEO contract rejects unsafe canonical paths, missing descriptions, and excessive text',()=>{
 assert.equal(seoTextSchema.safeParse({...base,canonicalPath:'//attacker.example/path'}).success,false);
 assert.equal(seoTextSchema.safeParse({...base,canonicalPath:'/services/?next=/login'}).success,false);
 assert.equal(seoTextSchema.safeParse({...base,focusPhrase:'x'.repeat(121)}).success,false);
 assert.equal(seoTextSchema.safeParse({...base,description:''}).success,false);
 assert.equal(seoTextSchema.safeParse({...base,socialImage:{mediaId:'../../secret',alt:'',decorative:true}}).success,false);
});

test('published metadata uses safe canonical, social fields, and deliberate robots flags',()=>{
 const metadata=pageMetadata('/about/','About | CODEYEA','A useful description.',{canonicalPath:'/about/',socialTitle:'Meet CODEYEA',socialDescription:'Our story.',socialImage:{mediaId:'office',alt:'Team at work',decorative:false}});
 assert.equal(metadata.alternates?.canonical,'https://codeyea.com/about/');
 assert.equal(metadata.openGraph?.title,'Meet CODEYEA');
 assert.deepEqual(metadata.openGraph?.images,[{url:'https://codeyea.com/homepage/office.webp',alt:'Team at work'}]);
 const previous=process.env.SITE_INDEXING_ENABLED;
 process.env.SITE_INDEXING_ENABLED='true';
 assert.deepEqual(publicRobots(true,{index:false,follow:true}),{index:false,follow:true});
 assert.deepEqual(publicRobots(false,{index:true,follow:true}),{index:false,follow:false});
 if(previous===undefined)delete process.env.SITE_INDEXING_ENABLED;else process.env.SITE_INDEXING_ENABLED=previous;
});
