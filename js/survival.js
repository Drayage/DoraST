// ═══════════════ SURVIVAL ═══════════════

function checkSurvival(){
  G.hun=Math.max(0,G.hun); G.thi=Math.max(0,G.thi);
  if(G.hun===0){ G.hp=Math.max(0,G.hp-5); log('🍗 굶주림! HP-5','danger'); }
  if(G.thi===0){ G.hp=Math.max(0,G.hp-8); log('💧 탈수! HP-8','danger'); }
  if(G.hp<=0)    triggerGameOver('체력이 소진되었습니다.');
  if(G.san<=0)   triggerGameOver('정신력이 무너졌습니다.');
  if(G.doom>=100)triggerGameOver('섬의 종말이 도래했습니다.');
}

function checkWin(){
  if(G.escape>=100){
    G.over=true;
    document.getElementById('go-title').textContent='🎉 탈출 성공!';
    document.getElementById('go-title').className='go-title win';
    document.getElementById('go-sub').textContent=`${G.day}일 만에 탈출!`;
    document.getElementById('go-stats').innerHTML=`생존 일수: ${G.day}일<br>처치: ${G.kills}마리`;
    document.getElementById('go-scr').style.display='flex';
  }
}

function triggerGameOver(reason){
  if(G.over) return;
  G.over=true;
  document.getElementById('go-title').textContent='💀 게임 오버';
  document.getElementById('go-title').className='go-title dead';
  document.getElementById('go-sub').textContent=reason+` (${G.day}일차)`;
  document.getElementById('go-stats').innerHTML=`생존 일수: ${G.day}일<br>처치: ${G.kills}마리<br>탈출도: ${G.escape}%`;
  document.getElementById('go-scr').style.display='flex';
}
