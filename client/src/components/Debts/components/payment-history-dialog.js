"use client"
import React, { useState } from 'react'
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
import { HandCoins, Calendar, User, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function PaymentHistoryDialog({ sale, open, onOpenChange, onSuccess }) {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    note: ''
  })
  const [loading, setLoading] = useState(false)

  if (!sale) return null

  const remainingAmount = sale.remaining_amount || 0

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
      
      // Créer l'historique de paiement
      const paymentHistoryData = {
        amount: paymentAmount,

        payment_date: new Date(paymentData.payment_date).toISOString(),
        note: paymentData.note,
        sale: sale.documentId
      }

      const paymentResponse = await fetch(`${API_URL}/api/payment-histories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: paymentHistoryData })
      })

      if (!paymentResponse.ok) {
        throw new Error('Erreur lors de la création du paiement')
      }

      // Mettre à jour la vente
      const newPaidAmount = (sale.paid_amount || 0) + paymentAmount
      const newRemainingAmount = Math.max(0, (sale.total_amount || 0) - newPaidAmount)

      const updateData = {
        paid_amount: newPaidAmount,
        remaining_amount: newRemainingAmount
      }

      const saleResponse = await fetch(`${API_URL}/api/sales/${sale.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: updateData })
      })

      if (!saleResponse.ok) {
        throw new Error('Erreur lors de la mise à jour de la vente')
      }

      toast.success('Paiement enregistré avec succès!')
      onSuccess()
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error)
      toast.error('Erreur lors de l\'enregistrement du paiement')
    } finally {
      setLoading(false)
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
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Enregistrer un Paiement
          </DialogTitle>
          <DialogDescription>
            Enregistrez un paiement pour la vente #{sale.id}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de la Vente */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Client:</span>
                </div>
                <span className="text-sm">{sale.client?.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Reste dû:</span>
                </div>
                <span className="text-sm font-semibold text-orange-600">{remainingAmount.toFixed(2)} DH</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Total vente:</span>
                <span className="text-sm font-semibold">{sale.total_amount?.toFixed(2) || '0.00'} DH</span>
              </div>
            </CardContent>
          </Card>

          {/* Détails du Paiement */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm md:text-base">Montant du Paiement (DH) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingAmount}
                value={paymentData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="bg-background text-sm md:text-base h-10 md:h-12"
                placeholder="0.00"
                required
              />
              <div className="text-xs text-muted-foreground">
                Maximum: {remainingAmount.toFixed(2)} DH
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base">Méthode de Paiement</Label>
              <Select 
                value={paymentData.payment_method} 
                onValueChange={(value) => handleInputChange('payment_method', value)}
              >
                <SelectTrigger className="bg-background h-10 md:h-12 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash" className="text-sm md:text-base">Espèces</SelectItem>
                  <SelectItem value="card" className="text-sm md:text-base">Carte Bancaire</SelectItem>
                  <SelectItem value="transfer" className="text-sm md:text-base">Virement</SelectItem>
                  <SelectItem value="check" className="text-sm md:text-base">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date" className="text-sm md:text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date du Paiement
              </Label>
              <Input
                id="payment_date"
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => handleInputChange('payment_date', e.target.value)}
                className="bg-background text-sm md:text-base h-10 md:h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm md:text-base">Note (optionnel)</Label>
              <Input
                id="note"
                value={paymentData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                className="bg-background text-sm md:text-base h-10 md:h-12"
                placeholder="Note sur le paiement"
              />
            </div>
          </div>

          {/* Résumé */}
          {paymentData.amount && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ancien solde:</span>
                    <span className="font-semibold">{remainingAmount.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paiement:</span>
                    <span className="font-semibold">-{parseFloat(paymentData.amount).toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Nouveau solde:</span>
                    <span className="text-orange-600">
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
              className="text-sm md:text-base"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !paymentData.amount}
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