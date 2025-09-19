import { useReactTable, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";

const TableList = ({
    columns,
    data,
    loading,
    globalFilter,
    onGlobalFilterChange,
    globalFilterFn,
    pageSizeOptions = [10, 20, 30, 40, 50],
}) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange,
        globalFilterFn: globalFilterFn,
        initialState: { pagination: { pageSize: pageSizeOptions[0] } },
    });

    return (
        <div className="parametrization-table mb-6 md:mb-8">
            {loading ? (
                <div className="parametrization-loading p-8 text-center">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="parametrization-table-header">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}
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
                                                        asc: <span className="text-xs">▲</span>,
                                                        desc: <span className="text-xs">▼</span>,
                                                    }[header.column.getIsSorted()] ?? null}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="parametrization-table-body">
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center text-secondary py-6 parametrization-empty">
                                        No results found
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="parametrization-pagination px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                    {/* Mobile pagination */}
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

                    {/* Desktop pagination */}
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                        <div className="flex items-center gap-1">
                            {/* Previous button */}
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors"
                            >
                                ← Previous
                            </button>

                            {/* Page numbers */}
                            {(() => {
                                const currentPage = table.getState().pagination.pageIndex + 1;
                                const totalPages = table.getPageCount();
                                const pages = [];

                                // Always show first page
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

                                // Show ellipsis if there's a gap
                                if (currentPage > 4) {
                                    pages.push(
                                        <span key="ellipsis1" className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm">
                                            ...
                                        </span>
                                    );
                                }

                                // Show pages around current page
                                for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => table.setPageIndex(i - 1)}
                                            className={`parametrization-pagination-button inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors ${i === currentPage ? 'active' : ''
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                // Show ellipsis if there's a gap
                                if (currentPage < totalPages - 3) {
                                    pages.push(
                                        <span key="ellipsis2" className="parametrization-pagination-ellipsis inline-flex items-center justify-center w-10 h-10 text-sm">
                                            ...
                                        </span>
                                    );
                                }

                                // Always show last page
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

                            {/* Next button */}
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="parametrization-pagination-button inline-flex items-center px-3 py-2 text-sm font-medium transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    </div>

                    {/* Page size selector */}
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
        </div>
    );
};

export default TableList;