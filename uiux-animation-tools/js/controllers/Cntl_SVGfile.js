// Cntl_SVGfile.js の修正
window.Controller_SVGfile = (function() {
    let loadedPaths = [];
    let activePathIndex = -1;

    async function initiateFileSelect() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.svg';
        input.onchange = handleFileSelect;
        input.click();
    }

    async function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            console.log('Reading SVG file:', file.name);
            const content = await readFile(file);
            const paths = parseSVG(content);
            
            if (paths.length > 0) {
                console.log('Parsed paths:', paths);
                loadedPaths = paths;
                activePathIndex = 0;
                UI_SVGfile.updateFileList([file.name]);
                Controller_SVGanime.setPaths(paths);
            } else {
                throw new Error('No valid paths found in SVG');
            }
        } catch (error) {
            console.error('SVG parsing error:', error);
            alert('SVGファイルの読み込みに失敗しました: ' + error.message);
        }
    }

    async function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(new Error('File reading failed'));
            reader.readAsText(file);
        });
    }

    function parseSVG(content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'image/svg+xml');
        
        // SVGのエラーチェック
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Invalid SVG format');
        }

        const pathElements = doc.querySelectorAll('path');
        console.log('Found path elements:', pathElements.length);
        
        const paths = Array.from(pathElements).map(path => ({
            id: generatePathId(),
            d: path.getAttribute('d'),
            normalized: normalizePath(path),
            style: extractStyle(path),
            viewBox: extractViewBox(doc.querySelector('svg'))
        }));

        return paths;
    }

    function extractViewBox(svgElement) {
        if (!svgElement) return { x: 0, y: 0, width: 300, height: 150 };
        
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
            const [x, y, width, height] = viewBox.split(' ').map(Number);
            return { x, y, width, height };
        }
        
        return {
            x: 0,
            y: 0,
            width: Number(svgElement.getAttribute('width')) || 300,
            height: Number(svgElement.getAttribute('height')) || 150
        };
    }

    function normalizePath(pathElement) {
        const d = pathElement.getAttribute('d');
        const points = [];
        let currentPoint = { x: 0, y: 0 };
        let firstPoint = null;
        
        // パスコマンドを解析
        const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
        commands.forEach(cmd => {
            const type = cmd[0];
            const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
            
            switch (type.toUpperCase()) {
                case 'M':
                    currentPoint = { x: args[0], y: args[1] };
                    if (!firstPoint) firstPoint = { ...currentPoint };
                    points.push({ ...currentPoint });
                    break;
                case 'L':
                    currentPoint = { x: args[0], y: args[1] };
                    points.push({ ...currentPoint });
                    break;
                case 'C':
                    // ベジェ曲線を直線セグメントに分割
                    for (let t = 0; t <= 1; t += 0.1) {
                        const pt = bezierPoint(
                            currentPoint,
                            { x: args[0], y: args[1] },
                            { x: args[2], y: args[3] },
                            { x: args[4], y: args[5] },
                            t
                        );
                        points.push(pt);
                    }
                    currentPoint = { x: args[4], y: args[5] };
                    break;
            }
        });

        // パスを閉じる
        if (firstPoint) {
            points.push({ ...firstPoint });
        }

        return {
            pathData: d,
            points: points,
            bounds: calculateBounds(points)
        };
    }

    function bezierPoint(p0, p1, p2, p3, t) {
        const mt = 1 - t;
        return {
            x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
            y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
        };
    }

    function calculateBounds(points) {
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        return {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        };
    }

    function extractStyle(pathElement) {
        return {
            stroke: pathElement.getAttribute('stroke') || '#000000',
            fill: pathElement.getAttribute('fill') || 'none',
            strokeWidth: pathElement.getAttribute('stroke-width') || '1'
        };
    }

    function generatePathId() {
        return 'path_' + Math.random().toString(36).substr(2, 9);
    }

    return {
        initiateFileSelect,
        getPaths: () => loadedPaths,
        getActivePath: () => activePathIndex >= 0 ? loadedPaths[activePathIndex] : null,
        setActivePathIndex: (index) => {
            activePathIndex = index;
            Controller_SVGanime.updateActivePath();
        }
    };
})();