import { drawLandmark, drawTraveller, landmarkFrames } from './storybook';

// The ink painting has one coordinate system, with the walking trail surveyed in
// painted units. Only the camera, clouds, birds and travelling figure move.
type Pt = { x: number; y: number };
type Camera = Pt & { zoom: number };
type Ink = CanvasRenderingContext2D;
type Sprite = { canvas: HTMLCanvasElement; width: number; height: number };
type Crest = readonly [number, number];
const stops: Pt[] = [
  { x: 40, y: 236 }, { x: 680, y: 35 }, { x: 1310, y: -165 },
  { x: 1790, y: -240 }, { x: 2230, y: -310 }, { x: 2660, y: -380 }, { x: 3120, y: -515 },
];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const limit = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const tau = Math.PI * 2;
const tileSize = 440;

function random(seed: number) {
  let state = seed | 0;
  return () => ((state = Math.imul(state, 1664525) + 1013904223 | 0) >>> 0) / 4294967296;
}

function plate(w: number, h: number, painter: (c: Ink) => void, pixelRatio = 1.25): Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w * pixelRatio);
  canvas.height = Math.ceil(h * pixelRatio);
  const c = canvas.getContext('2d')!;
  c.scale(pixelRatio, pixelRatio);
  c.lineJoin = 'round';
  c.lineCap = 'round';
  painter(c);
  return { canvas, width: w, height: h };
}

function path(c: Ink, d: string, fill?: string, stroke?: string, width = 1) {
  const p = new Path2D(d);
  if (fill) { c.fillStyle = fill; c.fill(p); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(p); }
}

function line(c: Ink, points: Pt[], color: string, width: number) {
  if (!points.length) return;
  c.beginPath();
  c.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) c.lineTo(points[i]!.x, points[i]!.y);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
}

function oval(c: Ink, x: number, y: number, rx: number, ry: number, fill: string, angle = 0) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, angle, 0, tau);
  c.fillStyle = fill;
  c.fill();
}

function image(c: Ink, art: Sprite, x: number, y: number, w = art.width, h = art.height) {
  c.drawImage(art.canvas, x, y, w, h);
}

// Growth rings, broken branches and banks of radiating needles are painted once.
function pinePlate() {
  return plate(180, 148, c => {
    c.translate(90, 142);
    path(c, 'M-23 2C-6 0-6-8-5-19C-4-34 2-36 12-46S26-60 19-68C13-76-8-74-12-89Q-14-99-7-111L-4-108Q-11-91 1-87L23-79Q38-72 31-56Q27-47 17-39C11-34 5-30 5-18Q4-5 16-4L27-2L11 0L2-1L-4 1Z', '#475043', '#243e35', 1.25);
    path(c, 'M-2-7Q-3-26 9-36C19-45 33-55 27-65M-9-91Q-9-80 6-77L19-72M5-28L0-21', undefined, '#ac9874', 1.6);
    path(c, 'M22-60Q9-66-9-60Q-26-55-44-66L-68-73M7-79Q-4-83-30-80L-57-88M17-70Q23-88 40-92L64-100M-10-88Q-25-91-27-105L-46-110M-10-96Q2-98 6-114L20-125', undefined, '#454a38', 3.6);
    const tufts: Crest[] = [[-65,-74],[-50,-70],[-33,-65],[-22,-62],[-42,-87],[-58,-88],[-27,-82],[-49,-108],[-31,-105],[3,-110],[19,-123],[32,-118],[41,-93],[56,-96],[67,-100],[25,-87],[4,-86]];
    const rand = random(1142);
    for (const [x,y] of tufts) {
      const w = 10 + rand()*10;
      oval(c,x,y-2,w,4+rand()*3,'#246653',-.09);
      for (let i = 0; i < 40; i++) {
        const a = -Math.PI + (i+rand())/41*Math.PI;
        const len = w*(.59+rand()*.51);
        const x0 = x + (rand()-.5)*10;
        const ex = x0 + Math.cos(a)*len;
        const ey = y + Math.sin(a)*len*.61;
        c.beginPath(); c.moveTo(x0,y); c.quadraticCurveTo((x0+ex)/2,ey+1.8,ex,ey);
        c.lineWidth = .5 + rand()*.5;
        c.strokeStyle = i%5 === 0 ? '#7ea878' : '#245443'; c.stroke();
      }
    }
  }, 1.75);
}

// Warm crowns punctuate the cool stone. Reuse a little woodblock at different
// scales, with printed gold leaf on the sunny side of each lobed canopy.
function autumnPlate(pink:boolean) {
  return plate(89,95,c=>{
    c.translate(44,92);
    const rand=random(pink?334:651);
    const foliage=pink?['#d88666','#ec9b78','#ffc19a','#f8b68a']:['#be903c','#dba245','#f1bc57','#f6ce77'];
    path(c,'M-6 0Q0-6-1-18L-4-34L-1-48L2-44L0-31L4-21L5-9Q6-4 11-1L4 0Z','#73593d','#65573d',1);
    path(c,'M1-22Q-4-34-16-36L-25-48M-3-33Q9-39 15-51M-2-37Q-9-48-8-59M0-28Q16-33 22-44','', '#805e3c',2.4);
    const heads:Crest[]=[[-22,-49],[-12,-58],[0,-60],[12,-52],[21,-46],[-10,-44],[6,-43],[-2,-70]];
    for(const [px,py] of heads){
      const rx=9+rand()*6, ry=7+rand()*4;
      oval(c,px,py+2,rx,ry,foliage[0]!,rand()*.32-.16);
      for(let j=0;j<13;j++){
        const x=px+(rand()-.5)*rx*1.55,y=py+(rand()-.55)*ry*1.5;
        oval(c,x,y,2.2+rand()*5.4,1.7+rand()*2.9,foliage[y<py?2+Math.floor(rand()*2):1]!,rand()-.5);
      }
      for(let j=0;j<8;j++){
        const x=px+(rand()-.5)*rx*1.6,y=py+(rand()-.4)*ry;
        line(c,[{x,y},{x:x+2.8,y:y-1}],'rgba(253,221,147,.8)',.7);
      }
    }
  },1.5);
}

