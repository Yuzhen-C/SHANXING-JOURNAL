import './landscape.css';

type Point = readonly [number, number];
type Palette = readonly [paper: string, horizon: string, far: string, middle: string, mineral: string, dark: string, fine: string, sun: string];

const colors: Record<string, Palette> = {
  cover:       ['#f0ddad','#f1d5a0','#b5bda8','#789a86','#416f62','#284d43','#c2a367','#bd6150'],
  tianwaicun:  ['#efe2bd','#f4dbb0','#adc2ad','#849f7b','#487654','#304e40','#cdb17c','#cf8064'],
  zhongtianmen:['#e9dfb9','#f1ddac','#a2b8a6','#729691','#396e68','#334d47','#b79e6b','#d1a471'],
  nantianmen:  ['#edd7b0','#f2cf9d','#a6bbaa','#849b8c','#476e61','#304c44','#c4a273','#c96d57'],
  tianjie:     ['#f0e2cb','#f2d8b7','#b5bebe','#8caaa0','#56867b','#385853','#c7ae81','#c28265'],
  bixia:       ['#efd9ad','#f2cf96','#bebd9e','#929f7c','#5b785d','#394f40','#d2ad72','#c9774f'],
  daguan:      ['#e8d8b8','#ecd2b1','#a9b4a8','#9a9a80','#766f57','#494d43','#c6a775','#c78c72'],
  yuhuang:     ['#ead4b4','#f4c691','#b5b2a9','#8c9d99','#537c72','#344f48','#ceb288','#c96f51'],
};

const views: Record<string, {sun: Point; peak: Point; ledge: number; phase: number; name: string}> = {
  cover:       {sun: [266,122], peak: [526,95], ledge: 332, phase: 0, name:'云海中的泰山群峰'},
  tianwaicun:  {sun: [274,98], peak: [538,98], ledge: 367, phase: 2, name:'山脚的石柱广场和进山公路'},
  zhongtianmen:{sun: [276,138], peak: [553,64], ledge: 346, phase: 4, name:'中天门前的山路与索道'},
  nantianmen:  {sun: [310,99], peak: [587,171], ledge: 342, phase: 6, name:'立在山巅石阶上的南天门'},
  tianjie:     {sun: [183,108], peak: [420,166], ledge: 355, phase: 8, name:'云上的天街和屋脊'},
  bixia:       {sun: [347,90], peak: [464,161], ledge: 359, phase: 10, name:'群峰环抱的碧霞祠殿宇'},
  daguan:      {sun: [234,94], peak: [435,123], ledge: 371, phase: 12, name:'大观峰岩壁上的摩崖石刻'},
  yuhuang:     {sun: [264,172], peak: [441,189], ledge: 328, phase: 14, name:'晨曦中的玉皇顶和峰顶庙宇'},
};

const round = (n: number) => Math.round(n * 10) / 10;
const pathThrough = (points: readonly Point[]) => points.map(([x,y], i) => (i ? 'L' : 'M') + round(x) + ' ' + round(y)).join('');

function randomSource(seed: number) {
  let state = seed;
  return () => ((state = Math.imul(state, 1664525) + 1013904223 | 0) >>> 0) / 4294967296;
}

// Subdivide an outlined ridge like a broken brush line. Each ridge keeps its landmark silhouette.
function brokenRidge(anchors: readonly Point[], jitter: number, rand: () => number): Point[] {
  const points: Point[] = [];
  for (let i = 1; i < anchors.length; i++) {
    const [x0, y0] = anchors[i-1]!;
    const [x1, y1] = anchors[i]!;
    const length = Math.hypot(x1-x0, y1-y0);
    const count = Math.max(1, Math.ceil(length/7));
    for (let j=0; j<count; j++) {
      const p = j/count;
      const n = (rand()-.5) * jitter * Math.sin(p * Math.PI);
      points.push([x0+(x1-x0)*p + n*(y1-y0)/length, y0+(y1-y0)*p - n*(x1-x0)/length]);
    }
  }
  points.push(anchors[anchors.length-1]!);
  return points;
}

