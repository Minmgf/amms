import { apiBilling } from "@/lib/axios";

// Función para obtener el token de autorización usando client credentials
export const authorization = async () => {
    const payload = {
        grant_type: "password",        
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
        username: process.env.NEXT_PUBLIC_MAIL,
        password: process.env.NEXT_PUBLIC_PASSWORD,        
    };
    const { data } = await apiBilling.post("/oauth/token", payload,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;
};

// Función para refrescar el token de autorización
export const refreshToken = async (refresh_token) => {
    const payload = {
        grant_type: "refresh_token",        
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
        refresh_token: refresh_token,        
    };
    const { data } = await apiBilling.post("/oauth2/token", payload,
        {headers: {"Content-Type": "multipart/form-data"}}
    );
    return data;    
};

// Función para obtener el listado de departamentos
export const getMunicipalities = async (token) => {
  const { data } = await apiBilling.get("/v1/municipalities", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};