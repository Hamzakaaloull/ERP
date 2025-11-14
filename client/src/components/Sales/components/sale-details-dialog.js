"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Calendar, 
  Package, 
  FileText,
  Printer
} from 'lucide-react'
import PrintInvoice from './print-invoice'

export default function SaleDetailsDialog({ sale, open, onOpenChange }) {
  const [showPrintDialog, setShowPrintDialog] = useState(false)

  const handlePrintClick = () => {
    onOpenChange(false)
    setTimeout(() => {
      setShowPrintDialog(true)
    }, 100)
  }

  if (!sale) return null

  const getStatusBadge = (sale) => {
    const remaining = sale.remaining_amount || 0
    const paid = sale.paid_amount || 0
    
    if (remaining === 0 && paid > 0) {
      return <Badge variant="default">Payée</Badge>
    } else if (paid > 0 && remaining > 0) {
      return <Badge variant="secondary">Partiellement payée</Badge>
    } else {
      return <Badge variant="destructive">Impayée</Badge>
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:text-white">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <FileText className="h-5 w-5 md:h-6 md:w-6" />
                  Détails de la Vente #{sale.id}
                </DialogTitle>
                <DialogDescription className="text-sm md:text-base">
                  Informations complètes sur cette vente
                </DialogDescription>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button 
                  onClick={handlePrintClick}
                  className="gap-2 text-sm md:text-base"
                  size="sm"
                >
                  <Printer className="h-4 w-4" />
                  Imprimer Facture
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Informations Générales */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <FileText className="h-4 w-4 md:h-5 md:w-5" />
                  Informations Générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm md:text-base">Statut:</span>
                  {getStatusBadge(sale)}
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium">Date:</span>
                  <span>{sale.sale_date ? new Date(sale.sale_date).toLocaleString('fr-FR') : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium">Total:</span>
                  <span className="font-semibold">{sale.total_amount ? `${sale.total_amount.toFixed(2)} DH` : '0.00 DH'}</span>
                </div>
                <div className="flex justify-between text-green-600 text-sm md:text-base">
                  <span className="font-medium">Payé:</span>
                  <span className="font-semibold">{sale.paid_amount ? `${sale.paid_amount.toFixed(2)} DH` : '0.00 DH'}</span>
                </div>
                <div className="flex justify-between text-red-600 text-sm md:text-base">
                  <span className="font-medium">Reste:</span>
                  <span className="font-semibold">{sale.remaining_amount ? `${sale.remaining_amount.toFixed(2)} DH` : '0.00 DH'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Informations Client */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium">Nom:</span>
                  <span>{sale.client?.name || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium">Téléphone:</span>
                  <span>{sale.client?.phone || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium">Vendeur:</span>
                  <span>{sale.user?.username || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Articles de la Vente */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Package className="h-4 w-4 md:h-5 md:w-5" />
                  Articles ({sale.sale_items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sale.sale_items && sale.sale_items.length > 0 ? (
                  <div className="space-y-2 md:space-y-3">
                    {sale.sale_items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm md:text-base">{item.product?.name || 'Produit inconnu'}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            {item.unit_price} DH × {item.quantity}
                          </div>
                        </div>
                        <div className="font-semibold text-sm md:text-base">
                          {item.total_price ? `${item.total_price.toFixed(2)} DH` : '0.00 DH'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm md:text-base">
                    Aucun article dans cette vente
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'impression */}
      {showPrintDialog && (
        <PrintInvoice 
          sale={sale} 
          onClose={() => setShowPrintDialog(false)}
        />
      )}
    </>
  )
}