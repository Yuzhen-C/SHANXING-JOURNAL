type Brush = CanvasRenderingContext2D;
const ink = '#334b46', jade = '#32867a', coral = '#dc7652', gold = '#f8bc62';
const paths = new Map<string, Path2D>();

// Bounds of the painted subject, in its own drawing units. Framing includes
// the eaves, plaza or front steps, independent of the screen aspect ratio.
export const landmarkFrames = [
  {left:-109,right:100,top:-80,bottom:18,scale:.87},
  {left:-96,right:106,top:-93,bottom:19,scale:.88},
  {left:-63,right:63,top:-108,bottom:16,scale:.96},
  {left:-108,right:111,top:-68,bottom:27,scale:.88},
  {left:-92,right:96,top:-90,bottom:16,scale:.88},
  {left:-93,right:100,top:-104,bottom:10,scale:.88},
  {left:-90,right:71,top:-77,bottom:15,scale:.88},
] as const;

// Draw in unscaled picture-book units so the same strokes suit every camera.
function shape(c: Brush, d: string, fill?: string, stroke = ink, width = 1.45) {
  let p = paths.get(d);
  if (!p) { p = new Path2D(d); paths.set(d, p); }
  if (fill) { c.fillStyle = fill; c.fill(p); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(p); }
}
function brush(c: Brush, d: string, color = ink, width = 1.45) {
  shape(c, d, undefined, color, width);
}
function disc(c: Brush, x: number, y: number, rx: number, ry: number, color: string) {
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
  c.fillStyle = color; c.fill();
}
function text(c: Brush, words: string, x: number, y: number, size: number, color: string) {
  c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `bold ${size}px "Kaiti SC", KaiTi, "Songti SC", SimSun, serif`;
  c.fillText(words, x, y);
}
function roof(c: Brush, x: number, y: number, width: number, height: number, gilded = false) {
  c.save(); c.translate(x,y); c.scale(width / 100,height / 27);
  const ridge = gilded ? '#ffe39b' : '#a8dac2';
  shape(c,'M-50-9Q-44-3-34-7Q-21-10-14-24L14-24Q20-11 36-6Q45-3 50-9Q49-3 43 0Q1 5-42 0Q-48-2-50-9Z',gilded ? '#e7a549' : jade);
  shape(c,'M-12-23Q-18-10-31-4Q-15-9-6-23ZM8-23Q16-7 34-3Q24-9 14-23Z',gilded?'#cf903e':'#29776e','');
  brush(c,'M-48-7Q-41-3-33-7Q-20-11-14-24M-15-26Q-11-23-6-24H8Q14-23 17-26',ridge,2.1);
  brush(c,'M-19-16Q0-14 19-16M-23-12Q0-9 23-12M-29-7Q0-3 29-7',gilded?'#f4c46c':'#6ea78d',.55);
  for(let k=-3;k<=3;k++) {
    c.beginPath(); c.moveTo(k*3.7,-21); c.quadraticCurveTo(k*5.6,-10,k*10.1,-2);
    c.strokeStyle = ridge; c.lineWidth = .95; c.stroke();
  }
  shape(c,'M-42 0Q0 4 42 0L39 4Q3 8-39 4Z', gilded ? '#b96940' : '#31685f');
  brush(c,'M-37 2Q0 6 37 2',gilded ? '#ffd98c' : '#e0c69b',1.4);
  for(const x of [-32,-24,-16,-8,0,8,16,24,32]){
    const y=4.3-.0018*x*x;
    brush(c,`M${x-1.1} ${y}l.6 1.5h1.4l.7-1.5`,gilded?'#9b603f':'#264f4b',.65);
  }
  c.restore();
}
function stairs(c: Brush, x: number, y: number, width: number) {
  c.save(); c.translate(x,y); c.scale(width/60,1);
  shape(c,'M-18-13H18L30 1Q1 4-30 1Z','#d2bf9a','#6f7365',1);
  brush(c,'M-21-9Q0-8 21-9M-24-6Q0-4 24-6M-27-2Q0 0 27-2','#f7e2b9',1.4); c.restore();
}
function lantern(c: Brush, x: number, y: number, scale=1) {
  c.save(); c.translate(x,y); c.scale(scale,scale);
  brush(c,'M0 0V5M0 15v6','#695244',1);
  shape(c,'M-3 5Q-7 7-5 12Q-4 16 0 16Q5 16 6 12Q7 8 3 5Z','#eb7854','#944936',1);
  brush(c,'M-3 5H3M-3 16H3M-1 7Q-3 10-1 13M0 18v3',gold,1.3); c.restore();
}
function plaque(c: Brush, title: string, x: number, y: number, width: number) {
  c.fillStyle=gold; c.fillRect(x-width/2,y-5.5,width,11);
  c.fillStyle='#285656'; c.fillRect(x-width/2+1.2,y-4.3,width-2.4,8.6);
  text(c,title,x,y+.4,7.1,'#fff2bf');
}
function pillar(c: Brush, x: number, y: number, s: number) {
  c.save();c.translate(x,y);c.scale(s,s);
  shape(c,'M-10 1v-4l3-2v-4h14v4l3 2v4Z','#bbb8a4');
  shape(c,'M-5-9L-4-65Q-5-70 0-74Q5-70 4-65L5-9Z','#e1dabc');
  brush(c,'M1-71Q9-65 0-62Q-8-59-2-55Q7-53 4-48Q3-45-4-43Q-7-41-2-38Q6-36 2-31Q-5-29-4-25Q-4-23 1-23Q6-22 2-17M-4-63Q-9-61-8-57Q-5-60-2-58M3-47Q9-48 8-52Q6-51 4-51','#9b9c88',1.45);
  brush(c,'M-3-66L-3-61M-3-52v5M-3-35v3M-3-19v6','#fff1cf',1.4);
  shape(c,'M-6-68Q-5-72-1-73Q3-78 6-75Q3-74 5-72Q7-70 4-68Z','#c8c8ae');
  c.restore();
}
function village(c: Brush) {
  shape(c,'M-107 0L-78 10L79-2L99-12L93-3L76 4L-78 18L-105 9Z','#afac91','#939781',.95);
  shape(c,'M-108 0L-88-13L52-24L99-12L79-1L-77 10Z','#d7c9a5','#8c957a');
  brush(c,'M-96-7L73-19M-86 1L89-13M-66 6L87-7M-75-14L-62 8M-29-18L-8 5M18-21L39 1','#b2ad91',.65);
  for(const [x,y,s] of [[-83,-5,.95],[-56,-10,.74],[-33,-13,.58],[20,-17,.51],[44,-20,.6],[65,-20,.76]]) pillar(c,x!,y!,s!);
  brush(c,'M-92 3L56-13M-73 6L70-7','#f2e3bd',2);
}
function wheel(c: Brush,x: number,y: number,r: number) {
  disc(c,x,y,r,r,ink);disc(c,x,y,r*.72,r*.72,'#e6c391');disc(c,x,y,r*.45,r*.45,'#588076');
}
function cableStation(c: Brush) {
  shape(c,'M-93-4L18-11L55-2L18 10L-92 16Z','#b1a78b','#777e6c',.9);
  shape(c,'M-93-5L18-13L55-4L18 5L-92 11Z','#d7c89c','#889782',1.2);
  brush(c,'M-84 6L30-4M-60-4L-40 6M-28-6L-9 4M2-8L18 0','#b5ad8d',.8);
  shape(c,'M-90-4V-42L-16-54L24-40V-4Z','#ddba80');
  shape(c,'M-84-41L-17-49V-7L-84-4Z','#f3d59d');
  shape(c,'M-85-37L-20-45V-26L-85-19Z','#6baaa4');
  shape(c,'M-80-23l13-15 7-.9-13 15.5Zm33-6 12-14 7-.8-12 14.3Z','#abd5bd','');
  brush(c,'M-69-39v16m16-18v16m16-18v17','#e9d3a1',2.5);
  shape(c,'M-95-43L-17-57L29-43L24-38L-17-49L-92-37Z','#3c8c80');
  shape(c,'M-56-3v-16l18-2v17Z','#4b695f');
  brush(c,'M-46-19v13m-42-10 27-3M-14-43l33 8v27l-33 1Z','#b8a073',.95);
  shape(c,'M35 0L43-68H50L62-1L54 0L47-48L43 0Z','#a9b4a2');
  brush(c,'M43-57L52-36L42-29L54-17L41-9','#5d766c',2);
  shape(c,'M28-72L65-81L67-75L30-65Z','#7d9181');
  for (const [x,y] of [[35,-68],[45,-71],[55,-74],[64,-77]]) wheel(c,x!,y!,3.1);
  brush(c,'M-38-42Q13-57 38-69L105-92',ink,1.8);
  c.save();c.translate(17,-62);c.scale(.5,.5);cabin(c,0);c.restore();
  c.save();c.translate(83,-85);c.scale(.6,.6);cabin(c,.7);c.restore();
  plaque(c,'中天门',-59,-12,27);
}
function southGate(c: Brush) {
  stairs(c,0,13,95);
  shape(c,'M-61 0L-55-44L52-47L61-1Z','#d66c48');
  brush(c,'M-53-29l10-1m-12 7 8-1m-13 8 13-1m84-20 13-1m-10 8 11 1m-10 6 13 1','#ae654b',.8);
  shape(c,'M-42-2L-39-53L38-53L43-2Z','#e88c5d');
  shape(c,'M-16 0V-16Q-14-34 0-37Q14-34 16-16V0Z','#504f48');
  shape(c,'M-15-1v-15Q-13-31-.2-35Q11-32 14-21Q7-28 1-28Q-7-25-9-14v13Z','#384c48','');
  brush(c,'M-20-2V-17Q-18-37 0-41Q17-38 20-17V-1','#f9c884',3);
  brush(c,'M-19-6l4 1m-4-10 4 1m-3-9 4 2m0-10 3 3m4-10 2 4m6-7v4m8 0-2 3m7 2-3 3m7 5-3 2m5 7-4 1m4 8h-4','#b77c59',.82);
  brush(c,'M-40-5l16 1m46 0 15-1M-38-48l75-.5','#e9a577',1);
  brush(c,'M-53-35L-41-37m-14 11 12-2m84-10 10 1m-11 9 15 1','#f5a276',1.5);
  shape(c,'M-32-53v-25h64v25Z',coral);
  shape(c,'M-23-56v-16h46v16Z','#854d3c');
  for(const x of [-21,-12,-3,6,15]) { c.fillStyle='#eed191';c.fillRect(x,-71,2,14); }
  roof(c,0,-80,100,27);roof(c,0,-53,123,21);
  plaque(c,'南天门',0,-46,33);
}
function street(c: Brush) {
  shape(c,'M-107 0L-66 16L84 10L110-2L106 5L83 16L-65 26L-105 12Z','#a99d83','#847f6d',1);
  shape(c,'M-107 0L-78-9L70-19L110-2L84 11L-66 17Z','#e3c59b','#8f8773');
  brush(c,'M-88 4L74-10M-59 11L86-3M-37-1l12 13m22-15 12 11m29-15 11 11','#f5e0ae',1.4);
  brush(c,'M-95 8L-65 20L82 12L103 3M-75 16v6m32-7v7m33-9v6m27-9v6m29-8v6m29-8v6','#c1b398',.9);
  store(c,-66,-6,.77,'茶','#e7bd84');store(c,-9,-10,1,'岱','#df9461');store(c,52,-14,.89,'食','#e1b577');
  c.save(); c.translate(79,-2);
  brush(c,'M0 0v-47l14-2','#755a41',2.4);
  shape(c,'M4-48l12-2v20l-6-2-5 3Z',coral);
  text(c,'茶',10,-39,8,'#ffebba');c.restore();
}
function store(c: Brush,x:number,y:number,s:number,title:string,wall:string) {
  c.save();c.translate(x,y);c.scale(s,s);
  shape(c,'M-29 0v-36l54-4 5 40Z',wall);
  roof(c,0,-39,76,18);
  shape(c,'M-22 0v-23h12V0Zm22-7v-16h19v16Z','#53665a');
  brush(c,'M1-12h18m-8-10v14','#e8bd87');
  brush(c,'M-20-20v16m2-17v14m-5-10h13M4-21v6m11-6v6','#a39e79',.7);
  brush(c,'M-29-3h6m13 .4 35-.4m-45-24 10-.6','#b47c55',.8);
  shape(c,'M-3-23l20-1 5 4-25 2Z','#d4744e');
  lantern(c,-24,-39,.68);lantern(c,22,-39,.68);plaque(c,title,0,-31,15);
  c.restore();
}
function hall(c: Brush,x:number,y:number,s:number,gilded:boolean) {
  c.save();c.translate(x,y);c.scale(s,s);
  shape(c,'M-40 0v-35l79-1 4 36Z','#d86e51');
  shape(c,'M-34-5v-23h68v23Z','#744e40');
  brush(c,'M-37-32l74-.5m-72 2 68-.4','#f5c88a',.88);
  for (const x of [-32,-17,-2,13,28]) {
    c.fillStyle='#ae6f4e';c.fillRect(x,-24,10,17);
    brush(c,`M${x+2}-22v12m5-12v12m-6-7h7`,'#eebc81',1);
  }
  for(const x of [-37,-13,12,35]){c.fillStyle='#f29a65';c.fillRect(x,-34,3,34);}
  roof(c,0,-37,111,26,gilded);c.restore();
}
function temple(c: Brush) {
  shape(c,'M-91-2L72-9L92-2L78 6L-69 11L-89 6Z','#c4ac88','#8b8872',1);
  stairs(c,-1,13,83);
  hall(c,-55,-16,.65,false);hall(c,61,-15,.60,false);
  shape(c,'M-85 0v-12l168-1 3 13Z','#d87558');
  brush(c,'M-86-12l172-1','#e9bc84',2.5);
  hall(c,-1,-16,1.18,true);
  plaque(c,'碧霞祠',-1,-48,31);lantern(c,-42,-51,.82);lantern(c,39,-52,.82);
  stairs(c,-1,0,68);
}
function cliff(c: Brush) {
  shape(c,'M-93 1L-74-8L71-13L96-5L78 4L-61 11Z','#a9a187','#878571',1);
  shape(c,'M-92 1L-84-26L-70-37L-65-61L-44-64L-32-94L-11-99L3-94L19-102L40-99L53-78L71-78L81-55L87-39L99-23L95-4L39 1Z','#b9aa84');
  shape(c,'M-77-1L-63-35L-50-40L-34-84L-13-90L8-88L21-95L40-89L46-73L38-60L44-8Z','#ddbd8c','#978d71');
  shape(c,'M44-9L50-46L63-61L70-67L74-51L69-41L83-28L84-7Z','#a39b7d','#8e846d');
  brush(c,'M-79-12l14-28 10-3m-7 19 8-8m4-19 10-27 12-5m-9 18 6-13m44-13 10-4 11 3m8 34 7-10m13 37 5-10m-26 31 2-18','#f7d9a4',2);
  // The historical inscription is shown as engraved vertical columns.
  for(const [i,word] of [...'紀泰山銘'].entries()) text(c,word,22,-76+i*13,13,'#8f5435');
  for(let col=0;col<6;col++) {
    for(let row=0;row<11-col%3;row++) {
      const x=9-col*5.8,y=-71+row*4.3+Math.abs(col-1)*.9;
      c.fillStyle=(row+col)%3?'#a37449':'#bb8556';c.fillRect(x,y,2.6,1.15);
      c.fillRect(x+1,y-.6,.8,2.75);
    }
  }
  brush(c,'M-56-4l33-4 23 1m50 4 13-4 20 1','#747963',2.1);
}
function peak(c: Brush) {
  shape(c,'M-85 0L45-10L69-4L50 5L-60 12Z','#bdaf92','#8d8e78',.95);
  stairs(c,23,10,62);
  hall(c,22,-22,.84,false);plaque(c,'玉皇庙',22,-47,23);
  shape(c,'M-76-1L-72-33L-67-39L-68-56L-54-71L-40-68L-31-51L-34-39L-23-28L-24-5Z','#d0b18a');
  shape(c,'M-75-1L-72-33L-64-42L-65-54L-55-66L-58-42L-52-29L-59-5Z','#a9a18a','#9c957d');
  brush(c,'M-50-63l8 2 6 12m-4 21 9 7m-34 10 5-14','#f6dba8',1.8);
  text(c,'极',-47,-47,12,'#b65d42');text(c,'顶',-45,-32,12,'#b65d42');
  shape(c,'M-89 1L-68-6L-33-7L-14-3L-20 1L-66 5Z','#b1ac8d');
  stairs(c,23,-6,48);
  brush(c,'M53-4v-22m16 21v-21m-17 9 18-1M-16-4v-21m12 21v-21m-13 10 13-1','#8c7461',2.6);
}
const landmarks = [village,cableStation,southGate,street,temple,cliff,peak];

