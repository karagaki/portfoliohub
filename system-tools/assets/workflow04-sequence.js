(function(){
  'use strict';
  const PAGE_ID='portfolio-current';
  const VERSION = 'v1.0749';
  const labels={unmatched:'未照合',new:'新規',update:'更新候補',same:'同等',issue:'矛盾・保留'};
  const countMap=[['workflowUnmatchedCount','unmatched'],['workflowNewCount','new'],['workflowUpdateCount','update'],['workflowSameCount','same'],['workflowIssueCount','issue']];
  let currentFilter='unmatched';
  let timers=[];
  let rafs=[];
  let token=0;
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
  function renderCompare(filter=currentFilter){const p=pageEl();if(!p)return;currentFilter=filter||'unmatched';const g=groups();setFinals(g);$$('[data-workflow-brief="compare"] .workflow-brief-card').forEach(btn=>btn.classList.toggle('is-active',btn.getAttribute('data-compare-filter')===currentFilter));const items=g[currentFilter]||[];const list=$('#workflowCompareItems',p);if(list){list.innerHTML=items.length?items.map((item,i)=>`<div class="workflow-side-row jv267-compare-row jv267-target" data-relation="${esc(currentFilter)}"><b>${i+1}.</b><span><b class="jv267-cat">${esc(itemCat(item))}</b><br><span class="jv267-body">${esc(itemText(item))}</span></span></div>`).join(''):`<div class="workflow-side-row jv267-compare-row jv267-target is-empty" data-relation="${esc(currentFilter)}"><b>-</b><span><b>${esc(labels[currentFilter]||'候補')}はありません</b><br><span>このボタンは表示対象だけを絞り込みます。</span></span></div>`;}
    const cur=$('#workflowCompareCurrent',p);if(cur){const c=items[0]||sourceItems()[0]||{};cur.innerHTML=`<div class="compare-selected-card jv267-target"><h4>選択中の候補 / ${esc(labels[currentFilter]||'未照合')}</h4><b>${esc(itemCat(c))}</b><p>${esc(itemText(c))}</p><div class="workflow-chip-row"><span>${esc(labels[currentFilter]||'未照合')}</span><span>表示対象のみ絞り込み</span><span>06確定前</span></div></div>`;}
  }
  function ensureStepGuide(){try{if(typeof window.ensureWorkflowGuidePages==='function')window.ensureWorkflowGuidePages();}catch(e){}const p=pageEl();if(!p)return;const heading=p.querySelector('.heading');if(heading&&!p.querySelector('.workflow-step-guide')){const step=document.createElement('div');step.className='workflow-step-guide';step.innerHTML='<span class="workflow-step-number">STEP 4</span><span class="workflow-step-copy"><b>採用済み判断を現在地として確認します</b><small>利用できることと未接続を分けて示します。</small></span>';heading.insertAdjacentElement('afterend',step);}}
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
  function hideAll(){const p=pageEl();if(!p)return;p.classList.add('jv267-page','jv267-playing');p.classList.remove('guide-show-all','jv267-complete');targets().forEach(el=>{el.classList.remove('jv267-show');el.classList.add('jv267-target');});}
  function show(el){if(!el||!active())return;el.classList.add('jv267-target');el.classList.remove('jv267-show');void el.offsetWidth;requestAnimationFrame(()=>{if(active())el.classList.add('jv267-show');});}
  function showAll(){clearRun();ensureStepGuide();renderCompare(currentFilter);markTargets();targets().forEach(el=>el.classList.add('jv267-show'));countsFinal();const p=pageEl();if(p){p.classList.add('guide-show-all','jv267-complete','jv267-page');p.classList.remove('jv267-playing');}setVersion();syncControls();}
  function syncControls(){try{if(typeof window.syncFloatingGuideControls==='function')window.syncFloatingGuideControls(PAGE_ID);}catch(e){}const c=document.getElementById('floatingGuideControls');if(c){c.classList.add('is-visible','is-workflow-docked');c.style.opacity='1';c.style.transform='none';c.style.visibility='visible';c.style.animation='none';}}
  function animateCounts(localToken){countsZero();const start=performance.now();const dur=2300;function tick(now){if(localToken!==token||!active())return;if(pageEl()?.classList.contains('guide-show-all')){countsFinal();return;}const t=Math.max(0,Math.min(1,(now-start)/dur));const eased=1-Math.pow(1-t,3);countMap.forEach(([id])=>{const el=document.getElementById(id);if(!el)return;const final=Number(el.dataset.jv267Final||0);el.textContent=String(t>=1?final:Math.round(final*eased));});if(t<1)rafs.push(requestAnimationFrame(tick));else countsFinal();}rafs.push(requestAnimationFrame(tick));}
  function play(){const p=pageEl();if(!p||!active())return;clearRun();token++;const localToken=token;setVersion();ensureStepGuide();renderCompare(currentFilter);countsZero();hideAll();syncControls();void p.offsetWidth;let t=0.06;
    show($('.workflow-step-guide > .workflow-step-number',p));
    after(.24,()=>show($('.workflow-step-guide > .workflow-step-copy > b',p)));
    after(.46,()=>show($('.workflow-step-guide > .workflow-step-copy > small',p)));
    t=1.02;
    const cards=$$('.workflow-filter-brief[data-workflow-brief="compare"] .workflow-brief-card',p);cards.forEach((el,i)=>after(t+i*.08,()=>show(el)));
    after(t+.18,()=>animateCounts(localToken));
    t=3.65;
    after(t,()=>show($('.workflow-stage-layout.three > .card:nth-child(1) > h3',p)));t+=.20;
    after(t,()=>show($('.workflow-stage-layout.three > .card:nth-child(1) > .workflow-card-help',p)));t+=.26;
    $$('#workflowCompareItems .jv267-compare-row',p).slice(0,6).forEach((el,i)=>after(t+i*.15,()=>show(el)));t+=Math.min(6,$$('#workflowCompareItems .jv267-compare-row',p).length)*.15+.34;
    after(t,()=>show($('.workflow-stage-layout.three > .card:nth-child(2) > h3',p)));t+=.20;
    after(t,()=>show($('.workflow-stage-layout.three > .card:nth-child(2) > .workflow-card-help',p)));t+=.26;
    after(t,()=>show($('#workflowCompareCurrent .compare-selected-card',p)));t+=.58;
    after(t,()=>show($('.workflow-stage-layout.three > .workflow-side-card > h3',p)));t+=.20;
    after(t,()=>show($('.workflow-stage-layout.three > .workflow-side-card > p',p)));t+=.26;
    const rows=$$('.workflow-stage-layout.three > .workflow-side-card > .workflow-side-list .workflow-side-row',p);rows.forEach((el,i)=>after(t+i*.13,()=>show(el)));t+=rows.length*.13+.42;
    ['.guided-action-slot .guided-action-copy > label','.guided-action-slot .guided-action-copy > b','.guided-action-slot .guided-action-copy > p','.guided-action-slot .guided-action > .btn.primary','.guided-action-slot .guided-action > .workflow-secondary-link'].forEach((sel,i)=>after(t+i*.18,()=>show($(sel,p))));
    after(t+1.05,()=>{if(!active())return;p.classList.add('jv267-complete');p.classList.remove('jv267-playing');countsFinal();syncControls();});
  }
  function restart(){const p=pageEl();if(!p)return;ensureStepGuide();renderCompare(currentFilter);hideAll();setTimeout(play,40);}
  window.setWorkflowCompareFilter=function(key){currentFilter=key||'unmatched';renderCompare(currentFilter);if(active()){if(pageEl()?.classList.contains('guide-show-all')||pageEl()?.classList.contains('jv267-complete'))showAll();else restart();}return false;};
  window.renderWorkflowCompareSkeleton=function(){renderCompare(currentFilter)};
  window.renderCurrent=function(){renderCompare(currentFilter)};
  document.addEventListener('click',ev=>{const btn=ev.target.closest?.('#portfolio-current [data-compare-filter]');if(btn){ev.preventDefault();ev.stopImmediatePropagation();window.setWorkflowCompareFilter(btn.getAttribute('data-compare-filter')||'unmatched');}},true);
  document.addEventListener('click',ev=>{const btn=ev.target.closest?.('.guide-control-button');if(!btn||!active())return;if(btn.classList.contains('show-all'))setTimeout(showAll,0);if(btn.classList.contains('replay'))setTimeout(play,0);},true);
  const oldStart=window.startWorkflowPageGuide;
  if(typeof oldStart==='function'&&!oldStart.__kashinokiV267){window.startWorkflowPageGuide=function(id){const r=oldStart.apply(this,arguments);if(id===PAGE_ID)setTimeout(play,30);return r};window.startWorkflowPageGuide.__kashinokiV267=true;}
  const oldFinish=window.finishPageGuide;
  if(typeof oldFinish==='function'&&!oldFinish.__kashinokiV267){window.finishPageGuide=function(id){const r=oldFinish.apply(this,arguments);if(id===PAGE_ID)showAll();return r};window.finishPageGuide.__kashinokiV267=true;}
  const oldPage=window.page;
  if(typeof oldPage==='function'&&!oldPage.__kashinokiV267){window.page=function(id){const r=oldPage.apply(this,arguments);if(id===PAGE_ID)setTimeout(play,30);return r};window.page.__kashinokiV267=true;}
  document.addEventListener('DOMContentLoaded',()=>{setVersion();ensureStepGuide();renderCompare(currentFilter);if(active())play();});
  window.addEventListener('load',()=>{setVersion();if(active())play();});
})();
