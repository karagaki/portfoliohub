(function () {
  "use strict";

  if (window.KASHINOKI_INTERACTION_PRESETS) return;

  function motion(groupName, presetName) {
    return window.KASHINOKI_ANIMATION_PRESETS?.groups?.[groupName]?.[presetName] ? { group: groupName, preset: presetName } : null;
  }

  const presets = {
    button: {
      primary: {
        role: "main action",
        emphasis: "high",
        motionPreset: motion("interaction", "buttonConfirm") || motion("visibility", "deliberate"),
        responseDuration: 180,
        hold: 40,
        ariaLabel: "主要操作を実行する",
        visualState: "primary",
        cursor: "pointer",
        notes: "最も重要な実行ボタン向けの基準 preset。"
      },
      secondary: {
        role: "support action",
        emphasis: "medium",
        motionPreset: motion("interaction", "buttonCalm") || motion("visibility", "soft"),
        responseDuration: 160,
        hold: 24,
        ariaLabel: "補助操作を実行する",
        visualState: "secondary",
        cursor: "pointer",
        notes: "主要操作を邪魔しない補助ボタン向け preset。"
      },
      quiet: {
        role: "subtle action",
        emphasis: "low",
        motionPreset: motion("interaction", "buttonQuick") || motion("fade", "quickFade"),
        responseDuration: 120,
        hold: 12,
        ariaLabel: "控えめな操作を実行する",
        visualState: "quiet",
        cursor: "pointer",
        notes: "視覚的主張を抑えたい軽い操作向け preset。"
      },
      danger: {
        role: "destructive action",
        emphasis: "critical",
        motionPreset: motion("interaction", "buttonConfirm") || motion("fade", "softExit"),
        responseDuration: 200,
        hold: 60,
        ariaLabel: "破壊的な操作を実行する",
        visualState: "danger",
        cursor: "pointer",
        notes: "削除や取消など慎重さが必要な操作向け preset。"
      },
      ghost: {
        role: "hidden support action",
        emphasis: "minimal",
        motionPreset: motion("interaction", "buttonCalm") || motion("visibility", "instant"),
        responseDuration: 100,
        hold: 0,
        ariaLabel: "補助操作を実行する",
        visualState: "ghost",
        cursor: "pointer",
        notes: "背景に溶ける補助ボタン向け preset。"
      }
    },
    command: {
      replay: {
        role: "repeat sequence",
        emphasis: "medium",
        motionPreset: motion("guide", "replayStandard") || motion("visibility", "deliberate"),
        responseDuration: 200,
        hold: 80,
        ariaLabel: "案内を再生する",
        visualState: "command",
        cursor: "pointer",
        notes: "案内や手順の再生・再実行向け preset。"
      },
      showAll: {
        role: "reveal all",
        emphasis: "high",
        motionPreset: motion("guide", "showAllImmediate") || motion("visibility", "instant"),
        responseDuration: 0,
        hold: 0,
        ariaLabel: "すべて表示する",
        visualState: "command",
        cursor: "pointer",
        notes: "段階表示を一括で見せる command preset。"
      },
      proceed: {
        role: "advance forward",
        emphasis: "high",
        motionPreset: motion("guide", "stepGuideStandard") || motion("reveal", "topDown"),
        responseDuration: 180,
        hold: 36,
        ariaLabel: "次へ進む",
        visualState: "command",
        cursor: "pointer",
        notes: "現在の流れを先に進める操作向け preset。"
      },
      back: {
        role: "go back",
        emphasis: "medium",
        motionPreset: motion("guide", "stepGuideSlow") || motion("reveal", "leftToRight"),
        responseDuration: 180,
        hold: 24,
        ariaLabel: "前へ戻る",
        visualState: "command",
        cursor: "pointer",
        notes: "1つ前の段階へ戻る操作向け preset。"
      },
      openSettings: {
        role: "open settings",
        emphasis: "low",
        motionPreset: motion("visibility", "soft") || motion("fade", "calmFade"),
        responseDuration: 160,
        hold: 20,
        ariaLabel: "設定を開く",
        visualState: "command",
        cursor: "pointer",
        notes: "設定・補助面を開く操作向け preset。"
      }
    },
    confirmation: {
      confirm: {
        role: "safe confirm",
        emphasis: "high",
        motionPreset: motion("interaction", "buttonConfirm") || motion("guide", "stepGuideStandard"),
        responseDuration: 180,
        hold: 48,
        ariaLabel: "内容を確定する",
        visualState: "confirm",
        cursor: "pointer",
        notes: "確定前に意図を明確にする安全な確認 preset。"
      },
      tentative: {
        role: "soft confirm",
        emphasis: "medium",
        motionPreset: motion("visibility", "soft") || motion("fade", "calmFade"),
        responseDuration: 160,
        hold: 24,
        ariaLabel: "一旦受け入れる",
        visualState: "tentative",
        cursor: "pointer",
        notes: "暫定的に進める軽い確認 preset。"
      },
      destructiveConfirm: {
        role: "destructive confirm",
        emphasis: "critical",
        motionPreset: motion("fade", "softExit") || motion("interaction", "buttonConfirm"),
        responseDuration: 220,
        hold: 80,
        ariaLabel: "破壊的な操作を確定する",
        visualState: "destructive",
        cursor: "pointer",
        notes: "削除・取り消しなど破壊的操作の確認 preset。"
      },
      requireReview: {
        role: "review required",
        emphasis: "high",
        motionPreset: motion("reveal", "focusThenDetails") || motion("guide", "stepGuideSlow"),
        responseDuration: 240,
        hold: 72,
        ariaLabel: "確認が必要です",
        visualState: "review",
        cursor: "help",
        notes: "レビューや再確認を促す待機 preset。"
      }
    },
    feedback: {
      idle: {
        role: "neutral state",
        emphasis: "minimal",
        motionPreset: motion("reducedMotion", "noMotion") || motion("visibility", "instant"),
        responseDuration: 0,
        hold: 0,
        ariaLabel: "待機中",
        visualState: "idle",
        cursor: "default",
        notes: "操作前の静かな待機状態 preset。"
      },
      hover: {
        role: "hover state",
        emphasis: "low",
        motionPreset: motion("interaction", "buttonCalm") || motion("visibility", "soft"),
        responseDuration: 100,
        hold: 8,
        ariaLabel: "ホバー状態",
        visualState: "hover",
        cursor: "pointer",
        notes: "マウス重心を感じさせる軽い反応 preset。"
      },
      pressed: {
        role: "press state",
        emphasis: "medium",
        motionPreset: motion("interaction", "buttonQuick") || motion("fade", "quickFade"),
        responseDuration: 90,
        hold: 12,
        ariaLabel: "押下中",
        visualState: "pressed",
        cursor: "pointer",
        notes: "押した瞬間の反応を見せる preset。"
      },
      complete: {
        role: "success state",
        emphasis: "high",
        motionPreset: motion("count", "emphasisCount") || motion("guide", "stepGuideStandard"),
        responseDuration: 180,
        hold: 48,
        ariaLabel: "完了しました",
        visualState: "complete",
        cursor: "default",
        notes: "成功・完了を明確に伝える preset。"
      },
      warning: {
        role: "warning state",
        emphasis: "high",
        motionPreset: motion("visibility", "deliberate") || motion("fade", "slowEntrance"),
        responseDuration: 200,
        hold: 56,
        ariaLabel: "注意が必要です",
        visualState: "warning",
        cursor: "help",
        notes: "警告や注視を促す状態 preset。"
      },
      error: {
        role: "error state",
        emphasis: "critical",
        motionPreset: motion("fade", "softExit") || motion("visibility", "deliberate"),
        responseDuration: 220,
        hold: 72,
        ariaLabel: "エラーが発生しました",
        visualState: "error",
        cursor: "not-allowed",
        notes: "失敗・異常を明確に示す状態 preset。"
      }
    },
    navigation: {
      pageJump: {
        role: "jump to page",
        emphasis: "high",
        motionPreset: motion("reveal", "containerThenContent") || motion("guide", "stepGuideStandard"),
        responseDuration: 180,
        hold: 36,
        ariaLabel: "ページへ移動する",
        visualState: "navigation",
        cursor: "pointer",
        notes: "ページ単位の即時移動向け preset。"
      },
      returnBack: {
        role: "return to previous",
        emphasis: "medium",
        motionPreset: motion("guide", "stepGuideSlow") || motion("reveal", "leftToRight"),
        responseDuration: 180,
        hold: 24,
        ariaLabel: "前の画面へ戻る",
        visualState: "navigation",
        cursor: "pointer",
        notes: "前の画面や一覧へ戻る操作向け preset。"
      },
      nextStep: {
        role: "advance step",
        emphasis: "high",
        motionPreset: motion("guide", "stepGuideStandard") || motion("reveal", "topDown"),
        responseDuration: 180,
        hold: 32,
        ariaLabel: "次の手順へ進む",
        visualState: "navigation",
        cursor: "pointer",
        notes: "次の工程や次画面へ進む操作向け preset。"
      },
      previousStep: {
        role: "reverse step",
        emphasis: "medium",
        motionPreset: motion("guide", "stepGuideSlow") || motion("reveal", "leftToRight"),
        responseDuration: 180,
        hold: 32,
        ariaLabel: "前の手順へ戻る",
        visualState: "navigation",
        cursor: "pointer",
        notes: "工程の1つ前へ戻る操作向け preset。"
      }
    },
    utility: {
      copy: {
        role: "copy data",
        emphasis: "medium",
        motionPreset: motion("interaction", "buttonQuick") || motion("fade", "quickFade"),
        responseDuration: 120,
        hold: 12,
        ariaLabel: "内容をコピーする",
        visualState: "utility",
        cursor: "pointer",
        notes: "クリップボード系の軽い操作向け preset。"
      },
      download: {
        role: "download file",
        emphasis: "medium",
        motionPreset: motion("interaction", "buttonCalm") || motion("fade", "calmFade"),
        responseDuration: 140,
        hold: 16,
        ariaLabel: "ファイルをダウンロードする",
        visualState: "utility",
        cursor: "pointer",
        notes: "保存前の明確な操作反応を持つ preset。"
      },
      save: {
        role: "save changes",
        emphasis: "high",
        motionPreset: motion("count", "readableCount") || motion("guide", "stepGuideStandard"),
        responseDuration: 180,
        hold: 32,
        ariaLabel: "変更を保存する",
        visualState: "utility",
        cursor: "pointer",
        notes: "保存・記録・書き出し向けの安定 preset。"
      },
      import: {
        role: "import data",
        emphasis: "high",
        motionPreset: motion("reveal", "containerThenContent") || motion("guide", "stepGuideSlow"),
        responseDuration: 200,
        hold: 36,
        ariaLabel: "データを読み込む",
        visualState: "utility",
        cursor: "pointer",
        notes: "外部データの取り込み向け preset。"
      },
      export: {
        role: "export data",
        emphasis: "high",
        motionPreset: motion("reveal", "focusThenDetails") || motion("guide", "stepGuideStandard"),
        responseDuration: 200,
        hold: 36,
        ariaLabel: "データを書き出す",
        visualState: "utility",
        cursor: "pointer",
        notes: "外部へ出力する操作向け preset。"
      }
    },
    disabled: {
      disabledSoft: {
        role: "soft disabled",
        emphasis: "minimal",
        motionPreset: motion("reducedMotion", "minimalFade") || motion("visibility", "soft"),
        responseDuration: 0,
        hold: 0,
        ariaLabel: "利用できません",
        visualState: "disabled-soft",
        cursor: "not-allowed",
        notes: "触れそうに見えるが実際は無効な状態 preset。"
      },
      disabledHard: {
        role: "hard disabled",
        emphasis: "minimal",
        motionPreset: motion("reducedMotion", "noMotion") || motion("visibility", "instant"),
        responseDuration: 0,
        hold: 0,
        ariaLabel: "利用できません",
        visualState: "disabled-hard",
        cursor: "not-allowed",
        notes: "明確に無効であることを示す状態 preset。"
      },
      pending: {
        role: "pending state",
        emphasis: "low",
        motionPreset: motion("guide", "showAllImmediate") || motion("reducedMotion", "minimalFade"),
        responseDuration: 120,
        hold: 24,
        ariaLabel: "処理中です",
        visualState: "pending",
        cursor: "progress",
        notes: "実行待ち・受付待ちの状態 preset。"
      }
    },
    asyncState: {
      loading: {
        role: "loading state",
        emphasis: "medium",
        motionPreset: motion("guide", "stepGuideSlow") || motion("visibility", "deliberate"),
        responseDuration: 160,
        hold: 32,
        ariaLabel: "読み込み中です",
        visualState: "loading",
        cursor: "progress",
        notes: "非同期読み込み中の待機 preset。"
      },
      saving: {
        role: "saving state",
        emphasis: "high",
        motionPreset: motion("count", "emphasisCount") || motion("guide", "stepGuideStandard"),
        responseDuration: 180,
        hold: 40,
        ariaLabel: "保存中です",
        visualState: "saving",
        cursor: "progress",
        notes: "保存処理の進行を示す preset。"
      },
      saved: {
        role: "saved state",
        emphasis: "high",
        motionPreset: motion("feedback", "complete") || motion("count", "readableCount"),
        responseDuration: 160,
        hold: 28,
        ariaLabel: "保存しました",
        visualState: "saved",
        cursor: "default",
        notes: "保存完了を示す成功状態 preset。"
      },
      failed: {
        role: "failed state",
        emphasis: "critical",
        motionPreset: motion("feedback", "error") || motion("fade", "softExit"),
        responseDuration: 200,
        hold: 48,
        ariaLabel: "処理に失敗しました",
        visualState: "failed",
        cursor: "not-allowed",
        notes: "非同期処理の失敗やエラー状態 preset。"
      }
    }
  };

  const frozen = Object.freeze({
    groups: Object.freeze(Object.keys(presets).reduce((acc, groupName) => {
      acc[groupName] = Object.freeze(Object.keys(presets[groupName]).reduce((presetAcc, presetName) => {
        presetAcc[presetName] = Object.freeze({ ...presets[groupName][presetName] });
        return presetAcc;
      }, {}));
      return acc;
    }, {})),
    get(groupName, presetName) {
      return this.groups[groupName]?.[presetName] || null;
    }
  });

  window.KASHINOKI_INTERACTION_PRESETS = frozen;
})();
