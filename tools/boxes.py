# Phone layout regression: records the boxes of the main UI parts at phone sizes.
#   python3 tools/boxes.py save    (before a change)   ->  /tmp/boxes_base.json
#   python3 tools/boxes.py check   (after)             ->  lists every box that moved
# The phone portrait layout must not move unless the change is meant for it.
import asyncio,sys,json
from playwright.async_api import async_playwright
from common import url
SEL=['.app','header','.tbl','dl','.seg','.vpager','#stage','#stage>svg','.envb','#stShare','#shuffle','#panel','#rowA','#rowB','#aSw .sw','.ptabs','.gview','.ph']
SIZES={'se':(375,667),'i14':(390,844),'pm':(430,932),'small':(320,568)}
async def main():
    mode=sys.argv[1] if len(sys.argv)>1 else 'check';res={}
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for name,vp in SIZES.items():
            ctx=await b.new_context(viewport={'width':vp[0],'height':vp[1]},has_touch=True,is_mobile=True);pg=await ctx.new_page()
            await pg.goto(url()+'?at=10:30');await pg.wait_for_timeout(3500)
            res[name]={s:await pg.evaluate("s=>{var e=document.querySelector(s);if(!e)return null;var b=e.getBoundingClientRect();return [Math.round(b.x*10)/10,Math.round(b.y*10)/10,Math.round(b.width*10)/10,Math.round(b.height*10)/10]}",s) for s in SEL}
            await ctx.close()
        await b.close()
    if mode=='save':json.dump(res,open('/tmp/boxes_base.json','w'));print('saved')
    else:
        base=json.load(open('/tmp/boxes_base.json'))
        for n in res:
            d=[(k,base[n][k],res[n][k]) for k in res[n] if base[n].get(k)!=res[n][k]]
            print(n,'same' if not d else d)
asyncio.run(main())
