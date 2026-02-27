"use client";

import Link from "next/link";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import { LocationType } from "@prisma/client";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { getLocationTypeLabel, getShelterStatusLabel } from "@/lib/utils";

const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

type MapShelter = {
  id: string;
  type: LocationType;
  name: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  status: "OPEN" | "FULL" | "CLOSED";
};

type MapViewProps = {
  shelters: MapShelter[];
  className?: string;
  zoom?: number;
};

function getCenter(shelters: MapShelter[]): [number, number] {
  if (shelters.length === 0) return [-21.749, -43.349];
  if (shelters.length === 1) return [shelters[0].lat, shelters[0].lng];

  const lat = shelters.reduce((acc, item) => acc + item.lat, 0) / shelters.length;
  const lng = shelters.reduce((acc, item) => acc + item.lng, 0) / shelters.length;
  return [lat, lng];
}

export function MapView({ shelters, className, zoom = 12 }: MapViewProps) {
  const center = getCenter(shelters);

  return (
    <div className={className}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full min-h-[320px] rounded-2xl">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {shelters.map((shelter) => (
            <Marker key={shelter.id} position={[shelter.lat, shelter.lng]}>
              <Popup>
                <div className="space-y-2">
                  <p className="font-semibold">{shelter.name}</p>
                  <p className="text-sm">
                    {shelter.neighborhood}, {shelter.city}
                  </p>
                  <p className="text-sm">Tipo: {getLocationTypeLabel(shelter.type)}</p>
                  {shelter.type === "SHELTER" && (
                    <p className="text-sm">Status: {getShelterStatusLabel(shelter.status)}</p>
                  )}
                  <Link href={`/abrigos/${shelter.id}`} className="text-sm font-semibold text-blue-700 underline">
                    Ver detalhes
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
