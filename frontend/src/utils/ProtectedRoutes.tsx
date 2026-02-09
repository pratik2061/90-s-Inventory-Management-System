import React from "react";
import { Navigate } from "react-router-dom";
import { useCheckToken } from "./api/useCheckTokn";

export const ProtectedRoutes = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isLoading, isError } = useCheckToken();

  if (isLoading) return null;

  console.log(data)
  const isAuthenticated =
    data && typeof data === "object" && data?.status === true;

  if (isError || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
