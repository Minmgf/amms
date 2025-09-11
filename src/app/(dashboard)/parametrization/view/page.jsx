'use client'
import React, { useEffect, useState } from 'react'

const PageSimple = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const testApiDirect = async () => {
        setLoading(true)
        setError(null)

        const url = 'http://localhost:3000/sigma/api/types_categories/list/'

        console.log('🔍 Test directo al API route...')
        console.log('📍 URL:', url)
        console.log('🌐 Location origen:', window.location.origin)
        console.log('📄 Location pathname:', window.location.pathname)

        try {
            console.log('⏳ Haciendo fetch...')

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-cache'
            })

            console.log('📊 Response status:', response.status)
            console.log('🔗 Response URL final:', response.url)
            console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()))

            if (!response.ok) {
                const errorText = await response.text()
                console.log('❌ Error response text:', errorText)
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const result = await response.json()
            console.log('✅ Datos recibidos:', result)
            console.log('🔢 Cantidad:', Array.isArray(result) ? result.length : 'No es array')

            setData(result)

        } catch (err) {
            console.error('🚨 Error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        testApiDirect()
    }, [])

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🔧 Test Simple del API Route</h1>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={testApiDirect}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                    }}
                >
                    {loading ? '⏳ Cargando...' : '🔄 Probar API Route'}
                </button>
            </div>

            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <h3>📊 Estado:</h3>
                <p><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</p>
                <p><strong>Error:</strong> {error || 'Ninguno'}</p>
                <p><strong>Data:</strong> {data ? 'Recibida ✅' : 'No recibida ❌'}</p>
                <p><strong>URL objetivo:</strong> <code>http://localhost:3000/sigma/api/types_categories/list/</code></p>
            </div>

            {error && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    <h3>❌ Error:</h3>
                    <p>{error}</p>
                    <p><small>Revisa la consola para más detalles</small></p>
                </div>
            )}

            {data && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    borderRadius: '6px'
                }}>
                    <h3>✅ Datos recibidos:</h3>
                    <pre style={{
                        backgroundColor: '#f8f9fa',
                        padding: '12px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '400px',
                        fontSize: '12px',
                        color: '#333'
                    }}>
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
                <h4>🔍 Instrucciones de Debug:</h4>
                <ol>
                    <li>Abre <strong>DevTools</strong> (F12)</li>
                    <li>Ve a la pestaña <strong>Console</strong></li>
                    <li>Ve a la pestaña <strong>Network</strong></li>
                    <li>Haz clic en el botón "Probar API Route"</li>
                    <li>Observa qué URL se está llamando realmente</li>
                </ol>
            </div>
        </div>
    )
}

export default PageSimple
