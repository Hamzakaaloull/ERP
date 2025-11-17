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
  BarChart3
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import TextType from './components/TextType';
const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

// Couleurs pour les diagrammes
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1']

export default function DashboardPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('month')
  const [profitFilter, setProfitFilter] = useState('month') // 'day', 'month', 'year'
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
      const allSales = salesData.data || []
      
      // Filtrer les ventes selon la période
      const filteredSales = filterSalesByTime(allSales, timeFilter)
      setSales(filteredSales)
      
      // Calculer les statistiques
      calculateStats(filteredSales, allSales)
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setSales([])
    } finally {
      setLoading(false)
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

    // Calculer la période précédente pour les comparaisons
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

    const previousRevenue = previousSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0)
    const previousSalesCount = previousSales.length
    const previousProfit = calculateTotalProfit(previousSales)

    // Calculer les changements - correction pour éviter 0.0%
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
      revenueChange,
      salesChange,
      profitChange
    })
  }

  // Calculer le profit total (30% de marge par défaut)
  const calculateTotalProfit = (salesData) => {
    return salesData.reduce((total, sale) => {
      // Si nous avons le prix d'achat dans les items, calculer le profit réel
      let saleProfit = 0
      
      if (sale.sale_items && sale.sale_items.length > 0) {
        sale.sale_items.forEach(item => {
          const costPrice = item.product?.price_achat || (item.unit_price * 0.7) // 30% de marge par défaut
          saleProfit += (item.unit_price - costPrice) * item.quantity
        })
      } else {
        // Estimation basée sur une marge de 30%
        saleProfit = sale.total_amount * 0.3
      }
      
      return total + saleProfit
    }, 0)
  }

  // Préparer les données pour le tableau des bénéfices
  const getProfitData = () => {
    const profitData = {}
    const now = new Date()
    
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
      
      // Calculer le profit pour cette vente
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
    
    // Convertir en tableau et trier
    return Object.values(profitData)
      .sort((a, b) => {
        // Trier par date (le plus récent en premier)
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
            <Select value={timeFilter} onValueChange={setTimeFilter}>
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
              onClick={fetchDashboardData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <div className={`flex items-center text-xs ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(stats.revenueChange).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Par rapport à la période précédente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventes Total</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <div className={`flex items-center text-xs ${stats.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.salesChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(stats.salesChange).toFixed(1)}%
              </div>
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
              <div className={`flex items-center text-xs ${stats.profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.profitChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(stats.profitChange).toFixed(1)}%
              </div>
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

        {/* Tableau des Bénéfices - Séparé */}
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

        {/* Activités Récentes - Séparé */}
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