"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSSO } from "@/services/authService";
import { usePermissions } from "@/contexts/PermissionsContext";

const SSOPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginSuccess } = usePermissions();
  const [error, setError] = useState(null);

  useEffect(() => {
    const ssoToken = searchParams.get("token");

    if (!ssoToken) {
      setError("Token SSO no encontrado");
      return;
    }

    const authenticate = async () => {
      try {
        const response = await loginSSO(ssoToken, true);

        // Decodificar payload
        const payload = JSON.parse(
          atob(response.access_token.split(".")[1])
        );

        localStorage.setItem("userData", JSON.stringify(payload));

        // Mantener EXACTAMENTE el mismo flujo de permisos
        loginSuccess(response.access_token, () => {
          if (payload.first_login_complete) {
            router.replace("/home");
          } else {
            router.replace("/editUser");
          }
        });
      } catch (err) {
        console.error("Error SSO:", err);
        setError("No fue posible iniciar sesión con SSO");
      }
    };

    authenticate();
  }, [router, searchParams, loginSuccess]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Iniciando sesión...</p>
    </div>
  );
};

export default SSOPage;
