import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("🔄 Proxy: Haciendo request a API externa...");

        const response = await fetch(
            "https://api.inmero.co/sigma/main/types_categories/list/",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("📊 Proxy: Status de respuesta:", response.status);
        console.log(
            "📋 Proxy: Headers de respuesta:",
            Object.fromEntries(response.headers.entries())
        );

        if (!response.ok) {
            console.error(
                "❌ Proxy: Error en API externa:",
                response.status,
                response.statusText
            );
            return NextResponse.json(
                { error: `API Error: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("✅ Proxy: Data recibida exitosamente");
        console.log(
            "💾 Proxy: Cantidad de registros:",
            Array.isArray(data) ? data.length : "No es array"
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error("🚨 Proxy: Error completo:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch data from external API",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
