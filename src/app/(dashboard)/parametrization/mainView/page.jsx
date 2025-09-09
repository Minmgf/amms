"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiEdit3, FiBell, FiEye, FiPlus } from 'react-icons/fi';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import NavigationMenu from '../../../components/ParameterNavigation';
import TypesModal from '../../../components/parametrization/TypesModal';
import AddModifyTypesModal from '../../../components/parametrization/AddModifyTypesModal';
import UnitListModal from '../../../components/parametrization/UnitListModal';
import AddModifyUnitModal from '../../../components/parametrization/AddModifyUnitModal';
import { 
  getTypesCategories, 
  getTypesByCategory, 
  createTypeItem, 
  updateTypeItem 
} from "@/services/parametrizationService";

// Función para obtener categorías de unidades
const getUnitsCategories = async () => {
  try {
    const response = await fetch('http://localhost:8000/units_categories/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching units categories:', error);
    throw error;
  }
};

// Función para crear nueva categoría de unidades
const createUnitCategory = async (categoryData) => {
  try {
    const response = await fetch('http://localhost:8000/units_categories/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating unit category:', error);
    throw error;
  }
};

// Función para actualizar categoría de unidades
const updateUnitCategory = async (categoryId, categoryData) => {
  try {
    const response = await fetch(`http://localhost:8000/units_categories/${categoryId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating unit category:', error);
    throw error;
  }
};

// Función para obtener categoría de unidades por ID
const getUnitCategoryById = async (categoryId) => {
  try {
    const response = await fetch(`http://localhost:8000/units_categories/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching unit category by ID:', error);
    throw error;
  }
};

// Componente principal
const ParameterizationView = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Types');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Estados para TypesModal (lista de types por categoría)
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [typesData, setTypesData] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  
  // Estados para AddModifyTypesModal (agregar/editar type)
  const [isAddModifyTypesModalOpen, setIsAddModifyTypesModalOpen] = useState(false);
  const [typeFormMode, setTypeFormMode] = useState('add');
  const [selectedType, setSelectedType] = useState(null);

  // Estados para UnitListModal
  const [isUnitListModalOpen, setIsUnitListModalOpen] = useState(false);
  const [categoryParameters, setCategoryParameters] = useState([]);

  // Estados para AddModifyUnitModal
  const [isAddModifyUnitModalOpen, setIsAddModifyUnitModalOpen] = useState(false);
  const [unitModalMode, setUnitModalMode] = useState("add");
  const [selectedParameter, setSelectedParameter] = useState(null);

  // Función para obtener categorías del backend
  const fetchData = async (menuItem = 'Types') => {
    setLoading(true);
    setError(null);
    
    console.log('🔄 MainView: Iniciando carga de datos...');
    console.log('🎯 MainView: Menu seleccionado:', menuItem);
    
    try {
      let response;
      
      if (menuItem === 'Units') {
        console.log('📞 MainView: Llamando a getUnitsCategories...');
        response = await getUnitsCategories();
        
        console.log('✅ MainView: Respuesta recibida del servicio de unidades:');
        console.log('📊 MainView: Datos completos:', response);
        console.log('📈 MainView: Cantidad de registros:', Array.isArray(response) ? response.length : 'No es array');
        console.log('🔍 MainView: Primer elemento:', response?.[0]);
        
        // Mapear los datos del backend al formato esperado por la vista
        const mappedData = response.map((item, index) => {
          console.log(`🔄 MainView: Mapeando item ${index + 1}:`, item);
          return {
            id: item.id_units_categories,
            name: item.name,
            description: item.description,
            details: "",
            parameters: [] // Inicializar como array vacío, se cargará cuando se abra el modal
          };
        });
        
        console.log('🎨 MainView: Datos mapeados para la vista:');
        console.log('📋 MainView: mappedData:', mappedData);
        
        setData(mappedData);
        
      } else {
        // Para otros menu items como Types, usar el servicio existente
        console.log('📞 MainView: Llamando a getTypesCategories...');
        response = await getTypesCategories();
        
        console.log('✅ MainView: Respuesta recibida del servicio:');
        console.log('📊 MainView: Datos completos:', response);
        console.log('📈 MainView: Cantidad de registros:', Array.isArray(response) ? response.length : 'No es array');
        console.log('🔍 MainView: Primer elemento:', response?.[0]);
        
        // Mapear los datos del backend al formato esperado por la vista
        const mappedData = response.map((item, index) => {
          console.log(`🔄 MainView: Mapeando item ${index + 1}:`, item);
          return {
            id: item.id || item.id_types_categories,
            name: item.name,
            description: item.description,
            details: ''
          };
        });
        
        console.log('🎨 MainView: Datos mapeados para la vista:');
        console.log('📋 MainView: mappedData:', mappedData);
        
        setData(mappedData);
      }
      
      console.log('✅ MainView: Datos establecidos en el estado exitosamente');
      
    } catch (err) {
      console.error('❌ MainView: Error completo:', err);
      console.error('📨 MainView: Error response:', err.response);
      console.error('⚠️ MainView: Error message:', err.message);
      
      setError(err.message || 'Error al cargar los datos');
      setData([]);
    } finally {
      setLoading(false);
      console.log('🏁 MainView: Proceso de carga finalizado');
    }
  };

  // Función para obtener types por categoría
  const fetchTypesByCategory = async (categoryId) => {
    setLoadingTypes(true);
    try {
      console.log('📞 MainView: Obteniendo types para categoría:', categoryId);
      const response = await getTypesByCategory(categoryId);
      
      console.log('✅ MainView: Types obtenidos:', response);
      
      // Mapear los datos al formato esperado por el TypesModal
      const mappedTypes = response.map(item => ({
        id: item.id || item.id_types,
        typeName: item.name,
        description: item.description,
        status: item.isActive ? 'Active' : 'Inactive',
        isActive: item.isActive
      }));
      
      setTypesData(mappedTypes);
      console.log('🎨 MainView: Types mapeados:', mappedTypes);
      
    } catch (err) {
      console.error('❌ MainView: Error al obtener types:', err);
      setTypesData([]);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    console.log('🎬 MainView: useEffect ejecutado - activeMenuItem changed:', activeMenuItem);
    fetchData(activeMenuItem);
  }, [activeMenuItem]);

  const handleMenuItemChange = (item) => {
    console.log('🔄 MainView: Cambiando menu item de', activeMenuItem, 'a', item);
    setActiveMenuItem(item);
  };

  // ==================== HANDLERS PARA TypesModal ====================
  
  // Abrir TypesModal (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = async (categoryId) => {
    const category = data.find(item => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      
      if (activeMenuItem === 'Units') {
        // Para Units, abrir UnitListModal
        setCategoryParameters(category.parameters || []);
        setIsUnitListModalOpen(true);
      } else {
        // Para Types, abrir TypesModal
        setIsTypesModalOpen(true);
        await fetchTypesByCategory(categoryId);
      }
    }
  };

  // Cerrar TypesModal
  const handleCloseTypesModal = () => {
    setIsTypesModalOpen(false);
    setSelectedCategory(null);
    setTypesData([]);
  };

  // ==================== HANDLERS PARA UnitListModal ====================

  // Cerrar UnitListModal
  const handleCloseUnitListModal = () => {
    setIsUnitListModalOpen(false);
    setSelectedCategory(null);
    setCategoryParameters([]);
  };

  // ==================== HANDLERS PARA AddModifyTypesModal ====================
  
  // Abrir AddModifyTypesModal en modo ADD
  const handleAddType = () => {
    setTypeFormMode('add');
    setSelectedType(null);
    setIsAddModifyTypesModalOpen(true);
  };

  // Abrir AddModifyTypesModal en modo EDIT
  const handleEditType = (typeId) => {
    const typeToEdit = typesData.find(type => type.id === typeId);
    if (typeToEdit) {
      setTypeFormMode('modify');
      setSelectedType(typeToEdit);
      setIsAddModifyTypesModalOpen(true);
    }
  };

  // Cerrar AddModifyTypesModal
  const handleCloseAddModifyTypesModal = () => {
    setIsAddModifyTypesModalOpen(false);
    setSelectedType(null);
    setTypeFormMode('add');
  };

  // Guardar/Actualizar type
  const handleSaveType = async (typeData) => {
    try {
      console.log('💾 MainView: Guardando type data:', typeData);
      
      if (typeFormMode === 'add') {
        // Crear nuevo type
        const payload = {
          name: typeData.typeName,
          description: typeData.description,
          isActive: typeData.isActive,
          id_types_categories: selectedCategory.id
        };
        
        console.log('📤 MainView: Creando type con payload:', payload);
        const newType = await createTypeItem(payload);
        console.log('✅ MainView: Type creado exitosamente:', newType);
        
        // Actualizar la lista local
        const mappedNewType = {
          id: newType.id,
          typeName: newType.name,
          description: newType.description,
          status: newType.isActive ? 'Active' : 'Inactive',
          isActive: newType.isActive
        };
        
        setTypesData(prev => [...prev, mappedNewType]);
        
      } else {
        // Actualizar type existente
        const payload = {
          name: typeData.typeName,
          description: typeData.description,
          isActive: typeData.isActive
        };
        
        console.log('📤 MainView: Actualizando type ID:', selectedType.id, 'con payload:', payload);
        const updatedType = await updateTypeItem(selectedType.id, payload);
        console.log('✅ MainView: Type actualizado exitosamente:', updatedType);
        
        // Actualizar la lista local
        const mappedUpdatedType = {
          id: updatedType.id,
          typeName: updatedType.name,
          description: updatedType.description,
          status: updatedType.isActive ? 'Active' : 'Inactive',
          isActive: updatedType.isActive
        };
        
        setTypesData(prev => 
          prev.map(type => 
            type.id === selectedType.id ? mappedUpdatedType : type
          )
        );
      }
      
      // Cerrar el modal
      handleCloseAddModifyTypesModal();
      
    } catch (err) {
      console.error('❌ MainView: Error al guardar type:', err);
      // Aquí podrías mostrar un mensaje de error al usuario
      setError(`Error al ${typeFormMode === 'add' ? 'crear' : 'actualizar'} el tipo: ${err.message}`);
    }
  };

  // ==================== HANDLERS PARA AddModifyUnitModal ====================

  // Abrir AddModifyUnitModal en modo ADD
  const handleAddParameter = () => {
    setUnitModalMode("add");
    setSelectedParameter(null);
    setIsAddModifyUnitModalOpen(true);
  };

  // Abrir AddModifyUnitModal en modo EDIT
  const handleEditParameter = (parameterId) => {
    const parameter = categoryParameters.find((p) => p.id === parameterId);
    if (parameter) {
      setUnitModalMode("modify");
      setSelectedParameter(parameter);
      setIsAddModifyUnitModalOpen(true);
    }
  };

  // Cerrar AddModifyUnitModal
  const handleCloseAddModifyUnitModal = () => {
    setIsAddModifyUnitModalOpen(false);
    setSelectedParameter(null);
    setUnitModalMode("add");
  };

  // Guardar/actualizar parameter
  const handleSaveParameter = (parameterData) => {
    console.log("Saving/updating parameter:", parameterData);
    
    if (unitModalMode === "add") {
      // Agregar nuevo parámetro
      const newParameter = {
        ...parameterData,
        id: Date.now(), // ID temporal
      };
      
      const updatedParameters = [...categoryParameters, newParameter];
      setCategoryParameters(updatedParameters);
      
      // Actualizar también en los datos principales
      const updatedData = data.map(item => 
        item.id === selectedCategory.id 
          ? { ...item, parameters: updatedParameters }
          : item
      );
      setData(updatedData);
      
    } else if (unitModalMode === "modify") {
      // Actualizar parámetro existente
      const updatedParameters = categoryParameters.map(param =>
        param.id === selectedParameter.id ? { ...param, ...parameterData } : param
      );
      setCategoryParameters(updatedParameters);
      
      // Actualizar también en los datos principales
      const updatedData = data.map(item => 
        item.id === selectedCategory.id 
          ? { ...item, parameters: updatedParameters }
          : item
      );
      setData(updatedData);
    }

    // Cerrar el modal
    handleCloseAddModifyUnitModal();
  };

  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Category name',
        cell: info => (
          <div className="font-medium text-gray-900">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: info => (
          <div className="text-gray-600">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('id', {
        header: 'Details',
        cell: info => (
          <button 
            onClick={() => handleViewDetails(info.getValue())}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="View details"
          >
            <FiEye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        ),
      }),
    ],
    [data] // Cambiado la dependencia para evitar recrear innecesariamente
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Parameterization</h1>
        </div>

        {/* Filter Section */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <button className="flex items-center space-x-2 px-3 md:px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors w-fit">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Filter by</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="mb-6 md:mb-8">
          <NavigationMenu
            activeItem={activeMenuItem}
            onItemClick={handleMenuItemChange}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 md:mb-8">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className="px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-900 border-r border-gray-200 last:border-r-0"
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                {...{
                                  className: header.column.getCanSort()
                                    ? 'cursor-pointer select-none flex items-center gap-2'
                                    : '',
                                  onClick: header.column.getToggleSortingHandler(),
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{
                                  asc: ' 🔼',
                                  desc: ' 🔽',
                                }[header.column.getIsSorted()] ?? null}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-gray-50 group">
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="px-4 md:px-6 py-3 md:py-4 text-sm border-r border-gray-200 last:border-r-0"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-6 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                  
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous
                      </button>
                      
                      {(() => {
                        const currentPage = table.getState().pagination.pageIndex + 1;
                        const totalPages = table.getPageCount();
                        const pages = [];
                        
                        if (currentPage > 3) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => table.setPageIndex(0)}
                              className="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              1
                            </button>
                          );
                        }
                        
                        if (currentPage > 4) {
                          pages.push(
                            <span key="ellipsis1" className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400">
                              ...
                            </span>
                          );
                        }
                        
                        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => table.setPageIndex(i - 1)}
                              className={`inline-flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-colors ${
                                i === currentPage
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        if (currentPage < totalPages - 3) {
                          pages.push(
                            <span key="ellipsis2" className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400">
                              ...
                            </span>
                          );
                        }
                        
                        if (currentPage < totalPages - 2) {
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => table.setPageIndex(totalPages - 1)}
                              className="inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              {totalPages}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                      
                      <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    <select
                      value={table.getState().pagination.pageSize}
                      onChange={e => {
                        table.setPageSize(Number(e.target.value))
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                          {pageSize} per page
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* TypesModal - Modal de lista de types por categoría */}
      <TypesModal
        isOpen={isTypesModalOpen}
        onClose={handleCloseTypesModal}
        categoryName={selectedCategory?.name || ''}
        data={typesData}
        loading={loadingTypes}
        onAddItem={handleAddType}
        onEditItem={handleEditType}
      />

      {/* AddModifyTypesModal - Modal para agregar/editar types */}
      <AddModifyTypesModal
        isOpen={isAddModifyTypesModalOpen}
        onClose={handleCloseAddModifyTypesModal}
        mode={typeFormMode}
        status={selectedType}
        category={selectedCategory?.name || ''}
        onSave={handleSaveType}
      />

      {/* UnitListModal - Modal de lista de parámetros */}
      <UnitListModal
        isOpen={isUnitListModalOpen}
        onClose={handleCloseUnitListModal}
        categoryName={selectedCategory?.name || ""}
        data={categoryParameters}
        onAddParameter={handleAddParameter}
        onEditParameter={handleEditParameter}
      />

      {/* AddModifyUnitModal - Modal para agregar/editar parámetros */}
      <AddModifyUnitModal
        isOpen={isAddModifyUnitModalOpen}
        onClose={handleCloseAddModifyUnitModal}
        mode={unitModalMode}
        unit={selectedParameter}
        category={selectedCategory?.name || ""}
        onSave={handleSaveParameter}
      />
    </div>
  );
};

export default ParameterizationView;