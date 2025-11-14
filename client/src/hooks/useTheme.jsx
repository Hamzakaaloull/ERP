// hooks/useTheme.js
import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light"
    setTheme(currentTheme)

    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        setTheme(e.newValue || "light")
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return theme
}