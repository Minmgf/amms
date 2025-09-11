import { apiLocation } from "@/lib/axios";

// Obtener todos los países
export const getCountries = async () => {
  const { data } = await apiLocation.get("/countries");
  return data;
};

// Obtener estados por país (usa el ISO2 code del país)
export const getStates = async (countryIso2) => {
  const { data } = await apiLocation.get(`/countries/${countryIso2}/states`);
  return data;
};

// Obtener ciudades por estado (usa el ISO2 code del país y el ID del estado)
export const getCities = async (countryIso2, stateIso2) => {
  const { data } = await apiLocation.get(
    `/countries/${countryIso2}/states/${stateIso2}/cities`
  );
  return data;
};