function mountain(anchors: Point[], base: number, face: string, ink: string, gold: string, seed: number, density: number) {
  const rand=randomSource(seed);
  const ridge=brokenRidge(anchors, density > .65 ? 8 : 5, rand);
  const edge=pathThrough(ridge);
  const first=ridge[0]!, last=ridge[ridge.length-1]!;
  const outline=edge+'L'+last[0]+' '+base+'L'+first[0]+' '+base+'Z';
  const folds: string[]=[];
  const silks: string[]=[];
  const ore: string[]=[];
  const moss: string[]=[];
  const mineralVeins: string[]=[];
  const forest: string[]=[];
  for (let i=1; i<ridge.length-2; i++) {
    const [x,y]=ridge[i]!;
    const span=base-y;
    if (span<=0) continue;
    const side=ridge[i+1]![1] - ridge[i-1]![1] > 0 ? 1 : -1;
    const length = Math.min(span * (.35+rand()*.48), 85+rand()*109);
    const drift = (side*.11+.09)*length;
    if (i%8===0 && density>.63) {
      const shoulder=Math.min(30,span*.14)*(1+rand());
      const tail=Math.min(100,length*.8);
      const sweep=rand()>.58 ? -1 : 1;
      mineralVeins.push('<path d="M'+round(x)+' '+round(y+3)+'q'+round(sweep*3)+' '+round(shoulder*.6)+' '+round(-sweep*10)+' '+round(shoulder)+'t'+round(-sweep*13)+' '+round(tail*.55)+'q'+round(sweep*12)+' '+round(-tail*.45)+' '+round(sweep*22)+' '+round(-tail*.62)+'q'+round(sweep*10)+' '+round(-shoulder*.5)+' '+round(sweep*1)+' '+round(-shoulder*.92)+'z" fill="'+gold+'" opacity=".17"/>');
    }
    if (i % 4===0) {
      let d='M'+round(x)+' '+round(y+1);
      let px=x,py=y+1;
      const count=8;
      const turns: Point[] = [];
      for (let j=1;j<=count;j++) {
        px=x+drift*j/count+(rand()-.43)*12;
        py=y+length*j/count;
        turns.push([px,py]); d+='L'+round(px)+' '+round(py);
      }
      const broad=7+rand()*15;
      const shape=d+'L'+round(x+broad+drift*.72)+' '+round(y+length*.68)+'Q'+round(x+broad+drift*.5)+' '+round(y+length*.4)+' '+round(x+3)+' '+round(y+1)+'Z';
      folds.push('<path d="'+shape+'" fill="'+ink+'" opacity="'+round((.16+rand()*.08)*density)+'"/>');
      for(let j=1;j<4;j++){
        const start=Math.floor(rand()*3);
        const end=4+Math.floor(rand()*4);
        const lines=turns.slice(start,end).map(([xx,yy],k):Point=>[xx+j*(1.6+k*.14),yy+rand()*4]);
        if(lines.length>1)silks.push(pathThrough(lines));
      }
      ore.push(pathThrough(turns.slice(0,2+Math.floor(rand()*4)).map(([xx,yy]):Point=>[xx-1.6,yy+4])));
    }
    if (rand()<.6*density && side<0) {
      const spots = 2+Math.floor(rand()*3);
      for (let j=0;j<spots;j++) {
        const cx=round(x+(rand()-.5)*9),cy=round(y+rand()*10-2);
        moss.push('M'+cx+' '+cy+'q1.3 -2.4 3.5 -1.5q-.7 2.5 -3.5 1.5z');
      }
    }
    if (density>.6 && rand()<.36 && (side<0 || i%6===0)) {
      const s=.26+rand()*.7;
      const hx=round(x),hy=round(y+1.7);
      forest.push('<g transform="translate('+hx+' '+hy+') scale('+round(s)+')"><path d="M-.7 1l.3-3.7l-4 .8l1.2-1.5l-3.4.5l1.7-1.5l4.5-.8l.6-3.2l-2.7.6l.9-1.3l-1.5.2l1.1-1.4l2.8-1l1.1-3.4l.8 3.6l2.7.9l1.2 1.4l-3.8-.4l-.4 2.6l2.9-.5l2.2 1.2l1.1.8l-2.3-.3l1.6 1.3l-4 .2L.6-2L.4 1z"/></g>');
    }
  }
  return '<g><path d="'+outline+'" fill="'+face+'"/>'+folds.join('')+mineralVeins.join('')+'<path d="'+silks.join('')+'" fill="none" stroke="'+ink+'" stroke-width=".85" opacity="'+(.54*density)+'"/><path d="'+ore.join('')+'" fill="none" stroke="'+gold+'" stroke-width="1" opacity="'+(.49*density)+'"/><path d="'+moss.join('')+'" fill="'+ink+'" opacity=".72"/><path d="'+edge+'" stroke="'+ink+'" stroke-opacity=".44" fill="none" stroke-width=".85"/><g fill="'+ink+'" opacity=".9">'+forest.join('')+'</g></g>';
}

