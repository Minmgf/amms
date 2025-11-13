import { apiMain } from "@/lib/axios";

// Obtener datos históricos de una solicitud por su código de tracking
// trackingCode: Código de tracking de la solicitud (ej: "SOL-2025-0072")
// filters: { start_date, end_date, machinery_id, operator_id }
export const getHistoricalDataByRequest = async (trackingCode, filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.machinery_id) params.append('machinery_id', filters.machinery_id);
    if (filters.operator_id) params.append('operator_id', filters.operator_id);

    const queryString = params.toString();
    const url = `/data/${trackingCode}/by_request/${queryString ? `?${queryString}` : ''}`;
    
    const { data } = await apiMain.get(url);
    return data;
};

// Procesar datos de parámetros para gráficos
// parameters: Array de parámetros con data_points
// parameterId: ID del parámetro a buscar
// Retorna: { labels: [], values: [], statistics: {} }
export const processParameterData = (parameters, parameterId) => {
    const parameter = parameters.find(p => p.parameter_id === parameterId);
    
    if (!parameter || !parameter.data_points || parameter.data_points.length === 0) {
        return { labels: [], values: [], statistics: null };
    }

    const labels = parameter.data_points.map(point => {
        const date = new Date(point.registered_at);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    });

    const values = parameter.data_points.map(point => point.data);

    return {
        labels,
        values,
        statistics: parameter.statistics,
        unit: parameter.unit
    };
};

// Procesar datos de ubicación GPS (parámetro 4)
// parameters: Array de parámetros
// Retorna: Array de coordenadas { lat, lng, timestamp }
export const processGPSData = (parameters) => {
    const gpsParameter = parameters.find(p => p.parameter_id === 4);
    
    if (!gpsParameter || !gpsParameter.data_points || gpsParameter.data_points.length === 0) {
        return [];
    }

    const coordinates = [];
    const dataPoints = [...gpsParameter.data_points].sort((a, b) => a.id - b.id);

    for (let i = 0; i < dataPoints.length; i += 2) {
        if (i + 1 < dataPoints.length) {
            const lat = dataPoints[i].data;
            const lng = dataPoints[i + 1].data;
            const timestamp = dataPoints[i].registered_at;
            
            coordinates.push({
                lat,
                lng,
                timestamp
            });
        }
    }

    return coordinates;
};

// Calcular porcentajes de tiempo (encendido, apagado, en movimiento)
// parameters: Array de parámetros
// Retorna: { off: %, on: %, inMotion: % }
export const calculateTimePercentages = (parameters) => {
    // Parámetro 1: Estado de Ignición (0 = apagado, 1 = encendido)
    const ignitionParam = parameters.find(p => p.parameter_id === 1);
    // Parámetro 2: Estado de Movimiento (0 = detenido, 1 = en movimiento)
    const movementParam = parameters.find(p => p.parameter_id === 2);

    if (!ignitionParam || !movementParam) {
        return { off: 0, on: 0, inMotion: 0 };
    }

    const ignitionPoints = ignitionParam.data_points || [];
    const movementPoints = movementParam.data_points || [];

    const totalPoints = ignitionPoints.length;
    if (totalPoints === 0) {
        return { off: 0, on: 0, inMotion: 0 };
    }

    const offCount = ignitionPoints.filter(p => p.data === 0).length;
    const onCount = ignitionPoints.filter(p => p.data === 1).length;
    const inMotionCount = movementPoints.filter(p => p.data === 1).length;

    return {
        off: Math.round((offCount / totalPoints) * 100),
        on: Math.round((onCount / totalPoints) * 100),
        inMotion: Math.round((inMotionCount / totalPoints) * 100)
    };
};

// Obtener eventos G (parámetro 16)
// parameters: Array de parámetros
// Retorna: Array de eventos con alertas
export const getGEvents = (parameters) => {
    const eventsParam = parameters.find(p => p.parameter_id === 16);
    
    if (!eventsParam || !eventsParam.data_points) {
        return [];
    }

    return eventsParam.data_points
        .filter(point => point.alert)
        .map(point => ({
            id: point.id,
            value: point.data,
            timestamp: new Date(point.registered_at).toLocaleString('es-ES'),
            type: point.data === 1 ? 'Aceleración' : point.data === 2 ? 'Frenado' : 'Curva'
        }));
};

// Obtener fallas OBD
// parameters: Array de parámetros
// Retorna: Array de fallas OBD con códigos y timestamps
export const getOBDFaults = (parameters) => {
    const faults = [];
    
    parameters.forEach(param => {
        if (param.data_points) {
            param.data_points.forEach(point => {
                if (point.obd_fault && point.obd_fault_name) {
                    faults.push({
                        code: point.obd_fault,
                        name: point.obd_fault_name,
                        timestamp: new Date(point.registered_at).toLocaleString('es-ES'),
                        parameter: param.parameter_name
                    });
                }
            });
        }
    });

    return faults;
};
