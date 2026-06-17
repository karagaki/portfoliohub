window.KASHINOKI_PAGE_DEFINITIONS = {
  FLOW_ALIASES: { 'flow-conversation': 'stage-collect', 'flow-document': 'stage-curate', 'flow-update': 'stage-curate', 'flow-evidence': 'stage-improve' },
  ROUTE_CONFIG: {
    'stage-collect': {
      code: 'A', title: 'AIに意図を正しく理解させる', steps: [
        { label: '回収元', hint: '会話・訂正', page: 'intake', pages: ['intake'] },
        { label: '抽出・採用', hint: '要点を選ぶ', page: 'flow-conversation', pages: ['flow-conversation', 'reviews', 'canonical', 'candidates', 'queue', 'approved'] },
        { label: '活用', hint: 'AI前提へ', page: 'stage-use', pages: ['stage-use', 'flow-use', 'contract', 'pack', 'handoff', 'application'] },
        { label: '現在', hint: '稼働状態', page: 'flow-conversation', pages: [] },
        { label: '不足', hint: '見直し', page: 'stage-collect', pages: ['stage-collect'] }
      ]
    },
    'stage-curate': {
      code: 'B', title: '仕様を積み上げて正本化する', steps: [
        { label: '回収元', hint: '仕様・再開', page: 'intake', pages: ['intake', 'documents'] },
        { label: '抽出・採用', hint: '差分・要点', page: 'flow-document', pages: ['flow-document', 'flow-update', 'reviews', 'candidates', 'queue', 'approved'] },
        { label: '活用', hint: '修正・再開', page: 'stage-use', pages: ['stage-use', 'flow-use', 'contract', 'pack', 'handoff', 'application'] },
        { label: '現在', hint: '稼働状態', page: 'stage-curate', pages: [] },
        { label: '不足', hint: '見直し', page: 'stage-curate', pages: ['stage-curate'] }
      ]
    },
    'stage-improve': {
      code: 'C', title: '同じ課題を繰り返さない', steps: [
        { label: '回収元', hint: '証跡保存', page: 'flow-evidence', pages: ['flow-evidence', 'intake'] },
        { label: '抽出', hint: '失敗・未確認', page: 'stage-improve', pages: [] },
        { label: '活用', hint: '警告・改善', page: 'stage-improve', pages: [] },
        { label: '現在', hint: '保存のみ', page: 'flow-evidence', pages: [] },
        { label: '不足', hint: '未接続', page: 'stage-improve', pages: ['stage-improve'] }
      ]
    },
    'stage-evaluate': {
      code: 'D', title: '制作ノウハウを育てる', steps: [
        { label: '回収元', hint: '画像・評価', page: 'stage-evaluate', pages: [] }, { label: '抽出', hint: '採否理由', page: 'stage-evaluate', pages: [] }, { label: '活用', hint: '次の制作', page: 'stage-evaluate', pages: [] }, { label: '現在', hint: '未接続', page: 'stage-evaluate', pages: [] }, { label: '不足', hint: '入口設計', page: 'stage-evaluate', pages: ['stage-evaluate'] }
      ]
    },
    'stage-outcome': {
      code: 'E', title: '成果物を次の展開へつなげる', steps: [
        { label: '回収元', hint: '成果・条件', page: 'stage-outcome', pages: [] }, { label: '抽出', hint: '阻害要因', page: 'stage-outcome', pages: [] }, { label: '活用', hint: '展開', page: 'stage-outcome', pages: [] }, { label: '現在', hint: '未接続', page: 'stage-outcome', pages: [] }, { label: '不足', hint: '接続設計', page: 'stage-outcome', pages: ['stage-outcome'] }
      ]
    }
  },
  PAGE_FLOW: {
    'unified-backup': 'unified-backup', 'capture-import-queue': 'capture-import-queue', 'project-spec': 'project-spec', 'core-knowledge': 'core-knowledge', 'portfolio-collect': 'portfolio-collect', 'portfolio-quality': 'portfolio-collect', 'portfolio-review': 'portfolio-collect', 'portfolio-current': 'portfolio-collect', 'portfolio-purpose': 'portfolio-collect', 'portfolio-next': 'portfolio-collect', 'system-map': 'system-map', 'display-settings': 'system-map', 'collection-sources': 'system-map', 'meaning-classification': 'system-map', 'target-premise': 'stage-use', 'ai-work-return': 'stage-use', 'target-chronology': 'stage-use', 'target-link-candidates': 'stage-use', 'improvement-actions': 'stage-improve', 'accumulation': 'accumulation', 'target-history': 'accumulation', 'target-flow': 'target-history', 'target-link': 'target-history', 'target-manage': 'target-history', 'target-inbox': 'target-history', 'accum-conversations': 'accumulation', 'accum-documents': 'accumulation', 'accum-candidates': 'accumulation', 'accum-outputs': 'accumulation', 'accum-evidence': 'accumulation', 'artifact-handoff': 'artifact-handoff', 'artifact-spec': 'artifact-spec', 'artifact-countermeasure': 'artifact-countermeasure', 'artifact-design': 'artifact-design', 'artifact-ideas': 'artifact-ideas',
    'stage-collect': 'stage-collect', 'flow-conversation': 'stage-collect', 'intake': 'stage-collect', 'canonical': 'stage-collect',
    'stage-curate': 'stage-curate', 'flow-document': 'stage-curate', 'flow-update': 'stage-curate', 'documents': 'stage-curate', 'reviews': 'stage-curate',
    'stage-improve': 'stage-improve', 'flow-evidence': 'stage-improve',
    'stage-use': 'stage-use', 'flow-use': 'stage-use', 'contract': 'stage-use', 'pack': 'stage-use', 'handoff': 'stage-use', 'application': 'stage-use', 'candidates': 'stage-use', 'queue': 'stage-use', 'approved': 'stage-use',
    'stage-evaluate': 'stage-evaluate', 'stage-outcome': 'stage-outcome',
    'stage-govern': 'stage-govern', 'flow-status': 'stage-govern', 'overview': 'stage-govern', 'boundary': 'stage-govern'
  },
  PAGE_TITLE: {
    'kashinoki-start': 'START', 'unified-backup': 'バックアップ管理（内部）', 'capture-import-queue': 'JSON取込（内部）', 'project-spec': 'プロジェクト仕様正本', 'core-knowledge': '制作知識化と不足検知', 'portfolio-dialogue-sets': '対話セットで見返す', 'portfolio-collect': '会話を集める', 'portfolio-quality': '中身を確かめる', 'portfolio-review': '分類して登録', 'portfolio-current': '今の正解と比べる', 'portfolio-purpose': '使う前提を作る', 'portfolio-next': '取り出して活かす', 'system-map': '全体の流れ', 'display-settings': '設定', 'collection-sources': '回収元を登録・管理', 'meaning-classification': '取り込んだ内容を分類', 'target-premise': 'AI作業へ渡す前提を作る', 'ai-work-return': 'AI作業結果を戻す', 'target-chronology': '対象の流れを追う', 'target-link-candidates': '対象候補を確認', 'improvement-actions': '改善候補・次行動を確認', 'accumulation': '回収後のまとまり', 'target-history': '対象別の経緯', 'target-flow': '対象別の経緯を見る', 'target-link': '対象へ情報を紐付ける', 'target-manage': '対象を登録・管理', 'target-inbox': '情報を取り込む', 'accum-conversations': '保存した会話', 'accum-documents': '保存した仕様・再開正本', 'accum-candidates': '採用した要点', 'accum-outputs': 'AI利用用の出力', 'accum-evidence': '作業結果・課題証跡', 'artifact-intent': 'AI理解前提', 'artifact-handoff': '引き継ぎ書', 'artifact-spec': '仕様正本', 'artifact-countermeasure': '再発防止', 'artifact-design': 'デザイン判断', 'artifact-ideas': '発展・自動化', 'stage-collect': 'AIに意図を正しく理解させる', 'stage-curate': '仕様を積み上げて正本化する', 'stage-improve': '同じ課題を繰り返さない', 'stage-use': '採用情報をAI・制作へ', 'stage-evaluate': '制作ノウハウを育てる', 'stage-outcome': '成果物を次の展開へつなげる', 'stage-govern': '保存領域と保護',
    'flow-conversation': '会話の判断・訂正から採用へ', 'intake': '回収元ファイルを追加', 'canonical': '保存した会話',
    'flow-document': '仕様・引き継ぎ正本から採用へ', 'documents': '保存した仕様・正本', 'flow-update': '保存正本を最新版へ', 'reviews': '追加・更新内容を確認', 'candidates': '抽出した要点', 'queue': '採用する要点を確認', 'approved': '採用した要点・履歴',
    'flow-use': '採用情報をAI活用へ', 'contract': '現在の方針・守ること', 'pack': 'AIへ前提を渡す', 'handoff': '次のチャットへ引き継ぐ', 'application': '次の制作・修正に使う',
    'flow-evidence': 'AI結果・課題証跡を保存', 'flow-status': '現在地から次行動へ', 'overview': '現在の保存状況', 'boundary': '保存先と保護条件'
  },
  PAGE_META: {
    'kashinoki-start': { id: 'START', role: 'AI制作の仕様混乱・再説明・失敗再発を防ぐ導入' }, 'unified-backup': { id: 'BACKUP', role: '本体側の統合バックアップ管理' }, 'capture-import-queue': { id: 'IMPORT', role: '原本版保持と差分補充' }, 'project-spec': { id: 'PROJECT', role: '現在有効な仕様正本' }, 'core-knowledge': { id: 'CORE', role: '原本から知識と不足へ' }, 'portfolio-dialogue-sets': { id: 'DEMO', role: '対話セットの確認' }, 'portfolio-collect': { id: '集', role: '会話・経験・作業結果を集める' }, 'portfolio-quality': { id: '集', role: '集めた内容が伝わる素材か確認' }, 'portfolio-review': { id: '蓄', role: '分類チップを分類して登録' }, 'portfolio-current': { id: '分', role: '今の正解と比べる' }, 'portfolio-purpose': { id: '活', role: '使う前提を作る' }, 'portfolio-next': { id: '活', role: '取り出して活かす' }, 'system-map': { id: 'MAP', role: '全体の流れ' }, 'artifact-intent': { id: 'A', role: 'AI理解前提' }, 'artifact-handoff': { id: 'B', role: '引き継ぎ書' }, 'artifact-spec': { id: 'C', role: '仕様正本' }, 'artifact-countermeasure': { id: 'D', role: '再発防止' }, 'artifact-design': { id: 'E', role: 'デザイン判断' }, 'artifact-ideas': { id: 'F', role: '発展・自動化' },
    'display-settings': { id: 'P40', role: '表示設定' },
    'target-premise': { id: 'P41', role: '分類済み情報をAI作業へ渡す' },
    'ai-work-return': { id: 'P42', role: 'AI作業結果を対象へ戻す' },
    'target-chronology': { id: 'P43', role: '対象別の経緯を時系列で統合' },
    'target-link-candidates': { id: 'P45', role: '対象への紐付け候補を確認' },
    'improvement-actions': { id: 'P46', role: '失敗・訂正から改善候補を確認' },
    'collection-sources': { id: 'P38', role: '回収元の登録と接続状態' },
    'meaning-classification': { id: 'P39', role: '受信内容の意味分類' },
    'ai-classification-bridge': { id: 'P44', role: 'AI分類候補の受け渡し' },
    'accumulation': { id: 'P27', role: '回収後のまとまり一覧' },
    'target-history': { id: 'P33', role: '対象別の経緯入口' },
    'target-inbox': { id: 'P34', role: '対象別受信入口' },
    'target-flow': { id: 'P35', role: '対象別の経緯確認' },
    'target-link': { id: 'P36', role: '対象への情報紐付け' },
    'target-manage': { id: 'P37', role: '対象の登録・管理' },
    'accum-conversations': { id: 'P28', role: '保存した会話' },
    'accum-documents': { id: 'P29', role: '保存した仕様・再開正本' },
    'accum-candidates': { id: 'P30', role: '採用した要点' },
    'accum-outputs': { id: 'P31', role: 'AI利用用の出力' },
    'accum-evidence': { id: 'P32', role: '作業結果・課題証跡' },
    'stage-collect': { id: 'P01', role: 'AI理解のための意図・判断整理' },
    'intake': { id: 'P02', role: '回収元ファイル追加' },
    'flow-conversation': { id: 'P03', role: '会話から採用への工程' },
    'approved': { id: 'P04', role: '採用した要点と履歴' },
    'stage-use': { id: 'P05', role: '採用情報の活用入口' },
    'flow-use': { id: 'P06', role: '採用情報の利用方法' },
    'contract': { id: 'P07', role: '現在の方針・守ること' },
    'pack': { id: 'P08', role: 'AIへ渡す前提情報' },
    'handoff': { id: 'P09', role: '再開用の出力' },
    'application': { id: 'P10', role: '制作・修正への出力' },
    'stage-curate': { id: 'P11', role: '仕様正本化の経路概要と不足確認' },
    'documents': { id: 'P12', role: '保存した仕様・再開正本' },
    'flow-document': { id: 'P13', role: '仕様・再開前提から採用への工程' },
    'flow-update': { id: 'P14', role: '保存内容の更新確認' },
    'stage-improve': { id: 'P15', role: '再発防止の経路概要' },
    'flow-evidence': { id: 'P16', role: '証跡保存と保存状況' },
    'stage-evaluate': { id: 'P17', role: '制作ノウハウ化の接続仕様' },
    'stage-outcome': { id: 'P18', role: '成果展開の接続仕様' },
    'stage-govern': { id: 'P19', role: '保存領域と保護' },
    'flow-status': { id: 'P20', role: '現在地と次行動' },
    'overview': { id: 'P21', role: '現在の保存状況' },
    'reviews': { id: 'P22', role: '追加・更新内容の確認' },
    'canonical': { id: 'P23', role: '保存した会話' },
    'candidates': { id: 'P24', role: '抽出した要点' },
    'queue': { id: 'P25', role: '採用する要点の確認' },
    'boundary': { id: 'P26', role: '保存先と保護条件' }
  },
  CORE_KNOWLEDGE_COPY: {
    disconnected: {
      pill: 'ORIGINAL JSON',
      title: '実回収JSONが未接続です',
      description: '01「会話と資料を整理」でConversation Capture JSONを読み込み、その原本から知識化を開始します。',
      cta: '01でJSONを読み込む',
      dialogueListEmpty: '原本JSON接続後に生成します。',
      dialogueDetailEmpty: '対話セットはまだありません。',
      packageEmpty: '知識パッケージはまだありません。',
      supportEmpty: '不足検知は原本接続後に実行できます。'
    },
    saved: {
      pill: 'ORIGINAL JSON / PRESERVED',
      summaryPrefix: '原本版保存済み / 今回追加 ',
      summaryNewUnit: '件 / 既出 ',
      summaryDuplicateUnit: '件 / 改訂候補 ',
      summaryRevisionUnit: '件 / 欠落警告 ',
      summarySuffix: '件。原本は変更しません。',
      cta: '対話セットを生成・更新',
      dialogueListEmpty: '「対話セットを生成・更新」を押してください。',
      dialogueDetailEmpty: '原本から派生生成すると確認できます。',
      packageEmpty: '選択中の対話セットから要点を格納してください。',
      supportEmpty: '知識パッケージを格納後、不足確認を実行してください。'
    }
  },
  PORTFOLIO_DEFAULT: {
    source_name: 'KASHINOKI_Capture_Backup_2026-05-28_21-19.json',
    source_type: 'Conversation Capture 書出しJSON',
    conversation_count: 1,
    message_count: 62,
    user_count: 35,
    assistant_count: 27,
    candidate_count: 4,
    timeline_count: 62,
    evolution_count: 1,
    contracts: [
      { label: 'Design UI方向', statement: 'Design Tools UIは白寄りの薄灰色に微かな彩度を含む、静かで明るい質感を基準とする。', type: 'design_direction' },
      { label: 'システム自己改善', statement: 'AI workflow Tools自身の不足・改善案・新技術への置換可能性を継続的に見直す。', type: 'principle' },
      { label: '保存境界・禁止', statement: '既存領域や元データを上書きせず、AI workflow Tools側の別領域で扱う。', type: 'invariant' },
      { label: '実装・進行判断', statement: '仕様説明だけで止めず、触って一連を判断できる検証実装へ進める。', type: 'action' }
    ],
    source_note: 'ブラウザChatGPTから回収した書出し結果を元にした表示用サマリーです。会話全文は公開用表示に含めません。'
  },
  PORTFOLIO_USES: [
    { code: 'A', title: '引き継ぎ書', types: ['mission', 'decision', 'context', 'next_action'], desc: '再開時に前提・判断・次行動を渡す' },
    { code: 'B', title: '仕様書', types: ['requirement', 'invariant'], desc: '決定事項・禁止条件を正本候補として残す' },
    { code: 'C', title: '対策書', types: ['failure_evidence', 'unresolved', 'next_action'], desc: '失敗・未解決・確認ゲートを再発防止へ回す' },
    { code: 'D', title: 'デザイン知', types: ['design_direction'], desc: '見た目・導線・判断基準を制作知として残す' },
    { code: 'E', title: '改善課題', types: ['result', 'improvement', 'evolution'], desc: '次に直すこと・仕組み改善へ接続する' }
  ],
  CAPTURE_CATEGORIES: [
    ['mission', '目的・到達目標'],
    ['requirement', '必要機能・工程'],
    ['invariant', '禁止・保護条件'],
    ['design_direction', 'デザイン・表現方針'],
    ['failure_evidence', '課題証跡'],
    ['decision', '採用・却下判断'],
    ['unresolved', '未解決'],
    ['next_action', '次行動'],
    ['result', '作業結果'],
    ['context', '環境・運用事実']
  ],
  MEANING_CATEGORIES: ['意図・判断', '仕様・前提', '訂正・却下', '実行結果', '課題・再発防止', '表現評価', '成果・展開条件', '保留・未分類'],
  DEFAULT_NEUMORPHISM_SETTINGS: { relief: 0.20, blur: 6, light: 1.60, shadow: 1.60, surface: '#efefec', accent: '#962eff' },
  DEFAULT_START_INK_SETTINGS: { outer: '#a6ff6b', duration: 5.0, cleanup: 6.0 },
  PROJECT_SPEC_CATEGORIES: [
    { id: 'purpose', label: '根幹・目的' },
    { id: 'current_spec', label: '現行仕様・機能' },
    { id: 'design_knowhow', label: 'デザイン・ノウハウ' },
    { id: 'guardrail', label: '守る条件・禁止' },
    { id: 'unresolved', label: '未確定・不足' },
    { id: 'next_action', label: '次の再開点' },
    { id: 'idea', label: 'アイデア・将来候補' }
  ],
  WORKFLOW_V140_LABELS: {
    mission: '目的',
    context: '文脈',
    decision: '判断',
    next_action: '次行動',
    invariant: '禁止条件',
    unresolved: '未解決',
    design_direction: 'デザイン知',
    failure_evidence: '対策',
    requirement: '仕様',
    result: '結果',
    improvement: '改善課題',
    evolution: '拡張候補'
  },
  WORKFLOW_V140_USES: [
    { code: 'A', title: '引き継ぎ書', types: ['mission', 'context', 'decision'], desc: '再開時に前提・判断・次行動を渡す' },
    { code: 'B', title: '仕様書', types: ['requirement', 'invariant'], desc: '決定事項・禁止条件を正本候補として残す' },
    { code: 'C', title: '対策書', types: ['failure_evidence', 'unresolved', 'next_action'], desc: '失敗・未解決・確認ゲートを再発防止へ回す' },
    { code: 'D', title: 'デザイン知', types: ['design_direction'], desc: '見た目・導線・判断基準を制作知として残す' },
    { code: 'E', title: '改善課題', types: ['result', 'improvement', 'evolution'], desc: '次に直すこと・仕組み改善へ接続する' }
  ],
  OVERVIEW_PURPOSES: {
    'stage-collect': { title: 'AIに意図を正しく理解させる', desc: '会話・訂正・判断を、次のAIが誤解しない前提へ変換します。', button: 'この目的で進める', page: 'stage-collect', state: '稼働中' },
    'stage-curate': { title: '仕様を積み上げて正本化する', desc: '仮案・採用案・変更理由を、現在有効な仕様へ反映します。', button: 'この目的で進める', page: 'stage-curate', state: '稼働中' },
    'stage-improve': { title: '同じ課題を繰り返さない', desc: '課題・違和感・崩れた原因を、禁止条件や確認条件へ変換します。', button: 'この目的で進める', page: 'stage-improve', state: '稼働中' },
    'stage-evaluate': { title: '制作ノウハウを育てる', desc: 'UI・デザイン・表現判断を、次回制作に使える知識へ蓄積します。', button: '接続準備を見る', page: 'stage-evaluate', state: '未接続' },
    'stage-outcome': { title: '成果物を次の展開へつなげる', desc: '提出・公開・共有・次AI作業へ渡せる状態に整理します。', button: '接続準備を見る', page: 'stage-outcome', state: '未接続' }
  },
  WORKFLOW_GUIDE_PAGES: {
    'portfolio-collect': { step: '集める', title: '会話・経験を集めます', detail: 'ChatGPT / User の会話、作業結果、失敗のきっかけを回収します。' }, 'portfolio-quality': { step: '分ける', title: '集めた中身を確かめます', detail: '内部JSONではなく、会話から何を拾ったかが伝わる状態にします。' }, 'portfolio-review': { step: '分ける', title: '用途別に分けます', detail: '仕様・判断・失敗・禁止条件・次行動へ分け、何に使う情報かを決めます。' }, 'portfolio-current': { step: '分ける', title: '今の正解と比べます', detail: '古い情報や矛盾をそのまま活用しないよう、現在有効な内容と照合します。' }, 'portfolio-purpose': { step: '活かす', title: '使う前提を作ります', detail: '必要な時に取り出せる前提・指示・再発防止条件として整えます。' }, 'portfolio-next': { step: '活かす', title: '取り出して活かします', detail: '人間にもAIにも渡せる形で確認し、次の制作へ再利用します。' },
    'stage-collect': { step: 'STEP 2', title: '会話・訂正・判断を回収します', detail: '現在必要な入力・確認・採用操作を黄色で案内します。' },
    'stage-curate': { step: 'STEP 2', title: '確定仕様と再開前提を整理します', detail: '不足や差分があれば、先へ進む前に確認操作を案内します。' },
    'stage-improve': { step: 'STEP 2', title: '結果・失敗を改善条件へつなげます', detail: '警告そのものではなく、解決する操作を黄色で案内します。' },
    'stage-use': { step: 'STEP 3', title: '採用情報をAI作業へ利用します', detail: '分類・前提作成・結果回収のうち、現在必要な操作へ進みます。' },
    'target-inbox': { step: 'STEP 2', title: '今回扱う情報を対象へ追加します', detail: '対象を指定した後、会話・仕様・結果などのファイルを追加し、内容確認と分類へ進みます。' },
    'target-manage': { step: 'STEP 2-1', title: '受信先を作る対象を登録します', detail: '対象名・種類・目指す状態を設定後、受信入口へ戻って情報を回収します。' },
    'collection-sources': { step: '設定', title: '情報を受け取る回収元を確認します', detail: '必要な回収元が未登録の場合のみ、この設定を先に行います。' },
    'meaning-classification': { step: 'STEP 3', title: '回収内容の意味を確認・確定します', detail: 'AI候補は確定ではありません。採用・修正・保留・却下を判断します。' },
    'target-link-candidates': { step: '確認', title: '正しい対象への紐付けを確認します', detail: '候補を確認した後のみ、対象の経緯へ反映します。' },
    'target-premise': { step: 'STEP 4', title: 'AIへ渡す前提文書を作成します', detail: '確定情報と確認済み改善条件だけを利用対象にします。' },
    'ai-work-return': { step: 'STEP 5', title: 'AI作業の結果を元の前提へ戻します', detail: '対象・前提・結果状態を確認してから保存します。' },
    'improvement-actions': { step: '活かす', title: '次回へ反映する改善条件を確認します', detail: '確認済みにした条件だけを次のAI前提へ反映します。' },
    'stage-evaluate': { step: '準備', title: '制作ノウハウを次回制作へつなぐ工程です', detail: '現在は未接続です。実行操作ではなく、接続準備の確認として扱います。' },
    'stage-outcome': { step: '準備', title: '成果と条件を展開へつなぐ工程です', detail: '現在は未接続です。実行操作ではなく、接続準備の確認として扱います。' },
    'intake': { step: '入力', title: '回収する情報を追加します', detail: '追加後は内容確認と分類の案内へ進みます。' },
    'reviews': { step: '確認', title: '追加された内容を確認します', detail: '確認後、採用判断または分類へ進みます。' },
    'queue': { step: '判断', title: '残す要点を判断します', detail: '採用・保留・却下を確定して次の利用へ進みます。' },
    'pack': { step: '作成', title: 'AIへ渡す文書を確認します', detail: '含める内容と除外内容を確認して利用へ進みます。' },
    'flow-evidence': { step: '入力', title: '結果・失敗の証跡を追加します', detail: '追加した証跡は改善確認へ接続します。' }
  },
  PORTFOLIO_DEMO_SAMPLE: {
    filename: '未読込',
    title: 'デモ未読込',
    message_count: 0,
    user_count: 0,
    assistant_count: 0,
    candidates: [],
    conversation: []
  }
  };