function pine(x:number,y:number,size:number,seed:number) {
  const rand=randomSource(seed);
  const heads:Point[]=[[-43,-63],[-69,-70],[-78,-65],[-27,-72],[-42,-80],[15,-84],[38,-92],[56,-95],[11,-103],[23,-115],[-6,-111],[-31,-99],[-45,-100]];
  const clusters=heads.map(([cx,cy]) => {
    const w=9+rand()*12;
    let needles='';
    // The radiating strokes leave a fringe around each long, windswept tuft.
    for(let j=0;j<31;j++){
      const angle=-Math.PI + j/30*Math.PI;
      const len=.74+rand()*.28;
      const ox=cx+(rand()-.5)*8;
      const oy=cy+rand()*2;
      const ex=ox+Math.cos(angle)*w*len, ey=oy+Math.sin(angle)*w*.64*len;
      needles+='M'+round(ox)+' '+round(oy)+'Q'+round((ex+ox)/2)+' '+round(ey+2)+' '+round(ex)+' '+round(ey);
    }
    return '<path d="M'+round(cx-w)+' '+round(cy-1)+'q'+round(w*.15)+' -6 '+round(w*.6)+' -6q'+round(w*.9)+' -7 '+round(w*1.4)+' 5q'+round(-w*.95)+' 7 '+round(-w*2)+' 1z" fill="#274b40"/><path d="'+needles+'" stroke="#233f37" stroke-width=".74" fill="none"/><path d="M'+round(cx-w*.65)+' '+round(cy-3)+'q7 -5 12 -4" stroke="#99a27c" opacity=".63" fill="none"/>';
  });
  return '<g transform="translate('+x+' '+y+') scale('+size+')"><path d="M-14 1C-3-4-4-17 0-28S23-43 20-51C18-61-3-63-7-72S-2-82-4-89L3-89C8-74 9-72 18-69C36-61 32-46 24-40S9-30 7-23C3-11 6-7 12-4L25-2C12 1 5 1-1-1C-5 0-9 2-14 1Z" fill="#544e38" stroke="#303d30" stroke-width="1.1"/><path d="M2-6C2-23 5-25 18-36S29-50 24-57M0-18Q-1-11-6-6M15-39Q30-48 19-59M2-76L-2-82" fill="none" stroke="#a49268" stroke-width="1.45"/><g fill="none" stroke="#4a4835" stroke-linecap="round"><path d="M22-54Q9-61-10-57T-40-60L-66-69M6-68Q-8-71-25-71L-43-79M12-65Q21-83 36-84T56-93M-2-78Q-12-89-9-96L-6-109M-7-88Q-24-88-30-97L-44-99M-2-88Q14-94 15-103L23-113" stroke-width="3.8"/><path d="M-43-62L-46-67M-53-65L-77-65M27-83L37-92M15-103L9-104M-13-91L-32-100M-39-60L-42-63" stroke-width="1.6"/></g>'+clusters.join('')+'</g>';
}

