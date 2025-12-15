"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, CheckSquare, Square, Package, FolderOpen } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function CategoryForm({ category, products, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
  })
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectAll, setSelectAll] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category?.products) {
      const initialSelected = new Set(category.products.map(p => p.id.toString()))
      setSelectedProducts(initialSelected)
    }
  }, [category])

  // تأكد أن products مصفوفة قبل استخدام filter
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (!product) return false
    return product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  }) : []

  const toggleProduct = (productId) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set())
    } else {
      const allIds = new Set(filteredProducts.map(p => p.id.toString()))
      setSelectedProducts(allIds)
    }
    setSelectAll(!selectAll)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const productsData = Array.from(selectedProducts).map(id => parseInt(id))

      const payload = {
        data: {
          ...formData,
          products: productsData
        }
      }

      let response
      if (category) {
        response = await fetch(`${API_URL}/api/categories/${category.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch(`${API_URL}/api/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      }

      const result = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        throw new Error(result.error?.message || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde de la catégorie: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (photo) => {
    if (!photo) return null
    if (photo.url) {
      return photo.url.startsWith('http') ? photo.url : `${API_URL}${photo.url}`
    }
    if (photo.data?.url) {
      return photo.data.url.startsWith('http') ? photo.data.url : `${API_URL}${photo.data.url}`
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-scroll">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-1  gap-6">
            {/* Informations de base */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Informations de la catégorie
                </CardTitle>
                <CardDescription>
                  Définissez le nom et la description de la catégorie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Nom de la catégorie <Badge variant="destructive" className="text-xs">Requis</Badge>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Ciments et Mortiers"
                    required
                    className="bg-background [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez cette catégorie et son usage..."
                    rows={4}
                    className="bg-background resize-none min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Produits sélectionnés */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produits associés
                </CardTitle>
                <CardDescription>
                  {selectedProducts.size} produit(s) sélectionné(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Produits dans cette catégorie</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="h-8"
                    >
                      {selectAll ? <CheckSquare className="h-4 w-4 mr-2" /> : <Square className="h-4 w-4 mr-2" />}
                      {selectAll ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </Button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background mb-3 [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <div className="border rounded-lg max-h-80 overflow-y-auto bg-background">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedProducts.has(product.id.toString())}
                          onCheckedChange={() => toggleProduct(product.id.toString())}
                        />
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {product.photo ? (
                            <img
                              src={getImageUrl(product.photo)}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover border"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 rounded bg-muted flex items-center justify-center border ${product.photo ? 'hidden' : 'flex'}`}>
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{product.price} DH</span>
                              <span>•</span>
                              <span>Stock: {product.stock_quantity || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredProducts.length === 0 && (
                      <div className="p-6 text-center text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2" />
                        Aucun produit trouvé
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Fixed Footer */}
      <div className="flex justify-end gap-3 pt-6 border-t mt-6 dark:text-white">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading} className="min-w-24">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sauvegarde...
            </>
          ) : category ? (
            'Mettre à jour'
          ) : (
            'Créer la catégorie'
          )}
        </Button>
      </div>
    </form>
  )
}