import { LayoutDashboard, Users, Settings, ShieldCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Data for navigation
const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Admin Team", url: "/team", icon: Users },
  { title: "Security", url: "/security", icon: ShieldCheck },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      // Deep Slate-Green background
      className="bg-[#1e2923] text-[#e2e8f0] border-r-[#2d3a32]"
    >
      <SidebarHeader className="bg-[#1e2923] border-b border-[#2d3a32] p-4">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <span className="font-semibold tracking-wider text-amber-200 group-data-[collapsible=icon]:hidden">
            90's ADMIN
          </span>
          <SidebarTrigger className="hover:bg-amber-200 text-amber-200 transition-colors" />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#1e2923] px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#6d7e74] text-xs font-bold uppercase tracking-widest px-2 mb-2 group-data-[collapsible=icon]:hidden">
            Main Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="w-full mb-1 transition-all duration-200 hover:bg-[#2d3a32] hover:text-amber-100 active:bg-[#384a40] group"
                  >
                    <a href={item.url} className="flex items-center gap-3 py-6">
                      <item.icon className="size-5 text-amber-200/70 group-hover:text-amber-200 transition-colors" />
                      <span className="text-[15px] font-medium group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#1e2923] border-t border-[#2d3a32] p-4 text-[10px] text-[#4a5a51] group-data-[collapsible=icon]:hidden">
        © 1990-2026 Admin Shell
      </SidebarFooter>
    </Sidebar>
  );
}
