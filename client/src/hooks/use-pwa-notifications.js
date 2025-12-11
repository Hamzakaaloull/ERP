// hooks/use-pwa-notifications.js
"use client"
import { useState, useEffect, useCallback } from 'react'

export function usePwaNotifications() {
  const [permission, setPermission] = useState('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false
    
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error)
      return false
    }
  }, [isSupported])

  const showNotification = useCallback(async (title, options = {}) => {
    if (!isSupported || permission !== 'granted') return false

    try {
      // Vérifier si Service Worker est enregistré pour PWA
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          vibrate: [200, 100, 200],
          ...options
        })
        return true
      }
    } catch (error) {
      console.error('Erreur notification PWA:', error)
      // Fallback aux notifications du navigateur
      try {
        new Notification(title, options)
        return true
      } catch (fallbackError) {
        console.error('Erreur notification navigateur:', fallbackError)
        return false
      }
    }
    
    return false
  }, [isSupported, permission])

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification
  }
}