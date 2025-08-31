import React from "react";

const page = () => {
  return (
    <div className="mt-8 p-2">
      <h1 className="text-lg font-semibold mb-4">User Information</h1>

      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Columna izquierda */}
          <div className="flex flex-col items-center md:w-1/3">
            <div className="w-28 h-28 rounded-full bg-gray-300 mb-4"></div>
            <h2 className="text-lg font-semibold text-center">
              Hernán Darío <br /> Torres Ramírez
            </h2>

            <span className="mt-2 px-4 py-1 text-sm rounded-full bg-green-100 text-green-700">
              Active
            </span>

            <div className="mt-4 flex flex-col gap-2 items-center">
              <span className="px-4 py-1 text-sm text-gray-500">Roles</span>
              <span className="px-4 py-1 text-sm rounded-full bg-[#F0B0D3] text-[#320418]">
                Administrator
              </span>
              <span className="px-4 py-1 text-sm rounded-full bg-[#F0B0D3] text-[#320418]">
                Maintenance Technician
              </span>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="flex-1 space-y-6">
            
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold mb-2">Personal information</h3>
              <hr className="mb-4 mt-4 border-[#d7d7d7]" />
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                  <tbody className="align-top">
                    {/* Cabeceras: ocultas en mobile */}
                    <tr className="font-medium font-semibold hidden md:table-row">
                      <td className="pr-6 pb-2">Name</td>
                      <td className="pr-6 pb-2">Last name</td>
                      <td className="pr-6 pb-2">Document type</td>
                      <td className="pb-2">Document number</td>
                    </tr>
                    {/* Datos */}
                    <tr className="block md:table-row">
                      <td className="pr-6 block md:table-cell before:content-['Name'] before:block before:font-semibold md:before:hidden">
                        Hernán Darío
                      </td>
                      <td className="pr-6 block md:table-cell before:content-['Last_name'] before:block before:font-semibold md:before:hidden">
                        Torres Ramírez
                      </td>
                      <td className="pr-6 block md:table-cell before:content-['Document_type'] before:block before:font-semibold md:before:hidden">
                        C.C
                      </td>
                      <td className="block md:table-cell before:content-['Document_number'] before:block before:font-semibold md:before:hidden">
                        103313213
                      </td>
                    </tr>

                    <tr className="font-medium font-semibold hidden md:table-row">
                      <td className="pr-6 pt-4 pb-2">Email</td>
                      <td className="pr-6 pt-4 pb-2">Telephone number</td>
                      <td className="pr-6 pt-4 pb-2">Gender</td>
                      <td className="pt-4 pb-2"></td>
                    </tr>
                    <tr className="block md:table-row">
                      <td className="pr-6 block md:table-cell before:content-['Email'] before:block before:font-semibold md:before:hidden">
                        hernan.torres@company.com
                      </td>
                      <td className="pr-6 block md:table-cell before:content-['Telephone'] before:block before:font-semibold md:before:hidden">
                        +57 300 123 4567
                      </td>
                      <td className="block md:table-cell before:content-['Gender'] before:block before:font-semibold md:before:hidden">
                        Masculino
                      </td>
                      <td className="block md:table-cell"></td>
                    </tr>

                    <tr className="font-medium font-semibold hidden md:table-row">
                      <td className="pr-6 pt-4 pb-2">Birth date</td>
                      <td className="pr-6 pt-4 pb-2">Expedition date</td>
                      <td className="pt-4 pb-2"></td>
                      <td className="pt-4 pb-2"></td>
                    </tr>
                    <tr className="block md:table-row">
                      <td className="pr-6 block md:table-cell before:content-['Birth_date'] before:block before:font-semibold md:before:hidden">
                        14/3/1985
                      </td>
                      <td className="pr-6 block md:table-cell before:content-['Expedition_date'] before:block before:font-semibold md:before:hidden">
                        14/3/2003
                      </td>
                      <td className="block md:table-cell"></td>
                      <td className="block md:table-cell"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Residence Information */}
            <div className="pt-4">
              <h3 className="font-semibold mb-2">Residence Information</h3>
              <hr className="mb-4 mt-4 border-[#d7d7d7]" />
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                  <tbody className="align-top">
                    <tr className="font-medium font-semibold hidden md:table-row">
                      <td className="pr-6 pb-2">Country</td>
                      <td className="pr-6 pb-2">Region</td>
                      <td className="pb-2">City</td>
                    </tr>
                    <tr className="block md:table-row">
                      <td className="pr-6 block md:table-cell before:content-['Country'] before:block before:font-semibold md:before:hidden">
                        Colombia
                      </td>
                      <td className="pr-6 block md:table-cell before:content-['Region'] before:block before:font-semibold md:before:hidden">
                        Antioquia
                      </td>
                      <td className="block md:table-cell before:content-['City'] before:block before:font-semibold md:before:hidden">
                        Medellín
                      </td>
                    </tr>

                    <tr className="font-medium font-semibold hidden md:table-row">
                      <td className="pt-4 pb-2">Address</td>
                    </tr>
                    <tr className="block md:table-row">
                      <td
                        colSpan={3}
                        className="block md:table-cell before:content-['Address'] before:block before:font-semibold md:before:hidden"
                      >
                        Carrera 45 #23-67, Barrio El Poblado
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
