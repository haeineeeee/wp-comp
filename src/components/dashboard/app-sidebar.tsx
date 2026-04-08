"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, DollarSign, Search, Settings, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSites } from "@/hooks/use-sites";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Posts", href: "/posts", icon: FileText },
  { title: "Revenue", href: "/revenue", icon: DollarSign },
  { title: "SEO", href: "/seo", icon: Search },
];

const SITE_COLORS = [
  "#059669", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316",
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: sites, isLoading: sitesLoading } = useSites();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            W
          </div>
          <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
            WP Companion
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Sites</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sitesLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </SidebarMenuItem>
                ))
              ) : (
                sites?.map((site, index) => (
                  <SidebarMenuItem key={site.id}>
                    <SidebarMenuButton render={<Link href={`/sites/${site.id}`} />}>
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: SITE_COLORS[index % SITE_COLORS.length] }}
                      />
                      <span className="truncate text-xs">{site.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/sites/new" />} className="text-emerald-600">
                  <Plus className="h-4 w-4" />
                  <span>사이트 추가</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/settings"}
              render={<Link href="/settings" />}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
