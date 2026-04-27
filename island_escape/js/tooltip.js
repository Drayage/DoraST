// ═══════════════ TOOLTIP ═══════════════

let _ttLock=false;

function showTT(c, el){
  clearTimeout(_ttTm);
  const tt=document.getElementById('tt');

  // 태그별 컬러 스트립
  const strip=document.getElementById('tt-strip');
  if(strip) strip.className='tt-strip '+(c.tag||'');

  document.getElementById('tt-icon').textContent=c.icon;
  document.getElementById('tt-name').textContent=c.name;
  document.getElementById('tt-tag').innerHTML=`<span class="card-tag tag-${c.tag}" style="font-size:7px;">${c.tag}</span>`;
  const av=document.getElementById('tt-atk'), dv=document.getElementById('tt-def');
  av.textContent=c.atk; av.className='tt-sv'+(c.atk>0?' pos':c.atk<0?' neg':' zero');
  dv.textContent=c.def; dv.className='tt-sv'+(c.def>0?' pos':c.def<0?' neg':' zero');
  document.getElementById('tt-desc').textContent=c.desc||c.name;

  const con=document.getElementById('tt-con');
  if(c.dur){
    con.style.display='';
    con.textContent=`🔋 내구도 ${c.curDur||c.dur}/${c.dur} — 0이 되면 영구 제거`;
  } else { con.style.display='none'; }

  const useEl=document.getElementById('tt-use');
  if(c.use){
    useEl.style.display='';
    const kB=hasTool('knife')?8:0;
    const eatTxt=kB?`🍗 허기+30 (칼 패시브+8)`:`🍗 허기+22`;
    const m={eat:eatTxt,drink:'💧 갈증+28',heal:'🌿 HP+10'};
    useEl.textContent=m[c.use]||'';
  } else useEl.style.display='none';

  const pEl=document.getElementById('tt-pass');
  if(c.passiveDesc){pEl.style.display='';pEl.textContent='⭐ '+c.passiveDesc;}
  else pEl.style.display='none';

  const cEl=document.getElementById('tt-cbt');
  if(c.cbtFx){
    cEl.style.display='';
    const m2={pierce:'★ 관통: 적방어무시+4',block:'★ 완전방어: +5',stun:'★ 기절: 적피해0+ATK3',poison:'★ 독: 매라운드+3',armor:'★ 갑옷: 피해-2',cloak:'★ 망토: 도망HP-2'};
    cEl.textContent=m2[c.cbtFx]||'';
  } else cEl.style.display='none';

  const gEl=document.getElementById('tt-ga');
  if(c.gatherTool){gEl.style.display='';gEl.textContent='🎒 '+(c.gatherDesc||c.desc);}
  else gEl.style.display='none';

  tt.style.display='block';
  const r=el.getBoundingClientRect();
  const ttW=210, ttH=300;
  const mob=window.innerWidth<=700;
  let left, top;
  if(!mob && r.right+8+ttW<=window.innerWidth){
    left=r.right+8; top=r.top;
    if(top+ttH>window.innerHeight) top=window.innerHeight-ttH-4;
    top=Math.max(4,top);
  } else if(!mob && r.left-ttW-8>=0){
    left=r.left-ttW-8; top=r.top;
    if(top+ttH>window.innerHeight) top=window.innerHeight-ttH-4;
    top=Math.max(4,top);
  } else {
    left=Math.max(4,Math.min(r.left+r.width/2-ttW/2,window.innerWidth-ttW-4));
    if(r.bottom+8+ttH<=window.innerHeight){ top=r.bottom+8; }
    else { top=Math.max(4,r.top-ttH-8); }
  }
  tt.style.left=left+'px'; tt.style.top=top+'px';
}

function hideTT(){
  _ttTm=setTimeout(()=>document.getElementById('tt').style.display='none', 80);
}

// ── 타일 툴팁 ──
function showTileTT(mx, my, t, i){
  if(window.innerWidth<=700) return;
  const tt=document.getElementById('tile-tt');
  if(!tt) return;
  if(!t.revealed && !t.wasSeen){ tt.style.display='none'; return; }

  let icon='', name='', rows=[];
  if(t.wasSeen && !t.revealed){
    icon='🌫️'; name=t.name;
    rows.push({cls:'fog', html:'안개에 가려진 지역'});
  } else {
    icon=i===G.pos?'🧍':(t.hasCamp?'🏕️':t.icon);
    name=t.name;
    if(i===G.pos){
      rows.push({cls:'cur', html:'📍 현재 위치'});
    } else {
      const ap=tileDist(G.pos,i);
      rows.push({cls:'ap', html:`🚶 이동 <b>AP ${ap}</b>`});
    }
    if(t.hasCamp) rows.push({cls:'camp', html:'🏕️ 캠프 설치됨'});
    if(t.explored) rows.push({cls:'done', html:'✓ 탐색 완료'});
    else if(t.revealed) rows.push({cls:'todo', html:'🔍 미탐색 (AP2 필요)'});
  }

  document.getElementById('ttt-icon').textContent=icon;
  document.getElementById('ttt-name').textContent=name;
  const rowsEl=document.getElementById('ttt-rows');
  rowsEl.innerHTML=rows.map(r=>`<div class="ttt-row ${r.cls}">${r.html}</div>`).join('');

  tt.style.display='block';
  const ttW=160, ttH=40+rows.length*20;
  let left=mx+16, top=my-8;
  if(left+ttW>window.innerWidth-4) left=mx-ttW-10;
  if(top+ttH>window.innerHeight-4) top=window.innerHeight-ttH-4;
  top=Math.max(4,top);
  tt.style.left=left+'px'; tt.style.top=top+'px';
}

