// Button_Save.js

window.SaveButton = (function() {
    function saveSettings() {
        console.log('Save settings function called');

        const currentCase = window.currentCase;
        if (!currentCase) {
            console.error('No current case to save');
            alert('保存するケースがありません');
            return;
        }

        console.log('Current case:', currentCase);

        const caseIndex = window.cases.indexOf(currentCase);
        if (caseIndex === -1) {
            console.error('Current case not found in cases array');
            alert('現在のケースが見つかりません');
            return;
        }

        console.log('Saving case index:', caseIndex);

        // 現在のケースの設定を取得
        const currentConfig = {
            count: currentCase.config.count,
            color: [...currentCase.config.color],
            size: currentCase.config.size,
            radius: currentCase.config.radius,
            trailLength: currentCase.config.trailLength,
            morphSpeed: currentCase.config.morphSpeed,
            fadeSpeed: currentCase.config.fadeSpeed,
            pointSequenceSeconds: Number.isFinite(Number(currentCase.config.pointSequenceSeconds))
                ? Number(currentCase.config.pointSequenceSeconds)
                : 8
        };

        console.log('Current config:', currentConfig);

        // ローカルストレージから既存の設定を取得
        let allSettings = {};
        try {
            const savedSettings = localStorage.getItem('allCaseSettings');
            console.log('Saved settings:', savedSettings);
            if (savedSettings) {
                allSettings = JSON.parse(savedSettings);
            }
        } catch (error) {
            console.error('Error parsing saved settings:', error);
        }

        // 現在のケースの設定を更新
        allSettings[`case${caseIndex}`] = {
            config: currentConfig,
            initialConfig: currentCase.initialConfig || { ...currentConfig }
        };

        // window.cases 配列内のケースも更新
        window.cases[caseIndex].config = { ...currentConfig };
        if (!window.cases[caseIndex].initialConfig) {
            window.cases[caseIndex].initialConfig = { ...currentConfig };
        }

        // グローバル変数のケースも更新
        window[`case${caseIndex}`] = {
            ...window[`case${caseIndex}`],
            config: { ...currentConfig },
            initialConfig: window[`case${caseIndex}`].initialConfig || { ...currentConfig }
        };

        // 設定をローカルストレージに保存
        try {
            localStorage.setItem('allCaseSettings', JSON.stringify(allSettings));
            console.log(`Settings saved for case${caseIndex}:`, allSettings[`case${caseIndex}`]);
            alert(`case${caseIndex}の設定が保存されました`);

            // テーブルを更新
            if (window.Table && typeof window.Table.updateCaseComparisonTable === 'function') {
                window.Table.updateCaseComparisonTable();
            }

            // スライダーを更新
            if (window.Slider && typeof window.Slider.updateSliders === 'function') {
                window.Slider.updateSliders(currentCase);
            }

            // 色のプレビューを更新
            if (window.Color && typeof window.Color.updateColorPreview === 'function') {
                window.Color.updateColorPreview();
            }

        } catch (error) {
            console.error('Error saving settings:', error);
            alert('設定の保存中にエラーが発生しました: ' + error.message);
        }
    }

    return {
        saveSettings: saveSettings
    };
})();
