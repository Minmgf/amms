import React, { useEffect, useState } from "react";
import { ErrorModal, SuccessModal } from "../../shared/SuccessErrorModal";
import { FiX } from "react-icons/fi";
import { getPaymentMethods } from "@/services/requestService";
import { payPayroll } from "@/services/payrollService";

const PayrollPayModal = ({ isOpen, onClose, payrollId }) => {
  const [paying, setPaying] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");

  const handleClose = () => {
    onClose();
  };
  useEffect(() => {
    if (!isOpen) return;
    setSelectedMethod("");
    getPaymentMethods()
      .then((response) => {
        setPaymentMethods(response?.data || response);
      })
      .catch((error) => {
        console.error("Error fetching payment methods:", error);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = async () => {
    if (!selectedMethod) {
      setModalMessage("Debe seleccionar un método de pago.");
      setErrorOpen(true);
      return;
    }

    try {
      setPaying(true);

      const response = await payPayroll(payrollId, selectedMethod);

      setModalMessage("Pago registrado exitosamente.");
      setSuccessOpen(true);
    } catch (error) {
      setModalMessage("Error al registrar el pago.");
      setErrorOpen(true);
    } finally {
      setPaying(false);
    }
  };
  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl h-82 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-primary">
              Registrar pago de nómina
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close Modal Button"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="m-10">
            <label className="block font-medium text-secondary mb-2">
              Método de Pago:
            </label>
            <select
              className="parametrization-input w-full"
              aria-label="Payment Method Select"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(Number(e.target.value))}
            >
              <option value="">Seleccione un método de pago</option>
              {paymentMethods.map((metthod) => (
                <option key={metthod.code} value={metthod.code}>
                  {metthod.name}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={handlePay}
              disabled={paying || !selectedMethod}
              aria-label="Generate Invoice Button"
              className="btn-theme btn-primary w-full sm:w-auto transition-all px-6 sm:px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Pagando...
                </span>
              ) : (
                "Pagar"
              )}
            </button>
          </div>
        </div>
      </div>
      <SuccessModal
        isOpen={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          onClose();
        }}
        title="Exito"
        message={modalMessage}
      />
      <ErrorModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
        message={modalMessage}
      />
    </>
  );
};

export default PayrollPayModal;
