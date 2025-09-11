import { apiUsers } from "@/lib/axios";

export const getNotifications = async () => {
    const { data } = await apiUsers.get("/users/notifications/");
    return data;
};

export const markAllNotAsRead = async () => {
  const { data } = await apiUsers.post("users/notifications/mark-read", {
    mark_all: true,
  });
  return data;
};

export const markOneNotAsRead = async (payload) => {
  const { data } = await apiUsers.post("/users/notifications/mark-read", payload);
  return data;
};





