'use client';
import { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';


const MOCK_CATEGORIES = [
  {
    id: 'machinery',
    name: 'Machinery',
    permissions: [
      { id: 'machinery.view', name: 'View Machinery' },
      { id: 'machinery.create', name: 'Create Machinery' },
      { id: 'machinery.update', name: 'Update Machinery' },
      { id: 'machinery.delete', name: 'Delete Machinery' }
    ]
  },
  {
    id: 'payroll',
    name: 'Payroll',
    permissions: [
      { id: 'payroll.view', name: 'View Payroll' },
      { id: 'payroll.generate', name: 'Generate Payroll' },
      { id: 'payroll.update', name: 'Update Payroll' },
      { id: 'payroll.delete', name: 'Delete Payroll' }
    ]
  },
  {
    id: 'request',
    name: 'Request',
    permissions: [
      { id: 'request.view', name: 'View Requests' },
      { id: 'request.create', name: 'Create Request' },
      { id: 'request.update', name: 'Update Request' },
      { id: 'request.delete', name: 'Delete Request' }
    ]
  },
  {
    id: 'ai',
    name: 'Ai',
    permissions: [
      { id: 'ai.view', name: 'View Ai' },
      { id: 'ai.run', name: 'Run Models' },
      { id: 'ai.train', name: 'Train Models' },
      { id: 'ai.delete', name: 'Delete Models' }
    ]
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    permissions: [
      { id: 'monitoring.view', name: 'View Monitoring' },
      { id: 'monitoring.alerts', name: 'Manage Alerts' },
      { id: 'monitoring.update', name: 'Update Monitoring' },
      { id: 'monitoring.delete', name: 'Delete Monitoring' }
    ]
  },
  {
    id: 'parameterization',
    name: 'Parameterization',
    permissions: [
      { id: 'parameterization.view', name: 'View Parameters' },
      { id: 'parameterization.create', name: 'Create Parameter' },
      { id: 'parameterization.update', name: 'Update Parameter' },
      { id: 'parameterization.delete', name: 'Delete Parameter' }
    ]
  },
  {
    id: 'user-management',
    name: 'User Management',
    permissions: [
      { id: 'users.view', name: 'View Users' },
      { id: 'users.create', name: 'Create User' },
      { id: 'users.update', name: 'Update User' },
      { id: 'users.delete', name: 'Delete User' }
    ]
  }
];

const MOCK_ROLE = {
  id: 'role-123',
  name: 'Administrator',
  description: 'Este placeholder brevemente explica el rol.',
  permissions: [
    'machinery.view',
    'payroll.view',
    'request.view',
    'ai.view',
    'monitoring.view',
    'parameterization.view',
    'users.view'
  ]
};

// ===== Component =====
export default function UpdateRolePage() {
  // Podrías leer searchParams para roleId si decides cambiar la ruta.
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(new Set()); // permisos activos globales
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado para el sidebar
  const MAX_NAME = 50;
  const MAX_DESC = 200;

  // Carga inicial (simulación)
  useEffect(() => {
    // TODO: Reemplazar por fetch real
    setCategories(MOCK_CATEGORIES);
    setRoleName(MOCK_ROLE.name);
    setRoleDescription(MOCK_ROLE.description);
    setSelectedPermissions(new Set(MOCK_ROLE.permissions));
    setSelectedCategoryId(MOCK_CATEGORIES[0].id);
    setLoading(false);
  }, []);

  const currentCategory = useMemo(
    () => categories.find(c => c.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const handleTogglePermission = (permId) => {
    setSelectedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId); else next.add(permId);
      return next;
    });
  };

  const activeCountForCategory = (cat) => {
    return cat.permissions.reduce(
      (acc, p) => acc + (selectedPermissions.has(p.id) ? 1 : 0),
      0
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!roleName.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (roleName.trim().length > MAX_NAME)
      newErrors.name = `Máximo ${MAX_NAME} caracteres.`;
    if (roleDescription.trim().length > MAX_DESC)
      newErrors.description = `Máximo ${MAX_DESC} caracteres.`;
    if (selectedPermissions.size === 0)
      newErrors.permissions = 'Debes asignar al menos un permiso.';
    // Validar permisos inexistentes
    const allPermissionIds = categories.flatMap(c => c.permissions.map(p => p.id));
    for (const pid of selectedPermissions) {
      if (!allPermissionIds.includes(pid)) {
        newErrors.permissions = 'Se ha seleccionado un permiso inexistente.';
        break;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // TODO: PUT /api/roles/:id
      // await fetch(`/api/roles/${MOCK_ROLE.id}`, { method:'PUT', body: JSON.stringify({...}) })
      console.log('Payload', {
        id: MOCK_ROLE.id,
        name: roleName.trim(),
        description: roleDescription.trim(),
        permissions: Array.from(selectedPermissions)
      });
      // Mostrar feedback (toast/snackbar) según tu sistema
      alert('Rol actualizado (mock).');
    } catch (e) {
      setErrors(prev => ({ ...prev, global: 'Error al actualizar el rol.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCategory = () => {
    if (!currentCategory) return;
    // Restaura sólo la categoría actual a estado "sin selecciones"
    const next = new Set(selectedPermissions);
    currentCategory.permissions.forEach(p => next.delete(p.id));
    setSelectedPermissions(next);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-gray-500">Cargando...</div>;
  }

  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 overflow-y-auto ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Breadcrumb */}
        <div className="px-6 py-3 text-xs text-neutral-500 bg-white border-b border-neutral-200">users / edit-role</div>

        {/* Header */}
        <header className="px-8 pt-6 pb-2 flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-neutral-600 hover:text-neutral-800 text-xl leading-none"
            aria-label="Volver"
          >
            ←
          </button>
            <h1 className="text-3xl font-semibold text-neutral-900">Edit Role</h1>
        </header>

        {/* Main card */}
        <main className="p-8 pt-4">
          <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-7">
                {/* Role Name */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-neutral-700">Role Name</label>
                  <input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    maxLength={MAX_NAME}
                    placeholder="Administrator"
                    className="w-full h-11 rounded-lg border border-neutral-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-neutral-400 placeholder:opacity-70 text-neutral-900 caret-blue-600 disabled:bg-neutral-100"
                  />
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-red-500">{errors.name}</span>
                    <span className="text-neutral-400">{roleName.length}/{MAX_NAME} characters</span>
                  </div>
                </div>

                {/* Category selector */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-neutral-700">Permissions categories</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full h-11 rounded-lg border border-neutral-300 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-neutral-900"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                    Select a category above to configure its specific permissions
                  </p>
                </div>

                {/* Permissions table */}
                <div className="mb-6 border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="bg-neutral-100 px-4 py-3 flex items-center justify-between border-b border-neutral-200">
                    <span className="text-sm font-medium text-neutral-700">Permission Name</span>
                    <span className="text-xs text-neutral-500">Select</span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {currentCategory?.permissions.map(perm => {
                      const checked = selectedPermissions.has(perm.id);
                      return (
                        <div key={perm.id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors">
                          <span className="text-sm text-neutral-700">{perm.name}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="h-4 w-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Current category info */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-500 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Currently configuring:</span>
                    <span className="font-medium text-blue-600">{currentCategory?.name}</span>
                  </div>
                  <span>
                    Active permissions: {activeCountForCategory(currentCategory || { permissions: [] })} of {currentCategory?.permissions.length || 0}
                  </span>
                </div>

                {/* Left column buttons + errors */}
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleResetCategory}
                    className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => validate()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
                {(errors.permissions || errors.global) && (
                  <div className="space-y-1 mb-2">
                    {errors.permissions && <p className="text-xs text-red-500">{errors.permissions}</p>}
                    {errors.global && <p className="text-xs text-red-500">{errors.global}</p>}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-5 space-y-6">
                {/* Role Description */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-neutral-700">Role Description</label>
                  <textarea
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    maxLength={MAX_DESC}
                    rows={7}
                    placeholder="This placeholder briefly explains the role's purpose, main duties, and impact. It provides context and can be customized with specific tasks, skills, and goals."
                    className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-neutral-400 placeholder:opacity-70 text-neutral-900 caret-blue-600"
                  />
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-red-500">{errors.description}</span>
                    <span className="text-neutral-400">{roleDescription.length}/{MAX_DESC} characters</span>
                  </div>
                </div>

                {/* Module cards 2 + 2 + 2 + 1 centered */}
                <div className="space-y-4">
                  {/* row 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    {categories.slice(0,2).map(cat => {
                      const active = activeCountForCategory(cat); const total = cat.permissions.length; const sel = cat.id === selectedCategoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`p-4 rounded-lg border text-left transition ${sel ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                            <span className={`w-2 h-2 rounded-full ${active>0 ? 'bg-blue-600' : 'bg-neutral-300'}`}></span>
                          </div>
                          <p className="text-xs text-neutral-500">{active}/{total} active</p>
                        </button>
                      );
                    })}
                  </div>
                  {/* row 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    {categories.slice(2,4).map(cat => {
                      const active = activeCountForCategory(cat); const total = cat.permissions.length; const sel = cat.id === selectedCategoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`p-4 rounded-lg border text-left transition ${sel ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                            <span className={`w-2 h-2 rounded-full ${active>0 ? 'bg-blue-600' : 'bg-neutral-300'}`}></span>
                          </div>
                          <p className="text-xs text-neutral-500">{active}/{total} active</p>
                        </button>
                      );
                    })}
                  </div>
                  {/* row 3 */}
                  <div className="grid grid-cols-2 gap-4">
                    {categories.slice(4,6).map(cat => {
                      const active = activeCountForCategory(cat); const total = cat.permissions.length; const sel = cat.id === selectedCategoryId;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`p-4 rounded-lg border text-left transition ${sel ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                            <span className={`w-2 h-2 rounded-full ${active>0 ? 'bg-blue-600' : 'bg-neutral-300'}`}></span>
                          </div>
                          <p className="text-xs text-neutral-500">{active}/{total} active</p>
                        </button>
                      );
                    })}
                  </div>
                  {/* row 4 single centered */}
                  {categories.slice(6,7).map(cat => {
                    const active = activeCountForCategory(cat); const total = cat.permissions.length; const sel = cat.id === selectedCategoryId;
                    return (
                      <div key={cat.id} className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`p-4 rounded-lg border text-left w-48 transition ${sel ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                            <span className={`w-2 h-2 rounded-full ${active>0 ? 'bg-blue-600' : 'bg-neutral-300'}`}></span>
                          </div>
                          <p className="text-xs text-neutral-500">{active}/{total} active</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom global buttons */}
            <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-8 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="px-8 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}