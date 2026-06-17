(() => {
  'use strict';

  const QUALITY02_SETTINGS_KEY = 'kashinoki_quality02_filter_settings_v1';
  const QUALITY02_DEFAULT_COLORS = {
    '仕様': '#001beb',
    'タスク': '#b67c2b',
    '引き継ぎ': '#dd1374',
    '注意・禁止': '#ef9cad',
    'デザイン': '#8f61d8',
    '課題': '#e46b2d',
    '禁止失敗': '#2f3542',
    '自動化': '#11a579',
    'AI回答改善': '#2d7dd2',
    '意図理解': '#6b5bd6'
  };
  const QUALITY02_DEFAULT_LINE_STYLES = {
    '仕様':'solid',
    'タスク':'solid',
    '引き継ぎ':'solid',
    '注意・禁止':'wavy',
    'デザイン':'solid',
    '課題':'dotted',
    '禁止失敗':'wavy',
    '自動化':'solid',
    'AI回答改善':'dotted',
    '意図理解':'solid'
  };
  const QUALITY02_TYPES = Object.keys(QUALITY02_DEFAULT_COLORS);

  // ChatGPT分類カテゴリは内部論理、表示色は既存の「表示設定3 / アンダーライン・チップ色」に寄せる。
  const CATEGORY_META = {
    next_action: { label: '次作業', qualityType: 'タスク', group: 'next' },
    user_intent: { label: 'ユーザー意図', qualityType: '意図理解', group: 'intent' },
    user_approval: { label: 'ユーザー承認', qualityType: '意図理解', group: 'confirmed' },
    hold_verify: { label: '保留・要確認', qualityType: '課題', group: 'hold' },
    must_not: { label: '禁止・本番不可', qualityType: '注意・禁止', group: 'danger' },
    ai_suggestion: { label: 'AI提案', qualityType: 'AI回答改善', group: 'candidate' },
    adopted_spec_candidate: { label: '採用候補', qualityType: '仕様', group: 'candidate' },
    adopted_spec: { label: '採用仕様', qualityType: '仕様', group: 'confirmed' },
    design_rule: { label: 'デザイン条件', qualityType: 'デザイン', group: 'design' },
    final_spec_structure: { label: '最終仕様構成', qualityType: '仕様', group: 'confirmed' },
    verification_gate: { label: '確認基準', qualityType: '課題', group: 'hold' },
    handoff_prompt: { label: '次AI用プロンプト', qualityType: '引き継ぎ', group: 'confirmed' }
  };

  const DISPLAY_GROUPS = {
    confirmed: { label: '採用・確定' },
    candidate: { label: '候補・提案' },
    hold: { label: '要確認・保留' },
    danger: { label: '禁止・本番不可' },
    design: { label: 'デザイン条件' },
    next: { label: '次作業' },
    intent: { label: 'ユーザー意図' },
    other: { label: 'その他' }
  };

  const state = {
    conversation: null,
    lineMessages: [],
    annotations: []
  };

  const QUALITY02_MANUAL_ANNOTATIONS_KEY = 'kashinoki_quality02_manual_annotations_v798';
  const QUALITY02_DELETED_ANNOTATIONS_KEY = 'kashinoki_quality02_deleted_annotations_v800';
  const QUALITY02_MANUAL_CATEGORY_BY_TYPE = {
    '仕様':'adopted_spec',
    'タスク':'next_action',
    '引き継ぎ':'handoff_prompt',
    '注意・禁止':'must_not',
    'デザイン':'design_rule',
    '課題':'hold_verify',
    '禁止失敗':'must_not',
    '自動化':'next_action',
    'AI回答改善':'ai_suggestion',
    '意図理解':'user_intent'
  };

  /* v814: 開発用の3ターンサンプル会話・小型サンプル分類JSONは、本番動線から削除。
     STEP1で明示的に使う星空科学館分類サンプルだけを残す。 */

  /* v817: 残すデモ分類データは通常処理から隔離する。
     サンプル本体は window.KashinoKiDemoSamples.starryMuseumClassification に置き、
     STEP1→02の明示遷移で発行した短命permitがある時だけ参照する。 */
  const STARRY_SAMPLE_PERMIT_TTL_MS = 15000;
  function emptyClassificationSample(){
    return { classificationVersion:'0.1-empty', sourceMode:'line_based_annotation', annotations:[] };
  }
  function conversationKeyForPermit(raw){
    const conv = raw || {};
    const messages = Array.isArray(conv.messages) ? conv.messages : [];
    const title = conv.source?.title || conv.capture?.title || conv.title || '';
    const file = conv.sourceFile || conv.filename || conv.fileName || conv.source?.filename || '';
    const first = messages[0]?.text || '';
    return [file, title, messages.length, first.slice(0, 80)].join('|').toLowerCase();
  }
  function activeConversationKeyForPermit(){
    return conversationKeyForPermit(state.conversation || resolveExternalConversationJson() || {});
  }
  function issueStarrySamplePermit(reason){
    window.__KASHINOKI_DEMO_SAMPLE_PERMIT = {
      sample: 'starry-museum-classification',
      reason: reason || 'step1-explicit-enter-step2',
      issuedAt: Date.now(),
      conversationKey: activeConversationKeyForPermit()
    };
  }
  function readStarrySamplePermit(){
    const permit = window.__KASHINOKI_DEMO_SAMPLE_PERMIT;
    if(!permit || permit.sample !== 'starry-museum-classification') return null;
    if(Date.now() - Number(permit.issuedAt || 0) > STARRY_SAMPLE_PERMIT_TTL_MS) return null;
    if(permit.conversationKey !== activeConversationKeyForPermit()) return null;
    return permit;
  }
  function restoreStarrySamplePermit(previous){
    if(previous) window.__KASHINOKI_DEMO_SAMPLE_PERMIT = previous;
    else { try{ delete window.__KASHINOKI_DEMO_SAMPLE_PERMIT; }catch(e){ window.__KASHINOKI_DEMO_SAMPLE_PERMIT = null; } }
  }
  function getStarryMuseumClassificationSample(){
    if(!readStarrySamplePermit()) return emptyClassificationSample();
    const sample = window.KashinoKiDemoSamples && window.KashinoKiDemoSamples.starryMuseumClassification;
    if(sample && Array.isArray(sample.annotations)) return sample;
    return emptyClassificationSample();
  }

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const escapeHtml = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const padLine = (n) => String(n).padStart(3, '0');
  function restoreBoxDrawingLineBreaks(text){
    let value = String(text ?? '').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
    // ChatGPT抽出時に、Plain text/code block内の罫線アートが1行へ連結される場合がある。
    // 既存の改行は保持しつつ、罫線行だけを表示用に復元する。
    if(!/[┌┐└┘│]/.test(value)) return value;
    value = value
      .replace(/([┌└][─━\-]{6,}[┐┘])(?=│|┌|└|[^\n]*│)/g, '$1\n')
      .replace(/([┐┘])(?=│)/g, '$1\n')
      .replace(/([│])(?=│\s*[^\n])/g, '$1\n')
      .replace(/([│])(?=┌|└)/g, '$1\n')
      .replace(/([┘])(?=\s*│)/g, '$1\n')
      .replace(/([│])(?=\s*駅から|\s*来館前に|\s*\[アクセス方法)/g, '$1\n')
      .replace(/\n{3,}/g, '\n\n');
    return value;
  }
  const splitLines = (text) => restoreBoxDrawingLineBreaks(text).split('\n');
  const validHex = (value, fallback) => /^#[0-9a-fA-F]{6}$/.test(String(value || '').trim()) ? String(value).toLowerCase() : fallback;

  function textColorFor(hex){
    const v = validHex(hex, '#ffffff').slice(1);
    const r = parseInt(v.slice(0,2),16), g = parseInt(v.slice(2,4),16), b = parseInt(v.slice(4,6),16);
    return ((r * 299 + g * 587 + b * 114) / 1000) >= 150 ? '#1f2a27' : '#ffffff';
  }
  function readQualitySettings(){
    try{
      const raw = JSON.parse(localStorage.getItem(QUALITY02_SETTINGS_KEY) || '{}');
      const colors = { ...QUALITY02_DEFAULT_COLORS };
      Object.keys(colors).forEach(key => { colors[key] = validHex(raw.colors && raw.colors[key], colors[key]); });
      const lineStyles = { ...QUALITY02_DEFAULT_LINE_STYLES };
      Object.keys(lineStyles).forEach(key => { lineStyles[key] = validLineStyle(raw.lineStyles && raw.lineStyles[key], lineStyles[key]); });
      const showLineNumbers = raw.showLineNumbers !== false;
      return { colors, lineStyles, showLineNumbers };
    }catch(e){ return { colors:{ ...QUALITY02_DEFAULT_COLORS }, lineStyles:{ ...QUALITY02_DEFAULT_LINE_STYLES }, showLineNumbers:true }; }
  }
  function readQualityColors(){ return readQualitySettings().colors; }
  function readQualityLineStyles(){ return readQualitySettings().lineStyles; }
  function showQualityLineNumbers(){ return readQualitySettings().showLineNumbers !== false; }
  function validLineStyle(value, fallback){
    const v = String(value || '').trim();
    return ['solid','dotted','wavy'].includes(v) ? v : (fallback || 'solid');
  }
  function applyQualityColorVars(root){
    if(!root) return;
    const colors = readQualityColors();
    QUALITY02_TYPES.forEach((type, i)=>{
      root.style.setProperty(`--ck02-type-${i+1}`, colors[type]);
      root.style.setProperty(`--ck02-type-${i+1}-text`, textColorFor(colors[type]));
    });
    Object.entries(colors).forEach(([type, color])=>{
      const key = typeToKey(type);
      root.style.setProperty(`--ck02-${key}-color`, color);
      root.style.setProperty(`--ck02-${key}-text`, textColorFor(color));
    });
  }
  function typeToKey(type){
    return String(type || 'unknown').replace(/[^\p{L}\p{N}_-]/gu, '_').replace(/_+/g,'_');
  }
  function cssEscape(value){
    if(window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value));
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
  function isQuality02Type(type){ return QUALITY02_TYPES.includes(String(type || '')); }
  function metaFor(category){ return CATEGORY_META[category] || { label: category || '分類', qualityType: '', group: 'other' }; }
  function displayGroupOf(category){ return metaFor(category).group || 'other'; }
  function safeQualityType(value, category){
    const direct = String(value || '').trim();
    if(isQuality02Type(direct)) return direct;
    const mapped = String(metaFor(category).qualityType || '').trim();
    return isQuality02Type(mapped) ? mapped : '';
  }
  function lineQualityTypes(messageIndex, line){
    const list = annotationsForLine(messageIndex, line)
      .map(a => safeQualityType(a.qualityType, a.category))
      .filter(isQuality02Type);
    return Array.from(new Set(list));
  }
  function lineStyleForQualityType(type){
    return validLineStyle(readQualityLineStyles()[type], QUALITY02_DEFAULT_LINE_STYLES[type] || 'solid');
  }
  function annotationsForLine(messageIndex, line){
    return state.annotations.filter((a)=>Number(a.messageIndex)===Number(messageIndex) && Number(a.startLine)<=line && Number(a.endLine)>=line);
  }
  /* v801: 複数行を1回のドラッグで登録したannotationは、アンダーラインは範囲全行へ出すが、
     行右チップは1分類につき1個だけ表示する。削除・03登録・A〜F登録はannotation id単位のまま維持する。 */
  function lineChipAnnotations(messageIndex, line){
    return annotationsForLine(messageIndex, line).filter((a)=>{
      const endLine = Number.isFinite(Number(a.endLine)) ? Number(a.endLine) : Number(a.startLine);
      return Number(endLine) === Number(line);
    });
  }

  function normalizeConversation(raw){
    if(!raw || !Array.isArray(raw.messages)) throw new Error('messages[] を含む会話JSONを読み込んでください。');
    return {
      schemaVersion: raw.schemaVersion || 1,
      exportType: raw.exportType || 'simple_conversation_export',
      source: raw.source || {},
      capture: raw.capture || {},
      sourceFile: raw.sourceFile || raw.filename || raw.fileName || raw.source?.filename || '',
      messages: raw.messages.map((m,i)=>({
        index: Number.isFinite(Number(m.index)) ? Number(m.index) : i+1,
        role:m.role||'unknown',
        text:String(m.text ?? '')
      }))
    };
  }
  function buildLineMessages(conversation){
    return conversation.messages.map((m)=>({
      messageIndex:m.index,
      role:m.role,
      lines: splitLines(m.text).map((text,i)=>({ line:i+1, text }))
    }));
  }
  function normalizeAnnotation(a, i){
    const meta = metaFor(a.category);
    return {
      id:a.id || `ann_${String(i+1).padStart(4,'0')}`,
      messageIndex:Number(a.messageIndex),
      role:a.role || '',
      startLine:Number(a.startLine),
      endLine:Number(a.endLine ?? a.startLine),
      category:a.category || 'unknown',
      label:a.label || meta.label,
      reason:a.reason || '',
      displayGroup:a.displayGroup || meta.group || displayGroupOf(a.category),
      qualityType: safeQualityType(a.qualityType || a.reviewType, a.category),
      source:a.source || '',
      selectedText:a.selectedText || a.text || '',
      conversationSignature:a.conversationSignature || '',
      createdAt:a.createdAt || '',
      deletedAt:a.deletedAt || '',
      editorStatus:a.editorStatus || 'active',
      sourceAnnotationId:a.sourceAnnotationId || a.id || ''
    };
  }

  function conversationSignature(){
    if(!state.conversation) return '';
    const title = String(state.conversation.source?.title || '');
    const file = String(state.conversation.sourceFile || '');
    const count = Number(state.conversation.messages?.length || 0);
    return `${title}|${file}|${count}`;
  }
  function readManualAnnotations(){
    try{
      const raw = localStorage.getItem(QUALITY02_MANUAL_ANNOTATIONS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    }catch(e){ return []; }
  }
  function writeManualAnnotations(records){
    try{ localStorage.setItem(QUALITY02_MANUAL_ANNOTATIONS_KEY, JSON.stringify(Array.isArray(records) ? records : [])); }catch(e){}
  }
  function manualAnnotationsForCurrentConversation(){
    const sig = conversationSignature();
    if(!sig) return [];
    return readManualAnnotations().filter(a => a && a.conversationSignature === sig);
  }
  function readDeletedAnnotationRecords(){
    try{
      const raw = localStorage.getItem(QUALITY02_DELETED_ANNOTATIONS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    }catch(e){ return []; }
  }
  function writeDeletedAnnotationRecords(records){
    try{ localStorage.setItem(QUALITY02_DELETED_ANNOTATIONS_KEY, JSON.stringify(Array.isArray(records) ? records : [])); }catch(e){}
  }
  function deletedAnnotationIdsForCurrentConversation(){
    const sig = conversationSignature();
    if(!sig) return new Set();
    return new Set(readDeletedAnnotationRecords().filter(r => r && r.conversationSignature === sig && r.id).map(r => String(r.id)));
  }
  function markAnnotationDeleted(id, ann){
    const value = String(id || '').trim();
    if(!value) return;
    const sig = conversationSignature();
    const records = readDeletedAnnotationRecords();
    const next = records.filter(r => !(r && r.id === value && r.conversationSignature === sig));
    next.push({ id:value, conversationSignature:sig, deletedAt:new Date().toISOString(), source:ann && ann.source || 'json', qualityType:ann && ann.qualityType || '', selectedText:ann && ann.selectedText || '' });
    writeDeletedAnnotationRecords(next);
  }
  function removeManualAnnotationRecord(id){
    const value = String(id || '').trim();
    if(!value) return;
    writeManualAnnotations(readManualAnnotations().filter(a => !(a && a.id === value)));
  }
  function mergeAnnotations(base, extra){
    const out = [];
    const seen = new Set();
    const deletedIds = deletedAnnotationIdsForCurrentConversation();
    (base || []).concat(extra || []).forEach((ann, i)=>{
      const normalized = normalizeAnnotation(ann, i);
      if(normalized.editorStatus === 'deleted' || normalized.deletedAt) return;
      if(normalized.id && deletedIds.has(String(normalized.id))) return;
      if(!Number.isFinite(normalized.messageIndex) || !Number.isFinite(normalized.startLine) || !Number.isFinite(normalized.endLine)) return;
      const key = normalized.id || [normalized.messageIndex, normalized.startLine, normalized.endLine, normalized.qualityType, normalized.selectedText].join('|');
      if(seen.has(key)) return;
      seen.add(key);
      out.push(normalized);
    });
    return out;
  }
  function saveManualAnnotationRecords(records){
    const existing = readManualAnnotations();
    const byId = new Map();
    existing.concat(records || []).forEach(record=>{ if(record && record.id) byId.set(record.id, record); });
    writeManualAnnotations(Array.from(byId.values()));
  }
  function lineMessageFor(messageIndex){
    return state.lineMessages.find(msg => Number(msg.messageIndex) === Number(messageIndex));
  }
  function addManualAnnotation(payload){
    if(!state.conversation) return [];
    const messageIndex = Number(payload && payload.messageIndex);
    const line = Number(payload && (payload.line || payload.startLine));
    const startLine = Number(payload && (payload.startLine || payload.line));
    const endLine = Number(payload && (payload.endLine || payload.line || payload.startLine));
    if(!Number.isFinite(messageIndex) || !Number.isFinite(line)) return [];
    const msg = lineMessageFor(messageIndex);
    const role = payload.role || msg?.role || '';
    const selectedText = String(payload.selectedText || payload.text || '').trim();
    const types = Array.isArray(payload.qualityTypes) ? payload.qualityTypes : [payload.qualityType || payload.category || '仕様'];
    const sig = conversationSignature();
    const records = types.map((type, idx)=>{
      const qualityType = isQuality02Type(type) ? type : '仕様';
      const category = QUALITY02_MANUAL_CATEGORY_BY_TYPE[qualityType] || 'adopted_spec';
      const meta = metaFor(category);
      return {
        id: payload.id || `manual_${Date.now()}_${Math.random().toString(36).slice(2,8)}_${idx+1}`,
        messageIndex,
        role,
        startLine: Number.isFinite(startLine) ? startLine : line,
        endLine: Number.isFinite(endLine) ? Math.max(startLine || line, endLine) : line,
        category,
        qualityType,
        label: payload.label || meta.label || qualityType,
        reason: payload.reason || selectedText || '02で手動追加した分類範囲',
        displayGroup: meta.group || displayGroupOf(category),
        source: 'manual',
        selectedText,
        conversationSignature: sig,
        createdAt: new Date().toISOString()
      };
    });
    saveManualAnnotationRecords(records);
    state.annotations = mergeAnnotations(state.annotations, records);
    updateStatus();
    renderAll({ animateCounts:false });
    return records;
  }
  function deleteAnnotation(id){
    const value = String(id || '').trim();
    if(!value) return false;
    const ann = state.annotations.find(a => String(a.id || '') === value);
    if(!ann) return false;
    if(String(ann.source || '') === 'manual') removeManualAnnotationRecord(value);
    else markAnnotationDeleted(value, ann);
    state.annotations = state.annotations.filter(a => String(a.id || '') !== value);
    updateStatus();
    renderAll({ animateCounts:false });
    try{ window.dispatchEvent(new CustomEvent('kashinoki02:annotation-deleted', { detail:{ id:value, annotation:ann } })); }catch(e){}
    return true;
  }
  function restoreDeletedAnnotation(id){
    const value = String(id || '').trim();
    if(!value) return false;
    const sig = conversationSignature();
    writeDeletedAnnotationRecords(readDeletedAnnotationRecords().filter(r => !(r && r.id === value && r.conversationSignature === sig)));
    syncFromExternalConversation({force:false, refresh:true});
    return true;
  }

  function setConversation(raw){
    state.conversation = normalizeConversation(raw);
    state.lineMessages = buildLineMessages(state.conversation);
    state.annotations = mergeAnnotations([], manualAnnotationsForCurrentConversation());
    updateStatus();
    renderAll();
  }
  function setAnnotations(raw, options={}){
    const anns = Array.isArray(raw) ? raw : raw.annotations;
    if(!Array.isArray(anns)) throw new Error('annotations[] が見つかりません。');
    const currentManual = state.annotations.filter(a => a && a.source === 'manual');
    state.annotations = mergeAnnotations(anns, currentManual.concat(manualAnnotationsForCurrentConversation()));
    updateStatus();
    if(options && options.deferCountAnimation){
      renderAll({ countsInitialZero: true });
    }else{
      renderAll({ animateCounts: true });
    }
  }

  function resolveExternalConversationJson(){
    /* v743:
       STEP 1で読み込んだだけのPENDING / CURRENT / kashinokiCurrent は、STEP 2へ流さない。
       STEP 2と分類反映モードが読むのは「中身を確かめる」で確定された ACTIVE のみ。
       これにより、JSON未確定時に旧デモ会話や旧カウントが先読み表示される経路を止める。 */
    const raw = window.__KASHINOKI_ACTIVE_CONVERSATION_JSON;
    if(raw && raw.exportType === 'chatgpt_conversation_full_export' && Array.isArray(raw.messages)) return raw;
    if(raw && raw.raw_export && raw.raw_export.exportType === 'chatgpt_conversation_full_export' && Array.isArray(raw.raw_export.messages)) return raw.raw_export;
    if(raw && Array.isArray(raw.raw_messages)){
      return {
        schemaVersion: 1,
        exportType: 'chatgpt_conversation_full_export',
        source: { title: raw.title || '読み込み済み会話', url: raw.source_url || '' },
        capture: { status: raw.raw_capture_status || 'loaded' },
        sourceFile: raw.filename || '',
        messages: raw.raw_messages
      };
    }
    return null;
  }

  function syncFromExternalConversation(options={}){
    const raw = resolveExternalConversationJson();
    if(!raw) return false;
    const incomingCount = Array.isArray(raw.messages) ? raw.messages.length : 0;
    const currentCount = Array.isArray(state.conversation?.messages) ? state.conversation.messages.length : 0;
    const same = currentCount === incomingCount && (state.conversation?.source?.title || '') === (raw.source?.title || '');

    /* v728:
       STEP2再入場・リターン再生時に同じ会話JSONを force sync すると、
       既に反映済みの annotations[] が空に戻り、分類カウントが
       「会話全体」以外すべて0になる。
       会話が同一で annotations が存在する場合は、本文再同期だけで
       分類状態を消さない。 */
    if(same && state.annotations.length && !options.clearAnnotations){
      if(options.refresh){
        updateStatus();
        renderAll({ animateCounts: !!options.animateCounts, countsInitialZero: !!options.countsInitialZero });
      }
      return true;
    }

    if(!options.force && same) return true;
    try{
      const previousAnnotations = Array.isArray(state.annotations) ? state.annotations.slice() : [];
      state.conversation = normalizeConversation(raw);
      state.lineMessages = buildLineMessages(state.conversation);
      state.annotations = (same && options.preserveAnnotations !== false && !options.clearAnnotations) ? mergeAnnotations(previousAnnotations, manualAnnotationsForCurrentConversation()) : mergeAnnotations([], manualAnnotationsForCurrentConversation());
      updateStatus();
      renderAll({ animateCounts: !!options.animateCounts, countsInitialZero: !!options.countsInitialZero });
      return true;
    }catch(e){
      console.warn('[classification-bridge-02] external conversation sync failed', e);
      return false;
    }
  }

  function applySampleAnnotationsForCurrentConversation(options={}){
    if(!state.lineMessages.length){
      if(!syncFromExternalConversation({force:true})) return false;
    }
    const sample = sampleAnnotationsForCurrentConversation();
    try{
      setAnnotations(sample, { deferCountAnimation: !!options.deferCountAnimation });
      const area = $('#ck02AnnotationArea');
      if(area) area.value = JSON.stringify(sample, null, 2);
      if(options.openPanel){
        $('#ck02BridgePanel')?.classList.add('is-open');
        const toggle = $('#ck02Toggle');
        if(toggle) toggle.textContent = '閉じる';
      }
      return true;
    }catch(e){
      console.warn('[classification-bridge-02] sample annotation auto apply failed', e);
      return false;
    }
  }

  function syncFromStep1AndApplySample(options={}){
    const synced = syncFromExternalConversation({force:true});
    if(!synced) return false;
    const previousPermit = window.__KASHINOKI_DEMO_SAMPLE_PERMIT || null;
    issueStarrySamplePermit('step1-explicit-enter-step2');
    try{
      return applySampleAnnotationsForCurrentConversation(options);
    }finally{
      restoreStarrySamplePermit(previousPermit);
    }
  }

  window.KashinoKiClassificationBridge02 = window.KashinoKiClassificationBridge02 || {};
  Object.assign(window.KashinoKiClassificationBridge02, {
    loadConversation(raw){ setConversation(raw); return true; },
    loadAnnotations(raw){ setAnnotations(raw); return true; },
    loadSampleAnnotations(){ return applySampleAnnotationsForCurrentConversation({openPanel:false}); },
    addManualAnnotation(payload){ return addManualAnnotation(payload || {}); },
    deleteAnnotation(id){ return deleteAnnotation(id); },
    removeAnnotation(id){ return deleteAnnotation(id); },
    restoreDeletedAnnotation(id){ return restoreDeletedAnnotation(id); },
    syncFromStep1(){ return syncFromExternalConversation({force:true}); },
    syncFromStep1AndApplySample(options){ return syncFromStep1AndApplySample(options || {}); },
    sampleAnnotationsForCurrentConversation,
    getState(){ return { conversation: state.conversation, annotations: state.annotations, lineMessages: state.lineMessages }; },
    prepareCountsInitialZero(){ return prepareStep2QualitySummaryInitialZero(); },
    refreshQualityCounts(options){ updateStep2QualitySummaryCounts(options || {}); }
  });

  function updateStatus(){
    const el=$('#ck02Status');
    if(!el) return;
    if(!state.conversation){
      el.textContent='未読込：02内の分類反映モードです。ChatGPT会話JSONを読み込んでください。';
      return;
    }
    const title=state.conversation.source?.title || '無題';
    el.textContent=`読込済み: ${title} / messages: ${state.conversation.messages.length} / annotations: ${state.annotations.length}`;
  }

  function qualityChip(type){
    if(!isQuality02Type(type)) return '';
    const color = readQualityColors()[type] || QUALITY02_DEFAULT_COLORS[type] || '#dfe7e4';
    return `<span class="ck02-quality-chip" style="--ck02-chip-color:${escapeHtml(color)};--ck02-chip-text:${escapeHtml(textColorFor(color))};">${escapeHtml(type)}</span>`;
  }
  function annotationTagsHTML(anns){
    if(!anns.length) return '';
    return `<div class="ck02-line-tags">${anns.map((a)=>`<span class="ck02-tag" data-ann-id="${escapeHtml(a.id)}">${escapeHtml(a.label)}</span>${qualityChip(a.qualityType)}`).join('')}</div>`;
  }
  function renderConversation(){
    const host=$('#ck02ConversationView');
    if(!host) return;
    const bridgePanel = $('#ck02BridgePanel');
    applyQualityColorVars(bridgePanel);
    if(bridgePanel) bridgePanel.classList.toggle('ck02-line-numbers-hidden', !showQualityLineNumbers());
    if(!state.lineMessages.length){
      host.innerHTML='<p class="ck02-empty">会話JSONを読み込むと、既存STEP 2と同じ会話レイアウトでここに表示します。</p>';
      return;
    }
    host.innerHTML = `<div class="presentation-chat-thread ck02-chat-thread">${state.lineMessages.map((msg)=>{
      const roleClass = msg.role === 'assistant' ? 'assistant' : msg.role === 'user' ? 'user' : 'assistant';
      const roleLabel = msg.role === 'assistant' ? 'ChatGPT' : msg.role === 'user' ? 'User' : msg.role;
      const lineHtml = msg.lines.map((line)=>{
        const anns=annotationsForLine(msg.messageIndex,line.line);
        const types=lineQualityTypes(msg.messageIndex,line.line);
        const primaryType=types[0] || '';
        const typeAttrs = types.map(t=>`data-quality-type-${escapeHtml(typeToKey(t))}="true"`).join(' ');
        const color = primaryType ? (readQualityColors()[primaryType] || QUALITY02_DEFAULT_COLORS[primaryType]) : 'transparent';
        const lineStyle = primaryType ? lineStyleForQualityType(primaryType) : 'solid';
        const isBlankLine = !String(line.text || '').trim();
        return `<span class="ck02-chat-line${anns.length?' is-annotated':''}${isBlankLine?' is-blank-line':''} is-line-style-${escapeHtml(lineStyle)}" data-message-index="${msg.messageIndex}" data-line="${line.line}" data-primary-type="${escapeHtml(primaryType)}" data-line-style="${escapeHtml(lineStyle)}" style="--ck02-line-color:${escapeHtml(color)};--ck02-line-style:${escapeHtml(lineStyle)};" ${typeAttrs}><span class="ck02-line-no">${padLine(line.line)}</span><span class="ck02-line-text">${isBlankLine ? '&nbsp;' : escapeHtml(line.text)}</span>${isBlankLine ? '' : annotationTagsHTML(lineChipAnnotations(msg.messageIndex,line.line))}</span>`;
      }).join('');
      return `<article class="chat-bubble ${roleClass} ck02-message" data-message-index="${msg.messageIndex}"><label>${escapeHtml(roleLabel)} / message ${msg.messageIndex}</label><p>${lineHtml}</p></article>`;
    }).join('')}</div>`;
  }

  function renderSummary(){
    const host=$('#ck02CategoryList');
    if(!host) return;
    if(!state.annotations.length){
      host.innerHTML='<p class="ck02-empty">分類JSONを反映すると、分類別一覧がここに表示されます。</p>';
      return;
    }
    const grouped = {};
    state.annotations.forEach((a)=>{
      const key = a.displayGroup || displayGroupOf(a.category);
      if(!grouped[key]) grouped[key]=[];
      grouped[key].push(a);
    });
    const order=['confirmed','candidate','intent','hold','danger','design','next','other'];
    host.innerHTML = order.filter(key=>grouped[key]?.length).map((key)=>{
      const group=DISPLAY_GROUPS[key] || {label:key};
      const list=grouped[key];
      return `<section class="ck02-group"><h5><span>${escapeHtml(group.label)}</span><b>${list.length}</b></h5><ul>${list.map((a)=>`<li><button type="button" class="ck02-jump" data-jump-message="${a.messageIndex}" data-jump-line="${a.startLine}">message ${a.messageIndex} / line ${a.startLine}${a.endLine!==a.startLine?`-${a.endLine}`:''}</button><div class="ck02-summary-title">${escapeHtml(a.label)} ${qualityChip(a.qualityType)}</div><p>${escapeHtml(a.reason || '')}</p></li>`).join('')}</ul></section>`;
    }).join('');
  }

  function renderEditor(){
    const host=$('#ck02AnnotationEditor');
    if(!host) return;
    if(!state.annotations.length){
      host.innerHTML='<p class="ck02-empty">分類JSONを反映すると、ここで分類色・ラベル・理由を編集できます。</p>';
      return;
    }
    const typeOptions = QUALITY02_TYPES.map(t=>`<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
    host.innerHTML = state.annotations.map((a, index)=>`
      <div class="ck02-editor-row" data-ann-index="${index}">
        <div class="ck02-editor-top"><b>${escapeHtml(a.id)}</b><span>message ${a.messageIndex} / line ${a.startLine}${a.endLine!==a.startLine?`-${a.endLine}`:''}</span></div>
        <label>表示分類<select data-ck02-edit="qualityType">${typeOptions}</select></label>
        <label>ラベル<input type="text" data-ck02-edit="label" value="${escapeHtml(a.label)}"></label>
        <label>理由<textarea data-ck02-edit="reason">${escapeHtml(a.reason)}</textarea></label>
      </div>`).join('');
    $$('.ck02-editor-row', host).forEach((row)=>{
      const index=Number(row.getAttribute('data-ann-index'));
      const ann=state.annotations[index];
      const select=$('[data-ck02-edit="qualityType"]', row);
      if(select) select.value=ann.qualityType;
    });
  }

  function bindDynamicEvents(){
    $$('#ck02CategoryList .ck02-jump').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const msg=btn.getAttribute('data-jump-message');
        const line=btn.getAttribute('data-jump-line');
        const target=$(`#ck02ConversationView [data-message-index="${CSS.escape(msg)}"][data-line="${CSS.escape(line)}"]`);
        if(target){ target.scrollIntoView({block:'center', behavior:'smooth'}); target.classList.add('is-focus'); setTimeout(()=>target.classList.remove('is-focus'), 1200); }
      });
    });
    $$('#ck02AnnotationEditor [data-ck02-edit]').forEach(el=>{
      el.addEventListener('input', handleAnnotationEdit);
      el.addEventListener('change', handleAnnotationEdit);
    });
  }
  function handleAnnotationEdit(ev){
    const row=ev.target.closest('.ck02-editor-row');
    if(!row) return;
    const index=Number(row.getAttribute('data-ann-index'));
    const key=ev.target.getAttribute('data-ck02-edit');
    if(!state.annotations[index] || !key) return;
    state.annotations[index][key]=ev.target.value;
    renderConversation();
    renderSummary();
    bindDynamicEvents();
    const area=$('#ck02AnnotationArea');
    if(area) area.value=JSON.stringify({classificationVersion:'0.1', sourceMode:'line_based_annotation', annotations:state.annotations}, null, 2);
  }

  function buildPrompt(){
    if(!state.lineMessages.length) return '';
    const messages=state.lineMessages.slice(0,6);
    const body=messages.map((m)=>`messageIndex: ${m.messageIndex}\nrole: ${m.role}\n\n${m.lines.map((l)=>`${padLine(l.line)} ${l.text}`).join('\n')}`).join('\n\n');
    return `以下の会話本文を分類してください。\n\n目的:\n制作作業へ再利用するため、重要箇所を分類し、該当行番号を指定してください。\n\n重要:\n本文は書き換えないでください。\n分類色はツール側の表示設定で管理するため、返答では logical category と、既存分類に対応する qualityType を付けてください。\nqualityType は次のいずれかです: ${QUALITY02_TYPES.join(' / ')}\n\n分類カテゴリ:\n- user_intent: ユーザー意図\n- user_approval: ユーザー承認\n- adopted_spec: 採用仕様\n- adopted_spec_candidate: 採用候補\n- hold_verify: 保留・要確認\n- must_not: 禁止・本番不可\n- design_rule: デザイン条件\n- verification_gate: 確認基準\n- next_action: 次作業\n- ai_suggestion: AI提案\n- final_spec_structure: 最終仕様構成\n- handoff_prompt: 次AI用プロンプト\n\n出力形式:\n必ずJSONのみで返してください。\n該当箇所は messageIndex, role, startLine, endLine で指定してください。\nlabel, category, qualityType, reason を必ず付けてください。\n\n返答JSONの形:\n{\n  "classificationVersion": "0.1",\n  "sourceMode": "line_based_annotation",\n  "annotations": []\n}\n\n対象本文:\n\n${body}`;
  }


  // v707: 最優先の反映先は、分類反映モード内の仮ビューではなく、STEP 2左パネルの既存会話カード。
  // state.conversation + state.annotations を、#captureQualityList 内の presentation-chat-card へ同期する。
  function renderExistingQualityLeftPanel(){
    const host = document.querySelector('#captureQualityList .presentation-chat-card .presentation-chat-thread');
    const card = document.querySelector('#captureQualityList .presentation-chat-card');
    if(!host || !card || !state.lineMessages.length) return;
    card.classList.add('ck02-left-reflection-card');
    card.classList.toggle('ck02-line-numbers-hidden', !showQualityLineNumbers());
    const title = card.querySelector('.presentation-card-heading h3');
    if(title) title.textContent = state.conversation?.source?.title || '分類反映済みの会話';
    const desc = card.querySelector('.presentation-card-heading p');
    if(desc) desc.textContent = '会話内の発言そのものに、表示設定の分類色でアンダーラインと分類チップを反映しています。';
    host.classList.add('ck02-left-reflection-thread');
    host.innerHTML = state.lineMessages.map((msg)=>{
      const roleClass = msg.role === 'assistant' ? 'assistant' : msg.role === 'user' ? 'user' : 'assistant';
      const roleLabel = msg.role === 'assistant' ? 'ChatGPT' : msg.role === 'user' ? 'User' : msg.role;
      const lines = msg.lines.map((line)=>renderExistingLeftLine(msg.messageIndex, line)).join('');
      const messageTypes = Array.from(new Set(msg.lines.flatMap((line)=>lineQualityTypes(msg.messageIndex, line.line)))).filter(isQuality02Type);
      // v742: チャット枠下の分類チップ列は廃止。分類表示は各行右側の .ck02-left-line-tags のみに集約する。
      const reviewClass = messageTypes[0] || '';
      const reviewClasses = messageTypes.join(',');
      const reviewAttrs = reviewClass ? `data-review02-class="${escapeHtml(reviewClass)}" data-review02-classes="${escapeHtml(reviewClasses)}"` : 'data-review02-class="" data-quality02-none="true"';
      return `<article class="chat-bubble ${roleClass} ck02-left-message" data-message-index="${msg.messageIndex}" ${reviewAttrs}><label>${escapeHtml(roleLabel)}</label><p>${lines}</p></article>`;
    }).join('');
  }

  function renderExistingLeftLine(messageIndex, line){
    const anns = annotationsForLine(messageIndex, line.line);
    const chipAnns = lineChipAnnotations(messageIndex, line.line);
    const types = lineQualityTypes(messageIndex, line.line);
    const primaryType = types[0] || '';
    const color = primaryType ? (readQualityColors()[primaryType] || QUALITY02_DEFAULT_COLORS[primaryType] || '#ef9cad') : 'transparent';
    const lineStyle = primaryType ? lineStyleForQualityType(primaryType) : 'solid';
    const lineTags = chipAnns.length ? `<span class="ck02-left-line-tags">${chipAnns.map((a)=>{
      const qt = safeQualityType(a.qualityType, a.category);
      if(!qt) return '';
      const chipColor = readQualityColors()[qt] || QUALITY02_DEFAULT_COLORS[qt] || '#dfe7e4';
      const chipText = textColorFor(chipColor);
      return `<button type="button" class="ck02-left-line-tag kashinoki-v444-class-chip kashinoki-v449-chip is-quality02-line-chip" data-quality02-chip-id="${escapeHtml(a.id)}" data-quality02-chip-type="${escapeHtml(qt)}" data-quality02-chip-text="${escapeHtml(a.selectedText || a.reason || line.text || '')}" data-source-annotation-id="${escapeHtml(a.id)}" data-quality02-source="${escapeHtml(a.source || 'json')}" title="${escapeHtml(a.reason || '')}" style="--ck02-left-chip-color:${escapeHtml(chipColor)};--ck02-left-chip-text:${escapeHtml(chipText)};">${escapeHtml(qt)}</button>`;
    }).filter(Boolean).join('')}</span>` : '';
    const isBlankLine = !String(line.text || '').trim();
    return `<span class="ck02-left-line${types.length?' is-annotated':''}${isBlankLine?' is-blank-line':''} is-line-style-${escapeHtml(lineStyle)}" data-message-index="${messageIndex}" data-line="${line.line}" data-line-style="${escapeHtml(lineStyle)}" style="--ck02-left-line-color:${escapeHtml(color)};--ck02-left-line-style:${escapeHtml(lineStyle)};"><span class="ck02-left-line-no">${padLine(line.line)}</span><span class="ck02-left-line-text">${isBlankLine ? '&nbsp;' : escapeHtml(line.text)}</span>${isBlankLine ? '' : lineTags}</span>`;
  }

  function annotationQualityCounts(){
    const counts = { all: Number(state.conversation?.messages?.length || 0) };
    QUALITY02_TYPES.forEach(type => { counts[type] = 0; });
    state.annotations.forEach((ann)=>{
      const type = safeQualityType(ann.qualityType, ann.category);
      if(isQuality02Type(type)) counts[type] += 1;
    });
    return counts;
  }

  /* v732: STEP2分類カウント専用コントローラー
     ここから #captureQualitySummary は classification-bridge-02 が単独管理する。
     旧4分類カウント、旧workflow-count-animation、MutationObserverによる再上書きは使わない。
     DOM生成・件数設定・0→最終値アニメーション・再入場時の再演出をこの系統だけで行う。 */
  const COUNT_LABELS = [['会話全体','all'], ...QUALITY02_TYPES.map(type => [type, type])];
  let countControllerToken = 0;
  let countControllerTimers = [];

  function clearCountControllerTimers(){
    countControllerToken += 1;
    countControllerTimers.forEach(id => clearTimeout(id));
    countControllerTimers = [];
    const summary = document.getElementById('captureQualitySummary');
    if(summary){
      summary.querySelectorAll('b').forEach((b)=>{
        if(b._ck02QualityCountFrame){ cancelAnimationFrame(b._ck02QualityCountFrame); b._ck02QualityCountFrame = null; }
        b.classList.remove('is-quality-counting');
      });
      summary.classList.remove('is-ck02-count-animating');
    }
  }

  function isStep2SummaryVisible(){
    const page = document.getElementById('portfolio-quality');
    const summary = document.getElementById('captureQualitySummary');
    if(!page || !summary || !page.classList.contains('active')) return false;
    const rect = summary.getBoundingClientRect();
    const style = getComputedStyle(summary);
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0.05;
  }

  function waitForStep2SummaryVisible(token, callback){
    const started = performance.now();
    function check(){
      if(token !== countControllerToken) return;
      if(isStep2SummaryVisible() || performance.now() - started > 3500){
        callback();
        return;
      }
      requestAnimationFrame(check);
    }
    requestAnimationFrame(check);
  }

  function summaryHtmlFromCounts(counts, initialZero){
    const current = document.getElementById('portfolio-quality')?.getAttribute('data-review02-current') || 'all';
    const colors = readQualityColors();
    const items = COUNT_LABELS.map(([label, filter], index)=>{
      const selected = filter === current || (!current && index === 0);
      const value = Number(counts[filter] || 0);
      const shown = initialZero ? 0 : value;
      const typeColor = isQuality02Type(filter) ? (colors[filter] || QUALITY02_DEFAULT_COLORS[filter] || '') : '';
      const colorStyle = typeColor ? ` style="--ck02-count-color:${escapeHtml(typeColor)};--ck02-count-text:${escapeHtml(textColorFor(typeColor))};"` : '';
      return `<button type="button" class="workflow-brief-card kashinoki-filter-button${selected ? ' is-active is-selected' : ''}" role="button" tabindex="0" aria-pressed="${selected ? 'true' : 'false'}" data-review02-filter="${escapeHtml(filter)}" data-quality02-count-card="true" title="${escapeHtml(label)}だけ表示"${colorStyle}><span>${escapeHtml(label)}</span><b data-quality-final="${escapeHtml(value)}">${escapeHtml(shown)}</b></button>`;
    });
    /* v733: 既存02の3段目密度を維持するため、ボタンが無いマスも白い枠で埋める。 */
    const columns = 5;
    const remainder = COUNT_LABELS.length % columns;
    const spacerCount = remainder ? columns - remainder : 0;
    for(let i=0;i<spacerCount;i++){
      items.push('<div class="quality02-filter-spacer ck02-quality-filter-spacer" aria-hidden="true"></div>');
    }
    return items.join('');
  }

  function ensureSummaryOwnedDom(counts, initialZero){
    const summary = document.getElementById('captureQualitySummary');
    if(!summary) return null;
    summary.setAttribute('data-quality02-summary-owner', 'classification-bridge-02');
    summary.setAttribute('data-quality02-count-controller', 'v752');
    summary.classList.add('ck02-quality-count-summary');
    const currentSignature = COUNT_LABELS.map(([,filter]) => filter).join('|');
    const existingSignature = Array.from(summary.querySelectorAll('[data-review02-filter]')).map(el => el.getAttribute('data-review02-filter')).join('|');
    if(existingSignature !== currentSignature){
      summary.innerHTML = summaryHtmlFromCounts(counts, !!initialZero);
    }else{
      const colors = readQualityColors();
      COUNT_LABELS.forEach(([,filter])=>{
        const button = summary.querySelector(`[data-review02-filter="${cssEscape(filter)}"]`);
        const b = button ? button.querySelector('b') : null;
        if(!b) return;
        if(button && isQuality02Type(filter)){
          const typeColor = colors[filter] || QUALITY02_DEFAULT_COLORS[filter] || '';
          if(typeColor){
            button.style.setProperty('--ck02-count-color', typeColor);
            button.style.setProperty('--ck02-count-text', textColorFor(typeColor));
          }
        }
        const value = String(Number(counts[filter] || 0));
        b.setAttribute('data-quality-final', value);
        if(initialZero) b.textContent = '0';
      });
    }
    return summary;
  }

  function prepareStep2QualitySummaryInitialZero(){
    if(!state.conversation) return false;
    const counts = annotationQualityCounts();
    window.__KASHINOKI_QUALITY02_ANNOTATION_COUNTS = counts;
    clearCountControllerTimers();
    ensureSummaryOwnedDom(counts, true);
    return true;
  }

  function setSummaryFinalCounts(counts){
    clearCountControllerTimers();
    const summary = ensureSummaryOwnedDom(counts, false);
    if(!summary) return false;
    COUNT_LABELS.forEach(([,filter])=>{
      const b = summary.querySelector(`[data-review02-filter="${cssEscape(filter)}"] b`);
      if(!b) return;
      const value = String(Number(counts[filter] || 0));
      b.setAttribute('data-quality-final', value);
      b.textContent = value;
      b.classList.remove('is-quality-counting');
    });
    return true;
  }

  function animateNumberElement(b, finalValue, delay, token){
    const duration = 1600;
    const startTimeout = setTimeout(()=>{
      if(token !== countControllerToken) return;
      const startedAt = performance.now();
      b.classList.add('is-quality-counting');
      b.textContent = '0';
      function tick(now){
        if(token !== countControllerToken){ b.classList.remove('is-quality-counting'); return; }
        const t = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const nextValue = t >= 1 ? finalValue : Math.round(finalValue * eased);
        b.textContent = String(nextValue);
        if(t < 1){
          b._ck02QualityCountFrame = requestAnimationFrame(tick);
        }else{
          b.textContent = String(finalValue);
          b.setAttribute('data-quality-final', String(finalValue));
          b.classList.remove('is-quality-counting');
          b._ck02QualityCountFrame = null;
        }
      }
      b._ck02QualityCountFrame = requestAnimationFrame(tick);
    }, delay);
    countControllerTimers.push(startTimeout);
  }

  function animateStep2QualitySummaryCounts(counts){
    clearCountControllerTimers();
    const token = countControllerToken;
    const summary = ensureSummaryOwnedDom(counts, true);
    if(!summary) return false;

    /* 旧カウントアニメーションの残処理だけ停止する。旧処理には新10分類DOMを触らせない。 */
    try { if(typeof window.cancelQualityCounts === 'function') window.cancelQualityCounts(); } catch(_) {}
    try { window.__kashinokiQualityCountToken = (window.__kashinokiQualityCountToken || 0) + 1; } catch(_) {}

    summary.classList.add('is-ck02-count-animating');
    COUNT_LABELS.forEach(([,filter])=>{
      const b = summary.querySelector(`[data-review02-filter="${cssEscape(filter)}"] b`);
      if(!b) return;
      const finalValue = Number(counts[filter] || 0);
      b.setAttribute('data-quality-final', String(finalValue));
      b.textContent = '0';
      b.classList.remove('is-quality-counting');
    });

    /* v733: STEP1の「中身を確かめる」直後は、分類反映がSTEP2表示前に走る。
       そのまま開始すると非表示中にカウントが終わるため、STEP2のsummaryが実際に見えるまで待ってから開始する。 */
    waitForStep2SummaryVisible(token, ()=>{
      if(token !== countControllerToken) return;
      COUNT_LABELS.forEach(([,filter], index)=>{
        const b = summary.querySelector(`[data-review02-filter="${cssEscape(filter)}"] b`);
        if(!b) return;
        const finalValue = Number(counts[filter] || 0);
        b.textContent = '0';
        animateNumberElement(b, finalValue, 80 + index * 90, token);
      });
      const finishDelay = 80 + COUNT_LABELS.length * 90 + 1700;
      const finishTimer = setTimeout(()=>{
        if(token !== countControllerToken) return;
        COUNT_LABELS.forEach(([,filter])=>{
          const b = summary.querySelector(`[data-review02-filter="${cssEscape(filter)}"] b`);
          if(!b) return;
          const finalValue = Number(counts[filter] || 0);
          b.textContent = String(finalValue);
          b.setAttribute('data-quality-final', String(finalValue));
          b.classList.remove('is-quality-counting');
        });
        summary.classList.remove('is-ck02-count-animating');
      }, finishDelay);
      countControllerTimers.push(finishTimer);
    });
    return true;
  }

  function updateStep2QualitySummaryCounts(options){
    const summary = document.getElementById('captureQualitySummary');
    if(!summary || !state.conversation) return;
    const counts = annotationQualityCounts();
    window.__KASHINOKI_QUALITY02_ANNOTATION_COUNTS = counts;
    if(options && options.initialZero){
      clearCountControllerTimers();
      ensureSummaryOwnedDom(counts, true);
      return;
    }
    if(options && options.animate){
      animateStep2QualitySummaryCounts(counts);
    }else{
      setSummaryFinalCounts(counts);
    }
  }

  function installSummaryCountObserver(){
    /* v732: observerを廃止。上書き検知で再上書きする構造をやめ、
       classification-bridge-02 の明示的な renderAll/updateStep2QualitySummaryCounts だけで管理する。 */
  }

  function renderAll(options){
    const opts = options || {};
    renderConversation();
    renderExistingQualityLeftPanel();
    updateStep2QualitySummaryCounts({ animate: !!opts.animateCounts, initialZero: !!opts.countsInitialZero });
    installSummaryCountObserver();
    /* v754: STEP2上部カウントはworkflow-02.jsのCOUNT_NUMBER_STARTからだけ開始する。
       renderAll()内の後追い最終値同期タイマーは、最終値→0→カウントの二重表示原因になるため廃止。
       countsInitialZero=true の場合は0表示を維持し、animateCounts=true の場合だけ明示API経由で動かす。 */
    renderSummary();
    renderEditor();
    bindDynamicEvents();
  }

  function isDemoModeSettingOn(){
    try{
      return document.body?.classList.contains('demo-mode-setting-on') || localStorage.getItem('kashinoki_demo_mode_setting_v1') === '1';
    }catch(e){
      return document.body?.classList.contains('demo-mode-setting-on') || false;
    }
  }

  function syncBridgePanelDemoVisibility(){
    const panel = $('#ck02BridgePanel');
    if(!panel) return;
    const on = isDemoModeSettingOn();
    panel.hidden = !!on;
    panel.setAttribute('aria-hidden', on ? 'true' : 'false');
    panel.classList.toggle('is-demo-hidden', !!on);
  }

  function injectPanel(){
    const page=$('#portfolio-quality');
    if(!page || $('#ck02BridgePanel')) { syncBridgePanelDemoVisibility(); return; }
    const after=$('#captureQualitySummary', page);
    const panel=document.createElement('section');
    panel.id='ck02BridgePanel';
    panel.className='ck02-bridge-panel';
    panel.innerHTML=`
      <div class="ck02-bridge-head">
        <div>
          <span class="ck02-bridge-kicker">CLASSIFICATION REFLECTION / STEP 2内検証</span>
          <h3>分類反映モード</h3>
          <p>既存の表示設定3で指定した分類色を使い、会話レイアウト上に分類アンダーラインを表示します。原文は改変せず、分類は右側の編集パネルで調整します。</p>
        </div>
        <button class="ck02-bridge-toggle" id="ck02Toggle" type="button">開く</button>
      </div>
      <div class="ck02-bridge-body">
        <div class="ck02-actions">
          <button class="ck02-btn" id="ck02ApplyAnn" type="button">分類JSONを反映</button>
          <button class="ck02-btn" id="ck02MakePrompt" type="button">分類プロンプト生成</button>
          <label class="ck02-file-label">会話JSONを選択<input id="ck02ConversationFile" type="file" accept="application/json,.json"></label>
        </div>
        <div id="ck02Status" class="ck02-status">未読込：02内の分類反映モードです。</div>
        <div class="ck02-main-grid">
          <div class="ck02-panel-inner ck02-conversation-panel">
            <h4>会話本文</h4>
            <div id="ck02ConversationView" class="ck02-conversation"></div>
          </div>
          <div class="ck02-panel-inner ck02-editor-panel">
            <h4>分類編集</h4>
            <div id="ck02AnnotationEditor" class="ck02-annotation-editor"></div>
          </div>
        </div>
        <div class="ck02-sub-grid">
          <div class="ck02-panel-inner"><h4>分類別一覧</h4><div id="ck02CategoryList" class="ck02-category-list"></div></div>
          <div class="ck02-panel-inner"><h4>分類プロンプト</h4><textarea id="ck02PromptArea" class="ck02-textarea" placeholder="分類プロンプト生成で出力"></textarea></div>
          <div class="ck02-panel-inner"><h4>分類JSON貼り付け</h4><textarea id="ck02AnnotationArea" class="ck02-textarea" placeholder="ChatGPTが返した annotations[] JSON を貼り付け"></textarea></div>
        </div>
      </div>`;
    if(after) after.insertAdjacentElement('afterend', panel); else page.prepend(panel);
    syncBridgePanelDemoVisibility();
    bindEvents(); updateStatus(); renderAll();
  }

  function currentConversationLooksStarryMuseum(){
    /* v809:
       旧デモ分類の「自動流入」は止めたまま、STEP1下部の
       「中身を確かめる」から明示的に02へ進んだ場合だけ、
       星空科学館デモ本文に対応する分類サンプルを反映する。
       03へ直接入った場合や、未確定のPENDING会話だけでは true にしない。 */
    if(!readStarrySamplePermit()) return false;
    const conv = state.conversation || resolveExternalConversationJson() || {};
    const haystack = [
      conv.sourceFile,
      conv.filename,
      conv.fileName,
      conv.source?.title,
      conv.source?.filename,
      conv.capture?.title,
      conv.title,
      (Array.isArray(conv.messages) ? conv.messages.slice(0, 8).map(m => m && m.text).join(' ') : '')
    ].filter(Boolean).join(' ');
    return /星空科学館|プラネタリウム|来館体験|starry[-_ ]?museum/i.test(haystack);
  }

  function sampleAnnotationsForCurrentConversation(){
    if(currentConversationLooksStarryMuseum()) return getStarryMuseumClassificationSample();
    return {
      classificationVersion: '0.1-empty',
      sourceMode: 'line_based_annotation',
      annotations: []
    };
  }

  function bindEvents(){
    $('#ck02Toggle')?.addEventListener('click',()=>{
      const panel=$('#ck02BridgePanel');
      panel?.classList.toggle('is-open');
      $('#ck02Toggle').textContent=panel?.classList.contains('is-open')?'閉じる':'開く';
    });
    $('#ck02ApplyAnn')?.addEventListener('click',()=>{
      try{ setAnnotations(JSON.parse($('#ck02AnnotationArea').value)); }
      catch(e){ alert('分類JSONを読み込めません: '+e.message); }
    });
    $('#ck02MakePrompt')?.addEventListener('click',()=>{ $('#ck02PromptArea').value=buildPrompt(); });
    $('#ck02ConversationFile')?.addEventListener('change',(ev)=>{
      const file=ev.target.files?.[0];
      if(!file) return;
      const reader=new FileReader();
      reader.onload=()=>{
        try{
          setConversation(JSON.parse(reader.result));
          $('#ck02BridgePanel')?.classList.add('is-open');
          $('#ck02Toggle').textContent='閉じる';
        }catch(e){ alert('会話JSONを読み込めません: '+e.message); }
      };
      reader.readAsText(file);
    });
  }

  function init(){ injectPanel(); syncBridgePanelDemoVisibility(); applyQualityColorVars($('#ck02BridgePanel')); syncFromExternalConversation({force:false}); }
  function clearWhenNoActiveConversation(){
    if(resolveExternalConversationJson()) return false;
    state.conversation = null;
    state.lineMessages = [];
    state.annotations = [];
    updateStatus();
    const summary = document.getElementById('captureQualitySummary');
    if(summary){
      summary.removeAttribute('data-quality02-summary-owner');
      summary.removeAttribute('data-quality02-count-controller');
    }
    return true;
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('load', init);
  window.addEventListener('storage', () => { syncBridgePanelDemoVisibility(); applyQualityColorVars($('#ck02BridgePanel')); renderAll(); });
  // v743: 読込済み(PENDING)だけではSTEP2/分類反映へ同期しない。確定イベントだけで同期する。
  window.addEventListener('kashinoki-step1-json-loaded', () => { syncBridgePanelDemoVisibility(); });
  window.addEventListener('kashinoki-step1-json-committed', () => {
    /* v750: STEP1確定時点では分類反映を開始しない。
       先に最終値が見えてから0へ戻る症状を避けるため、STEP2へ入った通知で一度だけ実行する。 */
    window.__KASHINOKI_PENDING_STEP2_SAMPLE_APPLY = true;
  });
  window.addEventListener('kashinoki-enter-step2', () => {
    if(clearWhenNoActiveConversation()) return;
    if(window.__KASHINOKI_PENDING_STEP2_SAMPLE_APPLY){
      window.__KASHINOKI_PENDING_STEP2_SAMPLE_APPLY = false;
      syncFromStep1AndApplySample({openPanel:false, deferCountAnimation:true});
      return;
    }
    /* v754: STEP2再入場・リターン再生時も、このイベントではカウントを開始しない。
       0準備までに限定し、開始はworkflow-02.jsのCOUNT_NUMBER_STARTへ一本化する。 */
    syncFromExternalConversation({force:false, refresh:true, countsInitialZero:true});
  });
  window.addEventListener('quality02-settings-updated', () => { syncBridgePanelDemoVisibility(); applyQualityColorVars($('#ck02BridgePanel')); renderAll(); });
  window.addEventListener('demo-mode-setting-updated', () => { syncBridgePanelDemoVisibility(); });

  /* v734: STEP2既存シーケンスから呼ばれる正式API。
     カウントDOMの生成/最終値保持はclassification-bridge側が行い、
     アニメーション開始タイミングは既存workflow-02.jsのCOUNT_NUMBER_STARTに合わせる。
     これにより、非表示中にカウントが終わる早すぎる開始を避ける。 */
  window.KashinoKiClassificationBridge02 = Object.assign(window.KashinoKiClassificationBridge02 || {}, {
    isSummaryOwner(){
      const summary = document.getElementById('captureQualitySummary');
      return !!summary && summary.getAttribute('data-quality02-summary-owner') === 'classification-bridge-02';
    },
    hasConversation(){ return !!state.conversation; },
    hasAnnotations(){ return Array.isArray(state.annotations) && state.annotations.length > 0; },
    getCounts(){ return annotationQualityCounts(); },
    renderCounts(options){
      updateStep2QualitySummaryCounts({ animate: !!(options && options.animate) });
    },
    animateCounts(){
      if(!state.conversation) return false;
      const counts = annotationQualityCounts();
      return animateStep2QualitySummaryCounts(counts);
    },
    finishCounts(){
      if(!state.conversation) return false;
      const counts = annotationQualityCounts();
      return setSummaryFinalCounts(counts);
    }
  });

  setTimeout(init, 300);
})();
