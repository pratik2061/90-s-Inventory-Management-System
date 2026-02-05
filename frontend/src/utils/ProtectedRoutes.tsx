import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { checkToken } from "./api/checkToken";

interface response {
  status: number;
  data: {
    status: boolean;
    message: string;
  };
}

export const ProtectedRoutes = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = (await checkToken()) as response;

        if (res.status === 200 && res.data.status) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log("Verification error:", error);
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