// Each mountain is a granite massif. Facets follow its actual broken ridge,
// with pencilled hemp-fibre strokes and small ink dots at its crowns.
const crestProfiles: readonly (readonly Crest[])[] = [
  [[0,.89],[.07,.83],[.14,.72],[.19,.58],[.24,.60],[.30,.43],[.34,.44],[.37,.29],[.41,.33],[.47,.22],[.50,.24],[.55,.09],[.58,.11],[.61,.047],[.64,.06],[.66,.075],[.68,.19],[.71,.21],[.73,.35],[.77,.31],[.80,.39],[.83,.45],[.88,.46],[.91,.61],[.95,.69],[1,.83]],
  [[0,.86],[.07,.78],[.12,.65],[.18,.69],[.22,.60],[.27,.61],[.31,.38],[.34,.32],[.36,.34],[.39,.20],[.42,.21],[.45,.11],[.47,.13],[.50,.07],[.53,.09],[.55,.28],[.58,.30],[.62,.43],[.66,.39],[.70,.30],[.72,.32],[.75,.22],[.78,.25],[.80,.39],[.83,.43],[.89,.59],[.94,.67],[1,.87]],
  [[0,.86],[.06,.75],[.12,.73],[.19,.51],[.24,.54],[.27,.41],[.30,.39],[.32,.22],[.36,.20],[.39,.24],[.42,.40],[.45,.46],[.49,.44],[.53,.26],[.57,.29],[.61,.18],[.66,.13],[.70,.15],[.73,.095],[.77,.11],[.79,.23],[.82,.24],[.85,.38],[.88,.40],[.91,.56],[.94,.59],[1,.80]]
];

function summitPlate(variant: number) {
  const w=550, h=355, rand=random(5201+variant*447);
  return plate(w,h,c=>{
    const anchors=crestProfiles[variant%3]!;
    const ridge: Pt[]=[];
    for (let j=1;j<anchors.length;j++) {
      const [a,b]=anchors[j-1]!, [u,v]=anchors[j]!;
      const n=Math.max(2,Math.ceil(Math.hypot((u-a)*w,(v-b)*h)/4.5));
      for(let i=0;i<n;i++){
        const t=i/n;
        ridge.push({x:lerp(a,u,t)*w,y:lerp(b,v,t)*h+(rand()-.5)*4.8*Math.sin(t*Math.PI)});
      }
    }
    ridge.push({x:w,y:anchors[anchors.length-1]![1]*h});
    const boundary=new Path2D();
    boundary.moveTo(0,h); for(const p of ridge)boundary.lineTo(p.x,p.y); boundary.lineTo(w,h); boundary.closePath();
    c.save();c.clip(boundary);
    const wash=c.createLinearGradient(0,20,w*.31,h);
    const minerals = [
      ['#a1d2ad','#63b7a3','#418f96','#a8d3c7'],
      ['#b3dca9','#81c19d','#509ba6','#add8d0'],
      ['#a9d9d0','#78b8c9','#548faa','#afd1d3'],
    ][variant]!;
    wash.addColorStop(0,minerals[0]!); wash.addColorStop(.29,minerals[1]!);
    wash.addColorStop(.59,minerals[2]!); wash.addColorStop(1,minerals[3]!);
    c.fillStyle=wash;c.fillRect(0,0,w,h);
    for(let i=0;i<ridge.length-3;i+=3){
      const p=ridge[i]!, next=ridge[Math.min(i+3,ridge.length-1)]!;
      const downslope=next.y-p.y>0;
      const extent=(h-p.y)*(.27+rand()*.65);
      const drift=extent*((downslope? .20:-.24)+(rand()-.5)*.24);
      const fold: Pt[]=[p];
      let sway=0;
      for(let j=1;j<=9;j++) {
        sway=sway*.44+(rand()-.5)*12;
        fold.push({x:p.x+drift*j/9+sway,y:p.y+extent*j/9});
      }
      c.beginPath(); c.moveTo(p.x,p.y);
      for(const v of fold)c.lineTo(v.x,v.y);
      const tail=fold[9]!;
      c.quadraticCurveTo(tail.x+13,tail.y-40,next.x+rand()*15,next.y-1); c.lineTo(p.x,p.y);
      c.fillStyle=downslope?'rgba(35,99,116,'+(.16+rand()*.30)+')':'rgba(253,219,149,'+(.28+rand()*.30)+')'; c.fill();
      for(let j=0;j<5;j++){
        const offset=(rand()-.37)*12;
        const start=Math.floor(rand()*3), end=Math.floor(5+rand()*5);
        line(c,fold.slice(start,end).map((v,k)=>({x:v.x+offset*(1+k*.10)+(rand()-.5)*2.8,y:v.y+(rand()-.5)*4})),j%3?'rgba(32,89,95,.31)':'rgba(255,233,176,.73)', .58+rand()*.54);
      }
      if(i%12===0)line(c,fold.slice(0,4),'rgba(253,221,156,.80)',1.15);
    }
    for(let i=0;i<2000;i++){
      const x=rand()*w,y=rand()*h;
      oval(c,x,y,.3+rand()*1.45,.28+rand()*.55,i%3?'rgba(44,64,50,.11)':'rgba(232,215,159,.20)',-.3);
    }
    c.restore();
    line(c,ridge,'rgba(52,101,95,.73)',1.15);
    for(let i=3;i<ridge.length-3;i++){
      const p=ridge[i]!;
      if(rand()>.38)continue;
      for(let j=0;j<4;j++)oval(c,p.x+(rand()-.5)*5,p.y+(rand()-.45)*5,.54+rand()*1.4,.35+rand()*.8,'rgba(44,74,58,.7)',-.34);
      if(rand()<.31){
        const sz=1.8+rand()*3.9;
        line(c,[{x:p.x,y:p.y+1},{x:p.x+.7,y:p.y-sz}],'#395c4e',.66);
        oval(c,p.x+.4,p.y-sz*.7,sz*.62,sz*.23,'#476b58',-.17);
        oval(c,p.x-.6,p.y-sz*.44,sz*.71,sz*.21,'#446553',-.10);
      }
    }
    c.globalCompositeOperation='destination-in';
    const mist=c.createLinearGradient(0,0,0,h);
    mist.addColorStop(0,'#000');mist.addColorStop(.64,'#000');mist.addColorStop(.87,'rgba(0,0,0,.68)');mist.addColorStop(1,'transparent');
    c.fillStyle=mist;c.fillRect(0,0,w,h);
  });
}

