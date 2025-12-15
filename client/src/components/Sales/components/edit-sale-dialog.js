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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, User, Calendar } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function EditSaleDialog({ sale, open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    total_amount: '',
    paid_amount: '',
    remaining_amount: '',
    sale_date: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sale) {
      setFormData({
        total_amount: sale.total_amount || '',
        paid_amount: sale.paid_amount || '',
        remaining_amount: sale.remaining_amount || '',
        sale_date: sale.sale_date ? new Date(sale.sale_date).toISOString().split('T')[0] : ''
      })
    }
  }, [sale])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!sale) return

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      const updateData = {
        data: {
          total_amount: parseFloat(formData.total_amount) || 0,
          paid_amount: parseFloat(formData.paid_amount) || 0,
          remaining_amount: parseFloat(formData.remaining_amount) || 0,
          sale_date: formData.sale_date ? new Date(formData.sale_date).toISOString() : new Date().toISOString()
        }
      }

      const response = await fetch(`${API_URL}/api/sales/${sale.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        onSuccess()
      } else {
        throw new Error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour de la vente')
    } finally {
      setLoading(false)
    }
  }

  if (!sale) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-black  font-semibold dark:text-blue-100">
            <Edit className="h-6 w-6 " />
            Modifier la Vente #{sale.id}
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette vente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations Client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Nom du Client</Label>
                  <div className="p-2 border rounded bg-muted/50">
                    {sale.client?.name || 'Non spécifié'}
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Téléphone</Label>
                  <div className="p-2 border rounded bg-muted/50">
                    {sale.client?.phone || 'Non spécifié'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations Date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="sale_date">Date de Vente</Label>
                  <Input
                    id="sale_date"
                    type="date"
                    value={formData.sale_date}
                    onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                    className="bg-background  [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Montants */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Montants</CardTitle>
                <CardDescription>
                  Modifiez les montants de la vente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_amount">Montant Total (DH)</Label>
                    <Input
                      id="total_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                      className="bg-background  [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paid_amount">Montant Payé (DH)</Label>
                    <Input
                      id="paid_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                      className="bg-background  [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="remaining_amount">Reste à Payer (DH)</Label>
                    <Input
                      id="remaining_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.remaining_amount}
                      onChange={(e) => setFormData({ ...formData, remaining_amount: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end text-black dark:text-white gap-3 pt-6 border-t">
            <Button 
              type="button text-black dark:text-white" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Mettre à jour
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}