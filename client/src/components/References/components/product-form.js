"use client"
import React, { useState } from 'react'
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
import { Upload, X, Image, Package, DollarSign, FolderOpen, Plus, Trash2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function ProductForm({ product, categories, onSuccess, onCancel }) {
  const [products, setProducts] = useState(product ? [{
    name: product?.name || '',
    unit: product?.unit || '',
    price: product?.price || '',
    price_achat: product?.price_achat || '',
    stock_quantity: product?.stock_quantity || 0,
    description: product?.description || '',
    category: product?.category?.id?.toString() || '',
    photo: null,
    previewUrl: product?.photo ? getImageUrl(product.photo) : ''
  }] : [{
    name: '',
    unit: '',
    price: '',
    price_achat: '',
    stock_quantity: 0,
    description: '',
    category: '',
    photo: null,
    previewUrl: ''
  }])
  
  const [loading, setLoading] = useState(false)

  function getImageUrl(photo) {
    if (!photo) return null
    if (photo.url) {
      return photo.url.startsWith('http') ? photo.url : `${API_URL}${photo.url}`
    }
    if (photo.data?.url) {
      return photo.data.url.startsWith('http') ? photo.data.url : `${API_URL}${photo.data.url}`
    }
    return null
  }

  const addProductRow = () => {
    setProducts([...products, {
      name: '',
      unit: '',
      price: '',
      price_achat: '',
      stock_quantity: 0,
      description: '',
      category: '',
      photo: null,
      previewUrl: ''
    }])
  }

  const removeProductRow = (index) => {
    if (products.length > 1) {
      const newProducts = products.filter((_, i) => i !== index)
      setProducts(newProducts)
    }
  }

  const updateProduct = (index, field, value) => {
    const newProducts = [...products]
    newProducts[index] = { ...newProducts[index], [field]: value }
    setProducts(newProducts)
  }

  const handlePhotoChange = (index, e) => {
    const file = e.target.files[0]
    if (file) {
      const newProducts = [...products]
      newProducts[index] = {
        ...newProducts[index],
        photo: file,
        previewUrl: URL.createObjectURL(file)
      }
      setProducts(newProducts)
    }
  }

  const removePhoto = (index) => {
    const newProducts = [...products]
    newProducts[index] = {
      ...newProducts[index],
      photo: null,
      previewUrl: ''
    }
    setProducts(newProducts)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const results = []

      for (const productData of products) {
        if (!productData.name.trim()) continue // Skip empty products

        let productId
        let response

        if (product && products.length === 1) {
          // Mode édition d'un seul produit
          const payload = {
            data: {
              name: productData.name,
              unit: productData.unit,
              price: parseFloat(productData.price) || 0,
              price_achat: parseFloat(productData.price_achat) || 0,
              stock_quantity: parseInt(productData.stock_quantity) || 0,
              description: productData.description,
              category: productData.category ? parseInt(productData.category) : null
            }
          }

          response = await fetch(`${API_URL}/api/products/${product.documentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          })
          
          const result = await response.json()
          productId = product.documentId
          
          if (response.ok) {
            results.push(result)
          } else {
            throw new Error(result.error?.message || 'Erreur lors de la mise à jour')
          }
        } else {
          // Mode création (multiple ou simple)
          const payload = {
            data: {
              name: productData.name,
              unit: productData.unit,
              price: parseFloat(productData.price) || 0,
              price_achat: parseFloat(productData.price_achat) || 0,
              stock_quantity: parseInt(productData.stock_quantity) || 0,
              description: productData.description,
              category: productData.category ? parseInt(productData.category) : null
            }
          }

          response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          })
          
          const result = await response.json()
          productId = result.data?.documentId
          
          if (response.ok) {
            results.push(result)
          } else {
            throw new Error(result.error?.message || 'Erreur lors de la création')
          }
        }

        // Upload de la photo et liaison au produit
        if (productData.photo && productId) {
          await uploadAndLinkPhoto(productId, productData.photo)
        }
      }

      if (results.length > 0) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde des produits: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadAndLinkPhoto = async (productId, photoFile) => {
    try {
      const token = localStorage.getItem('token')
      
      // Étape 1: Upload de la photo
      const uploadFormData = new FormData()
      uploadFormData.append('files', photoFile)

      const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      if (!uploadResponse.ok) {
        throw new Error(`Échec de l'upload de la photo: ${uploadResponse.status}`)
      }

      const uploadResult = await uploadResponse.json()
      console.log('Upload photo réussi:', uploadResult)

      // Étape 2: Lier la photo au produit
      if (uploadResult && uploadResult.length > 0) {
        const photoId = uploadResult[0].id
        
        const linkPayload = {
          data: {
            photo: photoId
          }
        }

        const linkResponse = await fetch(`${API_URL}/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(linkPayload)
        })

        if (!linkResponse.ok) {
          throw new Error('Erreur lors de la liaison de la photo au produit')
        }

        console.log('Photo liée au produit avec succès')
        return uploadResult
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload et liaison de la photo:', error)
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex  flex-col h-full w-full overflow-auto ">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 pb-4">
            {products.map((productData, index) => (
              <Card key={index} className="border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5" />
                      Produit {index + 1}
                    </CardTitle>
                    {products.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProductRow(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Informations complètes pour le produit {index + 1}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Section Général */}
                  <div className="space-y-4 ">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Package className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Informations générales</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor={`name-${index}`} className="flex items-center gap-2">
                          Nom du produit <Badge variant="destructive" className="text-xs">Requis</Badge>
                        </Label>
                        <Input
                          id={`name-${index}`}
                          value={productData.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          placeholder="Ex: Ciment 25kg"
                          required
                          className="bg-background "
                        />
                      </div>

                      <div className="space-y-3" >
                        <Label htmlFor={`category-${index}`} className="flex items-center gap-2  mr-8" style={{ marginRight: '45px' }}>
                          <FolderOpen className="h-4 w-4" />
                          Catégorie
                        </Label>
                        <Select 
                          value={productData.category} 
                          onValueChange={(value) => updateProduct(index, 'category', value)}
                        >
                          <SelectTrigger className="bg-background mr-4">
                            <SelectValue placeholder="Sélectionner une catégorie"  />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(categories) && categories.map(category => (
                              <SelectItem key={category.id} value={category.id?.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor={`unit-${index}`}>Unité de vente</Label>
                        <Input
                          id={`unit-${index}`}
                          value={productData.unit}
                          onChange={(e) => updateProduct(index, 'unit', e.target.value)}
                          placeholder="Ex: Sac, Pièce, Mètre, Kg..."
                          className="bg-background [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <p className="text-sm text-muted-foreground">
                          Spécifiez l'unité de mesure pour ce produit
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor={`description-${index}`}>Description du produit</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={productData.description}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        placeholder="Décrivez les caractéristiques et spécifications du produit..."
                        rows={3}
                        className="bg-background resize-none"
                      />
                    </div>
                  </div>

                  {/* Section Prix & Stock */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Prix et gestion de stock</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor={`price-${index}`} className="flex items-center gap-2">
                          Prix de vente <Badge variant="destructive" className="text-xs">Requis</Badge>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`price-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={productData.price}
                            onChange={(e) => updateProduct(index, 'price', e.target.value)}
                            placeholder="0.00"
                            required
                            className="pl-10 bg-background [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Prix en dirhams marocains (DH)
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor={`price_achat-${index}`}>Prix d'achat</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id={`price_achat-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={productData.price_achat}
                            onChange={(e) => updateProduct(index, 'price_achat', e.target.value)}
                            placeholder="0.00"
                            className="pl-10 bg-background [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Prix d'achat en DH
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor={`stock_quantity-${index}`}>Quantité en stock</Label>
                        <Input
                          id={`stock_quantity-${index}`}
                          type="number"
                          min="0"
                          value={productData.stock_quantity}
                          onChange={(e) => updateProduct(index, 'stock_quantity', parseInt(e.target.value))}
                          placeholder="0"
                          className="bg-background [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className="flex items-center gap-2 text-sm">
                          <Badge 
                            variant={
                              productData.stock_quantity === 0 ? 'destructive' :
                              productData.stock_quantity < 10 ? 'secondary' : 'default'
                            }
                          >
                            {productData.stock_quantity === 0 ? 'Rupture' :
                             productData.stock_quantity < 10 ? 'Stock faible' : 'En stock'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Média */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Image className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Image du produit</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {productData.previewUrl ? (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <img
                              src={productData.previewUrl}
                              alt={`Aperçu du produit ${index + 1}`}
                              className="w-48 h-48 rounded-lg object-cover border-2 border-border shadow-sm"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                              onClick={() => removePhoto(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Label htmlFor={`photo-change-${index}`} className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                              <span>Changer l'image</span>
                            </Button>
                            <Input
                              id={`photo-change-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoChange(index, e)}
                              className="hidden [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </Label>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                          <Image className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <Label htmlFor={`photo-${index}`} className="cursor-pointer">
                            <div className="space-y-2">
                              <div className="font-medium text-foreground">
                                Cliquez pour uploader une photo
                              </div>
                              <div className="text-sm text-muted-foreground">
                                PNG, JPG, JPEG jusqu'à 10MB
                              </div>
                              <Button type="button" variant="outline" className="mt-2">
                                <Upload className="h-4 w-4 mr-2" />
                                Choisir un fichier
                              </Button>
                            </div>
                            <Input
                              id={`photo-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoChange(index, e)}
                              className="hidden [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!product && (
              <div className="flex justify-center">
                <Button type="button" onClick={addProductRow} variant="outline" className="w-full max-w-md text-black dark:text-white">
                  <Plus className="h-4 w-4 mr-2 " />
                  Ajouter un autre produit
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Footer */}
      <div className="flex justify-between items-center gap-3 pt-6 border-t mt-6">
        <div className="text-sm text-muted-foreground">
          {products.length} produit(s) à créer
        </div>
        <div className="flex gap-3 text-black dark:text-white">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="min-w-24">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : product ? (
              'Mettre à jour'
            ) : (
              `Créer ${products.length > 1 ? 'les produits' : 'le produit'}`
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}