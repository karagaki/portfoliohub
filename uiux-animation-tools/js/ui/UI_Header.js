// UI_Header.js - 開閉制御は UI_State.js に完全移譲
// このファイルは互換性のため残すが、実質空の実装

window.UIHeader = (function() {
    function init() {
        console.log('UI_Header: Deprecated - UI control delegated to UI_State.js');
        // 何もしない（UI_State.jsが全て処理）
    }

    return {
        init: init
    };
})();

// DOMContentLoaded は実行しない（UI_State.jsで処理済み）
