import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  ShoppingCart,
  Calendar,
  Loader2,
  Search,
  Info,
  TrendingUp,
  Calculator,
} from "lucide-react";
import Modal from "../modal-template/modalTemplate";
import SaleCreationForm from "./salesCreationForm";
import { api } from "@/utils/api/ApiInstance";
import toast from "react-hot-toast";

// --- Interfaces ---
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
  customer: Customer | null;
  items: SaleItem[];
}

const Sales: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Date Range States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sales`, {
        params: {
          page,
          limit,
          startDate: startDate || undefined, // Send undefined if empty to avoid backend issues
          endDate: endDate || undefined,
        },
      });

      const { data, totalSales, pagination: pagData } = response.data;
      setSales(data);
      setTotalRevenue(totalSales);
      setTotalPages(pagData.totalPages);
      setTotalCount(pagData.totalCount);
    } catch (error: any) {
      toast.error(`${error.response.data.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Trigger re-fetch on page, limit, or date changes
  useEffect(() => {
    fetchSales();
  }, [page, limit, startDate, endDate]);

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] p-4 text-[#1f2937] flex-1 w-full">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-600">
            Sales
          </h1>
          <p className="text-[#6b7280] mt-1">
            Manage your business transactions
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-200/40 active:scale-95"
        >
          <PlusCircle className="size-5" />
          Add Sale
        </button>
      </header>

      {/* --- Revenue & Date Filter Card --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-[#e2e8e4] shadow-sm flex items-center gap-5 hover:border hover:border-amber-300">
          <div className="p-4 bg-emerald-100 rounded-2xl">
            <TrendingUp className="size-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total Revenue
            </p>
            <h2 className="text-2xl font-black text-gray-800">
              Rs. {totalRevenue.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#e2e8e4] shadow-sm flex flex-col md:flex-row items-center gap-4 ">
          <div className="flex-1 w-full">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
              From Date
            </p>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-[#f9fafb] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
              To Date
            </p>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-[#f9fafb] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="md:mt-5">
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 underline underline-offset-4 p-2"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Search & Table Section */}
      <div className="bg-white border border-[#e2e8e4] rounded-3xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-6 border-b border-[#e2e8e4] flex items-center justify-between">
          <h3 className="font-bold text-gray-700 flex">
            <Calculator className="mr-2" />
            Sales History
          </h3>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              placeholder="Search customer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#f9fafb] border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all w-64 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#6b7280] text-[11px] uppercase tracking-[0.2em] bg-gray-100">
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
                          <div className="text-[10px] text-gray-400 font-mono uppercase">
                            #{sale.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative flex items-center gap-2 group/item">
                        <span className="font-semibold px-2 py-1 bg-gray-100 rounded-lg text-xs ">
                          {sale.items.length} Items
                        </span>
                        <Info className="size-4 text-gray-300 group-hover/item:text-amber-500 " />
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
                                {si.item.name} x{si.quantity}
                              </span>
                              <span className="font-mono font-bold">
                                Rs.{si.price.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono font-bold">
                      Rs. {sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-[#6b7280]">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${sale.paymentMode === "ONLINE" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
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
      </div>

      {/* Pagination Footer */}
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center  gap-2">
          <span className="text-[12px] text-gray-500">Limit</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-[#c1c1c1]/50 rounded-lg px-1 py-1 text-sm outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-white border rounded-xl text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <div className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold">
            {page}
          </div>
          <button
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-white border rounded-xl text-sm disabled:opacity-50"
          >
            Next
          </button>
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
