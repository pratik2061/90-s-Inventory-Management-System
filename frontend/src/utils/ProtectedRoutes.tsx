import React from "react";
import { Navigate } from "react-router-dom";
import { useCheckToken } from "./api/useCheckTokn";

export const ProtectedRoutes = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isLoading } = useCheckToken();

  if (isLoading) return null;

  return data?.status ? <>{children}</> : <Navigate to="/login" replace />;
};
