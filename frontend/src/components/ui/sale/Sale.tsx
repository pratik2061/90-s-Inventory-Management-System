import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  ShoppingCart,
  Calendar,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import Modal from "../modal-template/modalTemplate";
import SaleCreationForm from "./salesCreationForm";
import { api } from "@/utils/api/ApiInstance";

// --- Interfaces based on your Backend Response ---

interface ItemDetail {
  id: string;
  name: string;
  code: string;
  price: number;
}

interface SaleItem {
  id: string;
  quantity: number;
  price: number;
  item: ItemDetail;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Sale {
  id: string;
  totalAmount: number;
  paymentMode: "CASH" | "ONLINE";
  createdAt: string;
  note?: string;
  customer: Customer | null;
  items: SaleItem[];
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

const Sales: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  });

  const fetchSales = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/sales`, {
        params: { page, limit: 10 },
      });

      const { data, totalSales, pagination: pagData } = response.data;
      setSales(data);
      setTotalRevenue(totalSales);
      setPagination(pagData);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(pagination.page);
  }, [pagination.page]);

  // Client-side filter for the search bar
  const filteredSales = sales.filter(
    (sale) =>
      sale.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] p-8 text-[#1f2937] flex-1 w-full">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-600">
            Sales
          </h1>
          <p className="text-[#6b7280] mt-1">
            Total Revenue:{" "}
            <span className="font-bold text-emerald-600">
              Rs. {totalRevenue.toLocaleString()}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              placeholder="Search customers or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all w-64 shadow-sm"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-2xl hover:bg-amber-600 transition-all flex items-center gap-2 shadow-md shadow-amber-200/40"
          >
            <PlusCircle className="size-5" />
            Add Sale
          </button>
        </div>
      </header>

      {/* Sales Table */}
      <div className="bg-white border border-[#e2e8e4] rounded-3xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#6b7280] text-[11px] uppercase tracking-[0.2em] bg-[#f1f5f3]">
                <th className="px-8 py-4">Customer / ID</th>
                <th className="px-8 py-4">Items Sold</th>
                <th className="px-8 py-4">Total Amount</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4">Mode</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="size-8 animate-spin mx-auto text-amber-500" />
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-t border-[#e2e8e4] hover:bg-amber-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-100 group-hover:bg-amber-200 transition-colors">
                          <ShoppingCart className="size-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">
                            {sale.customer?.name || "Walk-in"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">
                            {sale.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Items Column with Hover Info */}
                    <td className="px-8 py-5">
                      <div className="relative flex items-center gap-2 group/item cursor-help">
                        <span className="font-semibold px-2 py-1 bg-gray-100 rounded-lg text-xs">
                          {sale.items.length}{" "}
                          {sale.items.length === 1 ? "Item" : "Items"}
                        </span>
                        <Info className="size-4 text-gray-300 group-hover/item:text-amber-500 transition-colors" />

                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl p-3 z-50 invisible group-hover/item:visible opacity-0 group-hover/item:opacity-100 transition-all pointer-events-none">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 border-b pb-1">
                            Items List
                          </p>
                          {sale.items.map((si, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs py-1 border-b border-gray-50 last:border-0"
                            >
                              <span className="text-gray-700 truncate mr-2">
                                {si.item.name}{" "}
                                <span className="text-gray-400">
                                  x{si.quantity}
                                </span>
                              </span>
                              <span className="font-mono font-bold text-gray-900">
                                Rs.{si.price}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5 font-mono font-bold text-gray-900">
                      Rs. {sale.totalAmount.toLocaleString()}
                    </td>

                    <td className="px-8 py-5 text-[#6b7280]">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${
                          sale.paymentMode === "ONLINE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {sale.paymentMode}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-4 bg-[#fcfdfc] border-t border-[#e2e8e4] flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-800">{sales.length}</span> of{" "}
            <span className="font-bold text-gray-800">
              {pagination.totalCount}
            </span>{" "}
            records
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs font-bold px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-30 transition-all"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Sale"
      >
        <SaleCreationForm />
      </Modal>
    </div>
  );
};

export default Sales;
