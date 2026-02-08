import { useQuery } from "@tanstack/react-query";
import { checkToken } from "./checkToken";

interface response {
  status: number;
  data: {
    status: boolean;
    message: string;
  };
}
export const useCheckToken = () => {
  return useQuery({
    queryKey: ["token"],
    queryFn: async (): Promise<response> => await checkToken(),
    retry: 3,
    networkMode: "online",
    staleTime: 5 * 60 * 60,
    gcTime: 60 * 60,
  });
};
