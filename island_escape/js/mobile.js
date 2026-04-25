// ═══════════════ MOBILE ═══════════════
// [버그수정] mobTab 함수 분리 (기존 addCardTouchTT에 잘못 혼입된 로직 분리)

function mobTab(t){
  _mobTab=t;
  ['map-col','ctr-col','rgt-col'].forEach(id=>{
    document.getElementById(id).classList.remove('mob-active');
  });
  const target=_tabMap[t]||'map-col';
  document.getElementById(target).classList.add('mob-active');
  ['map','deck','stat','help'].forEach(id=>{
    const el=document.getElementById('mtab-'+id);
    if(el) el.classList.toggle('active', id===t);
  });
  const badgeMap={deck:'badge-deck', stat:'badge-stat'};
  if(badgeMap[t]){
    const b=document.getElementById(badgeMap[t]);
    if(b){b.classList.remove('show');b.textContent='';}
  }
  if(t==='help'){
    setTimeout(()=>{
      const sw=document.getElementById('stats-wrap');
      const hs=document.getElementById('help-section');
      if(sw&&hs) sw.scrollTop=hs.offsetTop;
    }, 80);
  }
}

function addCardTouchTT(el, card){
  if(window.innerWidth>700) return;
  el.addEventListener('click', ()=>{
    const tt=document.getElementById('tt');
    if(tt.style.display==='block'){
      tt.style.display='none';
    } else {
      showTT(card, el);
    }
  });
}

function initMobile(){
  if(window.innerWidth<=700){
    document.getElementById('map-col').classList.add('mob-active');
    document.getElementById('ctr-col').classList.remove('mob-active');
    document.getElementById('rgt-col').classList.remove('mob-active');
  }
}

window.addEventListener('resize', ()=>{
  if(window.innerWidth>700){
    ['map-col','ctr-col','rgt-col'].forEach(id=>{
      document.getElementById(id).classList.remove('mob-active');
    });
  } else {
    mobTab(_mobTab);
  }
});
