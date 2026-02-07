import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { checkToken } from "./api/checkToken";
import toast from "react-hot-toast";
import { SpinnerCustom } from "@/components/ui/spinner";
import { SkeletonText } from "@/components/ui/skeleton-template";
import { Skeleton } from "@/components/ui/skeleton";

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
        toast.error(`${error}`);
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-8xl">
        <SpinnerCustom />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
