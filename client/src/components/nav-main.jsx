// nav-main.jsx
"use client"

import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({ items }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plateforme</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
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
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild
                            className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                          >
                            <a href={subItem.url} onClick={(e) => {
                              e.preventDefault()
                              if (subItem.onClick) subItem.onClick()
                            }}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}