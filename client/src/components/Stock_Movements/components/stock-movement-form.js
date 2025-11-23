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
  X
} from 'lucide-react'

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
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])

  useEffect(() => {
    if (formData.product) {
      const product = products.find(p => p.documentId === formData.product)
      setSelectedProduct(product)
    }
  }, [formData.product, products])

  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.documentId.toLowerCase().includes(productSearch.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [productSearch, products])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
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

      let response
      let result

      if (movement) {
        // Mise à jour - d'abord révertir l'ancien mouvement
        if (movement.product && movement.type !== 'ADJUST') {
          await revertStockChange(movement, movement.product)
        }
        
        // Puis mettre à jour le mouvement
        response = await fetch(`${API_URL}/api/stock-movements/${movement.documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        result = await response.json()
        const updatedMovement = result.data || result

        // Appliquer le nouveau mouvement si le type n'est pas ADJUST
        if (updatedMovement.type !== 'ADJUST' && selectedProduct) {
          await applyStockChange(updatedMovement, selectedProduct)
        }
      } else {
        // Création - d'abord créer le mouvement
        response = await fetch(`${API_URL}/api/stock-movements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        result = await response.json()
        const newMovement = result.data || result

        // Puis appliquer le mouvement au stock si le type n'est pas ADJUST
        if (newMovement.type !== 'ADJUST' && selectedProduct) {
          await applyStockChange(newMovement, selectedProduct)
        }
      }

      if (response.ok) {
        onSuccess()
      } else {
        throw new Error(result.error?.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde du mouvement: ' + error.message)
      
      // En cas d'erreur, tenter de révertir les changements
      if (movement && movement.product && movement.type !== 'ADJUST') {
        try {
          await applyStockChange(movement, movement.product)
        } catch (revertError) {
          console.error('Erreur lors de la réversion après échec:', revertError)
        }
      }
    } finally {
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

  const clearProductSearch = () => {
    setProductSearch('')
  }

  const handleProductSelect = (productId) => {
    setFormData({ ...formData, product: productId })
    setProductSearch('')
  }

  const typeConfig = getTypeConfig(formData.type)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations de base */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5" />
                    Informations du mouvement
                  </CardTitle>
                  <CardDescription>
                    Configurez le type et les détails du mouvement de stock
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label htmlFor="product" className="flex items-center gap-2">
                      Produit <Badge variant="destructive" className="text-xs">Requis</Badge>
                    </Label>
                    
                    {/* Recherche de produit */}
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
                      
                      <div className="max-h-60 overflow-y-auto border rounded-lg">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map(product => (
                            <div
                              key={product.documentId}
                              className={`p-3 border-b cursor-pointer  hover:bg-muted/50 transition-colors ${
                                formData.product === product.documentId ? 'bg-blue-50 border-blue-200' : ''
                              }`}
                              onClick={() => handleProductSelect(product.documentId)}
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
                                  <div className="font-medium truncate bg-muted/80 p-1 w-min rounded">{product.name}</div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>ID: {product.documentId}</span>
                                    <Badge variant="outline" className="text-xs">
                                      Stock: {product.stock_quantity || 0}
                                    </Badge>
                                  </div>
                                </div>
                                {formData.product === product.documentId && (
                                  <Badge variant="default" className="bg-green-600 mb-10">
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

                    {selectedProduct && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          {selectedProduct.photo ? (
                            <img
                              src={`${API_URL}${selectedProduct.photo.url}`}
                              alt={selectedProduct.name}
                              className="w-12 h-12 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-green-800">{selectedProduct.name}</div>
                            <div className="text-sm text-green-600">
                              Stock actuel: <strong>{selectedProduct.stock_quantity || 0}</strong> unités
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
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                      required
                      className="bg-background"
                    />
                    {selectedProduct && formData.type === 'OUT' && formData.quantity > (selectedProduct.stock_quantity || 0) && (
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        Attention: Stock insuffisant. Stock actuel: {selectedProduct.stock_quantity || 0}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations supplémentaires */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    Informations supplémentaires
                  </CardTitle>
                  <CardDescription>
                    Référence et description du mouvement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="reference">Référence</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Ex: Réf commande, numéro bon, etc."
                      className="bg-background"
                    />
                    <p className="text-sm text-muted-foreground">
                      Référence optionnelle pour identifier le mouvement
                    </p>
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

                  <div className="space-y-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez la raison du mouvement de stock..."
                      rows={4}
                      className="bg-background resize-none min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Aperçu de l'impact */}
            {selectedProduct && formData.quantity && formData.type !== 'ADJUST' && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <RefreshCw className="h-5 w-5" />
                    Impact sur le stock
                  </CardTitle>
                  <CardDescription>
                    Aperçu des changements qui seront appliqués au stock
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="space-y-2 p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Stock actuel</div>
                      <div className="text-2xl font-bold">{selectedProduct.stock_quantity || 0}</div>
                    </div>
                    
                    <div className="space-y-2 p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Mouvement</div>
                      <div className={`text-2xl font-bold ${
                        formData.type === 'IN' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formData.type === 'IN' ? '+' : '-'}{formData.quantity}
                      </div>
                    </div>
                    
                    <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground">Nouveau stock</div>
                      <div className={`text-2xl font-bold ${
                        formData.type === 'OUT' && formData.quantity > (selectedProduct.stock_quantity || 0) ? 'text-red-600' : 'text-foreground'
                      }`}>
                        {formData.type === 'IN' ? 
                          (selectedProduct.stock_quantity || 0) + parseInt(formData.quantity) :
                          Math.max(0, (selectedProduct.stock_quantity || 0) - parseInt(formData.quantity))
                        }
                      </div>
                    </div>
                  </div>
                  
                  {formData.type === 'OUT' && formData.quantity > (selectedProduct.stock_quantity || 0) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                        <span className="text-lg">❌</span>
                        Stock insuffisant! Le stock ne peut pas devenir négatif.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
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

      {/* Fixed Footer */}
      <div className="flex-shrink-0 flex justify-end gap-3 p-6 border-t mb-10">
        <Button type="button" className="dark:text-white" variant="outline" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={loading || (formData.type === 'OUT' && formData.quantity > (selectedProduct?.stock_quantity || 0))}
          className="min-w-24"
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
  )
}