"use client"
import React, { createContext, useContext, useState } from 'react'

const NavigationContext = createContext()

export function NavigationProvider({ children }) {
  const [activeComponent, setActiveComponent] = useState('Utilisateurs')

  return (
    <NavigationContext.Provider value={{ activeComponent, setActiveComponent }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation doit être utilisé dans un NavigationProvider')
  }
  return context
}