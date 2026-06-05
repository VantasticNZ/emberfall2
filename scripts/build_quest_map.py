# =============================================================================
# build_quest_map.py — generates docs/quest-map.html FROM docs/QUEST-DATA.json
# (the source of truth). The JSON is EMBEDDED into the page at build, so the
# webpage is self-contained (no external deps) and stays in sync — re-run this
# script whenever QUEST-DATA.json changes.
# =============================================================================
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = open(os.path.join(ROOT, 'docs', 'QUEST-DATA.json'), encoding='utf-8').read()
json.loads(RAW)  # validate

HTML = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Emberfall - Quest &amp; Decision Map</title>
<style>
  :root{
    --bg:#14121c; --panel:#1d1930; --panel2:#252036; --line:#352d4d; --ink:#e9e4f5;
    --dim:#9a92b4; --good:#2f9e57; --neutral:#c9912e; --dark:#b0413e; --accent:#7c5cff;
    --perm:#e0b64a;
  }
  *{box-sizing:border-box}
  html,body{margin:0;height:100%;background:var(--bg);color:var(--ink);
    font:14px/1.4 "Segoe UI",system-ui,sans-serif}
  a{color:var(--accent)}
  header{position:sticky;top:0;z-index:20;background:linear-gradient(#191527,#15121f);
    border-bottom:1px solid var(--line);padding:10px 16px}
  h1{margin:0 0 8px;font-size:18px;letter-spacing:.5px}
  h1 .sub{color:var(--dim);font-size:12px;font-weight:400;margin-left:8px}
  .hud{display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap}
  .bars{min-width:280px}
  .bar{display:flex;align-items:center;gap:8px;margin:4px 0}
  .bar label{width:64px;font-size:12px;color:var(--dim);text-align:right}
  .track{position:relative;flex:1;height:14px;background:var(--panel2);border:1px solid var(--line);
    border-radius:7px;overflow:hidden;min-width:160px}
  .track .mid{position:absolute;left:50%;top:0;bottom:0;width:1px;background:#5a5076}
  .track .fill{position:absolute;top:0;bottom:0;left:50%;width:0;transition:.25s}
  .track .fill.pos{background:linear-gradient(90deg,#2f9e57aa,#37c46a)}
  .track .fill.neg{background:linear-gradient(270deg,#b0413eaa,#d05450)}
  .bar .val{width:40px;font-variant-numeric:tabular-nums;font-size:12px}
  .endings{display:flex;gap:8px;flex-wrap:wrap}
  .ending{position:relative;background:var(--panel2);border:1px solid var(--line);border-radius:8px;
    padding:6px 9px;min-width:120px;max-width:150px;opacity:.45;transition:.25s;filter:grayscale(.6)}
  .ending.lit{opacity:1;filter:none}
  .ending.lead{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),0 0 18px #7c5cff66}
  .ending b{display:block;font-size:13px}
  .ending small{color:var(--dim);font-size:10.5px;display:block;margin-top:2px}
  .ending .pip{position:absolute;top:6px;right:8px;font-size:10px;color:var(--dim)}
  .ending.secret{border-style:dashed}
  .tools{display:flex;gap:10px;align-items:center;margin-left:auto}
  button.btn{background:var(--panel2);color:var(--ink);border:1px solid var(--line);border-radius:6px;
    padding:6px 12px;cursor:pointer}
  button.btn:hover{border-color:var(--accent)}
  .story{margin-top:8px;background:#120f1d;border:1px solid var(--line);border-radius:8px;
    padding:8px 10px;min-height:34px;font-size:13px;color:#cfc6e6}
  .story .who{color:var(--accent);font-weight:600}
  main{height:calc(100vh - 0px);overflow:auto;padding:14px 16px 60px}
  .board{display:flex;gap:14px;align-items:flex-start;min-width:max-content}
  .col{flex:0 0 232px;width:232px}
  .col h3{margin:0 0 8px;font-size:12px;color:var(--dim);text-transform:uppercase;letter-spacing:1px;
    border-bottom:1px solid var(--line);padding-bottom:4px}
  .quest{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:9px;
    margin-bottom:12px;transition:.2s}
  .quest.perm{border-color:var(--perm)}
  .quest.pruned{opacity:.28;filter:grayscale(1)}
  .quest .qhead{display:flex;justify-content:space-between;gap:6px;align-items:baseline}
  .quest .qid{font-size:11px;color:var(--dim);font-variant-numeric:tabular-nums}
  .quest .qtitle{font-weight:600;font-size:13.5px}
  .badges{display:flex;flex-wrap:wrap;gap:4px;margin:5px 0 2px}
  .tag{font-size:10px;padding:1px 6px;border-radius:10px;background:var(--panel2);color:var(--dim);
    border:1px solid var(--line)}
  .tag.region{color:#9fd0ff}.tag.type{color:#cdb4ff}.tag.tone{color:#ffcaa8}
  .tag.permt{color:#120f1d;background:var(--perm);border-color:var(--perm);font-weight:700}
  .tag.lockedout{color:#120f1d;background:#b0413e;font-weight:700}
  .choices{margin-top:6px;display:flex;flex-direction:column;gap:6px}
  .choice{text-align:left;border:1px solid var(--line);border-left-width:4px;border-radius:7px;
    background:#1a1628;padding:6px 8px;cursor:pointer;transition:.15s}
  .choice:hover{background:#221c34}
  .choice.good{border-left-color:var(--good)}
  .choice.neutral{border-left-color:var(--neutral)}
  .choice.dark{border-left-color:var(--dark)}
  .choice.sel{outline:2px solid var(--accent);background:#2a2240}
  .choice .clabel{font-size:12.5px;font-weight:600}
  .choice .cmeta{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}
  .pill{font-size:9.5px;padding:0 5px;border-radius:8px;background:#241f38;color:var(--dim);
    border:1px solid var(--line)}
  .pill.k{color:#ffe2a8}.pill.u{color:#9be7b0}.pill.l{color:#f0a6a3}.pill.e{color:#cdb4ff}
  .pill.perm{color:#120f1d;background:var(--perm);font-weight:700}
  .cstory{font-size:11px;color:var(--dim);margin-top:4px;font-style:italic}
  .legend{display:flex;gap:12px;font-size:11px;color:var(--dim);margin-top:6px;flex-wrap:wrap}
  .legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px;
    vertical-align:-1px}
</style>
</head>
<body>
<header>
  <h1>Emberfall &mdash; Quest &amp; Decision Map <span class="sub" id="meta"></span></h1>
  <div class="hud">
    <div class="bars">
      <div class="bar"><label>Morality</label>
        <div class="track"><div class="mid"></div><div class="fill" id="mfill"></div></div>
        <span class="val" id="mval">0</span></div>
      <div class="bar"><label>Purity</label>
        <div class="track"><div class="mid"></div><div class="fill" id="pfill"></div></div>
        <span class="val" id="pval">0</span></div>
      <div class="legend">
        <span><i style="background:var(--good)"></i>good</span>
        <span><i style="background:var(--neutral)"></i>neutral</span>
        <span><i style="background:var(--dark)"></i>dark</span>
        <span><i style="background:var(--perm)"></i>permanent</span>
      </div>
    </div>
    <div class="endings" id="endings"></div>
    <div class="tools"><button class="btn" id="reset">Reset choices</button></div>
  </div>
  <div class="story" id="story">Click choices to trace a path &mdash; locks grey out quests, the bars move, and an ending lights up.</div>
</header>
<main><div class="board" id="board"></div></main>

<script>
const QUEST_DATA = __DATA__;
const QUESTS = QUEST_DATA.quests;
const ENDINGS = QUEST_DATA._meta.endings; // {W,S,T,L,A}
const byId = {}; QUESTS.forEach(q => byId[q.id] = q);

// resolve a unlock/lock target (may carry a branch suffix like "SG7ally") to a quest id
function resolve(target){
  if (byId[target]) return target;
  let best=null;
  for (const id in byId){ if (target.startsWith(id) && (!best || id.length>best.length)) best=id; }
  return best; // may be null
}

// ---- completion layers (left->right): longest-path depth seeded by act ------
const ACT_BASE = {1:0, 2:3, 3:9};
const preds = {}; QUESTS.forEach(q => preds[q.id]=[]);
QUESTS.forEach(q => (q.choices||[]).forEach(c => (c.unlocks||[]).forEach(u => {
  const t = resolve(u); if (t && t!==q.id) preds[t].push(q.id);
})));
const depth = {}; QUESTS.forEach(q => depth[q.id] = ACT_BASE[q.act] ?? 0);
for (let it=0; it<200; it++){
  let changed=false;
  QUESTS.forEach(q => (q.choices||[]).forEach(c => (c.unlocks||[]).forEach(u => {
    const t=resolve(u); if(!t||t===q.id) return;
    const nd = Math.max(depth[t], depth[q.id]+1, ACT_BASE[byId[t].act]??0);
    if (nd!==depth[t]){ depth[t]=nd; changed=true; }
  })));
  if(!changed) break;
}
const layers = {};
QUESTS.forEach(q => { (layers[depth[q.id]] = layers[depth[q.id]] || []).push(q); });
const layerKeys = Object.keys(layers).map(Number).sort((a,b)=>a-b);

// ---- karma parsing (Morality M, Purity P) -----------------------------------
function karmaDelta(s){
  let m=0,p=0; const re=/([+\-])\s*([MP])/g; let x;
  while((x=re.exec(s||''))){ const v=x[1]==='+'?1:-1; if(x[2]==='M')m+=v; else p+=v; }
  return {m,p};
}
function endingVote(s){ // returns {key, weight}
  if(!s) return null;
  const k = (s.match(/[WSTLA]/)||[])[0]; if(!k) return null;
  const weight = /-lean|-hint/i.test(s) ? 0.5 : 1;
  return {key:k, weight};
}

// ---- state ------------------------------------------------------------------
const selected = {}; // questId -> choice index
let lastStory = null;

function recompute(){
  let M=0,P=0; const votes={W:0,S:0,T:0,L:0,A:0}; const pruned=new Set();
  for(const qid in selected){
    const q=byId[qid]; const c=q.choices[selected[qid]]; if(!c) continue;
    const d=karmaDelta(c.karma); M+=d.m; P+=d.p;
    const v=endingVote(c.ending); if(v && votes[v.key]!==undefined) votes[v.key]+=v.weight;
    (c.locks||[]).forEach(l => { const t=resolve(l); if(t) pruned.add(t); });
  }
  // ending scores
  const score = {
    W: 1 + votes.W + (Math.abs(M)<=2 ? 1.2 : 0),
    S: votes.S + Math.max(0,M)*0.6 + Math.max(0,P)*0.3,
    T: votes.T + Math.max(0,-M)*0.6 + Math.max(0,-P)*0.3,
    L: votes.L + Math.max(0,P)*0.25,
    A: votes.A*2,
  };
  let lead=null,max=-1; for(const k in score){ if(score[k]>max){max=score[k];lead=k;} }
  if(max<=0.001) lead=null;
  return {M,P,votes,pruned,score,lead};
}

function applyState(){
  const st=recompute();
  // bars (clamp display to +-8)
  const setBar=(fill,val,v)=>{
    const pct=Math.max(-8,Math.min(8,v))/8*50;
    fill.className='fill '+(v>=0?'pos':'neg');
    fill.style.left=v>=0?'50%':(50+pct)+'%';
    fill.style.width=Math.abs(pct)+'%';
    val.textContent=(v>0?'+':'')+v;
  };
  setBar(mfill,mval,st.M); setBar(pfill,pval,st.P);
  // endings
  const maxS=Math.max(0.001,...Object.values(st.score));
  document.querySelectorAll('.ending').forEach(el=>{
    const k=el.dataset.k; const s=st.score[k]||0;
    el.classList.toggle('lit', s>0.001);
    el.classList.toggle('lead', k===st.lead && st.lead!==null);
    el.querySelector('.pip').textContent = s>0.001 ? s.toFixed(1) : '';
    el.style.opacity = s>0.001 ? (0.5+0.5*Math.min(1,s/maxS)) : 0.4;
  });
  // pruned quests + selected/disabled choices
  document.querySelectorAll('.quest').forEach(qel=>{
    const qid=qel.dataset.q; const isPruned=st.pruned.has(qid);
    qel.classList.toggle('pruned', isPruned);
    const lo=qel.querySelector('.lockedout'); if(lo) lo.style.display=isPruned?'':'none';
    qel.querySelectorAll('.choice').forEach(cel=>{
      cel.classList.toggle('sel', selected[qid]===+cel.dataset.i);
      cel.style.pointerEvents = isPruned ? 'none' : '';
    });
  });
  // story
  story.innerHTML = lastStory ? lastStory : story.innerHTML;
}

function pick(qid, idx){
  if(selected[qid]===idx) delete selected[qid]; else selected[qid]=idx;
  const q=byId[qid]; const c=q.choices[idx];
  lastStory = (selected[qid]!==undefined && c.story)
    ? '<span class="who">'+q.id+' &middot; '+esc(c.label)+':</span> '+esc(c.story)
    : '<span class="who">'+q.id+'</span> (choice cleared)';
  applyState();
}
function esc(s){return (s+'').replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));}

// ---- render -----------------------------------------------------------------
meta.textContent = QUESTS.length+' quests · '+layerKeys.length+' completion layers · 5 endings';
const board=document.getElementById('board');
layerKeys.forEach(k=>{
  const col=document.createElement('div'); col.className='col';
  const acts=[...new Set(layers[k].map(q=>q.act))].sort();
  col.innerHTML='<h3>Layer '+k+' &middot; Act '+acts.join('/')+'</h3>';
  layers[k].sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true})).forEach(q=>{
    col.appendChild(renderQuest(q));
  });
  board.appendChild(col);
});
function renderQuest(q){
  const el=document.createElement('div'); el.className='quest'+(q.perm?' perm':''); el.dataset.q=q.id;
  let h='<div class="qhead"><span class="qtitle">'+esc(q.title)+'</span><span class="qid">'+q.id+'</span></div>';
  h+='<div class="badges"><span class="tag region">'+esc(q.region)+'</span>'
    +'<span class="tag type">'+esc(q.type)+'</span>'
    +(q.tone?'<span class="tag tone">'+esc(q.tone)+'</span>':'')
    +(q.perm?'<span class="tag permt">PERMANENT</span>':'')
    +'<span class="tag lockedout" style="display:none">LOCKED OUT</span></div>';
  h+='<div class="choices">';
  (q.choices||[]).forEach((c,i)=>{
    let meta='';
    if(c.karma) meta+='<span class="pill k">'+esc(c.karma)+'</span>';
    (c.unlocks||[]).forEach(u=>meta+='<span class="pill u">&rarr;'+esc(u)+'</span>');
    (c.locks||[]).forEach(l=>meta+='<span class="pill l">&oslash;'+esc(l)+'</span>');
    if(c.ending) meta+='<span class="pill e">ending '+esc(c.ending)+'</span>';
    if(q.perm) meta+='<span class="pill perm">permanent</span>';
    h+='<div class="choice '+esc(c.impact||'neutral')+'" data-i="'+i+'" onclick="pick(\''+q.id+'\','+i+')">'
      +'<div class="clabel">'+esc(c.label)+'</div>'
      +(meta?'<div class="cmeta">'+meta+'</div>':'')
      +(c.story?'<div class="cstory">'+esc(c.story)+'</div>':'')+'</div>';
  });
  h+='</div>';
  el.innerHTML=h; return el;
}
// ending cards
const endWrap=document.getElementById('endings');
['W','S','T','L','A'].forEach(k=>{
  const el=document.createElement('div'); el.className='ending'+(k==='A'?' secret':''); el.dataset.k=k;
  el.innerHTML='<span class="pip"></span><b>'+esc(ENDINGS[k].split('(')[0].trim())+'</b>'
    +'<small>'+esc(ENDINGS[k])+'</small>';
  endWrap.appendChild(el);
});
document.getElementById('reset').onclick=()=>{ for(const k in selected) delete selected[k];
  lastStory=null; story.textContent='Choices reset.'; applyState(); };
applyState();
</script>
</body></html>'''

out = HTML.replace('__DATA__', RAW)
path = os.path.join(ROOT, 'docs', 'quest-map.html')
open(path, 'w', encoding='utf-8').write(out)
print('wrote', path, f'({len(out)} bytes)')
