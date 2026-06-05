// Cntl_SVGanime.js
window.Controller_SVGanime = (function() {
    let state = {
        paths: [],
        activePathIndex: 0,
        parameters: {
            speed: 1.0,
            influence: 0.5,
            attraction: 0.3
        },
        enabled: false,
        currentProgress: 0
    };

    function normalizePath(path) {
        if (!path || !path.d) return null;

        const points = [];
        let currentX = 0;
        let currentY = 0;
        let firstX = null;
        let firstY = null;

        const commands = path.d.match(/[a-zA-Z][^a-zA-Z]*/g) || [];
        
        commands.forEach(cmd => {
            const type = cmd[0];
            const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

            switch (type.toUpperCase()) {
                case 'M':
                    currentX = args[0];
                    currentY = args[1];
                    if (firstX === null) {
                        firstX = currentX;
                        firstY = currentY;
                    }
                    points.push({ x: currentX, y: currentY });
                    break;

                case 'L':
                    currentX = args[0];
                    currentY = args[1];
                    points.push({ x: currentX, y: currentY });
                    break;

                case 'C':
                    const p0 = { x: currentX, y: currentY };
                    const p1 = { x: args[0], y: args[1] };
                    const p2 = { x: args[2], y: args[3] };
                    const p3 = { x: args[4], y: args[5] };

                    for (let t = 0; t <= 1; t += 0.05) {
                        const pt = bezierPoint(p0, p1, p2, p3, t);
                        points.push(pt);
                    }

                    currentX = args[4];
                    currentY = args[5];
                    break;

                case 'Z':
                    if (firstX !== null) {
                        points.push({ x: firstX, y: firstY });
                    }
                    break;
            }
        });

        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const bounds = {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };

        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        
        const scale = Math.min(window.width / width, window.height / height) * 0.8;
        const offsetX = (window.width - width * scale) / 2;
        const offsetY = (window.height - height * scale) / 2;

        const normalizedPoints = points.map(p => ({
            x: (p.x - bounds.minX) * scale + offsetX,
            y: (p.y - bounds.minY) * scale + offsetY
        }));

        return {
            points: normalizedPoints,
            pathData: path.d,
            bounds: bounds,
            scale: scale
        };
    }

    function bezierPoint(p0, p1, p2, p3, t) {
        const mt = 1 - t;
        return {
            x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
            y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
        };
    }

    function calculatePathInfluence(point) {
        const activePath = state.paths[state.activePathIndex];
        if (!activePath?.normalized?.points) {
            return point;
        }

        const canvasPoints = activePath.normalized.points;
        let minDist = Infinity;
        let closestPoint = null;
        let closestIndex = 0;

        for (let i = 0; i < canvasPoints.length; i++) {
            const pathPoint = canvasPoints[i];
            const dist = Math.hypot(point.x - pathPoint.x, point.y - pathPoint.y);
            if (dist < minDist) {
                minDist = dist;
                closestPoint = pathPoint;
                closestIndex = i;
            }
        }

        if (!closestPoint) return point;

        const nextIndex = (closestIndex + 1) % canvasPoints.length;
        const prevIndex = (closestIndex - 1 + canvasPoints.length) % canvasPoints.length;
        const nextPoint = canvasPoints[nextIndex];
        const prevPoint = canvasPoints[prevIndex];

        const tangentX = nextPoint.x - prevPoint.x;
        const tangentY = nextPoint.y - prevPoint.y;
        const tangentLength = Math.hypot(tangentX, tangentY);
        
        if (tangentLength === 0) return point;

        const dirX = tangentX / tangentLength;
        const dirY = tangentY / tangentLength;

        state.currentProgress += state.parameters.speed * 0.01;
        if (state.currentProgress >= 1) state.currentProgress = 0;

        return {
            x: closestPoint.x + dirX * state.parameters.speed * 30,
            y: closestPoint.y + dirY * state.parameters.speed * 30
        };
    }

    function getActivePathPreview() {
        if (!state.paths[state.activePathIndex]) return null;
        return state.paths[state.activePathIndex];
    }

    return {
        setPaths: function(paths) {
            console.log('Setting paths:', paths);
            state.paths = paths.map(path => {
                const normalized = normalizePath(path);
                return normalized ? {
                    ...path,
                    normalized,
                    canvasScale: {
                        x: window.width,
                        y: window.height
                    }
                } : null;
            }).filter(Boolean);

            state.activePathIndex = state.paths.length > 0 ? 0 : -1;
            state.currentProgress = 0;

            if (state.paths.length > 0) {
                window.UI_SVGanime.updatePreview(getActivePathPreview());
            }
        },

        setParameter: function(key, value) {
            state.parameters[key] = value;
        },

        getParameters: function() {
            return { ...state.parameters };
        },

        isEnabled: function() {
            return state.enabled;
        },

        toggleEnabled: function() {
            state.enabled = !state.enabled;
            return state.enabled;
        },

        setEnabled: function(enabled) {
            state.enabled = enabled;
            return state.enabled;
        },

        calculatePathInfluence: calculatePathInfluence,

        modifyPosition: function(originalPosition) {
            if (!state.enabled || state.activePathIndex < 0) {
                return originalPosition;
            }

            const pathInfluence = calculatePathInfluence(originalPosition);
            const influence = state.parameters.influence;
            const attraction = state.parameters.attraction;

            return {
                x: originalPosition.x + (pathInfluence.x - originalPosition.x) * influence * attraction,
                y: originalPosition.y + (pathInfluence.y - originalPosition.y) * influence * attraction
            };
        },

        applyPathEffect: function(vector) {
            if (!state.enabled) return;

            const modifiedPos = this.modifyPosition({
                x: vector.current.x,
                y: vector.current.y
            });

            vector.current.x = modifiedPos.x;
            vector.current.y = modifiedPos.y;
        },

        updateActivePath: function() {
            if (window.UI_SVGanime) {
                window.UI_SVGanime.updatePreview(getActivePathPreview());
            }
        }
    };
})();