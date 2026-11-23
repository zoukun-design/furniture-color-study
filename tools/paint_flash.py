# Screenshot with Chrome's paint-flashing on: green = what got repainted. Shows whether a frame redraws the whole room.
#   python3 tools/paint_flash.py '?at=10:30'   ->  /tmp/paint_flash.png
import asyncio,sys
from playwright.async_api import async_playwright
from common import url
async def main():
    q=sys.argv[1] if len(sys.argv)>1 else '?at=10:30'
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);pg=await ctx.new_page()
        cdp=await ctx.new_cdp_session(pg);await pg.goto(url()+q);await pg.wait_for_timeout(3500)
        await cdp.send('DOM.enable');await cdp.send('Overlay.enable');await cdp.send('Overlay.setShowPaintRects',{'result':True})
        await pg.wait_for_timeout(300);await pg.screenshot(path='/tmp/paint_flash.png');print('/tmp/paint_flash.png');await b.close()
asyncio.run(main())
