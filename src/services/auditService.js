import { apiAudit } from "@/lib/axios";

export const getAudit = async () => {
    const { data } = await apiAudit.get("/audit-events");
    return data;
};