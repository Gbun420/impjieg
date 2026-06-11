import urllib.request
import re

url = "https://impjieg-eb002dw3d-gbun420s-projects.vercel.app"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    
    js_files = re.findall(r'src="(/_next/static/chunks/[^"]+\.js)"', html)
    print(f"Found {len(js_files)} JS files")
    
    for js in js_files:
        js_url = url + js
        js_content = urllib.request.urlopen(urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8')
        
        supabase_urls = re.findall(r'https://[^"]+\.supabase\.co', js_content)
        if supabase_urls:
            print("FOUND URL:", supabase_urls[0])
            
        keys = re.findall(r'eyJ[^"]{50,}', js_content)
        for k in keys:
            if "supabase" in k.lower() or len(k) > 100:
                print("FOUND KEY:", k[:30] + "...")
                print("FULL KEY:", k)
except Exception as e:
    print("Error:", e)
