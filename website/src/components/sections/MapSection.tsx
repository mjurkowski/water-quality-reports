import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetReportsQuery, useGetGeocodeQuery } from '@/lib/api/generatedApi';
import { REPORT_TYPE_LABELS, formatDate } from '@/lib/utils/utils';
import { X, Plus, Search } from 'lucide-react';
import { ReportFormModal } from './ReportFormModal';
import axios from 'axios';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || '';

interface SelectedReport {
  uuid: string;
  types: string[];
  city: string | null;
  address: string | null;
  description: string | null;
  reportedAt: string;
  latitude: number;
  longitude: number;
}

export function MapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
  const [userMarker, setUserMarker] = useState<L.Marker | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{lat: number; lng: number; address?: string; city?: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Geocoding search - only triggered on explicit user confirmation (Enter key or button click)
  // This complies with Nominatim usage policy which prohibits autocomplete/search-as-you-type
  const { data: geocodeData, isFetching: isSearching } = useGetGeocodeQuery(
    { q: submittedQuery },
    { skip: submittedQuery.length < 3 }
  );

  // Fetch all reports (up to limit)
  const { data } = useGetReportsQuery({
    limit: 1000
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: 'center', // Enable scroll zoom by default, centered on cursor
    }).setView([52.0, 19.0], 6);
    mapInstanceRef.current = map;

    const tileUrl = MAPTILER_KEY
      ? `https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: MAPTILER_KEY
        ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
        : '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    // Click handler to place marker
    map.on('click', async (e: L.LeafletMouseEvent) => {
      // Remove previous user marker if exists
      if (userMarker) {
        mapInstanceRef.current?.removeLayer(userMarker);
      }

      // Create red marker for new report location
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const marker = L.marker([e.latlng.lat, e.latlng.lng], { icon: redIcon });
      marker.addTo(map);
      marker.bindPopup('Twoja nowa lokalizacja zgłoszenia. Kliknij marker aby otworzyć formularz.').openPopup();

      // Add click handler to open form modal
      marker.on('click', (markerEvent) => {
        L.DomEvent.stopPropagation(markerEvent);
        setModalOpen(true);
      });

      setUserMarker(marker);

      // Set location without address initially
      setClickedLocation({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Empty dependency array - initialize only once

  useEffect(() => {
    if (!mapInstanceRef.current || !data?.reports) return;

    const map = mapInstanceRef.current;

    console.log('[MapSection] Rendering markers for reports:', data.reports.length);

    // Clear existing markers and clusters
    map.eachLayer((layer) => {
      if (layer instanceof L.MarkerClusterGroup || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    let validMarkerCount = 0;
    data.reports.forEach((report) => {
      // Skip reports without valid coordinates
      if (!report.latitude || !report.longitude) {
        console.warn('[MapSection] Skipping report without coordinates:', report.uuid);
        return;
      }

      // Skip reports without types
      if (!report.types || !Array.isArray(report.types) || report.types.length === 0) {
        console.warn('[MapSection] Skipping report without types:', report.uuid);
        return;
      }

      const typeLabels = report.types.map((t) => REPORT_TYPE_LABELS[t] || t).join(', ');

      const marker = L.marker([report.latitude, report.longitude]);
      validMarkerCount++;

      marker.on('click', (e) => {
        // Prevent event from bubbling to map click handler
        L.DomEvent.stopPropagation(e);

        // Show report details
        setSelectedReport({
          uuid: report.uuid ?? '',
          types: report.types ?? [],
          city: report.city ?? null,
          address: report.address ?? null,
          description: report.description ?? null,
          reportedAt: report.reportedAt ?? new Date().toISOString(),
          latitude: report.latitude ?? 0,
          longitude: report.longitude ?? 0,
        });
      });

      // Simple popup for quick view
      marker.bindPopup(`
        <div class="text-sm">
          <strong>${typeLabels}</strong><br/>
          ${report.city || 'Nieznana lokalizacja'}<br/>
          <small>${report.reportedAt ? formatDate(report.reportedAt) : 'Brak daty'}</small><br/>
          <em class="text-xs text-gray-500">Kliknij marker aby zobaczyć szczegóły</em>
        </div>
      `);

      markers.addLayer(marker);
    });

    console.log('[MapSection] Added', validMarkerCount, 'valid markers to cluster group');
    map.addLayer(markers);
    console.log('[MapSection] Cluster group added to map');
  }, [data]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.length >= 3) {
      setSubmittedQuery(searchQuery);
      setShowResults(true);
    }
  };

  const handleSelectLocation = (lat: number, lon: number, address?: string) => {
    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;

      // Remove previous user marker if it exists
      if (userMarker) {
        map.removeLayer(userMarker);
      }

      // Create a red marker icon
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Create and add the red marker
      const marker = L.marker([lat, lon], { icon: redIcon });
      marker.addTo(map);
      marker.bindPopup('Twoja nowa lokalizacja zgłoszenia').openPopup();

      // Store the marker reference
      setUserMarker(marker);

      // Set location with address from search
      setClickedLocation({ lat, lng: lon, address });

      // Zoom to the selected location (zoom level 16 for strong zoom)
      map.setView([lat, lon], 16);

      // Close the search results
      setShowResults(false);
      setSearchQuery('');
      setSubmittedQuery('');
    }
  };

  // Function to perform reverse geocoding
  const performReverseGeocoding = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await axios.get(`${API_URL}/geocode/reverse`, {
        params: { lat, lon: lng }
      });

      if (response.data) {
        setClickedLocation(prev => prev ? {
          ...prev,
          address: response.data.address,
          city: response.data.city
        } : null);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  return (
    <>
    <section id="map" className="py-16">
      <div className="container max-w-none px-0">
        <div className="mb-4 px-4">
          {/* Location search above map */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Wyszukaj lokalizację (np. Warszawa)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(false);
                  }}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={searchQuery.length < 3}>
                Szukaj
              </Button>
            </div>

            {/* Search results dropdown */}
            {showResults && submittedQuery.length >= 3 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-[1000] max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-sm text-muted-foreground">Wyszukiwanie...</div>
                ) : geocodeData?.results && geocodeData.results.length > 0 ? (
                  geocodeData.results.map((result, index) => (
                    result.lat !== undefined && result.lon !== undefined ? (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectLocation(result.lat!, result.lon!, result.display_name ?? undefined)}
                        className="w-full text-left p-3 hover:bg-accent border-b last:border-b-0 text-sm"
                      >
                        {result.display_name}
                      </button>
                    ) : null
                  ))
                ) : (
                  <div className="p-3 text-sm text-muted-foreground">Brak wyników</div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="relative">
          {/* Map - full width, larger height */}
          <div ref={mapRef} className="h-[700px] w-full" />

          {/* Report details drawer */}
          {selectedReport && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-[1000] max-h-[400px] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Szczegóły zgłoszenia</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedReport.city || 'Nieznana lokalizacja'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReport(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Typy problemów</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedReport.types.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {REPORT_TYPE_LABELS[type] || type}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedReport.description && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Opis</h4>
                      <p className="text-sm mt-1">{selectedReport.description}</p>
                    </div>
                  )}

                  {selectedReport.address && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground">Adres</h4>
                      <p className="text-sm mt-1">{selectedReport.address}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Lokalizacja</h4>
                    <p className="text-sm mt-1">
                      {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Data zgłoszenia</h4>
                    <p className="text-sm mt-1">{formatDate(selectedReport.reportedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>

    {/* Report Form Modal */}
    <ReportFormModal
      initialLat={clickedLocation?.lat || 52.0}
      initialLng={clickedLocation?.lng || 19.0}
      initialAddress={clickedLocation?.address}
      initialCity={clickedLocation?.city}
      open={modalOpen}
      onOpenChange={(open) => {
        // When opening the modal, trigger reverse geocoding if we don't have address yet
        if (open && clickedLocation && !clickedLocation.address) {
          performReverseGeocoding(clickedLocation.lat, clickedLocation.lng);
        }
        setModalOpen(open);
      }}
      isLoadingAddress={isReverseGeocoding}
      trigger={
        <Button
          className="fixed bottom-6 right-6 z-[1000] h-14 w-14 rounded-full shadow-lg"
          size="icon"
          disabled={!clickedLocation}
        >
          <Plus className="h-6 w-6" />
        </Button>
      }
    />
    </>
  );
}
