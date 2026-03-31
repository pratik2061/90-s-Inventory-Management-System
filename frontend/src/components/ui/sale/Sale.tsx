import { api } from "@/utils/api/ApiInstance";
import {
  Calculator,
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  ShoppingCart,
  TrendingUp
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Modal from "../modal-template/modalTemplate";
import { CardSkeleton, StatsSkeleton, TableSkeleton } from "../SkeletonComponents";
import SaleCreationForm from "./salesCreationForm";

interface SaleItem {
  id: string;
  itemId: string;
  quantity: number;
  salePrice: number;
  item: {
    name: string;
    code: string;
  };
}

interface Sale {
  id: string;
  customerId?: string;
  customer?: {
    name: string;
  };
  totalAmount: number;
  discount: number;
  paymentMode: string;
  items: SaleItem[];
  createdAt: string;
}

const Sales: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sales`, {
        params: {
          page,
          limit,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      const { data, totalSales, pagination: pagData } = response.data;
      setSales(data || []);
      setTotalRevenue(totalSales || 0);
      setTotalPages(pagData?.totalPages || 1);
    } catch (error: any) {
      toast.error(`${error.response?.data?.message || "Error fetching sales"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, limit, startDate, endDate]);

  const filteredSales = sales.filter(
    (sale) =>
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] p-4 md:p-8 text-[#1f2937] flex-1 w-full animate-in fade-in duration-500">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-amber-600">
            Sales
          </h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Calculator size={18} className="text-gray-400" /> Business transaction history
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full md:w-auto px-8 py-4 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-200"
        >
          <PlusCircle className="size-5" />
          Create Invoice
        </button>
      </header>

      {/* Revenue & Date Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-[#e2e8e4] shadow-sm flex flex-col justify-between hover:border-amber-300 transition-all hover:shadow-xl group">
            <div className="p-4 bg-emerald-50 rounded-2xl w-fit mb-6 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
              <TrendingUp className="size-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                Total Revenue
              </p>
              <h2 className="text-3xl font-black text-gray-800 tabular-nums">
                Rs {totalRevenue.toLocaleString()}
              </h2>
            </div>
          </div>
        )}

        <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] border border-[#e2e8e4] shadow-sm">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 w-full">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                From Date
              </p>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-base focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold"
                />
              </div>
            </div>
            <div className="flex-1 w-full">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                To Date
              </p>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-base focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="px-6 py-4 text-sm font-black text-amber-600 hover:bg-amber-50 rounded-2xl transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-[#e2e8e4] rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
        <div className="p-8 border-b border-[#e2e8e4] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-[#1f2937]">Transaction Logs</h3>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
              {filteredSales.length} Records
            </span>
          </div>
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              placeholder="Search customers or codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold shadow-sm"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#6b7280] text-[10px] font-black uppercase tracking-[0.2em] bg-gray-50/50">
                <th className="px-8 py-5">Transaction ID</th>
                <th className="px-8 py-5">Items</th>
                <th className="px-8 py-5">Total Amount</th>
                <th className="px-8 py-5">Payment Mode</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {loading ? (
                <TableSkeleton columns={6} rows={5} />
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    <ShoppingCart className="size-12 mx-auto mb-4 opacity-10" />
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => navigate(`/sales/${sale.id}`)}
                    className="border-t border-[#e2e8e4] hover:bg-amber-50/30 transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
                          <PlusCircle className="size-5" />
                        </div>
                        <div>
                          <div className="font-black text-[#1f2937] text-base">
                            TX-{sale.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        {sale.items.length} Product{sale.items.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-emerald-600 text-lg tabular-nums">
                      Rs {sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${
                          sale.paymentMode === "ONLINE"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {sale.paymentMode}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-gray-400 font-bold">
                      {new Date(sale.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <ChevronRight className="size-5 text-gray-300 group-hover:text-amber-500 transition-colors inline group-hover:translate-x-1" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden grid grid-cols-1 gap-4 p-4 bg-gray-50/30">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No records.</div>
          ) : (
            filteredSales.map((sale) => (
              <div
                key={sale.id}
                onClick={() => navigate(`/sales/${sale.id}`)}
                className="bg-white border border-[#e2e8e4] rounded-[2rem] p-6 shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                      <ShoppingCart className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#1f2937] text-lg">
                        Invoice #{sale.id.slice(-8)}
                      </h3>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-gray-300" />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    {sale.items.length} Items
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${
                      sale.paymentMode === "ONLINE"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-blue-50 text-blue-600 border-blue-100"
                    }`}
                  >
                    {sale.paymentMode}
                  </span>
                </div>

                <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Grand Total
                    </p>
                    <p className="text-2xl font-black text-emerald-600 tabular-nums">
                      Rs {sale.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-300 font-bold">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <footer className="mt-10 mb-10 flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Limit:
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-[#e2e8e4] rounded-xl px-4 py-2 text-sm font-black text-amber-600 outline-none appearance-none shadow-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#e2e8e4] p-2 rounded-2xl shadow-sm">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="p-3 border border-[#e2e8e4] rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <ChevronLeft className="size-5 text-gray-400" />
          </button>

          <div className="flex items-center px-4">
            <span className="text-sm font-black text-amber-600">
              Page {page}
            </span>
            <span className="mx-2 text-gray-300 text-xs">/</span>
            <span className="text-sm font-black text-gray-400">
              {totalPages}
            </span>
          </div>

          <button
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="p-3 border border-[#e2e8e4] rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <ChevronRight className="size-5 text-gray-400" />
          </button>
        </div>
      </footer>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Sale Entry" maxWidth="6xl">
        <SaleCreationForm />
      </Modal>
    </div>
  );
};

export default Sales;
