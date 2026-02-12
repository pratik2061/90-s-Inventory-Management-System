import { api } from "@/utils/api/ApiInstance";
import {
    ArrowRight,
    Calendar,
    Loader2,
    Package,
    RefreshCw,
    Search,
    User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Item {
  id: string;
  name: string;
  code: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface ExchangedItem {
  id: string;
  customerId: string;
  originalItemId: string;
  newItemId: string;
  quantity: number;
  note: string | null;
  createdAt: string;
  customer: Customer;
  originalItem: Item;
  newItem: Item;
}

const ExchangeList: React.FC = () => {
  const [exchanges, setExchanges] = useState<ExchangedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const response = await api.get("/exchanges", {
        params: {
          page,
          limit: 10,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setExchanges(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch exchanges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, [page, startDate, endDate]);

  const filteredExchanges = exchanges.filter(
    (ex) =>
      ex.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.customer.phone.includes(searchQuery) ||
      ex.originalItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.newItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8faf9] p-4 md:p-6 text-[#1f2937] flex-1 w-full animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-amber-600 flex items-center gap-3">
          <RefreshCw className="size-8" />
          Exchanges
        </h1>
        <p className="text-[#6b7280] mt-1 font-medium">
          Track and manage item returns and replacements
        </p>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer, phone or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8e4] rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all shadow-sm font-medium"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8e4] rounded-2xl text-sm focus:border-amber-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#e2e8e4] rounded-2xl text-sm focus:border-amber-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#e2e8e4]">
          <Loader2 className="size-10 animate-spin text-amber-500 mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
            Fetching Exchange Records...
          </p>
        </div>
      ) : filteredExchanges.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e2e8e4]">
          <p className="text-gray-400 font-medium">No exchange records found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExchanges.map((ex) => (
            <div
              key={ex.id}
              className="bg-white border border-[#e2e8e4] rounded-3xl p-6 shadow-sm hover:border-amber-300 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                    <User className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{ex.customer.name}</h3>
                    <p className="text-sm text-gray-500">{ex.customer.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Date
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {new Date(ex.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-7 items-center gap-2 py-4 border-y border-gray-50 mb-4">
                <div className="col-span-3">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
                    Returned
                  </p>
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {ex.originalItem.name}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {ex.originalItem.code}
                  </p>
                </div>
                <div className="col-span-1 flex justify-center">
                  <ArrowRight className="text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                    Exchanged
                  </p>
                  <p className="font-bold text-gray-800 text-sm truncate">
                    {ex.newItem.name}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {ex.newItem.code}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-amber-500" />
                  <span className="text-xs font-bold text-gray-600">
                    Qty: {ex.quantity}
                  </span>
                </div>
                {ex.note && (
                  <p className="text-xs text-gray-400 italic italic-note">
                    "{ex.note}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex justify-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 disabled:opacity-50 transition-all font-semibold"
        >
          Prev
        </button>
        <div className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-black shadow-md shadow-amber-200">
          {page}
        </div>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 disabled:opacity-50 transition-all font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExchangeList;
