"use client";
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import './RouteMap.css';

// Fix para iconos de Leaflet en Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para ajustar automáticamente el zoom a los límites
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  
  return null;
};

const RouteMap = ({ requestData }) => {
  const [routeData, setRouteData] = useState({
    outbound: [], // Estado logístico = 1 (ida)
    working: [],  // Estado logístico = 2 (trabajo)
    return: []    // Estado logístico = 3 (retorno)
  });
  const [mapCenter, setMapCenter] = useState([4.6097, -74.0817]); // Bogotá, Colombia por defecto
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    
    if (!requestData) {
      return;
    }

    // Manejar tanto arrays como objetos
    let parameters;
    if (Array.isArray(requestData)) {
      // Si es un array, tomar el primer elemento
      parameters = requestData[0]?.parameters;
    } else {
      // Si es un objeto, usar directamente
      parameters = requestData.parameters;
    }

    if (!parameters) {
      return;
    }

    // Buscar parámetros de ubicación GPS y estado logístico
    const gpsParam = parameters.find(p => p.parameter_name === "Ubicación GPS");
    const logisticStateParam = parameters.find(p => p.parameter_name === "Estado logístico");

    if (!gpsParam || !logisticStateParam) {
      return;
    }

    // Procesar los datos para crear las rutas
    const processedRoutes = {
      outbound: [],
      working: [],
      return: []
    };

    // Agrupar coordenadas GPS por timestamp (latitud y longitud están separadas en data_points)
    const coordinatesByTimestamp = {};
    
    gpsParam.data_points.forEach(point => {
      const timestamp = point.registered_at;
      const value = parseFloat(point.data);
      
      if (!coordinatesByTimestamp[timestamp]) {
        coordinatesByTimestamp[timestamp] = {};
      }
      
      // Determinar si es latitud o longitud basado en el valor
      // Latitud: generalmente entre -90 y 90 (para Colombia: ~4.x)
      // Longitud: generalmente entre -180 y 180 (para Colombia: ~-74.x)
      if (value > 0 && value < 90) {
        // Es latitud positiva (Colombia está en latitud positiva ~4.x)
        coordinatesByTimestamp[timestamp].lat = value;
      } else if (value < 0 && value > -180) {
        // Es longitud negativa (Colombia está en longitud negativa ~-74.x)
        coordinatesByTimestamp[timestamp].lng = value;
      }
    });


    // Combinar coordenadas completas con estado logístico
    logisticStateParam.data_points.forEach((logisticPoint, index) => {
      const timestamp = logisticPoint.registered_at;
      const coordinates = coordinatesByTimestamp[timestamp];
      
      
      // Verificar que tengamos tanto latitud como longitud para este timestamp
      if (!coordinates || coordinates.lat === undefined || coordinates.lng === undefined) {
        return;
      }

      const point = {
        lat: coordinates.lat,
        lng: coordinates.lng,
        timestamp: timestamp,
        state: logisticPoint.data
      };

      // Clasificar según estado logístico
      switch (logisticPoint.data) {
        case 1:
          processedRoutes.outbound.push(point);
          break;
        case 2:
          processedRoutes.working.push(point);
          break;
        case 3:
          processedRoutes.return.push(point);
          break;
      }
    });
    setRouteData(processedRoutes);

    // Calcular centro del mapa basado en todos los puntos
    const allPoints = [
      ...processedRoutes.outbound,
      ...processedRoutes.working,
      ...processedRoutes.return
    ];

    if (allPoints.length > 0) {
      // Calcular el centro y los límites para ajustar el zoom automáticamente
      const lats = allPoints.map(p => p.lat);
      const lngs = allPoints.map(p => p.lng);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
           
      setMapCenter([centerLat, centerLng]);
      
      // Guardar los límites para usar en el mapa
      setRouteData({
        ...processedRoutes,
        bounds: [[minLat, minLng], [maxLat, maxLng]]
      });
    } else {
      setRouteData(processedRoutes);
    }
  }, [requestData]);

  // Colores para cada tipo de ruta
  const routeColors = {
    outbound: '#22C55E', // Verde - Ida
    working: '#3B82F6',  // Azul - Trabajo
    return: '#EF4444'    // Rojo - Retorno
  };

  // Convertir puntos a formato de coordenadas para Polyline
  const getPolylinePositions = (points) => {
    return points.map(point => [point.lat, point.lng]);
  };

  // Crear marcadores para puntos importantes
  const createMarkers = () => {
    const markers = [];
    
    // Marcadores para todos los puntos (para debugging)
    const allPoints = [
      ...routeData.outbound.map(p => ({...p, type: 'outbound'})),
      ...routeData.working.map(p => ({...p, type: 'working'})),
      ...routeData.return.map(p => ({...p, type: 'return'}))
    ];

    allPoints.forEach((point, index) => {
      const color = point.type === 'outbound' ? '#22C55E' : 
                   point.type === 'working' ? '#3B82F6' : '#EF4444';
      
      markers.push(
        <CircleMarker 
          key={`point-${index}`} 
          center={[point.lat, point.lng]}
          radius={6}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.8,
            weight: 2
          }}
        >
          <Popup>
            <div>
              <strong>Punto {point.type === 'outbound' ? 'Ida' : 
                              point.type === 'working' ? 'Trabajo' : 'Retorno'}</strong><br/>
              Hora: {new Date(point.timestamp).toLocaleString()}<br/>
              Coordenadas: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}<br/>
              Estado: {point.state}
            </div>
          </Popup>
        </CircleMarker>
      );
    });

    return markers;
  };

  if (!isClient) {
    return (
      <div className="route-map-container flex items-center justify-center bg-gray-200">
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Leyenda */}
      <div className="route-legend">
        <div className="route-legend-item">
          <div className="route-legend-color" style={{ backgroundColor: routeColors.outbound }}></div>
          <span>Ida ({routeData.outbound.length} puntos)</span>
        </div>
        <div className="route-legend-item">
          <div className="route-legend-color" style={{ backgroundColor: routeColors.working }}></div>
          <span>Trabajo ({routeData.working.length} puntos)</span>
        </div>
        <div className="route-legend-item">
          <div className="route-legend-color" style={{ backgroundColor: routeColors.return }}></div>
          <span>Retorno ({routeData.return.length} puntos)</span>
        </div>
      </div>

      {/* Mapa */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="route-map-container"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Ajustar automáticamente el zoom a todos los puntos */}
        {routeData.bounds && <FitBounds bounds={routeData.bounds} />}

        {/* Ruta de ida (verde) */}
        {routeData.outbound.length > 0 && (
          <Polyline
            positions={getPolylinePositions(routeData.outbound)}
            color={routeColors.outbound}
            weight={6}
            opacity={1}
          />
        )}

        {/* Ruta de trabajo (azul) */}
        {routeData.working.length > 0 && (
          <Polyline
            positions={getPolylinePositions(routeData.working)}
            color={routeColors.working}
            weight={6}
            opacity={1}
          />
        )}

        {/* Ruta de retorno (rojo) */}
        {routeData.return.length > 0 && (
          <Polyline
            positions={getPolylinePositions(routeData.return)}
            color={routeColors.return}
            weight={6}
            opacity={1}
          />
        )}

        {/* Marcadores de inicio y fin */}
        {createMarkers()}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
