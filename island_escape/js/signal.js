// ═══════════════ SIGNAL / OBLIVION ═══════════════

// ── 카드 플립 시퀀스 헬퍼 ──
// classifyFn(card) → 'highlight' | 'kit-highlight' | 'dimmed'
// delaysFn(i, matchedSoFar) → ms for this flip
function _runFlipSeq(cards, delaysFn, classifyFn, onDone){
  const container=document.getElementById('sf-cards');
  container.innerHTML='';
  let matched=0;
  cards.forEach((card,i)=>{
    const wrap=document.createElement('div'); wrap.className='sf-card';
    wrap.innerHTML=`<div class="sf-inner" id="sfi-${i}"><div class="sf-back">🎴</div><div class="sf-face" id="sff-${i}"><span>${card.icon}</span><div class="sf-cname">${card.name}</div></div></div>`;
    container.appendChild(wrap);
  });
  let ms=0;
  cards.forEach((card,i)=>{
    const d=delaysFn(i,matched);
    ms+=d;
    const cls=classifyFn(card);
    if(cls!=='dimmed') matched++;
    setTimeout(()=>{
      document.getElementById(`sfi-${i}`)?.classList.add('revealed');
      const f=document.getElementById(`sff-${i}`);
      if(f) f.classList.add(cls);
    },ms);
  });
  setTimeout(onDone,ms+350);
}

function _openSfModal(title,subtitle){
  document.getElementById('sf-title').textContent=title;
  document.getElementById('sf-subtitle').textContent=subtitle;
  document.getElementById('sf-result').textContent='';
  document.getElementById('sf-result').style.color='';
  document.getElementById('sf-ok').style.display='none';
  document.getElementById('signal-flip-mo').style.display='flex';
}

function _sfFinish(msg,color,label,onOk){
  const r=document.getElementById('sf-result');
  r.textContent=msg; r.style.color=color;
  const btn=document.getElementById('sf-ok');
  btn.textContent=label||'확인'; btn.style.display='';
  btn.onclick=()=>{ document.getElementById('signal-flip-mo').style.display='none'; if(onOk)onOk(); };
}

// ── 전망대: 신호탄 탐색 ──
function doFlareSearch(){
  if(G.over) return;
  if(G.ap<2){log('AP부족 (신호탄 탐색:AP2)','danger');return;}
  const kit=allCards().find(c=>c.id==='flare_kit');
  if(!kit){log('🧨 신호탄 키트가 없다. 캠프에서 제작해야 한다.','danger');return;}
  G.ap-=2;
  const drawn=drawToHand(5);
  G.disc.push(...drawn);
  const prevCnt=allCards().filter(c=>c.id==='signal').length;

  _openSfModal('🧨 신호탄 탐색',`덱 5장 — 🧨 키트가 나오면 구조신호 획득`);

  // 키트 발견 전: 점진적 증가 / 발견 후: 즉시 빠르게
  const base=360+prevCnt*90;
  _runFlipSeq(
    drawn,
    (i,found)=>found>=1?130:base+i*70,
    c=>c.id==='flare_kit'?'kit-highlight':'dimmed',
    ()=>{
      const hit=drawn.some(c=>c.id==='flare_kit');
      if(hit){
        addCard('signal',1);
        const newCnt=allCards().filter(c=>c.id==='signal').length;
        _showSignalMilestone(newCnt);
        _sfFinish('🎆 신호탄 성공! 구조신호 획득!','var(--green)','확인',()=>render());
      } else {
        _sfFinish('🧨 키트가 나오지 않았다 — 실패','var(--red)','확인',()=>render());
      }
    }
  );
}

// ── 구조신호 마일스톤 토스트 ──
function _showSignalMilestone(count){
  const map={
    1:['🎆 첫 구조신호 포착!','희망의 빛이 보인다.'],
    2:['🎆 구조신호 2개','신호가 강해지고 있다.'],
    3:['🎆 구조신호 3개!','절반을 넘었다.'],
    4:['🎆 구조신호 4개!','전망대로 가라 — 거의 다 됐다!'],
    5:['🎆 구조신호 5개!','전망대에서 발사하라!'],
  };
  const m=map[count]; if(!m) return;
  const el=document.createElement('div'); el.className='signal-milestone';
  el.innerHTML=`<div class="sm-pct">${m[0]}</div><div class="sm-msg">${m[1]}</div>`;
  document.body.appendChild(el);
  setTimeout(()=>{ if(el.parentNode) el.remove(); },3800);
}

