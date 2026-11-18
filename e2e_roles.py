import sys; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from e2e_api import *
import subprocess
rows=subprocess.run(['mysql','-uroot','freightiq_marine','-N','-e','SELECT u.email, r.role_key FROM users u JOIN roles r ON r.id=u.role_id'],capture_output=True,text=True).stdout.split('\n')
for r in rows:
    if not r.strip(): continue
    email,role=r.split('\t')
    op,tok,res=session(email)
    if not tok: print(role.ljust(20),'LOGIN FAIL',res); continue
    out=[]
    for p in ['frontend/pages/laytime.php','frontend/pages/ports.php','frontend/pages/fleet.php','frontend/pages/shipper.php','frontend/pages/admin_users.php']:
        c,h=get(op,p); out.append(p.split('/')[-1][:-4]+':'+('OK' if c==200 and 'Fatal' not in h else str(c)))
    c,h=get(op,'frontend/index.php'); navy='laytime.php' in h
    print(role.ljust(20),' '.join(out),'| nav-has-laytime:',navy)
