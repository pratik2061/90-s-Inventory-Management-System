import { api } from "./ApiInstance";

export const checkToken = async () => {
  try {
    const res = await api.get("/verify/token");
    return res;
  } catch (error) {
    return error;
  }
};
