import { MapContainer, TileLayer, Marker, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

const radarIcon = L.divIcon({
  className: '',
  html: `<span class="radar radar--lg"><span class="radar__ring"></span><span class="radar__ring"></span><span class="radar__dot"></span></span>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
})

function Recentrer({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView(position, map.getZoom() < 14 ? 15 : map.getZoom())
  }, [position?.[0], position?.[1]])
  return null
}

export default function MapView({ position, trace = [], geofences = [], height = 320 }) {
  const centre = position || [36.75, 3.06] // Alger par défaut si aucune position connue
  return (
    <div className="map-box" style={{ height }}>
      <MapContainer center={centre} zoom={position ? 15 : 12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trace.length > 1 && <Polyline positions={trace} pathOptions={{ color: '#16938C', weight: 3, opacity: 0.7 }} />}
        {position && <Marker position={position} icon={radarIcon} />}
        {geofences.map((z) => (
          <Circle
            key={z.id}
            center={[z.latitude_centre, z.longitude_centre]}
            radius={z.rayon_metres}
            pathOptions={{ color: z.actif ? '#16938C' : '#9AA6B5', fillOpacity: 0.08 }}
          />
        ))}
        <Recentrer position={position} />
      </MapContainer>
    </div>
  )
}
