const {JSDOM,requestInterceptor,VirtualConsole}=require('jsdom');const fs=require('fs');
const BASE='http://127.0.0.1:8080/FreightIQ-Marine/frontend/';
const LANG=process.argv[2]||'hi', ONLY=process.argv[3];
const leafletJs=fs.readFileSync('./node_modules/leaflet/dist/leaflet-src.js','utf8');
let cookie='';
const grab=r=>{(r.headers.getSetCookie?.()||[]).forEach(c=>{const kv=c.split(';')[0];const n=kv.split('=')[0];cookie=cookie.split('; ').filter(x=>x&&!x.startsWith(n+'=')).concat(kv).join('; ');});};
async function login(){
  let r=await fetch(BASE+'login.php');grab(r);const h=await r.text();
  const m=h.match(/setCsrf\((".*?")/)||h.match(/csrf[^'"]*['"]([a-f0-9]{20,})/);const tok=m[1].startsWith('"')?JSON.parse(m[1]):m[1];
  r=await fetch(BASE.replace('frontend/','backend/api/auth_login.php'),{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({email:'admin@sail.co.in',password:'Admin@123',csrf_token:tok})});grab(r);return r.status;
}
const resources={interceptors:[requestInterceptor((req)=>{const u=req.url; if(/leaflet.*\.js/.test(u)) return new Response(leafletJs,{headers:{'content-type':'application/javascript'}}); if(!/^https?:\/\/127\.0\.0\.1/.test(u)) return new Response('',{headers:{'content-type':/css/.test(u)?'text/css':'application/javascript'}});})]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function visit(path){
  const html=await (await fetch(BASE+path,{headers:{Cookie:cookie}})).text();
  const errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push((e.detail&&e.detail.message)||e.message));vc.on('error',e=>errs.push(String(e)));
  const dom=new JSDOM(html,{url:BASE+path,runScripts:'dangerously',resources,pretendToBeVisual:true,virtualConsole:vc,
   beforeParse(w){
    w.localStorage.setItem('fiq_lang',LANG);
    w.fetch=(u,o={})=>fetch(new URL(u,w.location.href).href,{...o,headers:{...(o.headers||{}),Cookie:cookie}});
    w.matchMedia=w.matchMedia||(()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){}}));
    w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};w.ResizeObserver=class{observe(){}disconnect(){}};
    const ctx=new Proxy({}, {get:(t,k)=>k==='canvas'?{}:(()=>({addColorStop(){}}))});
    w.HTMLCanvasElement.prototype.getContext=()=>ctx; w.scrollTo=()=>{}; w.URL.createObjectURL=()=>'';
   }});
  await sleep(2800);
  const w=dom.window,d=w.document;
  const tw=d.createTreeWalker(d.body,4);const left=new Set();let n;
  while((n=tw.nextNode())){const p=n.parentElement;if(!p||p.closest('script,style,code,pre,noscript,[data-no-i18n],.leaflet-container'))continue;
    const t=n.nodeValue.replace(/\s+/g,' ').trim(); if(t.length<3||!/[A-Za-z]{3,}/.test(t))continue; left.add(t);}
  [...d.querySelectorAll('[placeholder],[title]')].forEach(e=>{['placeholder','title'].forEach(a=>{const v=e.getAttribute(a);if(v&&/[A-Za-z]{3,}/.test(v))left.add('['+a+'] '+v);});});
  const res={path,lang:d.documentElement.lang||'',dir:d.documentElement.dir,title:d.title,errs:[...new Set(errs)].filter(e=>!/getContext|canvas|Not implemented|Could not load/i.test(e)),left:[...left]};
  w.close();return res;
}
(async()=>{
  console.log('login',await login());
  const pages=['index.php','pages/fleet.php','pages/vessels.php','pages/ports.php','pages/laytime.php','pages/forecast.php','pages/risk.php','pages/alerts.php','pages/contracts.php','pages/shipper.php','pages/reports.php','pages/admin_users.php','pages/audit.php'].filter(p=>!ONLY||p.includes(ONLY));
  const out=[];for(const p of pages){try{out.push(await visit(p));}catch(e){out.push({path:p,errs:['VISIT FAIL '+e.message],left:[]});}}
  fs.writeFileSync('./pages_'+LANG+'.json',JSON.stringify(out,null,1));
  out.forEach(r=>console.log(r.path.padEnd(24),'title=',JSON.stringify(r.title),'errs=',r.errs.length,'English-left=',r.left.length));
  process.exit(0);
})();
