// page.jsx (Dashboard)
"use client"
import React, { useEffect, useState, Suspense, lazy } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { NavigationProvider, useNavigation } from '../../components/navigation-context'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ModeToggle from "@/components/button-tugle"
import { StockNotificationsProvider } from '@/contexts/stock-notifications-context'

// Lazy load components
const UtilisateursPage = lazy(() => import("../../components/Users/page"))
const TableauDeBord = lazy(() => import("../../components/TableauDeBord/page"))
const References = lazy(() => import("../../components/References/page"))
const Parametres = lazy(() => import("../../components/Parametres/page"))
const Sales = lazy(() => import("../../components/Sales/page"))
const Stock_Mouvements = lazy(() => import("../../components/Stock_Movements/page"))
const Debts = lazy(() => import("../../components/Debts/page"))
const NotificationsPage = lazy(() => import("../../components/notifications/page"))

// Composant de chargement
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
)

function MainContent() {
  const { activeComponent } = useNavigation()
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_STRAPI_API_URL;
        const token = localStorage.getItem("token")
        if (token) {
          const res = await fetch(`${API.replace(/\/$/, "")}/api/users/me?populate[role]=*`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (res.ok) {
            const userData = await res.json()
            const user = userData?.data ? userData.data : userData
            setUserRole(user.role?.name || user.role)
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du rôle:", error)
      }
    }

    fetchUserRole()
  }, [])

  const renderActiveComponent = () => {
    if (userRole === "admin") {
      // Admin peut tout voir
      switch (activeComponent) {
        case 'Utilisateurs': return <UtilisateursPage />
        case 'Sales': return <Sales />
        case 'Stock_Mouvements': return <Stock_Mouvements />
        case 'Debts': return <Debts />
        case 'TableauDeBord': return <TableauDeBord />
        case 'References': return <References />
        case 'Parametres': return <Parametres />
        case 'Notifications': return <NotificationsPage />
        default: return <TableauDeBord />
      }
    } else {
      return <div>Rôle non autorisé</div>
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 bg-neutral-50" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <ModeToggle />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Tableau de bord</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {activeComponent === 'Utilisateurs' && 'Utilisateurs'}
                  {activeComponent === 'Sales' && 'Sales'}
                  {activeComponent === 'Debts' && 'Debts'}
                  {activeComponent === 'Stock_Mouvements' && 'Stock Mouvements'}
                  {activeComponent === 'TableauDeBord' && 'Tableau de Bord'}
                  {activeComponent === 'References' && 'Gestion des Références'}
                  {activeComponent === 'Parametres' && 'Paramètres'}
                  {activeComponent === 'Notifications' && 'Notifications'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense fallback={<LoadingFallback />}>
          {renderActiveComponent()}
        </Suspense>
      </main>
    </SidebarInset>
  )
}

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/"
    } else {
      setIsAuthenticated(true)
      const fetchUserRole = async () => {
        try {
          const API = process.env.NEXT_PUBLIC_STRAPI_API_URL;
          const res = await fetch(`${API.replace(/\/$/, "")}/api/users/me?populate[role]=*`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (res.ok) {
            const userData = await res.json()
            const user = userData?.data ? userData.data : userData
            setUserRole(user.role?.name || user.role)
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du rôle:", error)
        }
      }
      fetchUserRole()
    }
  }, [])

  if (!isAuthenticated) {
    return null
  }

  return (
    <StockNotificationsProvider>
      <NavigationProvider>
        <SidebarProvider>
          <AppSidebar />
          <MainContent />
        </SidebarProvider>
      </NavigationProvider>
    </StockNotificationsProvider>
  )
}