function eaves(x:number,y:number,k:number,roof:string,wall:string) {
  const tiles=Array.from({length:27},(_,i)=>{
    const t=i/26;
    const tx=-43+t*85, bx=-60+t*119;
    return 'M'+round(tx)+' -34Q'+round(tx-1)+' -26 '+round(bx)+' '+round(-21+3.7*Math.sin(t*Math.PI));
  }).join('');
  const doors=Array.from({length:7},(_,i)=>'<path d="M'+(-40+i*13)+' -16v15" stroke="#9b6850" stroke-width="4"/><path d="M'+(-38+i*13)+' -16v14" stroke="#d4a16e" stroke-width=".9"/>').join('');
  return '<g transform="translate('+x+' '+y+') scale('+k+')"><path d="M-54-4L48-4L57 1L-58 1Z" fill="#aaa48c" stroke="#676b58" stroke-width=".8"/><path d="M-49-21h94v18h-94z" fill="'+wall+'"/><path d="M-36-17h70v14h-70z" fill="#5a443a"/>'+doors+'<path d="M-65-27Q-57-22-47-24Q-39-25-35-36L34-36Q43-24 52-23Q60-22 65-28L60-19Q39-15 0-15Q-40-15-62-20Z" fill="'+roof+'" stroke="#494d3c" stroke-width="1.2"/><path d="'+tiles+'" fill="none" stroke="#ead8a0" opacity=".49" stroke-width=".8"/><path d="M-66-28Q-60-20-48-22M-60-20Q0-12 59-20Q64-23 66-30M-41-40Q-39-34-33-35L32-35Q37-35 39-40" fill="none" stroke="#b39a66" stroke-width="2.3"/><path d="M-49-15L47-15" stroke="#d8ad70" stroke-width="1.4"/></g>';
}

function gateway() {
  return '<g><path d="M-72 1L-67-37L-56-42L57-42L66-35L71 1L17 1V-12A16 16 0 0 0-15-12V1Z" fill="#af6953" stroke="#6f5545" stroke-width="1.7"/><path d="M-68-34L-54-39H57L64-35Z" fill="#d6b588"/><path d="M-25 1V-15A26 26 0 0 1 25-15V1H16V-14A16 16 0 0 0-16-14V1Z" fill="#cbc0a0" stroke="#776f58" stroke-width="1.2"/><path d="M-65-4H-27M28-4H68M-64-10H-28M29-10H65M-58-28H-30M31-28H59" fill="none" stroke="#e2b095" opacity=".6"/>'+eaves(0,-39,.86,'#566557','#a36f51')+'<rect x="-13" y="-38" width="26" height="7" rx="1" fill="#526154" stroke="#c5ad78" stroke-width="1"/></g>';
}

function steps() {
  let lines='';
  for(let i=0;i<17;i++){
    const t=(i+1)/18, y=2+t*78, mid=-t*78,w=8+t*23;
    lines+='M'+round(mid-w)+' '+round(y)+'l'+round(w*2)+' -1';
  }
  return '<path d="M-8 0L11 0L-43 81L-115 82Z" fill="#b9ac85"/><path d="'+lines+'" stroke="#696f58" stroke-width="1.6" opacity=".9" fill="none"/>';
}

function column(x:number,y:number,s:number) {
  return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-6 1h12l-1-3h-10zM-4-2h8l-1-2h-6zM-2.8-4h5.6l-.4-38h-4.8zM-4-43h8l-1.5-4h-5z" fill="#d3c6a2" stroke="#746f55" stroke-width=".9"/><path d="M1-5v-36M-2-29q4-6 5-3M-5-43q4-3 10-1M0-47q-5-3 0-6q5 3 0 6" fill="none" stroke="#928767" stroke-width="1.4"/></g>';
}

