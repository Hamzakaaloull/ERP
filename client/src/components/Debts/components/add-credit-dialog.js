"use client"
import React, { useState, useEffect } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  User, 
  Calendar,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

// Composant pour ajouter un client
function AddClientDialog({ open, onOpenChange, onClientAdded }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Veuillez entrer un nom pour le client')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            name: name.trim(),
            phone: phone.trim()
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        onClientAdded(result.data)
        setName('')
        setPhone('')
        onOpenChange(false)
        toast.success('Client créé avec succès')
      } else {
        throw new Error('Erreur lors de la création du client')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création du client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Nouveau Client
          </DialogTitle>
          <DialogDescription>
            Ajouter un nouveau client à la base de données
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nom du Client *</Label>
            <Input
              id="clientName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom du client"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Téléphone</Label>
            <Input
              id="clientPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Numéro de téléphone"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AddCreditDialog({ onSuccess, onCancel }) {
  const [clients, setClients] = useState([])
  const [formData, setFormData] = useState({
    client: '',
    amount: '',
    paid_amount: '0',
    due_date: '',
    statut: 'active'
  })
  const [loading, setLoading] = useState(false)
  const [showAddClientDialog, setShowAddClientDialog] = useState(false)

  useEffect(() => {
    fetchClients()
    
    // Définir la date d'échéance par défaut (30 jours)
    const defaultDueDate = new Date()
    defaultDueDate.setDate(defaultDueDate.getDate() + 30)
    setFormData(prev => ({
      ...prev,
      due_date: defaultDueDate.toISOString().split('T')[0]
    }))
  }, [])

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data && data.data) {
        setClients(data.data)
      } else {
        setClients([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error)
      setClients([])
    }
  }

  const handleClientAdded = (newClient) => {
    setClients(prev => [...prev, newClient])
    setFormData(prev => ({ ...prev, client: newClient.id.toString() }))
    fetchClients() // Rafraîchir la liste
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.client || !formData.amount) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const creditData = {
        amount: parseFloat(formData.amount),
        paid_amount: parseFloat(formData.paid_amount) || 0,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        statut: formData.statut,
        client: parseInt(formData.client)
      }

      const response = await fetch(`${API_URL}/api/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: creditData })
      })

      if (response.ok) {
        toast.success('Crédit créé avec succès!')
        onSuccess()
      } else {
        throw new Error('Erreur lors de la création du crédit')
      }
    } catch (error) {
      console.error('Erreur lors de la création du crédit:', error)
      toast.error('Erreur lors de la création du crédit')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Informations Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Client
              </CardTitle>
              <CardDescription>
                Sélectionnez le client pour ce crédit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Client *</Label>
                <div className="flex gap-2">
                  <Select value={formData.client} onValueChange={(value) => handleInputChange('client', value)} className="flex-1">
                    <SelectTrigger className="bg-background h-10 md:h-12 text-sm md:text-base">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()} className="text-sm md:text-base">
                          {client.name} {client.phone ? `- ${client.phone}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={() => setShowAddClientDialog(true)}
                    className="h-10 md:h-12 w-10 md:w-12 p-0"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>

              {formData.client && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                    <User className="h-4 w-4" />
                    <span>Client sélectionné</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Montants */}
          <Card>
            <CardHeader>
              <CardTitle>Montants et Détails</CardTitle>
              <CardDescription>
                Définissez les montants et la date d'échéance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm md:text-base">Montant du Crédit (DH) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="bg-background text-sm md:text-base h-10 md:h-12"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paid_amount" className="text-sm md:text-base">Montant Déjà Payé (DH)</Label>
                  <Input
                    id="paid_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.paid_amount}
                    onChange={(e) => handleInputChange('paid_amount', e.target.value)}
                    className="bg-background text-sm md:text-base h-10 md:h-12"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date" className="text-sm md:text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date d'Échéance
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                    className="bg-background text-sm md:text-base h-10 md:h-12"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm md:text-base">
                  <span>Reste à payer:</span>
                  <span className="font-semibold text-orange-600">
                    {((parseFloat(formData.amount) || 0) - (parseFloat(formData.paid_amount) || 0)).toFixed(2)} DH
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
            className="text-sm md:text-base"
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !formData.client || !formData.amount}
            className="text-sm md:text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Créer le Crédit
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Dialog d'ajout de client */}
      <AddClientDialog
        open={showAddClientDialog}
        onOpenChange={setShowAddClientDialog}
        onClientAdded={handleClientAdded}
      />
    </>
  )
}