function cloudPlate() {
  return plate(410,46,c=>{
    path(c,'M0 31C39 29 60 33 85 25C110 18 105 11 122 10C141 9 146 21 135 24C129 26 124 23 125 21C125 18 129 18 131 20C130 15 122 15 117 19C109 26 118 31 133 30C155 29 161 22 180 20C198 17 211 24 232 24C254 25 269 20 285 18C306 16 325 19 346 13C358 10 364 6 375 7C386 7 390 13 386 15C400 14 405 19 410 21C379 21 362 25 340 28C299 34 274 29 240 32C196 37 183 32 152 35C105 40 45 37 0 31Z','#fff0cf');
    path(c,'M8 31Q76 34 99 23M112 18C121 8 136 10 140 16M148 30Q161 26 173 23M258 28Q279 22 297 23M330 21C352 20 359 11 372 10','', '#b39f78',.70);
    path(c,'M30 38Q71 41 109 36M158 39Q192 34 218 35M300 34Q334 32 352 28','', '#b5a786',.65);
  });
}

// This is the near shoulder above the entrance. It is a single low, wooded
// slope with its own rock faces, rather than a miniature view of the summit.
function woodedSpur(pine:Sprite,amber:Sprite,persimmon:Sprite) {
  return plate(650,330,c=>{
    const rand=random(22281);
    const ridge=(x:number)=>196-.225*x+8*Math.cos(x*.035)+6*Math.sin(x*.012)+3*Math.sin(x*.115);
    const p:Pt[]=[];for(let x=-4;x<=654;x+=3)p.push({x,y:ridge(x)});
    const shape=new Path2D();shape.moveTo(-4,330);for(const pt of p)shape.lineTo(pt.x,pt.y);shape.lineTo(654,330);shape.closePath();
    const wash=c.createLinearGradient(300,70,340,315);
    wash.addColorStop(0,'#87ba8a');wash.addColorStop(.36,'#78ab91');wash.addColorStop(.72,'#92c3ae');wash.addColorStop(1,'#bddccc');
    c.fillStyle=wash;c.fill(shape);
    c.save();c.clip(shape);
    for(let i=0;i<82;i++){
      const x=i*8, y=ridge(x),h=36+rand()*125;
      c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+2,y+h*.25,x-21,y+h*.37,x-17,y+h*.7);
      c.lineTo(x-27,y+h);c.quadraticCurveTo(x-14,y+h*.58,x+17,y+3);
      c.fillStyle=i%4===0?'rgba(241,203,129,.37)':'rgba(40,119,111,.24)';c.fill();
      for(let j=0;j<3;j++)line(c,[{x:x+j*2,y:y+5+rand()*11},{x:x-1+j,y:y+h*.32},{x:x-13+j*2,y:y+h*.53},{x:x-16+j,y:y+h*.79}],j===1?'rgba(237,221,161,.52)':'rgba(54,129,105,.25)',.9);
    }
    c.restore();
    for(let i=0;i<61;i++){
      const x=9+i*10.4+rand()*8,y=ridge(x)+1,scale=.063+rand()*.18;
      if(i%4===0){image(c,i%3?amber:persimmon,x-44*scale,y-91*scale,89*scale,95*scale);}
      else image(c,pine,x-90*scale,y-140*scale,180*scale,148*scale);
    }
    c.globalCompositeOperation='destination-in';
    const haze=c.createLinearGradient(0,178,0,327);
    haze.addColorStop(0,'#000');haze.addColorStop(.51,'rgba(0,0,0,.87)');haze.addColorStop(1,'transparent');
    c.fillStyle=haze;c.fillRect(0,0,650,330);
    const edgeFog=c.createLinearGradient(0,0,650,0);
    edgeFog.addColorStop(0,'transparent');edgeFog.addColorStop(.13,'#000');
    edgeFog.addColorStop(.84,'#000');edgeFog.addColorStop(1,'transparent');
    c.fillStyle=edgeFog;c.fillRect(0,0,650,330);
  });
}

function segment(x:number) {
  for(let i=1;i<stops.length;i++)if(x<=stops[i]!.x)return i-1;
  return stops.length-2;
}

function trail(x:number) {
  if(x<stops[0]!.x)return stops[0]!.y+Math.min(125,(stops[0]!.x-x)*.21)+24*Math.sin((x-40)*.018);
  const last=stops[6]!;
  if(x>last.x)return last.y+Math.min(440,(x-last.x)*.65)+17*Math.sin((x-last.x)*.021);
  const j=segment(x),a=stops[j]!,b=stops[j+1]!, t=(x-a.x)/(b.x-a.x);
  const bend=j===0 ? 45*Math.sin(t*tau)+11*Math.sin(t*5*Math.PI) : j===1 ? 26*Math.sin(t*Math.PI) : 21*Math.sin(t*tau+j*.36)*Math.sin(t*Math.PI);
  return lerp(a.y,b.y,t)+bend;
}

function ground(x:number) {
  const a=stops[segment(x)]!,b=stops[segment(x)+1]!;
  const t=limit((x-a.x)/(b.x-a.x),0,1);
  const slack=Math.min(1,Math.min(Math.abs(x-a.x),Math.abs(x-b.x))/85);
  const crags=21+11*Math.sin(x*.038)+6*Math.sin(x*.103)+2*Math.sin(x*.38);
  const ravine=a===stops[1]?178*Math.sin(Math.PI*t)**1.7:0;
  let level=trail(x)-crags*slack-2+ravine;
  // The plazas and stone foundations sit on a terrace in the same hillside.
  // Guide the surrounding relief gently into the foundation at each building.
  const nearest=Math.abs(x-a.x)<Math.abs(x-b.x)?a:b;
  const distance=x-nearest.x;
  const inner=nearest===stops[0]?103:71;
  const flatten=1-ease(limit((Math.abs(distance)-inner)/55,0,1));
  level=lerp(level,nearest.y+3-distance*.067,flatten);
  return level;
}

