"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserInfo } from '../../../../services/authService';
import UserInfo from '@/app/components/userManagement/UserInfo';

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchUser = async () => {
            try {
                setLoading(true);
                console.log('Fetching user with ID:', id);
                const response = await getUserInfo(id);
                console.log('Response:', response);

                if (response.success && response.data && response.data.length > 0) {
                    setUser(response.data[0]);
                } else {
                    setError('No se encontró el usuario');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Error al obtener el usuario: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    return (
        <div className="space-y-6 parametrization-page py-4 px-6 rounded-xl">
            <div className="flex items-center gap-4 mb-6 ">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Back to User Management
                </button>
            </div>
                <h1 className="text-3xl font-bold text-primary">User Information</h1>

            {loading && (
                <div className="card-theme rounded-lg shadow p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-secondary">Cargando información del usuario...</p>
                </div>
            )}

            {error && (
                <div className="card-theme rounded-lg p-4 border border-danger/20">
                    <p className="text-danger">{error}</p>
                </div>
            )}

            {user && <UserInfo userData={user} />}
        </div>
    );
}
