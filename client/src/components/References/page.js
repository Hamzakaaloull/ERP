"use client"
import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductsTab from './components/products-tab'
import CategoriesTab from './components/categories-tab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tags, BarChart3, AlertCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export default function ReferencesPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    averageStock: 0,
    loading: true
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // جلب عدد المنتجات
      const productsResponse = await fetch(`${API_URL}/api/products?pagination[pageSize]=1&pagination[page]=1`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const productsData = await productsResponse.json()
      
      // جلب عدد الفئات
      const categoriesResponse = await fetch(`${API_URL}/api/categories?pagination[pageSize]=1&pagination[page]=1`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const categoriesData = await categoriesResponse.json()
      
      // جلب متوسط المخزون
      const stockResponse = await fetch(`${API_URL}/api/products?populate=*`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const stockData = await stockResponse.json()
      
      let totalStock = 0
      let productCount = 0
      let lowStockCount = 0
      
      const products = stockData.data || stockData || []
      products.forEach(product => {
        if (product.stock_quantity > 0) {
          totalStock += product.stock_quantity
          productCount++
        }
        if (product.stock_quantity < 10 && product.stock_quantity > 0) {
          lowStockCount++
        }
      })
      
      const averageStock = productCount > 0 ? Math.round((totalStock / productCount) / productCount * 100) : 0
      
      setStats({
        totalProducts: productsData.meta?.pagination?.total || productsData.length || 0,
        totalCategories: categoriesData.meta?.pagination?.total || categoriesData.length || 0,
        averageStock: averageStock,
        lowStockCount: lowStockCount,
        loading: false
      })
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const statsData = [
    {
      title: "Total Produits",
      value: stats.loading ? "..." : stats.totalProducts.toString(),
      description: stats.lowStockCount > 0 ? `${stats.lowStockCount} en stock faible` : "Stock optimal",
      icon: Package,
      color: stats.lowStockCount > 0 ? "text-orange-500" : "text-blue-600"
    },
    {
      title: "Catégories",
      value: stats.loading ? "..." : stats.totalCategories.toString(),
      description: "Toutes actives",
      icon: Tags,
      color: "text-green-600"
    },
    {
      title: "Niveau Stock",
      value: stats.loading ? "..." : `${stats.averageStock}%`,
      description: stats.averageStock > 80 ? "Optimal" : stats.averageStock > 50 ? "Moyen" : "À surveiller",
      icon: BarChart3,
      color: stats.averageStock > 80 ? "text-green-600" : stats.averageStock > 50 ? "text-yellow-600" : "text-red-600"
    }
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Références
          </h1>
          <p className="text-xl text-muted-foreground">
            Gestion complète des produits et catégories de votre magasin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
              {stats.loading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                  <TabsTrigger 
                    value="products" 
                    className="relative rounded-none border-b-2 border-transparent px-6 py-4 text-lg font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Produits
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                      {stats.loading ? "..." : stats.totalProducts}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="categories" 
                    className="relative rounded-none border-b-2 border-transparent px-6 py-4 text-lg font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    <Tags className="h-5 w-5 mr-2" />
                    Catégories
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                      {stats.loading ? "..." : stats.totalCategories}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="products" className="m-0">
                  <ProductsTab onUpdate={fetchStats} />
                </TabsContent>
                
                <TabsContent value="categories" className="m-0">
                  <CategoriesTab onUpdate={fetchStats} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}