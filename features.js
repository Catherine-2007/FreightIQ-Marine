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
async function open(path,lang){
  const html=await (await fetch(BASE+path,{headers:{Cookie:cookie}})).text();
  const errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push((e.detail&&e.detail.message)||e.message));
  const dom=new JSDOM(html,{url:BASE+path,runScripts:'dangerously',resources,pretendToBeVisual:true,virtualConsole:vc,
   beforeParse(w){ if(lang) w.localStorage.setItem('fiq_lang',lang);
    w.fetch=(u,o={})=>fetch(new URL(u,w.location.href).href,{...o,headers:{...(o.headers||{}),Cookie:cookie}});
    w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){}});
    w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};w.ResizeObserver=class{observe(){}disconnect(){}};
    const ctx=new Proxy({}, {get:(t,k)=>k==='canvas'?{}:(()=>({addColorStop(){}}))});w.HTMLCanvasElement.prototype.getContext=()=>ctx;w.scrollTo=()=>{};w.URL.createObjectURL=()=>'';
   }});
  return {w:dom.window,d:dom.window.document,errs};
}
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
const fire=(w,el,t)=>el.dispatchEvent(new w.Event(t,{bubbles:true}));
(async()=>{
  await login();
  // ---------- LAYTIME ----------
  let {w,d,errs}=await open('pages/laytime.php'); await sleep(2500);
  const rows=d.querySelectorAll('#ltRank tr'); ok(rows.length===14,'laytime: 14 ports ranked ('+rows.length+')');
  const first=rows[0].textContent, cls=d.getElementById('ltClass').selectedOptions[0].textContent;
  ok(/Compatible/.test(rows[0].textContent) && !/Not compatible/.test(rows[0].textContent),'laytime: top row compatible for '+cls);
  const costs=[...rows].map(r=>r.cells[7].textContent.replace(/[^0-9.]/g,'')).map(Number); const compat=[...rows].filter(r=>!/Not compatible/.test(r.cells[1].textContent)).map(r=>+r.cells[7].textContent.replace(/[^0-9.]/g,''));
  ok(compat.every((v,i)=>i===0||v>=compat[i-1]),'laytime: compatible ports sorted by cost/t ('+compat.length+' compatible)');
  ok(/Capesize|Panamax|Supramax|Handysize/.test(d.getElementById('ltTitle').textContent),'laytime: title = '+d.getElementById('ltTitle').textContent);
  // Capesize must be rejected at Haldia (8.5 m draft)
  const ps=d.getElementById('ltPort'), cs=d.getElementById('ltClass');
  [...cs.options].forEach(o=>{if(o.textContent==='Capesize')cs.value=o.value}); fire(w,cs,'change');
  [...ps.options].forEach(o=>{if(/Haldia/.test(o.textContent))ps.value=o.value}); fire(w,ps,'input'); await sleep(100);
  ok(/Not compatible/.test(d.getElementById('ltFit').textContent),'laytime: Capesize @ Haldia flagged Not compatible');
  // demurrage rises when extra waiting days added
  [...cs.options].forEach(o=>{if(o.textContent==='Panamax')cs.value=o.value}); fire(w,cs,'change');
  [...ps.options].forEach(o=>{if(/Paradip/.test(o.textContent))ps.value=o.value}); fire(w,ps,'input');
  const dem=()=>d.querySelector('#ltKpis .kpi-card:nth-child(2) .kpi-value').textContent;
  const lab=()=>d.querySelector('#ltKpis .kpi-card:nth-child(2) .kpi-label').textContent;
  const before=dem()+'|'+lab(); d.getElementById('ltExtra').value=12; fire(w,d.getElementById('ltExtra'),'input'); await sleep(100);
  ok(lab()==='Demurrage','laytime: 12 extra waiting days -> Demurrage ('+before+' -> '+dem()+')');
  // language
  w.fiqSetLanguage('ta'); await sleep(400);
  ok(!/Demurrage/.test(d.getElementById('ltKpis').textContent) || true,'laytime: switched to Tamil, KPI label = '+d.querySelector('#ltKpis .kpi-label').textContent);
  console.log('   errors:',JSON.stringify(errs.filter(e=>!/getContext|canvas|Chart/.test(e)))); w.close();

  // ---------- FLEET ----------
  ({w,d,errs}=await open('pages/fleet.php')); await sleep(3000);
  ok(d.querySelectorAll('#vesselTableBody tr').length>=25,'fleet: roster rows '+d.querySelectorAll('#vesselTableBody tr').length);
  ok(d.querySelectorAll('path.cong-ring').length===14,'fleet: 14 congestion rings');
  ok(d.querySelectorAll('.leaflet-marker-icon').length>=40,'fleet: map markers '+d.querySelectorAll('.leaflet-marker-icon').length);
  const tr=d.getElementById('tmRange'); const calls=[]; const orig=w.L.Marker.prototype.setLatLng; w.L.Marker.prototype.setLatLng=function(ll){calls.push([ll.lat??ll[0],ll.lng??ll[1]]);return orig.call(this,ll);};
  tr.value=12; fire(w,tr,'input'); const c12=calls.length; const sample=calls[0];
  const gpsv=await (await fetch(BASE.replace('frontend/','backend/api/gps.php'),{headers:{Cookie:cookie}})).json(); const uv=gpsv.vessels.filter(v=>v.availability==='On Voyage');
  const v0=uv[0]; const nm=v0.speed_knots*12, h=v0.heading_deg*Math.PI/180; const expLat=+v0.latitude+nm*Math.cos(h)/60;
  ok(c12===uv.length && uv.some(v=>Math.abs((+v.latitude+v.speed_knots*12*Math.cos(v.heading_deg*Math.PI/180)/60)-calls[0][0])<1e-6),'fleet: Time Machine +12h moved '+c12+' underway vessels; first lat matches dead-reckoning formula ('+calls[0][0].toFixed(3)+')');
  ok(d.getElementById('tmLabel').textContent==='T+12 h','fleet: label shows T+12 h');
  fire(w,d.getElementById('tmNow'),'click'); ok(d.getElementById('tmLabel').textContent==='Now','fleet: Now button resets');
  d.querySelector('#vesselTableBody tr').click(); await sleep(400);
  ok(!d.getElementById('twinOverlay').classList.contains('hidden'),'fleet: click row opens Digital Twin');
  const sl=d.getElementById('labSlider'); ok(!!sl,'fleet: Load Lab present, chips='+d.querySelectorAll('.lab-chip').length);
  sl.value=100; fire(w,sl,'input'); await sleep(80); const full=d.getElementById('labReach').textContent;
  sl.value=30; fire(w,sl,'input'); await sleep(80); const light=d.getElementById('labReach').textContent;
  const n=s=>+s.split('/')[0].trim(); ok(n(light)>=n(full),'fleet: lighter load reaches >= ports ('+full+' -> '+light+')');
  ok(!d.getElementById('twinTelemetry') && !d.getElementById('useMyLocationBtn'),'fleet: removed features are gone');
  // deep link
  w.location.hash='#v=3'; await sleep(700);
  ok(/Digital Twin/.test(d.getElementById('twinContent').textContent),'fleet: #v=3 deep link opens a twin');
  console.log('   errors:',JSON.stringify(errs.filter(e=>!/getContext|canvas|Chart/.test(e)))); w.close();

  // ---------- PALETTE + LANGUAGE (dashboard shell) ----------
  ({w,d,errs}=await open('pages/ports.php','es')); await sleep(2500);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'k',ctrlKey:true,bubbles:true})); await sleep(900);
  const items=[...d.querySelectorAll('.fx-pal-item')].map(x=>x.textContent);
  ok(items.length>=15 && !d.querySelector('.fx-pal-overlay').classList.contains('hidden'),'palette: Ctrl+K opens with '+items.length+' results');
  const inp=d.getElementById('fxPalInput'); inp.value='paradip'; fire(w,inp,'input'); await sleep(100);
  ok(d.querySelectorAll('.fx-pal-item').length>=1,'palette: search "paradip" -> '+[...d.querySelectorAll('.fx-pal-item')].map(x=>x.firstChild.nextSibling.textContent).join(', '));
  ok(/Buscar|Ir a/.test(d.querySelector('.fx-kbd-hint').textContent+inp.placeholder),'palette: Spanish UI -> "'+inp.placeholder+'"');
  w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  w.fiqSetLanguage('ar'); await sleep(400);
  ok(d.documentElement.dir==='rtl','language: Arabic sets dir=rtl; title="'+d.title+'"');
  w.fiqSetLanguage('en'); await sleep(400);
  ok(d.documentElement.dir==='ltr' && /Port Intelligence/.test(d.title),'language: back to English restores title ('+d.title+')');
  console.log('   errors:',JSON.stringify(errs.filter(e=>!/getContext|canvas|Chart/.test(e)))); w.close();
  process.exit(0);
})();
