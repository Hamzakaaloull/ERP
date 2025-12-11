    // contexts/stock-notifications-context.jsx
    "use client"
    import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
    import { usePwaNotifications } from '@/hooks/use-pwa-notifications'

    const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL

    const StockNotificationsContext = createContext()

    export function StockNotificationsProvider({ children }) {
      const [lowStockProducts, setLowStockProducts] = useState([])
      const [notifications, setNotifications] = useState([])
      const [unreadCount, setUnreadCount] = useState(0)
      const { isSupported, requestPermission, showNotification } = usePwaNotifications()
      const checkIntervalRef = useRef(null)
      const lastCheckRef = useRef(0)

      // Charger les notifications depuis localStorage
      useEffect(() => {
        const savedNotifications = localStorage.getItem('stockNotifications')
        const savedLowStock = localStorage.getItem('lowStockProducts')
        
        if (savedNotifications) {
          try {
            const parsed = JSON.parse(savedNotifications)
            setNotifications(parsed)
            const unread = parsed.filter(n => !n.read).length
            setUnreadCount(unread)
          } catch (e) {
            console.error("Erreur lors du parsing des notifications:", e)
          }
        }
        
        if (savedLowStock) {
          try {
            setLowStockProducts(JSON.parse(savedLowStock))
          } catch (e) {
            console.error("Erreur lors du parsing des produits en stock bas:", e)
          }
        }
      }, [])

      // Sauvegarder dans localStorage
      useEffect(() => {
        try {
          localStorage.setItem('stockNotifications', JSON.stringify(notifications))
          localStorage.setItem('lowStockProducts', JSON.stringify(lowStockProducts))
        } catch (e) {
          console.error("Erreur lors de la sauvegarde des notifications:", e)
        }
      }, [notifications, lowStockProducts])

      const checkLowStock = useCallback(async (force = false) => {
        const now = Date.now()
        // Éviter de vérifier trop souvent (minimum 30 secondes entre les vérifications)
        if (!force && now - lastCheckRef.current < 30000) {
          return
        }
        
        lastCheckRef.current = now
        
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`${API_URL}/api/products?populate=photo&filters[stock_quantity][$lt]=10`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          const data = await response.json()
          const products = data.data || data || []
          
          setLowStockProducts(prev => {
            // Trouver les nouveaux produits en stock bas
            const newLowStockProducts = products.filter(product => {
              return !prev.some(p => p.id === product.id)
            })

            // Créer des notifications pour les nouveaux produits en stock bas
            newLowStockProducts.forEach(product => {
              if (product.stock_quantity < 10) {
                const newNotification = {
                  id: Date.now() + Math.random(),
                  productId: product.id,
                  productName: product.name,
                  currentStock: product.stock_quantity,
                  message: `Stock faible pour ${product.name}: ${product.stock_quantity} unités restantes`,
                  type: 'LOW_STOCK',
                  date: new Date().toISOString(),
                  read: false
                }

                setNotifications(prevNotifications => {
                  const updated = [newNotification, ...prevNotifications]
                  const unread = updated.filter(n => !n.read).length
                  setUnreadCount(unread)
                  return updated.slice(0, 50)
                })

                // Envoyer une notification PWA
                if (isSupported && Notification.permission === 'granted') {
                  showNotification('Stock faible !', {
                    body: `${product.name}: Seulement ${product.stock_quantity} unités restantes`,
                    tag: `low-stock-${product.id}`,
                    renotify: false,
                    requireInteraction: true
                  }).catch(e => console.error("Erreur notification:", e))
                }
              }
            })

            return products
          })
        } catch (error) {
          console.error('Erreur lors de la vérification du stock:', error)
        }
      }, [isSupported, showNotification])

      // Démarrer la vérification périodique
      const startMonitoring = useCallback((intervalMinutes = 5) => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current)
        }

        // Vérifier immédiatement
        checkLowStock(true)
        
        // Puis vérifier périodiquement
        checkIntervalRef.current = setInterval(() => {
          checkLowStock(false)
        }, intervalMinutes * 60 * 1000)

        return () => {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
          }
        }
      }, [checkLowStock])

      // Arrêter la surveillance
      const stopMonitoring = useCallback(() => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current)
          checkIntervalRef.current = null
        }
      }, [])

      // Marquer une notification comme lue
      const markAsRead = useCallback((notificationId) => {
        setNotifications(prev => {
          const updated = prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
          
          const unread = updated.filter(n => !n.read).length
          setUnreadCount(unread)
          
          return updated
        })
      }, [])

      // Marquer toutes comme lues
      const markAllAsRead = useCallback(() => {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        )
        setUnreadCount(0)
      }, [])

      // Supprimer une notification
      const removeNotification = useCallback((notificationId) => {
        setNotifications(prev => {
          const updated = prev.filter(n => n.id !== notificationId)
          const unread = updated.filter(n => !n.read).length
          setUnreadCount(unread)
          return updated
        })
      }, [])

      // Effacer toutes les notifications
      const clearAllNotifications = useCallback(() => {
        setNotifications([])
        setUnreadCount(0)
      }, [])

      // Nettoyer l'intervalle à la destruction
      useEffect(() => {
        return () => {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
          }
        }
      }, [])

      const value = useMemo(() => ({
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
      }), [
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
      ])

      return (
        <StockNotificationsContext.Provider value={value}>
          {children}
        </StockNotificationsContext.Provider>
      )
    }

    export const useStockNotifications = () => {
      const context = useContext(StockNotificationsContext)
      if (!context) {
        throw new Error('useStockNotifications must be used within StockNotificationsProvider')
      }
      return context
    }