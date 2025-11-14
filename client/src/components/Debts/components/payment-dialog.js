"use client"
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { HandCoins, Calendar, User, CreditCard, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function PaymentDialog({ credit, open, onOpenChange, onSuccess }) {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    note: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && credit) {
      // Réinitialiser les données de paiement quand le dialog s'ouvre
      setPaymentData({
        amount: '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        note: ''
      })
    }
  }, [open, credit])

  if (!credit) return null

  // Calcul correct du montant restant selon le type
  const getRemainingAmount = () => {
    if (credit.type === 'sale') {
      // Pour les ventes : utiliser remaining_amount directement
      return credit.sale?.remaining_amount || credit.remaining_amount || 0
    } else {
      // Pour les crédits : calculer amount - paid_amount
      return credit.amount - (credit.paid_amount || 0)
    }
  }

  const remainingAmount = getRemainingAmount()
  const isSalePayment = credit.type === 'sale'

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const paymentAmount = parseFloat(paymentData.amount)
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Veuillez entrer un montant valide')
      return
    }

    if (paymentAmount > remainingAmount) {
      toast.error('Le montant du paiement ne peut pas dépasser le reste dû')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      if (isSalePayment) {
        // Process payment for sale
        await processSalePayment(credit, paymentAmount, paymentData)
      } else {
        // Process payment for credit
        await processCreditPayment(credit, paymentAmount, paymentData)
      }

      toast.success('Paiement enregistré avec succès!')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error)
      toast.error('Erreur lors de l\'enregistrement du paiement')
    } finally {
      setLoading(false)
    }
  }

  const processCreditPayment = async (credit, paymentAmount, paymentData) => {
    const token = localStorage.getItem('token')
    const newPaidAmount = (credit.paid_amount || 0) + paymentAmount
    const newStatus = newPaidAmount >= credit.amount ? 'closed' : 'active'

    // Mettre à jour le crédit
    const updateData = {
      paid_amount: newPaidAmount,
      statut: newStatus
    }

    const creditId = credit.documentId || credit.id
    
    const response = await fetch(`${API_URL}/api/credits/${creditId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data: updateData })
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du crédit')
    }

    // Créer un historique du paiement
    await createPaymentHistory(credit, paymentAmount, paymentData, 'credit')
  }

  const processSalePayment = async (creditData, paymentAmount, paymentData) => {
    const token = localStorage.getItem('token')
    
    // Utiliser l'objet sale directement depuis creditData.sale
    const sale = creditData.sale || creditData
    const saleId = sale.documentId || sale.id
    
    // Récupérer les données actuelles de la vente
    const saleResponse = await fetch(`${API_URL}/api/sales/${saleId}?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!saleResponse.ok) {
      throw new Error('Erreur lors de la récupération des données de la vente')
    }
    
    const saleData = await saleResponse.json()
    const currentSale = saleData.data
    
    // Calculer les nouveaux montants basés sur les données actuelles
    const currentPaidAmount = currentSale.paid_amount || 0
    const currentRemainingAmount = currentSale.remaining_amount || 0
    const totalAmount = currentSale.total_amount || 0
    
    const newPaidAmount = currentPaidAmount + paymentAmount
    const newRemainingAmount = Math.max(0, totalAmount - newPaidAmount)

    // Mettre à jour la vente
    const updateData = {
      paid_amount: newPaidAmount,
      remaining_amount: newRemainingAmount
    }

    const updateResponse = await fetch(`${API_URL}/api/sales/${saleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data: updateData })
    })

    if (!updateResponse.ok) {
      throw new Error('Erreur lors de la mise à jour de la vente')
    }

    // Créer l'historique de paiement
    await createPaymentHistory(creditData, paymentAmount, paymentData, 'sale')
  }

  const createPaymentHistory = async (entity, paymentAmount, paymentData, entityType) => {
    const token = localStorage.getItem('token')
    
    const historyData = {
      amount: paymentAmount,
      
      payment_date: new Date(paymentData.payment_date).toISOString(),
      note: paymentData.note || '',
    }

    // Ajouter la référence selon le type
    if (entityType === 'sale') {
      const sale = entity.sale || entity
      historyData.sale = sale.documentId || sale.id
    } else {
      historyData.credit = entity.documentId || entity.id
    }

    const response = await fetch(`${API_URL}/api/payment-histories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data: historyData })
    })

    if (!response.ok) {
      console.error('Erreur lors de la création de l\'historique de paiement')
      // Ne pas lancer d'erreur car le paiement principal a réussi
    }
  }

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 dark:text-white">
            <HandCoins className="h-5 w-5" />
            Enregistrer un Paiement
          </DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            {isSalePayment 
              ? `Enregistrez un paiement pour la vente #${credit.sale?.id || credit.id}`
              : `Enregistrez un paiement pour le crédit #${credit.id}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de la Dette */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  <span className="font-medium text-sm dark:text-gray-200">Client:</span>
                </div>
                <span className="text-sm dark:text-gray-300">{credit.client?.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isSalePayment ? (
                    <ShoppingCart className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
                  )}
                  <span className="font-medium text-sm dark:text-gray-200">Reste dû:</span>
                </div>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {remainingAmount.toFixed(2)} DH
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-sm dark:text-gray-200">Type:</span>
                <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                  {isSalePayment ? 'Vente' : 'Crédit'}
                </Badge>
              </div>

              {isSalePayment && credit.sale?.total_amount && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm dark:text-gray-200">Total vente:</span>
                  <span className="text-sm dark:text-gray-300">
                    {credit.sale.total_amount.toFixed(2)} DH
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Détails du Paiement */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm md:text-base dark:text-gray-200">
                Montant du Paiement (DH) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                value={paymentData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="bg-background text-sm md:text-base h-10 md:h-12 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                placeholder="0.00"
                required
              />
              <div className="text-xs text-muted-foreground dark:text-gray-400">
                Maximum: {remainingAmount.toFixed(2)} DH
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base dark:text-gray-200">Méthode de Paiement</Label>
              <Select 
                value={paymentData.payment_method} 
                onValueChange={(value) => handleInputChange('payment_method', value)}
              >
                <SelectTrigger className="bg-background h-10 md:h-12 text-sm md:text-base dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white">
                  <SelectItem value="cash" className="text-sm md:text-base dark:hover:bg-gray-700">Espèces</SelectItem>
                  <SelectItem value="card" className="text-sm md:text-base dark:hover:bg-gray-700">Carte Bancaire</SelectItem>
                  <SelectItem value="transfer" className="text-sm md:text-base dark:hover:bg-gray-700">Virement</SelectItem>
                  <SelectItem value="check" className="text-sm md:text-base dark:hover:bg-gray-700">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date" className="text-sm md:text-base flex items-center gap-2 dark:text-gray-200">
                <Calendar className="h-4 w-4" />
                Date du Paiement
              </Label>
              <Input
                id="payment_date"
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => handleInputChange('payment_date', e.target.value)}
                className="bg-background text-sm md:text-base h-10 md:h-12 dark:bg-gray-800 dark:text-white dark:border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm md:text-base dark:text-gray-200">Note (optionnel)</Label>
              <Input
                id="note"
                value={paymentData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                className="bg-background text-sm md:text-base h-10 md:h-12 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                placeholder="Note sur le paiement"
              />
            </div>
          </div>

          {/* Résumé */}
          {paymentData.amount && parseFloat(paymentData.amount) > 0 && (
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between dark:text-gray-200">
                    <span>Ancien solde:</span>
                    <span className="font-semibold">{remainingAmount.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Paiement:</span>
                    <span className="font-semibold">-{parseFloat(paymentData.amount).toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold dark:border-gray-600">
                    <span className="dark:text-gray-200">Nouveau solde:</span>
                    <span className="text-orange-600 dark:text-orange-400">
                      {(remainingAmount - parseFloat(paymentData.amount)).toFixed(2)} DH
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-sm md:text-base dark:border-gray-600 dark:text-gray-200"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !paymentData.amount || parseFloat(paymentData.amount) <= 0}
              className="text-sm md:text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <HandCoins className="h-4 w-4 mr-2" />
                  Enregistrer le Paiement
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}