"""Scan current text sources, local env files, build output, and reachable Git blobs.
Never print credential values. This is pattern detection, not a proof of absence.
"""
from pathlib import Path
import re, subprocess, json, hashlib, base64
rules = [
 ('google_api_key', r'AIza[0-9A-Za-z_-]{35}'),
 ('discord_webhook', r'https://(?:discord(?:app)?\.com)/api/webhooks/\d+/[\w.-]+'),
 ('github_token', r'(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})'),
 ('supabase_secret', r'sb_secret_[A-Za-z0-9_-]{20,}'),
 ('private_key', r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
 ('legacy_admin_credential', r'const ADMIN_PASSKEY\s*=[^;]+|VITE_ADMIN_PASSKEY\s*=[^\r\n]+'),
 ('aws_access_key', r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b'),
]
patterns = [(name,re.compile(pattern)) for name,pattern in rules]
findings=[]; public=set(); skipped=[]
def scan(text,location,scope):
 for kind,pattern in patterns:
  for match in pattern.finditer(text):
   if kind == 'supabase_secret' and 'test_only' in match.group(): continue
   findings.append({'kind':kind,'scope':scope,'location':location,'fingerprint':hashlib.sha256(match.group().encode()).hexdigest()[:12]})
 for match in re.finditer(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',text):
  try:
   payload=match.group().split('.')[1]; role=json.loads(base64.urlsafe_b64decode(payload+'='*(-len(payload)%4))).get('role')
   if role=='anon': public.add(location)
   elif role=='service_role': findings.append({'kind':'supabase_service_role','scope':scope,'location':location,'fingerprint':hashlib.sha256(match.group().encode()).hexdigest()[:12]})
  except Exception: pass
extensions={'.ts','.tsx','.js','.jsx','.mjs','.json','.md','.yml','.yaml','.txt','.env','.pem','.key','.html','.css','.sql','.toml','.ini','.xml'}
current=[]
for directory in ['src','api','server','config','dist']:
 if Path(directory).exists(): current.extend(p for p in Path(directory).rglob('*') if p.is_file() and p.suffix in extensions)
current.extend(p for p in Path('.').glob('.env*') if p.is_file())
current.extend(Path(name) for name in ['index.html','vite.config.ts','vercel.json','package.json','package-lock.json'])
for path in current:
 if path.stat().st_size > 2_000_000: skipped.append(str(path));continue
 scan(path.read_text(errors='replace'),str(path),'local-env' if path.name.startswith('.env') else 'current')
seen=set(); blobs=0
for line in subprocess.check_output(['git','rev-list','--objects','--all'],text=True).splitlines():
 parts=line.split(' ',1)
 if len(parts)!=2: continue
 oid,name=parts
 if Path(name).suffix not in extensions and not Path(name).name.startswith('.env'): continue
 size=subprocess.run(['git','cat-file','-s',oid],capture_output=True,text=True)
 if size.returncode or int(size.stdout)>2_000_000: skipped.append(name+'@'+oid[:12]);continue
 if oid in seen: continue
 seen.add(oid); data=subprocess.check_output(['git','cat-file','-p',oid])
 if b'\0' in data: continue
 scan(data.decode('utf-8',errors='replace'),name+'@'+oid[:12],'history');blobs+=1
report={'scanned_unique_history_blobs':blobs,'current_text_files':len(current),'findings':findings,'public_anon_key_locations':sorted(public),'skipped_large_files':skipped,'limits':'Pattern-based scan of reachable text blobs up to 2 MB, not binary/exif, unreachable objects, provider logs or other repositories. Values intentionally omitted. Public Supabase publishable/anon keys are not secrets; permissions depend on grants/RLS.'}
Path('docs/security').mkdir(parents=True,exist_ok=True)
Path('docs/security/secret-scan.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'history_text_blobs':blobs,'current_text_files':len(current),'finding_counts':{scope:{kind:sum(f['kind']==kind and f['scope']==scope for f in findings) for kind in sorted({f['kind'] for f in findings if f['scope']==scope})} for scope in sorted({f['scope'] for f in findings})},'skipped_large_files':len(skipped)},indent=2))
