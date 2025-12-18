export interface MapView {
    rMin: number;
    rMax: number;
    xMin: number;
    xMax: number;
}

export interface SimulationConfig {
    detailLevel: number; // 1 to 5, multiplier for iterations
    contrast: number;    // 0.5 to 2.0, brightness scaler
    showAxes: boolean;   // Toggle for axes lines/ticks
    showLabels: boolean; // Toggle for text labels
    refreshTrigger?: number; // Force re-render
}

export const DEFAULT_VIEW: MapView = {
    rMin: 2.8,
    rMax: 4.0,
    xMin: 0.1,
    xMax: 1.1
};

export const DEFAULT_CONFIG: SimulationConfig = {
    detailLevel: 2,
    contrast: 2.0,
    showAxes: true,
    showLabels: false,
    refreshTrigger: 0
};
