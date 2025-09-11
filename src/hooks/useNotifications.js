import { useEffect, useState, useRef } from "react";
import { getNotifications } from "@/services/notificationService";

export default function useNotifications() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState("conectando...");
  const wsRef = useRef(null);

  const WS_URL = `${process.env.NEXT_PUBLIC_BASE_URL_WS}/notifications?token=${encodeURIComponent(token)}`;

  const loadNotifications = async () => {
    try {
      const response = await getNotifications(token);
      if (response.success && Array.isArray(response.data)) {
        const mapped = response.data.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.message,
          date: new Date(n.created_at).toLocaleDateString("es-CO"),
          status: n.read ? "read" : "unread",
          type: n.type,
        }));
        setNotifications(mapped);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error al listar notificaciones:", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL);
    setStatus("conectando...");

    wsRef.current.onopen = () => setStatus("conectado");
    wsRef.current.onclose = () => setStatus("desconectado");
    wsRef.current.onerror = () => setStatus("error");

    wsRef.current.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg?.event === "notification_created") loadNotifications();
      } catch {
        loadNotifications();
      }
    };

    loadNotifications();

    return () => wsRef.current?.close();
  }, [WS_URL]);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return { notifications, status, unreadCount, reload: loadNotifications };
}
