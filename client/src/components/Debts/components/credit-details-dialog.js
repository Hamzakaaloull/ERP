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
import { 
  User, 
  Calendar, 
  CreditCard,
  FileText,
  ShoppingCart,
  Clock,

} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function CreditDetailsDialog({ credit, open, onOpenChange }) {
  const [paymentHistories, setPaymentHistories] = useState([])
  const [loadingHistories, setLoadingHistories] = useState(false)

  useEffect(() => {
    if (open && credit) {
      fetchPaymentHistories()
    }
  }, [open, credit])

  const fetchPaymentHistories = async () => {
    if (!credit) return
    
    setLoadingHistories(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_URL}/api/payment-histories?filters[credit][id][$eq]=${credit.id}&populate=*&sort=createdAt:desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      const data = await response.json()
      
      if (data && data.data) {
        setPaymentHistories(data.data)
      } else {
        setPaymentHistories([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des paiements:', error)
      setPaymentHistories([])
    } finally {
      setLoadingHistories(false)
    }
  }

  if (!credit) return null

  const getStatusBadge = (credit) => {
    const remaining = credit.amount - (credit.paid_amount || 0)
    
    if (remaining <= 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Clôturé</Badge>
    } else if (credit.statut === 'active') {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Actif</Badge>
    } else {
      return <Badge variant="destructive">Impayé</Badge>
    }
  }

  const remainingAmount = credit.amount - (credit.paid_amount || 0)

  const formatPaymentMethod = (method) => {
    const methods = {
      'cash': 'Espèces',
      'card': 'Carte Bancaire',
      'transfer': 'Virement',
      'check': 'Chèque'
    }
    return methods[method] || method
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl flex items-center gap-2 dark:text-white">
            <CreditCard className="h-5 w-5 md:h-6 md:w-6" />
            Détails du Crédit #{credit.id}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base dark:text-gray-300">
            Informations complètes sur ce crédit et historique des paiements
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Colonne de gauche - Informations du crédit */}
          <div className="space-y-4 md:space-y-6">
            {/* Informations Générales */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg dark:text-white">
                  <FileText className="h-4 w-4 md:h-5 md:w-5" />
                  Informations Générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm md:text-base dark:text-gray-200">Statut:</span>
                  {getStatusBadge(credit)}
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium dark:text-gray-200">Date création:</span>
                  <span className="dark:text-gray-300">{credit.createdAt ? new Date(credit.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                {credit.due_date && (
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="font-medium dark:text-gray-200">Date d'échéance:</span>
                    <span className="dark:text-gray-300">{new Date(credit.due_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium dark:text-gray-200">Montant total:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{credit.amount.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-green-600 text-sm md:text-base dark:text-green-400">
                  <span className="font-medium">Montant payé:</span>
                  <span className="font-semibold">{(credit.paid_amount || 0).toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-orange-600 text-sm md:text-base font-bold dark:text-orange-400">
                  <span className="font-medium">Reste à payer:</span>
                  <span className="font-semibold">{remainingAmount.toFixed(2)} DH</span>
                </div>
              </CardContent>
            </Card>

            {/* Informations Client */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg dark:text-white">
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium dark:text-gray-200">Nom:</span>
                  <span className="dark:text-gray-300">{credit.client?.name || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="font-medium dark:text-gray-200">Téléphone:</span>
                  <span className="dark:text-gray-300">{credit.client?.phone || 'Non spécifié'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Informations Vente Associée */}
            {credit.sale && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg dark:text-white">
                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                    Vente Associée #{credit.sale.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="font-medium dark:text-gray-200">Date vente:</span>
                    <span className="dark:text-gray-300">{credit.sale.sale_date ? new Date(credit.sale.sale_date).toLocaleDateString('fr-FR') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="font-medium dark:text-gray-200">Total vente:</span>
                    <span className="font-semibold dark:text-gray-300">{credit.sale.total_amount?.toFixed(2) || '0.00'} DH</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="font-medium dark:text-gray-200">Articles:</span>
                    <span className="dark:text-gray-300">{credit.sale.sale_items?.length || 0} article(s)</span>
                  </div>
                  
                  {/* Détails des articles */}
                  {credit.sale.sale_items && credit.sale.sale_items.length > 0 && (
                    <div className="mt-4 border rounded-lg p-3 dark:border-gray-600">
                      <div className="font-medium text-sm mb-2 dark:text-gray-200">Articles de la vente:</div>
                      <div className="space-y-2">
                        {credit.sale.sale_items.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs dark:text-gray-300">
                            <span>{item.product?.name || 'Produit'} × {item.quantity}</span>
                            <span>{item.total_price?.toFixed(2) || '0.00'} DH</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Si pas de vente associée */}
            {!credit.sale && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg dark:text-white">
                    <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                    Crédit Direct
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm md:text-base text-muted-foreground dark:text-gray-400">
                    Ce crédit n'est pas associé à une vente spécifique. Il s'agit d'un crédit direct accordé au client.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne de droite - Historique des paiements */}
          <div className="space-y-4 md:space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg dark:text-white">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                  Historique des Paiements
                  <Badge variant="outline" className="ml-2 dark:border-gray-600 dark:text-gray-300">
                    {paymentHistories.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm dark:text-gray-400">
                  Liste de tous les paiements effectués sur ce crédit
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistories ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2 dark:text-gray-400">Chargement de l'historique...</p>
                  </div>
                ) : paymentHistories.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {paymentHistories.map((payment) => (
                      <div 
                        key={payment.id} 
                        className="border rounded-lg p-3 dark:border-gray-600 hover:bg-muted/50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                           <span className='    '   >DH</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {payment.amount?.toFixed(2)} DH
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                            {formatPaymentMethod(payment.payment_method) || 'cache'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {payment.payment_date ? 
                                new Date(payment.payment_date).toLocaleDateString('fr-FR') : 
                                new Date(payment.createdAt).toLocaleDateString('fr-FR')
                              }
                            </span>
                          </div>
                          <div className="text-right">
                            {payment.payment_date ? 
                              new Date(payment.payment_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 
                              new Date(payment.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                            }
                          </div>
                        </div>

                        {payment.note && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs dark:text-gray-300">
                            {payment.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                     <span className='    '   >DH</span>
                    <h3 className="text-base font-semibold text-foreground mb-2 dark:text-gray-200">
                      Aucun paiement enregistré
                    </h3>
                    <p className="text-muted-foreground text-sm dark:text-gray-400">
                      Aucun paiement n'a été effectué sur ce crédit pour le moment.
                    </p>
                  </div>
                )}

                {/* Résumé des paiements */}
                {paymentHistories.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium dark:text-gray-200">Total payé:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {paymentHistories.reduce((total, payment) => total + (payment.amount || 0), 0).toFixed(2)} DH
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="font-medium dark:text-gray-200">Nombre de paiements:</span>
                      <span className="font-semibold dark:text-gray-300">{paymentHistories.length}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}