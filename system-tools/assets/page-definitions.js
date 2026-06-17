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
    "filename": "星空科学館_来館体験と案内ページ設計_v1.4_raw_20260609.json",
    "title": "星空科学館デモ：最新ChatGPT抽出JSONからA〜Fへ回収するサンプル",
    "message_count": 54,
    "user_count": 27,
    "assistant_count": 27,
    "candidates": [
        {
            "capture_candidate_id": "demo_001",
            "suggested_category": "AI理解前提",
            "adopted_category": "AI理解前提",
            "suggested_statement": "施策案ではなく、手元資料から見えることに絞りたいです。",
            "adopted_statement": "施策案ではなく、手元資料から見えることに絞りたいです。",
            "source_label": "A AI理解前提",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 1,
                    "text": "施策案ではなく、手元資料から見えることに絞りたいです。"
                }
            ],
            "demo_output_group": "A"
        },
        {
            "capture_candidate_id": "demo_002",
            "suggested_category": "AI理解前提",
            "adopted_category": "AI理解前提",
            "suggested_statement": "最初からSNSや広告施策へ行くと、原因確認と対策案が混ざりやすいです。",
            "adopted_statement": "最初からSNSや広告施策へ行くと、原因確認と対策案が混ざりやすいです。",
            "source_label": "A AI理解前提",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 2,
                    "text": "最初からSNSや広告施策へ行くと、原因確認と対策案が混ざりやすいです。"
                }
            ],
            "demo_output_group": "A"
        },
        {
            "capture_candidate_id": "demo_003",
            "suggested_category": "AI理解前提",
            "adopted_category": "AI理解前提",
            "suggested_statement": "Webを綺麗にするためではなく、来館前の不安を減らす入口として作る、という位置づけです。",
            "adopted_statement": "Webを綺麗にするためではなく、来館前の不安を減らす入口として作る、という位置づけです。",
            "source_label": "A AI理解前提",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 3,
                    "text": "Webを綺麗にするためではなく、来館前の不安を減らす入口として作る、という位置づけです。"
                }
            ],
            "demo_output_group": "A"
        },
        {
            "capture_candidate_id": "demo_004",
            "suggested_category": "AI理解前提",
            "adopted_category": "AI理解前提",
            "suggested_statement": "星空感が悪いのではなく、順番が違う。\nここを間違えると、また施設紹介と雰囲気だけのページに戻ってしまいます。",
            "adopted_statement": "星空感が悪いのではなく、順番が違う。\nここを間違えると、また施設紹介と雰囲気だけのページに戻ってしまいます。",
            "source_label": "A AI理解前提",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 4,
                    "text": "星空感が悪いのではなく、順番が違う。\nここを間違えると、また施設紹介と雰囲気だけのページに戻ってしまいます。"
                }
            ],
            "demo_output_group": "A"
        },
        {
            "capture_candidate_id": "demo_005",
            "suggested_category": "AI理解前提",
            "adopted_category": "AI理解前提",
            "suggested_statement": "星空感は、余白、小さな星点、見出し周辺の淡い光、カード角の弱い演出で補助する程度が合います。",
            "adopted_statement": "星空感は、余白、小さな星点、見出し周辺の淡い光、カード角の弱い演出で補助する程度が合います。",
            "source_label": "A AI理解前提",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 5,
                    "text": "星空感は、余白、小さな星点、見出し周辺の淡い光、カード角の弱い演出で補助する程度が合います。"
                }
            ],
            "demo_output_group": "A"
        },
        {
            "capture_candidate_id": "demo_006",
            "suggested_category": "AI理解前提",
            "adopted_category": "AI理解前提",
            "suggested_statement": "人間側がAIの案をそのまま採用するのではなく、資料と照らして違和感の正体を見つける。",
            "adopted_statement": "人間側がAIの案をそのまま採用するのではなく、資料と照らして違和感の正体を見つける。",
            "source_label": "A AI理解前提",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 6,
                    "text": "人間側がAIの案をそのまま採用するのではなく、資料と照らして違和感の正体を見つける。"
                }
            ],
            "demo_output_group": "A"
        },
        {
            "capture_candidate_id": "demo_007",
            "suggested_category": "引き継ぎ",
            "adopted_category": "引き継ぎ",
            "suggested_statement": "パンフは展示名と設備説明が多いです。\n見出しも「宇宙展示室」「太陽系模型」「プラネタリウム設備」みたいな感じです。",
            "adopted_statement": "パンフは展示名と設備説明が多いです。\n見出しも「宇宙展示室」「太陽系模型」「プラネタリウム設備」みたいな感じです。",
            "source_label": "B 引き継ぎ書",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 7,
                    "text": "パンフは展示名と設備説明が多いです。\n見出しも「宇宙展示室」「太陽系模型」「プラネタリウム設備」みたいな感じです。"
                }
            ],
            "demo_output_group": "B"
        },
        {
            "capture_candidate_id": "demo_008",
            "suggested_category": "引き継ぎ",
            "adopted_category": "引き継ぎ",
            "suggested_statement": "アンケートには「屋上で本物の星を見たのを子どもが帰ってから話していた」「星座カードを家で見返していた」みたいな回答があります。\n設備名より、体験の方が残っている感じがします。",
            "adopted_statement": "アンケートには「屋上で本物の星を見たのを子どもが帰ってから話していた」「星座カードを家で見返していた」みたいな回答があります。\n設備名より、体験の方が残っている感じがします。",
            "source_label": "B 引き継ぎ書",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 8,
                    "text": "アンケートには「屋上で本物の星を見たのを子どもが帰ってから話していた」「星座カードを家で見返していた」みたいな回答があります。\n設備名より、体験の方が残っている感じがします。"
                }
            ],
            "demo_output_group": "B"
        },
        {
            "capture_candidate_id": "demo_009",
            "suggested_category": "引き継ぎ",
            "adopted_category": "引き継ぎ",
            "suggested_statement": "既存ページのスクショもあります。\nトップに星空写真と施設紹介があり、その下に展示一覧があります。",
            "adopted_statement": "既存ページのスクショもあります。\nトップに星空写真と施設紹介があり、その下に展示一覧があります。",
            "source_label": "B 引き継ぎ書",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 9,
                    "text": "既存ページのスクショもあります。\nトップに星空写真と施設紹介があり、その下に展示一覧があります。"
                }
            ],
            "demo_output_group": "B"
        },
        {
            "capture_candidate_id": "demo_010",
            "suggested_category": "引き継ぎ",
            "adopted_category": "引き継ぎ",
            "suggested_statement": "ここでやっと、この科学館の見え方が変わった気がします。\n\n最初は「来館者が減っている施設をどう改善するか」くらいの話でした。\nでも今は、来館前の不安を減らして、館内の体験につなげて、帰った後に空を見るところまで残す話に見えてきています。",
            "adopted_statement": "ここでやっと、この科学館の見え方が変わった気がします。\n\n最初は「来館者が減っている施設をどう改善するか」くらいの話でした。\nでも今は、来館前の不安を減らして、館内の体験につなげて、帰った後に空を見るところまで残す話に見えてきています。",
            "source_label": "B 引き継ぎ書",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 10,
                    "text": "ここでやっと、この科学館の見え方が変わった気がします。\n\n最初は「来館者が減っている施設をどう改善するか」くらいの話でした。\nでも今は、来館前の不安を減らして、館内の体験につなげて、帰った後に空を見るところまで残す話に見えてきています。"
                }
            ],
            "demo_output_group": "B"
        },
        {
            "capture_candidate_id": "demo_011",
            "suggested_category": "引き継ぎ",
            "adopted_category": "引き継ぎ",
            "suggested_statement": "最後に、次のAIへ渡すなら最初に何を読ませるべきかも短く残してください。\n次回はファーストビュー案、3カード文面、星座カードの見せ方から再開したいです。",
            "adopted_statement": "最後に、次のAIへ渡すなら最初に何を読ませるべきかも短く残してください。\n次回はファーストビュー案、3カード文面、星座カードの見せ方から再開したいです。",
            "source_label": "B 引き継ぎ書",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 11,
                    "text": "最後に、次のAIへ渡すなら最初に何を読ませるべきかも短く残してください。\n次回はファーストビュー案、3カード文面、星座カードの見せ方から再開したいです。"
                }
            ],
            "demo_output_group": "B"
        },
        {
            "capture_candidate_id": "demo_012",
            "suggested_category": "仕様",
            "adopted_category": "仕様",
            "suggested_statement": "目的は、親子連れ・初回来館者が30秒以内に行けるか判断できること。\n最初に出す情報は、今日行けるか、何歳から楽しめるか、所要時間、予約要否、雨天時対応、アクセスの安心感です。",
            "adopted_statement": "目的は、親子連れ・初回来館者が30秒以内に行けるか判断できること。\n最初に出す情報は、今日行けるか、何歳から楽しめるか、所要時間、予約要否、雨天時対応、アクセスの安心感です。",
            "source_label": "C 仕様正本",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 12,
                    "text": "目的は、親子連れ・初回来館者が30秒以内に行けるか判断できること。\n最初に出す情報は、今日行けるか、何歳から楽しめるか、所要時間、予約要否、雨天時対応、アクセスの安心感です。"
                }
            ],
            "demo_output_group": "C"
        },
        {
            "capture_candidate_id": "demo_013",
            "suggested_category": "仕様",
            "adopted_category": "仕様",
            "suggested_statement": "では、来館案内ページの最初は、見出し、確認チップ、3カードの順が良さそうです。",
            "adopted_statement": "では、来館案内ページの最初は、見出し、確認チップ、3カードの順が良さそうです。",
            "source_label": "C 仕様正本",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 13,
                    "text": "では、来館案内ページの最初は、見出し、確認チップ、3カードの順が良さそうです。"
                }
            ],
            "demo_output_group": "C"
        },
        {
            "capture_candidate_id": "demo_014",
            "suggested_category": "仕様",
            "adopted_category": "仕様",
            "suggested_statement": "確認チップは「対象年齢」「所要時間」「予約」「雨天時」程度に絞ります。\n3カードは「今日行ける？」「何歳から楽しめる？」「どれくらい時間がかかる？」を候補にできます。",
            "adopted_statement": "確認チップは「対象年齢」「所要時間」「予約」「雨天時」程度に絞ります。\n3カードは「今日行ける？」「何歳から楽しめる？」「どれくらい時間がかかる？」を候補にできます。",
            "source_label": "C 仕様正本",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 14,
                    "text": "確認チップは「対象年齢」「所要時間」「予約」「雨天時」程度に絞ります。\n3カードは「今日行ける？」「何歳から楽しめる？」「どれくらい時間がかかる？」を候補にできます。"
                }
            ],
            "demo_output_group": "C"
        },
        {
            "capture_candidate_id": "demo_015",
            "suggested_category": "仕様",
            "adopted_category": "仕様",
            "suggested_statement": "PCでは3カード横並び、スマホでは1列。\n本文は15px未満にせず、カード説明は2行以内、詳細リンクは各カード1つまでに抑えると見やすいです。",
            "adopted_statement": "PCでは3カード横並び、スマホでは1列。\n本文は15px未満にせず、カード説明は2行以内、詳細リンクは各カード1つまでに抑えると見やすいです。",
            "source_label": "C 仕様正本",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 15,
                    "text": "PCでは3カード横並び、スマホでは1列。\n本文は15px未満にせず、カード説明は2行以内、詳細リンクは各カード1つまでに抑えると見やすいです。"
                }
            ],
            "demo_output_group": "C"
        },
        {
            "capture_candidate_id": "demo_016",
            "suggested_category": "仕様",
            "adopted_category": "仕様",
            "suggested_statement": "1枚目は「今日行ける？」として、開館日、予約要否、雨天時の確認へつなげます。\n2枚目は「何歳から楽しめる？」として、対象年齢や体験の難しさを扱います。\n3枚目は「どれくらい時間がかかる？」として、滞在目安と観測会の有無を扱います。",
            "adopted_statement": "1枚目は「今日行ける？」として、開館日、予約要否、雨天時の確認へつなげます。\n2枚目は「何歳から楽しめる？」として、対象年齢や体験の難しさを扱います。\n3枚目は「どれくらい時間がかかる？」として、滞在目安と観測会の有無を扱います。",
            "source_label": "C 仕様正本",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 16,
                    "text": "1枚目は「今日行ける？」として、開館日、予約要否、雨天時の確認へつなげます。\n2枚目は「何歳から楽しめる？」として、対象年齢や体験の難しさを扱います。\n3枚目は「どれくらい時間がかかる？」として、滞在目安と観測会の有無を扱います。"
                }
            ],
            "demo_output_group": "C"
        },
        {
            "capture_candidate_id": "demo_017",
            "suggested_category": "仕様",
            "adopted_category": "仕様",
            "suggested_statement": "上部の3カードは「行けるかどうかの判断」。\nその下の体験カードは「行ったら何が残るか」。",
            "adopted_statement": "上部の3カードは「行けるかどうかの判断」。\nその下の体験カードは「行ったら何が残るか」。",
            "source_label": "C 仕様正本",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 17,
                    "text": "上部の3カードは「行けるかどうかの判断」。\nその下の体験カードは「行ったら何が残るか」。"
                }
            ],
            "demo_output_group": "C"
        },
        {
            "capture_candidate_id": "demo_018",
            "suggested_category": "再発防止",
            "adopted_category": "再発防止",
            "suggested_statement": "料金・営業時間・予約方式も未確認です。\n\nここをAIがそれっぽく埋めると、本番文言と混ざって危ないです。",
            "adopted_statement": "料金・営業時間・予約方式も未確認です。\n\nここをAIがそれっぽく埋めると、本番文言と混ざって危ないです。",
            "source_label": "D 再発防止",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 18,
                    "text": "料金・営業時間・予約方式も未確認です。\n\nここをAIがそれっぽく埋めると、本番文言と混ざって危ないです。"
                }
            ],
            "demo_output_group": "D"
        },
        {
            "capture_candidate_id": "demo_019",
            "suggested_category": "再発防止",
            "adopted_category": "再発防止",
            "suggested_statement": "仮の画面を作っているだけなのに、自然な文章として入ると、数日後に見返した時に「これは確認済みなのか」「AIが埋めただけなのか」が分からなくなる。",
            "adopted_statement": "仮の画面を作っているだけなのに、自然な文章として入ると、数日後に見返した時に「これは確認済みなのか」「AIが埋めただけなのか」が分からなくなる。",
            "source_label": "D 再発防止",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 19,
                    "text": "仮の画面を作っているだけなのに、自然な文章として入ると、数日後に見返した時に「これは確認済みなのか」「AIが埋めただけなのか」が分からなくなる。"
                }
            ],
            "demo_output_group": "D"
        },
        {
            "capture_candidate_id": "demo_020",
            "suggested_category": "再発防止",
            "adopted_category": "再発防止",
            "suggested_statement": "この混ざり方が一番怖いです。\nなので、見た目の仮案でも、未確認は未確認として表示したいです。\nここはデザインの都合より優先したいです。",
            "adopted_statement": "この混ざり方が一番怖いです。\nなので、見た目の仮案でも、未確認は未確認として表示したいです。\nここはデザインの都合より優先したいです。",
            "source_label": "D 再発防止",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 20,
                    "text": "この混ざり方が一番怖いです。\nなので、見た目の仮案でも、未確認は未確認として表示したいです。\nここはデザインの都合より優先したいです。"
                }
            ],
            "demo_output_group": "D"
        },
        {
            "capture_candidate_id": "demo_021",
            "suggested_category": "再発防止",
            "adopted_category": "再発防止",
            "suggested_statement": "チップ内でも「予約：要確認」「所要時間：目安掲載予定」のように、未確定であることを残します。\nこれにより、仮文言と公開文面が混ざる事故を防げます。",
            "adopted_statement": "チップ内でも「予約：要確認」「所要時間：目安掲載予定」のように、未確定であることを残します。\nこれにより、仮文言と公開文面が混ざる事故を防げます。",
            "source_label": "D 再発防止",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 21,
                    "text": "チップ内でも「予約：要確認」「所要時間：目安掲載予定」のように、未確定であることを残します。\nこれにより、仮文言と公開文面が混ざる事故を防げます。"
                }
            ],
            "demo_output_group": "D"
        },
        {
            "capture_candidate_id": "demo_022",
            "suggested_category": "再発防止",
            "adopted_category": "再発防止",
            "suggested_statement": "屋上観測会も主役にしたい気持ちはありますが、開催日が限られるなら最初に大きく出しすぎるのは危ないですね。",
            "adopted_statement": "屋上観測会も主役にしたい気持ちはありますが、開催日が限られるなら最初に大きく出しすぎるのは危ないですね。",
            "source_label": "D 再発防止",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 22,
                    "text": "屋上観測会も主役にしたい気持ちはありますが、開催日が限られるなら最初に大きく出しすぎるのは危ないですね。"
                }
            ],
            "demo_output_group": "D"
        },
        {
            "capture_candidate_id": "demo_023",
            "suggested_category": "再発防止",
            "adopted_category": "再発防止",
            "suggested_statement": "屋上観測会は魅力として強いですが、開催日が月数回なら、常時体験できるように見せるのは避けたいです。",
            "adopted_statement": "屋上観測会は魅力として強いですが、開催日が月数回なら、常時体験できるように見せるのは避けたいです。",
            "source_label": "D 再発防止",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 23,
                    "text": "屋上観測会は魅力として強いですが、開催日が月数回なら、常時体験できるように見せるのは避けたいです。"
                }
            ],
            "demo_output_group": "D"
        },
        {
            "capture_candidate_id": "demo_024",
            "suggested_category": "デザイン",
            "adopted_category": "デザイン",
            "suggested_statement": "ここで少し見え方が変わりますね。\n\n展示物を説明する施設だと思っていましたが、来館者の記憶はそこではない気がします。",
            "adopted_statement": "ここで少し見え方が変わりますね。\n\n展示物を説明する施設だと思っていましたが、来館者の記憶はそこではない気がします。",
            "source_label": "E デザイン判断",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 24,
                    "text": "ここで少し見え方が変わりますね。\n\n展示物を説明する施設だと思っていましたが、来館者の記憶はそこではない気がします。"
                }
            ],
            "demo_output_group": "E"
        },
        {
            "capture_candidate_id": "demo_025",
            "suggested_category": "デザイン",
            "adopted_category": "デザイン",
            "suggested_statement": "たぶんAIに任せると、最初にこういう絵として綺麗な方向へ行きやすいんですよね。",
            "adopted_statement": "たぶんAIに任せると、最初にこういう絵として綺麗な方向へ行きやすいんですよね。",
            "source_label": "E デザイン判断",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 25,
                    "text": "たぶんAIに任せると、最初にこういう絵として綺麗な方向へ行きやすいんですよね。"
                }
            ],
            "demo_output_group": "E"
        },
        {
            "capture_candidate_id": "demo_026",
            "suggested_category": "デザイン",
            "adopted_category": "デザイン",
            "suggested_statement": "綺麗な星空サイトを作る話ではなく、親が「今日行って大丈夫か」と判断できて、その先に子どもの記憶が残る流れを作る話なんだと思います。",
            "adopted_statement": "綺麗な星空サイトを作る話ではなく、親が「今日行って大丈夫か」と判断できて、その先に子どもの記憶が残る流れを作る話なんだと思います。",
            "source_label": "E デザイン判断",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 26,
                    "text": "綺麗な星空サイトを作る話ではなく、親が「今日行って大丈夫か」と判断できて、その先に子どもの記憶が残る流れを作る話なんだと思います。"
                }
            ],
            "demo_output_group": "E"
        },
        {
            "capture_candidate_id": "demo_027",
            "suggested_category": "デザイン",
            "adopted_category": "デザイン",
            "suggested_statement": "アニメーションも常時流れる星ではなく、見出し、判断カード、予約導線が順に出る程度で十分です。",
            "adopted_statement": "アニメーションも常時流れる星ではなく、見出し、判断カード、予約導線が順に出る程度で十分です。",
            "source_label": "E デザイン判断",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 27,
                    "text": "アニメーションも常時流れる星ではなく、見出し、判断カード、予約導線が順に出る程度で十分です。"
                }
            ],
            "demo_output_group": "E"
        },
        {
            "capture_candidate_id": "demo_028",
            "suggested_category": "デザイン",
            "adopted_category": "デザイン",
            "suggested_statement": "「今日行ける？」は分かりやすいですが、少し軽く見えます。\n\n親がスマホで移動中に見ても迷わないことが大事なので、予約や雨天時も含めて判断できるカードにしたいです。",
            "adopted_statement": "「今日行ける？」は分かりやすいですが、少し軽く見えます。\n\n親がスマホで移動中に見ても迷わないことが大事なので、予約や雨天時も含めて判断できるカードにしたいです。",
            "source_label": "E デザイン判断",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 28,
                    "text": "「今日行ける？」は分かりやすいですが、少し軽く見えます。\n\n親がスマホで移動中に見ても迷わないことが大事なので、予約や雨天時も含めて判断できるカードにしたいです。"
                }
            ],
            "demo_output_group": "E"
        },
        {
            "capture_candidate_id": "demo_029",
            "suggested_category": "デザイン",
            "adopted_category": "デザイン",
            "suggested_statement": "星座カードはかなり気になります。\n\nこれは単なる配布物ではなくて、家に帰ったあとに親子で空を見るきっかけになっている可能性があります。",
            "adopted_statement": "星座カードはかなり気になります。\n\nこれは単なる配布物ではなくて、家に帰ったあとに親子で空を見るきっかけになっている可能性があります。",
            "source_label": "E デザイン判断",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 29,
                    "text": "星座カードはかなり気になります。\n\nこれは単なる配布物ではなくて、家に帰ったあとに親子で空を見るきっかけになっている可能性があります。"
                }
            ],
            "demo_output_group": "E"
        },
        {
            "capture_candidate_id": "demo_030",
            "suggested_category": "デザイン",
            "adopted_category": "デザイン",
            "suggested_statement": "展示がすごい、設備がすごい、という方向では大きい施設に勝てないかもしれません。\nでも、帰り道や家で子どもが空を見上げるなら、この科学館に行く意味がちゃんとある。",
            "adopted_statement": "展示がすごい、設備がすごい、という方向では大きい施設に勝てないかもしれません。\nでも、帰り道や家で子どもが空を見上げるなら、この科学館に行く意味がちゃんとある。",
            "source_label": "E デザイン判断",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 30,
                    "text": "展示がすごい、設備がすごい、という方向では大きい施設に勝てないかもしれません。\nでも、帰り道や家で子どもが空を見上げるなら、この科学館に行く意味がちゃんとある。"
                }
            ],
            "demo_output_group": "E"
        },
        {
            "capture_candidate_id": "demo_031",
            "suggested_category": "発展タスク",
            "adopted_category": "発展タスク",
            "suggested_statement": "ただ、これを初期の来館案内ページに全部入れると重くなるので、今回は入口に少しだけ見せたいです。\n詳しい展開は後ろに回して、発展タスクとして残したいです。",
            "adopted_statement": "ただ、これを初期の来館案内ページに全部入れると重くなるので、今回は入口に少しだけ見せたいです。\n詳しい展開は後ろに回して、発展タスクとして残したいです。",
            "source_label": "F 発展タスク",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 31,
                    "text": "ただ、これを初期の来館案内ページに全部入れると重くなるので、今回は入口に少しだけ見せたいです。\n詳しい展開は後ろに回して、発展タスクとして残したいです。"
                }
            ],
            "demo_output_group": "F"
        },
        {
            "capture_candidate_id": "demo_032",
            "suggested_category": "発展タスク",
            "adopted_category": "発展タスク",
            "suggested_statement": "後続では、星座カードの持ち帰り導線、夜に親子で空を見る導線、次の観測会への再来館導線へ広げられます。",
            "adopted_statement": "後続では、星座カードの持ち帰り導線、夜に親子で空を見る導線、次の観測会への再来館導線へ広げられます。",
            "source_label": "F 発展タスク",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "ASSISTANT",
                    "order": 32,
                    "text": "後続では、星座カードの持ち帰り導線、夜に親子で空を見る導線、次の観測会への再来館導線へ広げられます。"
                }
            ],
            "demo_output_group": "F"
        },
        {
            "capture_candidate_id": "demo_033",
            "suggested_category": "発展タスク",
            "adopted_category": "発展タスク",
            "suggested_statement": "次回は、ファーストビューと3カード文面だけでなく、星座カードをどの程度見せるかも続きで見たいです。",
            "adopted_statement": "次回は、ファーストビューと3カード文面だけでなく、星座カードをどの程度見せるかも続きで見たいです。",
            "source_label": "F 発展タスク",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 33,
                    "text": "次回は、ファーストビューと3カード文面だけでなく、星座カードをどの程度見せるかも続きで見たいです。"
                }
            ],
            "demo_output_group": "F"
        },
        {
            "capture_candidate_id": "demo_034",
            "suggested_category": "発展タスク",
            "adopted_category": "発展タスク",
            "suggested_statement": "雨の日シアターは雨でも行く理由になるので使いたいですが、常設かどうかは確認が必要です。\n魅力としては残しつつ、断定しない出し方にしたいです。",
            "adopted_statement": "雨の日シアターは雨でも行く理由になるので使いたいですが、常設かどうかは確認が必要です。\n魅力としては残しつつ、断定しない出し方にしたいです。",
            "source_label": "F 発展タスク",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 34,
                    "text": "雨の日シアターは雨でも行く理由になるので使いたいですが、常設かどうかは確認が必要です。\n魅力としては残しつつ、断定しない出し方にしたいです。"
                }
            ],
            "demo_output_group": "F"
        },
        {
            "capture_candidate_id": "demo_035",
            "suggested_category": "発展タスク",
            "adopted_category": "発展タスク",
            "suggested_statement": "発展タスクとしては、星座カードの持ち帰り導線、雨の日コース、観測会詳細ページは残したいです。",
            "adopted_statement": "発展タスクとしては、星座カードの持ち帰り導線、雨の日コース、観測会詳細ページは残したいです。",
            "source_label": "F 発展タスク",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 35,
                    "text": "発展タスクとしては、星座カードの持ち帰り導線、雨の日コース、観測会詳細ページは残したいです。"
                }
            ],
            "demo_output_group": "F"
        },
        {
            "capture_candidate_id": "demo_036",
            "suggested_category": "発展タスク",
            "adopted_category": "発展タスク",
            "suggested_statement": "SNSや学校連携はさらに後でいいです。\n全部を同じ後回しにすると、次に見た時にまた迷うので、体験に近いものを近い発展候補として残したいです。",
            "adopted_statement": "SNSや学校連携はさらに後でいいです。\n全部を同じ後回しにすると、次に見た時にまた迷うので、体験に近いものを近い発展候補として残したいです。",
            "source_label": "F 発展タスク",
            "review_state": "raw_original",
            "usable_for_current_state": true,
            "relation": "new",
            "compare_relation": "new",
            "current_relation": "new",
            "evidence": [
                {
                    "role": "USER",
                    "order": 36,
                    "text": "SNSや学校連携はさらに後でいいです。\n全部を同じ後回しにすると、次に見た時にまた迷うので、体験に近いものを近い発展候補として残したいです。"
                }
            ],
            "demo_output_group": "F"
        }
    ],
    "conversation": [
        {
            "role": "User",
            "text": "地方の小さな星空科学館で来館者が減っている場合、まず何を見れば原因が分かりますか。"
        },
        {
            "role": "ChatGPT",
            "text": "まずは来館者数だけでなく、「来る前に何を見ているか」と「来た後に何が記憶に残っているか」を分けて見るのがよいです。\n手元資料なら、古いパンフレット、来館者アンケート、イベント一覧、既存ページを確認します。\n可能なら問い合わせ内容や、予約前に離脱していそうな箇所も見たいです。\nSNS、学校連携、広告、地域イベントなども候補にはなりますが、最初からそこへ行くと、原因確認と対策案が混ざりやすいです。"
        },
        {
            "role": "User",
            "text": "施策案ではなく、手元資料から見えることに絞りたいです。"
        },
        {
            "role": "ChatGPT",
            "text": "では、資料ごとに役割を分けて見ます。\nパンフレットは「施設側が何を伝えようとしているか」。\nアンケートは「来館者に何が残っているか」。\n既存ページは「来館前に判断できるか」。\nこの3つを比べると、単なる情報不足なのか、伝えている内容と残っている体験がズレているのかを分けやすくなります。"
        },
        {
            "role": "User",
            "text": "パンフは展示名と設備説明が多いです。\n見出しも「宇宙展示室」「太陽系模型」「プラネタリウム設備」みたいな感じです。"
        },
        {
            "role": "ChatGPT",
            "text": "それだと、施設側の言葉はかなり設備寄りです。\n悪いわけではありませんが、初めて行く親子にとっては「結局、うちの子は楽しめるのか」「どのくらい時間がかかるのか」が見えにくい可能性があります。\nパンフレットの情報は施設説明としては使えます。\nただし来館前の入口では、展示名よりも、親が判断する材料へ翻訳する必要がありそうです。"
        },
        {
            "role": "User",
            "text": "アンケートには「屋上で本物の星を見たのを子どもが帰ってから話していた」「星座カードを家で見返していた」みたいな回答があります。\n設備名より、体験の方が残っている感じがします。"
        },
        {
            "role": "ChatGPT",
            "text": "そこはかなり強い材料です。\n来館者に残っているのは、展示名そのものではなく、親子の会話や帰宅後の行動です。\n屋上観測会はその場の体験、星座カードは持ち帰り、雨の日シアターは不安を覆した体験です。\nつまり、この科学館の価値は「展示を見る」だけではなく、家に帰ってから星を見たくなる体験にあるかもしれません。"
        },
        {
            "role": "User",
            "text": "ここで少し見え方が変わりますね。\n\n展示物を説明する施設だと思っていましたが、来館者の記憶はそこではない気がします。\n屋上で星を見たことや、家でカードを見返したことが残っているなら、施設の価値は「展示物そのもの」より後に続く体験なのかもしれません。\n\nそうなると、ページで最初に見せるものも変わりそうです。"
        },
        {
            "role": "ChatGPT",
            "text": "はい。そこがこの資料から見える一番大きな変化です。\n施設側は設備を説明している。\n来館者は体験の余韻を覚えている。\nこのズレをそのまま放置すると、来館前の人には価値が伝わりにくいです。\n来館案内では、「行く前に分かる安心」と「行った後に残る体験」をつなげる必要があります。"
        },
        {
            "role": "User",
            "text": "既存ページのスクショもあります。\nトップに星空写真と施設紹介があり、その下に展示一覧があります。"
        },
        {
            "role": "ChatGPT",
            "text": "その構成だと、雰囲気と施設説明はありますが、親子連れが最初に判断したい情報が下に埋もれている可能性があります。\nたとえば「今日行けるか」「何歳から楽しめるか」「予約が必要か」「雨の日でも意味があるか」がすぐ見えないと、興味はあっても候補から外れやすいです。\nここで初めて、改善対象として来館案内ページが出てきます。\nWebを綺麗にするためではなく、来館前の不安を減らす入口として作る、という位置づけです。"
        },
        {
            "role": "User",
            "text": "一度、AIが普通に作りそうなファーストビュー案を出すとどうなりますか。\nあえて、よくある綺麗な星空サイト案を見てみたいです。"
        },
        {
            "role": "ChatGPT",
            "text": "よくある案だと、濃紺背景に大きな星空写真を敷き、白文字で「星降る夜に、親子で宇宙と出会う」などのコピーを置く構成です。\nその下に、施設紹介、展示一覧、イベント情報、アクセス、予約ボタンを並べる形になります。\n見た目は星空らしくなりますが、判断材料は後ろに回りがちです。\n特にスマホでは、写真とコピーが大きいほど、予約・所要時間・対象年齢・雨天時案内が見つけにくくなります。"
        },
        {
            "role": "User",
            "text": "ああ、これです。"
        },
        {
            "role": "ChatGPT",
            "text": "はい。見た目としては分かりやすい星空サイトですが、今回の資料から見えた課題とは少しズレている可能性があります。\n写真やコピーを大きく見せるほど、親が最初に判断したい情報が下へ流れます。\nこの案を比較対象にすると、今回必要なページの方向が逆に見えやすくなります。"
        },
        {
            "role": "User",
            "text": "たぶんAIに任せると、最初にこういう絵として綺麗な方向へ行きやすいんですよね。\n\nでも資料を見ると、来館者が覚えているのは「星空っぽい画面」ではなくて、屋上で本物の星を見たことや、子どもが星座カードを家で見返していたことです。\n綺麗な星空サイトを作る話ではなく、親が「今日行って大丈夫か」と判断できて、その先に子どもの記憶が残る流れを作る話なんだと思います。\n\n星空感が悪いのではなく、順番が違う。\nここを間違えると、また施設紹介と雰囲気だけのページに戻ってしまいます。"
        },
        {
            "role": "ChatGPT",
            "text": "その整理は、このページの方向を決める軸になります。\n否定すべきなのは星空感ではなく、星空演出を主役にして判断材料を後ろへ回すことです。\n親が最初に必要とするのは、今日行けるか、何歳から楽しめるか、予約が必要か、雨の日でも意味があるかです。\n星空感は、余白、小さな星点、見出し周辺の淡い光、カード角の弱い演出で補助する程度が合います。\nアニメーションも常時流れる星ではなく、見出し、判断カード、予約導線が順に出る程度で十分です。"
        },
        {
            "role": "User",
            "text": "この比較はプレゼンで見せたいです。\n\n単にAIが間違えた話ではなく、AIが出した普通の案を見たことで、こちらの判断がはっきりした感じがあります。\n人間側がAIの案をそのまま採用するのではなく、資料と照らして違和感の正体を見つける。\n\nこの判断の瞬間を残せることが大事だと思います。"
        },
        {
            "role": "ChatGPT",
            "text": "はい。ここは単なるデザイン修正ではなく、判断の転換点です。\nAIの普通案が、結果的に比較対象になり、User側の判断を引き出しています。\nこの会話からは「幻想的な星空演出を主役にしない」「判断材料を先に置く」「資料から見える価値を優先する」という前提を抽出できます。\nつまり、次のAIが同じ方向へ戻らないための判断材料になります。"
        },
        {
            "role": "User",
            "text": "では、来館案内ページの最初は、見出し、確認チップ、3カードの順が良さそうです。"
        },
        {
            "role": "ChatGPT",
            "text": "構成として自然です。\n見出しは短くし、確認チップは「対象年齢」「所要時間」「予約」「雨天時」程度に絞ります。\n3カードは「今日行ける？」「何歳から楽しめる？」「どれくらい時間がかかる？」を候補にできます。\nPCでは3カード横並び、スマホでは1列。\n本文は15px未満にせず、カード説明は2行以内、詳細リンクは各カード1つまでに抑えると見やすいです。"
        },
        {
            "role": "User",
            "text": "「今日行ける？」は分かりやすいですが、少し軽く見えます。\n\n親がスマホで移動中に見ても迷わないことが大事なので、予約や雨天時も含めて判断できるカードにしたいです。\n軽い言葉に見えても、中身は実用に寄せたいです。"
        },
        {
            "role": "ChatGPT",
            "text": "では、見出しは軽くても、本文で実用情報につなげる形がよいです。\n1枚目は「今日行ける？」として、開館日、予約要否、雨天時の確認へつなげます。\n2枚目は「何歳から楽しめる？」として、対象年齢や体験の難しさを扱います。\n3枚目は「どれくらい時間がかかる？」として、滞在目安と観測会の有無を扱います。\nスマホでは1列にして、見出し、短い説明、確認リンクの順にすると、移動中でも読みやすいです。"
        },
        {
            "role": "User",
            "text": "イベント一覧を見ると、観測会は毎日ではなく月数回のようです。\n雨の日シアターも常設かは分かりません。"
        },
        {
            "role": "ChatGPT",
            "text": "それは重要です。\n屋上観測会や雨の日シアターは魅力として使えますが、毎日ある前提で出すと誤解につながります。\nここは「体験として記憶に残っているが、開催条件は要確認」と分けた方がよいです。\nカードやチップでは、確定情報として書かず、「開催日を確認」「雨の日の楽しみ方：要確認」のように扱うのが安全です。"
        },
        {
            "role": "User",
            "text": "料金・営業時間・予約方式も未確認です。\n\nここをAIがそれっぽく埋めると、本番文言と混ざって危ないです。\n仮の画面を作っているだけなのに、自然な文章として入ると、数日後に見返した時に「これは確認済みなのか」「AIが埋めただけなのか」が分からなくなる。\n\nこの混ざり方が一番怖いです。\nなので、見た目の仮案でも、未確認は未確認として表示したいです。\nここはデザインの都合より優先したいです。"
        },
        {
            "role": "ChatGPT",
            "text": "そこは強い再発防止ルールとして残すべきです。\n確定できるのは、確認チップを置くこと、3カード構成、スマホ1列、予約導線を上部と体験カード後に置くことです。\n未確認として残すのは、料金、営業時間、休館日、予約方式、アクセス詳細、実際のイベント開催日です。\nチップ内でも「予約：要確認」「所要時間：目安掲載予定」のように、未確定であることを残します。\nこれにより、仮文言と公開文面が混ざる事故を防げます。"
        },
        {
            "role": "User",
            "text": "屋上観測会・星座カード・雨の日シアターの扱いも少し見たいです。"
        },
        {
            "role": "ChatGPT",
            "text": "体験カードとして、3カードの下に置くのがよいです。\n上部の3カードは「行けるかどうかの判断」。\nその下の体験カードは「行ったら何が残るか」。\n屋上観測会は「本物の星を見る体験」、星座カードは「帰ってから見返す体験」、雨の日シアターは「天候が悪くても楽しめる可能性」として扱えます。\nただし、それぞれ開催条件や常設かどうかは未確認なので、断定しない見せ方にします。"
        },
        {
            "role": "User",
            "text": "星座カードはかなり気になります。\n\nこれは単なる配布物ではなくて、家に帰ったあとに親子で空を見るきっかけになっている可能性があります。\n小さい施設でも、そこまで体験が続いているなら、それは大きな価値ですよね。\n\n展示がすごい、設備がすごい、という方向では大きい施設に勝てないかもしれません。\nでも、帰り道や家で子どもが空を見上げるなら、この科学館に行く意味がちゃんとある。\n\nただ、これを初期の来館案内ページに全部入れると重くなるので、今回は入口に少しだけ見せたいです。\n詳しい展開は後ろに回して、発展タスクとして残したいです。"
        },
        {
            "role": "ChatGPT",
            "text": "その判断はかなり良いです。\n星座カードは、今回のページに少し出す価値がありますが、詳しい導線は後続に回すのが自然です。\n初期ページでは「来館後も楽しめる体験がある」と軽く見せる。\n後続では、星座カードの持ち帰り導線、夜に親子で空を見る導線、次の観測会への再来館導線へ広げられます。\nつまり、今はページを重くせず、価値の芽だけ残す扱いです。"
        },
        {
            "role": "User",
            "text": "ここでやっと、この科学館の見え方が変わった気がします。\n\n最初は「来館者が減っている施設をどう改善するか」くらいの話でした。\nでも今は、来館前の不安を減らして、館内の体験につなげて、帰った後に空を見るところまで残す話に見えてきています。\n\nこの変化があるから、ただの案内ページではなくなるんだと思います。\n次回は、ファーストビューと3カード文面だけでなく、星座カードをどの程度見せるかも続きで見たいです。"
        },
        {
            "role": "ChatGPT",
            "text": "それはこのページの中心にしてよい考えです。\n来館前には、安心して行ける判断材料を出す。\n来館中には、屋上観測会やシアターのような体験を見せる。\n帰宅後には、星座カードをきっかけに親子で空を見る可能性を残す。\nこの流れを作ると、施設の規模が小さいことを弱点として扱うのではなく、記憶に残る体験として伝えられます。"
        },
        {
            "role": "User",
            "text": "屋上観測会も主役にしたい気持ちはありますが、開催日が限られるなら最初に大きく出しすぎるのは危ないですね。\n\n雨の日シアターは雨でも行く理由になるので使いたいですが、常設かどうかは確認が必要です。\n魅力としては残しつつ、断定しない出し方にしたいです。"
        },
        {
            "role": "ChatGPT",
            "text": "はい。屋上観測会は魅力として強いですが、開催日が月数回なら、常時体験できるように見せるのは避けたいです。\n体験カードでは「開催日を確認」とセットで出すのが安全です。\n雨の日シアターも、常設かどうかが未確認なら「雨の日でも楽しめる体験を確認中」のように仮扱いにします。\n魅力を隠さず、誤解も避ける形です。"
        },
        {
            "role": "User",
            "text": "このあたりが分けられると、ただの会話要約ではなくなりますね。\n\n今すぐ使うもの、仕様にするもの、後で広げるもの、AIに禁止するものが全部混ざっています。\nそこを分けられるから、次に別のAIへ渡しても同じ説明を繰り返さずに済む。\n\n特に、星空サイト案を一度出してから順番の違いに気づくところと、未確認情報を補完しないところは見せたいです。"
        },
        {
            "role": "ChatGPT",
            "text": "その2か所は見せ場になります。\n1つ目は、デザインの見た目ではなく、情報の順番を判断している点。\n2つ目は、AIが作業中にやりがちな「それっぽい補完」を防ぐ点。\nこの2つがあると、KashinoKiが単なる要約ツールではなく、次のAI作業で失敗を減らす前提作りのツールだと伝わります。\n会話の中に散らばった判断・禁止・仕様・発展案を、次に使える形へ分けられます。"
        },
        {
            "role": "User",
            "text": "発展タスクとしては、星座カードの持ち帰り導線、雨の日コース、観測会詳細ページは残したいです。\n\nSNSや学校連携はさらに後でいいです。\n全部を同じ後回しにすると、次に見た時にまた迷うので、体験に近いものを近い発展候補として残したいです。"
        },
        {
            "role": "ChatGPT",
            "text": "では、発展タスクにも優先度を付けます。\n近い発展タスクは、星座カードの持ち帰り導線、雨の日コース、観測会詳細ページ、FAQ整理。\n後段の発展タスクは、SNS運用、学校連携、動画、地域連携、季節イベント、親子ミッション。\nこう分けると、次に広げる場合も、来館案内ページから自然につながるものを先に扱えます。\n全部を同列で残すより、再開時に判断しやすくなります。"
        },
        {
            "role": "User",
            "text": "最後に、次のAIへ渡すなら最初に何を読ませるべきかも短く残してください。\n次回はファーストビュー案、3カード文面、星座カードの見せ方から再開したいです。"
        },
        {
            "role": "ChatGPT",
            "text": "次AIへ渡す前提は、以下です。\nこの案件では、資料から見えることを優先し、いきなりSNS・広告・学校連携へ広げない。\n来館案内ページは、Webを綺麗にするためではなく、親子連れ・初回来館者の来館前不安を減らす入口として扱う。\n星空感は主役にせず、判断材料を先に置く。\n料金・営業時間・予約方式・アクセス詳細・イベント開催日は未確認のため、AIが本番文言のように補完しない。\n次回は、ファーストビュー案、3カード文面、星座カードの見せ方から再開する。"
        }
    ]
}
  };