function landmarks(scene:string,x:number,y:number,leaf:string) {
  let item='';
  switch(scene) {
    case 'tianwaicun': {
      const pillars=Array.from({length:6},(_,i)=>column(-132+i*16,-6-i*1.7,.7-i*.039)+column(20+i*10,-6-i*1.7,.7-i*.039)).join('');
      item='<path d="M-205 46L-134-13L75-15L115 17L-40 59Z" fill="#c6b997" stroke="#9c9677"/><path d="M-205 47Q-126 1-28 8T95-16" fill="none" stroke="#dfcba2" stroke-width="14"/>'+pillars+'<g transform="translate(-58 8) rotate(-5)"><rect x="-16" y="-12" width="36" height="13" rx="3" fill="#b99c68" stroke="#4c6354"/><rect x="-13" y="-10" width="29" height="6" rx="1" fill="#5b7b70"/><path d="M-6-10v6m7-6v6m7-6v6" stroke="#d9c795"/><circle cx="-9" cy="1" r="2.8" fill="#364b40"/><circle cx="13" cy="1" r="2.8" fill="#364b40"/></g>';
      break;
    }
    case 'zhongtianmen':
      item='<g transform="translate(-4 0)">'+steps()+'<path d="M-36 0v-50h8V0M26 0v-50h8V0" fill="#d2c6a4" stroke="#777862"/><path d="M-44-49h85l-6-7h-73zM-38-41h73v5h-73z" fill="#babb9e" stroke="#6e7664"/><path d="M-19-59h34v12h-34z" fill="#c8c3a4" stroke="#797c69"/></g><path d="M-335-94L222-279M-335-91L222-276" stroke="#4e6354" fill="none" stroke-width="1.1"/><g class="cable-cabin"><g transform="translate(-119 -165)"><path d="M0 0L3 3v8" stroke="#4a5348" stroke-width="2" fill="none"/><path d="M-6 10h17l3 4v9l-3 3H-6l-4-4v-8z" fill="#b56b4f" stroke="#505548" stroke-width="1.2"/><path d="M-6 13h16v7H-7z" fill="#b9c6ad"/><path d="M1 13v7" stroke="#676e5d"/></g></g>';
      break;
    case 'nantianmen':
      item=steps()+gateway();
      break;
    case 'tianjie':
      item='<path d="M-172 52Q-129 18-40 0Q32-15 102-18L110-9Q37-7-35 9Q-111 26-144 54Z" fill="#cebd97" stroke="#ac9c7e"/>'+eaves(82,-21,.45,'#50645d','#b8ad90')+eaves(37,-13,.61,'#5c6b60','#c2b99c')+eaves(-29,1,.78,'#637266','#ad9d7d')+eaves(-110,20,.84,'#52675e','#bec0a5')+'<path d="M-124 38Q-72 13-8 4T111-12" fill="none" stroke="#aaa589" stroke-width="3"/>';
      break;
    case 'bixia':
      item='<path d="M-129 1L-110-15L87-18L120-5L121 2L-128 11Z" fill="#bdb39a" stroke="#667362"/>'+eaves(23,-35,.75,'#70735e','#a86c52')+eaves(-53,-15,.65,'#66705d','#a35d49')+eaves(77,-13,.48,'#6d7560','#a4654c')+eaves(2,-4,.99,'#8b825f','#aa654c')+'<path d="M-24 0h39l15 10h-66z" fill="#c7b99b"/>';
      break;
    case 'daguan':
      item='<path d="M-117 6L-106-43L-91-57L-72-69L-63-102L-45-98L-35-89L-13-97L-5-110L17-115L34-106L50-112L75-101L91-76L100-55L112 5Z" fill="#b0a184" stroke="#7d775f" stroke-width="1.6"/><path d="M-117 6L-93-54L-67-76L-59-94L-69-34L-49-51L-60-6ZM70-101L75-58L60-12L91-39L94-55L108-6L113 6L51 9Z" fill="#877f63"/><path d="M-50-92L-55-64L-50-55L-71-22M28-101L18-88L17-69L6-46M48-109L55-95L50-80M69-29L57-8M-28-94L-37-79L-35-58" fill="none" stroke="#ded0a8" stroke-width="1.8"/><g transform="skewX(-7)" fill="#826443" opacity=".83" font-family="KaiTi,STKaiti,serif"><text x="43" y="-80" font-size="10">紀<tspan x="43" dy="11">泰</tspan><tspan x="43" dy="11">山</tspan><tspan x="43" dy="11">銘</tspan></text></g>'+Array.from({length:12},(_,c)=>Array.from({length:7+(c%3)},(_,r)=>'<path d="M'+(-39+c*6)+' '+(-70+r*5)+'h3m-2-1v3m-1-1h3" fill="none" stroke="#917c52" stroke-width=".65"/>').join('')).join('');
      break;
    case 'yuhuang':
      item='<path d="M-123 5l17-13L86-10l26 6 4 7-217 9z" fill="#aaa98c"/>'+eaves(12,-19,.70,'#627263','#a27858')+eaves(-50,-6,.57,'#536557','#a87a59')+eaves(47,-3,.57,'#5b6c5b','#a57455')+'<path d="M-16-2l2-20 9-3 5 22Z" fill="#bbb198" stroke="#857e67"/>';
      break;
    default:
      item=eaves(10,-8,.44,'#596f5b','#b98460')+eaves(-25,-2,.36,'#576b5b','#b88d6e');
  }
  return '<g transform="translate('+x+' '+y+')" color="'+leaf+'">'+item+'</g>';
}

