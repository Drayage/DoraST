// ═══════════════ GATHER ═══════════════

function openGather(){
  if(G.over) return;
  const tile=G.tiles[G.pos];
  if(!tile.explored){log('먼저 탐색을 완료해야 수집할 수 있다.','danger');render();return;}
  if(G.ap<3){log('AP부족 (수집:AP3)','danger');render();return;}
  const opts=tile.gather||[];
  const allCards=[...G.deck,...G.disc];
  const avail=opts.filter(o=>allCards.some(c=>c.id===o.tool));
  if(!avail.length){
    const needed=opts.map(o=>CARDS.find(c=>c.id===o.tool)?.name||o.tool).join(', ');
    log(`수집 장비 없음. 필요: ${needed}`,'danger'); render(); return;
  }
  document.getElementById('ga-title').textContent=`🎒 ${tile.name} 수집활동`;
  document.getElementById('ga-flavor').textContent=tile.flavor||`${tile.name}에서 자원을 수집한다.`;
  const opEl=document.getElementById('ga-opts'); opEl.innerHTML='';
  avail.forEach(o=>{
    const key=`${G.pos}_${o.tool}`;
    const cnt=G.gatherCnt[key]||0;
    const rate=Math.max(20,90-cnt*15);
    const resDef=CARDS.find(c=>c.id===o.res);
    const toolDef=CARDS.find(c=>c.id===o.tool);
    const div=document.createElement('div'); div.className='ex-choice fi';
    div.innerHTML=`
      <div class="ex-ci">${toolDef?.icon||'?'}</div>
      <div style="flex:1;">
        <div class="ex-cn">${o.label} <span class="card-tag tag-tool" style="font-size:7px;">${toolDef?.name||o.tool}</span></div>
        <div class="ex-cd">${o.flavor}</div>
        <div style="font-size:8px;margin-top:3px;">
          획득: ${resDef?.icon||''}${resDef?.name||o.res} ×1~2
          <span style="margin-left:7px;color:${rate>60?'var(--green)':rate>35?'var(--accent)':'var(--red)'};">성공률 ${rate}%</span>
          <span style="color:var(--text3);margin-left:7px;">(이곳 ${cnt}회 수집)</span>
        </div>
      </div>`;
    div.onclick=()=>doGather(o,key,rate);
    opEl.appendChild(div);
  });
  document.getElementById('ga-note').textContent='반복할수록 성공률 감소 (최소 20%)';
  document.getElementById('ga-mo').style.display='flex';
}

function doGather(opt, key, rate){
  document.getElementById('ga-mo').style.display='none';
  G.ap-=3; G.gatherCnt[key]=(G.gatherCnt[key]||0)+1;
  G.hun-=5; G.thi-=6;
  if(Math.random()*100<rate){
    const n=Math.random()<0.28?2:1;
    addCard(opt.res, n);
    const d=CARDS.find(c=>c.id===opt.res);
    log(`🎒 ${opt.label} 성공! ${d?.icon||''}${d?.name||opt.res}×${n} 획득 (AP-3)`,'gather');
  } else {
    log(`🎒 ${opt.label} 실패... 빈손 (AP-3)`,'danger');
  }
  checkSurvival(); render();
}
