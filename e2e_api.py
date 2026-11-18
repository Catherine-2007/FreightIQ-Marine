import urllib.request, urllib.parse, http.cookiejar, json, re, sys, glob, os
B='http://127.0.0.1:8080/FreightIQ-Marine/'
def session(email,pw='Admin@123'):
    cj=http.cookiejar.CookieJar(); op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    html=op.open(B+'frontend/login.php').read().decode()
    m=re.search(r"setCsrf\((\"[^\"]+\")",html) or re.search(r"csrf[^'\"]*['\"]([a-f0-9]{20,})",html)
    tok=json.loads(m.group(1)) if m and m.group(1).startswith('"') else (m.group(1) if m else '')
    req=urllib.request.Request(B+'backend/api/auth_login.php',json.dumps({'email':email,'password':pw,'csrf_token':tok}).encode(),{'Content-Type':'application/json'})
    try: r=json.loads(op.open(req).read())
    except urllib.error.HTTPError as e: return op,None,e.read().decode()[:200]
    return op,r.get('csrf_token',tok),r
def get(op,path):
    try:
        r=op.open(B+path); return r.status,r.read().decode('utf8','replace')
    except urllib.error.HTTPError as e: return e.code,e.read().decode('utf8','replace')
if __name__=='__main__':
    op,tok,r=session('admin@sail.co.in'); print('login',bool(tok), r if not tok else r.get('success'))
    bad=0
    pages=['frontend/index.php']+['frontend/pages/'+os.path.basename(p) for p in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','frontend','pages','*.php')))]
    for p in pages:
        c,h=get(op,p); issue=re.search(r'(Fatal error|Warning:|Notice:|Parse error|Deprecated:)',h)
        print('PAGE',c,p,'ISSUE '+issue.group(1) if issue else 'ok'); bad+= (c!=200 or bool(issue))
    eps=['dashboard.php','vessels.php?per_page=50','ports.php','ports.php?id=1','gps.php','alerts.php','risk.php','contracts.php','forecast.php','reference_data.php','notifications.php','audit.php','users.php','cargo.php']
    for e in eps:
        c,h=get(op,'backend/api/'+e)
        try: j=json.loads(h); ok=True
        except: ok=False
        print('API ',c,e.ljust(26),'json' if ok else 'NOT-JSON '+h[:120], (list(j.keys())[:6] if isinstance(j,dict) else 'list[%d]'%len(j)) if ok else '')
        bad+=(c!=200 or not ok)
    print('BAD',bad)