function cloudBank(x:number,y:number,size:number,tone:string,edge:string) {
  return '<g transform="translate('+x+' '+y+') scale('+size+')"><path d="M-64 22C-10 15 38 18 67 11C94 4 82-4 104-9C132-16 141 0 126 6C114 10 105 5 110 1C112-1 116-1 118 0C117-5 110-7 103-4C91 2 102 13 115 13C141 14 146 3 171 1C197-2 219 10 253 6C278 3 285-3 319-2C347 0 365 5 400-2C421-6 436-17 455-14C467-13 474-7 472-2C489-5 501 0 503 5C526 4 546 5 569 11C532 13 492 11 455 16C409 24 382 20 349 23C291 29 250 22 203 24C139 30 53 31-64 22Z" fill="'+tone+'"/><path d="M-36 21Q45 25 91 10M143 11Q165-2 195 4M287 8Q338 1 360 4M425 0Q443-12 458-8M390 19Q430 16 457 12" fill="none" stroke="'+edge+'" stroke-width="1.2" opacity=".58"/></g>';
}

function foothills(phase:number,level:number):Point[] {
  const points:Point[]=[];
  for(let i=-1;i<=47;i++) {
    const x=i*20;
    const y=level+Math.sin(i*.38+phase)*18+Math.sin(i*.87+phase*.35)*10+Math.sin(i*.16-.7)*18;
    points.push([x,y]);
  }
  return points;
}

function cliffTop(center:number,top:number,phase:number):Point[] {
  const profile:Point[]=[[-400,224],[-348,180],[-304,192],[-272,157],[-250,168],[-226,134],[-210,140],[-189,91],[-168,99],[-152,83],[-131,114],[-119,109],[-94,59],[-79,60],[-65,25],[-51,36],[-39,33],[-15,4],[-2,0],[14,6],[23,31],[36,33],[49,59],[65,56],[78,69],[91,64],[102,85],[119,88],[128,117],[150,125],[169,141],[186,135],[195,142],[209,131],[226,111],[243,108],[258,95],[272,101],[288,98],[304,117],[317,119],[336,149],[361,146],[390,165]];
  return [[-25,top+247],...profile.map(([x,y]):Point=>[center+x,top+y+Math.sin(x*.02+phase)*4]),[937,top+200]];
}

let drawingCount=0;

