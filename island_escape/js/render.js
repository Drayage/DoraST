// ═══════════════ RENDER ═══════════════

function render(){
  const p=G;

  // 헤더
  const hpEl=document.getElementById('hv-hp');
  hpEl.textContent=p.hp; hpEl.className='val'+(p.hp<30?' low':'');
  ['san','hun','thi'].forEach(k=>document.getElementById('hv-'+k).textContent=p[k]);
  document.getElementById('hv-wx').textContent=`${p.weather.icon} ${p.weather.name}`;
  document.getElementById('hv-tmrw').textContent=`${p.tomorrow.icon} ${p.tomorrow.name}`;
  document.getElementById('hv-day').textContent=p.day;
  document.getElementById('hv-ap').textContent=p.ap;
  document.getElementById('doom-pct').textContent=Math.min(100,p.doom);
  document.getElementById('doom-fill').style.width=Math.min(100,p.doom)+'%';
  document.getElementById('hv-esc').textContent=p.escape;

  // 스탯 바
  ['hp','san','hun','thi'].forEach(k=>{
    document.getElementById('sv-'+k).textContent=p[k];
    document.getElementById('bar-'+k).style.width=p[k]+'%';
  });
  document.getElementById('sv-esc').textContent=p.escape+'%';
  document.getElementById('bar-esc').style.width=p.escape+'%';

  // 캠프 정보
  const ci=document.getElementById('camp-info');
  ci.textContent=p.camps.length?`캠프 ${p.camps.length}곳 (제작 가능)`:'캠프 없음 (취침이벤트↑)';
  ci.style.color=p.camps.length?'var(--green)':'var(--red)';

  // 패시브 목록
  const allCards=[...p.deck,...p.disc];
  const passives=[...new Set(allCards.filter(c=>c.passiveDesc).map(c=>c.passiveDesc))];
  document.getElementById('passive-info').textContent=passives.length?passives.join(' / '):'없음';

  // 맵
  const grid=document.getElementById('grid'); grid.innerHTML='';
  p.tiles.forEach((t,i)=>{
    const d=document.createElement('div');
    d.className='tile'
      +(t.revealed?` revealed ${t.cls}`:'fog')
      +(i===p.pos?' player':'')
      +(t.hasCamp?' camp-t':'')
      +(t.revealed&&t.explored?' explored':'');
    if(t.revealed) d.textContent=i===p.pos?'🧍':(t.hasCamp?'🏕️':t.icon);
    d.title=t.revealed?`${t.name}${t.explored?' ✓':''}`:' ';
    d.onclick=()=>clickTile(i);
    grid.appendChild(d);
  });

  // 덱 표시
  const dg=document.getElementById('deck-grid'); dg.innerHTML='';
  allCards.forEach(c=>{
    const div=document.createElement('div'); div.className='card';
    const durDisp=c.dur?`<br><span style="color:var(--accent);font-size:6px;">🔋${c.curDur||c.dur}/${c.dur}</span>`:'';
    div.innerHTML=`<div class="card-icon">${c.icon}</div>
      <div class="card-name">${c.name}</div>
      <div class="card-tag tag-${c.tag}">${c.tag}</div>
      <div class="card-stats">A${c.atk} D${c.def}${durDisp}</div>`;
    div.addEventListener('mouseenter',()=>showTT(c,div));
    div.addEventListener('mouseleave',hideTT);
    addCardTouchTT(div, c);
    dg.appendChild(div);
  });
  document.getElementById('dk-total').textContent=allCards.length;
  document.getElementById('dk-deck').textContent=p.deck.length;
  document.getElementById('dk-disc').textContent=p.disc.length;

  // 로그
  document.getElementById('log-main').innerHTML=
    p.logs.slice(0,25).map(l=>`<div class="le ${l.type||''}">${l.msg}</div>`).join('');

  // 버튼 활성화
  document.getElementById('btn-exp').disabled=p.ap<2||p.over;
  document.getElementById('btn-ga').disabled=p.ap<3||p.over||!p.tiles[p.pos].explored;
  document.getElementById('btn-camp').disabled=p.ap<8||p.over||p.tiles[p.pos].hasCamp;
  document.getElementById('btn-craft').disabled=p.over||!p.tiles[p.pos].hasCamp;
  document.getElementById('btn-use').disabled=p.ap<1||p.over;
  document.getElementById('btn-sleep').disabled=p.over;
}