function groundTile(ix:number, pine:Sprite) {
  const start=ix*tileSize, bleed=15;
  let y0=Infinity,y1=-Infinity;
  for(let x=start-bleed;x<=start+tileSize+bleed;x+=3){
    const y=ground(x);y0=Math.min(y0,y);y1=Math.max(y1,y);
  }
  const top=Math.floor(y0-64),depth=Math.ceil(y1+385-top);
  const art=plate(tileSize,depth,c=>{
    c.translate(-start,-top);
    const rim:Pt[]=[];
    for(let x=start-bleed;x<=start+tileSize+bleed;x+=2)rim.push({x,y:ground(x)});
    const edge=new Path2D();edge.moveTo(start-bleed,top+depth);
    for(const p of rim)edge.lineTo(p.x,p.y);
    edge.lineTo(start+tileSize+bleed,top+depth);edge.closePath();
    c.save();c.clip(edge);
    const strata=c.createLinearGradient(start,0,start+tileSize,0);
    for(let i=0;i<=8;i++){
      const gx=start+tileSize*i/8,phase=(1+Math.sin(gx*.0054-.4))/2;
      const shade=Math.round(lerp(154,184,phase));
      strata.addColorStop(i/8,'rgb('+Math.round(lerp(105,134,phase))+','+shade+','+Math.round(lerp(150,134,phase))+')');
    }
    c.fillStyle=strata;c.fillRect(start,top,tileSize,depth);
    // Continuous x-addressed brushwork means even strokes crossing a tile
    // boundary meet their neighbour at precisely the same point.
    for(let x=Math.floor((start-120)/8)*8;x<=start+tileSize+120;x+=8){
      const rand=random(Math.imul(x,3329)+8744),y=ground(x);
      const drop=95+rand()*280, dx=(Math.sin(x*.031)*.19-.08)*drop;
      const fold:Pt[]=[];
      for(let i=0;i<=10;i++){
        const t=i/10;
        fold.push({x:x+dx*t+(rand()-.48)*11*Math.sin(t*Math.PI),y:y+drop*t});
      }
      const end=fold[10]!;
      c.beginPath(); c.moveTo(x,y-1);
      for(const p of fold)c.lineTo(p.x,p.y);
      c.quadraticCurveTo(end.x+8+rand()*28,end.y-34,x+7+rand()*19,y-1);
      c.fillStyle=(Math.sin(x*.043)>-.15)?'rgba(22,102,102,.31)':'rgba(251,205,123,.44)';c.fill();
      for(let i=0;i<3;i++){
        const off=(rand()-.49)*9;
        line(c,fold.slice(Math.floor(rand()*3),5+Math.floor(rand()*5)).map((p,k)=>({x:p.x+off*(1+k*.13),y:p.y})),i===1?'rgba(253,216,157,.65)':'rgba(37,102,89,.38)',.64+rand()*.62);
      }
      if(rand()>.64){
        const ly=y+rand()*54, px=x+(rand()-.4)*7;
        for(let i=0;i<9;i++)oval(c,px+(rand()-.5)*9,ly+(rand()-.5)*7,1+rand()*1.6,.6+rand(),'rgba(46,78,61,.57)',-.32);
      }
    }
    c.restore();
    line(c,rim,'rgba(49,75,60,.8)',1.0);
    for(let i=Math.floor((start-40)/19);i<=Math.ceil((start+tileSize+40)/19);i++){
      const rand=random(i*1701+8301),x=i*19+rand()*8;
      if(stops.some(p=>Math.abs(x-p.x)<103)||rand()>.65)continue;
      const s=.053+rand()*.13;
      image(c,pine,x-90*s,ground(x)-140*s+1,180*s,148*s);
    }
    // The path winds across the actual rock. Its second section is the cable.
    c.save();c.clip(edge);
    for(const [from,to] of [[-190,stops[1]!.x+12],[stops[2]!.x-30,stops[6]!.x+4]] as const){
      const min=Math.max(start-bleed,from), max=Math.min(start+tileSize+bleed,to);
      if(min>=max)continue;
      const pts:Pt[]=[];
      for(let x=min;x<max;x+=3)pts.push({x,y:trail(x)+2.5});
      pts.push({x:max,y:trail(max)+2.5});
      const road=from<0;
      line(c,pts,'#a58154',road?9:7);
      line(c,pts,'#e8b877',road?6.6:5);
      line(c,pts.map(p=>({x:p.x,y:p.y-1.2})),'#ffe4aa',road?1.55:1.05);
      if(!road)for(let x=Math.ceil(min/5)*5;x<max;x+=5){
        line(c,[{x:x-.65,y:trail(x)+1},{x:x+.65,y:trail(x)+4.1}],'rgba(113,111,85,.64)',.65);
      }
    }
    c.restore();
    // Make a single continuous alpha-mask. Drawing it once prevents pale
    // vertical seams where adjacent gradient columns would otherwise meet.
    const mask=plate(tileSize,depth,m=>{
      m.translate(-start,-top);
      for(let i=0;i<tileSize;i+=3){
        const gx=start+i,gy=ground(gx);
        const fog=m.createLinearGradient(0,gy+106,0,gy+331);
        fog.addColorStop(0,'#000');fog.addColorStop(.52,'rgba(0,0,0,.60)');fog.addColorStop(1,'transparent');
        m.fillStyle=fog;m.fillRect(gx,top,4.2,depth);
      }
    },1.1);
    c.globalCompositeOperation='destination-in';
    image(c,mask,start,top);
  },1.1);
  return {art,top};
}

function cableY(x:number) {
  const start=stops[1]!,end=stops[2]!;
  const t=(x-start.x)/(end.x-start.x);
  return lerp(start.y-32,end.y-24,t)+25*Math.sin(Math.PI*t);
}

