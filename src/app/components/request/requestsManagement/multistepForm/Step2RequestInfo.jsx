import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FiEdit2, FiTrash2, FiCheck } from "react-icons/fi";
import { getActiveMachineries, getActiveTechnicians, getActiveCurrencyUnits } from "@/services/maintenanceService";

export default function Step2RequestInfo({ mode }) {
  const { register, formState: { errors }, watch } = useFormContext();

  // Estado para moneda
  const [currencies, setCurrencies] = useState([]);

  // Estado para maquinaria y operador seleccionados
  const [machineryOptions, setMachineryOptions] = useState([]);
  const [operatorOptions, setOperatorOptions] = useState([]);
  const [selectedMachinery, setSelectedMachinery] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [machineryList, setMachineryList] = useState([]);
  const [editIdx, setEditIdx] = useState(null);

  // Cargar opciones reales al montar
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const machineries = await getActiveMachineries();
        const operators = await getActiveTechnicians();
        const currencyUnits = await getActiveCurrencyUnits();
        setMachineryOptions(machineries.data || []);
        setOperatorOptions(operators || []);
        const currencyArray = Array.isArray(currencyUnits.data) ? currencyUnits.data : [];
        setCurrencies(currencyArray);
      } catch (error) {
      }
    };
    fetchOptions();
  }, []);

  // Añadir maquinaria y operador a la lista temporal
  const handleAddMachinery = () => {
    if (!selectedMachinery || !selectedOperator) return;
    const machineryObj = machineryOptions.find(m => String(m.id_machinery) === String(selectedMachinery));
    const operatorObj = operatorOptions.find(o => String(o.id) === String(selectedOperator));
    if (!machineryObj || !operatorObj) return; // Evita agregar si no existe
    setMachineryList([
      ...machineryList,
      {
        machinery: machineryObj,
        operator: operatorObj,
      }
    ]);
    setSelectedMachinery("");
    setSelectedOperator("");
  };

  // Eliminar de la lista temporal
  const handleDelete = (idx) => {
    setMachineryList(machineryList.filter((_, i) => i !== idx));
  };

  // Editar maquinaria y operador en la lista temporal
  const handleEdit = (idx) => {
    const item = machineryList[idx];
    setSelectedMachinery(item.machinery?.id_machinery || "");
    setSelectedOperator(item.operator?.id || "");
    setEditIdx(idx);
  };

  // Guardar edición
  const handleSaveEdit = () => {
    if (!selectedMachinery || !selectedOperator || editIdx === null) return;
    const machineryObj = machineryOptions.find(m => String(m.id_machinery) === String(selectedMachinery));
    const operatorObj = operatorOptions.find(o => String(o.id) === String(selectedOperator));
    if (!machineryObj || !operatorObj) return;
    const updatedList = machineryList.map((item, idx) =>
      idx === editIdx
        ? { machinery: machineryObj, operator: operatorObj }
        : item
    );
    setMachineryList(updatedList);
    setSelectedMachinery("");
    setSelectedOperator("");
    setEditIdx(null);
  };

  return (
    <div>
      <h3 className="text-theme-lg font-theme-semibold mb-theme-md text-primary">
        Información de la Solicitud
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-theme-sm text-secondary mb-1">Detalles de la solicitud</label>
          <textarea
            {...register("requestDetails",{
              required: "Este campo es obligatorio",
            })}
            className="parametrization-input"
            placeholder="Describa la solicitud..."
            aria-label="Detalles de la solicitud"
            rows={3}
            maxLength={500}
          />
          <span className="text-theme-xs text-secondary mt-1 block">
            {watch("requestDetails")?.length || 0}/500 caracteres
          </span>
          {errors.requestDetails && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.requestDetails.message}
            </span>
          )}
        </div>
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Fecha de inicio programada</label>
          <input
            type="date"
            {...register("scheduledStartDate",{
              required: "Este campo es obligatorio",
            })}
            className="parametrization-input"
            aria-label="Fecha de inicio programada"
          />
          {errors.scheduledStartDate && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.scheduledStartDate.message}
            </span>
          )}
        </div>
        <div>
          <label className="block text-theme-sm text-secondary mb-1">Fecha de finalización</label>
          <input
            type="date"
            {...register("endDate",{
              required: "Este campo es obligatorio",
            })}
            className="parametrization-input"
            aria-label="Fecha de finalización"
          />
          {errors.endDate && (
            <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
              {errors.endDate.message}
            </span>
          )}
        </div>
        {mode !== "preregister" && (
          <>
            <div>
              <label className="block text-theme-sm text-secondary mb-1">Método de pago</label>
              <select
                {...register("paymentMethod")}
                className="parametrization-input"
                aria-label="Método de pago"
              >
                <option value="">Seleccione...</option>
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
              {errors.paymentMethod && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.paymentMethod.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-theme-sm text-secondary mb-1">Estado de pago</label>
              <select
                {...register("paymentStatus")}
                className="parametrization-input"
                aria-label="Estado de pago"
              >
                <option value="">Seleccione...</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
              </select>
              {errors.paymentStatus && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.paymentStatus.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-theme-sm text-secondary mb-1">Monto pagado</label>
              <div className="flex gap-2">
                <select
                  {...register("amountPaidCurrency")}
                  className="parametrization-input"
                  aria-label="Moneda pagado"
                >
                  <option value="">Seleccione moneda...</option>
                  {currencies.map(cur => (
                    <option key={cur.symbol} value={cur.symbol}>{cur.symbol}</option>
                  ))}
                </select>
                <input
                  type="number"
                  {...register("amountPaid")}
                  className="parametrization-input"
                  placeholder="Ej: 100000"
                  aria-label="Monto pagado"
                />                
              </div>
              {errors.amountPaid && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.amountPaid.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-theme-sm text-secondary mb-1">Monto por pagar</label>
              <div className="flex gap-2">
                <select
                  {...register("amountToBePaidCurrency")}
                  className="parametrization-input"
                  aria-label="Moneda por pagar"
                >
                  <option value="">Seleccione moneda...</option>
                  {currencies.map(cur => (
                    <option key={cur.symbol} value={cur.symbol}>{cur.symbol}</option>
                  ))}
                </select>
                <input
                  type="number"
                  {...register("amountToBePaid")}
                  className="parametrization-input"
                  placeholder="Ej: 50000"
                  aria-label="Monto por pagar"
                />                
              </div>
              {errors.amountToBePaid && (
                <span className="text-theme-xs mt-1 block" style={{ color: 'var(--color-error)' }}>
                  {errors.amountToBePaid.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-theme-sm text-secondary mb-1">Maquinaria disponible</label>
              <div className="flex gap-2">
                <select
                  value={selectedMachinery}
                  onChange={e => setSelectedMachinery(e.target.value)}
                  className="parametrization-input flex-1"
                  aria-label="Maquinaria disponible"
                >
                  <option value="">Seleccione...</option>
                  {machineryOptions.map(m => (
                    <option key={m.id_machinery} value={m.id_machinery}>
                      {m.machinery_name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedOperator}
                  onChange={e => setSelectedOperator(e.target.value)}
                  className="parametrization-input flex-1"
                  aria-label="Operador disponible"
                >
                  <option value="">Seleccione operador...</option>
                  {operatorOptions.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                {editIdx === null ? (
                  <button
                    type="button"
                    className="btn-theme btn-primary px-4"
                    onClick={handleAddMachinery}
                    disabled={!selectedMachinery || !selectedOperator}
                  >
                    Añadir
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-theme btn-success px-4"
                    onClick={handleSaveEdit}
                    disabled={!selectedMachinery || !selectedOperator}
                  >
                    <FiCheck className="inline mr-1" /> Guardar
                  </button>
                )}
              </div>
            </div>
            {/* Lista temporal de maquinaria y operador */}
            {machineryList.length > 0 && (
              <div className="col-span-1 sm:col-span-2 mt-4">
                <table className="w-full text-theme-sm">
                  <thead>
                    <tr className="bg-surface">
                      <th className="py-2 px-2 text-left">Machine</th>
                      <th className="py-2 px-2 text-left">Serial Number</th>
                      <th className="py-2 px-2 text-left">Operator</th>
                      <th className="py-2 px-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machineryList.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-2">{item.machinery?.machinery_name || "-"}</td>
                        <td className="py-2 px-2">{item.machinery?.serial_number || "-"}</td>
                        <td className="py-2 px-2">{item.operator?.name || "-"}</td>
                        <td className="py-2 px-2">
                          <button
                            type="button"
                            className="btn-theme btn-secondary mr-2"
                            onClick={() => handleEdit(idx)}
                            disabled={editIdx !== null}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            className="btn-theme btn-error"
                            onClick={() => handleDelete(idx)}
                            disabled={editIdx !== null}
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}