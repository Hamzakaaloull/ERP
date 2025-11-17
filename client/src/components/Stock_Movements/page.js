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
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Package
} from 'lucide-react'
import StockMovementForm from './components/stock-movement-form'
import StockMovementDetail from './components/stock-movement-detail'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function StockMovementsPage() {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState(null)
  const [selectedMovement, setSelectedMovement] = useState(null)
  const [movementToDelete, setMovementToDelete] = useState(null)

  useEffect(() => {
    fetchMovements()
    fetchProducts()
  }, [])

  const fetchMovements = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/stock-movements?populate=product&populate=product.photo&sort=date:desc`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data && data.data) {
        setMovements(data.data)
      } else if (Array.isArray(data)) {
        setMovements(data)
      } else {
        setMovements([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error)
      setMovements([])
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

  const updateProductStock = async (productDocumentId, newQuantity) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/products/${productDocumentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            stock_quantity: Math.max(0, newQuantity)
          }
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du stock')
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error)
      throw error
    }
  }

  const applyStockChange = async (movement, product) => {
    if (movement.type === 'ADJUST') return

    try {
      const currentStock = product.stock_quantity || 0
      let newStockQuantity = currentStock

      if (movement.type === 'IN') {
        newStockQuantity = currentStock + movement.quantity
      } else if (movement.type === 'OUT') {
        newStockQuantity = currentStock - movement.quantity
      }

      // Ensure stock doesn't go negative
      if (newStockQuantity < 0) {
        throw new Error(`Stock insuffisant. Stock actuel: ${currentStock}, tentative de retrait: ${movement.quantity}`)
      }

      await updateProductStock(product.documentId, newStockQuantity)
    } catch (error) {
      console.error('Erreur lors de l\'application du changement de stock:', error)
      throw error
    }
  }

  const revertStockChange = async (movement, product) => {
    if (movement.type === 'ADJUST') return

    try {
      const currentStock = product.stock_quantity || 0
      let newStockQuantity = currentStock

      if (movement.type === 'IN') {
        newStockQuantity = currentStock - movement.quantity
      } else if (movement.type === 'OUT') {
        newStockQuantity = currentStock + movement.quantity
      }

      // Ensure stock doesn't go negative when reverting
      if (newStockQuantity < 0) {
        console.warn(`Attention: Le stock deviendrait négatif lors de la réversion. Stock actuel: ${currentStock}`)
        newStockQuantity = 0
      }

      await updateProductStock(product.documentId, newStockQuantity)
    } catch (error) {
      console.error('Erreur lors de la réversion du stock:', error)
      throw error
    }
  }

  const deleteMovement = async () => {
    if (!movementToDelete) return

    try {
      const token = localStorage.getItem('token')
      
      // Revert stock changes first
      if (movementToDelete.product && movementToDelete.type !== 'ADJUST') {
        await revertStockChange(movementToDelete, movementToDelete.product)
      }
      
      // Delete the movement
      const response = await fetch(`${API_URL}/api/stock-movements/${movementToDelete.documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Refresh data
        await fetchMovements()
        await fetchProducts() // Refresh products to get updated stock
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression: ' + error.message)
    } finally {
      setIsDeleteOpen(false)
      setMovementToDelete(null)
    }
  }

  const handleDeleteClick = (movement) => {
    setMovementToDelete(movement)
    setIsDeleteOpen(true)
  }

  const handleViewDetails = (movement) => {
    setSelectedMovement(movement)
    setIsDetailOpen(true)
  }

  const filteredMovements = Array.isArray(movements) ? movements.filter(movement => {
    if (!movement) return false
    
    const matchesSearch = movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || movement.type === selectedType
    const matchesProduct = selectedProduct === 'all' || movement.product?.documentId === selectedProduct
    
    return matchesSearch && matchesType && matchesProduct
  }) : []

  const handleEdit = (movement) => {
    setEditingMovement(movement)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingMovement(null)
    setIsDialogOpen(true)
  }

  const handleFormSuccess = async () => {
    setIsDialogOpen(false)
    setEditingMovement(null)
    // Refresh both movements and products to get updated stock
    await fetchMovements()
    await fetchProducts()
  }

  const getTypeConfig = (type) => {
    switch (type) {
      case 'IN':
        return { label: 'Entrée', variant: 'default', icon: ArrowUp, color: 'text-green-600', bgColor: 'bg-green-50' }
      case 'OUT':
        return { label: 'Sortie', variant: 'secondary', icon: ArrowDown, color: 'text-red-600', bgColor: 'bg-red-50' }
      case 'ADJUST':
        return { label: 'Ajustement', variant: 'outline', icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-50' }
      default:
        return { label: 'Inconnu', variant: 'outline', icon: Package, color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Type', 'Produit', 'Quantité', 'Référence', 'Date', 'Stock Avant', 'Stock Après', 'Description']
    const csvData = filteredMovements.map(movement => {
      const typeConfig = getTypeConfig(movement.type)
      const stockBefore = movement.product ? 
        (movement.type === 'IN' ? 
          (movement.product.stock_quantity || 0) - movement.quantity :
         movement.type === 'OUT' ? 
          (movement.product.stock_quantity || 0) + movement.quantity :
          movement.product.stock_quantity || 0
        ) : 'N/A'
      
      const stockAfter = movement.product ? (movement.product.stock_quantity || 0) : 'N/A'

      return [
        movement.id,
        typeConfig.label,
        movement.product?.name || 'N/A',
        movement.quantity,
        movement.reference || '',
        movement.date ? new Date(movement.date).toLocaleDateString('fr-FR') : '',
        stockBefore,
        stockAfter,
        movement.description || ''
      ]
    })

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `mouvements_stock_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStats = () => {
    const totalMovements = movements.length
    const totalIn = movements.filter(m => m.type === 'IN').reduce((sum, m) => sum + (m.quantity || 0), 0)
    const totalOut = movements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + (m.quantity || 0), 0)
    
    return { totalMovements, totalIn, totalOut }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Chargement des mouvements de stock...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mouvements de Stock
          </h1>
          <p className="text-xl text-muted-foreground">
            Gestion des entrées, sorties et ajustements de stock
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mouvements</CardTitle>
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMovements}</div>
              <p className="text-xs text-muted-foreground">Tous les mouvements</p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entrées</CardTitle>
              <ArrowUp className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalIn}</div>
              <p className="text-xs text-muted-foreground">Quantité totale entrée</p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sorties</CardTitle>
              <ArrowDown className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalOut}</div>
              <p className="text-xs text-muted-foreground">Quantité totale sortie</p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <Package className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.totalIn - stats.totalOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalIn - stats.totalOut}
              </div>
              <p className="text-xs text-muted-foreground">Balance nette</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Header avec Actions */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par référence ou produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="IN">Entrée</SelectItem>
                      <SelectItem value="OUT">Sortie</SelectItem>
                      <SelectItem value="ADJUST">Ajustement</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-background">
                      <Package className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Produit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les produits</SelectItem>
                      {Array.isArray(products) && products.map(product => (
                        <SelectItem key={product.documentId} value={product.documentId}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 w-full lg:w-auto overflow-auto">
                  <Button variant="outline" className="flex-1 lg:flex-none" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAdd} className="flex-1 lg:flex-none">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau mouvement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="
                      w-[95vw] 
                      h-[90vh] 
                      max-w-none 
                      sm:max-w-2xl 
                      md:max-w-3xl 
                      lg:max-w-4xl 
                      flex 
                      flex-col
                    ">
                      <DialogHeader>
                        <DialogTitle className="text-2xl dark:text-white font-bold ">
                          {editingMovement ? 'Modifier le mouvement' : 'Nouveau mouvement de stock'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingMovement 
                            ? 'Modifiez les informations du mouvement de stock.' 
                            : 'Enregistrez un nouveau mouvement de stock (entrée, sortie ou ajustement).'
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <StockMovementForm
                        movement={editingMovement}
                        products={products}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setIsDialogOpen(false)}
                        applyStockChange={applyStockChange}
                        revertStockChange={revertStockChange}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Tableau des Mouvements */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl">Historique des mouvements</CardTitle>
                      <CardDescription>
                        {filteredMovements.length} mouvement(s) trouvé(s)
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Total: {movements.length} mouvements
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead className="text-right">Stock Actuel</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMovements.map((movement) => {
                        if (!movement) return null
                        
                        const typeConfig = getTypeConfig(movement.type)
                        const TypeIcon = typeConfig.icon
                        
                        return (
                        <TableRow key={movement.documentId} className="group hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <Badge variant={typeConfig.variant} className={`${typeConfig.bgColor} ${typeConfig.color}`}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {typeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {movement.product?.photo ? (
                                <img
                                  src={`${API_URL}${movement.product.photo.url}`}
                                  alt={movement.product.name}
                                  className="w-8 h-8 rounded-lg object-cover border"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-foreground">
                                  {movement.product?.name || 'Produit supprimé'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {movement.product ? `ID: ${movement.product.documentId}` : 'N/A'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            <span className={movement.type === 'IN' ? 'text-green-600' : movement.type === 'OUT' ? 'text-red-600' : 'text-blue-600'}>
                              {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : '±'}{movement.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {movement.product ? (
                              <Badge variant="outline">
                                {movement.product.stock_quantity || 0}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={movement.reference}>
                              {movement.reference || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {movement.date ? new Date(movement.date).toLocaleDateString('fr-FR') : 'N/A'}
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
                                <DropdownMenuItem onClick={() => handleViewDetails(movement)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(movement)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(movement)}
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

                  {filteredMovements.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Aucun mouvement trouvé
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                        {searchTerm || selectedType !== 'all' || selectedProduct !== 'all'
                          ? 'Aucun mouvement ne correspond à vos critères de recherche.'
                          : 'Commencez par enregistrer votre premier mouvement de stock.'
                        }
                      </p>
                      {(searchTerm || selectedType !== 'all' || selectedProduct !== 'all') && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm('')
                            setSelectedType('all')
                            setSelectedProduct('all')
                          }}
                        >
                          Réinitialiser les filtres
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Dialog de détails du mouvement */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="
            w-[95vw] 
            h-[90vh] 
            max-w-none 
            sm:max-w-2xl 
            md:max-w-3xl 
            lg:max-w-4xl 
            xl:max-w-6xl 
            flex 
            flex-col
          ">
            <StockMovementDetail 
              movement={selectedMovement} 
              onClose={() => setIsDetailOpen(false)}
              onEdit={() => {
                setSelectedMovement(null)
                setIsDetailOpen(false)
                handleEdit(selectedMovement)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* AlertDialog de confirmation de suppression */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Cela supprimera définitivement le mouvement de stock
                {movementToDelete && (
                  <>
                    {" "}pour le produit <strong>"{movementToDelete.product?.name}"</strong>{" "}
                    et {movementToDelete.type === 'IN' ? 'retirera' : movementToDelete.type === 'OUT' ? 'ajoutera' : 'ne modifiera pas'}{" "}
                    {movementToDelete.quantity} unité(s) du stock.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={deleteMovement}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}