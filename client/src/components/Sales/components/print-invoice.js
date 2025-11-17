"use client"
import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Printer, Tag, Truck, Briefcase, Clock, Receipt, Palette } from "lucide-react"
import TraditionalInvoice from "./TraditionalInvoice"
import ModernInvoice from "./ModernInvoice"

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || ""

export default function PrintInvoice({ sale, onClose }) {
  const [invoiceType, setInvoiceType] = useState("modern")
  const [payments, setPayments] = useState([])
  const [completeSale, setCompleteSale] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sale) {
      fetchCompleteSaleData()
    }
  }, [sale])

  // دالة لجلب البيانات الكاملة مع العلاقات
  async function fetchCompleteSaleData() {
    try {
      setLoading(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      
      if (!sale?.id) {
        setCompleteSale(sale)
        return
      }

      // جلب البيانات الكاملة مع جميع العلاقات
      const saleUrl = `${API_URL}/api/sales/${sale.documentId}?populate=client&populate=user&populate=sale_items.product&populate=transport&populate=job`
      
      const saleResponse = await fetch(saleUrl, { 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      })

      if (saleResponse.ok) {
        const saleData = await saleResponse.json()
        setCompleteSale(saleData.data)
        
      } else {
        // إذا فشل الجلب، استخدم البيانات الأصلية
        console.warn("⚠️ استخدام البيانات الأصلية (غير مكتملة)")
        setCompleteSale(sale)
      }

      // جلب بيانات الدفعات
      await fetchPayments(sale.id)
    } catch (err) {
      console.error("❌ خطأ في جلب البيانات:", err)
      setCompleteSale(sale)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPayments(saleId) {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const url = `${API_URL}/api/payment-histories?filters[sale][id][$eq]=${saleId}&sort=payment_date:desc`
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      const json = await res.json()
      if (json && json.data) setPayments(json.data)
    } catch (err) {
      console.error("خطأ في جلب الدفعات:", err)
    }
  }

  function formatNumber(v) {
    const n = Number(v || 0)
    return n.toFixed(2)
  }

  function getStatusText(s) {
    const remaining = Number(s?.remaining_amount || 0)
    const paid = Number(s?.paid_amount || 0)
    if (remaining === 0 && paid > 0) return "PAYÉ"
    if (paid > 0 && remaining > 0) return "PARTIEL"
    return "EN ATTENTE"
  }

  function statusClassForText(text) {
    if (text === "PAYÉ") return "paid"
    if (text === "PARTIEL") return "partial"
    return "pending"
  }

  // فتح نافذة الطباعة
  function openPrintWindow() {
    if (!completeSale) return
    
    let printHTML
    if (invoiceType === "traditional") {
      printHTML = TraditionalInvoice.buildPrintHTML(completeSale, payments, formatNumber, getStatusText, statusClassForText)
    } else {
      printHTML = ModernInvoice.buildPrintHTML(completeSale, payments, formatNumber, getStatusText, statusClassForText)
    }
    
    const win = window.open("", "_blank", "width=1200,height=800,scrollbars=yes")
    if (!win) return
    win.document.write(printHTML)
    win.document.close()
    win.onload = function () {
      win.focus()
      win.print()
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>جاري تحميل البيانات الكاملة...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusText = getStatusText(completeSale)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 overflow-auto">
      <Card className="w-full max-w-6xl mx-auto overflow-hidden max-h-[95vh] flex flex-col">
        <CardContent className="p-6 flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex justify-between items-center flex-shrink-0">
            <h3 className="text-lg font-bold">Aperçu de la facture - Format A4</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose} size="sm"><X className="h-4 w-4" /></Button>
              <Button onClick={openPrintWindow} size="sm" disabled={!completeSale}>
                <Printer className="h-4 w-4 mr-2" />Imprimer
              </Button>
            </div>
          </div>

          {/* باقي الكود بدون تغيير */}
          <div className="flex gap-2 mb-4 flex-shrink-0">
            <Button
              variant={invoiceType === "traditional" ? "default" : "outline"}
              onClick={() => setInvoiceType("traditional")}
              size="sm"
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              Style Traditionnel
            </Button>
            <Button
              variant={invoiceType === "modern" ? "default" : "outline"}
              onClick={() => setInvoiceType("modern")}
              size="sm"
              className="flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Style Moderne
            </Button>
          </div>

          <div className="flex gap-6 flex-1 overflow-hidden">
            <div className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden flex-1 flex flex-col">
              <div className="p-4 bg-gray-50 border-b flex-shrink-0">
                <div className="text-sm font-medium text-gray-600">
                  Aperçu {invoiceType === "traditional" ? "Traditionnel" : "Moderne"} - Format A4
                </div>
              </div>
              <div className="p-6 bg-white flex-1 overflow-auto">
                {completeSale ? (
                  invoiceType === "traditional" ? (
                    <TraditionalInvoice.Preview 
                      sale={completeSale} 
                      payments={payments} 
                      formatNumber={formatNumber}
                      statusText={statusText}
                      statusClassForText={statusClassForText}
                    />
                  ) : (
                    <ModernInvoice.Preview 
                      sale={completeSale} 
                      payments={payments} 
                      formatNumber={formatNumber}
                      statusText={statusText}
                      statusClassForText={statusClassForText}
                    />
                  )
                ) : (
                  <div className="text-center py-8 text-red-600">
                    ❌ لا توجد بيانات للعرض
                  </div>
                )}
              </div>
            </div>

            {/* Actions sidebar */}
            <div className="min-w-64 flex flex-col gap-4 flex-shrink-0">
              <Button onClick={openPrintWindow} className="w-full" disabled={!completeSale}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Fermer
              </Button>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Informations</div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    {completeSale ? (
                      <span className="text-green-600">✅ To print</span>
                    ) : (
                      <span className="text-red-600">❌ Data not available</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>Formats standard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}