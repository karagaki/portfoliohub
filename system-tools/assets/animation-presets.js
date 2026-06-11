(function () {
  "use strict";

  if (window.KASHINOKI_ANIMATION_PRESETS) return;

  const presets = {
    visibility: {
      instant: {
        duration: 0,
        delay: 0,
        easing: "linear",
        stagger: 0,
        hold: 0,
        opacityFrom: 1,
        opacityTo: 1,
        transformFrom: "none",
        transformTo: "none",
        notes: "最小遷移で即時表示する基準 preset。"
      },
      soft: {
        duration: 180,
        delay: 0,
        easing: "ease-out",
        stagger: 0,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(4px)",
        transformTo: "translateY(0)",
        notes: "静かな表示切替に使う軽い可視化 preset。"
      },
      deliberate: {
        duration: 280,
        delay: 60,
        easing: "cubic-bezier(0.2, 0.0, 0.2, 1)",
        stagger: 0,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(8px)",
        transformTo: "translateY(0)",
        notes: "視線誘導を少し強める、意図的な表示 preset。"
      }
    },
    reveal: {
      topDown: {
        duration: 260,
        delay: 0,
        easing: "ease-out",
        stagger: 24,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(-10px)",
        transformTo: "translateY(0)",
        notes: "上から順に情報を見せる基本 reveal preset。"
      },
      leftToRight: {
        duration: 260,
        delay: 0,
        easing: "ease-out",
        stagger: 24,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateX(-12px)",
        transformTo: "translateX(0)",
        notes: "横方向の流れで要素を並べて見せる preset。"
      },
      focusThenDetails: {
        duration: 320,
        delay: 40,
        easing: "ease-out",
        stagger: 36,
        hold: 120,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "scale(0.985)",
        transformTo: "scale(1)",
        notes: "先頭要素を先に立てて、詳細を続ける preset。"
      },
      containerThenContent: {
        duration: 300,
        delay: 40,
        easing: "ease-out",
        stagger: 28,
        hold: 80,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(6px)",
        transformTo: "translateY(0)",
        notes: "コンテナを先に見せてから中身を展開する preset。"
      }
    },
    fade: {
      quickFade: {
        duration: 120,
        delay: 0,
        easing: "linear",
        stagger: 0,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "none",
        transformTo: "none",
        notes: "即時性を優先した短い fade preset。"
      },
      calmFade: {
        duration: 220,
        delay: 0,
        easing: "ease-out",
        stagger: 0,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(2px)",
        transformTo: "translateY(0)",
        notes: "静かな印象を保つ標準 fade preset。"
      },
      slowEntrance: {
        duration: 360,
        delay: 60,
        easing: "cubic-bezier(0.2, 0.0, 0.0, 1)",
        stagger: 0,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(10px)",
        transformTo: "translateY(0)",
        notes: "注意を集めながら入る遅めの fade preset。"
      },
      softExit: {
        duration: 180,
        delay: 0,
        easing: "ease-in",
        stagger: 0,
        hold: 0,
        opacityFrom: 1,
        opacityTo: 0,
        transformFrom: "translateY(0)",
        transformTo: "translateY(4px)",
        notes: "表示を壊さず静かに消える退出 preset。"
      }
    },
    stagger: {
      compactStagger: {
        duration: 180,
        delay: 0,
        easing: "ease-out",
        stagger: 14,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(4px)",
        transformTo: "translateY(0)",
        notes: "狭い領域で使う小さめの stagger preset。"
      },
      standardStagger: {
        duration: 240,
        delay: 0,
        easing: "ease-out",
        stagger: 24,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(6px)",
        transformTo: "translateY(0)",
        notes: "一般的な段階表示に使う標準 stagger preset。"
      },
      presentationStagger: {
        duration: 320,
        delay: 40,
        easing: "cubic-bezier(0.2, 0.0, 0.2, 1)",
        stagger: 36,
        hold: 100,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(10px)",
        transformTo: "translateY(0)",
        notes: "説明用にやや間を置いて見せる stagger preset。"
      }
    },
    count: {
      quickCount: {
        duration: 140,
        delay: 0,
        easing: "linear",
        stagger: 0,
        hold: 0,
        opacityFrom: 1,
        opacityTo: 1,
        transformFrom: "none",
        transformTo: "none",
        notes: "数値の更新を素早く反映する preset。"
      },
      readableCount: {
        duration: 220,
        delay: 0,
        easing: "ease-out",
        stagger: 0,
        hold: 0,
        opacityFrom: 1,
        opacityTo: 1,
        transformFrom: "none",
        transformTo: "none",
        notes: "読み取りやすさを優先したカウント preset。"
      },
      emphasisCount: {
        duration: 300,
        delay: 40,
        easing: "cubic-bezier(0.2, 0.0, 0.2, 1)",
        stagger: 0,
        hold: 120,
        opacityFrom: 1,
        opacityTo: 1,
        transformFrom: "scale(0.98)",
        transformTo: "scale(1)",
        notes: "強調が必要な集計や到達値向けの preset。"
      }
    },
    guide: {
      stepGuideStandard: {
        duration: 240,
        delay: 0,
        easing: "ease-out",
        stagger: 24,
        hold: 80,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(8px)",
        transformTo: "translateY(0)",
        notes: "現在の workflow guide で使いやすい標準 preset。"
      },
      stepGuideSlow: {
        duration: 360,
        delay: 40,
        easing: "cubic-bezier(0.2, 0.0, 0.0, 1)",
        stagger: 32,
        hold: 140,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(10px)",
        transformTo: "translateY(0)",
        notes: "案内をゆっくり追わせたい場合の preset。"
      },
      showAllImmediate: {
        duration: 0,
        delay: 0,
        easing: "linear",
        stagger: 0,
        hold: 0,
        opacityFrom: 1,
        opacityTo: 1,
        transformFrom: "none",
        transformTo: "none",
        notes: "段階表示を一括で即時表示する preset。"
      },
      replayStandard: {
        duration: 220,
        delay: 0,
        easing: "ease-out",
        stagger: 18,
        hold: 60,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "translateY(4px)",
        transformTo: "translateY(0)",
        notes: "再生時に案内の流れを戻す標準 preset。"
      }
    },
    interaction: {
      buttonQuick: {
        duration: 120,
        delay: 0,
        easing: "ease-out",
        stagger: 0,
        hold: 0,
        opacityFrom: 1,
        opacityTo: 1,
        transformFrom: "scale(1)",
        transformTo: "scale(0.98)",
        notes: "軽い押下反応で素早く戻る button preset。"
      },
      buttonCalm: {
        duration: 180,
        delay: 0,
        easing: "ease-out",
        stagger: 0,
        hold: 0,
        opacityFrom: 1,
        opacityTo: 1,
        transformFrom: "scale(1)",
        transformTo: "scale(0.985)",
        notes: "落ち着いた反応速度の button preset。"
      },
      buttonConfirm: {
        duration: 220,
        delay: 20,
        easing: "cubic-bezier(0.2, 0.0, 0.2, 1)",
        stagger: 0,
        hold: 60,
        opacityFrom: 1,
        opacityTo: 1,
        transformFrom: "scale(1)",
        transformTo: "scale(0.975)",
        notes: "確定操作の押下感を少し強める preset。"
      },
      buttonDisabled: {
        duration: 0,
        delay: 0,
        easing: "linear",
        stagger: 0,
        hold: 0,
        opacityFrom: 0.45,
        opacityTo: 0.45,
        transformFrom: "none",
        transformTo: "none",
        notes: "無効状態の視認性を保つ preset。"
      }
    },
    reducedMotion: {
      noMotion: {
        duration: 0,
        delay: 0,
        easing: "linear",
        stagger: 0,
        hold: 0,
        opacityFrom: 1,
        opacityTo: 1,
        transformFrom: "none",
        transformTo: "none",
        notes: "reduced-motion では即時表示に寄せる preset。"
      },
      minimalFade: {
        duration: 80,
        delay: 0,
        easing: "linear",
        stagger: 0,
        hold: 0,
        opacityFrom: 0,
        opacityTo: 1,
        transformFrom: "none",
        transformTo: "none",
        notes: "最小限の変化だけ残す reduced-motion preset。"
      }
    }
  };

  const groups = Object.freeze(Object.keys(presets).reduce((acc, groupName) => {
    acc[groupName] = Object.freeze({ ...presets[groupName] });
    return acc;
  }, {}));

  const frozen = Object.freeze({
    groups: Object.freeze(Object.keys(groups).reduce((acc, groupName) => {
      acc[groupName] = Object.freeze(Object.keys(groups[groupName]).reduce((presetAcc, presetName) => {
        presetAcc[presetName] = Object.freeze({ ...groups[groupName][presetName] });
        return presetAcc;
      }, {}));
      return acc;
    }, {})),
    get(groupName, presetName) {
      return this.groups[groupName]?.[presetName] || null;
    }
  });

  window.KASHINOKI_ANIMATION_PRESETS = frozen;
})();
