(function(){
  'use strict';
  const VERSION='v1.0975';
  const PAGE_ID='portfolio-review';
  const shelves=[
    {key:'A',title:'AI理解前提',cats:['AI理解前提'],display:['AI理解前提'],page:'artifact-intent'},
    {key:'B',title:'引き継ぎ書',cats:['引き継ぎ'],display:['引き継ぎ'],page:'artifact-handoff'},
    {key:'C',title:'仕様正本',cats:['仕様'],display:['仕様'],page:'artifact-spec'},
    {key:'D',title:'再発防止',cats:['再発防止'],display:['再発防止'],page:'artifact-countermeasure'},
    {key:'E',title:'デザイン判断',cats:['デザイン'],display:['デザイン'],page:'artifact-design'},
    {key:'F',title:'発展タスク',cats:['発展タスク'],display:['発展タスク'],page:'artifact-ideas'}
  ];
  const order=['AI理解前提','引き継ぎ','仕様','再発防止','デザイン','発展タスク'];

  const qualityToShelfCategory={
    '意図理解':'AI理解前提',
    '引き継ぎ':'引き継ぎ',
    '仕様':'仕様',
    '注意・禁止':'再発防止',
    '禁止失敗':'再発防止',
    'デザイン':'デザイン',
    'タスク':'発展タスク',
    '課題':'発展タスク',
    '自動化':'発展タスク',
    'AI回答改善':'発展タスク'
  };
  function normalizeJ03QualityType(v){ return String(v||'').trim(); }
  function bridgeQuality02Chips(){
    const api = window.KashinoKiClassificationBridge02;
    if(!api || typeof api.getState !== 'function') return [];
    const state = api.getState() || {};
    const anns = Array.isArray(state.annotations) ? state.annotations : [];
    const lines = Array.isArray(state.lineMessages) ? state.lineMessages : [];
    if(!anns.length || !lines.length) return [];
    const lineMap = new Map();
    lines.forEach((msg)=>{
      const speaker = msg.role === 'assistant' ? 'ChatGPT' : msg.role === 'user' ? 'User' : (msg.role||'');
      (msg.lines||[]).forEach((line)=>{
        lineMap.set(`${Number(msg.messageIndex)}:${Number(line.line)}`, {
          text:String(line.text||'').trim(),
          speaker,
          role:msg.role||''
        });
      });
    });
    const thread = (state.conversation?.source?.title || '読み込み済み会話').trim();
    const out=[];
    anns.forEach((ann, i)=>{
      const qt = normalizeJ03QualityType(ann.qualityType || ann.displayCategory || ann.category);
      const category = qualityToShelfCategory[qt];
      if(!category) return;
      const start = Number(ann.startLine || 1);
      const end = Number(ann.endLine || start);
      const fragments=[];
      let speaker = ann.role === 'assistant' ? 'ChatGPT' : ann.role === 'user' ? 'User' : '';
      for(let line=start; line<=end; line++){
        const hit = lineMap.get(`${Number(ann.messageIndex)}:${line}`);
        if(hit && hit.text){ fragments.push(hit.text); if(!speaker) speaker=hit.speaker; }
      }
      const text = normalizeSourceText((fragments.join(' ') || ann.label || ann.reason || qt));
      if(!text) return;
      out.push({
        id: ann.id || `q02-ann-${i+1}`,
        category,
        qualityType:qt,
        speaker:speaker || '',
        date:'—',
        thread,
        text,
        order:i+1,
        sourceAnnotationId: ann.id || `q02-ann-${i+1}`,
        sourceStatus: ann.source === 'manual' ? 'manual' : 'linked'
      });
    });
    return out;
  }

  /* v810: 旧J03固定デモ候補は物理削除。
     03は転送済みの02 annotationだけを表示する。 */
  const demo=[];

  const STORAGE_KEY='kashinoki03_registered_artifacts_v1';
  function buildRegisteredPayload(){
    const g=grouped();
    const payload={savedAt:new Date().toISOString(), shelves:{}};
    shelves.forEach(s=>{
      payload.shelves[s.page]={
        key:s.key,
        label:s.title,
        categories:s.display,
        candidates:(g[s.key]||[]).map((chip,i)=>({
          id:chip.id || `${s.key}-${i+1}`,
          cat:chip.category || '',
          source:`${chip.speaker || ''} / ${chip.thread || ''}`.replace(/^\s*\/\s*/,'').replace(/\s*\/\s*$/,''),
          speaker:chip.speaker || '',
          thread:chip.thread || '',
          date:chip.date || '',
          text:chip.text || '',
          detail:chip.text || '',
          order:chip.order || i+1,
          sourceAnnotationId: chip.sourceAnnotationId || chip.id || '',
          sourceStatus: chip.sourceStatus || 'linked',
          editorStatus: chip.editorStatus || 'active'
        }))
      };
    });
    return payload;
  }
  function saveRegisteredArtifacts(){
    const payload=buildRegisteredPayload();
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); }catch(e){}
    window.__kashinoki03RegisteredArtifacts=payload;
    try{ window.dispatchEvent(new CustomEvent('kashinoki03:registered-artifacts', {detail:payload})); }catch(e){}
    if(typeof window.refreshKashinoKiArtifacts==='function'){
      try{ window.refreshKashinoKiArtifacts(); }catch(e){}
    }
  }

  let selected='A';
  let registered=false;
  let transferReady=false;
  let rendering=false;
  let scheduledRender=0;
  let lastRenderedSignature='';
  let topGuideIntroPlayed=false;
  let destIntroPlayed=false;
  let actionIntroPlayed=false;
  const esc=(v)=>String(v==null?'':v).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function isTransferButtonText(text){
    const value=String(text||'').replace(/\s+/g,'');
    return value.includes('分類チップを03へ登録') || value.includes('了承した範囲を03へ送る') || value.includes('03へ送る');
  }
  function isActualStep2TransferButton(btn){
    if(!btn || !isTransferButtonText(btn.textContent)) return false;
    if(btn.classList && btn.classList.contains('ck-step-guide-demo-jump')) return false;
    const step2 = document.getElementById('portfolio-quality');
    if(!step2 || !step2.contains(btn)) return false;
    const actionSlot = btn.closest?.('.guided-action-slot');
    if(!actionSlot) return false;
    const onclick = String(btn.getAttribute('onclick') || '');
    return btn.hasAttribute('data-kashinoki02-transfer-to-step3') || onclick.includes('portfolio-review');
  }
  function markTransferReady(){ transferReady=true; window.__kashinoki03TransferReady=true; }
  function resetTransferReady(){ transferReady=false; window.__kashinoki03TransferReady=false; registered=false; }
  function isTransferReady(){ return transferReady===true || window.__kashinoki03TransferReady===true; }
  function hasConversationLoaded(){
    const sources=[
      window.__KASHINOKI_ACTIVE_CONVERSATION_JSON,
      window.__KASHINOKI_CURRENT_CONVERSATION_JSON,
      window.__kashinokiCurrentConversationExport,
      window.__KASHINOKI_PENDING_CONVERSATION_JSON
    ];
    return sources.some(raw=>raw && Array.isArray(raw.messages) && raw.messages.length>0);
  }
  function pageEl(){return document.getElementById(PAGE_ID)}
  function isActive(){return !!pageEl()?.classList.contains('active')}
  function ensureTopGuide(animateIntro=false){
    const page=pageEl(); if(!page) return null;
    const heading=page.querySelector('.heading'); if(!heading) return null;
    let guide=page.querySelector(':scope > .workflow-step-guide');
    if(!guide){ guide=document.createElement('div'); guide.className='workflow-step-guide workflow03-step-intro'; heading.insertAdjacentElement('afterend',guide); }
    guide.classList.add('workflow03-step-intro');
    if(guide.getAttribute('data-j03-guide-ready')!=='true'){
      guide.innerHTML='<span class="workflow-step-number" data-j03-guide-item="1">活かすへ</span><span class="workflow-step-copy"><b data-j03-guide-item="2">送り先と件数を確認します</b><small data-j03-guide-item="3">02で分類したチップの送り先と件数を確認し、A〜Fへ登録します。</small></span><button type="button" class="btn primary step-empty-jump-btn ck-step1-demo-jump-cta ck-step-guide-demo-jump ck-step-guide-demo-jump-03 ck-cta-codepen-host" onclick="page(\'portfolio-collect\')">「デモモード読込」へ移動<span class="ck-codepen-bounce" aria-hidden="true"><span class="loading_04"></span></span></button>';
      guide.setAttribute('data-j03-guide-ready','true');
    }
    const pendingStep1 = (typeof window.hasKashinoki02PendingStep1Conversation === 'function') ? window.hasKashinoki02PendingStep1Conversation() : false;
    const loaded = hasConversationLoaded();
    const ready = isTransferReady();
    const pendingTransfer = loaded && !ready && !pendingStep1;
    const jumpBtn = guide.querySelector('.ck-step-guide-demo-jump');
    if(jumpBtn){
      if(pendingStep1){
        jumpBtn.setAttribute('onclick', "page('portfolio-collect')");
        jumpBtn.innerHTML='「中身を確かめる ➡」へ移動<span class="ck-codepen-bounce" aria-hidden="true"><span class="loading_04"></span></span>';
      }else if(pendingTransfer){
        jumpBtn.setAttribute('onclick', "page('portfolio-quality')");
        jumpBtn.innerHTML='「分類チップを03へ登録 ➡」へ移動<span class="ck-codepen-bounce" aria-hidden="true"><span class="loading_04"></span></span>';
      }else{
        jumpBtn.setAttribute('onclick', "page('portfolio-collect')");
        jumpBtn.innerHTML='「デモモード読込」へ移動<span class="ck-codepen-bounce" aria-hidden="true"><span class="loading_04"></span></span>';
      }
    }
    guide.classList.toggle('j03-unloaded', !loaded && !pendingStep1);
    guide.classList.toggle('j03-step1-pending', pendingStep1);
    guide.classList.toggle('j03-loaded', loaded);
    guide.classList.toggle('j03-transfer-pending', pendingTransfer);
    guide.classList.toggle('j03-transfer-ready', loaded && ready);
    page.classList.toggle('j03-unloaded', !loaded && !pendingStep1);
    page.classList.toggle('j03-step1-pending', pendingStep1);
    page.classList.toggle('j03-loaded', loaded);
    page.classList.toggle('j03-transfer-pending', pendingTransfer);
    page.classList.toggle('j03-transfer-ready', loaded && ready);
    page.dataset.kashinoki03Loaded = loaded ? 'true' : 'false';
    page.dataset.kashinoki03Step1Pending = pendingStep1 ? 'true' : 'false';
    page.dataset.kashinoki03TransferReady = ready ? 'true' : 'false';
    const items=[...guide.querySelectorAll('[data-j03-guide-item]')];
    if(animateIntro){
      guide.classList.remove('j03-guide-complete','j03-guide-run');
      items.forEach((item)=>{ item.style.opacity='0'; item.style.animation='none'; });
      void guide.offsetWidth;
      items.forEach((item)=>{ item.style.animation=''; });
      guide.classList.add('j03-guide-run');
      // opacity:0!important などの固定指定でCSS animationが潰れないよう、
      // run中はインラインopacityを解除し、CSS keyframesだけでフェードさせる。
      window.requestAnimationFrame(()=>{
        items.forEach((item)=>{ item.style.opacity=''; });
      });
      topGuideIntroPlayed=true;
      window.setTimeout(()=>{ guide.classList.add('j03-guide-complete'); }, 1550);
    }else if(topGuideIntroPlayed && !guide.classList.contains('j03-guide-run')){
      guide.classList.add('j03-guide-complete');
    }
    return guide;
  }
  function findMarkTextByChipId(root, chipId){
    if(!root || !chipId) return '';
    const mark = root.querySelector(`.kashinoki-v449-marked-range[data-quality02-chip-ids~="${CSS.escape(chipId)}"], .kashinoki-v449-marked-range[data-quality02-chip-ids*="${CSS.escape(chipId)}"]`);
    if(mark) return (mark.getAttribute('data-quality02-chip-text') || mark.textContent || '').trim();
    return '';
  }
  function articleSpeaker(article){
    const raw = (article?.querySelector('b, strong, .speaker, .chat-speaker')?.textContent || article?.textContent || '').trim();
    const head = raw.split(/\n/).map(v=>v.trim()).filter(Boolean)[0] || '';
    if(/ChatGPT/i.test(head)) return 'ChatGPT';
    if(/User|ユーザー/i.test(head)) return 'User';
    return article?.classList.contains('ai') ? 'ChatGPT' : 'User';
  }
  function parseQualityRanges(article){
    const raw = article?.getAttribute('data-quality02-ranges') || '[]';
    try{
      const parsed = JSON.parse(raw);
      if(Array.isArray(parsed)) return parsed;
    }catch(e){}
    return [];
  }
  function normalizeSourceText(text){
    return String(text || '').replace(/\s+/g,' ').trim();
  }
  function splitLongSourceText(text){
    const lines = String(text || '').split(/\n+/).map(v=>v.trim()).filter(Boolean);
    if(lines.length > 1) return lines.slice(0, 4);
    const parts = String(text || '').split(/(?<=[。．.!?！？])\s*/).map(v=>v.trim()).filter(Boolean);
    return parts.length > 1 ? parts.slice(0, 4) : [normalizeSourceText(text)];
  }
  function qualityTypeToShelfCategory(type){
    const normalized = normalizeJ03QualityType(type);
    if(!normalized || normalized === '会話全体') return '';
    return qualityToShelfCategory[normalized] || (order.includes(normalized) ? normalized : '');
  }
  function liveQuality02Chips(){
    const root = document.getElementById('portfolio-quality');
    const list = document.getElementById('captureQualityList');
    if(!root || !list) return [];
    const thread = (list.querySelector('.presentation-card-heading h3, h3')?.textContent || '登録済みチップ').trim();
    const chips=[];
    let seq=1;
    Array.from(list.querySelectorAll('article.chat-bubble')).forEach((article)=>{
      const ranges = parseQualityRanges(article);
      const articleText = normalizeSourceText(article.querySelector('p')?.textContent || article.textContent || '');
      const fallbackText = splitLongSourceText(articleText);
      const speaker = articleSpeaker(article);
      if(ranges.length){
        ranges.forEach((range, rangeIndex)=>{
          const qualityType = normalizeSourceText(range?.type || '');
          const category = qualityTypeToShelfCategory(qualityType);
          if(!category) return;
          const rawText = normalizeSourceText(range?.text || fallbackText[rangeIndex % fallbackText.length] || articleText || category);
          const fragments = splitLongSourceText(rawText);
          fragments.forEach((fragment)=>{
            const text = normalizeSourceText(fragment);
            if(!text) return;
            const itemOrder = seq++;
            chips.push({
              id: `q02-live-range-${itemOrder}`,
              category,
              qualityType,
              speaker,
              date: '—',
              thread,
              text,
              order: itemOrder
            });
          });
        });
      }
      /* v795: 手動登録チップは、旧下部 .kashinoki-v449-chip-row ではなく
         選択行右側の .ck02-left-line-tags 配下にも入る。
         03/A-F登録は見た目の置き場所ではなく data-quality02-chip-id/type を正本にして全チップを読む。 */
      Array.from(article.querySelectorAll('.kashinoki-v449-chip')).forEach((chip)=>{
        if(chip.classList.contains('kashinoki-v470-temp-chip')) return;
        const qualityType=(chip.getAttribute('data-quality02-chip-type') || chip.textContent || '').trim();
        const category = qualityTypeToShelfCategory(qualityType);
        if(!category) return;
        const id = chip.getAttribute('data-quality02-chip-id') || `q02-live-chip-${seq}`;
        const text = normalizeSourceText(chip.getAttribute('data-quality02-chip-text') || findMarkTextByChipId(list, id) || article.querySelector('p')?.textContent || article.textContent || '');
        chips.push({
          id: id || `q02-live-chip-${seq}`,
          category,
          qualityType,
          speaker,
          date: '—',
          thread,
          text: text || qualityType || category,
          order: seq++
        });
      });
    });
    return chips;
  }
  function mergeJ03ChipSources(primary, secondary){
    const merged=[];
    const seen=new Set();
    [primary||[], secondary||[]].forEach((source)=>{
      source.forEach((chip)=>{
        const key = chip.id || `${chip.category}|${chip.qualityType||''}|${chip.speaker||''}|${chip.text||''}`;
        if(seen.has(key)) return;
        seen.add(key);
        merged.push(chip);
      });
    });
    return merged;
  }
  function grouped(){
    const out={}; shelves.forEach(s=>out[s.key]=[]);
    /* v807: 03は、02下部の「分類チップを03へ登録」操作後だけ候補を表示する。
       起動直後や左ナビから直接03へ入った場合は、旧デモ/星空科学館の固定候補を一切流し込まない。 */
    const bridgeSource = isTransferReady() ? bridgeQuality02Chips() : [];
    const liveSource = [];
    const chips = mergeJ03ChipSources(bridgeSource, liveSource);
    const source = chips;
    source.forEach(chip=>{
      shelves.forEach(s=>{
        if(!s.cats.includes(chip.category)) return;
        if(out[s.key].some(x=>x.id===chip.id)) return;
        out[s.key].push(chip);
      });
    });
    Object.keys(out).forEach(k=>out[k].sort((a,b)=>(order.indexOf(a.category)-order.indexOf(b.category))||(a.order-b.order)));
    return out;
  }
  function shelfBreakdown(items, shelf){
    const counts={};
    (items||[]).forEach(item=>{ counts[item.category]=(counts[item.category]||0)+1; });
    return shelf.display.map(cat=>`${cat} ${counts[cat]||0}`).join(' / ');
  }
  function injectStyle(){
    if(document.getElementById('kashinoki03-fixed-panel-style')) return;
    const style=document.createElement('style');
    style.id='kashinoki03-fixed-panel-style';
    style.textContent=`
      #portfolio-review #portfolioAnalysisSummary,
      #portfolio-review .workflow-filter-row{display:none!important;}
      #portfolio-review .heading > div > p{display:none!important;}
      #portfolio-review > .workflow-step-guide{display:grid!important;grid-template-columns:auto minmax(260px,1fr)!important;gap:13px!important;align-items:center!important;padding:11px 14px!important;margin:0 0 12px!important;border-radius:13px!important;background:var(--kashinoki-workflow-accent-fill,var(--kashinoki-accent-07,rgba(150,46,255,.07)))!important;background-color:var(--kashinoki-workflow-accent-fill,var(--kashinoki-accent-07,rgba(150,46,255,.07)))!important;background-image:none!important;border:1px solid var(--kashinoki-workflow-accent-border,var(--kashinoki-accent-38,rgba(150,46,255,.38)))!important;box-shadow:inset 0 0 0 1px var(--kashinoki-workflow-accent-inset,var(--kashinoki-accent-06,rgba(150,46,255,.06))),-1px -1px 8px rgba(255,255,255,.32),1px 1px 8px var(--kashinoki-workflow-accent-shadow,var(--kashinoki-accent-06,rgba(150,46,255,.06)))!important;}
      #portfolio-review > .workflow-step-guide .workflow-step-number{min-width:62px!important;padding:8px 10px!important;border-radius:999px!important;font-size:10px!important;font-weight:700!important;letter-spacing:.08em!important;text-align:center!important;background:var(--nm-accent,var(--guide-yellow-strong,rgba(236,239,66,.92)))!important;color:var(--nm-accent-ink,var(--kashinoki-workflow-accent-ink,#29312c))!important;-webkit-text-fill-color:var(--nm-accent-ink,var(--kashinoki-workflow-accent-ink,#29312c))!important;}
      #portfolio-review > .workflow-step-guide .workflow-step-copy b{display:block!important;margin:0 0 3px!important;font-size:12px!important;line-height:1.35!important;color:var(--tx)!important;}
      #portfolio-review > .workflow-step-guide .workflow-step-copy small{display:block!important;font-size:10.5px!important;line-height:1.45!important;color:var(--mut)!important;}
      #portfolio-review > .workflow03-step-intro{opacity:1!important;visibility:visible!important;filter:none!important;transform:none!important;}
      #portfolio-review > .workflow03-step-intro [data-j03-guide-item]{opacity:0;filter:none!important;transform:none!important;transition:none!important;}
      #portfolio-review > .workflow03-step-intro.j03-guide-run [data-j03-guide-item="1"]{animation:j03GuideInnerFade .58s cubic-bezier(.22,.61,.36,1) .12s both!important;}
      #portfolio-review > .workflow03-step-intro.j03-guide-run [data-j03-guide-item="2"]{animation:j03GuideInnerFade .58s cubic-bezier(.22,.61,.36,1) .38s both!important;}
      #portfolio-review > .workflow03-step-intro.j03-guide-run [data-j03-guide-item="3"]{animation:j03GuideInnerFade .64s cubic-bezier(.22,.61,.36,1) .68s both!important;}
      #portfolio-review > .workflow03-step-intro.j03-guide-complete [data-j03-guide-item]{opacity:1!important;filter:none!important;transform:none!important;}
      @keyframes j03GuideInnerFade{from{opacity:0;}to{opacity:1;}}
      #portfolio-review #captureCandidateList{margin-top:20px!important;}
      #portfolio-review .kashinoki03-transfer-layout{display:grid!important;grid-template-columns:minmax(230px,31%) minmax(0,1fr)!important;gap:18px!important;align-items:start!important;width:100%!important;}
      #portfolio-review .kashinoki03-dest-panel,#portfolio-review .kashinoki03-list-panel{box-sizing:border-box!important;border-radius:14px!important;background:var(--neumo-raised,var(--panel-bg,#f5f3ef))!important;border:0!important;outline:0!important;box-shadow:calc(-.55 * var(--nm-offset,2px)) calc(-.55 * var(--nm-offset,2px)) calc(.95 * var(--nm-blur,11px)) var(--nm-light-color,rgba(255,255,255,.62)),calc(.55 * var(--nm-offset,2px)) calc(.55 * var(--nm-offset,2px)) calc(.95 * var(--nm-blur,11px)) var(--nm-shadow-color,rgba(30,40,35,.18))!important;padding:14px!important;}
      #portfolio-review .kashinoki03-panel-head-simple{margin-bottom:9px!important;}
      #portfolio-review .kashinoki03-panel-head-simple h3{margin:0 0 3px!important;font-size:15px!important;line-height:1.2!important;}
      #portfolio-review .kashinoki03-panel-head-simple p{margin:0!important;color:var(--mut,#6f736f)!important;line-height:1.35!important;font-size:10.5px!important;}
      #portfolio-review .kashinoki03-dest-list{display:flex!important;flex-direction:column!important;gap:6px!important;}
      #portfolio-review .kashinoki03-dest-button{width:100%!important;min-height:42px!important;padding:7px 10px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;border:0!important;outline:0!important;border-radius:12px!important;background:var(--neumo-raised,rgba(255,255,255,.72))!important;color:inherit!important;cursor:pointer!important;pointer-events:auto!important;box-shadow:calc(-.45 * var(--nm-offset,2px)) calc(-.45 * var(--nm-offset,2px)) calc(.82 * var(--nm-blur,11px)) var(--nm-light-color,rgba(255,255,255,.62)),calc(.45 * var(--nm-offset,2px)) calc(.45 * var(--nm-offset,2px)) calc(.82 * var(--nm-blur,11px)) var(--nm-shadow-color,rgba(30,40,35,.18))!important;text-align:left!important;}
      #portfolio-review .kashinoki03-dest-button.is-active{border:0!important;outline:0!important;box-shadow:inset calc(.55 * var(--nm-offset,2px)) calc(.55 * var(--nm-offset,2px)) calc(.82 * var(--nm-blur,11px)) var(--nm-shadow-color,rgba(30,40,35,.18)),inset calc(-.55 * var(--nm-offset,2px)) calc(-.55 * var(--nm-offset,2px)) calc(.82 * var(--nm-blur,11px)) var(--nm-light-color,rgba(255,255,255,.62))!important;background:var(--neumo-pressed,rgba(255,255,255,.45))!important;}
      #portfolio-review .kashinoki03-dest-button b{display:block!important;font-size:12.5px!important;line-height:1.16!important;}
      #portfolio-review .kashinoki03-dest-button small{display:block!important;margin-top:2px!important;color:var(--mut,#72766f)!important;font-size:9px!important;line-height:1.18!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
      #portfolio-review .kashinoki03-dest-button em{font-style:normal!important;font-weight:800!important;font-size:12.5px!important;white-space:nowrap!important;}
      #portfolio-review .kashinoki03-dest-panel.j03-dest-run [data-j03-dest-item]{opacity:0;}
      #portfolio-review .kashinoki03-dest-panel.j03-dest-run [data-j03-dest-item]{animation:j03DestInnerFade .58s cubic-bezier(.22,.61,.36,1) var(--j03-dest-delay,0s) both!important;}
      #portfolio-review .kashinoki03-dest-panel.j03-dest-complete [data-j03-dest-item]{opacity:1!important;}
      @keyframes j03DestInnerFade{from{opacity:0;}to{opacity:1;}}
      #portfolio-review .kashinoki03-list-panel.j03-right-run [data-j03-right-item]{opacity:0;}
      #portfolio-review .kashinoki03-list-panel.j03-right-run [data-j03-right-item]{animation:j03RightInnerFade .58s cubic-bezier(.22,.61,.36,1) var(--j03-right-delay,0s) both!important;}
      #portfolio-review .kashinoki03-list-panel.j03-right-complete [data-j03-right-item]{opacity:1!important;}
      @keyframes j03RightInnerFade{from{opacity:0;}to{opacity:1;}}
      #portfolio-review .kashinoki03-list-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:10px!important;margin-bottom:8px!important;}
      #portfolio-review .kashinoki03-list-head h3{margin:0 0 2px!important;font-size:15px!important;line-height:1.2!important;}
      #portfolio-review .kashinoki03-list-head p{margin:0!important;color:var(--mut,#6f736f)!important;font-size:10px!important;}
      #portfolio-review .kashinoki03-list-head strong{min-width:40px!important;padding:5px 9px!important;border-radius:999px!important;background:var(--neumo-pressed,rgba(255,255,255,.50))!important;box-shadow:inset 1px 1px 4px var(--nm-shadow-color,rgba(30,40,35,.12)),inset -1px -1px 4px var(--nm-light-color,rgba(255,255,255,.45))!important;text-align:center!important;font-size:12px!important;}
      #portfolio-review .kashinoki03-transfer-table-head{display:grid!important;grid-template-columns:minmax(120px,.24fr) minmax(190px,.30fr) minmax(0,1fr)!important;column-gap:14px!important;align-items:start!important;padding:0 2px 6px!important;font-size:9.5px!important;font-weight:700!important;color:var(--mut,#6f736f)!important;border:0!important;background:transparent!important;box-shadow:none!important;}
      #portfolio-review .kashinoki03-transfer-list{display:grid!important;grid-template-columns:minmax(120px,.24fr) minmax(190px,.30fr) minmax(0,1fr)!important;column-gap:14px!important;row-gap:7px!important;max-height:260px!important;overflow:auto!important;padding:0 2px 2px!important;background:transparent!important;border:0!important;box-shadow:none!important;}
      #portfolio-review .kashinoki03-transfer-row{display:contents!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;outline:0!important;filter:none!important;line-height:1.42!important;font-size:11px!important;cursor:default!important;}
      #portfolio-review .kashinoki03-transfer-row:hover{background:transparent!important;box-shadow:none!important;transform:none!important;}
      #portfolio-review .kashinoki03-transfer-row > span{display:block!important;min-width:0!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;outline:0!important;filter:none!important;overflow-wrap:anywhere!important;word-break:break-word!important;}
      #portfolio-review .kashinoki03-transfer-id{font-weight:750!important;font-size:10px!important;color:inherit!important;line-height:1.32!important;}
      #portfolio-review .kashinoki03-transfer-source{color:var(--mut,#6f736f)!important;font-size:10px!important;line-height:1.32!important;}
      #portfolio-review .kashinoki03-transfer-text{display:block!important;overflow:visible!important;word-break:break-word!important;white-space:normal!important;color:inherit!important;}
      #portfolio-review .kashinoki03-check-mini{margin-top:9px!important;padding:6px 8px!important;border-radius:10px!important;background:var(--neumo-pressed,rgba(255,255,255,.30))!important;box-shadow:inset calc(.25 * var(--nm-offset,2px)) calc(.25 * var(--nm-offset,2px)) calc(.48 * var(--nm-blur,11px)) var(--nm-shadow-color,rgba(30,40,35,.10)),inset calc(-.25 * var(--nm-offset,2px)) calc(-.25 * var(--nm-offset,2px)) calc(.48 * var(--nm-blur,11px)) var(--nm-light-color,rgba(255,255,255,.36))!important;color:var(--mut,#6f736f)!important;font-size:10px!important;}
      #portfolio-review .kashinoki03-register-done{margin-top:8px!important;padding:8px 10px!important;border-radius:12px!important;background:var(--kashinoki-accent-08,rgba(150,46,255,.08))!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;min-height:0!important;}
      #portfolio-review .kashinoki03-register-done b{display:block!important;margin:0!important;white-space:nowrap!important;font-size:14px!important;font-weight:700!important;}
      #portfolio-review .kashinoki03-register-done div{display:flex!important;flex-wrap:nowrap!important;justify-content:flex-end!important;align-items:center!important;gap:6px!important;margin-left:auto!important;}
      #portfolio-review .kashinoki03-register-done button{border:0!important;border-radius:999px!important;padding:5px 10px!important;background:rgba(255,255,255,.82)!important;cursor:pointer!important;white-space:nowrap!important;font-size:12px!important;font-weight:600!important;line-height:1.2!important;}
      #portfolio-review .kashinoki03-bottom-action{display:block!important;position:relative!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;transform:none!important;clear:both!important;z-index:5!important;margin:22px 0 42px!important;padding:0!important;width:100%!important;overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot{opacity:1!important;visibility:visible!important;transform:none!important;filter:none!important;animation:none!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:'copy primary' 'copy back'!important;align-items:start!important;justify-content:stretch!important;gap:6px 12px!important;position:relative!important;width:100%!important;min-height:78px!important;box-sizing:border-box!important;padding:18px 20px!important;border-radius:15px!important;background:var(--kashinoki-workflow-accent-fill,var(--kashinoki-guide-panel-bg))!important;background-color:var(--kashinoki-workflow-accent-fill,var(--kashinoki-guide-panel-bg))!important;background-image:none!important;border:1px solid var(--kashinoki-workflow-accent-border,var(--kashinoki-guide-panel-border))!important;box-shadow:inset 0 0 0 1px var(--kashinoki-workflow-accent-inset,var(--kashinoki-accent-06,rgba(150,46,255,.06))),-1px -1px 8px rgba(255,255,255,.32),1px 1px 8px var(--kashinoki-workflow-accent-shadow,var(--kashinoki-guide-panel-shadow))!important;opacity:1!important;visibility:visible!important;transform:none!important;filter:none!important;animation:none!important;}

      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel [data-j03-action-item]{filter:none!important;transform:none!important;transition:none!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel.j03-action-run [data-j03-action-item]{opacity:0;filter:none!important;transform:none!important;animation:j03ActionInnerFade .58s cubic-bezier(.22,.61,.36,1) var(--j03-action-delay,0s) both!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel.j03-action-complete [data-j03-action-item]{opacity:1!important;}
      @keyframes j03ActionInnerFade{from{opacity:0;}to{opacity:1;}}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action-copy{grid-area:copy!important;min-width:0!important;display:grid!important;gap:4px!important;align-self:start!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action-copy label{font-size:10px!important;font-weight:700!important;letter-spacing:.08em!important;margin:0!important;color:var(--kashinoki-guide-panel-muted,var(--mut))!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action-copy b{position:relative!important;display:inline-block!important;width:max-content!important;max-width:100%!important;justify-self:start!important;isolation:isolate!important;font-size:15px!important;line-height:1.25!important;margin:0!important;color:var(--kashinoki-guide-panel-text,var(--tx))!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action-copy b::after{content:""!important;position:absolute!important;z-index:-1!important;left:-3px!important;right:-6px!important;bottom:-.04em!important;height:.72em!important;border-radius:3px 9px 8px 3px!important;background:var(--kashinoki-accent-46,rgba(150,46,255,.46))!important;box-shadow:0 0 0 1px var(--kashinoki-accent-22,rgba(150,46,255,.22))!important;opacity:0;transform:scaleX(0) skewX(-1.2deg);transform-origin:left center!important;pointer-events:none!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel.j03-action-run .guided-action-copy b::after{animation:j03ActionHighlighter 1.20s cubic-bezier(.22,.61,.28,1) 4.02s forwards!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel.j03-action-complete .guided-action-copy b::after{opacity:.9!important;transform:scaleX(1) skewX(-1.2deg)!important;}
      @keyframes j03ActionHighlighter{0%{opacity:.10;transform:scaleX(0) skewX(-1.2deg);}100%{opacity:.90;transform:scaleX(1) skewX(-1.2deg);}}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action-copy p{font-size:11px!important;line-height:1.45!important;margin:0!important;color:var(--kashinoki-guide-panel-muted,var(--mut))!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel > .btn.primary{grid-area:primary!important;justify-self:end!important;align-self:start!important;width:auto!important;min-width:0!important;white-space:nowrap!important;}
      html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel > .workflow-secondary-link{grid-area:back!important;justify-self:end!important;align-self:start!important;margin:0!important;white-space:nowrap!important;text-align:right!important;}

      html body #portfolio-review.workflow-animate:not(.guide-show-all) > .kashinoki03-bottom-action.guided-action-slot,
      html body #portfolio-review.workflow-animate:not(.guide-show-all) > .kashinoki03-bottom-action.guided-action-slot .guided-action-copy,
      html body #portfolio-review.workflow-animate:not(.guide-show-all) > .kashinoki03-bottom-action.guided-action-slot .workflow-secondary-link,
      html body #portfolio-review.workflow-animate:not(.guide-show-all) > .kashinoki03-bottom-action.guided-action-slot .btn.primary{filter:none!important;transform:none!important;}

      @media (max-width:760px){html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel{grid-template-columns:1fr!important;grid-template-areas:'copy' 'primary' 'back'!important;}html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel > .btn.primary,html body #portfolio-review.workflow-guide-page > .kashinoki03-bottom-action.guided-action-slot .guided-action.kashinoki-action-panel > .workflow-secondary-link{justify-self:start!important;margin:0!important;text-align:left!important;}}

      #portfolio-review .kashinoki03-list-panel{min-height:0!important;}
      #portfolio-review .kashinoki03-dest-panel{min-height:0!important;}
      #portfolio-review .kashinoki03-empty{padding:8px 2px!important;border-bottom:0!important;color:var(--mut,#6f736f)!important;font-size:11px!important;}
      #portfolio-review .workflow-page-title,#portfolio-review .page-title{margin-bottom:10px!important;}
      @media (max-width:900px){#portfolio-review .kashinoki03-transfer-layout{grid-template-columns:1fr!important;}#portfolio-review .kashinoki03-transfer-table-head,#portfolio-review .kashinoki03-transfer-list{grid-template-columns:minmax(92px,.24fr) minmax(150px,.30fr) minmax(0,1fr)!important;}}
    `;
    document.head.appendChild(style);
  }
  function animateNumber(el, target, duration=760){
    if(!el) return;
    const finalValue=Math.max(0, Number(target)||0);
    const start=performance.now();
    el.textContent='0件';
    function step(now){
      const t=Math.min(1, (now-start)/duration);
      const eased=1-Math.pow(1-t,3);
      el.textContent=`${Math.round(finalValue*eased)}件`;
      if(t<1) requestAnimationFrame(step);
      else el.textContent=`${finalValue}件`;
    }
    requestAnimationFrame(step);
  }
  function startDestinationIntro(root){
    const panel=root?.querySelector?.('.kashinoki03-dest-panel');
    if(!panel) return;
    panel.classList.remove('j03-dest-complete','j03-dest-run');
    panel.querySelectorAll('[data-j03-dest-item]').forEach((item)=>{
      item.style.opacity='0';
      item.style.animation='none';
    });
    panel.querySelectorAll('[data-j03-count-target]').forEach((count)=>{ count.textContent='0件'; });
    void panel.offsetWidth;
    panel.querySelectorAll('[data-j03-dest-item]').forEach((item)=>{
      item.style.opacity='';
      item.style.animation='';
    });
    panel.classList.add('j03-dest-run');
    panel.querySelectorAll('[data-j03-count-target]').forEach((count)=>{
      const delay=Number(count.getAttribute('data-j03-count-delay')||0);
      const target=count.getAttribute('data-j03-count-target')||'0';
      window.setTimeout(()=>animateNumber(count,target,760), delay);
    });
    destIntroPlayed=true;
    window.setTimeout(()=>{ panel.classList.add('j03-dest-complete'); }, 3300);
  }
  function completeDestinationIntro(root){
    const panel=root?.querySelector?.('.kashinoki03-dest-panel');
    if(!panel) return;
    panel.classList.remove('j03-dest-run');
    panel.classList.add('j03-dest-complete');
    panel.querySelectorAll('[data-j03-count-target]').forEach((count)=>{
      count.textContent=`${Number(count.getAttribute('data-j03-count-target')||0)}件`;
    });
  }
  function startRightPanelIntro(root){
    const panel=root?.querySelector?.('.kashinoki03-list-panel');
    if(!panel) return;
    panel.classList.remove('j03-right-complete','j03-right-run');
    panel.querySelectorAll('[data-j03-right-item]').forEach((item)=>{
      item.style.opacity='0';
      item.style.animation='none';
    });
    const count=panel.querySelector('[data-j03-right-count]');
    if(count) count.textContent='0件';
    void panel.offsetWidth;
    panel.querySelectorAll('[data-j03-right-item]').forEach((item)=>{
      item.style.opacity='';
      item.style.animation='';
    });
    panel.classList.add('j03-right-run');
    if(count){
      const target=count.getAttribute('data-j03-right-count')||'0';
      window.setTimeout(()=>animateNumber(count,target,760), 2850);
    }
    window.setTimeout(()=>{ panel.classList.add('j03-right-complete'); }, 3900);
  }
  function completeRightPanelIntro(root){
    const panel=root?.querySelector?.('.kashinoki03-list-panel');
    if(!panel) return;
    panel.classList.remove('j03-right-run');
    panel.classList.add('j03-right-complete');
    const count=panel.querySelector('[data-j03-right-count]');
    if(count) count.textContent=`${Number(count.getAttribute('data-j03-right-count')||0)}件`;
  }
  function startBottomActionIntro(page){
    const action=page?.querySelector?.('.kashinoki03-bottom-action .guided-action.kashinoki-action-panel');
    if(!action) return;
    action.classList.remove('j03-action-complete','j03-action-run');
    action.querySelectorAll('[data-j03-action-item]').forEach((item)=>{
      item.style.opacity='0';
      item.style.animation='none';
    });
    void action.offsetWidth;
    action.querySelectorAll('[data-j03-action-item]').forEach((item)=>{
      item.style.opacity='';
      item.style.animation='';
    });
    action.classList.add('j03-action-run');
    actionIntroPlayed=true;
    window.setTimeout(()=>{ action.classList.add('j03-action-complete'); }, 5350);
  }
  function completeBottomActionIntro(page){
    const action=page?.querySelector?.('.kashinoki03-bottom-action .guided-action.kashinoki-action-panel');
    if(!action) return;
    action.classList.remove('j03-action-run');
    action.classList.add('j03-action-complete');
    action.querySelectorAll('[data-j03-action-item]').forEach((item)=>{
      item.style.opacity='';
      item.style.animation='';
    });
  }
  function render(force=false){
    const page=pageEl(); const root=document.getElementById('captureCandidateList');
    if(!page||!root) return;
    if(rendering) return;
    const g=grouped();
    const shelf=shelves.find(s=>s.key===selected)||shelves[0]; selected=shelf.key;
    const items=g[shelf.key]||[];
    const unloaded=!hasConversationLoaded();
    const ready=isTransferReady();
    const signature=[selected, registered?'1':'0', unloaded?'unloaded':'loaded', ready?'ready':'pending', shelves.map(s=>s.key+':' + ((g[s.key]||[]).length)).join('|')].join('::');
    injectStyle();
    const animateTopGuide=isActive()&&!topGuideIntroPlayed;
    const animateDestIntro=isActive()&&!destIntroPlayed;
    const animateActionIntro=isActive()&&!actionIntroPlayed;
    // 03の中身が同一で再描画を省略する場合でも、上部ガイドだけは入場時に必ず制御する。
    // ここを early return の前に置かないと、既存DOMがある状態で03へ入った時にフェードインが開始されない。
    ensureTopGuide(animateTopGuide);
    if(!force && root.querySelector('[data-j03-final="true"]') && root.querySelector('[data-j03-dest-seq-ready="true"]') && signature===lastRenderedSignature){
      if(animateDestIntro){
        startDestinationIntro(root);
        startRightPanelIntro(root);
      }
      if(animateActionIntro) startBottomActionIntro(page);
      return;
    }
    rendering=true;
    const buttons=shelves.map((s,index)=>{
      const active=s.key===selected;
      const count=(g[s.key]||[]).length;
      const delay=(0.64 + index*0.12).toFixed(2);
      const countDelay=Math.round(1260 + index*120);
      return `<button type="button" class="kashinoki03-dest-button ${active?'is-active':''}" data-kashinoki03-shelf="${esc(s.key)}" data-j03-dest-item style="--j03-dest-delay:${delay}s" aria-pressed="${active?'true':'false'}"><span class="kashinoki03-dest-main"><b>${esc(s.key)} ${esc(s.title)}</b><small>${esc(shelfBreakdown(g[s.key]||[], s))}</small></span><em data-j03-count-target="${count}" data-j03-count-delay="${countDelay}">${animateDestIntro?'0':count}件</em></button>`;
    }).join('');
    const rows=items.length?items.map(chip=>`<div class="kashinoki03-transfer-row"><span class="kashinoki03-transfer-id">${esc(chip.id)}</span><span class="kashinoki03-transfer-source">${esc(chip.thread)} / ${esc(chip.date)}</span><span class="kashinoki03-transfer-text">${esc(chip.text)}</span></div>`).join(''):`<div class="kashinoki03-empty">${ready?'この送り先へ登録する候補はありません。':'02下部の「分類チップを03へ登録」を押すと、ここに送り先候補を表示します。'}</div>`;
    /* v1.0967: STEP3の「デモモード読込」へ移動は上部ガイド右側だけに集約する。
       下部/候補パネル内の重複ボタンはDOM自体を生成しない。
       読込後の通常CTA「A〜Fへ登録する」は下部CTAパネルで維持する。 */
    const jumpArea='';
    const doneArea=(!unloaded && registered)?`<div class="kashinoki03-register-done"><b>A〜F登録完了</b><div>${shelves.map(s=>`<button type="button" data-kashinoki03-goal="${esc(s.page)}">${esc(s.key)}で確認</button>`).join('')}</div></div>`:'';
    root.innerHTML=`<div class="kashinoki03-transfer-layout" data-j03-final="true" data-j03-dest-seq-ready="true"><aside class="kashinoki03-dest-panel kashinoki-neumo-panel ${animateDestIntro?'j03-dest-run':'j03-dest-complete'}"><div class="kashinoki03-panel-head-simple"><h3 data-j03-dest-item style="--j03-dest-delay:.16s">送り先</h3><p data-j03-dest-item style="--j03-dest-delay:.40s">02で分類したチップを、A〜Fへ振り分けます。</p></div><div class="kashinoki03-dest-list">${buttons}</div><div class="kashinoki03-check-mini" data-j03-dest-item style="--j03-dest-delay:1.62s"><b>要確認</b><br><span>未分類 0 / 送り先なし 0 / 空欄 0</span></div></aside><section class="kashinoki03-list-panel kashinoki-neumo-panel ${animateDestIntro?'j03-right-run':'j03-right-complete'}"><div class="kashinoki03-list-head" data-j03-right-item style="--j03-right-delay:2.48s"><div><h3>${esc(shelf.key)} ${esc(shelf.title)}へ送る候補</h3><p>${esc(shelfBreakdown(items, shelf))} / 合計 ${items.length}件</p></div><strong data-j03-right-count="${items.length}">${animateDestIntro?'0':items.length}件</strong></div><div class="kashinoki03-transfer-table-head" data-j03-right-item style="--j03-right-delay:2.68s"><span>ID</span><span>スレッド名 / 登録日</span><span>内容</span></div><div class="kashinoki03-transfer-list" data-j03-right-item style="--j03-right-delay:2.88s">${rows}</div><div class="kashinoki03-check-mini kashinoki03-check-inline" data-j03-right-item style="--j03-right-delay:3.08s"><span>未分類 0 / 送り先なし 0 / 空欄 0</span></div>${jumpArea}${doneArea}</section></div>`;
    if(animateDestIntro){
      startDestinationIntro(root);
      startRightPanelIntro(root);
    }else{
      completeDestinationIntro(root);
      completeRightPanelIntro(root);
    }
    lastRenderedSignature=signature;
    let slot=page.querySelector('.kashinoki03-bottom-action');
    /* v1.0973: STEP3下部パネル自体は常に残す。
       STEP2下部の「分類チップを03へ登録」押下前は、A〜F登録ボタンだけを出さず、02へ戻す案内を表示する。 */
    if(!slot){
      slot=document.createElement('div');
      slot.className='guided-action-slot portfolio-action kashinoki-action-panel-slot kashinoki03-bottom-action';
      root.insertAdjacentElement('afterend', slot);
    }else{
      slot.className='guided-action-slot portfolio-action kashinoki-action-panel-slot kashinoki03-bottom-action';
    }
    slot.style.display='';
    let action=slot.querySelector('.guided-action');
    if(!action){
      action=document.createElement('div');
      action.className='guided-action kashinoki-action-panel';
      slot.appendChild(action);
    }
    if(action){
      action.className='guided-action kashinoki-action-panel';
      action.classList.add(animateActionIntro?'j03-action-run':'j03-action-complete');
      /* v1.0976: STEP3下部パネルは常に表示する。
         ただしSTEP2下部の「分類チップを03へ登録」未押下時は、
         03登録実行ボタンだけを生成しない。 */
      const registerButtonHtml = ready
        ? `<button class="btn primary workflow-primary-target" type="button" data-kashinoki03-register data-j03-action-item style="--j03-action-delay:4.22s">A〜Fへ登録する</button>`
        : '';
      action.innerHTML=`<div class="guided-action-copy"><label data-j03-action-item style="--j03-action-delay:3.48s">今行う主操作 <span class="guided-action-badge">活かすへ</span></label><b data-j03-action-item style="--j03-action-delay:3.72s">A〜Fへ登録する</b><p data-j03-action-item style="--j03-action-delay:3.96s">03では送り先と内容だけ確認します。修正が必要な場合は02へ戻ります。</p></div>${registerButtonHtml}<button class="workflow-secondary-link" type="button" data-kashinoki03-back data-j03-action-item style="--j03-action-delay:4.42s">02へ戻る</button>`;
      if(animateActionIntro) startBottomActionIntro(page); else completeBottomActionIntro(page);
    }
    page.querySelectorAll('#portfolioAnalysisSummary,.workflow-filter-row').forEach(n=>n.remove());
    // 上部ガイドは ensureTopGuide(animateTopGuide) のみで制御する。
    // page側の guide-show-all / jv03-complete は上部ガイド内フェードを即時完了扱いにするため付与しない。
    page.classList.remove('guide-show-all','jv03-complete','jv03-running','workflow-animate');
    page.classList.add('j03-fixed-panel-ready');
    try{ window.dispatchEvent(new CustomEvent('kashinoki03:rendered')); }catch(e){}
    rendering=false;
  }
  function schedule(force=false){
    if(scheduledRender) clearTimeout(scheduledRender);
    scheduledRender=setTimeout(()=>{
      scheduledRender=0;
      render(!!force);
    }, 40);
  }
  window.renderCaptureCandidates=render;
  window.restartKashinoKi03TopGuide=function(){
    topGuideIntroPlayed=false;
    destIntroPlayed=false;
    actionIntroPlayed=false;
    const page=pageEl();
    const guide=page?.querySelector(':scope > .workflow03-step-intro');
    if(guide){
      guide.classList.remove('j03-guide-run','j03-guide-complete');
      guide.querySelectorAll('[data-j03-guide-item]').forEach((item)=>{
        item.style.opacity='0';
        item.style.animation='none';
      });
      void guide.offsetWidth;
    }
    render(true);
    ensureTopGuide(true);
  };
  window.selectKashinoKi03Shelf=function(key){selected=key||'A';render(true);};
  window.sendKashinoKi03ToShelf=function(){
    if(!isTransferReady()){
      if(typeof window.toast==='function') window.toast('02で「分類チップを03へ登録 ➡」を押してから登録してください。');
      render(true);
      return;
    }
    saveRegisteredArtifacts(); registered=true; render(true); if(typeof window.toast==='function') window.toast('A〜Fへ登録しました。');
  };
  document.addEventListener('click',function(ev){
    const transferBtn=ev.target.closest?.('button,a');
    if(transferBtn && isActualStep2TransferButton(transferBtn)){ markTransferReady(); }
    const jumpBtn=ev.target.closest?.('.kashinoki03-step1-jump-area .ck-step1-demo-jump-cta');
    if(jumpBtn){ev.preventDefault();ev.stopPropagation(); if(typeof window.page==='function') window.page('portfolio-collect'); return;}
    const shelfBtn=ev.target.closest?.('[data-kashinoki03-shelf]');
    if(shelfBtn){ev.preventDefault();ev.stopPropagation();window.selectKashinoKi03Shelf(shelfBtn.getAttribute('data-kashinoki03-shelf'));return;}
    const reg=ev.target.closest?.('[data-kashinoki03-register]');
    if(reg){ev.preventDefault();ev.stopPropagation();window.sendKashinoKi03ToShelf();return;}
    const back=ev.target.closest?.('[data-kashinoki03-back]');
    if(back){ev.preventDefault();ev.stopPropagation(); if(typeof window.page==='function') window.page('portfolio-quality'); return;}
    const goal=ev.target.closest?.('[data-kashinoki03-goal]');
    if(goal){ev.preventDefault();ev.stopPropagation(); if(typeof window.page==='function') window.page(goal.getAttribute('data-kashinoki03-goal')); return;}
  },true);
  window.addEventListener('kashinoki-step1-json-committed', function(){ resetTransferReady(); schedule(true); });
  window.addEventListener('kashinoki-step1-json-pending', function(){ resetTransferReady(); schedule(true); });
  const previousPage=window.page;
  if(typeof previousPage==='function'&&!previousPage.__kashinoki03FinalPanelWrapped){
    const wrapped=function(){const result=previousPage.apply(this,arguments); if(String(arguments[0]||'')===PAGE_ID){ topGuideIntroPlayed=false; destIntroPlayed=false; actionIntroPlayed=false; schedule(false); } return result;};
    wrapped.__kashinoki03FinalPanelWrapped=true;
    window.page=wrapped;
  }
  const observer=new MutationObserver(()=>{const root=document.getElementById('captureCandidateList'); if(isActive()&&root&&!root.querySelector('[data-j03-final="true"]')) schedule(true);});
  function startObserver(){const page=pageEl(); if(page) observer.observe(page,{childList:true,subtree:true});}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{startObserver();schedule(false);}); else {startObserver();schedule(false);}
  window.addEventListener('load',()=>schedule(false));
  try{const vt=document.getElementById('versionText'); if(vt) vt.textContent=VERSION; const side=document.querySelector('.side-version'); if(side) side.textContent=VERSION;}catch(e){}
})();
