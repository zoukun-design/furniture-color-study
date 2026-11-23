# Pixel comparison of the room between a git revision and the working copy, with seeded randomness and frame-exact runs.
#   python3 tools/visual_compare.py [rev=HEAD]
# Use it for changes meant to be invisible (performance work): every line should say ">8: 0".
import asyncio,sys,subprocess,numpy as np
from PIL import Image
from playwright.async_api import async_playwright
from common import ROOT,url
SEED="(function(){var s=12345;Math.random=function(){s=(s*16807)%2147483647;return (s-1)/2147483646;};window.__senManual=true;})()"
CASES=[('?at=10:30',300),('?at=10:30&scene=work',900),('?at=09:00',600),('?at=11:45&scene=read',700),('?at=08:00&scene=gaze',500),('?at=14:00',600),('?at=22:00',600)]
async def shot(b,u,q,n,path):
    ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2);pg=await ctx.new_page()
    await ctx.add_init_script(SEED);await pg.goto(u+q);await pg.wait_for_timeout(3000)
    await pg.evaluate("(function(n){for(var i=0;i<n;i++)__sen.run(1/60);})(%d)"%n);await pg.wait_for_timeout(400)
    await pg.locator('#stage').screenshot(path=path);await ctx.close()
async def main():
    rev=sys.argv[1] if len(sys.argv)>1 else 'HEAD'
    open('/tmp/vc_ref.html','w').write(subprocess.check_output(['git','show',rev+':index.html'],cwd=ROOT).decode())
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for q,n in CASES:
            await shot(b,'file:///tmp/vc_ref.html',q,n,'/tmp/vc_a.png');await shot(b,url(),q,n,'/tmp/vc_b.png')
            a=np.asarray(Image.open('/tmp/vc_a.png').convert('RGB')).astype(int);c=np.asarray(Image.open('/tmp/vc_b.png').convert('RGB')).astype(int)
            if a.shape!=c.shape:print(q,'size differs',a.shape,c.shape);continue
            d=np.abs(a-c).sum(2);d[:80,:]=0   # the top strip holds the animated LIVE ring
            print(q,'>8:',int((d>8).sum()),'max',int(d.max()))
        await b.close()
asyncio.run(main())
