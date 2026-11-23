# Runs every scene for 90 s of animation, frame by frame, on a phone and a PC viewport. Must print "errors: []".
import asyncio
from playwright.async_api import async_playwright
from common import url
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();errs=[]
        for vp in [(390,844),(1440,900)]:
            for sc in ['read','work','gaze','drawings','research','dance']:
                pg=await (await b.new_context(viewport={'width':vp[0],'height':vp[1]})).new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
                await pg.add_init_script("window.__senManual=true;")
                await pg.goto(url()+'?scene='+sc);await pg.wait_for_timeout(1500)
                await pg.evaluate("(function(){for(var i=0;i<60*90;i++)__sen.run(1/60);})()")
        print('errors:',errs[:5]);await b.close()
asyncio.run(main())
