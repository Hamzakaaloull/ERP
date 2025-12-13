import React from "react"

export function Preview({ sale, payments, formatNumber, statusText, statusClassForText }) {
  const ticketCode = `TKT-${String(sale?.id || "0").padStart(4, "0")}`
  
  return (
    <div className="dark:text-black" style={{ 
      width: "100mm", 
      fontFamily: "'Segoe UI', 'Arial', sans-serif", 
      fontSize: "11pt",
      padding: "4mm",
      background: "white",
      border: "1px solid #333",
      lineHeight: "1.1",
      letterSpacing: "0.02em",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale"
    }}>
      {/* Header - Logo centered with company info */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "10px", 
        paddingBottom: "8px", 
        borderBottom: "3px double #000"
      }}>
        {/* Logo Centered at Top */}
        <div style={{ 
          marginBottom: "6px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <img 
            src="/img/Fatini_logo_ligth.png" 
            alt="FATINI" 
            style={{ 
              width: "85px",
              height: "auto",
              border: "2px solid #000",
              backgroundColor: "white",
              borderRadius: "4px"
            }} 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div style="
                  width: 85px; 
                  height: 55px; 
                  background: #000;
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 900;
                  font-size: 18px;
                  border-radius: 4px;
                  border: 2px solid #000;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                ">
                  FATINI
                </div>
              `;
            }}
          />
        </div>
        
        {/* Company Info - Centered below logo */}
        <div style={{ 
          textAlign: "center",
          marginTop: "4px"
        }}>
          <div style={{ 
            fontWeight: "900", 
            fontSize: "18pt",
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            letterSpacing: "1px",
            marginBottom: "3px",
            color: "#000",
            textTransform: "uppercase",
            lineHeight: "1"
          }}>FATINI</div>
          <div style={{ 
            fontSize: "10pt",
            fontWeight: "700",
            marginBottom: "4px",
            color: "#000000ff",
            letterSpacing: "0.5px"
          }}>OULLED ILLOUL, SOUK SEBT, MAROC</div>
          <div style={{ 
            fontSize: "10pt",
            fontWeight: "700",
            color: "#000",
            letterSpacing: "0.5px",
            backgroundColor: "#f8f8f8",
            padding: "3px 8px",
            borderRadius: "3px",
            display: "inline-block",
            marginTop: "3px",
            border: "1px solid #ddd"
          }}>Tél: 0634616342</div>
        </div>
      </div>

      {/* Ticket Reference - Prominent */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: "10px",
        padding: "6px",
        backgroundColor: "#f8f8f8",
        border: "2px solid #000",
        borderRadius: "4px"
      }}>
        <div style={{ 
          fontWeight: "900", 
          fontSize: "14pt",
          fontFamily: "'Courier New', monospace",
          letterSpacing: "2px",
          color: "#000"
        }}>{ticketCode}</div>
      </div>

      {/* Client Info - Compact with better design */}
      <div style={{ 
        marginBottom: "12px", 
        padding: "10px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "4px",
        borderLeft: "4px solid #000"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginBottom: "5px",
          alignItems: "center"
        }}>
          <span style={{ 
            fontWeight: "800", 
            fontSize: "11pt",
            color: "#333",
            minWidth: "50px"
          }}>CLIENT:</span>
          <span style={{ 
            fontWeight: "600", 
            fontSize: "12pt",
            color: "#000",
            textAlign: "right"
          }}>{sale?.client?.name || "Non spécifié"}</span>
        </div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginBottom: "5px",
          alignItems: "center"
        }}>
          <span style={{ 
            fontWeight: "800", 
            fontSize: "11pt",
            color: "#333",
            minWidth: "50px"
          }}>TÉL:</span>
          <span style={{ 
            fontWeight: "600", 
            fontSize: "11pt",
            color: "#000",
            textAlign: "right"
          }}>{sale?.client?.phone || "-"}</span>
        </div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ 
            fontWeight: "800", 
            fontSize: "11pt",
            color: "#333",
            minWidth: "50px"
          }}>DATE:</span>
          <span style={{ 
            fontWeight: "600", 
            fontSize: "11pt",
            color: "#000",
            textAlign: "right"
          }}>{sale?.sale_date ? new Date(sale.sale_date).toLocaleString("fr-FR") : new Date().toLocaleString("fr-FR")}</span>
        </div>
      </div>

      {/* Products Table - Better Structure */}
      <div style={{ marginBottom: "12px" }}>
        {/* Table Header */}
        <div style={{ 
          display: "flex", 
          backgroundColor: "#000",
          color: "white",
          padding: "6px 5px",
          marginBottom: "5px",
          fontWeight: "900",
          fontSize: "11pt",
          fontFamily: "'Arial Narrow', sans-serif",
          borderRadius: "3px 3px 0 0",
          borderBottom: "3px solid #000",
          letterSpacing: "0.5px"
        }}>
          <div style={{ width: "45%", paddingLeft: "8px" }}>PRODUIT</div>
          <div style={{ width: "15%", textAlign: "center" }}>QTY</div>
          <div style={{ width: "20%", textAlign: "right" }}>PRIX U.</div>
          <div style={{ width: "20%", textAlign: "right", paddingRight: "8px" }}>TOTAL</div>
        </div>

        {/* Table Rows */}
        {(sale?.sale_items || []).map((it, i) => (
          <div 
            key={i} 
            style={{ 
              display: "flex", 
              borderBottom: i === (sale?.sale_items?.length || 0) - 1 ? "2px solid #000" : "1px solid #eee",
              padding: "6px 5px",
              fontSize: "11pt",
              fontWeight: "500",
              backgroundColor: i % 2 === 0 ? "#fafafa" : "transparent"
            }}
          >
            <div style={{ 
              width: "45%", 
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              whiteSpace: "nowrap",
              paddingLeft: "8px",
              fontWeight: "600"
            }}>
              {it.product?.name || "Produit"}
            </div>
            <div style={{ 
              width: "15%", 
              textAlign: "center",
              fontWeight: "700",
              color: "#000" 
            }}>{it.quantity}</div>
            <div style={{ 
              width: "20%", 
              textAlign: "right",
              fontWeight: "600",
              color: "#333"
            }}>{formatNumber(it.unit_price)}</div>
            <div style={{ 
              width: "20%", 
              textAlign: "right",
              fontWeight: "800",
              color: "#000",
              paddingRight: "8px"
            }}>{formatNumber(it.total_price)}</div>
          </div>
        ))}
      </div>

      {/* Services - Separated with icons */}
      {(sale?.job || sale?.transport) && (
        <div style={{ 
          marginBottom: "12px",
          borderTop: "2px dashed #ddd",
          paddingTop: "8px"
        }}>
          {sale?.job && (
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 0",
              fontSize: "11pt",
              borderBottom: "1px dotted #eee",
              paddingBottom: "6px"
            }}>
              <span style={{ fontWeight: "700", display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "8px", color: "#666" }}>🛠️</span>
                SERVICE:
              </span>
              <span style={{ fontWeight: "800", color: "#000" }}>{formatNumber(sale.job.price)} DH</span>
            </div>
          )}
          {sale?.transport && (
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              padding: "5px 0",
              fontSize: "11pt",
              paddingTop: "6px"
            }}>
              <span style={{ fontWeight: "700", display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "8px", color: "#666" }}>🚚</span>
                TRANSPORT:
              </span>
              <span style={{ fontWeight: "800", color: "#000" }}>{formatNumber(sale.transport.price)} DH</span>
            </div>
          )}
        </div>
      )}

      {/* Totals - Emphasized */}
      <div style={{ 
        marginTop: "12px", 
        marginBottom: "14px",
        padding: "12px",
        backgroundColor: "#f5f5f5",
        border: "3px solid #000",
        borderRadius: "5px"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          fontWeight: "900",
          fontSize: "14pt",
          marginBottom: "8px",
          paddingBottom: "8px",
          borderBottom: "2px solid #000",
          fontFamily: "'Arial Black', sans-serif"
        }}>
          <span style={{ color: "#000" }}>TOTAL GÉNÉRAL:</span>
          <span style={{ color: "#000" }}>{formatNumber(sale?.total_amount || 0)} DH</span>
        </div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          fontWeight: "700",
          fontSize: "12pt",
          marginBottom: "6px",
          padding: "4px 0"
        }}>
          <span style={{ color: "#000000ff" }}>Montant Payé:</span>
          <span style={{ color: "#000", fontWeight: "800" }}>{formatNumber(sale?.paid_amount || 0)} DH</span>
        </div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          fontWeight: "900",
          fontSize: "13pt",
          color: "#000",
          padding: "5px 0",
          backgroundColor: "#fff",
          borderRadius: "3px",
          paddingLeft: "8px",
          paddingRight: "8px",
          border: "1px solid #ddd"
        }}>
          <span>RESTE À PAYER:</span>
          <span>{formatNumber(sale?.remaining_amount || 0)} DH</span>
        </div>
      </div>

      {/* Status - Simple design */}
      <div style={{ 
        textAlign: "center", 
        marginTop: "12px",
        marginBottom: "14px",
        padding: "10px",
        backgroundColor: "#f8f8f8",
        border: "2px solid #000",
        borderRadius: "5px",
        position: "relative"
      }}>
        {/* Status Icon */}
        <div style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "16pt"
        }}>
          {statusClassForText === "success" ? "✅" : 
           statusClassForText === "warning" ? "⚠️" : 
           statusClassForText === "danger" ? "-" : "--"}
        </div>
        
        <div style={{ 
          fontWeight: "900", 
          fontSize: "13pt",
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: "#000"
        }}>
          STATUT: {statusText}
        </div>
        {sale?.reference && (
          <div style={{ 
            fontSize: "10pt",
            marginTop: "5px",
            fontWeight: "600",
            color: "#666",
            fontFamily: "'Courier New', monospace"
          }}>REF: {sale.reference}</div>
        )}
      </div>

      {/* Footer - Elegant with logo reference */}
      <div style={{ 
        textAlign: "center", 
        marginTop: "14px",
        paddingTop: "12px",
        borderTop: "3px double #000",
        fontSize: "10pt",
        fontFamily: "'Georgia', serif",
        position: "relative"
      }}>
        {/* Small logo in footer */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "-18px",
          transform: "translateX(-50%)",
          backgroundColor: "white",
          padding: "0 12px"
        }}>
          <div style={{
            width: "55px",
            height: "28px",
            backgroundColor: "#000",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "900",
            fontSize: "12px",
            borderRadius: "3px",
            border: "2px solid #000",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            FATINI
          </div>
        </div>
        
        <div style={{ 
          fontWeight: "700",
          marginBottom: "6px",

          color: "#000",
          fontStyle: "italic",
          fontSize: "12pt"
        }}>Merci pour votre confiance !</div>
        <div style={{ 
          letterSpacing: "3px",
          color: "#666",
          fontSize: "14pt",
          margin: "6px 0"
        }}>• • •</div>
        
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
  
  // Status icon
  const statusIcon = statusClassForText === "success" ? "✅" : 
                     statusClassForText === "warning" ? "⚠️" : 
                     statusClassForText === "danger" ? "❌" : "ℹ️"

  // Construction des lignes d'articles
  const itemsRows = (sale?.sale_items || []).map((it, i) => {
    const name = escapeHtml(it.product?.name || "Produit")
    const qty = escapeHtml(it.quantity ?? 1)
    const unit = escapeHtml(formatNumber(it.unit_price || 0))
    const tot = escapeHtml(formatNumber(it.total_price || 0))
    const rowBg = i % 2 === 0 ? "#fafafa" : "transparent"
    
    return `
      <div style="display: flex; border-bottom: ${i === sale.sale_items.length - 1 ? '2px solid #000' : '1px solid #eee'}; padding: 6px 5px; font-size: 11pt; font-weight: 500; background-color: ${rowBg};">
        <div style="width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-left: 8px; font-weight: 600;">${name}</div>
        <div style="width: 15%; text-align: center; font-weight: 700;">${qty}</div>
        <div style="width: 20%; text-align: center; font-weight: 600;">${unit}</div>
        <div style="width: 20%; text-align: center; font-weight: 700; padding-right: 8px;">${tot}</div>
      </div>`
  }).join("")

  return `
    <!doctype html>
    <html lang="fr">
    <head>
      <meta charset="utf-8"/>
      <title>BON DE CAISSE • ${escapeHtml(ticketCode)}</title>
      <style>
        /* ===== CONFIGURATION IMPRIMANTE THERMIQUE 100mm ===== */
        @page {
          size: 100mm auto;
          margin: 0;
          padding: 0;
        }
        
        @media print {
          html, body {
            width: 100mm !important;
            max-width: 100mm !important;
            min-width: 100mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: white !important;
            font-size: 11pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          * {
            box-sizing: border-box;
            max-width: 92mm !important;
            font-family: 'Segoe UI', 'Arial', sans-serif !important;
          }
          
          .no-print { display: none !important; }
        }
        
        body {
          font-family: 'Segoe UI', 'Arial', sans-serif;
          font-size: 11pt;
          width: 100mm;
          max-width: 100mm;
          margin: 0 auto;
          padding: 4mm;
          background: white;
          line-height: 1.1;
          letter-spacing: 0.02em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          color: #000 !important;
        }
        
        /* ===== TYPOGRAPHIE AMÉLIORÉE ===== */
        .header-main {
          font-family: 'Arial Black', 'Impact', sans-serif;
          font-weight: 900;
          letter-spacing: 1px;
        }
        
        .bold-900 { font-weight: 900 !important; }
        .bold-800 { font-weight: 800 !important; }
        .bold-700 { font-weight: 700 !important; }
        .bold-600 { font-weight: 600 !important; }
        
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-uppercase { text-transform: uppercase; }
        
        /* ===== LOGO STYLES ===== */
        .logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 6px;
        }
        
        .logo {
          width: 85px;
          height: auto;
          border: 2px solid #000;
          background-color: white;
          border-radius: 4px;
        }
        
        .logo-fallback {
          width: 85px;
          height: 55px;
          background: #000;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 18px;
          border-radius: 4px;
          border: 2px solid #000;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* ===== STRUCTURE ===== */
        .section {
          margin-bottom: 8px;
          page-break-inside: avoid;
        }
        
        .header-section {
          text-align: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 3px double #000;
        }
        
        .ticket-ref {
          text-align: center;
          margin-bottom: 10px;
          padding: 6px;
          background-color: #f8f8f8;
          border: 2px solid #000;
          border-radius: 4px;
        }
        
        .table-header {
          display: flex;
          background-color: #000 !important;
          color: white !important;
          padding: 6px 5px;
          margin-bottom: 5px;
          font-weight: 900;
          font-size: 11pt;
          font-family: 'Arial Narrow', sans-serif;
          border-radius: 3px 3px 0 0;
          border-bottom: 3px solid #000;
          letter-spacing: 0.5px;
        }
        
        .table-row {
          display: flex;
          padding: 6px 5px;
          font-size: 11pt;
        }
        
        .totals-box {
          padding: 12px;
          background-color: #f5f5f5 !important;
          border: 3px solid #000;
          border-radius: 5px;
          margin: 12px 0;
        }
        
        .status-box {
          text-align: center;
          padding: 10px;
          border: 2px solid #000;
          border-radius: 5px;
          margin: 12px 0;
          page-break-inside: avoid;
          position: relative;
        }
        
        .footer {
          text-align: center;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 3px double #000;
          font-size: 10pt;
          font-family: 'Georgia', serif;
          position: relative;
        }
        
        /* ===== COULEURS ===== */
        .bg-dark { background-color: #000 !important; }
        .bg-light { background-color: #f8f8f8 !important; }
        .bg-gray { background-color: #f5f5f5 !important; }
        .text-white { color: white !important; }
        
        /* ===== EFFETS VISUELS ===== */
        .border-double { border-style: double; }
        .border-dashed { border-style: dashed; }
        .rounded { border-radius: 5px; }
        
        /* ===== OPTIMISATION IMPRESSION ===== */
        .no-break { page-break-inside: avoid; }
        .force-black { color: #000 !important; border-color: #000 !important; }
        .print-optimized { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        
        /* ===== RESPONSIVE PRINT ===== */
        @media print and (max-width: 100mm) {
          body { padding: 3mm !important; }
          .section { margin-bottom: 6px !important; }
          .logo { width: 75px !important; }
        }
      </style>
    </head>
    <body class="print-optimized">
      <!-- HEADER - Logo centered with company info -->
      <div class="header-section no-break">
     
        
        <!-- Company Info - Centered below logo -->
        <div style="text-align: center; margin-top: 4px;">
          <div class="header-main" style="font-size: 18pt; margin-bottom: 3px; color: #000; text-transform: uppercase; line-height: 1;">FATINI</div>
          <div class="bold-700" style="font-size: 10pt; margin-bottom: 4px; color: #000000ff; letter-spacing: 0.5px;">OULLED ILLOUL, SOUK SEBT, MAROC</div>
          <div class="bold-700" style="font-size: 10pt; color: #000; letter-spacing: 0.5px; background-color: #f8f8f8; padding: 3px 8px; border-radius: 3px; display: inline-block; margin-top: 3px; border: 1px solid #ddd;">Tél: 0634616342</div>
        </div>
      </div>
      
      <!-- RÉFÉRENCE TICKET -->
      <div class="ticket-ref no-break">
        <div class="bold-900" style="font-size: 14pt; letter-spacing: 2px; color: #000; font-family: 'Courier New', monospace;">${escapeHtml(ticketCode)}</div>
      </div>
      
      <!-- INFORMATIONS CLIENT -->
      <div class="section no-break" style="background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; border-left: 4px solid #000; padding: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; align-items: center;">
          <span class="bold-800" style="font-size: 11pt; color: #000000ff; min-width: 50px;">CLIENT:</span>
          <span class="bold-600" style="font-size: 12pt; color: #000000ff; text-align: right;">${escapeHtml(sale?.client?.name || "Non spécifié")}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; align-items: center;">
          <span class="bold-800" style="font-size: 11pt; color: #000000ff; min-width: 50px;">TÉL:</span>
          <span class="bold-600" style="font-size: 11pt; color: #000; text-align: right;">${escapeHtml(sale?.client?.phone || "-")}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="bold-800" style="font-size: 11pt; color: #000000ff; min-width: 50px;">DATE:</span>
          <span class="bold-600" style="font-size: 11pt; color: #000; text-align: right;">${escapeHtml(dateText)}</span>
        </div>
      </div>
      
      <!-- TABLEAU ARTICLES -->
      <div class="section no-break">
        <div class="table-header">
          <div style="width: 45%; padding-left: 8px;">PRODUIT</div>
          <div style="width: 15%; text-align: center;">QTY</div>
          <div style="width: 20%; text-align: right;">PRIX U.</div>
          <div style="width: 20%; text-align: right; padding-right: 8px;">TOTAL</div>
        </div>
        
        ${itemsRows || '<div class="text-center" style="font-size: 11pt; padding: 12px 0;">— Aucun article —</div>'}
      </div>
      
      <!-- SERVICES -->
      ${(sale?.job || sale?.transport) ? `
        <div class="section no-break" style="border-top: 2px dashed #ddd; padding-top: 8px;">
          ${sale?.job ? `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 11pt; border-bottom: 1px dotted #eee; padding-bottom: 6px;">
              <span class="bold-700" style="display: flex; align-items: center;">
                <span style="margin-right: 8px; color: #000000ff;">🛠️</span>
                SERVICE:
              </span>
              <span class="bold-800" style="color: #000;">${escapeHtml(formatNumber(sale.job.price))} DH</span>
            </div>
          ` : ''}
          
          ${sale?.transport ? `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; font-size: 11pt; padding-top: 6px;">
              <span class="bold-700" style="display: flex; align-items: center;">
                <span style="margin-right: 8px; color: #000000ff;">🚚</span>
                TRANSPORT:
              </span>
              <span class="bold-800" style="color: #000;">${escapeHtml(formatNumber(sale.transport.price))} DH</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <!-- TOTAUX -->
      <div class="totals-box no-break">
        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 14pt; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 2px solid #000; font-family: 'Arial Black', sans-serif;">
          <span style="color: #000;">TOTAL GÉNÉRAL:</span>
          <span style="color: #000;">${escapeHtml(formatNumber(sale?.total_amount || 0))} DH</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 12pt; margin-bottom: 6px; padding: 4px 0;">
          <span style="color: #000000ff;">Montant Payé:</span>
          <span style="color: #000; font-weight: 800;">${escapeHtml(formatNumber(sale?.paid_amount || 0))} DH</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 13pt; color: #000; padding: 5px 0; background-color: #fff; border-radius: 3px; padding-left: 8px; padding-right: 8px; border: 1px solid #ddd;">
          <span>RESTE À PAYER:</span>
          <span>${escapeHtml(formatNumber(sale?.remaining_amount || 0))} DH</span>
        </div>
      </div>
      
      <!-- STATUT -->
      <div class="status-box no-break" style="background-color: #f8f8f8;">
        <div style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 16pt;">
          ${statusIcon}
        </div>
        <div class="bold-900 text-uppercase" style="font-size: 13pt; letter-spacing: 1px; color: #000;">
          STATUT: ${escapeHtml(statusText)}
        </div>
        ${sale?.reference ? `
          <div style="font-size: 10pt; margin-top: 5px; font-weight: 600; color: #666; font-family: 'Courier New', monospace;">REF: ${escapeHtml(sale.reference)}</div>
        ` : ''}
      </div>
      
      <!-- FOOTER WITH LOGO -->
      <div class="footer no-break">
        <div style="position: absolute; left: 50%; top: -18px; transform: translateX(-50%); background-color: white; padding: 0 12px;">
          <div style="width: 55px; height: 28px; background-color: #000; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; border-radius: 3px; border: 2px solid #000; text-transform: uppercase; letter-spacing: 1px;">
            FATINI
          </div>
        </div>
        
        <div class="bold-700" style="margin-bottom: 6px;margin-top: 6px; color: #000; font-style: italic; font-size: 12pt;">Merci pour votre confiance !</div>
        <div style="letter-spacing: 3px; color: #666; font-size: 14pt; margin: 6px 0;">• • •</div>
        
      </div>
      
      <!-- SCRIPT AUTO-PRINT -->
      <script>
        // Auto-impression avec délai pour charger les styles
        window.onload = function() {
          setTimeout(function() {
            window.print();
            // Fermer la fenêtre après impression (optionnel)
            setTimeout(function() {
              if (window.matchMedia && window.matchMedia('print').matches) {
                // Ne pas fermer si en prévisualisation
              } else {
                window.close();
              }
            }, 500);
          }, 100);
        };
      </script>
    </body>
    </html>
  `
}

const TraditionalInvoice = { Preview, buildPrintHTML }
export default TraditionalInvoice