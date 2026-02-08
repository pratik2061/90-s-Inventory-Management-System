import toast from "react-hot-toast";
import { api } from "./ApiInstance";
import type { errorresponse } from "@/components/ui/login/LoginComponent";

export const checkToken = async () => {
  try {
    const res = await api.get("/verify/token");
    return res.data;
  } catch (error) {
    const err = error as errorresponse;
    toast.error(`${err.response.data.message}`);
    return err;
  }
};