export function landscape(scene:string):string {
  const key=Object.prototype.hasOwnProperty.call(views,scene) ? scene : 'cover';
  const view=views[key]!;
  const [paper,horizon,far,middle,mineral,dark,gold,sun]=colors[key]!;
  const {sun:[sx,sy],peak:[px,py],ledge:y,phase}=view;
  const id='tai-ink-'+ (++drawingCount);
  const fill=(name:string)=>'url(#'+id+'-'+name+')';
  const rand=randomSource(4790+phase);
  // One small paper-grain tile serves the whole drawing. It is static to keep animation cheap on phones.
  const grains=Array.from({length:56},()=>{const x=round(rand()*48),gy=round(rand()*48);return 'M'+x+' '+gy+'l'+round(.2+rand()*1.1)+' '+round(rand()*.65)}).join('');
  const defs='<defs><linearGradient id="'+id+'-sky" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="'+paper+'"/><stop offset=".65" stop-color="'+horizon+'"/><stop offset="1" stop-color="#f0e4c6"/></linearGradient><linearGradient id="'+id+'-wash" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#f5e9cb" stop-opacity="0"/><stop offset=".7" stop-color="#eee3c7" stop-opacity=".75"/><stop offset="1" stop-color="#efe1c3"/></linearGradient><linearGradient id="'+id+'-green" x2=".18" y2="1"><stop stop-color="'+middle+'"/><stop offset=".52" stop-color="'+mineral+'"/><stop offset="1" stop-color="'+dark+'"/></linearGradient><radialGradient id="'+id+'-glow"><stop stop-color="#f8d5a1" stop-opacity=".65"/><stop offset="1" stop-color="#f4ce9f" stop-opacity="0"/></radialGradient><pattern id="'+id+'-paper" width="48" height="48" patternUnits="userSpaceOnUse"><path d="'+grains+'" stroke="#473e29" stroke-width=".65" opacity=".13"/><path d="M3 12l3 .3M30 34l2-.3M21 5l1 0M15 42l3-.5" stroke="#fff7db" stroke-width=".65" opacity=".13"/></pattern></defs>';
  const farMountains=mountain(foothills(phase/8,212),353,far,middle,paper,2900+phase,.32)
    +'<rect x="0" y="175" width="900" height="190" fill="'+fill('wash')+'" opacity=".87"/>'
    + mountain(foothills(phase*.12+.6,250).map(([x,yy]):Point=>[x,yy+Math.sin(x*.011)*21]),399,middle,mineral,paper,259+phase,.5)
    +'<rect x="0" y="217" width="900" height="202" fill="'+fill('wash')+'" opacity=".91"/>';
  const central=mountain(cliffTop(px,py,phase),438,fill('green'),dark,gold,27691+phase,.87);
  const shelf:Point[]=[[-22,491],[23,465],[63,476],[104,467],[151,481],[190,464],[235,457],[251,433],[285,426],[310,405],[337,412],[363,397],[386,400],[400,y+52],[423,y+46],[449,y+32],[462,y+29],[487,y+12],[508,y+7],[528,y],[562,y-1],[589,y-7],[621,y-7],[649,y-9],[682,y-17],[714,y-23],[742,y-9],[756,y-13],[792,y+3],[819,y+9],[846,y+27],[903,y+30]];
  const curtain=mountain(shelf,503,mineral,dark,gold,8265+phase,.98);
  const leading:Point[]=[[-20,378],[4,359],[28,355],[45,345],[55,347],[64,358],[92,362],[105,377],[121,379],[135,406],[159,415],[175,439],[197,449],[209,469],[239,480],[253,503]];
  const front=mountain(leading,504,dark,'#283e34',gold,654+phase,.85);
  const banks='<g class="distant-cloud" opacity=".53">'+cloudBank(-150,214,.94,'#eee2bd','#bea987')+'</g><g class="drifting-cloud" opacity=".94">'+cloudBank(-106,323,.94,'#eddfbc','#bdab86')+'</g>';
  const nearFog='<g class="distant-cloud" opacity=".9">'+cloudBank(34,390,.84,'#e6dabb','#ac9d7a')+'</g>';
  const birds='<g class="swallows" fill="'+dark+'" opacity=".86"><path d="M319 117q8 0 13 5q1-7 10-11q-7 7-8 13q-7-4-15-7zM346 131q6 0 11 3q2-6 8-8q-5 6-7 9q-6-2-12-4zM286 130q4-2 8-1q0-5 4-8q-2 5-3 9q-5-1-9 0z"/></g>';
  const nearTrees=Array.from({length:7},(_,i)=>{
    const tx=round(717+i*17+(rand()-.5)*5),ty=round(y-20+(i>1?i*5:0));
    return '<path d="M'+tx+' '+ty+'q3-7 0-20m-7 15q4-3 7-2l8-1m-12-5q3-3 5-2l6-1" stroke="'+dark+'" stroke-width="2.2" fill="none" />';
  }).join('');
  const sky='<rect width="900" height="500" fill="'+fill('sky')+'"/><circle cx="'+sx+'" cy="'+sy+'" r="91" fill="'+fill('glow')+'"/><circle cx="'+sx+'" cy="'+sy+'" r="'+(key==='yuhuang'?32:24)+'" fill="'+sun+'" opacity=".81"/>'+birds;
  return '<svg class="mountain-painting" viewBox="0 0 900 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="'+view.name+'" xmlns="http://www.w3.org/2000/svg">'+defs+sky+farMountains+central+banks+'<rect x="0" y="301" width="900" height="151" fill="'+fill('wash')+'" opacity=".92"/>'+nearFog+curtain+landmarks(key,586,y-5,dark)+nearTrees+front+pine(52,350,.88,36)+pine(141,409,.55,721)+ (key==='cover'?pine(737,y-13,.47,271):'')+'<rect width="900" height="500" fill="'+fill('paper')+'" pointer-events="none"/></svg>';
}