export function drawLandmark(c: CanvasRenderingContext2D, index: number): void {
  c.save(); c.lineJoin='round';c.lineCap='round';
  landmarks[index]?.(c);
  c.restore();
}

function bus(c: Brush,time:number) {
  c.save();c.translate(0,Math.sin(time*12)*.45);
  shape(c,'M-31-9v-16q0-7 8-8l35-1q8 0 12 5l6 11v10q-2 3-6 3h-48q-7 0-7-4Z','#ffe2a2',ink,1.8);
  shape(c,'M-30-15h59v9h-57Z','#e8845b','#c16447',.8);
  shape(c,'M-27-20v-7q0-2 3-2h24v10h-27Zm31 1v-11h8q5 0 8 5l3 6Z','#87c9c0');
  brush(c,'M-16-29v10m9-10v10m18-11 1 11','#fff0c2',1.8);
  brush(c,'M-25-25l5-3m7 6 5-5m24 4 3-2','#ddf0d8',1.2);
  shape(c,'M-4-8q6-5 12-1q4 2 10-2q-4 6-10 5q-6-2-12 0Z','#ffe2a2','');
  disc(c,27,-12,2.5,1.8,'#fff0b0');brush(c,'M-30-15h3','#b05246',2);
  for(const x of [-19,18]){wheel(c,x,-5.5,5.5);disc(c,x+Math.cos(time*10)*1.5,-5.5+Math.sin(time*10)*1.5,.7,.7,'#f5dfb5');}
  c.restore();
}
function cabin(c: Brush,time:number) {
  c.save();c.rotate(Math.sin(time*2.4)*.037);
  brush(c,'M-5 0h9M1 0l3 7-6 9v2',ink,2.3);
  shape(c,'M-16 18q1-3 5-3h21q5 0 7 4l4 17q0 6-6 8q-15 2-29-1q-6-1-6-6Z','#eb8a58',ink,1.6);
  shape(c,'M-15 20h12v14h-15ZM1 20h12l4 14H1Z','#92d0c4');
  brush(c,'M-12 28l5-6m9 7 6-7','#e1eed2',1.45);
  brush(c,'M-16 38q15 4 33 0','#ffe0a2',2);
  c.restore();
}
function walker(c: Brush,time:number) {
  const phase=Math.sin(time*7),lift=Math.abs(phase);
  const leg=(offset:number,t:number,color:string)=>{
    const heel=offset+t*6, toe=heel+3;
    c.beginPath();c.moveTo(offset,-13);c.lineTo(offset+t*3,-7-lift);
    c.lineTo(heel,-2-(t<0?lift*2:0));c.strokeStyle=color;c.lineWidth=3.8;c.stroke();
    c.beginPath();c.moveTo(heel,-2-(t<0?lift*2:0));c.lineTo(toe,-1-(t<0?lift*2:0));c.strokeStyle=ink;c.lineWidth=2.7;c.stroke();
  };
  leg(-2,-phase,'#436a69');leg(2,phase,'#66857b');
  c.save();c.translate(0,-lift*1.1);
  shape(c,'M-5-25q4-4 10 0l3 12q-5 3-13 1l-2-4Z','#e68457');
  shape(c,'M-7-26q-3-1-5 3l-1 8q2 3 6 2l3-3Z','#509b89');
  brush(c,'M-10-21h4m4-5q-2 4-2 8','#f2cc89',1.3);
  disc(c,.5,-30,5.4,6,'#f0bc85');
  shape(c,'M-9-32q4-1 5-6q4-8 10 1l7 3q-4 2-11 3Z','#e5b562','#705c43');
  brush(c,'M-5-33q6-1 9-3','#9a7349',1);
  const reach=phase*2;
  c.beginPath();c.moveTo(3,-23);c.lineTo(6,-19);c.lineTo(11+reach,-20);
  c.strokeStyle='#aa6347';c.lineWidth=3.4;c.stroke();
  disc(c,11+reach,-20,1.8,1.8,'#f1c48e');
  c.beginPath();c.moveTo(12+reach,-24);c.lineTo(10+reach*2,-2);
  c.strokeStyle='#77674b';c.lineWidth=1.35;c.stroke();c.restore();
}
export function drawTraveller(c: CanvasRenderingContext2D, kind:'bus'|'cabin'|'walker', time:number, direction:number):void {
  c.save();c.lineJoin='round';c.lineCap='round';c.scale(direction<0?-1:1,1);
  ({bus,cabin,walker})[kind](c,time);
  c.restore();
}
