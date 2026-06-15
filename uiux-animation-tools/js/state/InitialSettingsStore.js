(function () {
    'use strict';

    const INITIAL_SETTINGS_SCHEMA = 'uiux-animation-tools.default-user-state';
    const LEGACY_INITIAL_SETTINGS_SCHEMA = 'uiux-animation-tools.initial-settings';
    const ARTWORK_SLOTS_SCHEMA = 'uiux-animation-tools.artwork-slots';
    const VERSION = 1;
    const UI_SIZE_TUNER_KEY = 'uiuxAnimationTools.uiSizeTuner.v26';
    const BUNDLED_INITIAL_SETTINGS_URL = 'assets/data/default-user-state.json';
    const USER_INITIAL_SETTINGS_SCHEMA = 'uiux-animation-tools.user-initial-settings-export';
    const USER_INITIAL_SETTINGS_SOURCE = 'detail-settings-initial-tab';
    const USER_INITIAL_SETTINGS_EXPORT_VERSION = 1;
    const USER_INITIAL_SETTINGS_THEME_KEYS = ['uiVariantMain', 'uiVariant'];
    const USER_INITIAL_SETTINGS_GROUPS = [
        {
            label: 'UIバリエーション',
            items: [
                { key: 'uiVariantMain', label: 'uiVariantMain', summaryLabel: 'UIバリエーション(main)' },
                { key: 'uiVariant', label: 'uiVariant', summaryLabel: 'UIバリエーション' }
            ]
        },
        {
            label: 'case / 登録スロット',
            items: [
                { key: 'allCaseSettings', label: 'allCaseSettings', summaryLabel: 'case設定' },
                { key: 'p5jsRegisteredArtworkSlotsV1', label: 'p5jsRegisteredArtworkSlotsV1', summaryLabel: '登録スロット状態' }
            ]
        },
        {
            label: 'Glass登録設定',
            items: [
                { key: 'uiGlassCustomPresets', label: 'uiGlassCustomPresets', summaryLabel: 'Glass登録設定' },
                { key: 'uiGlassPresetEditLocks', label: 'uiGlassPresetEditLocks', summaryLabel: 'Glass編集ロック' },
                { key: 'uiGlassPresetParams', label: 'uiGlassPresetParams', summaryLabel: 'Glass詳細設定' },
                { key: 'uiVariantPreset', label: 'uiVariantPreset', summaryLabel: '現在選択中の Glass プリセット' },
                { key: 'uiGlassPresetDetailsOpen', label: 'uiGlassPresetDetailsOpen', summaryLabel: 'Glass詳細の開閉状態' }
            ]
        },
        {
            label: 'Neumorphism登録設定',
            items: [
                { key: 'uiNeumorphismCustomPresets', label: 'uiNeumorphismCustomPresets', summaryLabel: 'Neumorphism登録設定' },
                { key: 'uiNeumorphismPresetEditLocks', label: 'uiNeumorphismPresetEditLocks', summaryLabel: 'Neumorphism編集ロック' },
                { key: 'uiNeumorphismPresetParams', label: 'uiNeumorphismPresetParams', summaryLabel: 'Neumorphism詳細設定' },
                { key: 'uiNeumorphismVariantPreset', label: 'uiNeumorphismVariantPreset', summaryLabel: '現在選択中の Neumorphism プリセット' },
                { key: 'uiNeumorphismPresetDetailsOpen', label: 'uiNeumorphismPresetDetailsOpen', summaryLabel: 'Neumorphism詳細の開閉状態' }
            ]
        },
        {
            label: 'UI Size Tuner',
            items: [
                { key: 'uiSizeTuner', label: 'uiSizeTuner', storageKey: UI_SIZE_TUNER_KEY, summaryLabel: 'UI Size Tuner' }
            ]
        }
    ];

    const BUNDLED_INITIAL_SETTINGS_EMBEDDED = JSON.parse(String.raw`{
  "schema": "uiux-animation-tools.default-user-state",
  "version": 1,
  "name": "GitHub公開用 default-user-state 正本 v1",
  "createdAt": "2026-06-15T00:06:12.792Z",
  "source": {
    "glassExport": "p5js-glass-presets-20260615-084621.json",
    "neumorphismExport": "p5js-neumorphism-presets-20260615-084615.json",
    "uiSizeTunerExport": "ui-size-tuner-2026-06-14 (2).json",
    "caseSettingsSource": "assets/data/default-cases.json",
    "registeredSlotsSource": "assets/data/default-cases.json",
    "localStorageProfiles": [
      "Profile 8",
      "Default"
    ]
  },
  "uiSizeTunerStorageKey": "uiuxAnimationTools.uiSizeTuner.v26",
  "uiSizeTuner": {
    "schema": "uiux-animation-tools.uiSizeTuner",
    "version": 17,
    "storageKey": "uiuxAnimationTools.uiSizeTuner.v26",
    "values": {
      "guide:共通": true,
      "guide:1.配色": true,
      "--ui-color-blend-off-color": "#c64e4e",
      "--ui-color-blend-on-color": "#dedede",
      "--ui-color-blend-border-color": "#82823a",
      "--ui-color-blend-text-color": "#5196f0",
      "--ui-color-blend-off-fill-alpha": 0.18,
      "--ui-color-blend-on-fill-alpha": 0.26,
      "--ui-color-blend-on-border-alpha": 0.48,
      "--ui-color-blend-text-alpha": 0.86,
      "--ui-color-blend-blue-mix": 0.1,
      "guide:2.点": true,
      "guide:3.カーソル": true,
      "guide:4.空間": true,
      "guide:下部": true,
      "guide:UIバリエーション": true,
      "guide:左下UI": true,
      "--ui-panel-common-header-font-size": 12.5,
      "--ui-panel-common-label-font-size": 9,
      "--ui-panel-common-value-font-size": 9,
      "--ui-panel-common-input-font-size": 9,
      "--ui-panel-common-header-height": 17,
      "--ui-panel-common-slider-thumb-size": 7,
      "--ui-panel-common-slider-track-height": 8,
      "--ui-panel-1-width": 220,
      "--ui-panel-1-padding": 10,
      "--ui-panel-1-row-gap": 6,
      "--ui-panel-1-vertical-gap": 6,
      "--ui-color-card-gap": 3,
      "--ui-color-card-name-line-height": 1.1,
      "--ui-color-card-columns": 3,
      "--ui-color-card-height": 25,
      "--ui-color-card-padding-x": 1,
      "--ui-color-card-name-font-size": 10,
      "--ui-color-swatch-height": 6,
      "--ui-color-assign-button-font-size": 10.5,
      "--ui-color-assign-button-height": 20,
      "--ui-color-assign-button-min-width": 38,
      "--ui-color-assign-button-padding-x": 0,
      "--ui-color-assign-button-gap": 2,
      "--ui-color-action-button-font-size": 10,
      "--ui-color-action-button-height": 21,
      "--ui-color-action-button-min-width": 39,
      "--ui-color-action-button-padding-x": 7,
      "--ui-color-transition-input-font-size": 9,
      "--ui-color-transition-input-width": 38,
      "--ui-color-transition-input-height": 18,
      "--ui-color-transition-actions-gap": 4,
      "--ui-panel-2-width": 220,
      "--ui-panel-2-padding": 9,
      "--ui-panel-2-label-width": 36,
      "--ui-panel-2-slider-width": 80,
      "--ui-panel-2-value-width": 35,
      "--ui-panel-2-fixed-width": 35,
      "--ui-panel-2-column-gap": 2,
      "--ui-panel-2-row-gap": 0,
      "--ui-panel-2-label-font-size": 7.5,
      "--ui-panel-2-value-font-size": 8,
      "--ui-panel-3-width": 220,
      "--ui-panel-3-padding": 7,
      "--ui-panel-3-label-width": 120,
      "--ui-panel-3-check-width": 18,
      "--ui-panel-3-slider-min-width": 70,
      "--ui-panel-3-value-width": 79,
      "--ui-panel-3-value-gap": -8,
      "--ui-panel-3-column-gap": 0,
      "--ui-panel-3-slider-offset-x": -13,
      "--ui-panel-3-value-offset-x": 2,
      "--ui-panel-3-row-gap": 0,
      "--ui-panel-3-row-height": 16,
      "--ui-panel-3-label-font-size": 9.5,
      "--ui-panel-3-value-font-size": 13,
      "--ui-panel-4-width": 220,
      "--ui-panel-4-padding": 8,
      "--ui-panel-4-row-gap": 0,
      "--ui-panel-4-button-font-size": 10.5,
      "--ui-panel-4-action-height": 23,
      "--ui-panel-4-action-gap": 3,
      "--ui-panel-4-label-width": 32,
      "--ui-panel-4-slider-min-width": 126,
      "--ui-panel-4-value-width": 58,
      "--ui-panel-4-column-gap": 0,
      "--ui-panel-4-row-height": 16,
      "--ui-panel-4-value-gap": -8,
      "--ui-panel-4-slider-offset-x": -8,
      "--ui-panel-4-value-offset-x": 38,
      "--ui-panel-4-label-font-size": 11,
      "--ui-panel-4-value-font-size": 14,
      "--ui-bottom-button-font-size": 8,
      "--ui-bottom-button-height": 21,
      "--ui-bottom-button-min-width": 34,
      "--ui-bottom-button-padding-x": 7,
      "--ui-bottom-button-gap": 6,
      "--ui-bottom-round-button-size": 22,
      "--ui-case-button-size": 21,
      "--ui-neumo-surface-button-font-size": 7,
      "--ui-neumo-surface-button-height": 17,
      "--ui-neumo-surface-button-min-width": 18,
      "--ui-neumo-surface-button-padding-x": 1,
      "--ui-size-tuner-panel-width": 420,
      "--ui-size-tuner-panel-max-height": 620,
      "--ui-size-tuner-font-size": 11,
      "--ui-size-tuner-bg-alpha": 0.94,
      "--ui-size-tuner-page-gap": 9,
      "--ui-size-tuner-group-padding": 12,
      "--ui-size-tuner-row-label-width": 108,
      "--ui-size-tuner-row-value-width": 72,
      "--ui-size-tuner-row-computed-width": 90,
      "--ui-size-tuner-row-column-gap": 10,
      "--ui-variant-panel-width": 388,
      "--ui-variant-panel-padding": 12,
      "--ui-variant-panel-gap": 2,
      "--ui-variant-panel-row-gap": 6,
      "--ui-variant-label-font-size": 12.5,
      "--ui-variant-select-font-size": 14.5,
      "--ui-variant-select-height": 35,
      "--ui-variant-select-padding-x": 15,
      "--ui-variant-select-radius": 28,
      "--ui-variant-details-padding": 9,
      "--ui-variant-details-row-gap": 0,
      "--ui-variant-details-column-gap": 3,
      "--ui-variant-details-label-width": 48,
      "--ui-variant-details-slider-width": 80,
      "--ui-variant-details-value-width": 31,
      "--ui-variant-details-label-font-size": 7,
      "--ui-variant-details-value-font-size": 8,
      "--ui-variant-details-button-font-size": 9.5,
      "--ui-variant-details-button-height": 16,
      "--ui-variant-details-button-padding-x": 10,
      "--ui-variant-details-button-gap": 0,
      "--ui-case-button-font-size": 13,
      "--ui-case-button-gap": 2,
      "--ui-case-button-left": 7,
      "--ui-case-button-bottom": -12,
      "--ui-left-mini-button-size": 19,
      "--ui-left-mini-button-font-size": 16,
      "--ui-left-mini-button-gap": 0,
      "--ui-panel-2-label-slider-gap": 0,
      "--ui-panel-2-slider-value-gap": 14,
      "--ui-panel-2-value-fixed-gap": 0,
      "--ui-panel-2-slider-offset-x": 4,
      "--ui-panel-2-fixed-font-size": 9,
      "--ui-panel-2-fixed-height": 12,
      "--ui-panel-2-fixed-padding-x": 0,
      "--ui-color-blend-off-bg": "#cdc8c8",
      "--ui-color-blend-active-bg": "#a4a4c6",
      "--ui-color-blend-active-border": "#ca4949",
      "--ui-color-blend-text": "#de4a4a",
      "--ui-color-card-radius": 6,
      "--ui-color-assign-button-radius": 8,
      "--ui-color-action-button-radius": 7,
      "--ui-size-tuner-toggle-bg-alpha": 0.02,
      "--ui-glass-left-current-case-outline-color": "#707070",
      "--ui-glass-bottom-active-outline-color": "#707070",
      "--ui-top-left-small-button-shadow-on": 0,
      "--ui-panel-4-actions-offset-y": 0,
      "--ui-panel-4-slider-group-offset-y": 0,
      "--ui-panel-4-label-offset-y": 0,
      "--ui-panel-4-slider-offset-y": 0,
      "--ui-panel-4-value-offset-y": 0
    },
    "enabled": {
      "共通::表示確認": true,
      "1.配色::表示確認": true,
      "1.配色::馴染ボタン色": true,
      "2.点::表示確認": true,
      "3.カーソル::表示確認": true,
      "4.空間::表示確認": true,
      "下部::表示確認": true,
      "UIバリエーション::表示確認": true,
      "左下UI::表示確認": true,
      "共通::パネル共通": true,
      "共通::スライダー共通": true,
      "1.配色::配色パネル全体": true,
      "1.配色::配色カード": true,
      "1.配色::割当ボタン": true,
      "1.配色::馴染/再配色": true,
      "1.配色::遷移秒/入力": true,
      "2.点::2.点パネル全体": true,
      "2.点::2.点スライダー行": true,
      "2.点::2.点文字": true,
      "3.カーソル::3.カーソルパネル全体": true,
      "3.カーソル::3.カーソルスライダー行": true,
      "3.カーソル::3.カーソル文字": true,
      "4.空間::4.空間パネル全体": true,
      "4.空間::4.空間ボタン": true,
      "4.空間::4.空間スライダー行": true,
      "4.空間::4.空間文字": true,
      "下部::下部操作": true,
      "下部::右下丸ボタン": true,
      "下部::左下番号": true,
      "Neumo::表面ボタン": true,
      "チューナー::チューナーパネル": true,
      "チューナー::チューナー配置": true,
      "UIバリエーション::UIパネル全体": true,
      "UIバリエーション::UIパネル文字": true,
      "UIバリエーション::UIパネル入力": true,
      "UIバリエーション::Glass詳細": true,
      "UIバリエーション::Glass詳細文字": true,
      "UIバリエーション::Glass詳細ボタン": true,
      "左下UI::case番号ボタン": true,
      "左下UI::左下小ボタン": true,
      "2.点::2.点スライダー詳細": true,
      "共通::調整ボタン": true,
      "UI切替::Glass選択色": true,
      "UI切替::左上小ボタン影": true,
      "UIバリエーション::Glass選択色": true,
      "UIバリエーション::左上小ボタン影": true,
      "4.空間::4.空間縦位置": true
    },
    "presets": {
      "2": {
        "values": {
          "guide:共通": true,
          "guide:1.配色": true,
          "--ui-color-blend-off-color": "#c64e4e",
          "--ui-color-blend-on-color": "#dedede",
          "--ui-color-blend-border-color": "#82823a",
          "--ui-color-blend-text-color": "#5196f0",
          "--ui-color-blend-off-fill-alpha": 0.18,
          "--ui-color-blend-on-fill-alpha": 0.26,
          "--ui-color-blend-on-border-alpha": 0.48,
          "--ui-color-blend-text-alpha": 0.86,
          "--ui-color-blend-blue-mix": 0.1,
          "guide:2.点": true,
          "guide:3.カーソル": true,
          "guide:4.空間": true,
          "guide:下部": true,
          "guide:UIバリエーション": true,
          "guide:左下UI": true,
          "--ui-panel-common-header-font-size": 12.5,
          "--ui-panel-common-label-font-size": 9,
          "--ui-panel-common-value-font-size": 9,
          "--ui-panel-common-input-font-size": 9,
          "--ui-panel-common-header-height": 17,
          "--ui-panel-common-slider-thumb-size": 7,
          "--ui-panel-common-slider-track-height": 8,
          "--ui-panel-1-width": 220,
          "--ui-panel-1-padding": 10,
          "--ui-panel-1-row-gap": 6,
          "--ui-panel-1-vertical-gap": 6,
          "--ui-color-card-gap": 3,
          "--ui-color-card-name-line-height": 1.1,
          "--ui-color-card-columns": 3,
          "--ui-color-card-height": 25,
          "--ui-color-card-padding-x": 1,
          "--ui-color-card-name-font-size": 10,
          "--ui-color-swatch-height": 6,
          "--ui-color-assign-button-font-size": 10.5,
          "--ui-color-assign-button-height": 20,
          "--ui-color-assign-button-min-width": 38,
          "--ui-color-assign-button-padding-x": 0,
          "--ui-color-assign-button-gap": 2,
          "--ui-color-action-button-font-size": 10,
          "--ui-color-action-button-height": 21,
          "--ui-color-action-button-min-width": 39,
          "--ui-color-action-button-padding-x": 7,
          "--ui-color-transition-input-font-size": 9,
          "--ui-color-transition-input-width": 38,
          "--ui-color-transition-input-height": 18,
          "--ui-color-transition-actions-gap": 4,
          "--ui-panel-2-width": 220,
          "--ui-panel-2-padding": 9,
          "--ui-panel-2-label-width": 36,
          "--ui-panel-2-slider-width": 80,
          "--ui-panel-2-value-width": 35,
          "--ui-panel-2-fixed-width": 35,
          "--ui-panel-2-column-gap": 2,
          "--ui-panel-2-row-gap": 0,
          "--ui-panel-2-label-font-size": 7.5,
          "--ui-panel-2-value-font-size": 8,
          "--ui-panel-3-width": 220,
          "--ui-panel-3-padding": 7,
          "--ui-panel-3-label-width": 120,
          "--ui-panel-3-check-width": 18,
          "--ui-panel-3-slider-min-width": 70,
          "--ui-panel-3-value-width": 79,
          "--ui-panel-3-value-gap": -8,
          "--ui-panel-3-column-gap": 0,
          "--ui-panel-3-slider-offset-x": -13,
          "--ui-panel-3-value-offset-x": 2,
          "--ui-panel-3-row-gap": 0,
          "--ui-panel-3-row-height": 16,
          "--ui-panel-3-label-font-size": 9.5,
          "--ui-panel-3-value-font-size": 13,
          "--ui-panel-4-width": 220,
          "--ui-panel-4-padding": 8,
          "--ui-panel-4-row-gap": 0,
          "--ui-panel-4-button-font-size": 10.5,
          "--ui-panel-4-action-height": 23,
          "--ui-panel-4-action-gap": 3,
          "--ui-panel-4-label-width": 32,
          "--ui-panel-4-slider-min-width": 126,
          "--ui-panel-4-value-width": 58,
          "--ui-panel-4-column-gap": 0,
          "--ui-panel-4-row-height": 16,
          "--ui-panel-4-value-gap": -8,
          "--ui-panel-4-slider-offset-x": -8,
          "--ui-panel-4-value-offset-x": 38,
          "--ui-panel-4-label-font-size": 11,
          "--ui-panel-4-value-font-size": 14,
          "--ui-bottom-button-font-size": 8,
          "--ui-bottom-button-height": 21,
          "--ui-bottom-button-min-width": 34,
          "--ui-bottom-button-padding-x": 7,
          "--ui-bottom-button-gap": 6,
          "--ui-bottom-round-button-size": 22,
          "--ui-case-button-size": 21,
          "--ui-neumo-surface-button-font-size": 7,
          "--ui-neumo-surface-button-height": 17,
          "--ui-neumo-surface-button-min-width": 18,
          "--ui-neumo-surface-button-padding-x": 1,
          "--ui-size-tuner-panel-width": 420,
          "--ui-size-tuner-panel-max-height": 620,
          "--ui-size-tuner-font-size": 11,
          "--ui-size-tuner-bg-alpha": 0.94,
          "--ui-size-tuner-page-gap": 9,
          "--ui-size-tuner-group-padding": 12,
          "--ui-size-tuner-row-label-width": 108,
          "--ui-size-tuner-row-value-width": 72,
          "--ui-size-tuner-row-computed-width": 90,
          "--ui-size-tuner-row-column-gap": 10,
          "--ui-variant-panel-width": 388,
          "--ui-variant-panel-padding": 12,
          "--ui-variant-panel-gap": 2,
          "--ui-variant-panel-row-gap": 6,
          "--ui-variant-label-font-size": 12.5,
          "--ui-variant-select-font-size": 14.5,
          "--ui-variant-select-height": 35,
          "--ui-variant-select-padding-x": 15,
          "--ui-variant-select-radius": 28,
          "--ui-variant-details-padding": 9,
          "--ui-variant-details-row-gap": 0,
          "--ui-variant-details-column-gap": 3,
          "--ui-variant-details-label-width": 48,
          "--ui-variant-details-slider-width": 80,
          "--ui-variant-details-value-width": 31,
          "--ui-variant-details-label-font-size": 7,
          "--ui-variant-details-value-font-size": 8,
          "--ui-variant-details-button-font-size": 9.5,
          "--ui-variant-details-button-height": 16,
          "--ui-variant-details-button-padding-x": 10,
          "--ui-variant-details-button-gap": 0,
          "--ui-case-button-font-size": 13,
          "--ui-case-button-gap": 2,
          "--ui-case-button-left": 7,
          "--ui-case-button-bottom": -12,
          "--ui-left-mini-button-size": 19,
          "--ui-left-mini-button-font-size": 16,
          "--ui-left-mini-button-gap": 0,
          "--ui-panel-2-label-slider-gap": 0,
          "--ui-panel-2-slider-value-gap": 14,
          "--ui-panel-2-value-fixed-gap": 0,
          "--ui-panel-2-slider-offset-x": 4,
          "--ui-panel-2-fixed-font-size": 9,
          "--ui-panel-2-fixed-height": 12,
          "--ui-panel-2-fixed-padding-x": 0,
          "--ui-color-blend-off-bg": "#cdc8c8",
          "--ui-color-blend-active-bg": "#a4a4c6",
          "--ui-color-blend-active-border": "#ca4949",
          "--ui-color-blend-text": "#de4a4a",
          "--ui-color-card-radius": 6,
          "--ui-color-assign-button-radius": 8,
          "--ui-color-action-button-radius": 7,
          "--ui-size-tuner-toggle-bg-alpha": 0.02,
          "--ui-glass-left-current-case-outline-color": "#707070",
          "--ui-glass-bottom-active-outline-color": "#707070",
          "--ui-top-left-small-button-shadow-on": 0,
          "--ui-panel-4-actions-offset-y": 0,
          "--ui-panel-4-slider-group-offset-y": 0,
          "--ui-panel-4-label-offset-y": 0,
          "--ui-panel-4-slider-offset-y": 0,
          "--ui-panel-4-value-offset-y": 0
        },
        "enabled": {
          "共通::表示確認": true,
          "1.配色::表示確認": true,
          "1.配色::馴染ボタン色": true,
          "2.点::表示確認": true,
          "3.カーソル::表示確認": true,
          "4.空間::表示確認": true,
          "下部::表示確認": true,
          "UIバリエーション::表示確認": true,
          "左下UI::表示確認": true,
          "共通::パネル共通": true,
          "共通::スライダー共通": true,
          "1.配色::配色パネル全体": true,
          "1.配色::配色カード": true,
          "1.配色::割当ボタン": true,
          "1.配色::馴染/再配色": true,
          "1.配色::遷移秒/入力": true,
          "2.点::2.点パネル全体": true,
          "2.点::2.点スライダー行": true,
          "2.点::2.点文字": true,
          "3.カーソル::3.カーソルパネル全体": true,
          "3.カーソル::3.カーソルスライダー行": true,
          "3.カーソル::3.カーソル文字": true,
          "4.空間::4.空間パネル全体": true,
          "4.空間::4.空間ボタン": true,
          "4.空間::4.空間スライダー行": true,
          "4.空間::4.空間文字": true,
          "下部::下部操作": true,
          "下部::右下丸ボタン": true,
          "下部::左下番号": true,
          "Neumo::表面ボタン": true,
          "チューナー::チューナーパネル": true,
          "チューナー::チューナー配置": true,
          "UIバリエーション::UIパネル全体": true,
          "UIバリエーション::UIパネル文字": true,
          "UIバリエーション::UIパネル入力": true,
          "UIバリエーション::Glass詳細": true,
          "UIバリエーション::Glass詳細文字": true,
          "UIバリエーション::Glass詳細ボタン": true,
          "左下UI::case番号ボタン": true,
          "左下UI::左下小ボタン": true,
          "2.点::2.点スライダー詳細": true,
          "共通::調整ボタン": true,
          "UI切替::Glass選択色": true,
          "UI切替::左上小ボタン影": true,
          "UIバリエーション::Glass選択色": true,
          "UIバリエーション::左上小ボタン影": true,
          "4.空間::4.空間縦位置": true
        }
      },
      "3": {
        "values": {
          "guide:共通": true,
          "guide:1.配色": true,
          "--ui-color-blend-off-color": "#c64e4e",
          "--ui-color-blend-on-color": "#dedede",
          "--ui-color-blend-border-color": "#82823a",
          "--ui-color-blend-text-color": "#5196f0",
          "--ui-color-blend-off-fill-alpha": 0.18,
          "--ui-color-blend-on-fill-alpha": 0.26,
          "--ui-color-blend-on-border-alpha": 0.48,
          "--ui-color-blend-text-alpha": 0.86,
          "--ui-color-blend-blue-mix": 0.1,
          "guide:2.点": true,
          "guide:3.カーソル": true,
          "guide:4.空間": true,
          "guide:下部": true,
          "guide:UIバリエーション": true,
          "guide:左下UI": true,
          "--ui-panel-common-header-font-size": 12.5,
          "--ui-panel-common-label-font-size": 9,
          "--ui-panel-common-value-font-size": 9,
          "--ui-panel-common-input-font-size": 9,
          "--ui-panel-common-header-height": 17,
          "--ui-panel-common-slider-thumb-size": 7,
          "--ui-panel-common-slider-track-height": 8,
          "--ui-panel-1-width": 220,
          "--ui-panel-1-padding": 10,
          "--ui-panel-1-row-gap": 6,
          "--ui-panel-1-vertical-gap": 6,
          "--ui-color-card-gap": 3,
          "--ui-color-card-name-line-height": 1.1,
          "--ui-color-card-columns": 3,
          "--ui-color-card-height": 25,
          "--ui-color-card-padding-x": 1,
          "--ui-color-card-name-font-size": 10,
          "--ui-color-swatch-height": 6,
          "--ui-color-assign-button-font-size": 10.5,
          "--ui-color-assign-button-height": 20,
          "--ui-color-assign-button-min-width": 38,
          "--ui-color-assign-button-padding-x": 0,
          "--ui-color-assign-button-gap": 2,
          "--ui-color-action-button-font-size": 10,
          "--ui-color-action-button-height": 21,
          "--ui-color-action-button-min-width": 39,
          "--ui-color-action-button-padding-x": 7,
          "--ui-color-transition-input-font-size": 9,
          "--ui-color-transition-input-width": 38,
          "--ui-color-transition-input-height": 18,
          "--ui-color-transition-actions-gap": 4,
          "--ui-panel-2-width": 220,
          "--ui-panel-2-padding": 9,
          "--ui-panel-2-label-width": 36,
          "--ui-panel-2-slider-width": 80,
          "--ui-panel-2-value-width": 35,
          "--ui-panel-2-fixed-width": 35,
          "--ui-panel-2-column-gap": 2,
          "--ui-panel-2-row-gap": 0,
          "--ui-panel-2-label-font-size": 7.5,
          "--ui-panel-2-value-font-size": 8,
          "--ui-panel-3-width": 220,
          "--ui-panel-3-padding": 7,
          "--ui-panel-3-label-width": 120,
          "--ui-panel-3-check-width": 18,
          "--ui-panel-3-slider-min-width": 70,
          "--ui-panel-3-value-width": 79,
          "--ui-panel-3-value-gap": -8,
          "--ui-panel-3-column-gap": 0,
          "--ui-panel-3-slider-offset-x": -13,
          "--ui-panel-3-value-offset-x": 2,
          "--ui-panel-3-row-gap": 0,
          "--ui-panel-3-row-height": 16,
          "--ui-panel-3-label-font-size": 9.5,
          "--ui-panel-3-value-font-size": 13,
          "--ui-panel-4-width": 220,
          "--ui-panel-4-padding": 8,
          "--ui-panel-4-row-gap": 0,
          "--ui-panel-4-button-font-size": 10.5,
          "--ui-panel-4-action-height": 23,
          "--ui-panel-4-action-gap": 3,
          "--ui-panel-4-label-width": 32,
          "--ui-panel-4-slider-min-width": 126,
          "--ui-panel-4-value-width": 58,
          "--ui-panel-4-column-gap": 0,
          "--ui-panel-4-row-height": 16,
          "--ui-panel-4-value-gap": -8,
          "--ui-panel-4-slider-offset-x": -8,
          "--ui-panel-4-value-offset-x": 38,
          "--ui-panel-4-label-font-size": 11,
          "--ui-panel-4-value-font-size": 14,
          "--ui-bottom-button-font-size": 8,
          "--ui-bottom-button-height": 21,
          "--ui-bottom-button-min-width": 34,
          "--ui-bottom-button-padding-x": 7,
          "--ui-bottom-button-gap": 6,
          "--ui-bottom-round-button-size": 22,
          "--ui-case-button-size": 21,
          "--ui-neumo-surface-button-font-size": 7,
          "--ui-neumo-surface-button-height": 17,
          "--ui-neumo-surface-button-min-width": 18,
          "--ui-neumo-surface-button-padding-x": 1,
          "--ui-size-tuner-panel-width": 420,
          "--ui-size-tuner-panel-max-height": 620,
          "--ui-size-tuner-font-size": 11,
          "--ui-size-tuner-bg-alpha": 0.94,
          "--ui-size-tuner-page-gap": 9,
          "--ui-size-tuner-group-padding": 12,
          "--ui-size-tuner-row-label-width": 108,
          "--ui-size-tuner-row-value-width": 72,
          "--ui-size-tuner-row-computed-width": 90,
          "--ui-size-tuner-row-column-gap": 10,
          "--ui-variant-panel-width": 388,
          "--ui-variant-panel-padding": 12,
          "--ui-variant-panel-gap": 2,
          "--ui-variant-panel-row-gap": 6,
          "--ui-variant-label-font-size": 12.5,
          "--ui-variant-select-font-size": 14.5,
          "--ui-variant-select-height": 35,
          "--ui-variant-select-padding-x": 15,
          "--ui-variant-select-radius": 28,
          "--ui-variant-details-padding": 9,
          "--ui-variant-details-row-gap": 0,
          "--ui-variant-details-column-gap": 3,
          "--ui-variant-details-label-width": 48,
          "--ui-variant-details-slider-width": 80,
          "--ui-variant-details-value-width": 31,
          "--ui-variant-details-label-font-size": 7,
          "--ui-variant-details-value-font-size": 8,
          "--ui-variant-details-button-font-size": 9.5,
          "--ui-variant-details-button-height": 16,
          "--ui-variant-details-button-padding-x": 10,
          "--ui-variant-details-button-gap": 0,
          "--ui-case-button-font-size": 13,
          "--ui-case-button-gap": 2,
          "--ui-case-button-left": 7,
          "--ui-case-button-bottom": -12,
          "--ui-left-mini-button-size": 19,
          "--ui-left-mini-button-font-size": 16,
          "--ui-left-mini-button-gap": 0,
          "--ui-panel-2-label-slider-gap": 0,
          "--ui-panel-2-slider-value-gap": 14,
          "--ui-panel-2-value-fixed-gap": 0,
          "--ui-panel-2-slider-offset-x": 4,
          "--ui-panel-2-fixed-font-size": 9,
          "--ui-panel-2-fixed-height": 12,
          "--ui-panel-2-fixed-padding-x": 0,
          "--ui-color-blend-off-bg": "#cdc8c8",
          "--ui-color-blend-active-bg": "#a4a4c6",
          "--ui-color-blend-active-border": "#ca4949",
          "--ui-color-blend-text": "#de4a4a",
          "--ui-color-card-radius": 6,
          "--ui-color-assign-button-radius": 8,
          "--ui-color-action-button-radius": 7,
          "--ui-size-tuner-toggle-bg-alpha": 0.02,
          "--ui-glass-left-current-case-outline-color": "#707070",
          "--ui-glass-bottom-active-outline-color": "#707070",
          "--ui-top-left-small-button-shadow-on": 0,
          "--ui-panel-4-actions-offset-y": 0,
          "--ui-panel-4-slider-group-offset-y": 0,
          "--ui-panel-4-label-offset-y": 0,
          "--ui-panel-4-slider-offset-y": 0,
          "--ui-panel-4-value-offset-y": 0
        },
        "enabled": {
          "共通::表示確認": true,
          "1.配色::表示確認": true,
          "1.配色::馴染ボタン色": true,
          "2.点::表示確認": true,
          "3.カーソル::表示確認": true,
          "4.空間::表示確認": true,
          "下部::表示確認": true,
          "UIバリエーション::表示確認": true,
          "左下UI::表示確認": true,
          "共通::パネル共通": true,
          "共通::スライダー共通": true,
          "1.配色::配色パネル全体": true,
          "1.配色::配色カード": true,
          "1.配色::割当ボタン": true,
          "1.配色::馴染/再配色": true,
          "1.配色::遷移秒/入力": true,
          "2.点::2.点パネル全体": true,
          "2.点::2.点スライダー行": true,
          "2.点::2.点文字": true,
          "3.カーソル::3.カーソルパネル全体": true,
          "3.カーソル::3.カーソルスライダー行": true,
          "3.カーソル::3.カーソル文字": true,
          "4.空間::4.空間パネル全体": true,
          "4.空間::4.空間ボタン": true,
          "4.空間::4.空間スライダー行": true,
          "4.空間::4.空間文字": true,
          "下部::下部操作": true,
          "下部::右下丸ボタン": true,
          "下部::左下番号": true,
          "Neumo::表面ボタン": true,
          "チューナー::チューナーパネル": true,
          "チューナー::チューナー配置": true,
          "UIバリエーション::UIパネル全体": true,
          "UIバリエーション::UIパネル文字": true,
          "UIバリエーション::UIパネル入力": true,
          "UIバリエーション::Glass詳細": true,
          "UIバリエーション::Glass詳細文字": true,
          "UIバリエーション::Glass詳細ボタン": true,
          "左下UI::case番号ボタン": true,
          "左下UI::左下小ボタン": true,
          "2.点::2.点スライダー詳細": true,
          "共通::調整ボタン": true,
          "UI切替::Glass選択色": true,
          "UI切替::左上小ボタン影": true,
          "UIバリエーション::Glass選択色": true,
          "UIバリエーション::左上小ボタン影": true,
          "4.空間::4.空間縦位置": true
        }
      }
    },
    "copyMode": "diff",
    "exportedAt": "2026-06-14T23:45:36.822Z"
  },
  "theme": {
    "uiVariant": "variant-1-glass",
    "uiVariantMain": "variant-1-glass",
    "uiVariantPreset": "custom:初期設定",
    "uiNeumorphismVariantPreset": "custom:初期設定"
  },
  "themePresets": {
    "uiGlassCustomPresets": {
      "初期設定": {
        "lightAngle": -28,
        "surfaceColor": "#f8fbff",
        "surfaceColorAlpha": 0.64,
        "opacity": 0.32,
        "colorInfluence": 0.22,
        "paletteAlpha": 0.28,
        "blurAmount": 0.72,
        "saturation": 0.08,
        "brightness": 0.04,
        "chromAberration": 0.05,
        "innerWarp": 0.12,
        "refraction": 0.76,
        "reflectionColor": "#ffffff",
        "reflectionColorAlpha": 0.86,
        "reflectionColorSaturation": 1,
        "specular": 0.18,
        "shadowOpacity": 0.42,
        "shadowSpread": 34,
        "faceHighlightDistance": 42,
        "reflectionSize": 126,
        "shadowSize": 148,
        "shadowColor": "#1d2636",
        "shadowColorAlpha": 0.62,
        "shadowColorSaturation": 0.72,
        "shadowColorInfluence": 0.24,
        "cornerRadius": 12,
        "edgeHighlight": 0.24,
        "edgeWidth": 1.4,
        "edgeBlend": 0.38,
        "edgeColor": "#ffffff",
        "edgeColorAlpha": 0.74,
        "fresnel": 0.8,
        "bevelMode": 0,
        "dropShadowOpacity": 0.28,
        "dropShadowSpread": 24,
        "dropShadowSharpness": 0.38,
        "dropShadowColor": "#1d2636",
        "dropShadowColorAlpha": 0.62
      }
    },
    "uiGlassPresetEditLocks": {
      "custom:初期設定": true
    },
    "uiNeumorphismCustomPresets": {
      "初期設定": {
        "embossStrength": 0.16,
        "blurRadius": 4,
        "highlightStrength": 0.28,
        "shadowStrength": 0.44,
        "surfaceColor": "#e2e7eb",
        "accentColor": "#aac6ee",
        "neumoPanelSurfaceShape": "flat",
        "followCanvasBackground": true,
        "materialFollowSurface": true,
        "neumoTextLighting": false,
        "lightingSaturation": 0.47,
        "panelCornerRadius": 20,
        "inkCoverage": 0.82,
        "inkFadeSeconds": 1.2,
        "inkSpreadSeconds": 0.6,
        "neumoLightDirection": "top-left"
      }
    },
    "uiNeumorphismPresetEditLocks": {
      "custom:初期設定": true
    }
  },
  "canvasState": {},
  "colorState": {},
  "uiLayout": {},
  "cursorState": {},
  "uiGlassPresetDetailsOpen": true,
  "caseSettings": {
    "case0": {
      "config": {
        "count": 38,
        "color": [
          0,
          0,
          0
        ],
        "size": 18,
        "radius": 693.84,
        "trailLength": 37,
        "morphSpeed": 0.0084,
        "fadeSpeed": 0.0324,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 20,
        "color": [
          0,
          0,
          0
        ],
        "size": 38.36,
        "radius": 257.84,
        "trailLength": 217,
        "morphSpeed": 0.0234,
        "fadeSpeed": 0.05,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case1": {
      "config": {
        "count": 4,
        "color": [
          56,
          17,
          13
        ],
        "size": 83.32,
        "radius": 93.29,
        "trailLength": 17,
        "morphSpeed": 0.0073,
        "fadeSpeed": 0.0005,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 4,
        "color": [
          0,
          0,
          0
        ],
        "size": 41,
        "radius": 72,
        "trailLength": 15,
        "morphSpeed": 0.02,
        "fadeSpeed": 0.08,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case2": {
      "config": {
        "count": 90,
        "color": [
          0,
          0,
          83
        ],
        "size": 1,
        "radius": 289.71,
        "trailLength": 16,
        "morphSpeed": 0.022,
        "fadeSpeed": 0.0313,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 8,
        "color": [
          0,
          0,
          0
        ],
        "size": 12,
        "radius": 100,
        "trailLength": 25,
        "morphSpeed": 0.01,
        "fadeSpeed": 0.06,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case3": {
      "config": {
        "count": 28,
        "color": [
          0,
          0,
          0
        ],
        "size": 1,
        "radius": 30,
        "trailLength": 30,
        "morphSpeed": 0.047,
        "fadeSpeed": 0.009,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 13,
        "color": [
          0,
          0,
          0
        ],
        "size": 74,
        "radius": 30,
        "trailLength": 30,
        "morphSpeed": 0.01,
        "fadeSpeed": 0.04,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case4": {
      "config": {
        "count": 16,
        "color": [
          0,
          45,
          40
        ],
        "size": 7.24,
        "radius": 314.56,
        "trailLength": 20,
        "morphSpeed": 0.0227,
        "fadeSpeed": 0.0225,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 33,
        "color": [
          0,
          45,
          40
        ],
        "size": 12,
        "radius": 300,
        "trailLength": 20,
        "morphSpeed": 0.04,
        "fadeSpeed": 0.07,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case5": {
      "config": {
        "count": 16,
        "color": [
          0,
          0,
          15
        ],
        "size": 86.21,
        "radius": 167.22,
        "trailLength": 172,
        "morphSpeed": 0.0321,
        "fadeSpeed": 0.0568,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 16,
        "color": [
          0,
          0,
          0
        ],
        "size": 13,
        "radius": 80,
        "trailLength": 20,
        "morphSpeed": 0.03,
        "fadeSpeed": 0.07,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case6": {
      "config": {
        "count": 5,
        "color": [
          59,
          63,
          57
        ],
        "size": 26.33,
        "radius": 92.26,
        "trailLength": 27,
        "morphSpeed": 0.0286,
        "fadeSpeed": 0.0007,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 33,
        "color": [
          0,
          45,
          40
        ],
        "size": 12,
        "radius": 30,
        "trailLength": 20,
        "morphSpeed": 0.04,
        "fadeSpeed": 0.07,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case7": {
      "config": {
        "count": 12,
        "color": [
          0,
          0,
          0
        ],
        "size": 16.27,
        "radius": 141.16,
        "trailLength": 108,
        "morphSpeed": 0.0406,
        "fadeSpeed": 0.0118,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 16,
        "color": [
          0,
          0,
          0
        ],
        "size": 21,
        "radius": 80,
        "trailLength": 20,
        "morphSpeed": 0.04,
        "fadeSpeed": 0.07,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case8": {
      "config": {
        "count": 16,
        "color": [
          4,
          11,
          56
        ],
        "size": 27.79,
        "radius": 38.53,
        "trailLength": 237,
        "morphSpeed": 0.0143,
        "fadeSpeed": 0.0042,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 33,
        "color": [
          0,
          45,
          40
        ],
        "size": 12,
        "radius": 30,
        "trailLength": 20,
        "morphSpeed": 0.04,
        "fadeSpeed": 0.07,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case9": {
      "config": {
        "count": 3,
        "color": [
          236,
          224,
          198
        ],
        "size": 18,
        "radius": 250,
        "trailLength": 72,
        "morphSpeed": 0.01,
        "fadeSpeed": 0.046,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 3,
        "color": [
          236,
          224,
          198
        ],
        "size": 18,
        "radius": 250,
        "trailLength": 72,
        "morphSpeed": 0.01,
        "fadeSpeed": 0.046,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    },
    "case10": {
      "config": {
        "count": 16,
        "color": [
          4,
          11,
          56
        ],
        "size": 27.79,
        "radius": 38.53,
        "trailLength": 237,
        "morphSpeed": 0.0143,
        "fadeSpeed": 0.0042,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "n": 2,
        "a": 200,
        "b": 200,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 33,
        "color": [
          0,
          45,
          40
        ],
        "size": 12,
        "radius": 30,
        "trailLength": 20,
        "morphSpeed": 0.04,
        "fadeSpeed": 0.07,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "n": 2,
        "a": 200,
        "b": 200,
        "pointSequenceSeconds": 8
      }
    },
    "case11": {
      "config": {
        "count": 6,
        "color": [
          0,
          0,
          0
        ],
        "size": 36,
        "radius": 240,
        "trailLength": 120,
        "morphSpeed": 0.012,
        "fadeSpeed": 0.0026,
        "waveSpacing": 120,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      },
      "initialConfig": {
        "count": 6,
        "color": [
          0,
          0,
          0
        ],
        "size": 36,
        "radius": 240,
        "trailLength": 120,
        "morphSpeed": 0.012,
        "fadeSpeed": 0.0026,
        "waveSpacing": 120,
        "vectorSpeed": 1,
        "vectorDirection": 0,
        "vectorSize": 10,
        "image": null,
        "pointSequenceSeconds": 8
      }
    }
  },
  "registeredSlots": {
    "schemaVersion": 1,
    "cases": {
      "0": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 0,
            "point": {
              "fixed": {
                "count": 20,
                "size": 38.36,
                "radius": 257.84,
                "trailLength": 217,
                "morphSpeed": 0.0234,
                "fadeSpeed": 0.05,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "1": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 1,
            "point": {
              "fixed": {
                "count": 4,
                "size": 41,
                "radius": 72,
                "trailLength": 15,
                "morphSpeed": 0.02,
                "fadeSpeed": 0.08,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "2": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 2,
            "point": {
              "fixed": {
                "count": 8,
                "size": 12,
                "radius": 100,
                "trailLength": 25,
                "morphSpeed": 0.01,
                "fadeSpeed": 0.06,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "3": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 3,
            "point": {
              "fixed": {
                "count": 13,
                "size": 74,
                "radius": 30,
                "trailLength": 30,
                "morphSpeed": 0.01,
                "fadeSpeed": 0.04,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "4": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 4,
            "point": {
              "fixed": {
                "count": 33,
                "size": 12,
                "radius": 300,
                "trailLength": 20,
                "morphSpeed": 0.04,
                "fadeSpeed": 0.07,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "5": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 5,
            "point": {
              "fixed": {
                "count": 16,
                "size": 13,
                "radius": 80,
                "trailLength": 20,
                "morphSpeed": 0.03,
                "fadeSpeed": 0.07,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "6": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 6,
            "point": {
              "fixed": {
                "count": 33,
                "size": 12,
                "radius": 30,
                "trailLength": 20,
                "morphSpeed": 0.04,
                "fadeSpeed": 0.07,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "7": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 7,
            "point": {
              "fixed": {
                "count": 16,
                "size": 21,
                "radius": 80,
                "trailLength": 20,
                "morphSpeed": 0.04,
                "fadeSpeed": 0.07,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "8": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 8,
            "point": {
              "fixed": {
                "count": 33,
                "size": 12,
                "radius": 30,
                "trailLength": 20,
                "morphSpeed": 0.04,
                "fadeSpeed": 0.07,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "9": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 9,
            "point": {
              "fixed": {
                "count": 3,
                "size": 18,
                "radius": 250,
                "trailLength": 72,
                "morphSpeed": 0.01,
                "fadeSpeed": 0.046,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "10": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 10,
            "point": {
              "fixed": {
                "count": 33,
                "size": 12,
                "radius": 30,
                "trailLength": 20,
                "morphSpeed": 0.04,
                "fadeSpeed": 0.07,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      },
      "11": {
        "base": {
          "slotId": "-",
          "locked": true,
          "snapshot": {
            "schemaVersion": 1,
            "caseId": 11,
            "point": {
              "fixed": {
                "count": 6,
                "size": 36,
                "radius": 240,
                "trailLength": 120,
                "morphSpeed": 0.012,
                "fadeSpeed": 0.0026,
                "pointSequenceSeconds": 8
              },
              "cycles": {},
              "extraParams": []
            },
            "color": {
              "storage": {
                "colorThemeCardState": null,
                "colorThemeAssignMode": "alternate",
                "colorThemeBlendEnabled": 0,
                "colorTransitionSeconds": null,
                "useRandomColors": null,
                "randomColorCount": null,
                "randomColorAssignMode": null,
                "colorMode": null,
                "hueCount": null,
                "mixMin": null,
                "mixMax": null,
                "hueRangeAssignMode": null,
                "saturationMin": null,
                "saturationMax": null,
                "paletteSystem": null,
                "colorEngineSettings": {
                  "engineEnabled": true,
                  "groupCount": 2,
                  "assignModeGlobal": "alternate",
                  "mixMin": 0.15,
                  "mixMax": 1,
                  "baseSeed": 1781480164519
                },
                "globalCanvasBgColor": null
              },
              "enginePublicState": {
                "engineEnabled": true,
                "groupCount": 2,
                "assignModeGlobal": "alternate",
                "mixMin": 0.15,
                "mixMax": 1,
                "baseColors": [
                  [
                    225,
                    240,
                    5
                  ],
                  [
                    91,
                    91,
                    240
                  ]
                ],
                "baseSeed": 1781480164519
              },
              "applyStatus": "capture-only-until-color-adapter-is-validated"
            },
            "render": {
              "trailMode": "history",
              "canvasBackground": "#e1e1e1"
            },
            "transition": {
              "pointSequenceSeconds": 8
            },
            "metadata": {
              "capturedAs": "base",
              "capturedAt": "2026-06-14T23:36:05.836Z"
            }
          }
        },
        "slots": {}
      }
    }
  },
  "note": "Seeded from exported custom presets plus accessible Chrome localStorage snapshots. Existing localStorage values are not overwritten on startup.",
  "updatedAt": "2026-06-15T00:06:12.792Z"
}
`);

    const INITIAL_STORAGE_KEYS = [
        'uiVariant',
        'uiVariantMain',
        'uiVariantPreset',
        'uiNeumorphismVariantPreset',
        'uiLiquidGlassVariantPreset',
        'uiGlassCustomPresets',
        'uiGlassPresetParams',
        'uiGlassPresetEditLocks',
        'uiNeumorphismCustomPresets',
        'uiNeumorphismPresetParams',
        'uiNeumorphismPresetEditLocks',
        'uiLiquidGlassCustomPresets',
        'uiLiquidGlassPresetParams',
        'uiLiquidGlassPresetEditLocks',
        'globalCanvasBgColor',
        'globalRenderMode',
        'colorThemeCardState',
        'colorThemeAssignMode',
        'colorThemeBlendEnabled',
        'colorTransitionSeconds',
        'useRandomColors',
        'randomColorCount',
        'randomColorAssignMode',
        'colorMode',
        'hueCount',
        'mixMin',
        'mixMax',
        'hueRangeAssignMode',
        'saturationMin',
        'saturationMax',
        'paletteSystem',
        'colorEngineSettings',
        'casePaletteLayoutMode',
        'uiVariantCompactPositionV65',
        'uiVariantPanelCompactHidden',
        'uiGlassPanelPositions',
        'uiGlassPanelVisibility',
        'allCaseSettings'
    ];

    const ARTWORK_STORAGE_KEYS = [
        'p5jsRegisteredArtworkSlotsV1',
        'p5jsArtworkSnapshotStoreV1'
    ];

    const EXCLUDED_RUNTIME_KEYS = [
        'uiux.engineDiagnostics.enabled',
        'uiux.engineSwitcher.open',
        'uiGlassPresetEditLocksMigratedV2',
        'uiGlassPresetDetailsOpen',
        'uiNeumorphismPresetDetailsOpen',
        'uiLiquidGlassPresetDetailsOpen'
    ];

    function safeParse(raw) {
        if (raw == null) return null;
        try { return JSON.parse(raw); } catch (_) { return raw; }
    }

    function readStorageValue(key) {
        const raw = localStorage.getItem(key);
        if (raw == null) return undefined;
        return safeParse(raw);
    }

    function writeStorageValue(key, value) {
        if (value === undefined) return;
        if (value === null) {
            localStorage.removeItem(key);
            return;
        }
        if (typeof value === 'string') localStorage.setItem(key, value);
        else localStorage.setItem(key, JSON.stringify(value));
    }

    function writeStorageValueIfMissing(key, value) {
        if (value === undefined || localStorage.getItem(key) != null) return false;
        writeStorageValue(key, value);
        return true;
    }

    function isSupportedInitialSettingsSchema(schema) {
        return schema === INITIAL_SETTINGS_SCHEMA || schema === LEGACY_INITIAL_SETTINGS_SCHEMA;
    }

    function readBundledJsonSync(url) {
        try {
            const request = new XMLHttpRequest();
            request.open('GET', url, false);
            request.send(null);
            if ((request.status >= 200 && request.status < 300) || request.status === 0) {
                return JSON.parse(request.responseText);
            }
        } catch (_) {}
        return null;
    }

    function cloneBundledInitialSettings() {
        try {
            return JSON.parse(JSON.stringify(BUNDLED_INITIAL_SETTINGS_EMBEDDED));
        } catch (_) {
            return BUNDLED_INITIAL_SETTINGS_EMBEDDED;
        }
    }

    function collectKeys(keys) {
        const out = {};
        keys.forEach((key) => {
            const value = readStorageValue(key);
            if (value !== undefined) out[key] = value;
        });
        return out;
    }

    function collectPrefix(prefix) {
        const out = {};
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith(prefix)) continue;
            out[key] = readStorageValue(key);
        }
        return out;
    }

    function countObjectEntries(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return 0;
        return Object.keys(value).length;
    }

    function normalizeThemeValue(value) {
        if (value === 'variant-2-neumorphism') return 'Neumorphism';
        if (value === 'variant-1-glass') return 'Glass';
        return value ? String(value) : 'なし';
    }

    function summarizeRegisteredSlots(store) {
        const cases = store && typeof store === 'object' && store.cases && typeof store.cases === 'object'
            ? store.cases
            : {};
        const caseRows = Object.keys(cases)
            .map((caseId) => {
                const record = cases[caseId] && typeof cases[caseId] === 'object' ? cases[caseId] : {};
                const slots = record.slots && typeof record.slots === 'object' ? record.slots : {};
                const slotIds = Object.keys(slots).filter((slotId) => slotId && slotId !== '-').sort();
                return {
                    caseId,
                    slotIds,
                    slotCount: slotIds.length
                };
            })
            .filter((row) => row.slotCount > 0)
            .sort((a, b) => Number(a.caseId) - Number(b.caseId));
        const registeredSlotCount = caseRows.reduce((sum, row) => sum + row.slotCount, 0);
        return {
            registeredSlotCount,
            hasSlots: registeredSlotCount > 0,
            caseRows,
            caseSummaryText: registeredSlotCount > 0
                ? caseRows.map((row) => `case${row.caseId}: ${row.slotIds.join(', ')}`).join(' / ')
                : '登録スロットなし'
        };
    }

    function describeUserInitialSettingsValue(key, value) {
        if (value === undefined) return 'なし';
        if (key === 'uiSizeTuner') return 'あり';
        if (key === 'uiGlassPresetDetailsOpen' || key === 'uiNeumorphismPresetDetailsOpen') {
            return value === true ? '開' : '閉';
        }
        if (key === 'uiVariantMain' || key === 'uiVariant') {
            return normalizeThemeValue(value);
        }
        if (key === 'uiVariantPreset' || key === 'uiNeumorphismVariantPreset') {
            return value ? String(value) : 'なし';
        }
        if (key === 'p5jsRegisteredArtworkSlotsV1') {
            const slots = summarizeRegisteredSlots(value);
            return slots.caseSummaryText;
        }
        if (key === 'allCaseSettings') {
            const count = countObjectEntries(value);
            return count > 0 ? `${count}件` : 'なし';
        }
        if (key === 'uiGlassCustomPresets' || key === 'uiGlassPresetEditLocks' || key === 'uiGlassPresetParams'
            || key === 'uiNeumorphismCustomPresets' || key === 'uiNeumorphismPresetEditLocks' || key === 'uiNeumorphismPresetParams') {
            const count = countObjectEntries(value);
            return count > 0 ? `${count}件` : 'なし';
        }
        if (value === null) return 'null';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'なし';
        if (typeof value === 'string') return value || 'なし';
        if (typeof value === 'object') return `${countObjectEntries(value)}件`;
        return String(value);
    }

    function collectUserInitialSettingsKeys() {
        const keys = {};
        USER_INITIAL_SETTINGS_GROUPS.forEach((group) => {
            group.items.forEach((item) => {
                const storageKey = item.storageKey || item.key;
                const value = item.key === 'uiSizeTuner' ? getUiSizeTunerSnapshot() : readStorageValue(storageKey);
                if (value !== undefined) keys[item.key] = value;
            });
        });
        return keys;
    }

    function buildUserInitialSettingsSummary(keys) {
        const allCaseSettings = keys.allCaseSettings;
        const registeredSlots = summarizeRegisteredSlots(keys.p5jsRegisteredArtworkSlotsV1);
        const uiGlassCustomPresets = keys.uiGlassCustomPresets;
        const uiNeumorphismCustomPresets = keys.uiNeumorphismCustomPresets;
        return {
            caseCount: countObjectEntries(allCaseSettings),
            registeredSlotCount: registeredSlots.registeredSlotCount,
            glassPresetCount: countObjectEntries(uiGlassCustomPresets),
            neumorphismPresetCount: countObjectEntries(uiNeumorphismCustomPresets),
            hasUiSizeTuner: keys.uiSizeTuner !== undefined && keys.uiSizeTuner !== null,
            activeGlassPreset: keys.uiVariantPreset ? String(keys.uiVariantPreset) : 'なし',
            activeNeumorphismPreset: keys.uiNeumorphismVariantPreset ? String(keys.uiNeumorphismVariantPreset) : 'なし'
        };
    }

    function getUserInitialSettingsSections(payload = exportUserInitialSettings()) {
        const keys = payload && typeof payload === 'object' && payload.keys && typeof payload.keys === 'object'
            ? payload.keys
            : {};
        return USER_INITIAL_SETTINGS_GROUPS.map((group) => ({
            label: group.label,
            items: group.items.map((item) => {
                const value = Object.prototype.hasOwnProperty.call(keys, item.key) ? keys[item.key] : undefined;
                return {
                    key: item.key,
                    label: item.summaryLabel || item.label,
                    present: value !== undefined,
                    value,
                    valueText: describeUserInitialSettingsValue(item.key, value)
                };
            })
        }));
    }

    function getUserInitialSettingsReport(payload = exportUserInitialSettings()) {
        const validation = validateUserInitialSettingsPayload(payload);
        const keys = payload && typeof payload === 'object' && payload.keys && typeof payload.keys === 'object'
            ? payload.keys
            : {};
        return {
            schema: payload && payload.schema,
            version: payload && payload.version,
            exportedAt: payload && payload.exportedAt,
            source: payload && payload.source,
            validation,
            summary: buildUserInitialSettingsSummary(keys),
            sections: getUserInitialSettingsSections(payload),
            registeredSlots: summarizeRegisteredSlots(keys.p5jsRegisteredArtworkSlotsV1),
            themeValue: normalizeThemeValue(keys.uiVariantMain || keys.uiVariant)
        };
    }

    function exportUserInitialSettings() {
        const keys = collectUserInitialSettingsKeys();
        const summary = buildUserInitialSettingsSummary(keys);
        return {
            schema: USER_INITIAL_SETTINGS_SCHEMA,
            version: USER_INITIAL_SETTINGS_EXPORT_VERSION,
            exportedAt: new Date().toISOString(),
            source: USER_INITIAL_SETTINGS_SOURCE,
            keys,
            summary
        };
    }

    function validateUserInitialSettingsPayload(payload) {
        const report = {
            ok: true,
            schema: payload && payload.schema,
            version: payload && payload.version,
            warnings: []
        };
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            report.ok = false;
            report.warnings.push('payload が object ではありません。');
            return report;
        }
        if (payload.schema !== USER_INITIAL_SETTINGS_SCHEMA) {
            report.ok = false;
            report.warnings.push(`schema が ${USER_INITIAL_SETTINGS_SCHEMA} ではありません。`);
        }
        if (payload.version !== USER_INITIAL_SETTINGS_EXPORT_VERSION) {
            report.ok = false;
            report.warnings.push(`version が ${USER_INITIAL_SETTINGS_EXPORT_VERSION} ではありません。`);
        }
        if (!payload.keys || typeof payload.keys !== 'object' || Array.isArray(payload.keys)) {
            report.ok = false;
            report.warnings.push('keys が object ではありません。');
        }
        return report;
    }

    function parseUserInitialSettingsText(text) {
        try {
            const payload = JSON.parse(text);
            const validation = validateUserInitialSettingsPayload(payload);
            return {
                ok: validation.ok,
                payload,
                validation
            };
        } catch (error) {
            return {
                ok: false,
                error,
                validation: {
                    ok: false,
                    warnings: [error && error.message ? error.message : 'JSONの解析に失敗しました。']
                }
            };
        }
    }

    function applyUserInitialSettings(payload, options = {}) {
        const validation = validateUserInitialSettingsPayload(payload);
        if (!validation.ok) {
            return {
                ok: false,
                validation,
                changed: false,
                appliedKeys: []
            };
        }
        const keys = payload.keys || {};
        const appliedKeys = [];
        USER_INITIAL_SETTINGS_GROUPS.forEach((group) => {
            group.items.forEach((item) => {
                if (!Object.prototype.hasOwnProperty.call(keys, item.key)) return;
                const storageKey = item.key === 'uiSizeTuner' ? UI_SIZE_TUNER_KEY : (item.storageKey || item.key);
                const value = keys[item.key];
                if (item.key === 'uiSizeTuner') {
                    if (value !== undefined) {
                        applyUiSizeTunerSnapshot(value);
                        appliedKeys.push(item.key);
                    }
                    return;
                }
                writeStorageValue(storageKey, value);
                appliedKeys.push(item.key);
            });
        });
        if (options.reload !== false && appliedKeys.length > 0) {
            setTimeout(() => window.location.reload(), 60);
        }
        return {
            ok: true,
            validation,
            changed: appliedKeys.length > 0,
            appliedKeys
        };
    }

    function getUiSizeTunerSnapshot() {
        try {
            if (window.UISizeTunerAPI && typeof window.UISizeTunerAPI.getSnapshot === 'function') {
                const snapshot = window.UISizeTunerAPI.getSnapshot();
                if (snapshot && typeof snapshot === 'object') return snapshot;
            }
        } catch (error) {
            console.warn('[initial-settings] UISizeTunerAPI.getSnapshot failed', error);
        }
        const stored = readStorageValue(UI_SIZE_TUNER_KEY);
        return stored && typeof stored === 'object' ? stored : null;
    }

    function applyUiSizeTunerSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') return false;
        try {
            if (window.UISizeTunerAPI && typeof window.UISizeTunerAPI.applySnapshot === 'function') {
                return Boolean(window.UISizeTunerAPI.applySnapshot(snapshot));
            }
        } catch (error) {
            console.warn('[initial-settings] UISizeTunerAPI.applySnapshot failed', error);
        }
        writeStorageValue(UI_SIZE_TUNER_KEY, snapshot);
        return true;
    }


    function waitForUiSizeTunerAPI(timeoutMs = 2400) {
        return new Promise((resolve) => {
            const startedAt = Date.now();
            const check = () => {
                if (window.UISizeTunerAPI && typeof window.UISizeTunerAPI.applySnapshot === 'function') {
                    resolve(true);
                    return;
                }
                if (Date.now() - startedAt >= timeoutMs) {
                    resolve(false);
                    return;
                }
                setTimeout(check, 40);
            };
            check();
        });
    }

    function hasValue(value) {
        if (value === undefined || value === null) return false;
        if (typeof value === 'object') return Object.keys(value).length > 0;
        return true;
    }

    function validateInitialSettingsPayload(payload) {
        const report = {
            ok: true,
            schema: payload && payload.schema,
            missingSections: [],
            emptySections: [],
            warnings: []
        };
        if (!payload || typeof payload !== 'object') {
            report.ok = false;
            report.warnings.push('payload が object ではありません。');
            return report;
        }
        if (!isSupportedInitialSettingsSchema(payload.schema)) {
            report.ok = false;
            report.warnings.push('schema が uiux-animation-tools.default-user-state ではありません。');
        }
        ['uiSizeTuner', 'theme', 'themePresets', 'canvasState', 'colorState', 'uiLayout', 'cursorState'].forEach((section) => {
            if (!(section in payload)) {
                report.missingSections.push(section);
                report.ok = false;
            } else if (!hasValue(payload[section])) {
                report.emptySections.push(section);
            }
        });
        ['caseSettings', 'registeredSlots'].forEach((section) => {
            if (!(section in payload)) {
                report.missingSections.push(section);
            } else if (!hasValue(payload[section])) {
                report.emptySections.push(section);
            }
        });
        if (!payload.uiSizeTuner || payload.uiSizeTuner.storageKey !== UI_SIZE_TUNER_KEY) {
            report.ok = false;
            report.warnings.push(`uiSizeTuner.storageKey が ${UI_SIZE_TUNER_KEY} ではありません。`);
        }
        if (payload.uiSizeTunerStorageKey && payload.uiSizeTunerStorageKey !== UI_SIZE_TUNER_KEY) {
            report.ok = false;
            report.warnings.push(`uiSizeTunerStorageKey が ${UI_SIZE_TUNER_KEY} ではありません。`);
        }
        return report;
    }

    function getInitialSettingsCoverageReport(payload = exportInitialSettings()) {
        const validation = validateInitialSettingsPayload(payload);
        const flat = flattenInitialPayload(payload);
        const localStorageCoverage = {};
        INITIAL_STORAGE_KEYS.forEach((key) => {
            localStorageCoverage[key] = {
                exported: flat[key] !== undefined,
                currentlyStored: localStorage.getItem(key) != null
            };
        });
        const cursorKeys = Object.keys(collectPrefix('cursorUI_'));
        return {
            generatedAt: new Date().toISOString(),
            uiSizeTunerStorageKey: UI_SIZE_TUNER_KEY,
            validation,
            localStorageCoverage,
            cursorKeys,
            artworkKeysSeparated: ARTWORK_STORAGE_KEYS.slice(),
            excludedRuntimeKeys: EXCLUDED_RUNTIME_KEYS.slice()
        };
    }

    function exportInitialSettings() {
        const uiSizeTuner = getUiSizeTunerSnapshot();
        const storage = collectKeys(INITIAL_STORAGE_KEYS);
        const artwork = collectKeys(ARTWORK_STORAGE_KEYS);
        const cursorState = collectPrefix('cursorUI_');
        return {
            schema: INITIAL_SETTINGS_SCHEMA,
            version: VERSION,
            exportedAt: new Date().toISOString(),
            uiSizeTunerStorageKey: UI_SIZE_TUNER_KEY,
            uiSizeTuner,
            theme: {
                uiVariant: storage.uiVariant,
                uiVariantMain: storage.uiVariantMain,
                uiVariantPreset: storage.uiVariantPreset,
                uiNeumorphismVariantPreset: storage.uiNeumorphismVariantPreset,
                uiLiquidGlassVariantPreset: storage.uiLiquidGlassVariantPreset
            },
            themePresets: {
                uiGlassCustomPresets: storage.uiGlassCustomPresets,
                uiGlassPresetParams: storage.uiGlassPresetParams,
                uiGlassPresetEditLocks: storage.uiGlassPresetEditLocks,
                uiNeumorphismCustomPresets: storage.uiNeumorphismCustomPresets,
                uiNeumorphismPresetParams: storage.uiNeumorphismPresetParams,
                uiNeumorphismPresetEditLocks: storage.uiNeumorphismPresetEditLocks,
                uiLiquidGlassCustomPresets: storage.uiLiquidGlassCustomPresets,
                uiLiquidGlassPresetParams: storage.uiLiquidGlassPresetParams,
                uiLiquidGlassPresetEditLocks: storage.uiLiquidGlassPresetEditLocks
            },
            canvasState: {
                globalCanvasBgColor: storage.globalCanvasBgColor,
                globalRenderMode: storage.globalRenderMode
            },
            colorState: {
                colorThemeCardState: storage.colorThemeCardState,
                colorThemeAssignMode: storage.colorThemeAssignMode,
                colorThemeBlendEnabled: storage.colorThemeBlendEnabled,
                colorTransitionSeconds: storage.colorTransitionSeconds,
                useRandomColors: storage.useRandomColors,
                randomColorCount: storage.randomColorCount,
                randomColorAssignMode: storage.randomColorAssignMode,
                colorMode: storage.colorMode,
                hueCount: storage.hueCount,
                mixMin: storage.mixMin,
                mixMax: storage.mixMax,
                hueRangeAssignMode: storage.hueRangeAssignMode,
                saturationMin: storage.saturationMin,
                saturationMax: storage.saturationMax,
                paletteSystem: storage.paletteSystem,
                colorEngineSettings: storage.colorEngineSettings
            },
            uiLayout: {
                casePaletteLayoutMode: storage.casePaletteLayoutMode,
                uiVariantCompactPositionV65: storage.uiVariantCompactPositionV65,
                uiVariantPanelCompactHidden: storage.uiVariantPanelCompactHidden,
                uiGlassPanelPositions: storage.uiGlassPanelPositions,
                uiGlassPanelVisibility: storage.uiGlassPanelVisibility
            },
            cursorState,
            caseSettings: storage.allCaseSettings,
            uiGlassPresetDetailsOpen: readStorageValue('uiGlassPresetDetailsOpen'),
            registeredSlots: artwork.p5jsRegisteredArtworkSlotsV1,
            snapshotStore: artwork.p5jsArtworkSnapshotStoreV1,
            excludedRuntimeKeys: EXCLUDED_RUNTIME_KEYS.slice()
        };
    }

    function exportArtworkSlots() {
        const storage = collectKeys(ARTWORK_STORAGE_KEYS);
        return {
            schema: ARTWORK_SLOTS_SCHEMA,
            version: VERSION,
            exportedAt: new Date().toISOString(),
            registeredSlots: storage.p5jsRegisteredArtworkSlotsV1,
            snapshotStore: storage.p5jsArtworkSnapshotStoreV1
        };
    }

    function flattenInitialPayload(payload) {
        if (!payload || typeof payload !== 'object') return {};
        const out = {};
        const copy = (source) => {
            if (!source || typeof source !== 'object') return;
            Object.entries(source).forEach(([key, value]) => {
                if (value !== undefined) out[key] = value;
            });
        };
        copy(payload.theme);
        copy(payload.themePresets);
        copy(payload.canvasState);
        copy(payload.colorState);
        copy(payload.uiLayout);
        if (payload.uiGlassPresetDetailsOpen !== undefined) out.uiGlassPresetDetailsOpen = payload.uiGlassPresetDetailsOpen;
        if (payload.uiState !== undefined) out.uiState = payload.uiState;
        if (payload.caseSettings !== undefined) out.allCaseSettings = payload.caseSettings;
        if (payload.allCaseSettings !== undefined) out.allCaseSettings = payload.allCaseSettings;
        if (payload.registeredSlots !== undefined) out.p5jsRegisteredArtworkSlotsV1 = payload.registeredSlots;
        if (payload.snapshotStore !== undefined) out.p5jsArtworkSnapshotStoreV1 = payload.snapshotStore;
        return out;
    }

    function applyInitialSettings(payload, options = {}) {
        if (!payload || typeof payload !== 'object') return false;
        if (payload.schema && !isSupportedInitialSettingsSchema(payload.schema)) return false;
        const flat = flattenInitialPayload(payload);
        let changed = false;
        Object.entries(flat).forEach(([key, value]) => {
            changed = writeStorageValueIfMissing(key, value) || changed;
        });
        if (payload.cursorState && typeof payload.cursorState === 'object') {
            Object.entries(payload.cursorState).forEach(([key, value]) => {
                if (key.startsWith('cursorUI_')) changed = writeStorageValueIfMissing(key, value) || changed;
            });
        }
        if (payload.uiSizeTuner && localStorage.getItem(UI_SIZE_TUNER_KEY) == null) {
            changed = applyUiSizeTunerSnapshot(payload.uiSizeTuner) || changed;
        }
        if (options.reload !== false && changed) {
            setTimeout(() => window.location.reload(), 60);
        }
        return changed;
    }

    function applyArtworkSlots(payload, options = {}) {
        if (!payload || typeof payload !== 'object') return false;
        if (payload.schema && payload.schema !== ARTWORK_SLOTS_SCHEMA) return false;
        writeStorageValue('p5jsRegisteredArtworkSlotsV1', payload.registeredSlots);
        writeStorageValue('p5jsArtworkSnapshotStoreV1', payload.snapshotStore);
        if (options.reload === true) setTimeout(() => window.location.reload(), 60);
        return true;
    }

    function downloadJson(filename, payload) {
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function downloadInitialSettings() {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadJson(`uiux-animation-tools_initial-settings_${stamp}.json`, exportInitialSettings());
    }

    function downloadArtworkSlots() {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadJson(`uiux-animation-tools_artwork-slots_${stamp}.json`, exportArtworkSlots());
    }

    function downloadUserInitialSettings() {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadJson(`uiux-animation-tools_user-initial-settings_${stamp}.json`, exportUserInitialSettings());
    }

    async function importInitialSettingsFile(file, options = {}) {
        if (!file) return false;
        const text = await file.text();
        return applyInitialSettings(JSON.parse(text), options);
    }

    async function importArtworkSlotsFile(file, options = {}) {
        if (!file) return false;
        const text = await file.text();
        return applyArtworkSlots(JSON.parse(text), options);
    }


    function fetchBundledInitialSettings() {
        if (window.location && window.location.protocol === 'file:') {
            const fallback = cloneBundledInitialSettings();
            if (fallback && isSupportedInitialSettingsSchema(fallback.schema)) return fallback;
        }
        const bundledSync = readBundledJsonSync(BUNDLED_INITIAL_SETTINGS_URL);
        if (bundledSync && isSupportedInitialSettingsSchema(bundledSync.schema)) return bundledSync;
        if (typeof fetch === 'function') {
            return fetch(BUNDLED_INITIAL_SETTINGS_URL, { cache: 'no-store' })
                .then((response) => {
                    if (!response || !response.ok) return null;
                    return response.json();
                })
                .then((payload) => {
                    if (payload && isSupportedInitialSettingsSchema(payload.schema)) return payload;
                    const fallback = cloneBundledInitialSettings();
                    if (fallback && isSupportedInitialSettingsSchema(fallback.schema)) return fallback;
                    return null;
                })
                .catch(() => {
                    const fallback = cloneBundledInitialSettings();
                    if (fallback && isSupportedInitialSettingsSchema(fallback.schema)) return fallback;
                    return null;
                });
        }
        const fallback = cloneBundledInitialSettings();
        if (fallback && isSupportedInitialSettingsSchema(fallback.schema)) return fallback;
        return null;
    }

    function applyBundledInitialSettings(options = {}) {
        const reload = options.reload !== false;
        const resolveAndApply = (payload) => {
            if (!payload) return false;
            const validation = validateInitialSettingsPayload(payload);
            if (!validation.ok) {
                console.warn('[initial-settings] bundled initial settings validation warning', validation);
            }
            return applyInitialSettings(payload, { reload });
        };
        const payload = fetchBundledInitialSettings();
        if (payload && typeof payload.then === 'function') {
            return payload.then(resolveAndApply);
        }
        return resolveAndApply(payload);
    }

    function scheduleBundledInitialSettingsApply() {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        const result = applyBundledInitialSettings({ reload: false });
        if (result && typeof result.then === 'function') {
            result.catch((error) => {
                console.warn('[initial-settings] bundled initial settings apply failed', error);
            });
        }
    }

    window.UIUXInitialSettingsAPI = {
        schema: INITIAL_SETTINGS_SCHEMA,
        version: VERSION,
        uiSizeTunerStorageKey: UI_SIZE_TUNER_KEY,
        initialStorageKeys: INITIAL_STORAGE_KEYS.slice(),
        artworkStorageKeys: ARTWORK_STORAGE_KEYS.slice(),
        excludedRuntimeKeys: EXCLUDED_RUNTIME_KEYS.slice(),
        bundledInitialSettingsUrl: BUNDLED_INITIAL_SETTINGS_URL,
        hasEmbeddedBundledInitialSettings: true,
        userInitialSettingsSchema: USER_INITIAL_SETTINGS_SCHEMA,
        userInitialSettingsVersion: USER_INITIAL_SETTINGS_EXPORT_VERSION,
        userInitialSettingsSource: USER_INITIAL_SETTINGS_SOURCE,
        getUserInitialSettingsReport,
        exportUserInitialSettings,
        validateUserInitialSettingsPayload,
        parseUserInitialSettingsText,
        applyUserInitialSettings,
        downloadUserInitialSettings,
        exportInitialSettings,
        validateInitialSettingsPayload,
        getInitialSettingsCoverageReport,
        applyInitialSettings,
        downloadInitialSettings,
        importInitialSettingsFile,
        fetchBundledInitialSettings,
        applyBundledInitialSettings,
        exportArtworkSlots,
        applyArtworkSlots,
        downloadArtworkSlots,
        importArtworkSlotsFile
    };

    scheduleBundledInitialSettingsApply();
})();
