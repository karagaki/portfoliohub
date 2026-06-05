(function () {
  "use strict";

  if (window.JARVIS_DATA_BINDINGS) return;

  function animation(groupName, presetName) {
    return window.JARVIS_ANIMATION_PRESETS?.groups?.[groupName]?.[presetName]
      ? { group: groupName, preset: presetName }
      : null;
  }

  function interaction(groupName, presetName) {
    return window.JARVIS_INTERACTION_PRESETS?.groups?.[groupName]?.[presetName]
      ? { group: groupName, preset: presetName }
      : null;
  }

  const bindings = {
    numeric: {
      metricCount: {
        role: "metric display",
        targetType: "number",
        panelRole: "panel-metric",
        layoutRole: "inline-stat",
        animationPreset: animation("count", "readableCount"),
        interactionPreset: interaction("feedback", "idle"),
        emptyValue: 0,
        formatter: "number",
        notes: "件数・数量・合計の表示に使う基準 binding。"
      },
      progressCount: {
        role: "progress display",
        targetType: "number",
        panelRole: "panel-progress",
        layoutRole: "progress-line",
        animationPreset: animation("count", "quickCount"),
        interactionPreset: interaction("feedback", "hover"),
        emptyValue: 0,
        formatter: "number",
        notes: "進捗率や段階数の表示向け binding。"
      },
      comparisonCount: {
        role: "comparison display",
        targetType: "number",
        panelRole: "panel-comparison",
        layoutRole: "comparison-chip",
        animationPreset: animation("count", "emphasisCount"),
        interactionPreset: interaction("confirmation", "tentative"),
        emptyValue: 0,
        formatter: "number",
        notes: "前後比較や差分量の表示向け binding。"
      },
      summaryTotal: {
        role: "summary total",
        targetType: "number",
        panelRole: "panel-summary",
        layoutRole: "summary-total",
        animationPreset: animation("count", "emphasisCount"),
        interactionPreset: interaction("feedback", "complete"),
        emptyValue: 0,
        formatter: "number",
        notes: "総数・合計値・集計結果の表示向け binding。"
      }
    },
    text: {
      titleText: {
        role: "title label",
        targetType: "string",
        panelRole: "panel-title",
        layoutRole: "title-block",
        animationPreset: animation("reveal", "focusThenDetails"),
        interactionPreset: interaction("feedback", "idle"),
        emptyValue: "",
        formatter: "plainText",
        notes: "見出しやページ名の短文表示向け binding。"
      },
      bodyText: {
        role: "body copy",
        targetType: "string",
        panelRole: "panel-body",
        layoutRole: "body-block",
        animationPreset: animation("fade", "calmFade"),
        interactionPreset: interaction("feedback", "idle"),
        emptyValue: "",
        formatter: "multilineText",
        notes: "本文や説明文の表示向け binding。"
      },
      helperText: {
        role: "helper copy",
        targetType: "string",
        panelRole: "panel-helper",
        layoutRole: "helper-note",
        animationPreset: animation("visibility", "soft"),
        interactionPreset: interaction("feedback", "hover"),
        emptyValue: "",
        formatter: "plainText",
        notes: "補足や補助説明の表示向け binding。"
      },
      emptyText: {
        role: "empty state",
        targetType: "string",
        panelRole: "panel-empty",
        layoutRole: "empty-message",
        animationPreset: animation("reducedMotion", "minimalFade"),
        interactionPreset: interaction("disabled", "pending"),
        emptyValue: "未設定",
        formatter: "plainText",
        notes: "空状態や未接続状態の表示向け binding。"
      },
      warningText: {
        role: "warning copy",
        targetType: "string",
        panelRole: "panel-warning",
        layoutRole: "warning-note",
        animationPreset: animation("fade", "slowEntrance"),
        interactionPreset: interaction("feedback", "warning"),
        emptyValue: "",
        formatter: "plainText",
        notes: "注意文や警告文の表示向け binding。"
      }
    },
    list: {
      candidateList: {
        role: "candidate list",
        targetType: "array",
        panelRole: "panel-list",
        layoutRole: "list-candidates",
        animationPreset: animation("stagger", "standardStagger"),
        interactionPreset: interaction("navigation", "pageJump"),
        emptyValue: [],
        formatter: "listItems",
        notes: "候補群や提案一覧の表示向け binding。"
      },
      evidenceList: {
        role: "evidence list",
        targetType: "array",
        panelRole: "panel-list",
        layoutRole: "list-evidence",
        animationPreset: animation("stagger", "presentationStagger"),
        interactionPreset: interaction("confirmation", "requireReview"),
        emptyValue: [],
        formatter: "listItems",
        notes: "証跡や引用元の一覧表示向け binding。"
      },
      actionList: {
        role: "action list",
        targetType: "array",
        panelRole: "panel-list",
        layoutRole: "list-actions",
        animationPreset: animation("stagger", "compactStagger"),
        interactionPreset: interaction("command", "proceed"),
        emptyValue: [],
        formatter: "listItems",
        notes: "次行動・候補アクションの一覧向け binding。"
      },
      historyList: {
        role: "history list",
        targetType: "array",
        panelRole: "panel-history",
        layoutRole: "list-history",
        animationPreset: animation("reveal", "topDown"),
        interactionPreset: interaction("navigation", "returnBack"),
        emptyValue: [],
        formatter: "listItems",
        notes: "経緯・履歴・時系列表示向け binding。"
      },
      outputList: {
        role: "output list",
        targetType: "array",
        panelRole: "panel-output",
        layoutRole: "list-output",
        animationPreset: animation("reveal", "containerThenContent"),
        interactionPreset: interaction("utility", "export"),
        emptyValue: [],
        formatter: "listItems",
        notes: "成果物や出力候補の一覧向け binding。"
      }
    },
    status: {
      idleStatus: {
        role: "idle state",
        targetType: "string",
        panelRole: "panel-status",
        layoutRole: "status-pill",
        animationPreset: animation("reducedMotion", "noMotion"),
        interactionPreset: interaction("feedback", "idle"),
        emptyValue: "idle",
        formatter: "statusLabel",
        notes: "待機状態を静かに示す binding。"
      },
      activeStatus: {
        role: "active state",
        targetType: "string",
        panelRole: "panel-status",
        layoutRole: "status-pill",
        animationPreset: animation("visibility", "soft"),
        interactionPreset: interaction("feedback", "hover"),
        emptyValue: "active",
        formatter: "statusLabel",
        notes: "稼働中・選択中の状態を示す binding。"
      },
      completeStatus: {
        role: "complete state",
        targetType: "string",
        panelRole: "panel-status",
        layoutRole: "status-pill",
        animationPreset: animation("guide", "showAllImmediate"),
        interactionPreset: interaction("feedback", "complete"),
        emptyValue: "complete",
        formatter: "statusLabel",
        notes: "完了・成功を示す状態 binding。"
      },
      warningStatus: {
        role: "warning state",
        targetType: "string",
        panelRole: "panel-status",
        layoutRole: "status-pill",
        animationPreset: animation("visibility", "deliberate"),
        interactionPreset: interaction("feedback", "warning"),
        emptyValue: "warning",
        formatter: "statusLabel",
        notes: "注意や確認を促す状態 binding。"
      },
      errorStatus: {
        role: "error state",
        targetType: "string",
        panelRole: "panel-status",
        layoutRole: "status-pill",
        animationPreset: animation("fade", "softExit"),
        interactionPreset: interaction("feedback", "error"),
        emptyValue: "error",
        formatter: "statusLabel",
        notes: "失敗や異常を示す状態 binding。"
      },
      pendingStatus: {
        role: "pending state",
        targetType: "string",
        panelRole: "panel-status",
        layoutRole: "status-pill",
        animationPreset: animation("guide", "stepGuideSlow"),
        interactionPreset: interaction("disabled", "pending"),
        emptyValue: "pending",
        formatter: "statusLabel",
        notes: "受付待ちや処理待ちを示す状態 binding。"
      }
    },
    evidence: {
      sourceExcerpt: {
        role: "source excerpt",
        targetType: "string",
        panelRole: "panel-evidence",
        layoutRole: "evidence-block",
        animationPreset: animation("reveal", "focusThenDetails"),
        interactionPreset: interaction("utility", "copy"),
        emptyValue: "",
        formatter: "multilineText",
        notes: "引用元や抜粋テキストの表示向け binding。"
      },
      decisionReason: {
        role: "decision reason",
        targetType: "string",
        panelRole: "panel-evidence",
        layoutRole: "evidence-block",
        animationPreset: animation("reveal", "containerThenContent"),
        interactionPreset: interaction("confirmation", "confirm"),
        emptyValue: "",
        formatter: "multilineText",
        notes: "採否理由や判断根拠の表示向け binding。"
      },
      changeEvidence: {
        role: "change evidence",
        targetType: "string",
        panelRole: "panel-evidence",
        layoutRole: "evidence-block",
        animationPreset: animation("stagger", "standardStagger"),
        interactionPreset: interaction("utility", "save"),
        emptyValue: "",
        formatter: "multilineText",
        notes: "変更点や差分証跡の表示向け binding。"
      },
      failureEvidence: {
        role: "failure evidence",
        targetType: "string",
        panelRole: "panel-evidence",
        layoutRole: "evidence-block",
        animationPreset: animation("fade", "slowEntrance"),
        interactionPreset: interaction("feedback", "error"),
        emptyValue: "",
        formatter: "multilineText",
        notes: "失敗や未解決の証跡表示向け binding。"
      },
      verificationEvidence: {
        role: "verification evidence",
        targetType: "string",
        panelRole: "panel-evidence",
        layoutRole: "evidence-block",
        animationPreset: animation("guide", "replayStandard"),
        interactionPreset: interaction("confirmation", "requireReview"),
        emptyValue: "",
        formatter: "multilineText",
        notes: "確認結果や検証証跡の表示向け binding。"
      }
    },
    output: {
      artifactCard: {
        role: "artifact card",
        targetType: "object",
        panelRole: "panel-output",
        layoutRole: "artifact-card",
        animationPreset: animation("reveal", "containerThenContent"),
        interactionPreset: interaction("utility", "openSettings"),
        emptyValue: null,
        formatter: "artifactSummary",
        notes: "成果物カード全体の表示向け binding。"
      },
      copyBlock: {
        role: "copy block",
        targetType: "string",
        panelRole: "panel-output",
        layoutRole: "output-copy",
        animationPreset: animation("fade", "calmFade"),
        interactionPreset: interaction("utility", "copy"),
        emptyValue: "",
        formatter: "multilineText",
        notes: "コピーブロックや再利用文面の表示向け binding。"
      },
      downloadBlock: {
        role: "download block",
        targetType: "string",
        panelRole: "panel-output",
        layoutRole: "output-download",
        animationPreset: animation("reveal", "focusThenDetails"),
        interactionPreset: interaction("utility", "download"),
        emptyValue: "",
        formatter: "plainText",
        notes: "ダウンロード対象の説明やファイル名表示向け binding。"
      },
      handoffBlock: {
        role: "handoff block",
        targetType: "string",
        panelRole: "panel-output",
        layoutRole: "output-handoff",
        animationPreset: animation("guide", "stepGuideStandard"),
        interactionPreset: interaction("command", "proceed"),
        emptyValue: "",
        formatter: "multilineText",
        notes: "引き継ぎ用の出力ブロック表示向け binding。"
      },
      packageSummary: {
        role: "package summary",
        targetType: "object",
        panelRole: "panel-output",
        layoutRole: "output-summary",
        animationPreset: animation("count", "emphasisCount"),
        interactionPreset: interaction("utility", "export"),
        emptyValue: null,
        formatter: "artifactSummary",
        notes: "出力パッケージの要約表示向け binding。"
      }
    },
    action: {
      primaryActionBinding: {
        role: "primary action",
        targetType: "object",
        panelRole: "panel-action",
        layoutRole: "action-primary",
        animationPreset: animation("interaction", "buttonConfirm"),
        interactionPreset: interaction("button", "primary"),
        emptyValue: null,
        formatter: "plainText",
        notes: "最重要の実行アクションに使う binding。"
      },
      secondaryActionBinding: {
        role: "secondary action",
        targetType: "object",
        panelRole: "panel-action",
        layoutRole: "action-secondary",
        animationPreset: animation("interaction", "buttonCalm"),
        interactionPreset: interaction("button", "secondary"),
        emptyValue: null,
        formatter: "plainText",
        notes: "補助的な実行アクションに使う binding。"
      },
      replayActionBinding: {
        role: "replay action",
        targetType: "object",
        panelRole: "panel-action",
        layoutRole: "action-replay",
        animationPreset: animation("guide", "replayStandard"),
        interactionPreset: interaction("command", "replay"),
        emptyValue: null,
        formatter: "plainText",
        notes: "案内再生・手順再実行のアクション binding。"
      },
      showAllActionBinding: {
        role: "show all action",
        targetType: "object",
        panelRole: "panel-action",
        layoutRole: "action-show-all",
        animationPreset: animation("guide", "showAllImmediate"),
        interactionPreset: interaction("command", "showAll"),
        emptyValue: null,
        formatter: "plainText",
        notes: "一括表示や全展開のアクション binding。"
      },
      confirmActionBinding: {
        role: "confirm action",
        targetType: "object",
        panelRole: "panel-action",
        layoutRole: "action-confirm",
        animationPreset: animation("interaction", "buttonConfirm"),
        interactionPreset: interaction("confirmation", "confirm"),
        emptyValue: null,
        formatter: "plainText",
        notes: "確定・承認・送信の確認アクション binding。"
      }
    },
    meta: {
      pageMeta: {
        role: "page metadata",
        targetType: "object",
        panelRole: "panel-meta",
        layoutRole: "meta-chip",
        animationPreset: animation("visibility", "soft"),
        interactionPreset: interaction("feedback", "idle"),
        emptyValue: null,
        formatter: "plainText",
        notes: "ページ固有のメタ情報表示向け binding。"
      },
      routeMeta: {
        role: "route metadata",
        targetType: "object",
        panelRole: "panel-meta",
        layoutRole: "meta-chip",
        animationPreset: animation("reveal", "topDown"),
        interactionPreset: interaction("navigation", "pageJump"),
        emptyValue: null,
        formatter: "plainText",
        notes: "ルートや遷移経路の情報表示向け binding。"
      },
      roleMeta: {
        role: "role metadata",
        targetType: "object",
        panelRole: "panel-meta",
        layoutRole: "meta-chip",
        animationPreset: animation("visibility", "deliberate"),
        interactionPreset: interaction("confirmation", "tentative"),
        emptyValue: null,
        formatter: "plainText",
        notes: "役割・分類・ラベルの補助表示向け binding。"
      },
      timestampMeta: {
        role: "timestamp metadata",
        targetType: "object",
        panelRole: "panel-meta",
        layoutRole: "meta-chip",
        animationPreset: animation("count", "readableCount"),
        interactionPreset: interaction("feedback", "idle"),
        emptyValue: null,
        formatter: "plainText",
        notes: "更新時刻や記録日時の表示向け binding。"
      }
    }
  };

  const frozen = Object.freeze({
    groups: Object.freeze(Object.keys(bindings).reduce((acc, groupName) => {
      acc[groupName] = Object.freeze(Object.keys(bindings[groupName]).reduce((presetAcc, presetName) => {
        presetAcc[presetName] = Object.freeze({ ...bindings[groupName][presetName] });
        return presetAcc;
      }, {}));
      return acc;
    }, {})),
    get(groupName, presetName) {
      return this.groups[groupName]?.[presetName] || null;
    }
  });

  window.JARVIS_DATA_BINDINGS = frozen;
})();
