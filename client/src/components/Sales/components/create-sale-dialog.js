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
  Square
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

export default function CreateSaleDialog({ onSuccess, onCancel }) {
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  
  // États pour la recherche et sélection des produits
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
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
    setSelectedClient(newClient.id.toString())
    fetchClients()
  }

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        client: parseInt(selectedClient),
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
      const saleId = saleResult.data.documentId

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

      // Préparer les données pour l'impression
      const saleForPrint = {
        id: saleId,
        total_amount: grandTotal,
        paid_amount: paid,
        remaining_amount: remaining,
        sale_date: saleDate,
        client: {
          name: clients.find(c => c.id.toString() === selectedClient)?.name || 'Client',
          phone: clients.find(c => c.id.toString() === selectedClient)?.phone || ''
        },
        sale_items: cart.map(item => ({
          product: { 
            name: item.product.name,
            // Add other product fields if needed
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
        alert('Vente créée avec succès!')
        onSuccess()
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

  const clearTransport = () => {
    setTransportName('')
    setTransportPrice('')
  }

  const clearJob = () => {
    setJobName('')
    setJobPrice('')
  }

  const productsToShow = searchTerm ? filteredProducts : products

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 h-full overflow-y-auto p-6">
        {/* Colonne Gauche - Recherche et Panier */}
        <div className="xl:col-span-2 space-y-4 md:space-y-6">
          {/* Recherche de Produits */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Search className="h-5 w-5" />
                Recherche de Produits
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
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
                  className="pl-10 bg-background text-base md:text-lg"
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
                        className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-muted flex items-center justify-center border">
                        <Package className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm md:text-lg truncate">{product.name}</div>
                      <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-1 md:gap-2 flex-wrap">
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
                    <Badge variant="outline" className="text-xs md:text-sm whitespace-nowrap">
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
                <div className="border rounded-lg p-4 md:p-6 space-y-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                      {selectedProduct.photo ? (
                        <img
                          src={`${API_URL}${selectedProduct.photo.url}`}
                          alt={selectedProduct.name}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-muted flex items-center justify-center border">
                          <Package className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-lg md:text-xl truncate">{selectedProduct.name}</div>
                        <div className="text-sm md:text-md text-muted-foreground">
                          {selectedProduct.category?.name} • {selectedProduct.price} DH
                        </div>
                        <div className={`text-sm md:text-md font-medium ${
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

                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-sm md:text-lg">Quantité</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedProduct.stock_quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="bg-background text-base md:text-lg h-10 md:h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customPrice" className="text-sm md:text-lg">Prix Unitaire (DH)</Label>
                      <Input
                        id="customPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="bg-background text-base md:text-lg h-10 md:h-12"
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
                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-yellow-600 shrink-0" />
                      <div className="text-yellow-800 text-sm md:text-md">
                        <strong>Stock insuffisant!</strong> Stock disponible: {selectedProduct.stock_quantity}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={addToCart} 
                    className="w-full h-10 md:h-12 text-sm md:text-lg"
                    disabled={quantity <= 0}
                  >
                    <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Ajouter au Panier ({((parseFloat(customPrice) || selectedProduct.price) * quantity).toFixed(2)} DH)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panier */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                Panier ({cart.length} article(s))
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Articles ajoutés à la vente en cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-3 md:mb-4 opacity-50" />
                  <p className="text-lg md:text-xl">Le panier est vide</p>
                  <p className="text-sm md:text-lg">Ajoutez des produits depuis la recherche ci-dessus</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 md:p-4 border rounded-lg bg-background">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm md:text-lg truncate">{item.product.name}</div>
                        <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
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
                      <div className="flex items-center gap-2 md:gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(index, item.quantity - 1)}
                          className="h-8 w-8 md:h-10 md:w-10 p-0"
                        >
                          <Minus className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <span className="w-8 md:w-12 text-center font-medium text-sm md:text-lg">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(index, item.quantity + 1)}
                          className="h-8 w-8 md:h-10 md:w-10 p-0"
                        >
                          <Plus className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                      <div className="font-semibold text-sm md:text-lg w-16 md:w-20 text-right">
                        {item.total_price.toFixed(2)} DH
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(index)}
                        className="h-8 w-8 md:h-10 md:w-10 p-0"
                      >
                        <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne Droite - Paiement et Résumé */}
        <div className="space-y-4 md:space-y-6">
          {/* Sélection du Client */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User className="h-5 w-5 md:h-6 md:w-6" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm md:text-lg">Client</Label>
                  <div className="flex gap-2">
                    <Select value={selectedClient} onValueChange={setSelectedClient} className="flex-1">
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
                
                {selectedClient && (
                  <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 text-sm md:text-base">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                      <span>Client sélectionné</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services - Transport et Job */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Briefcase className="h-5 w-5 md:h-6 md:w-6" />
                Services Additionnels
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Ajoutez des services de transport ou de job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transport */}
              <div className="space-y-4 p-4 border rounded-lg ">
                <div className="flex items-center justify-between">
                  <Label className="text-sm md:text-lg flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Transport
                  </Label>
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
                      className="bg-background text-sm md:text-base"
                      placeholder="Ex: Livraison à domicile, Transport rapide..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transportPrice" className="text-sm">Prix du Transport (DH)</Label>
                    <Input
                      id="transportPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={transportPrice}
                      onChange={(e) => setTransportPrice(e.target.value)}
                      className="bg-background text-sm md:text-base"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {transportName && (
                  <div className="p-3 bg-blue-100 border border-blue-200 rounded">
                    <div className="text-blue-800 text-sm font-medium">
                      Transport: {transportName} - {parseFloat(transportPrice || 0).toFixed(2)} DH
                    </div>
                  </div>
                )}
              </div>

              {/* Job */}
              <div className="space-y-4 p-4 border rounded-lg ">
                <div className="flex items-center justify-between">
                  <Label className="text-sm md:text-lg flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job
                  </Label>
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
                      className="bg-background text-sm md:text-base"
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
                      className="bg-background text-sm md:text-base"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {jobName && (
                  <div className="p-3 bg-green-100 border border-green-200 rounded">
                    <div className="text-green-800 text-sm font-medium">
                      Job: {jobName} - {parseFloat(jobPrice || 0).toFixed(2)} DH
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Résumé de la Vente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Résumé de la Vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm md:text-lg">
                  <span>Sous-total Produits:</span>
                  <span className="font-semibold">
                    {cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0).toFixed(2)} DH
                  </span>
                </div>
                
                {transportName && (
                  <div className="flex justify-between text-sm md:text-lg text-blue-600">
                    <span>Transport:</span>
                    <span className="font-semibold">+{(parseFloat(transportPrice) || 0).toFixed(2)} DH</span>
                  </div>
                )}
                
                {jobName && (
                  <div className="flex justify-between text-sm md:text-lg text-green-600">
                    <span>Job:</span>
                    <span className="font-semibold">+{(parseFloat(jobPrice) || 0).toFixed(2)} DH</span>
                  </div>
                )}

                <div className="flex justify-between text-sm md:text-lg">
                  <span>Sous-total:</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} DH</span>
                </div>
                
                <div className="flex justify-between text-sm md:text-lg">
                  <span>Remise:</span>
                  <span className="font-semibold text-red-600">-{discount.toFixed(2)} DH</span>
                </div>
                
                <div className="border-t pt-3 flex justify-between text-lg md:text-xl font-bold">
                  <span>Total:</span>
                  <span>{grandTotal.toFixed(2)} DH</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount" className="text-sm md:text-lg">Remise (DH)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="bg-background h-10 md:h-12 text-sm md:text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Paiement */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-lg">Méthode de Paiement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-background h-10 md:h-12 text-sm md:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash" className="text-sm md:text-base">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 md:h-5 md:w-5" />
                        Espèces
                      </div>
                    </SelectItem>
                    <SelectItem value="card" className="text-sm md:text-base">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                        Carte Bancaire
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer" className="text-sm md:text-base">
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 md:h-5 md:w-5" />
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
                <Label htmlFor="paidAmount" className="text-sm md:text-lg">Montant Payé (DH)</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="bg-background h-10 md:h-12 text-sm md:text-base"
                  placeholder="0.00"
                  disabled={isPaid}
                />
              </div>

              <div className="space-y-3 p-3 md:p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm md:text-lg">
                  <span>Total à payer:</span>
                  <span className="font-semibold">{grandTotal.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm md:text-lg">
                  <span>Montant payé:</span>
                  <span className="font-semibold text-green-600">
                    {(parseFloat(paidAmount) || 0).toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between text-lg md:text-xl font-bold border-t pt-3">
                  <span>Reste à payer:</span>
                  <span className={
                    remainingAmount > 0 ? 'text-red-600' : 'text-green-600'
                  }>
                    {remainingAmount.toFixed(2)} DH
                  </span>
                </div>
              </div>

              {remainingAmount > 0 && (
                <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-blue-800 text-sm md:text-base text-center">
                    <strong>Note:</strong> Le montant restant sera enregistré comme dette du client
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                <Button 
                  onClick={() => handleCompleteSale(true)}
                  disabled={loading || (cart.length === 0 && !transportName && !jobName) || !selectedClient}
                  className="w-full h-12 md:h-14 text-sm md:text-xl"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 md:h-6 md:w-6 border-b-2 border-white mr-2 md:mr-3"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 md:h-6 md:w-6 mr-2 md:mr-3" />
                      Finaliser et Imprimer
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => handleCompleteSale(false)}
                  disabled={loading || (cart.length === 0 && !transportName && !jobName) || !selectedClient}
                  variant="outline"
                  className="w-full h-10 md:h-12 text-xs md:text-lg"
                >
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Finaliser sans Imprimer
                </Button>

                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={loading}
                  className="w-full h-10 md:h-12 text-xs md:text-lg"
                >
                  Annuler
                </Button>

                {(cart.length > 0 || transportName || jobName) && (
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setCart([])
                        setTransportName('')
                        setTransportPrice('')
                        setJobName('')
                        setJobPrice('')
                        setIsPaid(false)
                        setPaidAmount('')
                      }}
                      disabled={loading}
                      className="text-xs md:text-lg"
                    >
                      Tout Effacer
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog d'impression */}
      {showPrintDialog && lastCreatedSale && (
        <PrintInvoice 
          sale={lastCreatedSale} 
          onClose={handlePrintAndClose}
        />
      )}

      {/* Dialog d'ajout de client */}
      <AddClientDialog
        open={showAddClientDialog}
        onOpenChange={setShowAddClientDialog}
        onClientAdded={handleClientAdded}
      />
    </>
  )
}