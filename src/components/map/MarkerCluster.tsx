'use client';

import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Transaction } from '@/types/transaction';
import { getColor } from '@/lib/constants';
import { createTransactionPopupContent, createClusterPopupContent } from './TransactionPopup';

// Extend Leaflet types for markercluster
declare module 'leaflet' {
  interface MarkerClusterGroup extends L.FeatureGroup {
    getAllChildMarkers(): L.Marker[];
  }
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
  interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    maxClusterRadius?: number | ((zoom: number) => number);
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    disableClusteringAtZoom?: number;
    iconCreateFunction?: (cluster: L.MarkerCluster) => L.DivIcon | L.Icon;
  }
  interface MarkerCluster {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    getBounds(): L.LatLngBounds;
    getLatLng(): L.LatLng;
  }
}

export interface MarkerClusterLayerOptions {
  map: L.Map;
  transactions: Transaction[];
  minZoomForMarkers?: number;
}

/**
 * Creates and manages a marker cluster layer for transactions.
 * Uses vanilla Leaflet with leaflet.markercluster plugin.
 */
export function createMarkerClusterLayer(options: MarkerClusterLayerOptions): L.MarkerClusterGroup {
  const { map, transactions, minZoomForMarkers = 14 } = options;

  // Custom cluster icon function
  const createClusterIcon = (cluster: L.MarkerCluster): L.DivIcon => {
    const count = cluster.getChildCount();
    const markers = cluster.getAllChildMarkers();

    // Calculate average price per m2 for color
    let totalPrice = 0;
    let validCount = 0;
    markers.forEach((marker: L.Marker) => {
      const tx = (marker as unknown as { transactionData?: Transaction }).transactionData;
      if (tx && tx.cenaNaM2) {
        totalPrice += tx.cenaNaM2;
        validCount++;
      }
    });
    const avgPrice = validCount > 0 ? totalPrice / validCount : 2000;
    const color = getColor(avgPrice);

    // Determine size based on count
    let size = 40;
    let fontSize = 12;
    if (count >= 100) {
      size = 60;
      fontSize = 14;
    } else if (count >= 50) {
      size = 50;
      fontSize = 13;
    } else if (count >= 10) {
      size = 45;
      fontSize = 12;
    }

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: ${fontSize}px;
          color: ${avgPrice > 2000 ? 'white' : '#1f2937'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${count >= 1000 ? Math.round(count / 1000) + 'k' : count}
        </div>
      `,
      className: 'custom-cluster-icon',
      iconSize: L.point(size, size),
      iconAnchor: L.point(size / 2, size / 2),
    });
  };

  // Create marker cluster group
  const clusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: minZoomForMarkers,
    iconCreateFunction: createClusterIcon,
  });

  // Add cluster popup on click
  clusterGroup.on('clusterclick', (e: L.LeafletEvent & { layer: L.MarkerCluster }) => {
    const cluster = e.layer;
    const markers = cluster.getAllChildMarkers();
    const count = markers.length;

    let totalPrice = 0;
    let totalValue = 0;
    let validCount = 0;

    markers.forEach((marker: L.Marker) => {
      const tx = (marker as unknown as { transactionData?: Transaction }).transactionData;
      if (tx) {
        if (tx.cenaNaM2) {
          totalPrice += tx.cenaNaM2;
          validCount++;
        }
        totalValue += tx.cena;
      }
    });

    const avgPrice = validCount > 0 ? Math.round(totalPrice / validCount) : 0;

    // Only show popup if we're not about to zoom
    const currentZoom = map.getZoom();
    const bounds = cluster.getBounds();
    const targetZoom = map.getBoundsZoom(bounds);

    if (targetZoom >= minZoomForMarkers || currentZoom >= minZoomForMarkers - 1) {
      const popup = L.popup({ maxWidth: 280 })
        .setLatLng(cluster.getLatLng())
        .setContent(createClusterPopupContent(count, avgPrice, totalValue));
      popup.openOn(map);
    }
  });

  // Add markers for each transaction
  transactions.forEach((tx) => {
    if (!tx.lat || !tx.lon) return;

    const color = getColor(tx.cenaNaM2);

    const marker = L.circleMarker([tx.lat, tx.lon], {
      radius: 8,
      fillColor: color,
      color: 'white',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    }) as L.CircleMarker & { transactionData?: Transaction };

    // Store transaction data on marker for cluster aggregation
    marker.transactionData = tx;

    // Bind popup
    marker.bindPopup(createTransactionPopupContent(tx), {
      maxWidth: 340,
      closeButton: true,
      autoPan: true,
      autoPanPadding: L.point(50, 50),
    });

    // Hover effects
    marker.on('mouseover', () => {
      marker.setStyle({ weight: 3, radius: 10 });
      marker.bringToFront();
    });

    marker.on('mouseout', () => {
      marker.setStyle({ weight: 2, radius: 8 });
    });

    clusterGroup.addLayer(marker);
  });

  return clusterGroup;
}

/**
 * Loads transactions from multiple year files
 */
export async function loadTransactions(years: number[]): Promise<Transaction[]> {
  const allTransactions: Transaction[] = [];

  for (const year of years) {
    try {
      const response = await fetch(`/data/transactions/${year}.json`);
      if (response.ok) {
        const data = await response.json();
        allTransactions.push(...data);
      }
    } catch (error) {
      console.warn(`Failed to load transactions for ${year}:`, error);
    }
  }

  return allTransactions;
}
