import os
import subprocess

with open('.env.production.local', 'r') as f:
    lines = f.readlines()

for line in lines:
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    if '=' not in line:
        continue
    
    key, value = line.split('=', 1)
    if key == "NEXT_PUBLIC_URL":
        value = "https://impjieg-permitfit.vercel.app"
    
    if value.startswith('"') and value.endswith('"'):
        value = value[1:-1]
    elif value.startswith("'") and value.endswith("'"):
        value = value[1:-1]
        
    print(f"Adding {key}...")
    try:
        proc = subprocess.run(
            ['npx', 'vercel', 'env', 'add', key, 'production'],
            input=value,
            text=True,
            capture_output=True,
            check=True
        )
        print(f"Success: {key}")
    except subprocess.CalledProcessError as e:
        print(f"Failed: {key} - {e.stderr}")
