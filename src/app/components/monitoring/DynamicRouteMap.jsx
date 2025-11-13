"use client";
import dynamic from 'next/dynamic';

// Cargar RouteMap dinámicamente para evitar problemas de SSR con Leaflet
const RouteMap = dynamic(() => import('./RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-gray-600">Cargando mapa...</p>
    </div>
  )
});

export default RouteMap;
