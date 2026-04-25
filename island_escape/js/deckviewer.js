// ═══════════════ DECK VIEWER ═══════════════

function openDv(){ document.getElementById('dv-mo').style.display='flex'; renderDv(_dvTab); }
function closeDv(){ document.getElementById('dv-mo').style.display='none'; }

function dvSwitch(t){
  _dvTab=t;
  ['all','deck','disc'].forEach(x=>document.getElementById('dvt-'+x).className='dv-tab'+(x===t?' active':''));
  renderDv(t);
}

function renderDv(tab){
  const all=allCards();
  document.getElementById('dvn-all').textContent=all.length;
  document.getElementById('dvn-deck').textContent=G.deck.length;
  document.getElementById('dvn-disc').textContent=G.disc.length;
  const grid=document.getElementById('dv-grid'); grid.innerHTML='';
  const cards=tab==='all'?all:tab==='deck'?[...G.deck].reverse():G.disc;
  if(!cards.length){grid.innerHTML='<div class="dv-empty">카드 없음</div>';return;}
  if(tab==='all'){
    const cnt={}; cards.forEach(c=>cnt[c.id]=(cnt[c.id]||0)+1);
    const seen=new Set();
    const uniq=cards.filter(c=>{if(seen.has(c.id))return false;seen.add(c.id);return true;});
    uniq.sort((a,b)=>['resource','tool','combat','status'].indexOf(a.tag)-['resource','tool','combat','status'].indexOf(b.tag));
    let lastTag=null;
    uniq.forEach(c=>{
      if(c.tag!==lastTag){
        lastTag=c.tag;
        const h=document.createElement('div');
        h.style.cssText='grid-column:1/-1;font-size:8px;color:var(--text3);font-family:var(--font-m);text-transform:uppercase;padding:4px 2px 2px;border-bottom:1px solid var(--border);margin-bottom:2px;';
        h.textContent={resource:'🌿자원',tool:'🔧도구',combat:'⚔️전투',status:'⚠️상태이상'}[c.tag]||c.tag;
        grid.appendChild(h);
      }
      grid.appendChild(makeDvCard(c, cnt[c.id]));
    });
  } else {
    cards.forEach(c=>grid.appendChild(makeDvCard(c, null)));
  }
}

function makeDvCard(c, cnt){
  const d=document.createElement('div'); d.className='dv-card';
  d.innerHTML=`<div class="dc-icon">${c.icon}${cnt>1?`<sup style="font-size:7px;color:var(--accent);">×${cnt}</sup>`:''}</div>
    <div class="dc-name">${c.name}</div>
    <div class="card-tag tag-${c.tag}" style="font-size:6px;">${c.tag}</div>
    <div class="dc-atk">A${c.atk} D${c.def}${c.dur?`<br><span style="color:var(--accent);">🔋${c.curDur||c.dur}/${c.dur}</span>`:''}</div>`;
  d.addEventListener('mouseenter',()=>showTT(c,d));
  d.addEventListener('mouseleave',hideTT);
  return d;
}
