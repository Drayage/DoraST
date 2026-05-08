// ═══════════════ GATHER ═══════════════

function openGather(){
  if(G.over) return;
  const tile=G.tiles[G.pos];
  if(!tile.explored){log('먼저 탐색을 완료해야 수집할 수 있다.','');render();return;}
  if(G.ap<3){log('AP부족 (수집:AP3)','');render();return;}
  const opts=tile.gather||[];
  const cards=allCards();
  const avail=opts.filter(o=>cards.some(c=>c.id===o.tool));
  // 성공률 표시에 스킬 보너스 반영 (count 기반)
  const _gaGaBCnt=allCards().filter(c=>c.id==='sk_ga_b').length;
  const skillGaBonus=10*_gaGaBCnt;
  if(!avail.length){
    const needed=opts.map(o=>CARD_MAP[o.tool]?.name||o.tool).join(', ');
    log(`수집 장비 없음. 필요: ${needed}`,''); render(); return;
  }
  document.getElementById('ga-title').textContent=`🎒 ${tile.name} 수집활동`;
  document.getElementById('ga-flavor').textContent=tile.flavor||`${tile.name}에서 자원을 수집한다.`;
  const opEl=document.getElementById('ga-opts'); opEl.innerHTML='';
  avail.forEach(o=>{
    const key=`${G.pos}_${o.tool}`;
    const cnt=G.gatherCnt[key]||0;
    const bonus=G.gatherBonus[key]||0;
    const baseRate=Math.max(20,90-cnt*15);
    const rate=Math.min(95,baseRate+bonus+skillGaBonus);
    const resDef=CARD_MAP[o.res];
    const toolDef=CARD_MAP[o.tool];
    const div=document.createElement('div'); div.className='ex-choice fi';
    const bonusTxt=bonus>0?` <span style="color:var(--green);">(연속실패 +${bonus}%)</span>`:'';
    div.innerHTML=`
      <div class="ex-ci">${toolDef?.icon||'?'}</div>
      <div style="flex:1;">
        <div class="ex-cn">${o.label} <span class="card-tag tag-tool" style="font-size:7px;">${toolDef?.name||o.tool}</span></div>
        <div class="ex-cd">${o.flavor}</div>
        <div style="font-size:8px;margin-top:3px;">
          획득: ${resDef?.icon||''}${resDef?.name||o.res} ×1~2
          <span style="margin-left:7px;color:${rate>60?'var(--green)':rate>35?'var(--accent)':'var(--red)'};">성공률 ${rate}%</span>${bonusTxt}
          <span style="color:var(--text3);margin-left:7px;">(이곳 ${cnt}회 성공)</span>
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
  const preHun=G.hun, preThi=G.thi;
  G.ap-=3;
  G.hun-=5; G.thi-=6;
  const hDef=Math.max(0,5-preHun), tDef=Math.max(0,6-preThi);
  const hDmg=hDef>0?10+hDef:0, tDmg=tDef>0?16+tDef:0;
  const actDmg=hDmg+tDmg;
  if(actDmg>0){
    G.hp=Math.max(0,G.hp-actDmg);
    flashDamage();
    log(`🎒 수집 피해: ${hDmg?`허기HP-${hDmg} `:''}${tDmg?`갈증HP-${tDmg}`:''}`,'danger');
  }
  const effectiveRate = rate;
  if(Math.random()*100 < effectiveRate){
    G.gatherCnt[key]=(G.gatherCnt[key]||0)+1;
    G.gatherBonus[key]=0;
    if(!G.actionCnt) G.actionCnt={move:0,explore:0,gather:0,camp:0,craft:0,carduse:0,sleep:0,combat:0};
    G.actionCnt.gather=(G.actionCnt.gather||0)+1;
    let n=Math.random()<0.28?2:1;
    // 알뜰한 손: 성공 시 count장 추가
    const _gaS1Cnt=allCards().filter(c=>c.id==='sk_ga_s1').length;
    n+=_gaS1Cnt;
    const d=CARD_MAP[opt.res];
    const items=[{id:opt.res,icon:d?.icon||'📦',name:d?.name||opt.res,n}];
    log(`🎒 ${opt.label} 성공! ${d?.icon||''}${d?.name||opt.res}×${n} (AP-3)`,'gather');
    showItemPopup(items,`🎒 ${opt.label} 성공!`,()=>{
      checkSurvival(); render(); saveGame();
    });
  } else {
    G.gatherBonus[key]=(G.gatherBonus[key]||0)+5;
    // 끈기: 실패 시 AP 환급 (count 기반)
    const _gaS2Cnt=allCards().filter(c=>c.id==='sk_ga_s2').length;
    if(_gaS2Cnt){ G.ap=Math.min(G.maxAP+4,G.ap+_gaS2Cnt); log(`⏰ 끈기: 수집 실패 AP+${_gaS2Cnt} 환급`,''); }
    log(`🎒 ${opt.label} 실패... 빈손 (AP-3)`,'danger');
    checkSurvival(); render(); saveGame();
  }
}
