/* System Tools workflow 04 separated owner. Scope: #portfolio-current. */
(function(){
  'use strict';
  const PAGE_ID='portfolio-current';
  const VERSION='v328 / 04入場時初期表示・styleリセット修正';
  const labels={unmatched:'未照合',new:'新規',update:'更新候補',same:'同等',issue:'矛盾・保留'};
  const countMap=[['workflowUnmatchedCount','unmatched'],['workflowNewCount','new'],['workflowUpdateCount','update'],['workflowSameCount','same'],['workflowIssueCount','issue']];
  let currentFilter='unmatched';
  let timers=[];
  let rafs=[];
  let token=0;
  let sequenceRunning=false;
  let sequenceCompleted=false;
  let sequencePhase='idle';
  let pendingPlayTimer=0;
  const $=(sel,root=document)=>root.querySelector(sel);
  const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const pageEl=()=>document.getElementById(PAGE_ID);
  const active=()=>!!pageEl()?.classList.contains('active');
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]||m));
  function setVersion(){const a=document.querySelector('.side-version');if(a)a.textContent=VERSION;const b=document.getElementById('versionText');if(b)b.textContent=VERSION;}
  function catLabel(v){try{if(typeof window.pLabel==='function')return window.pLabel(v)}catch(e){}return ({handoff:'引き継ぎ',spec:'仕様',countermeasure:'対策',design:'デザイン知',idea:'アイデア',context:'仕様',requirement:'仕様',decision:'判断',rule:'仕様',issue:'対策'}[v]||v||'未分類');}
  function sourceItems(){try{if(typeof window.pContracts==='function'){const a=window.pContracts();if(Array.isArray(a)&&a.length)return a;}}catch(e){}try{if(typeof window.captureCandidates==='function'){const b=window.captureCandidates();if(Array.isArray(b)&&b.length)return b;}}catch(e){}try{if(window.STATE&&Array.isArray(window.STATE.candidates)&&window.STATE.candidates.length)return window.STATE.candidates;}catch(e){}return [];}
  function relationOf(item){const raw=String(item&&(item.relation||item.compare_relation||item.current_relation||item.existing_relation||item.review_state||'')).toLowerCase();if(['new','confirmed_new','new_candidate'].includes(raw))return 'new';if(['update','updated','update_candidate'].includes(raw))return 'update';if(['same','equal','duplicate','approved_candidate'].includes(raw))return 'same';if(['issue','conflict','hold','pending','insufficient_evidence','needs_fix'].includes(raw))return 'issue';return 'unmatched';}
  function groups(){const g={unmatched:[],new:[],update:[],same:[],issue:[]};sourceItems().forEach(item=>g[relationOf(item)].push(item));return g;}
  function itemText(item){return String(item.statement||item.suggested_statement||item.adopted_statement||item.summary||item.title||item.text||item.body||'内容未取得');}
  function itemCat(item){return catLabel(item.type||item.knowledge_type||item.suggested_category||item.adopted_category||item.category||'context');}
  function clearRun(){timers.forEach(clearTimeout);timers=[];rafs.forEach(cancelAnimationFrame);rafs=[];}
  function after(sec,fn){timers.push(setTimeout(fn,Math.round(sec*1000)));}
  function setFinals(g){countMap.forEach(([id,key])=>{const el=document.getElementById(id);if(el)el.dataset.jv267Final=String(g[key]?.length||0);});}
  function countsZero(){countMap.forEach(([id])=>{const el=document.getElementById(id);if(el){el.textContent='0';el.classList.add('is-current-counting');}});}
  function countsFinal(){countMap.forEach(([id])=>{const el=document.getElementById(id);if(el){el.textContent=String(Number(el.dataset.jv267Final||0));el.classList.remove('is-current-counting');}});}
  function renderCompare(filter=currentFilter){const p=pageEl();if(!p)return;currentFilter=filter||'unmatched';const g=groups();setFinals(g);$$('[data-workflow-brief="compare"] .workflow-brief-card').forEach(btn=>{const active=btn.getAttribute('data-compare-filter')===currentFilter;btn.classList.toggle('is-active',active);btn.classList.toggle('is-selected',active)});const items=g[currentFilter]||[];const list=$('#workflowCompareItems',p);if(list){list.innerHTML=items.length?items.map((item,i)=>`<div class="workflow-side-row jv267-compare-row jv267-target jarvis-reveal-item" data-relation="${esc(currentFilter)}"><b>${i+1}.</b><span><b class="jv267-cat">${esc(itemCat(item))}</b><span class="jv267-body">${esc(itemText(item))}</span></span></div>`).join(''):`<div class="workflow-side-row jv267-compare-row jv267-target jarvis-reveal-item is-empty" data-relation="${esc(currentFilter)}"><b>-</b><span><b>${esc(labels[currentFilter]||'候補')}はありません</b><span>このボタンは表示対象だけを絞り込みます。</span></span></div>`;}
    const cur=$('#workflowCompareCurrent',p);if(cur){const c=items[0]||sourceItems()[0]||{};cur.innerHTML=`<div class="compare-selected-card jv267-target jarvis-neumo-panel jarvis-reveal-shell"><h4>選択中の候補 / ${esc(labels[currentFilter]||'未照合')}</h4><b>${esc(itemCat(c))}</b><p>${esc(itemText(c))}</p><div class="workflow-chip-row"><span>${esc(labels[currentFilter]||'未照合')}</span><span>表示対象のみ絞り込み</span><span>06確定前</span></div></div>`;}
  }
  function ensureStepGuide(){try{if(typeof window.ensureWorkflowGuidePages==='function')window.ensureWorkflowGuidePages();}catch(e){}const p=pageEl();if(!p)return;const heading=p.querySelector('.heading');if(heading&&!p.querySelector('.workflow-step-guide')){const step=document.createElement('div');step.className='workflow-step-guide';step.innerHTML='<span class="workflow-step-number">分ける</span><span class="workflow-step-copy"><b>採用済み判断を現在地として確認します</b><small>利用できることと未接続を分けて示します。</small></span>';heading.insertAdjacentElement('afterend',step);}}
  function targets(){const p=pageEl();if(!p)return[];return [
    ...$$('.workflow-step-guide > .workflow-step-number',p),
    ...$$('.workflow-step-guide > .workflow-step-copy > b',p),
    ...$$('.workflow-step-guide > .workflow-step-copy > small',p),
    ...$$('.workflow-filter-brief[data-workflow-brief="compare"] .workflow-brief-card',p),
    ...$$('.workflow-stage-layout.three > .card:nth-child(1) > h3',p),
    ...$$('.workflow-stage-layout.three > .card:nth-child(1) > .workflow-card-help',p),
    ...$$('#workflowCompareItems .jv267-compare-row',p),
    ...$$('.workflow-stage-layout.three > .card:nth-child(2) > h3',p),
    ...$$('.workflow-stage-layout.three > .card:nth-child(2) > .workflow-card-help',p),
    ...$$('#workflowCompareCurrent .compare-selected-card',p),
    ...$$('.workflow-stage-layout.three > .workflow-side-card > h3',p),
    ...$$('.workflow-stage-layout.three > .workflow-side-card > p',p),
    ...$$('.workflow-stage-layout.three > .workflow-side-card > .workflow-side-list .workflow-side-row',p),
    ...$$('.guided-action-slot .guided-action-copy > label',p),
    ...$$('.guided-action-slot .guided-action-copy > b',p),
    ...$$('.guided-action-slot .guided-action-copy > p',p),
    ...$$('.guided-action-slot .guided-action > .btn.primary',p),
    ...$$('.guided-action-slot .guided-action > .workflow-secondary-link',p)
  ].filter(Boolean);}
  function markTargets(){targets().forEach(el=>el.classList.add('jv267-target'));}
  function clearInlineRevealStyles(root){
    if(!root)return;
    const selectors=[
      '.workflow-step-guide',
      '.workflow-filter-brief',
      '.workflow-stage-layout.three',
      '.guided-action-slot',
      '#workflowCompareItems',
      '#workflowCompareCurrent'
    ];
    const nodes=[...selectors.flatMap(sel=>Array.from(root.querySelectorAll(sel)))];
    nodes.forEach(el=>{
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
      el.style.removeProperty('visibility');
      el.style.removeProperty('display');
      el.style.removeProperty('animation');
    });
    targets().forEach(el=>{
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
      el.style.removeProperty('visibility');
      el.style.removeProperty('display');
      el.style.removeProperty('animation');
    });
  }
  function hideAll(){const p=pageEl();if(!p)return;p.classList.add('jv267-page','jv267-playing');p.classList.remove('guide-show-all','jv267-complete');targets().forEach(el=>{el.classList.remove('jv267-show');el.classList.add('jv267-target');});}
  function show(el){if(!el||!active())return;el.classList.add('jv267-target');el.classList.remove('jv267-show');void el.offsetWidth;requestAnimationFrame(()=>{if(active())el.classList.add('jv267-show');});}
  function showAll(){clearRun();sequenceRunning=false;sequenceCompleted=true;sequencePhase='complete';ensureStepGuide();renderCompare(currentFilter);markTargets();targets().forEach(el=>el.classList.add('jv267-show'));countsFinal();const p=pageEl();if(p){p.classList.add('guide-show-all','jv267-complete','jv267-page');p.classList.remove('jv267-playing');}setVersion();syncControls();}
  function syncControls(){try{if(typeof window.syncFloatingGuideControls==='function')window.syncFloatingGuideControls(PAGE_ID);}catch(e){}const c=document.getElementById('floatingGuideControls');if(c){c.classList.add('is-visible','is-workflow-docked');c.style.opacity='1';c.style.transform='none';c.style.visibility='visible';c.style.animation='none';}}
  function resetSequenceOnExit(){
    clearRun();
    token++;
    sequenceRunning=false;
    sequenceCompleted=false;
    sequencePhase='idle';
    if(pendingPlayTimer){clearTimeout(pendingPlayTimer);pendingPlayTimer=0;}
    const p=pageEl();
    if(p){
      p.classList.remove('jv267-playing','jv267-complete','guide-show-all');
      targets().forEach(el=>el.classList.remove('jv267-show'));
    }
  }
  function primeEntryState(){
    const p=pageEl();
    if(!p) return;
    p.classList.add('jv267-page','jv267-playing');
    p.classList.remove('jv267-complete','guide-show-all','workflow-animate','workflow-title-animate');
    clearInlineRevealStyles(p);
    targets().forEach(el=>{
      el.classList.remove('jv267-show','is-visible','active','shown','is-shown','reveal','revealed');
      el.classList.add('jv267-target');
    });
  }
  function animateCounts(localToken){countsZero();const start=performance.now();const dur=900;function tick(now){if(localToken!==token||!active())return;if(pageEl()?.classList.contains('guide-show-all')){countsFinal();return;}const t=Math.max(0,Math.min(1,(now-start)/dur));const eased=1-Math.pow(1-t,3);countMap.forEach(([id])=>{const el=document.getElementById(id);if(!el)return;const final=Number(el.dataset.jv267Final||0);el.textContent=String(t>=1?final:Math.round(final*eased));});if(t<1)rafs.push(requestAnimationFrame(tick));else countsFinal();}rafs.push(requestAnimationFrame(tick));}
  function phaseAtLeast(name){
    const order={idle:0,top:1,count:2,list:3,current:4,side:5,action:6,complete:7};
    return (order[sequencePhase]||0)>=(order[name]||0);
  }
  function revealForCurrentPhase(){
    const p=pageEl();
    if(!p||!active())return;
    markTargets();
    if(phaseAtLeast('top')){
      $$('.workflow-step-guide > .workflow-step-number,.workflow-step-guide > .workflow-step-copy > b,.workflow-step-guide > .workflow-step-copy > small',p).forEach(el=>el.classList.add('jv267-show'));
    }
    if(phaseAtLeast('count')){
      $$('.workflow-filter-brief[data-workflow-brief="compare"] .workflow-brief-card',p).forEach(el=>el.classList.add('jv267-show'));
    }
    if(phaseAtLeast('list')){
      $$('.workflow-stage-layout.three > .card:nth-child(1) > h3,.workflow-stage-layout.three > .card:nth-child(1) > .workflow-card-help,#workflowCompareItems .jv267-compare-row',p).forEach(el=>el.classList.add('jv267-show'));
    }
    if(phaseAtLeast('current')){
      $$('.workflow-stage-layout.three > .card:nth-child(2) > h3,.workflow-stage-layout.three > .card:nth-child(2) > .workflow-card-help,#workflowCompareCurrent .compare-selected-card',p).forEach(el=>el.classList.add('jv267-show'));
    }
    if(phaseAtLeast('side')){
      $$('.workflow-stage-layout.three > .workflow-side-card > h3,.workflow-stage-layout.three > .workflow-side-card > p,.workflow-stage-layout.three > .workflow-side-card > .workflow-side-list .workflow-side-row',p).forEach(el=>el.classList.add('jv267-show'));
    }
    if(phaseAtLeast('action')){
      $$('.guided-action-slot .guided-action-copy > label,.guided-action-slot .guided-action-copy > b,.guided-action-slot .guided-action-copy > p,.guided-action-slot .guided-action > .btn.primary,.guided-action-slot .guided-action > .workflow-secondary-link',p).forEach(el=>el.classList.add('jv267-show'));
    }
  }
  function schedulePlay(force=false){
    if(pendingPlayTimer)clearTimeout(pendingPlayTimer);
    pendingPlayTimer=setTimeout(()=>{pendingPlayTimer=0;play(force);},40);
  }
  function play(force=false){const p=pageEl();if(!p||!active())return;if(!force&&sequenceRunning&&!sequenceCompleted)return;clearRun();token++;sequenceRunning=true;sequenceCompleted=false;sequencePhase='top';const localToken=token;setVersion();ensureStepGuide();renderCompare(currentFilter);countsZero();hideAll();syncControls();void p.offsetWidth;
    // 04の表示テンポは05と同系統に統一する。
    // STEP → カウント → 3パネルを長く待たせず、前段の完了直後へ食い気味に接続する。
    show($('.workflow-step-guide > .workflow-step-number',p));
    after(.26,()=>show($('.workflow-step-guide > .workflow-step-copy > b',p)));
    after(.44,()=>show($('.workflow-step-guide > .workflow-step-copy > small',p)));
    const COUNT_CARD_START = .78;
    const COUNT_CARD_STAGGER = .30;
    const COUNT_NUMBER_START = 2.16;
    const CONTENT_START = 2.58;
    let t=COUNT_CARD_START;
    after(t-.04,()=>{sequencePhase='count';});
    const cards=$$('.workflow-filter-brief[data-workflow-brief="compare"] .workflow-brief-card',p);cards.forEach((el,i)=>after(COUNT_CARD_START+i*COUNT_CARD_STAGGER,()=>show(el)));
    after(COUNT_NUMBER_START,()=>animateCounts(localToken));
    t=CONTENT_START;
    after(t-.08,()=>{sequencePhase='list';});
    after(t,()=>show($('.workflow-stage-layout.three > .card:nth-child(1) > h3',p)));t+=.18;
    after(t,()=>show($('.workflow-stage-layout.three > .card:nth-child(1) > .workflow-card-help',p)));t+=.22;
    for(let i=0;i<6;i++){after(t+i*.12,()=>show($$('#workflowCompareItems .jv267-compare-row',p)[i]));}t+=6*.12+.24;
    after(t-.08,()=>{sequencePhase='current';});
    after(t,()=>show($('.workflow-stage-layout.three > .card:nth-child(2) > h3',p)));t+=.18;
    after(t,()=>show($('.workflow-stage-layout.three > .card:nth-child(2) > .workflow-card-help',p)));t+=.22;
    after(t,()=>show($('#workflowCompareCurrent .compare-selected-card',p)));t+=.42;
    after(t-.08,()=>{sequencePhase='side';});
    after(t,()=>show($('.workflow-stage-layout.three > .workflow-side-card > h3',p)));t+=.18;
    after(t,()=>show($('.workflow-stage-layout.three > .workflow-side-card > p',p)));t+=.22;
    for(let i=0;i<8;i++){after(t+i*.11,()=>show($$('.workflow-stage-layout.three > .workflow-side-card > .workflow-side-list .workflow-side-row',p)[i]));}t+=8*.11+.34;
    after(t-.08,()=>{sequencePhase='action';});
    ['.guided-action-slot .guided-action-copy > label','.guided-action-slot .guided-action-copy > b','.guided-action-slot .guided-action-copy > p','.guided-action-slot .guided-action > .btn.primary','.guided-action-slot .guided-action > .workflow-secondary-link'].forEach((sel,i)=>after(t+i*.16,()=>show($(sel,p))));
    after(t+.92,()=>{if(!active())return;sequencePhase='complete';sequenceRunning=false;sequenceCompleted=true;p.classList.add('jv267-complete');p.classList.remove('jv267-playing');countsFinal();syncControls();});
  }
  function restart(){const p=pageEl();if(!p)return;ensureStepGuide();renderCompare(currentFilter);hideAll();schedulePlay(true);}
  function preserveCountTexts(fn){const snapshot=countMap.map(([id])=>{const el=document.getElementById(id);return [id,el?el.textContent:null];});fn();snapshot.forEach(([id,text])=>{const el=document.getElementById(id);if(el&&text!==null)el.textContent=text;});}
  window.setWorkflowCompareFilter=function(key){currentFilter=key||'unmatched';const p=pageEl();preserveCountTexts(()=>renderCompare(currentFilter));if(active()){if(p?.classList.contains('guide-show-all')||sequenceCompleted||p?.classList.contains('jv267-complete')){showAll();}else{revealForCurrentPhase();syncControls();}}return false;};
  window.renderWorkflowCompareSkeleton=function(){renderCompare(currentFilter)};
  window.renderCurrent=function(){renderCompare(currentFilter)};
  document.addEventListener('click',ev=>{const btn=ev.target.closest?.('#portfolio-current [data-compare-filter]');if(btn){ev.preventDefault();ev.stopImmediatePropagation();window.setWorkflowCompareFilter(btn.getAttribute('data-compare-filter')||'unmatched');}},true);
  document.addEventListener('click',ev=>{const btn=ev.target.closest?.('.guide-control-button');if(!btn||!active())return;if(btn.classList.contains('show-all'))setTimeout(showAll,0);if(btn.classList.contains('replay'))setTimeout(()=>play(true),0);},true);
  const oldStart=window.startWorkflowPageGuide;
  if(typeof oldStart==='function'&&!oldStart.__jarvisV267){window.startWorkflowPageGuide=function(id){const r=oldStart.apply(this,arguments);if(id===PAGE_ID)schedulePlay(false);return r};window.startWorkflowPageGuide.__jarvisV267=true;}
  const oldFinish=window.finishPageGuide;
  if(typeof oldFinish==='function'&&!oldFinish.__jarvisV267){window.finishPageGuide=function(id){const r=oldFinish.apply(this,arguments);if(id===PAGE_ID)showAll();return r};window.finishPageGuide.__jarvisV267=true;}
  const oldPage=window.page;
  if(typeof oldPage==='function'&&!oldPage.__jarvisV267){window.page=function(id){
    const wasActive=active();
    if(id===PAGE_ID){
      primeEntryState();
    }
    const r=oldPage.apply(this,arguments);
    if(id===PAGE_ID){
      primeEntryState();
      resetSequenceOnExit();
      const p=pageEl();
      if(p){
        p.classList.add('jv267-page','jv267-playing');
        p.classList.remove('jv267-complete','guide-show-all');
      }
      schedulePlay(true);
    }else if(wasActive){
      resetSequenceOnExit();
    }
    return r;
  };window.page.__jarvisV267=true;}
  document.addEventListener('DOMContentLoaded',()=>{setVersion();ensureStepGuide();renderCompare(currentFilter);if(active())schedulePlay(false);});
  window.addEventListener('load',()=>{setVersion();if(active())schedulePlay(false);});
})();
