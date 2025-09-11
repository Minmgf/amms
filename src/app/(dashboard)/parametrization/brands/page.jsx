"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiEdit3, FiBell, FiEye } from 'react-icons/fi';
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
import CategoryModal from '../../../components/parametrization/ModelListModal';
import BrandFormModal from '../../../components/parametrization/BrandFormModal';
import AddEditModelModal from '../../../components/parametrization/AddEditModelModal';
import { useTheme } from "@/contexts/ThemeContext";
import { getBrandCategories, getModelsByBrand, createBrand, getBrands, editBrand, editModel, createModel } from '@/services/parametrizationService';
import { SuccessModal, ErrorModal } from '@/app/components/shared/SuccessErrorModal';

// Componente principal
const ParameterizationView = () => {
  const { currentTheme } = useTheme();
  const [id, setId] = useState("");
  const [activeMenuItem, setActiveMenuItem] = useState('Brands');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Estados para CategoryModal (lista de brands)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryBrands, setCategoryBrands] = useState([]); // ← lista de brands por categoría


  // Estados para BrandFormModal (agregar/editar brand)
  const [isBrandFormModalOpen, setIsBrandFormModalOpen] = useState(false);
  const [brandFormMode, setBrandFormMode] = useState('add'); // 'add' o 'edit'
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Estados para AddEditModelModal (agregar/editar model)
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [modelModalMode, setModelModalMode] = useState('add');
  const [selectedModelData, setSelectedModelData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setId(parsed.id);
      } catch (err) {
        console.error("Error parsing userData", err);
      }
    }
  }, []);

  // Función para obtener datos del backend
  const fetchData = async (menuItem = 'Brands') => {
    setLoading(true);
    setError(null);

    try {
      // 🚀 GET real al backend
      const categories = await getBrandCategories();

      // Adaptar a lo que espera tu tabla
      const formattedData = categories.map(c => ({
        id: c.id_brands_categories,
        name: c.name,
        description: c.description,
      }));

      setData(formattedData);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandsByCategory = async (categoryId) => {
    if (!categoryId) return;
    try {
      const response = await getBrands(categoryId);
      const normalized = (response || []).map(b => {
        const isActive = String(b.estado).toLowerCase() === 'activo';
        return {
          id: b.id_brands,
          name: b.name,
          description: b.description,
          status: isActive ? 'Activo' : 'Inactivo', // 👈 string
          isActive, // 👈 boolean
          models: b.models || []
        };
      });
      setCategoryBrands(normalized); // actualiza el estado de la lista
    } catch (error) {
      console.error('Error fetching brands:', error);
      setCategoryBrands([]);
    }
  };

  useEffect(() => {
    fetchData(activeMenuItem);
  }, [activeMenuItem]);

  const handleMenuItemChange = (item) => {
    setActiveMenuItem(item);
  };

  const handleStatusChanged = (brandId) => {
    setCategoryBrands(prev =>
      prev.map(b =>
        b.id === brandId
          ? { ...b, isActive: !b.isActive, status: !b.isActive ? "Activo" : "Inactivo" }
          : b
      )
    );
  };

  // ==================== HANDLERS PARA CategoryModal ====================

  // Abrir CategoryModal (cuando se hace click en el ojo de la tabla principal)
  const handleViewDetails = (categoryId) => {
    const category = data.find(item => item.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsCategoryModalOpen(true); // solo abrir el modal
      fetchBrandsByCategory(category.id); // 🚀 traer marcas al abrir moda
    }
  };

  // Cerrar CategoryModal
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  // ==================== HANDLERS PARA BrandFormModal ====================

  // Abrir BrandFormModal en modo ADD (desde botón "Add Brand" del CategoryModal)
  const handleAddBrand = () => {
    setBrandFormMode('add');
    setSelectedBrand({
      brandName: '',
      description: '',
      models: [] // 👈 inicializar vacío
    });
    setIsBrandFormModalOpen(true);
  };

  // Abrir BrandFormModal en modo EDIT (desde botón "Edit" de la tabla del CategoryModal)
  const handleEditBrand = async (brand) => {
    try {
      const models = await getModelsByBrand(brand.id);

      const normalizedModels = (models || []).map(m => ({
        id_model: m.id_model,
        modelName: m.name,      // <-- mapear 'name' → 'modelName'
        description: m.description,
        isActive: m.estado === 'Activo'
      }));

      const brandToEdit = {
        id: brand.id,
        brandName: brand.name,
        description: brand.description,
        isActive: brand.isActive,
        models: normalizedModels,
      };

      setSelectedBrand(brandToEdit);
      setBrandFormMode('edit');
      setIsBrandFormModalOpen(true);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  // Cerrar BrandFormModal
  const handleCloseBrandFormModal = () => {
    setIsBrandFormModalOpen(false);
    setSelectedBrand(null);
    setBrandFormMode('add');
  };

  // Guardar nuevo brand
  const handleSaveBrand = async (brandData) => {
    try {
      const payload = {
        name: brandData.brandName,
        description: brandData.description,
        brands_category: selectedCategory.id,
        responsible_user: id,
        models: (brandData.models || []).map(m => ({
          name: m.modelName,
          description: m.description
        }))
      };

      const response = await createBrand(payload); // llamamos a tu servicio
      setModalMessage(response.message || "Marca creada exitosamente");
      setSuccessOpen(true);
      fetchBrandsByCategory(selectedCategory.id);
      handleCloseBrandFormModal(); // cerrar modal
      fetchData(activeMenuItem); // refrescar lista

    } catch (error) {
      setModalMessage(error.response.data.detail || "Error al crear la marca");
      setErrorOpen(true);
    }
  };

  // Actualizar brand existente
  const handleUpdateBrand = async (brandData) => {
    try {

      const payload = {
        name: brandData.brandName,
        description: brandData.description,
        responsible_user: id, // si el backend lo pide fijo, cámbialo según tu lógica
      };

      // Llamada PUT
      const response = await editBrand(payload, brandData.id);
      setModalMessage(response.mmessage || "Marca actualizada exitosamente");
      setSuccessOpen(true);

      // Refrescar lista de marcas (si tienes fetchBrands o similar)
      await fetchBrandsByCategory(selectedCategory.id);

      // Cerrar modal
      handleCloseBrandFormModal();
    } catch (error) {
      setModalMessage(error.response.data.detail || "Error al actualizar la marca");
      setErrorOpen(true);
    }
  };

  // ==================== HANDLERS PARA AddEditModelModal ====================

  // Abrir AddEditModelModal en modo ADD (desde botón "Add model" del BrandFormModal)
  const handleAddModel = () => {
    setModelModalMode('add');
    setSelectedModelData(null);
    setIsModelModalOpen(true);
  };

  // Abrir AddEditModelModal en modo EDIT (desde botón "Edit" de la tabla del BrandFormModal)
  const handleEditModel = (modelId) => {
    // Buscar el modelo en los datos del brand seleccionado
    const model = selectedBrand?.models?.find(m => m.id_model === modelId);
    if (model) {
      setModelModalMode('edit');
      setSelectedModelData(model);
      setIsModelModalOpen(true);
    }
  };

  // Cerrar AddEditModelModal
  const handleModelModalClose = () => {
    setIsModelModalOpen(false);
    setSelectedModelData(null);
    setModelModalMode('add');
  };

  // Guardar nuevo model
  const handleModelSave = async (modelData) => {
    try {
      if (brandFormMode === "add") {
        // 🚀 Caso: creando una nueva marca (todavía no existe en backend)
        // Guardamos el modelo solo localmente
        setSelectedBrand(prev => ({
          ...prev, // 👈 preserva brandName, description, etc.
          models: [
            ...(prev?.models || []),
            {
              id_model: modelData.id_model,
              modelName: modelData.modelName,
              description: modelData.description,
            }
          ]
        }));
      } else if (brandFormMode === "edit") {
        // 🚀 Caso: editando marca existente → modelo debe ir al backend
        if (!selectedBrand?.id) {
          console.error("No se puede crear modelo: falta brandId");
          return;
        }

        const payload = {
          name: modelData.modelName,
          description: modelData.description,
          estado: modelData.isActive ? "Activo" : "Inactivo",
          responsible_user: id,
          brand: selectedBrand.id, // 👈 necesario
        };

        const response =await createModel(payload);
        setModalMessage(response.message || "Modelo creado exitosamente");
        setSuccessOpen(true);
        // Refrescamos modelos desde el backend
        const refreshedModels = await getModelsByBrand(selectedBrand.id);
        const normalizedModels = (refreshedModels || []).map(m => ({
          id_model: m.id_model,
          modelName: m.name,
          description: m.description,
          isActive: m.estado === "Activo",
        }));

        setSelectedBrand(prev => ({
          ...prev,
          models: normalizedModels,
        }));
      }

      handleModelModalClose();
    } catch (error) {
      setModalMessage(error.response.data.detail || "Error al crear marca");
      setErrorOpen(true);
    }
  };

  // Actualizar model existente
  const handleModelUpdate = async (modelData) => {
    try {
      if (brandFormMode === "add") {
        // 🚀 Caso: creando una marca nueva → actualizar localmente
        setSelectedBrand(prev => {
          const updatedModels = (prev?.models || []).map(m =>
            m.id_model === modelData.id_model ? { ...m, ...modelData } : m
          );
          return {
            ...prev,
            models: updatedModels,
          };
        });
      } else if (brandFormMode === "edit") {
        // 🚀 Caso: editando marca existente → actualizar en backend
        const response = await editModel(
          {
            name: modelData.modelName,
            description: modelData.description,
            responsible_user: id,
          },
          modelData.id
        );
        setModalMessage(response.message || "Modelo editado exitosamente");
        setSuccessOpen(true);

        // Refrescar desde backend
        const refreshedModels = await getModelsByBrand(selectedBrand.id);
        const normalizedModels = (refreshedModels || []).map(m => ({
          id_model: m.id_model,
          modelName: m.name,
          description: m.description,
          isActive: m.estado === "Activo",
        }));

        setSelectedBrand(prev => ({
          ...prev,
          models: normalizedModels,
        }));

        await fetchBrandsByCategory(selectedCategory.id);
      }

      handleModelModalClose();
    } catch (error) {
      setModalMessage(error.response.data.detail || "Ocurrio un error al editar el modelo");
      setErrorOpen(true);
    }
  };


  // ==================== TABLA PRINCIPAL ====================

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Category name',
        cell: info => (
          <div className="font-medium text-primary">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: info => (
          <div className="text-secondary">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('id', {
        header: 'Details',
        cell: info => (
          <button
            onClick={() => handleViewDetails(info.getValue())}
            className="parametrization-action-button p-2 transition-colors opacity-0 group-hover:opacity-100"
            title="View details"
          >
            <FiEye className="w-4 h-4" />
          </button>
        ),
      }),
    ],
    [handleViewDetails]
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
    <div className="parametrization-page p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h1 className="parametrization-header text-2xl md:text-3xl font-bold">Parameterization</h1>
        </div>

        {/* Filter Section */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <button className="parametrization-filter-button flex items-center space-x-2 px-3 md:px-4 py-2 transition-colors w-fit">
            <FiFilter className="filter-icon w-4 h-4" />
            <span className="text-sm">Filter by</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="mb-6 md:mb-8">
          <NavigationMenu
            activeItem={activeMenuItem}
            onItemClick={handleMenuItemChange}
          />
        </div>

        {/* Table */}
        <div className="parametrization-table mb-6 md:mb-8">
          {loading ? (
            <div className="parametrization-loading p-8 text-center">Loading...</div>
          ) : error ? (
            <div className="parametrization-error p-8 text-center">Error: {error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="parametrization-table-header">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className="parametrization-table-cell px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold last:border-r-0"
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
                  <tbody className="">
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="parametrization-table-row group">
                        {row.getVisibleCells().map(cell => (
                          <td
                            key={cell.id}
                            className="parametrization-table-cell px-4 md:px-6 py-3 md:py-4 text-sm last:border-r-0"
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
              <div className="parametrization-pagination px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="parametrization-pagination-button relative inline-flex items-center px-4 py-2 text-sm font-medium"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="parametrization-pagination-button ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium"
                    >
                      Next →
                    </button>
                  </div>

                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors"
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
                              className="parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors"
                            >
                              1
                            </button>
                          );
                        }

                        if (currentPage > 4) {
                          pages.push(
                            <span key="ellipsis1" className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm">
                              ...
                            </span>
                          );
                        }

                        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => table.setPageIndex(i - 1)}
                              className={`parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors ${i === currentPage
                                ? 'active'
                                : ''
                                }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        if (currentPage < totalPages - 3) {
                          pages.push(
                            <span key="ellipsis2" className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm">
                              ...
                            </span>
                          );
                        }

                        if (currentPage < totalPages - 2) {
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => table.setPageIndex(totalPages - 1)}
                              className="parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors"
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
                        className="parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors"
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
                      className="parametrization-pagination-select px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* CategoryModal - Modal de lista de brands */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        categoryId={selectedCategory?.id}       // 👈 pásale el id
        categoryName={selectedCategory?.name}   // 👈 pásale el nombre
        data={categoryBrands} // Aquí pasarías la lista de brands de la categoría seleccionada
        onAddItem={handleAddBrand} // Se ejecuta cuando se presiona "Add Brand"
        onEditItem={handleEditBrand} // Se ejecuta cuando se presiona "Edit" en la tabla
        refreshBrands={() => fetchBrandsByCategory(selectedCategory?.id)}
      />

      {/* BrandFormModal - Modal para agregar/editar brand */}
      <BrandFormModal
        isOpen={isBrandFormModalOpen}
        onClose={handleCloseBrandFormModal}
        mode={brandFormMode} // 'add' o 'edit'
        categoryName={selectedCategory?.name || ''}
        brandData={selectedBrand} // Datos del brand en modo edición
        onSave={handleSaveBrand} // Se ejecuta al guardar nuevo brand
        onUpdate={handleUpdateBrand} // Se ejecuta al actualizar brand existente
        onAddModel={handleAddModel} // Se ejecuta cuando se presiona "Add model"
        onEditModel={handleEditModel} // Se ejecuta cuando se presiona "Edit" en la tabla de modelos
        onStatusChanged={handleStatusChanged}
      />

      {/* AddEditModelModal - Modal para agregar/editar model */}
      <AddEditModelModal
        isOpen={isModelModalOpen}
        onClose={handleModelModalClose}
        mode={modelModalMode} // 'add' o 'edit'
        brandName={selectedBrand?.brandName || ''}
        brandModels={selectedBrand?.models || []}
        modelData={selectedModelData} // Datos del model en modo edición
        onSave={handleModelSave} // Se ejecuta al guardar nuevo model
        onUpdate={handleModelUpdate} // Se ejecuta al actualizar model existente
      />

      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Success"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </div>
  );
};

export default ParameterizationView;