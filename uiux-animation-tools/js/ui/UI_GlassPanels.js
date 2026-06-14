// UI_GlassPanels.js - Glass時のパネル配置とドラッグ操作

window.UIGlassPanels = (function() {
    const PUBLIC_DEMO_DISABLE_EXPORT_IMPORT = false;
    const PUBLIC_DEMO_DISABLED_TITLE = '公開デモでは無効';
    const DEBUG_LAYOUT_LOGS = false;
    function layoutDebugLog(...args) {
        if (DEBUG_LAYOUT_LOGS) console.log(...args);
    }

    const STORAGE_KEY = 'uiGlassPanelPositions';
    const VISIBILITY_STORAGE_KEY = 'uiGlassPanelVisibility';
    const GLASS_PRESET_DETAILS_KEY = 'uiGlassPresetDetailsOpen';
    const GLASS_PRESET_PARAMS_KEY = 'uiGlassPresetParams';
    const GLASS_PRESET_EDIT_LOCKS_KEY = 'uiGlassPresetEditLocks';
    const GLASS_PRESET_EDIT_LOCKS_MIGRATED_V2_KEY = 'uiGlassPresetEditLocksMigratedV2';
    const GLASS_PRESET_EXPORT_VERSION = 1;
    const SETTINGS_PANEL_ID = 'glass-settings-panel';
    const SETTINGS_PANEL_TEST_ID = 'glass-settings-panel-test';
    const CURSOR_PANEL_1_ID = 'glass-cursor-panel-1';
    const CURSOR_PANEL_2_ID = 'glass-cursor-panel-2';
    const CURSOR_PANEL_3_ID = 'glass-cursor-panel-3';
    const CURSOR_PANEL_4_ID = 'glass-cursor-panel-4';
    const CURSOR_PANEL_5_ID = 'glass-cursor-panel-5';
    const CURSOR_PANEL_6_ID = 'glass-cursor-panel-6';
    const CURSOR_PANEL_7_ID = 'glass-cursor-panel-7';
    const CURSOR_PANEL_HIDDEN_ID = CURSOR_PANEL_5_ID;
    const SETTINGS_TOGGLE_ID = 'glass-settings-toggle';
    const SETTINGS_TOGGLE_TEST_ID = 'glass-settings-toggle-test';
    const CURSOR_TOGGLE_ALL_OPEN_ID = 'glass-cursor-toggle-all-open';
    const CURSOR_TOGGLE_ALL_CLOSE_ID = 'glass-cursor-toggle-all-close';
    const SETTINGS_CLOSE_CLASS = 'glass-settings-close';
    const SETTINGS_CLOSE_TEST_CLASS = 'glass-settings-close-test';
    const GLASS_PRESET_CUSTOM_KEY = 'uiGlassCustomPresets';
    const NEUMORPHISM_PRESET_DETAILS_KEY = 'uiNeumorphismPresetDetailsOpen';
    const NEUMORPHISM_PRESET_PARAMS_KEY = 'uiNeumorphismPresetParams';
    const NEUMORPHISM_PRESET_EDIT_LOCKS_KEY = 'uiNeumorphismPresetEditLocks';
    const NEUMORPHISM_PRESET_CUSTOM_KEY = 'uiNeumorphismCustomPresets';
    const NEUMORPHISM_PRESET_SELECTION_KEY = 'uiNeumorphismVariantPreset';
    const GLASS_PRESET_SELECTION_KEY = 'uiVariantPreset';
    const LIQUID_GLASS_PRESET_DETAILS_KEY = 'uiLiquidGlassPresetDetailsOpen';
    const LIQUID_GLASS_PRESET_PARAMS_KEY = 'uiLiquidGlassPresetParams';
    const LIQUID_GLASS_PRESET_EDIT_LOCKS_KEY = 'uiLiquidGlassPresetEditLocks';
    const LIQUID_GLASS_PRESET_CUSTOM_KEY = 'uiLiquidGlassCustomPresets';
    const LIQUID_GLASS_PRESET_SELECTION_KEY = 'uiLiquidGlassVariantPreset';
    const RESET_EDGE_MARGIN = 30;
    const PANEL_VISIBILITY_ANIMATION_MS = 700;
    const RESET_PANELS_ANIMATION_MS = 2700;
    const C_TOGGLE_OPEN_LOCK_MS = 1320;
    const C_TOGGLE_CLOSE_LOCK_MS = 980;
    const MOTION_LOCK_RELEASE_BUFFER_MS = 120;
    const panelVisibilityTimers = new WeakMap();
    const panelCollapseTimers = new WeakMap();
    const panelDockHideTimers = new WeakMap();
    const panel5PlacementTimers = new WeakMap();
    let lastThemeChangeAt = 0;
    let themeLayoutSettleTimer = 0;
    let uiVariantIdleReturnTimer = null;
    let uiVariantIdleReturnSequence = 0;
    let numberedDockLandingGuardTimer = null;
    let numberedDockLandingGuardSequence = 0;
    let dockArrangeSequence = 0;
    let startupCollapsedDockPreserveActive = false;
    let publicDemoDisabledObserver = null;
    let publicDemoFileInputClickPatched = false;
    let caseComparisonInitialPlacementActive = false;
    let caseComparisonResetPlacementPending = false;
    let suppressCaseComparisonPlacementAnimationUntil = 0;
    let utilityPanelMotionLockTimer = 0;
    let utilityPanelMotionLockReason = '';
    let utilityPanelMotionLockUntil = 0;
    const individualPanelCollapsedStateBeforeHide = new Map();
    const DOCKED_PANEL_DEFS = [
        { key: 'color', label: '1.配色', displayOrder: 1, id: CURSOR_PANEL_3_ID, idPrefix: 'cursor-panel-3-' },
        { key: 'points', label: '2.点', displayOrder: 2, id: CURSOR_PANEL_4_ID, idPrefix: 'cursor-panel-4-' },
        { key: 'cursor', label: '3.カーソル', displayOrder: 3, id: CURSOR_PANEL_6_ID, idPrefix: 'cursor-panel-6-' },
        { key: 'spatial', label: '4.空間', displayOrder: 4, id: CURSOR_PANEL_7_ID, idPrefix: 'cursor-panel-7-' }
    ];
    const CURSOR_PANEL_REGISTRY = [
        { index: 1, id: CURSOR_PANEL_1_ID, title: '5-1 カーソル設定', idPrefix: 'cursor-panel-1-' },
        { index: 2, id: CURSOR_PANEL_2_ID, title: '5-2 カーソル設定', idPrefix: 'cursor-panel-2-' },
        ...DOCKED_PANEL_DEFS.map((panel) => ({
            index: panel.displayOrder + 2,
            id: panel.id,
            title: panel.label,
            idPrefix: panel.idPrefix
        })),
        { index: 5, id: CURSOR_PANEL_5_ID, title: '4表示', idPrefix: 'cursor-panel-5-' },
    ];
    const FLOATING_PANEL_IDS = [
        'ui-variant-panel',
        'glass-control-bar',
        SETTINGS_PANEL_ID,
        SETTINGS_PANEL_TEST_ID,
        ...CURSOR_PANEL_REGISTRY.map((panel) => panel.id),
        'case-comparison'
    ];
    const PANEL_IDS = [
        'ui-variant-panel',
        'glass-control-bar',
        'glass-settings-panel',
        ...CURSOR_PANEL_REGISTRY.map((panel) => panel.id),
        'canvas-size-container',
        'button-container',
        'color-container',
        'slider-container',
        'svg-file-container',
        'svg-anime-container',
        'load-container',
        'vector-container'
    ];
    const DOCKED_HOME = new Map();
    const SETTINGS_PANEL_DEFAULT_PLACEMENT = { right: 24, bottom: 120 };
    const DEFAULT_LAYOUT = {
        'ui-variant-panel': { x: 0, y: 0, left: 14, top: 14 },
        'glass-control-bar': { x: 0, y: 0, right: 14, bottom: 14 },
        [SETTINGS_PANEL_ID]: { x: 0, y: 0, right: 24, top: 860 },
        [SETTINGS_PANEL_TEST_ID]: { x: 0, y: 0, right: 24, bottom: 212 },
        [CURSOR_PANEL_1_ID]: { x: 0, y: 0, right: 24, top: 512 },
        [CURSOR_PANEL_2_ID]: { x: 0, y: 0, right: 24, top: 570 },
        [CURSOR_PANEL_3_ID]: { x: 0, y: 0, right: 24, top: 628 },
        [CURSOR_PANEL_4_ID]: { x: 0, y: 0, right: 24, top: 686 },
        [CURSOR_PANEL_6_ID]: { x: 0, y: 0, right: 24, top: 744 },
        [CURSOR_PANEL_7_ID]: { x: 0, y: 0, right: 24, top: 802 },
        [CURSOR_PANEL_5_ID]: { x: 0, y: 0, right: 24, bottom: 24 },
        'canvas-size-container': { x: 0, y: 0, right: 24, top: 232 },
        'button-container': { x: 0, y: 0, right: 24, top: 302 },
        'color-container': { x: 0, y: 0, right: 24, top: 372 },
        'slider-container': { x: 0, y: 0, right: 24, top: 442 },
        'svg-file-container': { x: 0, y: 0, right: 24, top: 582 },
        'svg-anime-container': { x: 0, y: 0, right: 24, top: 652 },
        'load-container': { x: 0, y: 0, right: 24, top: 722 },
        'vector-container': { x: 0, y: 0, right: 24, top: 792 },
        'case-comparison': { x: 0, y: 0, left: RESET_EDGE_MARGIN, bottom: RESET_EDGE_MARGIN }
    };
    const dragState = {
        active: false,
        dragging: false,
        target: null,
        pointerId: null,
        startX: 0,
        startY: 0,
        startTime: 0,
        pointerOffsetX: 0,
        pointerOffsetY: 0,
        originLeft: 0,
        originTop: 0,
        dragMoved: false,
        suppressNextClick: false
    };
    const glassPresetParamDefs = [
        { category: '光', key: 'lightAngle', label: '光源傾き', title: '左 / 中央 / 右', min: -90, max: 90, step: 1, defaultValue: 0, type: 'range' },
        { category: '面', key: 'surfaceColor', label: '面色', defaultValue: '#f8fbff', type: 'color' },
        { category: '面', key: 'surfaceColorAlpha', label: '面色透明度', title: '指定した面色そのものの透明度', min: 0, max: 1, step: 0.01, defaultValue: 1, type: 'range' },
        { category: '面', key: 'opacity', label: '面密度', title: 'パネル本体の白い面の濃さ', min: 0, max: 1, step: 0.01, defaultValue: 0.08, type: 'range' },
        { category: '面', key: 'colorInfluence', label: '面色の乗り', title: '面色をパネル面へどれだけ混ぜるか', min: 0, max: 1, step: 0.01, defaultValue: 0.15 },
        { category: '全体', key: 'paletteAlpha', label: '土台透明度', title: 'UI土台全体の透明度。文字やボタンは消さない', min: 0, max: 1, step: 0.01, defaultValue: 0.18, type: 'range' },
        { category: '背面', key: 'blurAmount', label: 'ぼかし量', min: 0, max: 1.5, step: 0.01, defaultValue: 0.25, type: 'range' },
        { category: '背面', key: 'saturation', label: '背景彩度', title: 'backdrop-filterで背後の描画彩度を補正', min: -1, max: 1, step: 0.01, defaultValue: 0 },
        { category: '背面', key: 'brightness', label: '背景輝度', title: 'backdrop-filterで背後の描画明るさを補正', min: -0.5, max: 0.5, step: 0.01, defaultValue: 0 },
        { category: '背面', key: 'chromAberration', label: '色収差', min: 0, max: 0.6, step: 0.01, defaultValue: 0.05 },
        { category: '背面', key: 'innerWarp', label: '屈折歪み', min: 0, max: 1, step: 0.01, defaultValue: 0.12 },
        { category: '反射', key: 'refraction', label: '反射強度', title: '左上側の光沢の量', min: 0, max: 2, step: 0.01, defaultValue: 0.69 },
        { category: '反射', key: 'reflectionColor', label: '反射色', defaultValue: '#ffffff', type: 'color' },
        { category: '反射', key: 'reflectionColorAlpha', label: '反射色透明度', min: 0, max: 1, step: 0.01, defaultValue: 1 },
        { category: '反射', key: 'reflectionColorSaturation', label: '反射色彩度', min: 0, max: 1, step: 0.01, defaultValue: 1 },
        { category: '反射', key: 'specular', label: '表面反射', title: '面への反射乗り', min: 0, max: 1.5, step: 0.01, defaultValue: 0 },
        { category: '陰影', key: 'shadowOpacity', label: '影残り', title: '右下側の影の濃さ', min: 0, max: 1, step: 0.01, defaultValue: 0.3 },
        { category: '陰影', key: 'shadowSpread', label: '陰影拡散', title: '影の広がり', min: 0, max: 120, step: 1, defaultValue: 24 },
        { category: '全体', key: 'faceHighlightDistance', label: '反映陰影距離', title: 'パネル中心から反射/陰影ハイライト中心までの距離', min: 0, max: 70, step: 1, defaultValue: 42 },
        { category: '反射', key: 'reflectionSize', label: '大きさ', title: '面反射ハイライトの直径', min: 30, max: 300, step: 1, defaultValue: 92 },
        { category: '陰影', key: 'shadowSize', label: '大きさ', title: '面陰影ハイライトの直径', min: 30, max: 300, step: 1, defaultValue: 100 },
        { category: '陰影', key: 'shadowColor', label: '影色', defaultValue: '#6f4d3b', type: 'color' },
        { category: '陰影', key: 'shadowColorAlpha', label: '影色透明度', min: 0, max: 1, step: 0.01, defaultValue: 1 },
        { category: '陰影', key: 'shadowColorSaturation', label: '影色彩度', min: 0, max: 1, step: 0.01, defaultValue: 1 },
        { category: '陰影', key: 'shadowColorInfluence', label: '影色反映', title: '内側陰影への影色の反映強度', min: 0, max: 1, step: 0.01, defaultValue: 0.18 },
        { category: '境界', key: 'cornerRadius', label: 'コーナー半径', min: 0, max: 15, step: 1, defaultValue: 15 },
        { category: '境界', key: 'edgeHighlight', label: 'エッジ残り', min: 0, max: 1, step: 0.01, defaultValue: 0.05 },
        { category: '境界', key: 'edgeWidth', label: 'エッジ太さ', min: 0, max: 6, step: 0.1, defaultValue: 1.2 },
        { category: '境界', key: 'edgeBlend', label: '内側なじみ', min: 0, max: 1, step: 0.01, defaultValue: 0.45 },
        { category: '境界', key: 'edgeColor', label: 'エッジ色', defaultValue: '#ffffff', type: 'color' },
        { category: '境界', key: 'edgeColorAlpha', label: 'エッジ色透明度', min: 0, max: 1, step: 0.01, defaultValue: 1 },
        { category: '境界', key: 'fresnel', label: '縁光', min: 0, max: 3, step: 0.01, defaultValue: 1 },
        { category: '境界', key: 'bevelMode', label: 'ベベル', min: 0, max: 1, step: 1, defaultValue: 0, display: '0 / 1', type: 'range' },
        { category: '落ち影', key: 'dropShadowOpacity', label: '落ち影透明度', min: 0, max: 1, step: 0.01, defaultValue: 0.16 },
        { category: '落ち影', key: 'dropShadowSpread', label: '落ち影広がり', min: 0, max: 80, step: 1, defaultValue: 18 },
        { category: '落ち影', key: 'dropShadowSharpness', label: '先端シャープ', min: 0, max: 1, step: 0.01, defaultValue: 0.35 },
        { category: '落ち影', key: 'dropShadowColor', label: '落ち影色', defaultValue: '#1d2636', type: 'color' },
        { category: '落ち影', key: 'dropShadowColorAlpha', label: '落ち影色透明度', min: 0, max: 1, step: 0.01, defaultValue: 1 },
    ];
    const glassPresetCategories = ['光', '面', '全体', '背面', '反射', '陰影', '境界', '落ち影'];
    const liquidGlassPresetParamDefs = [
        { category: '境界', key: 'cornerRadius', label: 'コーナー半径', min: 0, max: 15, step: 1, defaultValue: 11, type: 'range' },
        { category: 'レンズ', key: 'lensDistortion', label: 'ゆがみ', title: '背後の描画を曲げる強さ', min: 0, max: 260, step: 1, defaultValue: 150, type: 'range' }
    ];
    const liquidGlassPresetCategories = ['境界', 'レンズ'];
    const BUILT_IN_PRESET_NAMES = new Set(['1', '2', '3', '4', '5']);
    const PROTECTED_PRESET_NAMES = new Set(['ガラス-1', 'ガラス-2']);
    const CUSTOM_PRESET_PREFIX = 'custom:';
    const INITIAL_GLASS_PRESET_NAME = '初期設定';
    const INITIAL_GLASS_PRESET_VALUES = {
        lightAngle: -28,
        surfaceColor: '#f8fbff',
        surfaceColorAlpha: 0.64,
        opacity: 0.32,
        colorInfluence: 0.22,
        paletteAlpha: 0.28,
        blurAmount: 0.72,
        saturation: 0.08,
        brightness: 0.04,
        chromAberration: 0.05,
        innerWarp: 0.12,
        refraction: 0.76,
        reflectionColor: '#ffffff',
        reflectionColorAlpha: 0.86,
        reflectionColorSaturation: 1,
        specular: 0.18,
        shadowOpacity: 0.42,
        shadowSpread: 34,
        faceHighlightDistance: 42,
        reflectionSize: 126,
        shadowSize: 148,
        shadowColor: '#1d2636',
        shadowColorAlpha: 0.62,
        shadowColorSaturation: 0.72,
        shadowColorInfluence: 0.24,
        cornerRadius: 12,
        edgeHighlight: 0.24,
        edgeWidth: 1.4,
        edgeBlend: 0.38,
        edgeColor: '#ffffff',
        edgeColorAlpha: 0.74,
        fresnel: 0.8,
        bevelMode: 0,
        dropShadowOpacity: 0.28,
        dropShadowSpread: 24,
        dropShadowSharpness: 0.38,
        dropShadowColor: '#1d2636',
        dropShadowColorAlpha: 0.62
    };
    const INITIAL_GLASS_PRESET_KEY = customPresetKey(INITIAL_GLASS_PRESET_NAME);
    const INITIAL_LIQUID_GLASS_PRESET_NAME = '初期設定';
    const INITIAL_LIQUID_GLASS_PRESET_VALUES = {
        cornerRadius: 11,
        lensDistortion: 150
    };
    const INITIAL_LIQUID_GLASS_PRESET_KEY = customPresetKey(INITIAL_LIQUID_GLASS_PRESET_NAME);
    const INITIAL_NEUMORPHISM_PRESET_NAME = '初期設定';
    const INITIAL_NEUMORPHISM_PRESET_KEY = customPresetKey(INITIAL_NEUMORPHISM_PRESET_NAME);
    const neumorphismPresetParamDefs = [
        { category: '立体感', key: 'embossStrength', label: '凹凸', min: 0, max: 1, step: 0.01, defaultValue: 0.58, type: 'range' },
        { category: '立体感', key: 'blurRadius', label: 'ぼかし', min: 4, max: 40, step: 1, defaultValue: 18, type: 'range' },
        { category: '光', key: 'highlightStrength', label: '光', min: 0, max: 1, step: 0.01, defaultValue: 0.82, type: 'range' },
        { category: '影', key: 'shadowStrength', label: '影', min: 0, max: 1, step: 0.01, defaultValue: 0.48, type: 'range' },
        { category: '面', key: 'surfaceColor', label: '面色', defaultValue: '#e2e7eb', type: 'color' },
        { category: '選択', key: 'accentColor', label: '選択色', defaultValue: '#aac6ee', type: 'color' },
        { category: '面', key: 'neumoPanelSurfaceShape', label: '表面', defaultValue: 'flat', type: 'surfaceShape' },
        { category: '面', key: 'followCanvasBackground', label: '背景連動', defaultValue: true, type: 'toggle' },
        { category: '面', key: 'materialFollowSurface', label: '質感連動', defaultValue: true, type: 'toggle' },
        { category: '面', key: 'neumoTextLighting', label: '文字光影', defaultValue: false, type: 'toggle' },
        { category: '面', key: 'lightingSaturation', label: '彩度', title: '背景連動時に背景色の彩度を光と影へ反映', min: 0, max: 2, step: 0.01, defaultValue: 1, type: 'range' },
        { category: '面', key: 'panelCornerRadius', label: '角丸', title: 'Neumorphismパネルの角丸', min: 0, max: 42, step: 1, defaultValue: 16, type: 'range' },
        { category: '面', key: 'inkCoverage', label: 'インク反映', title: 'パネルへのインク反映（表示する範囲）', min: 0, max: 1, step: 0.01, defaultValue: 0.82, type: 'range' },
        { category: '面', key: 'inkFadeSeconds', label: 'インク馴染', title: 'パネルへのインク馴染（消える秒数）', min: 0.1, max: 5, step: 0.1, defaultValue: 1.2, type: 'range' },
        { category: '面', key: 'inkSpreadSeconds', label: 'インク浸透', title: 'パネルへのインク浸透（広がる秒数）', min: 0, max: 3, step: 0.1, defaultValue: 0.6, type: 'range' },
        { category: '面', key: 'neumoLightDirection', label: '光源方向', defaultValue: 'top-left', type: 'direction' }
    ];
    const neumorphismPresetCategories = ['面', '立体感', '光', '影', '選択'];
    const NEUMORPHISM_PRESET_LAYOUT = {
        sliders: ['embossStrength', 'blurRadius', 'highlightStrength', 'shadowStrength', 'panelCornerRadius', 'inkCoverage'],
        toggles: ['materialFollowSurface', 'neumoTextLighting', 'followCanvasBackground'],
        rightSliders: ['lightingSaturation', 'inkFadeSeconds', 'inkSpreadSeconds'],
        colors: ['surfaceColor', 'accentColor'],
        surface: 'neumoPanelSurfaceShape',
        direction: 'neumoLightDirection'
    };
    const INITIAL_NEUMORPHISM_PRESET_VALUES = {
        surfaceColor: '#e2e7eb',
        followCanvasBackground: true,
        materialFollowSurface: true,
        neumoLightDirection: 'top-left',
        neumoPanelSurfaceShape: 'flat',
        neumoTextLighting: false,
        lightingSaturation: 1,
        embossStrength: 0.58,
        highlightStrength: 0.82,
        shadowStrength: 0.48,
        blurRadius: 18,
        panelCornerRadius: 16,
        inkCoverage: 0.82,
        inkFadeSeconds: 1.2,
        inkSpreadSeconds: 0.6,
        accentColor: '#aac6ee'
    };

    function isNeumorphismTheme() {
        return document.body?.dataset?.uiTheme === 'neumorphism';
    }

    function isLiquidGlassTheme() {
        return document.body?.dataset?.uiTheme === 'liquid-glass';
    }

    function getActiveThemeId() {
        if (isNeumorphismTheme()) return 'neumorphism';
        return isLiquidGlassTheme() ? 'liquid-glass' : 'glass';
    }

    function getActivePresetParamDefs() {
        if (isNeumorphismTheme()) return neumorphismPresetParamDefs;
        return isLiquidGlassTheme() ? liquidGlassPresetParamDefs : glassPresetParamDefs;
    }

    function getActivePresetCategories() {
        if (isNeumorphismTheme()) return neumorphismPresetCategories;
        return isLiquidGlassTheme() ? liquidGlassPresetCategories : glassPresetCategories;
    }

    function getActivePresetDetailsKey() {
        if (isNeumorphismTheme()) return NEUMORPHISM_PRESET_DETAILS_KEY;
        return isLiquidGlassTheme() ? LIQUID_GLASS_PRESET_DETAILS_KEY : GLASS_PRESET_DETAILS_KEY;
    }

    function getActivePresetParamsKey() {
        if (isNeumorphismTheme()) return NEUMORPHISM_PRESET_PARAMS_KEY;
        return isLiquidGlassTheme() ? LIQUID_GLASS_PRESET_PARAMS_KEY : GLASS_PRESET_PARAMS_KEY;
    }

    function getActivePresetCustomKey() {
        if (isNeumorphismTheme()) return NEUMORPHISM_PRESET_CUSTOM_KEY;
        return isLiquidGlassTheme() ? LIQUID_GLASS_PRESET_CUSTOM_KEY : GLASS_PRESET_CUSTOM_KEY;
    }

    function getActivePresetLocksKey() {
        if (isNeumorphismTheme()) return NEUMORPHISM_PRESET_EDIT_LOCKS_KEY;
        return isLiquidGlassTheme() ? LIQUID_GLASS_PRESET_EDIT_LOCKS_KEY : GLASS_PRESET_EDIT_LOCKS_KEY;
    }

    function getActivePresetSelectionKey() {
        if (isNeumorphismTheme()) return NEUMORPHISM_PRESET_SELECTION_KEY;
        return isLiquidGlassTheme() ? LIQUID_GLASS_PRESET_SELECTION_KEY : GLASS_PRESET_SELECTION_KEY;
    }
    const GLASS_PRESET_TARGET_SELECTOR = [
        '#ui-variant-panel',
        '#ui-variant-panel *',
        '#ui-container',
        '.ui-container',
        '.ui-container .ui-header',
        '.ui-container .ui-content',
        '.ui-container .ui-content *',
        '#ui-preset-panel',
        '#ui-preset-panel *',
        '#case-comparison',
        '#case-comparison *',
        '#glass-control-bar',
        '#glass-control-bar *',
        '#glass-control-bar .glass-control-pill',
        '#glass-control-bar .glass-panel-quick-toggle-button',
        '#glass-control-bar .canvas-trail-mode-button',
        '#glass-control-bar .canvas-bottom-color-button',
        '#glass-control-bar #glass-panel-code-explain',
        '.code-explain-panel',
        '.code-explain-panel *',
        '.code-explain-overlay',
        '.glass-preset-details',
        '.glass-preset-rows',
        '.glass-preset-actions',
        '.glass-preset-details-toggle',
        '.glass-preset-save',
        '.glass-preset-dup',
        '.glass-preset-new',
        '.glass-preset-rename',
        '.glass-preset-delete'
    ].join(', ');
    const PRESET_DEFAULTS = {
        '1': {
            lightAngle: 0,
            blurAmount: 0.08,
            refraction: 0.18,
            reflectionColor: '#ffffff',
            reflectionColorAlpha: 1,
            reflectionColorSaturation: 1,
            chromAberration: 0,
            edgeHighlight: 0.04,
            specular: 0,
            fresnel: 0.35,
            twist: 0,
            cornerRadius: 12,
            zRadius: 0,
            opacity: 0.05,
            colorInfluence: 0.1,
            saturation: 0,
            brightness: 0,
            innerWarp: 0.08,
            shadowOpacity: 0.06,
            shadowSpread: 14,
            faceHighlightDistance: 42,
            reflectionSize: 92,
            shadowSize: 100,
            shadowColor: '#6f4d3b',
            shadowColorAlpha: 1,
            shadowColorSaturation: 1,
            shadowColorInfluence: 0.12,
            bevelMode: 0,
            surfaceColor: '#f8fbff',
            surfaceColorAlpha: 1,
            paletteAlpha: 0.18
        },
        '2': {
            lightAngle: 0,
            blurAmount: 0.56,
            refraction: 0.69,
            reflectionColor: '#ffffff',
            reflectionColorAlpha: 1,
            reflectionColorSaturation: 1,
            chromAberration: 0.05,
            edgeHighlight: 0.05,
            specular: 0,
            fresnel: 1,
            twist: 0,
            cornerRadius: 14,
            zRadius: 40,
            opacity: 0.08,
            colorInfluence: 0.15,
            saturation: 0,
            brightness: 0,
            innerWarp: 0.12,
            shadowOpacity: 0.3,
            shadowSpread: 24,
            faceHighlightDistance: 42,
            reflectionSize: 92,
            shadowSize: 100,
            shadowColor: '#6f4d3b',
            shadowColorAlpha: 1,
            shadowColorSaturation: 1,
            shadowColorInfluence: 0.18,
            bevelMode: 0,
            surfaceColor: '#f8fbff',
            surfaceColorAlpha: 1,
            paletteAlpha: 0.18
        },
        '3': {
            lightAngle: 0,
            blurAmount: 0.3,
            refraction: 0.1,
            reflectionColor: '#ffffff',
            reflectionColorAlpha: 1,
            reflectionColorSaturation: 1,
            chromAberration: 0,
            edgeHighlight: 0.03,
            specular: 0,
            fresnel: 0.2,
            twist: 0,
            cornerRadius: 14,
            zRadius: 20,
            opacity: 0.16,
            colorInfluence: 0.14,
            saturation: -0.02,
            brightness: -0.04,
            innerWarp: 0.09,
            shadowOpacity: 0.24,
            shadowSpread: 28,
            faceHighlightDistance: 42,
            reflectionSize: 92,
            shadowSize: 100,
            shadowColor: '#6f4d3b',
            shadowColorAlpha: 1,
            shadowColorSaturation: 1,
            shadowColorInfluence: 0.16,
            bevelMode: 0,
            surfaceColor: '#f8fbff',
            surfaceColorAlpha: 1,
            paletteAlpha: 0.18
        },
        '4': {
            lightAngle: 0,
            blurAmount: 0.16,
            refraction: 0.1,
            reflectionColor: '#ffffff',
            reflectionColorAlpha: 1,
            reflectionColorSaturation: 1,
            chromAberration: 0,
            edgeHighlight: 0.02,
            specular: 0,
            fresnel: 0.12,
            twist: 0,
            cornerRadius: 15,
            zRadius: 0,
            opacity: 0.03,
            colorInfluence: 0.08,
            saturation: 0,
            brightness: 0,
            innerWarp: 0.04,
            shadowOpacity: 0.03,
            shadowSpread: 8,
            faceHighlightDistance: 42,
            reflectionSize: 92,
            shadowSize: 100,
            shadowColor: '#6f4d3b',
            shadowColorAlpha: 1,
            shadowColorSaturation: 1,
            shadowColorInfluence: 0.1,
            bevelMode: 0,
            surfaceColor: '#f8fbff',
            surfaceColorAlpha: 1,
            paletteAlpha: 0.18
        },
        '5': {
            lightAngle: 0,
            blurAmount: 0.22,
            refraction: 0.16,
            reflectionColor: '#ffffff',
            reflectionColorAlpha: 1,
            reflectionColorSaturation: 1,
            chromAberration: 0,
            edgeHighlight: 0.04,
            specular: 0,
            fresnel: 0.3,
            twist: 0,
            cornerRadius: 15,
            zRadius: 0,
            opacity: 0.08,
            colorInfluence: 0.12,
            saturation: 0,
            brightness: 0,
            innerWarp: 0.07,
            shadowOpacity: 0.18,
            shadowSpread: 20,
            faceHighlightDistance: 42,
            reflectionSize: 92,
            shadowSize: 100,
            shadowColor: '#6f4d3b',
            shadowColorAlpha: 1,
            shadowColorSaturation: 1,
            shadowColorInfluence: 0.14,
            bevelMode: 0,
            surfaceColor: '#f8fbff',
            surfaceColorAlpha: 1,
            paletteAlpha: 0.18
        }
    };
    let bound = false;
    let floatingLayer = null;
    let currentPresetValues = null;
    let refractionSnapshotTimer = null;
    let dockArrangeRafId = null;
    let caseComparisonArrangeRafId = null;
    let cursorDockLayoutState = null;
    let cursorDockResetOrderHintCache = [];
    let cursorDockResetOrderHintDirty = true;

    function normalizeHexColor(value, fallback = '#f8fbff') {
        if (typeof value !== 'string') return fallback;
        const normalized = value.trim();
        return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized.toLowerCase() : fallback;
    }

    function parseCssColorToRgb(value) {
        if (typeof value !== 'string') return null;
        const color = value.trim();
        const shortHex = color.match(/^#([0-9a-fA-F]{3})$/);
        if (shortHex) {
            const [r, g, b] = shortHex[1].split('').map((part) => parseInt(`${part}${part}`, 16));
            return { r, g, b };
        }
        const longHex = color.match(/^#([0-9a-fA-F]{6})$/);
        if (longHex) {
            return {
                r: parseInt(longHex[1].slice(0, 2), 16),
                g: parseInt(longHex[1].slice(2, 4), 16),
                b: parseInt(longHex[1].slice(4, 6), 16)
            };
        }
        const rgb = color.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*[^)]+)?\s*\)$/i);
        if (!rgb) return null;
        const channels = rgb.slice(1, 4).map((part) => Math.max(0, Math.min(255, Math.round(Number(part)))));
        if (channels.some((channel) => !Number.isFinite(channel))) return null;
        return { r: channels[0], g: channels[1], b: channels[2] };
    }

    function getRelativeLuminance(rgb) {
        const convert = (channel) => {
            const normalized = channel / 255;
            return normalized <= 0.03928
                ? normalized / 12.92
                : ((normalized + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * convert(rgb.r) + 0.7152 * convert(rgb.g) + 0.0722 * convert(rgb.b);
    }

    function getContrastRatio(a, b) {
        const l1 = getRelativeLuminance(a);
        const l2 = getRelativeLuminance(b);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    function chooseReadableTextColorForBackground(bgColor, options = {}) {
        const rgb = parseCssColorToRgb(bgColor);
        if (!rgb) return options.fallback || '#111827';
        const candidates = options.candidates || [
            { color: '#111827', label: 'dark' },
            { color: '#24344d', label: 'softDark' },
            { color: '#ffffff', label: 'light' },
            { color: '#f8fafc', label: 'softLight' }
        ];
        let best = candidates[0]?.color || (options.fallback || '#111827');
        let bestScore = -Infinity;
        candidates.forEach((candidate) => {
            const candidateRgb = parseCssColorToRgb(candidate.color);
            if (!candidateRgb) return;
            const contrast = getContrastRatio(rgb, candidateRgb);
            const bias = candidate.label === 'softDark' || candidate.label === 'softLight' ? 0.04 : 0;
            const score = contrast + bias;
            if (score > bestScore) {
                bestScore = score;
                best = candidate.color;
            }
        });
        return best;
    }

    function getReadableTextColorForBackground(bgColor) {
        return chooseReadableTextColorForBackground(bgColor, { fallback: '#111827' });
    }

    const NEUMO_LIGHT_DIRECTION_FALLBACK = 'top-left';
    const NEUMO_LIGHT_DIRECTION_OPTIONS = [
        { value: 'top-left', label: '↖' },
        { value: 'top-right', label: '↗' },
        { value: 'bottom-left', label: '↙' },
        { value: 'bottom-right', label: '↘' }
    ];
    const NEUMO_LIGHT_DIRECTION_VECTORS = {
        'top-left': { lightX: -1, lightY: -1, shadowX: 1, shadowY: 1 },
        'top-right': { lightX: 1, lightY: -1, shadowX: -1, shadowY: 1 },
        'bottom-left': { lightX: -1, lightY: 1, shadowX: 1, shadowY: -1 },
        'bottom-right': { lightX: 1, lightY: 1, shadowX: -1, shadowY: -1 }
    };

    function normalizeNeumoLightDirection(value) {
        return Object.prototype.hasOwnProperty.call(NEUMO_LIGHT_DIRECTION_VECTORS, value)
            ? value
            : NEUMO_LIGHT_DIRECTION_FALLBACK;
    }

    const NEUMO_PANEL_SURFACE_SHAPE_VALUES = new Set(['flat', 'convex', 'concave', 'pressed']);

    function normalizeNeumoPanelSurfaceShape(value) {
        return NEUMO_PANEL_SURFACE_SHAPE_VALUES.has(value) ? value : 'flat';
    }

    function getNeumoLightDirectionVector(value) {
        const key = normalizeNeumoLightDirection(value);
        return { key, ...NEUMO_LIGHT_DIRECTION_VECTORS[key] };
    }

    function getNeumoTextShadowValue(values = currentPresetValues) {
        const enabled = Boolean(values?.neumoTextLighting);
        if (!enabled) return 'none';
        const themeText = getComputedStyle(document.body || document.documentElement).getPropertyValue('--neumo-text') || '';
        const textColor = parseCssColorToRgb(themeText.trim()) ? themeText.trim() : '';
        const textIsLight = textColor
            ? getRelativeLuminance(parseCssColorToRgb(textColor)) >= 0.72
            : false;
        const lightDirection = getNeumoLightDirectionVector(values?.neumoLightDirection);
        const lightOffset = `${lightDirection.lightX * 0.8}px ${lightDirection.lightY * 0.8}px`;
        const shadowOffset = `${lightDirection.shadowX * 0.9}px ${lightDirection.shadowY * 0.9}px`;
        const lightShadow = textIsLight
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(255, 255, 255, 0.42)';
        const darkShadow = textIsLight
            ? 'rgba(0, 0, 0, 0.14)'
            : 'rgba(0, 0, 0, 0.18)';
        return `${lightOffset} 0 ${lightShadow}, ${shadowOffset} 0 ${darkShadow}`;
    }

    function getNeumoPanelSurfaceShape(values = currentPresetValues) {
        return normalizeNeumoPanelSurfaceShape(values?.neumoPanelSurfaceShape);
    }

    function getExplicitGlassTextColor(values = {}) {
        const keys = ['textColor', 'fontColor', 'foreground', 'color'];
        for (const key of keys) {
            const color = parseCssColorToRgb(values[key]);
            if (color) return String(values[key]).trim();
        }
        return '';
    }

    function updateGlassReadableTextColor(values = currentPresetValues) {
        const root = document.body;
        if (!root) return '';
        const bgColor = window.config?.canvasBgColor || '#e1e1e1';
        const autoTextColor = chooseReadableTextColorForBackground(bgColor, {
            candidates: [
                { color: '#111827', label: 'dark' },
                { color: '#24344d', label: 'softDark' },
                { color: '#ffffff', label: 'light' },
                { color: '#f8fafc', label: 'softLight' }
            ],
            fallback: '#111827'
        });
        const explicitTextColor = getExplicitGlassTextColor(values || {});
        const resolvedTextColor = explicitTextColor || autoTextColor;
        root.style.setProperty('--auto-readable-text-color', autoTextColor);
        root.style.setProperty('--glass-resolved-text-color', resolvedTextColor);
        root.dataset.canvasBgTone = autoTextColor === '#ffffff' ? 'dark' : 'light';
        root.dataset.glassTextColorSource = explicitTextColor ? 'preset' : 'auto';
        getGlassPresetTargets().forEach((el) => {
            el.style.setProperty('--auto-readable-text-color', autoTextColor);
            el.style.setProperty('--glass-resolved-text-color', resolvedTextColor);
        });
        /* v88: 左上miniパネルはプリセット文字色ではなく、右上設定UIと同じく
         * canvas背景明暗から決める自動可読色を正本にする。
         * ここで resolvedTextColor を入れると、Color側の自動反転より後勝ちして
         * 起動時・テーマ切替時に左上だけ反応しないタイミングが出る。 */
        document.querySelectorAll('#ui-variant-panel, #ui-variant-panel *, #ui-preset-panel, #ui-preset-panel *, #ui-variant-compact-panel, #ui-variant-compact-panel *, .ui-variant-compact-panel, .ui-variant-compact-panel *').forEach((el) => {
            /* v97: 右上の詳細設定は白基調パネルなので、背景明暗連動の白文字を入れない。
             * JS inline important がCSS黒固定より後勝ちするため、ここで対象から除外する。 */
            if (el.closest && el.closest('#ui-preset-panel .glass-preset-details, #ui-preset-panel .glass-preset-rows, #ui-preset-panel .glass-preset-actions, #ui-preset-panel .glass-preset-details-toggle')) {
                el.style.setProperty('color', '#111827', 'important');
                el.style.setProperty('-webkit-text-fill-color', '#111827', 'important');
                el.style.setProperty('text-shadow', 'none', 'important');
                return;
            }
            el.style.setProperty('color', autoTextColor, 'important');
            el.style.setProperty('-webkit-text-fill-color', autoTextColor, 'important');
        });
        if (typeof window.UIUXRefreshReadableTextColors === 'function') {
            window.UIUXRefreshReadableTextColors();
        }
        document.querySelectorAll('#case-comparison, #case-comparison *, #code-explain-overlay, #code-explain-overlay *, #glass-panel-code-explain, #glass-panel-code-explain *').forEach((el) => {
            el.style.setProperty('color', resolvedTextColor, 'important');
            el.style.setProperty('-webkit-text-fill-color', resolvedTextColor, 'important');
        });
        return resolvedTextColor;
    }

    function getActiveCanvasBgHex() {
        return window.config?.canvasBgColor || '#e1e1e1';
    }

    function deriveLegacyNeumorphismSurfaceColors(bgHex, values = currentPresetValues) {
        const base = normalizeHexColor(bgHex, INITIAL_NEUMORPHISM_PRESET_VALUES.surfaceColor);
        const bgRgb = parseCssColorToRgb(base);
        const bgLuminance = bgRgb ? getRelativeLuminance(bgRgb) : 0.5;
        const lightingSaturation = Math.min(2, Math.max(0, toFiniteNumber(values?.lightingSaturation, INITIAL_NEUMORPHISM_PRESET_VALUES.lightingSaturation)));
        const lightingBase = adjustHexSaturation(base, lightingSaturation);
        const highlight = mixHexColors(lightingBase, '#ffffff', bgLuminance < 0.5 ? 0.34 : 0.22);
        const shadow = mixHexColors(lightingBase, '#6f7a86', bgLuminance < 0.5 ? 0.30 : 0.18);
        const shadowSoft = mixHexColors(lightingBase, '#97a3af', bgLuminance < 0.5 ? 0.18 : 0.12);
        const accentBase = normalizeHexColor(values.accentColor, INITIAL_NEUMORPHISM_PRESET_VALUES.accentColor);
        const text = chooseReadableTextColorForBackground(base, {
            candidates: [
                { color: '#111827', label: 'dark' },
                { color: '#f8fafc', label: 'light' }
            ],
            fallback: '#111827'
        });
        return {
            base,
            baseSoft: hexToRgba(base, 0.98),
            baseRaised: mixHexColors(base, '#ffffff', 0.06),
            basePressed: mixHexColors(base, '#93a0ac', 0.08),
            highlight: hexToRgba(highlight, Math.min(0.96, 0.30 + Math.abs(0.5 - bgLuminance) * 0.45)),
            highlightSoft: hexToRgba(highlight, Math.min(0.8, 0.18 + Math.abs(0.5 - bgLuminance) * 0.25)),
            shadow: hexToRgba(shadow, Math.min(0.72, 0.18 + Math.abs(bgLuminance - 0.5) * 0.42)),
            shadowSoft: hexToRgba(shadowSoft, Math.min(0.55, 0.12 + Math.abs(bgLuminance - 0.5) * 0.24)),
            text,
            textMuted: text === '#111827' ? 'rgba(17, 24, 39, 0.62)' : 'rgba(248, 250, 252, 0.70)',
            accent: hexToRgba(accentBase, 0.58),
            accentEdge: hexToRgba(accentBase, 0.78)
        };
    }

    function deriveNeumorphismSurfaceColors(bgHex, values = currentPresetValues) {
        const base = normalizeHexColor(bgHex, INITIAL_NEUMORPHISM_PRESET_VALUES.surfaceColor);
        const bgRgb = parseCssColorToRgb(base);
        const bgLuminance = bgRgb ? getRelativeLuminance(bgRgb) : 0.5;
        const emboss = Math.min(1, Math.max(0, toFiniteNumber(values?.embossStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.embossStrength)));
        const highlightStrength = Math.min(1, Math.max(0, toFiniteNumber(values?.highlightStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.highlightStrength)));
        const shadowStrength = Math.min(1, Math.max(0, toFiniteNumber(values?.shadowStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.shadowStrength)));
        const lightingSaturation = Math.min(2, Math.max(0, toFiniteNumber(values?.lightingSaturation, INITIAL_NEUMORPHISM_PRESET_VALUES.lightingSaturation)));
        /* 背景連動ON時だけ、面色は変えずに背景色の彩度を光影の色へ反映する。 */
        const lightingBase = values?.followCanvasBackground ? adjustHexSaturation(base, lightingSaturation) : base;
        /* Neumorphismの各スライダーが見た目に反映される幅を確保する。 */
        const raisedMix = 0.045 + emboss * (bgLuminance < 0.5 ? 0.11 : 0.085);
        const pressedMix = 0.045 + emboss * (bgLuminance < 0.5 ? 0.10 : 0.095);
        const lightMix = 0.10 + highlightStrength * (bgLuminance < 0.35 ? 0.24 : 0.34);
        const shadowMix = 0.10 + shadowStrength * (bgLuminance < 0.35 ? 0.25 : 0.32);
        const highlight = mixHexColors(lightingBase, '#ffffff', lightMix);
        const shadow = mixHexColors(lightingBase, '#000000', shadowMix);
        const accentBase = normalizeHexColor(values?.accentColor, INITIAL_NEUMORPHISM_PRESET_VALUES.accentColor);
        const text = chooseReadableTextColorForBackground(base, {
            candidates: [
                { color: '#111827', label: 'dark' },
                { color: '#f8fafc', label: 'light' }
            ],
            fallback: '#111827'
        });
        return {
            base,
            baseSoft: hexToRgba(base, 0.98),
            baseRaised: mixHexColors(base, '#ffffff', raisedMix),
            basePressed: mixHexColors(base, '#000000', pressedMix),
            trackSurface: mixHexColors(base, '#000000', 0.055 + emboss * 0.085),
            thumbSurface: mixHexColors(base, '#ffffff', 0.08 + emboss * 0.10),
            highlight: hexToRgba(highlight, Math.min(0.94, 0.26 + highlightStrength * (bgLuminance < 0.35 ? 0.43 : 0.58))),
            highlightSoft: hexToRgba(highlight, Math.min(0.72, 0.15 + highlightStrength * (bgLuminance < 0.35 ? 0.28 : 0.40))),
            shadow: hexToRgba(shadow, Math.min(0.84, 0.20 + shadowStrength * (bgLuminance < 0.35 ? 0.38 : 0.52))),
            shadowSoft: hexToRgba(shadow, Math.min(0.62, 0.12 + shadowStrength * (bgLuminance < 0.35 ? 0.26 : 0.38))),
            text,
            textMuted: text === '#111827' ? 'rgba(17, 24, 39, 0.62)' : 'rgba(248, 250, 252, 0.70)',
            accent: hexToRgba(accentBase, 0.58),
            accentEdge: hexToRgba(accentBase, 0.78)
        };
    }

    function normalizeStoredPreset(values = {}) {
        const next = { ...values };
        if (isNeumorphismTheme()) {
            const result = {};
        getActivePresetParamDefs().forEach((def) => {
            const fallback = def.key === 'followCanvasBackground' || def.key === 'materialFollowSurface'
                ? false
                : def.key === 'neumoLightDirection'
                    ? NEUMO_LIGHT_DIRECTION_FALLBACK
                    : def.key === 'neumoPanelSurfaceShape'
                        ? 'flat'
                    : (INITIAL_NEUMORPHISM_PRESET_VALUES[def.key] ?? def.defaultValue);
                result[def.key] = def.type === 'color'
                    ? normalizeHexColor(next[def.key], fallback)
                    : def.type === 'toggle'
                        ? Boolean(Object.prototype.hasOwnProperty.call(next, def.key) ? next[def.key] : fallback)
                        : def.type === 'direction'
                            ? normalizeNeumoLightDirection(Object.prototype.hasOwnProperty.call(next, def.key) ? next[def.key] : fallback)
                            : def.type === 'surfaceShape'
                                ? normalizeNeumoPanelSurfaceShape(Object.prototype.hasOwnProperty.call(next, def.key) ? next[def.key] : fallback)
                            : normalizePresetNumericValue(def, toFiniteNumber(next[def.key], fallback));
            });
            return result;
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'paletteAlpha') && Object.prototype.hasOwnProperty.call(next, 'surfaceAlpha')) {
            next.paletteAlpha = next.surfaceAlpha;
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'surfaceColorAlpha')) {
            next.surfaceColorAlpha = 1;
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'reflectionColor')) {
            next.reflectionColor = '#ffffff';
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'reflectionColorAlpha')) {
            next.reflectionColorAlpha = 1;
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'reflectionColorSaturation')) {
            next.reflectionColorSaturation = 1;
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'shadowColor') && Object.prototype.hasOwnProperty.call(next, 'shadowColorHex')) {
            next.shadowColor = next.shadowColorHex;
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'shadowColor')) {
            next.shadowColor = '#6f4d3b';
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'shadowColorAlpha')) {
            next.shadowColorAlpha = 1;
        }
        if (!Object.prototype.hasOwnProperty.call(next, 'shadowColorSaturation')) {
            next.shadowColorSaturation = 1;
        }
        if (Object.prototype.hasOwnProperty.call(next, 'lightAngle')) {
            next.lightAngle = normalizeLightAngle(next.lightAngle);
        } else {
            next.lightAngle = 0;
        }
        return next;
    }

    function toFiniteNumber(value, fallback) {
        const next = Number(value);
        return Number.isFinite(next) ? next : fallback;
    }

    function hexToRgba(hex, alpha) {
        const normalized = normalizeHexColor(hex);
        const channel = normalized.slice(1);
        const red = parseInt(channel.slice(0, 2), 16);
        const green = parseInt(channel.slice(2, 4), 16);
        const blue = parseInt(channel.slice(4, 6), 16);
        const nextAlpha = Math.min(1, Math.max(0, Number(alpha) || 0));
        return `rgba(${red}, ${green}, ${blue}, ${nextAlpha})`;
    }

    function hexToMutedRgba(hex, alpha, saturation = 1) {
        const normalized = normalizeHexColor(hex);
        const channel = normalized.slice(1);
        const red = parseInt(channel.slice(0, 2), 16);
        const green = parseInt(channel.slice(2, 4), 16);
        const blue = parseInt(channel.slice(4, 6), 16);
        const sat = Math.min(1, Math.max(0, Number(saturation) || 0));
        const gray = Math.round((red + green + blue) / 3);
        const mix = 1 - sat;
        const nextRed = Math.round(red * sat + gray * mix);
        const nextGreen = Math.round(green * sat + gray * mix);
        const nextBlue = Math.round(blue * sat + gray * mix);
        const nextAlpha = Math.min(1, Math.max(0, Number(alpha) || 0));
        return `rgba(${nextRed}, ${nextGreen}, ${nextBlue}, ${nextAlpha})`;
    }

    function mixHexColors(baseHex, targetHex, amount) {
        const mix = Math.min(1, Math.max(0, Number(amount) || 0));
        const base = normalizeHexColor(baseHex, '#ffffff').slice(1);
        const target = normalizeHexColor(targetHex, '#ffffff').slice(1);
        const parse = (hex) => [
            parseInt(hex.slice(0, 2), 16),
            parseInt(hex.slice(2, 4), 16),
            parseInt(hex.slice(4, 6), 16)
        ];
        const a = parse(base);
        const b = parse(target);
        const blended = a.map((channel, index) => Math.round(channel + (b[index] - channel) * mix));
        return `#${blended.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
    }

    function adjustHexSaturation(hex, amount = 1) {
        const normalized = normalizeHexColor(hex, '#ffffff').slice(1);
        const rgb = [
            parseInt(normalized.slice(0, 2), 16),
            parseInt(normalized.slice(2, 4), 16),
            parseInt(normalized.slice(4, 6), 16)
        ];
        const saturation = Math.min(2, Math.max(0, Number(amount) || 0));
        const gray = Math.round(rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
        const adjusted = rgb.map((channel) => Math.min(255, Math.max(0, Math.round(gray + (channel - gray) * saturation))));
        return `#${adjusted.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
    }

    function getPresetValue(def, values) {
        const fallback = Object.prototype.hasOwnProperty.call(def, 'defaultValue') ? def.defaultValue : '';
        const value = values[def.key];
        if (def.type === 'toggle') return Boolean(value);
        if (def.type === 'color') return normalizeHexColor(value, fallback);
        if (def.type === 'direction') return normalizeNeumoLightDirection(value || fallback);
        if (def.type === 'surfaceShape') return normalizeNeumoPanelSurfaceShape(value || fallback);
        return normalizePresetNumericValue(def, toFiniteNumber(value, fallback));
    }

    function normalizeLightAngle(value) {
        const numeric = toFiniteNumber(value, 0);
        if (!Number.isFinite(numeric)) return 0;
        if (numeric >= -90 && numeric <= 90) return numeric;
        const wrapped = ((numeric + 180) % 360) - 180;
        return Math.max(-90, Math.min(90, wrapped));
    }

    function getLightAngleData(value, centerDistance = 42) {
        const tilt = normalizeLightAngle(value);
        const radians = tilt * Math.PI / 180;
        const x = Math.sin(radians);
        const y = -Math.cos(radians);
        const distance = Math.min(70, Math.max(0, toFiniteNumber(centerDistance, 42)));
        const highlightPosX = Math.min(100, Math.max(0, 50 + x * distance));
        const highlightPosY = Math.min(100, Math.max(0, 50 + y * distance));
        return {
            angle: tilt,
            directionAngle: ((315 - tilt) % 360 + 360) % 360,
            highlightX: x,
            highlightY: y,
            highlightPosX,
            highlightPosY,
            shadowPosX: Math.min(100, Math.max(0, 50 - x * distance)),
            shadowPosY: Math.min(100, Math.max(0, 50 - y * distance)),
            shadowX: -x,
            shadowY: -y
        };
    }

    function snapZeroCenteredValue(def, value) {
        const numeric = toFiniteNumber(value, 0);
        if (!Number.isFinite(numeric)) return 0;
        if (!(Number(def?.min) < 0 && Number(def?.max) > 0)) return numeric;
        const step = Math.abs(Number(def?.step) || 0);
        const range = Math.abs(Number(def.max) - Number(def.min));
        const snapWidth = Math.max(step * 2.5, range * 0.02);
        return Math.abs(numeric) <= snapWidth ? 0 : numeric;
    }

    function normalizePresetNumericValue(def, value) {
        return snapZeroCenteredValue(def, value);
    }

    function getCanvasElement() {
        return document.getElementById('defaultCanvas0') || document.querySelector('#canvas-stage canvas');
    }

    function readValuesFromPanel(panel) {
        const values = {};
        if (!panel) return values;
        panel.querySelectorAll('[data-glass-param]').forEach((input) => {
            const key = input.getAttribute('data-glass-param');
	            values[key] = input.type === 'checkbox'
	                ? Boolean(input.checked)
	                : input.type === 'color'
	                    ? normalizeHexColor(input.value)
	                    : input.type === 'hidden'
	                        ? input.value
	                        : Number(input.value);
        });
        return values;
    }

    function syncPresetValues(panel, values) {
        currentPresetValues = { ...values };
        if (panel) {
            panel.querySelectorAll('[data-glass-param]').forEach((input) => {
                const key = input.getAttribute('data-glass-param');
                if (Object.prototype.hasOwnProperty.call(values, key)) {
                    if (input.type === 'checkbox') {
                        input.checked = Boolean(values[key]);
                    } else {
	                        input.value = input.type === 'color' ? normalizeHexColor(values[key]) : String(values[key]);
                    }
                }
            });
        }
        applyActiveThemePresetVars(currentPresetValues);
        return currentPresetValues;
    }

    function ensureRefractionLayer(panel) {
        if (!panel) return null;
        let layer = panel.querySelector('.glass-refraction-layer');
        if (!layer) {
            layer = document.createElement('div');
            layer.className = 'glass-refraction-layer';
            layer.setAttribute('aria-hidden', 'true');
            layer.innerHTML = '<img class="glass-refraction-image" alt="" draggable="false">';
            panel.insertBefore(layer, panel.firstChild);
        }
        return layer;
    }

    function updateRefractionSnapshot(panel) {
        if (!panel) return;
        const canvas = getCanvasElement();
        const layer = ensureRefractionLayer(panel);
        const img = layer?.querySelector('.glass-refraction-image');
        if (!canvas || !img || typeof canvas.toDataURL !== 'function') return;
        const rect = panel.getBoundingClientRect();
        img.src = canvas.toDataURL('image/png');
        layer.style.setProperty('--refraction-panel-left', `${rect.left}px`);
        layer.style.setProperty('--refraction-panel-top', `${rect.top}px`);
        layer.style.setProperty('--refraction-panel-width', `${rect.width}px`);
        layer.style.setProperty('--refraction-panel-height', `${rect.height}px`);
        layer.style.setProperty('--refraction-viewport-width', `${window.innerWidth}px`);
        layer.style.setProperty('--refraction-viewport-height', `${window.innerHeight}px`);
    }

    function scheduleRefractionSnapshot(panel) {
        if (!panel) return;
        clearTimeout(refractionSnapshotTimer);
        refractionSnapshotTimer = setTimeout(() => updateRefractionSnapshot(panel), 80);
    }

    function isGlassMode() {
        return document.body.getAttribute('data-ui-variant') === 'variant-1-glass';
    }

    function getTargetPanelIds() {
        return Array.from(new Set([...FLOATING_PANEL_IDS, ...PANEL_IDS]));
    }

    function isCursorPanel(id) {
        return CURSOR_PANEL_REGISTRY.some((item) => item.id === id);
    }

    function getCursorPanelConfig(id) {
        return CURSOR_PANEL_REGISTRY.find((item) => item.id === id) || null;
    }

    function ensureFloatingLayer() {
        floatingLayer = document.getElementById('glass-floating-layer');
        if (floatingLayer) return floatingLayer;

        floatingLayer = document.createElement('div');
        floatingLayer.id = 'glass-floating-layer';
        floatingLayer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(floatingLayer);
        return floatingLayer;
    }

    function captureHome(el) {
        if (!el || DOCKED_HOME.has(el.id)) return;
        DOCKED_HOME.set(el.id, {
            parent: el.parentNode,
            nextSibling: el.nextSibling
        });
    }

    function dockPanel(el) {
        if (!el || !isGlassMode()) return;
        captureHome(el);
        const layer = ensureFloatingLayer();
        if (el.parentNode !== layer) {
            layer.appendChild(el);
        }
        el.style.position = 'fixed';
    }

    function restorePanel(el) {
        if (!el) return;
        const home = DOCKED_HOME.get(el.id);
        if (home && home.parent) {
            if (home.nextSibling && home.nextSibling.parentNode === home.parent) {
                home.parent.insertBefore(el, home.nextSibling);
            } else {
                home.parent.appendChild(el);
            }
        }
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.right = '';
        el.style.bottom = '';
        el.style.transform = '';
        el.style.willChange = '';
        el.classList.remove('is-dragging');
        el.removeAttribute('data-glass-dragging');
    }

    function applyDefaultPlacement(el, id = el?.id) {
        if (!el) return;
        if (isDockManagedPanelId(id)) {
            const placement = getSafeDockedPanelPlacement(el, id);
            if (placement) {
                applyFixedPlacement(el, placement);
            }
            return;
        }
        const placement = id === SETTINGS_PANEL_ID ? SETTINGS_PANEL_DEFAULT_PLACEMENT : DEFAULT_LAYOUT[id];
        applyFixedPlacement(el, placement);
    }

    function getCaseComparisonTargetPlacement(panel) {
        if (!panel) return { left: RESET_EDGE_MARGIN, top: RESET_EDGE_MARGIN };
        const rect = panel.getBoundingClientRect();
        const height = rect.height || 0;
        return {
            left: RESET_EDGE_MARGIN,
            top: Math.max(RESET_EDGE_MARGIN, window.innerHeight - height - RESET_EDGE_MARGIN)
        };
    }

    function shouldTrackViewportPlacement(id) {
        return id === 'ui-variant-panel' || id === 'case-comparison';
    }

    function applyViewportTrackedPlacement(panel, options = {}) {
        if (!panel) return;
        const animate = options.animate !== false;
        const target = panel.id === 'case-comparison'
            ? getCaseComparisonTargetPlacement(panel)
            : { left: RESET_EDGE_MARGIN, top: RESET_EDGE_MARGIN };
        if (animate) {
            panel.classList.add('viewport-tracking-animate');
            const cleanup = () => {
                panel.classList.remove('viewport-tracking-animate');
                panel.removeEventListener('transitionend', onEnd);
            };
            const onEnd = (event) => {
                if (event.target !== panel) return;
                if (event.propertyName !== 'left' && event.propertyName !== 'top') return;
                cleanup();
            };
            panel.addEventListener('transitionend', onEnd);
            window.setTimeout(cleanup, 1520);
            panel.getBoundingClientRect();
            requestAnimationFrame(() => {
                setPanelPosition(panel, target.left, target.top);
            });
            return;
        }
        setPanelPosition(panel, target.left, target.top);
    }

    function shouldSuppressCaseComparisonPlacementAnimation() {
        return performance.now() < suppressCaseComparisonPlacementAnimationUntil;
    }

    function isCaseComparisonCollapseAnimating() {
        const table = document.getElementById('case-table');
        const body = table?.tBodies?.[0] || table?.querySelector?.('tbody');
        return !!(
            table?.classList.contains('glass-panel-collapse-animating')
            || body?.classList.contains('glass-panel-collapse-animating')
        );
    }

    function clearUiVariantIdleReturnTimer() {
        if (uiVariantIdleReturnTimer !== null) {
            clearTimeout(uiVariantIdleReturnTimer);
            uiVariantIdleReturnTimer = null;
        }
        const panel = document.getElementById('ui-variant-panel');
        if (panel) {
            panel.dataset.uiVariantIdleReturnPending = '0';
        }
    }

    function scheduleUiVariantReturnAfterIdle() {
        const panel = document.getElementById('ui-variant-panel');
        if (!panel) return;
        clearUiVariantIdleReturnTimer();
        const sequence = ++uiVariantIdleReturnSequence;
        panel.dataset.uiVariantIdleReturnPending = '1';
        uiVariantIdleReturnTimer = setTimeout(() => {
            if (sequence !== uiVariantIdleReturnSequence) return;
            if (!panel.isConnected) return;
            panel.dataset.uiVariantIdleReturnPending = '0';
            applyViewportTrackedPlacement(panel);
        }, 30000);
    }

    function bindUiVariantIdleReset(panel) {
        if (!panel || panel.dataset.uiVariantIdleBound === 'true') return;
        panel.dataset.uiVariantIdleBound = 'true';
        const reset = () => {
            if (!isGlassMode()) return;
            scheduleUiVariantReturnAfterIdle();
        };
        ['pointerdown', 'pointermove', 'click', 'input', 'change', 'wheel', 'keydown', 'focusin'].forEach((type) => {
            panel.addEventListener(type, reset, true);
        });
    }

    function getButtonBarRect() {
        const controlBar = document.getElementById('glass-control-bar');
        return controlBar?.getBoundingClientRect?.() || null;
    }

    function getSafeDockedPanelPlacement(panel, id = panel?.id) {
        if (!panel) return null;
        const rect = panel.getBoundingClientRect();
        const width = rect.width || 320;
        const height = rect.height || 24;
        const padding = 12;
        const margin = 12;
        const buttonBarRect = getButtonBarRect();
        const rightEdge = Number.isFinite(buttonBarRect?.right) ? buttonBarRect.right : (window.innerWidth - margin);
        const safeBottom = Number.isFinite(buttonBarRect?.top) ? Math.max(padding + height, buttonBarRect.top - margin) : getBottomControlSafeBottom();
        const fallbackTop = Math.max(padding, safeBottom - height);
        const stackedOffset = id === CURSOR_PANEL_1_ID ? 0 : id === CURSOR_PANEL_2_ID ? 1 : id === CURSOR_PANEL_3_ID ? 2 : 0;
        const stackedTop = fallbackTop - (stackedOffset * (height + 12));
        const top = clampNumber(Number.isFinite(Number(panel.style.top)) ? Number(panel.style.top) : stackedTop, padding, Math.max(padding, window.innerHeight - height - padding));
        const resolvedTop = Number.isFinite(top) ? Math.max(padding, Math.min(top, Math.max(padding, safeBottom - height))) : Math.max(padding, Math.min(stackedTop, Math.max(padding, safeBottom - height)));
        const left = Math.max(padding, Math.min(window.innerWidth - width - padding, rightEdge - width));
        const resolved = {
            left,
            top: resolvedTop
        };
        return resolved;
    }

    function restoreSavedPanelPlacement(el, id = el?.id) {
        if (!el) return false;
        if (shouldTrackViewportPlacement(id)) return false;
        const positions = getPanelPositions();
        const saved = positions[id];
        if (!saved) return false;
        const hasRightBottom = Number.isFinite(saved.right) && Number.isFinite(saved.bottom);
        const hasLeftTop = Number.isFinite(saved.left) && Number.isFinite(saved.top);
        const hasXY = Number.isFinite(saved.x) && Number.isFinite(saved.y);
        if (hasRightBottom) {
            applyFixedPlacement(el, { right: saved.right, bottom: saved.bottom });
            return true;
        }
        if (hasLeftTop && !(saved.left === 0 && saved.top === 0)) {
            setPanelPosition(el, saved.left, saved.top);
            return true;
        }
        if (hasXY) {
            setPanelPosition(el, saved.x, saved.y);
            return true;
        }
        return false;
    }

    function restorePanelToViewport(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const outOfViewport =
            rect.top < 0 ||
            rect.left < 0 ||
            rect.top > window.innerHeight - 40 ||
            rect.left > window.innerWidth - 40;
        if (!outOfViewport) return false;
        el.style.left = '';
        el.style.top = '';
        el.style.right = '24px';
        el.style.bottom = el.id === SETTINGS_PANEL_ID ? '120px' : (DEFAULT_LAYOUT[el.id]?.bottom ? `${DEFAULT_LAYOUT[el.id].bottom}px` : '');
        el.dataset.glassLeft = '0';
        el.dataset.glassTop = '0';
        el.dataset.glassX = '0';
        el.dataset.glassY = '0';
        return true;
    }

    function getPanelPositions() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
        } catch (error) {
            return {};
        }
    }

    function hasSavedPanelPlacement(id) {
        if (!id) return false;
        const positions = getPanelPositions();
        const saved = positions[id];
        if (!saved) return false;
        const hasLeftTop = Number.isFinite(saved.left) && Number.isFinite(saved.top);
        const hasXY = Number.isFinite(saved.x) && Number.isFinite(saved.y);
        const isZeroOrigin = hasLeftTop && saved.left === 0 && saved.top === 0;
        return (hasLeftTop || hasXY) && !isZeroOrigin;
    }

    function getVisibilityState() {
        try {
            return JSON.parse(localStorage.getItem(VISIBILITY_STORAGE_KEY) || '{}') || {};
        } catch (error) {
            return {};
        }
    }

    function saveVisibilityState(nextState) {
        localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(nextState));
    }

    function clearSavedPanelPlacements() {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
            const next = { ...stored };
            getTargetPanelIds().forEach((id) => {
                delete next[id];
            });
            delete next.order;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    function isControlPanel(id) {
        return id === 'glass-control-bar' || id === SETTINGS_PANEL_ID || id === SETTINGS_PANEL_TEST_ID;
    }

    function isDockManagedPanelId(id) {
        return DOCKED_PANEL_DEFS.some((panel) => panel.id === id);
    }

    function getDockedPanelDefById(id) {
        return DOCKED_PANEL_DEFS.find((panel) => panel.id === id) || null;
    }

    function getDockedPanelDefs() {
        return DOCKED_PANEL_DEFS.slice();
    }

    function setPanelDockMode(panel, mode) {
        if (!panel || !isDockManagedPanelId(panel.id)) return;
        panel.dataset.glassDockMode = mode === 'free' ? 'free' : 'docked';
    }

    function getPanelDockMode(panel) {
        if (!panel || !isDockManagedPanelId(panel.id)) return 'free';
        return panel.dataset.glassDockMode === 'free' ? 'free' : 'docked';
    }

    function getDockedPanelHeight(panel) {
        if (!panel) return 24;
        const finalRect = panel.getBoundingClientRect();
        return finalRect.height > 0 ? finalRect.height : 24;
    }

    function markDockedPanelsDefault() {
        DOCKED_PANEL_DEFS.forEach(({ id }) => {
            const panel = document.getElementById(id);
            if (panel) setPanelDockMode(panel, 'docked');
        });
    }

    function getDockedSortablePanels() {
        return DOCKED_PANEL_DEFS
            .map(({ id }) => document.getElementById(id))
            .filter((panel) => panel && !panel.hidden && getPanelDockMode(panel) === 'docked');
    }

    function captureDockedPanelOrder() {
        return getDockedSortablePanels()
            .map((panel) => ({
                panel,
                headerTop: getPanelHeaderTop(panel)
            }))
            .sort((a, b) => {
                if (a.headerTop !== b.headerTop) return a.headerTop - b.headerTop;
                return 0;
            })
            .map(({ panel }) => panel.id);
    }

    function getDockedPanelDebugSnapshot(panels = getDockedSortablePanels()) {
        return panels.map((panel) => {
            const def = getDockedPanelDefById(panel?.id);
            const headerTop = getPanelHeaderTop(panel);
            const rect = panel?.getBoundingClientRect?.();
            return {
                id: panel?.id || '',
                key: def?.key || '',
                label: def?.label || getCursorPanelConfig(panel?.id)?.title || panel?.id || '',
                displayOrder: def?.displayOrder ?? null,
                headerTop,
                top: rect?.top,
                height: rect?.height,
                collapsed: !!panel?.classList?.contains('collapsed'),
                styleTop: panel?.style?.top || '',
                dataGlassTop: panel?.dataset?.glassTop,
                dataGlassY: panel?.dataset?.glassY
            };
        });
    }

    // Debug helper: dock order and layout state for manual browser-side verification.
    function getGlassDockDebugState() {
        const storedOrder = (() => {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')?.order || [];
            } catch (error) {
                return [];
            }
        })();
        const dockedPanels = getDockedSortablePanels();
        const orderHint = storedOrder.length === DOCKED_PANEL_DEFS.length ? storedOrder : loadDockedPanelOrder();
        const layoutPanels = buildDockedPanelLayout(dockedPanels, orderHint);
        const layoutOrder = layoutPanels.map(({ panel }) => panel?.id).filter(Boolean);
        const layoutLabels = layoutOrder.map((id) => getDockedPanelDefById(id)?.label || id);
        const snapshot = getDockedPanelDebugSnapshot(dockedPanels);
        return {
            defs: getDockedPanelDefs(),
            storedOrder,
            storedLabels: normalizeDockedPanelOrder(storedOrder).map((id) => getDockedPanelDefById(id)?.label || id),
            layoutOrder,
            layoutLabels,
            dockedPanelIds: dockedPanels.map((panel) => panel.id),
            panels: snapshot
        };
    }

    // Debug helper: capture before/after reset for manual verification when DEBUG_LAYOUT_LOGS is enabled.
    function runGlassDockResetDebug() {
        const before = getGlassDockDebugState();
        const savedBeforeReset = before.storedOrder.slice();
        resetPanels();
        const after = getGlassDockDebugState();
        const result = {
            before,
            savedBeforeReset,
            after
        };
        if (DEBUG_LAYOUT_LOGS) {
            console.table({
                beforeStoredOrder: JSON.stringify(before.storedOrder),
                beforeLayoutOrder: JSON.stringify(before.layoutOrder),
                beforeDockedPanelIds: JSON.stringify(before.dockedPanelIds),
                afterStoredOrder: JSON.stringify(after.storedOrder),
                afterLayoutOrder: JSON.stringify(after.layoutOrder),
                afterDockedPanelIds: JSON.stringify(after.dockedPanelIds)
            });
            console.table(before.panels);
            console.table(after.panels);
            layoutDebugLog('[glass-dock-order]', 'reset comparison', result);
        }
        return result;
    }

    function debugDockedPanelOrder(stage, extra = {}) {
        layoutDebugLog('[glass-dock-order]', stage, {
            order: getDockedPanelDebugSnapshot(),
            ...extra
        });
    }

    function collectDockedPanelLayoutData(panels, orderHint = []) {
        const fallbackHeight = 24;
        const normalizedOrderHint = normalizeDockedPanelOrder(orderHint);
        const useOrderHint = normalizedOrderHint.length === DOCKED_PANEL_DEFS.length;
        const hintIndexById = new Map(normalizedOrderHint.map((id, index) => [id, index]));
        return panels
            .map((panel, originalIndex) => {
                const def = getDockedPanelDefById(panel?.id);
                const headerTop = getPanelHeaderTop(panel);
                const rect = panel?.getBoundingClientRect?.();
                const height = rect?.height > 0 ? rect.height : fallbackHeight;
                const width = rect?.width > 0 ? rect.width : 320;
                return {
                    id: panel?.id || '',
                    key: def?.key || '',
                    label: def?.label || getCursorPanelConfig(panel?.id)?.title || panel?.id || '',
                    displayOrder: def?.displayOrder ?? null,
                    panel,
                    headerTop,
                    height,
                    width,
                    isOpen: !panel?.classList?.contains('collapsed'),
                    isCollapsed: !!panel?.classList?.contains('collapsed'),
                    originalIndex,
                    hasOrderHintIndex: hintIndexById.has(panel?.id),
                    orderHintIndex: hintIndexById.has(panel?.id) ? hintIndexById.get(panel.id) : Number.POSITIVE_INFINITY
                };
            })
            .sort((a, b) => {
                if (useOrderHint) {
                    if (a.hasOrderHintIndex && b.hasOrderHintIndex) {
                        if (a.orderHintIndex !== b.orderHintIndex) return a.orderHintIndex - b.orderHintIndex;
                        if (a.originalIndex !== b.originalIndex) return a.originalIndex - b.originalIndex;
                        return 0;
                    }
                    if (a.hasOrderHintIndex !== b.hasOrderHintIndex) {
                        return a.hasOrderHintIndex ? -1 : 1;
                    }
                    if (a.headerTop !== b.headerTop) return a.headerTop - b.headerTop;
                } else {
                    const headerDelta = a.headerTop - b.headerTop;
                    if (Number.isFinite(headerDelta) && Math.abs(headerDelta) >= 1) return headerDelta;
                    if (a.orderHintIndex !== b.orderHintIndex) return a.orderHintIndex - b.orderHintIndex;
                }
                if (a.headerTop !== b.headerTop) return a.headerTop - b.headerTop;
                if (a.originalIndex !== b.originalIndex) return a.originalIndex - b.originalIndex;
                return 0;
            });
    }

    function getPanelHeaderTop(panel) {
        if (!panel) return Number.POSITIVE_INFINITY;
        const headerRect = panel.querySelector('.ui-header')?.getBoundingClientRect();
        if (Number.isFinite(headerRect?.top)) return headerRect.top;
        const rect = panel.getBoundingClientRect();
        return Number.isFinite(rect.top) ? rect.top : Number.POSITIVE_INFINITY;
    }

    function measurePanelExpandedHeight(panel) {
        if (!panel) return 24;
        const bounds = panel.getBoundingClientRect();
        if (Number.isFinite(bounds?.height) && bounds.height > 0 && !panel.classList.contains('collapsed')) {
            return bounds.height;
        }

        const probe = panel.cloneNode(true);
        probe.classList.remove('collapsed', 'glass-panel-collapse-animating', 'glass-panel-moving', 'glass-panel-flip-moving');
        probe.hidden = false;
        probe.classList.add('glass-panel-height-probe');
        probe.style.position = 'fixed';
        probe.style.left = '-10000px';
        probe.style.top = '-10000px';
        probe.style.visibility = 'hidden';
        probe.style.pointerEvents = 'none';
        probe.style.display = 'block';
        probe.style.opacity = '1';
        probe.style.maxHeight = 'none';
        probe.style.height = 'auto';
        probe.style.minHeight = '0';
        probe.style.maxWidth = 'none';
        probe.style.width = `${Math.max(1, bounds?.width || panel.offsetWidth || 320)}px`;
        probe.style.overflow = 'visible';

        const probeContent = probe.querySelector('.ui-content');
        if (probeContent) {
            probeContent.hidden = false;
            probeContent.classList.add('glass-panel-content-open');
            probeContent.classList.remove('glass-panel-content-closing');
            probeContent.style.maxHeight = 'none';
            probeContent.style.height = 'auto';
            probeContent.style.overflow = 'visible';
            probeContent.style.opacity = '1';
            probeContent.style.transform = 'none';
            probeContent.style.paddingTop = '';
            probeContent.style.paddingBottom = '';
        }

        document.body.appendChild(probe);
        const measuredRect = probe.getBoundingClientRect();
        const measured = Math.max(measuredRect.height, probe.offsetHeight || 0);
        probe.remove();
        if (Number.isFinite(measured) && measured > 0) return measured;

        const header = panel.querySelector('.ui-header');
        const content = panel.querySelector('.ui-content');
        const headerHeight = header?.getBoundingClientRect?.().height || 24;
        const contentHeight = content?.scrollHeight || content?.getBoundingClientRect?.().height || 0;
        const fallbackMeasured = headerHeight + contentHeight;
        if (Number.isFinite(fallbackMeasured) && fallbackMeasured > 0) return fallbackMeasured;
        const finalRect = panel.getBoundingClientRect();
        return finalRect.height > 0 ? finalRect.height : 24;
    }

    function measurePanelCollapsedHeight(panel) {
        if (!panel) return 24;
        // v49: use the actual collapsed appearance, not header-only arithmetic.
        // Header padding/border differs by Glass/Neumorphism and by panel state; arithmetic
        // made the dock stack too short and caused collapsed headers to overlap after movement.
        const measured = measurePanelClosedAnimationHeight(panel);
        if (Number.isFinite(measured) && measured > 0) return Math.ceil(measured);
        const rect = panel.getBoundingClientRect?.();
        if (Number.isFinite(rect?.height) && rect.height > 0) return Math.ceil(rect.height);
        const headerHeight = panel.querySelector('.ui-header')?.getBoundingClientRect?.().height || 24;
        return Math.ceil(headerHeight);
    }

    function getCursorDockHeightOverridesForCurrentState() {
        const overrides = {};
        getDockedSortablePanels().forEach((panel) => {
            overrides[panel.id] = panel.classList.contains('collapsed')
                ? measurePanelCollapsedHeight(panel)
                : measurePanelExpandedHeight(panel);
        });
        return overrides;
    }

    function getCanonicalDockedPanelOrder() {
        return DOCKED_PANEL_DEFS.map(({ id }) => id);
    }

    function getCursorDockOrderHint() {
        // v57: 1〜4ドック順は操作ごとに推測せず、常に正本順へ固定する。
        return getCanonicalDockedPanelOrder();
    }

    function getCursorDockVisualOrderHint(fallbackOrderHint = getCursorDockOrderHint()) {
        // v57: 画面上の現在Y座標・右下からの距離では順番を作らない。
        // 個別ヘッダー開閉やC開閉中の一時位置を保存すると、1,2,3,4 / 4,3,2,1 が揺れるため。
        const order = getCanonicalDockedPanelOrder();
        layoutDebugLog('[layout-order-debug]', 'getCursorDockVisualOrderHint:canonical', {
            fallbackOrderHint,
            order
        });
        return order;
    }

    function getCursorDockResetOrderHint(fallbackOrderHint = getCursorDockOrderHint()) {
        const order = getCanonicalDockedPanelOrder();
        cursorDockResetOrderHintCache = order.slice();
        cursorDockResetOrderHintDirty = false;
        layoutDebugLog('[layout-order-debug]', 'getCursorDockResetOrderHint:canonical', {
            fallbackOrderHint,
            order
        });
        return order;
    }

    function buildCanonicalCursorDockLayout(orderHint = getCursorDockOrderHint(), heightOverrides = getCursorDockHeightOverridesForCurrentState()) {
        const panels = getDockedSortablePanels();
        return buildDockedPanelLayout(panels, orderHint, heightOverrides);
    }

    function clampNumber(value, min, max) {
        if (!Number.isFinite(value)) return min;
        return Math.min(Math.max(value, min), max);
    }

    function isCursorDockLayoutAlreadyApplied(layout, tolerance = 1) {
        return layout.every(({ panel, left, top }) => {
            if (!panel) return true;
            const rect = panel.getBoundingClientRect();
            return Math.abs(rect.left - left) <= tolerance && Math.abs(rect.top - top) <= tolerance;
        });
    }

    function getCursorDockPanelGaps(layout = null) {
        const panels = getDockedSortablePanels();
        if (panels.length < 2) return [];
        const resolvedLayout = Array.isArray(layout) && layout.length
            ? layout
            : panels
                .map((panel) => ({ panel, rect: panel.getBoundingClientRect() }))
                .sort((a, b) => a.rect.top - b.rect.top)
                .map(({ panel, rect }) => ({ panel, top: rect.top, bottom: rect.bottom, rect }));
        const gaps = [];
        for (let i = 0; i < resolvedLayout.length - 1; i += 1) {
            const current = resolvedLayout[i];
            const next = resolvedLayout[i + 1];
            const currentBottom = Number.isFinite(current?.bottom) ? current.bottom : current?.rect?.bottom;
            const nextTop = Number.isFinite(next?.top) ? next.top : next?.rect?.top;
            gaps.push(nextTop - currentBottom);
        }
        return gaps;
    }

    function ensureCursorDockGapForCurrentState(orderHint = getCursorDockOrderHint(), options = {}) {
        const state = getCursorDockLayoutState(orderHint);
        if (!state?.layout?.length) return false;
        return applyCursorDockLayoutState(state, options);
    }

    function requestCursorDockLayoutRefresh(orderHint = getCursorDockOrderHint(), heightOverrides = null, options = {}) {
        const resolvedOrderHint = Array.isArray(orderHint) && orderHint.length ? orderHint : getCursorDockOrderHint();
        const resolvedHeightOverrides = heightOverrides || getCursorDockHeightOverridesForCurrentState();
        const state = getCursorDockLayoutState(resolvedOrderHint);
        if (!state?.layout?.length) return false;
        if (heightOverrides) {
            state.heightOverrides = resolvedHeightOverrides;
            state.layout = buildCanonicalCursorDockLayout(resolvedOrderHint, resolvedHeightOverrides);
        }
        return applyCursorDockLayoutState(state, options);
    }

    function getCursorDockLayoutState(orderHint = getCursorDockOrderHint()) {
        const panels = getDockedSortablePanels();
        if (!panels.length) return null;
        const resolvedOrderHint = Array.isArray(orderHint) && orderHint.length ? orderHint : getCursorDockOrderHint();
        layoutDebugLog('[layout-order-debug]', 'getCursorDockLayoutState:in', {
            orderHint: resolvedOrderHint
        });
        const heightOverrides = {};
        panels.forEach((panel) => {
            heightOverrides[panel.id] = panel.classList.contains('collapsed')
                ? measurePanelCollapsedHeight(panel)
                : panel.getBoundingClientRect().height;
        });
        const layout = buildCanonicalCursorDockLayout(resolvedOrderHint, heightOverrides);
        if (!layout.length) return null;
        const currentLayout = panels
            .map((panel) => ({ panel, rect: panel.getBoundingClientRect() }))
            .sort((a, b) => a.rect.top - b.rect.top)
            .map(({ panel, rect }) => ({ panel, top: rect.top, bottom: rect.bottom, rect }));
        const gaps = getCursorDockPanelGaps(currentLayout);
        const allCollapsed = panels.every((panel) => panel.classList.contains('collapsed'));
        const withinGapBounds = gaps.every((gap) => Number.isFinite(gap) && gap >= 11 && gap <= 13);
        const withinLayoutBounds = layout.every(({ panel, left, top }) => {
            const rect = panel?.getBoundingClientRect?.();
            return !!rect && Math.abs(rect.left - left) <= 2 && Math.abs(rect.top - top) <= 2;
        });
        const state = {
            orderHint: resolvedOrderHint,
            heightOverrides,
            layout,
            currentLayout,
            gaps,
            allCollapsed,
            withinGapBounds,
            withinLayoutBounds,
            aligned: (allCollapsed && withinGapBounds) || (withinGapBounds && withinLayoutBounds)
        };
        layoutDebugLog('[layout-order-debug]', 'getCursorDockLayoutState:out', {
            orderHint: state.orderHint,
            layoutOrder: state.layout.map(({ panel }) => panel?.id).filter(Boolean)
        });
        cursorDockLayoutState = state;
        return state;
    }

    function applyCursorDockLayoutState(state, options = {}) {
        if (!state) return false;
        if (state.aligned && !options.force) return false;
        layoutDebugLog('[layout-order-debug]', 'applyCursorDockLayoutState', {
            orderHint: state.orderHint,
            layoutOrder: state.layout.map(({ panel }) => panel?.id).filter(Boolean)
        });
        arrangeDockedPanels(state.orderHint, state.heightOverrides, options);
        return true;
    }

    function buildDockedPanelLayout(panels, orderHint, heightOverrides = {}) {
        const layoutPanels = panels.filter((panel) => panel && !hasSavedPanelPlacement(panel.id));
        if (!layoutPanels.length) return [];

        const gap = 12;
        const padding = 12;
        const safeBottom = getBottomControlSafeBottom();
        const numberButtonUnionRect = getNumberButtonUnionRect();
        const controlBar = document.getElementById('glass-control-bar');
        const controlBarRect = controlBar?.getBoundingClientRect();
        const metrics = collectDockedPanelLayoutData(layoutPanels, orderHint).map((metric) => {
            const overrideHeight = heightOverrides?.[metric.id];
            return Number.isFinite(overrideHeight) && overrideHeight > 0
                ? { ...metric, height: overrideHeight }
                : metric;
        });
        if (!metrics.length) return [];
        layoutDebugLog('[glass-dock-order]', 'buildDockedPanelLayout', {
            orderHint: orderHint || [],
            layoutOrder: metrics.map(({ id, label, headerTop, height, isCollapsed }) => ({
                id,
                label,
                headerTop,
                height,
                collapsed: isCollapsed
            }))
        });
        layoutDebugLog('[layout-order-debug]', 'buildDockedPanelLayout', {
            orderHint: orderHint || [],
            metricOrder: metrics.map(({ id }) => id)
        });

        const totalHeight = metrics.reduce((sum, { height }) => sum + height, 0) + gap * Math.max(0, metrics.length - 1);
        const stackTop = Math.max(padding, safeBottom - totalHeight);
        let currentTop = stackTop;

        return metrics.map(({ panel, width, height }, index) => {
            const rightEdge = Number.isFinite(numberButtonUnionRect?.right)
                ? numberButtonUnionRect.right
                : (Number.isFinite(controlBarRect?.right) ? controlBarRect.right : window.innerWidth - padding);
            const left = Math.max(padding, Math.min(window.innerWidth - width - padding, rightEdge - width));
            const layout = {
                panel,
                left,
                top: currentTop
            };
            currentTop += height + (index === metrics.length - 1 ? 0 : gap);
            return layout;
        });
    }

    function buildNumberedDockAnchorLayout(panels, orderHint, heightOverrides = {}) {
        const layoutPanels = panels.filter((panel) => panel && !hasSavedPanelPlacement(panel.id));
        if (!layoutPanels.length) return [];
        const gap = 12;
        const padding = 12;
        const safeBottom = getBottomControlSafeBottom();
        const numberButtonUnionRect = getNumberButtonUnionRect();
        const controlBar = document.getElementById('glass-control-bar');
        const controlBarRect = controlBar?.getBoundingClientRect();
        const metrics = collectDockedPanelLayoutData(layoutPanels, orderHint).map((metric) => {
            const overrideHeight = heightOverrides?.[metric.id];
            return Number.isFinite(overrideHeight) && overrideHeight > 0
                ? { ...metric, height: overrideHeight }
            : metric;
        });
        if (!metrics.length) return [];

        const rightEdge = Number.isFinite(numberButtonUnionRect?.right)
            ? numberButtonUnionRect.right
            : (Number.isFinite(controlBarRect?.right) ? controlBarRect.right : window.innerWidth - padding);
        let currentBottom = safeBottom;
        const layout = new Array(metrics.length);

        for (let index = metrics.length - 1; index >= 0; index -= 1) {
            const { panel, width, height } = metrics[index];
            const left = Math.max(padding, Math.min(window.innerWidth - width - padding, rightEdge - width));
            layout[index] = {
                panel,
                left,
                top: Math.max(padding, currentBottom - height)
            };
            currentBottom = layout[index].top - gap;
        }

        return layout;
    }

    function applyDockedPanelLayout(layout, options = {}) {
        const animate = !!options.animate;
        const beforeRects = options.beforeRects || new Map();
        const sequence = Number.isFinite(options.sequence) ? options.sequence : dockArrangeSequence;
        const startGapMs = Number.isFinite(options.startGapMs) ? options.startGapMs : 220;
        const durationMs = Number.isFinite(options.durationMs) ? options.durationMs : 750;
        const moveDurationMs = Number.isFinite(options.moveDurationMs) ? options.moveDurationMs : durationMs;
        const linearMove = !!options.linearMove;
        const useDistanceBasedDuration = !!options.useDistanceBasedDuration;
        const minDurationMs = Number.isFinite(options.minDurationMs) ? options.minDurationMs : 180;
        const maxDurationMs = Number.isFinite(options.maxDurationMs) ? options.maxDurationMs : 900;
        const fixedDurationMs = Number.isFinite(options.fixedDurationMs) ? options.fixedDurationMs : null;
        const speedPxPerMs = Number.isFinite(options.speedPxPerMs) && options.speedPxPerMs > 0
            ? options.speedPxPerMs
            : 1;
        const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
        layoutDebugLog('[glass-dock-order]', 'applyDockedPanelLayout', {
            layoutOrder: layout.map(({ panel, top }) => ({
                id: panel?.id || '',
                label: getCursorPanelConfig(panel?.id)?.title || panel?.id || '',
                top
            }))
        });
        layoutDebugLog('[layout-order-debug]', 'applyDockedPanelLayout', {
            layoutOrder: layout.map(({ panel }) => panel?.id).filter(Boolean)
        });
        layout.forEach(({ panel, left, top }, index) => {
            if (!panel) return;
            const beforeRect = beforeRects instanceof Map ? beforeRects.get(panel.id) : beforeRects?.[panel.id];
            if (animate && beforeRect) {
                const dx = beforeRect.left - left;
                const dy = beforeRect.top - top;
                const moveDistance = Math.hypot(dx, dy);
                const panelDurationMs = useDistanceBasedDuration
                    ? clampNumber(Math.round(moveDistance / speedPxPerMs), minDurationMs, maxDurationMs)
                    : durationMs;
                const resolvedDurationMs = Number.isFinite(fixedDurationMs) ? fixedDurationMs : panelDurationMs;
                if (Math.hypot(dx, dy) < 2) {
                    if (sequence !== dockArrangeSequence) return;
                    panel.classList.remove('glass-panel-flip-moving');
                    finalizeDockPanelPlacement(panel, left, top);
                    return;
                }
                const startDelayMs = index * startGapMs;
                const runFlip = () => {
                    if (sequence !== dockArrangeSequence) return;
                    if (!panel.isConnected) return;
                    panel.classList.add('glass-panel-flip-moving');
                    if (linearMove) {
                        panel.style.left = `${beforeRect.left}px`;
                        panel.style.top = `${beforeRect.top}px`;
                        panel.style.right = '';
                        panel.style.bottom = '';
                        panel.style.transform = '';
                        panel.style.transitionProperty = 'none';
                        panel.style.willChange = 'left, top';
                        const startTime = performance.now();
                        const animateStep = (now) => {
                            if (sequence !== dockArrangeSequence) return;
                            if (!panel.isConnected) return;
                            const progress = Math.min((now - startTime) / resolvedDurationMs, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const nextLeft = beforeRect.left + ((left - beforeRect.left) * eased);
                            const nextTop = beforeRect.top + ((top - beforeRect.top) * eased);
                            panel.style.left = `${nextLeft}px`;
                            panel.style.top = `${nextTop}px`;
                            if (progress < 1) {
                                requestAnimationFrame(animateStep);
                                return;
                            }
                            panel.style.left = `${left}px`;
                            panel.style.top = `${top}px`;
                            panel.classList.remove('glass-panel-flip-moving');
                            panel.style.transitionProperty = '';
                            panel.style.willChange = '';
                            panel.style.removeProperty('transform');
                        };
                        requestAnimationFrame(animateStep);
                        setTimeout(() => {
                            if (sequence !== dockArrangeSequence) return;
                            if (!panel.isConnected) return;
                            panel.classList.remove('glass-panel-flip-moving');
                            finalizeDockPanelPlacement(panel, left, top);
                        }, resolvedDurationMs + 50);
                        return;
                    } else {
                        panel.style.willChange = 'transform';
                        panel.style.transitionProperty = 'transform';
                        panel.style.transitionDuration = `${resolvedDurationMs}ms`;
                        panel.style.transitionTimingFunction = easing;
                        panel.style.transitionDelay = '0ms';
                        panel.style.right = '';
                        panel.style.bottom = '';
                        panel.style.transform = `translate(${dx}px, ${dy}px)`;
                    }
                    requestAnimationFrame(() => {
                        if (sequence !== dockArrangeSequence) return;
                        if (!panel.isConnected) return;
                        panel.style.transform = '';
                    });
                    setTimeout(() => {
                        if (sequence !== dockArrangeSequence) return;
                        if (!panel.isConnected) return;
                        panel.classList.remove('glass-panel-flip-moving');
                        finalizeDockPanelPlacement(panel, left, top);
                    }, resolvedDurationMs + 50);
                };
                if (useDistanceBasedDuration) {
                    runFlip();
                } else if (startDelayMs > 0) {
                    setTimeout(runFlip, startDelayMs);
                } else {
                    runFlip();
                }
                return;
            }
            if (options.skipMoveTransition === true) {
                finalizeDockPanelPlacement(panel, left, top);
                return;
            }
            panel.classList.add('glass-panel-moving');
            finalizeDockPanelPlacement(panel, left, top);
            panel.style.transitionDuration = `${moveDurationMs}ms`;
        });
        if (options.skipMoveTransition === true) return;
        requestAnimationFrame(() => {
            if (sequence !== dockArrangeSequence) return;
            layout.forEach(({ panel }) => {
                if (!panel) return;
                panel.classList.remove('glass-panel-moving');
                panel.style.transitionDuration = '';
            });
        });
    }

    function arrangeDockedPanels(orderHint, heightOverrides = {}, options = {}) {
        const panels = getDockedSortablePanels();
        if (!panels.length) return;
        const sequence = Number.isFinite(options.sequence) ? options.sequence : dockArrangeSequence;
        const resolvedOrderHint = Array.isArray(orderHint) && orderHint.length
            ? orderHint
            : (() => {
                const savedOrder = loadDockedPanelOrder();
                return savedOrder.length ? savedOrder : captureDockedPanelOrder();
            })();
        const layout = buildDockedPanelLayout(panels, resolvedOrderHint, heightOverrides);
        layoutDebugLog('[layout-order-debug]', 'arrangeDockedPanels', {
            orderHint: resolvedOrderHint,
            layoutOrder: layout.map(({ panel }) => panel?.id).filter(Boolean)
        });
        applyDockedPanelLayout(layout, { ...options, sequence });
    }

    function scheduleArrangeDockedPanels(orderHint, heightOverrides = {}, options = {}) {
        if (dockArrangeRafId !== null) {
            cancelAnimationFrame(dockArrangeRafId);
        }
        dockArrangeSequence += 1;
        const sequence = dockArrangeSequence;
        dockArrangeRafId = requestAnimationFrame(() => {
            if (sequence !== dockArrangeSequence) return;
            dockArrangeRafId = null;
            arrangeDockedPanels(orderHint, heightOverrides, { ...options, sequence });
        });
    }

    function clearDockHideTimer(panel) {
        const timer = panelDockHideTimers.get(panel);
        if (timer) {
            clearTimeout(timer);
            panelDockHideTimers.delete(panel);
        }
    }

    function snapDockTabPlacement(panel, left, top) {
        if (!panel) return { left, top };
        const shouldSnap = (
            (panel.id === CURSOR_PANEL_3_ID || panel.id === CURSOR_PANEL_4_ID || panel.id === CURSOR_PANEL_6_ID || panel.id === CURSOR_PANEL_7_ID)
            && panel.classList.contains('collapsed')
            && getPanelDockMode(panel) !== 'free'
            && !hasSavedPanelPlacement(panel.id)
            && !panel.classList.contains('glass-panel-dragging')
        );
        if (!shouldSnap) return { left, top };
        return {
            left: Math.round(left),
            top: Math.round(top)
        };
    }

    function finalizeDockPanelPlacement(panel, left, top) {
        if (!panel) return;
        const snapped = snapDockTabPlacement(panel, left, top);
        panel.style.left = `${snapped.left}px`;
        panel.style.top = `${snapped.top}px`;
        panel.style.right = '';
        panel.style.bottom = '';
        panel.style.removeProperty('transform');
        panel.style.removeProperty('will-change');
        panel.style.removeProperty('transition-property');
        panel.style.removeProperty('transition-duration');
        panel.style.removeProperty('transition-timing-function');
        panel.style.removeProperty('transition-delay');
    }

    function clampDockPanelAboveButtons(panel, placement, phase = 'finalize') {
        if (!panel || !placement) return placement;
        const rect = panel.getBoundingClientRect();
        const buttonBarRect = getButtonBarRect();
        const safeBottom = Number.isFinite(buttonBarRect?.top)
            ? Math.max(12, buttonBarRect.top - 12)
            : getBottomControlSafeBottom();
        const minTop = 12;
        const maxTop = Math.max(minTop, safeBottom - rect.height);
        const clampedTop = Math.max(minTop, Math.min(placement.top, maxTop));
        const clampedLeft = Math.max(12, Math.min(placement.left, Math.max(12, window.innerWidth - rect.width - 12)));
        if (clampedLeft !== placement.left || clampedTop !== placement.top) {
            layoutDebugLog('[glass-dock-open]', phase, {
                panelId: panel.id,
                top: clampedTop,
                left: clampedLeft,
                width: rect.width,
                height: rect.height,
                buttonBarRect: buttonBarRect ? {
                    left: buttonBarRect.left,
                    top: buttonBarRect.top,
                    right: buttonBarRect.right,
                    bottom: buttonBarRect.bottom,
                    width: buttonBarRect.width,
                    height: buttonBarRect.height
                } : null
            });
        }
        return { left: clampedLeft, top: clampedTop };
    }

    function getPanel5BottomLeftPlacement(panel) {
        return placePanel5BottomLeftSafely(panel);
    }

    function clearPanel5PlacementTimer(panel) {
        const timer = panel5PlacementTimers.get(panel);
        if (timer) {
            clearTimeout(timer);
            panel5PlacementTimers.delete(panel);
        }
    }

    function placePanel5BottomLeftSafely(panel, reason = 'panel5-show') {
        if (!panel) return;
        panel.style.position = 'fixed';
        panel.style.left = '40px';
        panel.style.right = '';
        panel.style.top = '';
        panel.style.bottom = '40px';
        panel.style.transform = '';
        panel.style.willChange = '';
        panel.dataset.glassLeft = '40';
        panel.dataset.glassTop = '';
        panel.dataset.glassX = '40';
        panel.dataset.glassY = '';
        layoutDebugLog('[glass-panel5-place]', reason, {
            panelId: panel.id,
            left: 40,
            bottom: 40,
            viewportHeight: window.innerHeight
        });
    }

    function isInvalidPanel5SavedPlacement(panel, restored) {
        if (!panel) return true;
        const rect = panel.getBoundingClientRect();
        const left = Number.parseFloat(panel.style.left);
        const top = Number.parseFloat(panel.style.top);
        const savedLeft = Number.isFinite(left) ? left : rect.left;
        const savedTop = Number.isFinite(top) ? top : rect.top;
        return !restored
            || !Number.isFinite(savedLeft)
            || !Number.isFinite(savedTop)
            || (savedLeft <= 0 && savedTop <= 0)
            || rect.top < 80
            || savedTop < 40;
    }

    function realignDockedPanelsMeasured(reason = 'individual-toggle', options = {}) {
        const orderHint = getCanonicalDockedPanelOrder();
        const panels = getDockedSortablePanels()
            .slice()
            .sort((a, b) => orderHint.indexOf(a.id) - orderHint.indexOf(b.id));
        if (!panels.length) return;

        const heightOverrides = {};
        panels.forEach((dockPanel) => {
            heightOverrides[dockPanel.id] = dockPanel.classList.contains('collapsed')
                ? measurePanelCollapsedHeight(dockPanel)
                : measurePanelExpandedHeight(dockPanel);
        });
        const sequence = ++dockArrangeSequence;
        arrangeDockedPanels(orderHint, heightOverrides, {
            animate: false,
            force: true,
            sequence,
            skipMoveTransition: options.immediate === true
        });

        const finalizeAlignedPanels = () => {
            if (sequence !== dockArrangeSequence) return;
            panels.forEach((dockPanel) => {
                if (!dockPanel.isConnected) return;
                if (dockPanel.hidden || dockPanel.style.display === 'none') return;
                if (getPanelDockMode(dockPanel) === 'free') return;
                const placement = clampDockPanelAboveButtons(dockPanel, {
                    left: Number.parseFloat(dockPanel.style.left) || dockPanel.getBoundingClientRect().left,
                    top: Number.parseFloat(dockPanel.style.top) || dockPanel.getBoundingClientRect().top
                }, reason);
                finalizeDockPanelPlacement(dockPanel, placement.left, placement.top);
            });
        };

        if (options.immediate === true) {
            finalizeAlignedPanels();
            return;
        }

        requestAnimationFrame(finalizeAlignedPanels);
    }

    function hideIndividualDockedPanel(panel) {
        if (!panel) return;
        individualPanelCollapsedStateBeforeHide.set(panel.id, panel.classList.contains('collapsed'));
        clearDockHideTimer(panel);
        setPanelVisibleAnimated(panel, false);
        if (typeof saveVisibilityFromDom === 'function') {
            saveVisibilityFromDom();
        }
        const hideSequence = ++dockArrangeSequence;
        const timer = setTimeout(() => {
            panelDockHideTimers.delete(panel);
            if (hideSequence !== dockArrangeSequence) return;
            if (isPanelVisible(panel)) return;
            realignDockedPanelsMeasured('individual-hide');
        }, PANEL_VISIBILITY_ANIMATION_MS + 40);
        panelDockHideTimers.set(panel, timer);
    }

    function restoreIndividualCollapsedOrOpenState(panel) {
        const wasCollapsed = individualPanelCollapsedStateBeforeHide.get(panel.id);
        const header = panel.querySelector('.ui-header');
        const content = panel.querySelector('.ui-content');
        if (wasCollapsed === false) {
            panel.hidden = false;
            panel.style.display = '';
            panel.style.visibility = '';
            panel.classList.remove('collapsed', 'glass-forced-hidden', 'is-hidden');
            panel.classList.add('glass-panel-visible');
            panel.removeAttribute('aria-hidden');
            if (header) {
                header.setAttribute('aria-expanded', 'true');
                header.setAttribute('data-ui-state', 'open');
            }
            if (content) {
                content.hidden = false;
                content.classList.add('glass-panel-content-open');
                content.classList.remove('glass-panel-content-closing');
                content.style.removeProperty('max-height');
                content.style.removeProperty('opacity');
                content.style.removeProperty('transform');
                content.style.removeProperty('overflow');
                content.style.removeProperty('will-change');
            }
        } else {
            setPanelHeaderOnlyVisible(panel.id, true);
        }
    }

    function showIndividualDockedPanel(panel) {
        if (!panel) return;
        clearDockHideTimer(panel);
        setPanelDockMode(panel, 'docked');
        const shouldAnimateShow = panel.id === CURSOR_PANEL_6_ID || panel.id === CURSOR_PANEL_7_ID;
        if (shouldAnimateShow) {
            const previousTransitionProperty = panel.style.transitionProperty;
            const previousTransitionDuration = panel.style.transitionDuration;
            const previousTransitionTimingFunction = panel.style.transitionTimingFunction;
            panel.hidden = false;
            panel.style.display = '';
            panel.style.visibility = '';
            panel.style.transitionProperty = 'none';
            restoreIndividualCollapsedOrOpenState(panel);
            panel.classList.add('glass-panel-visibility-animating', 'glass-panel-hiding');
            panel.classList.remove('glass-panel-visible');
            realignDockedPanelsMeasured('individual-show-prelayout', { immediate: true });
            panel.getBoundingClientRect();
            panel.classList.remove('glass-panel-moving');
            panel.style.removeProperty('transition-duration');
            panel.style.transitionProperty = 'opacity, transform';
            panel.style.transitionDuration = '0.7s, 0.7s';
            panel.style.transitionTimingFunction = 'ease, ease';
            panel.getBoundingClientRect();
            setPanelVisibleAnimated(panel, true, true);
            setTimeout(() => {
                if (!panel.isConnected) return;
                if (previousTransitionProperty) {
                    panel.style.transitionProperty = previousTransitionProperty;
                } else {
                    panel.style.removeProperty('transition-property');
                }
                if (previousTransitionDuration) {
                    panel.style.transitionDuration = previousTransitionDuration;
                } else {
                    panel.style.removeProperty('transition-duration');
                }
                if (previousTransitionTimingFunction) {
                    panel.style.transitionTimingFunction = previousTransitionTimingFunction;
                } else {
                    panel.style.removeProperty('transition-timing-function');
                }
            }, PANEL_VISIBILITY_ANIMATION_MS + 40);
            if (typeof saveVisibilityFromDom === 'function') {
                saveVisibilityFromDom();
            }
            individualPanelCollapsedStateBeforeHide.delete(panel.id);
            return;
        }
        setPanelVisibleAnimated(panel, true, shouldAnimateShow);
        restoreIndividualCollapsedOrOpenState(panel);
        if (typeof saveVisibilityFromDom === 'function') {
            saveVisibilityFromDom();
        }
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                realignDockedPanelsMeasured('individual-show');
            });
        });
        individualPanelCollapsedStateBeforeHide.delete(panel.id);
    }

    function requestNumberedDockLandingGuard(reason = 'toggle', delayMs = 72) {
        if (numberedDockLandingGuardTimer !== null) {
            clearTimeout(numberedDockLandingGuardTimer);
            numberedDockLandingGuardTimer = null;
        }
        if (startupCollapsedDockPreserveActive) {
            layoutDebugLog('[glass-dock-open]', 'requestNumberedDockLandingGuard suppressed during startup collapsed preserve', {
                reason,
                delayMs
            });
            return;
        }
        const isHideReason = String(reason).includes('hide');
        if (isHideReason) {
            layoutDebugLog('[glass-dock-open]', 'requestNumberedDockLandingGuard hide suppressed', {
                reason,
                delayMs
            });
            realignDockedPanelsMeasured(reason);
            return;
        }
        if (String(reason) === 'individual-show') {
            layoutDebugLog('[glass-dock-open]', 'requestNumberedDockLandingGuard individual-show suppressed', {
                reason,
                delayMs
            });
            return;
        }
        if (String(reason).includes('nondock') || String(reason).includes('non-dock')) {
            layoutDebugLog('[glass-dock-open]', 'requestNumberedDockLandingGuard non-dock suppressed', {
                reason,
                delayMs
            });
            return;
        }
        numberedDockLandingGuardSequence += 1;
        const sequence = numberedDockLandingGuardSequence;
        numberedDockLandingGuardTimer = setTimeout(() => {
            numberedDockLandingGuardTimer = null;
            if (sequence !== numberedDockLandingGuardSequence) return;
            const panels = getDockedSortablePanels().filter((panel) => {
                if (!panel || panel.hidden || panel.style.display === 'none') return false;
                if (panel.classList.contains('glass-panel-hiding')) return false;
                if (panel.classList.contains('glass-forced-hidden')) return false;
                if (panel.classList.contains('is-hidden')) return false;
                if (panel.getAttribute('aria-hidden') === 'true') return false;
                if (!isDockManagedPanelId(panel.id)) return false;
                return getPanelDockMode(panel) !== 'free';
            });
            if (!panels.length) return;
            const layoutPanels = panels.filter((panel) => !hasSavedPanelPlacement(panel.id));
            if (!layoutPanels.length) return;
            const orderHint = getCursorDockOrderHint();
            const heightOverrides = getCursorDockHeightOverridesForCurrentState();
            const layout = buildNumberedDockAnchorLayout(layoutPanels, orderHint, heightOverrides);
            if (!layout.length) return;
            const nextSequence = ++dockArrangeSequence;
            applyDockedPanelLayout(layout, { animate: false, sequence: nextSequence });

            const finalizeNumberedDockOpenState = (panel) => {
                if (!panel || !isDockManagedPanelId(panel.id)) return;
                if (panel.hidden || panel.style.display === 'none') return;
                if (getPanelDockMode(panel) === 'free') return;
                if (panel.classList.contains('glass-panel-dragging')) return;

                panel.hidden = false;
                panel.style.display = '';
                panel.style.visibility = '';
                panel.classList.remove('collapsed', 'glass-forced-hidden', 'is-hidden');
                panel.classList.remove('glass-panel-collapse-animating');
                panel.classList.add('glass-panel-visible');

                const header = panel.querySelector('.ui-header');
                if (header) {
                    header.setAttribute('aria-expanded', 'true');
                    header.setAttribute('data-ui-state', 'open');
                }

                const content = panel.querySelector('.ui-content');
                if (content) {
                    content.hidden = false;
                    content.classList.remove('glass-panel-content-closing');
                    content.classList.add('glass-panel-content-open');
                    content.style.removeProperty('max-height');
                    content.style.removeProperty('opacity');
                    content.style.removeProperty('transform');
                    content.style.removeProperty('overflow');
                    content.style.removeProperty('will-change');
                }
                const placement = clampDockPanelAboveButtons(panel, {
                    left: Number.parseFloat(panel.style.left) || panel.getBoundingClientRect().left,
                    top: Number.parseFloat(panel.style.top) || panel.getBoundingClientRect().top
                }, `after-open-${reason}`);
                finalizeDockPanelPlacement(panel, placement.left, placement.top);
                clearNumberedDockContentTransform(panel);
            };

            panels.forEach(finalizeNumberedDockOpenState);
        }, Math.max(0, delayMs));
    }

    function clearNumberedDockContentTransform(panel) {
        if (!panel || !isDockManagedPanelId(panel.id)) return;
        if (getPanelDockMode(panel) === 'free') return;
        if (panel.hidden || panel.style.display === 'none') return;
        const content = panel.querySelector('.ui-content');
        if (!content) return;
        content.style.removeProperty('transform');
        content.style.removeProperty('will-change');
        content.style.removeProperty('transition-property');
        content.style.removeProperty('transition-duration');
        content.style.removeProperty('transition-timing-function');
        content.style.removeProperty('transition-delay');
        content.classList.remove('glass-panel-content-closing');
    }

    function placeCaseComparisonFixed(options = {}) {
        const panel = document.getElementById('case-comparison');
        if (!panel) return;
        panel.hidden = false;
        panel.style.display = '';
        panel.style.visibility = '';
        panel.style.right = '';
        panel.style.bottom = '';
        panel.style.transition = 'left 0.35s ease, top 0.35s ease, opacity 0.7s ease, transform 0.7s ease';
        const animate = options.animate === true && !shouldSuppressCaseComparisonPlacementAnimation();
        if (!animate) {
            panel.classList.remove('viewport-tracking-animate');
            panel.style.transitionProperty = 'none';
            applyViewportTrackedPlacement(panel, { animate: false });
            if (options.restoreTransition !== false) {
                requestAnimationFrame(() => {
                    if (!shouldSuppressCaseComparisonPlacementAnimation()) {
                        panel.style.transitionProperty = '';
                    }
                });
            }
            return;
        }
        applyViewportTrackedPlacement(panel, { animate: true });
    }

    function showCaseComparisonFromBottomButton(panel) {
        if (!panel) return;
        const previousTransitionProperty = panel.style.transitionProperty;
        const previousTransitionDuration = panel.style.transitionDuration;
        const previousTransitionTimingFunction = panel.style.transitionTimingFunction;
        panel.hidden = false;
        panel.style.display = '';
        panel.style.visibility = '';
        panel.classList.remove('glass-forced-hidden', 'is-hidden');
        panel.classList.add('glass-panel-visibility-animating', 'glass-panel-hiding');
        panel.classList.remove('glass-panel-visible');
        placeCaseComparisonFixed({ animate: false, reason: 'bottom-button-show-prelayout', restoreTransition: false });
        panel.getBoundingClientRect();
        panel.style.transitionProperty = 'opacity, transform';
        panel.style.transitionDuration = '0.7s, 0.7s';
        panel.style.transitionTimingFunction = 'ease, ease';
        panel.getBoundingClientRect();
        setPanelVisibleAnimated(panel, true, true);
        setTimeout(() => {
            if (!panel.isConnected) return;
            if (previousTransitionProperty) {
                panel.style.transitionProperty = previousTransitionProperty;
            } else {
                panel.style.removeProperty('transition-property');
            }
            if (previousTransitionDuration) {
                panel.style.transitionDuration = previousTransitionDuration;
            } else {
                panel.style.removeProperty('transition-duration');
            }
            if (previousTransitionTimingFunction) {
                panel.style.transitionTimingFunction = previousTransitionTimingFunction;
            } else {
                panel.style.removeProperty('transition-timing-function');
            }
        }, PANEL_VISIBILITY_ANIMATION_MS + 40);
    }

    function measureCaseComparisonCollapsedTableHeight(panel, table) {
        if (!panel || !table) return 0;
        const wasCollapsed = panel.classList.contains('collapsed');
        const wasParametersHidden = table.classList.contains('parameters-hidden');
        panel.classList.add('collapsed');
        table.classList.add('parameters-hidden');
        const height = table.getBoundingClientRect().height || 0;
        panel.classList.toggle('collapsed', wasCollapsed);
        table.classList.toggle('parameters-hidden', wasParametersHidden);
        return height;
    }

    function syncCaseComparisonCollapsedControls(panel, table, collapsed, options = {}) {
        const parameterHeader = table?.querySelector?.('th.parameter-toggle');
        const toggleIcon = parameterHeader?.querySelector?.('.toggle-icon');
        if (options.syncRows !== false) {
            table?.classList.toggle('parameters-hidden', collapsed);
        }
        panel?.classList.toggle('collapsed', collapsed);
        parameterHeader?.setAttribute('aria-expanded', String(!collapsed));
        panel?.setAttribute('aria-expanded', String(!collapsed));
        if (toggleIcon) toggleIcon.textContent = collapsed ? '▶' : '▼';
    }

    function setCaseComparisonOpenAnimated(isOpen, reason = 'c-toggle') {
        const panel = document.getElementById('case-comparison');
        const table = document.getElementById('case-table');
        const tableBody = table?.tBodies?.[0] || table?.querySelector?.('tbody');
        if (!panel || !table || !tableBody) return;

        clearPanelCollapseTimer(table);
        clearPanelCollapseTimer(tableBody);
        suppressCaseComparisonPlacementAnimationUntil = performance.now() + PANEL_VISIBILITY_ANIMATION_MS + 120;
        panel.hidden = false;
        panel.style.display = '';
        panel.style.visibility = '';
        panel.classList.remove('glass-forced-hidden', 'is-hidden');
        placeCaseComparisonFixed({ animate: false, reason: `${reason}-prelayout`, restoreTransition: false });

        table.classList.remove(
            'glass-panel-collapse-animating',
            'glass-panel-content-open',
            'glass-panel-content-closing',
            'case-comparison-expanding',
            'case-comparison-expanding-start',
            'case-comparison-collapsing'
        );
        table.classList.add('glass-panel-collapse-animating');

        if (isOpen) {
            syncCaseComparisonCollapsedControls(panel, table, false, { syncRows: false });
            table.classList.remove('parameters-hidden');
            table.classList.add('case-comparison-expanding-start');
            placeCaseComparisonFixed({ animate: false, reason: `${reason}-open-prelayout`, restoreTransition: false });
            tableBody.getBoundingClientRect();
            requestAnimationFrame(() => {
                if (!table.isConnected) return;
                table.classList.remove('case-comparison-expanding-start');
                table.classList.add('case-comparison-expanding');
                placeCaseComparisonFixed({ animate: false, reason: `${reason}-open-final`, restoreTransition: false });
            });
        } else {
            table.classList.add('case-comparison-collapsing');
            tableBody.getBoundingClientRect();
        }

        table.getBoundingClientRect();

        const timer = setTimeout(() => {
            clearPanelCollapseTimer(table);
            clearPanelCollapseTimer(tableBody);
            if (!isOpen) {
                syncCaseComparisonCollapsedControls(panel, table, true, { syncRows: true });
            }
            table.classList.remove(
                'glass-panel-collapse-animating',
                'case-comparison-expanding',
                'case-comparison-expanding-start',
                'case-comparison-collapsing'
            );
            if (isOpen) {
                table.classList.remove('parameters-hidden');
                syncCaseComparisonCollapsedControls(panel, table, false, { syncRows: false });
            }
            table.getBoundingClientRect();
            if (isOpen) {
                repositionCaseComparisonAfterFinalDom(`${reason}-after`);
            } else if (reason !== 'c-toggle') {
                // C は開閉専用。C 経由で閉じた際に配置リセットを混在させない。
                resetPanelsAfterCaseComparisonClose();
            }
        }, PANEL_VISIBILITY_ANIMATION_MS + 200);
        panelCollapseTimers.set(table, timer);
        panelCollapseTimers.set(tableBody, timer);

        if (typeof window.saveCaseComparisonState === 'function') {
            window.saveCaseComparisonState({ collapsed: !isOpen });
        }
    }

    function restoreCaseComparisonVisiblePlacement(reason = 'restore') {
        const panel = document.getElementById('case-comparison');
        if (!panel) return;
        if (isCaseComparisonCollapseAnimating()) return;
        panel.hidden = false;
        panel.style.display = '';
        panel.style.visibility = '';
        panel.classList.remove('glass-forced-hidden', 'is-hidden');
        panel.removeAttribute('aria-hidden');
        placeCaseComparisonFixed({ animate: false, reason });
        requestAnimationFrame(() => {
            placeCaseComparisonFixed({ animate: false, reason: `${reason}-raf` });
        });
    }

    function scheduleCaseComparisonPlacement() {
        if (caseComparisonArrangeRafId !== null) {
            cancelAnimationFrame(caseComparisonArrangeRafId);
        }
        caseComparisonArrangeRafId = requestAnimationFrame(() => {
            caseComparisonArrangeRafId = null;
            if (isCaseComparisonCollapseAnimating()) return;
            const animate = !caseComparisonInitialPlacementActive && !shouldSuppressCaseComparisonPlacementAnimation();
            placeCaseComparisonFixed({ animate });
            requestAnimationFrame(() => {
                if (isCaseComparisonCollapseAnimating()) return;
                placeCaseComparisonFixed({ animate });
            });
        });
    }

    function repositionCaseComparison() {
        const panel = document.getElementById('case-comparison');
        if (panel?.classList.contains('collapsed')) {
            resetPanelsAfterCaseComparisonClose();
            return;
        }
        scheduleCaseComparisonPlacement();
    }

    function repositionCaseComparisonAfterFinalDom(reason = 'final-dom') {
        requestAnimationFrame(() => {
            if (isCaseComparisonCollapseAnimating()) return;
            const resetPending = caseComparisonResetPlacementPending;
            placeCaseComparisonFixed({ animate: false, reason: resetPending ? `${reason}-reset` : reason });
            caseComparisonResetPlacementPending = false;
        });
    }

    function resetPanelsAfterCaseComparisonClose() {
        requestAnimationFrame(() => {
            if (isCaseComparisonCollapseAnimating()) return;
            caseComparisonResetPlacementPending = false;
            resetPanels();
        });
    }

    function getPresetData() {
        try {
            return JSON.parse(localStorage.getItem(getActivePresetParamsKey()) || '{}') || {};
        } catch (error) {
            return {};
        }
    }

    function getCustomPresetStore() {
        try {
            return JSON.parse(localStorage.getItem(getActivePresetCustomKey()) || '{}') || {};
        } catch (error) {
            return {};
        }
    }

    function saveCustomPresetStore(store) {
        localStorage.setItem(getActivePresetCustomKey(), JSON.stringify(store));
    }

    function makeUniquePresetName(baseName, store) {
        const normalized = normalizePresetName(baseName);
        if (!normalized) return '';
        if (!store || !Object.prototype.hasOwnProperty.call(store, normalized)) return normalized;
        let index = 2;
        let candidate = `${normalized}-import`;
        while (Object.prototype.hasOwnProperty.call(store, candidate)) {
            candidate = `${normalized}-import-${index}`;
            index += 1;
        }
        return candidate;
    }

    function normalizeLiquidGlassStoredValues(values = {}) {
        const cornerDef = liquidGlassPresetParamDefs[0];
        const distortionDef = liquidGlassPresetParamDefs[1];
        return {
            cornerRadius: normalizePresetNumericValue(cornerDef, toFiniteNumber(values.cornerRadius, INITIAL_LIQUID_GLASS_PRESET_VALUES.cornerRadius)),
            lensDistortion: normalizePresetNumericValue(distortionDef, toFiniteNumber(values.lensDistortion, INITIAL_LIQUID_GLASS_PRESET_VALUES.lensDistortion))
        };
    }

    function ensureInitialLiquidGlassPresetExists(store = getCustomPresetStore()) {
        const next = store && typeof store === 'object' ? store : {};
        let changed = false;
        Object.keys(next).forEach((name) => {
            const normalized = normalizeLiquidGlassStoredValues(next[name]);
            if (JSON.stringify(next[name]) !== JSON.stringify(normalized)) {
                next[name] = normalized;
                changed = true;
            }
        });
        if (!Object.prototype.hasOwnProperty.call(next, INITIAL_LIQUID_GLASS_PRESET_NAME)) {
            next[INITIAL_LIQUID_GLASS_PRESET_NAME] = clonePresetValues(INITIAL_LIQUID_GLASS_PRESET_VALUES);
            changed = true;
            const locks = loadPresetEditLocks();
            locks[INITIAL_LIQUID_GLASS_PRESET_KEY] = false;
            savePresetEditLocks(locks);
        }
        if (changed) saveCustomPresetStore(next);
        return next;
    }

    function ensureInitialGlassPresetExists(store = getCustomPresetStore()) {
        const next = store && typeof store === 'object' ? store : {};
        const shouldUseStableInitial = !localStorage.getItem(GLASS_PRESET_SELECTION_KEY);
        if (!Object.prototype.hasOwnProperty.call(next, INITIAL_GLASS_PRESET_NAME) || shouldUseStableInitial) {
            next[INITIAL_GLASS_PRESET_NAME] = clonePresetValues(INITIAL_GLASS_PRESET_VALUES);
            saveCustomPresetStore(next);
            const locks = loadPresetEditLocks();
            if (!Object.prototype.hasOwnProperty.call(locks, INITIAL_GLASS_PRESET_KEY)) {
                locks[INITIAL_GLASS_PRESET_KEY] = true;
                savePresetEditLocks(locks);
            }
        }
        return next;
    }

    function loadPresetEditLocks() {
        try {
            const locks = JSON.parse(localStorage.getItem(getActivePresetLocksKey()) || '{}') || {};
            if (!isNeumorphismTheme() && localStorage.getItem(GLASS_PRESET_EDIT_LOCKS_MIGRATED_V2_KEY) !== '1') {
                delete locks['custom:ガラス-1'];
                delete locks['custom:ガラス-2'];
                localStorage.setItem(GLASS_PRESET_EDIT_LOCKS_MIGRATED_V2_KEY, '1');
                localStorage.setItem(GLASS_PRESET_EDIT_LOCKS_KEY, JSON.stringify(locks));
            }
            return locks;
        } catch (error) {
            return {};
        }
    }

    function savePresetEditLocks(nextLocks) {
        const cleaned = {};
        Object.entries(nextLocks || {}).forEach(([key, value]) => {
            if (typeof key !== 'string' || !key) return;
            cleaned[key] = Boolean(value);
        });
        localStorage.setItem(getActivePresetLocksKey(), JSON.stringify(cleaned));
    }

    function clonePresetValues(values) {
        return JSON.parse(JSON.stringify(values || {}));
    }

    function markPublicDemoDisabledButton(button) {
        if (!button || !PUBLIC_DEMO_DISABLE_EXPORT_IMPORT) return;
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
        button.setAttribute('title', PUBLIC_DEMO_DISABLED_TITLE);
        button.classList.add('public-demo-disabled-action');
        button.style.setProperty('opacity', '0.42', 'important');
        button.style.setProperty('cursor', 'not-allowed', 'important');
        button.style.setProperty('filter', 'grayscale(0.35)', 'important');
    }

    function blockPublicDemoDisabledAction(event) {
        if (!PUBLIC_DEMO_DISABLE_EXPORT_IMPORT) return false;
        event?.preventDefault?.();
        event?.stopPropagation?.();
        return true;
    }

    function shouldDisablePublicDemoElement(element) {
        if (!element || element.tagName !== 'BUTTON') return false;
        if (element.matches('.glass-preset-export, .glass-preset-import, .glass-preset-save, #save-btn, #export-btn, #load-image-btn, #apply-image-btn')) return true;
        const text = String(element.textContent || '').trim();
        return text === 'SVG読込' || text === '読込み' || text === '画像反映';
    }

    function markPublicDemoDisabledActions(root = document) {
        if (!PUBLIC_DEMO_DISABLE_EXPORT_IMPORT) return;
        root.querySelectorAll?.('button').forEach((button) => {
            if (shouldDisablePublicDemoElement(button)) markPublicDemoDisabledButton(button);
        });
        root.querySelectorAll?.('input[type="file"]').forEach((input) => {
            input.disabled = true;
            input.setAttribute('aria-disabled', 'true');
        });
    }

    function installPublicDemoDisabledActions() {
        if (!PUBLIC_DEMO_DISABLE_EXPORT_IMPORT) return;
        markPublicDemoDisabledActions();
        document.addEventListener('click', (event) => {
            const button = event.target.closest?.('button');
            if (!shouldDisablePublicDemoElement(button)) return;
            blockPublicDemoDisabledAction(event);
            event.stopImmediatePropagation();
        }, true);
        if (!publicDemoDisabledObserver) {
            publicDemoDisabledObserver = new MutationObserver((records) => {
                records.forEach((record) => {
                    record.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) markPublicDemoDisabledActions(node);
                    });
                });
            });
            publicDemoDisabledObserver.observe(document.documentElement, { childList: true, subtree: true });
        }
        if (!publicDemoFileInputClickPatched && window.HTMLInputElement?.prototype?.click) {
            publicDemoFileInputClickPatched = true;
            const nativeClick = window.HTMLInputElement.prototype.click;
            window.HTMLInputElement.prototype.click = function(...args) {
                if (this?.type === 'file') return undefined;
                return nativeClick.apply(this, args);
            };
        }
    }

    function getUiSizeTunerSnapshotForPresetExport() {
        try {
            if (window.UISizeTunerAPI && typeof window.UISizeTunerAPI.getSnapshot === 'function') {
                return window.UISizeTunerAPI.getSnapshot();
            }
            const keys = [
                'uiuxAnimationTools.uiSizeTuner.v26',
                'uiuxAnimationTools.uiSizeTuner.v15',
                'uiuxAnimationTools.uiSizeTuner.v14',
                'uiuxAnimationTools.uiSizeTuner',
            ];
            for (const key of keys) {
                const raw = localStorage.getItem(key);
                if (raw) return JSON.parse(raw);
            }
        } catch (error) {
            console.warn('[ui-size-tuner-export]', error);
        }
        return null;
    }

    function applyUiSizeTunerSnapshotFromPresetImport(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') return false;
        try {
            if (window.UISizeTunerAPI && typeof window.UISizeTunerAPI.applySnapshot === 'function') {
                return window.UISizeTunerAPI.applySnapshot(snapshot);
            }
            localStorage.setItem('uiuxAnimationTools.uiSizeTuner.v26', JSON.stringify(snapshot));
            return true;
        } catch (error) {
            console.warn('[ui-size-tuner-import]', error);
            return false;
        }
    }

    function getExportedPresetSnapshot() {
        if (isLiquidGlassTheme()) {
            return {
                schemaVersion: 2,
                exportVersion: GLASS_PRESET_EXPORT_VERSION,
                themeId: 'liquid-glass',
                theme: 'liquid-glass',
                exportedAt: new Date().toISOString(),
                uiLiquidGlassCustomPresets: getCustomPresetStore(),
                uiLiquidGlassPresetEditLocks: loadPresetEditLocks(),
                uiLiquidGlassVariantPreset: getSelectedPresetValue(),
                uiSizeTuner: getUiSizeTunerSnapshotForPresetExport()
            };
        }
        if (isNeumorphismTheme()) {
            return {
                schemaVersion: 2,
                exportVersion: GLASS_PRESET_EXPORT_VERSION,
                themeId: 'neumorphism',
                theme: 'neumorphism',
                exportedAt: new Date().toISOString(),
                uiNeumorphismCustomPresets: getCustomPresetStore(),
                uiNeumorphismPresetEditLocks: loadPresetEditLocks(),
                uiNeumorphismVariantPreset: getSelectedPresetValue(),
                uiSizeTuner: getUiSizeTunerSnapshotForPresetExport()
            };
        }
        return {
            schemaVersion: 2,
            exportVersion: GLASS_PRESET_EXPORT_VERSION,
            themeId: 'glass',
            theme: 'glass',
            exportedAt: new Date().toISOString(),
            uiGlassCustomPresets: getCustomPresetStore(),
            uiGlassPresetEditLocks: loadPresetEditLocks(),
            uiVariantPreset: getSelectedPresetValue(),
            uiSizeTuner: getUiSizeTunerSnapshotForPresetExport()
        };
    }

    function downloadPresetSnapshot(snapshot) {
        const stamp = new Date();
        const pad = (value) => String(value).padStart(2, '0');
        const theme = isNeumorphismTheme() ? 'neumorphism' : (isLiquidGlassTheme() ? 'liquid-glass' : 'glass');
        const fileName = `p5js-${theme}-presets-${stamp.getFullYear()}${pad(stamp.getMonth() + 1)}${pad(stamp.getDate())}-${pad(stamp.getHours())}${pad(stamp.getMinutes())}${pad(stamp.getSeconds())}.json`;
        const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function buildPresetImportPayload(rawData) {
        if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) throw new Error('JSONの形式が不正です');
        const expectedTheme = isNeumorphismTheme() ? 'neumorphism' : (isLiquidGlassTheme() ? 'liquid-glass' : 'glass');
        // Legacy exports did not have themeId; keep them Glass-only for compatibility.
        const sourceTheme = rawData.themeId || rawData.theme || 'glass';
        if (sourceTheme !== expectedTheme) throw new Error('現在のテーマと異なるプリセットは読み込めません');
        const presetsKey = isNeumorphismTheme() ? 'uiNeumorphismCustomPresets' : (isLiquidGlassTheme() ? 'uiLiquidGlassCustomPresets' : 'uiGlassCustomPresets');
        const locksKey = isNeumorphismTheme() ? 'uiNeumorphismPresetEditLocks' : (isLiquidGlassTheme() ? 'uiLiquidGlassPresetEditLocks' : 'uiGlassPresetEditLocks');
        const selectionKey = isNeumorphismTheme() ? 'uiNeumorphismVariantPreset' : (isLiquidGlassTheme() ? 'uiLiquidGlassVariantPreset' : 'uiVariantPreset');
        const sourcePresets = rawData[presetsKey];
        if (!sourcePresets || typeof sourcePresets !== 'object' || Array.isArray(sourcePresets)) throw new Error(`${presetsKey} が含まれていません`);
        const customPresets = {};
        Object.entries(sourcePresets).forEach(([name, values]) => {
            const normalizedName = normalizePresetName(name);
            if (!normalizedName || !values || typeof values !== 'object' || Array.isArray(values)) return;
            customPresets[normalizedName] = normalizeStoredPreset(values);
        });
        const presetEditLocks = {};
        const sourceLocks = rawData[locksKey];
        if (sourceLocks && typeof sourceLocks === 'object' && !Array.isArray(sourceLocks)) {
            Object.entries(sourceLocks).forEach(([presetValue, locked]) => {
                if (!isCustomPresetValue(presetValue)) return;
                if (!Object.prototype.hasOwnProperty.call(customPresets, customPresetNameFromValue(presetValue))) return;
                presetEditLocks[presetValue] = Boolean(locked);
            });
        }
        const selectedPreset = rawData[selectionKey] ? String(rawData[selectionKey]) : '';
        const uiSizeTuner = rawData.uiSizeTuner && typeof rawData.uiSizeTuner === 'object' ? rawData.uiSizeTuner : null;
        return { customPresets, presetEditLocks, selectedPreset, uiSizeTuner };
    }

    function mergeImportedPresetStore(sourcePresets, sourceLocks, currentStore, currentLocks) {
        const nextStore = { ...(currentStore || {}) };
        const nextLocks = { ...(currentLocks || {}) };
        const nameMap = new Map();
        Object.entries(sourcePresets || {}).forEach(([sourceName, values]) => {
            const targetName = makeUniquePresetName(sourceName, nextStore);
            if (!targetName) return;
            nextStore[targetName] = clonePresetValues(values);
            nameMap.set(sourceName, targetName);
        });
        Object.entries(sourceLocks || {}).forEach(([presetValue, locked]) => {
            const mappedName = nameMap.get(customPresetNameFromValue(presetValue));
            if (!mappedName) return;
            nextLocks[customPresetKey(mappedName)] = Boolean(locked);
        });
        return { nextStore, nextLocks, nameMap };
    }

    async function importPresetSnapshotFromFile(file, panel) {
        if (!file) return false;
        const storeKey = getActivePresetCustomKey();
        const locksKey = getActivePresetLocksKey();
        const selectionKey = getActivePresetSelectionKey();
        const backup = { store: localStorage.getItem(storeKey), locks: localStorage.getItem(locksKey), selection: localStorage.getItem(selectionKey) };
        try {
            const payload = buildPresetImportPayload(JSON.parse(await file.text()));
            const { nextStore, nextLocks, nameMap } = mergeImportedPresetStore(payload.customPresets, payload.presetEditLocks, getCustomPresetStore(), loadPresetEditLocks());
            saveCustomPresetStore(nextStore);
            savePresetEditLocks(nextLocks);
            if (payload.selectedPreset && isCustomPresetValue(payload.selectedPreset)) {
                const mapped = nameMap.get(customPresetNameFromValue(payload.selectedPreset));
                if (mapped) setPresetSelection(customPresetKey(mapped));
            }
            ensureProtectedCustomPresets();
            applyPresetUI(panel);
            applyUiSizeTunerSnapshotFromPresetImport(payload.uiSizeTuner);
            return true;
        } catch (error) {
            console.warn('[theme-preset-import]', error);
            if (backup.store == null) localStorage.removeItem(storeKey); else localStorage.setItem(storeKey, backup.store);
            if (backup.locks == null) localStorage.removeItem(locksKey); else localStorage.setItem(locksKey, backup.locks);
            if (backup.selection == null) localStorage.removeItem(selectionKey); else localStorage.setItem(selectionKey, backup.selection);
            applyPresetUI(panel);
            return false;
        }
    }

    function getProtectedPresetFallbackValues(name) {
        const base = getPresetDefaultValues(name === 'ガラス-2' ? '2' : '1');
        return {
            ...base,
            surfaceColor: '#f8fbff',
            surfaceColorAlpha: name === 'ガラス-2' ? 0.28 : 0.18,
            paletteAlpha: 0.18
        };
    }

    function isWhiteLikePresetSurface(value) {
        const surfaceColor = normalizeHexColor(value?.surfaceColor, '#f8fbff');
        const surfaceAlpha = toFiniteNumber(value?.surfaceColorAlpha, 1);
        return surfaceAlpha >= 0.95 && (surfaceColor === '#f8fbff' || surfaceColor === '#ffffff');
    }

    function normalizeProtectedPresetValues(name, values) {
        const fallback = getProtectedPresetFallbackValues(name);
        const next = {
            ...fallback,
            ...(values || {})
        };
        const whiteLike = isWhiteLikePresetSurface(values);
        next.surfaceColor = normalizeHexColor(next.surfaceColor, fallback.surfaceColor);
        next.surfaceColorAlpha = whiteLike || !Number.isFinite(toFiniteNumber(values?.surfaceColorAlpha, NaN))
            ? fallback.surfaceColorAlpha
            : Math.min(1, Math.max(0, toFiniteNumber(next.surfaceColorAlpha, fallback.surfaceColorAlpha)));
        next.paletteAlpha = Math.min(1, Math.max(0, toFiniteNumber(next.paletteAlpha ?? next.surfaceAlpha, fallback.paletteAlpha)));
        return next;
    }

    function ensureInitialNeumorphismPresetExists(store = getCustomPresetStore()) {
        const next = store && typeof store === 'object' ? store : {};
        if (!Object.prototype.hasOwnProperty.call(next, INITIAL_NEUMORPHISM_PRESET_NAME)) {
            next[INITIAL_NEUMORPHISM_PRESET_NAME] = clonePresetValues(INITIAL_NEUMORPHISM_PRESET_VALUES);
            saveCustomPresetStore(next);
            const locks = loadPresetEditLocks();
            locks[INITIAL_NEUMORPHISM_PRESET_KEY] = true;
            savePresetEditLocks(locks);
        } else if (!Object.prototype.hasOwnProperty.call(next[INITIAL_NEUMORPHISM_PRESET_NAME] || {}, 'materialFollowSurface')) {
            next[INITIAL_NEUMORPHISM_PRESET_NAME] = {
                ...(next[INITIAL_NEUMORPHISM_PRESET_NAME] || {}),
                materialFollowSurface: true
            };
            saveCustomPresetStore(next);
        }
        return next;
    }

    function ensureProtectedCustomPresets() {
        if (isNeumorphismTheme()) return ensureInitialNeumorphismPresetExists(getCustomPresetStore());
        return isLiquidGlassTheme()
            ? ensureInitialLiquidGlassPresetExists(getCustomPresetStore())
            : ensureInitialGlassPresetExists(getCustomPresetStore());
    }

    function normalizeRemovedProtectedPresetSelection() {
        if (isNeumorphismTheme() || isLiquidGlassTheme()) return;
        const selected = getSelectedPresetValue();
        if (selected === customPresetKey('ガラス-3')) {
            setPresetSelection('1');
        }
    }

    function isCustomPresetValue(value) {
        return typeof value === 'string' && value.startsWith(CUSTOM_PRESET_PREFIX);
    }

    function customPresetKey(name) {
        return `${CUSTOM_PRESET_PREFIX}${name}`;
    }

    function customPresetNameFromValue(value) {
        return isCustomPresetValue(value) ? value.slice(CUSTOM_PRESET_PREFIX.length) : '';
    }

    function normalizePresetName(name) {
        return String(name || '').trim().replace(/\s+/g, ' ');
    }

    function getSelectedPresetValue() {
        const fallback = isNeumorphismTheme() ? INITIAL_NEUMORPHISM_PRESET_KEY : (isLiquidGlassTheme() ? INITIAL_LIQUID_GLASS_PRESET_KEY : INITIAL_GLASS_PRESET_KEY);
        return localStorage.getItem(getActivePresetSelectionKey()) || fallback;
    }

    function getSafePresetSelection(value = getSelectedPresetValue()) {
        const current = String(value || '');
        if (!isNeumorphismTheme() && !isLiquidGlassTheme() && BUILT_IN_PRESET_NAMES.has(current)) return current;
        if (isCustomPresetValue(current)) {
            const store = getCustomPresetStore();
            const name = customPresetNameFromValue(current);
            if (Object.prototype.hasOwnProperty.call(store, name)) return current;
        }
        const store = getCustomPresetStore();
        const customNames = Object.keys(store).sort();
        if (customNames.length > 0) return customPresetKey(customNames[0]);
        return isNeumorphismTheme() ? INITIAL_NEUMORPHISM_PRESET_KEY : (isLiquidGlassTheme() ? INITIAL_LIQUID_GLASS_PRESET_KEY : INITIAL_GLASS_PRESET_KEY);
    }

    function getPresetLabelForValue(value) {
        if (BUILT_IN_PRESET_NAMES.has(value)) return `${value}`;
        if (isCustomPresetValue(value)) return `${customPresetNameFromValue(value)}`;
        return String(value || '');
    }

    function getCurrentPreset() {
        return getSelectedPresetValue();
    }

    function getPresetValues(preset = getCurrentPreset()) {
        const saved = getPresetData();
        const values = normalizeStoredPreset(saved[preset] || {});
        const defaults = PRESET_DEFAULTS[preset] || {};
        const result = {};
        getActivePresetParamDefs().forEach((def) => {
            const fallback = Object.prototype.hasOwnProperty.call(defaults, def.key) ? defaults[def.key] : def.defaultValue;
            result[def.key] = def.type === 'color'
                ? normalizeHexColor(values[def.key], fallback)
                : def.type === 'toggle'
                    ? Boolean(values[def.key])
                    : def.type === 'direction'
                        ? normalizeNeumoLightDirection(values[def.key] || fallback)
                        : def.type === 'surfaceShape'
                            ? normalizeNeumoPanelSurfaceShape(values[def.key] || fallback)
                        : normalizePresetNumericValue(def, toFiniteNumber(values[def.key], fallback));
        });
        return result;
    }

    function savePresetValues(values) {
        const normalizedValues = {};
        getActivePresetParamDefs().forEach((def) => {
            const fallback = isNeumorphismTheme()
                ? (INITIAL_NEUMORPHISM_PRESET_VALUES[def.key] ?? def.defaultValue)
                : isLiquidGlassTheme()
                    ? (INITIAL_LIQUID_GLASS_PRESET_VALUES[def.key] ?? def.defaultValue)
                    : (Object.prototype.hasOwnProperty.call(PRESET_DEFAULTS['1'], def.key) ? PRESET_DEFAULTS['1'][def.key] : def.defaultValue);
	            normalizedValues[def.key] = def.type === 'color'
	                ? normalizeHexColor(values[def.key], fallback)
	                : def.type === 'toggle'
	                    ? Boolean(values[def.key])
	                    : def.type === 'direction'
	                        ? normalizeNeumoLightDirection(values[def.key] || fallback)
	                        : def.type === 'surfaceShape'
	                            ? normalizeNeumoPanelSurfaceShape(values[def.key] || fallback)
	                        : normalizePresetNumericValue(def, toFiniteNumber(values[def.key], fallback));
        });
        const selected = getSelectedPresetValue();
        if (!isNeumorphismTheme() && !isLiquidGlassTheme() && BUILT_IN_PRESET_NAMES.has(selected)) {
            const store = getCustomPresetStore();
            const baseName = normalizePresetName(prompt('カスタムプリセット名を入力してください', `${selected}-copy`));
            if (!baseName) return false;
            store[baseName] = clonePresetValues(normalizedValues);
            saveCustomPresetStore(store);
            setPresetEditLocked(customPresetKey(baseName), false);
            setPresetSelection(customPresetKey(baseName));
            return true;
        }
        if (isCustomPresetValue(selected)) {
            const store = getCustomPresetStore();
            store[customPresetNameFromValue(selected)] = clonePresetValues(normalizedValues);
            saveCustomPresetStore(store);
            return true;
        }
        const all = getPresetData();
        all[selected] = normalizedValues;
        localStorage.setItem(getActivePresetParamsKey(), JSON.stringify(all));
        return true;
    }

    function saveSelectedNeumorphismImmediateValue(key, nextValue) {
        if (!isNeumorphismTheme()) return false;
        if (key !== 'followCanvasBackground' && key !== 'materialFollowSurface' && key !== 'neumoLightDirection' && key !== 'neumoTextLighting' && key !== 'neumoPanelSurfaceShape') return false;
        const selected = getSelectedPresetValue();
        const normalizedValue = key === 'neumoLightDirection'
            ? normalizeNeumoLightDirection(nextValue)
            : key === 'neumoPanelSurfaceShape'
                ? normalizeNeumoPanelSurfaceShape(nextValue)
            : Boolean(nextValue);
	        /*
         * 背景連動/質感連動/光源方向/文字光影は表示動作に直結するため、操作時に対象値だけを即時保存する。
         * 他の編集中パラメータは保存ボタン操作前に確定してはならないため、この処理では保存しない。
         * 値はNeumorphism preset単位で保持し、Glassには作用させない。
         */
        if (isCustomPresetValue(selected)) {
            const store = getCustomPresetStore();
            const presetName = customPresetNameFromValue(selected);
            if (!presetName || !Object.prototype.hasOwnProperty.call(store, presetName)) return false;
            const nextPreset = { ...(store[presetName] || {}) };
            nextPreset[key] = normalizedValue;
            store[presetName] = nextPreset;
            saveCustomPresetStore(store);
            if (key === 'neumoPanelSurfaceShape') {
                document.body.dataset.neumoPanelShape = normalizedValue;
            }
            return true;
        }
        const all = getPresetData();
        const nextPreset = { ...(all[selected] || {}) };
        nextPreset[key] = normalizedValue;
        all[selected] = nextPreset;
        localStorage.setItem(getActivePresetParamsKey(), JSON.stringify(all));
        if (key === 'neumoPanelSurfaceShape') {
            document.body.dataset.neumoPanelShape = normalizedValue;
        }
        return true;
    }

    function getPresetDefaultValues(preset = getCurrentPreset()) {
        const presetName = isCustomPresetValue(preset) ? customPresetNameFromValue(preset) : preset;
        const defaults = isNeumorphismTheme()
            ? (presetName === INITIAL_NEUMORPHISM_PRESET_NAME ? INITIAL_NEUMORPHISM_PRESET_VALUES : {})
            : isLiquidGlassTheme()
                ? (presetName === INITIAL_LIQUID_GLASS_PRESET_NAME ? INITIAL_LIQUID_GLASS_PRESET_VALUES : {})
                : (PRESET_DEFAULTS[presetName] || {});
        const result = {};
        getActivePresetParamDefs().forEach((def) => {
            const fallback = Object.prototype.hasOwnProperty.call(defaults, def.key) ? defaults[def.key] : def.defaultValue;
	        result[def.key] = def.type === 'color'
	            ? normalizeHexColor(fallback, fallback)
	            : def.type === 'surfaceShape'
	                ? normalizeNeumoPanelSurfaceShape(fallback)
	                : fallback;
        });
        return result;
    }

	    function syncNeumorphismImmediateControls(panel, values = currentPresetValues) {
	        if (!panel || !isNeumorphismTheme()) return;
	        ['followCanvasBackground', 'materialFollowSurface', 'neumoTextLighting'].forEach((key) => {
	            const input = panel.querySelector(`input[data-glass-param="${key}"]`);
            const output = panel.querySelector(`.glass-preset-row [data-glass-param="${key}"]`)?.closest('.glass-preset-row')?.querySelector('.glass-preset-value');
	            if (input) input.checked = Boolean(values?.[key]);
	            if (output) output.textContent = Boolean(values?.[key]) ? 'ON' : 'OFF';
	        });
	        const shapeValue = normalizeNeumoPanelSurfaceShape(values?.neumoPanelSurfaceShape);
	        const shapeInput = panel.querySelector('input[data-glass-param="neumoPanelSurfaceShape"]');
	        const shapeOutput = shapeInput?.closest('.glass-preset-row')?.querySelector('.glass-preset-value');
	        if (shapeInput) {
	            shapeInput.value = shapeValue;
	            shapeInput.setAttribute('value', shapeValue);
	        }
	        if (shapeOutput) shapeOutput.textContent = formatPresetValue({ type: 'surfaceShape' }, shapeValue);
	        panel.querySelectorAll('[data-neumo-panel-surface-shape]').forEach((button) => {
	            const active = button.getAttribute('data-neumo-panel-surface-shape') === shapeValue;
	            button.classList.toggle('is-active', active);
	            button.setAttribute('aria-pressed', String(active));
	        });
	        syncNeumorphismDirectionControl(panel, values);
	    }

	    function syncNeumorphismDirectionControl(panel, values = currentPresetValues) {
	        if (!panel || !isNeumorphismTheme()) return;
	        const value = normalizeNeumoLightDirection(values?.neumoLightDirection);
	        const input = panel.querySelector('input[data-glass-param="neumoLightDirection"]');
	        const output = input?.closest('.glass-preset-row')?.querySelector('.glass-preset-value');
	        if (input) input.value = value;
	        if (output) output.textContent = formatPresetValue({ type: 'direction' }, value);
	        panel.querySelectorAll('[data-neumo-light-direction]').forEach((button) => {
	            const active = button.getAttribute('data-neumo-light-direction') === value;
	            button.classList.toggle('is-active', active);
	            button.setAttribute('aria-pressed', String(active));
	        });
	    }

    function getPresetValuesForSelection(preset = getCurrentPreset()) {
        if (isCustomPresetValue(preset)) {
            const store = getCustomPresetStore();
            const customName = customPresetNameFromValue(preset);
            const stored = store[customName] || getPresetDefaultValues(preset);
            return normalizeStoredPreset(stored);
        }
        const saved = getPresetData();
        const values = normalizeStoredPreset(saved[preset] || {});
        const defaults = PRESET_DEFAULTS[preset] || {};
        const result = {};
        getActivePresetParamDefs().forEach((def) => {
            const fallback = Object.prototype.hasOwnProperty.call(defaults, def.key) ? defaults[def.key] : def.defaultValue;
	            result[def.key] = def.type === 'color'
	                ? normalizeHexColor(values[def.key], fallback)
	                : def.type === 'toggle'
	                    ? Boolean(Object.prototype.hasOwnProperty.call(values, def.key) ? values[def.key] : fallback)
	                    : def.type === 'direction'
	                        ? normalizeNeumoLightDirection(Object.prototype.hasOwnProperty.call(values, def.key) ? values[def.key] : fallback)
	                        : def.type === 'surfaceShape'
	                            ? normalizeNeumoPanelSurfaceShape(Object.prototype.hasOwnProperty.call(values, def.key) ? values[def.key] : fallback)
	                        : toFiniteNumber(values[def.key], fallback);
        });
        return result;
    }

    function getSelectedGlassPreset() {
        const id = getSafePresetSelection(getSelectedPresetValue());
        const name = isCustomPresetValue(id) ? customPresetNameFromValue(id) : getPresetLabelForValue(id);
        return {
            id,
            name,
            values: getPresetValuesForSelection(id)
        };
    }

    function setPresetSelection(value) {
        const safeValue = getSafePresetSelection(value);
        localStorage.setItem(getActivePresetSelectionKey(), safeValue);
        /*
         * body[data-ui-preset] drives existing theme CSS branches. It must always
         * reflect the active theme's own preset when switching themes or presets.
         */
        document.body.setAttribute('data-ui-preset', safeValue);
        syncSelectedGlassPresetToPanels();
    }

    function renderPresetSelectOptions(select) {
        if (!select) return;
        const custom = ensureProtectedCustomPresets();
        const current = getSafePresetSelection(getSelectedPresetValue());
        const options = [];
        Object.keys(custom).sort().forEach((name) => {
            options.push([customPresetKey(name), name]);
        });
        select.innerHTML = options.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
        select.value = current;
    }

    function isBuiltInPreset(value) {
        return !isNeumorphismTheme() && BUILT_IN_PRESET_NAMES.has(value);
    }

    function getSelectedPresetStoreName() {
        const value = getSelectedPresetValue();
        return isCustomPresetValue(value) ? customPresetNameFromValue(value) : '';
    }

    function isProtectedPresetSelection() {
        return false;
    }

    function isPresetEditLocked(presetValue) {
        if (!isCustomPresetValue(presetValue)) return false;
        const name = customPresetNameFromValue(presetValue);
        if (!name) return false;
        return Boolean(loadPresetEditLocks()[presetValue]);
    }

    function setPresetEditLocked(presetValue, locked) {
        if (!isCustomPresetValue(presetValue)) return false;
        const name = customPresetNameFromValue(presetValue);
        if (!name) return false;
        const locks = loadPresetEditLocks();
        locks[presetValue] = Boolean(locked);
        savePresetEditLocks(locks);
        return true;
    }

    function getGlassPresetTargets() {
        return Array.from(document.querySelectorAll(GLASS_PRESET_TARGET_SELECTOR))
            .filter((el) => {
                if (!el) return false;
                return !el.closest('#glass-cursor-panel-3 .color-theme-section, #glass-cursor-panel-3 .color-theme-grid, #glass-cursor-panel-3 .color-theme-actions');
            });
    }

    function applyGlassPresetVarsToElement(el, preset, vars = null) {
        if (!el || !preset) return;
        el.dataset.glassPresetId = preset.id || '';
        el.dataset.glassPresetName = preset.name || '';
        if (!vars) return;
        Object.entries(vars).forEach(([key, value]) => {
            el.style.setProperty(key, String(value));
        });
    }

    function removeInlinePropertiesByPrefix(el, prefix) {
        if (!el || !el.style) return;
        Array.from(el.style)
            .filter((name) => name.startsWith(prefix))
            .forEach((name) => el.style.removeProperty(name));
    }

    function getThemeRuntimeTargets() {
        return Array.from(new Set([
            document.body,
            ...getGlassPresetTargets(),
            document.getElementById('ui-variant-panel'),
            document.getElementById('ui-preset-panel'),
            document.getElementById(CURSOR_PANEL_3_ID),
            document.getElementById(CURSOR_PANEL_4_ID),
            document.getElementById(CURSOR_PANEL_6_ID),
            document.getElementById(CURSOR_PANEL_7_ID),
            document.getElementById('glass-control-bar'),
            document.getElementById('button-container')
        ].filter(Boolean)));
    }

    function clearThemeRuntimeStyles(nextTheme = getActiveThemeId()) {
        /*
         * Glass and Neumorphism are separated in storage and in runtime inline
         * styles/CSS variables. Remove only theme-owned values; never clear the
         * whole style attribute because layout, drag placement, and dimensions live there.
         * Transparent placement layers stay unpainted in both themes.
         * The successful Neumorphism foreground drawing in main.js is intentionally untouched.
         */
        getThemeRuntimeTargets().forEach((el) => {
            removeInlinePropertiesByPrefix(el, nextTheme === 'neumorphism' ? '--glass-' : '--neumo-');
            if (nextTheme === 'neumorphism') {
                el.style.removeProperty('--auto-readable-text-color');
                el.style.removeProperty('color');
                el.style.removeProperty('-webkit-text-fill-color');
            }
        });
        if (nextTheme !== 'neumorphism') {
            delete document.body.dataset.neumorphismPresetName;
        } else {
            delete document.body.dataset.glassPresetId;
            delete document.body.dataset.glassPresetName;
        }
    }

    function syncSelectedGlassPresetToPanels() {
        const preset = getSelectedGlassPreset();
        if (!preset) return null;
        currentPresetValues = { ...preset.values };
        applyActiveThemePresetVars(currentPresetValues);
        if (isNeumorphismTheme()) syncNeumorphismBackgroundSurface();
        return preset;
    }

    function setNeumorphismCssVars(values) {
        const root = document.body;
        const followCanvasBackground = Boolean(values.followCanvasBackground);
        const materialFollowSurface = Boolean(values.materialFollowSurface);
        const manualBase = normalizeHexColor(values.surfaceColor, INITIAL_NEUMORPHISM_PRESET_VALUES.surfaceColor);
        const sourceBase = followCanvasBackground ? getActiveCanvasBgHex() : manualBase;
        /*
         * 質感連動ONは、Neumorphism基準面色から主要光影・凹凸面色を自動生成し、
         * 背景色変化時の色浮きを防ぐ。既存の凹凸/光/影/ぼかしは自動生成結果の
         * 強さ調整として維持し、馴染ONや配色バー等の意図されたアクセントは
         * 自動上書きしない。OFFは既存presetの見た目保護に用い、Glassには作用させない。
         */
        const baseSurface = materialFollowSurface
            ? deriveNeumorphismSurfaceColors(sourceBase, values)
            : followCanvasBackground
                ? deriveLegacyNeumorphismSurfaceColors(getActiveCanvasBgHex(), values)
                : {
                base: manualBase,
                baseSoft: hexToRgba(manualBase, 0.98),
                baseRaised: mixHexColors(manualBase, '#ffffff', 0.07),
                basePressed: mixHexColors(manualBase, '#9ba7b3', 0.07),
                highlight: `rgba(255, 255, 255, ${Math.min(0.96, 0.25 + Math.min(1, Math.max(0, toFiniteNumber(values.highlightStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.highlightStrength))) * 0.7)})`,
                highlightSoft: `rgba(255, 255, 255, ${Math.min(0.8, 0.18 + Math.min(1, Math.max(0, toFiniteNumber(values.highlightStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.highlightStrength))) * 0.5)})`,
                shadow: `rgba(155, 166, 177, ${Math.min(0.72, 0.14 + Math.min(1, Math.max(0, toFiniteNumber(values.shadowStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.shadowStrength))) * 0.65)})`,
                shadowSoft: `rgba(160, 172, 183, ${Math.min(0.55, 0.10 + Math.min(1, Math.max(0, toFiniteNumber(values.shadowStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.shadowStrength))) * 0.5)})`,
                text: chooseReadableTextColorForBackground(manualBase, {
                    candidates: [
                        { color: '#111827', label: 'dark' },
                        { color: '#24344d', label: 'softDark' },
                        { color: '#ffffff', label: 'light' },
                        { color: '#f8fafc', label: 'softLight' }
                    ],
                    fallback: '#111827'
                }),
                accent: hexToRgba(normalizeHexColor(values.accentColor, INITIAL_NEUMORPHISM_PRESET_VALUES.accentColor), 0.58),
                accentEdge: hexToRgba(normalizeHexColor(values.accentColor, INITIAL_NEUMORPHISM_PRESET_VALUES.accentColor), 0.78),
                textMuted: chooseReadableTextColorForBackground(manualBase, {
                    candidates: [
                        { color: '#111827', label: 'dark' },
                        { color: '#f8fafc', label: 'light' }
                    ],
                    fallback: '#111827'
                }) === '#111827'
                    ? 'rgba(17, 24, 39, 0.62)'
                    : 'rgba(248, 250, 252, 0.70)'
            };
	        const emboss = Math.min(1, Math.max(0, toFiniteNumber(values.embossStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.embossStrength)));
	        const highlight = Math.min(1, Math.max(0, toFiniteNumber(values.highlightStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.highlightStrength)));
	        const shadow = Math.min(1, Math.max(0, toFiniteNumber(values.shadowStrength, INITIAL_NEUMORPHISM_PRESET_VALUES.shadowStrength)));
	        const blur = Math.min(40, Math.max(4, toFiniteNumber(values.blurRadius, INITIAL_NEUMORPHISM_PRESET_VALUES.blurRadius)));
	        const depth = Math.max(2, Math.round(3 + emboss * 12));
	        /*
	         * 光源方向はNeumorphism専用の照明方向であり、GlassのlightAngle保存値とは共有しない。
	         * 光色/影色の生成は質感連動が担当し、この設定は配置方向のみを担当する。
	         * 外影と凹凸内部陰影は同じ方向ベクトルから生成し、照明の食い違いを防ぐ。
	         * 既存presetで値が欠落する場合は従来の固定方向(top-left)を維持する。
	         */
	        const lightDirection = getNeumoLightDirectionVector(values.neumoLightDirection);
	        root.style.setProperty('--neumo-base', baseSurface.base);
        root.style.setProperty('--neumo-base-soft', baseSurface.baseSoft);
        root.style.setProperty('--neumo-base-raised', baseSurface.baseRaised);
        root.style.setProperty('--neumo-base-pressed', baseSurface.basePressed);
        root.style.setProperty('--neumo-track-surface', baseSurface.trackSurface || mixHexColors(baseSurface.base, '#9ba7b3', 0.07));
        root.style.setProperty('--neumo-thumb-surface', baseSurface.thumbSurface || baseSurface.baseRaised);
        root.style.setProperty('--neumo-panel-radius', `${Math.max(0, Math.min(42, toFiniteNumber(values.panelCornerRadius, INITIAL_NEUMORPHISM_PRESET_VALUES.panelCornerRadius)))}px`);
        root.style.setProperty('--neumo-ink-coverage', String(Math.max(0, Math.min(1, toFiniteNumber(values.inkCoverage, INITIAL_NEUMORPHISM_PRESET_VALUES.inkCoverage)))));
        root.style.setProperty('--neumo-ink-fade-seconds', String(Math.max(0.1, Math.min(5, toFiniteNumber(values.inkFadeSeconds, INITIAL_NEUMORPHISM_PRESET_VALUES.inkFadeSeconds)))));
        root.style.setProperty('--neumo-ink-spread-seconds', String(Math.max(0, Math.min(3, toFiniteNumber(values.inkSpreadSeconds, INITIAL_NEUMORPHISM_PRESET_VALUES.inkSpreadSeconds)))));
	        root.style.setProperty('--neumo-depth', `${depth}px`);
	        root.style.setProperty('--neumo-blur', `${blur}px`);
	        root.style.setProperty('--neumo-control-depth', `${Math.max(2, Math.round(depth * 0.62))}px`);
	        root.style.setProperty('--neumo-control-blur', `${Math.max(5, Math.round(blur * 0.58))}px`);
	        root.style.setProperty('--neumo-light-x', lightDirection.lightX);
	        root.style.setProperty('--neumo-light-y', lightDirection.lightY);
	        root.style.setProperty('--neumo-shadow-x', lightDirection.shadowX);
	        root.style.setProperty('--neumo-shadow-y', lightDirection.shadowY);
	        root.style.setProperty('--neumo-control-light-x', lightDirection.lightX);
	        root.style.setProperty('--neumo-control-light-y', lightDirection.lightY);
	        root.style.setProperty('--neumo-control-shadow-x', lightDirection.shadowX);
	        root.style.setProperty('--neumo-control-shadow-y', lightDirection.shadowY);
        root.style.setProperty('--neumo-highlight', baseSurface.highlight);
        root.style.setProperty('--neumo-highlight-soft', baseSurface.highlightSoft);
        root.style.setProperty('--neumo-shadow', baseSurface.shadow);
        root.style.setProperty('--neumo-shadow-soft', baseSurface.shadowSoft);
        root.style.setProperty('--neumo-accent', baseSurface.accent);
        root.style.setProperty('--neumo-accent-edge', baseSurface.accentEdge);
        root.style.setProperty('--neumo-text', baseSurface.text);
        root.style.setProperty('--neumo-text-muted', baseSurface.textMuted || (baseSurface.text === '#111827' ? 'rgba(17, 24, 39, 0.62)' : 'rgba(248, 250, 252, 0.70)'));
        root.style.setProperty('--neumo-text-light-shadow', 'rgba(255, 255, 255, 0.08)');
        root.style.setProperty('--neumo-text-dark-shadow', 'rgba(0, 0, 0, 0.16)');
        root.style.setProperty('--neumo-text-shadow-value', getNeumoTextShadowValue(values));
        root.dataset.neumoPanelShape = getNeumoPanelSurfaceShape(values.neumoPanelSurfaceShape);
        /*
         * 文字光影は主要な大きい文字だけを面と照明へ馴染ませる補助表現である。
         * 文字色自動反転が可読性の正本であり、文字光影は弱い補助に限定する。
         * 小さい項目名、記号、checkbox、鍵、小型ボタンには適用しない。
         * 光源方向の既存ベクトルを再利用し、面陰影と文字陰影の方向を一致させる。
         * Glassには作用させない。
         */
        /* v88: Neumorphism適用時も左上miniパネルは面色由来ではなく
         * canvas背景由来の自動可読色を使う。baseSurface.text の後勝ちが
         * 左上だけ白黒反転しない主因だった。 */
        const miniReadableTextColor = getReadableTextColorForBackground(window.config?.canvasBgColor || '#e1e1e1');
        document.querySelectorAll('#ui-variant-panel, #ui-variant-panel *, #ui-preset-panel, #ui-preset-panel *, #ui-variant-compact-panel, #ui-variant-compact-panel *, .ui-variant-compact-panel, .ui-variant-compact-panel *').forEach((el) => {
            /* v97: Neumorphism側でも右上詳細設定は黒固定。
             * 白基調パネルに背景連動文字色を入れない。 */
            if (el.closest && el.closest('#ui-preset-panel .glass-preset-details, #ui-preset-panel .glass-preset-rows, #ui-preset-panel .glass-preset-actions, #ui-preset-panel .glass-preset-details-toggle')) {
                el.style.setProperty('color', '#111827', 'important');
                el.style.setProperty('-webkit-text-fill-color', '#111827', 'important');
                el.style.setProperty('text-shadow', 'none', 'important');
                return;
            }
            el.style.setProperty('color', miniReadableTextColor, 'important');
            el.style.setProperty('-webkit-text-fill-color', miniReadableTextColor, 'important');
        });
        if (typeof window.UIUXRefreshReadableTextColors === 'function') {
            window.UIUXRefreshReadableTextColors();
        }
        root.dataset.neumorphismPresetName = getSelectedPresetStoreName() || INITIAL_NEUMORPHISM_PRESET_NAME;
    }

    function syncNeumorphismBackgroundSurface() {
        /*
         * Neumorphismの背景連動は、case個別ではなくcanvas背景の最終反映経路から同期する。
         * `背景連動 ON` 時は基準面色をcanvas背景色と完全一致させ、凹凸は背景由来のhighlight/shadowで作る。
         * 文字色は面色とのコントラストで自動反転し、保存済みの手動面色は破棄せずOFF時に復帰させる。
         * Glassテーマにはこの同期を作用させない。
         */
        if (!isNeumorphismTheme()) return;
        if (!currentPresetValues) return;
        setNeumorphismCssVars(currentPresetValues);
        const faceColor = normalizeHexColor(getActiveCanvasBgHex(), INITIAL_NEUMORPHISM_PRESET_VALUES.surfaceColor);
        const surfaceInput = document.getElementById('glass-param-surfaceColor');
        const surfaceValue = document.querySelector('#ui-preset-panel .glass-preset-row-color .glass-preset-value');
        if (surfaceInput && surfaceInput.type === 'color') surfaceInput.value = faceColor;
        if (surfaceValue) surfaceValue.textContent = faceColor;
    }

    function applyActiveThemePresetVars(values) {
        if (isNeumorphismTheme()) {
            setNeumorphismCssVars(values);
            return;
        }
        if (isLiquidGlassTheme()) {
            setLiquidGlassCssVars(values);
            return;
        }
        setGlassCssVars(values);
    }

    function setLiquidGlassCssVars(values) {
        const root = document.body;
        const cornerRadius = Math.max(0, Math.min(15, toFiniteNumber(values.cornerRadius, INITIAL_LIQUID_GLASS_PRESET_VALUES.cornerRadius)));
        root.style.setProperty('--glass-corner-radius', String(cornerRadius));
        root.style.removeProperty('--liquid-lens-blur');
        root.style.removeProperty('--liquid-lens-tint-alpha');
        root.style.removeProperty('--liquid-lens-shine');
    }

    function setGlassCssVars(values) {
        const preset = getSelectedGlassPreset();
        const root = document.body;
        root.dataset.glassPresetId = preset.id || '';
        root.dataset.glassPresetName = preset.name || '';
        const surfaceColor = normalizeHexColor(values.surfaceColor, PRESET_DEFAULTS['1'].surfaceColor);
        const surfaceColorAlpha = Math.min(1, Math.max(0, toFiniteNumber(values.surfaceColorAlpha, 1)));
        const paletteAlpha = Math.min(1, Math.max(0, toFiniteNumber(values.paletteAlpha ?? values.surfaceAlpha, PRESET_DEFAULTS['1'].paletteAlpha)));
        const surfaceRgba = hexToRgba(surfaceColor, surfaceColorAlpha);
        const paletteVisible = paletteAlpha > 0.001;
        const reflectionColor = normalizeHexColor(values.reflectionColor, '#ffffff');
        const shadowColor = normalizeHexColor(values.shadowColor, '#6f4d3b');
        const edgeColor = normalizeHexColor(values.edgeColor, '#ffffff');
        const dropShadowColor = normalizeHexColor(values.dropShadowColor, '#1d2636');
        const reflectionColorAlpha = Math.min(1, Math.max(0, toFiniteNumber(values.reflectionColorAlpha, 1)));
        const reflectionColorSaturation = Math.min(1, Math.max(0, toFiniteNumber(values.reflectionColorSaturation, 1)));
        const shadowColorAlpha = Math.min(1, Math.max(0, toFiniteNumber(values.shadowColorAlpha, 1)));
        const shadowColorSaturation = Math.min(1, Math.max(0, toFiniteNumber(values.shadowColorSaturation, 1)));
        const edgeColorAlpha = Math.min(1, Math.max(0, toFiniteNumber(values.edgeColorAlpha, 1)));
        const dropShadowColorAlpha = Math.min(1, Math.max(0, toFiniteNumber(values.dropShadowColorAlpha, 1)));
        const reflectionRgb = reflectionColor.slice(1).match(/.{2}/g).map((part) => parseInt(part, 16)).join(', ');
        const shadowRgb = shadowColor.slice(1).match(/.{2}/g).map((part) => parseInt(part, 16)).join(', ');
        const lightAngleData = getLightAngleData(values.lightAngle, values.faceHighlightDistance);
        const lightAngle = lightAngleData.angle;
        const lightDirectionAngle = lightAngleData.directionAngle;
        const highlightX = lightAngleData.highlightX;
        const highlightY = lightAngleData.highlightY;
        const highlightPosX = lightAngleData.highlightPosX;
        const highlightPosY = lightAngleData.highlightPosY;
        const shadowPosX = lightAngleData.shadowPosX;
        const shadowPosY = lightAngleData.shadowPosY;
        const shadowDirectionX = lightAngleData.shadowX;
        const shadowDirectionY = lightAngleData.shadowY;
        const shadowAngle = (lightDirectionAngle + 180) % 360;
        const shadowOpacityValue = Math.min(1, Math.max(0, Number(values.shadowOpacity) || 0));
        const shadowSpreadValue = Math.max(0, Number(values.shadowSpread) || 0);
        const shadowColorInfluenceValue = Math.min(1, Math.max(0, Number(values.shadowColorInfluence) || 0));
        const explicitDropShadowOpacity = Math.min(1, Math.max(0, Number(values.dropShadowOpacity) || 0));
        const explicitDropShadowSpread = Math.max(0, Number(values.dropShadowSpread) || 0);
        const dropShadowSharpness = Math.min(1, Math.max(0, Number(values.dropShadowSharpness) || 0));
        const dropShadowOpacity = explicitDropShadowOpacity;
        const dropShadowBlur = Math.max(0, Math.round(explicitDropShadowSpread * (0.85 - dropShadowSharpness * 0.55)));
        const dropShadowDistance = Math.max(0, Math.round(4 + explicitDropShadowSpread * 0.28));
        const dropShadowSharpBlur = Math.max(0, Math.round(dropShadowBlur * (0.18 + (1 - dropShadowSharpness) * 0.14)));
        const dropShadowSoftBlur = Math.max(dropShadowBlur, Math.round(dropShadowBlur * 1.35 + explicitDropShadowSpread * 0.18));
        const dropShadowOffsetX = shadowDirectionX * dropShadowDistance;
        const dropShadowOffsetY = shadowDirectionY * dropShadowDistance;
        const map = {
            '--glass-light-angle': `${lightDirectionAngle}deg`,
            '--glass-blur-amount': values.blurAmount,
            '--glass-refraction-strength': values.refraction,
            '--glass-chromatic-shift': values.chromAberration,
            '--glass-edge-intensity': values.edgeHighlight,
            '--glass-specular': values.specular,
            '--glass-fresnel': values.fresnel,
            '--glass-twist': values.twist,
            '--glass-corner-radius': values.cornerRadius,
            '--glass-z-radius': values.zRadius,
            '--glass-opacity': values.opacity,
            '--glass-color-influence': values.colorInfluence,
            '--glass-saturation': values.saturation,
            '--glass-brightness': values.brightness,
            '--glass-inner-warp': values.innerWarp,
            '--glass-shadow-opacity': values.shadowOpacity,
            '--glass-shadow-spread': values.shadowSpread,
            '--glass-shadow-color-influence': values.shadowColorInfluence,
            '--glass-bevel-mode': values.bevelMode,
            '--glass-surface-color': surfaceColor,
            '--glass-surface-color-alpha': surfaceColorAlpha,
            '--glass-palette-alpha': paletteAlpha,
            '--glass-palette-filter-strength': paletteVisible ? 1 : 0,
            '--glass-palette-shadow-alpha': paletteVisible ? paletteAlpha : 0,
            '--glass-palette-border-alpha': paletteVisible ? paletteAlpha : 0,
            '--glass-surface-rgba': surfaceRgba,
            '--glass-reflection-color-rgba': hexToMutedRgba(reflectionColor, reflectionColorAlpha, reflectionColorSaturation),
            '--glass-shadow-color-rgba': hexToMutedRgba(shadowColor, shadowColorAlpha, shadowColorSaturation),
            '--glass-edge-color-rgba': hexToRgba(edgeColor, edgeColorAlpha),
            '--glass-edge-width': values.edgeWidth,
            '--glass-edge-blend': values.edgeBlend,
            '--glass-drop-shadow-color-rgba': hexToRgba(dropShadowColor, dropShadowColorAlpha * dropShadowOpacity),
            '--glass-drop-shadow-opacity': dropShadowOpacity,
            '--glass-drop-shadow-blur': dropShadowBlur,
            '--glass-drop-shadow-soft-blur': dropShadowSoftBlur,
            '--glass-drop-shadow-sharp-blur': dropShadowSharpBlur,
            '--glass-drop-shadow-distance': dropShadowDistance,
            '--glass-drop-shadow-offset-x': dropShadowOffsetX,
            '--glass-drop-shadow-offset-y': dropShadowOffsetY,
            '--glass-shadow-distance': Math.max(6, Math.round(8 + shadowSpreadValue * 0.18)),
            '--glass-reflection-color-alpha': reflectionColorAlpha,
            '--glass-shadow-color-alpha': shadowColorAlpha,
            '--glass-highlight-x': highlightX,
            '--glass-highlight-y': highlightY,
            '--glass-shadow-x': shadowDirectionX,
            '--glass-shadow-y': shadowDirectionY,
            '--glass-highlight-pos-x': `${highlightPosX}%`,
            '--glass-highlight-pos-y': `${highlightPosY}%`,
            '--glass-face-highlight-distance': values.faceHighlightDistance,
            '--glass-reflection-size': values.reflectionSize,
            '--glass-shadow-pos-x': `${shadowPosX}%`,
            '--glass-shadow-pos-y': `${shadowPosY}%`,
            '--glass-shadow-size': values.shadowSize,
            '--glass-refraction-offset-x': ((values.refraction || 0) - 0.5) * 6 * highlightX,
            '--glass-refraction-offset-y': (values.refraction || 0) * 2.5 * highlightY,
            '--glass-refraction-scale': 1 + (values.refraction || 0) * 0.08,
            '--glass-resolved-text-color': updateGlassReadableTextColor(values)
        };
        Object.entries(map).forEach(([key, value]) => root.style.setProperty(key, String(value)));
        getGlassPresetTargets().forEach((el) => applyGlassPresetVarsToElement(el, preset, map));
        const variantPanel = document.getElementById('ui-variant-panel');
        if (variantPanel) {
            const zRadius = Number(values.zRadius) || 0;
            const shadowSpread = shadowSpreadValue;
            const shadowOpacity = shadowOpacityValue;
            const fresnel = Number(values.fresnel) || 0;
            const edgeIntensity = Number(values.edgeHighlight) || 0;
            const edgeSoftness = Number(values.edgeSoftness) || 0;
            const colorInfluence = Math.min(1, Math.max(0, Number(values.colorInfluence) || 0));
            const shadowColorInfluence = shadowColorInfluenceValue;
            const innerWarp = Math.min(1, Math.max(0, Number(values.innerWarp) || 0));
            const opacity = Math.min(1, Math.max(0, Number(values.opacity) || 0));
            const saturation = Number(values.saturation) || 0;
            const brightness = Number(values.brightness) || 0;
            const blurAmount = Number(values.blurAmount) || 0;
            const paletteStrength = paletteVisible ? paletteAlpha : 0;
            const bgBlend = Math.min(0.28, paletteStrength * (0.02 + colorInfluence * 0.18));
            const beforeOpacity = paletteStrength;
            const afterOpacity = paletteStrength;
            const reflectionIntensity = Math.min(1, Math.max(0, (0.15 + fresnel * 0.12 + Number(values.specular) * 0.1) * (0.35 + Number(values.refraction || 0) * 0.35)));
            const shadowIntensity = Math.min(1, Math.max(0, (0.28 + shadowOpacity * 0.78 + shadowColorInfluence * 0.35) * (0.45 + shadowOpacity * 0.75)));
            const reflectionRgba = hexToMutedRgba(reflectionColor, reflectionColorAlpha * reflectionIntensity, reflectionColorSaturation);
            const shadowRgba = hexToMutedRgba(shadowColor, shadowColorAlpha * shadowIntensity, shadowColorSaturation);
            const paletteHighlightAlpha = Math.min(1, Math.max(0, paletteStrength * (0.08 + fresnel * 0.1)));
            const paletteShadeAlpha = Math.min(1, Math.max(0, paletteStrength * (0.24 + shadowOpacity * (0.82 + shadowColorInfluence * 0.32))));
            const paletteInsetShadowAlpha = Math.min(1, Math.max(0, paletteStrength * (0.2 - edgeSoftness * 0.08) * edgeIntensity));
            const paletteBorderAlpha = Math.min(1, Math.max(0, paletteStrength * (0.08 + edgeIntensity * 0.3)));
            const directionalShadowX = shadowDirectionX * Math.max(4, shadowSpread * 0.32);
            const directionalShadowY = shadowDirectionY * Math.max(4, shadowSpread * 0.32);
            const highlightOffsetX = Math.round(highlightX * Math.max(1, shadowSpread * 0.08));
            const highlightOffsetY = Math.round(highlightY * Math.max(1, shadowSpread * 0.08));
            const backdropBlur = Math.max(0, Math.round(blurAmount * 28));
            const backdropSaturate = Math.max(0, 1 + saturation * 0.5);
            const backdropBrightness = Math.max(0, 1 + brightness * 0.22);
            variantPanel.style.setProperty('--glass-palette-highlight-alpha', String(paletteHighlightAlpha));
            variantPanel.style.setProperty('--glass-palette-shade-alpha', String(paletteShadeAlpha));
            variantPanel.style.setProperty('--glass-palette-inset-shadow-alpha', String(paletteInsetShadowAlpha));
            variantPanel.style.setProperty('--glass-palette-shadow-alpha', String(paletteShadeAlpha));
            variantPanel.style.setProperty('--glass-palette-border-alpha', String(paletteBorderAlpha));
            variantPanel.style.setProperty('--glass-palette-panel-highlight-alpha', String(bgBlend));
            variantPanel.style.setProperty('--glass-palette-before-opacity', String(beforeOpacity));
            variantPanel.style.setProperty('--glass-palette-after-opacity', String(afterOpacity));
            variantPanel.style.setProperty('--glass-palette-filter-strength', '1');
            variantPanel.style.setProperty('--glass-border-alpha', String(paletteBorderAlpha));
            variantPanel.style.setProperty('--glass-inner-warp-strength', String(innerWarp));
            variantPanel.style.setProperty('--glass-color-influence-strength', String(colorInfluence));
            variantPanel.style.setProperty('--glass-shadow-color-influence-strength', String(shadowColorInfluence));
            variantPanel.style.setProperty('--glass-shadow-direction-x', String(shadowDirectionX));
            variantPanel.style.setProperty('--glass-shadow-direction-y', String(shadowDirectionY));
            variantPanel.style.setProperty('--glass-highlight-direction-x', String(highlightX));
            variantPanel.style.setProperty('--glass-highlight-direction-y', String(highlightY));
            variantPanel.style.setProperty('--glass-shadow-spread', String(shadowSpread));
            variantPanel.style.setProperty('--glass-shadow-opacity', String(shadowOpacity));
            variantPanel.style.setProperty('--glass-blur-amount', String(blurAmount));
            variantPanel.style.setProperty('--glass-saturation', String(saturation));
            variantPanel.style.setProperty('--glass-brightness', String(brightness));
            variantPanel.style.setProperty('--glass-surface-rgba', surfaceRgba);
            variantPanel.style.setProperty('--glass-reflection-color-rgba', reflectionRgba);
            variantPanel.style.setProperty('--glass-shadow-color-rgba', shadowRgba);
            variantPanel.style.setProperty('--glass-edge-color-rgba', hexToRgba(edgeColor, edgeColorAlpha));
            variantPanel.style.setProperty('--glass-edge-width', String(Math.max(0, Number(values.edgeWidth) || 0)));
            variantPanel.style.setProperty('--glass-edge-blend', String(Math.min(1, Math.max(0, Number(values.edgeBlend) || 0))));
            variantPanel.style.setProperty('--glass-drop-shadow-color-rgba', hexToRgba(dropShadowColor, dropShadowColorAlpha * dropShadowOpacity));
            variantPanel.style.setProperty('--glass-drop-shadow-opacity', String(dropShadowOpacity));
            variantPanel.style.setProperty('--glass-drop-shadow-blur', String(dropShadowBlur));
            variantPanel.style.setProperty('--glass-drop-shadow-soft-blur', String(dropShadowSoftBlur));
            variantPanel.style.setProperty('--glass-drop-shadow-sharp-blur', String(dropShadowSharpBlur));
            variantPanel.style.setProperty('--glass-drop-shadow-distance', String(dropShadowDistance));
            variantPanel.style.setProperty('--glass-drop-shadow-offset-x', String(dropShadowOffsetX));
            variantPanel.style.setProperty('--glass-drop-shadow-offset-y', String(dropShadowOffsetY));
            variantPanel.style.setProperty('--glass-shadow-distance', String(Math.max(6, Math.round(8 + shadowSpreadValue * 0.18))));
            variantPanel.style.setProperty('--glass-face-highlight-distance', String(Math.min(70, Math.max(0, Number(values.faceHighlightDistance) || 42))));
            variantPanel.style.setProperty('--glass-reflection-size', String(Math.max(30, Number(values.reflectionSize) || 92)));
            variantPanel.style.setProperty('--glass-shadow-size', String(Math.max(30, Number(values.shadowSize) || 100)));
            variantPanel.style.setProperty('--glass-shadow-angle', `${shadowAngle}deg`);
            variantPanel.style.setProperty('--glass-reflection-color-alpha', String(reflectionColorAlpha));
            variantPanel.style.setProperty('--glass-shadow-color-alpha', String(shadowColorAlpha));
            variantPanel.style.setProperty('--glass-reflection-color', reflectionColor);
            variantPanel.style.setProperty('--glass-shadow-color', shadowColor);
        }
    }

	    function formatPresetValue(def, value) {
	        if (def.key === 'bevelMode') return `${value} / 1`;
	        if (def.type === 'toggle') return value ? 'ON' : 'OFF';
	        if (def.type === 'direction') {
	            return NEUMO_LIGHT_DIRECTION_OPTIONS.find((item) => item.value === normalizeNeumoLightDirection(value))?.label || '↖';
	        }
	        if (def.type === 'surfaceShape') {
	            return {
	                flat: '平面',
	                convex: '凸面',
	                concave: '凹面',
	                pressed: '押込面'
	            }[normalizeNeumoPanelSurfaceShape(value)] || '平面';
	        }
	        if (def.type === 'color') return normalizeHexColor(value);
	        return def.step === 1 ? String(value) : Number(value).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
	    }

    function setPresetDetailsOpen(panel, open, options = {}) {
        if (!panel) return;
        const details = panel.querySelector('[data-glass-preset-details]');
        const toggle = panel.querySelector('[data-glass-preset-toggle]');
        const immediate = options.immediate === true;
        panel.classList.toggle('is-glass-details-open', open);
        panel.classList.toggle('is-glass-details-closed', !open);
        if (details) {
            clearPanelCollapseTimer(details);
            if (immediate) {
                details.hidden = !open;
                details.setAttribute('aria-hidden', String(!open));
                details.classList.remove('glass-panel-collapse-animating');
                details.classList.toggle('glass-panel-content-open', open);
                details.classList.toggle('glass-panel-content-closing', !open);
                details.style.removeProperty('transition');
                details.style.removeProperty('max-height');
                details.style.removeProperty('overflow');
                details.style.removeProperty('opacity');
                details.style.removeProperty('transform');
                details.style.removeProperty('will-change');
            } else {
                const startHeight = open ? 0 : details.getBoundingClientRect().height;
                const startOpacity = open ? '0' : '1';
                const startTransform = open ? 'translateY(6px) scale(0.98)' : 'translateY(0)';
                details.hidden = false;
                details.setAttribute('aria-hidden', 'false');
                details.classList.remove('glass-panel-content-open', 'glass-panel-content-closing');
                details.classList.add('glass-panel-collapse-animating');
                details.style.overflow = 'hidden';
                details.style.willChange = 'max-height, opacity, transform';
                const targetHeight = open ? details.scrollHeight : 0;
                details.style.setProperty('transition', 'none', 'important');
                details.style.maxHeight = `${startHeight}px`;
                details.style.setProperty('opacity', startOpacity, 'important');
                details.style.transform = startTransform;
                details.getBoundingClientRect();
                details.classList.toggle('glass-panel-content-open', open);
                details.classList.toggle('glass-panel-content-closing', !open);
                details.style.setProperty('transition', 'max-height 0.7s ease, opacity 0.7s ease, transform 0.7s ease', 'important');
                requestAnimationFrame(() => {
                    if (!details.isConnected) return;
                    details.style.maxHeight = `${targetHeight}px`;
                    details.style.setProperty('opacity', open ? '1' : '0', 'important');
                    details.style.transform = open ? 'translateY(0)' : 'translateY(6px) scale(0.98)';
                });
                const timer = setTimeout(() => {
                    details.style.setProperty('transition', 'none', 'important');
                    details.hidden = !open;
                    details.setAttribute('aria-hidden', String(!open));
                    details.classList.remove('glass-panel-collapse-animating');
                    details.classList.toggle('glass-panel-content-open', open);
                    details.classList.toggle('glass-panel-content-closing', !open);
                    details.style.removeProperty('max-height');
                    details.style.removeProperty('overflow');
                    details.style.removeProperty('opacity');
                    details.style.removeProperty('transform');
                    details.style.removeProperty('will-change');
                    details.getBoundingClientRect();
                    requestAnimationFrame(() => {
                        if (details.isConnected) details.style.removeProperty('transition');
                    });
                }, PANEL_VISIBILITY_ANIMATION_MS + 200);
                panelCollapseTimers.set(details, timer);
            }
        }
        if (toggle) {
            toggle.textContent = open ? '▼' : '▶';
            toggle.setAttribute('aria-expanded', String(open));
            const themeLabel = isNeumorphismTheme() ? 'Neumorphism' : (isLiquidGlassTheme() ? 'Lens' : 'Glass');
            toggle.setAttribute('aria-label', `${themeLabel}詳細 ${open ? '開' : '閉'}`);
        }
        localStorage.setItem(getActivePresetDetailsKey(), String(open));
    }

    function applyPresetUI(panel) {
        if (!panel) return;
        const activeTheme = getActiveThemeId();
        panel.dataset.uiTheme = activeTheme;
        const select = panel.querySelector('#ui-preset-select');
        renderPresetSelectOptions(select);
        const selected = getSafePresetSelection(getSelectedPresetValue());
        if (selected !== getSelectedPresetValue()) {
            setPresetSelection(selected);
        }
        document.body.setAttribute('data-ui-preset', selected);
        clearThemeRuntimeStyles(activeTheme);
        const locked = isPresetEditLocked(selected);
        const values = getPresetValuesForSelection(selected);
        currentPresetValues = { ...values };
        applyActiveThemePresetVars(currentPresetValues);
        if (isNeumorphismTheme()) syncNeumorphismBackgroundSurface();
        syncThemeSurfaceToGeneratedPanels(activeTheme);
        const preservedOpen = document.body.dataset.uiPresetDetailsTransitionOpen;
        const preserveAcrossThemeSwitch = preservedOpen === 'true' || preservedOpen === 'false';
        const isInitialPresetUiApply = panel.dataset.presetUiApplied !== 'true';
        const open = preserveAcrossThemeSwitch
            ? preservedOpen === 'true'
            : localStorage.getItem(getActivePresetDetailsKey()) === 'true';
        if (preserveAcrossThemeSwitch) {
            delete document.body.dataset.uiPresetDetailsTransitionOpen;
        }
        // 起動時・テーマ再生成直後は閉じ状態をアニメーションさせない。
        // ここで通常アニメーションを走らせると、折り畳み済みでも操作ボタン行の余白だけが一瞬残る。
        setPresetDetailsOpen(panel, open, { immediate: preserveAcrossThemeSwitch || isInitialPresetUiApply });
        panel.dataset.presetUiApplied = 'true';
        const selectedLock = panel.querySelector('.glass-preset-selected-lock');
        panel.querySelectorAll('[data-glass-param]').forEach((input) => {
            const key = input.getAttribute('data-glass-param');
            const def = getActivePresetParamDefs().find((item) => item.key === key);
            if (!def) return;
            const value = values[key];
	            input.disabled = locked;
	            if (def.type === 'toggle') {
	                input.checked = Boolean(value);
	            } else if (def.type === 'direction') {
	                input.value = normalizeNeumoLightDirection(value);
	            } else {
	                input.value = def.type === 'color' ? normalizeHexColor(value) : String(normalizePresetNumericValue(def, value));
	            }
            const row = input.closest('.glass-preset-row');
            const output = row?.querySelector('.glass-preset-value');
            const lock = row?.querySelector('.glass-preset-lock');
            if (lock) lock.hidden = !locked;
            if (output) output.textContent = formatPresetValue(def, value);
        });
	        if (isNeumorphismTheme()) syncNeumorphismImmediateControls(panel, values);
        if (selectedLock) {
            selectedLock.hidden = !locked;
            selectedLock.textContent = '🔒';
        }
        const deleteButton = panel.querySelector('.glass-preset-delete');
        const renameButton = panel.querySelector('.glass-preset-rename');
        const saveButton = panel.querySelector('.glass-preset-save');
        const lockButton = panel.querySelector('.glass-preset-edit-lock-toggle');
        if (deleteButton) deleteButton.disabled = isBuiltInPreset(selected);
        if (renameButton) renameButton.disabled = isBuiltInPreset(selected);
        if (saveButton) saveButton.disabled = locked;
        if (lockButton) {
            const canToggle = isCustomPresetValue(selected);
            lockButton.disabled = !canToggle;
            lockButton.classList.toggle('is-locked', locked);
            lockButton.classList.toggle('is-unlocked', !locked);
            lockButton.setAttribute('aria-pressed', String(locked));
            lockButton.title = canToggle ? (locked ? '編集ロックを解除' : '編集ロックを設定') : '編集ロックを設定';
            lockButton.textContent = '🔒';
        }
    }

    function syncThemeSurfaceToGeneratedPanels(theme = getActiveThemeId()) {
        /*
         * Theme switching must be synchronous: already-generated panels should not
         * wait for a later animation frame to drop stale Glass/Neumorphism surfaces.
         * This must run after clearThemeRuntimeStyles(), so stale inline variables
         * from the previous theme cannot override the current surface.
         */
        [
            document.getElementById('ui-variant-panel'),
            document.getElementById('ui-preset-panel'),
            document.getElementById(CURSOR_PANEL_3_ID),
            document.getElementById(CURSOR_PANEL_4_ID),
            document.getElementById(CURSOR_PANEL_6_ID),
            document.getElementById('glass-control-bar'),
            document.getElementById('button-container')
        ].forEach((el) => {
            if (!el) return;
            el.dataset.uiTheme = theme;
            el.classList.toggle('is-neumorphism-theme', theme === 'neumorphism');
            el.classList.toggle('is-glass-theme', theme !== 'neumorphism');
            el.classList.toggle('is-liquid-glass-theme', theme === 'liquid-glass');
        });
    }

    function applyThemeAndPresetState(themeId = getActiveThemeId(), requestedPresetId = null) {
        const panel = document.getElementById('ui-preset-panel');
        if (!panel) return;
        const normalizedTheme = themeId === 'neumorphism' ? 'neumorphism' : (themeId === 'liquid-glass' ? 'liquid-glass' : 'glass');
        document.body.setAttribute('data-ui-theme', normalizedTheme);
        lastThemeChangeAt = Date.now();
        if (requestedPresetId) {
            localStorage.setItem(getActivePresetSelectionKey(), getSafePresetSelection(requestedPresetId));
        }
        ensurePresetDetails(panel);
        applyPresetUI(panel);

        // テーマ切替時は外観反映後に全dockの位置を一度だけ確定し、
        // 次の通常開閉アニメーションへ古い高さ計測を持ち越さない。
        document.body.classList.add('glass-theme-layout-settling');
        window.clearTimeout(themeLayoutSettleTimer);
        themeLayoutSettleTimer = window.setTimeout(() => {
            realignDockedPanelsMeasured('theme-switch-settle', { immediate: true });
            document.body.classList.remove('glass-theme-layout-settling');
        }, 34);
    }

    function handlePresetSelectChange(panel, select) {
        if (!select) return;
        const value = select.value;
        setPresetSelection(value);
        applyPresetUI(panel);
    }

    function resetPresetValues(panel) {
        if (isPresetEditLocked(getSelectedPresetValue())) return;
        const values = getPresetDefaultValues(getSelectedPresetValue());
        savePresetValues(values);
        currentPresetValues = { ...values };
        if (panel) {
            panel.querySelectorAll('[data-glass-param]').forEach((input) => {
                const key = input.getAttribute('data-glass-param');
                const value = values[key];
                const def = getActivePresetParamDefs().find((item) => item.key === key);
	                input.disabled = isPresetEditLocked(getSelectedPresetValue());
	                if (def?.type === 'toggle') {
	                    input.checked = Boolean(value);
	                } else if (def?.type === 'direction') {
	                    input.value = normalizeNeumoLightDirection(value);
	                } else {
	                    input.value = def?.type === 'color' ? normalizeHexColor(value) : String(normalizePresetNumericValue(def, value));
	                }
                const row = input.closest('.glass-preset-row');
                const output = row?.querySelector('.glass-preset-value');
                const lock = row?.querySelector('.glass-preset-lock');
                if (lock) lock.hidden = !isPresetEditLocked(getSelectedPresetValue());
                if (def && output) output.textContent = formatPresetValue(def, value);
            });
        }
        applyActiveThemePresetVars(currentPresetValues);
        if (isNeumorphismTheme()) syncNeumorphismBackgroundSurface();
	        if (isNeumorphismTheme()) syncNeumorphismImmediateControls(panel, currentPresetValues);
    }

    function duplicateCurrentPreset(panel) {
        const selected = getSelectedPresetValue();
        const baseName = isCustomPresetValue(selected) ? customPresetNameFromValue(selected) : selected;
        const store = getCustomPresetStore();
        const existingNames = new Set(Object.keys(store));
        const nextName = (() => {
            const initial = normalizePresetName(prompt('複製先の名前を入力してください', `${baseName}-copy`));
            if (!initial) return '';
            let candidate = initial;
            let index = 2;
            while (existingNames.has(candidate)) {
                candidate = `${initial}-${index}`;
                index += 1;
            }
            return candidate;
        })();
        if (!nextName) return;
        store[nextName] = clonePresetValues(getPresetValuesForSelection(selected));
        saveCustomPresetStore(store);
        setPresetEditLocked(customPresetKey(nextName), false);
        setPresetSelection(customPresetKey(nextName));
        applyPresetUI(panel);
        applyActiveThemePresetVars(store[nextName]);
        if (isNeumorphismTheme()) syncNeumorphismBackgroundSurface();
    }

    function createNewPreset(panel) {
        const nextName = normalizePresetName(prompt('新規カスタムプリセット名を入力してください', 'new-custom'));
        if (!nextName) return;
        const store = getCustomPresetStore();
        const basePreset = isNeumorphismTheme()
            ? (store[INITIAL_NEUMORPHISM_PRESET_NAME] || INITIAL_NEUMORPHISM_PRESET_VALUES)
            : (store['ガラス-1'] || getPresetDefaultValues('1'));
        store[nextName] = clonePresetValues(basePreset);
        saveCustomPresetStore(store);
        setPresetEditLocked(customPresetKey(nextName), false);
        setPresetSelection(customPresetKey(nextName));
        applyPresetUI(panel);
    }

    function renameCurrentPreset(panel) {
        const selected = getSelectedPresetValue();
        if (!isCustomPresetValue(selected)) return;
        const oldName = customPresetNameFromValue(selected);
        const nextName = normalizePresetName(prompt('プリセット名を変更してください', oldName));
        if (!nextName || nextName === oldName) return;
        const store = getCustomPresetStore();
        if (!store[oldName]) return;
        store[nextName] = clonePresetValues(store[oldName]);
        delete store[oldName];
        saveCustomPresetStore(store);
        const locks = loadPresetEditLocks();
        if (Object.prototype.hasOwnProperty.call(locks, selected)) {
            locks[customPresetKey(nextName)] = Boolean(locks[selected]);
            delete locks[selected];
            savePresetEditLocks(locks);
        }
        setPresetSelection(customPresetKey(nextName));
        applyPresetUI(panel);
    }

    function deleteCurrentPreset(panel) {
        const selected = getSelectedPresetValue();
        if (!isCustomPresetValue(selected)) return;
        const name = customPresetNameFromValue(selected);
        if (!confirm(`カスタムプリセット「${name}」を削除しますか？`)) return;
        const store = getCustomPresetStore();
        delete store[name];
        saveCustomPresetStore(store);
        const locks = loadPresetEditLocks();
        if (Object.prototype.hasOwnProperty.call(locks, selected)) {
            delete locks[selected];
            savePresetEditLocks(locks);
        }
        setPresetSelection(getSafePresetSelection());
        applyPresetUI(panel);
    }

    function clearPanelVisibilityTimer(el) {
        const timer = panelVisibilityTimers.get(el);
        if (timer) {
            clearTimeout(timer);
            panelVisibilityTimers.delete(el);
        }
    }

    function clearPanelCollapseTimer(el) {
        const timer = panelCollapseTimers.get(el);
        if (timer) {
            clearTimeout(timer);
            panelCollapseTimers.delete(el);
        }
    }

    function blurGlassControlFocusIfNeeded() {
        const active = document.activeElement;
        if (!active || typeof active.blur !== 'function') return;
        if (active.id === 'glass-panel-reset' || active.classList?.contains('glass-control-pill')) {
            active.blur();
        }
    }

    function setPanelVisibleAnimated(el, visible, animate = true) {
        if (!el) return;
        if (el.id === CURSOR_PANEL_HIDDEN_ID) visible = false;
        clearPanelVisibilityTimer(el);

        if (!animate) {
            el.hidden = !visible;
            el.style.display = visible ? '' : 'none';
            el.style.visibility = visible ? '' : 'hidden';
            el.classList.toggle('glass-forced-hidden', !visible);
            el.classList.toggle('is-hidden', !visible);
            el.classList.remove('glass-panel-visibility-animating', 'glass-panel-visible', 'glass-panel-hiding');
            if (!visible) {
                el.setAttribute('aria-hidden', 'true');
            } else {
                el.removeAttribute('aria-hidden');
            }
            return;
        }

        el.hidden = false;
        el.style.display = '';
        el.style.visibility = '';
        el.classList.remove('glass-forced-hidden', 'is-hidden');
        el.classList.add('glass-panel-visibility-animating');

        if (visible) {
            el.setAttribute('aria-hidden', 'false');
            el.classList.add('glass-panel-hiding');
            el.classList.remove('glass-panel-visible');
            void el.offsetWidth;
            requestAnimationFrame(() => {
                if (!el.isConnected) return;
                el.classList.remove('glass-panel-hiding');
                el.classList.add('glass-panel-visible');
            });
            return;
        }

        el.setAttribute('aria-hidden', 'true');
        const layer = el.closest?.('#glass-floating-layer');
        if (layer && layer.getAttribute('aria-hidden') === 'true') {
            const focusedInside = layer.contains(document.activeElement);
            if (focusedInside && typeof document.activeElement?.blur === 'function') {
                document.activeElement.blur();
            }
        }
        el.classList.add('glass-panel-hiding');
        el.classList.remove('glass-panel-visible');
        const timer = setTimeout(() => {
            if (!el.classList.contains('glass-panel-hiding')) return;
            el.hidden = true;
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.classList.remove('glass-panel-visibility-animating', 'glass-panel-hiding');
        }, PANEL_VISIBILITY_ANIMATION_MS);
        panelVisibilityTimers.set(el, timer);
    }

    function measurePanelClosedAnimationHeight(panel) {
        if (!panel) return 24;
        // 閉じ高さは header の推定値ではなく、実際の collapsed 外観を複製して計測する。
        // テーマや個別パネルCSSが変わっても、アニメーション途中だけ短く潰れることを防ぐ。
        const clone = panel.cloneNode(true);
        clone.removeAttribute('aria-describedby');
        clone.classList.add('collapsed');
        clone.classList.remove('glass-panel-collapse-animating', 'glass-panel-moving', 'glass-panel-flip-moving', 'is-dragging');
        clone.removeAttribute('data-glass-dragging');
        clone.style.setProperty('position', 'fixed', 'important');
        clone.style.setProperty('left', '-10000px', 'important');
        clone.style.setProperty('top', '0px', 'important');
        clone.style.setProperty('visibility', 'hidden', 'important');
        clone.style.setProperty('pointer-events', 'none', 'important');
        clone.style.setProperty('transition', 'none', 'important');
        clone.style.removeProperty('height');
        clone.style.removeProperty('max-height');
        clone.style.removeProperty('overflow');
        clone.style.removeProperty('will-change');
        const content = clone.querySelector('.ui-content');
        if (content) {
            content.classList.remove('glass-panel-content-open', 'glass-panel-content-closing');
            content.style.removeProperty('max-height');
            content.style.removeProperty('opacity');
            content.style.removeProperty('transform');
            content.style.removeProperty('overflow');
            content.style.removeProperty('will-change');
        }
        document.body.appendChild(clone);
        const measured = clone.getBoundingClientRect().height;
        clone.remove();
        return Number.isFinite(measured) && measured > 0 ? measured : 24;
    }

    function warnIfPanelAnimationHeightDrifted(panel, expectedHeight, reason) {
        if (!panel || !Number.isFinite(expectedHeight) || expectedHeight <= 0) return;
        const actualHeight = panel.getBoundingClientRect().height;
        const delta = Math.abs(actualHeight - expectedHeight);
        if (delta > 1) {
            console.warn('[glass-panel-height-drift]', {
                reason,
                panelId: panel.id,
                expectedHeight,
                actualHeight,
                delta
            });
        }
    }

    function setPanelCollapsedAnimated(panel, collapsed, startDelayMs = 0, layoutHint = null, heightOverrides = null) {
        if (!panel) return;
        clearPanelCollapseTimer(panel);
        const content = panel.querySelector('.ui-content');
        if (!content) {
            panel.classList.toggle('collapsed', collapsed);
            if (isDockManagedPanelId(panel.id)) scheduleArrangeDockedPanels();
            return;
        }

        const open = !collapsed;
        const run = () => {
            panel.hidden = false;
            panel.classList.add('glass-panel-collapse-animating');
            if (open) {
                panel.classList.toggle('collapsed', false);
                content.hidden = false;
                content.classList.add('glass-panel-content-open');
                content.classList.remove('glass-panel-content-closing');
                content.style.overflow = 'hidden';
                content.style.willChange = 'max-height, opacity, transform';
            } else {
                // v48: 閉じ操作直後に本文領域が残る問題を避けるため、
                // 外側パネルの高さは固定せず、collapsed状態だけを先に確定する。
                panel.classList.toggle('collapsed', true);
                content.classList.remove('glass-panel-content-open');
                content.classList.add('glass-panel-content-closing');
                content.style.removeProperty('max-height');
                content.style.removeProperty('overflow');
                content.style.removeProperty('opacity');
                content.style.removeProperty('transform');
                content.style.removeProperty('will-change');
                clearNumberedDockContentTransform(panel);
                panel.classList.remove('glass-panel-collapse-animating');
                if (isDockManagedPanelId(panel.id)) {
                    requestCursorDockLayoutRefresh(layoutHint || getCursorDockOrderHint(), heightOverrides || getCursorDockHeightOverridesForCurrentState(), { force: true });
                }
                return;
            }
            const startHeight = content.getBoundingClientRect().height;
            const targetHeight = open ? content.scrollHeight : 0;
            content.style.maxHeight = `${startHeight}px`;
            content.style.opacity = open ? '1' : '0';
            content.style.transform = open ? 'translateY(0)' : 'translateY(6px) scale(0.98)';

            requestAnimationFrame(() => {
                if (!content.isConnected) return;
                content.style.maxHeight = `${targetHeight}px`;
                content.style.opacity = open ? '1' : '0';
                content.style.transform = open ? 'translateY(0)' : 'translateY(6px) scale(0.98)';
            });

            const timer = setTimeout(() => {
                panel.classList.toggle('collapsed', collapsed);
                content.classList.toggle('glass-panel-content-open', open);
                content.classList.toggle('glass-panel-content-closing', collapsed);
                content.style.removeProperty('max-height');
                content.style.removeProperty('overflow');
                content.style.removeProperty('opacity');
                content.style.removeProperty('transform');
                content.style.removeProperty('will-change');
                panel.classList.remove('glass-panel-collapse-animating');
                clearNumberedDockContentTransform(panel);
            }, PANEL_VISIBILITY_ANIMATION_MS);
            panelCollapseTimers.set(panel, timer);
        };

        if (startDelayMs > 0) {
            const timer = setTimeout(run, startDelayMs);
            panelCollapseTimers.set(panel, timer);
            return;
        }
        run();
    }

    function logDockOpenLayoutTrace(panel, phase, orderHint, heightOverrides) {
        const panels = getDockedSortablePanels();
        const layout = buildDockedPanelLayout(panels, orderHint, heightOverrides);
        const layoutTop = layout.map(({ panel: layoutPanel, top }) => ({
            id: layoutPanel?.id || '',
            label: getCursorPanelConfig(layoutPanel?.id)?.title || layoutPanel?.id || '',
            top
        }));
        const previousTopMap = (() => {
            try {
                return JSON.parse(panel?.dataset?.glassPreOpenTopMap || '{}') || {};
            } catch (error) {
                return {};
            }
        })();
        if (phase === 'pre-open') {
            panel.dataset.glassPreOpenTopMap = JSON.stringify(Object.fromEntries(layoutTop.map(({ id, top }) => [id, top])));
        }
        layoutDebugLog('[glass-dock-open]', phase, {
            openingPanelId: panel?.id || '',
            openingPanelLabel: getCursorPanelConfig(panel?.id)?.title || panel?.id || '',
            measuredExpandedHeight: heightOverrides?.[panel?.id] || null,
            currentCollapsedHeight: panel?.getBoundingClientRect?.().height || null,
            layoutTop,
            topDiff: phase === 'after-open'
                ? layoutTop.map((entry) => ({
                    ...entry,
                    previousTop: Number.isFinite(previousTopMap[entry.id]) ? previousTopMap[entry.id] : null,
                    diff: Number.isFinite(previousTopMap[entry.id]) ? entry.top - previousTopMap[entry.id] : null
                }))
                : null
        });
    }

    function isPanelVisible(el) {
        if (!el) return false;
        return !el.hidden && !el.classList.contains('glass-forced-hidden') && !el.classList.contains('is-hidden') && !el.classList.contains('glass-panel-hiding') && el.getAttribute('aria-hidden') !== 'true';
    }

    function applyVisibilityState() {
        const state = getVisibilityState();
        const showAll = state.showAll !== false;
        const fixedHiddenIds = new Set([
            'canvas-size-container',
            'button-container',
            'color-container',
            'slider-container',
            'cursor-container',
            CURSOR_PANEL_HIDDEN_ID,
            'svg-file-container',
            'svg-anime-container',
            'load-container',
            'vector-container'
        ]);
        const targetIds = [
            'ui-variant-panel',
            SETTINGS_PANEL_ID,
            'glass-control-bar',
            CURSOR_PANEL_1_ID,
            CURSOR_PANEL_2_ID,
            CURSOR_PANEL_3_ID,
            CURSOR_PANEL_4_ID,
            CURSOR_PANEL_6_ID,
            'svg-file-container',
            'svg-anime-container',
            'load-container',
            'vector-container'
        ];

        targetIds.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const visible = fixedHiddenIds.has(id)
                ? false
                : Object.prototype.hasOwnProperty.call(state, id)
                ? Boolean(state[id])
                : showAll;
            setPanelVisibleAnimated(el, visible, false);
        });

        const settingsPanel = document.getElementById(SETTINGS_PANEL_ID);
        if (settingsPanel) {
            settingsPanel.classList.toggle('collapsed', getVisibilityState().settingsOpen === false);
        }
        const controlBar = document.getElementById('glass-control-bar');
        if (controlBar) controlBar.hidden = false;
        const casePanel = document.getElementById('case-comparison');
        if (casePanel && !casePanel.hidden && casePanel.style.display !== 'none') {
            restoreCaseComparisonVisiblePlacement('apply-visibility');
        }
    }

    function restoreStartupCollapsedDockPanels() {
        const state = getVisibilityState();
        if (state.showAll === false) return;

        const dockPanels = [CURSOR_PANEL_3_ID, CURSOR_PANEL_4_ID, CURSOR_PANEL_6_ID, CURSOR_PANEL_7_ID]
            .map((id) => document.getElementById(id))
            .filter(Boolean);
        if (!dockPanels.length) return;

        let changed = false;
        dockPanels.forEach((panel) => {
            if (panel.hidden || panel.style.display === 'none' || !panel.classList.contains('collapsed')) {
                changed = true;
            }
            setPanelVisibleAnimated(panel, true, false);
            setPanelCollapsedAnimated(panel, true, 0, getCanonicalDockedPanelOrder(), getCursorDockHeightOverridesForCurrentState());
        });

        arrangeDockedPanels(getCanonicalDockedPanelOrder(), getCursorDockHeightOverridesForCurrentState(), { animate: false });
        if (changed && typeof saveVisibilityFromDom === 'function') {
            saveVisibilityFromDom();
        }
    }

    function saveVisibilityFromDom() {
        const state = { showAll: true };
        const fixedHiddenIds = new Set([
            'ui-variant-panel',
            CURSOR_PANEL_HIDDEN_ID,
            'svg-file-container',
            'svg-anime-container',
            'load-container',
            'vector-container'
        ]);
        [
            'ui-variant-panel',
            SETTINGS_PANEL_ID,
            'glass-control-bar',
            CURSOR_PANEL_1_ID,
            CURSOR_PANEL_2_ID,
            CURSOR_PANEL_3_ID,
            CURSOR_PANEL_4_ID,
            CURSOR_PANEL_6_ID,
            'canvas-size-container',
            'button-container',
            'color-container',
            'slider-container',
            'cursor-container',
            'svg-file-container',
            'svg-anime-container',
            'load-container',
            'vector-container'
        ].forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (fixedHiddenIds.has(id)) return;
            state[id] = isPanelVisible(el);
        });
        saveVisibilityState(state);
    }

    function savePanelPositions() {
        const payload = { order: saveDockedPanelOrder() };
        getTargetPanelIds().forEach(id => {
            if (id === 'case-comparison') return;
            if (shouldTrackViewportPlacement(id)) return;
            if (isControlPanel(id)) return;
            const el = document.getElementById(id);
            if (!el) return;
            const left = parseFloat(el.dataset.glassLeft);
            const top = parseFloat(el.dataset.glassTop);
            if (!Number.isFinite(left) || !Number.isFinite(top)) return;
            if (left === 0 && top === 0 && !el.style.left && !el.style.top) {
                return;
            }
            payload[id] = {
                left,
                top
            };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }

    function normalizeDockedPanelOrder(order) {
        const allowedIds = DOCKED_PANEL_DEFS.map((panel) => panel.id);
        if (!Array.isArray(order) || !order.length) return [];
        const seen = new Set();
        const next = [];
        order.forEach((id) => {
            if (!allowedIds.includes(id) || seen.has(id)) return;
            seen.add(id);
            next.push(id);
        });
        allowedIds.forEach((id) => {
            if (seen.has(id)) return;
            next.push(id);
        });
        return next;
    }

    function loadDockedPanelOrder() {
        // v57: 古いlocalStorageの順番は読まない。正本順だけを返す。
        return getCanonicalDockedPanelOrder();
    }

    function saveDockedPanelOrder() {
        // v57: 現在Y座標から順番を保存しない。保存する場合も正本順だけにする。
        const order = getCanonicalDockedPanelOrder();
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
            const next = { ...stored, order };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ order }));
        }
        return order;
    }

    function clearTransforms() {
        getTargetPanelIds().forEach(id => {
            if (isControlPanel(id)) return;
            const el = document.getElementById(id);
            if (!el) return;
            if (id === 'case-comparison' && isCaseComparisonCollapseAnimating()) {
                caseComparisonResetPlacementPending = true;
                return;
            }
            el.dataset.glassLeft = '0';
            el.dataset.glassTop = '0';
            el.dataset.glassX = '0';
            el.dataset.glassY = '0';
            el.style.left = '';
            el.style.top = '';
            el.style.right = '';
            el.style.bottom = '';
            el.style.transform = '';
            el.style.willChange = '';
            el.classList.remove('viewport-tracking-animate');
            el.classList.remove('is-dragging');
            el.removeAttribute('data-glass-dragging');
        });
    }

    function applyFixedPlacement(el, placement) {
        if (!el || !placement) return;
        el.style.left = '';
        el.style.top = '';
        el.style.right = '';
        el.style.bottom = '';
        if (Number.isFinite(placement.left)) el.style.left = `${placement.left}px`;
        if (Number.isFinite(placement.top)) el.style.top = `${placement.top}px`;
        if (Number.isFinite(placement.right)) el.style.right = `${placement.right}px`;
        if (Number.isFinite(placement.bottom)) el.style.bottom = `${placement.bottom}px`;
    }

    function applySavedPositions() {
        const layer = document.getElementById('glass-floating-layer');
        if (!isGlassMode()) {
            if (layer) {
                Array.from(layer.children).forEach(restorePanel);
                layer.remove();
                floatingLayer = null;
            }
            clearTransforms();
            return;
        }

        ensureFloatingLayer();
        const positions = getPanelPositions();
        getTargetPanelIds().forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === 'ui-variant-panel') {
                dockPanel(el);
                bindUiVariantIdleReset(el);
                applyViewportTrackedPlacement(el, { animate: false });
                return;
            }
            if (id === 'case-comparison') {
                dockPanel(el);
                placeCaseComparisonFixed({ animate: false });
                return;
            }
            if (isControlPanel(id)) {
                dockPanel(el);
                applyDefaultPlacement(el, id);
                return;
            }
            dockPanel(el);
            if (isCursorPanel(id)) el.style.position = 'fixed';
            if (id === CURSOR_PANEL_5_ID) {
                dockPanel(el);
                if (isCursorPanel(id)) el.style.position = 'fixed';
                placePanel5BottomLeftSafely(el, 'apply-saved-positions');
                requestAnimationFrame(() => placePanel5BottomLeftSafely(el, 'apply-saved-positions-raf'));
                return;
            }
            if (isDockManagedPanelId(id)) {
                if (!el.dataset.glassDockMode) {
                    setPanelDockMode(el, 'docked');
                }
                if (restoreSavedPanelPlacement(el, id)) {
                    return;
                }
                applyDefaultPlacement(el, id);
                return;
            }
            applyDefaultPlacement(el, id);
            const hasSaved = Object.prototype.hasOwnProperty.call(positions, id);
            const saved = positions[id] || { left: 0, top: 0 };
            const savedIsZero = hasSaved && Number.isFinite(saved.left) && Number.isFinite(saved.top) && saved.left === 0 && saved.top === 0;
            const placement = id === SETTINGS_PANEL_ID ? SETTINGS_PANEL_DEFAULT_PLACEMENT : DEFAULT_LAYOUT[id];
            const hasDefaultRightTop = placement && Number.isFinite(placement.right) && Number.isFinite(placement.top);
            if (!hasSaved || savedIsZero) {
                if (id === SETTINGS_PANEL_ID) {
                    applyDefaultPlacement(el, id);
                } else if (hasDefaultRightTop) {
                    applyDefaultPlacement(el, id);
                } else if (placement && Number.isFinite(placement.left) && Number.isFinite(placement.top)) {
                    setPanelPosition(el, placement.left, placement.top);
                }
                return;
            }
            const rect = el.getBoundingClientRect();
            const left = hasSaved && !savedIsZero && Number.isFinite(saved.left) ? saved.left
                : hasSaved && Number.isFinite(saved.x) ? saved.x
                : rect.left;
            const top = hasSaved && !savedIsZero && Number.isFinite(saved.top) ? saved.top
                : hasSaved && Number.isFinite(saved.y) ? saved.y
                : rect.top;
            if (id === SETTINGS_PANEL_ID) {
                const movedBack = restorePanelToViewport(el);
                if (!hasSaved) {
                    applyDefaultPlacement(el, id);
                } else if (!movedBack && Number.isFinite(left) && Number.isFinite(top)) {
                    setPanelPosition(el, left, top);
                } else if (!movedBack) {
                    applyDefaultPlacement(el, id);
                }
                return;
            }
            setPanelPosition(el, left, top);
        });
    }

    function clampToViewport(el, left, top) {
        const rect = el.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - rect.width - 8);
        const maxTop = Math.max(0, window.innerHeight - rect.height - 8);
        const minLeft = -Math.min(24, rect.width * 0.12);
        const minTop = -Math.min(24, rect.height * 0.12);
        if (el?.id === 'case-comparison') {
            const style = getComputedStyle(el);
            const marginLeft = Number.parseFloat(style.marginLeft) || 0;
            const marginTop = Number.parseFloat(style.marginTop) || 0;
            const safeLeft = 20;
            const safeTop = 20;
            const visibleLeft = left + marginLeft;
            const visibleTop = top + marginTop;
            const nextVisibleLeft = Math.min(maxLeft, Math.max(safeLeft, visibleLeft));
            const nextVisibleTop = Math.min(maxTop, Math.max(safeTop, visibleTop));
            return {
                left: nextVisibleLeft - marginLeft,
                top: nextVisibleTop - marginTop
            };
        }
        return {
            left: Math.min(maxLeft, Math.max(minLeft, left)),
            top: Math.min(maxTop, Math.max(minTop, top))
        };
    }

    function setPanelPosition(el, left, top) {
        const clamped = clampToViewport(el, left, top);
        el.dataset.glassLeft = String(clamped.left);
        el.dataset.glassTop = String(clamped.top);
        el.dataset.glassX = String(clamped.left);
        el.dataset.glassY = String(clamped.top);
        el.style.left = `${clamped.left}px`;
        el.style.top = `${clamped.top}px`;
        el.style.right = '';
        el.style.bottom = '';
        el.style.transform = '';
    }

    function getBottomControlSafeBottom() {
        const controlBar = document.getElementById('glass-control-bar');
        const rect = controlBar?.getBoundingClientRect();
        if (rect && Number.isFinite(rect.top)) {
            return Math.max(12, rect.top - 12);
        }
        return Math.max(12, window.innerHeight - 12);
    }

    function getNumberButtonUnionRect() {
        const buttons = Array.from(document.querySelectorAll('.glass-panel-quick-toggle-button'));
        const visibleButtons = buttons.filter((button) => {
            if (!button || button.hidden) return false;
            const style = window.getComputedStyle(button);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
        if (!visibleButtons.length) return null;
        const rects = visibleButtons.map((button) => button.getBoundingClientRect()).filter((rect) => rect.width > 0 && rect.height > 0);
        if (!rects.length) return null;
        return rects.reduce((union, rect) => ({
            left: Math.min(union.left, rect.left),
            top: Math.min(union.top, rect.top),
            right: Math.max(union.right, rect.right),
            bottom: Math.max(union.bottom, rect.bottom),
            width: Math.max(union.right, rect.right) - Math.min(union.left, rect.left),
            height: Math.max(union.bottom, rect.bottom) - Math.min(union.top, rect.top)
        }));
    }

    function applyTemporaryViewportClamp(el) {
        if (!el || el.hidden || el.style.display === 'none') return false;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;
        const padding = 14;
        const safeBottom = getBottomControlSafeBottom();
        let nextLeft = parseFloat(el.dataset.glassLeft);
        let nextTop = parseFloat(el.dataset.glassTop);
        const hasSavedLeft = Number.isFinite(nextLeft);
        const hasSavedTop = Number.isFinite(nextTop);
        if (!hasSavedLeft || !hasSavedTop) {
            nextLeft = rect.left;
            nextTop = rect.top;
        }
        if (rect.width >= window.innerWidth - padding * 2) {
            nextLeft = padding;
        } else {
            const maxLeft = Math.max(padding, window.innerWidth - rect.width - padding);
            if (rect.left < padding) nextLeft = Math.max(padding, nextLeft + (padding - rect.left));
            if (rect.right > window.innerWidth - padding) nextLeft = Math.min(nextLeft, maxLeft);
        }
        const overflow = rect.bottom - safeBottom;
        if (overflow > 0) {
            nextTop = rect.top - overflow;
        }
        if (rect.top < padding) {
            nextTop = Math.max(padding, nextTop + (padding - rect.top));
        }
        const clamped = clampToViewport(el, nextLeft, nextTop);
        if (clamped.top + rect.height > safeBottom) {
            clamped.top = Math.max(padding, safeBottom - rect.height);
        }
        const changed = clamped.left !== rect.left || clamped.top !== rect.top;
        if (!changed) return false;
        el.style.left = `${clamped.left}px`;
        el.style.top = `${clamped.top}px`;
        el.style.right = '';
        el.style.bottom = '';
        return true;
    }

    function applyTemporaryStackedClamp(panels) {
        const visiblePanels = panels.filter((panel) => panel && !panel.hidden && panel.style.display !== 'none');
        if (!visiblePanels.length) return;
        const padding = 14;
        const gap = 10;
        const safeBottom = getBottomControlSafeBottom();
        const order = {
            [CURSOR_PANEL_7_ID]: 0,
            [CURSOR_PANEL_6_ID]: 1,
            [CURSOR_PANEL_4_ID]: 2,
            [CURSOR_PANEL_3_ID]: 3
        };
        const overflowPanels = visiblePanels
            .map((panel) => {
                const rect = panel.getBoundingClientRect();
                return { panel, rect, overflow: rect.bottom - safeBottom };
            })
            .filter(({ rect, overflow }) => rect.width > 0 && rect.height > 0 && overflow > 0)
            .sort((a, b) => (order[a.panel.id] ?? 99) - (order[b.panel.id] ?? 99));

        if (!overflowPanels.length) return;

        let previousBottom = safeBottom;
        overflowPanels.forEach(({ panel, rect, overflow }) => {
            const savedLeft = parseFloat(panel.dataset.glassLeft);
            const savedTop = parseFloat(panel.dataset.glassTop);
            const hasSaved = Number.isFinite(savedLeft) && Number.isFinite(savedTop);
            const defaultPlacement = panel.id === SETTINGS_PANEL_ID ? SETTINGS_PANEL_DEFAULT_PLACEMENT : DEFAULT_LAYOUT[panel.id];
            const maxLeft = Math.max(padding, window.innerWidth - rect.width - padding);
            const clampedLeft = Math.min(Math.max(padding, hasSaved ? savedLeft : rect.left), maxLeft);
            let clampedTop = rect.top - overflow;
            if (clampedTop + rect.height > previousBottom - gap) {
                clampedTop = previousBottom - gap - rect.height;
            }
            clampedTop = Math.max(padding, clampedTop);
            panel.style.left = `${clampedLeft}px`;
            panel.style.top = `${clampedTop}px`;
            panel.style.right = '';
            previousBottom = clampedTop;
        });
    }

    function resetPanels(options = {}) {
        if (!options.bypassMotionLock && !acquireUtilityPanelMotionLock('placement-reset', RESET_PANELS_ANIMATION_MS)) {
            return false;
        }
        debugDockedPanelOrder('reset:start');
        const orderHint = getCursorDockResetOrderHint();
        const placementOrderHint = orderHint.slice();
        layoutDebugLog('[layout-order-debug]', 'resetPanels:start', { orderHint });

        // 配置リセットは、現在見えている位置を出発点として固定してから、
        // 右側の正規ドック位置へ left/top を直線補間する。
        // 途中で通常のFLIP/再配置処理を挟むと、先に目的地へ瞬間移動してから
        // 別パネルとすり替わる見え方になるため、この関数内で完結させる。
        const dockedPanelsBefore = DOCKED_PANEL_DEFS
            .map(({ id }) => document.getElementById(id))
            .filter((panel) => panel && !panel.hidden);
        const resetStartRects = new Map();
        dockedPanelsBefore.forEach((panel) => {
            const rect = panel.getBoundingClientRect();
            resetStartRects.set(panel.id, rect);
            panel.classList.remove('glass-panel-moving', 'glass-panel-flip-moving');
            panel.style.transitionProperty = 'none';
            panel.style.transitionDuration = '0ms';
            panel.style.transitionTimingFunction = '';
            panel.style.transitionDelay = '';
            panel.style.willChange = 'left, top';
            panel.style.left = `${rect.left}px`;
            panel.style.top = `${rect.top}px`;
            panel.style.right = '';
            panel.style.bottom = '';
            panel.style.transform = '';
            panel.dataset.glassLeft = String(rect.left);
            panel.dataset.glassTop = String(rect.top);
            panel.dataset.glassX = String(rect.left);
            panel.dataset.glassY = String(rect.top);
            setPanelDockMode(panel, 'docked');
        });

        clearSavedPanelPlacements();
        markDockedPanelsDefault();
        debugDockedPanelOrder('reset:after-freeze-and-dock', { orderHint });

        const resetOrder = [
            'ui-variant-panel',
            'glass-control-bar',
            SETTINGS_PANEL_ID,
            SETTINGS_PANEL_TEST_ID,
            'case-comparison',
            'canvas-size-container',
            'button-container',
            'color-container',
            'slider-container',
            'svg-file-container',
            'svg-anime-container',
            'load-container',
            'vector-container'
        ];
        resetOrder.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (id === 'ui-variant-panel') return;
            if (id === 'case-comparison') {
                if (isCaseComparisonCollapseAnimating()) {
                    caseComparisonResetPlacementPending = true;
                    return;
                }
                setPanelPosition(el, RESET_EDGE_MARGIN, Math.max(RESET_EDGE_MARGIN, window.innerHeight - el.getBoundingClientRect().height - RESET_EDGE_MARGIN));
                el.style.right = '';
                el.style.bottom = '';
                caseComparisonResetPlacementPending = false;
                return;
            }
            if (isDockManagedPanelId(id)) return;
            applyDefaultPlacement(el, id);
            if (isControlPanel(id)) return;
            const placement = id === SETTINGS_PANEL_ID ? SETTINGS_PANEL_DEFAULT_PLACEMENT : DEFAULT_LAYOUT[id];
            if (placement && Number.isFinite(placement.left) && Number.isFinite(placement.top)) {
                setPanelPosition(el, placement.left, placement.top);
            } else if (placement && Number.isFinite(placement.right) && Number.isFinite(placement.bottom)) {
                el.style.left = '';
                el.style.top = '';
                el.style.right = `${placement.right}px`;
                el.style.bottom = `${placement.bottom}px`;
                el.dataset.glassLeft = '';
                el.dataset.glassTop = '';
                el.dataset.glassX = '';
                el.dataset.glassY = '';
            }
        });

        const stylePanel = document.getElementById('ui-variant-panel');
        if (stylePanel) stylePanel.classList.remove('collapsed');
        const settingsPanel = document.getElementById(SETTINGS_PANEL_ID);
        if (settingsPanel) {
            settingsPanel.style.left = '';
            settingsPanel.style.top = '';
            settingsPanel.style.right = '24px';
            settingsPanel.style.bottom = '';
            settingsPanel.dataset.glassLeft = '';
            settingsPanel.dataset.glassTop = '';
            settingsPanel.dataset.glassX = '';
            settingsPanel.dataset.glassY = '';
        }
        clearUiVariantIdleReturnTimer();

        const heightOverrides = getCursorDockHeightOverridesForCurrentState();
        const targetLayout = buildCanonicalCursorDockLayout(placementOrderHint, heightOverrides);
        dockArrangeSequence += 1;
        const sequence = dockArrangeSequence;
        const durationMs = RESET_PANELS_ANIMATION_MS;

        requestAnimationFrame(() => {
            if (sequence !== dockArrangeSequence) return;
            debugDockedPanelOrder('reset:before-linear-move', { orderHint });
            const startTime = performance.now();
            const moves = targetLayout
                .map(({ panel, left, top }) => {
                    if (!panel) return null;
                    const startRect = resetStartRects.get(panel.id) || panel.getBoundingClientRect();
                    return {
                        panel,
                        startLeft: startRect.left,
                        startTop: startRect.top,
                        targetLeft: left,
                        targetTop: top
                    };
                })
                .filter(Boolean);

            const step = (now) => {
                if (sequence !== dockArrangeSequence) return;
                const progress = Math.min(Math.max((now - startTime) / durationMs, 0), 1);
                moves.forEach(({ panel, startLeft, startTop, targetLeft, targetTop }) => {
                    if (!panel.isConnected) return;
                    const nextLeft = startLeft + ((targetLeft - startLeft) * progress);
                    const nextTop = startTop + ((targetTop - startTop) * progress);
                    panel.style.left = `${nextLeft}px`;
                    panel.style.top = `${nextTop}px`;
                    panel.style.right = '';
                    panel.style.bottom = '';
                    panel.style.transform = '';
                });
                if (progress < 1) {
                    requestAnimationFrame(step);
                    return;
                }
                moves.forEach(({ panel, targetLeft, targetTop }) => {
                    if (!panel.isConnected) return;
                    panel.classList.remove('glass-panel-moving', 'glass-panel-flip-moving');
                    panel.style.transitionProperty = '';
                    panel.style.transitionDuration = '';
                    panel.style.transitionTimingFunction = '';
                    panel.style.transitionDelay = '';
                    panel.style.willChange = '';
                    finalizeDockPanelPlacement(panel, targetLeft, targetTop);
                });
                const appliedOrderHint = normalizeDockedPanelOrder(placementOrderHint);
                cursorDockResetOrderHintCache = appliedOrderHint;
                cursorDockResetOrderHintDirty = false;
                layoutDebugLog('[layout-order-debug]', 'resetPanels:linear-move-complete', {
                    orderHint,
                    placementOrderHint: appliedOrderHint,
                    layoutOrder: targetLayout.map(({ panel }) => panel?.id).filter(Boolean)
                });
            };
            requestAnimationFrame(step);
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify({ order: normalizeDockedPanelOrder(placementOrderHint) }));
    }

    function ensureControlBar() {
        const existingBars = Array.from(document.querySelectorAll('#glass-control-bar'));
        let bar = existingBars.pop() || null;
        existingBars.forEach((node) => node.remove());
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'glass-control-bar';
            bar.className = 'glass-control-bar';
        }
        bar.innerHTML = '';
        if (bar.parentNode !== document.body) {
            document.body.appendChild(bar);
        }

        if (!bar.dataset.bound) {
            bar.dataset.bound = 'true';
            bar.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button || !bar.contains(button)) return;
                event.preventDefault();
                event.stopPropagation();
                if (button.id === 'glass-panel-reset') {
                    if (isUtilityPanelMotionLocked()) return;
                    blurGlassControlFocusIfNeeded();
                    resetPanels();
                }
            });
        }
        updateSettingsToggleLabel();
        updateSettingsToggleLabelTest();
        syncUtilityMotionLockControls();
    }

    function ensureSettingsPanel() {
        const existingPanels = Array.from(document.querySelectorAll(`#${SETTINGS_PANEL_ID}`));
        existingPanels.forEach((node) => node.remove());
    }

    function ensureSettingsPanelTest() {
        const controlBar = document.getElementById('glass-control-bar');
        if (!controlBar) return;

        CURSOR_PANEL_REGISTRY.forEach((panel) => {
            if (panel.id === CURSOR_PANEL_1_ID || panel.id === CURSOR_PANEL_2_ID) return;
            let el = document.getElementById(panel.id);
            if (!el) {
                el = document.createElement('div');
                el.id = panel.id;
                el.className = 'glass-settings-panel ui-container';
            }
            if (el.parentNode !== document.body) {
                document.body.appendChild(el);
            }
        });
        const displayPanel = document.getElementById(CURSOR_PANEL_5_ID);
        if (displayPanel) {
            displayPanel.innerHTML = `
                <div class="ui-header">
                <span>4表示</span>
                </div>
                <div class="ui-content">
                    <div class="glass-settings-list" role="group" aria-label="Glass UI 4表示"></div>
                </div>
            `;
            displayPanel.classList.add('collapsed');
            displayPanel.hidden = true;
            displayPanel.style.display = 'none';
        }
        if (window.CanvasResizer && typeof window.CanvasResizer.initialize === 'function') {
            window.CanvasResizer.initialize();
        }
        if (window.Color && typeof window.Color.createColorGroup === 'function') {
            window.Color.createColorGroup(CURSOR_PANEL_3_ID);
            const colorHeader = document.querySelector(`#${CURSOR_PANEL_3_ID} .ui-header`);
            if (colorHeader) colorHeader.textContent = '1.配色';
        }
        if (window.Slider && typeof window.Slider.createSliders === 'function') {
            window.Slider.createSliders(CURSOR_PANEL_4_ID);
            const sliderHeader = document.querySelector(`#${CURSOR_PANEL_4_ID} .ui-header`);
            if (sliderHeader) sliderHeader.textContent = '2.点';
        }
        [CURSOR_PANEL_3_ID, CURSOR_PANEL_4_ID].forEach((id, index) => {
            const panel = document.getElementById(id);
            if (!panel) return;
            bindSettingsPanel(panel, {
                closeSelector: null,
                togglePanel: () => togglePanelCollapsed(panel),
                persistScale: false,
                boundKey: `glassPanelBound${index + 3}`,
                sliderSelector: null,
                valueSelector: null
            });
            setPanelHeaderOnlyVisible(id, true);
        });
        const cursorPanel = document.getElementById(CURSOR_PANEL_6_ID);
        if (window.CursorUI && typeof window.CursorUI.createCursorSliders === 'function' && cursorPanel) {
            window.CursorUI.createCursorSliders(CURSOR_PANEL_6_ID, {
                title: '3.カーソル',
                idPrefix: 'cursor-panel-6-',
                showCloseButton: false
            });
        }
        if (cursorPanel) {
            bindSettingsPanel(cursorPanel, {
                closeSelector: null,
                togglePanel: () => togglePanelCollapsed(cursorPanel),
                persistScale: false,
                boundKey: 'glassCursorPanelBound6',
                sliderSelector: null,
                valueSelector: null
            });
            setPanelHeaderOnlyVisible(CURSOR_PANEL_6_ID, true);
        }
        const spatialPanel = document.getElementById(CURSOR_PANEL_7_ID);
        if (spatialPanel && window.SpatialPlaneView && typeof window.SpatialPlaneView.populatePanel === 'function') {
            window.SpatialPlaneView.populatePanel(CURSOR_PANEL_7_ID);
            bindSettingsPanel(spatialPanel, {
                closeSelector: null,
                togglePanel: () => togglePanelCollapsed(spatialPanel),
                persistScale: false,
                boundKey: 'glassSpatialPanelBound7',
                sliderSelector: null,
                valueSelector: null
            });
            setPanelHeaderOnlyVisible(CURSOR_PANEL_7_ID, true);
        }
        const displayPanelTest = document.getElementById(CURSOR_PANEL_5_ID);
        if (displayPanelTest) {
            displayPanelTest.classList.add('glass-settings-panel');
            const extraActionGroups = displayPanelTest.querySelectorAll('.glass-settings-actions');
            extraActionGroups.forEach((node, index) => {
                if (index > 0) node.remove();
            });
            const extraScaleGroups = displayPanelTest.querySelectorAll('.glass-canvas-scale-group');
            extraScaleGroups.forEach((node, index) => {
                if (index > 0) node.remove();
            });
            bindSettingsPanel(displayPanelTest, {
                closeSelector: `.${SETTINGS_CLOSE_TEST_CLASS}`,
                togglePanel: (forceOpen) => {
                    if (window.UIState && typeof window.UIState.toggleContainer === 'function') {
                        window.UIState.toggleContainer(displayPanelTest);
                        return;
                    }
                    togglePanelCollapsed(displayPanelTest, forceOpen);
                },
                persistScale: false,
                boundKey: 'glassDisplayPanelBound',
                sliderSelector: null,
                valueSelector: null
            });
            setPanelHeaderOnlyVisible(CURSOR_PANEL_5_ID, true);
            togglePanelCollapsed(displayPanelTest, true);
        }
        const stylePanel = document.getElementById('ui-variant-panel');
        if (stylePanel) {
            stylePanel.classList.remove('collapsed');
            stylePanel.hidden = false;
            stylePanel.style.display = '';
            stylePanel.removeAttribute('hidden');
        }
        const presetPanel = document.getElementById('ui-preset-panel');
        if (presetPanel) {
            presetPanel.hidden = false;
            presetPanel.style.display = '';
            presetPanel.removeAttribute('hidden');
        }
        syncCursorPanelsState(true, { preserveCollapsedDuringStartup: true });
    }

    function moveContent(sourceId, targetId) {
        const source = document.getElementById(sourceId);
        const target = document.getElementById(targetId);
        const sourceContent = source?.querySelector('.ui-content');
        const targetContent = target?.querySelector('.ui-content');
        if (!source || !target || !sourceContent || !targetContent) return;
        while (sourceContent.firstChild) {
            targetContent.appendChild(sourceContent.firstChild);
        }
    }

    function migrateGlassPanelContents() {
        moveContent('cursor-container', CURSOR_PANEL_6_ID);

        ['canvas-size-container', 'button-container', 'color-container', 'slider-container', 'cursor-container'].forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.hidden = true;
            el.style.display = 'none';
            el.classList.add('glass-forced-hidden');
            el.setAttribute('aria-hidden', 'true');
        });
    }

    function scheduleGlassPanelMigration(attempt = 0) {
        setTimeout(() => {
            migrateGlassPanelContents();
            const targetsReady = [
                CURSOR_PANEL_3_ID,
                CURSOR_PANEL_4_ID,
                CURSOR_PANEL_5_ID,
                CURSOR_PANEL_6_ID,
                CURSOR_PANEL_7_ID
            ].every((id) => {
                const el = document.getElementById(id);
                return el && el.querySelector('.ui-content') && el.querySelector('.ui-content').children.length > 0;
            });
            if (!targetsReady && attempt < 20) {
                scheduleGlassPanelMigration(attempt + 1);
            }
        }, attempt === 0 ? 0 : 250);
    }

    function togglePanelCollapsed(panel, forceOpen) {
        if (!panel) return;
        const collapsed = typeof forceOpen === 'boolean' ? !forceOpen : !panel.classList.contains('collapsed');
        const header = panel.querySelector('.ui-header');
        if (header) {
            header.setAttribute('aria-expanded', String(!collapsed));
            header.setAttribute('data-ui-state', collapsed ? 'closed' : 'open');
        }
        if (!collapsed && isDockManagedPanelId(panel.id)) {
            const orderHint = loadDockedPanelOrder();
            const overrides = {};
            overrides[panel.id] = measurePanelExpandedHeight(panel);
            logDockOpenLayoutTrace(panel, 'pre-open', orderHint, overrides);
            arrangeDockedPanels(orderHint, overrides);
            setPanelCollapsedAnimated(panel, collapsed, 140, orderHint, overrides);
            setTimeout(() => {
                logDockOpenLayoutTrace(panel, 'after-open', orderHint, overrides);
            }, PANEL_VISIBILITY_ANIMATION_MS + 32);
            return;
        }
        setPanelCollapsedAnimated(panel, collapsed);
        if (isDockManagedPanelId(panel.id)) {
            setTimeout(() => {
                realignDockedPanelsMeasured('togglePanelCollapsed');
            }, PANEL_VISIBILITY_ANIMATION_MS + 40);
        }
    }

    function setPanelHeaderOnlyVisible(panelId, visible) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        if (panelId === CURSOR_PANEL_HIDDEN_ID) visible = false;
        panel.classList.add('collapsed');
        panel.hidden = !visible;
        panel.style.display = visible ? '' : 'none';
        panel.style.visibility = visible ? '' : 'hidden';
        panel.classList.toggle('glass-forced-hidden', !visible);
        panel.classList.toggle('is-hidden', !visible);
        if (!visible) {
            panel.setAttribute('aria-hidden', 'true');
        } else {
            panel.removeAttribute('aria-hidden');
        }
        const header = panel.querySelector('.ui-header');
        if (header) {
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('data-ui-state', 'closed');
        }
    }

    function togglePanelFromBottomButton(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const visible = isPanelVisible(panel);
        if (visible) {
            if (isDockManagedPanelId(panelId)) {
                hideIndividualDockedPanel(panel);
                return;
            }
            setPanelVisibleAnimated(panel, false);
            if (typeof saveVisibilityFromDom === 'function') {
                saveVisibilityFromDom();
            }
            return;
        }

        const isDockPanel = isDockManagedPanelId(panelId);
        if (panelId === 'case-comparison') {
            showCaseComparisonFromBottomButton(panel);
            scheduleArrangeDockedPanels();
            if (typeof saveVisibilityFromDom === 'function') {
                const state = getVisibilityState();
                state['case-comparison'] = true;
                saveVisibilityState(state);
            }
            return;
        } else if (isDockPanel) {
            clearDockHideTimer(panel);
            if (panelId === CURSOR_PANEL_5_ID) {
                setPanelVisibleAnimated(panel, true, false);
                clearPanel5PlacementTimer(panel);
                placePanel5BottomLeftSafely(panel, 'panel5-show-immediate');
                requestAnimationFrame(() => {
                    placePanel5BottomLeftSafely(panel, 'panel5-show-raf1');
                    requestAnimationFrame(() => {
                        placePanel5BottomLeftSafely(panel, 'panel5-show-raf2');
                    });
                });
                const timer = setTimeout(() => {
                    panel5PlacementTimers.delete(panel);
                    placePanel5BottomLeftSafely(panel, 'panel5-show-final');
                }, PANEL_VISIBILITY_ANIMATION_MS + 40);
                panel5PlacementTimers.set(panel, timer);
                if (typeof saveVisibilityFromDom === 'function') {
                    saveVisibilityFromDom();
                }
                return;
            }
            showIndividualDockedPanel(panel);
            return;
        } else {
            setPanelVisibleAnimated(panel, true, false);
            if (typeof saveVisibilityFromDom === 'function') {
                saveVisibilityFromDom();
            }
            return;
        }
    }

    function ensurePresetDetails(panel) {
        if (!panel) return;
        const activeTheme = getActiveThemeId();
        if (panel.dataset.presetThemeBuilt === activeTheme) return;
        panel.dataset.presetThemeBuilt = activeTheme;
        panel.dataset.glassPresetBuilt = 'true';
        const activePresetDefs = getActivePresetParamDefs();
        const presetDefsByKey = new Map(activePresetDefs.map((def) => [def.key, def]));
        const renderPresetControl = (def) => {
            const value = getPresetValue(def, getPresetValuesForSelection(getCurrentPreset()));
            const inputType = def.type === 'color' ? 'color' : (def.type === 'toggle' ? 'checkbox' : def.type === 'direction' || def.type === 'surfaceShape' ? 'hidden' : 'range');
            const directionButtons = def.type === 'direction'
                ? `<div class="neumo-light-direction-group" role="group" aria-label="${def.label}">${NEUMO_LIGHT_DIRECTION_OPTIONS.map((item) => `<button type="button" class="neumo-light-direction-button${item.value === value ? ' is-active' : ''}" data-neumo-light-direction="${item.value}" aria-pressed="${item.value === value}">${item.label}</button>`).join('')}</div>`
                : '';
            const surfaceShapeButtons = def.type === 'surfaceShape'
                ? `<div class="neumo-surface-shape-group" role="group" aria-label="${def.label}">${[
                    ['flat', '平面'],
                    ['concave', '凹面'],
                    ['convex', '凸面'],
                    ['pressed', '押込面']
                ].map(([shape, label]) => `<button type="button" class="neumo-surface-shape-button${shape === value ? ' is-active' : ''}" data-neumo-panel-surface-shape="${shape}" aria-pressed="${shape === value}">${label}</button>`).join('')}</div>`
                : '';
            return `
                <div class="glass-preset-row${def.type === 'color' ? ' glass-preset-row-color' : ''}${def.type === 'direction' ? ' glass-preset-row-direction' : ''}${def.type === 'toggle' ? ' glass-preset-row-toggle' : ''}">
                    <label class="glass-preset-label" for="glass-param-${def.key}"${def.title ? ` title="${def.title}"` : ''}>${def.label}</label>
                    <input id="glass-param-${def.key}" type="${inputType}" class="${def.type === 'toggle' ? 'cursor-toggle-checkbox' : ''}" data-glass-param="${def.key}"${def.title ? ` title="${def.title}"` : ''}${def.type === 'color' || def.type === 'direction' || def.type === 'surfaceShape' ? ` value="${value}"` : def.type === 'toggle' ? `${value ? ' checked' : ''}` : ` min="${def.min}" max="${def.max}" step="${def.step}" value="${value}"`}>
                    ${directionButtons}
                    ${surfaceShapeButtons}
                    <span class="glass-preset-value${def.type === 'range' ? ' neumo-text-lighting-target' : ''}">${formatPresetValue(def, value)}</span>
                </div>
            `;
        };
        /* Neumorphism の整理済み行配置は Neumorphism のみで使う。
           Glass まで同じキー配列で描画すると Glass 専用パラメータが消えるため、Glass は従来の全定義表示を維持する。 */
        const rowsMarkup = activeTheme === 'neumorphism'
            ? `
                <div class="neumo-control-grid">
                    <div class="neumo-slider-column">
                        ${NEUMORPHISM_PRESET_LAYOUT.sliders.map((key) => renderPresetControl(presetDefsByKey.get(key))).join('')}
                    </div>
                    <div class="neumo-toggle-column">
                        ${NEUMORPHISM_PRESET_LAYOUT.toggles.map((key) => renderPresetControl(presetDefsByKey.get(key))).join('')}
                        ${NEUMORPHISM_PRESET_LAYOUT.rightSliders.map((key) => `<div class="neumo-right-slider-row">${renderPresetControl(presetDefsByKey.get(key))}</div>`).join('')}
                    </div>
                </div>
                <div class="neumo-color-row">
                    ${NEUMORPHISM_PRESET_LAYOUT.colors.map((key) => renderPresetControl(presetDefsByKey.get(key))).join('')}
                </div>
                <div class="neumo-shape-row">
                    ${renderPresetControl(presetDefsByKey.get(NEUMORPHISM_PRESET_LAYOUT.surface))}
                </div>
                <div class="neumo-direction-row">
                    ${renderPresetControl(presetDefsByKey.get(NEUMORPHISM_PRESET_LAYOUT.direction))}
                </div>
            `
            : (() => {
                const presetDefsByCategory = new Map(getActivePresetCategories().map((category) => [category, []]));
                activePresetDefs.forEach((def) => {
                    if (!presetDefsByCategory.has(def.category)) presetDefsByCategory.set(def.category, []);
                    presetDefsByCategory.get(def.category).push(def);
                });
                return getActivePresetCategories().map((category) => {
                    const defs = presetDefsByCategory.get(category) || [];
                    return `<div class="glass-preset-category-header"></div>${defs.map(renderPresetControl).join('')}`;
                }).join('');
            })();
        panel.innerHTML = `
            <div class="glass-preset-header-row">
                <button type="button" class="glass-preset-details-toggle" data-glass-preset-toggle aria-label="テーマ詳細">▶</button>
                <select id="ui-preset-select" aria-label="テーマ preset"></select>
                <span class="glass-preset-selected-lock" aria-hidden="true" hidden>🔒</span>
            </div>
            <div class="glass-preset-details" data-glass-preset-details hidden>
                <div class="glass-preset-rows">
                    ${rowsMarkup}
                </div>
                <div class="glass-preset-status" aria-live="polite"></div>
                <div class="glass-preset-actions">
                    <button type="button" class="glass-preset-dup">複製</button>
                    <button type="button" class="glass-preset-new">新規</button>
                    <button type="button" class="glass-preset-rename">名前変更</button>
                    <button type="button" class="glass-preset-delete">削除</button>
                    <button type="button" class="glass-preset-export">export</button>
                    <button type="button" class="glass-preset-import">import</button>
                    <button type="button" class="glass-preset-save">保存</button>
                    <button type="button" class="glass-preset-edit-lock-toggle" aria-pressed="false" title="編集ロックを設定">🔒</button>
                </div>
                <input type="file" class="glass-preset-import-input" accept="application/json,.json" hidden>
            </div>
        `;

        const toggle = panel.querySelector('[data-glass-preset-toggle]');
        const details = panel.querySelector('[data-glass-preset-details]');
        const select = panel.querySelector('#ui-preset-select');
        const dupButton = panel.querySelector('.glass-preset-dup');
        const newButton = panel.querySelector('.glass-preset-new');
        const renameButton = panel.querySelector('.glass-preset-rename');
        const deleteButton = panel.querySelector('.glass-preset-delete');
        const exportButton = panel.querySelector('.glass-preset-export');
        const importButton = panel.querySelector('.glass-preset-import');
        const importInput = panel.querySelector('.glass-preset-import-input');
        const saveButton = panel.querySelector('.glass-preset-save');
        const lockButton = panel.querySelector('.glass-preset-edit-lock-toggle');
        const status = panel.querySelector('.glass-preset-status');
        [exportButton, importButton, saveButton].forEach(markPublicDemoDisabledButton);
        if (importInput && PUBLIC_DEMO_DISABLE_EXPORT_IMPORT) {
            importInput.disabled = true;
            importInput.setAttribute('aria-disabled', 'true');
        }

        toggle?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const open = Boolean(details?.hidden);
            setPresetDetailsOpen(panel, open);
        });

	        const onSelectChange = () => handlePresetSelectChange(panel, select);
	        select?.addEventListener('change', onSelectChange);
	        select?.addEventListener('input', onSelectChange);

	        panel.addEventListener('click', (event) => {
	            const directionButton = event.target.closest('[data-neumo-light-direction]');
	            if (!directionButton || !panel.contains(directionButton)) return;
	            event.preventDefault();
	            event.stopPropagation();
	            const input = panel.querySelector('input[data-glass-param="neumoLightDirection"]');
	            if (!input) return;
	            input.value = normalizeNeumoLightDirection(directionButton.getAttribute('data-neumo-light-direction'));
	            input.dispatchEvent(new Event('input', { bubbles: true }));
	        });

	        panel.addEventListener('click', (event) => {
	            const shapeButton = event.target.closest('[data-neumo-panel-surface-shape]');
	            if (!shapeButton || !panel.contains(shapeButton)) return;
	            event.preventDefault();
	            event.stopPropagation();
	            const input = panel.querySelector('input[data-glass-param="neumoPanelSurfaceShape"]');
	            if (!input) return;
	            const shapeValue = normalizeNeumoPanelSurfaceShape(shapeButton.getAttribute('data-neumo-panel-surface-shape'));
	            input.value = shapeValue;
	            input.setAttribute('value', shapeValue);
	            currentPresetValues = currentPresetValues ? { ...currentPresetValues, neumoPanelSurfaceShape: shapeValue } : { neumoPanelSurfaceShape: shapeValue };
	            document.body.dataset.neumoPanelShape = shapeValue;
	            if (isNeumorphismTheme()) setNeumorphismCssVars(currentPresetValues);
	            input.dispatchEvent(new Event('input', { bubbles: true }));
	        });

	        panel.oninput = (event) => {
	            const input = event.target.closest('input[data-glass-param]');
	            if (!input) return;
	            const key = input.getAttribute('data-glass-param');
	            const def = getActivePresetParamDefs().find((item) => item.key === key);
	            if (!def) return;
	            const value = def.type === 'color'
	                ? normalizeHexColor(input.value)
	                : def.type === 'toggle'
	                    ? Boolean(input.checked)
	                    : def.type === 'direction'
	                        ? normalizeNeumoLightDirection(input.value)
	                        : def.type === 'surfaceShape'
	                            ? normalizeNeumoPanelSurfaceShape(input.value)
	                        : normalizePresetNumericValue(def, input.value);
	            if ((def.type === 'toggle' && (key === 'followCanvasBackground' || key === 'materialFollowSurface' || key === 'neumoTextLighting')) || key === 'neumoLightDirection' || key === 'neumoPanelSurfaceShape') {
	                const saved = saveSelectedNeumorphismImmediateValue(key, value);
	                if (!saved) return;
	                currentPresetValues = currentPresetValues ? { ...currentPresetValues, [key]: value } : { [key]: value };
	                syncNeumorphismImmediateControls(panel, currentPresetValues);
	                syncNeumorphismBackgroundSurface();
	                return;
	            }
            const row = input.closest('.glass-preset-row');
            const output = row?.querySelector('.glass-preset-value');
            if (output) output.textContent = formatPresetValue(def, value);
            const nextValues = currentPresetValues ? { ...currentPresetValues } : readValuesFromPanel(panel);
            nextValues[key] = value;
            syncPresetValues(panel, nextValues);
        };

        dupButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            duplicateCurrentPreset(panel);
        });

        newButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            createNewPreset(panel);
        });

        renameButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            renameCurrentPreset(panel);
        });

        deleteButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            deleteCurrentPreset(panel);
        });

        exportButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (blockPublicDemoDisabledAction(event)) return;
            downloadPresetSnapshot(getExportedPresetSnapshot());
        });

        importButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (blockPublicDemoDisabledAction(event)) return;
            importInput?.click();
        });

        importInput?.addEventListener('change', async () => {
            if (PUBLIC_DEMO_DISABLE_EXPORT_IMPORT) {
                importInput.value = '';
                return;
            }
            const file = importInput.files?.[0];
            importInput.value = '';
            await importPresetSnapshotFromFile(file, panel);
        });

        saveButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (blockPublicDemoDisabledAction(event)) return;
            if (isProtectedPresetSelection()) return;
            const values = currentPresetValues ? { ...currentPresetValues } : readValuesFromPanel(panel);
            const tunerSnapshotBeforeSave = getUiSizeTunerSnapshotForPresetExport();
            const selectedBeforeSave = getSelectedPresetValue();
            const saved = savePresetValues(values);
            if (!saved) return;
            syncPresetValues(panel, values);
            if (isCustomPresetValue(selectedBeforeSave)) setPresetSelection(selectedBeforeSave);
            applyPresetUI(panel);
            applyUiSizeTunerSnapshotFromPresetImport(tunerSnapshotBeforeSave);
            if (status) {
                status.textContent = '保存しました';
                status.classList.add('is-visible');
                clearTimeout(status._timer);
                status._timer = setTimeout(() => {
                    status.classList.remove('is-visible');
                    status.textContent = '';
                }, 1200);
            }
        });

        lockButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const selected = getSelectedPresetValue();
            if (!isCustomPresetValue(selected)) return;
            const nextLocked = !isPresetEditLocked(selected);
            if (!setPresetEditLocked(selected, nextLocked)) return;
            applyPresetUI(panel);
        });

        applyPresetUI(panel);
    }

    function isolateStylePresetPanel() {
        const panel = document.getElementById('ui-variant-panel');
        if (!panel) return;
        panel.style.removeProperty('filter');
        panel.style.removeProperty('backdrop-filter');
        panel.style.removeProperty('-webkit-backdrop-filter');
        panel.style.removeProperty('mix-blend-mode');
        const presetPanel = document.getElementById('ui-preset-panel');
        if (presetPanel) {
            presetPanel.style.setProperty('border', 'none', 'important');
            presetPanel.style.setProperty('border-width', '0', 'important');
            presetPanel.style.setProperty('border-style', 'none', 'important');
            presetPanel.style.setProperty('border-color', 'transparent', 'important');
            presetPanel.style.setProperty('outline', '0', 'important');
            // TRANSPARENT REGION CONTRACT:
            // #ui-preset-panel は配置用の透明層であり、面色・影を直接与えてはいけない。
            // Glass / Neumorphism とも、色は外側の物理パネルと実操作部品だけに反映する。
            // ここを塗るとパラメータ欄全体が余計な板状面として見えるため禁止。
            presetPanel.style.setProperty('background', 'transparent', 'important');
            presetPanel.style.setProperty('background-color', 'transparent', 'important');
            presetPanel.style.setProperty('background-image', 'none', 'important');
            presetPanel.style.removeProperty('box-shadow');
            presetPanel.style.setProperty('backdrop-filter', 'none', 'important');
            presetPanel.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            presetPanel.style.setProperty('filter', 'none', 'important');
            presetPanel.querySelectorAll('.glass-preset-details, .glass-preset-rows, .glass-preset-actions, .glass-preset-header-row, .glass-preset-details-toggle, .glass-preset-save, .glass-preset-dup, .glass-preset-new, .glass-preset-rename, .glass-preset-delete, .glass-preset-export, .glass-preset-import').forEach((el) => {
                el.style.setProperty('border-color', 'var(--glass-edge-color-rgba, rgba(255, 255, 255, 0.28))', 'important');
                el.style.setProperty('outline', '0', 'important');
                if (el.matches('.glass-preset-details, .glass-preset-rows, .glass-preset-actions, .glass-preset-header-row, .glass-preset-details-toggle')) {
                    el.style.setProperty('box-shadow', 'none', 'important');
                    el.style.setProperty('background', 'transparent', 'important');
                    el.style.setProperty('background-color', 'transparent', 'important');
                    el.style.setProperty('background-image', 'none', 'important');
                } else {
                    // 実操作ボタンは透明構造ではないため、選択テーマの操作面色のみを許可する。
                    el.style.setProperty(
                        'background',
                        isNeumorphismTheme()
                            ? 'var(--neumo-base-raised, rgb(229, 234, 238))'
                            : 'var(--glass-surface-rgba, rgba(248, 251, 255, 0.18))',
                        'important'
                    );
                    if (isNeumorphismTheme()) {
                        el.style.removeProperty('box-shadow');
                    } else {
                        el.style.setProperty('box-shadow', 'none', 'important');
                    }
                }
            });
            presetPanel.querySelectorAll('.glass-preset-save, .glass-preset-dup, .glass-preset-new, .glass-preset-rename, .glass-preset-delete, .glass-preset-export, .glass-preset-import').forEach((el) => {
                el.style.setProperty('border', '1px solid rgba(230, 230, 230, 0.42)', 'important');
            });
        }
    }

    function getUtilityMotionLockButtons() {
        return Array.from(document.querySelectorAll([
            '.glass-panel-quick-toggle-button[data-action="toggle-utility-openclose"]',
            '#glass-panel-reset'
        ].join(','))).filter(Boolean);
    }

    function syncUtilityMotionLockControls() {
        const locked = isUtilityPanelMotionLocked();
        getUtilityMotionLockButtons().forEach((button) => {
            button.disabled = locked;
            button.classList.toggle('is-motion-locked', locked);
            button.setAttribute('aria-disabled', String(locked));
            if (locked) {
                button.dataset.motionLockReason = utilityPanelMotionLockReason || 'panel-motion';
            } else {
                delete button.dataset.motionLockReason;
            }
        });
        document.body?.classList?.toggle('uiux-panel-motion-locked', locked);
    }

    function isUtilityPanelMotionLocked() {
        if (!utilityPanelMotionLockUntil) return false;
        if (performance.now() <= utilityPanelMotionLockUntil) return true;
        utilityPanelMotionLockUntil = 0;
        utilityPanelMotionLockReason = '';
        if (utilityPanelMotionLockTimer) {
            clearTimeout(utilityPanelMotionLockTimer);
            utilityPanelMotionLockTimer = 0;
        }
        syncUtilityMotionLockControls();
        return false;
    }

    function releaseUtilityPanelMotionLock(reason = 'release') {
        if (utilityPanelMotionLockTimer) {
            clearTimeout(utilityPanelMotionLockTimer);
            utilityPanelMotionLockTimer = 0;
        }
        utilityPanelMotionLockUntil = 0;
        utilityPanelMotionLockReason = '';
        syncUtilityMotionLockControls();
        layoutDebugLog('[utility-motion-lock]', 'release', { reason });
    }

    function acquireUtilityPanelMotionLock(reason, durationMs) {
        if (isUtilityPanelMotionLocked()) {
            layoutDebugLog('[utility-motion-lock]', 'blocked', {
                reason,
                activeReason: utilityPanelMotionLockReason,
                remainingMs: Math.max(0, utilityPanelMotionLockUntil - performance.now())
            });
            return false;
        }
        const duration = Math.max(120, Number(durationMs) || PANEL_VISIBILITY_ANIMATION_MS);
        utilityPanelMotionLockReason = reason || 'panel-motion';
        utilityPanelMotionLockUntil = performance.now() + duration + MOTION_LOCK_RELEASE_BUFFER_MS;
        if (utilityPanelMotionLockTimer) clearTimeout(utilityPanelMotionLockTimer);
        utilityPanelMotionLockTimer = setTimeout(() => {
            releaseUtilityPanelMotionLock(`${reason || 'panel-motion'}:timer`);
        }, duration + MOTION_LOCK_RELEASE_BUFFER_MS);
        syncUtilityMotionLockControls();
        layoutDebugLog('[utility-motion-lock]', 'acquire', {
            reason: utilityPanelMotionLockReason,
            durationMs: duration
        });
        return true;
    }

    function toggleSettingsPanel(forceOpen) {
        const panel = document.getElementById(SETTINGS_PANEL_ID);
        if (!panel) return;
        if (window.UIState && typeof window.UIState.toggleContainer === 'function') {
            window.UIState.toggleContainer(panel);
        } else {
            togglePanelCollapsed(panel, forceOpen);
        }
        updateSettingsToggleLabel();
    }

    function toggleSettingsPanelTest(forceOpen) {
        toggleCursorPanels(forceOpen);
    }

    function getCursorPanels() {
        return [
            CURSOR_PANEL_1_ID,
            CURSOR_PANEL_2_ID,
            CURSOR_PANEL_3_ID,
            CURSOR_PANEL_4_ID,
            CURSOR_PANEL_6_ID,
            CURSOR_PANEL_7_ID
        ]
            .map((id) => document.getElementById(id))
            .filter(Boolean);
    }

    function setDockedCursorPanelsClosedBatch(dockedPanels, orderHint = loadDockedPanelOrder()) {
        const panels = (Array.isArray(dockedPanels) ? dockedPanels : [])
            .filter((panel) => panel && isDockManagedPanelId(panel.id));
        if (!panels.length) return false;

        const resolvedOrderHint = normalizeDockedPanelOrder(
            Array.isArray(orderHint) && orderHint.length ? orderHint : getCursorDockOrderHint()
        );
        const heightOverrides = {};

        panels.forEach((panel) => {
            clearPanelCollapseTimer(panel);
            panel.hidden = false;
            panel.style.display = '';
            panel.style.visibility = '';
            panel.classList.add('collapsed');
            panel.classList.remove('glass-panel-collapse-animating');
            const content = panel.querySelector('.ui-content');
            if (content) {
                content.classList.remove('glass-panel-content-open');
                content.classList.add('glass-panel-content-closing');
                content.style.removeProperty('max-height');
                content.style.removeProperty('overflow');
                content.style.removeProperty('opacity');
                content.style.removeProperty('transform');
                content.style.removeProperty('will-change');
            }
            const header = panel.querySelector('.ui-header');
            if (header) {
                header.setAttribute('aria-expanded', 'false');
                header.setAttribute('data-ui-state', 'closed');
            }
            clearNumberedDockContentTransform(panel);
            heightOverrides[panel.id] = measurePanelCollapsedHeight(panel);
        });

        dockArrangeSequence += 1;
        arrangeDockedPanels(resolvedOrderHint, heightOverrides, {
            animate: false,
            force: true,
            sequence: dockArrangeSequence,
            skipMoveTransition: true
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ order: resolvedOrderHint }));
        cursorDockResetOrderHintCache = resolvedOrderHint.slice();
        cursorDockResetOrderHintDirty = false;
        return true;
    }

    function setCursorPanelOpen(panel, isOpen) {
        if (!panel) return;
        panel.hidden = false;
        if (isOpen && isDockManagedPanelId(panel.id)) {
            const orderHint = loadDockedPanelOrder();
            const overrides = {};
            overrides[panel.id] = measurePanelExpandedHeight(panel);
            logDockOpenLayoutTrace(panel, 'pre-open', orderHint, overrides);
            arrangeDockedPanels(orderHint, overrides);
            setPanelCollapsedAnimated(panel, false, 140, orderHint, overrides);
            const postOpenDelay = PANEL_VISIBILITY_ANIMATION_MS + 32;
            setTimeout(() => {
                logDockOpenLayoutTrace(panel, 'after-open', orderHint, overrides);
                const placement = clampDockPanelAboveButtons(panel, {
                    left: Number.parseFloat(panel.style.left) || panel.getBoundingClientRect().left,
                    top: Number.parseFloat(panel.style.top) || panel.getBoundingClientRect().top
                }, 'after-open-toggle');
                finalizeDockPanelPlacement(panel, placement.left, placement.top);
                realignDockedPanelsMeasured('togglePanelCollapsed-open');
            }, postOpenDelay);
        } else {
            setPanelCollapsedAnimated(panel, !isOpen);
        }
        const header = panel.querySelector('.ui-header');
        if (header) {
            header.setAttribute('aria-expanded', String(isOpen));
            header.setAttribute('data-ui-state', isOpen ? 'open' : 'closed');
        }
        if (isDockManagedPanelId(panel.id) && panel.id !== CURSOR_PANEL_HIDDEN_ID && !isOpen) {
            setTimeout(() => {
                realignDockedPanelsMeasured('setCursorPanelOpen');
            }, PANEL_VISIBILITY_ANIMATION_MS + 40);
        }
    }

    function setUtilityCursorPanelOpen(panel, isOpen) {
        if (!panel) return;
        if (panel.id === 'case-comparison') {
            setCaseComparisonOpenAnimated(isOpen, 'set-utility');
            return;
        }
        if (panel.id === 'ui-variant-panel') {
            panel.hidden = false;
            panel.style.display = '';
            panel.style.visibility = '';
            panel.classList.remove('glass-panel-dragging');
            const presetPanel = document.getElementById('ui-preset-panel');
            if (!presetPanel) return;
            const details = presetPanel.querySelector('[data-glass-preset-details]');
            const toggle = presetPanel.querySelector('[data-glass-preset-toggle]');
            if (typeof setPresetDetailsOpen === 'function') {
                const currentOpen = details ? !details.hidden : toggle?.getAttribute('aria-expanded') === 'true';
                if (currentOpen !== isOpen) {
                    setPresetDetailsOpen(presetPanel, isOpen);
                }
                return;
            }
            const currentOpen = details ? !details.hidden : toggle?.getAttribute('aria-expanded') === 'true';
            if (currentOpen === isOpen) return;
            setPresetDetailsOpen(presetPanel, isOpen);
        }
    }

    function syncCursorPanelsState(isOpen, options = {}) {
        const button = document.getElementById(SETTINGS_TOGGLE_TEST_ID);
        const preserveCollapsedDuringStartup = options?.preserveCollapsedDuringStartup === true;
        const skipDockedPanels = options?.skipDockedPanels === true;
        const panels = getCursorPanels();
        panels.forEach((panel) => {
            if (skipDockedPanels && isDockManagedPanelId(panel?.id)) {
                return;
            }
            if (preserveCollapsedDuringStartup && isDockManagedPanelId(panel?.id) && panel.classList.contains('collapsed')) {
                return;
            }
            setCursorPanelOpen(panel, isOpen);
        });
        if (preserveCollapsedDuringStartup) {
            const resolvedOrderHint = getCanonicalDockedPanelOrder();
            const dockLayoutState = getCursorDockLayoutState(resolvedOrderHint);
            if (dockLayoutState?.layout?.length) {
                arrangeDockedPanels(resolvedOrderHint, dockLayoutState.heightOverrides, { animate: false });
            }
        }
        if (button) {
            button.textContent = isOpen ? 'カーソル設定を閉じる' : 'カーソル設定を開く';
            button.setAttribute('aria-expanded', String(isOpen));
        }
    }

    function toggleCursorPanels(forceOpen) {
        const panels = getCursorPanels();
        const caseComparison = document.getElementById('case-comparison');
        const presetPanel = document.getElementById('ui-preset-panel');
        const presetDetails = presetPanel?.querySelector('[data-glass-preset-details]');
        const presetToggle = presetPanel?.querySelector('[data-glass-preset-toggle]');
        const utilityPanels = [caseComparison].filter(Boolean);
        if (!panels.length && !utilityPanels.length && !presetPanel) return;
        const presetOpen = presetDetails ? !presetDetails.hidden : presetToggle?.getAttribute('aria-expanded') === 'true';
        const isOpen = typeof forceOpen === 'boolean'
            ? forceOpen
            : panels.some((panel) => panel.classList.contains('collapsed'))
                || !!caseComparison?.classList.contains('collapsed')
                || !presetOpen;
        const lockDuration = isOpen ? C_TOGGLE_OPEN_LOCK_MS : C_TOGGLE_CLOSE_LOCK_MS;
        if (!acquireUtilityPanelMotionLock('c-toggle', lockDuration)) return false;
        const hasClosedPanels = isOpen && panels.some((panel) => panel.classList.contains('collapsed'));
        if (isOpen) {
            const closedPanels = panels.filter((panel) => panel.classList.contains('collapsed'));
            if (closedPanels.length) {
                const orderHint = getCanonicalDockedPanelOrder();
                const heightOverrides = {};
                panels.forEach((panel) => {
                    if (closedPanels.includes(panel)) {
                        heightOverrides[panel.id] = measurePanelExpandedHeight(panel);
                        return;
                    }
                    const rect = panel.getBoundingClientRect();
                    heightOverrides[panel.id] = rect.height;
                });
                closedPanels.forEach((panel) => {
                    logDockOpenLayoutTrace(panel, 'pre-open', orderHint, heightOverrides);
                });
                arrangeDockedPanels(orderHint, heightOverrides);
                const openDelayMs = 360;
                closedPanels.forEach((panel, index) => {
                    setPanelCollapsedAnimated(panel, false, openDelayMs + (index * 16), orderHint, heightOverrides);
                });
                closedPanels.forEach((panel, index) => {
                    setTimeout(() => {
                        logDockOpenLayoutTrace(panel, 'after-open', orderHint, heightOverrides);
                    }, openDelayMs + PANEL_VISIBILITY_ANIMATION_MS + 32 + (index * 16));
                });
                setTimeout(() => {
                    saveVisibilityFromDom();
                    restoreCaseComparisonVisiblePlacement('show-all');
                    requestCursorDockLayoutRefresh(orderHint, heightOverrides);
                    closedPanels.forEach((panel) => {
                        const placement = clampDockPanelAboveButtons(panel, {
                            left: Number.parseFloat(panel.style.left) || panel.getBoundingClientRect().left,
                            top: Number.parseFloat(panel.style.top) || panel.getBoundingClientRect().top
                        }, 'after-open-toggle-all');
                        finalizeDockPanelPlacement(panel, placement.left, placement.top);
                    });
                }, openDelayMs + PANEL_VISIBILITY_ANIMATION_MS + 80);
            }
            panels.forEach((panel) => {
                if (!panel.classList.contains('collapsed')) {
                    const header = panel.querySelector('.ui-header');
                    if (header) {
                        header.setAttribute('aria-expanded', 'true');
                        header.setAttribute('data-ui-state', 'open');
                    }
                }
            });
        } else {
            const resolvedOrderHint = getCanonicalDockedPanelOrder();
            const dockManagedPanels = panels.filter((panel) => isDockManagedPanelId(panel.id));
            const otherCursorPanels = panels.filter((panel) => !isDockManagedPanelId(panel.id));
            setDockedCursorPanelsClosedBatch(dockManagedPanels, resolvedOrderHint);
            otherCursorPanels.forEach((panel) => setCursorPanelOpen(panel, isOpen));
            syncCursorPanelsState(isOpen, { skipDockedPanels: true });
            const dockLayoutState = getCursorDockLayoutState(resolvedOrderHint);
            if (dockLayoutState?.layout?.length) {
                requestCursorDockLayoutRefresh(resolvedOrderHint, dockLayoutState.heightOverrides, {
                    animate: false,
                    force: true,
                    skipMoveTransition: true
                });
            }
        }
        utilityPanels.forEach((panel) => setUtilityCursorPanelOpen(panel, isOpen));
        if (presetPanel) {
            setUtilityCursorPanelOpen(document.getElementById('ui-variant-panel'), isOpen);
        }
        if (isOpen) {
            const button = document.getElementById(SETTINGS_TOGGLE_TEST_ID);
            if (button) {
                button.textContent = 'カーソル設定を閉じる';
                button.setAttribute('aria-expanded', 'true');
            }
            if (!hasClosedPanels) {
                saveVisibilityFromDom();
                restoreCaseComparisonVisiblePlacement('toggle-cursor-open-no-closed-panels');
            }
        }
        if (!isOpen) scheduleArrangeDockedPanels();
        syncUtilityMotionLockControls();
        return true;
    }

    function updateSettingsToggleLabel() {
        const button = document.getElementById(SETTINGS_TOGGLE_ID);
        const panel = document.getElementById(SETTINGS_PANEL_ID);
        if (!button || !panel) return;
        const isCollapsed = panel.classList.contains('collapsed');
        button.textContent = isCollapsed ? '表示設定を開く' : '表示設定を閉じる';
        button.setAttribute('aria-expanded', String(!isCollapsed));
    }

    function updateSettingsToggleLabelTest() {
        const button = document.getElementById(SETTINGS_TOGGLE_TEST_ID);
        const panels = getCursorPanels();
        if (!button || !panels.length) return;
        const isOpen = panels.every((panel) => !panel.classList.contains('collapsed'));
        button.textContent = isOpen ? 'カーソル設定を閉じる' : 'カーソル設定を開く';
        button.setAttribute('aria-expanded', String(isOpen));
    }

    function renderSettingsList(panel) {
        const list = panel?.querySelector('.glass-settings-list');
        if (!list) return;
        const sections = [
            {
                label: '全体操作',
                items: [
                    ['show-all', 'すべて表示', 'action'],
                    ['hide-all', 'すべて非表示', 'action']
                ]
            },
            {
                label: 'カーソル操作',
                items: [
                    ['toggle-cursor-open', 'カーソル全開', 'action'],
                    ['toggle-cursor-close', 'カーソル全閉', 'action']
                ]
            },
            {
                label: 'パネル表示',
                items: []
            },
            {
                label: '描画',
                items: []
            }
        ];
        list.innerHTML = sections.map((section) => `
            <div class="glass-settings-section">
                <div class="glass-settings-section-label">${section.label}</div>
                ${section.items.length ? `<div class="glass-settings-section-row">
                    ${section.items.map(([id, label, kind]) => {
                        if (kind === 'action') {
                            return `
                                <button type="button" class="glass-chip" data-action="${id}">${label}</button>
                            `;
                        }
                        const visible = isPanelVisible(document.getElementById(id));
                        return `
                            <button type="button" class="glass-chip ${visible ? 'is-on' : ''}" data-panel-id="${id}" aria-pressed="${visible}">
                                ${label}
                            </button>
                        `;
                    }).join('')}
                </div>` : ''}
            </div>
        `).join('');
    }

    function bindSettingsPanel(panel, options = {}) {
        if (!panel) return;
        const closeSelector = options.closeSelector ?? `.${SETTINGS_CLOSE_CLASS}`;
        const togglePanel = options.togglePanel || toggleSettingsPanel;
        const sliderSelector = Object.prototype.hasOwnProperty.call(options, 'sliderSelector')
            ? options.sliderSelector
            : '#canvas-scale-slider';
        const valueSelector = Object.prototype.hasOwnProperty.call(options, 'valueSelector')
            ? options.valueSelector
            : '#canvas-scale-value';
        const persistScale = options.persistScale !== false;
        const boundKey = options.boundKey || 'glassSettingsBound';
        if (panel.dataset[boundKey] === 'true') return;
        panel.dataset[boundKey] = 'true';
        const header = panel.querySelector('.ui-header');
        const closeButton = closeSelector ? panel.querySelector(closeSelector) : null;
        const canvasScaleSlider = sliderSelector ? panel.querySelector(sliderSelector) : null;
        const canvasScaleValue = valueSelector ? panel.querySelector(valueSelector) : null;
        if (header) {
            header.style.touchAction = 'none';
            if (isCursorPanel(panel.id)) return;
            header.addEventListener('click', (event) => {
                if (event.target.closest('button, select, input, textarea, label, a')) return;
                if (consumeDragClickSuppression()) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }
                togglePanel();
            });
        }
        if (canvasScaleSlider && canvasScaleValue && !canvasScaleSlider.dataset.bound) {
            const initialScale = window.config && window.config.renderScale ? Math.round(window.config.renderScale * 100) : 100;
            canvasScaleSlider.value = initialScale;
            canvasScaleValue.textContent = `${initialScale}%`;
            if (persistScale) {
                window.config = window.config || {};
                window.config.renderScale = initialScale / 100;
            }
            canvasScaleSlider.dataset.bound = 'true';
            canvasScaleSlider.addEventListener('input', function() {
                const newScale = parseInt(this.value, 10);
                canvasScaleValue.textContent = `${newScale}%`;
                if (persistScale) {
                    window.config = window.config || {};
                    window.config.renderScale = newScale / 100;
                }
                if (typeof updateUIElements === 'function') {
                    updateUIElements();
                }
            });
        }
        closeButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            togglePanel(false);
        });
        panel.addEventListener('click', (event) => {
            const actionButton = event.target.closest('button[data-action]');
            if (actionButton) {
                event.preventDefault();
                event.stopPropagation();
                if (actionButton.dataset.action === 'show-all') {
                    setAllPanelsVisibility(true);
                } else if (actionButton.dataset.action === 'hide-all') {
                    setAllPanelsVisibility(false);
                } else if (actionButton.dataset.action === 'toggle-cursor-open') {
                    toggleCursorPanels(true);
                } else if (actionButton.dataset.action === 'toggle-cursor-close') {
                    toggleCursorPanels(false);
                }
                renderSettingsList(panel);
                return;
            }
            const chip = event.target.closest('button[data-panel-id]');
            if (chip) {
                event.preventDefault();
                event.stopPropagation();
                const panelId = chip.dataset.panelId;
                const target = document.getElementById(panelId);
                if (target) {
                    setPanelVisibleAnimated(target, !isPanelVisible(target));
                    scheduleArrangeDockedPanels();
                    saveVisibilityFromDom();
                    if (isDockManagedPanelId(panelId)) {
                        setTimeout(() => {
                            realignDockedPanelsMeasured('chip-toggle');
                        }, PANEL_VISIBILITY_ANIMATION_MS + 40);
                    }
                    renderSettingsList(panel);
                }
            }
        });
    }

    function setAllPanelsVisibility(visible) {
        const targetIds = [
            'ui-variant-panel',
            'case-comparison',
            CURSOR_PANEL_1_ID,
            CURSOR_PANEL_2_ID,
            CURSOR_PANEL_3_ID,
            CURSOR_PANEL_4_ID,
            CURSOR_PANEL_6_ID,
            CURSOR_PANEL_7_ID
        ];
        targetIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) setPanelVisibleAnimated(el, visible);
        });
        if (!visible) {
            const settingsPanel = document.getElementById(CURSOR_PANEL_5_ID);
            if (settingsPanel) {
                settingsPanel.hidden = true;
                settingsPanel.style.display = 'none';
            }
        } else {
            const casePanel = document.getElementById('case-comparison');
            if (casePanel) {
                restoreCaseComparisonVisiblePlacement('set-all-visible');
                setPanelVisibleAnimated(casePanel, true, true);
            }

            // d による再表示後も、4.空間を含むドック列を同一右端へ必ず揃える。
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    realignDockedPanelsMeasured('set-all-visible-dock', { immediate: true });
                });
            });
            setTimeout(() => {
                realignDockedPanelsMeasured('set-all-visible-dock-final', { immediate: true });
            }, PANEL_VISIBILITY_ANIMATION_MS + 40);
        }
        saveVisibilityFromDom();
        const panel = document.getElementById(SETTINGS_PANEL_ID);
        renderSettingsList(panel);
    }

    function toggleUtilityPanelsVisibility(forceVisible) {
        const panels = [
            'ui-variant-panel',
            'case-comparison',
        ].map((id) => document.getElementById(id)).filter(Boolean);
        const visibleCount = panels.filter((panel) => isPanelVisible(panel)).length;
        const nextVisible = typeof forceVisible === 'boolean' ? forceVisible : visibleCount !== panels.length;
        setAllPanelsVisibility(nextVisible);
    }

    function toggleUtilityPanelsOpenClose(forceOpen) {
        toggleCursorPanels(forceOpen);
        saveVisibilityFromDom();
    }

    function beginDrag(event) {
        if (!isGlassMode()) return;
        if (event.button !== 0) return;
        if (event.target.closest('button, select, input, textarea, label, a')) return;
        const header = event.target.closest('.ui-header');
        const utilityContainer = event.target.closest('#ui-variant-panel');
        const directContainer = event.target.closest('#case-comparison');
        const headerContainer = header ? header.closest('.ui-container') : null;
        const container = isCursorPanel(headerContainer?.id)
            ? headerContainer
            : utilityContainer || directContainer || headerContainer;
        if (!container || !getTargetPanelIds().includes(container.id)) return;
        if (container.id === 'case-comparison') {
            const onControlStrip = !!event.target.closest('.case-comparison-controls');
            const onCaseTable = !!event.target.closest('#case-table');
            const onCaseHeader = !!event.target.closest('th.case-header');
            const onParameterToggle = !!event.target.closest('th.parameter-toggle');
            const onTableCell = !!event.target.closest('td');
            if (onCaseTable || onCaseHeader || onParameterToggle || onTableCell) return;
            if (!onControlStrip) return;
        }

        dragState.active = true;
        dragState.dragging = false;
        dragState.target = container;
        dragState.pointerId = event.pointerId;
        dragState.startX = event.clientX;
        dragState.startY = event.clientY;
        dragState.startTime = event.timeStamp || Date.now();
        dragState.dragMoved = false;
        const rect = container.getBoundingClientRect();
        dragState.pointerOffsetX = event.clientX - rect.left;
        dragState.pointerOffsetY = event.clientY - rect.top;
        dragState.originLeft = parseFloat(container.dataset.glassLeft || container.dataset.glassX || '0');
        dragState.originTop = parseFloat(container.dataset.glassTop || container.dataset.glassY || '0');
        dragState.suppressNextClick = false;
        if (container.id === 'ui-variant-panel' || container.id === 'case-comparison') {
            container.classList.add('glass-panel-dragging');
            container.classList.remove('viewport-tracking-animate');
            container.setAttribute('data-glass-dragging', 'true');
        }
        container.style.willChange = 'left, top';
        (header || container).setPointerCapture?.(event.pointerId);
    }

    function moveDrag(event) {
        if (!dragState.active || !dragState.target || event.pointerId !== dragState.pointerId) return;
        const dx = event.clientX - dragState.startX;
        const dy = event.clientY - dragState.startY;
        if (!dragState.dragMoved && Math.hypot(dx, dy) >= 5) {
            dragState.dragMoved = true;
        }
        if (!dragState.dragging && dragState.dragMoved) {
            dragState.dragging = true;
            dragState.target.classList.add('is-dragging');
            dragState.target.setAttribute('data-glass-dragging', 'true');
        }
        if (!dragState.dragging) return;
        event.preventDefault();
        setPanelPosition(dragState.target, event.clientX - dragState.pointerOffsetX, event.clientY - dragState.pointerOffsetY);
    }

    function endDrag(event) {
        if (!dragState.active || event.pointerId !== dragState.pointerId) return;
        const target = dragState.target;
        dragState.active = false;
        dragState.pointerId = null;
        if (target) {
            target.classList.remove('is-dragging');
            target.classList.remove('glass-panel-dragging');
            target.removeAttribute('data-glass-dragging');
            target.style.willChange = '';
        }
        if (dragState.dragging) {
            if (target && shouldTrackViewportPlacement(target.id)) {
                if (target.id === 'ui-variant-panel') {
                    scheduleUiVariantReturnAfterIdle();
                } else {
                    applyViewportTrackedPlacement(target);
                }
            } else {
                if (isDockManagedPanelId(target?.id)) {
                    // 手動移動した右下パネルは C で再整列されない自由配置として保持する。
                    setPanelDockMode(target, 'free');
                }
                savePanelPositions();
                saveDockedPanelOrder();
                cursorDockResetOrderHintDirty = true;
            }
            dragState.suppressNextClick = true;
        }
        dragState.target = null;
        dragState.dragging = false;
    }

    function consumeDragClickSuppression() {
        if (!dragState.suppressNextClick) return false;
        dragState.suppressNextClick = false;
        return true;
    }

    function bindPanels() {
        getTargetPanelIds().forEach(id => {
            const container = document.getElementById(id);
            if (!container) return;
            if (isCursorPanel(id)) {
                const header = container.querySelector('.ui-header');
                if (header) {
                    header.dataset.glassBound = 'true';
                    header.style.touchAction = 'none';
                    header.style.cursor = 'grab';
                }
                container.style.touchAction = 'none';
                container.style.cursor = 'grab';
                container.dataset.glassDraggable = 'true';
                container.dataset.glassPanelId = id;
                if (isDockManagedPanelId(id) && !container.dataset.glassDockMode) {
                    setPanelDockMode(container, 'docked');
                }
                container.style.position = 'fixed';
                if (!container.style.zIndex) container.style.zIndex = '62';
                return;
            }
            const header = container.querySelector('.ui-header');
            if (header) {
                header.dataset.glassBound = 'true';
                header.style.touchAction = 'none';
                header.style.cursor = 'grab';
            }
            if (container.id === 'ui-variant-panel' || container.id === 'case-comparison') {
                container.style.touchAction = 'none';
                container.style.cursor = 'grab';
            }
            container.dataset.glassDraggable = 'true';
            container.dataset.glassPanelId = id;
            container.style.position = 'fixed';
            if (!container.style.zIndex) container.style.zIndex = '62';
        });
    }

    function addHeaderHintStyles() {
        const styleId = 'glass-panel-drag-style';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            body[data-ui-variant="variant-1-glass"] .ui-container .ui-header {
                cursor: grab;
                user-select: none;
            }
            body[data-ui-variant="variant-1-glass"] #glass-floating-layer {
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 60;
            }
            body[data-ui-variant="variant-1-glass"] #glass-floating-layer > * {
                pointer-events: auto;
            }
            body[data-ui-variant="variant-1-glass"] #ui-variant-panel,
            body[data-ui-variant="variant-1-glass"] #case-comparison {
                cursor: grab;
                user-select: none;
            }
            body[data-ui-variant="variant-1-glass"] #ui-container,
            body[data-ui-variant="variant-1-glass"] .ui-container,
            body[data-ui-variant="variant-1-glass"] #ui-variant-panel {
                width: min(var(--ui-variant-panel-width, 274px), calc(100vw - (var(--ui-edge-gap, 12px) * 2)));
                max-width: min(var(--ui-variant-panel-width, 274px), calc(100vw - (var(--ui-edge-gap, 12px) * 2)));
                min-width: 0;
                box-sizing: border-box;
            }
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-1,
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-2,
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-3,
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-4,
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-5,
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-6,
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-7 {
                position: fixed;
                right: var(--ui-edge-gap, 12px);
                width: min(var(--ui-floating-panel-width, 211px), calc(100vw - (var(--ui-edge-gap, 12px) * 2)));
                max-width: min(var(--ui-floating-panel-width, 211px), calc(100vw - (var(--ui-edge-gap, 12px) * 2)));
                min-width: 0;
                box-sizing: border-box;
                z-index: 62;
            }
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-1 { top: 436px; }
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-2 { top: 485px; }
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-3 { top: 534px; }
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-4 { top: 606px; }
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-5 { top: 655px; }
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-6 { top: 704px; }
            body[data-ui-variant="variant-1-glass"] #glass-cursor-panel-7 { top: 753px; }
            body[data-ui-variant="variant-1-glass"] #ui-variant-panel {
                width: min(var(--ui-variant-panel-width, 274px), calc(100vw - (var(--ui-edge-gap, 12px) * 2)));
                max-width: min(var(--ui-variant-panel-width, 274px), calc(100vw - (var(--ui-edge-gap, 12px) * 2)));
            }
            body[data-ui-variant="variant-1-glass"] .ui-container.is-dragging .ui-header {
                cursor: grabbing;
            }
            .glass-panel-quick-toggle-button.is-motion-locked,
            #glass-panel-reset.is-motion-locked {
                opacity: 0.48;
                cursor: not-allowed;
                pointer-events: none;
            }
            body.uiux-panel-motion-locked .glass-panel-quick-toggle-button[data-action="toggle-utility-openclose"],
            body.uiux-panel-motion-locked #glass-panel-reset {
                filter: saturate(0.82);
            }
        `;
        document.head.appendChild(style);
    }

    function bindCursorHeaderClicks() {
        document.addEventListener('click', (event) => {
            const header = event.target.closest('.ui-header');
            if (!header) return;
            const panel = header.closest('#glass-cursor-panel-3, #glass-cursor-panel-4, #glass-cursor-panel-6, #glass-cursor-panel-7');
            if (!panel) return;
            if (consumeDragClickSuppression()) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            togglePanelCollapsed(panel);
        }, true);
    }

    function init() {
        ensureProtectedCustomPresets();
        normalizeRemovedProtectedPresetSelection();
        ensureControlBar();
        if (window.CanvasResizer && typeof window.CanvasResizer.refreshControls === 'function') {
            window.CanvasResizer.refreshControls();
        }
        if (window.CanvasResizer && typeof window.CanvasResizer.initialize === 'function') {
            window.CanvasResizer.initialize();
        }
        ensureSettingsPanel();
        startupCollapsedDockPreserveActive = true;
        ensureSettingsPanelTest();
        suppressCaseComparisonPlacementAnimationUntil = performance.now() + 1200;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                startupCollapsedDockPreserveActive = false;
            });
        });
        isolateStylePresetPanel();
        addHeaderHintStyles();
        bindPanels();
        bindCursorHeaderClicks();
        installPublicDemoDisabledActions();
        scheduleGlassPanelMigration();
        document.addEventListener('pointerdown', beginDrag, true);
        document.addEventListener('pointermove', moveDrag, true);
        document.addEventListener('pointerup', endDrag, true);
        document.addEventListener('pointercancel', endDrag, true);
        clearSavedPanelPlacements();
        caseComparisonInitialPlacementActive = true;
        applySavedPositions();
        applyVisibilityState();
        restoreStartupCollapsedDockPanels();
        placeCaseComparisonFixed({ animate: false });
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                caseComparisonInitialPlacementActive = false;
            });
        });
        renderSettingsList(document.getElementById(CURSOR_PANEL_5_ID));
        updateSettingsToggleLabel();
        updateSettingsToggleLabelTest();
        applyThemeAndPresetState(getActiveThemeId());
        scheduleRefractionSnapshot(document.getElementById('ui-preset-panel'));
        window.addEventListener('resize', () => {
            arrangeDockedPanels();
            const uiVariantPanel = document.getElementById('ui-variant-panel');
            if (uiVariantPanel && !uiVariantPanel.classList.contains('glass-panel-dragging') && uiVariantIdleReturnTimer === null) {
                applyViewportTrackedPlacement(uiVariantPanel);
            }
            scheduleCaseComparisonPlacement();
            scheduleRefractionSnapshot(document.getElementById('ui-preset-panel'));
        });
        window.addEventListener('scroll', () => {
            if (isGlassMode()) scheduleRefractionSnapshot(document.getElementById('ui-preset-panel'));
        }, true);
    }

    function refresh() {
        ensureControlBar();
        if (window.CanvasResizer && typeof window.CanvasResizer.refreshControls === 'function') {
            window.CanvasResizer.refreshControls();
        }
        if (window.CanvasResizer && typeof window.CanvasResizer.initialize === 'function') {
            window.CanvasResizer.initialize();
        }
        ensureSettingsPanel();
        ensureSettingsPanelTest();
        isolateStylePresetPanel();
        bindPanels();
        applySavedPositions();
        applyVisibilityState();
        restoreStartupCollapsedDockPanels();
        renderSettingsList(document.getElementById(CURSOR_PANEL_5_ID));
        applyThemeAndPresetState(getActiveThemeId());
        scheduleRefractionSnapshot(document.getElementById('ui-preset-panel'));
        updateSettingsToggleLabelTest();
    }

    const publicApi = {
        init,
        refresh,
        resetPanels,
        applySavedPositions,
        repositionCaseComparison,
        togglePanelFromBottomButton,
        toggleUtilityPanelsVisibility,
        toggleUtilityPanelsOpenClose,
        updateReadableTextColor: updateGlassReadableTextColor,
        syncNeumorphismBackgroundSurface
    };

    if (DEBUG_LAYOUT_LOGS) {
        publicApi.debugGlassDockOrder = getGlassDockDebugState;
        publicApi.testGlassDockResetOrder = runGlassDockResetDebug;
    }

    return publicApi;
})();

window.updateGlassReadableTextColor = window.UIGlassPanels?.updateReadableTextColor;
window.syncNeumorphismBackgroundSurface = window.UIGlassPanels?.syncNeumorphismBackgroundSurface;

if (typeof DEBUG_LAYOUT_LOGS !== 'undefined' && DEBUG_LAYOUT_LOGS) {
    window.debugGlassDockOrder = () => window.UIGlassPanels?.debugGlassDockOrder?.();
    window.testGlassDockResetOrder = () => window.UIGlassPanels?.testGlassDockResetOrder?.();
}

document.addEventListener('DOMContentLoaded', function() {
    window.UIGlassPanels.init();
});
