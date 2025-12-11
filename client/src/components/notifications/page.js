// app/notifications/page.js
"use client"
import React, { useEffect } from 'react'
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
  Settings
} from 'lucide-react'
import { useStockNotifications } from '@/contexts/stock-notifications-context'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

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

  useEffect(() => {
    // Démarrer la surveillance au chargement de la page
    startMonitoring(5)
    
    // Nettoyer à la fermeture
    return () => {
      stopMonitoring()
    }
  }, [startMonitoring, stopMonitoring])

const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      alert('Notifications activées avec succès !')
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return AlertTriangle
      default:
        return Bell
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'LOW_STOCK':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="min-h-screen bg-background dark:text-white">
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Gestion des alertes de stock et notifications
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={checkLowStock}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Vérifier maintenant
              </Button>
              
              {unreadCount > 0 && (
                <Button
                  variant="secondary"
                  onClick={markAllAsRead}
                  className="flex items-center gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium">Notifications non lues</span>
                  <BellRing className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{unreadCount}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Alertes en attente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium">Produits stock bas</span>
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {lowStockProducts.length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Stock inférieur à 10 unités
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium">Notifications totales</span>
                  <Bell className="h-5 w-5 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{notifications.length}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Historique des 50 derniers jours
                </p>
              </CardContent>
            </Card>
          </div>

          

          {/* Liste des produits en stock bas */}
          {lowStockProducts.length > 0 && (
            <Card className="mb-8 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="h-5 w-5" />
                  Produits avec stock critique
                </CardTitle>
                <CardDescription>
                  Produits avec moins de 10 unités en stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockProducts.map(product => (
                    <Card key={product.documentId} className="border-yellow-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          {product.photo ? (
                            <img
                              src={product.photo.url.startsWith('http') 
                                ? product.photo.url 
                                : `${API_URL}${product.photo.url}`
                              }
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold">{product.name}</div>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="destructive" className="text-xs text-white">
                                Stock: {product.stock_quantity || 0}
                              </Badge>
                              <Badge variant="destructive" className="text-xs text-white">
                                <span className="text-xs">
                                ID: {product.id}
                              </span>
                              </Badge>
                              
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historique des notifications */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Historique des notifications
                  </CardTitle>
                  <CardDescription>
                    Toutes vos alertes et notifications
                  </CardDescription>
                </div>
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Tout effacer
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Aucune notification
                    </h3>
                    <p className="text-muted-foreground">
                      Vous n'avez aucune notification pour le moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map(notification => {
                      const Icon = getNotificationIcon(notification.type)
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border rounded-lg ${getNotificationColor(notification.type)} ${
                            !notification.read ? 'opacity-100' : 'opacity-70'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <Icon className="h-5 w-5 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-medium">{notification.message}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(notification.date), {
                                    addSuffix: true,
                                    locale: fr
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeNotification(notification.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}