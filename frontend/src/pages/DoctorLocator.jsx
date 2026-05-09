import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import Navbar from '../components/Navbar'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const doctorIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C7 0 2 5.5 2 12c0 9 12 24 12 24S26 21 26 12C26 5.5 21 0 14 0z" fill="#00d4aa" stroke="#060b1a" stroke-width="1.5"/><circle cx="14" cy="12" r="6" fill="white"/><text x="14" y="16" text-anchor="middle" font-size="8" fill="#060b1a">+</text></svg>'
  )}`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
})

const selectedIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42"><path d="M16 0C8 0 2 6.5 2 14c0 10 14 28 14 28S30 24 30 14C30 6.5 24 0 16 0z" fill="#0099ff" stroke="#060b1a" stroke-width="1.5"/><circle cx="16" cy="14" r="7" fill="white"/><text x="16" y="18" text-anchor="middle" font-size="9" fill="#060b1a">+</text></svg>'
  )}`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
})

function FlyToLocation({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 })
  }, [center, zoom])
  return null
}

function DoctorLocator() {
  const [city, setCity] = useState('')
  const [searching, setSearching] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629])
  const [mapZoom, setMapZoom] = useState(5)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const searchDoctors = async () => {
    if (!city.trim()) return
    setSearching(true)
    setDoctors([])
    setSearched(false)
    setError('')
    setSelectedDoctor(null)

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', India')}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const geoData = await geoRes.json()

      if (!geoData || geoData.length === 0) {
        setError('City "' + city + '" not found. Try a different spelling.')
        setSearching(false)
        return
      }

      const lat = parseFloat(geoData[0].lat)
      const lon = parseFloat(geoData[0].lon)
      setMapCenter([lat, lon])
      setMapZoom(13)

      const radius = 10000
      const query = `
        [out:json][timeout:10];
        (
        node["amenity"="hospital"]["name"~"eye|ophthal|vision|netra|retina",i](around:${radius},${lat},${lon});
        node["amenity"="clinic"]["name"~"eye|ophthal|vision|netra|retina",i](around:${radius},${lat},${lon});
        );
        out body 20;
        `

      const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      })
      const overpassData = await overpassRes.json()
      setSearched(true)

      if (overpassData.elements && overpassData.elements.length > 0) {
        const formatted = overpassData.elements
          .filter(el => el.lat || el.center?.lat)
          .map((el, i) => ({
            id: el.id,
            name: el.tags?.name || 'Eye Care Clinic',
            address: [
              el.tags?.['addr:housename'],
              el.tags?.['addr:street'],
              el.tags?.['addr:suburb'],
              el.tags?.['addr:city'],
            ].filter(Boolean).join(', ') || 'Address not available',
            phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
            website: el.tags?.website || el.tags?.['contact:website'] || null,
            type: el.tags?.amenity || 'clinic',
            speciality: el.tags?.['healthcare:speciality'] || null,
            lat: el.lat || el.center?.lat,
            lng: el.lon || el.center?.lon,
            index: i,
          }))
        setDoctors(formatted)
      } else {
        const fallbackQuery = `
          [out:json][timeout:25];
          (
            node["amenity"~"hospital|clinic"]["name"~"eye|ophthal|vision|netralaya|netra",i](around:${radius},${lat},${lon});
            node["amenity"="hospital"](around:5000,${lat},${lon});
          );
          out center 15;
        `
        const fallbackRes = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: fallbackQuery,
        })
        const fallbackData = await fallbackRes.json()
        if (fallbackData.elements?.length > 0) {
          const formatted = fallbackData.elements
            .filter(el => el.lat || el.center?.lat)
            .slice(0, 10)
            .map((el, i) => ({
              id: el.id,
              name: el.tags?.name || 'Hospital/Clinic',
              address: [
                el.tags?.['addr:street'],
                el.tags?.['addr:suburb'],
                el.tags?.['addr:city'],
              ].filter(Boolean).join(', ') || 'Address not available',
              phone: el.tags?.phone || null,
              website: el.tags?.website || null,
              type: el.tags?.amenity || 'hospital',
              lat: el.lat || el.center?.lat,
              lng: el.lon || el.center?.lon,
              index: i,
            }))
          setDoctors(formatted)
        }
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') searchDoctors()
  }

  const focusDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setMapCenter([doctor.lat, doctor.lng])
    setMapZoom(16)
  }

  const getTypeLabel = (type) => {
    if (type === 'hospital') return { label: 'Hospital', color: '#0099ff' }
    if (type === 'clinic') return { label: 'Clinic', color: '#00d4aa' }
    return { label: 'Doctor', color: '#f59e0b' }
  }

  const quickCities = ['Mumbai', 'Delhi', 'Kolkata', 'Bengaluru', 'Hyderabad', 'Chennai']

  return (
    <div style={{ background: '#060b1a', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .leaflet-popup-content-wrapper {
          background: #0d1628 !important;
          border: 1px solid rgba(0,212,170,0.2) !important;
          border-radius: 12px !important;
          color: #f0f4ff !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip { background: #0d1628 !important; }
        .leaflet-popup-close-button { color: rgba(255,255,255,0.4) !important; }
        .leaflet-container { background: #060b1a !important; }
        .leaflet-tile { filter: brightness(0.85) saturate(0.9); }
      `}</style>

      <Navbar />

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '48px 2rem 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', padding: '5px 14px', borderRadius: '100px', marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '6px', background: '#00d4aa', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', color: '#00d4aa', fontWeight: '600', letterSpacing: '0.08em' }}>DOCTOR LOCATOR</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '42px', fontWeight: '400', color: '#f0f4ff', margin: '0 0 8px' }}>
            Find Eye Specialists
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Locate ophthalmologists and eye care clinics near you — powered by OpenStreetMap
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>
              📍
            </span>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your city (e.g. Kolkata, Mumbai, Delhi...)"
              style={{
                width: '100%', padding: '16px 16px 16px 48px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px', color: '#f0f4ff',
                fontSize: '15px', outline: 'none',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <button
            onClick={searchDoctors}
            disabled={searching}
            style={{
              padding: '16px 32px',
              background: searching ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #00d4aa, #0099ff)',
              color: searching ? 'rgba(255,255,255,0.3)' : '#060b1a',
              fontWeight: '700', fontSize: '15px',
              border: 'none', borderRadius: '14px',
              cursor: searching ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: searching ? 'none' : '0 8px 24px rgba(0,212,170,0.25)',
            }}
          >
            {searching ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Searching...
              </>
            ) : 'Find Doctors'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* Map + List */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>

          {/* Map */}
          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', height: '600px' }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <FlyToLocation center={mapCenter} zoom={mapZoom} />

              {doctors.map((doc) => (
                <Marker
                  key={doc.id}
                  position={[doc.lat, doc.lng]}
                  icon={selectedDoctor?.id === doc.id ? selectedIcon : doctorIcon}
                  eventHandlers={{ click: () => focusDoctor(doc) }}
                >
                  <Popup>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", minWidth: '180px' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#00d4aa', marginBottom: '4px' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8a9bb0', marginBottom: '8px', lineHeight: 1.4 }}>
                        {doc.address}
                      </div>
                      {doc.phone && (
                        <div style={{ fontSize: '12px', color: '#f0f4ff', marginBottom: '4px' }}>
                          {doc.phone}
                        </div>
                      )}
                      <div style={{ marginTop: '8px' }}>
                        <a
                          href={'https://www.openstreetmap.org/?mlat=' + doc.lat + '&mlon=' + doc.lng + '&zoom=17'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '12px', color: '#0099ff', textDecoration: 'none', fontWeight: '600' }}
                        >
                          View on Map
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Doctors List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>

            {!searched && !searching && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.3 }}>🏥</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
                  Enter your city above
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', lineHeight: 1.6, marginBottom: '16px' }}>
                  We will find eye specialists and clinics near you using OpenStreetMap data
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {quickCities.map(c => (
                    <button
                      key={c}
                      onClick={() => setCity(c)}
                      style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', color: '#00d4aa', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searching && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid rgba(0,212,170,0.2)', borderTopColor: '#00d4aa', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Searching near {city}...</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>Querying OpenStreetMap database</div>
              </div>
            )}

            {searched && doctors.length === 0 && !searching && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>😕</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
                  No eye specialists found
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
                  Try a nearby larger city. OpenStreetMap data may be limited in some areas.
                </div>
              </div>
            )}

            {doctors.length > 0 && (
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', padding: '0 4px' }}>
                Found <span style={{ color: '#00d4aa', fontWeight: '600' }}>{doctors.length}</span> results near {city}
              </div>
            )}

            {doctors.map((doc) => {
              const typeInfo = getTypeLabel(doc.type)
              const isSelected = selectedDoctor?.id === doc.id
              return (
                <div
                  key={doc.id}
                  onClick={() => focusDoctor(doc)}
                  style={{
                    background: isSelected ? 'rgba(0,212,170,0.08)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid ' + (isSelected ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.07)'),
                    borderRadius: '14px', padding: '14px 16px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#f0f4ff', lineHeight: 1.3, flex: 1, paddingRight: '8px' }}>
                      {doc.name}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '600', color: typeInfo.color,
                      background: typeInfo.color + '15',
                      border: '1px solid ' + typeInfo.color + '30',
                      padding: '2px 8px', borderRadius: '100px', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {typeInfo.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', lineHeight: 1.4 }}>
                    {doc.address}
                  </div>

                  {doc.phone && (
                    <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                      <a href={'tel:' + doc.phone} style={{ color: '#00d4aa', textDecoration: 'none' }}>
                        {doc.phone}
                      </a>
                    </div>
                  )}

                  {doc.speciality && (
                    <div style={{ fontSize: '11px', color: '#0099ff', marginBottom: '6px' }}>
                      {doc.speciality}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <a
                      href={'https://www.openstreetmap.org/?mlat=' + doc.lat + '&mlon=' + doc.lng + '&zoom=17'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: '12px', color: '#0099ff', textDecoration: 'none', fontWeight: '600' }}
                    >
                      View on Map
                    </a>
                    <a
                      href={'https://www.google.com/maps/search/' + encodeURIComponent(doc.name + ' ' + city)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
                    >
                      Google it
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Info banners */}
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(0,153,255,0.05)', border: '1px solid rgba(0,153,255,0.15)', borderRadius: '12px', padding: '14px 18px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(96,184,255,0.9)', marginBottom: '4px' }}>
              About this data
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              Results are from OpenStreetMap community data. Coverage may vary by city. Always call ahead to verify availability.
            </div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '12px', padding: '14px 18px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(245,158,11,0.9)', marginBottom: '4px' }}>
              Medical disclaimer
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              This is not a medical referral. Always verify doctor credentials and specialization before visiting.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DoctorLocator