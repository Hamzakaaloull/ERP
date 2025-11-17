
// app-sidebar.jsx
"use client"
import React, { useEffect, useState } from "react"
import { Command, BookOpen, Users, NotepadText, Gavel, Command as Cmd, Hospital, Library, LifeBuoy, Frame, ShieldUser, Group, Wrench, Settings ,  Weight  ,BanknoteArrowUp , Warehouse } from "lucide-react"
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
import { useTheme } from "@/hooks/useTheme"
import { motion, AnimatePresence } from 'motion/react'

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
  const theme = useTheme()
  
   
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
      icon: Weight, 
      isActive: activeComponent === "Sales",
      onClick: () => setActiveComponent("Sales")
    },{ 
      title: "Debts", 
      url: "#", 
      icon: BanknoteArrowUp, 
      isActive: activeComponent === "Debts",
      onClick: () => setActiveComponent("Debts")
    },{ 
      title: "Stock Mouvements", 
      url: "#", 
      icon: Warehouse, 
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

  const sidebarVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 20,
        duration: 0.6
      }
    }
  }

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.1
      }
    }
  }

  const logoVariants = {
    hidden: { scale: 0.8, rotate: -10 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    },
    hover: {
      scale: 1.05,
      rotate: [0, -2, 2, 0],
      transition: {
        duration: 0.5
      }
    }
  }

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  const footerVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        delay: 0.5
      }
    }
  }

  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      <Sidebar variant="inset" {...props}>
        <motion.div variants={headerVariants}>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <motion.div
                  variants={logoVariants}
                  whileHover="hover"
                >
                  <SidebarMenuButton size="lg" asChild>
                    <a href="#">
                      <Image
                        src="/img/Fatini_logo_dark2.png"
                        alt="Taha logo"
                        width={65}
                        height={50}
                        quality={100}
                        className="object-contain  dark:bg-transparent rounded-2xl light:invert dark:invert-0"
                      />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">ERP</span>
                        <span className="truncate text-sm">Gestion Stock</span>
                      </div>
                    </a>
                  </SidebarMenuButton>
                </motion.div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
        </motion.div>

        <motion.div variants={contentVariants}>
          <SidebarContent>
            <motion.div variants={itemVariants}>
              <NavMain items={navMain} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <NavProjects projects={projects} />
            </motion.div>
          </SidebarContent>
        </motion.div>

        <motion.div variants={footerVariants}>
          <SidebarFooter>
            <NavUser user={data.user} />
            <AnimatePresence>
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-xs mt-2 px-3"
                >
                  Chargement de l'utilisateur…
                </motion.div>
              )}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-xs text-red-500 mt-2 px-3"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </SidebarFooter>
        </motion.div>
      </Sidebar>
    </motion.div>
  )
}
