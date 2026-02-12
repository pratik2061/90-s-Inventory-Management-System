import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import RootLayout from "./components/layouts/RootLayout";
import Dashboard from "./components/ui/dashboard/Dashboard";
import ExchangeList from "./components/ui/exchange/ExchangeList";
import Items from "./components/ui/item/Items";
import LoginPage from "./components/ui/login/LoginComponent";
import Sales from "./components/ui/sale/Sale";
import SaleDetails from "./components/ui/sale/saleDetails";
import { ProtectedRoutes } from "./utils/ProtectedRoutes";

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
          children: [
            {
              index: true,
              element: <Sales />,
            },
            {
              path: ":id",
              element: <SaleDetails />,
            },
          ],
        },
        {
          path: "/exchanges",
          element: <ExchangeList />,
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
