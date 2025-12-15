"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Package,
  Calendar,
  Hash,
  Search,
  X,
  Trash2,
  Plus,
  Check,
  Truck,
  Loader2,
  ShoppingCart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function StockMovementForm({ movement, products, onSuccess, onCancel, applyStockChange, revertStockChange }) {
  const [formData, setFormData] = useState({
    type: movement?.type || 'IN',
    quantity: movement?.quantity || '',
    reference: movement?.reference || '',
    date: movement?.date ? new Date(movement.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    description: movement?.description || '',
    product: movement?.product?.documentId || ''
  })

  const [productList, setProductList] = useState([])
  const [currentProduct, setCurrentProduct] = useState(null)
  const [currentQuantity, setCurrentQuantity] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [showTrackAnimation, setShowTrackAnimation] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)

  const isEditMode = !!movement

  useEffect(() => {
    if (!isEditMode) {
      setFilteredProducts(products)
    } else if (formData.product) {
      const product = products.find(p => p.documentId === formData.product)
      setCurrentProduct(product)
    }
  }, [isEditMode, formData.product, products, productSearch])

  useEffect(() => {
    if (!isEditMode && productSearch) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.documentId.toLowerCase().includes(productSearch.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else if (!isEditMode) {
      setFilteredProducts(products)
    }
  }, [productSearch, products, isEditMode])

  const handleAddProduct = () => {
    if (!currentProduct || !currentQuantity || parseInt(currentQuantity) <= 0) {
      alert('Veuillez sélectionner un produit et entrer une quantité valide')
      return
    }

    const exists = productList.find(item => item.productId === currentProduct.documentId)
    if (exists) {
      alert('Ce produit est déjà dans la liste')
      return
    }

    if (formData.type === 'OUT' && parseInt(currentQuantity) > (currentProduct.stock_quantity || 0)) {
      alert(`Stock insuffisant! Stock actuel: ${currentProduct.stock_quantity || 0}`)
      return
    }

    const newProduct = {
      productId: currentProduct.documentId,
      productDetails: currentProduct,
      quantity: parseInt(currentQuantity)
    }

    setProductList([...productList, newProduct])
    setCurrentProduct(null)
    setCurrentQuantity('')
    setProductSearch('')
  }

  const handleRemoveProduct = (productId) => {
    setProductList(productList.filter(item => item.productId !== productId))
  }

  const clearProductSearch = () => {
    setProductSearch('')
    setCurrentProduct(null)
  }

  const handleProductSelect = (product) => {
    setCurrentProduct(product)
    setCurrentQuantity('')
    setProductSearch(product.name)
  }

  const runSuccessAnimation = () => {
    if (formData.type === 'OUT') {
      // Animation complète pour les sorties
      setShowSuccessAnimation(true)
      setTimeout(() => {
        setAnimationStep(1)
      }, 800)
      setTimeout(() => {
        setShowTrackAnimation(true)
        setAnimationStep(2)
      }, 1600)
      setTimeout(() => {
        setAnimationStep(3)
      }, 3000)
      setTimeout(() => {
        setShowSuccessAnimation(false)
        setShowTrackAnimation(false)
        setAnimationStep(0)
        onSuccess()
      }, 4000)
    } else {
      // Animation simple pour les entrées et ajustements
      setShowSuccessAnimation(true)
      setTimeout(() => {
        setAnimationStep(1)
      }, 800)
      setTimeout(() => {
        setShowSuccessAnimation(false)
        setAnimationStep(0)
        onSuccess()
      }, 2500)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      if (isEditMode) {
        const payload = {
          data: {
            type: formData.type,
            quantity: parseInt(formData.quantity) || 0,
            reference: formData.reference,
            date: new Date(formData.date).toISOString(),
            description: formData.description,
            product: formData.product
          }
        }

        if (movement.product && movement.type !== 'ADJUST') {
          await revertStockChange(movement, movement.product)
        }

        const response = await fetch(`${API_URL}/api/stock-movements/${movement.documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        const result = await response.json()
        const updatedMovement = result.data || result

        if (updatedMovement.type !== 'ADJUST' && currentProduct) {
          await applyStockChange(updatedMovement, currentProduct)
        }

        if (response.ok) {
          runSuccessAnimation()
        } else {
          throw new Error(result.error?.message || 'Erreur lors de la sauvegarde')
        }
      } else {
        if (productList.length === 0) {
          throw new Error('Veuillez ajouter au moins un produit')
        }

        const createdMovements = []
        
        for (const item of productList) {
          const payload = {
            data: {
              type: formData.type,
              quantity: item.quantity,
              reference: formData.reference,
              date: new Date(formData.date).toISOString(),
              description: formData.description,
              product: item.productId
            }
          }

          const response = await fetch(`${API_URL}/api/stock-movements`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error?.message || 'Erreur lors de la création du mouvement')
          }

          const result = await response.json()
          const newMovement = result.data || result

          if (newMovement.type !== 'ADJUST') {
            await applyStockChange(newMovement, item.productDetails)
          }

          createdMovements.push(newMovement)
        }

        runSuccessAnimation()
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde: ' + error.message)
      setLoading(false)
    }
  }

  const getTypeConfig = (type) => {
    switch (type) {
      case 'IN':
        return { label: 'Entrée Stock', icon: ArrowUp, color: 'text-green-600', bgColor: 'bg-green-50', description: 'Ajouter des produits au stock' }
      case 'OUT':
        return { label: 'Sortie Stock', icon: ArrowDown, color: 'text-red-600', bgColor: 'bg-red-50', description: 'Retirer des produits du stock' }
      case 'ADJUST':
        return { label: 'Ajustement', icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'Ajuster le stock sans affecter les quantités' }
      default:
        return { label: 'Inconnu', icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-50', description: '' }
    }
  }

  const typeConfig = getTypeConfig(formData.type)

  return (
    <>
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              {formData.type === 'OUT' ? (
                <>
                  {/* Animation pour les sorties */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative w-64 h-64 mx-auto mb-8"
                  >
                    {/* Icône du panier */}
                    <motion.div
                      animate={{
                        y: animationStep >= 1 ? -20 : 0,
                        scale: animationStep >= 1 ? 1.1 : 1
                      }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-10 left-1/2 transform -translate-x-1/2"
                    >
                      <ShoppingCart className="w-16 h-16 text-primary" />
                    </motion.div>

                    {/* Checkmark de confirmation */}
                    <AnimatePresence>
                      {animationStep >= 1 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-6 left-1/2 transform -translate-x-1/2"
                        >
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Animation de la piste de livraison */}
                    <AnimatePresence>
                      {showTrackAnimation && (
                        <>
                          {/* Piste */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                            <motion.path
                              d="M20,100 C20,50 100,20 180,100 C100,180 20,150 20,100"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="4"
                              strokeDasharray="5,5"
                            />
                            <motion.path
                              d="M20,100 C20,50 100,20 180,100 C100,180 20,150 20,100"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="4"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 2, ease: "easeInOut" }}
                            />
                          </svg>

                          {/* Camion */}
                          <motion.div
                            initial={{ x: 20, y: 100 }}
                            animate={{
                              x: [20, 100, 180, 100, 20],
                              y: [100, 20, 100, 180, 100]
                            }}
                            transition={{
                              duration: 3,
                              times: [0, 0.3, 0.6, 0.8, 1],
                              ease: "easeInOut"
                            }}
                            className="absolute"
                          >
                            <Truck className="w-8 h-8 text-blue-600" />
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>

                    {/* Confirmation finale */}
                    <AnimatePresence>
                      {animationStep >= 3 && (
                        <motion.div
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                        >
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl text-white font-bold mb-4"
                  >
                    {animationStep < 2 ? "Commande confirmée !" : 
                     animationStep < 3 ? "Expédition en cours..." : 
                     "Livraison complétée !"}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground text-white mb-8"
                  >
                    {animationStep < 2 ? "Votre sortie de stock a été enregistrée." :
                     animationStep < 3 ? "Préparation de l'expédition..." :
                     "Les produits ont été retirés du stock avec succès."}
                  </motion.p>
                </>
              ) : (
                <>
                  {/* Animation simple pour les entrées et ajustements */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                    >
                      <Check className="w-16 h-16 text-green-600" />
                    </motion.div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl text-ligth font-bold mb-4"
                  >
                    {formData.type === 'IN' ? "Entrée de stock enregistrée !" : "Ajustement effectué !"}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-muted-foreground mb-8"
                  >
                    {formData.type === 'IN' 
                      ? "Les produits ont été ajoutés au stock avec succès."
                      : "L'ajustement a été effectué avec succès."}
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center justify-center space-x-2 text-sm text-muted-foreground"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fermeture automatique...</span>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 pb-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    Informations du mouvement
                  </CardTitle>
                  <CardDescription>
                    Configurez le type et les détails du mouvement de stock
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="type" className="flex items-center gap-2">
                        Type de mouvement <Badge variant="destructive" className="text-xs">Requis</Badge>
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN">
                            <div className="flex items-center gap-2">
                              <ArrowUp className="h-4 w-4 text-green-600" />
                              <span>Entrée Stock</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="OUT">
                            <div className="flex items-center gap-2">
                              <ArrowDown className="h-4 w-4 text-red-600" />
                              <span>Sortie Stock</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ADJUST">
                            <div className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4 text-blue-600" />
                              <span>Ajustement</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className={`p-3 rounded-lg ${typeConfig.bgColor} ${typeConfig.color}`}>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <typeConfig.icon className="h-4 w-4" />
                          {typeConfig.label}
                        </div>
                        <p className="text-xs mt-1 opacity-90">{typeConfig.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="date">Date du mouvement</Label>
                      <Input
                        id="date"
                        type="datetime-local"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="reference">Référence</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Ex: Réf commande, numéro bon, etc."
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez la raison du mouvement de stock..."
                      rows={3}
                      className="bg-background resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {isEditMode ? (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5" />
                      Produit
                    </CardTitle>
                    <CardDescription>
                      Sélectionnez le produit et la quantité
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="product" className="flex items-center gap-2">
                        Produit <Badge variant="destructive" className="text-xs">Requis</Badge>
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un produit..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-10 pr-10 bg-background"
                        />
                        {productSearch && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-6 w-6 p-0"
                            onClick={clearProductSearch}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="quantity" className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Quantité <Badge variant="destructive" className="text-xs">Requis</Badge>
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="0"
                        required
                        className="bg-background   [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Plus className="h-5 w-5" />
                        Ajouter des produits
                      </CardTitle>
                      <CardDescription>
                        Sélectionnez un produit et sa quantité, puis ajoutez-le à la liste
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="product" className="flex items-center gap-2">
                          Produit <Badge variant="destructive" className="text-xs">Requis</Badge>
                        </Label>
                        
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Rechercher un produit..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              className="pl-10 pr-10 bg-background"
                            />
                            {productSearch && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-6 w-6 p-0"
                                onClick={clearProductSearch}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="max-h-60 overflow-auto border rounded-lg">
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map(product => (
                                <div
                                  key={product.documentId}
                                  className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                                    currentProduct?.documentId === product.documentId ? ' border-blue-300' : ''
                                  }`}
                                  onClick={() => handleProductSelect(product)}
                                >
                                  <div className="flex items-center gap-3">
                                    {product.photo ? (
                                      <img
                                        src={`${API_URL}${product.photo.url}`}
                                        alt={product.name}
                                        className="w-10 h-10 rounded-lg object-cover border"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{product.name}</div>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>ID: {product.id}</span>
                                        <Badge variant="outline" className="text-xs">
                                          Stock: {product.stock_quantity || 0}
                                        </Badge>
                                      </div>
                                    </div>
                                    {currentProduct?.documentId === product.documentId && (
                                      <Badge variant="default" className="bg-green-600">
                                        Sélectionné
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-muted-foreground">
                                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Aucun produit trouvé</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {currentProduct && (
                          <div className="p-3 bg-teal-200 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {currentProduct.photo ? (
                                  <img
                                    src={`${API_URL}${currentProduct.photo.url}`}
                                    alt={currentProduct.name}
                                    className="w-12 h-12 rounded-lg object-cover border"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border">
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-neutral-950">{currentProduct.name}</div>
                                  <div className="text-sm text-neutral-800">
                                    Stock actuel: <strong>{currentProduct.stock_quantity || 0}</strong> unités
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="quantity" className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Quantité <Badge variant="destructive" className="text-xs">Requis</Badge>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={currentQuantity}
                            onChange={(e) => setCurrentQuantity(e.target.value)}
                            placeholder="0"
                            className="bg-background flex-1  [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button
                            type="button"
                            onClick={handleAddProduct}
                            disabled={!currentProduct || !currentQuantity}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                          </Button>
                        </div>
                        {currentProduct && currentQuantity && formData.type === 'OUT' && parseInt(currentQuantity) > (currentProduct.stock_quantity || 0) && (
                          <p className="text-sm text-red-600">
                            ⚠️ Stock insuffisant. Stock actuel: {currentProduct.stock_quantity || 0}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {productList.length > 0 && (
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Package className="h-5 w-5" />
                          Produits ajoutés ({productList.length})
                        </CardTitle>
                        <CardDescription>
                          Liste des produits à inclure dans ce mouvement
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 overflow-auto">
                          {productList.map((item, index) => (
                            <div
                              key={item.productId}
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  {item.productDetails.photo ? (
                                    <img
                                      src={`${API_URL}${item.productDetails.photo.url}`}
                                      alt={item.productDetails.name}
                                      className="w-10 h-10 rounded-lg object-cover border"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="font-semibold">{item.productDetails.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      ID: {item.productDetails.id} • 
                                      Stock: {item.productDetails.stock_quantity || 0}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${
                                      formData.type === 'IN' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {formData.type === 'IN' ? '+' : '-'}{item.quantity}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Quantité
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveProduct(item.productId)}
                                  className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {productList.length > 0 && formData.type !== 'ADJUST' && (
                    <Card className="border-0 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <RefreshCw className="h-5 w-5" />
                          Résumé de l'impact
                        </CardTitle>
                        <CardDescription>
                          Aperçu des changements qui seront appliqués
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 ovflow-y-auto ">
                          {productList.map((item) => (
                            <div key={item.productId} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium">{item.productDetails.name}</div>
                                <Badge variant={formData.type === 'IN' ? 'default' : 'destructive'}>
                                  {formData.type === 'IN' ? 'Entrée' : 'Sortie'}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="space-y-1 p-2 border rounded">
                                  <div className="text-sm text-muted-foreground">Stock actuel</div>
                                  <div className="font-bold">{item.productDetails.stock_quantity || 0}</div>
                                </div>
                                <div className="space-y-1 p-2 border rounded">
                                  <div className="text-sm text-muted-foreground">Mouvement</div>
                                  <div className={`font-bold ${
                                    formData.type === 'IN' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {formData.type === 'IN' ? '+' : '-'}{item.quantity}
                                  </div>
                                </div>
                                <div className="space-y-1 p-2 border rounded bg-muted/50">
                                  <div className="text-sm text-muted-foreground">Nouveau stock</div>
                                  <div className={`font-bold ${
                                    formData.type === 'OUT' && item.quantity > (item.productDetails.stock_quantity || 0)
                                      ? 'text-red-600'
                                      : 'text-foreground'
                                  }`}>
                                    {formData.type === 'IN'
                                      ? (item.productDetails.stock_quantity || 0) + item.quantity
                                      : Math.max(0, (item.productDetails.stock_quantity || 0) - item.quantity)
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {formData.type === 'ADJUST' && (
                <Card className="border-0 shadow-sm border-blue-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-blue-600">
                      <RefreshCw className="h-5 w-5" />
                      Ajustement de stock
                    </CardTitle>
                    <CardDescription>
                      Ce type de mouvement n'affecte pas la quantité en stock. Utilisez-le pour corriger des écarts ou enregistrer des différences d'inventaire.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="overflow-auto flex-shrink-0 w-full flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-3 p-6 border-t mb-10">
          <Button className="text-black dark:text-white" type="button" variant="outline" onClick={onCancel} disabled={loading || showSuccessAnimation}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading || (!isEditMode && productList.length === 0) || showSuccessAnimation}
            className="min-w-24 "
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : movement ? (
              'Mettre à jour'
            ) : (
              'Créer le mouvement'
            )}
          </Button>
        </div>
      </form>
    </>
  )
}