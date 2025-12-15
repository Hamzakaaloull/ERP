"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
  CreditCard,
  RefreshCw,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Filter
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import TextType from './components/TextType';
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

// Couleurs pour les diagrammes
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1']

export default function DashboardPage() {
  const [sales, setSales] = useState([])
  const [allSales, setAllSales] = useState([]) // Stocker toutes les ventes pour les filtres
  const [products, setProducts] = useState([]) // Pour les produits à faible stock
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('month')
  const [profitFilter, setProfitFilter] = useState('month')
  
  // États pour le filtre personnalisé
  const [showCustomFilter, setShowCustomFilter] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalClients: 0,
    totalProducts: 0,
    revenueChange: 0,
    salesChange: 0,
    totalProfit: 0,
    profitChange: 0
  })

  useEffect(() => {
    fetchDashboardData()
    fetchProducts()
  }, [timeFilter])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Récupérer les ventes avec tous les détails
      const salesResponse = await fetch(
        `${API_URL}/api/sales?populate=client&populate=user&populate=sale_items.product&sort=sale_date:desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (!salesResponse.ok) throw new Error('Erreur lors du chargement des ventes')
      
      const salesData = await salesResponse.json()
      const allSalesData = salesData.data || []
      setAllSales(allSalesData)
      
      // Filtrer les ventes selon la période
      let filteredSales
      if (showCustomFilter && customStartDate && customEndDate) {
        filteredSales = filterSalesByCustomDate(allSalesData)
      } else {
        filteredSales = filterSalesByTime(allSalesData, timeFilter)
      }
      
      setSales(filteredSales)
      
      // Calculer les statistiques
      calculateStats(filteredSales, allSalesData)
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setSales([])
      setAllSales([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const productsResponse = await fetch(
        `${API_URL}/api/products?populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    }
  }

  const filterSalesByTime = (sales, filter) => {
    const now = new Date()
    let startDate

    switch (filter) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return sales
    }

    return sales.filter(sale => new Date(sale.sale_date) >= startDate)
  }

  const filterSalesByCustomDate = (sales) => {
    if (!customStartDate || !customEndDate) return sales
    
    const startDate = new Date(customStartDate)
    const endDate = new Date(customEndDate)
    endDate.setHours(23, 59, 59, 999) // Inclure toute la journée
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.sale_date)
      return saleDate >= startDate && saleDate <= endDate
    })
  }

  const calculateStats = (filteredSales, allSales) => {
    // Statistiques pour la période actuelle
    const currentPeriodStats = {
      totalSales: filteredSales.length,
      totalRevenue: filteredSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0),
      uniqueClients: new Set(filteredSales.map(sale => sale.client?.id).filter(Boolean)).size,
      uniqueProducts: new Set(
        filteredSales.flatMap(sale => 
          sale.sale_items?.map(item => item.product?.id).filter(Boolean) || []
        )
      ).size,
      totalProfit: calculateTotalProfit(filteredSales)
    }

    // Calculer la période précédente pour les comparaisons (uniquement si ce n'est pas un filtre personnalisé)
    let previousRevenue = 0
    let previousSalesCount = 0
    let previousProfit = 0
    
    if (!showCustomFilter) {
      const now = new Date()
      let previousStartDate, previousEndDate

      switch (timeFilter) {
        case 'week':
          previousStartDate = new Date(now)
          previousStartDate.setDate(now.getDate() - 14)
          previousEndDate = new Date(now)
          previousEndDate.setDate(now.getDate() - 7)
          break
        case 'month':
          previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
          break
        case 'year':
          previousStartDate = new Date(now.getFullYear() - 1, 0, 1)
          previousEndDate = new Date(now.getFullYear() - 1, 11, 31)
          break
        default:
          previousStartDate = new Date(0)
          previousEndDate = new Date(0)
      }

      const previousSales = allSales.filter(sale => {
        const saleDate = new Date(sale.sale_date)
        return saleDate >= previousStartDate && saleDate <= previousEndDate
      })

      previousRevenue = previousSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
      previousSalesCount = previousSales.length
      previousProfit = calculateTotalProfit(previousSales)
    }

    // Calculer les changements
    const revenueChange = previousRevenue > 0 
      ? ((currentPeriodStats.totalRevenue - previousRevenue) / previousRevenue) * 100 
      : (currentPeriodStats.totalRevenue > 0 ? 100 : 0)
    
    const salesChange = previousSalesCount > 0 
      ? ((currentPeriodStats.totalSales - previousSalesCount) / previousSalesCount) * 100 
      : (currentPeriodStats.totalSales > 0 ? 100 : 0)
    
    const profitChange = previousProfit > 0 
      ? ((currentPeriodStats.totalProfit - previousProfit) / previousProfit) * 100 
      : (currentPeriodStats.totalProfit > 0 ? 100 : 0)

    setStats({
      totalSales: currentPeriodStats.totalSales,
      totalRevenue: currentPeriodStats.totalRevenue,
      totalClients: currentPeriodStats.uniqueClients,
      totalProducts: currentPeriodStats.uniqueProducts,
      totalProfit: currentPeriodStats.totalProfit,
      revenueChange: showCustomFilter ? 0 : revenueChange,
      salesChange: showCustomFilter ? 0 : salesChange,
      profitChange: showCustomFilter ? 0 : profitChange
    })
  }

  // Calculer le profit total
  const calculateTotalProfit = (salesData) => {
    return salesData.reduce((total, sale) => {
      let saleProfit = 0
      
      if (sale.sale_items && sale.sale_items.length > 0) {
        sale.sale_items.forEach(item => {
          const costPrice = item.product?.price_achat || (item.unit_price * 0.7)
          saleProfit += (item.unit_price - costPrice) * item.quantity
        })
      } else {
        saleProfit = sale.total_amount * 0.3
      }
      
      return total + saleProfit
    }, 0)
  }

  // Appliquer le filtre personnalisé
  const applyCustomFilter = () => {
    if (!customStartDate || !customEndDate) {
      alert('Veuillez sélectionner les deux dates')
      return
    }
    
    if (new Date(customStartDate) > new Date(customEndDate)) {
      alert('La date de début doit être antérieure à la date de fin')
      return
    }
    
    setShowCustomFilter(true)
    fetchDashboardData()
  }

  // Réinitialiser le filtre personnalisé
  const resetCustomFilter = () => {
    setShowCustomFilter(false)
    setCustomStartDate('')
    setCustomEndDate('')
    fetchDashboardData()
  }

  // Préparer les données pour le tableau des bénéfices
  const getProfitData = () => {
    const profitData = {}
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.sale_date)
      let periodKey
      
      switch (profitFilter) {
        case 'day':
          periodKey = saleDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
          break
        case 'month':
          periodKey = saleDate.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          })
          break
        case 'year':
          periodKey = saleDate.getFullYear().toString()
          break
        default:
          periodKey = saleDate.toLocaleDateString('fr-FR')
      }
      
      if (!profitData[periodKey]) {
        profitData[periodKey] = {
          period: periodKey,
          revenue: 0,
          profit: 0,
          salesCount: 0
        }
      }
      
      let saleProfit = 0
      if (sale.sale_items && sale.sale_items.length > 0) {
        sale.sale_items.forEach(item => {
          const costPrice = item.product?.price_achat || (item.unit_price * 0.7)
          saleProfit += (item.unit_price - costPrice) * item.quantity
        })
      } else {
        saleProfit = sale.total_amount * 0.3
      }
      
      profitData[periodKey].revenue += sale.total_amount || 0
      profitData[periodKey].profit += saleProfit
      profitData[periodKey].salesCount += 1
    })
    
    return Object.values(profitData)
      .sort((a, b) => {
        if (profitFilter === 'year') {
          return b.period - a.period
        } else {
          return new Date(b.period) - new Date(a.period)
        }
      })
  }

  // Préparer les données pour le diagramme des produits les plus vendus
  const getTopProductsData = () => {
    const productSales = {}
    
    sales.forEach(sale => {
      sale.sale_items?.forEach(item => {
        if (item.product) {
          const productId = item.product.id
          const productName = item.product.name
          const quantity = item.quantity || 0
          
          if (!productSales[productId]) {
            productSales[productId] = {
              name: productName,
              quantity: 0,
              revenue: 0
            }
          }
          
          productSales[productId].quantity += quantity
          productSales[productId].revenue += item.total_price || 0
        }
      })
    })

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8)
  }

  // Préparer les données pour le diagramme des produits à faible stock
 // Préparer les données pour le diagramme des produits à faible stock