function hideTileTT(){
  const tt=document.getElementById('tile-tt');
  if(tt) tt.style.display='none';
}

document.addEventListener('click', e=>{
  const tt=document.getElementById('tt');
  if(tt&&tt.style.display==='block'&&!tt.contains(e.target)) tt.style.display='none';
});

// ── 액션 버튼 툴팁 ──
function initActionTT(){
  ['btn-exp','btn-ga','btn-camp','btn-craft','btn-use','btn-sleep','btn-cbt-flee'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.addEventListener('mouseenter', e=>{ if(window.innerWidth>700&&el._att) showActionTT(e.clientX,e.clientY,el._att); });
    el.addEventListener('mousemove',  e=>{ if(window.innerWidth>700&&el._att) _reposATT(e.clientX,e.clientY); });
    el.addEventListener('mouseleave', hideActionTT);
  });
}

function showActionTT(mx, my, data){
  const tt=document.getElementById('att');
  if(!tt) return;
  let html=`<div class="att-title">${data.title}</div>`;
  if(data.cost) html+=`<div class="att-cost">${data.cost}</div>`;
  if(data.rows&&data.rows.length){
    html+='<div class="att-rows">';
    data.rows.forEach(r=>{
      html+=`<div class="att-row ${r.cls||''}"><span class="att-ri">${r.icon||''}</span><span>${r.text}</span></div>`;
    });
    html+='</div>';
  }
  tt.querySelector('.att-inner').innerHTML=html;
  tt.style.display='block';
  _reposATT(mx, my);
}

function _reposATT(mx, my){
  const tt=document.getElementById('att');
  if(!tt||tt.style.display==='none') return;
  const ttW=210, ttH=tt.offsetHeight||140;
  let left=mx+16, top=my-ttH/2;
  if(left+ttW>window.innerWidth-6) left=mx-ttW-12;
  if(top+ttH>window.innerHeight-6) top=window.innerHeight-ttH-6;
  top=Math.max(6,top);
  tt.style.left=left+'px'; tt.style.top=top+'px';
}

function hideActionTT(){
  const tt=document.getElementById('att');
  if(tt) tt.style.display='none';
}

// ── 날씨 툴팁 ──
function _wxEffDesc(w){
  if(!w||!w.eff) return {icon:'✓',text:'효과 없음',cls:'info'};
  const [s,v]=w.eff.split('_'); const val=parseInt(v); const pos=val>0;
  if(s==='ap')  return {icon:'⚡',text:`AP ${v} (이동·행동 제한)`,cls:'warn'};
  if(s==='thi') return pos
    ? {icon:'💧',text:`갈증 +${val} (취침 시 적용)`,cls:'gain'}
    : {icon:'🌡️',text:`갈증 ${val} (취침 시 적용)`,cls:'loss'};
  if(s==='san') return pos
    ? {icon:'🧠',text:`정신력 +${val} (취침 시 적용)`,cls:'gain'}
    : {icon:'🧠',text:`정신력 ${val} (취침 시 적용)`,cls:'loss'};
  if(s==='hp')  return {icon:'💥',text:`HP ${val} (취침 시 적용)`,cls:'loss'};
  if(s==='fog') return {icon:'🌫️',text:'시야 제한 (일부 타일 재안개)',cls:'warn'};
  return {icon:'?',text:w.eff,cls:'info'};
}

function showWeatherTT(e, weather, label){
  const tt=document.getElementById('wx-tt');
  if(!tt||!weather||window.innerWidth<=700) return;
  const ef=_wxEffDesc(weather);
  tt.querySelector('.att-inner').innerHTML=
    `<div class="att-title">${weather.icon} ${weather.name}</div>
     <div class="att-cost">${label}</div>
     <div class="att-rows"><div class="att-row ${ef.cls}"><span class="att-ri">${ef.icon}</span><span>${ef.text}</span></div></div>`;
  tt.style.display='block';
  const r=e.currentTarget.getBoundingClientRect();
  let left=r.left, top=r.bottom+6;
  if(left+210>window.innerWidth-4) left=window.innerWidth-214;
  tt.style.left=left+'px'; tt.style.top=top+'px';
}

function hideWeatherTT(){
  const tt=document.getElementById('wx-tt');
  if(tt) tt.style.display='none';
}

function initWeatherTT(){
  const wxEl=document.getElementById('hv-wx');
  if(wxEl){
    wxEl.addEventListener('mouseenter',e=>showWeatherTT(e,G.weather,'오늘 날씨'));
    wxEl.addEventListener('mouseleave',hideWeatherTT);
  }
  // 내일 날씨: hv-tmrw의 부모 span
  const tmrEl=document.getElementById('hv-tmrw');
  if(tmrEl&&tmrEl.parentElement){
    tmrEl.parentElement.style.cursor='default';
    tmrEl.parentElement.addEventListener('mouseenter',e=>showWeatherTT(e,G.tomorrow,'내일 날씨'));
    tmrEl.parentElement.addEventListener('mouseleave',hideWeatherTT);
  }
}
