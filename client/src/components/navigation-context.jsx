// navigation-context.jsx
"use client"
import React, { createContext, useState, useContext, useMemo, useCallback } from 'react'

const NavigationContext = createContext()

export function NavigationProvider({ children }) {
  const [activeComponent, setActiveComponentInternal] = useState('TableauDeBord')

  // Mémoïser setActiveComponent pour éviter les re-rendus
  const setActiveComponent = useCallback((component) => {
    setActiveComponentInternal(component)
  }, [])

  const value = useMemo(() => ({
    activeComponent,
    setActiveComponent
  }), [activeComponent, setActiveComponent])

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigation = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}