import React from "react"

export function Preview({ sale, payments, formatNumber, statusText, statusClassForText }) {
  const invoiceNumber = `FAC-${String(sale?.id || "0").padStart(6, "0")}`
  const currentDate = new Date().toLocaleDateString('fr-FR')
  const logoSrc = "/img/Fatini_logo_ligth.png"
  
  return (
    <div className="bg-white text-gray-800 p-8" style={{ width: "210mm", minHeight: "297mm", fontFamily: "Arial, sans-serif" }}>
      {/* Logo en haut */}
      <div className="flex justify-center mb-6">
        <img 
          src={logoSrc} 
          alt="Fatini Logo" 
          className="h-60 object-contain"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextElementSibling.style.display = 'flex'
          }}
        />
        <div className="h-20 w-48 bg-gray-200 rounded-lg flex items-center justify-center hidden">
          <span className="text-gray-600 font-bold text-lg">FATINI</span>
        </div>
      </div>

      {/* En-tête */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-300">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">FACTURE</h1>
          <p className="text-gray-600">Oulled Iloul , Souk Sebt, Maroc</p>
        </div>
        
        <div className="text-right">
          <div className="mb-2">
            <span className="text-gray-600">Facture N°: </span>
            <strong className="text-lg">{invoiceNumber}</strong>
          </div>
          <div>
            <span className="text-gray-600">Date: </span>
            <strong>{currentDate}</strong>
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">FACTURÉ À</h2>
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <p className="font-bold text-gray-800 text-lg">{sale?.client?.name || "Non spécifié"}</p>
          <p className="text-gray-600">Tél: {sale?.client?.phone || "-"}</p>
        </div>
      </div>

      

      {/* Tableau des articles */}
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-3 border border-gray-300 text-gray-700 font-semibold">No</th>
            <th className="text-left p-3 border border-gray-300 text-gray-700 font-semibold">Description</th>
            <th className="text-right p-3 border border-gray-300 text-gray-700 font-semibold">Prix</th>
            <th className="text-right p-3 border border-gray-300 text-gray-700 font-semibold">QTY</th>
            <th className="text-right p-3 border border-gray-300 text-gray-700 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {(sale?.sale_items || []).map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-3 border border-gray-300 text-gray-600">{index + 1}</td>
              <td className="p-3 border border-gray-300">
                <div className="font-medium text-gray-800">{item.product?.name || "Produit"}</div>
              </td>
              <td className="p-3 border border-gray-300 text-right text-gray-600">{formatNumber(item.unit_price)} DH</td>
              <td className="p-3 border border-gray-300 text-right text-gray-600">{item.quantity}</td>
              <td className="p-3 border border-gray-300 text-right font-semibold text-gray-800">{formatNumber(item.total_price)} DH</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Services additionnels */}
      {(sale?.job || sale?.transport) && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">SERVICES ADDITIONNELS</h3>
          <div className="space-y-2">
            {sale?.job && (
              <div className="flex justify-between bg-gray-50 p-3 border border-gray-200 rounded">
                <span className="font-medium text-gray-800">Service: {sale.job.name}</span>
                <span className="font-semibold text-gray-800">{formatNumber(sale.job.price)} DH</span>
              </div>
            )}
            {sale?.transport && (
              <div className="flex justify-between bg-gray-50 p-3 border border-gray-200 rounded">
                <span className="font-medium text-gray-800">Transport: {sale.transport.name}</span>
                <span className="font-semibold text-gray-800">{formatNumber(sale.transport.price)} DH</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historique des paiements */}
      {payments && payments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">HISTORIQUE DES PAIEMENTS</h3>
          <div className="bg-gray-50 p-4 border border-gray-200 rounded">
            {payments.map((payment, index) => (
              <div key={index} className="flex justify-between mb-2 last:mb-0">
                <div>
                  <span className="font-medium text-gray-800">
                    {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-gray-600 ml-2">- {payment.payment_method || "Espèces"}</span>
                </div>
                <span className="font-semibold text-green-600">{formatNumber(payment.amount)} DH</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totaux */}
      <div className="mt-8 pt-6 border-t border-gray-300">
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">TOTAL:</span>
              <span className="font-semibold text-gray-800">{formatNumber(sale?.total_amount || 0)} DH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payé:</span>
              <span className="font-semibold text-green-600">{formatNumber(sale?.paid_amount || 0)} DH</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2">
              <span className="text-lg font-bold text-gray-800">Reste à payer:</span>
              <span className="text-lg font-bold text-gray-800">{formatNumber(sale?.remaining_amount || 0)} DH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signature et coordonnées */}
      <div className="mt-12 pt-6 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-4">
              <p className="font-bold text-gray-800 mb-1">Redouane Fatini</p>
              <p className="text-gray-600">Manager</p>
            </div>
            <p className="text-gray-600 italic">Merci pour votre confiance !</p>
          </div>
          
          <div className="text-right">
            <p className="text-gray-600 mb-1">
              <strong className="text-gray-800">Téléphone:</strong> 0634616342
            </p>
            <p className="text-gray-600 mb-1">
              <strong className="text-gray-800">Email:</strong> ilyassfatini@gmail.com
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-800">Site web:</strong> en développement
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function buildPrintHTML(sale, payments, formatNumber, getStatusText, statusClassForText) {
  function escapeHtml(str) {
    if (str === null || str === undefined) return ""
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  const invoiceNumber = `FAC-${String(sale?.id || "0").padStart(6, "0")}`
  const currentDate = new Date().toLocaleDateString('fr-FR')
  const saleDate = sale?.sale_date ? new Date(sale.sale_date).toLocaleDateString('fr-FR') : currentDate
  const logoSrc = typeof window !== "undefined" ? `${window.location.origin}/img/Fatini_logo_ligth.png` : `/img/Fatini_logo_ligth.png`

  // Construction du tableau des produits
  const productsRows = (sale?.sale_items || []).map((item, index) => `
    <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
      <td class="p-3 border border-gray-300 text-gray-600">${index + 1}</td>
      <td class="p-3 border border-gray-300">
        <div class="font-medium text-gray-800">${escapeHtml(item.product?.name || "Produit")}</div>
      </td>
      <td class="p-3 border border-gray-300 text-right text-gray-600">${escapeHtml(formatNumber(item.unit_price))} DH</td>
      <td class="p-3 border border-gray-300 text-right text-gray-600">${escapeHtml(item.quantity)}</td>
      <td class="p-3 border border-gray-300 text-right font-semibold text-gray-800">${escapeHtml(formatNumber(item.total_price))} DH</td>
    </tr>
  `).join('')

  // Services additionnels
  const servicesHtml = (sale?.job || sale?.transport) ? `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 12px;">SERVICES ADDITIONNELS</h3>
      <div style="space-y: 8px;">
        ${sale?.job ? `
          <div style="display: flex; justify-content: space-between; background: #f9fafb; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px;">
            <span style="font-weight: 500; color: #374151;">Services: "${escapeHtml(sale.job.name)}"</span>
            <span style="font-weight: 600; color: #374151;">${escapeHtml(formatNumber(sale.job.price))} DH</span>
          </div>
        ` : ''}
        ${sale?.transport ? `
          <div style="display: flex; justify-content: space-between; background: #f9fafb; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; margin-top: 8px;">
            <span style="font-weight: 500; color: #374151;">Transport: "${escapeHtml(sale.transport.name)}"</span>
            <span style="font-weight: 600; color: #374151;">${escapeHtml(formatNumber(sale.transport.price))} DH</span>
          </div>
        ` : ''}
      </div>
    </div>
  ` : ''

  // Historique des paiements
  const paymentsHtml = payments && payments.length > 0 ? `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 12px;">HISTORIQUE DES PAIEMENTS</h3>
      <div style="background: #f9fafb; padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px;">
        ${payments.map(payment => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; last-child: margin-bottom: 0;">
            <div>
              <span style="font-weight: 500; color: #374151;">
                ${new Date(payment.payment_date).toLocaleDateString('fr-FR')}
              </span>
              <span style="color: #6b7280; margin-left: 8px;">- ${escapeHtml(payment.payment_method || "Espèces")}</span>
            </div>
            <span style="font-weight: 600; color: #059669;">${escapeHtml(formatNumber(payment.amount))} DH</span>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Facture ${escapeHtml(invoiceNumber)}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .invoice-container {
            box-shadow: none;
            border: none;
          }
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #374151;
        }
        
        .invoice-container {
          background: white;
          padding: 32px;
          max-width: 250mm;
          min-height: 297mm;
          margin: 0 auto;
        }
        
        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        
        .logo {
          height: 200px;
          object-fit: contain;
        }
        
        .logo-fallback {
          height: 80px;
          width: 192px;
          background: #e5e7eb;
          border-radius: 8px;
          display: none;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: #4b5563;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #d1d5db;
        }
        
        .invoice-info {
          text-align: right;
        }
        
        .client-info {
          margin-bottom: 32px;
        }
        
        .client-card {
          background: #f9fafb;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        
        th {
          background: #f3f4f6;
          text-align: left;
          padding: 12px;
          border: 1px solid #d1d5db;
          font-weight: 600;
          color: #374151;
        }
        
        td {
          padding: 12px;
          border: 1px solid #e5e7eb;
        }
        
        .totals {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #d1d5db;
        }
        
        .totals-grid {
          display: flex;
          justify-content: flex-end;
        }
        
        .totals-inner {
          width: 256px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid #d1d5db;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        
        .contact-info {
          text-align: right;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Logo -->
        <div class="logo-container">
          <img src="${logoSrc}" class="logo" alt="Fatini Logo" 
               onerror="this.style.display='none'; document.getElementById('logo-fallback').style.display='flex';" />
          <div id="logo-fallback" class="logo-fallback">FATINI</div>
        </div>

        <!-- En-tête -->
        <div class="header">
          <div>
            <h1 style="font-size: 32px; font-weight: bold; color: #111827; margin: 0 0 4px 0;">FACTURE</h1>
            <p style="color: #6b7280; margin: 0;">OULLED ILLOUL, SOUK SEBT, MAROC</p>
          </div>
          
          <div class="invoice-info">
            <div style="margin-bottom: 8px;">
              <span style="color: #6b7280;">Facture N°: </span>
              <strong style="font-size: 18px;">${escapeHtml(invoiceNumber)}</strong>
            </div>
            <div>
              <span style="color: #6b7280;">Date: </span>
              <strong>${escapeHtml(currentDate)}</strong>
            </div>
          </div>
        </div>
        
        <!-- Informations client -->
        <div class="client-info">
          <h2 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 12px;">FACTURÉ À</h2>
          <div class="client-card">
            <p style="font-weight: bold; font-size: 18px; color: #111827; margin: 0 0 4px 0;">${escapeHtml(sale?.client?.name || "Non spécifié")}</p>
            <p style="color: #6b7280; margin: 0;">Tél: ${escapeHtml(sale?.client?.phone || "-")}</p>
          </div>
        </div>
        
        
        
        <!-- Tableau des articles -->
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Description</th>
              <th style="text-align: right;">Prix</th>
              <th style="text-align: right;">QTY</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productsRows || `
              <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #6b7280;">
                  Aucun produit
                </td>
              </tr>
            `}
          </tbody>
        </table>
        
        ${servicesHtml}
        ${paymentsHtml}
        
        <!-- Totaux -->
        <div class="totals">
          <div class="totals-grid">
            <div class="totals-inner">
              <div class="total-row">
                <span style="color: #000000ff; font-weight: bold; font-size: 20px;">TOTAL:</span>
                <span style="font-weight: bold; color: #000000ff;font-size: 20px; ">${escapeHtml(formatNumber(sale?.total_amount || 0))} DH</span>
              </div>
              <div class="total-row">
                <span style="color: #059669; font-weight: 600;">Payé:</span>
                <span style="font-weight: 600; color: #059669;">${escapeHtml(formatNumber(sale?.paid_amount || 0))} DH</span>
              </div>
              <div class="total-row" style="border-top: 1px solid #d1d5db; padding-top: 8px; margin-top: 8px;">
                <span style="  color: #e2112cff;">Reste à payer:</span>
                <span style=" color: #e2112cff; font-weight: 600;">${escapeHtml(formatNumber(sale?.remaining_amount || 0))} DH</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pied de page -->
        <div class="footer">
          <div class="footer-grid">
            <div>
              <div style="margin-bottom: 16px;">
                <p style="font-weight: bold; color: #111827; margin: 0 0 4px 0;">Radouane Fatini</p>
                <p style="color: #6b7280; margin: 0;">Manager</p>
              </div>
              <p style="color: #6b7280; font-style: italic; margin: 0;">Merci pour votre confiance !</p>
            </div>
            
            <div class="contact-info">
              <p style="color: #6b7280; margin: 4px 0;">
                <strong style="color: #374151;">Téléphone:</strong> 0634616342
              </p>
              <p style="color: #6b7280; margin: 4px 0;">
                <strong style="color: #374151;">Email:</strong> ilyassfatini@gmail.com
              </p>
              <p style="color: #6b7280; margin: 4px 0;">
                <strong style="color: #374151;">Site web:</strong> en développement
              </p>
            </div>
          </div>
        </div>
      </div>

      <script>
        // Gestion d'erreur du logo pour l'impression
        document.addEventListener('DOMContentLoaded', function() {
          var logo = document.querySelector('.logo');
          var fallback = document.getElementById('logo-fallback');
          if (logo && !logo.complete) {
            logo.onerror = function() {
              this.style.display = 'none';
              if (fallback) fallback.style.display = 'flex';
            };
          }
        });
      </script>
    </body>
    </html>
  `
}

const ModernInvoiceClean = { Preview, buildPrintHTML }
export default ModernInvoiceClean