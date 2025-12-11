"use client"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavProjects({ projects }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Support</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              asChild
              tooltip={item.title} 
              onClick={item.onClick}
              className={`
                transition-colors duration-200 
                ${item.isActive 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
                }
              `}
              style={{ cursor: 'pointer' }}
            >
              <a href={item.url} onClick={(e) => {
                e.preventDefault()
              }}>
                <item.icon />
                <span className="flex-1">{item.title}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}