function transport(c:Ink,kind:'bus'|'cabin'|'walker',x:number,y:number,time:number,direction:number) {
  c.save();c.translate(x,y);
  if(kind==='bus'){
    const distance=Math.min(Math.abs(x-stops[0]!.x),Math.abs(x-stops[1]!.x));
    c.rotate(Math.atan((trail(x+2)-trail(x-2))/4)*.55*ease(limit(distance/32,0,1)));
  }
  drawTraveller(c,kind,time/1000,direction);
  c.restore();
}
function birds(c:Ink,x:number,y:number,s:number,t:number) {
  c.save();c.translate(x,y);c.scale(s,s);
  for(const [i,dx,dy] of [[0,0,0],[1,25,-10],[2,-25,9],[3,54,-5]] as const){
    c.save();c.translate(dx,dy);const k=1-i*.13;c.scale(k,k);
    const wing=Math.sin(t*.0024+i*1.4)*2.6;
    path(c,'M-10 '+(-4+wing)+'Q-4-4 0 1Q3-5 10 '+(-7-wing)+'Q4-3 .7 3Q-3 0-10 '+(-4+wing)+'Z','#486254');
    c.restore();
  }
  c.restore();
}

interface Motion {
  from: number; to: number; initial: Camera; started: number; duration: number; done: () => void;
}

function blendCamera(a:Camera,b:Camera,t:number):Camera {
  return {x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),zoom:a.zoom*(b.zoom/a.zoom)**t};
}

