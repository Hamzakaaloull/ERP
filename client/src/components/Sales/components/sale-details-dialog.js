"use client"
import React, { useState, useEffect } from 'react'
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
  Printer,
  Truck,
  Briefcase,
  CreditCard,
  History,
  Banknote,
  Send
} from 'lucide-react'
import PrintInvoice from './print-invoice'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function SaleDetailsDialog({ sale, open, onOpenChange }) {
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [saleDetails, setSaleDetails] = useState(null)
  const [transport, setTransport] = useState(null)
  const [job, setJob] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPayments, setLoadingPayments] = useState(false)

  useEffect(() => {
    if (sale && open) {
      fetchSaleDetails()
      fetchPaymentHistory()
    }
  }, [sale, open])

  const fetchSaleDetails = async () => {
    if (!sale) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Fetch sale details with all relations
      const saleResponse = await fetch(
        `${API_URL}/api/sales/${sale.documentId || sale.id}?populate=client&populate=user&populate=sale_items.product`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (saleResponse.ok) {
        const saleData = await saleResponse.json()
        setSaleDetails(saleData.data)
        
        // Fetch transport for this sale
        const transportResponse = await fetch(
          `${API_URL}/api/transports?filters[sale][id][$eq]=${sale.id}&populate=*`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (transportResponse.ok) {
          const transportData = await transportResponse.json()
          if (transportData.data && transportData.data.length > 0) {
            setTransport(transportData.data[0])
          }
        }
        
        // Fetch job for this sale
        const jobResponse = await fetch(
          `${API_URL}/api/jobs?filters[sale][id][$eq]=${sale.id}&populate=*`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (jobResponse.ok) {
          const jobData = await jobResponse.json()
          if (jobData.data && jobData.data.length > 0) {
            setJob(jobData.data[0])
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error)
      setSaleDetails(sale)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentHistory = async () => {
    if (!sale) return
    
    setLoadingPayments(true)
    try {
      const token = localStorage.getItem('token')
      
      const paymentResponse = await fetch(
        `${API_URL}/api/payment-histories?filters[sale][id][$eq]=${sale.id}&sort=payment_date:desc&populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        setPaymentHistory(paymentData.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des paiements:', error)
      setPaymentHistory([])
    } finally {
      setLoadingPayments(false)
    }
  }

  const handlePrintClick = () => {
    onOpenChange(false)
    setTimeout(() => {
      setShowPrintDialog(true)
    }, 100)
  }

  if (!sale) return null

  const currentSale = saleDetails || sale

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

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'transfer':
        return <Send className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Espèces'
      case 'card':
        return 'Carte Bancaire'
      case 'transfer':
        return 'Virement'
      default:
        return method || 'Espèces'
    }
  }

  // Calculate products subtotal
  const productsSubtotal = currentSale.sale_items?.reduce((total, item) => total + (item.total_price || 0), 0) || 0
  const transportAmount = transport?.price || 0
  const jobAmount = job?.price || 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:text-white">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
                  <FileText className="h-5 w-5 md:h-6 md:w-6" />
                  Détails de la Vente #{currentSale.id}
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
                  Imprimer le BON
                </Button>
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Chargement des détails...</span>
            </div>
          ) : (
            <div className="grid gap-4">
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
                    {getStatusBadge(currentSale)}
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="font-medium">Date:</span>
                    <span>{currentSale.sale_date ? new Date(currentSale.sale_date).toLocaleString('fr-FR') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="font-medium">Total:</span>
                    <span className="font-semibold">{currentSale.total_amount ? `${currentSale.total_amount.toFixed(2)} DH` : '0.00 DH'}</span>
                  </div>
                  <div className="flex justify-between text-green-600 text-sm md:text-base">
                    <span className="font-medium">Payé:</span>
                    <span className="font-semibold">{currentSale.paid_amount ? `${currentSale.paid_amount.toFixed(2)} DH` : '0.00 DH'}</span>
                  </div>
                  <div className="flex justify-between text-red-600 text-sm md:text-base">
                    <span className="font-medium">Reste:</span>
                    <span className="font-semibold">{currentSale.remaining_amount ? `${currentSale.remaining_amount.toFixed(2)} DH` : '0.00 DH'}</span>
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
                    <span>{currentSale.client?.name || 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="font-medium">Téléphone:</span>
                    <span>{currentSale.client?.phone || 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="font-medium">Vendeur:</span>
                    <span>{currentSale.user?.username || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Historique des Paiements */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <History className="h-4 w-4 md:h-5 md:w-5" />
                    Historique des Paiements
                    <Badge variant="outline" className="ml-2">
                      {paymentHistory.length} paiement(s)
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPayments ? (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm">Chargement des paiements...</span>
                    </div>
                  ) : paymentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {paymentHistory.map((payment, index) => (
                        <div key={payment.id} className="flex items-center justify-between dark:text-black p-3 border rounded-lg bg-green-50  border-green-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                              {getPaymentMethodIcon(payment.payment_method)}
                            </div>
                            <div>
                              <div className="font-medium text-sm md:text-base">
                                {getPaymentMethodText(payment.payment_method)}
                              </div>
                              <div className="text-xs md:text-sm text-muted-foreground">
                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                {payment.description && ` • ${payment.description}`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600 text-sm md:text-base">
                              {payment.amount?.toFixed(2)} DH
                            </div>
                            <div className="text-xs text-muted-foreground">
                              #{index + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Résumé des paiements */}
                      <div className="border-t pt-3 mt-3 space-y-2">
                        <div className="flex justify-between text-sm md:text-base">
                          <span>Total payé:</span>
                          <span className="font-semibold text-green-600">
                            {paymentHistory.reduce((total, payment) => total + (payment.amount || 0), 0).toFixed(2)} DH
                          </span>
                        </div>
                        <div className="flex justify-between text-sm md:text-base">
                          <span>Dernier paiement:</span>
                          <span className="font-medium">
                            {paymentHistory.length > 0 
                              ? new Date(paymentHistory[0].payment_date).toLocaleDateString('fr-FR')
                              : 'Aucun'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm md:text-base">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun paiement enregistré</p>
                      <p className="text-xs">Les paiements apparaîtront ici lorsqu'ils seront effectués</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Services Additionnels */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Briefcase className="h-4 w-4 md:h-5 md:w-5" />
                    Services Additionnels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  {transport ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">Transport</span>
                      </div>
                      <div className="text-sm">
                        <div><strong>Nom:</strong> {transport.name}</div>
                        <div><strong>Prix:</strong> {transport.price?.toFixed(2)} DH</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Aucun transport</div>
                  )}

                  {job ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <Briefcase className="h-4 w-4" />
                        <span className="font-medium">Job</span>
                      </div>
                      <div className="text-sm">
                        <div><strong>Nom:</strong> {job.name}</div>
                        <div><strong>Prix:</strong> {job.price?.toFixed(2)} DH</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Aucun job</div>
                  )}
                </CardContent>
              </Card>

              {/* Articles de la Vente */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Package className="h-4 w-4 md:h-5 md:w-5" />
                    Articles ({currentSale.sale_items?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentSale.sale_items && currentSale.sale_items.length > 0 ? (
                    <div className="space-y-2 md:space-y-3">
                      {currentSale.sale_items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm md:text-base">{item.product?.name || 'Produit inconnu'}</div>
                            <div className="text-xs md:text-sm text-muted-foreground">
                              {item.unit_price} DH × {item.quantity}
                              {item.product?.unit && ` (${item.product.unit})`}
                            </div>
                          </div>
                          <div className="font-semibold text-sm md:text-base">
                            {item.total_price ? `${item.total_price.toFixed(2)} DH` : '0.00 DH'}
                          </div>
                        </div>
                      ))}
                      
                      {/* Résumé des totaux */}
                      <div className="border-t pt-4 mt-4 space-y-2">
                        <div className="flex justify-between text-sm md:text-base">
                          <span>Sous-total Produits:</span>
                          <span className="font-semibold">
                            {productsSubtotal.toFixed(2)} DH
                          </span>
                        </div>
                        
                        {transport && (
                          <div className="flex justify-between text-sm md:text-base text-blue-600">
                            <span>Transport:</span>
                            <span className="font-semibold">+{transportAmount.toFixed(2)} DH</span>
                          </div>
                        )}
                        
                        {job && (
                          <div className="flex justify-between text-sm md:text-base text-green-600">
                            <span>Job:</span>
                            <span className="font-semibold">+{jobAmount.toFixed(2)} DH</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-lg md:text-xl font-bold border-t pt-2">
                          <span>Total Général:</span>
                          <span>{currentSale.total_amount?.toFixed(2)} DH</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm md:text-base">
                      Aucun article dans cette vente
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'impression */}
      {showPrintDialog && (
        <PrintInvoice 
          sale={{
            ...currentSale,
            sale_items: currentSale.sale_items?.map(item => ({
              ...item,
              product: item.product || { name: 'Produit inconnu' } // Ensure product exists
            })) || [],
            transport: transport || null,
            job: job || null
          }} 
          onClose={() => setShowPrintDialog(false)}
        />
      )}
    </>
  )
}