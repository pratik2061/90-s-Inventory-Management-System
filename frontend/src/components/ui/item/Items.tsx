import { PlusCircle, Package, Search, Edit3 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import AddItemModal from "./addItemModal";
import { api } from "@/utils/api/ApiInstance";
import toast from "react-hot-toast";
import type { errorresponse } from "../login/LoginComponent";

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
  const [selectedItem, setSelectedItem] = useState<Item | null>(null); // Track item for editing
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
    setSelectedItem(null); // Clear selection for "Add" mode
    setModalOpen(true);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item); // Set item for "Edit" mode
    setModalOpen(true);
  };

  const handleSave = () => {
    fetchItemData(searchQuery, page, limit);
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] p-4 text-[#1f2937] flex-1 w-full">
      {/* HEADER */}
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
          onClick={handleAddNew}
          className="w-full md:w-auto px-6 py-3 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-amber-200/40"
        >
          <PlusCircle className="size-5" />
          Add New Item
        </button>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-[#e2e8e4] rounded-3xl p-6 shadow-sm hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#6b7280] font-bold">
                Total Items
              </p>
              <h2 className="text-3xl font-black text-amber-600 mt-2">
                {loading ? "..." : totalItems}
              </h2>
            </div>
            <div className="p-4 rounded-2xl bg-amber-100">
              <Package className="size-8 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8e4] rounded-3xl p-6 shadow-sm hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#6b7280] font-bold">
                Total Quantity
              </p>
              <h2 className="text-3xl font-black text-emerald-600 mt-2">
                {loading ? "..." : totalQuantity}
              </h2>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-100">
              <PlusCircle className="size-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-6 w-full max-w-md flex items-center gap-3 bg-white border border-[#e2e8e4] rounded-2xl px-4 py-3 shadow-sm">
        <Search className="size-5 text-[#9ca3af]" />
        <input
          type="text"
          placeholder="Search items by code.."
          value={searchQuery}
          onChange={handleSearchChange}
          className="bg-transparent outline-none text-sm w-full font-medium"
        />
      </div>

      {/* TABLE */}
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

          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-[#e2e8e4] hover:bg-amber-50 transition-colors"
              >
                <td className="px-8 py-5 font-bold">{item.name}</td>
                <td className="px-8 py-5">{item.code}</td>
                <td className="px-8 py-5">
                  <div className="flex flex-wrap gap-2">
                    {item.colors.map((color, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-[12px] font-bold uppercase tracking-wider rounded-md bg-amber-50 text-amber-700 border border-amber-400"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-5 text-emerald-600 font-bold">
                  {item.quantity}
                </td>
                <td className="px-8 py-5 font-bold">
                  Rs. {item.price.toLocaleString()}
                </td>
                <td className="px-8 py-5 text-right">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-amber-600 hover:text-amber-700 p-2 hover:bg-amber-100 rounded-full transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION & FOOTER */}
      <div className="px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 ">
        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-[#6b7280] uppercase tracking-tighter">
            Rows per page:
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // Reset to first page when limit changes
            }}
            className="border border-[#e2e8e4] rounded-lg px-2 py-1 text-sm font-bold text-amber-600 outline-none focus:border-amber-400"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-xs text-[#6b7280] font-medium">
            Showing {items.length} of {totalItems} items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 text-sm font-bold border border-[#e2e8e4] rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            <span className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm shadow-sm shadow-amber-200">
              {page}
            </span>
            <span className="text-[#6b7280] text-xs font-bold px-2">
              of {Math.ceil(totalItems / limit) || 1}
            </span>
          </div>

          <button
            disabled={
              page >= Math.ceil(totalItems / limit) ||
              loading ||
              searchQuery.trim() !== ""
            }
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 text-sm font-bold border border-[#e2e8e4] rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>

      <AddItemModal
        open={modalOpen}
        initialData={selectedItem} // New prop
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
