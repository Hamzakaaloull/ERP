"use client"
import React, { useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Printer,
  X,
  Store,
  Phone,
  MapPin,
  Calendar,
  User,
  Package,
  CreditCard,
  QrCode
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function PrintInvoice({ sale, onClose }) {
  const invoiceRef = useRef()
  const [paymentHistory, setPaymentHistory] = useState([])

  useEffect(() => {
    if (sale) {
      fetchPaymentHistory()
    }
  }, [sale])

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_URL}/api/payment-histories?filters[sale][id][$eq]=${sale.id}&sort=payment_date:desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      const data = await response.json()
      if (data && data.data) {
        setPaymentHistory(data.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des paiements:', error)
    }
  }

  const handlePrint = () => {
    const printContent = invoiceRef.current
    const printWindow = window.open('', '_blank', 'width=600,height=800,scrollbars=0,status=0')
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture #${sale.id}</title>
          <style>
            @media print {
              @page {
                size: A5 portrait;
                margin: 10mm;
              }
              body {
                font-family: 'Arial', 'Helvetica Neue', sans-serif;
                font-size: 12px;
                margin: 0;
                padding: 0;
                background: white;
                direction: ltr;
              }
              .ticket {
                width: 100%;
                max-width: 148mm;
                background: white;
                border: 1px solid #ddd;
                padding: 15px;
                position: relative;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              .company-name {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
              }
              .company-name-ar {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 8px;
                color: #333;
                direction: rtl;
              }
              .company-address {
                font-size: 11px;
                color: #666;
                margin-bottom: 3px;
              }
              .company-address-ar {
                font-size: 11px;
                color: #666;
                margin-bottom: 5px;
                direction: rtl;
              }
              .invoice-title {
                font-size: 18px;
                font-weight: 800;
                margin: 8px 0;
                text-transform: uppercase;
              }
              .invoice-title-ar {
                font-size: 16px;
                font-weight: 800;
                margin: 8px 0;
                text-transform: uppercase;
                direction: rtl;
              }
              .bilingual-item {
                margin: 8px 0;
              }
              .bilingual-label {
                font-weight: 600;
                color: #555;
                margin-bottom: 2px;
                font-size: 10px;
              }
              .bilingual-value {
                font-weight: 700;
                color: #000;
                font-size: 11px;
              }
              .arabic-text {
                direction: rtl;
                text-align: right;
              }
              .divider {
                border-bottom: 1px solid #ccc;
                margin: 8px 0;
              }
              .section-title {
                font-weight: 700;
                font-size: 12px;
                background: #f5f5f5;
                padding: 6px 8px;
                margin: 12px 0 8px 0;
                border-left: 4px solid #333;
              }
              .section-title-ar {
                font-weight: 700;
                font-size: 12px;
                background: #f5f5f5;
                padding: 6px 8px;
                margin: 12px 0 8px 0;
                border-right: 4px solid #333;
                direction: rtl;
                text-align: right;
              }
              .info-item {
                display: flex;
                justify-content: space-between;
                padding: 3px 0;
              }
              .info-label {
                font-weight: 600;
                color: #555;
                font-size: 10px;
              }
              .info-value {
                font-weight: 700;
                color: #000;
                font-size: 11px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
                font-size: 10px;
              }
              th {
                background: #333;
                color: white;
                padding: 6px 4px;
                text-align: left;
                font-weight: 600;
                border: 1px solid #555;
                font-size: 9px;
              }
              th.arabic {
                text-align: right;
                direction: rtl;
              }
              td {
                padding: 5px 4px;
                border: 1px solid #ddd;
                font-size: 9px;
              }
              td.arabic {
                text-align: right;
                direction: rtl;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .totals {
                background: #f9f9f9;
                padding: 12px;
                border: 1px solid #ddd;
                margin: 12px 0;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin: 4px 0;
                font-weight: 600;
                font-size: 11px;
              }
              .total-main {
                font-size: 12px;
                font-weight: 800;
                border-top: 2px solid #333;
                padding-top: 6px;
                margin-top: 6px;
              }
              .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
              }
              .status-paid { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
              .status-pending { background: #f8d7da; color: #721c24; border: 1px solid #f1b0b7; }
              .status-partial { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
              .payment-item {
                background: white;
                padding: 6px;
                margin: 4px 0;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 9px;
              }
              .bilingual-payment {
                display: flex;
                justify-content: space-between;
              }
              .footer {
                text-align: center;
                margin-top: 15px;
                padding-top: 12px;
                border-top: 2px solid #333;
                color: #666;
                font-size: 9px;
              }
              .thank-you {
                font-weight: 700;
                font-size: 11px;
                color: #333;
                margin-bottom: 4px;
              }
              .barcode-area {
                text-align: center;
                margin: 12px 0;
                padding: 8px;
                background: #f5f5f5;
                border: 1px solid #ddd;
              }
            }
            body {
              font-family: 'Arial', 'Helvetica Neue', sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 15px;
              background: white;
              direction: ltr;
            }
            .ticket {
              width: 100%;
              max-width: 148mm;
              background: white;
              border: 1px solid #ddd;
              padding: 15px;
              position: relative;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .company-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #333;
            }
            .company-name-ar {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #333;
              direction: rtl;
            }
            .company-address {
              font-size: 11px;
              color: #666;
              margin-bottom: 3px;
            }
            .company-address-ar {
              font-size: 11px;
              color: #666;
              margin-bottom: 5px;
              direction: rtl;
            }
            .invoice-title {
              font-size: 18px;
              font-weight: 800;
              margin: 8px 0;
              text-transform: uppercase;
            }
            .invoice-title-ar {
              font-size: 16px;
              font-weight: 800;
              margin: 8px 0;
              text-transform: uppercase;
              direction: rtl;
            }
            .bilingual-item {
              margin: 8px 0;
            }
            .bilingual-label {
              font-weight: 600;
              color: #555;
              margin-bottom: 2px;
              font-size: 10px;
            }
            .bilingual-value {
              font-weight: 700;
              color: #000;
              font-size: 11px;
            }
            .arabic-text {
              direction: rtl;
              text-align: right;
            }
            .divider {
              border-bottom: 1px solid #ccc;
              margin: 8px 0;
            }
            .section-title {
              font-weight: 700;
              font-size: 12px;
              background: #f5f5f5;
              padding: 6px 8px;
              margin: 12px 0 8px 0;
                border-left: 4px solid #333;
            }
            .section-title-ar {
              font-weight: 700;
              font-size: 12px;
              background: #f5f5f5;
              padding: 6px 8px;
              margin: 12px 0 8px 0;
              border-right: 4px solid #333;
              direction: rtl;
              text-align: right;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
            }
            .info-label {
              font-weight: 600;
              color: #555;
              font-size: 10px;
            }
            .info-value {
              font-weight: 700;
              color: #000;
              font-size: 11px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 10px;
            }
            th {
              background: #333;
              color: white;
              padding: 6px 4px;
              text-align: left;
              font-weight: 600;
              border: 1px solid #555;
              font-size: 9px;
            }
            th.arabic {
              text-align: right;
              direction: rtl;
            }
            td {
              padding: 5px 4px;
              border: 1px solid #ddd;
              font-size: 9px;
            }
            td.arabic {
              text-align: right;
              direction: rtl;
            }
            .text-right {
                text-align: right;
            }
            .text-center {
                text-align: center;
            }
            .totals {
              background: #f9f9f9;
              padding: 12px;
              border: 1px solid #ddd;
              margin: 12px 0;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-weight: 600;
              font-size: 11px;
            }
            .total-main {
              font-size: 12px;
              font-weight: 800;
              border-top: 2px solid #333;
              padding-top: 6px;
              margin-top: 6px;
            }
            .status-badge {
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
            }
            .status-paid { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .status-pending { background: #f8d7da; color: #721c24; border: 1px solid #f1b0b7; }
            .status-partial { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
            .payment-item {
              background: white;
              padding: 6px;
              margin: 4px 0;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 9px;
            }
            .bilingual-payment {
              display: flex;
              justify-content: space-between;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              padding-top: 12px;
              border-top: 2px solid #333;
              color: #666;
              font-size: 9px;
            }
            .thank-you {
              font-weight: 700;
              font-size: 11px;
              color: #333;
              margin-bottom: 4px;
            }
            .barcode-area {
              text-align: center;
              margin: 12px 0;
              padding: 8px;
              background: #f5f5f5;
              border: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.close();
              }, 100);
            }
          </script>
        </body>
      </html>
    `)
    
    printWindow.document.close()
  }

  const getStatusInfo = (sale) => {
    const remaining = sale.remaining_amount || 0
    const paid = sale.paid_amount || 0
    
    if (remaining === 0 && paid > 0) {
      return { 
        text: 'PAID / مدفوع', 
        class: 'status-paid' 
      }
    } else if (paid > 0 && remaining > 0) {
      return { 
        text: 'PARTIAL / جزئي', 
        class: 'status-partial' 
      }
    } else {
      return { 
        text: 'PENDING / قيد الانتظار', 
        class: 'status-pending' 
      }
    }
  }

  const getPaymentMethodText = (method) => {
    const methods = {
      'cash': 'CASH / نقد',
      'card': 'CARD / بطاقة',
      'transfer': 'TRANSFER / تحويل',
      'check': 'CHECK / شيك'
    }
    return methods[method] || method
  }

  const statusInfo = getStatusInfo(sale)

  // Générer un code de ticket
  const generateTicketCode = () => {
    return `TKT${sale.id.toString().padStart(6, '0')}${Date.now().toString().slice(-4)}`
  }

  const ticketCode = generateTicketCode()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
      <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        <CardContent className="p-4 md:p-6 flex flex-col flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-lg md:text-xl font-bold">Aperçu du Ticket - معاينة التذكرة</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Aperçu du ticket */}
          <div className="flex-1 overflow-auto ">
            <div 
              ref={invoiceRef}
              className="bg-white dark:bg-gray-900 mx-auto border border-gray-300 shadow-lg"
              style={{ width: '148mm', minHeight: '210mm', padding: '15px' }}
            >
              {/* En-tête du ticket */}
              <div className="header">
                {/* <div className="company-name">FATINI STORE</div> */}
               
                <img src="/img/Fatini_logo_ligth.png" alt="Fatini Store" className="mx-auto mb-2" style={{width: '120px', height: 'auto'}} />
                <div className="company-address">OULED ILLOUL • Souk Sebt • Morocco</div>
                <div className="company-address-ar">أولاد إيلول • سوق السبت • المغرب</div>
                
                <div className="company-address">📞 06 23 45 67 89</div>
                
                <div className="invoice-title">SALE RECEIPT / إيصال بيع</div>
                
                
                <div className={`status-badge ${statusInfo.class} inline-block mt-2`}>
                  {statusInfo.text}
                </div>
              </div>

              {/* Informations de base */}
              <div className="section-title">INVOICE INFO / معلومات الفاتورة</div>
              
              
              <div className="info-item">
                <span className="info-label">Ticket N° / رقم التذكرة:</span>
                <span className="info-value">#{sale.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date / التاريخ:</span>
                <span className="info-value">
                  {sale.sale_date ? new Date(sale.sale_date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Time / الوقت:</span>
                <span className="info-value">
                  {sale.sale_date ? new Date(sale.sale_date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Reference / المرجع:</span>
                <span className="info-value">{ticketCode}</span>
              </div>

              <div className="divider"></div>

              {/* Informations client */}
              <div className="section-title">CLIENT INFO / معلومات العميل</div>
           
              
              <div className="info-item">
                <span className="info-label">Client / العميل:</span>
                <span className="info-value">{sale.client?.name || 'Non spécifié / غير محدد'}</span>
              </div>
              {sale.client?.phone && (
                <div className="info-item">
                  <span className="info-label">Phone / الهاتف:</span>
                  <span className="info-value">{sale.client.phone}</span>
                </div>
              )}

              <div className="divider"></div>

              {/* Articles */}
              <div className="section-title">PRODUCTS / المنتجات</div>
              
              
              <table>
                <thead>
                  <tr>
                    <th>Product / المنتج</th>
                    <th className="text-right">Qty / الكمية</th>
                    <th className="text-right">Unit Price / السعر</th>
                    <th className="text-right">Total / المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.sale_items?.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product?.name || 'Product / منتج'}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">{item.unit_price?.toFixed(2)} DH</td>
                      <td className="text-right">{item.total_price?.toFixed(2)} DH</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="divider"></div>

              {/* Historique des Paiements */}
              {paymentHistory.length > 0 && (
                <>
                  <div className="section-title">PAYMENT HISTORY / سجل الدفع</div>
                 
                  
                  <div className="space-y-2">
                    {paymentHistory.map((payment, index) => (
                      <div key={index} className="payment-item">
                        <div className="bilingual-payment">
                          <div>
                            <strong>{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</strong>
                            <span className="ml-2">{getPaymentMethodText(payment.payment_method)}</span>
                          </div>
                          <div className="font-semibold">{payment.amount.toFixed(2)} DH</div>
                        </div>
                        {payment.note && (
                          <div className="text-xs text-gray-600 mt-1">
                            Note: {payment.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="divider"></div>
                </>
              )}

              {/* Totaux */}
              <div className="totals">
                <div className="section-title">SUMMARY / الملخص</div>
            
                
                <div className="total-row">
                  <span>Subtotal / المجموع الجزئي:</span>
                  <span>{sale.total_amount?.toFixed(2) || '0.00'} DH</span>
                </div>
                <div className="total-row" style={{color: '#16a34a'}}>
                  <span>Paid / المدفوع:</span>
                  <span>+{sale.paid_amount?.toFixed(2) || '0.00'} DH</span>
                </div>
                <div className="total-row total-main" style={{
                  color: (sale.remaining_amount || 0) > 0 ? '#dc2626' : '#16a34a'
                }}>
                  <span>BALANCE / الرصيد:</span>
                  <span>
                    {(sale.remaining_amount || 0) > 0 ? '-' : ''}
                    {(sale.remaining_amount || 0) > 0 ? sale.remaining_amount?.toFixed(2) : '0.00'} DH
                  </span>
                </div>
              </div>

            
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center pt-4 flex-shrink-0">
            <Button 
              onClick={handlePrint}
              className="gap-2 text-sm md:text-base"
              size="sm"
            >
              <Printer className="h-4 w-4" />
              Print Ticket / طباعة التذكرة
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              size="sm"
              className="text-sm md:text-base"
            >
              Close / إغلاق
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}