// ── 전망대: 구조신호 발사 ──
function attemptSignalEscape(){
  if(G.over) return;
  if(G.ap<3){log('AP부족 (구조신호 발사:AP3)','danger');return;}
  const sigCnt=allCards().filter(c=>c.id==='signal').length;
  if(!sigCnt){log('🎆 구조신호가 없다. 신호탄 탐색으로 먼저 획득해야 한다.','danger');return;}
  G.ap-=3;

  const pool=[...G.deck,...G.disc];
  const shuffled=shuffle([...pool]);
  const drawn=shuffled.slice(0,Math.min(10,shuffled.length));

  _openSfModal('🆘 구조신호 발사','10장 중 🎆가 5장 이상이면 탈출 성공!');

  // 4장까지 점진 가속 → 4장 직후 최고 긴장 → 5장 확정 후 빠르게
  _runFlipSeq(
    drawn,
    (i,found)=>{
      if(found>=5) return 120;   // 승리 확정 — 남은 카드 빠르게
      if(found===4) return 950;  // 5번째를 향한 결정적 한 장 — 최대 슬로우
      if(found===3) return 560;
      if(found===2) return 390;
      if(found===1) return 300;
      return 240;
    },
    c=>c.id==='signal'?'highlight':'dimmed',
    ()=>{
      const count=drawn.filter(c=>c.id==='signal').length;
      const ok=count>=5;
      if(!ok){
        // 실패 패널티: 구조신호 1~2장 소멸 + 정신력 손실
        const lose=Math.min(1+Math.floor(Math.random()*2), sigCnt);
        let removed=0;
        for(const arr of [G.deck,G.disc]){
          let i=arr.length-1;
          while(i>=0&&removed<lose){ if(arr[i].id==='signal'){arr.splice(i,1);removed++;} i--; }
        }
        const sanDmg=10+Math.floor(Math.random()*6);
        G.san=Math.max(0,G.san-sanDmg);
        flashDamage();
        const failMsg=`🆘 ${count}/5장 — 실패. 구조신호 ${removed}장 소멸, 정신력-${sanDmg}`;
        log(failMsg,'danger');
        _sfFinish(failMsg,'var(--red)','확인',()=>{ checkSurvival(); render(); });
      } else {
        _sfFinish(`🎆 ${count}장 포착 — 구조선이 온다!`,'var(--green)','탈출!',
          ()=>{ G.signalEscape=true;G.escape=100;checkWin(); render(); });
      }
    }
  );
}

// ── 망각의 호수: 망각 행동 ──
function doOblivion(){
  if(G.over) return;
  if(G.day-(G.lastOblivion||-99)<3){
    log(`🌑 아직 망각의 힘이 차오르지 않았다. (쿨다운: ${3-(G.day-(G.lastOblivion||-99))}일 남음)`,'');
    return;
  }
  if(G.ap<2){log('AP부족 (망각:AP2)','danger');return;}
  const pool=[...G.deck,...G.disc];
  if(!pool.length){log('🌑 덱이 비어있다.','');return;}
  const drawn=drawToHand(Math.min(3,pool.length));
  _showOblivionModal(drawn);
}

function _showOblivionModal(drawn){
  const mo=document.getElementById('oblivion-mo');
  const listEl=document.getElementById('oblivion-cards');
  if(!mo||!listEl) return;
  listEl.innerHTML='';

  drawn.forEach((card,i)=>{
    const div=document.createElement('div');
    div.className='oblivion-card-pick';
    div.id=`ob-slot-${i}`;
    div.style.pointerEvents='none';
    div.innerHTML=`
      <div class="sf-inner" id="ob-inn-${i}">
        <div class="sf-back">🎴</div>
        <div class="sf-face">
          <span style="font-size:22px;">${card.icon}</span>
          <div class="sf-cname">${card.name}</div>
          <span class="card-tag tag-${card.tag}" style="font-size:6px;margin-top:2px;">${card.tag}</span>
        </div>
      </div>
      <div id="ob-hint-${i}" style="font-size:8px;color:var(--red);font-family:var(--font-m);margin-top:4px;display:none;">클릭 → 소멸</div>`;
    listEl.appendChild(div);
  });
  mo.style.display='flex';

  let ms=0;
  drawn.forEach((_,i)=>{ ms+=500; setTimeout(()=>document.getElementById(`ob-inn-${i}`)?.classList.add('revealed'),ms); });

  // 전부 뒤집힌 뒤 클릭 활성화
  setTimeout(()=>{
    drawn.forEach((card,i)=>{
      const slot=document.getElementById(`ob-slot-${i}`);
      const hint=document.getElementById(`ob-hint-${i}`);
      if(hint) hint.style.display='';
      if(slot){
        slot.style.pointerEvents='';
        slot.onclick=()=>{
          mo.style.display='none';
          _confirmOblivion(card,drawn.filter((_,j)=>j!==i));
        };
      }
    });
  },ms+300);
}

function _confirmOblivion(chosen,rest){
  G.disc.push(...rest);
  G.lastOblivion=G.day;
  G.ap-=2;
  log(`🌑 망각: ${chosen.icon}${chosen.name} 영구 소멸`,'danger');
  render();
}

// ── 망각의 늪: 탐색 시 무작위 카드 소멸 ──
function _swampDevour(){
  const pool=[...G.deck,...G.disc];
  if(!pool.length){ log('🕳️ 늪이 삼키려 했으나 덱이 비어있다.',''); return; }
  const victim=pool[Math.floor(Math.random()*pool.length)];
  const di=G.deck.findIndex(c=>c.uid===victim.uid);
  if(di>=0) G.deck.splice(di,1);
  else { const dsi=G.disc.findIndex(c=>c.uid===victim.uid); if(dsi>=0) G.disc.splice(dsi,1); }
  log(`🕳️ 망각의 늪: ${victim.icon}${victim.name} 삼켜졌다. (영구 소멸)`,'danger');
  flashDamage();
  _showSwampToast(victim);
}

function _showSwampToast(victim){
  const el=document.createElement('div'); el.className='swamp-toast';
  el.textContent=`🕳️ ${victim.icon} ${victim.name} 소멸`;
  document.body.appendChild(el);
  setTimeout(()=>{ if(el.parentNode) el.remove(); },2800);
}
