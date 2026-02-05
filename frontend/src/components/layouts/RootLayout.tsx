import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../ui/app-sidebar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default RootLayout;
