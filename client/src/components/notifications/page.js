// app/notifications/page.js
"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  BellRing, 
  Package, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  CheckCheck,
  RefreshCw,
  Settings,
  Filter,
  X,
  Eye,
  EyeOff,
  TrendingDown,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react'
import { useStockNotifications } from '@/contexts/stock-notifications-context'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

export default function NotificationsPage() {
  const {
    lowStockProducts,
    notifications,
    unreadCount,
    isSupported,
    requestPermission,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    startMonitoring,
    stopMonitoring,
    checkLowStock
  } = useStockNotifications()

  const [filter, setFilter] = useState('all') // 'all', 'unread', 'critical'
  const [showLowStock, setShowLowStock] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Déduplication des notifications basée sur l'ID et le timestamp
  const uniqueNotifications = useMemo(() => {
    const seen = new Set();
    return notifications.filter(notification => {
      const duplicate = seen.has(notification.id);
      seen.add(notification.id);
      return !duplicate;
    });
  }, [notifications]);

  // Filtrage des notifications
  const filteredNotifications = useMemo(() => {
    let filtered = uniqueNotifications;
    
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'critical') {
      filtered = filtered.filter(n => n.type === 'LOW_STOCK' || n.priority === 'high');
    }
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [uniqueNotifications, filter]);

  useEffect(() => {
    if (autoRefresh) {
      startMonitoring(5);
    }
    
    return () => {
      stopMonitoring();
    }
  }, [startMonitoring, stopMonitoring, autoRefresh]);

  const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      alert('Notifications activées avec succès !');
    }
  }

  const getNotificationIcon = (type, priority = 'normal') => {
    switch (type) {
      case 'LOW_STOCK':
        return priority === 'high' ? AlertCircle : TrendingDown;
      case 'OUT_OF_STOCK':
        return AlertCircle;
      case 'STOCK_UPDATE':
        return Package;
      default:
        return priority === 'high' ? AlertCircle : Bell;
    }
  }

  const getNotificationColor = (type, priority = 'normal') => {
    switch (type) {
      case 'LOW_STOCK':
        return priority === 'high' 
          ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
          : 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800';
      case 'OUT_OF_STOCK':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
      case 'STOCK_UPDATE':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  }

  const getNotificationBadge = (type, priority = 'normal') => {
    switch (type) {
      case 'LOW_STOCK':
        return priority === 'high' 
          ? { label: 'Critique', variant: 'destructive' }
          : { label: 'Stock Bas', variant: 'secondary', className: 'bg-gray-500 hover:bg-gray-600' };
      case 'OUT_OF_STOCK':
        return { label: 'Rupture', variant: 'destructive' };
      case 'STOCK_UPDATE':
        return { label: 'Mise à jour', variant: 'default' };
      default:
        return { label: 'Info', variant: 'outline' };
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true);
    await checkLowStock();
    setTimeout(() => setIsLoading(false), 1000);
  }

  return (
    <div className="min-h-screen  from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header avec bannière de notification si non supporté */}
          {!isSupported && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl dark:bg-gray-950/30 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm text-gray-800 dark:text-gray-300">
                    Les notifications navigateur ne sont pas supportées. Activez-les pour recevoir des alertes en temps réel.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleRequestPermission}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Activer
                </Button>
              </div>
            </div>
          )}

          {/* En-tête principal */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-primary/10 dark:bg-primary/20">
                    <BellRing className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    Centre de Notifications
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Gérez vos alertes de stock et restez informé en temps réel
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 border-2 dark:text-gray-200 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <RefreshCw className={`h-4 w-4   ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Actualisation...' : 'Actualiser'}
                </Button>
                
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Tout marquer comme lu
                    <Badge className="ml-2 bg-white text-primary">{unreadCount}</Badge>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques en grille moderne */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Non lues</p>
                    <div className="text-3xl font-bold">{unreadCount}</div>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(unreadCount / Math.max(notifications.length, 1)) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Stock Critique</p>
                    <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                      {lowStockProducts.length}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-900/30">
                    <AlertTriangle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Produits sous le seuil minimum
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Total</p>
                    <div className="text-3xl font-bold">{uniqueNotifications.length}</div>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <BellRing className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Notifications (30 derniers jours)
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Statut</p>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {autoRefresh ? 'Actif' : 'Pause'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Surveillance automatique
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal avec onglets */}
          <Tabs defaultValue="notifications" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <TabsList className="bg-gray-100 dark:bg-gray-800 p-1">
                <TabsTrigger value="notifications" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="stock" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                  <Package className="h-4 w-4 mr-2" />
                  Stock Critique
                  {lowStockProducts.length > 0 && (
                    <Badge className="ml-2 bg-red-500">{lowStockProducts.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-transparent border-none dark:text-white  focus:outline-none text-sm"
                  >
                    <option value="all">Toutes les notifications</option>
                    <option value="unread">Non lues seulement</option>
                    <option value="critical">Alertes critiques</option>
                  </select>
                </div>

                {filteredNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Tout effacer
                  </Button>
                )}
              </div>
            </div>

            {/* Onglet Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-2 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <span>Historique des notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Bell className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Aucune notification
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Vous êtes à jour ! Aucune notification pour le moment.
                      </p>
                      <Button onClick={handleRefresh} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Vérifier maintenant
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-3">
                        {filteredNotifications.map((notification) => {
                          const Icon = getNotificationIcon(notification.type, notification.priority);
                          const badge = getNotificationBadge(notification.type, notification.priority);
                          return (
                            <div
                              key={`${notification.id}-${notification.date}`}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                getNotificationColor(notification.type, notification.priority)
                              } ${!notification.read ? 'ring-2 ring-offset-2 ring-primary/20' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                  <div className={`p-3 rounded-lg ${
                                    notification.priority === 'high' 
                                      ? 'bg-red-100 dark:bg-red-900/30' 
                                      : 'bg-gray-100 dark:bg-gray-800'
                                  }`}>
                                    <Icon className={`h-5 w-5 ${
                                      notification.priority === 'high' 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-gray-600 dark:text-gray-400'
                                    }`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <Badge 
                                        variant={badge.variant}
                                        className={badge.className}
                                      >
                                        {badge.label}
                                      </Badge>
                                      {!notification.read && (
                                        <Badge variant="outline" className="border-primary text-primary">
                                          Non lu
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                      {notification.message}
                                    </p>
                                    {notification.productId && (
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <Package className="h-3 w-3" />
                                        <span>ID Produit: {notification.productId}</span>
                                      </div>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                      {formatDistanceToNow(new Date(notification.date), {
                                        addSuffix: true,
                                        locale: fr
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {!notification.read && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => markAsRead(notification.id)}
                                      className="h-9 w-9 p-0 rounded-full"
                                      title="Marquer comme lu"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeNotification(notification.id)}
                                    className="h-9 w-9 p-0 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Stock Critique */}
            <TabsContent value="stock" className="space-y-6">
              {lowStockProducts.length > 0 ? (
                <Card className="border-2 border-gray-200 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-gray-700 dark:text-gray-400">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/30">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <span>Produits en stock critique</span>
                      <Badge variant="destructive" className="ml-2 text-gray-100">
                        {lowStockProducts.length} produit(s)
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Produits nécessitant une réapprovisionnement urgent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lowStockProducts.map((product) => (
                        <Card 
                          key={product.documentId} 
                          className="border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              {product.photo ? (
                                <div className="relative">
                                  <img
                                    src={product.photo.url.startsWith('http') 
                                      ? product.photo.url 
                                      : `${API_URL}${product.photo.url}`
                                    }
                                    alt={product.name}
                                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                                    loading="lazy"
                                  />
                                  <div className="absolute -top-2 -right-2">
                                    <Badge variant="destructive" className="text-xs px-2 py-1 text-white ">
                                      {product.stock_quantity || 0}
                                    </Badge>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-200 flex items-center justify-center">
                                  <Package className="h-8 w-8 text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                  {product.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs font-semibold">
                                    ID: {product.id}
                                  </Badge>
                                  <Badge 
                                    variant="destructive" 
                                    className="text-xs font-semibold text-gray-100"
                                  >
                                    Stock restant: {product.stock_quantity || 0}
                                  </Badge>
                                </div>
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                                    <span>Niveau de stock</span>
                                    <span className="font-medium">{Math.round((product.stock_quantity / 10) * 100)}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                                    <div 
                                      className="h-full bg-gradient-to-r from-gray-500 to-red-500 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.min((product.stock_quantity / 10) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-green-200">
                  <CardContent className="py-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Stock optimal
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Aucun produit en stock critique. Tous vos produits ont des niveaux de stock suffisants.
                    </p>
                    <Button variant="outline" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Vérifier le stock
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Section des paramètres */}
          
        </div>
      </div>
    </div>
  )
}