const getLowStockProductsData = () => {
  const lowStockThreshold = 10 // Seuil pour faible stock
  const lowStockProducts = products
    .filter(product => product.stock_quantity !== null && product.stock_quantity <= lowStockThreshold)
    .map(product => ({
      name: product.name || 'Produit sans nom',
      stock: product.stock_quantity || 0,
      category: product.category?.name || 'Non catégorisé'
    }))
    .sort((a, b) => a.stock - b.stock) // Trier par stock le plus bas
    .slice(0, 8) // Limiter à 8 produits

  return lowStockProducts
}
  // Préparer les données pour le diagramme des clients les plus actifs
  const getTopClientsData = () => {
    const clientSales = {}
    
    sales.forEach(sale => {
      if (sale.client) {
        const clientId = sale.client.id
        const clientName = sale.client.name
        
        if (!clientSales[clientId]) {
          clientSales[clientId] = {
            name: clientName,
            purchaseCount: 0,
            totalSpent: 0
          }
        }
        
        clientSales[clientId].purchaseCount += 1
        clientSales[clientId].totalSpent += sale.total_amount || 0
      }
    })

    return Object.values(clientSales)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 8)
  }

  // Obtenir les activités récentes
  const getRecentActivities = () => {
    return sales.slice(0, 5).map(sale => ({
      id: sale.id,
      client: sale.client?.name || 'Client inconnu',
      amount: sale.total_amount || 0,
      date: sale.sale_date,
      items: sale.sale_items?.length || 0,
      status: (sale.remaining_amount || 0) > 0 ? 'pending' : 'paid'
    }))
  }

  const topProducts = getTopProductsData()
  const lowStockProducts = getLowStockProductsData()
  const topClients = getTopClientsData()
  const recentActivities = getRecentActivities()
  const profitData = getProfitData()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Chargement du tableau de bord...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
            
            <TextType 
              text={[" Vue d'ensemble de votre activité commerciale", " Suivi des performances en temps réel", " Analyse détaillée des ventes et bénéfices"]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              className="text-lg md:text-xl text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-3 dark:text-white">
            <Select value={timeFilter} onValueChange={(value) => {
              setTimeFilter(value)
              resetCustomFilter()
            }}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCustomFilter(!showCustomFilter)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtre Personnalisé
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Filtre personnalisé */}
        {showCustomFilter && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtre Personnalisé par Date
              </CardTitle>
              <CardDescription>
                Sélectionnez une période spécifique pour analyser vos données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Date de début</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Date de fin</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={applyCustomFilter} className="gap-2">
                    Appliquer
                  </Button>
                  <Button variant="outline" onClick={resetCustomFilter}>
                    Annuler
                  </Button>
                </div>
              </div>
              {customStartDate && customEndDate && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    Période sélectionnée : du {formatDate(customStartDate)} au {formatDate(customEndDate)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              {!showCustomFilter && (
                <div className={`flex items-center text-xs ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {Math.abs(stats.revenueChange).toFixed(1)}%
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {showCustomFilter ? 'Pour la période sélectionnée' : 'Par rapport à la période précédente'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventes Total</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              {!showCustomFilter && (
                <div className={`flex items-center text-xs ${stats.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.salesChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {Math.abs(stats.salesChange).toFixed(1)}%
                </div>
              )}
              <p className="text-xs text-muted-foreground">Transactions effectuées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bénéfice Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalProfit)}</div>
              {!showCustomFilter && (
                <div className={`flex items-center text-xs ${stats.profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.profitChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                  {Math.abs(stats.profitChange).toFixed(1)}%
                </div>
              )}
              <p className="text-xs text-muted-foreground">Marge bénéficiaire</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">Clients uniques</p>
            </CardContent>
          </Card>
        </div>

        {/* Section des diagrammes circulaires en flex */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Produits les plus vendus */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" />
                Produits les Plus Vendus
              </CardTitle>
              <CardDescription className="text-xs">
                Top 8 des produits par quantité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topProducts}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="quantity"
                      >
                        {topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'quantity' ? `${value} unités` : formatCurrency(value),
                          name === 'quantity' ? 'Quantité' : 'Chiffre d\'affaires'
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée de vente disponible
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clients les plus actifs */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Clients les Plus Actifs
              </CardTitle>
              <CardDescription className="text-xs">
                Top 8 des clients par chiffre d'affaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topClients.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topClients}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="totalSpent"
                      >
                        {topClients.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Chiffre d\'affaires']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée client disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>

            {/* Produits à faible stock - SIMPLIFIED */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Produits à Faible Stock
            </CardTitle>
            <CardDescription>
              Produits nécessitant une réapprovisionnement urgent (stock ≤ 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div>
                {/* Diagramme des produits à faible stock */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={lowStockProducts}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value) => [value, 'Stock actuel']}
                        labelFormatter={(value) => `Produit: ${value}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="stock" 
                        name="Stock actuel" 
                        fill="#FF8042" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Tableau des produits à faible stock */}
                <div className="mt-6 rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Stock Actuel</TableHead>
                        <TableHead className="text-right">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.map((product, index) => (
                        <TableRow key={index} className={product.stock <= 5 ? 'text-white' : ''}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant={product.stock <= 5 ? "destructive" : "secondary"}
                              className="font-semibold"
                            >
                              {product.stock} unités
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {product.stock <= 3 ? (
                              <span className="text-red-600 font-semibold">CRITIQUE</span>
                            ) : product.stock <= 5 ? (
                              <span className="text-orange-600 font-semibold">FAIBLE</span>
                            ) : (
                              <span className="text-yellow-600 font-semibold">À SUIVRE</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="font-medium">Tous les produits ont un stock suffisant</p>
                  <p className="text-sm">Aucun produit nécessite de réapprovisionnement urgent</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tableau des Bénéfices - REMOVE THE LOW STOCK TABLE FROM HERE */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tableau des Bénéfices
                </CardTitle>
                <CardDescription>
                  Analyse détaillée des revenus et bénéfices
                </CardDescription>
              </div>
              <Select value={profitFilter} onValueChange={setProfitFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Par Jour</SelectItem>
                  <SelectItem value="month">Par Mois</SelectItem>
                  <SelectItem value="year">Par Année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {profitData.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Période</TableHead>
                        <TableHead className="text-right">Nombre de Ventes</TableHead>
                        <TableHead className="text-right">Chiffre d'Affaires</TableHead>
                        <TableHead className="text-right">Bénéfice</TableHead>
                        <TableHead className="text-right">Marge</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profitData.map((item, index) => {
                        const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">{item.salesCount}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(item.revenue)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCurrency(item.profit)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant={margin >= 30 ? "default" : "secondary"}
                                className={margin >= 30 ? "bg-green-100 text-green-800" : ""}
                              >
                                {margin.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Résumé total */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(profitData.reduce((sum, item) => sum + item.revenue, 0))}
                      </div>
                      <p className="text-muted-foreground">CA Total</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(profitData.reduce((sum, item) => sum + item.profit, 0))}
                      </div>
                      <p className="text-muted-foreground">Bénéfice Total</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {profitData.length > 0 && profitData.reduce((sum, item) => sum + item.revenue, 0) > 0
                          ? ((profitData.reduce((sum, item) => sum + item.profit, 0) / 
                              profitData.reduce((sum, item) => sum + item.revenue, 0) * 100) || 0).toFixed(1) + '%'
                          : '0%'
                        }
                      </div>
                      <p className="text-muted-foreground">Marge Moyenne</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune donnée de bénéfice disponible pour cette période
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tableau des Bénéfices */}
        <Card>
          <CardHeader>
            <div className="flex mt-8 flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tableau des Bénéfices
                </CardTitle>
                <CardDescription>
                  Analyse détaillée des revenus et bénéfices
                </CardDescription>
              </div>
              <Select value={profitFilter} onValueChange={setProfitFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Par Jour</SelectItem>
                  <SelectItem value="month">Par Mois</SelectItem>
                  <SelectItem value="year">Par Année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {profitData.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Période</TableHead>
                        <TableHead className="text-right">Nombre de Ventes</TableHead>
                        <TableHead className="text-right">Chiffre d'Affaires</TableHead>
                        <TableHead className="text-right">Bénéfice</TableHead>
                        <TableHead className="text-right">Marge</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profitData.map((item, index) => {
                        const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.period}</TableCell>
                            <TableCell className="text-right">{item.salesCount}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(item.revenue)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-600">
                              {formatCurrency(item.profit)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant={margin >= 30 ? "default" : "secondary"}
                                className={margin >= 30 ? "bg-green-100 text-green-800" : ""}
                              >
                                {margin.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Résumé total */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(profitData.reduce((sum, item) => sum + item.revenue, 0))}
                      </div>
                      <p className="text-muted-foreground">CA Total</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(profitData.reduce((sum, item) => sum + item.profit, 0))}
                      </div>
                      <p className="text-muted-foreground">Bénéfice Total</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {profitData.length > 0 && profitData.reduce((sum, item) => sum + item.revenue, 0) > 0
                          ? ((profitData.reduce((sum, item) => sum + item.profit, 0) / 
                              profitData.reduce((sum, item) => sum + item.revenue, 0) * 100) || 0).toFixed(1) + '%'
                          : '0%'
                        }
                      </div>
                      <p className="text-muted-foreground">Marge Moyenne</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucune donnée de bénéfice disponible pour cette période
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activités Récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Activités Récentes
            </CardTitle>
            <CardDescription>
              Dernières transactions effectuées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.items} article(s) • {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(activity.amount)}</p>
                    <Badge variant={activity.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                      {activity.status === 'paid' ? 'Payé' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {recentActivities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune activité récente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Graphique d'évolution des bénéfices */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Bénéfices</CardTitle>
            <CardDescription>
              Tendances des revenus et bénéfices sur la période sélectionnée
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profitData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitData.slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      name="Chiffre d'Affaires"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                      name="Bénéfice"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible pour l'évolution des bénéfices
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}