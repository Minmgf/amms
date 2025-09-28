import { apiMain } from "@/lib/axios";

export const getMaintenanceList = async () => {
    const { data } = await apiMain.get("/maintenance/");
    return data;
};