export function createScrollWorld(host:HTMLElement): {travel(to:number, options?:{instant?:boolean}):Promise<void>;anchor():Pt;destroy():void} {
  const canvas=document.createElement('canvas');
  canvas.className='scroll-world-painting';
  canvas.setAttribute('aria-hidden','true');
  canvas.style.cssText='width:100%;height:100%;display:block;pointer-events:none;';
  host.appendChild(canvas);
  const c=canvas.getContext('2d',{alpha:false})!;
  const pine=pinePlate(),amber=autumnPlate(false),persimmon=autumnPlate(true);
  const foothill=woodedSpur(pine,amber,persimmon);
  const cloud=cloudPlate(),peaks=[0,1,2].map(summitPlate);
  const terrain=new Map<number,ReturnType<typeof groundTile>>();
  const paper=plate(109,113,brush=>{
    const rand=random(9341);
    for(let i=0;i<2250;i++){
      const x=rand()*109,y=rand()*113;
      brush.fillStyle=i%2?'rgba(79,95,73,.048)':'rgba(255,251,223,.11)';
      brush.fillRect(x,y,.45+rand()*1.0,.3+rand()*.9);
    }
    for(let i=0;i<64;i++){
      const x=rand()*109,y=rand()*113;
      line(brush,[{x,y},{x:x+2+rand()*2,y:y+(rand()-.5)*1.6}],'rgba(123,101,66,.085)',.5);
    }
  },1);
  const paperPattern=c.createPattern(paper.canvas,'repeat');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  let w=1,h=1,dpr=1,base=1,wide=0,frame=0,lastPaint=-10000;
  let current=-1,move:Motion|null=null,disposed=false;
  let camera:Camera={x:0,y:0,zoom:1};
  let dockTop=0;

  function travellingPose(index:number):Camera{
    if(index===-1)return {x:-62-wide*(w/base*.18),y:101,zoom:1.13};
    if(index===7){
      const portrait=w/h<.82;
      return {x:3010-wide*w/base*.08,y:portrait?-390:-412,zoom:portrait?.36:.49};
    }
    const stop=stops[index]!;
    return {x:stop.x-(.073+wide*.09)*w/base,y:stop.y+(.09+wide*.014)*h/base,zoom:1.03};
  }

  function pose(index:number):Camera{
    if(index<0||index>=stops.length)return travellingPose(index);
    const {left,right,top,bottom,scale}=landmarkFrames[index]!;
    const besideCard=w>600&&w/h>1.23;
    const shortLandscape=besideCard&&h<510;
    const topEdge=Math.max(shortLandscape?45:59,h*.095);
    // Portrait cards sit below the building. On a short landscape screen
    // the card occupies the left side, so frame the subject beside it.
    const lowerEdge=besideCard?Math.min(h*.80,dockTop-13):Math.min(h*.73,dockTop-(w<=600?186:228));
    const room=Math.max(84,lowerEdge-topEdge);
    const cardRight=limit(w*.33,330,454)+limit(w*.0325,14,65);
    const leftEdge=besideCard?cardRight+limit(w*.018,14,32):w*.035;
    const rightEdge=w*(besideCard?.97:.965);
    const drawingScale=Math.min((rightEdge-leftEdge)/(right-left),room/(bottom-top));
    const k=drawingScale/scale;
    const centerX=(leftEdge+rightEdge)/2;
    const centerY=topEdge+room*.5+(room-drawingScale*(bottom-top))*.035;
    const focusX=stops[index]!.x+(left+right)*.5*scale;
    const focusY=stops[index]!.y+(top+bottom)*.5*scale;
    return {x:focusX+(w*.5-centerX)/k,y:focusY+(h*.5-centerY)/k,zoom:k/base};
  }

  function anchor():Pt{
    const index=limit(move?.to??current,0,6);
    const p=stops[index]!,k=base*camera.zoom;
    const frame=landmarkFrames[index]!;
    return {x:limit(w*.5+(p.x+(frame.left+frame.right)*.5*frame.scale-camera.x)*k,w*.07,w*.93),
      y:limit(h*.5+(p.y+frame.top*.44*frame.scale-camera.y)*k,h*.08,h*.90)};
  }

  function paint(time:number){
    const t=reduce.matches?0:time;
    const k=base*camera.zoom;
    const viewportWidth=w/k;
    const isJourney=Boolean(move&&move.from>=0&&move.from<7&&move.to>=0&&move.to<7);
    const progress=move?ease(limit((time-move.started)/move.duration,0,1)):1;
    const focus=(index:number)=>index<0?-135:stops[Math.min(index,6)]!.x;
    const location=move?lerp(focus(move.from),focus(move.to),progress):focus(current);
    const openness=ease(limit((location-135)/1240,0,1));
    const panorama=ease(limit((.83-camera.zoom)/.34,0,1))*ease(limit((location-2590)/450,0,1));
    const sx=(x:number,depth=1)=>w/2+(x-camera.x*depth)*k;
    // The eye travels toward the structure on its terrace. Distant granite
    // and clouds enlarge less, leaving the silhouette legible against the sky.
    const backK=camera.zoom>1?base*(1+(camera.zoom-1)*.28):k;
    const backX=(x:number,depth:number)=>w/2+(x-camera.x*depth)*backK;
    const backY=(y:number,depth:number)=>h/2+(y-camera.y*depth)*backK;
    c.setTransform(dpr,0,0,dpr,0,0);
    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,w*.16,h);
    sky.addColorStop(0,'#bddddf');sky.addColorStop(.24,'#eaf0db');sky.addColorStop(.48,'#ffe6bd');sky.addColorStop(.73,'#e3e8cc');sky.addColorStop(1,'#a9d2c6');
    c.fillStyle=sky;c.fillRect(0,0,w,h);
    const light=c.createRadialGradient(w*.73,h*.22,0,w*.73,h*.22,Math.max(w*.51,h*.38));
    light.addColorStop(0,'rgba(255,202,151,.73)');light.addColorStop(1,'rgba(255,219,171,0)');
    c.fillStyle=light;c.fillRect(0,0,w,h);
    const sunX=w*.78+Math.sin(camera.x*.0009)*w*.06;
    const sunY=h*(.19+.036*Math.sin(camera.x*.0012));
    const sr=limit(h*.029,13,27);
    const halo=c.createRadialGradient(sunX,sunY,0,sunX,sunY,sr*4.4);
    halo.addColorStop(0,'rgba(236,182,128,.28)');halo.addColorStop(1,'rgba(242,198,152,0)');
    c.fillStyle=halo;c.fillRect(sunX-sr*4.4,sunY-sr*4.4,sr*8.8,sr*8.8);
    oval(c,sunX,sunY,sr,sr,'#ed845f');
    // Horizontal washes across the cinnabar lend it the look of a stamped seal.
    c.save(); c.beginPath();c.arc(sunX,sunY,sr,0,tau);c.clip();
    const sunRand=random(128);
    for(let i=0;i<62;i++){
      const x=sunX+(sunRand()-.5)*sr*2.2,y=sunY+(sunRand()-.5)*sr*2;
      c.fillStyle='rgba(252,218,174,.32)';c.fillRect(x,y,1+sunRand()*4,.3+sunRand()*.55);
    }
    c.restore();
    // Mountains at the atmospheric horizon have a much smaller parallax factor.
    c.globalAlpha=.15+.85*openness;
    for(let band=0;band<3;band++){
      const depth=.065+band*.083,dx=camera.x*depth;
      const horizon=h*(.41+band*.067-panorama*.19)+(-camera.y-70)*depth*backK*.44;
      c.beginPath();c.moveTo(-5,h);
      for(let x=-8;x<=w+9;x+=6){
        const u=(x-w*.51)/base+dx;
        const y=horizon+base*(Math.sin(u*.012+band*1.9)*18+Math.sin(u*.025+band*.8)*10+Math.sin(u*.059+band)*4+Math.sin(u*.003)*12);
        c.lineTo(x,y);
      }
      c.lineTo(w+9,h);c.closePath();
      const grad=c.createLinearGradient(0,horizon-40*base,0,horizon+115*base);
      const tints=['#adc9d7','#91bbcb','#85b9ab'];
      grad.addColorStop(0,tints[band]!);grad.addColorStop(.26,tints[band]!);grad.addColorStop(1,'rgba(224,236,209,0)');
      c.fillStyle=grad;c.fill();
    }
    c.globalAlpha=1;

    function range(depth:number,spacing:number,draw:(ix:number)=>void){
      const start=Math.floor((camera.x*depth-w/backK/2)/spacing)-2;
      const end=Math.ceil((camera.x*depth+w/backK/2)/spacing)+2;
      for(let i=start;i<=end;i++)draw(i);
    }
    // Looking down from the high ridge gradually exposes a second, lower chain
    // on the far side of the valley as the summit camera widens its field.
    if(panorama>.002){
      c.globalAlpha=panorama*.52;
      range(.34,290,i=>{
        const rand=random(i*2411+6554);
        const ww=415+rand()*115,hh=153+rand()*70;
        const x=i*290-ww*.49, y=-345-i*58+35*Math.sin(i*1.7);
        image(c,peaks[((i%3)+3)%3]!,backX(x,.34),backY(y,.34),ww*backK,hh*backK);
      });
      c.globalAlpha=1;
    }
    // Separate summits overlap on a common world plane, instead of being assigned to stops.
    c.globalAlpha=openness;
    if(openness>.003)range(.53,432,i=>{
      const rand=random(i*2047+12500),variant=((i%3)+3)%3;
      const ww=610+rand()*180,hh=312+rand()*80;
      const x=i*432-ww*.49+16*Math.sin(i*1.4);
      const y=-171-i*86+Math.sin(i*2.1)*48;
      if(backX(x+ww,.53)<0||backX(x,.53)>w)return;
      image(c,peaks[variant]!,backX(x,.53),backY(y,.53),ww*backK,hh*backK);
    });
    c.globalAlpha=1;
    range(.58,584,i=>{
      const drift=Math.sin(t*.00016+i*2)*45;
      const px=i*584-310+drift,py=42-i*104+Math.sin(i)*31;
      c.globalAlpha=.32+.48*openness;
      image(c,cloud,backX(px,.58),backY(py,.58),(460+i%3*30)*backK,45*backK);
      c.globalAlpha=1;
    });
    // Wisps float in front of the massif, while its foothills show through the paper.
    const mistY=backY(89-camera.x*.111,.57);
    const valley=c.createLinearGradient(0,mistY-42*backK,0,mistY+115*backK);
    valley.addColorStop(0,'rgba(245,239,211,0)');valley.addColorStop(.48,'rgba(250,237,200,.59)');valley.addColorStop(1,'rgba(222,235,216,0)');
    c.fillStyle=valley;c.fillRect(0,mistY-42*backK,w,157*backK);
    if(location<940){
      c.globalAlpha=1-ease(limit((location-430)/510,0,1));
      const depth=.75,bottom=backY(303,depth),frontW=1075*backK;
      image(c,foothill,backX(-540,depth),bottom-410*backK,frontW,410*backK);
      c.globalAlpha=1;
    }
    const left=camera.x-viewportWidth/2,right=camera.x+viewportWidth/2;
    c.save();c.translate(w/2-camera.x*k,h/2-camera.y*k);c.scale(k,k);
    const first=Math.floor(left/tileSize),last=Math.floor(right/tileSize);
    for(let ix=first;ix<=last;ix++){
      let tile=terrain.get(ix);
      if(!tile){tile=groundTile(ix,pine);terrain.set(ix,tile);}
      image(c,tile.art,ix*tileSize,tile.top,tileSize+.15,tile.art.height);
    }
    for(const ix of terrain.keys())if(ix<first-2||ix>last+2)terrain.delete(ix);
    const cableA=stops[1]!,cableB=stops[2]!;
    const wireReveal=ease(limit((location-cableA.x+190)/140,0,1));
    if(left<cableB.x&&right>cableA.x&&wireReveal>.001){
      c.globalAlpha=wireReveal;
      const wire:Pt[]=[];
      for(let i=0;i<=32;i++){const x=lerp(cableA.x,cableB.x,i/32);wire.push({x,y:cableY(x)});}
      line(c,wire,'#4b5c50',1.4);
      line(c,wire.map(p=>({x:p.x,y:p.y+2.3})),'#8a8970',.76);
      for(const x of [cableA.x,cableB.x-6]){
        const y=cableY(x);
        line(c,[{x:x-6,y:ground(x)+.4},{x,y:y-3},{x:x+6,y:ground(x)+.4}],'#656e59',2.4);
      }
      // A return cabin can also be spotted when the passenger is waiting at a station.
      const tx=cableA.x+(cableB.x-cableA.x)*(.28+.12*Math.sin(t*.00012));
      transport(c,'cabin',tx,cableY(tx)+1,t,-1);
      c.globalAlpha=1;
    }
    for(let i=0;i<stops.length;i++){
      const p=stops[i]!;if(p.x<left-145||p.x>right+145)continue;
      // A landmark emerges only over the last bend leading to it, even on a
      // tablet wide enough to include the next station in the viewport.
      const reveal=i===0?1:ease(limit((location-p.x+195)/130,0,1));
      if(reveal<.001)continue;
      c.globalAlpha=reveal;
      const s=landmarkFrames[i]!.scale;
      if(i===2){
        path(c,'M'+(p.x-8)+' '+p.y+'q-27 31-67 65l-24 5q49-40 73-69Z','#c7b58b','#817d63',1);
        for(let j=1;j<=12;j++){
          const t=j/13,xx=p.x-17-70*t,yy=p.y+68*t;
          line(c,[{x:xx-2-5*t,y:yy+1},{x:xx+6+4*t,y:yy-1}],'#7e8068',1);
        }
      }
      c.save();c.translate(p.x,p.y);c.scale(s,s);
      drawLandmark(c,i);
      c.restore();
      c.globalAlpha=1;
    }
    for(let i=Math.floor((left-80)/141);i<=Math.ceil((right+80)/141);i++){
      const rand=random(i*7341+651), x=i*141+35+rand()*23;
      if(stops.some(p=>Math.abs(x-p.x)<94))continue;
      const s=.28+rand()*.32;
      image(c,i%3===0?persimmon:amber,x-44*s,ground(x)-91*s,89*s,95*s);
      if(i%2===0){const xx=x+15;image(c,amber,xx-22*s,ground(xx)-45*s,44.5*s,47.5*s);}
    }
    for(const [x,s] of [[-220,.52],[-149,.90],[-97,.52],[203,.44],[472,.57],[813,.50],[1221,.48],[1585,.62],[1982,.52],[2445,.66],[2868,.51],[3232,.75]] as const){
      if(x<left-70||x>right+70)continue;
      image(c,pine,x-90*s,ground(x)-140*s,180*s,148*s);
    }
    if(move&&isJourney){
      const u=ease(limit((time-move.started)/move.duration,0,1));
      const x=lerp(stops[move.from]!.x,stops[move.to]!.x,u),seg=segment(x);
      const kind=seg===0?'bus':seg===1?'cabin':'walker';
      const fromPlaza=move.from===0;
      const toPlaza=move.to===0;
      c.globalAlpha=(fromPlaza?1:ease(limit(u/.04,0,1)))*(toPlaza?1:ease(limit((1-u)/.065,0,1)));
      transport(c,kind,x,kind==='cabin'?cableY(x):trail(x),time,move.to>=move.from?1:-1);
      c.globalAlpha=1;
    }else if(current===0||current===-1){
      transport(c,'bus',stops[0]!.x,stops[0]!.y,0,1);
    }
    c.restore();
    if(panorama>.002){
      for(let band=0;band<2;band++){
        c.save();c.globalAlpha=panorama*(.53+band*.13);c.beginPath();c.moveTo(-3,h);
        const edge=h*(.74+band*.104);
        for(let x=-4;x<=w+6;x+=4){
          const u=(x-w*.46)/k+camera.x*(.82+band*.16);
          const yy=edge+k*(48*Math.sin(u*.0105+band)+22*Math.sin(u*.022+band*2)+10*Math.sin(u*.065+band));
          c.lineTo(x,yy);
        }
        c.lineTo(w+6,h);c.closePath();
        const ink=c.createLinearGradient(0,edge-36*k,0,edge+100*k);
        ink.addColorStop(0,band?'#609f98':'#8cb9c0');ink.addColorStop(.38,band?'#90b9a7':'#a7c7c0');ink.addColorStop(1,'rgba(227,237,210,0)');
        c.fillStyle=ink;c.fill();c.restore();
      }
    }
    // Low rolling ink silhouettes frame the foot of the scroll. The foreground
    // stays low near the summit, leaving the final view open over the cloud sea.
    const nearDepth=1.42,nearShift=camera.x*nearDepth;
    const foregroundK=base*Math.min(camera.zoom,1.35);
    c.save();c.beginPath();c.moveTo(-4,h+3);
    const frontY=(x:number)=>{
      const u=(x-w/2)/k+nearShift;
      const altitude=limit(-camera.y/600,0,1);
      return h*(.91+altitude*.08)+foregroundK*(Math.sin(u*.009+.3)*47+Math.sin(u*.027)*14+Math.sin(u*.068)*4+Math.cos(u*.001)*8);
    };
    for(let x=-5;x<=w+6;x+=4)c.lineTo(x,frontY(x));
    c.lineTo(w+6,h+3);c.closePath();
    const dark=c.createLinearGradient(0,h*.72,0,h);dark.addColorStop(0,'#88b58e');dark.addColorStop(1,'#347c71');
    c.fillStyle=dark;c.fill();c.restore();
    for(let i=Math.floor((nearShift-viewportWidth/2)/311)-1;i<=Math.ceil((nearShift+viewportWidth/2)/311)+1;i++){
      const rand=random(i*2047+811),wx=i*311-140+rand()*56,x=sx(wx,nearDepth);
      if(x< -95*k||x>w+95*k)continue;
      const s=(.41+rand()*.59)*foregroundK;
      image(c,pine,x-90*s,frontY(x)-140*s+3,180*s,148*s);
    }
    // The road runs behind several cut banks. A near pine briefly sweeps over
    // the traveller before the next terrace comes out from behind its branches.
    for(const [wx,size] of [[290,1.85],[1350,1.34],[2120,1.75],[3000,1.60],[3680,1.46]] as const){
      const x=sx(wx,nearDepth),s=size*foregroundK;
      if(x< -100*s||x>w+100*s)continue;
      image(c,pine,x-90*s,frontY(x)-140*s+4,180*s,148*s);
    }
    const nearCloudX=w*.28+Math.sin(t*.00015+camera.x*.0027)*w*.23;
    c.globalAlpha=.72;
    image(c,cloud,nearCloudX,h*.755+Math.sin(camera.x*.0041)*h*.07,Math.min(w*.98,590*base),45*base);
    c.globalAlpha=1;
    birds(c,w*.72+Math.sin(t*.00024+camera.x*.0026)*w*.112,h*.235+Math.sin(t*.00028+camera.x*.008)*17*base,.74*base,t);
    if(paperPattern){c.fillStyle=paperPattern;c.fillRect(0,0,w,h);}
  }

  function tick(time:number){
    frame=0;
    if(disposed||document.hidden)return;
    const elapsed=move?time-move.started:0;
    if(move){
      const next=pose(move.to),u=limit(elapsed/move.duration,0,1),t=ease(u);
      const excursion=Math.sin(Math.PI*t);
      const onTrail=move.from>=0&&move.from<7&&move.to>=0&&move.to<7;
      const from=stops[limit(move.from,0,6)]!,to=stops[limit(move.to,0,6)]!;
      const x=lerp(from.x,to.x,t);
      const stretch=Math.abs(move.to-move.from)===1?Math.min(move.from,move.to):segment(x);
      const cable=stretch===1,bus=stretch===0;
      const arc=onTrail?trail(x)-lerp(from.y,to.y,t):0;
      const panSign=move.to>=move.from?1:-1;
      const lateral=onTrail?(bus?-25:cable?32:-18):move.to===7?-92:32;
      const lift=move.to===7?-65:!onTrail?47:cable?-89:bus?40:-30;
      if(move.to===7){
        // Crest the summit and steadily reveal the valley below.
        camera=blendCamera(move.initial,next,t);
        camera.x+=lateral*excursion;
        camera.y+=lift*excursion;
      }else{
        const travelling=blendCamera(travellingPose(move.from),travellingPose(move.to),t);
        travelling.x+=lateral*panSign*excursion;
        travelling.y+=arc+lift*excursion;
        travelling.zoom*=1-(cable?.28:.12)*excursion;
        const departure=ease(limit(u/.32,0,1));
        const arrival=ease(limit((u-.55)/.45,0,1));
        camera=blendCamera(blendCamera(move.initial,travelling,departure),next,arrival);
      }
      if(u===1){
        const finished=move;
        current=move.to;move=null;camera=next;
        paint(time);lastPaint=time;finished.done();
      }
    }
    if(time-lastPaint>=(move?16:62)){paint(time);lastPaint=time;}
    if(!reduce.matches||move)schedule();
  }

  function schedule(){
    if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(tick);
  }

  function resize(){
    if(disposed)return;
    const bounds=host.getBoundingClientRect();
    w=Math.max(1,Math.round(bounds.width));h=Math.max(1,Math.round(bounds.height));
    dockTop=(host.closest('.page')?.querySelector('.route')?.getBoundingClientRect().top??bounds.bottom)-bounds.top;
    dpr=Math.min(1.75,window.devicePixelRatio||1,Math.sqrt(2100000/(w*h)));
    base=limit(h/698,.52,1.58);wide=limit((w/h-.72)/.78,0,1);
    canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));
    if(!move)camera=pose(current);
    paint(performance.now());schedule();
  }

  function preference(){
    if(reduce.matches&&move){
      const interrupted=move;current=move.to;move=null;camera=pose(current);interrupted.done();
    }
    paint(performance.now());schedule();
  }
  function visible(){if(!document.hidden){lastPaint=-10000;schedule();}}
  function travel(to:number,options?:{instant?:boolean}):Promise<void>{
    if(disposed||!Number.isInteger(to)||to< -1||to>7)return Promise.resolve();
    const previous=move?.to??current;
    if(move){move.done();move=null;}
    if(options?.instant||reduce.matches||previous===to){
      current=to;camera=pose(to);paint(performance.now());schedule();return Promise.resolve();
    }
    return new Promise<void>(done=>{
      const leg=Math.min(previous,to);
      const duration=to===7?3200:leg<0?2350:Math.abs(to-previous)>1?3650:leg===1?3450:leg===0?3120:2900;
      move={from:previous,to,initial:{...camera},started:performance.now(),duration,done};
      schedule();
    });
  }

  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(resize);
  observer?.observe(host);
  if(!observer)window.addEventListener('resize',resize);
  if(reduce.addEventListener)reduce.addEventListener('change',preference);else reduce.addListener(preference);
  document.addEventListener('visibilitychange',visible);
  resize();
  return {travel,anchor,destroy(){
    disposed=true;cancelAnimationFrame(frame);observer?.disconnect();
    if(!observer)window.removeEventListener('resize',resize);
    if(reduce.removeEventListener)reduce.removeEventListener('change',preference);else reduce.removeListener(preference);
    document.removeEventListener('visibilitychange',visible);move?.done();move=null;
    terrain.clear();canvas.remove();
  }};
}
