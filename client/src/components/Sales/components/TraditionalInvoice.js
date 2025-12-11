import React from "react"

export function Preview({ sale, payments, formatNumber, statusText, statusClassForText }) {
  const ticketCode = `TKT-${String(sale?.id || "0").padStart(4, "0")}`
  
  return (
    <div className="dark:text-black" style={{ 
      width: "280px", 
      fontFamily: "'Courier New', monospace", 
      fontSize: "11px",
      padding: "10px",
      background: "white",
      border: "1px solid #333",
      lineHeight: "1.2"
    }}>
      {/* Header with logo and info side by side */}
      <div style={{ display: "flex",    justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", paddingBottom: "6px", borderBottom: "2px solid #000" }}>
        <div style={{ flex: 1 }}>
          <img 
            src="/img/Fatini_logo_ligth.png" 
            alt="FATINI" 
            style={{ 
              width: "70px", 
              height: "auto",
              filter: "contrast(1.2) brightness(0.9)",
             
            }} 
          />
        </div>
        <div style={{ flex: 1, textAlign: "right" ,  marginTop: "0.5rem" }}>
          <div style={{ fontWeight: "bold", fontSize: "12px" }}>FATINI</div>
          <div>OULLED ILLOUL,SOUK SEBT, MAROC</div>
          <div>Tél: 0634616342</div>
        </div>
      </div>

      {/* Client Info */}
      <div style={{ marginBottom: "6px", padding: "4px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "bold" }}>Client:</span>
          <span>{sale?.client?.name || "Non spécifié"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "bold" }}>Tél:</span>
          <span>{sale?.client?.phone || "-"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "bold" }}>Date:</span>
          <span>{sale?.sale_date ? new Date(sale.sale_date).toLocaleString("fr-FR") : new Date().toLocaleString("fr-FR")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "bold" }}>Réf:</span>
          <span>{ticketCode}</span>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ marginBottom: "6px" }}>
        <div style={{ 
          textAlign: "center", 
          fontWeight: "bold", 
          backgroundColor: "#f0f0f0",
          padding: "2px 0",
          border: "1px solid #000",
          marginBottom: "2px"
        }}>
          ARTICLES
        </div>
        
        {/* Table Header */}
        <div style={{ 
          display: "flex", 
          borderBottom: "1px solid #000",
          padding: "1px 0",
          fontWeight: "bold",
          fontSize: "10px"
        }}>
          <div style={{ width: "40%" }}>Produit</div>
          <div style={{ width: "20%", textAlign: "center" }}>Qty</div>
          <div style={{ width: "20%", textAlign: "right" }}>Prix U.</div>
          <div style={{ width: "20%", textAlign: "right" }}>Total</div>
        </div>

        {/* Table Rows */}
        {(sale?.sale_items || []).map((it, i) => (
          <div 
            key={i} 
            style={{ 
              display: "flex", 
              borderBottom: i === (sale?.sale_items?.length || 0) - 1 ? "2px solid #000" : "1px dotted #666",
              padding: "1px 0"
            }}
          >
            <div style={{ width: "40%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {it.product?.name || "Produit"}
            </div>
            <div style={{ width: "20%", textAlign: "center" }}>{it.quantity}</div>
            <div style={{ width: "20%", textAlign: "right" }}>{formatNumber(it.unit_price)}</div>
            <div style={{ width: "20%", textAlign: "right" }}>{formatNumber(it.total_price)}</div>
          </div>
        ))}
      </div>

      {/* Services */}
      {sale?.job && (
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          borderBottom: "1px dotted #666",
          padding: "2px 0"
        }}>
          <span>Service: {sale.job.name}</span>
          <span>{formatNumber(sale.job.price)} DH</span>
        </div>
      )}

      {sale?.transport && (
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          borderBottom: "1px dotted #666",
          padding: "2px 0"
        }}>
          <span>Transport: {sale.transport.name}</span>
          <span>{formatNumber(sale.transport.price)} DH</span>
        </div>
      )}

      {/* Totals */}
      <div style={{ marginTop: "6px" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          fontWeight: "bold",
          borderTop: "2px solid #000",
          paddingTop: "3px"
        }}>
          <span>TOTAL:</span>
          <span>{formatNumber(sale?.total_amount || 0)} DH</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Payé:</span>
          <span>{formatNumber(sale?.paid_amount || 0)} DH</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span>Restant:</span>
          <span>{formatNumber(sale?.remaining_amount || 0)} DH</span>
        </div>
      </div>

      {/* Status */}
      <div style={{ 
        textAlign: "center", 
        marginTop: "6px",
        padding: "3px",
        backgroundColor: "#f0f0f0",
        border: "1px solid #000"
      }}>
        <div style={{ fontWeight: "bold" }}>STATUT: {statusText}</div>
        <div style={{ fontSize: "10px" }}>{sale?.reference || "-"}</div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: "center", 
        marginTop: "6px",
        paddingTop: "4px",
        borderTop: "2px solid #000",
        fontSize: "9px"
      }}>
        <div>Merci pour votre confiance !</div>
        <div style={{ letterSpacing: "1px" }}>***</div>
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

  const statusText = getStatusText(sale)
  const ticketCode = `TKT-${String(sale?.id || "0").padStart(4, "0")}`
  const dateText = sale?.sale_date ? new Date(sale.sale_date).toLocaleString("fr-FR") : new Date().toLocaleString("fr-FR")

  // Construction des lignes d'articles avec structure de tableau
  const itemsRows = (sale?.sale_items || []).map(it => {
    const name = escapeHtml(it.product?.name || "Produit")
    const qty = escapeHtml(it.quantity ?? 1)
    const unit = escapeHtml(formatNumber(it.unit_price || 0))
    const tot = escapeHtml(formatNumber(it.total_price || 0))
    
    return `
      <div style="display: flex; border-bottom: ${it === sale.sale_items[sale.sale_items.length - 1] ? '2px solid #000' : '1px dotted #666'}; padding: 1px 0;">
        <div style="width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</div>
        <div style="width: 20%; text-align: center;">${qty}</div>
        <div style="width: 20%; text-align: right;">${unit}</div>
        <div style="width: 20%; text-align: right;">${tot}</div>
      </div>`
  }).join("")

  return `
    <!doctype html>
    <html lang="fr">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=280px"/>
      <title>BON A • ${escapeHtml(ticketCode)}</title>
      <style>
        @page { 
          size: 100mm 200mm; 
          margin: 10px; 
        }
        @media print { 
          body { 
            margin: 10px; 
            padding: 4px; 
          }
          * { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          width: 100mm;
          margin: 0;
          padding: 10px;
          background: white;
          line-height: 1.2;
        }
        
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start; 
          margin-bottom: 8px; 
          padding-bottom: 6px; 
          border-bottom: 2px solid #000; 
        }
        .section { 
          margin-bottom: 6px; 
        }
        .table-header {
          display: flex;
          border-bottom: 1px solid #000;
          padding: 1px 0;
          font-weight: bold;
          font-size: 15px;
        }
        .table-row {
          display: flex;
          padding: 1px 0;
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
        }
        .bold { 
          font-weight: bold; 
        }
        .center { 
          text-align: center; 
        }
        .right { 
          text-align: right; 
        }
        .footer { 
          font-size: 14px; 
        }
        .status-box {
          text-align: center;
          margin-top: 6px;
          padding: 3px;
          background-color: #f0f0f0;
          border: 1px solid #000;
        }
      </style>
    </head>
    <body>
      <!-- Header with logo -->
      <div class="header">
        <div style="flex: 1;">
          <img 
            src="/img/Fatini_logo_ligth.png" 
            alt="FATINI" 
            style="width: 85px; height: auto; filter: contrast(1.2) brightness(0.9);  " 
          />
        </div>
        <div style="flex: 1; text-align: right; margin-top: 1rem;">
          <div class="bold" style="font-size: 17px;">FATINI</div>
          <div>OULLED ILLOUL,SOUK SEBT, MAROC</div>
          <div>Tél: 0634616342</div>
        </div>
      </div>

      <!-- Client Info -->
      <div class="section">
        <div class="total-row">
          <span class="bold">Client:</span>
          <span>${escapeHtml(sale?.client?.name || "Non spécifié")}</span>
        </div>
        <div class="total-row">
          <span class="bold">Tél:</span>
          <span>${escapeHtml(sale?.client?.phone || "-")}</span>
        </div>
        <div class="total-row">
          <span class="bold">Date:</span>
          <span>${escapeHtml(dateText)}</span>
        </div>
        <div class="total-row">
          <span class="bold">Réf:</span>
          <span>${escapeHtml(ticketCode)}</span>
        </div>
      </div>

      <!-- Products Table -->
      <div class="section">
        <div class="center bold" style="background-color: #f0f0f0; padding: 2px 0; border: 1px solid #000; margin-bottom: 2px;">
          ARTICLES
        </div>
        
        <!-- Table Header -->
        <div class="table-header">
          <div style="width: 40%">Produit</div>
          <div style="width: 20%; text-align: center;">Qty</div>
          <div style="width: 20%; text-align: right;">Prix U.</div>
          <div style="width: 20%; text-align: right;">Total</div>
        </div>

        <!-- Table Rows -->
        ${itemsRows || '<div class="center">— Aucun article —</div>'}
      </div>

      <!-- Services -->
      ${sale?.job ? `
        <div class="total-row" style="border-bottom: 1px dotted #666; padding: 2px 0;">
          <span>Service: ${escapeHtml(sale.job.name)}</span>
          <span>${escapeHtml(formatNumber(sale.job.price))} DH</span>
        </div>
      ` : ''}

      ${sale?.transport ? `
        <div class="total-row" style="border-bottom: 1px dotted #666; padding: 2px 0;">
          <span>Transport: ${escapeHtml(sale.transport.name)}</span>
          <span>${escapeHtml(formatNumber(sale.transport.price))} DH</span>
        </div>
      ` : ''}

      <!-- Totals -->
      <div class="section">
        <div class="total-row bold" style="border-top: 2px solid #000; padding-top: 3px;">
          <span>TOTAL:</span>
          <span>${escapeHtml(formatNumber(sale?.total_amount || 0))} DH</span>
        </div>
        <div class="total-row">
          <span>Payé:</span>
          <span>${escapeHtml(formatNumber(sale?.paid_amount || 0))} DH</span>
        </div>
        <div class="total-row">
          <span>Restant:</span>
          <span>${escapeHtml(formatNumber(sale?.remaining_amount || 0))} DH</span>
        </div>
      </div>

      <!-- Status -->
      <div class="status-box">
        <div class="bold">STATUT: ${escapeHtml(statusText)}</div>
        <div style="font-size: 15px;">${escapeHtml(sale?.reference || "-")}</div>
      </div>

      <!-- Footer -->
      <div class="center footer" style="margin-top: 6px; padding-top: 4px; border-top: 2px solid #000;">
        <div>Merci pour votre confiance !</div>
        <div style="letter-spacing: 1px;">***</div>
      </div>
    </body>
    </html>
  `
}

const TraditionalInvoice = { Preview, buildPrintHTML }
export default TraditionalInvoice