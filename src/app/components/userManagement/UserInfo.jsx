import React from 'react'

// Helper local para formatear fecha a D/M/YYYY
const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return 'No disponible';
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

const Badge = ({ text, colorClass = 'bg-pink-100 text-pink-700' }) => (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        {text}
    </span>
);

const UserInfo = ({ userData }) => {
    if (!userData) return null;

    const fullName = `${userData.name || ''} ${userData.first_last_name || ''} ${userData.second_last_name || ''}`.trim();

    return (
        <div className="w-full p-6">
            <div className="border-2 border-blue-400 rounded-lg p-6 bg-white">
                <div className="flex gap-6">
                    {/* Left column: avatar and badges */}
                    <div className="w-1/4 flex flex-col items-center gap-4">
                        <div className="w-28 h-28 rounded-full bg-gray-200" />
                        <div className="text-center">
                            <div className="text-lg font-semibold">{fullName || 'No disponible'}</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Badge text={userData.status_name || 'Unknown'} colorClass={userData.status_name === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} />
                            <div className="space-y-2 mt-2">
                                {(userData.roles || []).map((r, i) => {
                                    const roleText = typeof r === 'string' ? r : (r.role_name || r.name || r.label || 'No disponible');
                                    return <Badge key={i} text={roleText} colorClass="bg-pink-100 text-pink-700" />;
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right column: personal & residence info */}
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-4">Personal information</h3>
                        <div className="grid grid-cols-4 gap-4 text-sm mb-6">
                            <div>
                                <div className="text-xs text-gray-500">Name</div>
                                <div className="font-medium">{userData.name || 'No disponible'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Last name</div>
                                <div className="font-medium">{userData.first_last_name || 'No disponible'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Document type</div>
                                <div className="font-medium">{userData.type_document_name || userData.type_document_id || 'No disponible'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Document number</div>
                                <div className="font-medium">{userData.document_number || 'No disponible'}</div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500">Email</div>
                                <div className="font-medium">{userData.email || 'No disponible'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Telephone number</div>
                                <div className="font-medium">{userData.phone || userData.telephone || 'No disponible'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Género</div>
                                <div className="font-medium">{userData.gender_name || 'No disponible'}</div>
                            </div>
                            <div />

                            <div>
                                <div className="text-xs text-gray-500">Birth date</div>
                                <div className="font-medium">{formatDate(userData.birthday)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Expedition date</div>
                                <div className="font-medium">{formatDate(userData.date_issuance_document)}</div>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-4">Información de Residencia</h3>
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-xs text-gray-500">Country</div>
                                    <div className="font-medium">{userData.country || 'No disponible'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Region</div>
                                    <div className="font-medium">{userData.region || 'No disponible'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">City</div>
                                    <div className="font-medium">{userData.city || 'No disponible'}</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-xs text-gray-500">Address</div>
                                <div className="font-medium">{userData.address || 'No disponible'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserInfo
