"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Search, FolderOpen, Package } from 'lucide-react'
import CategoryForm from './category-form'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function CategoriesTab() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/categories?populate=products&populate=products.photo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      // في Strapi v5، البيانات تكون في data.data
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
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/products?populate=photo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      // في Strapi v5، البيانات تكون في data.data
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
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.')) return

    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      fetchCategories()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de la catégorie')
    }
  }

  // تأكد أن categories مصفوفة قبل استخدام filter
  const filteredCategories = Array.isArray(categories) ? categories.filter(category => {
    if (!category) return false
    
    return category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  }) : []

  const handleEdit = (category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    fetchCategories()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Chargement des catégories...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="w-full lg:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Modifiez les informations de la catégorie.' 
                  : 'Créez une nouvelle catégorie pour organiser vos produits.'
                }
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              products={products}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des Catégories */}
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Catégories d'produits
              </CardTitle>
              <CardDescription>
                {filteredCategories.length} catégorie(s) organisant vos produits
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              <Package className="h-3 w-3 mr-1" />
              {Array.isArray(categories) ? categories.reduce((total, cat) => total + (cat.products?.length || 0), 0) : 0} produits au total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="border shadow-sm">
                <AccordionItem value={category.id.toString()} className="border-0">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FolderOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{category.name}</div>
                            {category.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {category.products?.length || 0} produit(s)
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    {category.description && (
                      <p className="text-muted-foreground mb-4 pb-4 border-b">{category.description}</p>
                    )}
                    
                    {category.products && category.products.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.products.map((product) => (
                          <Card key={product.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
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
                                  <div className="font-medium text-sm truncate">{product.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {product.price} DH
                                    </Badge>
                                    <Badge 
                                      variant={
                                        product.stock_quantity === 0 ? 'destructive' :
                                        product.stock_quantity < 10 ? 'secondary' : 'default'
                                      }
                                      className="text-xs"
                                    >
                                      Stock: {product.stock_quantity || 0}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border rounded-lg bg-muted/20">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <div className="text-muted-foreground">Aucun produit dans cette catégorie</div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3"
                          onClick={() => handleEdit(category)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter des produits
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
          </Accordion>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'Aucune catégorie trouvée' : 'Aucune catégorie créée'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {searchTerm 
                  ? 'Aucune catégorie ne correspond à votre recherche.'
                  : 'Commencez par créer votre première catégorie pour organiser vos produits.'
                }
              </p>
              {searchTerm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                >
                  Réinitialiser la recherche
                </Button>
              ) : (
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une catégorie
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}