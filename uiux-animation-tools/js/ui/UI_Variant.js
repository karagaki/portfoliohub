// UI_Variant.js - UI見た目バリエーションの選択と永続化

window.UIVariant = (function() {
    const STORAGE_KEY = 'uiVariant';
    const STORAGE_KEY_MAIN = 'uiVariantMain';
    const DEFAULT_VARIANT = 'variant-1-glass';
    const NEUMORPHISM_VARIANT = 'variant-2-neumorphism';
    const SUPPORTED_MAIN_VARIANTS = new Set([DEFAULT_VARIANT, NEUMORPHISM_VARIANT]);
    let variantSelectPointerInitiated = false;

    function normalizeVariant(value) {
        return SUPPORTED_MAIN_VARIANTS.has(value) ? value : DEFAULT_VARIANT;
    }

    function applyThemeSurface(variant) {
        // Glass の寸法・配置ルールを土台として維持し、テーマ固有の表面表現だけを切り替える。
        document.body.setAttribute('data-ui-variant', DEFAULT_VARIANT);
        const theme = variant === NEUMORPHISM_VARIANT ? 'neumorphism' : 'glass';
        document.body.setAttribute('data-ui-theme', theme);
    }

    function applyVariant(variant) {
        const normalized = normalizeVariant(variant);
        const currentPresetDetails = document.querySelector('#ui-preset-panel [data-glass-preset-details]');
        if (currentPresetDetails) {
            document.body.dataset.uiPresetDetailsTransitionOpen = String(!currentPresetDetails.hidden);
        }
        applyThemeSurface(normalized);
        const select = document.getElementById('ui-variant-select');
        if (select && select.value !== normalized) select.value = normalized;
        localStorage.setItem(STORAGE_KEY_MAIN, normalized);
        localStorage.setItem(STORAGE_KEY, normalized);

        // プリセット選択・パラメータ保存は各テーマ専用領域を扱う UIGlassPanels に委ねる。
        if (window.UIGlassPanels && typeof window.UIGlassPanels.refresh === 'function') {
            window.UIGlassPanels.refresh();
        }
        if (window.UIScroll && typeof window.UIScroll.adjustHeight === 'function') window.UIScroll.adjustHeight();
        if (window.Table && typeof window.Table.adjustTableHeight === 'function') window.Table.adjustTableHeight();
        // マウス操作後の Glass は、更新後の通常表示へ即時戻して不要な選択輪郭を残さない。
        if (select && document.activeElement === select && (!select.matches(':focus-visible') || variantSelectPointerInitiated)) {
            select.blur();
        }
    }

    function restoreVariant() {
        const savedMain = localStorage.getItem(STORAGE_KEY_MAIN) || localStorage.getItem(STORAGE_KEY);
        applyVariant(savedMain || DEFAULT_VARIANT);
    }

    function bindSelect() {
        const select = document.getElementById('ui-variant-select');
        if (!select) return;
        select.addEventListener('pointerdown', () => {
            variantSelectPointerInitiated = true;
        });
        select.addEventListener('blur', () => {
            variantSelectPointerInitiated = false;
        });
        select.addEventListener('change', (event) => applyVariant(event.target.value));
    }

    function init() {
        document.body.setAttribute('data-ui-booting', '1');
        bindSelect();
        restoreVariant();
        requestAnimationFrame(() => {
            document.body.removeAttribute('data-ui-booting');
            document.body.setAttribute('data-ui-ready', '1');
        });
    }

    return { init, applyVariant, restoreVariant };
})();

document.addEventListener('DOMContentLoaded', function() {
    window.UIVariant.init();
});
