# Main-thread and raster cost per frame on a phone (DPR 3, CPU throttled 4x), via a Chrome trace.
#   python3 tools/perf.py [query ...]        e.g.  '?at=10:30' '?at=14:00'
# Compare before/after a change (git stash, or tools/visual_compare.py's /tmp/vc_ref.html via --url).
import asyncio,sys,json,collections
from playwright.async_api import async_playwright
from common import url
async def run(b,u,q):
    ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=3,has_touch=True,is_mobile=True);pg=await ctx.new_page()
    cdp=await ctx.new_cdp_session(pg);await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    await pg.goto(u+q);await pg.wait_for_timeout(3500)
    await b.start_tracing(page=pg,path='/tmp/perf.json',categories=['devtools.timeline','disabled-by-default-devtools.timeline','cc'])
    await pg.wait_for_timeout(3000);await b.stop_tracing();await ctx.close()
    T=json.load(open('/tmp/perf.json'));ev=T['traceEvents'] if isinstance(T,dict) else T
    main=collections.Counter((e.get('pid'),e.get('tid')) for e in ev if e.get('name') in ('UpdateLayoutTree','Paint','Layout')).most_common(1)[0][0]
    agg=collections.defaultdict(float)
    for e in ev:
        if e.get('ph')!='X':continue
        if (e.get('pid'),e.get('tid'))==main and e['name'] in ('RunTask','FunctionCall','Layout','Paint'):agg[e['name']]+=e.get('dur',0)/1000
        if e['name']=='RasterTask':agg['raster']+=e.get('dur',0)/1000
    fr=max(1,sum(1 for e in ev if e.get('name')=='FireAnimationFrame'))
    return '%-24s fps %4.1f | per frame: main %4.1f (js %4.1f layout %4.1f paint %4.1f) raster %4.1f ms'%(q,fr/3,agg['RunTask']/fr,agg['FunctionCall']/fr,agg['Layout']/fr,agg['Paint']/fr,agg['raster']/fr)
async def main():
    a=sys.argv[1:];u=url()
    if a and a[0]=='--url':u=a[1];a=a[2:]
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for q in a or ['?at=10:30','?at=14:00','?at=22:00']:print(await run(b,u,q),flush=True)
        await b.close()
asyncio.run(main())
