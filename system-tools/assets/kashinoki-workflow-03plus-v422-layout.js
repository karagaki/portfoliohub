(function(){
  'use strict';
  const VERSION = 'v1.0817';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const pages = {
    'portfolio-current': {
      step:'STEP 4', tag:'04 / 抽出文編集', title:'抽出文を1件ずつ整える', desc:'02/03で確認した候補を、成果物に使える短い文章へ整えます。原文は保持し、編集対象は抽出文だけです。',
      stats:[['表示','1/54'],['候補','抽出文'],['原文','保持'],['次工程','05へ']],
      mainTitle:'選択中の候補', mainDesc:'候補を1件ずつ切り替え、根拠と抽出文のズレを確認します。',
      cards:[['仕様候補','02は仕様・タスク・引き継ぎの素材確認に限定し、成果物本文の編集は04以降へ分ける。',['抽出文','採用候補']],['デザイン候補','02の完成済みパネルデザインを壊さず、03以降だけを配置調整する。',['抽出文','重要']],['禁止失敗候補','文言だけ変えて実装済みにせず、DOM・表示内容・導線まで反映する。',['再発防止']]],
      sideTitle:'抽出文編集', sideDesc:'成果物へ入れる文章だけを整えます。',
      textbox:'例：03以降はv422の揃ったパネル配置を参考にしつつ、02の完成済みデザインは変更しない。',
      sideCards:[['切替','◀ / ▶ で候補移動'],['状態','採用 / 修正 / 保留 / 除外'],['根拠','原文は展開確認']],
      actions:['◀ 前へ','採用','保留','除外','次へ ▶'], footer:'04は文章化の工程です。分類そのものを直す場合は03へ、素材範囲が違う場合は02へ戻します。', primary:'抽出文を05へ送る', next:'portfolio-purpose'
    },
    'portfolio-purpose': {
      step:'STEP 5', tag:'05 / 成果物候補化', title:'成果物候補へまとめる', desc:'04で整えた抽出文を、A〜Eへ渡せる成果物候補の束として整理します。全文を大量表示せず、反映先と状態を確認します。',
      stats:[['候補','A〜E別'],['未振分','確認'],['反映','未確定'],['次工程','06 / A〜E']],
      mainTitle:'成果物候補の束', mainDesc:'抽出文を成果物の単位へまとめ、A〜Eのどこへ渡すか確認します。',
      cards:[['A：次チャットへの引き継ぎ','再開メモ・確定事項・未確定事項・次作業。',['Aへ']],['B：仕様構築','画面仕様・操作仕様・保存仕様・状態遷移。',['Bへ']],['C：デザイン・ものづくり','UI判断・見せ方・制作思想・デザイン知。',['Cへ']],['D：禁止失敗 / AI回答改善','再発防止・返答改善条件・禁止事項。',['Dへ']],['E：タスク / 課題 / 自動化','実行作業・未解決・将来自動化候補。',['Eへ']]],
      sideTitle:'反映状態', sideDesc:'未整理・未反映だけを短く確認します。詳細本文はA〜Eで扱います。',
      sideCards:[['未振分','0件が目標'],['保留','06へ送る'],['戻し','04で文を直す']],
      actions:['A〜Eへ反映','未振分を見る','04へ戻す'], footer:'05は成果物候補化の工程です。本文編集ではなく、束と反映先を整えます。', primary:'A〜Eへ反映する', next:'portfolio-next'
    },
    'portfolio-next': {
      step:'STEP 6', tag:'06 / 次へ活かす確認', title:'次へ活かす確認', desc:'今回の成果物、保留、再編集待ち、次アクションを確認し、次チャット・次作業へつなげます。',
      stats:[['成果物','A〜E'],['保留','確認'],['再編集','戻し'],['再開メモ','作成']], three:true,
      mainTitle:'今回まとまったもの', mainDesc:'A〜Eへ送る成果物候補を確認します。成果物棚を肥大化させません。',
      cards:[['成果物','今回まとまった引き継ぎ・仕様・デザイン知・対策・タスク。',['成果']],['再編集待ち','02〜05へ戻す必要がある候補。',['戻し']],['次アクション','次にやること、次チャット冒頭に渡す内容。',['次回']]],
      sideTitle:'保留・再編集', sideDesc:'今回決めないものを消さずに保持します。',
      sideCards:[['保留','後で再確認'],['02へ戻す','素材範囲'],['04へ戻す','文章修正']],
      side2Title:'改善へ送る', side2Desc:'分類精度・AI回答・運用上の改善点を次へ残します。',
      side2Cards:[['AI回答改善','要点化・無駄削減'],['運用改善','次回の事故防止']],
      actions:['次回用メモを作る','A〜Eを見る'], footer:'06は終点ではなく、次回の精度を上げる確認工程です。', primary:'次回用メモを作る', next:'artifact-handoff'
    }
  };
  const ARTIFACT_SAMPLE = {
  "artifact-intent": {
    "step": "A",
    "label": "AI理解前提",
    "title": "AI理解前提を作る",
    "desc": "次のAIが最初に読むべき判断基準を、会話中の原文から残します。",
    "focus": "次AIが最初から守る前提",
    "outputs": [
      "資料優先",
      "目的固定",
      "AI補完防止"
    ],
    "candidates": [],
    "output": "AI理解前提は、03でA〜F登録された断片を元に表示します。登録前は空の状態として扱います。"
  },
  "artifact-handoff": {
    "step": "B",
    "label": "引き継ぎ書",
    "title": "引き継ぎ書を作る",
    "desc": "次チャットで同じ確認を繰り返さず、すぐ再開するための原文を残します。",
    "focus": "次回すぐ再開するための要点",
    "outputs": [
      "見た資料",
      "分かった課題",
      "次回開始位置"
    ],
    "candidates": [],
    "output": "引き継ぎ書は、03でA〜F登録された断片を元に表示します。登録前は空の状態として扱います。"
  },
  "artifact-spec": {
    "step": "C",
    "label": "仕様正本",
    "title": "仕様正本を作る",
    "desc": "確定した画面構成・表示ルール・未確認表示の扱いを、原文ベースで残します。",
    "focus": "実装や修正で守る仕様",
    "outputs": [
      "ファーストビュー",
      "3カード",
      "未確認表示"
    ],
    "candidates": [],
    "output": "仕様正本は、03でA〜F登録された断片を元に表示します。登録前は空の状態として扱います。"
  },
  "artifact-countermeasure": {
    "step": "D",
    "label": "再発防止",
    "title": "再発防止を作る",
    "desc": "AIが戻りやすい失敗方向を、会話中の注意・禁止の原文から残します。",
    "focus": "次回同じ失敗を防ぐ条件",
    "outputs": [
      "施策脱線防止",
      "幻想演出防止",
      "AI補完防止"
    ],
    "candidates": [],
    "output": "再発防止は、03でA〜F登録された断片を元に表示します。登録前は空の状態として扱います。"
  },
  "artifact-design": {
    "step": "E",
    "label": "デザイン判断",
    "title": "デザイン判断を育てる",
    "desc": "UI/UX、順序、見せ方、余白、可読性の判断を、会話中の言葉のまま残します。",
    "focus": "見た目ではなく判断の根拠",
    "outputs": [
      "順番",
      "星空感",
      "帰宅後体験"
    ],
    "candidates": [],
    "output": "デザイン判断は、03でA〜F登録された断片を元に表示します。登録前は空の状態として扱います。"
  },
  "artifact-ideas": {
    "step": "F",
    "label": "発展タスク",
    "title": "発展タスクを整理する",
    "desc": "今すぐ入れないが後で価値が出る要素を、原文ベースで残します。",
    "focus": "今はやらないが後で効くこと",
    "outputs": [
      "星座カード",
      "雨の日コース",
      "観測会詳細"
    ],
    "candidates": [],
    "output": "発展タスクは、03でA〜F登録された断片を元に表示します。登録前は空の状態として扱います。"
  }
};
  const artifacts = ARTIFACT_SAMPLE;

  const ARTIFACT_CATEGORY_DEST_PAGE = {
    '意図理解':'artifact-intent',
    'AI回答改善':'artifact-intent',
    '引き継ぎ':'artifact-handoff',
    'タスク':'artifact-handoff',
    '仕様':'artifact-spec',
    '注意・禁止':'artifact-countermeasure',
    '禁止失敗':'artifact-countermeasure',
    '課題':'artifact-countermeasure',
    'デザイン':'artifact-design',
    '自動化':'artifact-ideas'
  };
  let artifactEditorSessionState = null;
  function cloneArtifactCandidate(c, fallbackId){
    return {
      id: c && c.id ? String(c.id) : fallbackId,
      cat: c && (c.cat || c.category) ? String(c.cat || c.category) : '',
      source: c && c.source ? String(c.source) : [c && c.speaker, c && c.thread].filter(Boolean).join(' / '),
      text: c && c.text ? String(c.text) : '',
      detail: c && c.detail ? String(c.detail) : '',
      sourceAnnotationId: c && (c.sourceAnnotationId || c.annotationId) ? String(c.sourceAnnotationId || c.annotationId) : (c && c.id ? String(c.id) : ''),
      sourceStatus: c && c.sourceStatus ? String(c.sourceStatus) : 'linked',
      editorStatus: c && c.editorStatus ? String(c.editorStatus) : 'active',
      sourceTextSnapshot: c && c.sourceTextSnapshot ? String(c.sourceTextSnapshot) : (c && c.text ? String(c.text) : '')
    };
  }
  function ensureArtifactEditorSessionState(){
    if(artifactEditorSessionState) return artifactEditorSessionState;
    artifactEditorSessionState = {};
    artifactPageOrder().forEach(pageId=>{
      const base = artifactCfgForPage(pageId, artifacts[pageId] || {});
      artifactEditorSessionState[pageId] = (base.candidates || []).map((c,i)=>cloneArtifactCandidate(c, `${pageId}-${i+1}`));
    });
    return artifactEditorSessionState;
  }
  function artifactSessionCandidates(pageId, fallbackCandidates){
    const state = ensureArtifactEditorSessionState();
    if(!state[pageId]) state[pageId] = (fallbackCandidates || []).map((c,i)=>cloneArtifactCandidate(c, `${pageId}-${i+1}`));
    return state[pageId];
  }
  function artifactDestinationPageForCategory(cat, fallbackPage){
    return ARTIFACT_CATEGORY_DEST_PAGE[String(cat || '').trim()] || fallbackPage || 'artifact-intent';
  }
  function moveArtifactCandidateBetweenPages(currentPage, rowId, nextCat){
    const state = ensureArtifactEditorSessionState();
    const fromPage = currentPage || 'artifact-intent';
    const toPage = artifactDestinationPageForCategory(nextCat, fromPage);
    const fromList = state[fromPage] || [];
    const idx = fromList.findIndex(c=>String(c.id) === String(rowId));
    if(idx < 0) return {moved:false, fromPage, toPage};
    const item = {...fromList[idx], cat:String(nextCat || fromList[idx].cat || '').trim() || fromList[idx].cat};
    if(toPage === fromPage){
      fromList[idx] = item;
      state[fromPage] = fromList;
      return {moved:false, updated:true, fromPage, toPage, item};
    }
    fromList.splice(idx,1);
    state[fromPage] = fromList;
    state[toPage] = state[toPage] || [];
    const oldTargetIndex = state[toPage].findIndex(c=>String(c.id) === String(item.id));
    if(oldTargetIndex >= 0) state[toPage][oldTargetIndex] = item;
    else state[toPage].push(item);
    return {moved:true, fromPage, toPage, item};
  }

  const KASHINOKI03_REGISTERED_STORAGE_KEY = 'kashinoki03_registered_artifacts_v1';
  function readKashinoKi03RegisteredArtifacts(){
    /* v749: A〜F成果物棚は、STEP 3で「A〜Fへ登録する」を押した後だけ反映する。
       旧デモサンプルや過去localStorageを自動読込すると、登録前にA〜Fへ内容が出てしまうため、
       ここでは current session の window.__kashinoki03RegisteredArtifacts だけを正とする。 */
    if(window.__kashinoki03RegisteredArtifacts && window.__kashinoki03RegisteredArtifacts.shelves) return window.__kashinoki03RegisteredArtifacts;
    return null;
  }
  function activeArtifactSourceAnnotationIds(){
    const api = window.KashinoKiClassificationBridge02;
    if(!api || typeof api.getState !== 'function') return null;
    const state = api.getState() || {};
    const anns = Array.isArray(state.annotations) ? state.annotations : [];
    if(!anns.length) return null;
    return new Set(anns.map(a=>String(a && a.id || '')).filter(Boolean));
  }
  function applyArtifactSourceStatus(candidate, activeIds){
    const item = cloneArtifactCandidate(candidate, candidate && candidate.id || 'artifact-item');
    if(activeIds && item.sourceAnnotationId && !activeIds.has(item.sourceAnnotationId)) item.sourceStatus = 'sourceMissing';
    return item;
  }

  function artifactCfgForPage(pageId, fallback){
    const registered = readKashinoKi03RegisteredArtifacts();
    const shelf = registered && registered.shelves ? registered.shelves[pageId] : null;
    if(!shelf || !Array.isArray(shelf.candidates)){
      return {...fallback, candidates: []};
    }
    const activeIds = activeArtifactSourceAnnotationIds();
    const candidates = shelf.candidates.map((c,i)=>applyArtifactSourceStatus({
      id: c.id || `${pageId}-${i+1}`,
      cat: c.cat || c.category || '',
      source: c.source || [c.speaker, c.thread].filter(Boolean).join(' / '),
      text: c.text || '',
      detail: (c.detail && c.detail !== c.text) ? c.detail : '',
      sourceAnnotationId: c.sourceAnnotationId || c.annotationId || c.id || '',
      sourceStatus: c.sourceStatus || 'linked',
      editorStatus: c.editorStatus || 'active',
      sourceTextSnapshot: c.sourceTextSnapshot || c.text || ''
    }, activeIds)).filter(c=>c.editorStatus !== 'deleted' && (c.text || c.detail || c.cat));
    return {...fallback, candidates};
  }

  function statHTML(stats){ return `<div class="kashinoki-v422-03plus-stats workflow-filter-brief">${stats.map(([a,b],i)=>`<button type="button" class="kashinoki-v422-03plus-stat workflow-brief-card kashinoki-filter-button ${i===0?'is-selected is-active':''}" aria-pressed="${i===0?'true':'false'}"><span>${esc(a)}</span><b>${esc(b)}</b></button>`).join('')}</div>`; }
  function cardsHTML(cards){ return `<div class="kashinoki-v422-03plus-list">${cards.map(([t,d,b])=>`<div class="kashinoki-v422-03plus-card kashinoki-neumo-panel kashinoki-reveal-item"><strong>${esc(t)}</strong><small>${esc(d)}</small>${b?`<div class="kashinoki-v422-03plus-badges">${b.map(x=>`<span class="kashinoki-v422-03plus-badge">${esc(x)}</span>`).join('')}</div>`:''}</div>`).join('')}</div>`; }
  function miniHTML(cards){ return `<div class="kashinoki-v422-03plus-mini-grid">${(cards||[]).map(([t,d])=>`<div class="kashinoki-v422-03plus-mini kashinoki-neumo-panel kashinoki-reveal-item"><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div>`; }
  function actionsHTML(actions){ return `<div class="kashinoki-v422-03plus-actions">${(actions||[]).map((a,i)=>`<button type="button" class="btn ${i===0?'primary':'secondary'} kashinoki-v422-03plus-btn ${i===0?'kashinoki-v422-03plus-primary':''}">${esc(a)}</button>`).join('')}</div>`; }
  function guideInfo(cfg){
    const step = String(cfg.step || '');
    if (step.includes('3')) return {badge:'分ける', top:'02で分類したチップをA〜Fへ送る前に確認します', topDesc:'1スレッド内の編集は02までです。03では送り先と件数だけを確認します。', bottom:'分類チップをA〜Fへ登録します', bottomDesc:'A〜Fの蓄積エリアへ登録します。', button:'A〜Fへ登録する'};
    if (step.includes('4')) return {badge:'整える', top:'候補を1件ずつ切り替え、成果物に使う抽出文へ整えます', topDesc:'原文は保持したまま、成果物へ使う短い抽出文だけを採用・修正・保留・除外で判断します。', bottom:'抽出文を05へ送ります', bottomDesc:'整えた抽出文を成果物候補の束へ渡します。分類を直す場合は03へ戻します。', button:'抽出文を05へ送る'};
    if (step.includes('5')) return {badge:'束ねる', top:'整えた抽出文を成果物候補として束ねます', topDesc:'A〜Eのどの成果物へ渡すかを確認し、未整理・保留・戻し対象を分けます。', bottom:'成果物候補を06へ送ります', bottomDesc:'今回使う候補を次へ活かす確認へ進めます。本文編集が必要な場合は04へ戻します。', button:'成果物候補を06へ送る'};
    return {badge:'活かす', top:'成果・保留・再編集待ち・次アクションを確認します', topDesc:'次チャット・次作業へ渡す前に、今回残す内容と戻す内容を確認します。', bottom:'次へ活かす確認を完了します', bottomDesc:'成果物、保留、再編集待ち、次アクションを確認し、次回用メモへつなげます。', button:'次回用メモを作る'};
  }
  function guidePanel(cfg, pos){
    const g = guideInfo(cfg);
    const title = pos === 'top' ? g.top : g.bottom;
    const desc = pos === 'top' ? g.topDesc : g.bottomDesc;
    const cls = pos === 'top' ? 'workflow-accent-panel-slot portfolio-action kashinoki-action-panel-slot workflow-page-top-action kashinoki-v438-guide-panel' : 'workflow-accent-panel-slot portfolio-action kashinoki-action-panel-slot kashinoki-v438-guide-panel';
    return `<div class="${cls}"><div class="guided-action kashinoki-action-panel"><div class="guided-action-copy"><label>今行う主操作 <span class="guided-action-badge">${esc(g.badge)}</span></label><b>${esc(title)}</b><p>${esc(desc)}</p></div><button class="btn primary" data-page-next="${esc(cfg.next||'')}">${esc(pos === 'top' ? 'この工程を確認する' : g.button)} ➡</button></div></div>`;
  }
function workflowHeading(cfg){
    const desc = cfg.desc ? `<p>${esc(cfg.desc)}</p>` : '';
    return `<div class="kashinoki-v422-03plus-heading"><div><span class="kashinoki-v422-03plus-step">${esc(cfg.step)}</span><h2>${esc(cfg.title)}</h2>${desc}</div><span class="kashinoki-v422-03plus-tag">${esc(cfg.tag)}</span></div>`;
  }
  function renderWorkflow(cfg){
    const main = `<section class="kashinoki-v422-03plus-panel kashinoki-v422-03plus-main card kashinoki-neumo-panel kashinoki-reveal-shell"><h3>${esc(cfg.mainTitle)}</h3><p>${esc(cfg.mainDesc)}</p>${cardsHTML(cfg.cards||[])}</section>`;
    const cat = cfg.categories ? `<div class="kashinoki-v422-03plus-category-grid">${cfg.categories.map(c=>`<button type="button" class="kashinoki-v422-03plus-btn">${esc(c)}</button>`).join('')}</div>` : '';
    const textarea = cfg.textbox ? `<textarea class="kashinoki-v422-03plus-textbox">${esc(cfg.textbox)}</textarea>` : '';
    const side = `<section class="kashinoki-v422-03plus-panel kashinoki-v422-03plus-side workflow-side-card card kashinoki-neumo-panel kashinoki-reveal-shell"><h3>${esc(cfg.sideTitle)}</h3><p>${esc(cfg.sideDesc)}</p>${cat}${textarea}${miniHTML(cfg.sideCards)}${actionsHTML(cfg.actions)}</section>`;
    const extra = cfg.three ? `<section class="kashinoki-v422-03plus-panel kashinoki-v422-03plus-side workflow-side-card card kashinoki-neumo-panel kashinoki-reveal-shell"><h3>${esc(cfg.side2Title)}</h3><p>${esc(cfg.side2Desc)}</p>${miniHTML(cfg.side2Cards)}</section>` : '';
    const grid = cfg.three ? `<div class="kashinoki-v422-03plus-three">${main}${side}${extra}</div>` : `<div class="kashinoki-v422-03plus-grid">${main}${side}</div>`;
    return `<div class="kashinoki-v422-03plus">${workflowHeading(cfg)}${guidePanel(cfg,'top')}${statHTML(cfg.stats)}${grid}${guidePanel(cfg,'bottom')}</div>`;
  }
  function artifactCandidateButton(c, index){
    return `<button type="button" class="artifact-v508-chip ${index===0?'is-active':''}" data-artifact-pick="${esc(c.id)}">
      <span>${esc(c.cat)}</span><b>${esc(c.text)}</b><small>${esc(c.source)}</small>
    </button>`;
  }
  function artifactPageOrder(){
    return ['artifact-intent','artifact-handoff','artifact-spec','artifact-countermeasure','artifact-design','artifact-ideas'];
  }
  function artifactFragmentText(c, i){
    const lines = [];
    const title = `【${i+1}. ${c.cat || '分類'}】${c.source || ''}`.trim();
    const text = String(c.text || '').trim();
    const detail = String(c.detail || '').trim();
    lines.push(title);
    if(text) lines.push(text);
    if(detail && detail !== text) lines.push(`- ${detail}`);
    return lines.filter(Boolean).join('\n');
  }
  function artifactEditorHTML(text){
    return esc(text || '').replace(/\n/g, '<br>');
  }
  function artifactHashToken(value){
    const raw = String(value || '').trim();
    if(!raw) return '';
    return raw
      .replace(/[\u3000\s]+/g, '_')
      .replace(/[\[\]【】()（）「」『』,，、。:：;；]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
  function artifactSourceParts(source){
    const raw = String(source || '').trim();
    if(!raw) return {speaker:'', project:''};
    const parts = raw.split('/').map(v=>v.trim()).filter(Boolean);
    return {speaker:parts[0] || '', project:parts[1] || parts[0] || ''};
  }
  const ARTIFACT_EDITOR_CATEGORIES = ['仕様','タスク','引き継ぎ','注意・禁止','デザイン','課題','禁止失敗','自動化','AI回答改善','意図理解'];
  function artifactCategoryColorFor(cat){
    const key = String(cat || '').trim();
    try{
      const cfg = readQuality02Settings();
      return validQuality02Hex(cfg.colors && cfg.colors[key], QUALITY02_DEFAULT_SETTINGS.colors[key] || '#dfe7e4');
    }catch(e){
      const fallback = {'仕様':'#001beb','タスク':'#b67c2b','引き継ぎ':'#dd1374','注意・禁止':'#ef9cad','デザイン':'#8f61d8','課題':'#e46b2d','禁止失敗':'#2f3542','自動化':'#11a579','AI回答改善':'#2d7dd2','意図理解':'#6b5bd6'};
      return fallback[key] || '#dfe7e4';
    }
  }
  function artifactCategoryTextFor(cat){
    try{ return quality02TextColorFor(artifactCategoryColorFor(cat)); }
    catch(e){ return '#1f2a27'; }
  }
  function artifactCategorySelectStyle(cat){
    const color = artifactCategoryColorFor(cat);
    const text = artifactCategoryTextFor(cat);
    return `--artifact-category-color:${esc(color)};--artifact-category-text:${esc(text)};`;
  }
  function applyArtifactCategorySelectStyle(select, cat){
    if(!select) return;
    const value = String(cat || select.value || '').trim();
    const color = artifactCategoryColorFor(value);
    const text = artifactCategoryTextFor(value);
    select.style.setProperty('--artifact-category-color', color);
    select.style.setProperty('--artifact-category-text', text);
    select.setAttribute('data-artifact-row-category-current', value);
  }
  function applyArtifactCategorySelectColors(root){
    const scope = root || document;
    scope.querySelectorAll('[data-artifact-row-category]').forEach(select=>applyArtifactCategorySelectStyle(select, select.value));
  }
  function artifactCategorySelectHTML(current){
    const value = String(current || '').trim();
    const options = ARTIFACT_EDITOR_CATEGORIES.map(cat=>`<option value="${esc(cat)}"${cat===value?' selected':''}>${esc(cat)}</option>`).join('');
    return `<label class="artifact-v669-category-control artifact-v671-category-compact artifact-v673-category-color-control" contenteditable="false" style="${artifactCategorySelectStyle(value)}"><select aria-label="分類" title="分類を変更" data-artifact-row-category data-artifact-row-category-current="${esc(value)}" style="${artifactCategorySelectStyle(value)}">${options}</select></label>`;
  }
  function artifactEditorTags(cat, source){
    const src = artifactSourceParts(source);
    const groups = [
      [cat],
      [src.speaker],
      [src.project]
    ];
    const seen = new Set();
    return groups.map(group=>group.map(artifactHashToken).filter(Boolean).filter(tag=>{
      if(seen.has(tag)) return false;
      seen.add(tag);
      return true;
    })).filter(group=>group.length);
  }
  function artifactFlattenTagGroups(groups){
    const seen = new Set();
    const flat = [];
    (Array.isArray(groups) ? groups : []).forEach(group=>{
      (Array.isArray(group) ? group : [group]).forEach(tag=>{
        const value = String(tag || '').trim();
        if(!value || seen.has(value)) return;
        seen.add(value);
        flat.push(value);
      });
    });
    return flat;
  }
  function artifactEditorHashTagsHTML(tagGroups){
    const groups = Array.isArray(tagGroups) ? tagGroups : [];
    const groupKeys = ['category','speaker','project'];
    const html = groups.map((group, groupIndex)=>{
      const list = Array.isArray(group) ? group : [group];
      const key = groupKeys[groupIndex] || `group${groupIndex+1}`;
      return list.map(tag=>`<span class="artifact-v665-hashtag" data-artifact-editor-tag="${esc(tag)}" data-artifact-tag-group="${esc(key)}">#${esc(tag)}</span>`).join(' ');
    }).filter(Boolean).join('<span class="artifact-v668-tag-separator">/</span>');
    return html ? `<span class="artifact-v665-hashtags">${html}</span>` : '';
  }
  function artifactEditorRowsHTML(candidates, fallbackText){
    const rows = Array.isArray(candidates) ? candidates : [];
    if(!rows.length) return artifactEditorHTML(fallbackText || '登録された断片はまだありません。\nデモ体験で分類し表示が確認できます。');
    return rows.map((c,i)=>{
      const rawCat = c.cat || c.category || '分類';
      const rawSource = c.source || [c.speaker, c.thread].filter(Boolean).join(' / ');
      const text = esc(c.text || '');
      const detail = esc((c.detail && c.detail !== c.text) ? c.detail : '');
      const lineNo = String(i + 1).padStart(2, '0');
      const tagGroups = artifactEditorTags(rawCat, rawSource);
      const tags = artifactFlattenTagGroups(tagGroups);
      const hashtags = artifactEditorHashTagsHTML(tagGroups);
      const bodyParts = [];
      if (text) bodyParts.push(`<span class="artifact-v702-raw-text">${artifactEditorHTML(c.text || '')}</span>`);
      if (detail) bodyParts.push(`<span class="artifact-v702-raw-detail">${artifactEditorHTML(c.detail || '')}</span>`);
      const body = bodyParts.join('<br>');
      const src = artifactSourceParts(rawSource);
      const sourceStatus = String(c.sourceStatus || 'linked');
      const statusLabel = sourceStatus === 'sourceMissing' ? '元分類削除済み' : (sourceStatus === 'manual' ? '手動分類' : '元分類あり');
      const statusClass = sourceStatus === 'sourceMissing' ? ' is-source-missing' : '';
      return `<div class="artifact-v660-editor-row artifact-v661-editor-line artifact-v702-multiline-row${statusClass}" data-editor-row="${i+1}" data-artifact-row-id="${esc(c.id || `${i+1}`)}" data-source-annotation-id="${esc(c.sourceAnnotationId || '')}" data-artifact-source-status="${esc(sourceStatus)}" data-artifact-editor-row-tags="${esc(tags.join(' '))}" data-artifact-row-cat="${esc(rawCat)}" data-artifact-row-speaker="${esc(src.speaker)}" data-artifact-row-project="${esc(src.project)}"><span class="artifact-v660-row-no artifact-v661-line-no">${lineNo}</span><div class="artifact-v660-row-body artifact-v661-line-body"><p><span class="artifact-v669-row-tools">${artifactCategorySelectHTML(rawCat)}</span><span class="artifact-v800-link-status" contenteditable="false">${esc(statusLabel)}</span><span class="artifact-v661-line-comment">${hashtags}</span>${body ? `<span class="artifact-v702-row-copy">${body}</span>` : ''}</p></div></div>`;
    }).join('');
  }
  function artifactEditorFilterGroupsFromRows(rows){
    const sourceRows = Array.isArray(rows) ? rows : [];
    const groups = {cats:[], speakers:[], projects:[]};
    const seen = {cats:new Set(), speakers:new Set(), projects:new Set()};
    const push = (key, value) => {
      const tag = artifactHashToken(value);
      if(!tag || seen[key].has(tag)) return;
      seen[key].add(tag);
      groups[key].push(tag);
    };
    sourceRows.forEach(c=>{
      push('cats', c.cat || c.category || '分類');
      const rawSource = c.source || [c.speaker, c.thread].filter(Boolean).join(' / ');
      const src = artifactSourceParts(rawSource);
      push('speakers', src.speaker);
      push('projects', src.project);
    });
    const speakerOrder = ['ChatGPT','User'];
    groups.speakers.sort((a,b)=>{
      const ai = speakerOrder.indexOf(a);
      const bi = speakerOrder.indexOf(b);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.localeCompare(b, 'ja');
    });
    return [groups.cats, groups.speakers, groups.projects].filter(group=>group.length);
  }
  function artifactEditorFilterTags(candidates){
    return artifactFlattenTagGroups(artifactEditorFilterGroupsFromRows(candidates));
  }
  function artifactEditorFilterButtonsHTML(tagGroups, oldMuted){
    const groups = Array.isArray(tagGroups) ? tagGroups : [];
    return groups.map(group=>{
      const list = Array.isArray(group) ? group : [group];
      return list.map(tag=>`<button type="button" class="artifact-v666-filter-tag ${oldMuted && oldMuted.has(tag)?'is-muted':''}" data-artifact-filter-tag="${esc(tag)}">#${esc(tag)}</button>`).join(' ');
    }).filter(Boolean).join('<span class="artifact-v668-tag-separator">/</span>');
  }
  function artifactEditorFilterHTML(candidates){
    const tagGroups = artifactEditorFilterGroupsFromRows(candidates);
    const tags = artifactFlattenTagGroups(tagGroups);
    if(!tags.length) return '';
    return `<div class="artifact-v666-filter is-collapsed" data-artifact-editor-filter><div class="artifact-v666-filter-head"><button type="button" class="artifact-v666-filter-toggle" data-artifact-filter-toggle aria-expanded="false"><span data-artifact-filter-arrow>▶</span><span>タグ表示フィルター</span></button><em data-artifact-filter-count>表示 ${esc(String(candidates.length))} / 全${esc(String(candidates.length))}</em><button type="button" class="is-active" data-artifact-tags-toggle>タグ全て</button><button type="button" data-artifact-category-switch-toggle>切替表示</button><button type="button" data-artifact-project-tags-toggle>プロジェクト</button><button type="button" data-artifact-filter-clear>すべて表示</button></div><div class="artifact-v666-filter-tags">${artifactEditorFilterButtonsHTML(tagGroups, new Set())}</div></div>`;
  }
  function artifactPlainText(editor){
    if(!editor) return '';
    return (editor.innerText || editor.textContent || '').replace(/\u00a0/g, ' ').trimEnd();
  }
  function artifactRowSetCategory(row, cat){
    if(!row) return;
    const nextCat = String(cat || '').trim() || '分類';
    const speaker = row.getAttribute('data-artifact-row-speaker') || '';
    const project = row.getAttribute('data-artifact-row-project') || '';
    const source = [speaker, project].filter(Boolean).join(' / ');
    const tagGroups = artifactEditorTags(nextCat, source);
    const tags = artifactFlattenTagGroups(tagGroups);
    row.setAttribute('data-artifact-row-cat', nextCat);
    row.setAttribute('data-artifact-editor-row-tags', tags.join(' '));
    const select = row.querySelector('[data-artifact-row-category]');
    if(select) applyArtifactCategorySelectStyle(select, nextCat);
    const control = row.querySelector('.artifact-v673-category-color-control');
    if(control){
      control.style.setProperty('--artifact-category-color', artifactCategoryColorFor(nextCat));
      control.style.setProperty('--artifact-category-text', artifactCategoryTextFor(nextCat));
    }
    const comment = row.querySelector('.artifact-v661-line-comment');
    if(comment) comment.innerHTML = artifactEditorHashTagsHTML(tagGroups);
  }
  function refreshArtifactEditorFilterTags(root){
    if(!root) return;
    const filter = root.querySelector('[data-artifact-editor-filter]');
    if(!filter) return;
    const tagBox = filter.querySelector('.artifact-v666-filter-tags');
    if(!tagBox) return;
    const oldMuted = new Set(Array.from(root.querySelectorAll('[data-artifact-filter-tag].is-muted')).map(btn=>btn.getAttribute('data-artifact-filter-tag')).filter(Boolean));
    const rows = Array.from(root.querySelectorAll('[data-artifact-editor-row-tags]')).map(row=>({
      cat: row.getAttribute('data-artifact-row-cat') || '',
      source: [row.getAttribute('data-artifact-row-speaker') || '', row.getAttribute('data-artifact-row-project') || ''].filter(Boolean).join(' / ')
    }));
    const tagGroups = artifactEditorFilterGroupsFromRows(rows);
    tagBox.innerHTML = artifactEditorFilterButtonsHTML(tagGroups, oldMuted);
    updateArtifactFilterControls(root);
  }
  function updateArtifactFilterControls(root){
    if(!root) return;
    const isTagsHidden = root.classList.contains('is-artifact-tags-hidden');
    const isCategorySwitchHidden = root.classList.contains('is-artifact-category-switch-hidden');
    const mutedCount = root.querySelectorAll('[data-artifact-filter-tag].is-muted').length;
    const isProjectTagsHidden = root.classList.contains('is-artifact-project-tags-hidden');
    root.querySelectorAll('[data-artifact-tags-toggle]').forEach(btn=>btn.classList.toggle('is-active', !isTagsHidden));
    root.querySelectorAll('[data-artifact-project-tags-toggle]').forEach(btn=>btn.classList.toggle('is-active', !isProjectTagsHidden));
    root.querySelectorAll('[data-artifact-filter-clear]').forEach(btn=>btn.classList.toggle('is-active', !isTagsHidden && !isProjectTagsHidden && !isCategorySwitchHidden && mutedCount === 0));
    root.querySelectorAll('[data-artifact-category-switch-toggle]').forEach(btn=>btn.classList.toggle('is-active', !isCategorySwitchHidden));
  }
  function updateArtifactEditorFilters(root){
    if(!root) return;
    const muted = Array.from(root.querySelectorAll('[data-artifact-filter-tag].is-muted')).map(btn=>btn.getAttribute('data-artifact-filter-tag')).filter(Boolean);
    const rows = Array.from(root.querySelectorAll('[data-artifact-editor-row-tags]'));
    let visible = 0;
    rows.forEach(row=>{
      const rowTags = String(row.getAttribute('data-artifact-editor-row-tags') || '').split(/\s+/).filter(Boolean);
      const hide = muted.some(tag=>rowTags.includes(tag));
      row.hidden = hide;
      row.classList.toggle('is-filter-hidden', hide);
      if(!hide) visible += 1;
    });
    const count = root.querySelector('[data-artifact-filter-count]');
    if(count) count.textContent = `表示 ${visible} / 全${rows.length}`;
    root.classList.toggle('is-artifact-filtering', muted.length > 0);
    updateArtifactFilterControls(root);
  }
  function artifactEnsureChipRail(root){
    if(!root) return null;
    return root.querySelector('[data-artifact-chip-rail]');
  }
  function artifactAddChipTag(root, type, text){
    const rail = artifactEnsureChipRail(root);
    if(!rail || !type) return;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `artifact-v572-chip artifact-v572-chip-${String(type).toLowerCase()}`;
    chip.setAttribute('data-artifact-chip-type', type);
    chip.title = text || type;
    chip.textContent = type;
    rail.appendChild(chip);
  }

  function artifactCandidateTexts(candidates, limit){
    return (candidates || [])
      .map(c => String(c.detail || c.text || '').trim())
      .filter(Boolean)
      .slice(0, limit || 3);
  }
  function artifactPreviewCore(texts, fallback){
    const clean = (texts || []).map(t => String(t || '').trim()).filter(Boolean);
    if(!clean.length) return fallback;
    const first = clean[0];
    const second = clean[1] ? ` / ${clean[1]}` : '';
    return `${first}${second}`;
  }
  function artifactUsePreviewHTML(cfg, candidates){
    const label = cfg && cfg.label ? cfg.label : '成果物';
    const texts = artifactCandidateTexts(candidates, 2);
    const sample = artifactPreviewCore(texts, `${label}の断片`);
    const noteText = `本来はここで「${label}」の内容をMDとして書き出します。デモ版ではファイル生成は行わず、書き出した後にどう使えるかだけを順番に見せます。`;
    const nextAI = '次AI用：次のAIが最初に読む前提をまとめる';
    const instruction = '指示用：Codex / Claudeへ渡す実装メモにする';
    const memory = 'メモリ候補：何度も使う注意や好みだけを残す';
    const canon = '正本候補：確定仕様と未解決を分けて保存する';
    const previewCards = [
      ['次AI用', nextAI],
      ['指示用', instruction],
      ['メモリ候補', memory],
      ['正本候補', canon]
    ];
    return `<section class="artifact-v598-export-preview" data-artifact-use-preview hidden aria-label="書き出し後の活用プレビュー">
      <div class="artifact-v598-export-note">
        <b>デモ版のためMDファイルは生成しません</b>
        <span>${esc(noteText)}</span>
        <small>例：${esc(sample)}</small>
      </div>
      <div class="artifact-v597-preview-grid" aria-label="書き出し後の活用例">
        ${previewCards.map((card, index)=>`<article data-artifact-preview-card="${index}"><span>${esc(card[0])}</span><p data-artifact-type-text="${esc(card[1])}"></p></article>`).join('')}
      </div>
    </section>`;
  }

  const artifactTypeTimers = new WeakMap();
  function resetArtifactTypewriter(root){
    if(!root) return;
    const timers = artifactTypeTimers.get(root) || [];
    timers.forEach(id => window.clearTimeout(id));
    artifactTypeTimers.set(root, []);
    root.querySelectorAll('[data-artifact-type-text]').forEach(el => { el.textContent = ''; });
  }
  function startArtifactTypewriter(root, cardIndex, delay){
    if(!root) return;
    const textEl = root.querySelector(`[data-artifact-preview-card="${cardIndex}"] [data-artifact-type-text]`);
    if(!textEl) return;
    const full = textEl.getAttribute('data-artifact-type-text') || '';
    textEl.textContent = '';
    const timers = artifactTypeTimers.get(root) || [];
    const start = window.setTimeout(()=>{
      let i = 0;
      const step = () => {
        i += 1;
        textEl.textContent = full.slice(0, i);
        if(i < full.length){
          const t = window.setTimeout(step, 58);
          timers.push(t);
          artifactTypeTimers.set(root, timers);
        }
      };
      step();
    }, delay || 0);
    timers.push(start);
    artifactTypeTimers.set(root, timers);
  }

  function renderArtifact(cfg){
    const pageId = Object.keys(artifacts).find(id => artifacts[id] === cfg) || '';
    const order = artifactPageOrder();
    const current = Math.max(0, order.indexOf(pageId));
    const prevPage = order[(current - 1 + order.length) % order.length] || 'artifact-intent';
    const nextPage = order[(current + 1) % order.length] || 'artifact-handoff';
    const liveCfg = artifactCfgForPage(pageId, cfg);
    const candidates = artifactSessionCandidates(pageId, liveCfg.candidates || []);
    cfg = {...liveCfg, candidates};
    const editorText = candidates.length
      ? candidates.map((c,i)=>artifactFragmentText(c,i)).join('\n\n')
      : '登録された断片はまだありません。\nデモ体験で分類し表示が確認できます。';
    const catText = candidates.length ? candidates.map(c=>c.cat).filter((v,i,a)=>v && a.indexOf(v)===i).join(' / ') : '';
    return `<div class="artifact-v571 is-artifact-category-switch-hidden is-artifact-project-tags-hidden" data-artifact-root="${esc(cfg.step)}" data-artifact-page="${esc(pageId)}">
      <div class="artifact-v571-editor card kashinoki-neumo-panel">
        <div class="artifact-v659-editor-heading">エディター機能</div>
        <div class="artifact-v571-head">
          <div class="artifact-v571-title-block">
            <h2><span>${esc(cfg.step)} ${esc(cfg.label)}候補</span><small>${candidates.length ? `${esc(catText)} から ${esc(candidates.length)}件` : '登録された断片はまだありません'}</small></h2>
          </div>
        </div>
        <div class="artifact-v572-editor-wrap artifact-v660-editor-wrap">
          <div class="artifact-v660-editor-meta" aria-label="エディター状態"><span>読み込み済み断片</span><b>${esc(candidates.length)}件 / 編集前</b></div>
          ${artifactEditorFilterHTML(candidates)}
          <div class="artifact-v572-chip-rail" data-artifact-chip-rail aria-label="登録済みチップタグ"></div>
          <div class="artifact-v571-textarea artifact-v572-editable artifact-v660-editor-sheet" data-artifact-editor contenteditable="true" spellcheck="false" role="textbox" aria-multiline="true">${artifactEditorRowsHTML(candidates, editorText)}</div>
        </div>
        <section class="artifact-v600-export-cta" aria-label="書き出し導線">
          <div class="artifact-v600-export-copy">
            <div class="artifact-v600-export-kicker"><span>今行う主操作</span><em>● 書き出し</em></div>
            <b>内容を確認してから書き出す</b>
            <span>この分類に集まった断片を読み、次のAI作業で使う前提として確認します。</span>
          </div>
          <span class="artifact-v790-demo-export-inline" data-artifact-demo-export-inline hidden>デモ版のため、ファイル書き出しは行いません。</span>
          <button type="button" class="artifact-v598-export-btn" data-artifact-demo-export>書き出し</button>
        </section>
        ${artifactUsePreviewHTML(cfg, candidates)}
        <div class="artifact-v571-toolbar">
          <div class="artifact-v571-tools-left">
            <span data-artifact-selection-hint>登録済み断片を確認し、必要に応じて分類タグを変更できます。</span>
          </div>

        </div>
        <span class="artifact-copy-status" data-artifact-status>03で登録された文言を分別別に編集できます。</span>
      </div>
    </div>`;
  }



  const QUALITY02_SETTINGS_KEY = 'kashinoki_quality02_filter_settings_v1';
  const QUALITY02_DEFAULT_SETTINGS = { mode: 'hide', opacity: 20, showLineNumbers: true, colors: {'仕様':'#001beb','タスク':'#b67c2b','引き継ぎ':'#dd1374','注意・禁止':'#ef9cad','デザイン':'#8f61d8','課題':'#e46b2d','禁止失敗':'#2f3542','自動化':'#11a579','AI回答改善':'#2d7dd2','意図理解':'#6b5bd6'}, lineStyles: {'仕様':'solid','タスク':'solid','引き継ぎ':'solid','注意・禁止':'wavy','デザイン':'solid','課題':'dotted','禁止失敗':'wavy','自動化':'solid','AI回答改善':'dotted','意図理解':'solid'} };
  const QUALITY02_CATEGORIES = ['仕様','タスク','引き継ぎ','注意・禁止','デザイン','課題','禁止失敗','自動化','AI回答改善','意図理解'];
  let quality02ChipSeq = 1;
  function validQuality02Hex(value, fallback){
    const v = String(value || '').trim();
    return /^#[0-9a-fA-F]{6}$/.test(v) ? v.toLowerCase() : fallback;
  }
  function validQuality02LineStyle(value, fallback){
    const v = String(value || '').trim();
    return ['solid','dotted','wavy'].includes(v) ? v : (fallback || 'solid');
  }
  function quality02LineStyleLabel(value){
    return ({solid:'直線', dotted:'点線', wavy:'波線'})[value] || '直線';
  }
  function readQuality02Settings(){
    try{
      const raw = JSON.parse(localStorage.getItem(QUALITY02_SETTINGS_KEY) || '{}');
      const mode = raw.mode === 'dim' ? 'dim' : 'hide';
      const opacity = Math.max(10, Math.min(60, Number(raw.opacity) || QUALITY02_DEFAULT_SETTINGS.opacity));
      const colors = { ...QUALITY02_DEFAULT_SETTINGS.colors };
      Object.keys(colors).forEach(key => { colors[key] = validQuality02Hex(raw.colors && raw.colors[key], colors[key]); });
      const lineStyles = { ...QUALITY02_DEFAULT_SETTINGS.lineStyles };
      Object.keys(lineStyles).forEach(key => { lineStyles[key] = validQuality02LineStyle(raw.lineStyles && raw.lineStyles[key], lineStyles[key]); });
      const showLineNumbers = raw.showLineNumbers !== false;
      return {mode, opacity, showLineNumbers, colors, lineStyles};
    }catch(e){ return {mode: QUALITY02_DEFAULT_SETTINGS.mode, opacity: QUALITY02_DEFAULT_SETTINGS.opacity, showLineNumbers: QUALITY02_DEFAULT_SETTINGS.showLineNumbers, colors:{...QUALITY02_DEFAULT_SETTINGS.colors}, lineStyles:{...QUALITY02_DEFAULT_SETTINGS.lineStyles}}; }
  }
  function saveQuality02Settings(value){
    const current = readQuality02Settings();
    const nextColors = { ...current.colors, ...(value && value.colors ? value.colors : {}) };
    const nextLineStyles = { ...(current.lineStyles || QUALITY02_DEFAULT_SETTINGS.lineStyles), ...(value && value.lineStyles ? value.lineStyles : {}) };
    const v = { ...current, ...value, colors: nextColors, lineStyles: nextLineStyles };
    v.mode = v.mode === 'dim' ? 'dim' : 'hide';
    v.showLineNumbers = v.showLineNumbers !== false;
    v.opacity = Math.max(10, Math.min(60, Number(v.opacity) || QUALITY02_DEFAULT_SETTINGS.opacity));
    Object.keys(QUALITY02_DEFAULT_SETTINGS.colors).forEach(key => { v.colors[key] = validQuality02Hex(v.colors[key], QUALITY02_DEFAULT_SETTINGS.colors[key]); });
    Object.keys(QUALITY02_DEFAULT_SETTINGS.lineStyles).forEach(key => { v.lineStyles[key] = validQuality02LineStyle(v.lineStyles[key], QUALITY02_DEFAULT_SETTINGS.lineStyles[key]); });
    localStorage.setItem(QUALITY02_SETTINGS_KEY, JSON.stringify(v));
    applyQuality02SettingsControls(v);
    const root = document.getElementById('portfolio-quality');
    if(root){ applyQuality02ColorStyles(root, v); applyReview02Filter(root, root.getAttribute('data-review02-current') || 'all'); }
    applyArtifactCategorySelectColors(document);
    window.dispatchEvent(new CustomEvent('quality02-settings-updated', { detail: v }));
  }
  function applyQuality02SettingsControls(v){
    const mode = v || readQuality02Settings();
    document.querySelectorAll('[data-quality02-filter-mode]').forEach(btn=>{
      const active = btn.getAttribute('data-quality02-filter-mode') === mode.mode;
      btn.classList.toggle('is-selected', active);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const slider = document.getElementById('quality02DimOpacity');
    const value = document.getElementById('quality02DimOpacityValue');
    if(slider) slider.value = String(mode.opacity);
    if(value) value.textContent = `${mode.opacity}%`;
    document.querySelectorAll('[data-quality02-line-number-toggle]').forEach(btn=>{
      const active = (btn.getAttribute('data-quality02-line-number-toggle') === 'show') === (mode.showLineNumbers !== false);
      btn.classList.toggle('is-selected', active);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    Object.entries(mode.colors || {}).forEach(([key, color])=>{
      const picker = document.querySelector(`[data-quality02-color-picker="${CSS.escape(key)}"]`);
      const text = document.querySelector(`[data-quality02-color-text="${CSS.escape(key)}"]`);
      const sample = document.querySelector(`[data-quality02-color-sample="${CSS.escape(key)}"]`);
      const label = document.querySelector(`[data-quality02-color-value="${CSS.escape(key)}"]`);
      if(picker) picker.value = color;
      if(text) text.value = color;
      if(sample){ sample.style.backgroundColor = color; sample.style.color = quality02TextColorFor(color); sample.textContent = key; }
      if(label) label.textContent = color;
      const lineStyle = (mode.lineStyles && mode.lineStyles[key]) || QUALITY02_DEFAULT_SETTINGS.lineStyles[key] || 'solid';
      const styleSelect = document.querySelector(`[data-quality02-line-style="${CSS.escape(key)}"]`);
      if(styleSelect) styleSelect.value = lineStyle;
    });
  }
  function quality02TextColorFor(hex){
    const v = validQuality02Hex(hex, '#ffffff').slice(1);
    const r = parseInt(v.slice(0,2),16), g = parseInt(v.slice(2,4),16), b = parseInt(v.slice(4,6),16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? '#1f2a27' : '#ffffff';
  }
  function applyQuality02CategoryPickButtonColors(root, settings){
    const scope = root || document;
    const cfg = settings || readQuality02Settings();
    scope.querySelectorAll('[data-quality02-pick-category]').forEach(btn=>{
      const key = btn.getAttribute('data-quality02-pick-category') || '';
      const color = validQuality02Hex(cfg.colors && cfg.colors[key], QUALITY02_DEFAULT_SETTINGS.colors[key] || '#962eff');
      btn.style.setProperty('--quality02-pick-color', color);
      btn.style.setProperty('--quality02-pick-text', quality02TextColorFor(color));
    });
  }
  function setQuality02ColorVar(root, key, color, index){
    const safe = validQuality02Hex(color, QUALITY02_DEFAULT_SETTINGS.colors[key] || '#9dd3d9');
    const text = quality02TextColorFor(safe);
    root.style.setProperty(`--quality02-${index}-color`, safe);
    root.style.setProperty(`--quality02-${index}-text`, text);
  }
  function applyQuality02ColorStyles(root, settings){
    const cfg = settings || readQuality02Settings();
    const map = {'仕様':'spec','タスク':'task','引き継ぎ':'handoff','注意・禁止':'caution','デザイン':'design','課題':'issue','禁止失敗':'failure','自動化':'automation','AI回答改善':'answer','意図理解':'intent'};
    Object.entries(map).forEach(([key, suffix])=>setQuality02ColorVar(root, key, cfg.colors[key], suffix));
    applyQuality02CategoryPickButtonColors(root, cfg);
    root.querySelectorAll('article.chat-bubble').forEach(refreshArticleChipState);
  }
  function installQuality02DisplaySettings(){
    const pane = document.getElementById('settingsDisplay3Pane');
    const layout = pane && pane.querySelector('.settings-layout');
    if(!layout || document.getElementById('quality02FilterSettingsCard')) return;
    const card = document.createElement('div');
    card.id = 'quality02FilterSettingsCard';
    card.className = 'card kashinoki-v449-filter-settings';
    card.innerHTML = `
      <h3>アンダーライン・チップ色</h3>
      <p class="muted">STEP 2 の分類チップ、アンダーライン色、線種、行番号表示を指定します。チップ文字色は背景色に応じて白 / 黒へ自動調整します。</p>
      <div class="kashinoki-v713-line-number-settings" aria-label="STEP 2会話本文の行番号表示設定">
        <span>行番号</span>
        <button type="button" class="workflow-brief-card" data-quality02-line-number-toggle="show">表示</button>
        <button type="button" class="workflow-brief-card" data-quality02-line-number-toggle="hide">非表示</button>
      </div>
      <div class="kashinoki-v452-color-settings">
        ${QUALITY02_CATEGORIES.map(key=>`<div class="kashinoki-v452-color-row kashinoki-v708-color-row"><span class="kashinoki-v452-color-sample" data-quality02-color-sample="${esc(key)}">${esc(key)}</span><input type="color" data-quality02-color-picker="${esc(key)}"><input type="text" maxlength="7" data-quality02-color-text="${esc(key)}"><span data-quality02-color-value="${esc(key)}"></span><select class="kashinoki-v708-line-style-select" data-quality02-line-style="${esc(key)}" aria-label="${esc(key)}の線種"><option value="solid">直線</option><option value="dotted">点線</option><option value="wavy">波線</option></select></div>`).join('')}
      </div>`;
    layout.appendChild(card);
    applyQuality02SettingsControls(readQuality02Settings());
  }

  function quality02ChipLabel(type){
    return String(type || '');
  }
  function quality02CategoryClass(type){
    const map = {'仕様':'spec','タスク':'task','引き継ぎ':'handoff','注意・禁止':'caution','デザイン':'design','課題':'issue','禁止失敗':'failure','自動化':'automation','AI回答改善':'answer','意図理解':'intent'};
    return 'is-quality02-' + (map[type] || 'caution');
  }
  function chipHTML(type, chipId){
    return `<button type="button" class="kashinoki-v444-class-chip kashinoki-v449-chip chip-${esc(type)} ${quality02CategoryClass(type)}" data-quality02-chip-id="${esc(chipId||'')}" data-quality02-chip-type="${esc(type)}" title="${esc(type)}">${esc(quality02ChipLabel(type))}</button>`;
  }
  function rangeLineClass(count){ return 'kashinoki-v449-range-lines-' + Math.max(1, Math.min(6, Number(count)||1)); }

  function quality02ChipColorForType(type){
    const map = {'仕様':'spec','タスク':'task','引き継ぎ':'handoff','注意・禁止':'caution','デザイン':'design','課題':'issue','禁止失敗':'failure','自動化':'automation','AI回答改善':'answer','意図理解':'intent'};
    const suffix = map[type] || 'caution';
    return `var(--quality02-${suffix}-color, rgba(42,58,54,.72))`;
  }
  function quality02LineStyleForType(type){
    const settings = readQuality02Settings();
    return validQuality02LineStyle(settings.lineStyles && settings.lineStyles[type], QUALITY02_DEFAULT_SETTINGS.lineStyles[type] || 'solid');
  }
  function quality02SegmentsOverlap(a, b){
    return a.left < b.right - 1 && b.left < a.right - 1;
  }
  function renderQuality02UnderlineLayer(article){
    if(!article) return;
    const p = article.querySelector('p');
    if(!p) return;
    article.querySelectorAll(':scope > .kashinoki-v482-underline-layer').forEach(el=>el.remove());
    p.querySelectorAll(':scope > .kashinoki-v482-underline-layer').forEach(el=>el.remove());
    const marks = Array.from(p.querySelectorAll('.kashinoki-v449-marked-range'));
    if(!marks.length){
      p.style.removeProperty('--quality02-layer-padding');
      article.style.removeProperty('--quality02-layer-padding');
      return;
    }
    const articleRect = article.getBoundingClientRect();
    if(!articleRect.width) return;
    // v485: getBoundingClientRect() returns viewport pixels after page scale/transform,
    // while absolutely positioned underline-layer expects local CSS pixels. Convert both
    // X/Y coordinates back to the article's local coordinate system to prevent drift.
    const scaleX = article.offsetWidth ? (articleRect.width / article.offsetWidth) : 1;
    const scaleY = article.offsetHeight ? (articleRect.height / article.offsetHeight) : 1;
    const toLocalX = (value)=> (value - articleRect.left) / (scaleX || 1);
    const toLocalY = (value)=> (value - articleRect.top) / (scaleY || 1);
    const layer = document.createElement('span');
    layer.className = 'kashinoki-v482-underline-layer';
    layer.setAttribute('aria-hidden','true');
    const segments = [];
    marks.forEach(mark=>{
      const ids = String(mark.getAttribute('data-quality02-chip-ids')||'').split(',').filter(Boolean);
      const activeIds = (article.closest('#portfolio-quality')?.__quality02ActiveChipIds || []).filter(Boolean);
      const chipEntries = ids.map(id=>({
        id,
        type: article.querySelector(`.kashinoki-v449-chip[data-quality02-chip-id="${CSS.escape(id)}"]`)?.getAttribute('data-quality02-chip-type') || '仕様'
      }));
      const entries = chipEntries.length ? chipEntries : [{id:'', type:'仕様'}];
      const rawRects = Array.from(mark.getClientRects()).filter(r=>r.width > 1 && r.height > 1);
      const lineRects = [];
      rawRects.sort((a,b)=>(a.top-b.top)||(a.left-b.left)).forEach(rect=>{
        const last = lineRects[lineRects.length - 1];
        if(last && Math.abs(last.top - rect.top) < 4 && rect.left - last.right <= 12){
          last.right = Math.max(last.right, rect.right);
          last.bottom = Math.max(last.bottom, rect.bottom);
          last.top = Math.min(last.top, rect.top);
        }else{
          lineRects.push({left:rect.left, right:rect.right, top:rect.top, bottom:rect.bottom});
        }
      });
      lineRects.forEach(rect=>{
        entries.forEach((entry, idx)=>{
          const dimmed = activeIds.length > 0 && entry.id && !activeIds.includes(entry.id);
          segments.push({
            left: toLocalX(rect.left),
            right: toLocalX(rect.right),
            top: toLocalY(rect.top),
            bottom: toLocalY(rect.bottom),
            color: dimmed ? 'rgba(92,112,108,.16)' : quality02ChipColorForType(entry.type),
            lineStyle: quality02LineStyleForType(entry.type),
            mark,
            idx,
            id: entry.id,
            type: entry.type
          });
        });
      });
    });
    const groups = [];
    segments.sort((a,b)=>(a.top-b.top)||(a.left-b.left)||(a.idx-b.idx));
    let maxLineBottom = 0;
    segments.forEach(seg=>{
      let group = groups.find(g=>Math.abs(g.top - seg.top) < 8);
      if(!group){ group = {top: seg.top, bottom: seg.bottom, tracks: []}; groups.push(group); }
      let trackIndex = 0;
      while(group.tracks[trackIndex] && group.tracks[trackIndex].some(existing=>quality02SegmentsOverlap(existing, seg))){ trackIndex += 1; }
      if(!group.tracks[trackIndex]) group.tracks[trackIndex] = [];
      group.tracks[trackIndex].push(seg);
      const line = document.createElement('span');
      line.className = `kashinoki-v482-underline-line is-quality02-line-style-${validQuality02LineStyle(seg.lineStyle, 'solid')}`;
      const lineTop = Math.round(seg.bottom - 1 + (trackIndex * 1.7));
      line.style.left = `${Math.round(Math.max(0, seg.left))}px`;
      line.style.top = `${lineTop}px`;
      line.style.width = `${Math.round(Math.max(2, seg.right - seg.left))}px`;
      line.style.setProperty('--quality02-underline-color', seg.color);
      line.setAttribute('data-quality02-line-style', validQuality02LineStyle(seg.lineStyle, 'solid'));
      layer.appendChild(line);
      maxLineBottom = Math.max(maxLineBottom, lineTop + 2.8);
    });
    const pRect = p.getBoundingClientRect();
    const pBottom = toLocalY(pRect.bottom);
    const needPadding = Math.max(7, Math.ceil(maxLineBottom - pBottom + 7));
    p.style.setProperty('--quality02-layer-padding', `${needPadding}px`);
    article.style.setProperty('--quality02-layer-padding', `${needPadding}px`);
    article.appendChild(layer);
  }
  function renderAllQuality02UnderlineLayers(root){
    (root || document).querySelectorAll('#portfolio-quality article.chat-bubble').forEach(renderQuality02UnderlineLayer);
  }

  /* v797: STEP2で手動追加した行右チップを、ページ遷移・STEP2再表示後も残す。
     install() は各ページ遷移時にSTEP2のHTMLを再生成するため、DOMだけに追加した手動チップは
     02へ戻った時点で消えていた。ここで手動チップだけをメモリへ退避し、再生成後に同じ行・同じ範囲へ復元する。 */
  const QUALITY02_MANUAL_STORE_NAME = '__kashinokiQuality02ManualChipsV796';
  const QUALITY02_MANUAL_STORE_STORAGE_KEY = 'kashinoki_quality02_manual_chips_v797';
  function readQuality02ManualStoreFromStorage(){
    try{
      const raw = window.localStorage && window.localStorage.getItem(QUALITY02_MANUAL_STORE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    }catch(e){ return []; }
  }
  function writeQuality02ManualStoreToStorage(records){
    try{
      if(window.localStorage) window.localStorage.setItem(QUALITY02_MANUAL_STORE_STORAGE_KEY, JSON.stringify(Array.isArray(records) ? records : []));
    }catch(e){}
  }
  function quality02ManualStore(){
    if(!Array.isArray(window[QUALITY02_MANUAL_STORE_NAME])) window[QUALITY02_MANUAL_STORE_NAME] = readQuality02ManualStoreFromStorage();
    return window[QUALITY02_MANUAL_STORE_NAME];
  }
  function quality02ManualRecordKey(record){
    return [record && record.messageIndex || '', record && record.articleOrdinal || '', record && record.line || '', record && record.type || '', normalizeSourceText(record && record.sourceText || record && record.text || '')].join('|');
  }
  function styleQuality02LineChip(chip, category){
    if(!chip) return;
    const cfg = readQuality02Settings();
    const chipColor = (cfg.colors && cfg.colors[category]) || QUALITY02_DEFAULT_SETTINGS.colors[category] || '#dfe7e4';
    chip.classList.add('is-quality02-line-chip', 'ck02-left-line-tag');
    chip.style.setProperty('--ck02-left-chip-color', chipColor);
    chip.style.setProperty('--ck02-left-chip-text', quality02TextColorFor(chipColor));
  }
  function collectQuality02ManualLineChips(root){
    root = root || document.getElementById('portfolio-quality');
    const list = root && root.querySelector('#captureQualityList');
    if(!root || !list) return [];
    const articles = Array.from(list.querySelectorAll('article.chat-bubble'));
    const records = [];
    articles.forEach((article, articleOrdinal)=>{
      const messageIndex = article.getAttribute('data-message-index') || '';
      Array.from(article.querySelectorAll('.ck02-left-line-tags .kashinoki-v449-chip.is-quality02-line-chip')).forEach((chip)=>{
        if(chip.classList.contains('kashinoki-v470-temp-chip')) return;
        const id = chip.getAttribute('data-quality02-chip-id') || '';
        const type = chip.getAttribute('data-quality02-chip-type') || chip.textContent.trim();
        if(!QUALITY02_CATEGORIES.includes(type)) return;
        const mark = id ? findQuality02MarkByChipId(root, id) : null;
        const sourceText = normalizeSourceText(mark?.textContent || chip.getAttribute('data-quality02-chip-text') || '');
        if(!sourceText) return;
        const line = chip.closest('.ck02-left-line');
        records.push({
          id,
          type,
          text: normalizeSourceText(chip.getAttribute('data-quality02-chip-text') || sourceText),
          sourceText,
          messageIndex,
          articleOrdinal,
          line: line ? (line.getAttribute('data-line') || '') : '',
          speaker: article.classList.contains('user') ? 'User' : 'ChatGPT'
        });
      });
    });
    return records;
  }
  function syncQuality02ManualStoreFromDom(root, options){
    const opts = options || {};
    const current = collectQuality02ManualLineChips(root);
    const store = quality02ManualStore();
    if(opts.replace){
      if(!current.length && store.length && !opts.allowEmpty){
        return store;
      }
      window[QUALITY02_MANUAL_STORE_NAME] = current;
      writeQuality02ManualStoreToStorage(current);
      return current;
    }
    if(!current.length) return store;
    const merged = [];
    const seen = new Set();
    store.concat(current).forEach(record=>{
      const key = record.id || quality02ManualRecordKey(record);
      if(seen.has(key)) return;
      seen.add(key);
      merged.push(record);
    });
    window[QUALITY02_MANUAL_STORE_NAME] = merged;
    writeQuality02ManualStoreToStorage(merged);
    return merged;
  }
  function findQuality02ArticleForManualRecord(root, record){
    const list = root && root.querySelector('#captureQualityList');
    if(!list || !record) return null;
    if(record.messageIndex){
      const found = list.querySelector(`article.chat-bubble[data-message-index="${CSS.escape(String(record.messageIndex))}"]`);
      if(found) return found;
    }
    const articles = Array.from(list.querySelectorAll('article.chat-bubble'));
    return articles[Number(record.articleOrdinal) || 0] || null;
  }
  function findQuality02TextRange(container, text){
    const target = normalizeSourceText(text);
    if(!container || !target) return null;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if(parent && parent.closest && parent.closest('.ck02-left-line-no, .ck02-left-line-tags, .kashinoki-v449-chip')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let combined = '';
    while(walker.nextNode()){
      const node = walker.currentNode;
      nodes.push({node, start: combined.length, end: combined.length + node.nodeValue.length});
      combined += node.nodeValue;
    }
    const normalizedCombined = normalizeSourceText(combined);
    let at = combined.indexOf(text);
    if(at < 0 && normalizedCombined.includes(target)){
      // 空白差分がある場合は、文字単位で厳密復元するとズレるため、近い本文ノード単位へ限定する。
      const hit = nodes.find(entry=>normalizeSourceText(entry.node.nodeValue).includes(target));
      if(hit){
        const local = normalizeSourceText(entryText(hit.node.nodeValue)).indexOf(target);
        const range = document.createRange();
        range.selectNodeContents(hit.node);
        return range;
      }
    }
    if(at < 0) return null;
    const startEntry = nodes.find(entry=>at >= entry.start && at <= entry.end);
    const endAt = at + text.length;
    const endEntry = nodes.find(entry=>endAt >= entry.start && endAt <= entry.end) || nodes[nodes.length-1];
    if(!startEntry || !endEntry) return null;
    const range = document.createRange();
    range.setStart(startEntry.node, Math.max(0, at - startEntry.start));
    range.setEnd(endEntry.node, Math.max(0, endAt - endEntry.start));
    return range;
  }
  function entryText(value){ return String(value || ''); }
  function quality02LineForManualRecord(article, record, range){
    if(!article) return null;
    if(record && record.line){
      const exact = article.querySelector(`.ck02-left-line[data-line="${CSS.escape(String(record.line))}"]`);
      if(exact) return exact;
    }
    const lines = Array.from(article.querySelectorAll('.ck02-left-line'));
    if(range){
      const hitLines = lines.filter(line=>{ try{ return range.intersectsNode(line); }catch(e){ return false; } });
      if(hitLines.length) return hitLines[hitLines.length - 1];
    }
    const source = normalizeSourceText(record && record.sourceText || '');
    return lines.find(line=>normalizeSourceText(line.textContent || '').includes(source)) || lines[lines.length - 1] || null;
  }
  function applyQuality02ManualStore(root){
    root = root || document.getElementById('portfolio-quality');
    const list = root && root.querySelector('#captureQualityList');
    if(!root || !list) return;
    const store = quality02ManualStore();
    if(!store.length) return;
    store.forEach(record=>{
      const article = findQuality02ArticleForManualRecord(root, record);
      if(!article) return;
      const type = QUALITY02_CATEGORIES.includes(record.type) ? record.type : '仕様';
      const sourceText = normalizeSourceText(record.sourceText || record.text || '');
      if(!sourceText) return;
      const duplicate = Array.from(article.querySelectorAll('.kashinoki-v449-chip')).some(chip=>{
        if(chip.classList.contains('kashinoki-v470-temp-chip')) return false;
        const chipType = chip.getAttribute('data-quality02-chip-type') || chip.textContent.trim();
        const chipText = normalizeSourceText(chip.getAttribute('data-quality02-chip-text') || '');
        return chipType === type && chipText === normalizeSourceText(record.text || sourceText);
      });
      if(duplicate) return;
      const p = article.querySelector('p');
      const lineCandidate = record.line ? article.querySelector(`.ck02-left-line[data-line="${CSS.escape(String(record.line))}"]`) : null;
      const range = findQuality02TextRange(lineCandidate || p, sourceText) || findQuality02TextRange(p, sourceText);
      const line = quality02LineForManualRecord(article, record, range);
      const host = ensureQuality02LineTempTagHost(line);
      if(!host || !range || !p) return;
      host.classList.remove('is-quality02-temp-line-tags');
      let chipId = record.id || `q02chip-${quality02ChipSeq++}`;
      if(root.querySelector(`.kashinoki-v449-chip[data-quality02-chip-id="${CSS.escape(chipId)}"]`)) chipId = `q02chip-${quality02ChipSeq++}`;
      host.insertAdjacentHTML('beforeend', chipHTML(type, chipId));
      const chip = host.querySelector(`.kashinoki-v449-chip[data-quality02-chip-id="${CSS.escape(chipId)}"]`);
      if(chip){
        chip.setAttribute('data-quality02-chip-text', normalizeSourceText(record.text || sourceText));
        styleQuality02LineChip(chip, type);
      }
      const current = {article, p, range, text: sourceText, sel: null};
      wrapQuality02SelectionWithMark(root, current, [chipId], normalizeSourceText(record.text || sourceText));
      refreshArticleChipState(article);
    });
    root.__quality02ManualStoreHydrated = true;
    updateQuality02SummaryCounts(root);
    applyReview02Filter(root, root.getAttribute('data-review02-current') || 'all');
  }

  function refreshArticleChipState(article){
    if(!article) return;
    const chips = Array.from(article.querySelectorAll('.kashinoki-v449-chip'));
    const classes = [...new Set(chips.map(c=>c.getAttribute('data-quality02-chip-type')).filter(Boolean))];
    article.setAttribute('data-review02-classes', classes.join(','));
    const fallbackClass = article.getAttribute('data-review02-class') || '';
    article.setAttribute('data-review02-class', classes[0] || (QUALITY02_CLASSES.includes(fallbackClass) ? fallbackClass : ''));
    const p = article.querySelector('p');
    const ranges = p ? Array.from(p.querySelectorAll('.kashinoki-v449-marked-range')) : [];
    ranges.forEach(r=>{
      const ids = String(r.getAttribute('data-quality02-chip-ids')||'').split(',').filter(Boolean);
      const chipTypes = ids.map(id=>article.querySelector(`.kashinoki-v449-chip[data-quality02-chip-id="${CSS.escape(id)}"]`)?.getAttribute('data-quality02-chip-type')).filter(Boolean);
      const lineTypes = (chipTypes.length ? chipTypes : ['仕様']);
      const uniqueTypes = [...new Set(lineTypes)];
      const firstType = uniqueTypes[0] || '仕様';
      const lineCount = Math.max(ids.length || 1, lineTypes.length || 1);
      r.className = `kashinoki-v449-marked-range ${rangeLineClass(lineCount)} ${quality02CategoryClass(firstType)}`;
      r.style.setProperty('--ck02-left-line-color', quality02ChipColorForType(firstType));
      r.style.setProperty('--ck02-left-line-style', quality02LineStyleForType(firstType));
      r.setAttribute('data-line-style', quality02LineStyleForType(firstType));
      r.classList.remove('is-line-style-solid','is-line-style-dotted','is-line-style-wavy');
      r.classList.add(`is-line-style-${quality02LineStyleForType(firstType)}`);
      for(let i=1;i<=6;i++) r.style.removeProperty(`--quality02-mark-line${i}`);
      for(let i=0;i<Math.min(6, lineCount);i++){
        const key = lineTypes[i] || lineTypes[lineTypes.length - 1] || firstType || '仕様';
        const suffixMap = {'仕様':'spec','タスク':'task','引き継ぎ':'handoff','注意・禁止':'caution','デザイン':'design','課題':'issue','禁止失敗':'failure','自動化':'automation','AI回答改善':'answer','意図理解':'intent'};
        const suffix = suffixMap[key] || 'caution';
        r.style.setProperty(`--quality02-mark-line${i+1}`, `var(--quality02-${suffix}-color, rgba(42,58,54,.72))`);
      }
    });
    chips.forEach(ch=>{
      const type = ch.getAttribute('data-quality02-chip-type') || '';
      ch.classList.remove(
        'is-quality02-spec','is-quality02-task','is-quality02-handoff','is-quality02-caution',
        'is-quality02-design','is-quality02-issue','is-quality02-failure','is-quality02-automation',
        'is-quality02-answer','is-quality02-intent'
      );
      ch.classList.add(quality02CategoryClass(type));
    });
    requestAnimationFrame(()=>renderQuality02UnderlineLayer(article));
  }
  function placeQuality02ChipRow(article, row){
    if(!article || !row) return;
    if(row.classList && row.classList.contains('is-quality02-temp-row')) return;
    const p = article.querySelector(':scope > p');
    if(p && p.nextSibling !== row){
      p.insertAdjacentElement('afterend', row);
    }else if(!p && row.parentElement !== article){
      article.appendChild(row);
    }else if(!p && row.parentElement === article && row.nextSibling && row.nextSibling.classList && row.nextSibling.classList.contains('kashinoki-v451-left-actions')){
      article.appendChild(row);
    }
  }
  function ensureArticleChipRow(article){
    if(!article) return null;
    let row = article.querySelector(':scope > .kashinoki-v449-chip-row');
    if(!row){
      row = document.createElement('div');
      row.className = 'kashinoki-v449-chip-row';
      const oldChips = Array.from(article.querySelectorAll(':scope > .kashinoki-v444-class-chip'));
      oldChips.forEach(c=>row.appendChild(c));
      article.appendChild(row);
    }
    placeQuality02ChipRow(article, row);
    return row;
  }
  function positionQuality02TempChipToSelection(root, article, row){
    if(!root || !article || !row) return;
    const current = root.__quality02Selection;
    const range = current && current.range;
    if(!range || !range.getClientRects) return;
    const rects = Array.from(range.getClientRects()).filter(r=>r && r.width >= 0 && r.height > 0);
    const rect = rects[rects.length - 1];
    if(!rect) return;
    const ar = article.getBoundingClientRect();
    row.classList.add('is-quality02-temp-row');
    row.style.position = 'absolute';
    row.style.margin = '0';
    row.style.zIndex = '70';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '0';
    row.style.pointerEvents = 'none';
    const rowW = Math.max(50, row.offsetWidth || 56);
    const left = Math.max(8, Math.min(rect.right - ar.left + 6, ar.width - rowW - 8));
    const top = Math.max(8, rect.top - ar.top + Math.max(0, (rect.height - 10) / 2));
    row.style.left = `${left}px`;
    row.style.top = `${top}px`;
  }
  function normalizeInitialArticleChip(article, type){
    const row = ensureArticleChipRow(article);
    const p = article.querySelector('p');
    if(!row || !p) return;
    const normalizedType = String(type || '').trim();
    if(article.getAttribute('data-quality02-none') === 'true' || !QUALITY02_CLASSES.includes(normalizedType)){
      row.innerHTML = '';
      article.setAttribute('data-review02-class', '');
      article.setAttribute('data-review02-classes', '');
      article.querySelectorAll('.kashinoki-v449-marked-range').forEach(mark => { mark.replaceWith(document.createTextNode(mark.textContent || '')); });
      refreshArticleChipState(article);
      return;
    }
    type = normalizedType;
    const rangesRaw = article.getAttribute('data-quality02-ranges') || '';
    if(rangesRaw && !p.querySelector('.kashinoki-v449-marked-range')){
      let ranges = [];
      try{ ranges = JSON.parse(rangesRaw); }catch(e){ ranges = []; }
      row.innerHTML = '';
      let htmlBody = p.innerHTML;
      ranges.forEach((range)=>{
        const fragment = String(range && range.text || '').trim();
        const rangeType = String(range && range.type || type || '仕様').trim();
        if(!fragment || !QUALITY02_CLASSES.includes(rangeType)) return;
        const escapedFragment = esc(fragment);
        if(!htmlBody.includes(escapedFragment)) return;
        const id = `q02chip-${quality02ChipSeq++}`;
        row.insertAdjacentHTML('beforeend', chipHTML(rangeType, id));
        const marker = `<span class="kashinoki-v449-marked-range kashinoki-v449-range-lines-1" data-quality02-chip-ids="${esc(id)}">${escapedFragment}</span>`;
        htmlBody = htmlBody.replace(escapedFragment, marker);
      });
      p.innerHTML = htmlBody;
      refreshArticleChipState(article);
      return;
    }
    let chip = row.querySelector('.kashinoki-v449-chip');
    if(!chip){
      const old = row.querySelector('.kashinoki-v444-class-chip');
      if(old){
        old.outerHTML = chipHTML(type, `q02chip-${quality02ChipSeq++}`);
      }else{
        row.insertAdjacentHTML('beforeend', chipHTML(type, `q02chip-${quality02ChipSeq++}`));
      }
    }else if(!chip.getAttribute('data-quality02-chip-id')) chip.setAttribute('data-quality02-chip-id', `q02chip-${quality02ChipSeq++}`);
    if(p && !p.querySelector('.kashinoki-v449-marked-range')){
      const id = row.querySelector('.kashinoki-v449-chip')?.getAttribute('data-quality02-chip-id') || `q02chip-${quality02ChipSeq++}`;
      const text = p.textContent;
      p.innerHTML = `<span class="kashinoki-v449-marked-range kashinoki-v449-range-lines-1" data-quality02-chip-ids="${esc(id)}">${esc(text)}</span>`;
    }
    refreshArticleChipState(article);
  }
  function renderQuality02EditorPanel(root){
    const layout = root.querySelector('.presentation-chat-layout');
    const extract = root.querySelector('.presentation-extract-card');
    const handoff = root.querySelector('.presentation-handoff-card');
    if(!layout || !extract) return;
    layout.classList.add('kashinoki-v449-editor-layout');
    if(handoff) handoff.remove();
    extract.classList.add('kashinoki-v449-editor-panel');
    extract.innerHTML = `
      <div class="presentation-card-heading">
        <span>STEP 2 / 分類編集</span>
        <h3>分類編集</h3>
        </div>
      <div class="kashinoki-v449-editor-status kashinoki-v488-editor-hidden" data-quality02-editor-status>未選択：左の会話内で必要な部分を選択してください。</div>
      <div class="kashinoki-v449-selected-source kashinoki-v488-editor-hidden" data-quality02-selected-source>選択範囲はまだありません。</div>
      <div class="kashinoki-v449-category-picks" data-quality02-category-picks>
        ${QUALITY02_CATEGORIES.map(c=>`<button type="button" class="kashinoki-v422-03plus-btn ${quality02CategoryClass(c)}" data-quality02-pick-category="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
      <div class="kashinoki-v492-inline-filter" aria-label="STEP 2 フィルター表示">
        <div class="kashinoki-v492-inline-filter-title"><b>分類以外の表示設定</b></div>
        <div class="kashinoki-v449-mode-row" role="group" aria-label="02フィルター表示方式">
          <button type="button" class="workflow-brief-card kashinoki-filter-button" data-quality02-filter-mode="hide">非表示</button>
          <button type="button" class="workflow-brief-card kashinoki-filter-button" data-quality02-filter-mode="dim">薄く表示</button>
        </div>
        <div class="setting-row kashinoki-v449-opacity-row"><label>薄く表示</label><input id="quality02DimOpacity" type="range" min="10" max="60" step="1"><span id="quality02DimOpacityValue">20%</span></div>
      </div>
      <label class="kashinoki-v449-editor-label kashinoki-v488-editor-hidden">チップ文面</label>
      <textarea class="kashinoki-v449-chip-text kashinoki-v488-editor-hidden" data-quality02-chip-text aria-hidden="true" tabindex="-1" placeholder="左で選択した文面、または次AIへ渡す短い文面を入れます。"></textarea>
      <div class="kashinoki-v454-editor-guide kashinoki-v488-editor-hidden" data-quality02-editor-guide>左の会話内に出る主操作ボタンで決定します。</div>
      <div class="kashinoki-v449-editor-actions kashinoki-v488-editor-hidden" data-quality02-editor-actions>
        <button type="button" class="workflow-secondary-link" data-quality02-delete-chip hidden>削除</button>
      </div>
      <div class="kashinoki-v449-linked-list kashinoki-v488-editor-hidden" data-quality02-linked-list><b>登録済みチップ</b><p>チップタグまたはアンダーラインを押すと編集できます。</p></div>
      <div class="kashinoki-v449-editor-footer kashinoki-v488-editor-hidden"><span data-quality02-dirty-count>分類編集 0件</span></div>
    `;
    applyQuality02CategoryPickButtonColors(root, readQuality02Settings());
  }
  function setQuality02Editor(root, mode, payload={}){
    const status = root.querySelector('[data-quality02-editor-status]');
    const source = root.querySelector('[data-quality02-selected-source]');
    const text = root.querySelector('[data-quality02-chip-text]');
    if(status) status.textContent = payload.status || (mode === 'range' ? '範囲選択中：分類を選び、追加できます。' : mode === 'chip' ? '登録済みチップを編集中です。' : '未選択：左の会話内で必要な部分を選択してください。');
    if(source) source.textContent = payload.source || '選択範囲はまだありません。';
    if(text && payload.text != null) text.value = payload.text;
    const picked = payload.categories || (payload.category ? [payload.category] : getQuality02PickedCategories(root));
    setQuality02PickedCategories(root, picked);
    root.setAttribute('data-quality02-editor-mode', mode || 'idle');
    const guide = root.querySelector('[data-quality02-editor-guide]');
    if(guide){
      if(mode === 'range') guide.textContent = '左の会話内の「この範囲を登録」で追加します。右側では分類と文面だけ整えます。';
      else if(mode === 'chip') guide.textContent = '左の会話内の「保存」で反映します。削除は保存の左にある🗑で行えます。';
      else guide.textContent = '左の会話内で範囲選択またはチップを押すと、必要な主操作だけが左に出ます。';
    }
    const del = root.querySelector('[data-quality02-delete-chip]');
    if(del) del.hidden = mode !== 'chip';
  }
  function setQuality02Dirty(root, delta=1){
    const n = Math.max(0, Number(root.getAttribute('data-quality02-dirty')||0) + delta);
    root.setAttribute('data-quality02-dirty', String(n));
    const el = root.querySelector('[data-quality02-dirty-count]');
    if(el) el.textContent = `分類編集 ${n}件`;
  }
  function clearQuality02LeftActions(root){
    (root || document).querySelectorAll('.kashinoki-v451-left-actions').forEach(el=>el.remove());
    (root || document).querySelectorAll('.is-quality02-actions-visible').forEach(el=>el.classList.remove('is-quality02-actions-visible'));
    (root || document).querySelectorAll('.is-quality02-selected').forEach(el=>el.classList.remove('is-quality02-selected'));
    (root || document).querySelectorAll('.is-quality02-chip-selected').forEach(el=>el.classList.remove('is-quality02-chip-selected'));
  }
  function resetQuality02EditState(root){
    if(!root) return;
    root.__quality02Selection = null;
    root.__quality02EditingChipId = null;
    root.__quality02SuppressMouseupUntil = Date.now() + 250;
    root.__quality02ActiveChipIds = [];
    clearQuality02LeftActions(root);
    root.querySelectorAll('.kashinoki-v449-chip, .kashinoki-v449-linked-chip, .kashinoki-v449-marked-range, article.chat-bubble').forEach(el=>{
      el.classList.remove('is-quality02-selected','is-quality02-chip-selected','is-quality02-chip-muted','is-quality02-active-mark');
      el.removeAttribute('aria-selected');
    });
    removeQuality02TempChips(root);
    if(window.getSelection){
      const sel = window.getSelection();
      if(sel) sel.removeAllRanges();
    }
  }
  function removeQuality02TempChips(root){
    if(!root) return;
    root.querySelectorAll('.kashinoki-v470-temp-chip').forEach(el=>el.remove());
    root.querySelectorAll('.kashinoki-v449-chip-row.is-quality02-temp-row').forEach(row=>{
      row.classList.remove('is-quality02-temp-row');
      row.style.removeProperty('position');
      row.style.removeProperty('left');
      row.style.removeProperty('top');
      row.style.removeProperty('z-index');
      row.style.removeProperty('display');
      row.style.removeProperty('align-items');
      row.style.removeProperty('gap');
      row.style.removeProperty('pointer-events');
      if(!row.children.length) row.remove();
    });
  }
  function quality02EndLineForSelection(current){
    if(!current || !current.article || !current.range) return null;
    const lines = Array.from(current.article.querySelectorAll('.ck02-left-line'));
    if(!lines.length) return null;
    const range = current.range;
    const hitLines = lines.filter(line=>{
      try{ return range.intersectsNode(line); }catch(e){ return false; }
    });
    if(hitLines.length) return hitLines[hitLines.length - 1];
    const endNode = range.endContainer && (range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement);
    return endNode?.closest?.('.ck02-left-line') || null;
  }
  function ensureQuality02LineTempTagHost(line){
    if(!line) return null;
    let host = line.querySelector(':scope > .ck02-left-line-tags');
    if(!host){
      host = document.createElement('span');
      host.className = 'ck02-left-line-tags is-quality02-temp-line-tags';
      line.appendChild(host);
    }
    return host;
  }
  function buildQuality02TempChip(category){
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'kashinoki-v444-class-chip kashinoki-v449-chip kashinoki-v470-temp-chip';
    chip.setAttribute('data-quality02-temp-chip','true');
    chip.setAttribute('aria-hidden','true');
    if(category && QUALITY02_CATEGORIES.includes(category)){
      chip.setAttribute('data-quality02-chip-type', category);
      chip.classList.add(quality02CategoryClass(category));
      chip.textContent = quality02ChipLabel(category);
      chip.title = category;
    }else{
      chip.setAttribute('data-quality02-chip-type','');
      chip.textContent = '';
      chip.title = '登録予定';
    }
    return chip;
  }
  function setQuality02TempChip(root, article, category){
    if(!root || !article) return;
    removeQuality02TempChips(root);
    const current = root.__quality02Selection;
    const endLine = article.classList.contains('ck02-left-message') ? quality02EndLineForSelection(current) : null;
    if(endLine){
      const host = ensureQuality02LineTempTagHost(endLine);
      const chip = buildQuality02TempChip(category);
      chip.classList.add('is-quality02-temp-line-chip');
      if(host) host.appendChild(chip);
      return;
    }
    const row = ensureArticleChipRow(article);
    if(!row) return;
    const chip = buildQuality02TempChip(category);
    row.classList.add('is-quality02-temp-row');
    row.appendChild(chip);
    requestAnimationFrame(()=>positionQuality02TempChipToSelection(root, article, row));
  }
  function updateQuality02TempChip(root, category){
    if(!root) return;
    root.querySelectorAll('.kashinoki-v470-temp-chip').forEach(chip=>{
      chip.classList.remove('is-quality02-spec','is-quality02-task','is-quality02-handoff','is-quality02-caution','is-quality02-design','is-quality02-issue','is-quality02-failure','is-quality02-automation','is-quality02-answer','is-quality02-intent');
      if(category && QUALITY02_CATEGORIES.includes(category)){
        chip.setAttribute('data-quality02-chip-type', category);
        chip.classList.add(quality02CategoryClass(category));
        chip.textContent = quality02ChipLabel(category);
        chip.title = category;
      }else{
        chip.setAttribute('data-quality02-chip-type','');
        chip.textContent = '';
        chip.title = '登録予定';
      }
    });
  }
  function quality02HeaderActionHost(root){
    if(!root) return null;
    return root.querySelector('#captureQualityList .ck02-left-reflection-card > .presentation-card-heading')
      || root.querySelector('#captureQualityList .presentation-chat-card > .presentation-card-heading')
      || root.querySelector('#captureQualityList .presentation-card-heading');
  }
  function positionQuality02FloatingActions(root, article, row){
    if(!root || !article || !row) return;
    const header = quality02HeaderActionHost(root);
    const host = header || article;
    if(row.parentElement !== host) host.appendChild(row);
    if(header) header.classList.add('is-quality02-action-host');
    row.classList.add('is-quality02-header-actions');
    row.style.visibility = 'visible';
    if(header){
      row.style.position = 'absolute';
      row.style.top = '50%';
      row.style.right = '8px';
      row.style.left = 'auto';
      row.style.transform = 'translateY(-50%)';
      row.style.zIndex = '120';
    }else{
      row.style.removeProperty('top');
      row.style.removeProperty('left');
      row.style.removeProperty('right');
      row.style.removeProperty('transform');
    }
  }
  function showQuality02LeftActions(root, article, mode){
    clearQuality02LeftActions(root);
    if(!article || !root) return;
    article.classList.add('is-quality02-selected');
    const row = document.createElement('div');
    row.className = 'kashinoki-v451-left-actions kashinoki-v590-panel-actions';
    if(mode === 'existing-disabled') row.innerHTML = '<button type="button" class="btn icon danger" data-quality02-left-action="delete" aria-label="削除">🗑</button><button type="button" class="btn primary is-disabled" data-quality02-left-action="save" disabled aria-disabled="true">保存</button><button type="button" class="btn secondary" data-quality02-left-action="cancel">取消</button>';
    else if(mode === 'existing') row.innerHTML = '<button type="button" class="btn icon danger" data-quality02-left-action="delete" aria-label="削除">🗑</button><button type="button" class="btn primary" data-quality02-left-action="save">保存</button><button type="button" class="btn secondary" data-quality02-left-action="cancel">取消</button>';
    else row.innerHTML = '<button type="button" class="btn primary" data-quality02-left-action="add">この範囲を登録</button><button type="button" class="btn secondary" data-quality02-left-action="cancel">取消</button>';
    article.classList.add('is-quality02-actions-visible');
    row.style.visibility = 'hidden';
    article.appendChild(row);
    const chipRow = article.querySelector(':scope > .kashinoki-v449-chip-row');
    if(chipRow) placeQuality02ChipRow(article, chipRow);
    requestAnimationFrame(()=>{
      positionQuality02FloatingActions(root, article, row);
      renderQuality02UnderlineLayer(article);
    });
  }
  function cancelQuality02Edit(root){
    if(!root) return;
    resetQuality02EditState(root);
    setQuality02Editor(root,'idle',{status:'未選択：左の会話内で必要な部分を選択してください。', source:'選択範囲はまだありません。', text:''});
  }
  function findQuality02MarkByChipId(root, id){
    if(!root || !id) return null;
    return Array.from(root.querySelectorAll('.kashinoki-v449-marked-range')).find(mark => String(mark.getAttribute('data-quality02-chip-ids')||'').split(',').includes(id));
  }
  function setQuality02ActiveMark(root, ids){
    if(!root) return;
    const list = Array.isArray(ids) ? ids.filter(Boolean) : [ids].filter(Boolean);
    root.__quality02ActiveChipIds = list.slice();
    root.querySelectorAll('.kashinoki-v449-marked-range').forEach(mark=>{
      const markIds = String(mark.getAttribute('data-quality02-chip-ids')||'').split(',').filter(Boolean);
      mark.classList.toggle('is-quality02-active-mark', list.length > 0 && list.some(id=>markIds.includes(id)));
    });
    requestAnimationFrame(()=>renderAllQuality02UnderlineLayers(root));
  }
  function ensureQuality02ChipId(ch){
    if(!ch) return '';
    let id = ch.getAttribute('data-quality02-chip-id') || '';
    if(!id){
      id = `q02chip-${quality02ChipSeq++}`;
      ch.setAttribute('data-quality02-chip-id', id);
    }
    return id;
  }
  function setQuality02ActiveChipState(root, ids){
    if(!root) return;
    const list = Array.isArray(ids) ? ids.filter(Boolean) : [ids].filter(Boolean);
    root.__quality02ActiveChipIds = list.slice();
    root.querySelectorAll('article.chat-bubble').forEach(article=>{
      // v793: registered chips may live beside the selected line. Do not limit lookup to the old lower chip row.
      const chips = Array.from(article.querySelectorAll('.kashinoki-v449-chip')).filter(ch=>!ch.classList.contains('kashinoki-v470-temp-chip'));
      chips.forEach(ensureQuality02ChipId);
      const hasTarget = chips.some(ch=>list.includes(ch.getAttribute('data-quality02-chip-id') || ''));
      article.classList.toggle('is-quality02-selected', hasTarget);
      chips.forEach(ch=>{
        const active = list.includes(ch.getAttribute('data-quality02-chip-id') || '');
        ch.classList.toggle('is-quality02-chip-selected', active);
        if(active){
          ch.classList.remove('is-quality02-chip-muted');
          ch.style.removeProperty('opacity');
          ch.style.removeProperty('filter');
        }else{
          ch.classList.toggle('is-quality02-chip-muted', hasTarget && !ch.classList.contains('kashinoki-v470-temp-chip'));
        }
      });
    });
    root.querySelectorAll('.kashinoki-v449-linked-chip').forEach(ch=>{
      const active = list.includes(ch.getAttribute('data-quality02-chip-id') || '');
      ch.classList.toggle('is-quality02-chip-selected', active);
      if(active){
        ch.classList.remove('is-quality02-chip-muted');
        ch.style.removeProperty('opacity');
        ch.style.removeProperty('filter');
      }else{
        ch.classList.toggle('is-quality02-chip-muted', list.length > 0);
      }
    });
  }
  function unwrapQuality02MarkKeepChildren(mark){
    if(!mark || !mark.parentNode) return;
    const parent = mark.parentNode;
    while(mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  }
  function unlinkQuality02ChipFromOldMark(root, id, oldMark, newMark){
    if(!root || !id || !oldMark || oldMark === newMark) return;
    const oldIds = String(oldMark.getAttribute('data-quality02-chip-ids')||'').split(',').filter(Boolean).filter(x=>x!==id);
    if(oldIds.length){
      oldMark.setAttribute('data-quality02-chip-ids', oldIds.join(','));
      refreshArticleChipState(oldMark.closest('article.chat-bubble'));
      return;
    }
    // 新しい選択範囲が旧アンダーライン内に作られた場合、旧spanごと消すと新しいspanも消えるため、子要素を残して外枠だけ外す。
    unwrapQuality02MarkKeepChildren(oldMark);
  }
  function moveQuality02ChipToSelection(root, id){
    const current = root && root.__quality02Selection;
    if(!root || !id || !current) return false;
    const oldMark = findQuality02MarkByChipId(root, id);
    const body = (root.querySelector('[data-quality02-chip-text]')?.value || current.text || '').trim();
    const newMark = wrapQuality02SelectionWithMark(root, current, [id], body);
    if(!newMark) return false;
    unlinkQuality02ChipFromOldMark(root, id, oldMark, newMark);
    if(current.sel) current.sel.removeAllRanges();
    if(current.article) refreshArticleChipState(current.article);
    const newArticle = newMark.closest('article.chat-bubble');
    if(newArticle && newArticle !== current.article) refreshArticleChipState(newArticle);
    return true;
  }
  function saveQuality02ChipEdit(root){
    const id = root && root.__quality02EditingChipId;
    if(!id) return;
    const chip = root.querySelector(`.kashinoki-v449-chip[data-quality02-chip-id="${CSS.escape(id)}"]`);
    const category = root.getAttribute('data-quality02-picked-category') || chip?.getAttribute('data-quality02-chip-type') || '仕様';
    const textEl = root.querySelector('[data-quality02-chip-text]');
    const body = (textEl?.value || '').trim();
    if(!chip || !body){ setQuality02Editor(root,'chip',{status:'保存できるチップと文面がありません。'}); return; }
    chip.setAttribute('data-quality02-chip-type', category);
    chip.setAttribute('title', category);
    chip.textContent = quality02ChipLabel(category);
    chip.setAttribute('data-quality02-chip-text', body);
    if(root.__quality02Selection) moveQuality02ChipToSelection(root, id);
    const mark = findQuality02MarkByChipId(root, id);
    if(mark) mark.setAttribute('data-quality02-chip-text', body);
    refreshArticleChipState(chip.closest('article.chat-bubble'));
    if(root.__quality02Selection && root.__quality02Selection.article) refreshArticleChipState(root.__quality02Selection.article);
    syncQuality02ManualStoreFromDom(root, {replace:true});
    resetQuality02EditState(root);
    setQuality02Dirty(root, 1);
    updateQuality02SummaryCounts(root);
    applyReview02Filter(root, root.getAttribute('data-review02-current') || 'all');
    setQuality02Editor(root,'idle',{status:'保存しました。選択状態を解除しました。', source:'選択範囲はまだありません。', text:''});
    setTimeout(()=>resetQuality02EditState(root), 0);
  }
  function deleteQuality02Chip(root){
    const id = root && root.__quality02EditingChipId;
    if(!id) return;
    const bridge = window.KashinoKiClassificationBridge02;
    if(bridge && typeof bridge.deleteAnnotation === 'function'){
      try{
        if(bridge.deleteAnnotation(id)){
          syncQuality02ManualStoreFromDom(root, {replace:true, allowEmpty:true});
          setQuality02Dirty(root, 1);
          updateQuality02SummaryCounts(root);
          applyReview02Filter(root, root.getAttribute('data-review02-current') || 'all');
          cancelQuality02Edit(root);
          setQuality02Editor(root,'idle',{status:'分類チップを削除しました。03候補とA〜F登録前候補からも除外されます。'});
          return;
        }
      }catch(e){ console.warn('[quality02] bridge annotation delete failed', e); }
    }
    const chip = root.querySelector(`.kashinoki-v449-chip[data-quality02-chip-id="${CSS.escape(id)}"]`);
    const article = chip && chip.closest('article.chat-bubble');
    const mark = findQuality02MarkByChipId(root, id);
    if(mark){
      const ids = String(mark.getAttribute('data-quality02-chip-ids')||'').split(',').filter(Boolean).filter(x=>x!==id);
      if(ids.length) mark.setAttribute('data-quality02-chip-ids', ids.join(','));
      else mark.replaceWith(document.createTextNode(mark.textContent));
    }
    if(chip) chip.remove();
    if(article) refreshArticleChipState(article);
    syncQuality02ManualStoreFromDom(root, {replace:true, allowEmpty:true});
    setQuality02Dirty(root, 1);
    updateQuality02SummaryCounts(root);
    applyReview02Filter(root, root.getAttribute('data-review02-current') || 'all');
    cancelQuality02Edit(root);
    setQuality02Editor(root,'idle',{status:'チップを削除しました。必要なら別の範囲を選択してください。'});
  }

  function getSelectedQuality02Range(root){
    const sel = window.getSelection ? window.getSelection() : null;
    if(!sel || sel.isCollapsed || !sel.toString().trim()) return null;
    const range = sel.getRangeAt(0);
    const article = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer.closest?.('article.chat-bubble') : range.commonAncestorContainer.parentElement?.closest('article.chat-bubble');
    if(!article || !root.contains(article)) return null;
    const p = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer.closest?.('p') : range.commonAncestorContainer.parentElement?.closest('p');
    if(!p || !article.contains(p)) return null;
    return {sel, range, article, p, text: sel.toString().trim()};
  }
  function hasActiveQuality02TextSelection(root){
    const sel = window.getSelection ? window.getSelection() : null;
    if(!sel || sel.isCollapsed || !sel.toString().trim()) return false;
    const node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
    return !!(node && root && root.contains(node));
  }
  function shouldIgnoreQuality02ChipClick(root){
    if(!root) return false;
    if(hasActiveQuality02TextSelection(root)) return true;
    return Date.now() - Number(root.__quality02LastTextSelectionAt || 0) < 260;
  }

  function getQuality02PickedCategories(root){
    if(!root) return ['仕様'];
    const single = root.getAttribute('data-quality02-picked-category');
    if(single && QUALITY02_CATEGORIES.includes(single)) return [single];
    const raw = String(root.getAttribute('data-quality02-picked-categories') || '').split(',').map(v=>v.trim()).filter(Boolean);
    const firstValid = raw.find(v=>QUALITY02_CATEGORIES.includes(v));
    return firstValid ? [firstValid] : ['仕様'];
  }
  function setQuality02PickedCategories(root, categories){
    if(!root) return;
    const first = (categories || []).find(v=>QUALITY02_CATEGORIES.includes(v)) || '仕様';
    root.setAttribute('data-quality02-picked-categories', first);
    root.setAttribute('data-quality02-picked-category', first);
    applyQuality02CategoryPickButtonColors(root, readQuality02Settings());
    root.querySelectorAll('[data-quality02-pick-category]').forEach(btn=>{
      const active = btn.getAttribute('data-quality02-pick-category') === first;
      btn.classList.toggle('is-selected', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function createQuality02MarkedSpan(chipIds, sourceText, body){
    const span = document.createElement('span');
    span.className = `kashinoki-v449-marked-range ${rangeLineClass(chipIds.length)}`;
    span.setAttribute('data-quality02-chip-ids', chipIds.join(','));
    span.setAttribute('data-quality02-source-text', sourceText || '');
    span.setAttribute('data-quality02-chip-text', body || sourceText || '');
    return span;
  }
  function appendQuality02ChipIdsToMark(mark, chipIds){
    if(!mark) return null;
    const ids = String(mark.getAttribute('data-quality02-chip-ids')||'').split(',').filter(Boolean);
    chipIds.forEach(id=>{ if(id && !ids.includes(id)) ids.push(id); });
    mark.setAttribute('data-quality02-chip-ids', ids.join(','));
    mark.classList.remove('kashinoki-v449-range-lines-1','kashinoki-v449-range-lines-2','kashinoki-v449-range-lines-3','kashinoki-v449-range-lines-4','kashinoki-v449-range-lines-5','kashinoki-v449-range-lines-6');
    mark.classList.add(rangeLineClass(ids.length));
    const article = mark.closest ? mark.closest('article.chat-bubble') : null;
    if(article) refreshArticleChipState(article);
    return mark;
  }
  function wrapQuality02SelectionWithMark(root, current, chipIds, body){
    if(!current || !current.range) return null;
    const base = current.range.commonAncestorContainer.nodeType === 1 ? current.range.commonAncestorContainer : current.range.commonAncestorContainer.parentElement;
    const parentMark = base && base.closest ? base.closest('.kashinoki-v449-marked-range') : null;
    const selectedText = String(current.text || '').trim();
    if(parentMark){
      const parentText = String(parentMark.textContent || '').trim();
      const parentSelection = selectedText && parentText && selectedText === parentText;
      if(parentSelection){
        const merged = appendQuality02ChipIdsToMark(parentMark, chipIds);
        refreshArticleChipState(current.article);
        if(current.sel) current.sel.removeAllRanges();
        return merged;
      }
    }
    const exactExisting = current.p && selectedText
      ? Array.from(current.p.querySelectorAll('.kashinoki-v449-marked-range')).find(mark => String(mark.textContent || '').trim() === selectedText)
      : null;
    if(exactExisting){
      const merged = appendQuality02ChipIdsToMark(exactExisting, chipIds);
      refreshArticleChipState(current.article);
      if(current.sel) current.sel.removeAllRanges();
      return merged;
    }
    const span = createQuality02MarkedSpan(chipIds, current.text, body);
    try{
      current.range.surroundContents(span);
      if(current.sel) current.sel.removeAllRanges();
      return span;
    }catch(e){
      if(parentMark && parentMark.contains(base)){
        const selected = current.text || '';
        const full = parentMark.textContent || '';
        const at = selected ? full.indexOf(selected) : -1;
        if(at >= 0){
          if(selected.trim() === full.trim()) {
            const merged = appendQuality02ChipIdsToMark(parentMark, chipIds);
            if(current.sel) current.sel.removeAllRanges();
            return merged;
          }
          const before = full.slice(0, at);
          const after = full.slice(at + selected.length);
          const inner = createQuality02MarkedSpan(chipIds, selected, body);
          parentMark.textContent = '';
          if(before) parentMark.appendChild(document.createTextNode(before));
          inner.appendChild(document.createTextNode(selected));
          parentMark.appendChild(inner);
          if(after) parentMark.appendChild(document.createTextNode(after));
          if(current.sel) current.sel.removeAllRanges();
          return inner;
        }
      }
      const existing = current.p && current.p.querySelector('.kashinoki-v449-marked-range');
      if(existing){
        return appendQuality02ChipIdsToMark(existing, chipIds);
      }
    }
    return null;
  }
  function addQuality02ChipFromSelection(root){
    const current = root.__quality02Selection;
    const textEl = root.querySelector('[data-quality02-chip-text]');
    const categories = getQuality02PickedCategories(root);
    const body = (textEl?.value || current?.text || '').trim();
    if(!current || !body) { setQuality02Editor(root,'idle',{status:'追加できる選択範囲と文面がありません。'}); return; }

    /* v798: 02の分類済み会話では、手動チップをDOMへ後付けしない。
       JSON分類済みと同じ classification-bridge-02 の annotations[] へ正式登録し、
       02再描画・03件数・A〜F登録を同一データ経路へ統一する。 */
    if(current.article && current.article.classList.contains('ck02-left-message') && window.KashinoKiClassificationBridge02 && typeof window.KashinoKiClassificationBridge02.addManualAnnotation === 'function'){
      const line = quality02EndLineForSelection(current);
      const hitLines = Array.from(current.article.querySelectorAll('.ck02-left-line')).filter(candidate=>{
        try{ return current.range && current.range.intersectsNode(candidate); }catch(e){ return false; }
      });
      const firstLine = hitLines[0] || line;
      const lastLine = hitLines[hitLines.length - 1] || line;
      const messageIndex = Number(current.article.getAttribute('data-message-index'));
      const lineNumber = Number(line && line.getAttribute('data-line'));
      const startLineNumber = Number(firstLine && firstLine.getAttribute('data-line'));
      const endLineNumber = Number(lastLine && lastLine.getAttribute('data-line'));
      if(Number.isFinite(messageIndex) && Number.isFinite(lineNumber)){
        removeQuality02TempChips(root);
        const records = window.KashinoKiClassificationBridge02.addManualAnnotation({
          messageIndex,
          line: lineNumber,
          startLine: Number.isFinite(startLineNumber) ? startLineNumber : lineNumber,
          endLine: Number.isFinite(endLineNumber) ? endLineNumber : lineNumber,
          qualityTypes: categories,
          selectedText: body,
          reason: body,
          role: current.article.classList.contains('assistant') ? 'assistant' : 'user'
        }) || [];
        setQuality02Dirty(root, records.length || categories.length);
        try{ window.KashinoKiClassificationBridge02.refreshQualityCounts({animate:false}); }catch(e){}
        applyReview02Filter(root, root.getAttribute('data-review02-current') || 'all');
        root.__quality02Selection = null;
        try{ if(window.getSelection) window.getSelection().removeAllRanges(); }catch(e){}
        clearQuality02LeftActions(root);
        setQuality02Editor(root,'idle',{status:'チップを追加しました。必要なら別の範囲を選択してください。', source:'追加済み：'+categories.join(' / '), text:''});
        return;
      }
    }

    removeQuality02TempChips(root);
    const chipIds = [];
    const lineHost = current.article && current.article.classList.contains('ck02-left-message')
      ? ensureQuality02LineTempTagHost(quality02EndLineForSelection(current))
      : null;
    const row = lineHost ? null : ensureArticleChipRow(current.article);
    const chipHost = lineHost || row;
    if(!chipHost) { setQuality02Editor(root,'idle',{status:'チップを追加する位置を取得できませんでした。'}); return; }
    chipHost.classList.remove('is-quality02-temp-line-tags');
    categories.forEach(category=>{
      const chipId = `q02chip-${quality02ChipSeq++}`;
      chipHost.insertAdjacentHTML('beforeend', chipHTML(category, chipId));
      const newChip = chipHost.querySelector(`.kashinoki-v449-chip[data-quality02-chip-id="${CSS.escape(chipId)}"]`);
      if(newChip){
        newChip.setAttribute('data-quality02-chip-text', body);
        if(lineHost){
          styleQuality02LineChip(newChip, category);
        }
      }
      chipIds.push(chipId);
    });
    wrapQuality02SelectionWithMark(root, current, chipIds, body);
    if(row) placeQuality02ChipRow(current.article, row);
    refreshArticleChipState(current.article);
    syncQuality02ManualStoreFromDom(root, {replace:true});
    setQuality02Dirty(root, chipIds.length);
    updateQuality02SummaryCounts(root);
    applyReview02Filter(root, root.getAttribute('data-review02-current') || 'all');
    root.__quality02Selection = null;
    clearQuality02LeftActions(root);
    setQuality02Editor(root,'idle',{status:'チップを追加しました。必要なら別の範囲を選択してください。', source:'追加済み：'+categories.join(' / '), text:''});
  }
  function updateQuality02LinkedList(root, article){
    const list = root.querySelector('[data-quality02-linked-list]');
    if(!list) return;
    const chips = article ? Array.from(article.querySelectorAll('.kashinoki-v449-chip')).map(ch=>{ const type=ch.getAttribute('data-quality02-chip-type') || ch.textContent.trim(); return `<button type="button" class="kashinoki-v449-linked-chip ${quality02CategoryClass(type)}" data-quality02-chip-id="${esc(ch.getAttribute('data-quality02-chip-id'))}">${esc(type)}</button>`; }).join('') : '';
    list.innerHTML = `<b>登録済みチップ</b>${chips ? `<div>${chips}</div>` : '<p>チップタグまたはアンダーラインを押すと編集できます。</p>'}`;
  }

  const QUALITY02_CLASSES = [];
  const QUALITY02_LABELS = [
    ['会話全体','all'],
    ['タスク','タスク'],
    ['仕様','仕様'],
    ['引き継ぎ','引き継ぎ'],
    ['注意・禁止','注意・禁止'],
    ['デザイン','デザイン'],
    ['課題','課題'],
    ['禁止失敗','禁止失敗'],
    ['自動化','自動化'],
    ['AI回答改善','AI回答改善'],
    ['意図理解','意図理解']
  ];
  function quality02SummaryCountsFromDom(list){
    const articles = Array.from(list.querySelectorAll('article.chat-bubble'));
    const counts = QUALITY02_LABELS.reduce((acc, [, filter]) => { acc[filter] = 0; return acc; }, {});
    counts.all = articles.length;
    articles.forEach(article => {
      Array.from(article.querySelectorAll('.kashinoki-v449-chip')).forEach(chip => {
        const type = chip.getAttribute('data-quality02-chip-type') || chip.textContent.trim();
        if(type && Object.prototype.hasOwnProperty.call(counts, type)) counts[type] += 1;
      });
    });
    return counts;
  }
  function updateQuality02SummaryCounts(root){
    root = root || document.getElementById('portfolio-quality');
    const summary = document.getElementById('captureQualitySummary');
    const list = document.getElementById('captureQualityList');
    if(!root || !summary || !list) return;

    /* v731: classification-bridge-02 が10分類カウントを管理している間、
       旧4分類/旧DOM集計側は #captureQualitySummary を一切更新しない。
       カウントDOM・数値・アニメーションの責任箇所を classification-bridge-02.js に一本化する。 */
    const bridgeOwned = summary.getAttribute('data-quality02-summary-owner') === 'classification-bridge-02';
    if(bridgeOwned) return;
    const counts = quality02SummaryCountsFromDom(list);

    QUALITY02_LABELS.forEach(([, filter]) => {
      const value = summary.querySelector(`[data-review02-filter="${CSS.escape(filter)}"] b`);
      if(value){
        const finalValue = String(counts[filter] || 0);
        value.setAttribute('data-quality-final', finalValue);
        const page = document.getElementById('portfolio-quality');
        const shouldShowFinal = bridgeOwned || !!(page && (page.classList.contains('guide-show-all') || page.classList.contains('jv02-complete')));
        if(!value.classList.contains('is-quality-counting')) value.textContent = shouldShowFinal ? finalValue : '0';
      }
    });
  }
  function installQuality02Filter(){
    const root = document.getElementById('portfolio-quality');
    const summary = document.getElementById('captureQualitySummary');
    const list = document.getElementById('captureQualityList');
    if(!root || !summary || !list) return;
    const articles = Array.from(list.querySelectorAll('article.chat-bubble'));
    if(!articles.length) return;
    renderQuality02EditorPanel(root);
    articles.forEach((article, index) => {
      const type = article.getAttribute('data-review02-class') || QUALITY02_CLASSES[index] || '仕様';
      if(article.getAttribute('data-quality02-none') === 'true'){
        article.setAttribute('data-review02-class', '');
        normalizeInitialArticleChip(article, type);
      }else{
        article.setAttribute('data-review02-class', type);
        normalizeInitialArticleChip(article, type);
      }
    });
    if (typeof window.afterFilterRender === "function" && document.getElementById('portfolio-quality')?.classList.contains('active')) {
      window.afterFilterRender();
    }
    /* v731: classification-bridge-02 管理中は、旧フィルター処理は
       会話カードの初期整形だけを行い、上部カウントDOMには触れない。
       ここでDOM再生成すると分類カウントアニメーションを潰すため早期returnする。 */
    const bridgeOwned = summary.getAttribute('data-quality02-summary-owner') === 'classification-bridge-02';
    if(bridgeOwned){
      applyReview02Filter(root, root.getAttribute('data-review02-current') || 'all');
      return;
    }
    const counts = quality02SummaryCountsFromDom(list);
    summary.querySelectorAll('.quality02-filter-spacer').forEach(el => el.remove());
    const existing = Array.from(summary.children).filter(el => !el.classList.contains('quality02-filter-spacer')).slice(0, QUALITY02_LABELS.length);
    QUALITY02_LABELS.forEach(([label, filter], index) => {
      let button = existing[index];
      if(!button){
        button = document.createElement('div');
        summary.appendChild(button);
      }
      button.className = `workflow-brief-card kashinoki-filter-button${index === 0 ? ' is-active is-selected' : ''}`;
      button.setAttribute('role','button');
      button.setAttribute('tabindex','0');
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.setAttribute('data-review02-filter', filter);
      const finalValue = String(counts[filter] || 0);
      /* v730: classification-bridge-02 owns these counters after JSON annotations
         are applied. Do not rebuild the <b> text as 0 here, because this legacy
         install function runs again on STEP2 re-entry / return replay and was
         wiping the bridge count animation immediately after it started. */
      if(bridgeOwned){
        let labelEl = button.querySelector('span');
        let valueEl = button.querySelector('b');
        if(!labelEl || !valueEl){
          button.innerHTML = `<span>${esc(label)}</span><b data-quality-final="${esc(finalValue)}">${esc(finalValue)}</b>`;
          valueEl = button.querySelector('b');
        }else{
          labelEl.textContent = label;
          valueEl.setAttribute('data-quality-final', finalValue);
          /* Preserve current text while .is-quality-counting is active.
             If no animation is active, keep the current bridge value visible. */
          if(!valueEl.classList.contains('is-quality-counting')){
            valueEl.textContent = finalValue;
          }
        }
      }else{
        button.innerHTML = `<span>${esc(label)}</span><b data-quality-final="${esc(finalValue)}">0</b>`;
      }
    });
    const columns = 5;
    const remainder = QUALITY02_LABELS.length % columns;
    const spacerCount = remainder ? columns - remainder : 0;
    for(let i=0;i<spacerCount;i++){
      const spacer = document.createElement('div');
      spacer.className = 'quality02-filter-spacer';
      spacer.setAttribute('aria-hidden','true');
      summary.appendChild(spacer);
    }
    let note = root.querySelector('[data-review02-filter-note]');
    const heading = list.querySelector('.presentation-card-heading');
    if(heading && !note){
      heading.insertAdjacentHTML('beforeend', '<p class="kashinoki-v446-filter-note" data-review02-filter-note>会話全体を表示しています。</p>');
    }
    applyReview02Filter(root, root.getAttribute('data-review02-current') || 'all');
  }
  function applyReview02Filter(root, filter){
    const label = filter === 'all' ? '会話全体' : filter;
    root.setAttribute('data-review02-current', filter);
    root.querySelectorAll('[data-review02-filter]').forEach(btn => {
      const active = btn.getAttribute('data-review02-filter') === filter;
      btn.classList.toggle('is-selected', active);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const settings = readQuality02Settings();
    root.style.setProperty('--quality02-dim-opacity', String(settings.opacity / 100));
    root.querySelectorAll('[data-review02-class]').forEach(item => {
      const classes = String(item.getAttribute('data-review02-classes') || item.getAttribute('data-review02-class') || '').split(',').filter(Boolean);
      const match = filter === 'all' || classes.includes(filter);
      item.hidden = false;
      item.style.display = '';
      item.classList.toggle('is-quality02-filtered-out', !match && filter !== 'all');
      item.classList.toggle('is-quality02-edit-disabled', !match && filter !== 'all' && settings.mode === 'dim');
      if(!match && filter !== 'all' && settings.mode === 'hide'){ item.hidden = true; item.style.display = 'none'; }
    });
    const note = root.querySelector('[data-review02-filter-note]');
    if(note) note.textContent = filter === 'all' ? '会話全体を表示しています。' : `${label}に該当する会話素材を表示しています。非該当は表示設定に従います。`;
    requestAnimationFrame(()=>renderAllQuality02UnderlineLayers(root));
  }

  function refreshKashinoKiArtifacts(){
    /* v749: 登録前は空、STEP3登録後は登録payloadを再読込するため、
       artifact editor session cacheを毎回破棄する。 */
    artifactEditorSessionState = null;
    Object.keys(artifacts).forEach(id=>{ const el=document.getElementById(id); if(el) el.innerHTML = renderArtifact(artifacts[id]); });
  }
  window.refreshKashinoKiArtifacts = refreshKashinoKiArtifacts;

  function install(){
    syncQuality02ManualStoreFromDom(document.getElementById('portfolio-quality'));
    Object.keys(pages).forEach(id=>{ const el=document.getElementById(id); if(!el) return; if(id === 'portfolio-review'){ if(typeof window.renderCaptureCandidates === 'function') window.renderCaptureCandidates(); return; } el.innerHTML = renderWorkflow(pages[id]); });
    refreshKashinoKiArtifacts();
    installQuality02DisplaySettings();
    installQuality02Filter();
    const q02root = document.getElementById('portfolio-quality');
    if(q02root){
      applyQuality02ManualStore(q02root);
      applyQuality02ColorStyles(q02root, readQuality02Settings());
    }
    applyQuality02SettingsControls(readQuality02Settings());
    const vt=document.getElementById('versionText'); if(vt) vt.textContent = VERSION;
  }

  /* Public demo: the text-selection classification popover was removed.
     Keep normal browser text selection, but do not open A-F / chip assignment UI. */
  window.addEventListener('kashinoki03:registered-artifacts', refreshKashinoKiArtifacts);
  window.addEventListener('kashinoki02:annotation-deleted', refreshKashinoKiArtifacts);
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('load', install);
  window.addEventListener('resize', ()=>renderAllQuality02UnderlineLayers(document.getElementById('portfolio-quality')));
  setTimeout(install,0); setTimeout(install,200); setTimeout(install,700);
  const prev = window.page;
  if(typeof prev === 'function' && !prev.__kashinoki03plusWrapped){
    const wrapped = function(){ const r=prev.apply(this, arguments); setTimeout(install,0); setTimeout(install,120); return r; };
    wrapped.__kashinoki03plusWrapped = true;
    window.page = wrapped;
  }
  function updateArtifactSelection(root, candidateId){
    if(!root) return;
    const pageId = root.closest('.page') ? root.closest('.page').id : '';
    const cfg = artifacts[pageId];
    if(!cfg) return;
    const item = (cfg.candidates || []).find(c => c.id === candidateId) || (cfg.candidates || [])[0];
    if(!item) return;
    root.querySelectorAll('[data-artifact-pick]').forEach(btn=>{
      const active = btn.getAttribute('data-artifact-pick') === item.id;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const selected = root.querySelector('[data-artifact-selected]');
    if(selected){
      selected.innerHTML = `<span class="artifact-v508-category">${esc(item.cat)}</span><b>${esc(item.text)}</b><small>${esc(item.source)}</small><p>${esc(item.detail)}</p>`;
    }
  }
  function updateArtifactOutput(root, label){
    if(!root) return;
    root.querySelectorAll('[data-artifact-output]').forEach(btn=>{
      const active = btn.getAttribute('data-artifact-output') === label;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const box = root.querySelector('[data-artifact-output-box] label');
    if(box) box.textContent = label;
  }

  function artifactSelectionInsideEditor(root, editor){
    const sel = window.getSelection ? window.getSelection() : null;
    if(!root || !editor || !sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if(!editor.contains(range.commonAncestorContainer)) return null;
    return {sel, range, text: sel.toString().trim()};
  }
  function hideArtifactSelectionPopover(root){ return; }
  function showArtifactSelectionPopover(root){ return; }
  function applyArtifactSelectionMark(root, editor, type, status){
    const hit = artifactSelectionInsideEditor(root, editor);
    if(!hit || !hit.text){ if(status) status.textContent = '分類を付ける範囲を選択してください。'; return; }
    const chipId = `artifact-chip-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const span = document.createElement('span');
    span.className = `artifact-v572-mark artifact-v572-mark-${String(type).toLowerCase()}`;
    span.setAttribute('data-artifact-chip-id', chipId);
    span.setAttribute('data-artifact-chip-type', type);
    span.title = `${type}：${hit.text}`;
    try{
      hit.range.surroundContents(span);
    }catch(e){
      span.textContent = hit.text;
      hit.range.deleteContents();
      hit.range.insertNode(span);
    }
    artifactAddChipTag(root, type, hit.text);
    if(hit.sel) hit.sel.removeAllRanges();
    hideArtifactSelectionPopover(root);
    if(status) status.textContent = `選択範囲へ ${type} のアンダーラインとチップタグを付けました。`;
  }
  document.addEventListener('change', function(ev){
    const select = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-row-category]') : null;
    if(!select) return;
    const root = select.closest('.artifact-v571');
    const row = select.closest('[data-artifact-editor-row-tags]');
    if(root && row){
      const pageId = root.getAttribute('data-artifact-page') || '';
      const rowId = row.getAttribute('data-artifact-row-id') || '';
      const nextCat = select.value || '分類';
      applyArtifactCategorySelectStyle(select, nextCat);
      const control = select.closest('.artifact-v673-category-color-control');
      if(control){
        control.style.setProperty('--artifact-category-color', artifactCategoryColorFor(nextCat));
        control.style.setProperty('--artifact-category-text', artifactCategoryTextFor(nextCat));
      }
      const result = moveArtifactCandidateBetweenPages(pageId, rowId, nextCat);
      if(result.moved || result.updated){
        refreshKashinoKiArtifacts();
        const currentRoot = document.querySelector(`.artifact-v571[data-artifact-page="${CSS.escape(pageId)}"]`);
        const status = currentRoot && currentRoot.querySelector('[data-artifact-status]');
        const label = result.moved ? `${nextCat}へ変更し、該当する蓄積先へ移動しました。` : `分類タグを ${nextCat} に変更しました。`;
        if(status) status.textContent = label;
      }else{
        artifactRowSetCategory(row, nextCat);
        refreshArtifactEditorFilterTags(root);
        updateArtifactEditorFilters(root);
        const status = root.querySelector('[data-artifact-status]');
        if(status) status.textContent = `分類タグを ${nextCat} に変更しました。`;
      }
    }
  });
  document.addEventListener('click', function(ev){
    const navPage = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-page-nav]') : null;
    if(navPage){ ev.preventDefault(); if(typeof window.page === 'function') window.page(navPage.getAttribute('data-artifact-page-nav')); return; }
    const copyBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-editor-copy]') : null;
    if(copyBtn){
      ev.preventDefault();
      const root = copyBtn.closest('.artifact-v571');
      const editor = root && root.querySelector('[data-artifact-editor]');
      const status = root && root.querySelector('[data-artifact-status]');
      if(editor && navigator.clipboard){ navigator.clipboard.writeText(artifactPlainText(editor)).then(()=>{ if(status) status.textContent='エディター内容をコピーしました。'; }).catch(()=>{ if(status) status.textContent='コピーできませんでした。'; }); }
      return;
    }
    const filterToggleBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-filter-toggle]') : null;
    if(filterToggleBtn){
      ev.preventDefault();
      const filter = filterToggleBtn.closest('[data-artifact-editor-filter]');
      if(filter){
        const collapsed = filter.classList.toggle('is-collapsed');
        filterToggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        const arrow = filterToggleBtn.querySelector('[data-artifact-filter-arrow]');
        if(arrow) arrow.textContent = collapsed ? '▶' : '▼';
      }
      return;
    }
    const filterTagBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-filter-tag]') : null;
    if(filterTagBtn){
      ev.preventDefault();
      const root = filterTagBtn.closest('.artifact-v571');
      const tag = filterTagBtn.getAttribute('data-artifact-filter-tag') || '';
      if(root && tag){
        filterTagBtn.classList.toggle('is-muted');
        updateArtifactEditorFilters(root);
      }
      return;
    }
    const filterClearBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-filter-clear]') : null;
    if(filterClearBtn){
      ev.preventDefault();
      const root = filterClearBtn.closest('.artifact-v571');
      if(root){
        root.querySelectorAll('[data-artifact-filter-tag].is-muted').forEach(btn=>btn.classList.remove('is-muted'));
        root.classList.remove('is-artifact-tags-hidden');
        root.classList.remove('is-artifact-project-tags-hidden');
        root.classList.remove('is-artifact-category-switch-hidden');
        updateArtifactEditorFilters(root);
      }
      return;
    }
    const tagToggleBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-tags-toggle]') : null;
    if(tagToggleBtn){
      ev.preventDefault();
      const root = tagToggleBtn.closest('.artifact-v571');
      if(root){
        root.classList.toggle('is-artifact-tags-hidden');
        updateArtifactFilterControls(root);
      }
      return;
    }
    const categorySwitchToggleBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-category-switch-toggle]') : null;
    if(categorySwitchToggleBtn){
      ev.preventDefault();
      const root = categorySwitchToggleBtn.closest('.artifact-v571');
      if(root){
        root.classList.toggle('is-artifact-category-switch-hidden');
        updateArtifactFilterControls(root);
      }
      return;
    }
    const projectTagsToggleBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-project-tags-toggle]') : null;
    if(projectTagsToggleBtn){
      ev.preventDefault();
      const root = projectTagsToggleBtn.closest('.artifact-v571');
      if(root){
        root.classList.toggle('is-artifact-project-tags-hidden');
        updateArtifactFilterControls(root);
      }
      return;
    }
    const demoExportBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-demo-export]') : null;
    if(demoExportBtn){
      ev.preventDefault();
      const root = demoExportBtn.closest('.artifact-v571');
      const preview = root && root.querySelector('[data-artifact-use-preview]');
      const status = root && root.querySelector('[data-artifact-status]');
      const inline = root && root.querySelector('[data-artifact-demo-export-inline]');
      if(root){
        resetArtifactTypewriter(root);
        root.classList.remove('is-export-preview-open','is-export-cta-reveal','is-export-preview-note','is-export-preview-card1','is-export-preview-card2','is-export-preview-card3','is-export-preview-card4','is-export-preview-bottom');
        root.classList.add('is-demo-export-blocked');
      }
      if(preview) preview.hidden = true;
      if(inline){
        inline.hidden = false;
        inline.textContent = 'デモ版のため、ファイル書き出しは行いません。';
      }
      /* v791: 表示はボタン左の1行だけ。下部ステータスは書き換えない。 */
      return;
    }
    const exportBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-editor-export]') : null;
    if(exportBtn){
      ev.preventDefault();
      const root = exportBtn.closest('.artifact-v571');
      const editor = root && root.querySelector('[data-artifact-editor]');
      const page = root && root.getAttribute('data-artifact-page') || 'artifact';
      const status = root && root.querySelector('[data-artifact-status]');
      if(editor){
        const blob = new Blob([artifactPlainText(editor)], {type:'text/plain;charset=utf-8'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${page}_fragments.txt`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(()=>URL.revokeObjectURL(a.href), 500);
        if(status) status.textContent='エディター内容を書き出しました。';
      }
      return;
    }
    const loadBtn = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-editor-load]') : null;
    if(loadBtn){
      ev.preventDefault();
      const root = loadBtn.closest('.artifact-v571');
      const editor = root && root.querySelector('[data-artifact-editor]');
      const status = root && root.querySelector('[data-artifact-status]');
      if(editor){
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.txt,.md,text/plain';
        input.addEventListener('change', ()=>{
          const file = input.files && input.files[0];
          if(!file) return;
          file.text().then(text=>{ editor.innerHTML = artifactEditorHTML(text); const rail = root.querySelector('[data-artifact-chip-rail]'); if(rail) rail.innerHTML=''; if(status) status.textContent='ファイル内容を読み込みました。'; });
        });
        input.click();
      }
      return;
    }
    const artifactPick = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-pick]') : null;
    if(artifactPick){ ev.preventDefault(); updateArtifactSelection(artifactPick.closest('.artifact-v508'), artifactPick.getAttribute('data-artifact-pick')); return; }
    const artifactOutput = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-output]') : null;
    if(artifactOutput){ ev.preventDefault(); updateArtifactOutput(artifactOutput.closest('.artifact-v508'), artifactOutput.getAttribute('data-artifact-output')); return; }
    const artifactAction = ev.target && ev.target.closest ? ev.target.closest('[data-artifact-action]') : null;
    if(artifactAction){ const root = artifactAction.closest('.artifact-v508'); const status = root && root.querySelector('[data-artifact-status]'); if(status) status.textContent = artifactAction.textContent.trim() + ' を反映しました。'; }
    const quality02Btn = ev.target && ev.target.closest ? ev.target.closest('[data-review02-filter]') : null;
    if(quality02Btn){
      const root = quality02Btn.closest('#portfolio-quality');
      if(root){ ev.preventDefault(); applyReview02Filter(root, quality02Btn.getAttribute('data-review02-filter') || 'all'); return; }
    }
    const keyBtn = ev.target && ev.target.closest ? ev.target.closest('[data-review02-filter]') : null;
    if(keyBtn && (ev.type === 'keydown') && (ev.key === 'Enter' || ev.key === ' ')){
      const root = keyBtn.closest('#portfolio-quality');
      if(root){ ev.preventDefault(); applyReview02Filter(root, keyBtn.getAttribute('data-review02-filter') || 'all'); return; }
    }
    const qMode = ev.target && ev.target.closest ? ev.target.closest('[data-quality02-filter-mode]') : null;
    if(qMode){ ev.preventDefault(); saveQuality02Settings({mode:qMode.getAttribute('data-quality02-filter-mode')}); return; }
    const qPick = ev.target && ev.target.closest ? ev.target.closest('[data-quality02-pick-category]') : null;
    if(qPick){
      const root=qPick.closest('#portfolio-quality');
      if(root){
        ev.preventDefault();
        const category = qPick.getAttribute('data-quality02-pick-category') || '仕様';
        setQuality02PickedCategories(root, [category]);
        updateQuality02TempChip(root, category);
        return;
      }
    }
    const qAdd = ev.target && ev.target.closest ? ev.target.closest('[data-quality02-add-chip]') : null;
    if(qAdd){ const root=qAdd.closest('#portfolio-quality'); if(root){ ev.preventDefault(); addQuality02ChipFromSelection(root); return; } }
    const qSave = ev.target && ev.target.closest ? ev.target.closest('[data-quality02-save-chip]') : null;
    if(qSave){ const root=qSave.closest('#portfolio-quality'); if(root){ ev.preventDefault(); saveQuality02ChipEdit(root); return; } }
    const qDelete = ev.target && ev.target.closest ? ev.target.closest('[data-quality02-delete-chip]') : null;
    if(qDelete){ const root=qDelete.closest('#portfolio-quality'); if(root){ ev.preventDefault(); deleteQuality02Chip(root); return; } }
    const qCancel = ev.target && ev.target.closest ? ev.target.closest('[data-quality02-cancel]') : null;
    if(qCancel){ const root=qCancel.closest('#portfolio-quality'); if(root){ ev.preventDefault(); cancelQuality02Edit(root); return; } }
    const qLeft = ev.target && ev.target.closest ? ev.target.closest('[data-quality02-left-action]') : null;
    if(qLeft){
      const root=qLeft.closest('#portfolio-quality');
      if(root){
        ev.preventDefault();
        if(qLeft.disabled || qLeft.getAttribute('aria-disabled') === 'true') return;
        const action=qLeft.getAttribute('data-quality02-left-action');
        if(action==='add') addQuality02ChipFromSelection(root);
        else if(action==='save') saveQuality02ChipEdit(root);
        else if(action==='delete') deleteQuality02Chip(root);
        else cancelQuality02Edit(root);
        return;
      }
    }
    const qApply = ev.target && ev.target.closest ? ev.target.closest('[data-quality02-apply]') : null;
    if(qApply){ const root=qApply.closest('#portfolio-quality'); if(root){ ev.preventDefault(); return; } }
    const qChip = ev.target && ev.target.closest ? ev.target.closest('.kashinoki-v449-chip, .kashinoki-v449-linked-chip') : null;
    if(qChip){ const root=qChip.closest('#portfolio-quality'); if(root){ if(shouldIgnoreQuality02ChipClick(root)) return; ev.preventDefault(); removeQuality02TempChips(root); let id=qChip.getAttribute('data-quality02-chip-id') || ''; if(!id && qChip.classList.contains('kashinoki-v449-chip')) id = ensureQuality02ChipId(qChip); const chip = root.querySelector(`.kashinoki-v449-chip[data-quality02-chip-id="${CSS.escape(id||'')}"]`); if(!id || !chip) return; const article=qChip.closest('article.chat-bubble') || chip.closest('article.chat-bubble'); const type=chip?.getAttribute('data-quality02-chip-type') || '仕様'; root.__quality02EditingChipId = id; root.setAttribute('data-quality02-picked-category', type); setQuality02ActiveChipState(root, id); setQuality02ActiveMark(root, id); setQuality02Editor(root,'chip',{category:type, source:`登録済みチップ：${type}。保存するには左の本文範囲を選択してください。`, text: chip?.getAttribute('data-quality02-chip-text') || findQuality02MarkByChipId(root,id)?.textContent.trim() || ''}); if(article){ updateQuality02LinkedList(root, article); showQuality02LeftActions(root, article, 'existing-disabled'); } return; } }
    const qMark = ev.target && ev.target.closest ? ev.target.closest('.kashinoki-v449-marked-range') : null;
    if(qMark){ const root=qMark.closest('#portfolio-quality'); const article=qMark.closest('article.chat-bubble'); if(root){ if(shouldIgnoreQuality02ChipClick(root)) return; ev.preventDefault(); removeQuality02TempChips(root); const ids=String(qMark.getAttribute('data-quality02-chip-ids')||'').split(',').filter(Boolean); root.__quality02EditingChipId = ids[0] || null; setQuality02ActiveChipState(root, ids); setQuality02ActiveMark(root, ids); const cats=ids.map(id=>root.querySelector(`.kashinoki-v449-chip[data-quality02-chip-id="${CSS.escape(id)}"]`)?.getAttribute('data-quality02-chip-type')).filter(Boolean); setQuality02Editor(root,'chip',{categories:cats, source:'登録済み範囲を選択中：右側で文面・分類を整え、左の保存で反映します。', text:qMark.getAttribute('data-quality02-chip-text') || qMark.textContent.trim()}); updateQuality02LinkedList(root, article); showQuality02LeftActions(root, article, 'existing'); return; } }
    const btn = ev.target && ev.target.closest ? ev.target.closest('[data-page-next]') : null;
    if(!btn) return;
    const target = btn.getAttribute('data-page-next');
    if(target && typeof window.page === 'function'){ ev.preventDefault(); window.page(target); }
  }, true);
  document.addEventListener('input', function(ev){
    if(ev.target && ev.target.id === 'quality02DimOpacity'){ saveQuality02Settings({opacity: ev.target.value}); }
    const colorPicker = ev.target && ev.target.matches ? ev.target.matches('[data-quality02-color-picker]') : false;
    const colorText = ev.target && ev.target.matches ? ev.target.matches('[data-quality02-color-text]') : false;
    const lineStyleSelect = ev.target && ev.target.matches ? ev.target.matches('[data-quality02-line-style]') : false;
    if(colorPicker || colorText){
      const key = ev.target.getAttribute(colorPicker ? 'data-quality02-color-picker' : 'data-quality02-color-text');
      const color = validQuality02Hex(ev.target.value, readQuality02Settings().colors[key] || QUALITY02_DEFAULT_SETTINGS.colors[key]);
      if(colorText && ev.target.value.length < 7) return;
      saveQuality02Settings({colors:{[key]: color}});
    }
    if(lineStyleSelect){
      const key = ev.target.getAttribute('data-quality02-line-style');
      const style = validQuality02LineStyle(ev.target.value, readQuality02Settings().lineStyles?.[key] || QUALITY02_DEFAULT_SETTINGS.lineStyles[key]);
      saveQuality02Settings({lineStyles:{[key]: style}});
    }
  }, true);

  document.addEventListener('change', function(ev){
    const lineStyleSelect = ev.target && ev.target.matches ? ev.target.matches('[data-quality02-line-style]') : false;
    if(lineStyleSelect){
      const key = ev.target.getAttribute('data-quality02-line-style');
      const style = validQuality02LineStyle(ev.target.value, readQuality02Settings().lineStyles?.[key] || QUALITY02_DEFAULT_SETTINGS.lineStyles[key]);
      saveQuality02Settings({lineStyles:{[key]: style}});
    }
  }, true);
  document.addEventListener('click', function(ev){
    const btn = ev.target && ev.target.closest ? ev.target.closest('[data-quality02-line-number-toggle]') : null;
    if(!btn) return;
    ev.preventDefault();
    saveQuality02Settings({ showLineNumbers: btn.getAttribute('data-quality02-line-number-toggle') === 'show' });
  }, true);
  function isQuality02ControlTarget(target){
    return !!(target && target.closest && target.closest('[data-quality02-left-action], [data-quality02-pick-category], [data-quality02-delete-chip], [data-quality02-chip-text], .kashinoki-v449-editor-panel, .kashinoki-v451-left-actions, button, input, textarea, select'));
  }
  document.addEventListener('mouseup', function(ev){
    const root = document.getElementById('portfolio-quality');
    if(!root || !root.classList.contains('active')) return;
    if(isQuality02ControlTarget(ev.target)) return;
    if(Number(root.__quality02SuppressMouseupUntil || 0) > Date.now()) return;
    const hit = getSelectedQuality02Range(root);
    if(!hit || hit.article.classList.contains('is-quality02-edit-disabled')) return;
    root.__quality02Selection = hit;
    root.__quality02LastTextSelectionAt = Date.now();
    const role = hit.article.classList.contains('user') ? 'User' : 'ChatGPT';
    if(root.__quality02EditingChipId){
      removeQuality02TempChips(root);
      setQuality02Editor(root,'chip',{status:'保存可能：選択した範囲へ変更できます。', source:`${role}発言から再選択：${hit.text}`, text: (root.querySelector('[data-quality02-chip-text]')?.value || hit.text), category: root.getAttribute('data-quality02-picked-category') || '仕様'});
      updateQuality02LinkedList(root, hit.article);
      showQuality02LeftActions(root, hit.article, 'existing');
    }else{
      setQuality02ActiveMark(root, []); setQuality02Editor(root,'range',{status:'範囲選択中：右側で分類を選ぶと上の仮チップに反映されます。左のボタンで登録します。', source:`${role}発言から選択：${hit.text}`, text: hit.text, category: root.getAttribute('data-quality02-picked-category') || '仕様'});
      setQuality02TempChip(root, hit.article, null);
      updateQuality02LinkedList(root, hit.article);
      showQuality02LeftActions(root, hit.article, 'new');
    }
  }, true);
})();
