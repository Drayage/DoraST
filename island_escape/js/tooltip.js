// ═══════════════ TOOLTIP ═══════════════
// [버그수정] eat +22(not +20), heal +10(not +8), pierce +4(not +3), block +5(not +4)

let _ttLock=false;

function showTT(c, el){
  clearTimeout(_ttTm);
  const tt=document.getElementById('tt');
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
    const m={eat:`🍗 허기+${22+kB}`,drink:'💧 갈증+28',heal:'🌿 HP+10'};
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
  let left=r.right+8, top=r.top;
  if(left+178>window.innerWidth) left=r.left-178;
  if(top+280>window.innerHeight) top=window.innerHeight-284;
  tt.style.left=left+'px'; tt.style.top=Math.max(4,top)+'px';
}

function hideTT(){
  _ttTm=setTimeout(()=>document.getElementById('tt').style.display='none', 80);
}
