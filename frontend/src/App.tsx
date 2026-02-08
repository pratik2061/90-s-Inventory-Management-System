import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import LoginPage from "./components/ui/login/LoginComponent";
import { ProtectedRoutes } from "./utils/ProtectedRoutes";
import RootLayout from "./components/layouts/RootLayout";
import Dashboard from "./components/ui/dashboard/Dashboard";
import { Toaster } from "react-hot-toast";
import Items from "./components/ui/item/Items";
import Sales from "./components/ui/sale/Sale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoutes>
          <RootLayout />
        </ProtectedRoutes>
      ),
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: "/items",
          element: <Items />,
        },
        {
          path: "/sales",
          element: <Sales />,
        },
      ],
    },
  ]);

  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </>
  );
}

export default App;
