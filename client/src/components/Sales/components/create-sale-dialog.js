"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  User, 
  CreditCard, 
  Banknote,
  Send,
  Package,
  AlertTriangle,
  CheckCircle2,
  Printer,
  X,
  Edit,
  Save,
  Truck,
  Briefcase,
  CheckSquare,
  Square,
  Check
} from 'lucide-react'
import PrintInvoice from './print-invoice'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

// Composant pour ajouter un client
function AddClientDialog({ open, onOpenChange, onClientAdded }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Veuillez entrer un nom pour le client')
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
      } else {
        throw new Error('Erreur lors de la création du client')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création du client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 ">
            <User className="h-5 w-5 " />
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

// Animation de succès simple avec checkmark (1 seconde)
function SuccessAnimation({ onAnimationComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete()
    }, 1000) // 1 seconde
    return () => clearTimeout(timer)
  }, [onAnimationComplete])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-transparent dark:backdrop-blur-xs rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center justify-center">
        <div className="relative mb-6">
          {/* Checkmark animé */}
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-checkmark">
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Succès!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Vente créée avec succès
        </p>
      </div>
    </div>
  )
}

export default function CreateSaleDialog({ onSuccess, onCancel }) {
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  
  // États pour la recherche et sélection des produits
  const [searchTerm, setSearchTerm] = useState('')
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [cart, setCart] = useState([])
  
  // États pour le paiement
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paidAmount, setPaidAmount] = useState('')
  const [isPaid, setIsPaid] = useState(false)
  
  // États pour les calculs
  const [subtotal, setSubtotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [remainingAmount, setRemainingAmount] = useState(0)
  
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [customPrice, setCustomPrice] = useState('')
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [lastCreatedSale, setLastCreatedSale] = useState(null)
  const [showAddClientDialog, setShowAddClientDialog] = useState(false)
  const [editingPriceIndex, setEditingPriceIndex] = useState(null)
  const [tempPrice, setTempPrice] = useState('')

  // États pour transport et job comme nouvelles entrées
  const [transportName, setTransportName] = useState('')
  const [transportPrice, setTransportPrice] = useState('')
  const [jobName, setJobName] = useState('')
  const [jobPrice, setJobPrice] = useState('')
  
  // État pour les tabs de services
  const [activeServiceTab, setActiveServiceTab] = useState('transport')
  
  // État pour l'animation de succès
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchClients()
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [cart, discount, transportPrice, jobPrice])

  useEffect(() => {
    if (isPaid) {
      setPaidAmount(grandTotal.toString())
      setRemainingAmount(0)
    } else if (paidAmount) {
      const paid = parseFloat(paidAmount) || 0
      setRemainingAmount(Math.max(0, grandTotal - paid))
    } else {
      setRemainingAmount(grandTotal)
    }
  }, [grandTotal, paidAmount, isPaid])

  useEffect(() => {
    if (selectedProduct) {
      setCustomPrice(selectedProduct.price)
    }
  }, [selectedProduct])

  // Charger les données
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/products?populate=category&populate=photo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data && data.data) {
        setProducts(data.data)
      } else {
        console.error('هيكل بيانات المنتجات غير متوقع:', data)
        setProducts([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      setProducts([])
    }
  }

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

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setCurrentUser(data)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error)
    }
  }

  const handleClientAdded = (newClient) => {
    setClients(prev => [...prev, newClient])
    setSelectedClient(newClient)
    setClientSearchTerm('')
    fetchClients()
  }

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(clientSearchTerm.toLowerCase())
  )

  const calculateTotals = () => {
    const productsSubtotal = cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0)
    const transportCost = parseFloat(transportPrice) || 0
    const jobCost = parseFloat(jobPrice) || 0
    
    const newSubtotal = productsSubtotal + transportCost + jobCost
    setSubtotal(newSubtotal)
    
    const newGrandTotal = newSubtotal - discount
    setGrandTotal(Math.max(0, newGrandTotal))
  }

  const addToCart = () => {
    if (!selectedProduct || quantity <= 0) return

    if (quantity > selectedProduct.stock_quantity) {
      if (!confirm(`Stock insuffisant! Stock disponible: ${selectedProduct.stock_quantity}. Voulez-vous continuer?`)) {
        return
      }
    }

    const existingItemIndex = cart.findIndex(item => item.product.id === selectedProduct.id)

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += quantity
      updatedCart[existingItemIndex].unit_price = parseFloat(customPrice) || selectedProduct.price
      updatedCart[existingItemIndex].total_price = updatedCart[existingItemIndex].unit_price * updatedCart[existingItemIndex].quantity
      setCart(updatedCart)
    } else {
      const cartItem = {
        product: selectedProduct,
        quantity: quantity,
        unit_price: parseFloat(customPrice) || selectedProduct.price,
        total_price: (parseFloat(customPrice) || selectedProduct.price) * quantity
      }
      setCart([...cart, cartItem])
    }

    setSelectedProduct(null)
    setQuantity(1)
    setCustomPrice('')
    setSearchTerm('')
  }

  const updateCartQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index)
      return
    }

    const updatedCart = [...cart]
    updatedCart[index].quantity = newQuantity
    updatedCart[index].total_price = updatedCart[index].unit_price * newQuantity
    setCart(updatedCart)
  }

  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index)
    setCart(updatedCart)
  }

  const startEditingPrice = (index) => {
    setEditingPriceIndex(index)
    setTempPrice(cart[index].unit_price)
  }

  const saveEditedPrice = (index) => {
    const updatedCart = [...cart]
    updatedCart[index].unit_price = parseFloat(tempPrice) || updatedCart[index].unit_price
    updatedCart[index].total_price = updatedCart[index].unit_price * updatedCart[index].quantity
    setCart(updatedCart)
    setEditingPriceIndex(null)
    setTempPrice('')
  }

  const cancelEditingPrice = () => {
    setEditingPriceIndex(null)
    setTempPrice('')
  }

  const handleCompleteSale = async (printInvoice = false) => {
    if (cart.length === 0 && !transportName && !jobName) {
      alert('Le panier est vide et aucun service (transport/job) n\'est ajouté!')
      return
    }

    if (!selectedClient) {
      alert('Veuillez sélectionner un client!')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const saleDate = new Date().toISOString()
      const paid = isPaid ? grandTotal : (parseFloat(paidAmount) || 0)
      const remaining = Math.max(0, grandTotal - paid)

      // Préparer les données de la vente
      const saleData = {
        total_amount: grandTotal,
        paid_amount: paid,
        remaining_amount: remaining,
        sale_date: saleDate,
        client: selectedClient.id,
        user: currentUser?.id
      }

      // Créer la vente
      const saleResponse = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: saleData })
      })

      if (!saleResponse.ok) {
        const errorText = await saleResponse.text()
        console.error('Erreur réponse:', errorText)
        throw new Error('Erreur lors de la création de la vente')
      }

      const saleResult = await saleResponse.json()
      console.log('Sale creation response:', saleResult) // Debug log
      
      // Get sale ID from response - IMPORTANT FIX
      let saleId
      if (saleResult.data && saleResult.data.documentId) {
        // Use documentId if available
        saleId = saleResult.data.documentId
      } else if (saleResult.data && saleResult.data.id) {
        // Fall back to id if documentId not available
        saleId = saleResult.data.id
      } else {
        console.error('No sale ID found in response:', saleResult)
        throw new Error('Aucun ID de vente trouvé dans la réponse')
      }

      // Créer les items de vente
      for (const item of cart) {
        const saleItemData = {
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          sale: saleId,
          product: item.product.documentId
        }

        const itemResponse = await fetch(`${API_URL}/api/sale-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ data: saleItemData })
        })

        if (!itemResponse.ok) {
          throw new Error('Erreur lors de la création des items')
        }

        // Mettre à jour le stock du produit
        const newStock = item.product.stock_quantity - item.quantity

        await fetch(`${API_URL}/api/products/${item.product.documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            data: { stock_quantity: Math.max(0, newStock) }
          })
        })
      }

      // Créer un transport si rempli
      if (transportName) {
        const transportData = {
          sale: saleId,
          name: transportName,
          price: parseFloat(transportPrice) || 0
        }

        await fetch(`${API_URL}/api/transports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ data: transportData })
        })
      }

      // Créer un job si rempli
      if (jobName) {
        const jobData = {
          sale: saleId,
          name: jobName,
          price: parseFloat(jobPrice) || 0
        }

        await fetch(`${API_URL}/api/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ data: jobData })
        })
      }

      // Créer un mouvement de stock
      for (const item of cart) {
        const stockMovementData = {
          type: 'OUT',
          quantity: item.quantity,
          reference: `Vente #${saleId}`,
          date: saleDate,
          product: item.product.documentId,
          description : `Vente de ${item.quantity} ${item.product.unit} de ${item.product.name}`
        }

        await fetch(`${API_URL}/api/stock-movements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ data: stockMovementData })
        })
      }

      // Créer un historique
      const historyData = {
        action_type: 'create',
        entity_name: 'sale',
        entity_id: saleId,
        old_data : {},
        new_data : {},
        action_date: saleDate,  
      }

      await fetch(`${API_URL}/api/histories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: historyData })
      })

      // Préparer les données pour l'impression - FIXED: Include both id and documentId
      const saleForPrint = {
        id: saleId, // Use the sale ID we got
        documentId: saleId, // Also set documentId to the same value
        total_amount: grandTotal,
        paid_amount: paid,
        remaining_amount: remaining,
        sale_date: saleDate,
        client: {
          name: selectedClient.name,
          phone: selectedClient.phone || ''
        },
        sale_items: cart.map(item => ({
          product: { 
            name: item.product.name,
            ...item.product
          },
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        })),
        transport: transportName ? {
          name: transportName,
          price: parseFloat(transportPrice) || 0
        } : null,
        job: jobName ? {
          name: jobName,
          price: parseFloat(jobPrice) || 0
        } : null
      }

      setLastCreatedSale(saleForPrint)

      if (printInvoice) {
        setShowPrintDialog(true)
      } else {
        // Afficher l'animation de succès
        setShowSuccessAnimation(true)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la vente:', error)
      alert('Erreur lors de la création de la vente: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrintAndClose = () => {
    setShowPrintDialog(false)
    onSuccess()
  }

  const handleAnimationComplete = () => {
    setShowSuccessAnimation(false)
    onSuccess()
  }

  const clearTransport = () => {
    setTransportName('')
    setTransportPrice('')
  }

  const clearJob = () => {
    setJobName('')
    setJobPrice('')
  }

  const clearSelectedClient = () => {
    setSelectedClient(null)
    setClientSearchTerm('')
  }

  const productsToShow = searchTerm ? filteredProducts : products

  return (
    <>
      {/* Header avec boutons d'action en haut */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Nouvelle Facture</h1>
            <p className="text-muted-foreground">Ajoutez des produits et configurez la vente</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleCompleteSale(true)}
              disabled={loading || (cart.length === 0 && !transportName && !jobName) || !selectedClient}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <Printer className="h-5 w-5" />
                  Finaliser et Imprimer
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => handleCompleteSale(false)}
              disabled={loading || (cart.length === 0 && !transportName && !jobName) || !selectedClient}
              variant="outline"
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Finaliser sans Imprimer
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6 overflow-y-auto h-[calc(100vh-100px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne Gauche - Produits et Panier */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recherche de Produits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Recherche de Produits
                </CardTitle>
                <CardDescription>
                  Recherchez et ajoutez des produits au panier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom ou catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>

                {/* Liste des Produits */}
                <div className="border rounded-lg max-h-80 overflow-y-auto">
                  {productsToShow.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id ? 'bg-primary/10 border-primary' : ''
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.photo ? (
                        <img
                          src={`${API_URL}${product.photo.url}`}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{product.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span className="truncate">{product.category?.name}</span>
                          <span>•</span>
                          <span className="font-semibold">{product.price} DH</span>
                          <span>•</span>
                          <span className={
                            product.stock_quantity < 10 
                              ? 'text-red-600 font-semibold' 
                              : 'text-green-600'
                          }>
                            Stock: {product.stock_quantity}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-sm whitespace-nowrap">
                        {product.unit || 'Unité'}
                      </Badge>
                    </div>
                  ))}
                  
                  {productsToShow.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun produit trouvé</p>
                    </div>
                  )}
                </div>

                {/* Sélection du Produit */}
                {selectedProduct && (
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {selectedProduct.photo ? (
                          <img
                            src={`${API_URL}${selectedProduct.photo.url}`}
                            alt={selectedProduct.name}
                            className="w-16 h-16 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{selectedProduct.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedProduct.category?.name} • {selectedProduct.price} DH
                          </div>
                          <div className={`text-sm font-medium ${
                            selectedProduct.stock_quantity < 10 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            Stock: {selectedProduct.stock_quantity} {selectedProduct.unit}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProduct(null)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantité</Label>
                        <Input
                          id="quantity"
                          type="number"
                         
                          max={selectedProduct.stock_quantity}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value))}
                          className="bg-background "
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customPrice">Prix Unitaire (DH)</Label>
                        <Input
                          id="customPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          className="bg-background"
                          placeholder={selectedProduct.price}
                        />
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Prix original: {selectedProduct.price} DH • 
                      Nouveau prix: {customPrice || selectedProduct.price} DH • 
                      Total: {((parseFloat(customPrice) || selectedProduct.price) * quantity).toFixed(2)} DH
                    </div>

                    {quantity > selectedProduct.stock_quantity && (
                      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                        <div className="text-yellow-800 text-sm">
                          <strong>Stock insuffisant!</strong> Stock disponible: {selectedProduct.stock_quantity}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={addToCart} 
                      className="w-full"
                      disabled={quantity <= 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter au Panier ({((parseFloat(customPrice) || selectedProduct.price) * quantity).toFixed(2)} DH)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Panier ({cart.length} article(s))
                </CardTitle>
                <CardDescription>
                  Articles ajoutés à la vente en cours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Le panier est vide</p>
                    <p className="text-sm">Ajoutez des produits depuis la recherche ci-dessus</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 border rounded-lg bg-background">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.product.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                            {editingPriceIndex === index ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(e.target.value)}
                                  className="w-20 h-6 text-xs"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => saveEditedPrice(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Save className="h-3 w-3 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelEditingPrice}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{item.unit_price} DH</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditingPrice(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3 text-blue-600" />
                                </Button>
                              </div>
                            )}
                            <span>× {item.quantity} {item.product.unit}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(index, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(index, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="font-semibold text-right w-20">
                          {item.total_price.toFixed(2)} DH
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(index)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne Droite - Configuration */}
          <div className="space-y-6">
            {/* Sélection du Client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Client sélectionné */}
                  {selectedClient ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-green-800">{selectedClient.name}</div>
                            {selectedClient.phone && (
                              <div className="text-sm text-green-600">{selectedClient.phone}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelectedClient}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground text-center">
                        Client sélectionné. Cliquez sur le X pour changer.
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Recherche de client */}
                      <div className="space-y-2">
                        <Label>Rechercher un Client</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher par nom ou téléphone..."
                            value={clientSearchTerm}
                            onChange={(e) => setClientSearchTerm(e.target.value)}
                            className="pl-10 bg-background"
                          />
                        </div>
                      </div>

                      {/* Liste des clients */}
                      <div className="border rounded-lg max-h-60 overflow-y-auto">
                        {filteredClients.length > 0 ? (
                          filteredClients.map(client => (
                            <div
                              key={client.id}
                              className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => setSelectedClient(client)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{client.name}</div>
                                {client.phone && (
                                  <div className="text-sm text-muted-foreground truncate">{client.phone}</div>
                                )}
                              </div>
                              <div className="p-1 rounded-full border">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            {clientSearchTerm ? (
                              <div>
                                <p>Aucun client trouvé</p>
                                <p className="text-sm">Essayer un autre terme ou créer un nouveau client</p>
                              </div>
                            ) : (
                              <p>Aucun client dans la base de données</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bouton ajouter client */}
                      <div className="flex justify-center pt-2">
                        <Button
                          type="button"
                          onClick={() => setShowAddClientDialog(true)}
                          variant="outline"
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter un Nouveau Client
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Services Additionnels avec Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Services Additionnels
                </CardTitle>
                <CardDescription>
                  Ajoutez des services de transport ou de job
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tabs pour Services */}
                <div className="flex border-b">
                  <button
                    className={`flex-1 py-2 text-center font-medium transition-colors ${
                      activeServiceTab === 'transport'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveServiceTab('transport')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Truck className="h-4 w-4" />
                      Transport
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-2 text-center font-medium transition-colors ${
                      activeServiceTab === 'job'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveServiceTab('job')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Job
                    </div>
                  </button>
                </div>

                {/* Contenu des Tabs */}
                <div className="pt-2">
                  {activeServiceTab === 'transport' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">Transport</Label>
                        {transportName && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearTransport}
                            className="h-6 w-6 p-0 text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="transportName" className="text-sm">Nom du Transport</Label>
                          <Input
                            id="transportName"
                            value={transportName}
                            onChange={(e) => setTransportName(e.target.value)}
                            className="bg-background text-sm [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Ex: Livraison à domicile, Transport rapide..."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="transportPrice" className="text-sm">Prix du Transport (DH)</Label>
                          <Input
                            id="transportPrice"
                            type="number"
                            min="0"
                            
                            value={transportPrice}
                            onChange={(e) => setTransportPrice(e.target.value)}
                            className="bg-background text-sm  [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {transportName && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-blue-800 text-sm font-medium">
                            Transport: {transportName} - {parseFloat(transportPrice || 0).toFixed(2)} DH
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeServiceTab === 'job' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">Job</Label>
                        {jobName && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearJob}
                            className="h-6 w-6 p-0 text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="jobName" className="text-sm">Nom du Job</Label>
                          <Input
                            id="jobName"
                            value={jobName}
                            onChange={(e) => setJobName(e.target.value)}
                            className="bg-background text-sm"
                            placeholder="Ex: Installation, Réparation, Montage..."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="jobPrice" className="text-sm">Prix du Job (DH)</Label>
                          <Input
                            id="jobPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            value={jobPrice}
                            onChange={(e) => setJobPrice(e.target.value)}
                            className="bg-background text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {jobName && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <div className="text-green-800 text-sm font-medium">
                            Job: {jobName} - {parseFloat(jobPrice || 0).toFixed(2)} DH
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Résumé de la Vente */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé de la Vente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sous-total Produits:</span>
                    <span className="font-semibold">
                      {cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0).toFixed(2)} DH
                    </span>
                  </div>
                  
                  {transportName && (
                    <div className="flex justify-between text-blue-600">
                      <span>Transport:</span>
                      <span className="font-semibold">+{(parseFloat(transportPrice) || 0).toFixed(2)} DH</span>
                    </div>
                  )}
                  
                  {jobName && (
                    <div className="flex justify-between text-green-600">
                      <span>Job:</span>
                      <span className="font-semibold">+{(parseFloat(jobPrice) || 0).toFixed(2)} DH</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span className="font-semibold">{subtotal.toFixed(2)} DH</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Remise:</span>
                    <span className="font-semibold text-red-600">-{discount.toFixed(2)} DH</span>
                  </div>
                  
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{grandTotal.toFixed(2)} DH</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Remise (DH)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="bg-background"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Paiement */}
            <Card>
              <CardHeader>
                <CardTitle>Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Méthode de Paiement</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          Espèces
                        </div>
                      </SelectItem>
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Carte Bancaire
                        </div>
                      </SelectItem>
                      <SelectItem value="transfer">
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Virement
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Checkbox for marking as paid */}
                <div className="flex items-center space-x-2 pt-2 pb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPaid(!isPaid)}
                    className="flex items-center space-x-2 p-2 h-auto"
                  >
                    {isPaid ? (
                      <CheckSquare className="h-5 w-5 text-green-600" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">Marquer comme payée</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paidAmount">Montant Payé (DH)</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="bg-background"
                    placeholder="0.00"
                    disabled={isPaid}
                  />
                </div>

                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between">
                    <span>Total à payer:</span>
                    <span className="font-semibold">{grandTotal.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant payé:</span>
                    <span className="font-semibold text-green-600">
                      {(parseFloat(paidAmount) || 0).toFixed(2)} DH
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Reste à payer:</span>
                    <span className={
                      remainingAmount > 0 ? 'text-red-600' : 'text-green-600'
                    }>
                      {remainingAmount.toFixed(2)} DH
                    </span>
                  </div>
                </div>

                {remainingAmount > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-blue-800 text-sm text-center">
                      <strong>Note:</strong> Le montant restant sera enregistré comme dette du client
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bouton Tout Effacer */}
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCart([])
                  setTransportName('')
                  setTransportPrice('')
                  setJobName('')
                  setJobPrice('')
                  setIsPaid(false)
                  setPaidAmount('')
                  setClientSearchTerm('')
                  setSelectedClient(null)
                }}
                disabled={loading}
                className="w-full"
              >
                Tout Effacer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog d'impression */}
      {showPrintDialog && lastCreatedSale && (
        <PrintInvoice 
          sale={lastCreatedSale} 
          onClose={handlePrintAndClose}
        />
      )}

      {/* Animation de succès */}
      {showSuccessAnimation && (
        <SuccessAnimation onAnimationComplete={handleAnimationComplete} />
      )}

      {/* Dialog d'ajout de client */}
      <AddClientDialog
        open={showAddClientDialog}
        onOpenChange={setShowAddClientDialog}
        onClientAdded={handleClientAdded}
      />

      {/* Styles CSS pour les animations */}
      <style jsx global>{`
        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-checkmark {
          animation: checkmark 1s ease-out forwards;
        }
      `}</style>
    </>
  )
}