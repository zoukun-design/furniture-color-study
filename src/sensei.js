// ---- Suzaki sensei: a little life in the model.
// She is posed in millimetres in the room (feet, pelvis, leaning torso, legs, two-bone arms) and every part
// is projected with the drawing's own isometric and painted back to front, so she reads as flat paper but
// moves like a body. The chair's seat, arms and back are drawn here too, so it can roll and swivel, and when
// she sits its parts are sorted together with hers. Her face lives on the sphere of her head: it slides to
// the edge and is hidden there as she turns, instead of fading.
(function(){
var G=document.getElementById('sensei');if(!G)return;
function $i(id){return document.getElementById(id);}
// a value written again unchanged is not written. To the browser every write is a change, and a change inside
// something shown elsewhere too (the view through the three panes, the shade's mask) makes it rebuild those copies
// the drawing's own svg is given its size in pixels (measured from the page's percent rule, again whenever its box
// changes). Sized in percent, the browser lays out every one of the drawing's shapes again whenever any one moves
(function(){var sv=G.ownerSVGElement,host=sv&&sv.parentNode;if(!host)return;var busy=false;
 function fit(){if(busy)return;busy=true;sv.style.width='';sv.style.height='';var r=sv.getBoundingClientRect();if(r.width>0&&r.height>0){sv.style.width=r.width+'px';sv.style.height=r.height+'px';}busy=false;}
 fit();if(window.ResizeObserver)new ResizeObserver(fit).observe(host);window.addEventListener('resize',fit);window.addEventListener('orientationchange',function(){setTimeout(fit,300);});})();
(function(){var o=SVGElement.prototype.setAttribute;if(o.__same)return;var f=function(k,v){v=String(v);if(this.getAttribute(k)===v)return;o.call(this,k,v);};f.__same=1;SVGElement.prototype.setAttribute=f;})();
var svg=G.ownerSVGElement,LOW=$i('senLow'),DA=$i('laptop'),CHR=$i('chair'),CHS=$i('chairShadow'),CHST=$i('chairStatic'),CHU=$i('chairUp'),DB=$i('deskBProps'),OVB=$i('senOverB');
// the topmost slot is a group of its own at the end of the scene, so the room's light layers can lie over it
// (made here by hand: mk's namespace is not set yet at this point, and a g without the svg namespace is never drawn)
var SLOT={top:(function(){var g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='senTop';svg.appendChild(g);return g;})(),front:$i('slotFront'),b:$i('slotB')};SLOT.top.appendChild(LOW);SLOT.top.appendChild(G);
if(!LOW||!DA||!CHR||!CHST||!CHU||!DB||!OVB||!SLOT.front||!SLOT.b)return;
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){G.remove();LOW.remove();return;}
CHST.style.display='none';
var OX=+G.dataset.ox,OY=+G.dataset.oy,S=+G.dataset.s,C=Math.cos(Math.PI/6),NS='http://www.w3.org/2000/svg',UP=[0,0,1],V3=[1,1,1];
var r3=1/Math.sqrt(3),VN=[r3,r3,r3],EX=[Math.SQRT1_2,-Math.SQRT1_2,0],EY=[-1/Math.sqrt(6),-1/Math.sqrt(6),2/Math.sqrt(6)];
var COL={skin:'#f1dfcf',neck:'#ecd8c6',hair:'#3a2f29',top:'#4b5058',skirt:'#c8b597',lapTop:'#d4c4a7',fold:'#b5a284',shoe:'#2c2a2b',eye:'#2a2522',
 page:'#f4efe3',line:'#d3cab8',ink:'#a29d92',paper:'#fbfaf6',pen:'#3d3d3d'};
// ---------- maths ----------
function A(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function Sb(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function M(a,s){return [a[0]*s,a[1]*s,a[2]*s];}
function D(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function L(a){return Math.sqrt(D(a,a));}
function N(a){var l=L(a)||1;return M(a,1/l);}
function X(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function mix(a,b,k){return A(a,M(Sb(b,a),k));}
function cl(x,a,b){return x<a?a:x>b?b:x;}
function ease(x){x=cl(x,0,1);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function ph(k,a,b){return cl((k-a)/(b-a),0,1);}
function sm(x){return x*x*(3-2*x);}
function rnd(a,b){return a+Math.random()*(b-a);}
function rotz(v,a){var c=Math.cos(a),s=Math.sin(a);return [v[0]*c-v[1]*s,v[0]*s+v[1]*c,v[2]];}
function W(p){return [OX+(p[0]-p[1])*C*S,OY+(p[0]+p[1])*0.5*S-p[2]*S];}
function dep(p){return p[0]+p[1]+0.15*p[2];}
function angTo(a,b){var d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;}
function hull(pts){pts=pts.slice().sort(function(a,b){return a[0]-b[0]||a[1]-b[1];});
 function cr(o,a,b){return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);}
 var lo=[],hi=[],i;for(i=0;i<pts.length;i++){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],pts[i])<=0)lo.pop();lo.push(pts[i]);}
 for(i=pts.length-1;i>=0;i--){while(hi.length>=2&&cr(hi[hi.length-2],hi[hi.length-1],pts[i])<=0)hi.pop();hi.push(pts[i]);}
 hi.pop();lo.pop();return lo.concat(hi);}
function pd(p){return 'M'+p.map(function(q){return q[0].toFixed(1)+','+q[1].toFixed(1);}).join('L')+'Z';}
function pl(p){return 'M'+p.map(function(q){return q[0].toFixed(1)+','+q[1].toFixed(1);}).join('L');}
function hullW(p3){return pd(hull(p3.map(W)));}
function polyW(p3){return pd(p3.map(W));}
function seg(a,b){return 'M'+a[0].toFixed(1)+','+a[1].toFixed(1)+'L'+b[0].toFixed(1)+','+b[1].toFixed(1);}
function ring(c,fv,rv,w,d,n){var o=[];n=n||14;for(var i=0;i<n;i++){var a=i/n*2*Math.PI;o.push(A(c,A(M(rv,w*Math.cos(a)),M(fv,d*Math.sin(a)))));}return o;}
function area(p){var s=0;for(var i=0;i<p.length;i++){var a=p[i],b=p[(i+1)%p.length];s+=a[0]*b[1]-b[0]*a[1];}return s/2;}
// keep the part of polygon p inside convex polygon q (screen space)
function clipPoly(p,q){if(area(q)<0)q=q.slice().reverse();var out=p;for(var i=0;i<q.length&&out.length;i++){var a=q[i],b=q[(i+1)%q.length],inp=out;out=[];
 var side=function(x){return (b[0]-a[0])*(x[1]-a[1])-(b[1]-a[1])*(x[0]-a[0]);};
 for(var j=0;j<inp.length;j++){var c=inp[j],d=inp[(j+1)%inp.length],sc=side(c),sd=side(d);if(sc>=0)out.push(c);if((sc>=0)!==(sd>=0)){var t=sc/(sc-sd);out.push([c[0]+(d[0]-c[0])*t,c[1]+(d[1]-c[1])*t]);}}}
 return out;}
// colours
function rgb(h){var x=parseInt(h.slice(1),16);return [(x>>16)&255,(x>>8)&255,x&255];}
function hex(c){return '#'+c.map(function(v){v=Math.round(cl(v,0,255));return (v<16?'0':'')+v.toString(16);}).join('');}
function mixCol(a,b,k){var x=rgb(a),y=rgb(b);return hex([0,1,2].map(function(i){return x[i]+(y[i]-x[i])*k;}));}
function shade(a,k){return hex(rgb(a).map(function(v){return v*k;}));}
// lit like the drawing: tops as they are, sides facing +u darker than sides facing +v
function faceCol(base,n,ku,kv){if(n[2]>0.55)return base;ku=ku||0.8;kv=kv||0.9;var su=Math.max(0,n[0]),sv=Math.max(0,n[1]),t=su+sv>1e-6?su/(su+sv):0.5;return shade(base,kv+(ku-kv)*t);}
// ---------- svg plumbing: parts own a pool of paths that is refilled every frame ----------
function mk(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function pool(g){return {g:g,list:[],n:0};}
function pb(p){p.n=0;}
function pa(p,d,fill,stroke,sw,op){var e=p.list[p.n];if(!e){e=mk('path',{},p.g);p.list.push(e);e._={};}
 var z=e._;if(z.d!==d){e.setAttribute('d',d);z.d=d;}var f=fill||'none';if(z.f!==f){e.setAttribute('fill',f);z.f=f;}
 var s=stroke||'none';if(z.s!==s){e.setAttribute('stroke',s);z.s=s;if(stroke){e.setAttribute('stroke-linecap','round');e.setAttribute('stroke-linejoin','round');}}
 var w=sw?sw.toFixed(2):'';if(z.w!==w){if(sw)e.setAttribute('stroke-width',w);else e.removeAttribute('stroke-width');z.w=w;}
 var o=op==null||op>=0.999?'':op.toFixed(2);if(z.o!==o){if(o)e.setAttribute('opacity',o);else e.removeAttribute('opacity');z.o=o;}
 if(e.style.display)e.style.display='';p.n++;return e;}
function pe(p){for(var i=p.n;i<p.list.length;i++)if(p.list[i].style.display!=='none')p.list[i].style.display='none';}
var P={COL:{d:0},COLU:{d:0}};
function part(n,par){var g=mk('g',{'data-n':n},par);P[n]={g:g,p:pool(g),d:0,on:true};return P[n];}
['shadow','shoeL','shoeR','skirtLo'].forEach(function(n){part(n,LOW);});
['skirtHi','torso','neck','head','upL','foL','hdL','upR','foR','hdR','lap','mug','bookC','bookO','stack','held','roll','rollB'].forEach(function(n){part(n,G);});
var CHP=['cSeat','cArmP','cArmN','cRailP','cRailN','cBack'];CHP.forEach(function(n){part(n,CHU);});
var PDA=pool(mk('g',{},DA)),PDB;
// ---------- the room (mm) ----------
var HZ=690,SHZ=445,SHW=152,CU=1210,CV=1260,TOPZ=720,LAPU=1215,LAPU0=1430,MUG0=[1640,690,TOPZ],HANDLE=[0,60,52],SPD=650,STRIDE=820;
var DESKSIDE=[1660,990],CHAIRSIDE=[1650,1175],BSPOT=[1770,1220],PSI_SIT=1.05;
var STACK0=[1590,640],OPEN0=[LAPU,650],DONE0=[905,655];
var SHEET={u0:2000,v0:800,w:594,h:841};
var me={wsh:0,wshT:0,wshNext:0,rollLift:0,F:[420,1880],yaw:Math.PI,av:0,sitK:0,lean:0,tilt:0,hYaw:0,pelZ:0,qa:0.3,cyc:STRIDE,cycT:STRIDE,lh:45,w:0,wT:0,md:[-1,0,0],op:1,away:false,react:0,blinkTo:0,nextBlink:0,
 sway:0,bounce:0,atB:false,squint:0};
var prop={lap:'away',lapPose:null,lapU:LAPU0,phi:0,on:0,mug:'away',mugPos:MUG0.slice(),book:'away',bookK:0,spread:0,page:-1,
 stack:[],stackPos:'away',stackMove:null,held:null,open:null,done:[],roll:'away',rollPose:null,sheet:0,bookCol:'#7a2f2c'};
var chair={off:0,psi:0};
var HLAST={L:null,R:null},TRAW={L:null,R:null},TEFF={L:null,R:null},TOFF={L:null,R:null},TJT={L:0,R:0},TJD={L:1,R:1},YW0={},seated=false,slotKey='',hands={L:null,R:null},HC={L:null,R:null},HV={L:[0,0,0],R:[0,0,0]},PC={L:null,R:null},SH0={L:null,R:null},HAND={L:[0,0,0],R:[0,0,0]},HD={L:[0,0,-1],R:[0,0,-1]};
var vt=0,dt=1/60,LU=268,LF=294,neckFront=false,drapeFront=false,rollNear=true,rollFront=0,RF=null,handFront={L:false,R:false};
var BOOKCOLS=['#3f5a4f','#7a2f2c','#2f3b55','#b08a3e','#5d5f62','#c4ae86','#6b4f3a','#8a3f4b','#40566b'];
function makeBooks(n){var o=[];for(var i=0;i<n;i++)o.push({w:rnd(150,182),h:rnd(212,250),t:rnd(18,36),col:BOOKCOLS[Math.floor(Math.random()*BOOKCOLS.length)],yaw:rnd(-0.07,0.07)});return o;}
// ---------- the chair: geometry in its own frame (a: back, b: towards +u at rest), rolled by off and swivelled by psi ----------
var CHC={AL:'#cfd2d4',ALD:'#9ea2a5',WH:'#f4f3ef',PAD:'#3a3a3a'};
function chairCenter(){return [CU,CV+chair.off,0];}
function cw(a,b,z){var c=Math.cos(chair.psi),s=Math.sin(chair.psi);return [CU+b*c-a*s,CV+chair.off+b*s+a*c,z];}
function cv(a,b){var c=Math.cos(chair.psi),s=Math.sin(chair.psi);return [b*c-a*s,b*s+a*c,0];}
function chairFront(){return [Math.sin(chair.psi),-Math.cos(chair.psi),0];}
function frontYaw(psi){return Math.atan2(-Math.cos(psi),Math.sin(psi));}
function seatF(){var c=chairCenter(),fr=chairFront();return [c[0]+fr[0]*380,c[1]+fr[1]*380];}   // where her feet are when she sits in it
function armPad(sb,a){return cw(a,sb*275,668);}

// a box from a centre and three half-axes: every face that turns to the viewer, coloured by colFn(normal, axis index, sign)
function boxFaces(p,c,a0,a1,a2,colFn){var ax=[a0,a1,a2];
 for(var i=0;i<3;i++)for(var sg=-1;sg<=1;sg+=2){var n=N(M(ax[i],sg));if(D(n,V3)<=0.0001)continue;var o1=ax[(i+1)%3],o2=ax[(i+2)%3],fc=A(c,M(ax[i],sg));
  pa(p,polyW([A(fc,A(o1,o2)),A(fc,Sb(o1,o2)),Sb(fc,A(o1,o2)),Sb(fc,Sb(o1,o2))]),colFn(n,i,sg));}}
function lbox(p,a0,a1,b0,b1,z0,z1,top,ku,kv){boxFaces(p,cw((a0+a1)/2,(b0+b1)/2,(z0+z1)/2),cv((a1-a0)/2,0),cv(0,(b1-b0)/2),[0,0,(z1-z0)/2],function(n){return faceCol(top,n,ku,kv);});}
function tube3(p,a,b,wpx,col){pa(p,seg(W(a),W(b)),null,col,wpx);}
function drawChair(){var tr='translate('+(-chair.off*C*S).toFixed(2)+' '+(chair.off*0.5*S).toFixed(2)+')';CHR.setAttribute('transform',tr);if(CHS)CHS.setAttribute('transform',tr);
 if(GEO){gp('cSeat',{t:'cbox',a0:-240,a1:196,b0:-260,b1:260,z0:400,z1:470});[['cArmP',1],['cArmN',-1]].forEach(function(x){var bs=x[1]*275;gp(x[0],{t:'cbox',a0:-170,a1:90,b0:bs-28,b1:bs+28,z0:640,z1:662});gp(x[0],{t:'cap',a:cw(150,bs,450),b:cw(40,bs,640),r:6});});
  [['cRailP',1],['cRailN',-1]].forEach(function(x){gp(x[0],{t:'cap',a:cw(-240,x[1]*262,435),b:cw(230,x[1]*262,435),r:6});});gp('cBack',{t:'cbox',a0:195,a1:250,b0:-262,b1:262,z0:440,z1:1110,sl:90/630,sz:480});}
 var q=P.cSeat;pb(q.p);lbox(q.p,-240,230,-260,260,400,470,CHC.WH,0.88,0.94);
 for(var k=1;k<4;k++){var aa=-240+470*k/4;pa(q.p,seg(W(cw(aa,-250,470)),W(cw(aa,250,470))),null,'rgba(0,0,0,0.10)',1.4);}pe(q.p);q.d=dep(cw(0,0,435));
 // arms: a post from under the seat up to a pad
 [['cArmP',1],['cArmN',-1]].forEach(function(x){var q=P[x[0]],bs=x[1]*275;pb(q.p);tube3(q.p,cw(150,bs,450),cw(40,bs,640),4,CHC.AL);
  boxFaces(q.p,cw(-40,bs,651),cv(130,0),cv(0,28),[0,0,11],function(n){return n[2]>0.5?CHC.PAD:faceCol('#2f2f2f',n,0.82,1);});pe(q.p);q.d=dep(cw(-20,bs*1.04,600));});
 [['cRailP',1],['cRailN',-1]].forEach(function(x){var q=P[x[0]];pb(q.p);tube3(q.p,cw(-240,x[1]*262,435),cw(230,x[1]*262,435),4,CHC.AL);pe(q.p);q.d=dep(cw(0,x[1]*262,430));});
 // the back: a panel that leans back with height, rails along its sides, a brace behind
 q=P.cBack;pb(q.p);var ba0=200,ba1=245,bz0=480,bz1=1110,ln=90,bb=250;
 function bk(a,b,z){return cw(a+ln*(z-bz0)/(bz1-bz0),b,z);}
 var rear=N(cv(1,0)),side=N(cv(0,1)),railsFirst=[],railsLast=[];
 [-1,1].forEach(function(sg){var r=[bk(ba1-10,sg*(bb+8),bz0-40),bk(ba1-10,sg*(bb+8),bz1)];(D(M(side,sg),V3)>0?railsLast:railsFirst).push(r);});
 railsFirst.forEach(function(r){tube3(q.p,r[0],r[1],4.5,CHC.AL);});
 var showRear=D(rear,V3)>0,face=showRear?ba1:ba0,fn=showRear?rear:M(rear,-1),sgn=showRear?1:-1;
 if(showRear)pa(q.p,seg(W(bk(ba1+6,-bb-8,bz0+30)),W(bk(ba1+6,bb+8,bz0+30))),null,CHC.ALD,3);
 pa(q.p,polyW([bk(face,-bb,bz0),bk(face,bb,bz0),bk(face,bb,bz1),bk(face,-bb,bz1)]),faceCol(CHC.WH,fn,0.88,0.94));
 for(k=1;k<6;k++){var zz=bz0+(bz1-bz0)*k/6;pa(q.p,seg(W(bk(face+sgn,-bb,zz)),W(bk(face+sgn,bb,zz))),null,'rgba(0,0,0,0.10)',1.4);}
 [-1,1].forEach(function(sg){var n=M(side,sg);if(D(n,V3)<=0)return;pa(q.p,polyW([bk(ba0,sg*bb,bz0),bk(ba1,sg*bb,bz0),bk(ba1,sg*bb,bz1),bk(ba0,sg*bb,bz1)]),faceCol(CHC.WH,n,0.86,0.93));});
 pa(q.p,polyW([bk(ba0,-bb,bz1),bk(ba1,-bb,bz1),bk(ba1,bb,bz1),bk(ba0,bb,bz1)]),CHC.WH);
 railsLast.forEach(function(r){tube3(q.p,r[0],r[1],4.5,CHC.AL);});pe(q.p);q.d=dep(bk(222,0,760));}
// ---------- things on the main desk ----------
function drawLaptopOn(p,u,phi,on){var u0=u-142,u1=u+142,v0=573,v1=776,z0=TOPZ,z1=TOPZ+22;
 pa(p,polyW([[u0,v1,z0],[u1,v1,z0],[u1,v1,z1],[u0,v1,z1]]),'#1c1d1f');
 pa(p,polyW([[u1,v0,z0],[u1,v1,z0],[u1,v1,z1],[u1,v0,z1]]),'#202124');
 pa(p,polyW([[u0,v0,z1],[u1,v0,z1],[u1,v1,z1],[u0,v1,z1]]),'#2b2c2f');
 var inner=phi>Math.PI/4;
 function lid(uu,s){return [uu,v0+s*Math.cos(phi),z1+s*Math.sin(phi)];}
 if(inner){// keyboard, and the round wheel pad of this make of laptop
  pa(p,polyW([[u0+22,v0+30,z1],[u1-22,v0+30,z1],[u1-22,v0+118,z1],[u0+22,v0+118,z1]]),'#161719');
  for(var rr=1;rr<5;rr++){var vv=v0+30+88*rr/5;pa(p,seg(W([u0+26,vv,z1]),W([u1-26,vv,z1])),null,'#2f3034',0.5);}
  pa(p,hullW(ring([u,v0+165,z1],[0,1,0],[1,0,0],32,32,18)),'#3a3b3f');pa(p,hullW(ring([u,v0+165,z1],[0,1,0],[1,0,0],24,24,18)),'#26272a');}
 var L0=200;pa(p,polyW([lid(u0,0),lid(u1,0),lid(u1,L0),lid(u0,L0)]),inner?'#141517':'#2c2d30');
 if(!inner){// the bonnet: a raised field across the lid
  pa(p,polyW([lid(u0+26,22),lid(u1-26,22),lid(u1-26,L0-22),lid(u0+26,L0-22)]),null,'#3d3e42',0.7);
  pa(p,seg(W(lid(u0+26,L0/2)),W(lid(u1-26,L0/2))),null,'#3d3e42',0.6);return;}
 function sq(ua,ub,fa,fb){return polyW([lid(ua,10+178*fa),lid(ub,10+178*fa),lid(ub,10+178*fb),lid(ua,10+178*fb)]);}
 pa(p,sq(u0+14,u1-14,0,1),mixCol('#2c3136','#a8bfcc',on));
 if(on>0.5){var o=cl(on*2-1,0,1);pa(p,sq(u0+14,u1-14,0.87,1),'#7f99a8',null,null,o);pa(p,sq(u0+36,u1-36,0.08,0.8),'#eef2f4',null,null,o);
  [[0.68,0.72],[0.58,0.62],[0.48,0.52],[0.38,0.42],[0.28,0.32]].forEach(function(r,i){pa(p,sq(u0+56,u1-(i%2?112:56),r[0],r[1]),'#b9c6ce',null,null,o);});}}
// a mug: white body shaded on its +u side, rim, the coffee a little below the rim, and a looped handle
function drawMug(p,base,hd,up){up=up?N(up):[0,0,1];var r=41,h=96,top=A(base,M(up,h)),rv=N(X([0,1,0],up)),fv=N(X(up,rv));
 hd=N(Sb(hd,M(up,D(hd,up))));var far=D(hd,V3)<=0;
 function handle(){var pts=[];for(var i=0;i<=12;i++){var a=Math.PI/2-Math.PI*i/12;pts.push(W(A(base,A(M(hd,r-6+30*Math.cos(a)),M(up,50+24*Math.sin(a))))));}
  pa(p,pl(pts),null,far?'#d9d5cd':'#e9e6df',10*S);}
 if(far)handle();
 pa(p,hullW(ring(base,fv,rv,r,r,20).concat(ring(top,fv,rv,r,r,20))),'#ebe8e1');
 var sh=[];for(var i=0;i<=10;i++){var a=-Math.PI/4+Math.PI/2*i/10;sh.push(A(base,A(M(rv,r*Math.cos(a)),M(fv,r*Math.sin(a)))));}
 pa(p,pd(sh.concat(sh.map(function(x){return A(x,M(up,h));}).reverse()).map(W)),'#dcd8d0');
 // the rim: seen from above we look into the cup (coffee inside the inner wall); tipped away from us we see only its outside
 var into=D(up,[0,0,1])>0.35;var tp=ring(top,fv,rv,r,r,20).map(W);pa(p,pd(tp),into?'#f8f6f1':'#e2ded6');
 if(into){var inr=ring(top,fv,rv,r-6,r-6,20).map(W);pa(p,pd(inr),'#d4cfc5');
  var cof=clipPoly(ring(A(top,M(up,-15)),fv,rv,r-7,r-7,20).map(W),inr);if(cof.length>2)pa(p,pd(cof),'#4a3025');
  var hl=clipPoly(ring(A(top,A(M(rv,-12),A(M(fv,-12),M(up,-15)))),fv,rv,10,6,10).map(W),cof.length>2?cof:inr);if(hl.length>2)pa(p,pd(hl),'#6c4a38');}
 if(!far)handle();if(D(up,[0,0,1])>0.9)steam(p,top);}
// steam off hot coffee: soft translucent sheets that rise from the cup, widen, lean and fade as they go
function steam(p,top){var t=vt/1000,lat=[0.7071,-0.7071,0];
 // two broad, soft plumes that lean on each other and rise about a cup and a half high, slowly swaying; each has a
 // fainter wider skin round it so its edge is soft rather than a line
 if(!STG){STG=mk('linearGradient',{id:'steamG',x1:0,y1:0,x2:0,y2:1},defs);[[0,0],[0.35,0.13],[0.8,0.22],[1,0]].forEach(function(s){mk('stop',{offset:s[0],'stop-color':'#fff','stop-opacity':s[1]},STG);});}
 for(var w=0;w<2;w++){var ph0=t*0.8+w*2.6,C=[],WD=[];
  for(var k=0;k<=14;k++){var u=k/14,z=4+u*200,sway=Math.sin(ph0-u*2.6)*(4+u*30),drift=Math.cos(ph0*0.6-u*2)*(2+u*10);
   C.push(A(top,A(M(lat,sway+(w?9:-9)),[drift*0.7,-drift*0.7,z])));WD.push((16+u*30+4*Math.sin(ph0*0.7+u*3))*Math.sin(Math.PI*Math.min(1,0.18+u*0.95)));}
  [[1.45,0.55],[1,1]].forEach(function(sk){var Lp=[],Rp=[];C.forEach(function(c,k){Lp.push(W(A(c,M(lat,-WD[k]*sk[0]))));Rp.push(W(A(c,M(lat,WD[k]*sk[0]))));});
   pa(p,pd(Lp.concat(Rp.reverse())),'url(#steamG)',null,null,sk[1]);});}}
var STG=null;
// books: covers in the book's colour, a darker spine, cream page edges with a fine line
function bookFaces(p,c,aw,ah,at,col,open){var ax=[aw,ah,at];
 for(var i=0;i<3;i++)for(var sg=-1;sg<=1;sg+=2){var n=N(M(ax[i],sg));if(D(n,V3)<=0.0001)continue;var o1=ax[(i+1)%3],o2=ax[(i+2)%3],fc=A(c,M(ax[i],sg));
  var role=i===2?(open&&sg<0?'p':'c'):(i===0&&sg<0)?'s':'p';
  pa(p,polyW([A(fc,A(o1,o2)),A(fc,Sb(o1,o2)),Sb(fc,A(o1,o2)),Sb(fc,Sb(o1,o2))]),role==='c'?faceCol(col,n,0.84,0.92):role==='s'?shade(faceCol(col,n,0.84,0.92),0.8):faceCol(COL.page,n,0.86,0.93));
  if(role==='p'&&i!==2){var tdir=i===0?ah:aw;[-0.3,0.3].forEach(function(k){pa(p,seg(W(A(A(fc,M(at,k)),M(tdir,0.92))),W(Sb(A(fc,M(at,k)),M(tdir,0.92)))),null,COL.line,0.45);});}}}
function plW(p3){var s='';p3.forEach(function(q,i){var w=W(q);s+=(i?'L':'M')+w[0].toFixed(1)+','+w[1].toFixed(1);});return s;}
// a hardback as it really is: two boards a little bigger than the block of pages between them, the spine wrapping one
// edge; the edges of the block show the sheets. Drawn back to front: the boards' inner faces, the pages, then the
// boards' edges and outer faces (back-facing faces are skipped).
var BOARD=2.6,OVH=3;
function boxFace(p,o,ex,ey,ez,x0,x1,y0,y1,z0,z1,which,col,ln){// one face of an axis box in the frame (o; ex,ey,ez)
 function L3(x,y,z){return A(A(A(o,M(ex,x)),M(ey,y)),M(ez,z));}
 var f={'x0':[[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1],M(ex,-1)],'x1':[[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],ex],
  'y0':[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],M(ey,-1)],'y1':[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],ey],
  'z0':[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],M(ez,-1)],'z1':[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],ez]}[which];
 var n=N(f[4]);if(D(n,V3)<=0.0001)return false;pa(p,polyW(f.slice(0,4).map(function(a){return L3(a[0],a[1],a[2]);})),faceCol(col,n,0.84,0.92));
 // the sheets of the block, as fine lines along the edge
 if(ln){var axis=which[0]==='x'?1:0,k;for(k=1;k<ln;k++){var zz=z0+(z1-z0)*k/ln,a0=[0,0,0],a1=[0,0,0];a0[2]=a1[2]=zz;
   if(axis===1){a0[0]=a1[0]=which==='x0'?x0:x1;a0[1]=y0+1.5;a1[1]=y1-1.5;}else{a0[1]=a1[1]=which==='y0'?y0:y1;a0[0]=x0+1.5;a1[0]=x1-1.5;}
   pa(p,seg(W(L3(a0[0],a0[1],a0[2])),W(L3(a1[0],a1[1],a1[2]))),null,COL.line,0.35,0.55+0.3*(k%2));}}
 return true;}
// one half of an open book held up to read: frame at the spine sp, ex toward the fore-edge (length W), ey up the page,
// ez from the board toward the reader. The block of pages dips into the gutter.
function openWing(p,sp,wv,bu,nin,col,text){var W0=L(wv),ex=N(wv),ey=bu,ez=nin,T=9,H=105,pr=[[0.5,0.42],[7,0.7],[16,0.9],[28,1],[W0,1]];
 function L3(x,y,z){return A(A(A(sp,M(ex,x)),M(ey,y)),M(ez,z));}
 var pcol=COL.page,ecol=shade(COL.page,0.95),inner=D(ez,V3)>0;
 function board(stage){// stage 0: inner face (before the pages), 1: edges and outer face (after)
  if(stage===0){boxFace(p,sp,ex,ey,ez,0,W0+OVH,-H-OVH,H+OVH,0,BOARD,'z1',col);return;}
  ['x1','y0','y1'].forEach(function(w){boxFace(p,sp,ex,ey,ez,0,W0+OVH,-H-OVH,H+OVH,0,BOARD,w,shade(col,0.86));});
  boxFace(p,sp,ex,ey,ez,0,W0+OVH,-H-OVH,H+OVH,0,BOARD,'z0',col);}
 function pages(){var zt=pr.map(function(q){return BOARD+T*q[1];});
  // the page surface, curving up out of the gutter
  for(var i=0;i+1<pr.length;i++){var a=pr[i],b2=pr[i+1],n=N(X(Sb(L3(b2[0],0,zt[i+1]),L3(a[0],0,zt[i])),ey));if(D(n,ez)<0)n=M(n,-1);
   if(D(n,V3)>0)pa(p,polyW([L3(a[0],-H,zt[i]),L3(b2[0],-H,zt[i+1]),L3(b2[0],H,zt[i+1]),L3(a[0],H,zt[i])]),faceCol(pcol,n,0.86,0.93));}
  // the head and tail of the block, following that curve, with the sheets drawn in
  [-1,1].forEach(function(sy){var n=M(ey,sy);if(D(n,V3)<=0)return;var top=pr.map(function(q,i){return L3(q[0],sy*H,zt[i]);}),bot=pr.map(function(q){return L3(q[0],sy*H,BOARD);}).reverse();
   pa(p,polyW(top.concat(bot)),faceCol(ecol,n,0.86,0.93));
   for(var k=1;k<5;k++)pa(p,plW(pr.map(function(q,i){return L3(q[0]+(i===0?1:0),sy*H,BOARD+(zt[i]-BOARD)*k/5);}).filter(function(q,i){return i>0;})),null,COL.line,0.35,0.55+0.3*(k%2));});
  // the fore-edge
  boxFace(p,sp,ex,ey,ez,0,W0,-H,H,BOARD,BOARD+T,'x1',ecol,6);
  if(text&&inner){var zf=BOARD+T;for(var row=0;row<8;row++){var y=-76+row*20;pa(p,seg(W(L3(W0*0.18,y,zf)),W(L3(W0*0.86,y,zf))),null,COL.ink,0.45,0.6);}}}
 if(inner){board(0);pages();board(1);}else{pages();board(0);board(1);}}
// a closed hardback: c its middle, aw half its width (the spine on the -aw side), ah half its height, at half its thickness
function closedBook(p,c,aw,ah,at,col){var W0=L(aw),H0=L(ah),T0=L(at),ex=N(aw),ey=N(ah),ez=N(at),o=c;
 var pc=COL.page,ec=shade(COL.page,0.95),sc=shade(col,0.86),zi=T0-BOARD;
 // inner faces of the boards and spine first, then the block of pages, then the boards from outside
 boxFace(p,o,ex,ey,ez,-W0,W0+OVH,-H0-OVH,H0+OVH,zi,T0,'z0',col);boxFace(p,o,ex,ey,ez,-W0,W0+OVH,-H0-OVH,H0+OVH,-T0,-zi,'z1',col);
 boxFace(p,o,ex,ey,ez,-W0,-W0+BOARD,-H0-OVH,H0+OVH,-T0,T0,'x1',col);
 ['x1','y0','y1'].forEach(function(w){boxFace(p,o,ex,ey,ez,-W0+BOARD,W0,-H0,H0,-zi,zi,w,ec,7);});
 [[zi,T0,'z1'],[-T0,-zi,'z0']].forEach(function(zz){['x1','y0','y1',zz[2]].forEach(function(w){boxFace(p,o,ex,ey,ez,-W0,W0+OVH,-H0-OVH,H0+OVH,zz[0],zz[1],w,w[0]==='z'?col:sc);});});
 ['x0','y0','y1'].forEach(function(w){boxFace(p,o,ex,ey,ez,-W0,-W0+BOARD,-H0-OVH,H0+OVH,-T0,T0,w,w==='x0'?shade(col,0.8):sc);});}
function stackBook(p,base,b,z){bookFaces(p,[base[0],base[1],z+b.t/2],rotz([b.w/2,0,0],b.yaw),rotz([0,b.h/2,0],b.yaw),[0,0,b.t/2],b.col);}
function stackHeight(st){var s=0;st.forEach(function(b){s+=b.t;});return s;}
// an open book lying on the desk: cover underneath, two page blocks that rise to the gutter, columns of text
function openBookDesk(p,c,b,turn){var ex=rotz([1,0,0],b.yaw),ey=rotz([0,1,0],b.yaw),w=b.w,h=b.h,tb=Math.max(5,b.t*0.42),z0=TOPZ+2;
 function at(x,y,zz){return A(A(A([c[0],c[1],z0],M(ex,x)),M(ey,y)),[0,0,zz]);}
 pa(p,polyW([at(-w-5,-h/2-4,0),at(w+5,-h/2-4,0),at(w+5,h/2+4,0),at(-w-5,h/2+4,0)]),shade(b.col,0.95));
 var xs=[0,0.1,0.35,0.7,1],zs=[tb*0.5,tb+7,tb+8,tb+4,tb];
 function zAt(x){for(var i=0;i+1<xs.length;i++)if(x<=xs[i+1]){var k=(x-xs[i])/(xs[i+1]-xs[i]);return zs[i]+(zs[i+1]-zs[i])*k;}return zs[zs.length-1];}
 [-1,1].forEach(function(sg){
  var fe=M(ex,sg);if(D(fe,V3)>0)pa(p,polyW([at(sg*w,-h/2,0),at(sg*w,h/2,0),at(sg*w,h/2,zs[4]),at(sg*w,-h/2,zs[4])]),faceCol(COL.page,fe,0.86,0.93));
  if(D(ey,V3)>0){var prof=[];for(var i=0;i<xs.length;i++)prof.push(at(sg*w*xs[i],h/2,zs[i]));prof.push(at(sg*w,h/2,0),at(0,h/2,0));pa(p,polyW(prof),faceCol(COL.page,ey,0.86,0.9));}
  for(var j=0;j+1<xs.length;j++){var sl=(zs[j+1]-zs[j])/(w*(xs[j+1]-xs[j]))*sg,lit=cl(0.98+0.12*sl*(D(ex,[1,1,0])>0?1:-1),0.9,1.03);
   pa(p,polyW([at(sg*w*xs[j],-h/2,zs[j]),at(sg*w*xs[j+1],-h/2,zs[j+1]),at(sg*w*xs[j+1],h/2,zs[j+1]),at(sg*w*xs[j],h/2,zs[j])]),shade(COL.page,lit));}
  for(var col=0;col<9;col++){var x=0.18+0.085*col,zz=zAt(x)+0.6;pa(p,seg(W(at(sg*w*x,-h/2+16,zz)),W(at(sg*w*x,h/2-(col%3?22:46),zz))),null,COL.ink,0.5,0.5);}});
 if(turn!=null&&turn>=0){var th=Math.PI*ease(turn),pts=[];[0,0.35,0.7,1].forEach(function(x){var lift=12*Math.sin(Math.PI*turn)*x;pts.push([w*x*Math.cos(th),w*x*Math.sin(th)+tb+6+lift]);});
  var q=[];pts.forEach(function(pt){q.push(at(pt[0],-h/2,pt[1]));});for(var i3=pts.length-1;i3>=0;i3--)q.push(at(pts[i3][0],h/2,pts[i3][1]));pa(p,polyW(q),shade(COL.page,0.96+0.05*Math.cos(th)));}}
// a book opening on the desk: the back half lies still, the front cover and its pages swing over on the spine
function openingBook(p,c,b,op){var ex=rotz([1,0,0],b.yaw),ey=rotz([0,1,0],b.yaw),w=b.w,h=b.h,t=b.t,z0=TOPZ,th=Math.PI*op;
 // the back half stays put on the +x side, spine along the gutter; the front half turns on the spine over to -x
 bookFaces(p,A(A([c[0],c[1],z0],M(ex,w/2)),[0,0,t/4]),M(ex,w/2),M(ey,h/2),[0,0,-t/4],b.col,true);
 var dir=A(M(ex,Math.cos(th)),[0,0,Math.sin(th)]),nrm=Sb(M(ex,Math.sin(th)),[0,0,Math.cos(th)]),hg=[c[0],c[1],z0+t/2];
 bookFaces(p,Sb(A(hg,M(dir,w/2)),M(nrm,t/4)),M(dir,w/2),M(ey,h/2),M(nrm,-t/4),b.col,true);}
// a book she is moving across the desk while she sits there is one of the things on the desk: it goes over the pile
// while it is above it and behind the pile once it has come down beside it, with no jump as she lets go of it
function heldOnDesk(){return !!prop.held&&seated;}
// the box a pile of books takes up on the desk: [u0,v0,z0,u1,v1,z1], a little wider for the books' small turns
function pileBox(c,books,z0){var w=0,h=0,s=0;books.forEach(function(b){w=Math.max(w,b.w);h=Math.max(h,b.h);s+=b.t;});return [c[0]-w/2-6,c[1]-h/2-8,z0,c[0]+w/2+6,c[1]+h/2+8,z0+s];}
// two boxes clear of each other along an axis: the one beyond (larger u, v or z) is nearer us, so it goes over; 0: no clear axis
function boxOver(a,b){if(a[2]>=b[5]-0.5)return 1;if(b[2]>=a[5]-0.5)return -1;for(var k=0;k<2;k++){if(a[k]>=b[k+3]-0.5)return 1;if(b[k]>=a[k+3]-0.5)return -1;}return 0;}
function drawDeskA(){pb(PDA);var items=[];
 if(prop.lap==='desk')items.push({d:dep([prop.lapU,675,730]),bx:[prop.lapU-142,470,TOPZ,prop.lapU+142,776,TOPZ+200],f:function(){drawLaptopOn(PDA,prop.lapU,prop.phi,prop.on);}});
 if(prop.mug==='desk')items.push({d:dep(MUG0),bx:[MUG0[0]-62,MUG0[1]-45,TOPZ,MUG0[0]+45,MUG0[1]+45,TOPZ+96],f:function(){drawMug(PDA,MUG0,[0,1,0]);}});
 if(prop.stackPos==='desk'&&prop.stack.length)items.push({d:dep([STACK0[0],STACK0[1],TOPZ]),bx:pileBox(STACK0,prop.stack,TOPZ),f:function(){var z=TOPZ;prop.stack.forEach(function(b){stackBook(PDA,STACK0,b,z);z+=b.t;});}});
 if(prop.done.length)items.push({d:dep([DONE0[0],DONE0[1],TOPZ]),bx:pileBox(DONE0,prop.done,TOPZ),f:function(){var z=TOPZ;prop.done.forEach(function(b){stackBook(PDA,DONE0,b,z);z+=b.t;});}});
 if(prop.open){var ob=prop.open.b;items.push({d:dep([OPEN0[0],OPEN0[1],TOPZ]),bx:[OPEN0[0]-ob.w-14,OPEN0[1]-ob.h/2-14,TOPZ,OPEN0[0]+ob.w+14,OPEN0[1]+ob.h/2+14,TOPZ+Math.max(ob.t,prop.open.op<1?ob.w*0.9:ob.t*0.42+20)],f:function(){var o=prop.open;if(o.op<1)openingBook(PDA,OPEN0,o.b,o.op);else openBookDesk(PDA,OPEN0,o.b,prop.page);}});}
 if(heldOnDesk()){var hb=prop.held;items.push({d:dep(hb.c),bx:pileBox(hb.c,hb.books,hb.c[2]),f:function(){var z=hb.c[2];hb.books.forEach(function(bk){stackBook(PDA,hb.c,bk,z);z+=bk.t;});}});}
 // order: far to near by the depth of each thing's foot, except where two boxes are clear of each other along an axis
 items.sort(function(a,b){return a.d-b.d;});var ord=[],left=items.slice();
 while(left.length){var pk=-1;for(var i=0;i<left.length&&pk<0;i++){var ok=true;for(var j=0;j<left.length;j++)if(j!==i&&boxOver(left[i].bx,left[j].bx)>0){ok=false;break;}if(ok)pk=i;}
  if(pk<0)pk=0;ord.push(left[pk]);left.splice(pk,1);}
 ord.forEach(function(it){it.f();});pe(PDA);}
// ---------- the drawing itself: a diazo print (青焼き) of an unbuilt utopia, Filarete's ideal city of Sforzinda (c.1460),
// redrawn as a reconstruction sheet: the whole city, its civic centre, and the walls in section with a tower in elevation.
// reading frame in paper mm: X 0..841 to her right, Y 0..594 away from her (top of the sheet is the far edge)
var DZ={paper:'#edf0f4',ink:'#2d3c8e',mid:'#5563a8',pale:'#8f99c9',fill:'#3d4c9c',wash:'#cfd5ea',wash2:'#dfe3f0'};
function sheetArt(root){
 var ST={poche:{f:DZ.fill,s:DZ.ink,w:0.24},wash:{f:DZ.wash},wash2:{f:DZ.wash2},paper:{f:DZ.paper,s:DZ.ink,w:0.12},
  hair:{s:DZ.pale,w:0.07},fine:{s:DZ.mid,w:0.08},thin:{s:DZ.ink,w:0.1},med:{s:DZ.ink,w:0.15},heavy:{s:DZ.ink,w:0.26},
  dash:{s:DZ.mid,w:0.08,d:'2 1.2'},chain:{s:DZ.pale,w:0.07,d:'7 1.2 0.8 1.2'},water:{s:DZ.mid,w:0.07},dark:{f:DZ.ink},
  frame:{s:DZ.ink,w:0.36},tb:{s:DZ.ink,w:0.1},tbH:{s:DZ.ink,w:0.2},greek:{s:DZ.pale,w:0.1}};
 var D={},TX=[],FONT="'BIZ UDPGothic','Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",PI=Math.PI;
 function f2(x){return (Math.round(x*100)/100).toString();}
 function add(k,d){(D[k]||(D[k]=[])).push(d);}
 function ln(k,x1,y1,x2,y2){add(k,'M'+f2(x1)+','+f2(y1)+'L'+f2(x2)+','+f2(y2));}
 function pg(k,pts,open){add(k,'M'+pts.map(function(p){return f2(p[0])+','+f2(p[1]);}).join('L')+(open?'':'Z'));}
 function rc(k,x,y,w,h){pg(k,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);}
 function ci(k,x,y,r){add(k,'M'+f2(x-r)+','+f2(y)+'a'+f2(r)+','+f2(r)+' 0 1 0 '+f2(2*r)+',0a'+f2(r)+','+f2(r)+' 0 1 0 '+f2(-2*r)+',0Z');}
 function tx(x,y,s,sz,an,wt){TX.push({x:x,y:y,s:s,sz:sz,an:an||'middle',wt:wt||400});}
 function pol(cx,cy,r,a){return [cx+r*Math.cos(a),cy+r*Math.sin(a)];}
 function rot(cx,cy,a,pts){var c=Math.cos(a),s=Math.sin(a);return pts.map(function(p){return [cx+p[0]*c-p[1]*s,cy+p[0]*s+p[1]*c];});}
 function caption(x,y,s,sc){tx(x,y,s,4.4,'start',700);var w=s.length*4.3+2;ln('med',x,y+1.6,x+w,y+1.6);ln('thin',x,y+2.5,x+w,y+2.5);tx(x+w+3,y,sc,3.0,'start');}
 function leader(x0,y0,x1,y1,s,sz,an){var L=s.length*(sz||2.4)*0.98,dir=an==='end'?-1:1;ln('fine',x0,y0,x1,y1);ci('dark',x0,y0,0.45);ln('fine',x1,y1,x1+dir*L,y1);tx(x1+dir*0.6,y1-0.8,s,sz||2.4,an||'start');}
 // ---- 1. the whole city, 1/5000 --------------------------------------------------------------------------------------
 var CX=242,CY=298,RM=206,RW=194,RI=RW*Math.cos(PI/4)/Math.cos(PI/8);
 function star(ro,ri){var p=[];for(var k=0;k<16;k++)p.push(pol(CX,CY,k%2?ri:ro,-PI/2+k*PI/8));return p;}
 // moat: a ring of water lines, a bank line outside
 add('wash','M'+f2(CX-RM)+','+f2(CY)+'a'+RM+','+RM+' 0 1 0 '+(2*RM)+',0a'+RM+','+RM+' 0 1 0 '+(-2*RM)+',0Z'+'M'+f2(CX-RW)+','+f2(CY)+'a'+RW+','+RW+' 0 1 1 '+(2*RW)+',0a'+RW+','+RW+' 0 1 1 '+(-2*RW)+',0Z');
 ci('med',CX,CY,RM);ci('thin',CX,CY,RM+2.2);ci('thin',CX,CY,RW);
 for(var y=CY-RM+3;y<CY+RM-2;y+=3.4){var dy=y-CY,xo=Math.sqrt(RM*RM-dy*dy),xi=Math.abs(dy)<RW?Math.sqrt(RW*RW-dy*dy):0;
  [[-xo,-xi],[xi,xo]].forEach(function(iv){for(var x=iv[0]+1.5+((Math.round(y)*7)%5);x<iv[1]-3.5;x+=7.5)ln('water',CX+x,y,CX+x+3.2,y);});}
 // the star: two squares laid over each other, the wall as a band of poche
 var so=star(RW,RI),si=star(RW-5.2,RI-3.6).reverse();add('poche','M'+so.map(function(p){return f2(p[0])+','+f2(p[1]);}).join('L')+'Z M'+si.map(function(p){return f2(p[0])+','+f2(p[1]);}).join('L')+'Z');
 // sixteen streets from the centre: the eight to the towers carry canals, the eight to the gates run on to bridges over the moat
 for(var k=0;k<16;k++){(function(k){var a=-PI/2+k*PI/8,ca=Math.cos(a),sa=Math.sin(a),r1=k%2?RI-3:RW-8,r0=40,nx=-sa,ny=ca,w=k%2?1.5:2.1;
  [-1,1].forEach(function(sd){ln('thin',CX+ca*r0+nx*w*sd,CY+sa*r0+ny*w*sd,CX+ca*r1+nx*w*sd,CY+sa*r1+ny*w*sd);});
  if(k%2===0){pg('wash',[[CX+ca*r0+nx*0.8,CY+sa*r0+ny*0.8],[CX+ca*r1+nx*0.8,CY+sa*r1+ny*0.8],[CX+ca*r1-nx*0.8,CY+sa*r1-ny*0.8],[CX+ca*r0-nx*0.8,CY+sa*r0-ny*0.8]]);
   var tp=pol(CX,CY,RW-1.5,a);ci('poche',tp[0],tp[1],4.6);ci('paper',tp[0],tp[1],2.3);}             // a tower on each point of the star
  else{var gp=pol(CX,CY,RI-1.5,a);pg('poche',rot(gp[0],gp[1],a,[[-4,-4],[4,-4],[4,4],[-4,4]]));ln('paper',gp[0]-ca*4.2,gp[1]-sa*4.2,gp[0]+ca*4.2,gp[1]+sa*4.2); // a gatehouse in each inner angle
   [-1,1].forEach(function(sd){ln('med',CX+ca*(RW-1)+nx*2.6*sd,CY+sa*(RW-1)+ny*2.6*sd,CX+ca*(RM+3)+nx*2.6*sd,CY+sa*(RM+3)+ny*2.6*sd);   // bridge, then the road out
    ln('fine',CX+ca*(RM+3)+nx*1.8*sd,CY+sa*(RM+3)+ny*1.8*sd,CX+ca*218+nx*1.8*sd,CY+sa*218+ny*1.8*sd);});
   ln('thin',gp[0],gp[1],CX+ca*(RW-2),CY+sa*(RW-2));}})(k);}
 // ring road at the midpoints with sixteen squares: parish churches on the gate streets, markets on the canal streets
 var RR=88;ci('thin',CX,CY,RR-1.6);ci('thin',CX,CY,RR+1.6);
 for(var k2=0;k2<16;k2++){var a2=-PI/2+k2*PI/8,q=pol(CX,CY,RR,a2);pg('paper',rot(q[0],q[1],a2,[[-4.6,-4.6],[4.6,-4.6],[4.6,4.6],[-4.6,4.6]]));
  if(k2%2){pg('poche',rot(q[0],q[1],a2,[[-2.6,-0.7],[2.6,-0.7],[2.6,0.7],[-2.6,0.7]]));pg('poche',rot(q[0],q[1],a2,[[-0.7,-1.8],[0.7,-1.8],[0.7,1.8],[-0.7,1.8]]));}
  else{pg('fine',rot(q[0],q[1],a2,[[-2.8,-2.8],[2.8,2.8]]),true);pg('fine',rot(q[0],q[1],a2,[[-2.8,2.8],[2.8,-2.8]]),true);pg('fine',rot(q[0],q[1],a2,[[-2.8,-2.8],[2.8,-2.8],[2.8,2.8],[-2.8,2.8]]));}}
 // the fabric of the town: lanes on rings and between the streets; the points of the star kept as gardens
 [54,66,112,126,138].forEach(function(r){ci('hair',CX,CY,r);});
 for(var k3=0;k3<16;k3++){var a3=-PI/2+PI/16+k3*PI/8,c3=Math.cos(a3),s3=Math.sin(a3);ln('hair',CX+c3*46,CY+s3*46,CX+c3*(RR-6),CY+s3*(RR-6));ln('hair',CX+c3*(RR+6),CY+s3*(RR+6),CX+c3*(RI-7),CY+s3*(RI-7));}
 for(var k4=0;k4<64;k4++){var a4=-PI/2+PI/32+k4*PI/16;if(k4>=32)break;var c4=Math.cos(a4),s4=Math.sin(a4);ln('hair',CX+c4*112,CY+s4*112,CX+c4*126,CY+s4*126);ln('hair',CX+c4*54,CY+s4*54,CX+c4*66,CY+s4*66);}
 for(var k5=0;k5<8;k5++){var a5=-PI/2+k5*PI/4;for(var j=0;j<6;j++){var rr5=RI+5+j*6.5,hw=(RW-rr5)*Math.tan(PI/8)*0.55;if(hw<2.2)continue;var p5=pol(CX,CY,rr5,a5);
   [-1,1].forEach(function(sd){ci('fine',p5[0]-Math.sin(a5)*hw*sd,p5[1]+Math.cos(a5)*hw*sd,0.75);});}}
 // the civic centre: the great square between the prince's palace and the cathedral, the town-hall square north, the market south
 rc('wash2',CX-19,CY-9.5,38,19);rc('thin',CX-19,CY-9.5,38,19);for(var gx=CX-19+3.8;gx<CX+19;gx+=3.8)ln('hair',gx,CY-9.5,gx,CY+9.5);
 rc('poche',CX-35,CY-11,15,22);rc('paper',CX-31,CY-6,7,12);
 pg('poche',[[CX+20,CY-3.5],[CX+26,CY-3.5],[CX+26,CY-9.5],[CX+32,CY-9.5],[CX+32,CY-3.5],[CX+38,CY-3.5],[CX+38,CY+3.5],[CX+32,CY+3.5],[CX+32,CY+9.5],[CX+26,CY+9.5],[CX+26,CY+3.5],[CX+20,CY+3.5]]);ci('paper',CX+29,CY,2.4);
 rc('thin',CX-9,CY-22,18,11);rc('poche',CX-2.5,CY-18.5,5,4);rc('thin',CX-9,CY+11,18,11);rc('fine',CX-6,CY+14.5,12,4);
 // labels with leaders, kept clear of the busy middle
 leader(CX+29,CY-9.5,CX+50,CY-46,'大聖堂',2.6);leader(CX-28,CY-11,CX-50,CY-46,'君主の宮殿',2.6,'end');leader(CX,CY+19,CX+24,CY+44,'市場広場',2.4);leader(CX,CY-17,CX-14,CY-38,'市庁舎',2.4,'end');
 var tw=pol(CX,CY,RW-1.5,-PI/2+PI/4),gt=pol(CX,CY,RI-1.5,-PI/2+PI/8),cn=pol(CX,CY,152,0),ch=pol(CX,CY,RR,-PI/2+5*PI/8),mk2=pol(CX,CY,RR,PI/2+PI/4);
 leader(tw[0],tw[1],tw[0]+12,tw[1]-14,'塔',2.6);leader(gt[0],gt[1],gt[0]+10,gt[1]-34,'城門',2.6);leader(cn[0],cn[1],cn[0]+22,cn[1]+18,'運河',2.4);
 leader(ch[0],ch[1],ch[0]+18,ch[1]+40,'教区教会',2.4);leader(mk2[0],mk2[1],mk2[0]-16,mk2[1]+40,'市場',2.4,'end');
 var mo=pol(CX,CY,200,PI*0.8);leader(mo[0],mo[1],mo[0]-6,mo[1]+44,'水濠',2.4,'end');var ring=pol(CX,CY,RR+1.6,-PI*0.68);leader(ring[0],ring[1],ring[0]-30,ring[1]-58,'環状路',2.4,'end');
 // north point and a scale bar
 var nx0=44,ny0=48;ci('thin',nx0,ny0,6.5);pg('dark',[[nx0,ny0-6.5],[nx0+2.4,ny0+3.2],[nx0,ny0+1.6],[nx0-2.4,ny0+3.2]]);tx(nx0,ny0-8.4,'N',3,'middle',700);
 var sbx=40,sby=548;for(var i=0;i<5;i++){rc(i%2?'paper':'poche',sbx+i*20,sby,20,1.8);tx(sbx+i*20,sby-1.6,''+i*100,2,'middle');}tx(sbx+100,sby-1.6,'500m',2,'middle');
 caption(40,566,'全体配置図','S=1/5000');
 // ---- 2. the civic centre, 1/2000 ------------------------------------------------------------------------------------
 (function(){var cx=600,cy=128,f=2.5,X=function(v){return cx+v*f;},Y=function(v){return cy+v*f;};
  rc('wash2',X(-19),Y(-9.5),38*f,19*f);rc('med',X(-19),Y(-9.5),38*f,19*f);for(var i=1;i<19;i++)ln('hair',X(-19+i*2),Y(-9.5),X(-19+i*2),Y(9.5));for(var j=1;j<10;j++)ln('hair',X(-19),Y(-9.5+j*1.9),X(19),Y(-9.5+j*1.9));
  [[-9,-22,18,11],[-9,11,18,11]].forEach(function(r){rc('wash2',X(r[0]),Y(r[1]),r[2]*f,r[3]*f);rc('thin',X(r[0]),Y(r[1]),r[2]*f,r[3]*f);});
  // porticoes along the long sides of the great square
  [-1,1].forEach(function(sd){var yy=Y(sd*9.5)-sd*2.2;for(var x=X(-17);x<=X(17)+0.1;x+=3.4)rc('dark',x-0.5,yy-0.5,1,1);ln('fine',X(-19),yy-sd*0.0,X(19),yy);});
  // the prince's palace: two arcaded courts, the hall facing the square
  rc('poche',X(-35),Y(-11),15*f,22*f);rc('paper',X(-33.6),Y(-9.4),5.4*f,8*f);rc('paper',X(-33.6),Y(1.4),5.4*f,8*f);rc('paper',X(-26.8),Y(-9.4),5.4*f,18.8*f);
  [[-33.6,-9.4],[-33.6,1.4]].forEach(function(c){for(var a=0;a<5;a++)for(var b=0;b<7;b++){if(a&&a<4&&b&&b<6)continue;rc('dark',X(c[0])+1.3+a*2.7-0.45,Y(c[1])+1.3+b*2.85-0.45,0.9,0.9);}});
  for(var r2=1;r2<6;r2++)ln('fine',X(-26.8)+0.8,Y(-9.4)+r2*7.83,X(-26.8)+5.4*f-0.8,Y(-9.4)+r2*7.83);
  // the cathedral: a centralised cross under a dome, towers in the four corners, an apse to the east, steps down to the square
  var cc=[X(29),cy];pg('poche',[[X(20),Y(-3.5)],[X(26),Y(-3.5)],[X(26),Y(-9.5)],[X(32),Y(-9.5)],[X(32),Y(-3.5)],[X(38),Y(-3.5)],[X(38),Y(3.5)],[X(32),Y(3.5)],[X(32),Y(9.5)],[X(26),Y(9.5)],[X(26),Y(3.5)],[X(20),Y(3.5)]]);
  pg('paper',[[X(21),Y(-2.5)],[X(27),Y(-2.5)],[X(27),Y(-8.5)],[X(31),Y(-8.5)],[X(31),Y(-2.5)],[X(37),Y(-2.5)],[X(37),Y(2.5)],[X(31),Y(2.5)],[X(31),Y(8.5)],[X(27),Y(8.5)],[X(27),Y(2.5)],[X(21),Y(2.5)]]);
  ci('thin',cc[0],cc[1],6.2);ci('dash',cc[0],cc[1],4.8);for(var k=0;k<8;k++){var a=k*PI/4;ln('fine',cc[0]+Math.cos(a)*1.4,cc[1]+Math.sin(a)*1.4,cc[0]+Math.cos(a)*6.2,cc[1]+Math.sin(a)*6.2);}
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(s){rc('poche',cc[0]+s[0]*7.5-2.4,cc[1]+s[1]*7.5-2.4,4.8,4.8);ci('paper',cc[0]+s[0]*7.5,cc[1]+s[1]*7.5,1.1);});
  add('poche','M'+f2(X(38))+','+f2(Y(-3))+'a'+f2(3*f)+','+f2(3*f)+' 0 0 1 0,'+f2(6*f)+'Z');for(var st=0;st<3;st++)ln('thin',X(19.4)-st*1.1,Y(-4.5),X(19.4)-st*1.1,Y(4.5));
  // town hall with its tower; the market loggia and fountain
  rc('poche',X(-3.5),Y(-19.5),7*f,6*f);rc('paper',X(-2.3),Y(-18.3),4.6*f,3.6*f);rc('poche',X(2),Y(-21),3*f,3*f);
  rc('thin',X(-6),Y(13.6),12*f,4*f);for(var c2=0;c2<7;c2++){rc('dark',X(-6)+1+c2*4.83-0.45,Y(13.6)+0.8,0.9,0.9);rc('dark',X(-6)+1+c2*4.83-0.45,Y(17.6)-1.7,0.9,0.9);}ci('thin',cx,Y(20),2.6);ci('fine',cx,Y(20),1.2);
  // the edge of the civic quarter
  rc('dash',X(-38),Y(-25),76*f,50*f);
  tx(X(29),Y(13.4),'大聖堂',2.6,'middle',700);tx(X(-27.5),Y(14),'君主の宮殿',2.6,'middle',700);tx(cx,Y(-1.4),'主広場',3,'middle',700);tx(cx,Y(1.6),'(大聖堂広場)',2,'middle');
  tx(X(-10),Y(-16),'市庁舎広場',2.2,'end');tx(X(-10),Y(17.2),'市場広場',2.2,'end');tx(X(10),Y(21.4),'噴水',2,'start');tx(X(8),Y(16),'涼廊',2,'start');
  // section mark B-B' through the cathedral
  ln('chain',X(17),cy,X(42),cy);[[X(17),'B'],[X(42),"B'"]].forEach(function(e){ln('heavy',e[0],cy+0.1,e[0],cy-5);pg('dark',[[e[0],cy-5.8],[e[0]-1.1,cy-4.2],[e[0]+1.1,cy-4.2]]);tx(e[0],cy+3.6,e[1],2.6,'middle',700);});   // looking north
  caption(452,214,'中心部平面図','S=1/2000');})();
 // ---- 2b. the cathedral in section B-B', 1/1000: platform and steps, barrel-vaulted arms, crossing piers, drum, dome, lantern, apse
 (function(){var cx=600,gy=402,X=function(m){return cx+m;},Y=function(m){return gy-m;};
  ln('heavy',X(-66),Y(0),X(66),Y(0));for(var e=0;e<40;e++){var x=X(-66)+e*3.3;ln('fine',x,Y(0)+0.3,x-1.8,Y(0)+2.1);}
  pg('poche',[[X(-50),Y(0)],[X(54),Y(0)],[X(54),Y(3)],[X(-50),Y(3)]]);for(var st=0;st<5;st++)rc('thin',X(-58)+st*1.6,Y(0.6*(st+1)),X(-50)-X(-58)-st*1.6,0.6);
  // towers seen beyond, behind the cut
  [-1,1].forEach(function(sd){var tx0=X(sd*33);rc('fine',tx0-4,Y(50),8,47);pg('fine',[[tx0-4.6,Y(50)],[tx0,Y(57)],[tx0+4.6,Y(50)]],true);for(var b=0;b<3;b++)rc('fine',tx0-1,Y(42-b*9),2,3.6);});
  // walls, vaults and piers cut
  rc('poche',X(-45),Y(25),2.5,12);rc('poche',X(-15)-3,Y(25),3,22);rc('poche',X(15),Y(25),3,22);rc('poche',X(42.5),Y(25),2.5,5);
  [-1,1].forEach(function(sd){var a=sd<0?X(-45):X(15),b=sd<0?X(-15):X(45);rc('poche',a,Y(25),b-a,2.6);ln('thin',a,Y(22.4),b,Y(22.4));
   for(var i=0;i<3;i++){var cxp=a+(b-a)*(i+0.5)/3;add('thin','M'+(cxp-4.5)+','+Y(3)+'L'+(cxp-4.5)+','+Y(14)+'a4.5,4.5 0 0 1 9,0L'+(cxp+4.5)+','+Y(3));}});
  rc('paper',X(-45)-0.1,Y(14),2.7,11);add('thin','M'+X(-45)+','+Y(14)+'a1.25,1.25 0 0 1 2.5,0');
  // drum with windows, dome shell, lantern
  rc('poche',X(-15),Y(36),2.6,11);rc('poche',X(12.4),Y(36),2.6,11);[[-15,30.5],[12.4,30.5]].forEach(function(w){rc('paper',X(w[0])-0.1,Y(w[1]+2.2),2.8,4.4);});
  add('poche','M'+X(-15)+','+Y(36)+'a15,15 0 0 1 30,0L'+X(13.2)+','+Y(36)+'a13.2,13.2 0 0 0 -26.4,0Z');
  rc('poche',X(-2.6),Y(56.5),5.2,6);rc('paper',X(-1.4),Y(55.4),2.8,3.4);pg('poche',[[X(-3.4),Y(56.5)],[X(0),Y(60.5)],[X(3.4),Y(56.5)]]);ln('thin',X(0),Y(60.5),X(0),Y(63));ci('thin',X(0),Y(63.6),0.6);
  // the apse to the east: a half dome
  add('poche','M'+X(45)+','+Y(3)+'L'+X(45)+','+Y(20)+'a9,9 0 0 1 9,9L'+X(54)+','+Y(3)+'L'+X(52.4)+','+Y(3)+'L'+X(52.4)+','+Y(11)+'a7.4,7.4 0 0 0 -7.4,-7.4Z');
  ln('thin',X(42.5),Y(20),X(45),Y(20));
  // levels
  [[0,'GL ±0'],[25,'ヴォールト +25.0'],[51,'ドーム頂部 +51.0']].forEach(function(l){var y=Y(l[0]);ln('fine',X(-74),y,X(-67),y);pg('dark',[[X(-70.5),y],[X(-71.8),y-1.9],[X(-69.2),y-1.9]]);tx(X(-74)-0.8,y-0.6,l[1],2,'end');});
  tx(X(-30),Y(9),'身廊',2.2,'middle',500);tx(X(0),Y(9),'交差部',2.2,'middle',500);tx(X(0),Y(44),'ドーム',2.2,'middle',500);tx(X(30),Y(9),'内陣',2.2,'middle',500);
  caption(452,424,"大聖堂 B-B' 断面図",'S=1/1000');})();
 // ---- 3. wall and moat in section, a tower in elevation, 1/500 -------------------------------------------------------------
 (function(){var gy=476,f=2,X0=460,H=function(m){return gy-m*f;},Xm=function(m){return X0+m*f;};
  // the rampart and wall cut in poche, crenellated parapet; the moat with its water; ground hatching outside the cut
  pg('poche',[[Xm(70),H(0)],[Xm(73),H(15)],[Xm(73),H(17.5)],[Xm(74.5),H(17.5)],[Xm(74.5),H(16.2)],[Xm(76.3),H(16.2)],[Xm(76.3),H(17.5)],[Xm(77.8),H(17.5)],[Xm(77.8),H(14)],[Xm(84),H(14)],[Xm(90),H(4)],[Xm(96),H(0)],[Xm(96),H(-4)],[Xm(64),H(-6)],[Xm(70),H(0)]]);
  ln('heavy',Xm(-4),H(0),Xm(10),H(0));pg('heavy',[[Xm(10),H(0)],[Xm(16),H(-6)],[Xm(64),H(-6)]],true);ln('heavy',Xm(96),H(0),Xm(108),H(0));
  pg('wash',[[Xm(11.5),H(-1.5)],[Xm(68.5),H(-1.5)],[Xm(64),H(-6)],[Xm(16),H(-6)]]);ln('med',Xm(11.5),H(-1.5),Xm(68.5),H(-1.5));
  for(var w=0;w<10;w++)ln('water',Xm(18+w*4.6),H(-3)+((w%2)*1.2),Xm(20.4+w*4.6),H(-3)+((w%2)*1.2));
  for(var e=0;e<44;e++){var x=Xm(-4)+e*3.2;if(x>Xm(10)&&x<Xm(97))continue;if(x>Xm(108))break;ln('fine',x,H(0)+0.3,x-1.8,H(0)+2.1);}
  for(var e2=0;e2<16;e2++){var x2=Xm(16)+e2*3.2;ln('fine',x2,H(-6)+0.3,x2-1.8,H(-6)+2.1);}
  // the town inside: houses on the street behind the wall
  [[98,106,9]].forEach(function(h){rc('thin',Xm(h[0]),H(h[2]),(h[1]-h[0])*f,h[2]*f);pg('thin',[[Xm(h[0]),H(h[2])],[Xm((h[0]+h[1])/2),H(h[2]+3)],[Xm(h[1]),H(h[2])]],true);
   for(var wi=0;wi<2;wi++)rc('fine',Xm(h[0]+1.5+wi*((h[1]-h[0])-4)),H(h[2]-2.5),2,2.6);});
  // levels and dimensions
  [[0,'GL ±0'],[-1.5,'水面 −1.5'],[17.5,'城壁天端 +17.5']].forEach(function(l){var y=H(l[0]);ln('fine',Xm(-7),y,Xm(-1),y);pg('dark',[[Xm(-3.5),y],[Xm(-3.5)-1.3,y-1.9],[Xm(-3.5)+1.3,y-1.9]]);tx(Xm(-7)-0.8,y-0.6,l[1],2,'end');});
  var dy=H(-6)+9;ln('fine',Xm(10),dy,Xm(96),dy);[10,70,96].forEach(function(m){ln('fine',Xm(m),dy+1.2,Xm(m),H(-6)+2.5);ln('thin',Xm(m)-0.8,dy+0.8,Xm(m)+0.8,dy-0.8);});tx(Xm(40),dy-0.9,'60,000',2,'middle');tx(Xm(83),dy-0.9,'26,000',2,'middle');
  tx(Xm(40),H(4),'水濠',2.6,'middle',700);tx(Xm(84),H(7),'土塁・城壁',2.2,'middle',700);tx(Xm(102),H(13.5),'市街',2.4,'middle',700);
  caption(460,520,'城壁・水濠 断面図','S=1/500');
  // a tower on a point of the star: battered base, string course, machicolations, crenels, slit windows
  var tx0=716,tb=H(0),w0=12,w1=9,ht=68;
  pg('thin',[[tx0-w0,tb],[tx0+w0,tb],[tx0+w1,tb-16],[tx0-w1,tb-16]]);rc('thin',tx0-w1,tb-ht,w1*2,ht-16);ln('med',tx0-w1-0.6,tb-16,tx0+w1+0.6,tb-16);
  rc('thin',tx0-w1-2,tb-ht-6,(w1+2)*2,6);for(var m=0;m<9;m++){var mx=tx0-w1-1+m*((w1+1)*2)/8;ln('fine',mx,tb-ht,mx,tb-ht-3);}
  for(var cr=0;cr<5;cr++){var wcr=((w1+2)*2)/5;rc('thin',tx0-w1-2+cr*wcr+0.7,tb-ht-10,wcr-1.4,4);}
  [[0,-26],[0,-46],[-5,-36],[5,-36]].forEach(function(o){rc('poche',tx0+o[0]-0.7,tb+o[1]-2.4,1.4,3.6);});ln('heavy',tx0-w0-8,tb,tx0+w0+8,tb);
  for(var s=1;s<7;s++){var yy=tb-16-s*((ht-16)/7);ln('hair',tx0-w1,yy,tx0+w1,yy);}
  caption(690,544,'塔 立面図','S=1/500');})();
 // ---- legend ---------------------------------------------------------------------------------------------------------
 (function(){var x=380,y=500;tx(x,y,'凡例',2.8,'start',700);
  [['城壁',function(yy){rc('poche',x,yy-1.6,10,3.2);}],['道路',function(yy){ln('thin',x,yy-1.2,x+10,yy-1.2);ln('thin',x,yy+1.2,x+10,yy+1.2);}],
   ['運河',function(yy){rc('wash',x,yy-0.8,10,1.6);ln('thin',x,yy-1.6,x+10,yy-1.6);ln('thin',x,yy+1.6,x+10,yy+1.6);}],['教区教会',function(yy){rc('paper',x+1,yy-3,6,6);rc('poche',x+2.4,yy-0.6,3.2,1.2);rc('poche',x+3.4,yy-1.8,1.2,3.6);}],
   ['市場',function(yy){rc('fine',x+1.4,yy-2.6,5.2,5.2);ln('fine',x+1.4,yy-2.6,x+6.6,yy+2.6);ln('fine',x+1.4,yy+2.6,x+6.6,yy-2.6);}]].forEach(function(e,i){var yy=y+7+i*7;e[1](yy);tx(x+14,yy+1,e[0],2.3,'start');});})();
 // ---- frame and title strip -------------------------------------------------------------------------------------------
 rc('frame',20,20,801,554);ln('frame',748,20,748,574);
 (function(){var x0=748,x1=821,mid=(x0+x1)/2;[66,104,142,158,192,226,262].forEach(function(y){ln('tbH',x0,y,x1,y);});
  for(var i=0;i<6;i++)ln('tb',x0,28+i*6.2,x1,28+i*6.2);ln('tb',x0+12,20,x0+12,58);ln('tb',x0+32,20,x0+32,58);tx(x0+6,25.6,'記号',2,'middle');tx(x0+22,25.6,'日付',2,'middle');tx(x0+52,25.6,'内容',2,'middle');
  tx(x0+4,71,'計画名称',2,'start');tx(mid,84,'理想都市',4.4,'middle',700);tx(mid,95,'スフォルツィンダ',4.2,'middle',700);
  tx(x0+4,109,'図面名称',2,'start');tx(mid,120,'全体配置図・中心部平面図',2.7,'middle',700);tx(mid,128,'城壁断面図・塔立面図',2.7,'middle',700);tx(mid,136,'(復元試案)',2.3,'middle');
  tx(x0+4,147,'縮尺',2,'start');tx(x1-3,154,'1/5000・1/2000・1/500',2.6,'end',500);
  tx(x0+4,163,'原案',2,'start');tx(x1-3,172,'A. フィラレーテ',2.8,'end',500);tx(x1-3,180,'『建築論』1460–64頃',2.3,'end');tx(x1-3,187.5,'未実現の構想',2.3,'end');
  tx(x0+4,197,'日付',2,'start');tx(x1-3,206,'2026.11.19',2.8,'end',500);tx(x0+4,231,'図番',2,'start');tx(mid,253,'U-01',12,'middle',700);
  tx(x0+4,272,'備考',2,'start');var WS=[64,58,66,40,63,55,30,62,60,48,65,52];for(var j=0;j<34;j++)ln('greek',x0+4,280+j*7.6,x0+4+WS[j%WS.length],280+j*7.6);})();
 // write it out: washes under lines, poche, then text
 var order=['wash','wash2','hair','fine','water','chain','dash','thin','med','poche','paper','heavy','dark','greek','tb','tbH','frame'];
 order.forEach(function(k){if(!D[k])return;var s=ST[k],a={d:D[k].join(''),fill:s.f||'none'};if(s.s){a.stroke=s.s;a['stroke-width']=s.w;a['vector-effect']='non-scaling-stroke';a['stroke-linejoin']='round';}if(s.d)a['stroke-dasharray']=s.d;if(k==='poche'||k==='wash')a['fill-rule']='evenodd';mk('path',a,root);});
 var tg=mk('g',{'font-family':FONT,fill:DZ.ink},root);
 TX.forEach(function(t){var a={x:f2(t.x),y:f2(t.y),'font-size':t.sz,'text-anchor':t.an};if(t.wt!==400)a['font-weight']=t.wt;mk('text',a,tg).textContent=t.s;});}
// ---------- the drawing on the sub desk, drawn in plan on the desk top ----------
var defs=svg.querySelector('defs')||mk('defs',{},svg),SHCL=mk('clipPath',{id:'senSheetClip'},defs),SHCR=mk('rect',{},SHCL),SHG=mk('g',{},DB);PDB=pool(mk('g',{},DB));
var SHM='matrix('+[C*S,0.5*S,-C*S,0.5*S,OX,OY-(TOPZ+1)*S].map(function(x){return x.toFixed(5);}).join(' ')+')',SHDV=0;
(function(){SHG.setAttribute('transform',SHM);SHG.setAttribute('clip-path','url(#senSheetClip)');
 var u=SHEET.u0,v=SHEET.v0,w=SHEET.w,h=SHEET.h;
 function ln(x1,y1,x2,y2,wd,c){mk('path',{d:'M'+(u+x1)+','+(v+y1)+'L'+(u+x2)+','+(v+y2),fill:'none',stroke:c||COL.pen,'stroke-width':wd||0.5,'vector-effect':'non-scaling-stroke','stroke-linecap':'square'},SHG);}
 function rc(x,y,ww,hh,wd){ln(x,y,x+ww,y,wd);ln(x+ww,y,x+ww,y+hh,wd);ln(x+ww,y+hh,x,y+hh,wd);ln(x,y+hh,x,y,wd);}
 mk('rect',{x:u,y:v,width:w,height:h,fill:DZ.paper},SHG);
 // the drawing is laid out to be read from where she stands (the near long edge), so it turns a quarter on the desk
 sheetArt(mk('g',{transform:'matrix(0,1,-1,0,'+(u+h*0+w)+','+v+')'},SHG));})();
function drawDeskB(){var ext=prop.sheet,sp=prop.sheetSpan;
 // being unrolled: the part of the sheet that is out, lo..hi along the desk, slid by dv from where it will lie
 if(sp){var dv=Math.round(sp.dv*10)/10;if(dv!==SHDV){SHDV=dv;SHG.setAttribute('transform',SHM+(dv?' translate(0,'+dv+')':''));}
  SHG.style.display=sp.hi-sp.lo>1?'':'none';SHCR.setAttribute('x',SHEET.u0-2);SHCR.setAttribute('y',(sp.lo-dv).toFixed(1));SHCR.setAttribute('width',SHEET.w+4);SHCR.setAttribute('height',Math.max(0,sp.hi-sp.lo).toFixed(1));}
 else{if(SHDV){SHDV=0;SHG.setAttribute('transform',SHM);}SHG.style.display=ext>1?'':'none';}
 if(!sp&&ext>1){SHCR.setAttribute('x',SHEET.u0-2);SHCR.setAttribute('y',(prop.sheetHi?SHEET.v0+SHEET.h-ext-2:SHEET.v0-2).toFixed(1));SHCR.setAttribute('width',SHEET.w+4);SHCR.setAttribute('height',(ext+2).toFixed(1));}
 pb(PDB);if(prop.roll==='desk'&&prop.rollPose)drawRoll(PDB,prop.rollPose);pe(PDB);
 if(LIGHT&&LIGHT.sheet){LIGHT.sheet.setAttribute('transform',SHG.getAttribute('transform')||'');if(LIGHT.sheet.style.display!==SHG.style.display)LIGHT.sheet.style.display=SHG.style.display;}}
// a roll of drawings: paper side, the near end with its spiral
function drawRoll(p,rp,half){var ax=N(rp.ax),hl=rp.len/2,r=rp.r,e0=Sb(rp.c,M(ax,hl)),e1=A(rp.c,M(ax,hl));if(half>0)e0=Sb(rp.c,M(ax,6));else if(half<0)e1=A(rp.c,M(ax,6));
 var pz=X(ax,UP);pz=L(pz)<0.1?[1,0,0]:N(pz);var py=N(X(ax,pz)),r0=ring(e0,py,pz,r,r,16),r1=ring(e1,py,pz,r,r,16);
 pa(p,hullW(r0.concat(r1)),'#e6e9ee');var near=D(ax,V3)>0,endc=near?e1:e0;if((half>0&&!near)||(half<0&&near)){return;}pa(p,pd((near?r1:r0).map(W)),'#d6dbe4');
 var sp=[];for(var i=0;i<=30;i++){var t=i/30,rr=r*(0.15+0.8*t),an=t*Math.PI*5;sp.push(W(A(endc,A(M(py,rr*Math.cos(an)),M(pz,rr*Math.sin(an))))));}pa(p,pl(sp),null,'#c3bfb3',0.45);}
// ---------- body ----------
function body(){var f=[Math.cos(me.yaw),Math.sin(me.yaw),0],r=[f[1],-f[0],0],k=me.sitK,w=me.w*(1-k),q=me.qa%1,t=vt/1000;
 var bob=w*7*-Math.cos(4*Math.PI*(q-0.05)),sway=w*11*Math.cos(2*Math.PI*(q-0.3))+(1-me.w)*(1-k)*5*Math.sin(t*0.42)+me.sway;
 // sitting, the hips go back a little ahead of going down, as they do when you lower yourself onto a seat
 var kb=me.standUp?k*k:1-(1-k)*(1-k),kd=k*k*(3-2*k);   // getting up the hips come forward first, sitting down they go back first
 var pel=A([me.F[0],me.F[1],0],A(M(f,-420*kb),A(M(r,sway+(me.wsh||0)*(1-k)),[0,0,800-255*kd+me.pelZ+bob+me.bounce-Math.abs(me.wsh||0)*0.12])));
 var lc=Math.cos(me.lean),ls=Math.sin(me.lean);
 function bp(x,y,z){return A(pel,A(M(f,x*lc+z*ls),A(M(r,y),[0,0,-x*ls+z*lc])));}
 return {f:f,r:r,pel:pel,bp:bp,k:k};}
var REACH={},IKS='',RELK={};function ik(sh,h,pole){var d=Sb(h,sh),dist=L(d),mx=LU+LF-3;if(dist>mx){if(cur&&dist-mx>12){var rk=cur.k+(cur.s&&cur.s.k?'/'+cur.s.k:'')+(IKS?'/'+IKS:''),o=REACH[rk]||(REACH[rk]={n:0,max:0});o.n++;if(dist-mx>o.max){o.max=Math.round(dist-mx);o.d=Sb(h,sh).map(Math.round);o.el=+((vt-T0)/1000).toFixed(2);}}h=A(sh,M(N(d),mx));d=Sb(h,sh);dist=mx;}
 var dir=N(d),x=(LU*LU-LF*LF+dist*dist)/(2*dist),hh=Math.sqrt(Math.max(0,LU*LU-x*x)),pp=N(Sb(pole,M(dir,D(pole,dir))));
 return {e:A(sh,A(M(dir,x),M(pp,hh))),h:h};}
// ---------- things she holds, posed from her body ----------
function tuckPose(b){return {c:b.bp(8,176,232),a:[M(b.f,142),M(b.r,11),[0,0,101]]};}
function lapDeskPose(u){return {c:[u,675,731],a:[[142,0,0],[0,0,11],[0,101,0]]};}
function lapPose(b,e,u){var t=tuckPose(b),dp=lapDeskPose(u);return {c:mix(t.c,dp.c,e),a:[0,1,2].map(function(i){var l0=L(t.a[i]),l1=L(dp.a[i]);return M(N(mix(N(t.a[i]),N(dp.a[i]),e)),l0+(l1-l0)*e);})};}
function lapGrip(p,e){var g=[0.8-0.1*e,1.7,-0.95+1.85*e];return A(p.c,A(M(N(p.a[0]),142*g[0]),A(M(N(p.a[1]),11*g[1]+18*e),M(N(p.a[2]),101*g[2]))));}
// carried by its handle at her side: the cup in front of her hip, the handle pointing out and a little forward, fingers
// through it from the outside, forearm level and the elbow at her side. sg -1 left (as coded), +1 right
function mugHoldDir(b,sg){return N(A(M(b.r,sg),M(b.f,-0.15)));}
function mugCarry(b,sg){sg=sg||-1;return b.bp(220,sg*170,175);}
function mugBase(b,sg){sg=sg||-1;return Sb(mugCarry(b,sg),A(M(mugHoldDir(b,sg),60),[0,0,52]));}
function bookRead(b){var sp=b.bp(255,0,420),bu=N(A(M(UP,0.82),M(b.f,0.57)));return {sp:sp,bu:bu,c:A(sp,M(b.f,-70)),hu:bu,wd:b.f};}
function wing(b,sg,a){return A(M(b.r,140*sg*Math.sin(a)),M(b.f,-140*Math.cos(a)));}
// a hand under each half of the open book: the fingers spread on the back of the cover (so a little out from the board,
// on its outer side), the thumb over onto the page
function bookHold(b,sg){var rp=bookRead(b),sb=Sb(rp.sp,M(rp.bu,105)),wv=wing(b,sg,prop.spread*0.95),nin=N(X(rp.bu,wv));if(D(nin,M(b.r,-sg))<0)nin=M(nin,-1);
 return A(sb,A(A(M(wv,0.84),M(rp.bu,30)),M(nin,-24*prop.spread)));}
function elbowsIn(b,sg){return N(A(A(M(b.f,-0.4),M(b.r,0.3*sg)),[0,0,-1]));}
function stackCarry(b){return b.bp(215,0,215);}           // a pile hugged against her front
// tucked up in the armpit, pointing forward and a little down; the upper arm hangs close over it and the hand holds the front end
// carried in the right hand at her side: the fist round the middle of the roll, the roll lying fore and aft, front a touch up
function rollSg(){return prop.rollSide==='L'?-1:1;}
// the fist goes round it near its middle, a little behind, so it hangs balanced and its back end stays clear of what she
// passes: fore and aft, the front a touch up as a hanging fist holds a stick; lifted, it comes level
var ROLLG=-35;
// her hand on it: hanging a little out from the skirt; to lift it she brings the arm forward from the shoulder as well as
// bending the elbow, so the upper arm stays down by her side instead of winging out behind
function rollHand(b,sg,lift){var k=cl(lift/100,0,1);return A(hang(b,sg),A(A(M(b.r,(60-22*k)*sg),M(b.f,175*k)),[0,0,16+lift]));}
function rollTuck(b,lift){lift=lift===undefined?(me.rollLift||0):lift;var sg=rollSg(),h=rollHand(b,sg,lift),ax=N(A(b.f,[0,0,0.26*(1-cl(lift/95,0,1))+0.03]));return {c:A(h,M(ax,-ROLLG)),ax:ax,len:594,r:32};}
function rollPath(t,d,e){var z0=t.c[2],zu=Math.max(z0,TOPZ+d.r+40),a=sm(ph(e,0,0.3)),hz=sm(ph(e,0.04,0.8)),hv=sm(ph(e,0.3,0.85)),dn=sm(ph(e,0.5,1));
 var z=z0+(zu-z0)*a;z=z+(d.c[2]-z)*dn;var p=[t.c[0]+(d.c[0]-t.c[0])*hz,t.c[1]+(d.c[1]-t.c[1])*hv,z];   // out over the desk first, then in toward her once it is clear of her skirt
 var lv=N([t.ax[0],t.ax[1],0.04]),ax=N(mix(N(mix(t.ax,lv,sm(ph(e,0,0.4)))),d.ax,sm(ph(e,0.22,0.8))));
 return {c:p,ax:ax,len:594,r:t.r+(d.r-t.r)*sm(ph(e,0.6,1))};}
function rollDesk(v,r){return {c:[SHEET.u0+SHEET.w/2,v,TOPZ+r],ax:[1,0,0],len:594,r:r};}
function keys(sd,tap){return [LAPU+sd*70+6*Math.sin(vt/700+sd),640,748-tap];}
function rest(sd){return [LAPU+sd*92,755,746];}
function lidEdge(sd){return [LAPU+sd*110,573+200*Math.cos(prop.phi)+6,TOPZ+22+200*Math.sin(prop.phi)+8];}
function deskEdge(sd){return [LAPU+sd*175,798,726];}
// the cup tipped toward her with its near rim on her lower lip: tw 0..1 goes from top (resting) to the lips
function sipPose(b,restTop,restHd,tw,sg){var hc=b.bp(14,0,HZ),fh=[Math.cos(me.yaw+me.hYaw),Math.sin(me.yaw+me.hYaw),0],sideL=M(b.r,sg||-1);
 var th=0.3*sm(ph(tw,0.55,1)),upD=N(A(M([0,0,1],Math.cos(th)),M(fh,-Math.sin(th)))),fhp=N(Sb(fh,M(upD,D(fh,upD))));
 var mouth=A(hc,A(M(fh,94),[0,0,-90])),drinkTop=A(mouth,A(M(fhp,44),M(upD,2)));
 var up=N(mix([0,0,1],upD,tw)),top=mix(restTop,drinkTop,sm(tw)),hd=N(mix(restHd,N(A(sideL,M(fh,0.25))),tw)),base=Sb(top,M(up,96));
 hd=N(Sb(hd,M(up,D(hd,up))));return {base:base,up:up,hd:hd,grip:A(base,A(M(hd,62),M(up,52))),fing:N(A(M(hd,-1),M(up,-0.2)))};}
function mouthMug(b){var hc=b.bp(14,0,HZ),fh=[Math.cos(me.yaw+me.hYaw),Math.sin(me.yaw+me.hYaw),0];return A(A(hc,A(M(fh,140),[0,0,-150])),HANDLE);}
function thigh(b,sg){return A(b.pel,A(M(b.f,170+120*b.k),A(M(b.r,sg*98),[0,0,60+60*(1-b.k)])));}
function hang(b,sg){var shp=b.bp(0,sg*SHW,SHZ);return A(A(shp,[0,0,-(LU+LF-14)]),M(b.r,sg*40));}
// hands never go into a desk: a hand meant for the top rests on it (not in it), and a hand coming from below the top
// rises beside the desk before it moves in over it; leaving, it moves out at that height before it drops
var DESKS=[[450,1850,0,800,698,720],[1950,2650,400,1850,695,720]];
function deskSafe(tp,cur){for(var i=0;i<2;i++){var d=DESKS[i],inT=tp[0]>d[0]&&tp[0]<d[1]&&tp[1]>d[2]&&tp[1]<d[3],inC=cur[0]>d[0]-30&&cur[0]<d[1]+30&&cur[1]>d[2]-30&&cur[1]<d[3]+30,top=d[5]+24;
  if(inT&&tp[2]>d[4]-90&&tp[2]<top)tp=[tp[0],tp[1],top];
  var inF=cur[0]>d[0]-4&&cur[0]<d[1]+4&&cur[1]>d[2]-4&&cur[1]<d[3]+4;
  if(inT&&tp[2]>=top-1&&!inF&&cur[2]<top-4)return [cur[0],cur[1],top+16];
  if(!inT&&tp[2]<top&&inC&&cur[2]>d[4]-20&&cur[2]<top+60&&(cur[0]>d[0]&&cur[0]<d[1]&&cur[1]>d[2]&&cur[1]<d[3]))return [tp[0],tp[1],Math.max(cur[2],top+16)];}
 return tp;}
// a hand just swinging at her side is kept clear of a desk edge she walks past, pushed out to the side, never up onto it
function deskOut(tp){for(var i=0;i<2;i++){var d=DESKS[i];if(tp[0]>d[0]-25&&tp[0]<d[1]+25&&tp[1]>d[2]-25&&tp[1]<d[3]+25&&tp[2]>d[4]-90&&tp[2]<d[5]+30){
  var o=[[tp[0]-(d[0]-25),0,d[0]-25],[(d[1]+25)-tp[0],0,d[1]+25],[tp[1]-(d[2]-25),1,d[2]-25],[(d[3]+25)-tp[1],1,d[3]+25]].sort(function(a,b){return a[0]-b[0];})[0];
  tp=tp.slice();tp[o[1]]=o[2];}}return tp;}
function H(p,o){o=o||{};o.p=p;return o;}
// ---------- drawing one frame ----------
// ---------- a day going by outside: the app opens in the morning; one day takes 12 minutes ----------
// the sky behind the glass moves through dawn, a soft day blue, sunset and night; the sun comes in low and warm in the
// morning (the windows face east-south-east), its patches on the floor shortening and sliding as it climbs and leaving by early afternoon
var SUNG=$i('sunG'),SKY=svg.querySelectorAll('#skyG stop'),PANES=JSON.parse(SUNG.getAttribute('data-panes')),ROOM=JSON.parse(SUNG.getAttribute('data-room'));
var SKYK=[[0,['#1e2737','#29354b','#3d4a60']],[4.8,['#1e2737','#29354b','#3d4a60']],[5.8,['#5c6884','#a99aa3','#e3bfa6']],[6.8,['#a3b3c3','#cbd0d5','#ede4d6']],
 [8.5,['#aebdca','#cdd7de','#ecefec']],[12,['#a5b8c9','#c7d3dc','#e7ecee']],[14.5,['#aabbca','#cad4db','#eaeceb']],[16,['#b0bcc7','#d0d6d9','#eee9e0']],[17.6,['#9a9fb8','#d0b4a8','#efcfae']],
 [18.6,['#5f6684','#9a8a98','#c99d8d']],[19.6,['#2a3349','#3a455d','#566178']],[24,['#1e2737','#29354b','#3d4a60']]];
function hx(c){return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
function hmix(a,b,k){var x=hx(a),y=hx(b);return 'rgb('+x.map(function(v,i){return Math.round(v+(y[i]-v)*k);}).join(',')+')';}
// ---------- time, sun, moon and weather: Yokohama, now ----------
// The room keeps Japan's clock and the real sky over Yokohama: the sun's height and bearing for today's date (so
// sunrise, sunset and how deep the light reaches into the room follow the seasons), the moon's phase, and the weather
// reported for the city right now. URL options to look at other times: ?at=18:30 (start at that time today and run on),
// ?date=2026-06-21, ?fast (a whole day in 12 minutes), ?weather=clear|cloudy|overcast|rain|snow|storm|fog
var QP=(function(){try{return new URLSearchParams(window.__QP||location.search);}catch(e){return {get:function(){return null;}};}})();
// the room: Kanagawa University, Yokohama campus, building 8; its windows look out east-south-east (the face along
// the lane to building 1 runs about 13° east of north, so the window faces a bearing of about 103°)
var WFACE=103,LAT=35.4437,LON=139.638,RAD=Math.PI/180,T_START=Date.now(),T_OFF=0,T_FAST=QP.get('fast')!==null,T_FIX=null;
(function(){var at=QP.get('at'),dt0=QP.get('date'),now=new Date(Date.now()+9*3600e3),y=now.getUTCFullYear(),mo=now.getUTCMonth(),d=now.getUTCDate(),hh=now.getUTCHours(),mi=now.getUTCMinutes(),ss=now.getUTCSeconds();
 if(dt0&&/^\d{4}-\d{2}-\d{2}$/.test(dt0)){y=+dt0.slice(0,4);mo=+dt0.slice(5,7)-1;d=+dt0.slice(8,10);}
 if(at&&/^\d{1,2}:\d{2}$/.test(at)){hh=+at.split(':')[0];mi=+at.split(':')[1];ss=0;}else if(T_FAST){hh=7;mi=0;ss=0;}
 T_OFF=Date.UTC(y,mo,d,hh,mi,ss)-9*3600e3-Date.now();})();
// the moment shown, as UTC milliseconds: real time runs with the wall clock (in manual test runs, with the animation)
function nowMs(){var run=window.__senManual?vt:(Date.now()-T_START),sp=T_FAST?120:1;if(T_FIX!==null)return T_FIX+run*sp;return T_START+T_OFF+run*sp;}
function sunAt(ms){var dd=ms/864e5+2440587.5-2451545,g=(357.529+0.98560028*dd)*RAD,q=280.459+0.98564736*dd,L=(q+1.915*Math.sin(g)+0.02*Math.sin(2*g))*RAD,e=(23.439-0.00000036*dd)*RAD;
 var ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L)),dec=Math.asin(Math.sin(e)*Math.sin(L)),gmst=(18.697374558+24.06570982441908*dd)%24,ha=((gmst*15+LON)*RAD-ra);return {dec:dec,ha:ha};}
function altAz(ha,dec){var la=LAT*RAD,el=Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(ha)),az=Math.atan2(-Math.sin(ha),Math.tan(dec)*Math.cos(la)-Math.sin(la)*Math.cos(ha));
 return {el:el/RAD,az:((az/RAD)+360)%360};}
// the moon roughly: its phase from a known new moon; it keeps the sun's path shifted back by the phase, and its
// height swings opposite to the sun's through the month (a full moon in winter rides high)
function moonAt(ms){var p=(((ms-Date.UTC(2000,0,6,18,14))/864e5)/29.530588853)%1;if(p<0)p+=1;var s=sunAt(ms),a=altAz(s.ha-p*2*Math.PI,s.dec*Math.cos(2*Math.PI*p));a.phase=p;return a;}
var SKYNOW={el:0,az:90,am:true,noonEl:40,moon:{el:-10,az:0,phase:0},ms:0};
function skyNow(){var ms=nowMs(),s=sunAt(ms),a=altAz(s.ha,s.dec),noon=altAz(0,s.dec).el;SKYNOW={el:a.el,az:a.az,am:a.az<180,noonEl:noon,moon:moonAt(ms),ms:ms};return SKYNOW;}
// the sky's colours were drawn for a day by the clock; the sun's height now picks the place in that day (morning or
// evening by which side of south the sun is), so dawn and dusk come when they really do
function dayHour(){var S=skyNow(),e=S.el,n=Math.max(S.noonEl,26);
 function m(x,a,b,ha,hb){return ha+(hb-ha)*cl((x-a)/(b-a),0,1);}
 if(S.am){if(e<-14)return 4.8*cl((e+90)/76,0,1);if(e<-4)return m(e,-14,-4,4.8,5.8);if(e<6)return m(e,-4,6,5.8,6.8);if(e<25)return m(e,6,25,6.8,8.5);return m(e,25,n,8.5,12);}
 if(e>25)return m(e,n,25,12,16);if(e>4)return m(e,25,4,16,17.6);if(e>-4)return m(e,4,-4,17.6,18.6);if(e>-12)return m(e,-4,-12,18.6,19.6);return m(e,-12,-60,19.6,24);}
// weather in Yokohama now, from Open-Meteo (no key; refreshed every 15 minutes). cover 0..100 %, rain/snow mm/h,
// wind m/s, kind clear|cloudy|overcast|rain|snow|storm|fog
var WX={cover:25,rain:0,snow:0,wind:3,kind:'clear',code:1,ok:false};
function wxKind(c,cov){return c>=95?'storm':(c>=71&&c<=77)||c===85||c===86?'snow':(c>=51&&c<=67)||(c>=80&&c<=82)?'rain':c===45||c===48?'fog':c===3||cov>85?'overcast':c===2||cov>40?'cloudy':'clear';}
(function(){var force=QP.get('weather');
 if(force){var P={clear:[5,1],cloudy:[60,2],overcast:[100,3],rain:[100,63],snow:[100,73],storm:[100,95],fog:[100,45]}[force]||[25,1];WX={cover:P[0],code:P[1],rain:force==='rain'?2.5:force==='storm'?6:0,snow:force==='snow'?1.5:0,wind:force==='storm'?9:3,kind:force,ok:true};return;}
 if(window.__senManual)return;
 function get(){try{fetch('https://api.open-meteo.com/v1/forecast?latitude='+LAT+'&longitude='+LON+'&current=weather_code,cloud_cover,temperature_2m,rain,showers,snowfall,wind_speed_10m&wind_speed_unit=ms&timezone=Asia%2FTokyo').then(function(r){return r.json();}).then(function(j){var c=j.current;if(!c)return;
   var k=wxKind(c.weather_code,c.cloud_cover);WXLIVE={cover:c.cloud_cover,code:c.weather_code,rain:Math.max((c.rain||0)+(c.showers||0),k==='rain'||k==='storm'?0.5:0),snow:Math.max((c.snowfall||0)*10,k==='snow'?0.5:0),wind:c.wind_speed_10m||0,temp:c.temperature_2m,kind:k,ok:true};if(!ENV.wx)WX=WXLIVE;lastDay=-1;if(typeof envShow==='function')envShow();}).catch(function(){});}catch(e){}}
 get();setInterval(get,15*60e3);})();
function clipRoom(poly){var U=ROOM[0]-8,V=ROOM[1]-8,edges=[[0,1,8],[0,-1,-U],[1,1,8],[1,-1,-V]];
 edges.forEach(function(e){var out=[];for(var i=0;i<poly.length;i++){var a=poly[i],b=poly[(i+1)%poly.length],da=e[1]*a[e[0]]-e[2],db=e[1]*b[e[0]]-e[2];
  if(da>=0)out.push(a);if((da>=0)!==(db>=0)){var k=da/(da-db);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]);}}poly=out;});return poly;}
var SUNW=mk('g',{'pointer-events':'none'});SUNG.parentNode.insertBefore(SUNW,SUNG.nextSibling);var swPool=pool(SUNW);
// the layers over the whole room are only as big as the drawing (a rect thousands of units wide costs a large mask
// image on some browsers every frame)
var VB0=svg.viewBox&&svg.viewBox.baseVal&&svg.viewBox.baseVal.width?svg.viewBox.baseVal:{x:0,y:0,width:924,height:1043},VBA={x:VB0.x-20,y:VB0.y-20,width:VB0.width+40,height:VB0.height+40};
var AMB=mk('rect',{x:VBA.x,y:VBA.y,width:VBA.width,height:VBA.height,fill:'#ffffff',opacity:0,'pointer-events':'none',style:'mix-blend-mode:multiply'});
(function(){var mkk=mk('mask',{id:'ambMask',maskUnits:'userSpaceOnUse',x:VBA.x,y:VBA.y,width:VBA.width,height:VBA.height},defs);roomSil(mkk,'#fff');   // only over the room itself, not the page around it
 [].forEach.call(svg.querySelectorAll('polygon[fill="url(#skyG)"]'),function(p){mk('polygon',{points:p.getAttribute('points'),fill:'#000'},mkk);});AMB.setAttribute('mask','url(#ambMask)');svg.appendChild(AMB);})();
var lastDay=-1,sunPool=pool(SUNG),SHEEN=[].slice.call(svg.querySelectorAll('.glassSheen'));
// where the sun falls it also casts: desks and the chair throw shadows into the patches (a mask cut from the patches,
// so outside the sun nothing changes); patches land on the desk tops too, under the things on them and over the drawing
var SMK=mk('mask',{id:'sunMask'},defs);   // (the mask's region is the patches' own box, so a change in it redraws only around them)
mk('rect',{x:-200,y:-200,width:1400,height:1500,fill:'#fff'},SMK);
var smPool=pool(mk('g',{},SMK));SUNG.setAttribute('mask','url(#sunMask)');
var SUNA=mk('g',{'pointer-events':'none'});DA.insertBefore(SUNA,DA.firstChild);var saPool=pool(SUNA);
var SUNB=mk('g',{'pointer-events':'none'});var sbPool=pool(SUNB);
var DESKA=[450,1850,0,800],DESKB=[1950,2650,400,1850],SHA=$i('shadA'),SHB=$i('shadB');
function clipRect(poly,r){var c=[[0,1,r[0]],[0,-1,-r[1]],[1,1,r[2]],[1,-1,-r[3]]];c.forEach(function(e){var out=[];for(var i=0;i<poly.length;i++){var a=poly[i],b=poly[(i+1)%poly.length],da=e[1]*a[e[0]]-e[2],db=e[1]*b[e[0]]-e[2];
  if(da>=0)out.push(a);if((da>=0)!==(db>=0)){var k=da/(da-db);out.push([a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k]);}}poly=out;});return poly;}
function hull2(p){return hull(p);}
function drawDay(force){if(!SUNB.parentNode&&PDB)DB.insertBefore(SUNB,PDB.g);var h=dayHour();if(!force&&Math.abs(h-lastDay)<0.004&&(me.away||me.op<0.3))return;lastDay=h;
 for(var i=0;i+1<SKYK.length;i++)if(h>=SKYK[i][0]&&h<=SKYK[i+1][0]){var k=(h-SKYK[i][0])/(SKYK[i+1][0]-SKYK[i][0]),k2=k*k*(3-2*k);
  var gy=WX.kind==='overcast'||WX.kind==='rain'||WX.kind==='snow'||WX.kind==='storm'||WX.kind==='fog'?(WX.kind==='fog'?0.85:WX.kind==='storm'?0.8:0.78):WX.kind==='cloudy'?0.2:0;
  for(var j=0;j<3&&j<SKY.length;j++){var c0=hmix(SKYK[i][1][j],SKYK[i+1][1][j],k2);if(gy){var rgb=c0.match(/\d+/g).map(Number),lum=Math.round(rgb[0]*0.3+rgb[1]*0.55+rgb[2]*0.15),gc='#'+[lum,lum+3,lum+8].map(function(x){return ('0'+Math.min(255,x).toString(16)).slice(-2);}).join('');
    var c1='#'+rgb.map(function(x){return ('0'+x.toString(16)).slice(-2);}).join('');c0=hmix(c1,gc,gy);}SKY[j].setAttribute('stop-color',c0);}break;}
 // at night the panes turn to mirrors of the lit room: the sheen comes up as the sky goes dark
 var night=Math.max(1-sm(ph(h,4.8,6.8)),sm(ph(h,17.8,19.6)));
 var bias=140-100*night,o0=W([0,0,0]),o1=W([bias-140,0,0]);[SHA,SHB].forEach(function(g){if(g){g.setAttribute('transform','translate('+(o1[0]-o0[0]).toFixed(2)+','+(o1[1]-o0[1]).toFixed(2)+')');g.setAttribute('opacity',(1-0.25*night).toFixed(3));}});SHEEN.forEach(function(g){g.setAttribute('opacity',(0.22+0.23*night).toFixed(3));});
 // sun: up at 6, down at 18.5; it comes in through the east windows from sunrise until about one o'clock
 // the real sun: the windows face east-south-east (bearing WFACE), so the bearing off that is the angle the light comes in at (south is +v, and
 // light from the south-east travels toward the north)
 var el=SKYNOW.el*RAD,az=(WFACE-SKYNOW.az)*RAD,clr=WX.kind==='clear'?1:WX.kind==='cloudy'?0.6:0.05;
 var inten=sm(ph(el,0.02,0.2))*(1-sm(ph(az,1.05,1.38)))*(az>-1.3?1:0)*clr;
 pb(sunPool);pb(swPool);if(inten>0.06){var kh=1/Math.tan(Math.max(el,0.08)),du=Math.cos(az)*kh,dv=Math.sin(az)*kh,warm=1-sm(ph(el,0.12,0.6));
  // sunlight multiplies what it falls on: each surface comes up by the same factor in its own colour (a white wall
  // stays white, the pale floor goes golden, the black desk only to a dark warm grey). A colour-dodge layer of colour b
  // gives base/(1-b), so b=1-1/factor
  var fk=[0.52,0.48,0.40-0.1*warm].map(function(k){return 1+k*inten;}),cold='rgb('+fk.map(function(f){return Math.round(255*(1-1/f));}).join(',')+')';if(LIGHT){pb(LIGHT.pS);pb(LIGHT.pA);pb(LIGHT.pB);}pb(saPool);pb(sbPool);
  PANES.forEach(function(p){var q=[[p[0],p[2]],[p[1],p[2]],[p[1],p[3]],[p[0],p[3]]].map(function(x){return [x[1]*du,x[0]+x[1]*dv];}),c=clipRoom(q);   // (the floor patch may lie outside the room while the light still lands on the desks and the side wall)
   if(c.length>2){var cpts=c.map(function(x){return W([x[0],x[1],0]);});pa(sunPool,pd(cpts),cold);if(LIGHT)pa(LIGHT.pS,pd(cpts),'rgba(0,0,0,'+(0.95*inten).toFixed(3)+')');}
   // the same window's light at desk-top height, on each desk top it reaches
   [[DESKA,saPool,'pA'],[DESKB,sbPool,'pB']].forEach(function(dk){var dd=[[p[0],p[2]],[p[1],p[2]],[p[1],p[3]],[p[0],p[3]]].map(function(x){var h2=x[1]-TOPZ;return [h2*du,x[0]+h2*dv];}),dc=clipRect(dd,dk[0]);
    if(dc.length>2){var dp=pd(dc.map(function(x){return W([x[0],x[1],TOPZ+1]);}));pa(dk[1],dp,cold);if(LIGHT)pa(LIGHT[dk[2]],dp,'rgba(0,0,0,'+(0.95*inten).toFixed(3)+')');}});
   // the rest of that window's light, coming in toward the south, lands on the side wall before it reaches the floor
   if(dv<-0.02){var wq=[[p[0],p[2]],[p[1],p[2]],[p[1],p[3]],[p[0],p[3]]].map(function(x){var d=-x[0]/dv;return [d*du,x[1]-d];}),wc=clipRect(wq,[8,ROOM[0]-8,0,2890]);
    if(wc.length>2){var wp2=pd(wc.map(function(x){return W([x[0],0,x[1]]);}));pa(swPool,wp2,cold);if(LIGHT)pa(LIGHT.pS,wp2,'rgba(0,0,0,'+(0.95*inten).toFixed(3)+')');}}});  // shadows cast into the light: each desk top and the chair, flattened onto the floor along the sun
  SUNV={on:true,du:du,dv:dv,inten:inten};
  // how far the sun is on her, the plant by the window and the chair
  if(LIGHT){var bb2=body(),pl=bb2.pel,ld=function(pts){var n=0;pts.forEach(function(P){n+=sunLit(P,du,dv);});return n/pts.length;};
   var Lh=me.away?0:ld([[pl[0],pl[1],pl[2]-300],pl,A(pl,[0,0,300]),A(pl,[0,0,560]),A(pl,[0,0,700])]),Lp=ld([[330,2660,500],[330,2660,900],[330,2660,1300],[230,2560,1100],[430,2760,1100]]),Lc=ld([cw(0,0,480),cw(230,0,800),cw(0,240,660),cw(0,-240,660)]);
   LIGHT.lit.her+=(Lh-LIGHT.lit.her)*0.35;LIGHT.lit.plant=Lp;LIGHT.lit.chair=Lc;}
 }else{SUNV={on:false};pb(saPool);pb(sbPool);if(LIGHT){pb(LIGHT.pS);pb(LIGHT.pA);pb(LIGHT.pB);}}
 pe(saPool);pe(sbPool);if(LIGHT){pe(LIGHT.pS);pe(LIGHT.pA);pe(LIGHT.pB);
  // the shade over everything the sun is not on: deeper the stronger the sun, a little cool (the sky's light)
  var shOn=inten>0.06;LIGHT.SHD.style.display=shOn?'':'none';LIGHT.live(shOn);if(shOn){LIGHT.SHD.setAttribute('fill',hexOf2(hmix('#ffffff','#dcdfe6',Math.min(1,inten))));
   [['her','her'],['plant','plant'],['chair','chair']].forEach(function(k){var g=(1-0.92*LIGHT.lit[k[0]]).toFixed(3);LIGHT.F[k[1]].setAttribute('values','0 0 0 0 '+g+' 0 0 0 0 '+g+' 0 0 0 0 '+g+' 0 0 0 1 0');});}}
 pe(sunPool);pe(swPool);
 // the light in the room as a whole: the hour, the weather and the lamps colour everything in it a little. Night: the
 // ceiling lights, a touch warmer and dimmer than day; dusk and dawn: amber from the low sky; morning sun: warm;
 // a grey day: cooler and flatter. One flat multiply over the room (the sky through the glass stays as it is)
 var nt=Math.max(1-sm(ph(h,4.9,6.6)),sm(ph(h,17.8,19.6))),tw=Math.max(sm(ph(h,5.6,6.6))*(1-sm(ph(h,6.8,8.2))),sm(ph(h,16,17.4))*(1-sm(ph(h,18.4,19.4)))),
  gry=(WX.kind==='overcast'||WX.kind==='rain'||WX.kind==='snow'||WX.kind==='storm'||WX.kind==='fog')?1:WX.kind==='cloudy'?0.4:0,dayK=1-nt;
 var tc='#ffffff',ta=0;if(nt>0){tc=hmix('#ffffff','#efe3cf',1);ta=0.3*nt;}
 if(tw>0){tc=hexOf2(hmix(tc.charAt(0)==='#'?tc:'#ffffff','#f3c79a',tw/(tw+nt+0.001)));ta=Math.max(ta,0.2*tw);}
 if(gry>0&&dayK>0){tc=hexOf2(hmix(tc.charAt(0)==='#'?tc:'#ffffff','#d3d9df',gry*dayK*0.8));ta=Math.max(ta,0.3*gry*dayK);}
 // while the sun is in the room the shade layer carries this tint as well (one layer over the room instead of two)
 if(LIGHT&&LIGHT.SHD.style.display!=='none'){var a1=hx(hexOf2(tc)),s1=hx(LIGHT.SHD.getAttribute('fill')),m1=s1.map(function(v,i){return Math.round(v*(255-ta*(255-a1[i]))/255);});
  LIGHT.SHD.setAttribute('fill','#'+m1.map(function(v){return ('0'+v.toString(16)).slice(-2);}).join(''));AMB.style.display='none';}
 else{AMB.style.display='';AMB.setAttribute('fill',tc);AMB.setAttribute('opacity',ta.toFixed(3));}}
function hexOf2(c){var m=c.match(/\d+/g);return m&&c.charAt(0)!=='#'?'#'+m.slice(0,3).map(function(x){return ('0'+(+x).toString(16)).slice(-2);}).join(''):c;}
// ---------- the view out of the window: a town under the sky, painted on the plane of the glass ----------
// low roofs and a few taller blocks, trees in the foreground; clouds drift over; the sun comes up out of the town in
// the morning (the windows face east-south-east), the moon rises in the evening, lights come on in the windows at dusk and go
// off one by one through the night. Drawn once into <defs> and shown through each pane, under the glass's sheen.
// ---------- light as it falls on each thing ----------
// With the sun in the room, everything it does not reach is in shade: a cool multiply over the room, cut away where the
// sun lands. The cut-away (a mask) is drawn in the same order as the scene, so a thing standing in front of a sunlit
// patch keeps its own shade: the walls and floor first with their patches, then each desk with the patch on its top,
// then the things on and around them, the chair, the plant and her; things the sun reaches (her standing in it, the
// plant by the window, the chair) are cut away as far as the sun is on them. Where the light lands it lifts each surface
// in its own colour (a warm multiply over white wall, pale floor, black or white desk top alike), so a white wall in the
// sun stays white and a black desk top only turns a dark warm grey.
// the room as seen: its floor and its two standing walls with their thickness (the near walls are cut away)
function roomSil(parent,fill){var U2=ROOM[0],V2=ROOM[1],T=124,H2=2900;[[[-T,-T,0],[U2,-T,0],[U2,V2,0],[-T,V2,0]],[[-T,-T,0],[-T,V2,0],[-T,V2,H2],[-T,-T,H2]],[[-T,-T,0],[U2,-T,0],[U2,-T,H2],[-T,-T,H2]],
  [[-T,V2,0],[0,V2,0],[0,V2,H2],[-T,V2,H2]],[[U2,-T,0],[U2,0,0],[U2,0,H2],[U2,-T,H2]],[[-T,-T,H2],[U2,-T,H2],[U2,0,H2],[0,0,H2],[0,V2,H2],[-T,V2,H2]]].forEach(function(q){mk('path',{d:pd(q.map(W)),fill:fill},parent);});}
function wrapBetween(a,b,id){var g=mk('g',{id:id});a.parentNode.insertBefore(g,a.nextSibling);var n=g.nextSibling;while(n&&n!==b){var nx=n.nextSibling;g.appendChild(n);n=nx;}return g;}
var LIGHT=(function(){var ca=$i('chairShadow'),la=$i('laptop'),sb=$i('slotB'),dbp=$i('deskBProps');if(!ca||!la||!sb||!dbp)return null;
 wrapBetween(ca,la,'deskAStatic');wrapBetween(sb,dbp,'deskBStatic');la.parentNode.insertBefore(SUNA,la);SHG.id='senSheet';PDB.g.id='senDBProps';
 [SUNG,SUNW,SUNA,SUNB].forEach(function(g){g.style.mixBlendMode='color-dodge';});
 var LM=mk('mask',{id:'litMask',maskUnits:'userSpaceOnUse',x:VBA.x,y:VBA.y,width:VBA.width,height:VBA.height},defs);roomSil(LM,'#fff');[].forEach.call(svg.querySelectorAll('polygon[fill="url(#skyG)"]'),function(p){mk('polygon',{points:p.getAttribute('points'),fill:'#000'},LM);});
 function sil(id,g){var f=mk('filter',{id:id,x:'-10%',y:'-10%',width:'120%',height:'120%','color-interpolation-filters':'sRGB'},defs),m=mk('feColorMatrix',{type:'matrix',values:'0 0 0 0 '+g+' 0 0 0 0 '+g+' 0 0 0 0 '+g+' 0 0 0 1 0'},f);return m;}
 var XL='http://www.w3.org/1999/xlink',F={w:sil('silW',1),her:sil('silHer',1),plant:sil('silPlant',1),chair:sil('silChair',1)};
 // the desks' frames never move: their silhouettes are copied into the mask once, plain white, instead of being
 // re-filtered every frame
 function still(id){var src=$i(id),c=src.cloneNode(true);c.removeAttribute('id');[].forEach.call(c.querySelectorAll('*'),function(e){e.removeAttribute('id');if(e.getAttribute('fill')&&e.getAttribute('fill')!=='none')e.setAttribute('fill','#fff');if(e.getAttribute('stroke')&&e.getAttribute('stroke')!=='none')e.setAttribute('stroke','#fff');e.removeAttribute('opacity');e.removeAttribute('fill-opacity');e.removeAttribute('mask');e.removeAttribute('filter');});LM.appendChild(c);}
 // the copies are tied to their originals only while the shade is shown: otherwise every move she makes would have
 // the browser rebuild copies nobody sees
 var USES=[],live=true;function setLive(on){if(on===live)return;live=on;USES.forEach(function(u){var h=on?u._h:'#senNone';u.setAttribute('href',h);u.setAttributeNS(XL,'xlink:href',h);});}
 function use(id,fk){var u=document.createElementNS(NS,'use');u._h='#'+id;USES.push(u);u.setAttribute('href','#'+id);u.setAttributeNS(XL,'xlink:href','#'+id);u.setAttribute('filter','url(#'+(fk==='her'?'silHer':fk==='plant'?'silPlant':fk==='chair'?'silChair':'silW')+')');LM.appendChild(u);}
 var RC=mk('clipPath',{id:'roomClip'},defs);roomSil(RC,'#fff');var pS=pool(mk('g',{'clip-path':'url(#roomClip)'},LM)),pSh=pool(mk('g',{'clip-path':'url(#roomClip)'},LM));   // (shadows can reach past the floor's edge: kept to the room)
 still('deskAStatic');var pA=pool(mk('g',{},LM));
 use('laptop');use('mug');use('slotFront','her');use('chair','chair');use('chairUp','chair');use('slotB','her');still('deskBStatic');
 // the drawing on the sub desk only as its sheet of paper (its lines and lettering are no use in a mask)
 var pr=SHG.querySelector('rect'),SHS=mk('g',{'clip-path':'url(#senSheetClip)'},LM);mk('rect',{x:pr.getAttribute('x'),y:pr.getAttribute('y'),width:pr.getAttribute('width'),height:pr.getAttribute('height'),fill:'#fff'},SHS);
 var pB=pool(mk('g',{},LM));use('senDBProps');use('senOverB','her');use('senTop','her');   // (she, her low parts and the plant move between the slots: each slot once, in scene order)
 var SHD=mk('rect',{x:VBA.x,y:VBA.y,width:VBA.width,height:VBA.height,fill:'#ffffff','pointer-events':'none',mask:'url(#litMask)',style:'mix-blend-mode:multiply;display:none'});svg.appendChild(SHD);
 var lit={her:0,plant:0,chair:0};
 setLive(false);
 return {SHD:SHD,pS:pS,pSh:pSh,pA:pA,pB:pB,F:F,lit:lit,live:setLive,sheet:SHS};})();
// is a point in the sun? Back along the light toward the window it must come out through a pane
function sunLit(P,du,dv){if(du<0.02)return 0;var s=P[0]/du,qv=P[1]-s*dv,qz=P[2]+s;for(var i=0;i<PANES.length;i++){var p=PANES[i];if(qv>=p[0]&&qv<=p[1]&&qz>=p[2]&&qz<=p[3])return 1;}return 0;}

// ---------- shadows: whatever stands between the window and a sunlit surface casts onto it ----------
// Each frame, every solid in the scene (her body part by part, the chair, the desks and their legs, the laptop, mug,
// books and roll, the plant) is projected along the sunlight onto each surface the sun reaches: the floor, the side
// wall and the two desk tops. The shadows cut the light out of the patches and put the shade back in its place.
var SUNV={on:false,du:0,dv:0,inten:0};
var SHADOW=(function(){function m(id){var mm=mk('mask',{id:id},defs);mk('rect',{x:-200,y:-200,width:1400,height:1500,fill:'#fff'},mm);return mm;}
 var mW=m('sunMaskW'),mA=m('sunMaskA'),mB=m('sunMaskB');SUNW.setAttribute('mask','url(#sunMaskW)');SUNA.setAttribute('mask','url(#sunMaskA)');SUNB.setAttribute('mask','url(#sunMaskB)');
 function pair(cut,shadeAfter,soft){var a=mk('path',{fill:'#000'},cut),b=mk('path',{fill:'#fff'});if(soft){a.setAttribute('fill-opacity',0.5);b.setAttribute('fill-opacity',0.5);}
  if(shadeAfter)shadeAfter.parentNode.insertBefore(b,shadeAfter.nextSibling);return [a,b];}
 var lm=LIGHT?LIGHT.pSh.g:null;
 return {floor:pair(SMK,lm),floorS:pair(SMK,lm),wall:pair(mW,lm),wallS:pair(mW,lm),A:pair(mA,LIGHT?LIGHT.pA.g:null),B:pair(mB,LIGHT?LIGHT.pB.g:null),
  // hers apart, so that they fade with her as she comes in and goes out
  floorH:pair(SMK,lm),wallH:pair(mW,lm),AH:pair(mA,LIGHT?LIGHT.pA.g:null),BH:pair(mB,LIGHT?LIGHT.pB.g:null)};})();
(function(){if(!SHADOW)return;['floorS','wallS'].forEach(function(k){SHADOW[k].forEach(function(e){e.setAttribute('fill-opacity',0.45);});});})();
// the points of a solid that bound its shadow: one set per convex piece
var BALL=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[.577,.577,.577],[.577,-.577,.577],[-.577,.577,.577],[-.577,-.577,.577],[.577,.577,-.577],[.577,-.577,-.577],[-.577,.577,-.577],[-.577,-.577,-.577],[.707,.707,0],[.707,-.707,0],[-.707,.707,0],[-.707,-.707,0]];
function primPts(q){var o=[],i,k;function ball(c,r,into){BALL.forEach(function(d){into.push(A(c,M(d,r)));});}
 if(q.t==='sph'){ball(q.c,q.r,o);return [o];}
 if(q.t==='cap'){ball(q.a,q.r,o);ball(q.b,q.r,o);return [o];}
 if(q.t==='box'){[-1,1].forEach(function(a){[-1,1].forEach(function(b){[-1,1].forEach(function(c){o.push(A(q.c,A(A(M(q.ax[0],a),M(q.ax[1],b)),M(q.ax[2],c))));});});});return [o];}
 if(q.t==='cyl'){var e1=N(X(q.u,Math.abs(q.u[2])<0.9?[0,0,1]:[1,0,0])),e2=X(q.u,e1);for(i=0;i<10;i++){var a=2*Math.PI*i/10,rv=A(M(e1,q.r*Math.cos(a)),M(e2,q.r*Math.sin(a)));o.push(A(q.b,rv));o.push(A(A(q.b,M(q.u,q.h)),rv));}return [o];}
 if(q.t==='cbox'){[q.a0,q.a1].forEach(function(a){[q.b0,q.b1].forEach(function(b){[q.z0,q.z1].forEach(function(z){o.push(cw(a+(q.sl?q.sl*(z-q.sz):0),b,z));});});});return [o];}
 if(q.t==='sweep'){var out=[];for(i=0;i+1<q.rings.length;i++){var c0=q.rings[i][0],c1=q.rings[i+1][0],ax=Sb(c1,c0);if(L(ax)<1)continue;var u=N(ax),lat=Sb(q.r,M(u,D(q.r,u)));if(L(lat)<1e-6)continue;lat=N(lat);var th=N(X(u,lat)),s=[];
   [q.rings[i],q.rings[i+1]].forEach(function(rg){for(k=0;k<12;k++){var a2=2*Math.PI*k/12;s.push(A(rg[0],A(M(lat,rg[1]*Math.cos(a2)),M(th,rg[2]*Math.sin(a2)))));}});out.push(s);}return out;}
 return [];}
// what never moves: the desks' legs and frames, the chair's gas column, the plant (pot and a crown of leaves, whose
// shadow is broken by the gaps between them, so it is lighter)
function bx(u,v,z0,z1,wu,wv){return {t:'box',c:[u,v,(z0+z1)/2],ax:[[wu/2,0,0],[0,wv/2,0],[0,0,(z1-z0)/2]]};}
var STILL=(function(){var o=[];[DESKA[0]+280,DESKA[1]-280].forEach(function(ul){o.push(bx(ul,(DESKA[2]+DESKA[3])/2,0,TOPZ-52,40,40));o.push(bx(ul,(DESKA[2]+DESKA[3])/2,TOPZ-52,TOPZ-22,44,DESKA[3]-DESKA[2]-240));});
 [DESKB[2]+140,DESKB[3]-140].forEach(function(vl){[DESKB[0]+55,DESKB[1]-55].forEach(function(ut){o.push(bx(ut,vl,0,TOPZ,26,26));});o.push(bx((DESKB[0]+DESKB[1])/2,vl,318,342,DESKB[1]-DESKB[0]-110,24));});
 o.push(bx(190,190,0,2890,380,380));   // the concrete column in the corner
 return o;})();
var PLANTS=[{t:'cyl',b:[330,2660,0],u:[0,0,1],r:150,h:420},{t:'sph',c:[330,2660,1050],r:250},{t:'sph',c:[280,2590,1380],r:210},{t:'sph',c:[400,2740,760],r:220}];
// the plant's leaves and stems, each its own shadow. The drawing is flat, so each leaf is stood back up from it: on
// an upright plane facing the viewer through the trunk, set a little nearer or further by its place in the drawing's
// order (drawn first, furthest), so that as the sun moves the leaves' shadows part and cross like a real crown's
var PLEAF=(function(){var P=$i('plant');if(!P)return null;var K0=330+2660,out={leaf:[],stem:[]};
 function up(x,y,K){var d=(x-OX)/(C*S);return [(K+d)/2,(K-d)/2,(OY+K*0.5*S-y)/S];}
 var L=[].filter.call(P.querySelectorAll('polygon'),function(e){var f=e.getAttribute('fill')||'';return /^#[67][0-9a-f]{5}$/.test(f)&&e.getAttribute('stroke')===f;}),n=L.length;
 L.forEach(function(e,i){var K=K0+(n>1?-240+480*i/(n-1):0);out.leaf.push(e.getAttribute('points').trim().split(/\s+/).map(function(q){var a=q.split(',');return up(+a[0],+a[1],K);}));});
 [].forEach.call(P.querySelectorAll('line'),function(e){var st=e.getAttribute('stroke');if(st!=='#7d7266'&&st!=='#7f8a6c')return;
  out.stem.push({a:up(+e.getAttribute('x1'),+e.getAttribute('y1'),K0),b:up(+e.getAttribute('x2'),+e.getAttribute('y2'),K0),w:(+e.getAttribute('stroke-width')||1)/S});});
 return out;})();
(function(){if(!SHADOW)return;['floorS','wallS'].forEach(function(k){SHADOW[k].forEach(function(e){e.setAttribute('fill-opacity',0.7);});});})();
// what is not hers: the desks, what lies on them, the chair
function notHers(k){return k==='deskA'||k==='deskB'||k==='deskAprops'||k==='deskBprops'||/^c[A-Z]/.test(k)||(k==='lap'&&prop.lap==='desk')||(k==='mug'&&prop.mug==='desk')||((k==='roll'||k==='rollB')&&prop.roll==='desk')||(k==='stack'&&prop.stackPos==='desk');}
// what never moves (the desks, their frames, the plant) is cast again only when the sun has moved a little
var SHC={key:null,acc:null};
function drawShadows(){if(!SHADOW)return;var S=SHADOW,ks=['floor','floorS','wall','wallS','A','B','floorH','wallH','AH','BH'];
 if(!SUNV.on||!GEO){SHC.key=null;ks.forEach(function(k){S[k][0].setAttribute('d','');S[k][1].setAttribute('d','');});return;}
 var du=SUNV.du,dv=SUNV.dv;function blank(){return {floor:'',floorS:'',wall:'',wallS:'',A:'',B:'',floorH:'',wallH:'',AH:'',BH:''};}var acc=blank();
 function proj(pts,rec){if(rec==='floor')return pts.map(function(P){return [P[0]+P[2]*du,P[1]+P[2]*dv];});
  if(rec==='A'||rec==='B')return pts.map(function(P){var s=Math.max(0,P[2]-TOPZ);return [P[0]+s*du,P[1]+s*dv];});
  return pts.map(function(P){var s=Math.max(0,P[1]/-dv);return [P[0]+s*du,P[2]-s];});}
 function scr(rec,x){return rec==='floor'?W([x[0],x[1],0]):rec==='wall'?W([x[0],0,x[1]]):W([x[0],x[1],TOPZ+1]);}
 var RB={floor:[8,ROOM[0]-8,8,ROOM[1]-8],wall:[0,ROOM[0],0,2900],A:DESKA,B:DESKB};
 // a shadow that cannot reach a surface is not worked out for it
 function cast(pts,rec,key){var q=proj(pts,rec),r=RB[rec],x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(var i=0;i<q.length;i++){var a=q[i];if(a[0]<x0)x0=a[0];if(a[0]>x1)x1=a[0];if(a[1]<y0)y0=a[1];if(a[1]>y1)y1=a[1];}
  if(x1<r[0]||x0>r[1]||y1<r[2]||y0>r[3])return;var h=hull(q);if(h.length<3)return;var c=rec==='floor'?clipRoom(h):rec==='wall'?clipRect(h,[0,ROOM[0],0,2900]):clipRect(h,rec==='A'?DESKA:DESKB);
  if(c.length<3)return;acc[key]+='M'+c.map(function(x){var w=scr(rec,x);return w[0].toFixed(1)+','+w[1].toFixed(1);}).join('L')+'Z';}
 // a shape cast as it is (a leaf is not convex), turned to one winding so overlapping leaves add up
 function polyAcc(q,rec,key){var r=RB[rec],x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,ar=0;for(var i=0;i<q.length;i++){var a=q[i],b=q[(i+1)%q.length];if(a[0]<x0)x0=a[0];if(a[0]>x1)x1=a[0];if(a[1]<y0)y0=a[1];if(a[1]>y1)y1=a[1];ar+=a[0]*b[1]-b[0]*a[1];}
  if(x1<r[0]||x0>r[1]||y1<r[2]||y0>r[3])return;if(ar<0)q=q.slice().reverse();var c=rec==='floor'?clipRoom(q):rec==='wall'?clipRect(q,[0,ROOM[0],0,2900]):clipRect(q,rec==='A'?DESKA:DESKB);
  if(c.length<3)return;acc[key]+='M'+c.map(function(x){var w=scr(rec,x);return w[0].toFixed(1)+','+w[1].toFixed(1);}).join('L')+'Z';}
 function castPoly(pts,rec,key){polyAcc(proj(pts,rec),rec,key);}
 var wallOn=dv<-0.02;
 function castAll(list){list.forEach(function(it){var h=it.h||'';cast(it.p,'floor','floor'+h);if(wallOn)cast(it.p,'wall','wall'+h);if(it.top){var zt=0;it.p.forEach(function(P){zt=Math.max(zt,P[2]);});if(zt>TOPZ+2){cast(it.p,'A','A'+h);cast(it.p,'B','B'+h);}}});}
 var key=du.toFixed(3)+','+dv.toFixed(3);
 if(SHC.key!==key){var keep=acc,st=[];acc=blank();
  ['deskA','deskB'].forEach(function(k){(GEO[k]||[]).forEach(function(q){primPts(q).forEach(function(p){st.push({p:p,top:false});});});});
  STILL.forEach(function(q){primPts(q).forEach(function(p){st.push({p:p,top:false});});});castAll(st);
  // the pot whole; each leaf by its own outline; each stem as a strip of its width
  primPts(PLANTS[0]).forEach(function(p){cast(p,'floor','floor');if(wallOn)cast(p,'wall','wall');});
  if(PLEAF){PLEAF.leaf.forEach(function(lf){castPoly(lf,'floor','floorS');if(wallOn)castPoly(lf,'wall','wallS');});
   PLEAF.stem.forEach(function(sm){['floor'].concat(wallOn?['wall']:[]).forEach(function(rec){var q=proj([sm.a,sm.b],rec),dx=q[1][0]-q[0][0],dy=q[1][1]-q[0][1],l=Math.hypot(dx,dy)||1,nx=-dy/l*sm.w/2,ny=dx/l*sm.w/2;
     polyAcc([[q[0][0]+nx,q[0][1]+ny],[q[1][0]+nx,q[1][1]+ny],[q[1][0]-nx,q[1][1]-ny],[q[0][0]-nx,q[0][1]-ny]],rec,rec+'S');});});}
  else PLANTS.forEach(function(q){primPts(q).forEach(function(p){cast(p,'floor','floorS');if(wallOn)cast(p,'wall','wallS');});});
  SHC.key=key;SHC.acc=acc;acc=keep;}
 var list=[];
 for(var k in GEO){if(k==='deskA'||k==='deskB')continue;var h=notHers(k)?'':'H';GEO[k].forEach(function(q){primPts(q).forEach(function(p){list.push({p:p,top:true,h:h});});});}
 list.push({p:primPts({t:'cap',a:cw(0,0,60),b:cw(0,0,420),r:28})[0],top:true});castAll(list);
 ks.forEach(function(k){var d=SHC.acc[k]+acc[k];S[k][0].setAttribute('d',d);S[k][1].setAttribute('d',d);});
 var fo=me.away?'0':me.op<0.999?me.op.toFixed(3):'1';['floorH','wallH','AH','BH'].forEach(function(k){S[k][0].setAttribute('fill-opacity',fo);S[k][1].setAttribute('fill-opacity',fo);});}

// ---------- the sky's state at the top left: weather, season, time of day, as icons; tap to pick other ones ----------
var ENV={wx:null,season:null,time:null};   // null: as it really is now
var WXLIVE=null;
// icons: Hugeicons (stroke rounded, free set) — MIT License, Copyright (c) Hugeicons.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files, to deal in the Software without restriction, subject to including this notice.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
var ICON={"spring": "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\"><path d=\"M14 12.5a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z\"/><path d=\"M12 18.088q-.172.28-.377.562C10.309 20.447 8.496 21.504 7 21.5l-.302-2.075l-2.078.356c-.466-1.413.029-3.514 1.342-5.312C3.935 13.766 2.442 12.397 2 11l1.86-.931l-.966-1.866c1.187-.883 3.526-.99 5.615-.299c0-2.404.827-4.534 2.03-5.404L12 4l1.46-1.5c1.204.87 2.042 3 2.03 5.404c2.09-.69 4.429-.584 5.616.299l-.965 1.866L22 11c-.442 1.396-1.935 2.765-3.962 3.47c1.313 1.797 1.808 3.898 1.342 5.311l-2.078-.356L17 21.5c-1.496.004-3.309-1.053-4.623-2.85a8 8 0 0 1-.377-.562Z\"/></g>", "summer": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\"><path d=\"M15.887 4.077c1.262 1.475 2.034 3.456 2.034 5.635c0 4.56-3.385 8.257-7.56 8.257c-2.32 0-4.322-1.06-5.683-2.745\"/><path stroke-linejoin=\"round\" d=\"m16.418 3.573l-3.062 2.842c-.09.084-.083.227-.002.318c.677.766.694 2.41-.082 3.438c-.827 1.093-2.056.944-2.498.717l-.25.704a.6.6 0 0 1-.643.394l-1.642-.212a.4.4 0 0 0-.338.118L4.98 14.884l-1.4 1.495c-.857.917-.775 2.374.323 2.984c3.474 1.928 9.054 2.969 13.94-1.627c4.515-4.666 3.366-10.328 1.588-13.779c-.587-1.14-2.074-1.256-3.014-.384\"/></g>", "autumn": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\"><path stroke-linejoin=\"round\" d=\"M8.157 15.843c-1.077-.007-2.56-.27-3.723-1.433c-2.072-2.072-1.289-5.157-1.289-5.157s1.615-.41 3.293.149a6 6 0 0 1-.052-.793C6.386 5.003 9.59 3 9.59 3s2.003 1.252 2.842 3.557c2.793-1.953 6.182-1.171 6.182-1.171s.782 3.39-1.171 6.182C19.748 12.407 21 14.41 21 14.41s-2.003 3.204-5.609 3.204a6 6 0 0 1-.793-.052c.558 1.678.149 3.293.149 3.293s-3.085.783-5.157-1.29\"/><path d=\"m3 21l10-10\"/></g>", "winter": "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\"><path stroke-linecap=\"round\" d=\"M14.244 3.006c-.443.404-1.623 1.995-2.253 1.994c-.63 0-1.805-1.595-2.247-2m4.5 17.994c-.443-.404-1.623-1.995-2.253-1.994c-.63 0-1.805 1.596-2.247 2M20.908 9.452c-.571-.182-2.539-.408-2.853-.954c-.315-.547.479-2.361.608-2.946M5.33 18.446c.128-.586.916-2.403.6-2.948c-.316-.546-2.284-.766-2.855-.946m.001-5.1c.57-.182 2.539-.408 2.853-.954s-.479-2.361-.608-2.946m13.332 12.894c-.128-.586-.916-2.403-.6-2.948c.316-.546 2.284-.766 2.855-.946m-5.45-4.572l2.536-1.48m-6-.48V5m6 10.5l-2.536-1.48M5.994 15.5L8.566 14m3.428 5v-3.021M8.566 10L5.994 8.5\"/><path d=\"M15.496 11.731c0-.845 0-1.267-.202-1.615c-.2-.349-.567-.56-1.299-.982l-.463-.268c-.732-.423-1.098-.634-1.5-.634s-.768.211-1.5.634l-.464.268c-.732.422-1.098.634-1.3.982c-.2.348-.2.77-.2 1.616v.536c0 .845 0 1.268.2 1.616c.202.348.568.56 1.3.982l.464.268c.732.422 1.098.634 1.5.634s.768-.212 1.5-.634l.464-.268c.732-.423 1.098-.634 1.299-.982s.2-.771.2-1.617z\"/></g>", "clear": "<g fill=\"none\" stroke=\"currentColor\"><path d=\"M17 12a5 5 0 1 1-10 0a5 5 0 0 1 10 0Z\"/><path stroke-linecap=\"round\" d=\"M12 2v1.5m0 17V22m7.07-2.929l-1.06-1.06M5.99 5.989L4.928 4.93M22 12h-1.5m-17 0H2m17.071-7.071l-1.06 1.06M5.99 18.011l-1.06 1.06\"/></g>", "cloudy": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\"><path stroke-linejoin=\"round\" d=\"M17.478 12h.022a4.5 4.5 0 1 1 0 9H7a5 5 0 0 1-.48-9.977M17.478 12q.021-.247.022-.5a5.5 5.5 0 0 0-10.98-.477M17.478 12a5.5 5.5 0 0 1-1.235 3M6.52 11.023Q6.757 11 7 11c1.126 0 2.165.372 3 1\"/><path d=\"M2.96 10.194c-.741-2.722.9-5.52 3.664-6.25m-3.665 6.25L2 10.447m.96-.253c.184.677.498 1.285.908 1.806m2.756-8.055L6.367 3m.257.945A5.23 5.23 0 0 1 12 5.67m-8.523.653l-1.013-.577m8.677-2.289l-.584.998\"/></g>", "overcast": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M14.382 12.8h.018a3.6 3.6 0 0 1 0 7.2H6a4 4 0 0 1-.384-7.982m8.252 2.482a4.4 4.4 0 0 0 .532-2.1a4.4 4.4 0 0 0-8.784-.382m0 0A4 4 0 0 1 8 12.535m3-7.353A4.4 4.4 0 0 1 18.383 8.8M21 14.89a3.6 3.6 0 0 0-2.618-6.09m0 0A4.4 4.4 0 0 1 18.1 10\"/>", "rain": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"m12.5 15l-1 2m5.5-2l-1 2m-2.5 2l-1 2M8 15l-1 2m2 2l-1 2m9.478-12.102h.022c2.485 0 4.5 1.98 4.5 4.423A4.4 4.4 0 0 1 20 17m-2.522-8.102q.021-.243.022-.492C17.5 5.421 15.038 3 12 3C9.123 3 6.762 5.171 6.52 7.937m10.958.961a5.33 5.33 0 0 1-1.235 2.949M6.52 7.937C3.984 8.175 2 10.274 2 12.83a4.88 4.88 0 0 0 2 3.932m2.52-8.825q.237-.022.48-.022c1.126 0 2.165.366 3 .983\"/>", "snow": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M17.478 8.78h.022c2.485 0 4.5 1.941 4.5 4.335c0 1.703-1.018 3.176-2.5 3.885m-2.022-8.22q.021-.238.022-.481C17.5 5.372 15.038 3 12 3C9.123 3 6.762 5.128 6.52 7.839m10.958.941a5.17 5.17 0 0 1-1.235 2.89M6.52 7.84C3.984 8.07 2 10.129 2 12.634C2 14.566 3.181 16.233 4.886 17M6.52 7.839q.237-.022.48-.022c1.126 0 2.165.358 3 .963\"/><g fill=\"currentColor\" stroke=\"none\"><circle cx=\"8\" cy=\"14.75\" r=\".8\"/><circle cx=\"12\" cy=\"16.75\" r=\".8\"/><circle cx=\"16\" cy=\"14.75\" r=\".8\"/><circle cx=\"16\" cy=\"18.75\" r=\".8\"/><circle cx=\"12\" cy=\"20.75\" r=\".8\"/><circle cx=\"8\" cy=\"18.75\" r=\".8\"/></g>", "storm": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7 17.5c-2.761 0-5-2.164-5-4.833c0-2.513 1.984-4.578 4.52-4.812M17.5 17.5c2.485 0 4.5-1.948 4.5-4.35S19.985 8.8 17.5 8.8h-.022m0 0q.021-.24.022-.483C17.5 5.38 15.038 3 12 3C9.123 3 6.762 5.135 6.52 7.855m10.958.945a5.2 5.2 0 0 1-1.235 2.9M6.52 7.855q.237-.021.48-.022c1.126 0 2.165.36 3 .967m2.578 5.2l-1.774 2.684c-.237.36-.356.539-.282.677c.073.139.287.139.716.139h1.524c.429 0 .643 0 .716.139c.074.138-.045.318-.282.677L11.422 21\"/>", "fog": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\"><path stroke-linejoin=\"round\" d=\"M4 17a5 5 0 0 1 2.52-8.978M9 8.417a5 5 0 0 0-2.48-.393M16.9 11a5.5 5.5 0 0 0 .6-2.5a5.5 5.5 0 0 0-10.98-.477M17.478 9h.022a4.5 4.5 0 0 1 2.829 8M17 17h-6m0 4H5\"/><path d=\"M8 17H7m8 4h-1\"/></g>", "moon": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M21.5 14.078A8.557 8.557 0 0 1 9.922 2.5C5.668 3.497 2.5 7.315 2.5 11.873a9.627 9.627 0 0 0 9.627 9.627c4.558 0 8.376-3.168 9.373-7.422\"/>", "mooncloud": "<g fill=\"none\" stroke=\"currentColor\" stroke-linejoin=\"round\"><path stroke-linecap=\"round\" d=\"M17.478 12h.022a4.5 4.5 0 1 1 0 9H7a5 5 0 0 1-.48-9.977M17.478 12q.021-.247.022-.5a5.5 5.5 0 0 0-10.98-.477M17.478 12a5.5 5.5 0 0 1-1.235 3M6.52 11.023Q6.757 11 7 11c1.126 0 2.165.372 3 1\"/><path d=\"M11 5.53a4.6 4.6 0 0 0-.525-1.41A4.53 4.53 0 0 0 7.777 2a3.58 3.58 0 0 1-1.74 3.53a3.505 3.505 0 0 1-3.897-.243a4.6 4.6 0 0 0 .47 3.42A4.53 4.53 0 0 0 6.5 11\"/></g>", "chev": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M18 9s-4.419 6-6 6s-6-6-6-6\"/>"};
// lines drawn about 0.95px wide on screen whatever the size
function iconSvg(k,px){var b=ICON[k]||ICON.clear,sw=(0.95*24/px).toFixed(2);return '<svg width="'+px+'" height="'+px+'" style="width:'+px+'px;height:'+px+'px" viewBox="0 0 24 24" fill="none" stroke-width="'+sw+'" aria-hidden="true">'+b+'</svg>';}

var SEASONS={spring:'04-15',summer:'07-20',autumn:'11-10',winter:'01-20'};
function jstNow(){return new Date(Date.now()+9*3600e3);}
function seasonOf(ms){var m=new Date(ms+9*3600e3).getUTCMonth()+1;return m>=3&&m<=5?'spring':m>=6&&m<=8?'summer':m>=9&&m<=11?'autumn':'winter';}
// the hour of sunrise or sunset on a day (Japan time), found by stepping the sun
function sunCross(base,am){var best=am?6:17;for(var mi=(am?3:14)*60;mi<(am?10:21)*60;mi+=5){var ms=base+mi*60e3,s=sunAt(ms),a=altAz(s.ha,s.dec);if(am?a.el>0:a.el<0){best=mi/60;break;}}return best;}
function envApply(){var run=window.__senManual?vt:(Date.now()-T_START),sp=T_FAST?120:1;
 if(ENV.season===null&&ENV.time===null)T_FIX=null;
 else{var n=jstNow(),y=n.getUTCFullYear(),ds=ENV.season?(SEASONS[ENV.season]):null;if(ENV.season==='winter'&&n.getUTCMonth()>=6)y++;
  var base=ds?Date.parse(y+'-'+ds+'T00:00:00+09:00'):Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate())-9*3600e3;
  var hr=ENV.time===null?(n.getUTCHours()+n.getUTCMinutes()/60):typeof ENV.time==='number'?ENV.time:ENV.time==='dawn'?sunCross(base,true)+0.2:ENV.time==='dusk'?sunCross(base,false)-0.15:{morning:9,noon:12,afternoon:15,night:21}[ENV.time];
  T_FIX=base+hr*3600e3-run*sp;}
 if(ENV.wx){var P={clear:[5,1],cloudy:[60,2],overcast:[100,3],rain:[100,63],snow:[100,73],storm:[100,95],fog:[100,45]}[ENV.wx];WX={cover:P[0],code:P[1],rain:ENV.wx==='rain'?2.5:ENV.wx==='storm'?6:0,snow:ENV.wx==='snow'?1.5:0,wind:ENV.wx==='storm'?9:3,kind:ENV.wx,ok:true};}
 else if(WXLIVE)WX=WXLIVE;
 lastDay=-1;drawDay(true);envShow();}
// the sky picker. A pill at the top left says what the room is under: LIVE (Yokohama as it is now), the season,
// the clock, the weather and, when live, the temperature. Tapping it opens a card: a LIVE switch, the seasons, the
// sun's path through the chosen day (drag the sun along it), the weather. Touching anything turns LIVE off and
// holds the rest where it was; turning LIVE on puts everything back to now.
var ENVCAP={spring:'Spring',summer:'Summer',autumn:'Autumn',winter:'Winter',clear:'Clear',cloudy:'Partly',overcast:'Cloudy',rain:'Rain',snow:'Snow',storm:'Storm',fog:'Fog'};
function envLive(){return ENV.wx===null&&ENV.season===null&&ENV.time===null;}
function envFreeze(){var d=new Date(nowMs()+9*3600e3);if(ENV.time===null)ENV.time=d.getUTCHours()+d.getUTCMinutes()/60;if(ENV.wx===null)ENV.wx=WX.kind;}
function envBase(){var n=jstNow(),y=n.getUTCFullYear(),ds=ENV.season?SEASONS[ENV.season]:null;if(ENV.season==='winter'&&n.getUTCMonth()>=6)y++;
 return ds?Date.parse(y+'-'+ds+'T00:00:00+09:00'):Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate())-9*3600e3;}
function envEl(ms){var s=sunAt(ms);return altAz(s.ha,s.dec).el;}
// the day's highest sun always at the top and its lowest at the bottom, one scale for every day: the horizon is
// what moves (low in summer, high in winter), so the graph keeps the same place under its title
var ARC={W:318,H:73,top:4,bot:11,pk:60,k:0.5,hz:40,x:function(h){return 10+h/24*(this.W-20);},y:function(el){return this.top+(this.pk-el)*this.k;}};
var ENVUI=(function(){var st=$i('stage');if(!st)return null;
 var css=document.createElement('style');css.textContent=
  '.envb{position:absolute;top:8px;left:22px;z-index:3;display:flex;align-items:center;gap:8px;height:34px;padding:0 12px;border:0;border-radius:17px;background:#f3f2ef;color:var(--ink);font-family:Barlow,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent;white-space:nowrap}'+
  '.envb svg{display:block;flex:none}.envb .tx{font-size:14px;font-weight:500;font-variant-numeric:tabular-nums;letter-spacing:.01em}.envb .tp{font-size:14px;color:#6f6c64;font-variant-numeric:tabular-nums}'+
  '.envb .lv{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.1em;margin-right:2px}.envb .lv i{width:8px;height:8px;background:#e0301e;display:block;flex:none}.envlv b i{width:9px;height:9px;background:#e0301e;display:block;flex:none}.lt{display:block;line-height:1}@supports (text-box:trim-both cap alphabetic){.lt{text-box:trim-both cap alphabetic}}@supports not (text-box:trim-both cap alphabetic){.envb .lv i,.envlv b i{top:-1px}}'+
  '@keyframes envRing{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.3);opacity:0}}.envb .lv i,.envlv b i{position:relative}.envb .lv i:after,.envlv.on b i:after{content:"";position:absolute;left:0;top:0;width:100%;height:100%;background:#e0301e;animation:envRing 2s cubic-bezier(.2,.6,.35,1) infinite}.envlv b i{transition:background .22s ease}.envlv:not(.on) b i{background:#cfcbc3}@media (prefers-reduced-motion:reduce){.envb .lv i:after,.envlv.on b i:after{animation:none;opacity:0}}'+
  '.envb .cv{color:#a29f97;transition:transform .22s ease;margin-left:-2px}.envb.open .cv{transform:rotate(180deg)}.envb [hidden]{display:none}'+
  '.envbg{position:fixed;left:0;top:0;right:0;bottom:0;z-index:50;cursor:pointer;background:rgba(20,20,20,0);transition:background-color .22s ease;pointer-events:none;display:none}.envbg.show{display:block}.envbg.open{background:rgba(20,20,20,.45);pointer-events:auto}'+
  '.envx{position:absolute;left:50%;bottom:-62px;width:44px;height:44px;margin-left:-22px;border-radius:50%;border:1px solid var(--line);background:var(--bg);color:var(--ink);padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent}.envx svg{display:block;width:16px;height:16px}'+
  '.envp{position:fixed;top:0;left:0;z-index:51;width:346px;box-sizing:border-box;background:var(--bg);border:1px solid var(--line);border-radius:18px;padding:0 16px 10px;font-family:Barlow,sans-serif;opacity:0;transform:translateY(-4px);transition:opacity .22s ease,transform .22s ease;pointer-events:none}'+
  '.envp.open{opacity:1;transform:none;pointer-events:auto}'+
  '.envlv{display:flex;align-items:center;justify-content:space-between;height:56px;cursor:pointer}.envlv b{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:700;letter-spacing:.12em;color:var(--ink)}'+
  '.envlv small{display:block;font-size:12px;color:#8a877f;margin-top:3px;letter-spacing:.01em}'+
  '.envsw{position:relative;flex:none;width:44px;height:26px;border-radius:13px;background:#e4e2dd;border:0;padding:0;cursor:pointer;transition:background .22s ease;-webkit-tap-highlight-color:transparent}'+
  '.envsw:after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .22s ease}.envsw.on{background:var(--ink)}.envsw.on:after{transform:translateX(18px)}'+
  '.envs{padding:14px 0 8px}.envh{display:flex;align-items:baseline;justify-content:space-between;height:18px;margin-bottom:8px}'+
  '.envh span{font-size:11px;font-weight:600;letter-spacing:.12em;color:#8a877f}.envh output{position:relative;top:4px;font-size:15px;font-weight:500;color:var(--ink);font-variant-numeric:tabular-nums}'+
  '.envo{display:grid;justify-items:center}'+
  '.envo button{appearance:none;border:0;background:none;padding:0;margin:0;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;color:#8a877f;-webkit-tap-highlight-color:transparent}'+
  '.envo .ic{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#f2f1ee;color:#4a4843;transition:background .22s ease,color .22s ease,transform .12s ease}.envo .ic svg{display:block}.envo button:active .ic{transform:scale(.9)}'+
  '.envx{transition:transform .12s ease}.envx:active{transform:scale(.9)}.envsw:active:after{transform:scale(.92)}.envsw.on:active:after{transform:translateX(18px) scale(.92)}'+
  '#envKnob .kn{transform-origin:0 0;transition:transform .15s ease}.envarc.drag #envKnob .kn{transform:scale(1.18)}'+
  '.envo .cp{font-size:10px;letter-spacing:.04em;line-height:1;transition:color .22s ease}'+
  '.envo button.on{color:var(--ink)}.envo button.on .ic{background:var(--ink);color:#fff}.envo .ic svg{transition:stroke-width .22s ease}.envo button.on .ic svg{stroke-width:1.45}.envo button.on .cp{font-weight:600}'+
  '.envarc{display:block;width:100%;height:auto;touch-action:none;cursor:ew-resize;overflow:visible}.envarc text{transition:opacity .22s ease;font-family:Barlow,sans-serif;font-size:10px;fill:#8a877f;font-variant-numeric:tabular-nums}';
 document.head.appendChild(css);
 var btn=document.createElement('button');btn.type='button';btn.className='envb';
 btn.innerHTML='<span class="lv" id="envLv"><i></i><span class="lt">LIVE</span></span><span class="tx" id="envT"></span><span id="envS"></span><span id="envW"></span><span class="tp" id="envC"></span><span class="cv">'+iconSvg('chev',12)+'</span>';st.appendChild(btn);
 // the card and the blur behind it live on the page itself, above everything (the pages slide inside a layer of
 // their own, which nothing in them can rise above). Closed with the round button under the card, or a tap on the blur
 var pan=document.createElement('div');pan.className='envp';document.body.appendChild(pan);
 var bg=document.createElement('div');bg.className='envbg';document.body.insertBefore(bg,pan);
 // (iPhone sends a tap on a plain element on as a click only if that element itself listens for clicks)
 bg.addEventListener('click',function(e){e.stopPropagation();setOpen(false);});
 // the card in the middle of what can be seen of the screen (the browser's own bars left out), the close button
 // under it; raised only if the button would not fit below
 function place(){var vv=window.visualViewport,vw=vv?vv.width:innerWidth,vh=vv?vv.height:innerHeight,ox=vv?vv.offsetLeft:0,oy=vv?vv.offsetTop:0,w=Math.round(Math.min(350,vw-44));
  pan.style.width=w+'px';pan.style.left=Math.round(ox+(vw-w)/2)+'px';var h=pan.offsetHeight;pan.style.top=Math.round(oy+Math.max(12,Math.min((vh-h)/2,vh-h-74)))+'px';}
 // the dimming layer is taken out of the page altogether once it has faded: Safari on iPhone colours the strip
 // behind its clock after whatever is fixed at the top of the page, faded or not
 var bgT=0;
 function setOpen(o){if(o)place();pan.classList.toggle('open',o);btn.classList.toggle('open',o);clearTimeout(bgT);
  if(o){bg.classList.add('show');void bg.offsetWidth;bg.classList.add('open');}else{bg.classList.remove('open');bgT=setTimeout(function(){bg.classList.remove('show');},260);}if(o){envTrack();envLast='';envShow();}}
 function rep(){if(pan.classList.contains('open'))place();}window.addEventListener('resize',rep);if(window.visualViewport){visualViewport.addEventListener('resize',rep);visualViewport.addEventListener('scroll',rep);}
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&pan.classList.contains('open'))setOpen(false);});
 // LIVE
 var lv=document.createElement('div');lv.className='envlv';lv.innerHTML='<div><b><i></i><span class="lt">LIVE</span></b><small>Yokohama &middot; Now</small></div><button type="button" class="envsw" role="switch" aria-label="Live"></button>';pan.appendChild(lv);
 var sw=lv.lastChild;lv.onclick=function(e){e.stopPropagation();if(envLive())envFreeze();else{ENV.wx=null;ENV.season=null;ENV.time=null;}envApply();};
 function sec(lab,inner,right){var s=document.createElement('div');s.className='envs';s.innerHTML='<div class="envh"><span>'+lab+'</span>'+(right||'')+'</div>';s.appendChild(inner);pan.appendChild(s);return s;}
 function opts(k,list){var o=document.createElement('div');o.className='envo';o.style.gridTemplateColumns='repeat('+list.length+',1fr)';
  list.forEach(function(v){var b=document.createElement('button');b.type='button';b.dataset.k=k;b.dataset.v=v;b.setAttribute('aria-label',ENVCAP[v]);b.innerHTML='<span class="ic">'+iconSvg(v,22)+'</span><span class="cp">'+ENVCAP[v]+'</span>';
   b.onclick=function(e){e.stopPropagation();envFreeze();ENV[k]=v;envApply();};o.appendChild(b);});return o;}
 sec('SEASON',opts('season',['spring','summer','autumn','winter']));
 // the sun's path: above the horizon a solid line, below it a dotted one; sunrise and sunset written where it crosses
 var NS='http://www.w3.org/2000/svg',arc=document.createElementNS(NS,'svg');arc.setAttribute('class','envarc');arc.setAttribute('viewBox','0 0 '+ARC.W+' '+ARC.H);arc.setAttribute('aria-label','Time of day: drag the sun');
 arc.innerHTML='<defs><clipPath id="envUp"><rect id="envUpR" x="0" y="-20" width="'+ARC.W+'" height="60"/></clipPath><clipPath id="envDn"><rect id="envDnR" x="0" y="40" width="'+ARC.W+'" height="60"/></clipPath></defs>'+
  '<line id="envHz" x1="0" x2="'+ARC.W+'" y1="40" y2="40" stroke="#dcd9d2" stroke-width="1"/><g id="envTk" stroke="#dcd9d2" stroke-width="1"></g>'+
  '<path id="envPd" fill="none" stroke="#c4c0b7" stroke-width="1" stroke-dasharray="1.5 3" stroke-linecap="round" clip-path="url(#envDn)"/><path id="envPu" fill="none" stroke="#141414" stroke-width="1" clip-path="url(#envUp)"/>'+
  '<text id="envSr" text-anchor="end"></text><text id="envSs"></text>'+
  '<g id="envKnob"><g class="kn"><circle r="11" fill="#fff" stroke="#141414" stroke-width="1"/><g id="envKnI" transform="translate(-7,-7) scale(.5833)" fill="none" stroke="#141414" stroke-width="1.63"></g></g></g>';
 var tw=document.createElement('div');tw.appendChild(arc);var ts=sec('TIME',tw,'<output id="envTo"></output>');
 var drag=false,raf=0,want=null;
 function setFrom(e){var r=arc.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*ARC.W,h=(px-10)/(ARC.W-20)*24;h=Math.round(cl(h,0,23.99)*12)/12;want=Math.min(h,23+55/60);
  if(!raf)raf=requestAnimationFrame(function(){raf=0;if(want===null)return;envFreeze();ENV.time=want;want=null;envApply();});}
 arc.addEventListener('pointerdown',function(e){e.stopPropagation();drag=true;arc.classList.add('drag');try{arc.setPointerCapture(e.pointerId);}catch(_){}setFrom(e);});
 arc.addEventListener('pointermove',function(e){if(drag)setFrom(e);});
 function up(e){drag=false;arc.classList.remove('drag');try{arc.releasePointerCapture(e.pointerId);}catch(_){}}arc.addEventListener('pointerup',up);arc.addEventListener('pointercancel',up);
 arc.addEventListener('click',function(e){e.stopPropagation();});
 sec('WEATHER',opts('wx',['clear','cloudy','overcast','rain','snow','storm','fog']));
 btn.onclick=function(e){e.stopPropagation();setOpen(!pan.classList.contains('open'));};
 document.addEventListener('touchstart',function(){},{passive:true});
 var cx=document.createElement('button');cx.type='button';cx.className='envx';cx.setAttribute('aria-label','Close');cx.innerHTML='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>';cx.onclick=function(e){e.stopPropagation();setOpen(false);};pan.appendChild(cx);
 // while the card is open, a tap outside it only closes it: the tap never reaches what lies under it (a colour
 // swatch, a photo), from the press to the click
 var eat=false;function out(e){return pan.classList.contains('open')&&!pan.contains(e.target)&&!btn.contains(e.target);}
 ['pointerdown','mousedown','touchstart'].forEach(function(t){window.addEventListener(t,function(e){if(out(e)){eat=true;e.stopPropagation();}},{capture:true,passive:true});});
 ['pointerup','mouseup','touchend'].forEach(function(t){window.addEventListener(t,function(e){if(eat&&!pan.contains(e.target)&&!btn.contains(e.target))e.stopPropagation();},{capture:true,passive:true});});
 window.addEventListener('click',function(e){if(out(e)||(eat&&!pan.contains(e.target)&&!btn.contains(e.target))){e.stopPropagation();e.preventDefault();setOpen(false);}eat=false;},true);
 pan.addEventListener('click',function(e){e.stopPropagation();});
 return {btn:btn,pan:pan,sw:sw,arc:arc};})();
var envTrackKey='';
function hm(h){var m=Math.round(h*60);return Math.floor(m/60)+':'+('0'+m%60).slice(-2);}
function envTrack(){if(!ENVUI)return;var base=envBase();if(base===envTrackKey)return;envTrackKey=base;var d='',sr=null,ss=null,prev=null,E=[];
 for(var i=0;i<=144;i++)E.push(envEl(base+i/6*3600e3));
 ARC.pk=Math.max.apply(null,E);ARC.k=(ARC.H-ARC.top-ARC.bot)/(ARC.pk-Math.min.apply(null,E));ARC.hz=+ARC.y(0).toFixed(1);
 $i('envUpR').setAttribute('height',ARC.hz+20);$i('envDnR').setAttribute('y',ARC.hz);$i('envHz').setAttribute('y1',ARC.hz);$i('envHz').setAttribute('y2',ARC.hz);
 for(var i=0;i<=144;i++){var h=i/6,el=E[i];d+=(i?'L':'M')+ARC.x(h).toFixed(1)+' '+ARC.y(el).toFixed(1);
  if(prev!==null){if(prev<=0&&el>0&&sr===null)sr=(i-1+(-prev)/(el-prev))/6;if(prev>0&&el<=0&&ss===null)ss=(i-1+prev/(prev-el))/6;}prev=el;}
 $i('envPu').setAttribute('d',d);$i('envPd').setAttribute('d',d);
 var tk='';[0,6,12,18,24].forEach(function(h){var x=ARC.x(h).toFixed(1);tk+='<line x1="'+x+'" x2="'+x+'" y1="'+ARC.hz+'" y2="'+(ARC.hz+4)+'"/>';});$i('envTk').innerHTML=tk;
 var a=$i('envSr'),b=$i('envSs');
 if(sr!==null){a.setAttribute('x',(ARC.x(sr)-6).toFixed(1));a.setAttribute('y',ARC.hz-6);a.textContent='↑ '+hm(sr);ARC.sr=ARC.x(sr);}else{a.textContent='';ARC.sr=null;}
 if(ss!==null){b.setAttribute('x',(ARC.x(ss)+6).toFixed(1));b.setAttribute('y',ARC.hz-6);b.textContent=hm(ss)+' ↓';ARC.ss=ARC.x(ss);}else{b.textContent='';ARC.ss=null;}}
var envLast='';
function envShow(){if(!ENVUI)return;var ms=nowMs(),d=new Date(ms+9*3600e3),hh=d.getUTCHours(),mm=d.getUTCMinutes(),live=envLive(),sea=seasonOf(ms),el=envEl(ms),
  night=el<-0.8,wk=WX.kind,wi=night&&wk==='clear'?'moon':night&&wk==='cloudy'?'mooncloud':wk,t=hh+':'+('0'+mm).slice(-2),
  tc=live&&WXLIVE&&WXLIVE.temp!=null?Math.round(WXLIVE.temp)+'°C':'',
  k=[wi,sea,t,live,tc,ENV.wx,ENV.season,ENV.time,ENVUI.pan.classList.contains('open')].join('|');
 if(k===envLast)return;envLast=k;
 $i('envLv').hidden=!live;$i('envS').innerHTML=iconSvg(sea,20);$i('envT').textContent=t;$i('envW').innerHTML=iconSvg(wi,20);var c=$i('envC');c.textContent=tc;c.hidden=!tc;
 ENVUI.btn.setAttribute('aria-label',(live?'Live, ':'')+t+', '+ENVCAP[sea]+', '+ENVCAP[wk]+(tc?', '+tc:''));
 ENVUI.sw.classList.toggle('on',live);ENVUI.sw.parentNode.classList.toggle('on',live);ENVUI.sw.setAttribute('aria-checked',live?'true':'false');
 [].forEach.call(ENVUI.pan.querySelectorAll('.envo button'),function(b){var on=b.dataset.v===(b.dataset.k==='wx'?wk:sea);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');});
 envTrack();var h=hh+mm/60;$i('envKnob').setAttribute('transform','translate('+ARC.x(h).toFixed(1)+','+ARC.y(el).toFixed(1)+')');var ki=el>0?'clear':'moon';if(ENVUI.ki!==ki){ENVUI.ki=ki;$i('envKnI').innerHTML=ICON[ki];}
 var hx=ARC.x(h),hy=ARC.y(el),near=hy-12<ARC.hz-4;$i('envSr').style.opacity=near&&ARC.sr!==null&&hx+12>ARC.sr-46&&hx-12<ARC.sr-4?0:1;$i('envSs').style.opacity=near&&ARC.ss!==null&&hx+12>ARC.ss+4&&hx-12<ARC.ss+46?0:1;
 $i('envTo').textContent=t;}
setInterval(envShow,5000);
window.__senEnv={env:function(){return ENV;},temp:function(t){if(!WXLIVE)WXLIVE={cover:WX.cover,code:WX.code,rain:WX.rain,snow:WX.snow,wind:WX.wind,kind:WX.kind,ok:true};WXLIVE.temp=t;envLast='';envShow();}};


(function(){var w=QP.get('weather');if(w&&['clear','cloudy','overcast','rain','snow','storm','fog'].indexOf(w)>=0)ENV.wx=w;envShow();})();
var VIEW=(function(){var panes=[].slice.call(svg.querySelectorAll('polygon[fill="url(#skyG)"]'));if(!panes.length)return null;
 // ---------- the view out of the window: only the sky (in fact another building of the university stands across the way) ----------
 // painted on the plane of the glass and shown through each pane, under the glass's sheen. The sun and the moon are
 // where they really are over Yokohama now (the windows face east-south-east), the clouds and rain are today's weather; birds by
 // day, aeroplanes going over, and at night stars and the odd shooting star
 // Each pane shows it through a clip. What changes only now and then (the sky's bodies and stars; the clouds, ten
 // times a second) is drawn once and shown in each pane by reference; what moves every frame (aeroplanes and their
 // trails, birds, shooting stars, rain and snow, lightning) is drawn three times over, once in each pane, so the
 // browser never has to rebuild the referenced copies sixty times a second. In each pane, back to front: sky bodies,
 // aeroplanes, clouds, then the rest
 var XL='http://www.w3.org/1999/xlink',art=mk('g',{id:'senView'},defs),artB=mk('g',{id:'senViewB'},defs),UPL=-61,VC=1690,KV=22,KZ=36,Z0=940;
 var LT=[],LP=[],LMt=[],LB=[],LF=[],LFl=[];
 function useOf(id,i){var u=document.createElementNS(NS,'use');u.setAttribute('href','#'+id);u.setAttributeNS(XL,'xlink:href','#'+id);u.setAttribute('clip-path','url(#senViewClip'+i+')');u.setAttribute('pointer-events','none');return u;}
 panes.forEach(function(p,i){var cp=mk('clipPath',{id:'senViewClip'+i},defs);mk('polygon',{points:p.getAttribute('points')},cp);
  var a=useOf('senView',i),l1=mk('g',{'clip-path':'url(#senViewClip'+i+')','pointer-events':'none'}),b=useOf('senViewB',i),l2=mk('g',{'clip-path':'url(#senViewClip'+i+')','pointer-events':'none'});
  LT.push(mk('g',{fill:'none','stroke-linecap':'round'},l1));LP.push(mk('g',{},l1));
  LMt.push(mk('g',{fill:'none','stroke-linecap':'round'},l2));LB.push(mk('g',{fill:'none','stroke-linecap':'round','stroke-linejoin':'round'},l2));LF.push(mk('g',{'stroke-linecap':'round'},l2));LFl.push(mk('g',{},l2));
  var nx=p.nextSibling;[a,l1,b,l2].forEach(function(e){p.parentNode.insertBefore(e,nx);});});
 // one element made three times, one in each pane's layer, and set as one
 function M3(t,a,L){var es=L.map(function(g){return mk(t,a,g);});return {setAttribute:function(k,v){for(var j=0;j<es.length;j++)es[j].setAttribute(k,v);},remove:function(){es.forEach(function(e){e.remove();});}};}
 var sd=7;function rr(a,b){sd=(sd*16807)%2147483647;return a+(b-a)*(sd-1)/2147483646;}
 function wp(v,z){return W([UPL,v,z]);}
 function pts(a){return a.map(function(q){var w=wp(q[0],q[1]);return w[0].toFixed(1)+','+w[1].toFixed(1);}).join('L');}
 function poly(a){return 'M'+pts(a)+'Z';}function line(a){return 'M'+pts(a);}
 function disc(v,z,r,n){var o=[];for(var i=0;i<n;i++){var a=2*Math.PI*i/n;o.push([v+r*Math.cos(a),z+r*Math.sin(a)]);}return o;}
 // a body in the sky (degrees above the horizon, bearing) to a place on the glass; null when it is not in the window
 function skyPos(el,az){var ar=az-WFACE;if(el<-3||el>34||ar<-64||ar>64)return null;return [VC+ar*KV,Z0+el*KZ];}
 var gStar=mk('g',{},art),moon=mk('path',{},art),sun=mk('path',{},art),gTrail=LT,gPlane=LP,gCloud=mk('g',{},artB),
  gMeteor=LMt,gBird=LB,gFall=LF,flash=M3('path',{fill:'#ffffff',opacity:0,d:poly([[0,800],[3400,800],[3400,2200],[0,2200]])},LFl);
 // the tops of the trees below: a ginkgo and a zelkova that change with the year (green, yellow in late autumn,
 // bare twigs in winter) and an evergreen camphor; they sway a little in the wind
 var gTrees=mk('g',{style:'display:none'}),TREES=[];   // (not shown: the sky only; kept out of the page so it costs nothing)
 [[520,930,250,'d',0.0],[1230,880,200,'e',1.3],[2080,950,270,'d',2.1],[2760,900,220,'e',0.7],[3200,920,230,'d',2.9]].forEach(function(q4){var g=mk('g',{},gTrees),n=7+Math.floor(rr(0,4)),lv=[],br=mk('path',{fill:'none','stroke-width':0.7,'stroke-linecap':'round'},g);
  var bd='';if(q4[3]==='d'){for(var k5=0;k5<7;k5++){var a5=Math.PI*(0.2+0.6*k5/6),l5=q4[2]*rr(0.85,1.25);bd+=line([[q4[0],q4[1]-40],[q4[0]+Math.cos(a5)*l5*0.55,q4[1]+Math.sin(a5)*l5*0.55],[q4[0]+Math.cos(a5+rr(-0.25,0.25))*l5,q4[1]+Math.sin(a5)*l5]]);}}
  br.setAttribute('d',bd);
  for(var k6=0;k6<n;k6++){var aa=Math.PI*(0.08+0.84*k6/(n-1)),rd=q4[2]*rr(0.55,0.85);lv.push(mk('path',{d:poly(disc(q4[0]+Math.cos(aa)*rd*0.75,q4[1]+Math.sin(aa)*rd*0.8,q4[2]*rr(0.32,0.45),16))},g));}
  lv.push(mk('path',{d:poly(disc(q4[0],q4[1]+q4[2]*0.35,q4[2]*0.6,18))},g));TREES.push({g:g,lv:lv,br:br,kind:q4[3],ph:q4[4],v:q4[0],z:q4[1]});});
 // leaf colour through the year, by the day of the year (deciduous); null: bare
 function leafCol(doy){var K=[[0,null],[80,null],[95,'#a9c77a'],[130,'#7fa65a'],[200,'#6b8f4c'],[280,'#7d9550'],[305,'#c7b04a'],[322,'#ddb63f'],[338,'#c89a3c'],[350,null],[366,null]];
  for(var i=0;i+1<K.length;i++)if(doy>=K[i][0]&&doy<K[i+1][0]){if(!K[i][1]||!K[i+1][1])return K[i][1]&&doy-K[i][0]<6?K[i][1]:K[i+1][1]&&K[i+1][0]-doy<6?K[i+1][1]:null;var k=(doy-K[i][0])/(K[i+1][0]-K[i][0]);return hexOf(hmix(K[i][1],K[i+1][1],k));}return null;}
 var stars=[];for(var i=0;i<22;i++){var c=mk('circle',{r:rr(0.55,0.85),fill:'#e9ecf4'},gStar),w=wp(rr(400,2950),rr(1150,2060));c.setAttribute('cx',w[0].toFixed(1));c.setAttribute('cy',w[1].toFixed(1));stars.push({e:c,ph:rr(0,6.3),sp:rr(0.6,1.4)});}
 // clouds: long flat streaks, two or three laid one over another a little apart, one colour; as many as the sky has
 function streak(v0,v1,z,r){var o=[],i;for(i=0;i<=8;i++){var a=Math.PI/2+Math.PI*i/8;o.push([v0+r*Math.cos(a),z+r*Math.sin(a)]);}for(i=0;i<=8;i++){var a2=-Math.PI/2+Math.PI*i/8;o.push([v1+r*Math.cos(a2),z+r*Math.sin(a2)]);}return o;}
 // clouds: small heaps of cumulus, a flat base with a few rounded tops. They are far off, so they are drawn level
 // to the eye (not laid on the slant of the glass), and the low ones are farther still: smaller, flatter and paler,
 // nearer the colour of the sky behind them (the air in between), so the sky has depth. None is pure white.
 var kz=Math.abs(wp(0,1000)[1]-wp(0,0)[1])/1000,xa=wp(0,1500),xb=wp(3400,1500),X0=Math.min(xa[0],xb[0])-90,X1=Math.max(xa[0],xb[0])+90;
 var clouds=[],CZ=[1640,1880,1500,1940,1320,1760,2010,1420,1580,1840];for(var k=0;k<10;k++){var g=mk('g',{},gCloud),v0=150+k*340+rr(-120,120),z0=CZ[k]+rr(-50,50),nz=cl((z0-1250)/800,0,1),Ws=(220+380*nz)*rr(0.8,1.2)*kz,Hs=Ws*(0.3+0.12*nz),n=3+Math.floor(rr(0,3)),cp=wp(v0,z0);
  function sp2(a){return 'M'+a.map(function(q){return q[0].toFixed(1)+','+q[1].toFixed(1);}).join('L')+'Z';}
  var base=[];for(var a4=0;a4<=8;a4++){var an4=Math.PI/2+Math.PI*a4/8;base.push([-Ws/2+Hs*0.18+Hs*0.18*Math.cos(an4),-Hs*0.18+Hs*0.18*Math.sin(an4)]);}for(a4=0;a4<=8;a4++){var an5=-Math.PI/2+Math.PI*a4/8;base.push([Ws/2-Hs*0.18+Hs*0.18*Math.cos(an5),-Hs*0.18+Hs*0.18*Math.sin(an5)]);}
  mk('path',{d:sp2(base)},g);
  for(var j2=0;j2<n;j2++){var f2=(j2+0.5)/n,mid=1-Math.abs(f2-0.5)*2,r2=Hs*(0.45+0.55*mid)*rr(0.85,1.1),cx2=-Ws/2+Ws*f2+rr(-0.05,0.05)*Ws,lobe=[];
   for(var a3=0;a3<=16;a3++){var an=Math.PI*a3/16;lobe.push([cx2+r2*Math.cos(an)*1.1,-Hs*0.1-r2*Math.sin(an)]);}mk('path',{d:sp2(lobe)},g);}
  var pa0=wp(0,z0),pa1=wp(1000,z0);clouds.push({g:g,x0:cp[0],y:cp[1],ax:pa0[0],ay:pa0[1],sx:(pa1[1]-pa0[1])/(pa1[0]-pa0[0]),sp:rr(0.85,1.15),rank:rr(0,1),nz:nz});}
 clouds.sort(function(a,b){return a.rank-b.rank;});
 var CK=[[0,'#353d55'],[4.8,'#353d55'],[5.8,'#c3a0a2'],[6.8,'#f3ece6'],[11,'#ffffff'],[16,'#f9f5ee'],[17.4,'#f0c5a6'],[18.4,'#9b8295'],[19.6,'#3b4359'],[24,'#353d55']];
 function keyCol(h){for(var j=0;j+1<CK.length;j++)if(h>=CK[j][0]&&h<=CK[j+1][0]){var k=(h-CK[j][0])/(CK[j+1][0]-CK[j][0]);return hmix(CK[j][1],CK[j+1][1],k*k*(3-2*k));}return CK[0][1];}
 function hexOf(c){var m=c.match(/\d+/g);return m?'#'+m.slice(0,3).map(function(x){return ('0'+(+x).toString(16)).slice(-2);}).join(''):c;}
 // rain and snow: a fixed set of streaks or flakes recycled as they fall out of the bottom of the window
 var drops=[];for(i=0;i<46;i++)drops.push({e:M3('path',{stroke:'#c9d2dc','stroke-width':0.5,fill:'none',opacity:0},gFall),v:rr(300,3100),z:rr(900,2100),s:rr(0.8,1.2),ph:rr(0,6.3)});
 var lastH=-9,lastWX=null,lastC=-9,bird=null,nextBird=vt+rnd(15000,40000),plane=null,trails=[],nextPlane=vt+rnd(20000,50000),meteor=null,nextMeteor=vt+rnd(4000,12000),nextFlash=vt+rnd(800,3000),flashT=-9,flashA=1,cvis=0;
 return function(h){var t=vt/1000,S=SKYNOW,dark=Math.max(1-sm(ph(h,4.9,6.4)),sm(ph(h,17.9,19.5))),wet=WX.kind==='rain'||WX.kind==='storm'||WX.kind==='snow',grey=wet||WX.kind==='overcast'||WX.kind==='fog';
  var wind=(WX.wind||3);
  if(Math.abs(h-lastH)>0.01||WX!==lastWX){lastH=h;lastWX=WX;
   // clouds: how many are out, and their colour: lit by the hour, greyer and heavier as the weather closes in
   var cc=hexOf(keyCol(h));if(grey)cc=hmix(cc,dark>0.5?'#2c323d':'#9aa0a6',0.65);else if(WX.kind==='cloudy')cc=hmix(cc,dark>0.5?'#323947':'#d7dadc',0.3);cc=hexOf2(cc);
   cvis=WX.kind==='fog'?0:Math.round(cl(WX.cover/100,0,1)*clouds.length);var skyL=hexOf2((SKY[2]||SKY[0]).getAttribute('stop-color')),skyM=hexOf2((SKY[1]||SKY[0]).getAttribute('stop-color'));clouds.forEach(function(c,i2){c.g.setAttribute('fill',hexOf2(hmix(cc,hexOf2(hmix(skyL,skyM,c.nz)),0.55-0.3*c.nz)));c.g.style.display=i2<cvis?'':'none';});
   gCloud.setAttribute('opacity',(grey?0.9:0.85-0.3*dark).toFixed(2));
   // (no sun disc: a pale round shape in the pane read as a mark on the glass; the sun shows by the light it sends
   // into the room)
   var sp=false;if(sp&&WX.cover<85&&!wet){var warm=1-sm(ph(S.el,0,12));sun.setAttribute('d',poly(disc(sp[0],sp[1],44,24)));sun.setAttribute('fill',hmix('#f2b27e','#fff3da',1-warm));sun.style.display='';}else sun.style.display='none';
   // the moon where it is, lit on the side toward the sun as much as its phase gives
   var M=S.moon,mp=M&&skyPos(M.el,M.az),kl=M?(1-Math.cos(2*Math.PI*M.phase))/2:0;
   // (only once the sky has darkened: by day a pale moon reads as a mark on the glass too)
   if(mp&&kl>0.03&&dark>0.4&&WX.cover<85&&!wet){var R=34,sv=VC+(S.az-WFACE)*KV,side=sv>mp[0]?1:-1,o3=[];for(var j=0;j<=16;j++){var a=-Math.PI/2+Math.PI*j/16;o3.push([mp[0]+side*R*Math.cos(a),mp[1]+R*Math.sin(a)]);}
    for(j=0;j<=16;j++){var a2=Math.PI/2-Math.PI*j/16;o3.push([mp[0]+side*R*Math.cos(a2)*(1-2*kl),mp[1]+R*Math.sin(a2)]);}
    moon.setAttribute('d',poly(o3));moon.setAttribute('fill','#efeadb');moon.setAttribute('opacity',(0.3+0.7*dark).toFixed(2));moon.style.display='';}else moon.style.display='none';
   var jd=new Date(S.ms+9*3600e3),doy=Math.floor((jd-Date.UTC(jd.getUTCFullYear(),0,1))/864e5),dc=leafCol(doy),nightC=dark>0.5?0.78:0.55*dark;
   TREES.forEach(function(T){var c=T.kind==='e'?'#506b46':dc;var lit=WX.kind==='clear'&&S.el>0?0.08:0;
    if(c){c=hexOf(hmix(c,'#ffffff',lit));T.lv.forEach(function(e){e.setAttribute('fill',hexOf(hmix(c,'#1d2430',nightC)));e.style.display='';});T.g.setAttribute('opacity',1);T.br.style.display='none';}
    // bare in winter: the mass of fine twigs reads as a pale brown-grey haze of a crown
    else{T.lv.forEach(function(e){e.setAttribute('fill',hexOf(hmix('#8f8378','#1d2430',nightC)));e.style.display='';});T.g.setAttribute('opacity',0.5);T.br.style.display='none';}});
   gStar.style.display=dark>0.4&&WX.cover<75&&!wet&&WX.kind!=='fog'?'':'none';}
  // clouds drift and stars twinkle ten times a second, the clouds faster in a wind
  if(t-lastC>0.1){lastC=t;if(dark>0.4&&gStar.style.display!=='none'){var sv2=1-WX.cover/100;stars.forEach(function(s){s.e.setAttribute('opacity',((dark-0.4)/0.6*sv2*(0.45+0.25*Math.sin(t*s.sp+s.ph))).toFixed(2));});}var cs=8+wind*5,sw=1.5+wind*1.6;if(gTrees.parentNode)TREES.forEach(function(T){var a1=Math.sin(t*0.9+T.ph)*sw+Math.sin(t*2.3+T.ph*2)*sw*0.3,o0=wp(T.v,T.z),o1=wp(T.v+a1,T.z);T.g.setAttribute('transform','translate('+(o1[0]-o0[0]).toFixed(2)+','+(o1[1]-o0[1]).toFixed(2)+')');});clouds.forEach(function(c,i2){if(i2>=cvis)return;var span=X1-X0,sx=((c.x0-X0-cs*kz*c.sp*t)%span+span)%span+X0;var sy=c.ay+(sx-c.ax)*c.sx;c.g.setAttribute('transform','translate('+sx.toFixed(2)+','+sy.toFixed(2)+')');});}
  // rain falls in slanting streaks (more of them the harder it rains), snow drifts down in flakes, swaying, and
  // carried steadily sideways by the wind (each flake on its own, never all set back at once)
  var nd=WX.kind==='snow'?Math.min(46,14+WX.snow*14):WX.kind==='rain'||WX.kind==='storm'?Math.min(46,12+WX.rain*9):0;
  drops.forEach(function(q,i2){if(i2>=nd){if(q.on){q.e.setAttribute('opacity',0);q.on=false;}return;}q.on=true;
   if(WX.kind==='snow'){var zz=2100-((t*170*q.s+q.z)%1300),vv=((q.v-wind*22*q.s*t)%2900+2900)%2900+250+40*Math.sin(t*0.9*q.s+q.ph);var w0=wp(vv,zz);q.e.setAttribute('d','M'+w0[0].toFixed(1)+','+w0[1].toFixed(1)+'h0.01');q.e.setAttribute('stroke','#ffffff');q.e.setAttribute('stroke-width',2.6);q.e.setAttribute('opacity',0.95);}
   else{var z1=2150-((t*2600*q.s+q.z*3)%1350),sl=-wind*9,vv2=((q.v+sl*0.1*t*60)%2900+2900)%2900+250;q.e.setAttribute('d',line([[vv2,z1],[vv2+sl,z1-90]]));q.e.setAttribute('stroke',dark>0.5?'#7f8a9a':'#f2f5f8');q.e.setAttribute('stroke-width',0.6);q.e.setAttribute('opacity',0.75);}});
  // a thunderstorm lights the sky now and then
  // lightning often: every one to four and a half seconds, a third of the time followed straight away by another,
  // some near and bright, some far and faint
  if(WX.kind==='storm'&&vt>nextFlash){flashT=t;flashA=0.5+0.5*Math.random();nextFlash=vt+(Math.random()<0.33?rnd(450,900):rnd(1000,4500));}var fk=t-flashT;flash.setAttribute('opacity',((fk>=0&&fk<0.35?(fk<0.08?0.55:fk<0.14?0.1:fk<0.22?0.4:0.4*(1-(fk-0.22)/0.13)):0)*flashA).toFixed(2));
  // now and then by day a few birds cross, flapping and gliding (not in rain or snow)
  if(!bird&&vt>nextBird&&S.el>2&&!wet){var n=2+Math.floor(rnd(0,3)),dir=Math.random()<0.5?-1:1,z=rnd(1300,1900);bird={t0:t,dir:dir,v0:dir<0?3150:250,b:[]};
   for(var i2=0;i2<n;i2++)bird.b.push({e:M3('path',{stroke:'#454a52','stroke-width':0.9},gBird),dv:i2*rnd(70,120)*-dir,dz:rnd(-60,60)+z,ph:rnd(0,6)});}
  if(bird){var bt=t-bird.t0,done=true;bird.b.forEach(function(q){var v=bird.v0+bird.dir*480*bt+q.dv,z=q.dz+30*Math.sin(bt*0.8+q.ph);if(v>100&&v<3300)done=false;
    var fl=Math.sin(bt*11+q.ph),gl=Math.sin(bt*1.3+q.ph)>0.3?0.25:1,a=12+14*fl*gl;q.e.setAttribute('d',line([[v-30,z+a],[v,z],[v+30,z+a]]));});
   if(done||bt>14){bird.b.forEach(function(q){q.e.remove();});bird=null;nextBird=vt+rnd(25000,70000);}}
  // an aeroplane going over, high and slow: by day a small dark shape, always drawing a vapour trail that spreads and
  // fades after it; by night only its lights, red and green at the wingtips and a white flash, and a faint moonlit
  // trail. Not above a closed sky
  if(!plane&&vt>nextPlane&&WX.cover<85&&!wet){var dir2=Math.random()<0.5?-1:1;plane={t0:t,dir:dir2,v0:dir2<0?3250:150,z:rnd(1600,2020),dz:rnd(-60,60),sp:rnd(70,110),trail:true,ta:dark>0.5?0.35:1,
   body:M3('path',{fill:'#5a5f68'},gPlane),r:M3('circle',{r:1.2,fill:'#e0473c'},gPlane),gr:M3('circle',{r:1.2,fill:'#4fd18a'},gPlane),st:M3('circle',{r:1.4,fill:'#ffffff'},gPlane)};
   if(plane.trail){var tc=dark>0.5?'#b4bdcc':'#ffffff';plane.tr={e:M3('path',{stroke:tc,'stroke-width':1.3,opacity:(0.7*plane.ta).toFixed(2)},gTrail),e2:M3('path',{stroke:tc,'stroke-width':2.4,opacity:(0.25*plane.ta).toFixed(2)},gTrail)};}}
  if(plane){var pt=t-plane.t0,pv=plane.v0+plane.dir*plane.sp*pt,pz=plane.z+plane.dz*pt/30,night=dark>0.5;
   // (the shape at 1.6 times its first size: a small but readable aeroplane)
   var nose=[pv+plane.dir*35.2,pz],tail=[pv-plane.dir*35.2,pz];plane.body.setAttribute('d',night?'':poly([[pv+plane.dir*35.2,pz],[pv-plane.dir*6.4,pz+19.2],[pv-plane.dir*16,pz+19.2],[pv-plane.dir*3.2,pz+3.2],[pv-plane.dir*28.8,pz+3.2],[pv-plane.dir*38.4,pz+12.8],[pv-plane.dir*41.6,pz+12.8],[pv-plane.dir*35.2,pz],[pv-plane.dir*41.6,pz-12.8],[pv-plane.dir*38.4,pz-12.8],[pv-plane.dir*28.8,pz-3.2],[pv-plane.dir*3.2,pz-3.2],[pv-plane.dir*16,pz-19.2],[pv-plane.dir*6.4,pz-19.2]]));
   var lw=wp(pv-plane.dir*9.6,pz+17.6),rw=wp(pv-plane.dir*9.6,pz-17.6),tw=wp(pv-plane.dir*38.4,pz);plane.r.setAttribute('cx',lw[0].toFixed(1));plane.r.setAttribute('cy',lw[1].toFixed(1));plane.gr.setAttribute('cx',rw[0].toFixed(1));plane.gr.setAttribute('cy',rw[1].toFixed(1));
   plane.st.setAttribute('cx',tw[0].toFixed(1));plane.st.setAttribute('cy',tw[1].toFixed(1));var nl=night?1:0;plane.r.setAttribute('opacity',nl*0.9);plane.gr.setAttribute('opacity',nl*0.9);plane.st.setAttribute('opacity',night&&(pt%1.3)<0.12?1:0);
   if(plane.tr){var t0v=plane.v0,len=Math.min(Math.abs(pv-t0v),900),a0=[pv-plane.dir*len,pz-plane.dz*len/(plane.sp*30)],a1=[pv-plane.dir*48,pz];plane.tr.e.setAttribute('d',line([a1,[pv-plane.dir*Math.min(len,360),pz-plane.dz*Math.min(len,360)/(plane.sp*30)]]));plane.tr.e2.setAttribute('d',line([[pv-plane.dir*Math.min(len,360),pz],a0]));}
   if(pv<-100||pv>3500){[plane.body,plane.r,plane.gr,plane.st].forEach(function(e){e.remove();});if(plane.tr)trails.push({tr:plane.tr,t0:t,ta:plane.ta});plane=null;nextPlane=vt+rnd(40000,110000);}}
  // a trail left behind thins and goes
  trails=trails.filter(function(q){var k=(t-q.t0)/18;if(k>=1){q.tr.e.remove();q.tr.e2.remove();return false;}q.tr.e.setAttribute('opacity',(0.7*q.ta*(1-k)).toFixed(2));q.tr.e2.setAttribute('opacity',(0.25*q.ta*(1-k)).toFixed(2));q.tr.e2.setAttribute('stroke-width',(2.4+3*k).toFixed(2));return true;});
  // shooting stars on a clear night: a thin line drawn across in under a second, fading from its tail
  if(!meteor&&vt>nextMeteor&&dark>0.6&&WX.cover<60&&!wet){var mv0=rnd(500,2900),mz0=rnd(1550,2060),ang=rnd(-2.6,-0.5)*(Math.random()<0.5?1:-1);meteor={t0:t,v:mv0,z:mz0,dv:Math.cos(ang)*rnd(600,1000),dz:-Math.abs(Math.sin(ang))*rnd(300,520),d:rnd(1.0,1.5),e:M3('path',{fill:'#f6f8ff',stroke:'none'},gMeteor),h:M3('circle',{r:1.5,fill:'#ffffff'},gMeteor)};}
  if(meteor){var mk2=(t-meteor.t0)/meteor.d;if(mk2>=1){meteor.e.remove();meteor.h.remove();meteor=null;nextMeteor=vt+rnd(6000,20000);}
   else{var hd=cl(mk2/0.75,0,1),hd2=1-(1-hd)*(1-hd),tl=sm(cl((mk2-0.2)/0.8,0,1)),hx2=meteor.v+meteor.dv*hd2,hz2=meteor.z+meteor.dz*hd2,tx=meteor.v+meteor.dv*tl,tz=meteor.z+meteor.dz*tl,ll=Math.hypot(hx2-tx,hz2-tz)||1,nx=-(hz2-tz)/ll*5,nz=(hx2-tx)/ll*5;
    meteor.e.setAttribute('d',poly([[tx,tz],[hx2+nx,hz2+nz],[hx2-nx,hz2-nz]]));var op=(1-sm(cl((mk2-0.7)/0.3,0,1)));meteor.e.setAttribute('opacity',(0.85*op).toFixed(2));
    var hw=wp(hx2,hz2);meteor.h.setAttribute('cx',hw[0].toFixed(1));meteor.h.setAttribute('cy',hw[1].toFixed(1));meteor.h.setAttribute('opacity',(op*(hd<1?1:0.4)).toFixed(2));}}};})();

var PLANT=$i('plant'),plantFront=null;
function plantOrder(){if(!PLANT)return;var fr=me.away||(me.F[0]+me.F[1])>2990;if(fr===plantFront)return;plantFront=fr;
 if(fr)LOW.parentNode.insertBefore(PLANT,LOW);else G.parentNode.insertBefore(PLANT,G.nextSibling);}
var GEO=null;function gp(k,o){if(!GEO)return;(GEO[k]=GEO[k]||[]).push(o);}
function draw(){var t=vt/1000;GEO={};drawDay();if(VIEW)VIEW(dayHour());plantOrder();drawChair();drawDeskA();drawDeskB();
 if(GEO){gp('deskA',{t:'box',c:[1150,400,709],ax:[[700,0,0],[0,400,0],[0,0,11]]});gp('deskB',{t:'box',c:[2300,1125,707.5],ax:[[350,0,0],[0,725,0],[0,0,12.5]]});
  if(prop.lap==='desk'){gp('deskAprops',{t:'box',c:[prop.lapU,674.5,TOPZ+11],ax:[[142,0,0],[0,101.5,0],[0,0,11]]});var ld=[0,Math.cos(prop.phi),Math.sin(prop.phi)];gp('deskAprops',{t:'box',c:A([prop.lapU,573,TOPZ+22],M(ld,100)),ax:[[142,0,0],M(ld,100),M(N(X([1,0,0],ld)),4)]});}
  if(prop.mug==='desk')gp('deskAprops',{t:'cyl',b:MUG0,u:[0,0,1],r:41,h:96});
  if(prop.roll==='desk'&&prop.rollPose){var rq=prop.rollPose,ra=N(rq.ax);gp('deskBprops',{t:'cap',a:Sb(rq.c,M(ra,rq.len/2-rq.r)),b:A(rq.c,M(ra,rq.len/2-rq.r)),r:rq.r});}}
 var vis=!me.away&&me.op>0.01;[G,LOW,OVB].forEach(function(e){e.style.display=vis?'':'none';});
 if(!vis){placeChair(false);place(CHU,sortKeep(CHU,CHP));drawShadows();return;}
 var op=me.op<0.999?me.op.toFixed(3):'1';[G,LOW,OVB].forEach(function(e){e.setAttribute('opacity',op);});
 var b=body(),f=b.f,r=b.r,bp=b.bp,k=b.k,br=2.5*Math.sin(t*1.75);
 // legs: a planted stance and a quick swing per foot; seated, the knees sit forward of the hips, a little together
 var A0=0.3*me.cyc*me.w,knees={},feet={};
 function foot(q){if(q<0.6)return [A0*(1-2*q/0.6),0];var s=(q-0.6)/0.4;return [-A0+2*A0*s*s*(3-2*s),Math.sin(Math.PI*s)];}
 [['L',-1,(me.qa+0.5)%1],['R',1,me.qa%1]].forEach(function(sd){var s=sd[1],fo=foot(sd[2]),lift=fo[1]*me.w;
  var hip=A(b.pel,M(r,88*s)),an=A([me.F[0],me.F[1],0],A(M(r,(88-16*k)*s),A(M(me.md,fo[0]),M(f,30*k))));an[2]=me.lh*lift;
  var kn0=A(mix(hip,an,0.47),M(f,20+45*lift)),kn1=A(A(b.pel,M(r,70*s)),A(M(f,395),[0,0,-55]));knees[sd[0]]=mix(kn0,kn1,k);feet[sd[0]]=an;
  gp('shoe'+sd[0],{t:'box',c:A(A(an,M(f,50)),[0,0,28]),ax:[M(f,100),M(r,39),[0,0,28]]});
  var heel=A(an,M(f,-50)),toe=A(an,M(f,150)),lat=M(r,39),hi=[0,0,56],tz=[0,0,34],q=P['shoe'+sd[0]];pb(q.p);
  pa(q.p,hullW([A(heel,lat),Sb(heel,lat),A(toe,M(lat,0.85)),Sb(toe,M(lat,0.85)),A(A(heel,lat),hi),A(Sb(heel,lat),hi),A(A(toe,M(lat,0.7)),tz),A(Sb(toe,M(lat,0.7)),tz)]),COL.shoe);pe(q.p);q.d=dep(an);});
 var sh0=P.shadow;pb(sh0.p);if(k<0.98)pa(sh0.p,hullW(ring([b.pel[0],b.pel[1],0],f,r,225,195,18)),'rgba(70,58,44,0.12)',null,null,1-k);pe(sh0.p);
 // skirt. Standing: one bell from waist to knees. Seated: hips round on the seat, the lap flat to the knees, the drape falling from the knees
 var kc=mix(knees.L,knees.R,0.5),fc=mix(feet.L,feet.R,0.5);
 // one skirt from standing to seated with nothing switching on the way: the cloth hangs from waist and hips over the two
 // knees (round as one bell while she stands, closing to the shape of each knee as she sits), then falls from the knees to
 // the hem; the top of the lap catches the light as it levels out
 var hipW=160+20*k,waist=ring(bp(0,0,150),f,r,142,110),hipR=ring(bp(0,0,10),f,r,hipW,142),kz=[0,0,32*k],kx=80-12*(1-k),ky=72+94*(1-k);
 var kL=ring(A(knees.L,kz),f,r,kx,ky,10),kR=ring(A(knees.R,kz),f,r,kx,ky,10),lapR=ring(A(b.pel,[0,0,48]),f,r,172,120).concat(ring(A(knees.L,kz),f,r,80,72,10),ring(A(knees.R,kz),f,r,80,72,10));
 var hemC=A([fc[0],fc[1],0],M(f,18+12*k));hemC[2]=55+35*k;var hem=ring(hemC,f,r,240-60*k,225-118*k,18),lr=78*(1-k)+1;
 var legs=ring(A([feet.L[0],feet.L[1],hemC[2]],M(f,15)),f,r,lr,lr,10).concat(ring(A([feet.R[0],feet.R[1],hemC[2]],M(f,15)),f,r,lr,lr,10));
 var q=P.skirtHi;pb(q.p);pa(q.p,hullW(waist.concat(hipR,kL,kR)),COL.skirt);if(k>0.02){pa(q.p,hullW(lapR),mixCol(COL.skirt,COL.lapTop,k));pa(q.p,hullW(waist.concat(hipR)),COL.skirt);}pe(q.p);
 q=P.skirtLo;pb(q.p);pa(q.p,hullW(kL.concat(kR,hem,legs)),COL.skirt);
 var az=Math.atan2(D(V3,f),D(V3,r));[-0.5,0.5].forEach(function(da){var a=az+da,dv=A(M(r,Math.cos(a)),M(f,Math.sin(a)));
  var p0=W(A(kc,A(M(r,(174-24*k)*Math.cos(a)*0.88),M(f,(166-86*k)*Math.sin(a)*0.88)))),p1=W(A(hemC,A(M(r,(240-60*k)*Math.cos(a)*0.9),M(f,(225-118*k)*Math.sin(a)*0.9))));
  var o=cl((D(dv,[1,1,0])-0.15)/0.35,0,1)*(1-k);if(o>0.01)pa(q.p,seg(p0,p1),null,COL.fold,10*S,o);});pe(q.p);q.d=dep(A(kc,[0,0,-200]));
 // torso and a sturdy neck
 q=P.torso;pb(q.p);pa(q.p,hullW(ring(bp(0,0,150),f,r,142,110).concat(ring(bp(0,0,330),f,r,162,124),ring(bp(0,0,462+br),f,r,170,104),ring(bp(0,0,515+br),f,r,124,78))),COL.top);pe(q.p);
 // the throat grows down out of the hair as she comes round to face us, so the neck never appears all at once
 // the neck is a short column standing in the neckline of her top: the neckline dips at the front and rides higher at
 // the back, with a knit collar round it; drawn over the top always, so turning shows throat, side, nape in turn with no switch
 function nring(cx,cz,rx,ry,dip){var p=[];for(var i=0;i<20;i++){var a=i/20*2*Math.PI,sa=Math.sin(a);p.push(bp(cx+ry*sa,rx*Math.cos(a),cz-dip*sa+br));}return p;}
 q=P.neck;pb(q.p);pa(q.p,hullW(nring(4,518,64,56,13)),shade(COL.top,0.86));pa(q.p,hullW(nring(5,521,51,44,13).concat(nring(12+8*cl(me.tilt+me.lean*0.7,0,1),588-36*cl(me.tilt+me.lean*0.7,0,1),46,42,0))),COL.neck);pe(q.p);
 P.torso.d=dep(bp(0,0,300));P.skirtHi.d=P.torso.d-30;
 if(GEO){var kd2=Math.abs(D(Sb(knees.L,knees.R),r))/2,kcc=A(kc,kz);gp('torso',{t:'sweep',f:f,r:r,rings:[[bp(0,0,150),142,110],[bp(0,0,330),162,124],[bp(0,0,462+br),170,104],[bp(0,0,515+br),124,78]]});
  // standing the skirt is one bell down to the knees; seated it lies over each thigh
  if(k<0.5)gp('skirtHi',{t:'sweep',f:f,r:r,rings:[[bp(0,0,150),142,110],[bp(0,0,10),hipW,142],[kcc,kd2+kx,ky]]});
  else{gp('skirtHi',{t:'sweep',f:f,r:r,rings:[[bp(0,0,150),142,110],[bp(0,0,10),hipW,142],[A(knees.L,kz),kx+20,ky+20]]});gp('skirtHi',{t:'sweep',f:f,r:r,rings:[[bp(0,0,10),hipW,142],[A(knees.R,kz),kx+20,ky+20]]});}
  gp('skirtLo',{t:'sweep',f:f,r:r,rings:[[kcc,kd2+kx,ky],[hemC,240-60*k,225-118*k]]});
  gp('neck',{t:'sweep',f:f,r:r,rings:[[bp(4,0,505+br),64,56],[bp(12,0,580+br),46,42]]});}
 drawHead(bp(14,0,HZ+br));if(GEO){var hc0=bp(14,0,HZ+br);gp('head',{t:'sph',c:hc0,r:112});gp('head',{t:'cap',a:Sb(hc0,M(f,22)),b:A(Sb(hc0,M(f,22)),[0,0,-80]),r:100});}
 // arms: two bones to wherever the hand is wanted; free arms hang and swing against the legs; hands come out of the sleeves
 var shp={L:bp(0,-SHW,SHZ+br),R:bp(0,SHW,SHZ+br)},amp=0.3*me.w*(1-k);
 // between one step and the next there is a frame with no step: a hand that had somewhere to be keeps to it for
 // that moment, rather than starting for her lap and being called back (a small hitch at every change of step)
 ['L','R'].forEach(function(s){if(hands[s])HLAST[s]={tg:hands[s],t:vt};else if(!cur&&!me.away&&HLAST[s]&&vt-HLAST[s].t<150)hands[s]=HLAST[s].tg;});
 ['L','R'].forEach(function(s){var sg=s==='R'?1:-1,side=M(r,sg),tg=hands[s],pole=N(A(A(M(f,-0.5),M(side,0.22)),[0,0,-0.8])),rel=true;
  if(!tg){if(k>0.5)tg={p:thigh(b,sg),pole:N(A(A(M(f,-0.5),M(side,0.6)),[0,0,-0.6])),hd:N(A(f,[0,0,-0.3]))};
   else{var a=-sg*amp*Math.cos(2*Math.PI*me.qa)*(s==='L'&&prop.book==='hand'?0.35:1)+0.025*Math.sin(t*1.2+sg*1.7);
    // a loose arm: nearly straight, hanging just clear of the skirt, the elbow pointing back (not out to the side)
    tg={p:A(A(shp[s],M(N(A(M(f,Math.sin(a)+0.05),[0,0,-Math.cos(a)])),LU+LF-12)),M(side,38)),pole:N(A(A(M(f,-0.6),M(side,0.1)),[0,0,-0.8]))};}}
  else rel=!!tg.rel;
  var tgp=hands[s]?deskSafe(tg.p,HC[s]||tg.p):deskOut(tg.p);
  // where a hand is wanted can change at once (one phase of a move to the next, one step to the next); then the
  // difference is not handed to the arm whole but let out over a quarter to half a second, the new aim's own
  // motion going on meanwhile, so a hand never sets off with a lurch
  if(TRAW[s]&&dt>0&&L(Sb(tgp,TRAW[s]))/dt>2100){var base=TEFF[s]||TRAW[s];TOFF[s]=Sb(base,tgp);TJT[s]=vt;TJD[s]=1000*cl(L(TOFF[s])/800,0.25,0.6);}
  TRAW[s]=tgp;if(TOFF[s]){var tq=(vt-TJT[s])/TJD[s];if(tq>=1)TOFF[s]=null;else tgp=A(tgp,M(TOFF[s],1-tq*tq*(3-2*tq)));}TEFF[s]=tgp;
  if(tg.pole)pole=tg.pole;if(!PC[s])PC[s]=pole;PC[s]=N(A(PC[s],M(Sb(pole,PC[s]),1-Math.exp(-9*dt))));pole=PC[s];
  if(!HC[s]){HC[s]=tg.p.slice();HV[s]=[0,0,0];SH0[s]=shp[s];}
  // a hand placed relative to her body goes round with her when she turns, not only along when she moves: otherwise in a
  // turn it trails behind, into her body and off what it holds
  // (a hand let go of something fixed starts going along with her gradually, not with a jerk at the moment it lets go)
  RELK[s]=rel?Math.min(1,(RELK[s]||0)+dt/0.35):0;
  if(rel){var dyw=angTo(YW0[s]===undefined?me.yaw:YW0[s],me.yaw)*RELK[s],car=A(shp[s],rotz(Sb(HC[s],SH0[s]),dyw));HC[s]=mix(HC[s],car,RELK[s]);HV[s]=rotz(HV[s],dyw);PC[s]=rotz(PC[s],dyw);}
  SH0[s]=shp[s];YW0[s]=me.yaw;
  var om=tg.fast?20:tg.slow?6:10,ac=Sb(M(Sb(tgp,HC[s]),om*om),M(HV[s],2*om)),amx=tg.fast?42000:26000,la2=L(ac);
  // a hand gathers speed, it does not leap: the pull toward a far target is capped at what an arm can do
  if(la2>amx)ac=M(ac,amx/la2);HV[s]=A(HV[s],M(ac,dt));HC[s]=A(HC[s],M(HV[s],dt));
  IKS=s;var a2=ik(shp[s],HC[s],pole);
  // last word: wherever the arm ends up, the hand is never inside a desk top. Put it on the top if the arm reaches,
  // otherwise just off the desk edge (gripping the edge is allowed: within an inch of it)
  for(var di=0;di<2;di++){var d=DESKS[di],hh=a2.h,inn=function(x,m){return x[0]>d[0]+m&&x[0]<d[1]-m&&x[1]>d[2]+m&&x[1]<d[3]-m;};
   if(inn(hh,28)&&hh[2]>d[4]-40&&hh[2]<d[5]+18){var b2=ik(shp[s],[hh[0],hh[1],d[5]+22],pole);
    if(!(inn(b2.h,28)&&b2.h[2]<d[5]+14))a2=b2;else{var o=[[hh[0]-d[0],0,d[0]+20],[d[1]-hh[0],0,d[1]-20],[hh[1]-d[2],1,d[2]+20],[d[3]-hh[1],1,d[3]-20]].sort(function(x,y){return x[0]-y[0];})[0];
     var q2=hh.slice();q2[o[1]]=o[2];a2=ik(shp[s],q2,pole);}}}
  // where the desk stopped the hand, the hand stays: it does not carry on through the top unseen and then reappear
  // below it as soon as it nears the edge
  if(L(Sb(a2.h,HC[s]))>2){HC[s]=a2.h.slice();if(HV[s][2]<0)HV[s][2]=0;}
  var e=a2.e,h=a2.h;HAND[s]=h;
  var want=N(tg.hd||Sb(h,e)),fa=N(Sb(h,e));for(var wi=0;wi<10&&D(want,fa)<0.86;wi++)want=N(mix(want,fa,0.3));HD[s]=N(A(HD[s],M(Sb(want,HD[s]),1-Math.exp(-12*dt))));var hd=HD[s];
  var wr=Sb(h,M(hd,30)),hb=Sb(h,M(hd,10)),ht=A(h,M(hd,40)),pu=P['up'+s],pf=P['fo'+s];
  if(GEO){gp('up'+s,{t:'cap',a:shp[s],b:e,r:42});gp('fo'+s,{t:'cap',a:e,b:wr,r:35});gp('hd'+s,{t:'cap',a:hb,b:ht,r:30});}
  pb(pu.p);pa(pu.p,seg(W(shp[s]),W(e)),null,COL.top,84*S);pe(pu.p);
  var dvv=D(hd,V3);if(dvv>0.15)handFront[s]=true;else if(dvv<-0.15)handFront[s]=false;
  pb(pf.p);pa(pf.p,seg(W(e),W(wr)),null,COL.top,70*S);pe(pf.p);var ph2=P['hd'+s];pb(ph2.p);pa(ph2.p,seg(W(hb),W(ht)),null,COL.skin,60*S);pe(ph2.p);ph2.d=dep(h);
  // an arm held out beside her body sorts by its side (near side over her, far side under her);
  // only when the hand comes in across her front or back does plain nearness decide
  var sb=cl(D(side,V3)/0.5,-1,1),fm=mix(e,h,0.6),lat=D(Sb(fm,bp(0,0,300)),side),bes=tg.beside?1:sm(ph(lat,110,175));
  pu.d=dep(mix(shp[s],e,0.5))+14*sb+160*sb*(tg.beside?1:sm(ph(D(Sb(e,bp(0,0,300)),side),110,175)));pf.d=dep(fm)+20*sb+160*sb*bes;});
 drawCarried(b);
 paintAll(b);drawShadows();}
// the head: bob hair, then a face cap on the sphere with cheeks, eyes and mouth, then blunt bangs and side locks that frame it
function drawHead(hc3){var q=P.head;pb(q.p);var hc=W(hc3),R=112*S,yawH=me.yaw+me.hYaw,pitch=me.tilt+me.lean*0.7,deg=Math.PI/180;
 var f0=[Math.cos(yawH),Math.sin(yawH),0],hr=[f0[1],-f0[0],0],hf=A(M(f0,Math.cos(pitch)),[0,0,-Math.sin(pitch)]),hu=A([0,0,Math.cos(pitch)],M(f0,Math.sin(pitch)));
 function hp(d){return [hc[0]+R*D(d,EX),hc[1]-R*D(d,EY)];}
 function limb(d){var v=D(d,VN);return v>=0?d:N(Sb(d,M(VN,v)));}
 function sdir(th,el){return N(A(A(M(hf,Math.cos(el)*Math.cos(th)),M(hr,Math.cos(el)*Math.sin(th))),M(hu,Math.sin(el))));}
 function ell(p,rx,ry){return 'M'+(p[0]-rx).toFixed(2)+','+p[1].toFixed(2)+'a'+rx.toFixed(2)+','+ry.toFixed(2)+' 0 1 0 '+(2*rx).toFixed(2)+',0a'+rx.toFixed(2)+','+ry.toFixed(2)+' 0 1 0 '+(-2*rx).toFixed(2)+',0Z';}
 // the bob: the head, and below it the hair hanging to a level hem round the back and sides. The hem is a horizontal
 // curve on her head, so in this projection it is an ellipse arc that turns and tilts with her head, not a level line
 var hpts=[],hj;for(hj=0;hj<36;hj++){var ha=hj/36*2*Math.PI;hpts.push([hc[0]+R*Math.cos(ha),hc[1]+R*Math.sin(ha)]);}
 // a blunt cut with a soft line: gently rounded across the nape, well-rounded corners, straight along the sides to the jaw
 var hem=[],cr=0.34,hx=0.86-cr,hb=-0.74+cr;
 for(hj=0;hj<=8;hj++){var xx=-hx+2*hx*hj/8;hem.push([xx,-0.74-0.07*(1-(xx/hx)*(xx/hx))]);}
 for(hj=0;hj<=7;hj++){var ca=-Math.PI/2+Math.PI/2*hj/7;hem.push([hx+cr*Math.cos(ca),hb+cr*Math.sin(ca)]);hem.push([-hx-cr*Math.cos(ca),hb+cr*Math.sin(ca)]);}
 for(hj=0;hj<=4;hj++){hem.push([0.86,hb+(0.18-hb)*hj/4]);hem.push([-0.86,hb+(0.18-hb)*hj/4]);}
 hem.forEach(function(e){var HV=A(A(M(hr,e[0]),M(hf,e[1])),M(hu,-0.7));hpts.push([hc[0]+R*D(HV,EX),hc[1]-R*D(HV,EY)]);});
 pa(q.p,pd(hull(hpts)),COL.hair);
 // a region of the head given in (azimuth, elevation) about her face direction, cut at the visible edge of the sphere:
 // the part that has turned away is replaced by the arc of the outline, so the region slides off the edge as she turns
 var B2=N(X(VN,EX));function lang(d){return Math.atan2(D(d,B2),D(d,EX));}
 // m>0 cuts a little inside the outline instead, on the circle where the sphere is m toward us: the face then sits inside
 // a rim of hair and, turning away, narrows to nothing there rather than at the very edge
 function onLimb(an,m){m=m||0;var c=Math.sqrt(1-m*m);return A(M(N(A(M(EX,Math.cos(an)),M(B2,Math.sin(an)))),c),M(VN,m));}
 function region(bd,inside,m){m=m||0;var n=bd.length,vs=bd.map(function(d){return D(d,VN)-m;}),items=[],any=false,i,cm=Math.sqrt(1-m*m);
  for(i=0;i<n;i++){var a=bd[i],b2=bd[(i+1)%n],va=vs[i],vb=vs[(i+1)%n];if(va>=0){items.push({p:a});any=true;}
   if((va>=0)!==(vb>=0)){var t=va/(va-vb),x=N(mix(a,b2,t));x=A(M(N(Sb(x,M(VN,D(x,VN)))),cm),M(VN,m));items.push({p:x,exit:va>=0,lim:true});}}
  if(!any)return null;var out=[];
  for(i=0;i<items.length;i++){var it=items[i];out.push(hp(it.p));
   if(it.lim&&it.exit){for(var j=1;j<=items.length;j++){var nx=items[(i+j)%items.length];if(nx.lim&&!nx.exit){
     var a0=lang(it.p),a1=lang(nx.p),d1=angTo(a0,a1),d2=d1>0?d1-2*Math.PI:d1+2*Math.PI,mid=onLimb(a0+d1/2,m),dd=inside(mid)?d1:d2;
     for(var k=1;k<10;k++)out.push(hp(onLimb(a0+dd*k/10,m)));break;}}}}
  return Math.abs(area(out))>0.4?out:null;}
 function local(d){return [Math.atan2(D(d,hr),D(d,hf)),Math.asin(cl(D(d,hu),-1,1))];}
 if(D(hf,VN)>-0.8){
  var FH=58*deg,FU=46*deg,FD=64*deg,bd=[],i;for(i=0;i<40;i++){var a=i/40*2*Math.PI,s=Math.sin(a);bd.push(sdir(FH*Math.cos(a),(s>0?FU:FD)*s));}
  // the face is cut a little inside the outline, so it comes round and goes away by widening and narrowing within the hair,
  // never as a sliver on the edge; bowing, the bob falls forward and the cut moves in further, so from above we see hair
  var fv=D(hf,VN),mF=0,fo=sm(ph(fv,-0.62,-0.2)),bow=sm(ph(pitch,0.22,0.8))*(1-sm(ph(fv,0.3,0.48))),down=sm(ph(pitch,0.22,0.6));
  var face=region(bd,function(d){var l=local(d),e=l[1]/(l[1]>0?FU:FD);return (l[0]/FH)*(l[0]/FH)+e*e<1;},mF);
  var fa=face?Math.abs(area(face)):0;if(face&&fa>5&&fo>0.01){
   // the jaw runs down to the hem of the bob, so no band of hair shows between the chin and the neck
   var hbY=hc[1]+R*1.08,ext=sm(ph(fv,-0.25,0.2)),lowP=face.filter(function(p){return p[1]>hc[1]+R*0.5;}),cxj=lowP.reduce(function(s,p){return s+p[0];},0)/Math.max(1,lowP.length);
   var low=ext>0.02?lowP.map(function(p){return [cxj+(p[0]-cxj)*0.6,Math.max(p[1],p[1]+(hbY-p[1])*ext)];}):[];
   pa(q.p,pd(low.length?hull(face.concat(low)):face),COL.skin,null,null,cl((fa-5)/14,0,1)*fo);
   var bl=vt<me.blinkTo?0.12:1,sq=1-me.squint*0.45;
   [-1,1].forEach(function(s){var d=sdir(s*35*deg,-22*deg),v=D(d,VN),o=sm(ph(v,0.12,0.34))*fo;if(o<=0.01)return;var c=cl((v-0.06)/0.5,0,1);pa(q.p,ell(hp(d),R*0.11*(0.35+0.65*c),R*0.1),'rgba(236,128,116,0.24)',null,null,o);});
   [-1,1].forEach(function(s){var d=sdir(s*23*deg,-8*deg),v=D(d,VN),o=sm(ph(v,0.16,0.36))*fo;if(o<=0.01)return;var c=cl((v-0.06)/0.45,0,1);pa(q.p,ell(hp(d),R*0.08*(0.3+0.7*c)*(1+0.25*down),R*0.118*bl*sq*(1-0.72*down)),COL.eye,null,null,o);});
   var m0=sdir(-7*deg,-33*deg),m1=sdir(0,-36*deg),m2=sdir(7*deg,-33*deg),mo=sm(ph(D(m1,VN),0.2,0.42))*fo;if(mo>0.01){var a0=hp(m0),a1=hp(m1),a2=hp(m2);
    pa(q.p,'M'+a0[0].toFixed(2)+','+a0[1].toFixed(2)+'Q'+a1[0].toFixed(2)+','+(a1[1]+R*0.035).toFixed(2)+' '+a2[0].toFixed(2)+','+a2[1].toFixed(2),null,'#7a4f45',R*0.045,mo);}}
  // blunt bangs from just above the brows up past the hairline, and side locks that frame the cheeks down to the jaw
  // bowing, the bangs hang straight down over her eyes and the side locks swing in, so the face goes under the hair
  var bL=(9-24*bow),bg=[],j;for(j=0;j<=16;j++)bg.push(sdir((-66+132*j/16)*deg,bL*deg));for(j=0;j<=4;j++)bg.push(sdir(66*deg,(bL+(59-bL)*j/4)*deg));for(j=16;j>=0;j--)bg.push(sdir((-66+132*j/16)*deg,59*deg));for(j=4;j>=0;j--)bg.push(sdir(-66*deg,(bL+(59-bL)*j/4)*deg));
  var bang=region(bg,function(d){var l=local(d);return Math.abs(l[0])<66*deg&&l[1]>bL*deg&&l[1]<59*deg;});if(bang)pa(q.p,pd(bang),COL.hair);
  [-1,1].forEach(function(s){var lk=[],th0=(40-16*bow)*deg,th1=80*deg,e0=-68*deg,e1=21*deg;
   for(j=0;j<=8;j++)lk.push(sdir(s*th0,e1+(e0-e1)*j/8));for(j=1;j<=4;j++)lk.push(sdir(s*(th0+(th1-th0)*j/4),e0));for(j=1;j<=8;j++)lk.push(sdir(s*th1,e0+(e1-e0)*j/8));for(j=3;j>=1;j--)lk.push(sdir(s*(th0+(th1-th0)*j/4),e1));
   var lock=region(lk,function(d){var l=local(d),th=l[0]*s;return th>th0&&th<th1&&l[1]>e0&&l[1]<e1;});if(lock)pa(q.p,pd(lock),COL.hair);});}
 pe(q.p);q.d=dep(hc3);}
// ---------- things in her hands ----------
function drawCarried(b){var f=b.f,r=b.r,q;
 q=P.lap;q.on=prop.lap==='carry'||prop.lap==='move';pb(q.p);if(q.on){var lp=prop.lap==='carry'?tuckPose(b):prop.lapPose;boxFaces(q.p,lp.c,lp.a[0],lp.a[1],lp.a[2],function(n){return faceCol('#2a2b2e',n,0.78,0.88);});gp('lap',{t:'box',c:lp.c,ax:lp.a});q.d=prop.lap==='carry'?(P.torso.d+P.upR.d)/2:dep(lp.c);}pe(q.p);
 q=P.mug;q.on=prop.mug==='hand'||prop.mug==='lift';pb(q.p);if(q.on){var mhd=prop.mugHd||f,mb=prop.mug==='lift'?prop.mugPos:Sb(HAND[prop.mugHand||'L'],A(M(mhd,60),[0,0,52])),hd=prop.mug==='lift'?(prop.mugHd||[0,1,0]):mhd;drawMug(q.p,mb,hd,prop.mug==='lift'?prop.mugUp:null);if(GEO){var mu=prop.mug==='lift'&&prop.mugUp?N(prop.mugUp):[0,0,1],mh=N(Sb(hd,M(mu,D(hd,mu))));gp('mug',{t:'cyl',b:mb,u:mu,r:41,h:96});}q.d=dep(A(mb,[0,0,48]));
  // at her lips the cup is in front of her face: behind her head when she faces away from us, before it when she faces us
  if(prop.mug==='lift'&&(prop.mugFace||0)>0.3){var fv=D(f,V3);q.d=P.torso.d+(fv>0?60:-60);}}pe(q.p);
 q=P.bookC;q.on=prop.book==='hand'||prop.book==='move';pb(q.p);if(q.on){var rp=bookRead(b),qq=prop.book==='move'?prop.bookK:0;
  var cc=mix(A(HAND.L,[0,0,-122]),rp.c,qq),hu=N(mix(UP,rp.hu,qq)),wd=N(mix(f,rp.wd,qq)),th=N(X(hu,wd));closedBook(q.p,cc,M(wd,70),M(hu,105),M(th,14),prop.bookCol);gp('bookC',{t:'box',c:A(cc,M(wd,1.5)),ax:[M(wd,71.5),M(hu,108),M(th,14)]});q.d=dep(cc);}pe(q.p);
 q=P.bookO;q.on=prop.book==='read';pb(q.p);if(q.on){var r2=bookRead(b),sp=r2.sp,bu=r2.bu,al=prop.spread*0.95,sb=Sb(sp,M(bu,105)),qp=q.p;
  var wings=[-1,1].map(function(sg){var wv=wing(b,sg,al),nin=N(X(bu,wv));if(D(nin,M(r,-sg))<0)nin=M(nin,-1);return {sg:sg,wv:wv,nin:nin,c:A(A(sp,M(wv,0.5)),M(nin,6))};});
  wings.sort(function(x,y){return dep(x.c)-dep(y.c);});
  // the turning page: the top sheet of the right half, swung over to the left. It keeps the gutter curve and its printed lines,
  // and its surface goes from the right half's page level to the left half's, so it starts and lands exactly on them.
  var drawPage=function(){if(prop.page<0)return;var e=ease(prop.page),wv2=wing(b,1,al*(1-2*e)),nR=wings[0].sg>0?wings[0].nin:wings[1].nin,nL=wings[0].sg>0?wings[1].nin:wings[0].nin;
   var ex=N(wv2),ez=mix(nR,nL,e),T=9,H=105,W0=L(wv2),pr=[[0.5,0.42],[7,0.7],[16,0.9],[28,1],[W0,1]];
   var P3=function(x,y,z){return A(A(A(sp,M(ex,x)),M(bu,y)),M(ez,z));},zt=pr.map(function(q2){return BOARD+T*q2[1];});
   for(var i=0;i+1<pr.length;i++){var a0=pr[i],b0=pr[i+1],n=N(X(Sb(P3(b0[0],0,zt[i+1]),P3(a0[0],0,zt[i])),bu));if(D(n,ez)<0)n=M(n,-1);if(D(n,V3)<0)n=M(n,-1);
    pa(qp,polyW([P3(a0[0],-H,zt[i]),P3(b0[0],-H,zt[i+1]),P3(b0[0],H,zt[i+1]),P3(a0[0],H,zt[i])]),faceCol(COL.page,n,0.86,0.93));}
   var zf=BOARD+T;for(var row=0;row<8;row++){var y=-76+row*20;pa(qp,seg(W(P3(W0*0.18,y,zf)),W(P3(W0*0.86,y,zf))),null,COL.ink,0.45,0.6);}};
  // the page being turned is inside the book: in front of a half whose pages we see, behind a half whose cover we see
  var drawWing=function(w0){openWing(qp,sp,w0.wv,bu,w0.nin,prop.bookCol,true);if(GEO){var wl=L(w0.wv)+3,ex=N(w0.wv);gp('bookO',{t:'box',c:A(A(sp,M(ex,wl/2)),M(w0.nin,5.8)),ax:[M(ex,wl/2),M(bu,108),M(w0.nin,5.8)]});}};
  wings.filter(function(w0){return D(w0.nin,V3)>0;}).forEach(drawWing);drawPage();wings.filter(function(w0){return D(w0.nin,V3)<=0;}).forEach(drawWing);q.d=dep(sp)-20;}pe(q.p);
 q=P.stack;q.on=prop.stackPos==='carry'||prop.stackPos==='move';pb(q.p);if(q.on){var base=prop.stackPos==='carry'?stackCarry(b):prop.stackMove,bz=base[2],yawS=Math.atan2(f[1],f[0])+Math.PI/2;
  prop.stack.forEach(function(bk){bookFaces(q.p,[base[0],base[1],bz+bk.t/2],rotz([bk.w/2,0,0],yawS+bk.yaw),rotz([0,bk.h/2,0],yawS+bk.yaw),[0,0,bk.t/2],bk.col);gp('stack',{t:'box',c:[base[0],base[1],bz+bk.t/2],ax:[rotz([bk.w/2,0,0],yawS+bk.yaw),rotz([0,bk.h/2,0],yawS+bk.yaw),[0,0,bk.t/2]]});bz+=bk.t;});q.d=dep(A(base,[0,0,60]));}pe(q.p);
 q=P.held;q.on=!!prop.held&&!heldOnDesk();pb(q.p);if(q.on){var hb=prop.held,z=hb.c[2];hb.books.forEach(function(bk){stackBook(q.p,hb.c,bk,z);gp('held',{t:'box',c:[hb.c[0],hb.c[1],z+bk.t/2],ax:[rotz([bk.w/2,0,0],bk.yaw),rotz([0,bk.h/2,0],bk.yaw),[0,0,bk.t/2]]});z+=bk.t;});q.d=dep(A(hb.c,[0,0,30]));}pe(q.p);
 // carried under the arm the roll is drawn as its front and back halves, so each can sit before or behind her on its own
 q=P.roll;q.on=prop.roll==='carry'||prop.roll==='move';pb(q.p);var qB=P.rollB;qB.on=prop.roll==='carry';pb(qB.p);
 if(q.on){var rpz=prop.roll==='carry'?rollTuck(b):prop.rollPose;if(GEO){var rx=N(rpz.ax),hl=rpz.len/2-rpz.r;if(prop.roll==='carry'){gp('roll',{t:'cap',a:Sb(rpz.c,M(rx,6)),b:A(rpz.c,M(rx,hl)),r:rpz.r});gp('rollB',{t:'cap',a:Sb(rpz.c,M(rx,hl)),b:A(rpz.c,M(rx,6)),r:rpz.r});}else gp('roll',{t:'cap',a:Sb(rpz.c,M(rx,hl)),b:A(rpz.c,M(rx,hl)),r:rpz.r});}
 if(prop.roll==='carry'){drawRoll(q.p,rpz,1);drawRoll(qB.p,rpz,-1);q.d=qB.d=(P.torso.d+P['up'+(prop.rollSide==='L'?'L':'R')].d)/2;}else{drawRoll(q.p,rpz);q.d=dep(rpz.c);}}pe(q.p);pe(qB.p);}
// ---------- painting: her body column is one block; arms and things sort around it; seated, the chair's parts join in ----------
function placeChair(withHer){if(withHer){if(G.parentNode!==CHU)CHU.appendChild(G);}else CHP.forEach(function(n){if(P[n].g.parentNode!==CHU)CHU.appendChild(P[n].g);});}
// things held in front of her chest in both hands (an open book, the pile of books, a cup): facing us, her body, then the thing,
// then her forearms and hands over it; facing away, the thing and the forearms holding it go behind her back. Each upper arm
// by whether it is nearer us than the thing.
// ---------- painting: what is really in front is painted later ----------
// Each part is also kept as a few simple solids in room millimetres (GEO). Wherever two parts overlap on the drawing,
// rays are cast through the overlap along the line of sight and whichever part is really nearer there goes on top.
// Her body keeps its own build-up (skirt, top, neck, head); everything else falls between by these tests, so a hand
// can be in front of her skirt and behind her head at once. A decision only flips on clear evidence, so nothing flickers.
function prepPrim(q){if(q.mn)return q;var pts=[],pad=0;
 if(q.t==='cap'){pts=[q.a,q.b];pad=q.r;q.ab=Sb(q.b,q.a);q.l=L(q.ab);q.u=q.l>1e-6?M(q.ab,1/q.l):[0,0,1];}
 else if(q.t==='sph'){pts=[q.c];pad=q.r;}
 else if(q.t==='box'){q.h=q.ax.map(L);q.n=q.ax.map(function(a,i){return M(a,1/(q.h[i]||1));});var e=[0,1,2].map(function(k){return Math.abs(q.ax[0][k])+Math.abs(q.ax[1][k])+Math.abs(q.ax[2][k]);});pts=[Sb(q.c,e),A(q.c,e)];}
 else if(q.t==='cyl'){pts=[q.b,A(q.b,M(q.u,q.h))];pad=q.r;}
 else if(q.t==='sweep'){q.rings.forEach(function(rg){pts.push(rg[0]);pad=Math.max(pad,rg[1],rg[2]);});q.segs=[];
  for(var i=0;i+1<q.rings.length;i++){var c0=q.rings[i][0],ax=Sb(q.rings[i+1][0],c0),u=N(ax),lat=N(Sb(q.r,M(u,D(q.r,u)))),th=N(X(u,lat));
   q.segs.push({c0:c0,ax:ax,l2:D(ax,ax)||1e-9,lat:lat,th:th,w0:q.rings[i][1],w1:q.rings[i+1][1],d0:q.rings[i][2],d1:q.rings[i+1][2]});}}
 else if(q.t==='cbox'){[q.a0,q.a1].forEach(function(a){[q.b0,q.b1].forEach(function(b){[q.z0,q.z1].forEach(function(z){pts.push(cw(a+(q.sl?q.sl*(z-q.sz):0),b,z));});});});}
 var mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];pts.forEach(function(x){for(var k=0;k<3;k++){mn[k]=Math.min(mn[k],x[k]-pad);mx[k]=Math.max(mx[k],x[k]+pad);}});q.mn=mn;q.mx=mx;return q;}
function insidePrim(q,P){var d;
 if(q.t==='sweep'){for(var i=0;i<q.segs.length;i++){var sg=q.segs[i];d=Sb(P,sg.c0);var s=D(d,sg.ax)/sg.l2;if(s<0||s>1)continue;var cc=Sb(d,M(sg.ax,s)),x=D(cc,sg.lat)/(sg.w0+(sg.w1-sg.w0)*s),y=D(cc,sg.th)/(sg.d0+(sg.d1-sg.d0)*s);if(x*x+y*y<=1)return true;}return false;}
 if(q.t==='cbox'){var c=Math.cos(chair.psi),sn=Math.sin(chair.psi),dx=P[0]-CU,dy=P[1]-(CV+chair.off),bb=dx*c+dy*sn,a=-dx*sn+dy*c,z=P[2];if(q.sl)a-=q.sl*(z-q.sz);return a>=q.a0&&a<=q.a1&&bb>=q.b0&&bb<=q.b1&&z>=q.z0&&z<=q.z1;}
 return false;}
// the nearest surface of a solid along the line of sight through P0 (on the floor plane): the largest t on P0+t(1,1,1)
function sphT(c,r,P0){var m=Sb(P0,c),b=m[0]+m[1]+m[2],cc=D(m,m)-r*r,ds=b*b-3*cc;return ds<0?null:(-b+Math.sqrt(ds))/3;}
function sideT(a,u,l,r,P0){var m=Sb(P0,a),du=u[0]+u[1]+u[2],dp=[1-u[0]*du,1-u[1]*du,1-u[2]*du],mp=Sb(m,M(u,D(m,u))),AA=D(dp,dp);if(AA<1e-9)return null;
 var BB=2*D(mp,dp),CC=D(mp,mp)-r*r,ds=BB*BB-4*AA*CC;if(ds<0)return null;var tt=(-BB+Math.sqrt(ds))/(2*AA),s=D(m,u)+tt*du;return s>=0&&s<=l?tt:null;}
function frontPrim(q,P0){var t0=-1e9,t1=1e9,k;for(k=0;k<3;k++){t0=Math.max(t0,q.mn[k]-P0[k]);t1=Math.min(t1,q.mx[k]-P0[k]);}if(t0>t1)return null;
 if(q.t==='sph')return sphT(q.c,q.r,P0);
 if(q.t==='cap'){var best=null,v=[sphT(q.a,q.r,P0),sphT(q.b,q.r,P0),sideT(q.a,q.u,q.l,q.r,P0)];v.forEach(function(x){if(x!==null&&(best===null||x>best))best=x;});return best;}
 if(q.t==='box'){var lo=-1e9,hi=1e9,dm=Sb(P0,q.c);for(k=0;k<3;k++){var n=q.n[k],p=D(dm,n),dn=n[0]+n[1]+n[2],h=q.h[k];
   if(Math.abs(dn)<1e-9){if(Math.abs(p)>h)return null;continue;}var a1=(-h-p)/dn,a2=(h-p)/dn;lo=Math.max(lo,Math.min(a1,a2));hi=Math.min(hi,Math.max(a1,a2));}return lo<=hi?hi:null;}
 if(q.t==='cyl'){var bst=sideT(q.b,q.u,q.h,q.r,P0),m=Sb(P0,q.b),du=q.u[0]+q.u[1]+q.u[2];if(Math.abs(du)>1e-9)[0,q.h].forEach(function(S0){var tt=(S0-D(m,q.u))/du,pp=Sb(A(m,[tt,tt,tt]),M(q.u,S0));if(D(pp,pp)<=q.r*q.r&&(bst===null||tt>bst))bst=tt;});return bst;}
 // swept ellipses and the chair's boxes: step in from the near side, then home in
 for(var t=t1;t>=t0;t-=9){if(insidePrim(q,[P0[0]+t,P0[1]+t,P0[2]+t])){var hiT=Math.min(t+9,t1),loT=t;for(var it=0;it<4;it++){var mid=(hiT+loT)/2;if(insidePrim(q,[P0[0]+mid,P0[1]+mid,P0[2]+mid]))loT=mid;else hiT=mid;}return loT;}}
 return null;}
function partFront(n,P0){var best=null,l=GEO[n];if(!l)return null;for(var i=0;i<l.length;i++){var f=frontPrim(prepPrim(l[i]),P0);if(f!==null&&(best===null||f>best))best=f;}return best;}
function partRect(n){var l=GEO[n];if(!l||!l.length)return null;var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 l.forEach(function(q){prepPrim(q);for(var i=0;i<8;i++){var w=W([i&1?q.mx[0]:q.mn[0],i&2?q.mx[1]:q.mn[1],i&4?q.mx[2]:q.mn[2]]);x0=Math.min(x0,w[0]);x1=Math.max(x1,w[0]);y0=Math.min(y0,w[1]);y1=Math.max(y1,w[1]);}});
 return [x0,y0,x1,y1];}
function partCenter(n){var l=GEO[n],s=[0,0,0];l.forEach(function(q){prepPrim(q);s=A(s,M(A(q.mn,q.mx),0.5));});return M(s,1/l.length);}
var PELV=[0,0,0];
// which way her body's surface faces where a thing touches it: toward us (+) the thing lies on the side we see
function outSide(n,P){var l=GEO[n];if(!l)return 0;var nv=null,best=1e18;
 l.forEach(function(q0){var q=prepPrim(q0),r,dd;
  if(q.t==='sph'){r=Sb(P,q.c);dd=Math.max(0,L(r)-q.r);dd*=dd;if(dd<best){best=dd;nv=r;}}
  // a swept body part: straight out from its axis (the line through the middles of its rings) to the thing
  else if(q.t==='sweep')q.segs.forEach(function(sg){var d=Sb(P,sg.c0),s=cl(D(d,sg.ax)/sg.l2,0,1);r=Sb(d,M(sg.ax,s));dd=D(r,r);if(dd<best){best=dd;nv=r;}});});
 return nv&&L(nv)>1e-6?cl(D(N(nv),VN)*3,-1,1):0;}
function onFloor(X,Y){var d1=(X-OX)/(C*S),d2=2*(Y-OY)/S;return [(d2+d1)/2,(d2-d1)/2,0];}
var PAIR={},PAIRN={},MIXED={};
// +1: a is in front of b where they overlap; -1: b in front of a; 0: they do not overlap
function inFront(a,b,ra,rb){var key=a<b?a+'|'+b:b+'|'+a,sg=a<b?1:-1;ra=ra||partRect(a);rb=rb||partRect(b);if(!ra||!rb)return 0;
 var x0=Math.max(ra[0],rb[0]),x1=Math.min(ra[2],rb[2]),y0=Math.max(ra[1],rb[1]),y1=Math.min(ra[3],rb[3]);if(x0>=x1||y0>=y1){delete PAIR[key];return 0;}
 var ds=[],pa=[0,0,0],pb2=[0,0,0],grid=function(nx,ny){for(var i=0;i<nx;i++)for(var j=0;j<ny;j++){var P0=onFloor(x0+(x1-x0)*(i+0.5)/nx,y0+(y1-y0)*(j+0.5)/ny),fa=partFront(a,P0);if(fa===null)continue;var fb=partFront(b,P0);if(fb!==null){ds.push(fa-fb);pa=A(pa,A(P0,[fa,fa,fa]));pb2=A(pb2,A(P0,[fb,fb,fb]));}}};
 grid(x1-x0>12?5:3,y1-y0>12?5:3);
 // a small overlap in a corner of a big box can slip between the rays: look again, finer
 if(!ds.length&&(x1-x0>8||y1-y0>8))grid(x1-x0>8?11:3,y1-y0>8?11:3);
 if(!ds.length)return 0;
 ds.sort(function(x,y){return x-y;});var med=ds[ds.length>>1]*sg,prev=PAIR[key],dec=med>0?1:-1;
 // a hand or a thing pressed into her body (a hand hanging against the skirt, a book held to her chest) is partly in
 // front and partly behind: then the side of her it is on decides, near side over her, far side under her
 var ia=BODY.indexOf(a)>=0,ib=BODY.indexOf(b)>=0;if(ia!==ib&&ds.length>=3){var npos=0,nneg=0;ds.forEach(function(x){if(x>4)npos++;else if(x<-4)nneg++;});
  var mx=MIXED[key];mx=mx?(npos>=ds.length*0.1&&nneg>=ds.length*0.1):(npos>=ds.length*0.3&&nneg>=ds.length*0.3);MIXED[key]=mx;
  // judged where they actually meet: the mean of the thing's own surface points over the overlap
  if(mx){var c=M(ia?pb2:pa,1/ds.length),sd=outSide(ia?a:b,c);med=(ia?-1:1)*sd*sg*40;dec=med>0?1:-1;}}
 var dk=a==='deskB'||b==='deskB',dz=dk?4:10;if(prev&&prev!==dec&&Math.abs(med)<dz)dec=prev;   // too close to call: stay as it was
 // a flip has to hold for a few frames unless the evidence is strong, so two parts pressed together do not flicker
 if(prev&&dec!==prev){if(Math.abs(med)<50&&(PAIRN[key]=(PAIRN[key]||0)+1)<(dk?2:5))dec=prev;else PAIRN[key]=0;}else PAIRN[key]=0;
 PAIR[key]=dec;return dec*sg*Math.max(1,Math.abs(med));}
// order a set of parts: real overlaps decide, her body keeps its build-up, the rest keeps last frame's order
function geoOrder(par,nodes,chains,rankOf){var prev=par._last||[],rect={},ord=[];nodes.forEach(function(n){rect[n]=partRect(n);});
 var rank={};nodes.forEach(function(n){var i=prev.indexOf(n);rank[n]=(rankOf?rankOf(n)*1e5:0)+(i>=0?i:P[n].d/1000+prev.length);});
 var inE={},outE={},wt={};nodes.forEach(function(n){inE[n]=[];outE[n]=[];});
 function edge(a,b,w){if(a===b||inE[b].indexOf(a)>=0)return;outE[a].push(b);inE[b].push(a);wt[a+'>'+b]=w;}
 var fixed={'foL|hdL':1,'foR|hdR':1,'shoeL|skirtLo':1,'shoeR|skirtLo':1};
 for(var i=0;i<nodes.length;i++)for(var j=i+1;j<nodes.length;j++){var a=nodes[i],b=nodes[j];if(!rect[a]||!rect[b]||(BODY.indexOf(a)>=0&&BODY.indexOf(b)>=0)||fixed[a<b?a+'|'+b:b+'|'+a])continue;var f=inFront(a,b,rect[a],rect[b]);if(f>0)edge(b,a,f);else if(f<0)edge(a,b,-f);}
 (chains||[]).forEach(function(c){for(var k=0;k+1<c.length;k++)if(nodes.indexOf(c[k])>=0&&nodes.indexOf(c[k+1])>=0)edge(c[k],c[k+1],1e6);});   // her own build-up never gives way
 var left=nodes.slice(),deg={};left.forEach(function(n){deg[n]=inE[n].length;});
 while(left.length){var pick=null;left.forEach(function(n){if(deg[n]===0&&(pick===null||rank[n]<rank[pick]))pick=n;});
  // a loop: give way where the evidence is weakest (the part whose remaining 'must be over' claims are the slightest goes next)
  if(pick===null){var best=1e9;left.forEach(function(n){var s=0;inE[n].forEach(function(m){if(left.indexOf(m)>=0)s+=wt[m+'>'+n];});if(s<best||(s===best&&rank[n]<rank[pick])){best=s;pick=n;}});}
  ord.push(pick);left.splice(left.indexOf(pick),1);outE[pick].forEach(function(m){deg[m]--;});}
 par._last=ord;return ord;}
var BODY=['skirtLo','skirtHi','torso','neck','head'],PFR=0,PSIG='',POLD=null;
function paintAll(b){PELV=b.pel;var fv3=D(b.f,V3),pH=me.tilt+me.lean*0.7;if(fv3>0.15&&pH<0.42)neckFront=true;else if(fv3<-0.15||pH>0.5)neckFront=false;
 var items=['lap','mug','bookC','bookO','stack','held','roll','rollB'];items.forEach(function(n){P[n].g.style.display=P[n].on!==false?'':'none';});
 var mine=BODY.concat(['upL','foL','hdL','upR','foR','hdR'],items.filter(function(n){return P[n].on!==false;}));
 var cc=chairCenter(),nearC=seated||(!me.atB&&Math.hypot(me.F[0]-cc[0],me.F[1]-cc[1])<700),nearB=!seated&&nearDeskB()&&(nearC||slotMain!=='top');   // only while she is drawn before the desk at all
 var nodes=mine.concat(nearC?['shoeL','shoeR'].concat(CHP):[],nearB?['deskB']:[]);if(nearB)P.deskB=P.deskB||{d:0};
 // by default (where nothing overlaps) her lower body and the chair stay under the sub desk, the rest goes over it
 var low={skirtLo:1,skirtHi:1,shoeL:1,shoeR:1,cSeat:1,cArmP:1,cArmN:1,cRailP:1,cRailN:1,cBack:1};
 var ch=[BODY,['shoeL','skirtLo'],['shoeR','skirtLo'],handFront.L?['foL','hdL']:['hdL','foL'],handFront.R?['foR','hdR']:['hdR','foR']];
 // the order is worked out every other frame (things move little in one); the frames between keep it
 var sig=nodes.join(','),o=(++PFR%2&&sig===PSIG&&POLD)?POLD:geoOrder(G,nodes,ch,nearB?function(n){return n==='deskB'?1:low[n]?0:2;}:null),k=o.indexOf('deskB');PSIG=sig;POLD=o;
 // seated or right at the chair, its seat, arms and back are painted in with her
 // her shadow on the floor is always under her: at the chair it goes under the chair too, elsewhere just before her
 if(nearC){placeChair(true);if(LOW.parentNode!==SLOT.front)SLOT.front.appendChild(LOW);}
 else{placeChair(false);var ms=SLOT[slotMain],ls=SLOT[slotLow];if(ls&&LOW.parentNode!==ls){ls.appendChild(LOW);if(ms===ls)ms.appendChild(G);}if(ms&&G.parentNode!==ms)ms.appendChild(G);place(CHU,sortKeep(CHU,CHP));}
 place(LOW,['shadow'].concat(nearC?[]:sortKeep(LOW,['shoeL','shoeR'])));
 // beside the sub desk: whatever is behind its top stays under it, what is above or before it goes over it
 if(k>=0){place(G,o.slice(0,k));place(OVB,o.slice(k+1));}else{place(G,o);place(OVB,[]);}}
function nearDeskB(){var u=me.F[0],v=me.F[1];return me.atB||(!seated&&u<1950&&u>1250&&v>200&&v<2150);}
function expand(ord,colm,key){var o=[];key=key||'COL';ord.forEach(function(n){if(n===key)o=o.concat(colm);else o.push(n);});return o;}
// a must come before b: pull a down to just under b, or (push) lift b to just over a
function cons(ord,pairs,push){for(var it=0;it<4;it++){var ch=false;pairs.forEach(function(c){var a=ord.indexOf(c[0]),b=ord.indexOf(c[1]);if(a>=0&&b>=0&&a>b){
  if(push){ord.splice(b,1);ord.splice(ord.indexOf(c[0])+1,0,c[1]);}else{ord.splice(a,1);ord.splice(b,0,c[0]);}ch=true;}});if(!ch)break;}}
// sort by nearness, but parts within a hair of each other keep last frame's order, so nothing flickers
function sortKeep(par,list){var prev=par._last||[],ord=prev.filter(function(n){return list.indexOf(n)>=0;});
 list.forEach(function(n){if(ord.indexOf(n)<0){var i=0;while(i<ord.length&&P[ord[i]].d<P[n].d)i++;ord.splice(i,0,n);}});
 for(var pass=0;pass<ord.length;pass++){var sw=false;for(var i=0;i+1<ord.length;i++){if(P[ord[i]].d>P[ord[i+1]].d+18){var tmp=ord[i];ord[i]=ord[i+1];ord[i+1]=tmp;sw=true;}}if(!sw)break;}
 par._last=ord;return ord;}
function place(par,ord){var prev=par._ord||[],same=ord.length===prev.length&&ord.every(function(n,i){return prev[i]===n&&P[n].g.parentNode===par;});
 if(!same)ord.forEach(function(n){par.appendChild(P[n].g);});par._ord=ord.slice();}
// ---------- getting about ----------
function chairBox(){var c=chairCenter();return [c[0]-340,c[0]+340,c[1]-340,c[1]+340];}
function blocked(u,v){var R=215;if(u<230||v<230)return true;
 if(u>450-R&&u<1850+R&&v<800+R)return true;
 if(u>1950-R&&u<2650+R&&v>400-R&&v<1850+R)return true;
 if(Math.hypot(u-330,v-2660)<330)return true;
 var cb=chairBox(),Rc=175;if(u>cb[0]-Rc+20&&u<cb[1]+Rc-20&&v>cb[2]-Rc+20&&v<cb[3]+Rc-20)return true;return false;}
function clear(a,b){var n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/40);for(var i=1;i<n;i++){var k=i/n,p=[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];
 if(Math.hypot(p[0]-a[0],p[1]-a[1])<230||Math.hypot(p[0]-b[0],p[1]-b[1])<230)continue;if(blocked(p[0],p[1]))return false;}return true;}
var NODES=[[420,1880],[950,2450],[1500,2400],[2250,2280],[1726,2140],[1726,1560],[1726,1090],[2700,2150],[780,2560],[1250,2150],[1050,1750]];
function route(a,b){if(clear(a,b))return [b];var pts=[a].concat(NODES,[b]),n=pts.length,dist=[],prev=[],done=[],i;
 for(i=0;i<n;i++){dist[i]=1e9;prev[i]=-1;done[i]=false;}dist[0]=0;
 for(;;){var u=-1;for(i=0;i<n;i++)if(!done[i]&&(u<0||dist[i]<dist[u]))u=i;if(u<0||dist[u]>=1e9)break;done[u]=true;if(u===n-1)break;
  for(i=0;i<n;i++)if(!done[i]&&clear(pts[u],pts[i])){var d=dist[u]+Math.hypot(pts[i][0]-pts[u][0],pts[i][1]-pts[u][1]);if(d<dist[i]){dist[i]=d;prev[i]=u;}}}
 if(prev[n-1]<0)return [b];var path=[],c=n-1;while(c>0){path.unshift(pts[c]);c=prev[c];}return path;}
function turnToward(y,rate){var d=angTo(me.yaw,y),want=(d>0?1:-1)*rate*Math.min(1,Math.abs(d)/0.55+0.1);me.av+=(want-me.av)*(1-Math.exp(-8*dt));
 var s=me.av*dt;if(Math.abs(d)<0.004||(d*s>0&&Math.abs(s)>=Math.abs(d))){me.yaw=y;me.av=0;return true;}me.yaw=angTo(0,me.yaw+s);return Math.abs(d)<0.02;}
var SV={};function spring(k,want,om){var v=SV[k]||0;v+=(om*om*(want-me[k])-2*om*v)*dt;me[k]+=v*dt;SV[k]=v;}
function gait(dist,dir,cyc,lh){if(!(me.cyc>1)||!isFinite(dist))return;me.md=dir;me.qa+=dist/me.cyc;me.cycT=cyc;me.lh=lh;}
// turning on the spot: a pivot; only a big turn takes one quiet pair of steps
function turnStep(c,y){if(c.ty0===undefined){var d=Math.abs(angTo(me.yaw,y));c.ty0=d;if(d>1.9){me.qa=Math.floor(me.qa)+0.3;c.tc=Math.max(200,d*170);me.cyc=me.cycT=c.tc;}}
 var y0=me.yaw,ok=turnToward(y,2.4),dy=Math.abs(angTo(y0,me.yaw));
 if(c.ty0>1.9&&!ok){gait(dy*170,[Math.cos(me.yaw),Math.sin(me.yaw),0],c.tc,22);me.cyc=c.tc;me.wT=Math.min(0.7,60/(0.3*c.tc));}
 if(ok)c.ty0=undefined;return ok;}
// ---------- the script ----------
var Q=[],cur=null,T0=0,lastKind='';
function step(o){Q.push(o);}
var EXITS=[[2830,2380],[1100,3030]];
var KINDS={work:{w:26,items:1},research:{w:16,items:1},drawings:{w:18,items:1},read:{w:14,items:1},gaze:{w:12,items:1},dance:{w:3.5,items:1}};
// ?scene=work|research|drawings|read|gaze|dance plays only that activity, over and over, for checking a motion
var FORCE=window.__SCENE||(function(){try{return new URLSearchParams(location.search).get('scene');}catch(e){return null;}})();
// the dance is one activity in ten: never twice running, so after anything else it comes with a chance of 1/9
function pick(){if(FORCE&&KINDS[FORCE])return FORCE;if(lastKind!=='dance'&&Math.random()<1/9)return 'dance';var c=Object.keys(KINDS).filter(function(k){return k!==lastKind&&k!=='dance';}),sum=0,i;c.forEach(function(k){sum+=KINDS[k].w;});
 var r=Math.random()*sum;for(i=0;i<c.length;i++){r-=KINDS[c[i]].w;if(r<=0)return c[i];}return c[0];}
function towardChair(){return Math.atan2(CV+chair.off-me.F[1],CU-me.F[0]);}
// she turns the seat to face her, sits, swings round with it to the desk, scoots in; and the reverse
// sitting down and getting up, each as one movement: she steps round to the chair as she reaches for its arm, swings
// it round to her, and is already stepping in and turning her back to it while it comes; she starts down before the
// turn is quite done. Turning it back to the desk and pulling herself in overlap the same way.
function sitDown(){step({k:'takeSeat'});step({k:'settleIn'});}
function standUp(){step({k:'settleOut'});step({k:'leaveSeat'});}
function plan(){var kind=pick();lastKind=kind;
 var items=KINDS[kind].items,ex=EXITS[kind==='read'?1:Math.random()<0.5?0:1],ex2=EXITS[Math.random()<0.5?0:1];
 if(me.away)step({k:'enter',from:ex,carry:kind});
 else if(items){step({k:'go',pt:ex});step({k:'leave',len:rnd(0.1,0.3)});step({k:'enter',from:ex,carry:kind});}
 if(kind==='work'){step({k:'go',pt:DESKSIDE,arrive:{yaw:-Math.PI/2,dist:650}});step({k:'place'});sitDown();step({k:'slide',to:LAPU});step({k:'open'});
  step({k:'work',len:rnd(16,26)});step({k:'close'});step({k:'slide',to:LAPU0});standUp();step({k:'go',pt:DESKSIDE,arrive:{yaw:-Math.PI/2,dist:650}});step({k:'pickup'});}
 else if(kind==='research'){step({k:'go',pt:DESKSIDE,arrive:{yaw:-Math.PI/2,dist:650}});step({k:'putStack'});sitDown();
  var n=2+(Math.random()<0.4?1:0),chinAt=Math.floor(Math.random()*n);for(var i=0;i<n;i++){step({k:'takeBook'});step({k:'study',len:rnd(4.5,7.5),hasChin:i===chinAt});step({k:'doneBook'});}
  step({k:'gather'});standUp();step({k:'go',pt:DESKSIDE,arrive:{yaw:-Math.PI/2,dist:650}});step({k:'takeStack'});}
 else if(kind==='drawings'){step({k:'go',pt:[1770,UNV],arrive:{yaw:0,dist:700},during:rollIn});step({k:'placeRoll'});step({k:'unroll'});step({k:'examine',len:rnd(15,25)});step({k:'rollUp'});step({k:'takeRoll'});}
 else if(kind==='read'){// she comes in already reading, wanders a little with her nose in the book, stops to read, moves on
  var spots=[[1250,2450],[800,2440],[950,2180],[1350,2150]].sort(function(){return Math.random()-0.5;});
  step({k:'go',pt:spots[0]});step({k:'read',len:rnd(3.6,6)});step({k:'go',pt:spots[1]});step({k:'read',len:rnd(4.8,8.4)});
  if(Math.random()<0.6){step({k:'go',pt:spots[2]});step({k:'read',len:rnd(3,5.4)});}
  step({k:'closeBook'});step({k:'face',yaw:Math.PI});step({k:'gaze',len:rnd(1.8,2.8)});}
 else if(kind==='think'){step({k:'go',pt:[1760,1350]});step({k:'face',yaw:0});step({k:'think',len:rnd(6,9)});}
 else if(kind==='gaze'){step({k:'go',pt:[420,1880]});step({k:'face',yaw:Math.PI});step({k:'gaze',len:rnd(4.2,7),back:true});}
 else if(kind==='dance'){step({k:'go',pt:[1050,2250]});step({k:'face',yaw:Math.PI/4});step({k:'dance',len:6.4});}
 if(items){step({k:'go',pt:ex2});step({k:'leave',len:rnd(0.1,0.3)});}}
var RD={np:0,pt:-1};
function readHands(b,turns){var t=vt/1000,bh2=N(A(UP,M(b.f,0.3)));if(RD.pt<0&&turns&&t>RD.np)RD.pt=t;
 if(RD.pt>=0){var pp=(t-RD.pt)/0.95;if(pp>=1){prop.page=-1;RD.pt=-1;RD.np=t+rnd(5.5,8.5);}else prop.page=pp;}
 hands.L=H(bookHold(b,-1),{rel:true,pole:elbowsIn(b,-1),hd:bh2});
 if(prop.page>=0&&prop.page<0.62){var rp3=bookRead(b),be=0.95*(1-2*ease(prop.page));hands.R=H(A(Sb(rp3.sp,M(rp3.bu,10)),M(wing(b,1,be),0.9)),{rel:true,fast:true,pole:elbowsIn(b,1),hd:bh2});}
 else hands.R=H(bookHold(b,1),{rel:true,pole:elbowsIn(b,1),hd:bh2});}
function next(){cur=Q.shift();if(!cur){plan();cur=Q.shift();}T0=vt;}
function val(x){return typeof x==='function'?x():x;}
// where her eyes rest: one point held for a few seconds, then a quick turn of the head to another, the way people look,
// not a steady sweep. v: head turn, p: a little up or down
function glance(c,amp,t0,t1){var t=vt/1000;if(!c.gz||t>c.gz.next)c.gz={v:(Math.random()*2-1)*amp,p:rnd(-0.06,0.05),next:t+rnd(t0,t1)};return c.gz;}
// standing still for a while she settles onto one leg, and after a few seconds onto the other or back on both
var WSH_OK={gaze:1,examine:1,read:1,face:1};
// activities run 30% shorter than they were: the long stays by their lengths, the dance and the in-between handling
// (sitting, opening, placing...) a little quicker; walking keeps its own pace
var QUICK={go:1,walkDirect:1,leave:1,enter:1,face:1,work:1,study:1,examine:1,read:1,gaze:1};
function update(){var el=(vt-T0)/1000*(cur&&!QUICK[cur.k]?(cur.k==='dance'?1/0.7:1/0.82):1),c=cur,k,b=body(),f=b.f,r=b.r,t=vt/1000;
 hands.L=hands.R=null;me.wT=0;var wantLean=0,wantTilt=0.05,wantHY=0;me.atB=false;me.sway=0;me.bounce=0;me.squint=0;
 switch(c.k){
 case 'enter':prop.lap=prop.mug=prop.book=prop.roll='away';prop.mugHand='L';prop.stackPos='away';prop.stack=[];prop.held=null;prop.open=null;prop.done=[];prop.sheet=0;prop.sheetSpan=null;
  me.F=c.from.slice();me.away=false;me.door=c.from.slice();me.doorOut=false;me.doorT=vt;me.doorD=650;me.w=0;me.qa=Math.floor(me.qa)+0.3;HC.L=HC.R=null;PC.L=PC.R=null;SV={};me.sitK=0;seated=false;
  if(c.carry==='work'){prop.lap='carry';prop.mug='hand';prop.lapU=LAPU0;}else if(c.carry==='read'){prop.book='read';prop.spread=1;prop.page=-1;RD.np=vt/1000+rnd(3,5);RD.pt=-1;prop.bookCol=BOOKCOLS[Math.floor(Math.random()*BOOKCOLS.length)];}
  else if(c.carry==='research'){prop.stack=makeBooks(8);prop.stackPos='carry';}else if(c.carry==='drawings'){prop.roll='carry';prop.rollSide='L';prop.sheetHi=false;}else if(c.carry==='gaze'){prop.mug='hand';prop.mugHand='R';}
  me.yaw=Math.atan2(2000-c.from[1],1700-c.from[0]);cur=null;break;
 case 'go':case 'walkDirect':{if(!c.path){c.path=c.k==='go'?route(me.F,val(c.pt)):c.pts();c.i=0;c.spd=0;c.mode='start';
   // walking out of the room: she fades as she nears the way out (from where she is, if that is nearer than the fade)
   if(c.k==='go'){var xp=val(c.pt);EXITS.forEach(function(e){if(xp&&Math.abs(xp[0]-e[0])<1&&Math.abs(xp[1]-e[1])<1){me.door=e.slice();me.doorOut=true;me.doorD=Math.max(150,Math.min(650,Math.hypot(me.F[0]-e[0],me.F[1]-e[1])-30));}});}}
  var tg,du,dv,d,last,rem,fd,fin;
  if(c.k==='go'){// she follows the route by aiming at a point a little way ahead along it, so a corner becomes a curve she
   // walks round, not two straight legs and a kink; her heading turns smoothly and she goes the way she faces
   if(!c.poly){c.poly=[me.F.slice()].concat(c.path);c.s=0;}
   var pl=c.poly,best=1e18,bs=c.s,acc=0,si;for(si=0;si+1<pl.length;si++){var a0=pl[si],a1=pl[si+1],sx=a1[0]-a0[0],sy=a1[1]-a0[1],sl=Math.hypot(sx,sy)||1,pr=cl(((me.F[0]-a0[0])*sx+(me.F[1]-a0[1])*sy)/(sl*sl),0,1),
     dd=Math.hypot(me.F[0]-(a0[0]+sx*pr),me.F[1]-(a0[1]+sy*pr)),sAt=acc+pr*sl;if(sAt>=c.s-60&&sAt<=c.s+600&&dd<best){best=dd;bs=sAt;}acc+=sl;}
   c.s=Math.max(c.s,bs);var total=acc,LA=Math.max(260,Math.min(520,180+c.spd*0.45)),la=Math.min(total,c.s+LA);fin=pl[pl.length-1];
   acc=0;tg=fin;for(si=0;si+1<pl.length;si++){var b0=pl[si],b1=pl[si+1],bl=Math.hypot(b1[0]-b0[0],b1[1]-b0[1]);if(acc+bl>=la){var kk=bl>0?(la-acc)/bl:1;tg=[b0[0]+(b1[0]-b0[0])*kk,b0[1]+(b1[1]-b0[1])*kk];break;}acc+=bl;}
   fd=Math.hypot(fin[0]-me.F[0],fin[1]-me.F[1]);rem=Math.max(total-c.s,fd);if(total-c.s<=LA)tg=fin;last=rem<1300;}
  else{tg=c.path[c.i];du=tg[0]-me.F[0];dv=tg[1]-me.F[1];d=Math.hypot(du,dv);last=c.i===c.path.length-1;
   while(!last&&d<40){c.i++;tg=c.path[c.i];du=tg[0]-me.F[0];dv=tg[1]-me.F[1];d=Math.hypot(du,dv);last=c.i===c.path.length-1;}
   rem=d;for(var pi=c.i;pi<c.path.length-1;pi++)rem+=Math.hypot(c.path[pi+1][0]-c.path[pi][0],c.path[pi+1][1]-c.path[pi][1]);fin=c.path[c.path.length-1];fd=last?d:rem;}
  du=tg[0]-me.F[0];dv=tg[1]-me.F[1];d=Math.hypot(du,dv);
  if(c.during)c.during(c,rem,b);
  if(fd<3||(last&&tg===fin&&d<3)){me.F=[fin[0],fin[1]];cur=null;break;}
  // arriving somewhere to do something: over the last stretch she already turns toward it, so she ends the walk
  // facing it instead of stopping and then turning on the spot
  var yawT=Math.atan2(dv,du);if(c.arrive&&rem<c.arrive.dist)yawT=angTo(0,yawT+angTo(yawT,val(c.arrive.yaw))*sm(1-rem/c.arrive.dist));
  var dif=Math.abs(angTo(me.yaw,yawT));
  // a large change of direction is a turn on the spot first; anything smaller is taken while walking
  if(c.mode==='start'){if(dif>1.6&&!turnStep(c,yawT))break;c.mode='walk';me.cycT=STRIDE;}
  turnToward(yawT,2.6);var cyc=STRIDE;
  // the last steps are planned so she arrives on a whole step, feet together
  if(last&&fd<1200){if(c.qn===undefined){var q0=me.qa%1,base=me.qa-q0+(q0<0.3?0.3:q0<0.8?0.8:1.3),ideal=me.qa+fd/STRIDE;c.qn=base;while(c.qn+0.25<ideal)c.qn+=0.5;if(c.qn-me.qa<0.25)c.qn+=0.5;}
   cyc=cl(fd/Math.max(0.04,c.qn-me.qa),520,1150);}
  var want=(prop.book==='read'?0.55:1)*Math.min(SPD,Math.sqrt(2*420*fd)+12)*Math.pow(Math.max(0,Math.cos(Math.min(dif,1.5))),2);c.spd+=(want-c.spd)*(1-Math.exp(-4.5*dt));
  var m=Math.min(fd,c.spd*dt);if(d>0.01){var mx=du/d,my=dv/d;
   // walking, she goes the way she is facing, steering toward the point ahead; only on the last steps straight to her spot
   // (her line of travel is its own smoothed heading, so turning her body to face the desk as she arrives does not pull her off it)
   if(c.k==='go'){var ta=Math.atan2(dv,du);if(c.th===undefined){c.th=ta;c.thv=0;}var dth=angTo(c.th,ta),wv=(dth>0?1:-1)*2.4*Math.min(1,Math.abs(dth)/0.5);c.thv+=(wv-c.thv)*(1-Math.exp(-7*dt));
    var st=c.thv*dt;c.th=Math.abs(st)>=Math.abs(dth)?ta:angTo(0,c.th+st);var wq=0.75*cl(c.spd/250,0,1)*sm(cl((fd-60)/340,0,1));
    mx=Math.cos(c.th)*wq+mx*(1-wq);my=Math.sin(c.th)*wq+my*(1-wq);var ml=Math.hypot(mx,my)||1;mx/=ml;my/=ml;}
   me.F=[me.F[0]+mx*m,me.F[1]+my*m];gait(m,[mx,my,0],cyc,46);}
  me.wT=cl(c.spd/200,0,1);break;}
 case 'face':if(turnStep(c,val(c.yaw))&&el>0.1)cur=null;break;
 // set the laptop and mug down
 case 'place':{k=el/1.5;wantLean=0.36*Math.sin(Math.PI*cl(k/0.9,0,1));wantTilt=0.32;
  var e1=ease(ph(el,0,0.85));if(prop.lap==='carry'||prop.lap==='move'){if(e1>=1){prop.lap='desk';prop.lapPose=null;prop.lapU=LAPU0;}else{prop.lap='move';prop.lapPose=lapPose(b,e1,LAPU0);hands.R=H(lapGrip(prop.lapPose,e1),{fast:true});}}
  if(prop.lap==='desk'&&el<1.05)hands.R=H(lapGrip(lapDeskPose(LAPU0),1),{});
  var e2=ease(ph(el,0.35,1.05)),hold=A(MUG0,HANDLE);
  if(prop.mug==='hand'){prop.mugHd=N(mix(mugHoldDir(b,-1),[0,1,0],e2));hands.L=H(mix(mugCarry(b),hold,e2),{fast:true,hd:N(A(M(prop.mugHd,-1),[0,0,-0.15]))});if(e2>=1&&(L(Sb(HAND.L,hold))<8||el>2.2))prop.mug='desk';}else if(el<1.3)hands.L=H(hold,{hd:[0,-1,0]});
  if(k>=1&&prop.mug==='desk')cur=null;break;}
 case 'pickup':{k=el/1.6;wantLean=0.36*Math.sin(Math.PI*cl(k/0.9,0,1));wantTilt=0.32;
  var g=lapGrip(lapDeskPose(prop.lapU),1);if(prop.lap==='desk'){hands.R=H(g,{});if(el>0.45&&(L(Sb(HAND.R,g))<10||el>1.6)){prop.lap='move';c.t1=el;}}
  if(prop.lap==='move'){var e3=1-ease((el-c.t1)/0.75);if(e3<=0){prop.lap='carry';prop.lapPose=null;}else{prop.lapPose=lapPose(b,e3,prop.lapU);hands.R=H(lapGrip(prop.lapPose,e3),{fast:true});}}
  var hold2=A(MUG0,HANDLE);if(prop.mug==='desk'){if(el>0.3)hands.L=H(hold2,{hd:[0,-1,-0.15]});if(el>0.75&&(L(Sb(HAND.L,hold2))<10||el>1.9)){prop.mug='hand';prop.mugHd=[0,1,0];c.t2=el;}}
  if(prop.mug==='hand'&&c.t2!==undefined){var e4=ease((el-c.t2)/0.6);prop.mugHd=N(mix([0,1,0],mugHoldDir(b,-1),e4));if(e4<1)hands.L=H(mix(hold2,mugCarry(b),e4),{fast:true,hd:N(A(M(prop.mugHd,-1),[0,0,-0.15]))});}
  if(prop.lap==='carry'&&prop.mug==='hand'&&el-(c.t2||0)>0.65&&k>=1)cur=null;break;}
 // turn the chair by its near arm while standing beside it: only her arm moves
 case 'swivelHand':{if(c.p0===undefined)c.p0=chair.psi;k=el/1.25;var a=ease(ph(k,0.22,0.88));chair.psi=c.p0+(c.to-c.p0)*a;
  var bw4=Math.sin(Math.PI*cl(k/0.98,0,1));wantLean=0.58*bw4;me.pelZ=k>=1?0:-55*bw4;wantTilt=0.3;if(k<0.95)hands.R=H(armPad(1,-30),{fast:k>0.22,hd:N(A(cv(0,-1),[0,0,-1.3])),beside:true});if(k>=1)cur=null;break;}
 // sit back onto the seat, a hand finding the arm on her left, the other pressing her thigh; the cushion gives a little
 case 'sit':{k=el/1.0;me.sitK=ease(ph(k,0,0.88));wantLean=0.38*Math.sin(Math.PI*cl(k/0.92,0,1));wantTilt=0.15;
  if(k>0.32&&k<0.92)hands.L=H(armPad(1,-60),{});
  // the other hand smooths the skirt down the back of her thigh as she lowers, then rests on the lap
  if(k<0.9){var sw=ease(ph(k,0.12,0.62)),bk=b.bp(-95,150,120),dn=b.bp(-30,165,-10);hands.R=H(k<0.12?thigh(b,1):k<0.62?mix(bk,dn,sw):mix(dn,thigh(b,1),ease(ph(k,0.62,0.85))),{rel:true,pole:N(A(M(b.r,0.7),[0,0,-0.5])),hd:N(A(M(b.f,-0.2),[0,0,-1]))});}
  me.pelZ=-9*Math.sin(Math.PI*ph(k,0.82,1));if(me.sitK>0.25)seated=true;if(k>=1){me.sitK=1;me.pelZ=0;cur=null;}break;}
 // turn on the seat: she turns with it, her feet stepping round
 case 'swivelSeat':{if(c.p0===undefined)c.p0=chair.psi;var span=Math.abs(c.to-c.p0);k=el/(span*1.1+0.3);var a5=ease(ph(k,0.1,0.92));
  if(span<0.001){cur=null;break;}
  var old=seatF();chair.psi=c.p0+(c.to-c.p0)*a5;var nf=seatF(),mv=Math.hypot(nf[0]-old[0],nf[1]-old[1]);me.F=nf;me.yaw=frontYaw(chair.psi);
  if(!c.q){me.qa=Math.floor(me.qa)+0.3;c.q=1;}if(mv>0.01)gait(mv,N([nf[0]-old[0],nf[1]-old[1],0]),Math.max(80,span*380),24);me.cyc=Math.max(80,span*380);
  me.wT=k<0.95?1:0;wantLean=0.05;if(k>=1)cur=null;break;}
 // scoot the chair: feet walk it in two pushes; the second pull uses the desk edge
 case 'scoot':{if(c.o0===undefined){c.o0=chair.off;c.a=0;me.qa=Math.floor(me.qa)+0.3;}var d2=c.to-c.o0,fwd=d2<0;k=el/(fwd?1.2:1.0);
  if(Math.abs(d2)<1){cur=null;break;}
  var a3=fwd?0.5*ease(ph(k,0,0.42))+0.5*ease(ph(k,0.5,0.95)):ease(ph(k,0.1,0.85));
  chair.off=c.o0+d2*a3;me.F=seatF();gait(Math.abs(d2)*(a3-c.a),fwd?f:M(f,-1),Math.max(60,Math.abs(d2)),28);me.cyc=Math.max(60,Math.abs(d2));c.a=a3;me.wT=k<0.97?1:0;
  wantLean=fwd?0.12+0.06*Math.sin(Math.PI*ph(k,0.5,0.95)):0.06;wantTilt=0.2;
  if(fwd&&k>0.46&&k<0.97){hands.L=H(deskEdge(1),{hd:[0,-1,-0.3]});hands.R=H(deskEdge(-1),{hd:[0,-1,-0.3]});}
  if(!fwd&&k<0.45){hands.L=H(deskEdge(1),{hd:[0,-1,-0.3]});hands.R=H(deskEdge(-1),{hd:[0,-1,-0.3]});}
  if(k>=1)cur=null;break;}
 // the laptop drawn to her: the hands first travel out to its sides along a low arc over the desk (unhurried, from
 // wherever they were), then draw it in, staying on it to the end
 case 'slide':{k=el/1.4;if(c.u0===undefined){c.u0=prop.lapU;c.h0={L:HAND.L.slice(),R:HAND.R.slice()};}var a6=ease(ph(k,0.38,0.9));prop.lapU=c.u0+(c.to-c.u0)*a6;wantLean=0.16;wantTilt=0.26;
  var rk=sm(ph(k,0,0.38)),lf=[0,0,45*Math.sin(Math.PI*rk)];
  if(k<1){hands.L=H(A(mix(c.h0.L,[prop.lapU+150,680,744],rk),lf),{hd:[0,-1,-0.2]});hands.R=H(A(mix(c.h0.R,[prop.lapU-150,680,744],rk),lf),{hd:[0,-1,-0.2]});}if(k>=1)cur=null;break;}
 // the lid lifted from its front edge (the hands go up to it gently), then the hands settle onto the keys
 case 'open':{k=el/1.3;if(!c.h0)c.h0={L:HAND.L.slice(),R:HAND.R.slice()};var e5=ease(ph(k,0.32,0.78));prop.phi=1.85*e5;prop.on=ease(ph(k,0.8,1));wantLean=0.16;wantTilt=0.25;
  if(k<0.8){var ro=sm(ph(k,0,0.32));hands.L=H(mix(c.h0.L,lidEdge(1),ro),{fast:k>0.32});hands.R=H(mix(c.h0.R,lidEdge(-1),ro),{fast:k>0.32});}
  else{var rs=sm(ph(k,0.8,1));hands.L=H(mix(lidEdge(1),rest(1),rs),{hd:[0,-1,-0.25]});hands.R=H(mix(lidEdge(-1),rest(-1),rs),{hd:[0,-1,-0.25]});}
  if(k>=1)cur=null;break;}
 case 'work':workUpdate(c,el,t,b);wantLean=c.lean;wantTilt=c.tilt;wantHY=c.hy;if(c.done)cur=null;break;
 case 'close':{k=el/1.15;prop.on=1-ease(ph(k,0,0.2));prop.phi=1.85*(1-ease(ph(k,0.22,0.78)));wantLean=0.15;wantTilt=0.24;
  if(k<0.86){hands.L=H(lidEdge(1),{fast:k>0.22});hands.R=H(lidEdge(-1),{fast:k>0.22});}else{hands.L=H(rest(1),{hd:[0,-1,-0.25]});hands.R=H(rest(-1),{hd:[0,-1,-0.25]});}
  if(k>=1){prop.phi=0;prop.on=0;cur=null;}break;}
 // stand: lean forward over the feet, push on the arm, rise
 case 'stand':{k=el/1.1;me.sitK=1-ease(ph(k,0.2,1));wantLean=0.5*Math.sin(Math.PI*cl(k/0.82,0,1));wantTilt=0.2;
  if(k<0.55){hands.L=H(armPad(1,-60),{});hands.R=H(thigh(b,1),{rel:true});}if(me.sitK<0.25)seated=false;if(k>=1){me.sitK=0;cur=null;}break;}
 // ---- reading standing up ----
 case 'openBook':{k=el/1.3;var e6=ease(ph(k,0,0.45)),bh=N(A(UP,M(f,0.3)));
  if(prop.book==='hand'||prop.book==='move'){if(e6>=1){prop.book='read';prop.spread=0;}else{prop.book='move';prop.bookK=e6;}}
  if(prop.book==='read')prop.spread=ease(ph(k,0.45,0.95));
  hands.L=H(mix(hang(b,-1),bookHold(b,-1),e6),{rel:true,fast:true,pole:elbowsIn(b,-1),hd:bh});var eR=ease(ph(k,0.3,0.75));if(eR>0)hands.R=H(mix(hang(b,1),bookHold(b,1),eR),{rel:true,fast:true,pole:elbowsIn(b,1),hd:bh});
  wantTilt=0.38*ease(ph(k,0.1,0.7));if(k>=1)cur=null;break;}
 case 'read':{wantTilt=0.38+0.02*Math.sin(el*2.3);wantHY=0.05*((el%2.6)/2.6)-0.025;me.squint=1;readHands(b,el<c.len-1.5);
  if(el>c.len&&RD.pt<0){prop.page=-1;cur=null;}break;}
 case 'closeBook':{k=el/1.2;prop.spread=1-ease(ph(k,0,0.4));if(k>=0.45&&prop.book==='read'){prop.book='move';prop.bookK=1;}
  if(prop.book==='move'){prop.bookK=1-ease(ph(k,0.45,0.95));if(k>=0.95)prop.book='hand';}
  var bk=prop.book==='move'?prop.bookK:prop.book==='read'?1:0;hands.L=H(mix(hang(b,-1),bookHold(b,-1),bk),{rel:true,fast:true,pole:elbowsIn(b,-1)});var eR2=1-ease(ph(k,0.3,0.7));if(eR2>0)hands.R=H(mix(hang(b,1),bookHold(b,1),eR2),{rel:true,fast:true,pole:elbowsIn(b,1)});
  wantTilt=0.38*(1-ease(ph(k,0.3,0.9)));if(k>=1)cur=null;break;}
 case 'gaze':{var gz=glance(c,0.32,1.8,4.6);wantTilt=-0.04+gz.p*Math.min(1,el/2);wantHY=gz.v*Math.min(1,el/2);
  if(prop.mug==='hand'||prop.mug==='lift'){// the cup by its handle in her left hand in front of her chest; now and then the rim to her lips
   // (her left is the +r side as the room is drawn)
   if(!c.ns)c.ns=rnd(3,5);var sk=(el-c.ns)/4.4;if(sk>=1){c.ns=el+rnd(5,8);sk=-1;}
   var tw=sk>=0?sm(ph(sk,0,0.38))*(1-sm(ph(sk,0.68,1))):0,sideH=M(r,1);
   var sp=sipPose(b,b.bp(140,120,440),N(A(sideH,M(f,0.2))),tw,1);
   // arriving, the cup comes up from where she carried it to where she holds it, unhurried (about a second), the
   // cup turning with her hand; only the sips themselves are quick
   var ea=sm(ph(el,0,1.1)),chd=mugHoldDir(b,1),cpo=N(A(A(M(r,0.22),M(f,-0.7)),[0,0,-0.65])),spo=N(mix(N(A(A(M(r,0.62),M(f,-0.4)),[0,0,-0.68])),N(A(A(M(r,0.18),M(f,0.55)),[0,0,-0.82])),tw));
   hands.R=H(mix(mugCarry(b,1),sp.grip,ea),{rel:true,fast:ea>=1,hd:N(mix(N(A(M(chd,-1),[0,0,-0.15])),sp.fing,ea)),pole:N(mix(cpo,spo,ea))});
   hands.L=H(hang(b,-1),{rel:true});
   var cb=Sb(HAND.R,A(M(chd,60),[0,0,52])),lb=Sb(HAND.R,Sb(sp.grip,sp.base));
   prop.mug='lift';prop.mugHand='R';prop.mugPos=mix(cb,lb,ea);prop.mugHd=N(mix(chd,sp.hd,ea));prop.mugUp=N(mix([0,0,1],sp.up||[0,0,1],ea));prop.mugFace=tw*ea;c.tw=tw;if(tw>0.6)wantTilt=-0.06*sm(ph(tw,0.6,1));}
  // without a cup: her hands loosely together in front of her, one resting on the other, elbows easy at her sides
  else if(c.back){hands.L=H(b.bp(212,-12,84),{rel:true,hd:N(A(M(r,0.85),[0,0,-0.5])),pole:N(A(A(M(r,-0.28),M(f,-0.25)),[0,0,-0.9]))});
   hands.R=H(b.bp(204,20,70),{rel:true,hd:N(A(M(r,-0.85),[0,0,-0.55])),pole:N(A(A(M(r,0.28),M(f,-0.25)),[0,0,-0.9]))});}
  // never walk off mid-sip: a sip under way is finished first
  if(el>c.len&&!(c.tw>0.02)){if(prop.mug==='lift'){prop.mug='hand';prop.mugFace=0;prop.mugUp=null;}cur=null;}break;}
 case 'think':{wantTilt=0.3+0.04*Math.sin(el*1.1);var hc=b.bp(14,0,HZ);
  hands.R=H(A(hc,A(M(f,86),[0,0,-162])),{rel:true,pole:N(A(M(r,0.35),[0,0,-1])),hd:N(A(UP,M(f,0.2)))});hands.L=H(b.bp(175,30,285),{rel:true,pole:N(A(M(r,-0.6),[0,0,-0.8]))});
  if(el>c.len-1.3)wantTilt=0.1+0.2*Math.max(0,Math.sin((el-c.len+1.3)*5));if(el>c.len)cur=null;break;}
 case 'dance':danceUpdate(c,el,b);wantLean=c.lean;wantTilt=c.tilt;wantHY=c.hy;if(el>c.len){me.sway=0;me.bounce=0;cur=null;}break;
 case 'leave':me.away=true;me.rollHi=false;prop.mugUp=null;prop.lap=prop.lap==='desk'?'desk':'away';prop.mug=prop.mug==='desk'?'desk':'away';prop.book='away';prop.roll='away';prop.stackPos='away';
  if(!c.until)c.until=vt+(c.len||2)*1000;if(vt>c.until)cur=null;break;
 default:if(SCENE[c.k]){var o=SCENE[c.k](c,el,b,f,r);wantLean=o.lean||0;wantTilt=o.tilt!=null?o.tilt:0.05;wantHY=o.hy||0;}else cur=null;}
 // reading on the move: the open book stays up in both hands, eyes on the page, a page turned now and then
 if(prop.book==='read'&&(c.k==='go'||c.k==='walkDirect'||c.k==='face')){readHands(b,true);wantTilt=0.34+0.02*Math.sin(vt/430);me.squint=1;}
 // Randomize: a glance at the desks
 if(me.react>vt){var rk=1-(me.react-vt)/1600;if(seated){wantTilt+=0.16*Math.sin(Math.PI*rk);wantLean-=0.05*Math.sin(Math.PI*rk);}
  else{var yd=angTo(me.yaw,Math.atan2(500-me.F[1],1150-me.F[0]));wantHY=cl(yd,-1,1)*Math.sin(Math.PI*rk);}}
 // turning, her head goes first: it is already looking round into the turn while her body follows
 me.swS=(me.swS||0)+(me.sway-(me.swS||0))*(1-Math.exp(-9*dt));me.sway=me.swS;
 var yr=me.pyaw===undefined?0:angTo(me.pyaw,me.yaw)/dt;me.pyaw=me.yaw;me.yr=(me.yr||0)+(yr-(me.yr||0))*(1-Math.exp(-10*dt));
 wantHY+=cl(me.yr*0.3,-0.5,0.5);
 var idle=c&&WSH_OK[c.k]&&!seated&&me.sitK<0.05&&me.w<0.15;
 if(idle){if(!(vt<me.wshNext)){var r0=Math.random();me.wshT=r0<0.2?0:(me.wshT>0?-1:me.wshT<0?1:(r0<0.6?-1:1))*rnd(24,38);me.wshNext=vt+rnd(3500,8000);}}
 else{me.wshT=0;me.wshNext=Math.max(me.wshNext||0,vt+rnd(1800,3200));}
 spring('wsh',me.wshT||0,3);
 spring('lean',wantLean,7);spring('tilt',wantTilt,7);spring('hYaw',wantHY,6);
 me.w+=(me.wT-me.w)*(1-Math.exp(-9*dt));me.cyc+=(me.cycT-me.cyc)*(1-Math.exp(-6*dt));
 // things in her hands keep those hands busy
 var bb=body();
 // the roll in her right hand, the arm held a little out from the skirt so the roll clears it
 // passing a desk she lifts the roll just enough that it clears the top
 if(prop.roll==='carry'){var rp0=rollTuck(bb,0),need=0;DESKS.forEach(function(d){for(var s=-1;s<=1.001;s+=0.1){var x=A(rp0.c,M(rp0.ax,s*rp0.len/2));
   if(x[0]>d[0]-170&&x[0]<d[1]+170&&x[1]>d[2]-170&&x[1]<d[3]+170&&x[2]-rp0.r<d[5]+10&&x[2]+rp0.r>d[4]-260)need=Math.max(need,d[5]+12-(x[2]-rp0.r));}});
  spring('rollLift',need>0?100:me.rollHi?40:0,need>0?12:5);}else if(prop.roll!=='move')me.rollLift=0;
 var rsg=rollSg(),rsd=rsg<0?'L':'R';if(prop.roll==='carry'&&!hands[rsd]){var lk=cl((me.rollLift||0)/100,0,1);hands[rsd]=H(rollHand(bb,rsg,me.rollLift||0),{rel:true,hd:N(A(M(bb.f,0.1+0.5*lk),[0,0,-1+0.6*lk])),pole:N(A(A(M(bb.r,(0.25-0.1*lk)*rsg),M(bb.f,-0.55+0.3*lk)),[0,0,-0.8]))});}
 if(prop.lap==='carry'&&!hands.R)hands.R=H(bb.bp(150,222,130),{rel:true,pole:N(A(M(bb.r,0.8),A(M(bb.f,-0.4),[0,0,-0.6])))});
 if(prop.mug==='hand'){var mh=prop.mugHand||'L',msg=mh==='R'?1:-1;if(!hands[mh]){prop.mugHd=mugHoldDir(bb,msg);
  hands[mh]=H(mugCarry(bb,msg),{rel:true,hd:N(A(M(prop.mugHd,-1),[0,0,-0.15])),pole:N(A(A(M(bb.r,0.22*msg),M(bb.f,-0.7)),[0,0,-0.65]))});}}
 if(prop.stackPos==='carry'){var sc=stackCarry(bb),hs=stackHeight(prop.stack);if(!hands.L)hands.L=H(A(A(sc,M(bb.r,-104)),[0,0,hs*0.35]),{rel:true,hd:N(A(bb.f,[0,0,0.2]))});if(!hands.R)hands.R=H(A(A(sc,M(bb.r,104)),[0,0,hs*0.35]),{rel:true,hd:N(A(bb.f,[0,0,0.2]))});}
 // she fades out over the last steps to the way out and in over the first steps from it (eased, about a second
 // and a quarter each way); coming in, she is whole within 1.6 s whatever the distance. Near the edge of the floor she
 // is never whole
 var out=Math.max(me.F[0]-2800,me.F[1]-3000),eo=cl((-out-40)/300,0,1),dop=1;
 if(me.door){var dd=Math.hypot(me.F[0]-me.door[0],me.F[1]-me.door[1]),kd=cl((dd-30)/me.doorD,0,1);if(!me.doorOut){kd=Math.max(kd,cl((vt-me.doorT)/1600,0,1));if(kd>=1)me.door=null;}dop=kd*kd*(3-2*kd);}
 me.op=me.away?0:Math.min(eo,dop);
 if(vt>me.nextBlink){me.blinkTo=vt+130;me.nextBlink=vt+(Math.random()<0.15?300:rnd(2600,6500));}
 if(!me.away)chooseSlot();}
// which layer of the drawing she belongs in: before the chair or after it, before desk B or after it.
// A relation only changes while her body and the piece are apart on both plan axes, where they cannot overlap.
var relC=1,relB=1;
function sepRel(u0,u1,v0,v1,Rr){var u=me.F[0],v=me.F[1],aft=u-Rr>u1||v-Rr>v1,bef=u+Rr<u0||v+Rr<v0;return aft&&bef?0:aft?1:bef?-1:null;}
function chooseSlot(){if(seated){setSlot('chair','front');return;}
 var cb=chairBox(),rc=sepRel(cb[0],cb[1],cb[2],cb[3],230);
 if(rc===null){var c=chairCenter(),du=me.F[0]-(c[0]+300),dv=(c[1]-250)-me.F[1];rc=du>dv?1:-1;}
 if(rc!==0)relC=rc;var rb=sepRel(1950,2650,400,1850,230);if(rb===null)rb=-1;if(rb!==0)relB=rb;
 setSlot(relB>0?'top':relC>0?'b':'front','x');}
var slotMain='top',slotLow='top';function setSlot(main,low){if(low==='x')low=main;var key=main+'/'+low;if(key===slotKey)return;slotKey=key;slotMain=main;slotLow=low;SLOT[low].appendChild(LOW);if(main!=='chair')SLOT[main].appendChild(G);}
// ---------- at the desk: what her hands do, with human rules ----------
function workUpdate(c,el,t,b){if(!c.s){c.s={k:'look',t0:0,len:rnd(1.6,2.6)};c.sips=0;c.lastSip=-99;c.stretched=false;}
 var s=c.s,sk=(el-s.t0)/s.len;
 if(sk>=1){var left=c.len-el;if(left<=0){c.done=true;}else{var cand=[];
   if(s.k==='type'){cand.push(['look',2.2],['type',0.7]);if(el>8)cand.push(['pad',1]);
    if(el>6&&el-c.lastSip>13&&c.sips<4&&left>6)cand.push(['sip',el-c.lastSip>20?4:1.6]);
    if(!c.stretched&&el>12&&left>6)cand.push(['stretch',0.8]);}
   else if(s.k==='look')cand.push(['type',4],['pad',el>8?0.7:0]);
   else if(s.k==='pad')cand.push(['type',2],['look',1]);
   else cand.push(['look',1.6],['type',1]);
   var tot=0;cand.forEach(function(x){tot+=x[1];});var rr=Math.random()*tot,kind=cand[0][0];for(var i=0;i<cand.length;i++){rr-=cand[i][1];if(rr<=0){kind=cand[i][0];break;}}
   var lens={type:rnd(3,7.5),look:rnd(1.5,3.6),pad:rnd(1.4,2.6),sip:5.6,stretch:3.0};
   s=c.s={k:kind,t0:el,len:kind==='type'||kind==='look'||kind==='pad'?Math.min(lens[kind],Math.max(1.4,left)):lens[kind],glance:kind==='look'&&Math.random()<0.25};sk=0;if(kind==='sip'){c.sips++;c.lastSip=el;}if(kind==='stretch')c.stretched=true;}}
 c.lean=0.16;c.tilt=0.26;c.hy=0;if(prop.mug==='lift')prop.mug='desk';
 // at the keyboard the elbows hang by her sides, a little back, not out on the arm pads
 function kp(sg){return N(A(A(M(b.f,-0.5),M(b.r,0.2*sg)),[0,0,-0.85]));}
 var kd={hd:[0,-1,-0.3],pole:kp(-1)},kdR={hd:[0,-1,-0.3],pole:kp(1)};
 if(c.done){hands.L=H(rest(1),kd);hands.R=H(rest(-1),kdR);return;}
 if(s.k==='type'){var ta=Math.max(0,Math.sin(t*16.5+0.6))*(0.55+0.45*Math.sin(t*3.1)),tb=Math.max(0,Math.sin(t*15.2+2.1))*(0.55+0.45*Math.sin(t*2.7+1));
  // the hands come from resting onto the keys over a third of a second before the quick tapping starts
  var tin=sm(cl((el-s.t0)/0.35,0,1));hands.L=H(mix(rest(1),keys(1,14*ta*tin),tin),{fast:true,hd:[0,-1,-0.35],pole:kp(-1)});hands.R=H(mix(rest(-1),keys(-1,14*tb*tin),tin),{fast:true,hd:[0,-1,-0.35],pole:kp(1)});c.tilt=0.27+0.02*Math.sin(t*0.9);}
 else if(s.k==='look'){hands.L=H(rest(1),kd);hands.R=H(rest(-1),kdR);c.tilt=0.13;c.lean=0.06;if(s.glance)c.hy=-0.55*Math.sin(Math.PI*cl((sk-0.15)/0.7,0,1));}
 else if(s.k==='pad'){hands.L=H(rest(1),kd);hands.R=H([LAPU-6+14*Math.sin(t*2.1),738+8*Math.cos(t*2.1),746],kdR);c.tilt=0.22;c.lean=0.13;}
 else if(s.k==='sip'){var m1=ease(ph(sk,0,0.14)),m2=sm(ph(sk,0.16,0.46)),m3=sm(ph(sk,0.72,0.9)),m4=ease(ph(sk,0.91,1));
  // fingers through the handle; lifting, the forearm turns in so the handle swings round to the outside of her face
  // and the rim comes to the lips, then back down to the desk the way it came
  var tw=m2*(1-m3),sp=sipPose(b,A(MUG0,[0,0,96]),[0,1,0],tw),grab=A(MUG0,HANDLE),hp=mix(mix(rest(1),grab,m1),sp.grip,tw>0?1:0);if(m4>0)hp=mix(grab,rest(1),m4);if(tw>0)hp=sp.grip;
  hands.L=H(hp,{fast:true,hd:tw>0?sp.fing:[0,-1,0],pole:N(A(A(M(b.r,-0.45),M(b.f,0.05)),[0,0,-0.9]))});hands.R=H(rest(-1),kdR);
  if(sk>0.15&&sk<0.91){prop.mug='lift';prop.mugHand='L';prop.mugPos=Sb(HAND.L,Sb(sp.grip,sp.base));prop.mugHd=sp.hd;prop.mugUp=sp.up;prop.mugFace=tw;}
  c.tilt=0.2-0.24*sm(ph(sk,0.36,0.5))*(1-sm(ph(sk,0.66,0.78)));c.lean=0.03;}
 else if(s.k==='stretch'){var up=Math.sin(Math.PI*cl(sk,0,1)),hc=b.bp(14,0,HZ);
  hands.L=H(mix(rest(1),A(hc,A(M(b.r,-70),[0,0,330])),up),{fast:true,pole:N(A(M(b.r,-0.8),A(M(b.f,-0.3),[0,0,-0.2]))),hd:[0,0,1]});
  hands.R=H(mix(rest(-1),A(hc,A(M(b.r,70),[0,0,330])),up),{fast:true,pole:N(A(M(b.r,0.8),A(M(b.f,-0.3),[0,0,-0.2]))),hd:[0,0,1]});c.lean=0.16-0.32*up;c.tilt=0.26-0.52*up;}}
// ---------- the other scenes ----------
var SCENE={};
// one stretch of stepping that moves her to F and turns her to yaw, feet keeping up with both
function stepTo(c,F2,y2){var du=F2[0]-me.F[0],dv=F2[1]-me.F[1],dm=Math.hypot(du,dv),dy=Math.abs(angTo(me.yaw,y2)),ds=dm+dy*170;
 // steps no quicker than a person takes them, turning on the spot or not: a fast turn is longer steps, not a patter of them
 if(ds>0.3){if(!c.q){me.qa=Math.floor(me.qa)+0.3;c.q=1;}var cy=Math.max(300,ds/dt/1.1);gait(ds,dm>0.3?[du/dm,dv/dm,0]:[Math.cos(me.yaw),Math.sin(me.yaw),0],cy,24);me.cyc=cy;me.wT=0.8;}
 me.F=[F2[0],F2[1]];me.yaw=angTo(0,y2);}
function chairSideYaw(){return Math.atan2(CV+chair.off-CHAIRSIDE[1],CU-CHAIRSIDE[0]);}
function seatAt(psi,off){var fr=[Math.sin(psi),-Math.cos(psi)];return [CU+fr[0]*380,CV+off+fr[1]*380];}
// the sit itself, k 0..1: back onto the seat, a hand finding the arm, the other smoothing the skirt under her
function sitPhase(k,b){me.sitK=ease(ph(k,0,0.88));
 if(k>0.32&&k<0.92)hands.L=H(armPad(1,-60),{});
 if(k<0.9){var sw=ease(ph(k,0.12,0.62)),bk=b.bp(-95,150,120),dn=b.bp(-30,165,-10);hands.R=H(k<0.12?thigh(b,1):k<0.62?mix(bk,dn,sw):mix(dn,thigh(b,1),ease(ph(k,0.62,0.85))),{rel:true,pole:N(A(M(b.r,0.7),[0,0,-0.5])),hd:N(A(M(b.f,-0.2),[0,0,-1]))});}
 me.pelZ=-9*Math.sin(Math.PI*ph(k,0.82,1));if(me.sitK>0.25)seated=true;}
SCENE.takeSeat=function(c,el,b){if(!c.F0){c.F0=me.F.slice();c.y0=me.yaw;c.yc=chairSideYaw();c.yc=c.y0+angTo(c.y0,c.yc);c.ys=c.yc+angTo(c.yc,frontYaw(PSI_SIT));}
 var o={lean:0,tilt:0.25};
 // round to the side of the chair, turning to it
 if(el<1.25){var m1=ease(ph(el,0,0.9));stepTo(c,mix(c.F0,CHAIRSIDE,m1),c.y0+(c.yc-c.y0)*ease(ph(el,0,0.85)));}
 // her right hand on its arm swings it round to face her
 var sw=ease(ph(el,0.55,1.35));chair.psi=PSI_SIT*sw;
 if(el>0.35&&el<1.5)hands.R=H(armPad(1,-30),{fast:el>0.55,hd:N(A(cv(0,-1),[0,0,-1.3])),beside:true});
 var bw2=sm(ph(el,0.2,0.6))*(1-sm(ph(el,1.35,1.75)));o.lean=0.58*bw2;if(el<2.05)me.pelZ=-55*bw2;
 // a step in and round so the seat is behind her, starting while the chair is still coming
 if(el>=1.1){var m2=ease(ph(el,1.1,2.2));stepTo(c,mix(CHAIRSIDE,seatAt(PSI_SIT,chair.off),m2),c.yc+(c.ys-c.yc)*sm(ph(el,1.12,2.3)));}
 // and down, before the turn has quite finished
 if(el>2.05){var k=(el-2.05)/1.3;sitPhase(k,b);o.lean=0.38*Math.sin(Math.PI*cl(k/0.92,0,1));o.tilt=0.15;if(k>=1){me.sitK=1;me.pelZ=0;cur=null;}}
 return o;};
// seated: she turns the chair back to the desk and, before it has stopped, pulls herself in with her feet and the desk edge
SCENE.settleIn=function(c,el,b,f){if(c.p0===undefined){c.p0=chair.psi;c.o0=chair.off;}var old=seatF();
 var a=ease(ph(el,0,1.4)),s=0.5*ease(ph(el,0.95,1.5))+0.5*ease(ph(el,1.6,2.3));chair.psi=c.p0*(1-a);chair.off=c.o0+(-180-c.o0)*s;
 var nf=seatF(),mv=Math.hypot(nf[0]-old[0],nf[1]-old[1]);me.F=nf;me.yaw=frontYaw(chair.psi);
 if(!c.q){me.qa=Math.floor(me.qa)+0.3;c.q=1;}if(mv>0.01)gait(mv,N([nf[0]-old[0],nf[1]-old[1],0]),180,24);me.cyc=180;me.wT=el<2.25?1:0;
 // the hands take the desk's edge to draw the chair in and stay there to the end (the laptop is reached for from there)
 if(el>1.45){if(!c.h0)c.h0={L:HAND.L.slice(),R:HAND.R.slice()};var re=sm(ph(el,1.45,1.85)),lf=[0,0,30*Math.sin(Math.PI*re)];
  hands.L=H(A(mix(c.h0.L,deskEdge(1),re),lf),{hd:[0,-1,-0.3]});hands.R=H(A(mix(c.h0.R,deskEdge(-1),re),lf),{hd:[0,-1,-0.3]});}
 if(el>=2.4){chair.psi=0;chair.off=-180;cur=null;}return {lean:0.05+0.1*Math.sin(Math.PI*ph(el,1.6,2.3)),tilt:0.2};};
// the other way: push back from the desk and turn out in one go
SCENE.settleOut=function(c,el,b,f){if(c.o0===undefined){c.o0=chair.off;c.p0=chair.psi;}var old=seatF();
 var s=ease(ph(el,0.1,0.85)),a=ease(ph(el,0.55,1.85));chair.off=c.o0*(1-s);chair.psi=c.p0+(PSI_SIT-c.p0)*a;
 var nf=seatF(),mv=Math.hypot(nf[0]-old[0],nf[1]-old[1]);me.F=nf;me.yaw=frontYaw(chair.psi);
 if(!c.q){me.qa=Math.floor(me.qa)+0.3;c.q=1;}if(mv>0.01)gait(mv,N([nf[0]-old[0],nf[1]-old[1],0]),180,24);me.cyc=180;me.wT=el<1.8?1:0;
 if(el<0.5){hands.L=H(deskEdge(1),{hd:[0,-1,-0.3]});hands.R=H(deskEdge(-1),{hd:[0,-1,-0.3]});}
 if(el>=1.95){chair.off=0;chair.psi=PSI_SIT;cur=null;}return {lean:0.06,tilt:0.2};};
// up, a step out and round to the side of the chair, and her hand swings it back under the desk
// getting up: weight forward over her feet first (hips come forward as she leans), then up; a little slower than
// sitting down, as people rise. Then round to the side of the chair, and her hand turns it back to the desk
SCENE.leaveSeat=function(c,el,b){if(c.y0===undefined){c.y0=me.yaw;c.F0=me.F.slice();c.yc=c.y0+angTo(c.y0,chairSideYaw());}
 var o={lean:0,tilt:0.2},k=el/1.35;
 if(k<1){me.standUp=true;me.sitK=1-ease(ph(k,0.15,1));o.lean=0.5*Math.sin(Math.PI*cl(k/0.85,0,1));if(me.sitK<0.25)seated=false;}
 else{me.sitK=0;me.standUp=false;seated=false;}
 // both hands push up off the armrests, then let go and come down to her sides slowly, together (no hand left on a
 // thigh that then drops all at once)
 // (they let go while the arms are still bent, and go along with her as she rises: held on to until the arms are
 // straight, the rising body would tear them off the rests)
 if(el<0.36){hands.L=H(armPad(1,-60),{});hands.R=H(armPad(-1,-60),{});}
 else if(el<1.1){var lw=sm(ph(el,0.36,1.1));hands.L=H(mix(armPad(1,-60),hang(b,-1),lw),{rel:true});hands.R=H(mix(armPad(-1,-60),hang(b,1),lw),{rel:true});}
 if(el>0.98&&el<2.3)stepTo(c,mix(c.F0,CHAIRSIDE,ease(ph(el,0.98,2.05))),c.y0+(c.yc-c.y0)*sm(ph(el,1.02,2.15)));
 // her right hand goes calmly from her side to the chair's back as she steps round (no swing first, then a grab)
 if(el>=1.1&&el<=1.65)hands.R=H(mix(hang(b,1),armPad(1,-30),sm(ph(el,1.1,1.75))),{rel:el<1.3,beside:true});
 if(el>1.65&&el<2.85)hands.R=H(armPad(1,-30),{fast:el>1.75,hd:N(A(cv(0,-1),[0,0,-1.3])),beside:true});
 if(el>1.4){var bw3=sm(ph(el,1.4,1.75))*(1-sm(ph(el,2.65,2.95)));o.lean=Math.max(o.lean,0.58*bw3);me.pelZ=-55*bw3;}
 if(el>=2.95)me.pelZ=0;
 chair.psi=PSI_SIT*(1-ease(ph(el,1.9,2.75)));
 if(el>=2.95){chair.psi=0;cur=null;}return o;};
function stackSides(base,b,hs){var yv=rotz([1,0,0],Math.atan2(b.f[1],b.f[0])-Math.PI/2);return [A(A(base,M(yv,-104)),[0,0,hs*0.35]),A(A(base,M(yv,104)),[0,0,hs*0.35])];}
// a pile of books hugged in, set down on the desk; and picked up again
SCENE.putStack=function(c,el,b){var k=el/1.5,e=ease(ph(el,0.1,0.95)),to=[STACK0[0],STACK0[1],TOPZ+1],hs=stackHeight(prop.stack);
 if(prop.stackPos==='carry'||prop.stackPos==='move'){if(e>=1){var yo=Math.atan2(b.f[1],b.f[0])+Math.PI/2;prop.stack.forEach(function(bk){bk.yaw+=yo;});prop.stackPos='desk';}else{prop.stackPos='move';prop.stackMove=A(mix(stackCarry(b),to,e),[0,0,40*Math.sin(Math.PI*e)]);}}
 var sd=stackSides(prop.stackPos==='desk'?to:prop.stackMove,b,hs);if(el<1.25){hands.L=H(sd[0],{fast:true,hd:[0,-1,0]});hands.R=H(sd[1],{fast:true,hd:[0,-1,0]});}
 if(k>=1)cur=null;return {lean:0.36*Math.sin(Math.PI*cl(k/0.9,0,1)),tilt:0.32};};
SCENE.takeStack=function(c,el,b){var k=el/1.7,hs=stackHeight(prop.stack),from=[STACK0[0],STACK0[1],TOPZ+1],e=ease(ph(el,0.55,1.4));
 if(prop.stackPos==='desk'&&el>0.55){var yo=Math.atan2(b.f[1],b.f[0])+Math.PI/2;prop.stack.forEach(function(bk){bk.yaw-=yo;});prop.stackPos='move';}if(prop.stackPos==='move'){if(e>=1)prop.stackPos='carry';else prop.stackMove=A(mix(from,stackCarry(b),e),[0,0,40*Math.sin(Math.PI*e)]);}
 if(prop.stackPos!=='carry'){var sd=stackSides(prop.stackPos==='desk'?from:prop.stackMove,b,hs);hands.L=H(sd[0],{fast:el>0.55,hd:[0,-1,0]});hands.R=H(sd[1],{fast:el>0.55,hd:[0,-1,0]});}
 if(k>=1&&prop.stackPos==='carry')cur=null;return {lean:0.36*Math.sin(Math.PI*cl(k/0.9,0,1)),tilt:0.32};};
// at the desk: take the top book from the pile with the left hand and lay it open in front of her
function closedAt(bk){var ex=rotz([1,0,0],bk.yaw);return [OPEN0[0]+ex[0]*bk.w/2,OPEN0[1]+ex[1]*bk.w/2,TOPZ];}   // a closed book lies on the near half of where it will open
SCENE.takeBook=function(c,el,b){if(c.bk===undefined){c.bk=prop.stack.pop();c.from=[STACK0[0],STACK0[1],TOPZ+stackHeight(prop.stack)];prop.held={c:c.from.slice(),books:[c.bk]};c.h0=HAND.L.slice();}
 // her left hand goes from where it is to the top book (not from a set rest), then brings the book over unhurried
 var e=ease(ph(el,0.5,1.55)),to=closedAt(c.bk);
 if(prop.held){var p=mix(c.from,to,e);p[2]+=70*Math.sin(Math.PI*e);prop.held.c=p;var grip=A(p,[c.bk.w*0.42,c.bk.h*0.3,c.bk.t]);
  hands.L=H(el<0.5?A(mix(c.h0,A(c.from,[c.bk.w*0.42,c.bk.h*0.3,c.bk.t]),sm(el/0.5)),[0,0,40*Math.sin(Math.PI*el/0.5)]):grip,{fast:el>0.5,hd:[0,-1,-0.4]});if(e>=1){prop.held=null;prop.open={b:c.bk,op:0};c.t1=el;}}
 if(prop.open&&c.t1!==undefined){var e2=ease((el-c.t1)/0.5),bw=c.bk.w;hands.R=H([OPEN0[0]-bw*0.7,OPEN0[1]+60,TOPZ+26],{hd:[0,-1,-0.4]});
  // her hand lifts the front cover and lays it over to the far side
  var oe=ease(cl((el-c.t1)/0.75,0,1)),th=Math.PI*oe,ex=rotz([1,0,0],c.bk.yaw),edge=A([OPEN0[0],OPEN0[1],TOPZ+c.bk.t/2],A(M(ex,bw*0.85*Math.cos(th)),[0,0,bw*0.85*Math.sin(th)]));
  prop.open.op=oe;prop.page=-1;hands.L=H(A(edge,[0,40,14]),{fast:true,hd:[0,-1,-0.4]});if(el-c.t1>0.95)cur=null;}
 var lk=prop.held?prop.held.c:prop.open?OPEN0:STACK0;return {lean:0.18,tilt:0.32,hy:lookAt(lk)*0.55};};
SCENE.study=function(c,el,b){if(!c.np){c.np=rnd(3.5,6);c.pt=-1;c.chin=c.hasChin?rnd(3.5,Math.max(4,c.len-4)):1e9;}var t=vt/1000,o={lean:0.2,tilt:0.42+0.02*Math.sin(t*1.3),hy:0.05*((el%3)/3)-0.025};me.squint=1;
 if(c.pt<0&&el>c.np&&el<c.len-1)c.pt=el;
 if(c.pt>=0){var pp=(el-c.pt)/0.9;if(pp>=1){prop.page=-1;c.pt=-1;c.np=el+rnd(3.5,6);}else prop.page=pp;}
 var bw=prop.open.b.w,chin=el>c.chin&&el<c.chin+2.6;
 hands.R=H([OPEN0[0]-bw*0.72,OPEN0[1]+50,TOPZ+22],{hd:[0,-1,-0.3]});
 // pages turn from her left to her right, lifted by the left hand
 if(prop.page>=0&&prop.page<0.6){var th=Math.PI*ease(prop.page);hands.L=H([OPEN0[0]+bw*0.85*Math.cos(th),OPEN0[1]+40,TOPZ+30+bw*0.6*Math.sin(th)],{fast:true,hd:[0,-1,-0.2]});}
 else hands.L=H([OPEN0[0]+bw*0.72,OPEN0[1]+50,TOPZ+22],{hd:[0,-1,-0.3]});
 if(chin&&prop.page<0){var hc=b.bp(14,0,HZ);hands.R=H(A(hc,A(M(b.f,86),[0,0,-162])),{pole:N([0,0.2,-1]),hd:[0,0,1]});o.tilt=0.3;o.lean=0.26;}
 if(el>c.len&&c.pt<0){prop.page=-1;cur=null;}return o;};
// close it and put it on the pile on her right
SCENE.doneBook=function(c,el,b){var bk=prop.open?prop.open.b:c.bk0;if(!c.bk0)c.bk0=bk;
 var e0=ease(ph(el,0,0.7));if(prop.open&&prop.open.op>0){var th=Math.PI*(1-e0),ex=rotz([1,0,0],bk.yaw),edge=A([OPEN0[0],OPEN0[1],TOPZ+bk.t/2],A(M(ex,bk.w*0.85*Math.cos(th)),[0,0,bk.w*0.85*Math.sin(th)]));
  prop.open.op=1-e0;prop.page=-1;hands.L=H(A(edge,[0,40,14]),{fast:true,hd:[0,-1,-0.3]});hands.R=H([OPEN0[0]-bk.w*0.8,OPEN0[1]+50,TOPZ+24],{});}
 if(prop.open&&prop.open.op<=0&&el>0.75&&!prop.held){var ca=closedAt(bk);prop.held={c:ca,books:[bk]};prop.open=null;c.from=ca;c.to=[DONE0[0],DONE0[1],TOPZ+stackHeight(prop.done)];c.t1=el;}
 if(prop.held){var e=ease((el-c.t1)/0.85),p=mix(c.from,c.to,e);p[2]+=60*Math.sin(Math.PI*e);prop.held.c=p;hands.R=H(A(p,[-bk.w*0.42,bk.h*0.3,bk.t]),{fast:true,hd:[0,-1,-0.4]});
  if(e>=1){prop.done.push(bk);prop.held=null;c.t2=el;}}
 if(c.t2!==undefined&&el-c.t2>0.35)cur=null;return {lean:0.16,tilt:0.3,hy:(prop.held?lookAt(prop.held.c):c.t2!==undefined?lookAt(DONE0)*(1-sm(ph(el-c.t2,0,0.35))):0)*0.55};};
// before getting up: the read books go back on the pile, passed from her right hand to her left
SCENE.gather=function(c,el,b){if(!prop.done.length&&!prop.held){if(el>0.3)cur=null;return {lean:0.1,tilt:0.25};}
 if(!prop.held){prop.held={c:[DONE0[0],DONE0[1],TOPZ],books:prop.done.slice()};prop.done=[];c.t1=el;}
 var mid=[LAPU,700,TOPZ+60],to=[STACK0[0],STACK0[1],TOPZ+stackHeight(prop.stack)],e1=ease((el-c.t1)/0.8),e2=ease((el-c.t1-0.8)/0.8),p;
 if(e2<=0){p=mix([DONE0[0],DONE0[1],TOPZ],mid,e1);p[2]+=50*Math.sin(Math.PI*e1);hands.R=H(A(p,[-70,60,40]),{fast:true,hd:[0,-1,-0.3]});}
 else{p=mix(mid,to,e2);p[2]+=50*Math.sin(Math.PI*e2);hands.L=H(A(p,[70,60,40]),{fast:true,hd:[0,-1,-0.3]});if(e2<0.3)hands.R=H(A(p,[-70,60,40]),{fast:true});}
 prop.held.c=p;if(e2>=1){prop.stack=prop.stack.concat(prop.held.books);prop.held=null;cur=null;}return {lean:0.18,tilt:0.3,hy:(prop.held?lookAt(prop.held.c):0)*0.55};};
// the drawing: set the roll on the sub desk, unroll it along the desk, study it, roll it up again
var RV0=SHEET.v0+38,RV1=SHEET.v0+SHEET.h-38;
function rollGrips(rp){var ax=N(rp.ax),ne=Sb(rp.c,M(ax,rp.len/2));return [A(A(ne,M(ax,70)),[0,0,rp.r*0.9]),A(A(ne,M(ax,185)),[0,0,rp.r*0.9])];}   // her hands on the near end of the roll
function deskBStep(c,want){var dvv=want-me.F[1];if(Math.abs(dvv)>0.05){if(!c.q){me.qa=Math.floor(me.qa)+0.3;c.q=1;}gait(Math.abs(dvv),[0,dvv>0?1:-1,0],380,22);me.cyc=380;me.wT=0.8;}me.F=[me.F[0],want];}
// a couple of steps back from the desk before turning away, so nothing she holds swings into it
SCENE.stepBack=function(c,el,b){if(!c.p0){c.p0=me.F.slice();me.qa=Math.floor(me.qa)+0.3;}var k=el/1.1,s=260*ease(cl(k,0,1)),fx=Math.cos(me.yaw),fy=Math.sin(me.yaw);
 var tp=[c.p0[0]-fx*s,c.p0[1]-fy*s],dd=Math.hypot(tp[0]-me.F[0],tp[1]-me.F[1]);if(dd>0.05){gait(dd,[-fx,-fy,0],380,22);me.cyc=380;me.wT=0.8;}me.F=tp;if(k>=1)cur=null;return {lean:0,tilt:0.1};};
// where she stands to spread the drawing (the middle of the sheet), and where she sets the roll down: in front of her
// left shoulder, the hand that carried it never crossing her body
var UNV=1200,RVS=1330,SHL=SHEET.v0+SHEET.h;
// paper still on the roll -> its radius (a sheet rolled on itself, no core: it ends as a loose curl)
function rollR(rem){return Math.sqrt(14*14+(38*38-14*14)*cl(rem/SHEET.h,0,1));}
function lookAt(pt){var o=body().pel;return cl(angTo(me.yaw,Math.atan2(pt[1]-o[1],pt[0]-o[0])),-0.9,0.9);}   // seen from her head (over her hips), not her feet
// setting it down: she has walked up with it hanging from her left hand; she lifts it as her weight comes forward,
// carries it out over the desk and lays it down in front of her left shoulder, fore and aft; her right hand comes over
// and settles on it as it touches down
SCENE.placeRoll=function(c,el,b){if(c.l0===undefined){c.l0=me.rollLift||0;prop.sheetSpan=null;prop.sheet=0;}
 var T=1.3,x=ph(el,0,T),e=x*(0.8+x*(1.4-1.2*x)),t=rollTuck(b,c.l0),d=rollDesk(RVS,38);me.atB=true;me.rollHi=false;
 if(Math.abs(angTo(me.yaw,0))>0.003)turnToward(0,2.2);
 if(prop.roll==='carry'||prop.roll==='move'){if(e>=1){prop.roll='desk';prop.rollPose=d;}else{prop.roll='move';prop.rollPose=rollPath(t,d,e);}}
 var rq=prop.rollPose||d,ax=N(rq.ax),top=A(rq.c,[0,0,rq.r+3]);
 // the left hand keeps hold of it, round it a little in front of its middle, then rests on it once it is down
 hands.L=H(A(A(rq.c,M(ax,ROLLG)),[0,0,(rq.r+3)*sm(ph(e,0.6,1))]),{fast:true,hd:N(mix([0.1,0,-1],[1,0,-0.6],sm(ph(e,0.3,0.9))))});   // the fist opens as it lands and the palm stays on top
 if(e>0.62){var k=sm(ph(e,0.62,1));hands.R=H(A(A(top,M(ax,-150)),[0,0,40*(1-k)]),{hd:[1,0.15,-0.5]});}
 me.sway=-8*sm(ph(e,0.2,0.9));
 if(el>=T+0.15)cur=null;return {lean:0.5*sm(ph(e,0.15,0.85))-0.1*sm(ph(e,0.9,1)),tilt:0.16+0.3*sm(ph(e,0.1,0.9)),hy:lookAt(rq.c)*0.6*sm(ph(e,0,0.5))};};
// walking up to the desk with the roll: over the last step her hand comes up a little, ready to lift it on
function rollIn(c,rem){if(prop.roll==='carry'&&rem<520)me.rollHi=true;}
// spreading it: the left hand finds the free edge under the roll and draws it out to the left while the right hand keeps
// the roll from following; then the left hand holds that edge down and the right rolls the rest out to the right,
// her eyes and weight going with each hand in turn; the last curl is pressed flat
SCENE.unroll=function(c,el,b){me.atB=true;var a=ease(ph(el,0.3,1.25)),s=ph(el,1.45,3.15),sv=s*s*(3-2*s),fin=ph(el,3.0,3.55);
 var ed=RVS+(SHL-RVS)*a,vr=RVS+(SHEET.v0-RVS)*sv,rem=SHEET.h-(ed-vr),rr=rollR(rem)*(1-sm(fin));
 prop.sheetSpan={lo:vr,hi:ed,dv:ed-SHL};
 if(rr>1.5){prop.roll='desk';prop.rollPose=rollDesk(vr,rr);}else prop.roll='away';
 var u1=SHEET.u0+150,lift=12*Math.sin(Math.PI*a);
 // left: off the top of the roll, round to its edge, out to the left with the edge pinched up a little, then flat on it
 var pinch=[u1,ed+6,TOPZ+5+lift],press=[u1+25,SHL-48,TOPZ+3],k0=sm(ph(el,0,0.3)),kp=sm(ph(el,1.2,1.45));
 var Lp=el<0.3?mix(A(A(prop.rollPose?prop.rollPose.c:[SHEET.u0+297,RVS,TOPZ+38],[ROLLG,0,0]),[0,0,rr+3]),[u1,RVS+rr+8,TOPZ+6],k0):mix(pinch,press,kp);
 hands.L=H(Lp,{fast:true,hd:el<1.2?[1,-0.2,-0.55]:[1,0.1,-0.35]});
 // right: on the near part of the roll holding it, then behind it pushing it along, then flat on the last of the sheet
 var onRoll=[SHEET.u0+140,vr+rr*0.45,TOPZ+rr*1.85+3],flat=[u1+20,SHEET.v0+52,TOPZ+3],kf=sm(ph(el,3.0,3.4));
 hands.R=H(mix(onRoll,flat,kf),{fast:s>0&&s<1,hd:kf>0.5?[1,-0.1,-0.35]:[1,0.1,-0.5]});
 // where she looks and leans: at the left hand while it draws the edge out, then after the roll; weight to that side
 var gl=1-sm(ph(el,1.2,1.6)),gp2=[u1,gl*ed+(1-gl)*vr];if(fin>0)gp2[1]=gp2[1]+(UNV-gp2[1])*sm(fin);
 me.sway=-24*sm(ph(el,0.2,0.9))*gl+22*Math.sin(Math.PI*0.5*sv)*(1-sm(fin))*(1-gl);
 if(el>=3.6){prop.sheetSpan=null;prop.sheet=SHEET.h;prop.roll='away';cur=null;}
 return {lean:0.4+0.08*gl*sm(ph(el,0.2,0.9))+0.1*Math.abs(Math.sin(Math.PI*(sv-0.5)))*(1-gl),tilt:0.46,hy:lookAt(gp2)*0.65};};
// places worth a finger on the sheet: the 1F living room, an upstairs bedroom, the roof and floor in section, the balcony in elevation, the area table
var POINTS=[[2419,1005],[2419,1220],[2437,1284],[2214,974],[2151,1000],[2164,1292],[2114,1230],[2404,1450],[2419,905]];
SCENE.examine=function(c,el,b,f,r){me.atB=true;prop.sheet=SHEET.h;if(!c.s){c.s={k:'shift',t0:0,len:1.8,from:me.F[1],to:BSPOT[1]};}
 var s=c.s,sk=(el-s.t0)/s.len,t=vt/1000;
 if(sk>=1){if(el>c.len){cur=null;return {lean:0.25,tilt:0.4};}
  var kinds=['point','look','lean','chin','shift'].filter(function(x){return x!==s.k;}),kind=el>c.len-3?'look':kinds[Math.floor(Math.random()*kinds.length)];
  s=c.s={k:kind,t0:el,len:kind==='point'?rnd(2.5,4.5):kind==='shift'?1.6:rnd(2,3.6),from:me.F[1],to:cl(BSPOT[1]+rnd(-260,260),1000,1450),pt:POINTS[Math.floor(Math.random()*POINTS.length)],pt2:POINTS[Math.floor(Math.random()*POINTS.length)]};sk=0;}
 var o={lean:0.3,tilt:0.5,hy:0},restL=[1990,me.F[1]+165,TOPZ+20],restR=[1990,me.F[1]-165,TOPZ+20];
 hands.L=H(restL,{hd:[1,0,-0.4]});hands.R=H(restR,{hd:[1,0,-0.4]});
 if(s.k==='point'){var a=ease(ph(sk,0,0.25))*(1-ease(ph(sk,0.85,1))),bq=ease(ph(sk,0.45,0.8)),pp=mix(s.pt,s.pt2,bq);
  // the hand on that side points; she bends further for the far side of the sheet, and what is still out of reach she
  // points at from above, the finger stopping short over it rather than her arm stretching past what an arm can do
  if(s.sd===undefined)s.sd=s.pt[1]>me.F[1]+60?-1:1;var sdn=s.sd<0?'L':'R';o.lean=0.42+0.14*cl((pp[0]-2150)/260,0,1);o.tilt=0.55;
  var shp0=b.bp(0,s.sd*SHW,SHZ),tp0=[pp[0],pp[1],TOPZ+28],dd0=Sb(tp0,shp0),ln0=L(dd0),rch=LU+LF-30;if(ln0>rch)tp0=A(shp0,M(dd0,rch/ln0));
  hands[sdn]=H(mix(s.sd<0?restL:restR,tp0,a),{fast:true,hd:[1,-0.1*s.sd,-0.5]});o.hy=cl(angTo(me.yaw,Math.atan2(pp[1]-me.F[1],pp[0]-me.F[0]))*0.6,-0.5,0.5)*a;}
 else if(s.k==='lean'){o.lean=0.5;o.tilt=0.6;}
 else if(s.k==='chin'){var hc=b.bp(14,0,HZ);hands.R=H(A(hc,A(M(f,86),[0,0,-162])),{rel:true,pole:N(A(M(r,0.3),[0,0,-1])),hd:[0,0,1]});o.lean=0.12;o.tilt=0.38;}
 else if(s.k==='shift'){deskBStep(c,s.from+(s.to-s.from)*ease(sk));o.lean=0.22;o.tilt=0.45;}
 else{var gz=glance(c,0.3,1.2,2.8);o.lean=0.25;o.tilt=0.42+gz.p;o.hy=gz.v;}
 return o;};
// rolling it up, standing where she spread it: her left hand curls the left edge over and starts the roll, the right
// joins it on top and they roll it across together; the left drops away when it has gone as far as it comfortably
// reaches and the right takes it on to the right end, where she will pick it up
SCENE.rollUp=function(c,el,b){me.atB=true;prop.sheetHi=false;if(c.v0===undefined)c.v0=me.F[1];
 deskBStep(c,c.v0+(UNV-c.v0)*sm(ph(el,0,0.6)));
 var u1=SHEET.u0+150,cu=sm(ph(el,0.55,1.0)),rv=sm(ph(el,1.0,3.2)),r0=14*cu,vr=(SHL-14)+(RV0-(SHL-14))*rv,rolled=SHL-vr,rr=rv>0?rollR(rolled):r0;
 if(el>=3.45){prop.sheet=0;prop.sheetSpan=null;prop.roll='desk';prop.rollPose=rollDesk(RV0,38);cur=null;return {lean:0.36,tilt:0.42};}
 prop.sheetSpan={lo:SHEET.v0,hi:rv>0?vr:SHL-2*r0,dv:0};
 if(cu>0.02){prop.roll='desk';prop.rollPose=rollDesk(rv>0?vr:SHL-r0,Math.max(2,rr));}else prop.roll='away';
 var top=[u1,(rv>0?vr:SHL-r0)+rr*0.45,TOPZ+rr*1.85+3];
 // left: to the edge, lifts it and curls it over, then on the roll until it has rolled past her middle
 var Le=[u1,SHL-8,TOPZ+4+18*Math.sin(Math.PI*cu)],lOn=el<1.0?Le:top,lOff=[u1-60,UNV+150,TOPZ+3],lk=sm(ph(rv,0.55,0.75));
 var lRest=[u1-40,UNV+120,TOPZ+3];hands.L=H(mix(mix(mix(lRest,A(Le,[0,0,8]),sm(ph(el,0.3,0.6))),lOn,sm(ph(el,0.55,0.8))),lOff,lk),{fast:true,hd:[1,0.1,-0.45]});
 // right: resting on the sheet, then over onto the roll once it has come within reach
 var rRest=[u1+20,UNV-90,TOPZ+3],rk=sm(ph(rv,0.2,0.38));hands.R=H(mix(rRest,A(top,[60,0,0]),rk),{fast:rv>0.1,hd:[1,0.05,-0.5]});
 var gv=el<1.0?SHL:vr;me.sway=-24*(1-sm(ph(rv,0.2,0.6)))*sm(ph(el,0.3,0.6))+20*sm(ph(rv,0.5,1));
 return {lean:0.42+0.06*Math.sin(Math.PI*rv),tilt:0.46,hy:lookAt([u1,gv])*0.6};};
// picking it up is the placing run backwards, and she is already stepping back from the desk as it comes up beside her
SCENE.takeRoll=function(c,el,b){me.atB=true;prop.rollSide='R';var T=1.6,x=ph(el,0.12,0.12+T),ep=1-sm(x),d=rollDesk(RV0,38),t=rollTuck(b,100);
 if(prop.roll==='desk'&&el>0.12)prop.roll='move';
 if(prop.roll==='move'){if(ep<=0){prop.roll='carry';prop.rollPose=null;me.rollLift=100;SV.rollLift=0;}else prop.rollPose=rollPath(t,d,ep);}
 if(prop.roll!=='carry'){var rq=prop.rollPose||d,g=rollGrips(rq),own=A(rq.c,M(rq.ax,ROLLG)),j=sm(ph(ep,0.42,0.86));
  hands.R=H(mix(own,g[0],j),{fast:true,hd:N(mix([0,0,-1],[1,0,-0.5],j))});}
 // a couple of steps back once the roll is up off the desk
 var t0=0.12+T*0.5;if(el>t0){if(!c.p0){c.p0=me.F.slice();me.qa=Math.floor(me.qa)+0.3;}var s=260*sm(ph(el,t0,t0+1.15)),fx=Math.cos(me.yaw),fy=Math.sin(me.yaw),
  tp=[c.p0[0]-fx*s,c.p0[1]-fy*s],dd=Math.hypot(tp[0]-me.F[0],tp[1]-me.F[1]);if(dd>0.05){gait(dd,[-fx,-fy,0],380,22);me.cyc=380;me.wT=0.8;}me.F=tp;}
 if(el>t0+1.15&&prop.roll==='carry')cur=null;return {lean:0.4*(1-sm(ph(1-ep,0.25,0.8))),tilt:0.45-0.33*sm(ph(1-ep,0.3,1))};};
// a rare, silly little dance
function danceUpdate(c,el,b){var t=el,beat=2*Math.PI*2.1*t,f=b.f,r=b.r,sh=function(sg){return b.bp(0,sg*SHW,SHZ);};
 c.lean=0.05;c.tilt=0.08*Math.sin(beat/2);c.hy=0.25*Math.sin(beat/4);
 if(t<5.2){me.sway=40*Math.sin(beat/2);me.bounce=-26*Math.abs(Math.sin(beat/2));me.md=r;me.qa+=dt*2.1;me.cyc=me.cycT=220;me.lh=30;me.wT=0.6;}
 if(t<2.6){// robot arms: elbows bent, forearms pumping in turn
  ['L','R'].forEach(function(s,i){var sg=s==='R'?1:-1,up=Math.sin(beat/2+i*Math.PI)>0?1:0;hands[s]=H(A(sh(sg),A(M(f,230),A(M(r,sg*90),[0,0,-170+260*up]))),{rel:true,fast:true,pole:N(A(M(r,sg*0.8),[0,0,-0.6])),hd:up?[0,0,1]:f});});}
 else if(t<5.2){// hands up, waving side to side
  var w=Math.sin(beat/2);['L','R'].forEach(function(s){var sg=s==='R'?1:-1;hands[s]=H(A(sh(sg),A(M(r,sg*120+90*w),[0,0,420])),{rel:true,fast:true,pole:N(A(M(r,sg*0.9),[0,0,-0.2])),hd:[0,0,1]});});}
 else{// to finish: hands on hips, a last sway
  me.sway=26*Math.sin(beat/2)*(1-ph(t,5.2,6.4));
  ['L','R'].forEach(function(s){var sg=s==='R'?1:-1;hands[s]=H(b.bp(30,sg*170,150),{rel:true,pole:N(A(M(r,sg),[0,0,-0.2]))});});}}
// ---------- running ----------
function tick(ms){dt=Math.min(0.05,ms/1000);vt+=dt*1000;if(!cur)next();update();draw();}
var running=false,last=0,manual=!!window.__senManual;   // __senManual: start stopped, for frame-exact checks
// she waits, frozen, while nobody can see her: the room slid away to the photos, or a sheet over it (the page says
// when, through __senIdle). A screen that refreshes faster than 60 times a second still gets her at 60.
var senShown=true;if(window.ResizeObserver)new ResizeObserver(function(es){var r=es[es.length-1].contentRect;senShown=r.width>0&&r.height>0;}).observe(svg);   // (asking the page each frame whether it is laid out made it lay itself out first)
var senAsleep=false;function senSleep(on){if(on===senAsleep)return;senAsleep=on;document.documentElement.classList.toggle('sen-rest',on);}
function loop(now){if(!running||manual)return;
 if(!senShown||(window.__senIdle&&window.__senIdle())){senSleep(true);last=0;setTimeout(function(){requestAnimationFrame(loop);},120);return;}
 senSleep(false);
 if(last&&now-last<10){requestAnimationFrame(loop);return;}
 tick(last?now-last:16.7);last=now;requestAnimationFrame(loop);}
// she starts at the window, looking out
step({k:'gaze',len:rnd(4,6),back:true});lastKind='gaze';
document.addEventListener('visibilitychange',function(){if(document.hidden)running=false;else if(!running){running=true;last=0;requestAnimationFrame(loop);}});
var sh0=document.getElementById('shuffle');if(sh0)sh0.addEventListener('click',function(){if(!me.away)me.react=vt+1600;});
window.__sen={geo:function(){return GEO;},inside:function(n,P){var l=GEO&&GEO[n];if(!l)return false;for(var i=0;i<l.length;i++){var q=prepPrim(l[i]);if(P[0]<q.mn[0]||P[1]<q.mn[1]||P[2]<q.mn[2]||P[0]>q.mx[0]||P[1]>q.mx[1]||P[2]>q.mx[2])continue;if(q.t==='sweep'||q.t==='cbox'){if(insidePrim(q,P))return true;continue;}var d;if(q.t==='sph'){d=Sb(P,q.c);if(D(d,d)<=q.r*q.r)return true;}else if(q.t==='cap'){var s=cl(D(Sb(P,q.a),q.u),0,q.l);d=Sb(P,A(q.a,M(q.u,s)));if(D(d,d)<=q.r*q.r)return true;}else if(q.t==='box'){var ok=true;for(var k=0;k<3;k++)if(Math.abs(D(Sb(P,q.c),q.n[k]))>q.h[k])ok=false;if(ok)return true;}else if(q.t==='cyl'){d=Sb(P,q.b);var s2=D(d,q.u);if(s2>=0&&s2<=q.h){var rd=Sb(d,M(q.u,s2));if(D(rd,rd)<=q.r*q.r)return true;}}}return false;},dbgPair:function(a,b){var ra=partRect(a),rb=partRect(b);if(!ra||!rb)return 'norect';var x0=Math.max(ra[0],rb[0]),x1=Math.min(ra[2],rb[2]),y0=Math.max(ra[1],rb[1]),y1=Math.min(ra[3],rb[3]);var ds=[];
  for(var i=0;i<5;i++)for(var j=0;j<5;j++){var P0=onFloor(x0+(x1-x0)*(i+0.5)/5,y0+(y1-y0)*(j+0.5)/5),fa=partFront(a,P0),fb=partFront(b,P0);ds.push(fa===null||fb===null?null:Math.round(fa-fb));}return {rect:[x0,y0,x1,y1].map(Math.round),ds:ds,pair:PAIR[a<b?a+'|'+b:b+'|'+a]};},cs:function(){return {psi:chair.psi,off:chair.off,CU:CU,CV:CV};},route:function(a,b){return route(a,b);},blocked:function(u,v){return blocked(u,v);},day:function(){return dayHour();},light:function(){return LIGHT&&LIGHT.lit;},sky:function(){return SKYNOW;},wx:function(w){if(w){WX=w;lastDay=-1;}return WX;},reach:function(){var o=REACH;REACH={};return o;},dayAt:function(h,date){var n=new Date(Date.now()+9*3600e3),base=date?Date.parse(date+'T00:00:00+09:00'):Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate())-9*3600e3;T_FIX=base+h*3600e3-(window.__senManual?vt*(T_FAST?120:1):0);lastDay=-1;drawDay(true);},dbg:function(){var b=body();return {pel:b.pel,f:b.f,r:b.r,k:me.sitK,roll:prop.roll==='carry'?rollTuck(b):(prop.roll==='move'?prop.rollPose:null),H:[HAND.L,HAND.R],F:me.F,seated:seated,atB:me.atB,mug:prop.mug==='lift'?prop.mugPos:null};},me:me,prop:prop,P:P,chair:chair,set:function(seq){Q.length=0;seq.forEach(function(x){Q.push(x);});cur=null;},
 seq:function(kind){Q.length=0;lastKind='';var save=pick;pick=function(){return kind;};plan();pick=save;cur=null;},
 manual:function(on){manual=on;if(!on){last=0;requestAnimationFrame(loop);}},
 run:function(sec){var n=Math.round(sec*60);for(var i=0;i<n;i++)tick(1000/60);},
 state:function(){return {cur:cur&&cur.k,sub:cur&&cur.s&&cur.s.k,F:me.F.map(Math.round),yaw:+me.yaw.toFixed(2),off:Math.round(chair.off),psi:+chair.psi.toFixed(2),slot:slotKey,seated:seated,lap:prop.lap,mug:prop.mug,book:prop.book,away:me.away};}};
running=true;requestAnimationFrame(loop);})();
