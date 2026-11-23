# Screenshots at phone / iPad / PC sizes (Preview, and Photos with "photos").
#   python3 tools/shots.py [names,comma,separated] [photos]   ->  /tmp/shot_<name>.png
import asyncio,sys
from playwright.async_api import async_playwright
from common import url
SIZES={'phone':(390,844,True),'ipadP':(820,1180,True),'ipadL':(1180,820,True),'pc':(1440,900,False),'pcS':(1280,650,False),'fhd':(1920,1000,False),'phoneL':(844,390,True)}
async def main():
    names=sys.argv[1].split(',') if len(sys.argv)>1 else list(SIZES)
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for n in names:
            w,h,t=SIZES[n];ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=t,is_mobile=t);pg=await ctx.new_page()
            await pg.goto(url()+'?at=10:30');await pg.wait_for_timeout(4200);await pg.screenshot(path='/tmp/shot_%s.png'%n)
            if 'photos' in sys.argv:
                await pg.evaluate('vGo(1,false)');await pg.wait_for_timeout(600);await pg.screenshot(path='/tmp/shot_%s_photos.png'%n)
            await ctx.close();print('/tmp/shot_%s.png'%n)
        await b.close()
asyncio.run(main())
