// app-sidebar.jsx
"use client"
import React, { useEffect, useState } from "react"
import { Command, BookOpen, Users, NotepadText, Gavel, Command as Cmd, Hospital, Library, LifeBuoy, Frame, ShieldUser, Group, Wrench, Settings } from "lucide-react"
import Image from "next/image"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { useNavigation } from './navigation-context'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

/**
 * API base
 */
const API = process.env.NEXT_PUBLIC_STRAPI_API_URL;
/** قراءة JWT من localStorage */
function getJwt() {
  if (typeof window === "undefined") return null
  try {
    const token = localStorage.getItem("token")
    return token || null
  } catch (e) {
    return null
  }
}

/**
 * استخراج رابط الصورة
 */
function resolveAvatarUrl(user) {
  if (!user) return null

  const candidates = [
    user.profile?.data?.url,
    user.profile?.url,
    user.profile?.formats?.thumbnail?.url,
    user.profile?.data?.formats?.thumbnail?.url,
    user.avatar,
    user.image,
    user.profile,
  ]

  for (const val of candidates) {
    if (!val) continue
    if (typeof val === "string") {
      if (val.startsWith("/")) return API.replace(/\/$/, "") + val
      if (val.startsWith("http")) return val
      continue
    }
    if (typeof val === "object") {
      const url =
        val.url ||
        val.path ||
        val?.formats?.thumbnail?.url ||
        val?.formats?.small?.url ||
        val?.data?.url
      if (url) {
        if (url.startsWith("/")) return API.replace(/\/$/, "") + url
        if (url.startsWith("http")) return url
      }
    }
  }

  return null
}

export function AppSidebar(props) {
  const [userRaw, setUserRaw] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { activeComponent, setActiveComponent } = useNavigation()
  const [theme, setTheme] = useState("light");

  

  // ميع عناصر التنقل الأساسية
  const allNavMainItems = [
     { 
      title: "Tableau de Bord", 
      url: "#", 
      icon: Group, 
      isActive: activeComponent === "TableauDeBord",
      onClick: () => setActiveComponent("TableauDeBord")
    },{ 
      title: "Sales", 
      url: "#", 
      icon: ShieldUser, 
      isActive: activeComponent === "Sales",
      onClick: () => setActiveComponent("Sales")
    },{ 
      title: "Debts", 
      url: "#", 
      icon: ShieldUser, 
      isActive: activeComponent === "Debts",
      onClick: () => setActiveComponent("Debts")
    },,{ 
      title: "Stock Mouvements", 
      url: "#", 
      icon: ShieldUser, 
      isActive: activeComponent === "Stock_Mouvements",
      onClick: () => setActiveComponent("Stock_Mouvements")
    },
      { 
      title: "Products et Categories", 
      url: "#", 
      icon: NotepadText, 
      isActive: activeComponent === "References",
      onClick: () => setActiveComponent("References")
    },
     { 
      title: "Exporte et rapports", 
      url: "#", 
      icon: ShieldUser, 
      isActive: activeComponent === "Rapports",
      onClick: () => setActiveComponent("Rapports")
    },
   { 
      title: "Utilisateurs", 
      url: "#", 
      icon: ShieldUser, 
      isActive: activeComponent === "Utilisateurs",
      onClick: () => setActiveComponent("Utilisateurs")
    },
    
    { 
      title: "Paramètres", 
      url: "#", 
      icon: Settings, 
      isActive: activeComponent === "Parametres",
      onClick: () => setActiveComponent("Parametres")
    },
  ]

 
  // تحديد عناصر التنقل بناءً على دور المستخدم
  const getNavItems = () => {
    if (!userRaw) return []
    
    const userRole = userRaw.role?.name || userRaw.role
    
    if (userRole === "admin") {
      return allNavMainItems
    } else if (userRole === "maintenance_technician") {
      return technicianNavItems
    } else {
      return []
    }
  }

  const navMain = getNavItems()
  
  const projects = [{ 
    title: "Assistance", 
    url: "#", 
    icon: LifeBuoy, 
    isActive: activeComponent === "Assistance",
    onClick: () => setActiveComponent("Assistance")
  }]

  useEffect(() => {
    let mounted = true

    async function fetchUser() {
      setLoading(true)
      setError(null)

      const jwt = getJwt()
      if (!jwt) {
        setLoading(false)
        setError("Aucun token JWT trouvé dans le localStorage")
        return
      }

      try {
        const res = await fetch(`${API.replace(/\/$/, "")}/api/users/me?populate[profile]=*&populate[role]=*`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`HTTP ${res.status} — ${text}`)
        }

        const json = await res.json()
        console.log("Utilisateur récupéré:", json)
        const user = json?.data ? json.data : json
        if (mounted) {
          setUserRaw(user)
          
          // تعيين المكون الافتراضي بناءً على دور المستخدم
          const userRole = user.role?.name || user.role
          if (userRole === "admin") {
            setActiveComponent("TableauDeBord")
          } else if (userRole === "maintenance_technician") {
            setActiveComponent("Maintenance")
          } else {
            setActiveComponent("Utilisateurs")
          }
          
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Échec de la récupération de l'utilisateur")
          setLoading(false)
        }
      }
    }

    fetchUser()
    return () => {
      mounted = false
    }
  }, [setActiveComponent])

  // تحضير كائن بيانات مبسط للاستخدام
  const data = React.useMemo(() => {
    const fallback = {
      user: {
        name: "Invité",
        email: "invite@example.com",
        avatar: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
        raw: null,
      },
    }

    if (!userRaw) return fallback

    const name = userRaw.username || userRaw.name || userRaw.fullName || userRaw.email || "Utilisateur"
    const email = userRaw.email || ""
    const avatar = resolveAvatarUrl(userRaw) || "/avatars/default.jpg"

    return {
      user: {
        name,
        email,
        avatar,
        raw: userRaw,
      },
    }
  }, [userRaw])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <Image
                 src="/img/Fatini_logo_dark.png"
                  alt="Saint Gobain Logo"
                  width={65}
                  height={50}
                  quality={100}
                  className="object-contain  light:invert dark:invert-0"
                />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">ERP</span>
                  <span className="truncate text-sm">Gestion Stock</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
        {loading ? <div className="text-xs mt-2 px-3">Chargement de l'utilisateur…</div> : null}
        {error ? <div className="text-xs text-red-500 mt-2 px-3">{error}</div> : null}
      </SidebarFooter>
    </Sidebar>
  )
}