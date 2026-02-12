import { api } from "@/utils/api/ApiInstance";
import { ChevronLeft, ChevronRight, Edit3, Layers, Package, PlusCircle, Search, Tag } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { errorresponse } from "../login/LoginComponent";
import { CardSkeleton, StatsSkeleton, TableSkeleton } from "../SkeletonComponents";
import AddItemModal from "./addItemModal";

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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [totalItems, setTotalItems] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  const fetchItemData = useCallback(
    async (term: string, currentPage: number, currentLimit: number) => {
      setLoading(true);
      try {
        let res;
        if (!term.trim()) {
          res = await api.get(
            `/item/all?page=${currentPage}&limit=${currentLimit}`,
          );
        } else {
          res = await api.get(`/item/search?searchterm=${term}`);
        }
        if (res) {
          setTotalItems(res.data.totalItemsInAllPages || 0);
          setTotalQuantity(res.data.allQuantity || 0);
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItemData(searchQuery, page, limit);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, page, limit, fetchItemData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleSave = () => {
    fetchItemData(searchQuery, page, limit);
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] p-4 md:p-8 text-[#1f2937] flex-1 w-full animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-amber-600">
            Inventory
          </h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <Layers className="size-4" /> Manage your product assets
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="w-full md:w-auto px-8 py-4 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-200"
        >
          <PlusCircle className="size-5" />
          Add New Item
        </button>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="bg-white border border-[#e2e8e4] rounded-[2rem] p-8 shadow-sm hover:border-amber-300 transition-all hover:shadow-xl group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                  Total Items
                </p>
                <h2 className="text-4xl font-black text-amber-600 mt-3 tabular-nums">
                  {totalItems}
                </h2>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:rotate-12 transition-transform">
                <Package className="size-10" />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="bg-white border border-[#e2e8e4] rounded-[2rem] p-8 shadow-sm hover:border-emerald-300 transition-all hover:shadow-xl group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                  Total Quantity
                </p>
                <h2 className="text-4xl font-black text-emerald-600 mt-3 tabular-nums">
                  {totalQuantity}
                </h2>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:rotate-12 transition-transform">
                <PlusCircle className="size-10" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEARCH */}
      <div className="mb-8 w-full max-w-xl group">
        <div className="flex items-center gap-4 bg-white border border-[#e2e8e4] rounded-2xl px-6 py-4 shadow-sm group-focus-within:border-amber-400 transition-all group-focus-within:shadow-lg group-focus-within:shadow-amber-100">
          <Search className="size-6 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="Search items by code or name.."
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-transparent outline-none text-base w-full font-bold placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white border border-[#e2e8e4] rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[#6b7280] text-[11px] font-black uppercase tracking-[0.2em] bg-gray-50/50">
              <th className="px-8 py-5">Product Detail</th>
              <th className="px-8 py-5">Code</th>
              <th className="px-8 py-5">Colors</th>
              <th className="px-8 py-5">Availability</th>
              <th className="px-8 py-5">Unit Price</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm font-medium">
            {loading ? (
              <TableSkeleton columns={6} rows={5} />
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-gray-400">
                  <Package className="size-12 mx-auto mb-4 opacity-10" />
                  No items found matching your criteria.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-[#e2e8e4] hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
                        <Tag className="size-5" />
                      </div>
                      <span className="font-black text-[#1f2937] text-sm">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-6">
                    <span className="bg-gray-100 w-full px-1  py-1.5 rounded-lg text-gray-600 font-bold font-mono text-xs">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-4 py-6 ">
                    <div className="flex flex-wrap gap-2">
                      {item.colors.map((color, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 text-[10px] border border-amber-400 font-black uppercase tracking-widest rounded-full bg-amber-100 text-gray-700 "
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-6 flex justify-center">
                    <span
                      className={`font-black tabular-nums ${
                        item.quantity <= 5 ? "text-red-500" : "text-emerald-600"
                      }`}
                    >
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-6 font-black text-[#1f2937]">
                    Rs {item.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-6 text-right">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-gray-400 hover:text-amber-600 p-3 hover:bg-amber-50 rounded-2xl transition-all active:scale-90"
                    >
                      <Edit3 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : items.length === 0 ? (
          <div className="bg-white border border-[#e2e8e4] rounded-[2rem] p-10 text-center text-gray-400">
            No items found.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#e2e8e4] rounded-[2rem] p-6 shadow-sm active:scale-[0.98] transition-all"
              onClick={() => handleEdit(item)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                    <Tag className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#1f2937] text-lg">
                      {item.name}
                    </h3>
                    <p className="text-gray-400 font-mono text-xs font-bold">
                      {item.code}
                    </p>
                  </div>
                </div>
                <Edit3 className="size-5 text-gray-300" />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {item.colors.slice(0, 3).map((color, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-gray-50 text-gray-500 border border-gray-100"
                  >
                    {color}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Price
                  </p>
                  <p className="text-xl font-black text-[#1f2937]">
                    Rs {item.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Stock
                  </p>
                  <p
                    className={`text-xl font-black tabular-nums ${
                      item.quantity <= 5 ? "text-red-500" : "text-emerald-600"
                    }`}
                  >
                    {item.quantity}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION & FOOTER */}
      <footer className="mt-10 mb-10 flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Rows:
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-[#e2e8e4] rounded-xl px-4 py-2 text-sm font-black text-amber-600 outline-none focus:border-amber-400 appearance-none shadow-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            {items.length} of {totalItems} items
          </span>
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#e2e8e4] p-2 rounded-2xl shadow-sm">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="p-3 border border-[#e2e8e4] rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="flex items-center px-4">
            <span className="text-sm font-black text-amber-600">
              Page {page}
            </span>
            <span className="mx-2 text-gray-300 text-xs">/</span>
            <span className="text-sm font-black text-gray-400">
              {Math.ceil(totalItems / limit) || 1}
            </span>
          </div>

          <button
            disabled={
              page >= Math.ceil(totalItems / limit) ||
              loading ||
              searchQuery.trim() !== ""
            }
            onClick={() => setPage((prev) => prev + 1)}
            className="p-3 border border-[#e2e8e4] rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </footer>

      <AddItemModal
        open={modalOpen}
        initialData={selectedItem}
        onClose={() => {
          setModalOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default Items;
