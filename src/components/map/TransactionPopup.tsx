'use client';

import { Transaction } from '@/types/transaction';
import { formatPrice, formatPricePerM2, formatArea, formatDateShort } from '@/lib/format';
import { getColor } from '@/lib/constants';

/**
 * Generates HTML content for a transaction popup in Leaflet.
 * Used by MarkerCluster for individual transaction markers.
 */
export function createTransactionPopupContent(tx: Transaction): string {
  const priceColor = getColor(tx.cenaNaM2);

  const novogradnjaBadge = tx.novogradnja
    ? `<span style="display: inline-flex; align-items: center; gap: 4px; background: #dcfce7; color: #16a34a; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px; margin-left: 8px;">
        <span style="font-size: 10px;">✨</span> Novogradnja
       </span>`
    : '';

  const letoIzgradnjeHtml = tx.letoIzgradnje
    ? `<div style="display: flex; justify-content: space-between; padding: 4px 0;">
        <span style="color: #6b7280; font-size: 12px;">Leto izgradnje</span>
        <span style="font-weight: 500; font-size: 12px; color: #374151;">${tx.letoIzgradnje}</span>
       </div>`
    : '';

  const steviloSobHtml = tx.steviloSob
    ? `<div style="display: flex; justify-content: space-between; padding: 4px 0;">
        <span style="color: #6b7280; font-size: 12px;">Število sob</span>
        <span style="font-weight: 500; font-size: 12px; color: #374151;">${tx.steviloSob}</span>
       </div>`
    : '';

  const nadstropjeHtml = tx.nadstropje
    ? `<div style="display: flex; justify-content: space-between; padding: 4px 0;">
        <span style="color: #6b7280; font-size: 12px;">Nadstropje</span>
        <span style="font-weight: 500; font-size: 12px; color: #374151;">${tx.nadstropje}</span>
       </div>`
    : '';

  return `
    <div style="min-width: 280px; max-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
      <!-- Header -->
      <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 2px solid #059669;">
        <div style="width: 36px; height: 36px; background: linear-gradient(135deg, ${priceColor} 0%, ${priceColor}dd 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="color: white; font-size: 16px;">${tx.tip === 1 ? '🏠' : tx.tip === 2 ? '🏢' : tx.tip === 3 || tx.tip === 4 ? '🅿️' : '🏛️'}</span>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 14px; color: #111827; line-height: 1.3; word-wrap: break-word;">
            ${tx.naslov}
            ${novogradnjaBadge}
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
            <span style="font-size: 12px; color: #6b7280;">${tx.obcina}</span>
            <span style="font-size: 10px; color: #d1d5db;">•</span>
            <span style="font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 1px 6px; border-radius: 4px;">${tx.tipNaziv}</span>
          </div>
        </div>
      </div>

      <!-- Price highlight -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 10px; padding: 12px; margin-bottom: 12px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">
          ${formatPrice(tx.cena)}
        </div>
        <div style="display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 6px;">
          <span style="font-size: 13px; color: #374151; font-weight: 500;">${formatPricePerM2(tx.cenaNaM2)}</span>
          <span style="font-size: 10px; color: #d1d5db;">•</span>
          <span style="font-size: 13px; color: #374151; font-weight: 500;">${formatArea(tx.uporabnaPovrsina)}</span>
        </div>
      </div>

      <!-- Details -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 10px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
          <span style="color: #6b7280; font-size: 12px;">Datum prodaje</span>
          <span style="font-weight: 600; font-size: 12px; color: #111827;">${formatDateShort(tx.datum)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
          <span style="color: #6b7280; font-size: 12px;">Katastrska občina</span>
          <span style="font-weight: 500; font-size: 12px; color: #374151;">${tx.imeKo}</span>
        </div>
        ${letoIzgradnjeHtml}
        ${steviloSobHtml}
        ${nadstropjeHtml}
      </div>

      <!-- Link to map detail -->
      <a href="/zemljevid/${tx.id}"
         style="display: block; text-align: center; background: #059669; color: white; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; margin-top: 12px;"
         onmouseover="this.style.background='#047857'"
         onmouseout="this.style.background='#059669'">
        Podrobnosti transakcije →
      </a>
    </div>
  `;
}

/**
 * Creates HTML content for a cluster popup showing aggregated data
 */
export function createClusterPopupContent(count: number, avgPrice: number, totalValue: number): string {
  return `
    <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif; text-align: center;">
      <div style="font-size: 32px; font-weight: 800; color: #059669; margin-bottom: 4px;">
        ${count}
      </div>
      <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">
        transakcij na tem območju
      </div>
      <div style="background: #f9fafb; border-radius: 8px; padding: 10px;">
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span style="color: #6b7280; font-size: 12px;">Povprečna cena/m²</span>
          <span style="font-weight: 600; font-size: 12px; color: #111827;">${formatPricePerM2(avgPrice)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span style="color: #6b7280; font-size: 12px;">Skupna vrednost</span>
          <span style="font-weight: 600; font-size: 12px; color: #111827;">${formatPrice(totalValue)}</span>
        </div>
      </div>
      <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">
        Približaj za posamezne transakcije
      </div>
    </div>
  `;
}
