import React from "react";
// import { Outlet } from "react-router-dom";
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../ui/app-sidebar";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        {/* <Outlet /> */}
        {children}
      </main>
    </SidebarProvider>
  );
};

export default RootLayout;
