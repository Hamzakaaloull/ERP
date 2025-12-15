"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Download,
  ShoppingCart,
  Package
} from 'lucide-react'
import ProductForm from './product-form'
import ProductDetail from './product-detail'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function ProductsTab({ onUpdate }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/products?populate=category&populate=photo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      console.log( "this is the products" , data )
    console.log( "Fetched products:", data)
      if (data && data.data) {
        setProducts(data.data)
      } else if (Array.isArray(data)) {
        setProducts(data)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data && data.data) {
        setCategories(data.data)
      } else if (Array.isArray(data)) {
        setCategories(data)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      setCategories([])
    }
  }

  const deleteProduct = async () => {
    if (!productToDelete) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/products/${productToDelete.documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchProducts()
        if (onUpdate) onUpdate()
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setIsDeleteOpen(false)
      setProductToDelete(null)
    }
  }

  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setIsDeleteOpen(true)
  }

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (!product) return false
    
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id?.toString().includes(searchTerm)
    const matchesCategory = selectedCategory === 'all' || 
                           product.category?.id?.toString() === selectedCategory
    return matchesSearch && matchesCategory
  }) : []

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    fetchProducts()
    if (onUpdate) onUpdate()
  }

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Rupture', variant: 'destructive' }
    if (quantity < 10) return { label: 'Faible', variant: 'secondary' }
    return { label: 'En stock', variant: 'default' }
  }

  const getImageUrl = (photo) => {
    if (!photo) return null
    if (photo.url) {
      return `${API_URL}${photo.url}`
    }
    if (photo.data?.url) {
      return `${API_URL}${photo.data.url}`
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Chargement des produits...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit par nom ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {Array.isArray(categories) && categories.map(category => (
                <SelectItem key={category.id} value={category.id?.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-3xs lg:w-auto">
          <Dialog  open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} className="flex-1 lg:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl w-full h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl dark:text-white">
                  {editingProduct ? 'Modifier le produit' : 'Ajouter de nouveaux produits'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct 
                    ? 'Modifiez les informations du produit ci-dessous.' 
                    : 'Remplissez les informations pour ajouter un ou plusieurs nouveaux produits à votre inventaire.'
                  }
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                categories={categories}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tableau des Produits */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Inventaire des produits</CardTitle>
              <CardDescription>
                {filteredProducts.length} produit(s) trouvé(s) dans votre inventaire
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Total: {products.length} produits
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Prix de vente</TableHead>
                <TableHead className="text-right">Prix d'achat</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right">Statut</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                if (!product) return null
                
                const stockStatus = getStockStatus(product.stock_quantity)
                const imageUrl = getImageUrl(product.photo)
                
                return (
                <TableRow key={product.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center border ${imageUrl ? 'hidden' : 'flex'}`}>
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {product.name}
                        </div>
                        {product.unit && (
                          <div className="text-sm text-muted-foreground truncate">
                            Unité: {product.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {product.category?.name || 'Non catégorisé'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    {product.price ? `${Number(product.price).toFixed(2)} DH` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    {product.price_achat ? `${Number(product.price_achat).toFixed(2)} DH` : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{product.stock_quantity || 0}</span>
                      <span className="text-xs text-muted-foreground">unités</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={stockStatus.variant} className="capitalize">
                      {stockStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Ouvrir le menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(product)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Aucun produit ne correspond à vos critères de recherche.'
                  : 'Commencez par ajouter votre premier produit à l\'inventaire.'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de détails du produit */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[90vw] h-[90vh] overflow-y-auto box-border dark:text-white"> 
          <DialogTitle className="text-2xl dark:text-white">Détails du produit</DialogTitle>
          <ProductDetail 
            product={selectedProduct} 
            onClose={() => setIsDetailOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* AlertDialog de confirmation de suppression */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le produit 
              <strong> "{productToDelete?.name}"</strong> de votre inventaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}