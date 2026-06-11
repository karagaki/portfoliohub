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

  const sampleConversation = {
    schemaVersion: 1,
    exportType: 'chatgpt_conversation_full_export',
    source: { title: '星空科学館ファーストビュー仕様テスト' },
    capture: { status: 'sample' },
    messages: [
      { index: 1, role: 'user', text: '地方にある小さなプラネタリウム施設のWebページ冒頭を作りたいです。\n普通の科学館サイトではなく、親子向けの物語性のある星空体験として見せたいです。\nただし、上映時間、予約、料金、駐車場、バス、屋上観測の条件はまだ未確認なので、断定しないようにしたいです。' },
      { index: 2, role: 'assistant', text: 'ファーストビューでは、左側を物語の入口、右側を親が安心できる星座カード風の小カード、下部をアクセス確認導線として構成するとよいです。\n採用する見出しは「親子で星空の物語に入る、小さなプラネタリウム。」です。\n補足文は「星に詳しくなくても大丈夫。映像や物語、星座カードをきっかけに、親子で星空に触れられる小さな体験施設です。」が使えます。\n上映時間、予約、料金、駐車場、バス、屋上観測の開催条件は、確認済みになるまでファーストビューでは断定しないでください。\n右側カードはチェックリストではなく、夜空に浮かぶ星座カードのように見せてください。' },
      { index: 3, role: 'user', text: 'この方向で進めたいです。\n大見出しと補足文は採用します。\n右側カードは文言だけだと案内ページっぽく見えるので、チェックリストではなく星座カード風に見せることを必須にしてください。\n雨の日の展示室・シアター、アクセス案内ページの受け皿は本番前に確認が必要です。\n未確認情報を自然な文章で補完しないことも禁止事項として残してください。' },
      { index: 4, role: 'assistant', text: '最終仕様として、採用する文言、保留する情報、禁止表現、デザイン上の必須条件を分けます。\n採用文言は「親子で星空の物語に入る、小さなプラネタリウム。」と「星に詳しくなくても大丈夫。映像や物語、星座カードをきっかけに、親子で星空に触れられる小さな体験施設です。」です。\n保留情報は、上映時間、予約方法、料金、駐車場、バス案内、屋上観測の開催条件です。\n禁止表現は、本日上映中、予約不要、駐車場あり、毎日開催、アクセス良好、駅から◯分などです。\nデザイン条件は、夜の絵本のようなファーストビュー、深い紺〜紫の夜空、星座カード風の小カード、チェックマークや番号を使わないことです。\n完成後は、普通の科学館サイトに見えないか、未確認情報を断定していないか、右側カードが星座カードに見えるかを確認してください。' },
      { index: 5, role: 'user', text: 'この内容を、次の制作AIに渡せる最終プロンプトとして整えてください。\n採用仕様、禁止事項、未確認・保留情報、デザイン条件、完成後の確認基準が分かれる形にしてください。' },
      { index: 6, role: 'assistant', text: '地方にある小さなプラネタリウム施設のWebページ冒頭、ファーストビューを制作してください。\n目的は、普通の科学館サイトや設備紹介ページではなく、夜の絵本のような小さな親子向け星空体験として見せることです。\n採用仕様として、左側は物語の入口、右側は星座カード風の安心材料、下部はアクセス確認導線で構成してください。\n見出しは「親子で星空の物語に入る、小さなプラネタリウム。」を使用してください。\n補足文は「星に詳しくなくても大丈夫。映像や物語、星座カードをきっかけに、親子で星空に触れられる小さな体験施設です。」を使用してください。\n禁止事項として、本日上映中、予約不要、駐車場あり、毎日開催、アクセス良好、駅から◯分などの未確認情報を断定する表現は使わないでください。\n未確認・保留情報として、上映時間、予約方法、料金、駐車場、バス案内、屋上観測の開催条件は確認済みになるまでファーストビューでは断定しないでください。\nデザイン条件として、深い紺〜紫の夜空、やわらかい星の粒、ドームのような淡い光、星座カード風の小カードを使い、SF風UIや派手な銀河背景には寄せないでください。\n完成後は、普通の科学館サイトに見えないか、未確認情報を断定していないか、右側カードがチェックリストではなく星座カードに見えるかを自己確認してください。' }
    ]
  };

  const sampleAnnotations = { classificationVersion:'0.1', sourceMode:'line_based_annotation', annotations:[
    {id:'ann_0001',messageIndex:1,role:'user',startLine:1,endLine:1,category:'next_action',label:'制作対象',reason:'Webページ冒頭制作という作業対象を示している'},
    {id:'ann_0002',messageIndex:1,role:'user',startLine:2,endLine:2,category:'user_intent',label:'ユーザー意図',reason:'普通の科学館サイトではなく親子向けの物語性を重視する意図'},
    {id:'ann_0003',messageIndex:1,role:'user',startLine:3,endLine:3,category:'hold_verify',label:'未確認・保留情報',reason:'上映時間、予約、料金などが未確認'},
    {id:'ann_0004',messageIndex:1,role:'user',startLine:3,endLine:3,category:'must_not',label:'断定禁止',reason:'未確認情報を断定しないという禁止条件'},
    {id:'ann_0005',messageIndex:2,role:'assistant',startLine:1,endLine:1,category:'ai_suggestion',label:'構成提案',reason:'左・右・下部の構成をAIが提案'},
    {id:'ann_0006',messageIndex:2,role:'assistant',startLine:2,endLine:2,category:'adopted_spec_candidate',label:'採用候補見出し',reason:'採用可能な見出し候補'},
    {id:'ann_0007',messageIndex:2,role:'assistant',startLine:3,endLine:3,category:'adopted_spec_candidate',label:'採用候補補足文',reason:'採用可能な補足文候補'},
    {id:'ann_0008',messageIndex:2,role:'assistant',startLine:4,endLine:4,category:'must_not',label:'未確認情報の断定禁止',reason:'未確認項目を断定しない条件'},
    {id:'ann_0009',messageIndex:2,role:'assistant',startLine:5,endLine:5,category:'design_rule',label:'星座カード表現',reason:'右側カードの見た目条件'},
    {id:'ann_0010',messageIndex:3,role:'user',startLine:1,endLine:1,category:'user_approval',label:'方向性承認',reason:'ユーザーが方向性を承認'},
    {id:'ann_0011',messageIndex:3,role:'user',startLine:2,endLine:2,category:'adopted_spec',label:'採用確定',reason:'大見出しと補足文を採用すると明言'},
    {id:'ann_0012',messageIndex:3,role:'user',startLine:3,endLine:3,category:'design_rule',label:'星座カード必須',reason:'チェックリストではなく星座カード風を必須化'},
    {id:'ann_0013',messageIndex:3,role:'user',startLine:4,endLine:4,category:'hold_verify',label:'本番前確認',reason:'展示室・シアター、アクセス案内ページの確認が必要'},
    {id:'ann_0014',messageIndex:3,role:'user',startLine:5,endLine:5,category:'must_not',label:'自然補完禁止',reason:'未確認情報の自然補完を禁止'},
    {id:'ann_0015',messageIndex:4,role:'assistant',startLine:1,endLine:1,category:'final_spec_structure',label:'最終仕様構成',reason:'最終仕様の構成項目'},
    {id:'ann_0016',messageIndex:4,role:'assistant',startLine:2,endLine:2,category:'adopted_spec',label:'採用文言',reason:'採用する文言'},
    {id:'ann_0017',messageIndex:4,role:'assistant',startLine:3,endLine:3,category:'hold_verify',label:'保留情報',reason:'確認済みまで断定しない情報群'},
    {id:'ann_0018',messageIndex:4,role:'assistant',startLine:4,endLine:4,category:'must_not',label:'禁止表現',reason:'ファーストビューで使わない表現'},
    {id:'ann_0019',messageIndex:4,role:'assistant',startLine:5,endLine:5,category:'design_rule',label:'デザイン条件',reason:'夜の絵本・星座カードなどの条件'},
    {id:'ann_0020',messageIndex:4,role:'assistant',startLine:6,endLine:6,category:'verification_gate',label:'完成後確認',reason:'完成後の判定基準'},
    {id:'ann_0021',messageIndex:5,role:'user',startLine:1,endLine:2,category:'next_action',label:'最終プロンプト化',reason:'次の制作AIへ渡す形式に整える依頼'},
    {id:'ann_0022',messageIndex:6,role:'assistant',startLine:1,endLine:9,category:'handoff_prompt',label:'次AI用プロンプト',reason:'制作AIに渡せる最終プロンプト'}
  ]};

  const starryMuseumClassificationSample = {"classificationVersion":"0.1-sample","sourceMode":"line_based_annotation","sourceFile":"星空科学館_来館体験と案内ページ設計_v1.4_raw_20260609.json","sourceExportType":"chatgpt_conversation_full_export","sourceTitle":"運営のひっ迫 - プラネタリウム再生計画","createdFor":"presentation_demo_before_full_classifier","notes":"分類機能本実装前の表示確認用サンプル。本文JSONとは別ファイルとして扱う。全行分類ではなく、プレゼン確認用に代表箇所を抽出。","annotations":[{"id":"starry_ann_0001","messageIndex":1,"role":"user","startLine":1,"endLine":1,"category":"next_action","qualityType":"タスク","label":"次作業","reason":"ユーザーが次に進めたい作業・相談内容","priority":"medium","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0002","messageIndex":1,"role":"user","startLine":3,"endLine":3,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0003","messageIndex":1,"role":"user","startLine":5,"endLine":5,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0004","messageIndex":2,"role":"assistant","startLine":2,"endLine":2,"category":"design_rule","qualityType":"デザイン","label":"デザイン条件","reason":"見た目・体験設計・方向性に関する条件","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0005","messageIndex":2,"role":"assistant","startLine":16,"endLine":16,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0006","messageIndex":2,"role":"assistant","startLine":18,"endLine":18,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0007","messageIndex":3,"role":"user","startLine":3,"endLine":3,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0008","messageIndex":3,"role":"user","startLine":7,"endLine":7,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0009","messageIndex":3,"role":"user","startLine":17,"endLine":17,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0010","messageIndex":4,"role":"assistant","startLine":22,"endLine":22,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0011","messageIndex":4,"role":"assistant","startLine":34,"endLine":34,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0012","messageIndex":4,"role":"assistant","startLine":52,"endLine":52,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0013","messageIndex":5,"role":"user","startLine":4,"endLine":4,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0014","messageIndex":5,"role":"user","startLine":7,"endLine":7,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0015","messageIndex":5,"role":"user","startLine":10,"endLine":10,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0016","messageIndex":6,"role":"assistant","startLine":2,"endLine":2,"category":"design_rule","qualityType":"デザイン","label":"デザイン条件","reason":"見た目・体験設計・方向性に関する条件","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0017","messageIndex":6,"role":"assistant","startLine":11,"endLine":11,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0018","messageIndex":6,"role":"assistant","startLine":71,"endLine":71,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0019","messageIndex":7,"role":"user","startLine":3,"endLine":3,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0020","messageIndex":7,"role":"user","startLine":5,"endLine":5,"category":"next_action","qualityType":"タスク","label":"次作業","reason":"ユーザーが次に進めたい作業・相談内容","priority":"medium","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0021","messageIndex":7,"role":"user","startLine":7,"endLine":7,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0022","messageIndex":8,"role":"assistant","startLine":12,"endLine":12,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0023","messageIndex":8,"role":"assistant","startLine":24,"endLine":24,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0024","messageIndex":8,"role":"assistant","startLine":63,"endLine":63,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0025","messageIndex":9,"role":"user","startLine":4,"endLine":4,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0026","messageIndex":9,"role":"user","startLine":7,"endLine":7,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0027","messageIndex":9,"role":"user","startLine":10,"endLine":10,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0028","messageIndex":10,"role":"assistant","startLine":7,"endLine":7,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0029","messageIndex":10,"role":"assistant","startLine":9,"endLine":9,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0030","messageIndex":10,"role":"assistant","startLine":21,"endLine":21,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0031","messageIndex":11,"role":"user","startLine":4,"endLine":4,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0032","messageIndex":11,"role":"user","startLine":12,"endLine":12,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0033","messageIndex":11,"role":"user","startLine":19,"endLine":19,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0034","messageIndex":12,"role":"assistant","startLine":2,"endLine":2,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0035","messageIndex":12,"role":"assistant","startLine":5,"endLine":5,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0036","messageIndex":12,"role":"assistant","startLine":20,"endLine":20,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0037","messageIndex":13,"role":"user","startLine":4,"endLine":4,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0038","messageIndex":13,"role":"user","startLine":6,"endLine":6,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0039","messageIndex":13,"role":"user","startLine":8,"endLine":8,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0040","messageIndex":14,"role":"assistant","startLine":3,"endLine":3,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0041","messageIndex":14,"role":"assistant","startLine":48,"endLine":48,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0042","messageIndex":14,"role":"assistant","startLine":92,"endLine":92,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0043","messageIndex":15,"role":"user","startLine":5,"endLine":5,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0044","messageIndex":15,"role":"user","startLine":6,"endLine":6,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0045","messageIndex":15,"role":"user","startLine":8,"endLine":8,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0046","messageIndex":16,"role":"assistant","startLine":5,"endLine":5,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0047","messageIndex":16,"role":"assistant","startLine":10,"endLine":10,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0048","messageIndex":16,"role":"assistant","startLine":32,"endLine":32,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0049","messageIndex":17,"role":"user","startLine":3,"endLine":3,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0050","messageIndex":17,"role":"user","startLine":6,"endLine":6,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0051","messageIndex":18,"role":"assistant","startLine":10,"endLine":10,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0052","messageIndex":18,"role":"assistant","startLine":45,"endLine":45,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0053","messageIndex":18,"role":"assistant","startLine":50,"endLine":50,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0054","messageIndex":19,"role":"user","startLine":3,"endLine":3,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0055","messageIndex":19,"role":"user","startLine":5,"endLine":5,"category":"next_action","qualityType":"タスク","label":"次作業","reason":"ユーザーが次に進めたい作業・相談内容","priority":"medium","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0056","messageIndex":19,"role":"user","startLine":7,"endLine":7,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0057","messageIndex":20,"role":"assistant","startLine":8,"endLine":8,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0058","messageIndex":20,"role":"assistant","startLine":35,"endLine":35,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0059","messageIndex":20,"role":"assistant","startLine":86,"endLine":86,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0060","messageIndex":21,"role":"user","startLine":4,"endLine":4,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0061","messageIndex":21,"role":"user","startLine":7,"endLine":7,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0062","messageIndex":22,"role":"assistant","startLine":26,"endLine":26,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0063","messageIndex":22,"role":"assistant","startLine":148,"endLine":148,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0064","messageIndex":22,"role":"assistant","startLine":155,"endLine":155,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0065","messageIndex":23,"role":"user","startLine":4,"endLine":4,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0066","messageIndex":23,"role":"user","startLine":6,"endLine":6,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0067","messageIndex":23,"role":"user","startLine":7,"endLine":7,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0068","messageIndex":24,"role":"assistant","startLine":6,"endLine":6,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0069","messageIndex":24,"role":"assistant","startLine":17,"endLine":17,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0070","messageIndex":24,"role":"assistant","startLine":34,"endLine":34,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0071","messageIndex":25,"role":"user","startLine":4,"endLine":4,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0072","messageIndex":25,"role":"user","startLine":6,"endLine":6,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0073","messageIndex":26,"role":"assistant","startLine":1,"endLine":1,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0074","messageIndex":26,"role":"assistant","startLine":10,"endLine":10,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0075","messageIndex":26,"role":"assistant","startLine":23,"endLine":23,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0076","messageIndex":27,"role":"user","startLine":3,"endLine":3,"category":"next_action","qualityType":"タスク","label":"次作業","reason":"ユーザーが次に進めたい作業・相談内容","priority":"medium","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0077","messageIndex":27,"role":"user","startLine":4,"endLine":4,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0078","messageIndex":27,"role":"user","startLine":6,"endLine":6,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0079","messageIndex":28,"role":"assistant","startLine":1,"endLine":1,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0080","messageIndex":28,"role":"assistant","startLine":14,"endLine":14,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0081","messageIndex":28,"role":"assistant","startLine":95,"endLine":95,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0082","messageIndex":29,"role":"user","startLine":3,"endLine":3,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0083","messageIndex":29,"role":"user","startLine":5,"endLine":5,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0084","messageIndex":30,"role":"assistant","startLine":13,"endLine":13,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0085","messageIndex":30,"role":"assistant","startLine":47,"endLine":47,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0086","messageIndex":30,"role":"assistant","startLine":48,"endLine":48,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0087","messageIndex":31,"role":"user","startLine":3,"endLine":3,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0088","messageIndex":31,"role":"user","startLine":5,"endLine":5,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0089","messageIndex":32,"role":"assistant","startLine":8,"endLine":8,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0090","messageIndex":32,"role":"assistant","startLine":56,"endLine":56,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0091","messageIndex":32,"role":"assistant","startLine":76,"endLine":76,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0092","messageIndex":33,"role":"user","startLine":3,"endLine":3,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0093","messageIndex":33,"role":"user","startLine":5,"endLine":5,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0094","messageIndex":33,"role":"user","startLine":11,"endLine":11,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0095","messageIndex":34,"role":"assistant","startLine":23,"endLine":23,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0096","messageIndex":34,"role":"assistant","startLine":38,"endLine":38,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0097","messageIndex":34,"role":"assistant","startLine":60,"endLine":60,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0098","messageIndex":35,"role":"user","startLine":6,"endLine":6,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0099","messageIndex":35,"role":"user","startLine":8,"endLine":8,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0100","messageIndex":35,"role":"user","startLine":11,"endLine":11,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0101","messageIndex":36,"role":"assistant","startLine":2,"endLine":2,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0102","messageIndex":36,"role":"assistant","startLine":7,"endLine":7,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0103","messageIndex":36,"role":"assistant","startLine":54,"endLine":54,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0104","messageIndex":37,"role":"user","startLine":3,"endLine":3,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0105","messageIndex":37,"role":"user","startLine":8,"endLine":8,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0106","messageIndex":37,"role":"user","startLine":14,"endLine":14,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0107","messageIndex":38,"role":"assistant","startLine":22,"endLine":22,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0108","messageIndex":38,"role":"assistant","startLine":56,"endLine":56,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0109","messageIndex":38,"role":"assistant","startLine":58,"endLine":58,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0110","messageIndex":39,"role":"user","startLine":3,"endLine":3,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0111","messageIndex":39,"role":"user","startLine":5,"endLine":5,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0112","messageIndex":39,"role":"user","startLine":7,"endLine":7,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0113","messageIndex":40,"role":"assistant","startLine":19,"endLine":19,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0114","messageIndex":40,"role":"assistant","startLine":59,"endLine":59,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0115","messageIndex":40,"role":"assistant","startLine":73,"endLine":73,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0116","messageIndex":41,"role":"user","startLine":5,"endLine":5,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0117","messageIndex":41,"role":"user","startLine":7,"endLine":7,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0118","messageIndex":41,"role":"user","startLine":9,"endLine":9,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0119","messageIndex":42,"role":"assistant","startLine":1,"endLine":1,"category":"handoff_prompt","qualityType":"引き継ぎ","label":"次AI用プロンプト","reason":"制作AIへ渡す前提またはプロンプト化の内容","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0120","messageIndex":42,"role":"assistant","startLine":2,"endLine":2,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0121","messageIndex":43,"role":"user","startLine":5,"endLine":5,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0122","messageIndex":43,"role":"user","startLine":7,"endLine":7,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0123","messageIndex":43,"role":"user","startLine":15,"endLine":15,"category":"next_action","qualityType":"タスク","label":"次作業","reason":"ユーザーが次に進めたい作業・相談内容","priority":"medium","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0124","messageIndex":44,"role":"assistant","startLine":1,"endLine":1,"category":"design_rule","qualityType":"デザイン","label":"デザイン条件","reason":"見た目・体験設計・方向性に関する条件","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0125","messageIndex":44,"role":"assistant","startLine":3,"endLine":3,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0126","messageIndex":44,"role":"assistant","startLine":4,"endLine":4,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0127","messageIndex":45,"role":"user","startLine":5,"endLine":5,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0128","messageIndex":45,"role":"user","startLine":8,"endLine":8,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0129","messageIndex":45,"role":"user","startLine":16,"endLine":16,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0130","messageIndex":46,"role":"assistant","startLine":2,"endLine":2,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0131","messageIndex":47,"role":"user","startLine":3,"endLine":3,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0132","messageIndex":47,"role":"user","startLine":5,"endLine":5,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0133","messageIndex":47,"role":"user","startLine":10,"endLine":10,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0134","messageIndex":48,"role":"assistant","startLine":22,"endLine":22,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0135","messageIndex":48,"role":"assistant","startLine":32,"endLine":32,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0136","messageIndex":48,"role":"assistant","startLine":107,"endLine":107,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0137","messageIndex":48,"role":"assistant","startLine":110,"endLine":110,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0138","messageIndex":49,"role":"user","startLine":3,"endLine":3,"category":"next_action","qualityType":"タスク","label":"次作業","reason":"ユーザーが次に進めたい作業・相談内容","priority":"medium","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0139","messageIndex":49,"role":"user","startLine":5,"endLine":5,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0140","messageIndex":49,"role":"user","startLine":6,"endLine":6,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0141","messageIndex":50,"role":"assistant","startLine":1,"endLine":1,"category":"design_rule","qualityType":"デザイン","label":"デザイン条件","reason":"見た目・体験設計・方向性に関する条件","priority":"medium","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0142","messageIndex":50,"role":"assistant","startLine":2,"endLine":2,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0143","messageIndex":50,"role":"assistant","startLine":3,"endLine":3,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0144","messageIndex":51,"role":"user","startLine":3,"endLine":3,"category":"user_approval","qualityType":"意図理解","label":"ユーザー承認","reason":"ユーザーの承認・採用判断","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0145","messageIndex":51,"role":"user","startLine":7,"endLine":7,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0146","messageIndex":51,"role":"user","startLine":8,"endLine":8,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0147","messageIndex":52,"role":"assistant","startLine":1,"endLine":1,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0148","messageIndex":52,"role":"assistant","startLine":16,"endLine":16,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0149","messageIndex":52,"role":"assistant","startLine":17,"endLine":17,"category":"must_not","qualityType":"注意・禁止","label":"注意・禁止","reason":"制作時に避ける条件・未確認情報の断定禁止","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0150","messageIndex":53,"role":"user","startLine":3,"endLine":3,"category":"next_action","qualityType":"タスク","label":"次作業","reason":"ユーザーが次に進めたい作業・相談内容","priority":"medium","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0151","messageIndex":53,"role":"user","startLine":5,"endLine":5,"category":"user_intent","qualityType":"意図理解","label":"ユーザー意図","reason":"見た目・体験設計・方向性に関する条件","priority":"high","sourceAuthority":"user_confirmed","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0152","messageIndex":53,"role":"user","startLine":15,"endLine":15,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"user_statement","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0153","messageIndex":54,"role":"assistant","startLine":2,"endLine":2,"category":"adopted_spec","qualityType":"仕様","label":"採用仕様","reason":"制作へ残せる仕様・文言","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0154","messageIndex":54,"role":"assistant","startLine":3,"endLine":3,"category":"verification_gate","qualityType":"課題","label":"確認基準","reason":"完成後に確認する判定基準","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]},{"id":"starry_ann_0155","messageIndex":54,"role":"assistant","startLine":11,"endLine":11,"category":"hold_verify","qualityType":"課題","label":"未確認・保留","reason":"本番前に確認が必要な情報","priority":"high","sourceAuthority":"ai_structured","reuseTarget":["presentation_demo","step2_annotation_view"]}]};

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
      qualityType: safeQualityType(a.qualityType || a.reviewType, a.category)
    };
  }
  function setConversation(raw){
    state.conversation = normalizeConversation(raw);
    state.lineMessages = buildLineMessages(state.conversation);
    state.annotations=[];
    updateStatus();
    renderAll();
  }
  function setAnnotations(raw, options={}){
    const anns = Array.isArray(raw) ? raw : raw.annotations;
    if(!Array.isArray(anns)) throw new Error('annotations[] が見つかりません。');
    state.annotations = anns.map(normalizeAnnotation).filter((a)=>Number.isFinite(a.messageIndex)&&Number.isFinite(a.startLine)&&Number.isFinite(a.endLine));
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
      state.annotations = (same && options.preserveAnnotations !== false && !options.clearAnnotations) ? previousAnnotations : [];
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
    return applySampleAnnotationsForCurrentConversation(options);
  }

  window.KashinoKiClassificationBridge02 = window.KashinoKiClassificationBridge02 || {};
  Object.assign(window.KashinoKiClassificationBridge02, {
    loadConversation(raw){ setConversation(raw); return true; },
    loadAnnotations(raw){ setAnnotations(raw); return true; },
    loadSampleAnnotations(){ return applySampleAnnotationsForCurrentConversation({openPanel:false}); },
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
      el.textContent='未読込：02内の分類反映モードです。サンプルまたはChatGPT会話JSONを読み込んでください。';
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
        return `<span class="ck02-chat-line${anns.length?' is-annotated':''}${isBlankLine?' is-blank-line':''} is-line-style-${escapeHtml(lineStyle)}" data-message-index="${msg.messageIndex}" data-line="${line.line}" data-primary-type="${escapeHtml(primaryType)}" data-line-style="${escapeHtml(lineStyle)}" style="--ck02-line-color:${escapeHtml(color)};--ck02-line-style:${escapeHtml(lineStyle)};" ${typeAttrs}><span class="ck02-line-no">${padLine(line.line)}</span><span class="ck02-line-text">${isBlankLine ? '&nbsp;' : escapeHtml(line.text)}</span>${isBlankLine ? '' : annotationTagsHTML(anns)}</span>`;
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
    const types = lineQualityTypes(messageIndex, line.line);
    const primaryType = types[0] || '';
    const color = primaryType ? (readQualityColors()[primaryType] || QUALITY02_DEFAULT_COLORS[primaryType] || '#ef9cad') : 'transparent';
    const lineStyle = primaryType ? lineStyleForQualityType(primaryType) : 'solid';
    const lineTags = anns.length ? `<span class="ck02-left-line-tags">${anns.map((a)=>{
      const qt = safeQualityType(a.qualityType, a.category);
      if(!qt) return '';
      const chipColor = readQualityColors()[qt] || QUALITY02_DEFAULT_COLORS[qt] || '#dfe7e4';
      const chipText = textColorFor(chipColor);
      return `<span class="ck02-left-line-tag" title="${escapeHtml(a.reason || '')}" style="--ck02-left-chip-color:${escapeHtml(chipColor)};--ck02-left-chip-text:${escapeHtml(chipText)};">${escapeHtml(qt)}</span>`;
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
    const items = COUNT_LABELS.map(([label, filter], index)=>{
      const selected = filter === current || (!current && index === 0);
      const value = Number(counts[filter] || 0);
      const shown = initialZero ? 0 : value;
      return `<button type="button" class="workflow-brief-card kashinoki-filter-button${selected ? ' is-active is-selected' : ''}" role="button" tabindex="0" aria-pressed="${selected ? 'true' : 'false'}" data-review02-filter="${escapeHtml(filter)}" data-quality02-count-card="true" title="${escapeHtml(label)}だけ表示"><span>${escapeHtml(label)}</span><b data-quality-final="${escapeHtml(value)}">${escapeHtml(shown)}</b></button>`;
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
      COUNT_LABELS.forEach(([,filter])=>{
        const b = summary.querySelector(`[data-review02-filter="${cssEscape(filter)}"] b`);
        if(!b) return;
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
          <button class="ck02-btn ck02-btn-primary" id="ck02LoadSample" type="button">3ターンサンプル</button>
          <button class="ck02-btn" id="ck02LoadSampleAnn" type="button">サンプル分類JSON</button>
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
    const title = String(state.conversation?.source?.title || '');
    const sourceFile = String(state.conversation?.sourceFile || '');
    const count = Number(state.conversation?.messages?.length || 0);
    return title.includes('プラネタリウム') || title.includes('星空科学館') || sourceFile.includes('星空科学館') || count >= 20;
  }

  function sampleAnnotationsForCurrentConversation(){
    return currentConversationLooksStarryMuseum() ? starryMuseumClassificationSample : sampleAnnotations;
  }

  function bindEvents(){
    $('#ck02Toggle')?.addEventListener('click',()=>{
      const panel=$('#ck02BridgePanel');
      panel?.classList.toggle('is-open');
      $('#ck02Toggle').textContent=panel?.classList.contains('is-open')?'閉じる':'開く';
    });
    $('#ck02LoadSample')?.addEventListener('click',()=>{
      setConversation(sampleConversation);
      $('#ck02BridgePanel')?.classList.add('is-open');
      $('#ck02Toggle').textContent='閉じる';
    });
    $('#ck02LoadSampleAnn')?.addEventListener('click',()=>{
      $('#ck02AnnotationArea').value=JSON.stringify(sampleAnnotationsForCurrentConversation(),null,2);
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
