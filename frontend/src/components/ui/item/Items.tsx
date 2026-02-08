import { PlusCircle, Package, Search, Edit3 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import AddItemModal from "./addItemModal";
import { api } from "@/utils/api/ApiInstance";
import toast from "react-hot-toast";
import type { errorresponse } from "../login/LoginComponent";
import { SkeletonText } from "../skeleton-template";

interface Item {
  id: string;
  name: string;
  code: string;
  price: number;
  quantity: number;
  colors: string[];
  createdAt: string;
  updatedAt: string;
}

const Items = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Unified fetch function
  const fetchItemData = useCallback(
    async (term: string, currentPage: number, currentLimit: number) => {
      setLoading(true);
      try {
        let res;
        if (!term.trim()) {
          // Pagination on the 'all' route
          res = await api.get(
            `/item/all?page=${currentPage}&limit=${currentLimit}`,
          );
        } else {
          // Search route logic
          res = await api.get(`/item/search?searchterm=${term}`);
        }

        const responseData = res.data.data;

        if (!responseData) {
          setItems([]);
        } else if (Array.isArray(responseData)) {
          setItems(responseData);
        } else {
          setItems([responseData]);
        }
      } catch (error) {
        const err = error as errorresponse;
        if (err.response?.status === 400 || err.response?.status === 404) {
          setItems([]);
        } else {
          toast.error("Network error: Could not fetch items");
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // SINGLE UNIFIED EFFECT: Handles Search (debounced), Page changes, and Limit changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItemData(searchQuery, page, limit);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, page, limit, fetchItemData]);

  // Handler to ensure typing in search resets the view to Page 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleSave = () => {
    fetchItemData(searchQuery, page, limit);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] p-8 text-[#1f2937] flex-1 w-full">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-600">
            Items
          </h1>
          <p className="text-[#6b7280] mt-1 font-medium">
            Inventory System Portal
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-amber-200/40"
        >
          <PlusCircle className="size-5" />
          Add New Item
        </button>
      </header>

      {/* Reactive Search Bar */}
      <div className="mb-6 w-full max-w-md flex items-center gap-3 bg-white border border-[#e2e8e4] rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all">
        <Search className="size-5 text-[#9ca3af]" />
        <input
          type="text"
          placeholder="Search items by code.."
          value={searchQuery}
          onChange={handleSearchChange}
          className="bg-transparent outline-none text-sm placeholder:text-[#9ca3af] w-full font-medium"
        />
        {loading && searchQuery && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent"></div>
        )}
      </div>

      <div className="bg-white border border-[#e2e8e4] rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[#6b7280] text-[11px] uppercase tracking-[0.2em] bg-[#f1f5f3]">
              <th className="px-8 py-4">Asset Detail</th>
              <th className="px-8 py-4">Code</th>
              <th className="px-8 py-4">Colors</th>
              <th className="px-8 py-4">Quantity</th>
              <th className="px-8 py-4">Price</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20">
                  <div className="flex flex-col items-center justify-center w-full gap-3">
                    <SkeletonText />
                    <p className="text-xs text-[#9ca3af] animate-pulse font-medium tracking-widest uppercase">
                      Syncing Database...
                    </p>
                  </div>
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-[#e2e8e4] hover:bg-amber-50 transition-colors group"
                >
                  <td className="px-8 py-5 font-bold flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-100 group-hover:bg-amber-200 transition-colors">
                      <Package className="size-5 text-amber-600" />
                    </div>
                    <span className="capitalize">{item.name}</span>
                  </td>
                  <td className="px-8 py-5 text-[#6b7280] font-mono font-bold italic">
                    {item.code}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-1 flex-wrap">
                      {item.colors.map((color) => (
                        <span
                          key={color}
                          className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[11px] rounded text-[#64748b] uppercase font-bold"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-emerald-600">
                    {item.quantity} units
                  </td>
                  <td className="px-8 py-5 font-mono font-bold">
                    Rs. {item.price.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-amber-600 hover:text-amber-800 p-2 hover:bg-amber-100 rounded-lg transition-all">
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-20 text-[#9ca3af] font-medium italic"
                >
                  {searchQuery
                    ? `No assets matching "${searchQuery}" found.`
                    : "Inventory is empty."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
      {/* Table Footer / Pagination */}
      <div className="px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            limit:
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-[#c1c1c1]/50 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 bg-white border border-[#e2e8e4] rounded-xl text-sm font-semibold text-[#4a5a51] hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
          >
            Previous
          </button>

          <div className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-200/40">
            {page}
          </div>

          <button
            disabled={
              items.length < limit || loading || searchQuery.trim() !== ""
            }
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-white border border-[#e2e8e4] rounded-xl text-sm font-semibold text-[#4a5a51] hover:bg-amber-50 disabled:opacity-50 disabled:hover:bg-white transition-all shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
export default Items;
