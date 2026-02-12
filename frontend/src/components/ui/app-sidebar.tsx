import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { api } from "@/utils/api/ApiInstance";
import { LayoutDashboard, LogOut, Percent, RefreshCw, Shirt } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { errorresponse } from "./login/LoginComponent";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Items", url: "/items", icon: Shirt },
  { title: "Sales", url: "/sales", icon: Percent },
  { title: "Exchanges", url: "/exchanges", icon: RefreshCw },
];

export function AppSidebar() {
  const navigate = useNavigate();

  const logoutFunction = async () => {
    try {
      const resData = await api.post("/logout");
      if (resData.status === 200) {
        toast.success(resData.data.message);
        navigate("/login");
      }
    } catch (error) {
      const err = error as errorresponse;
      toast.error(err.response.data.message);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="bg-[#f8faf9] text-[#1f2937] border-r border-[#e2e8e4]"
    >
      {/* Header */}
      <SidebarHeader className="bg-[#f1f5f3] border-b border-[#e2e8e4] p-4">
        <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
          <span className="font-bold text-xl tracking-tight text-amber-600 group-data-[collapsible=icon]:hidden">
            90's ADMIN
          </span>
          <SidebarTrigger className="scale-125 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-colors" />
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="bg-[#f8faf9] py-6 overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {navItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="flex justify-center"
                >
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="w-[90%] h-14 rounded-xl transition-all duration-200 hover:bg-amber-100 active:bg-amber-200/60 flex items-center justify-center p-0 group-data-[collapsible=icon]:w-14"
                  >
                    <a
                      href={item.url}
                      className="flex items-center justify-start group-data-[collapsible=icon]:justify-center w-full px-4 group-data-[collapsible=icon]:px-0"
                    >
                      <item.icon className="size-7 min-w-[28px] text-amber-500 group-hover:text-amber-600 transition-transform group-hover:scale-110" />
                      <span className="text-lg ml-4 font-medium text-[#1f2937] group-data-[collapsible=icon]:hidden whitespace-nowrap">
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

      {/* Footer */}
      <SidebarFooter className="bg-[#f1f5f3] border-t border-[#e2e8e4] p-3">
        <SidebarMenu className="w-full">
          <SidebarMenuItem className="flex justify-center">
            <SidebarMenuButton
              className="w-[90%] h-14 rounded-xl text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors flex items-center justify-center p-0 group-data-[collapsible=icon]:w-14"
              onClick={logoutFunction}
            >
              <div className="flex items-center justify-start group-data-[collapsible=icon]:justify-center w-full px-4 group-data-[collapsible=icon]:px-0">
                <LogOut className="size-7 min-w-[28px]" />
                <span className="text-lg ml-4 font-medium group-data-[collapsible=icon]:hidden">
                  Logout
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
