import { api } from "@/utils/api/ApiInstance";
import { CheckCircle2, Loader2, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    electronAPI?: {
      printReceipt: (saleData: any) => Promise<{ success: boolean; message: string }>;
    };
  }
}

// Updated interfaces to match backend items
interface BackendItem {
  id: string;
  name: string;
  code: string;
  price: number;
  stock?: number; // Optional: show available stock
}

interface SaleItem {
  itemId: string;
  name: string;
  code: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const SaleCreationForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState<BackendItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [discount, setDiscount] = useState<number>(0);
  const [remark] = useState("");

  // Fetch items from backend
  const fetchInventory = async () => {
    try {
      const response = await api.get("/item/list-all");
      // Assuming response.data contains the array of items
      setAvailableItems(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to load items");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);



  // Logic to add an item to the selection
  const toggleItemSelection = (item: BackendItem) => {
    const exists = selectedItems.find((si) => si.itemId === item.id);
    if (exists) {
      // Increase quantity if already selected
      setSelectedItems(
        selectedItems.map((si) =>
          si.itemId === item.id
            ? {
                ...si,
                quantity: si.quantity + 1,
                subtotal: (si.quantity + 1) * si.price,
              }
            : si,
        ),
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          itemId: item.id,
          name: item.name,
          code: item.code,
          price: item.price,
          quantity: 1,
          subtotal: item.price,
        },
      ]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setSelectedItems(
      selectedItems.map((si) => {
        if (si.itemId === itemId) {
          const newQty = Math.max(1, si.quantity + delta);
          return { ...si, quantity: newQty, subtotal: newQty * si.price };
        }
        return si;
      }),
    );
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((si) => si.itemId !== itemId));
  };

  const totalAmount = selectedItems.reduce(
    (acc, item) => acc + item.subtotal,
    0,
  );

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return toast.error("Add at least one item");
    try {
      setLoading(true);
      const res = await api.post("/sales", {
        customerId: null,
        items: selectedItems.map((si) => ({
          itemId: si.itemId,
          quantity: si.quantity,
          price: si.price,
        })),
        paymentMode: paymentMethod,
        totalAmount,
        discount,
        note: remark,
      });

      const saleData = res.data.data;
      if (window.electronAPI?.printReceipt) {
        const printResult = await window.electronAPI.printReceipt(saleData);
        if (printResult?.success) {
          toast.success(printResult.message);
        } else {
          toast.error(printResult?.message || "Failed to print receipt");
        }
      }

      toast.success("Sale completed!");
      setTimeout(() => {
        window.location.reload();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (error) {
      toast.error("Sale creation failed");
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search
  const filteredInventory = availableItems
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div className="max-w-full mx-auto p-2 text-[#1e2923]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4">
        {/* LEFT COLUMN: PRODUCT SELECTION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-end justify-between border-b pb-4 border-gray-100">
            <div>
              <h2 className="text-2xl font-black text-amber-600">
                Product Selection
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Add items to your cart
              </p>
            </div>
            <div className="text-right">
               <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">
                {selectedItems.length} Items Selected
              </span>
            </div>
          </div>

          {/* ITEM SEARCH SECTION */}
          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by Code or Item Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-amber-500 outline-none transition-all shadow-sm font-bold text-sm"
              />
            </div>

            {/* Quick Select Grid with Scroll */}
            <div className="max-h-[320px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredInventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItemSelection(item)}
                    className="p-4 text-left border-2 border-gray-100 rounded-2xl hover:border-amber-500 hover:bg-white hover:shadow-xl transition-all group relative bg-gray-50/30"
                  >
                    <div className="font-black text-gray-800 text-sm truncate mb-1">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-black mono tracking-tighter mb-3">
                      {item.code}
                    </div>
                    <div className="font-black text-amber-600 text-sm">
                      Rs.{item.price.toLocaleString()}
                    </div>
                    <div className="absolute right-3 bottom-3 p-1.5 bg-gray-100 rounded-lg text-gray-300 group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Plus size={14} strokeWidth={3} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SELECTED ITEMS TABLE */}
          <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm">
             <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Current Order</h3>
            </div>
            <div className="overflow-y-auto max-h-[300px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Item Details</th>
                    <th className="px-6 py-4 text-center w-32">Quantity</th>
                    <th className="px-6 py-4 text-right w-32">Subtotal</th>
                    <th className="px-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-300 italic font-medium">
                        No items added yet. Click on products above to start.
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((si) => (
                      <tr key={si.itemId} className="border-t border-gray-50 group hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-black text-gray-800">{si.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{si.code}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1 w-24 mx-auto border border-gray-200">
                            <button
                              onClick={() => updateQuantity(si.itemId, -1)}
                              className="size-7 flex items-center justify-center hover:bg-white hover:text-amber-600 rounded-lg transition-all font-black text-lg"
                            >
                              -
                            </button>
                            <span className="font-black text-xs">{si.quantity}</span>
                            <button
                              onClick={() => updateQuantity(si.itemId, 1)}
                              className="size-7 flex items-center justify-center hover:bg-white hover:text-amber-600 rounded-lg transition-all font-black text-lg"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600">
                          Rs.{si.subtotal.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => removeItem(si.itemId)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <X size={18} strokeWidth={3} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CHECKOUT SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#f0f9f1] to-[#e8f5e9] p-8 rounded-[2.5rem] shadow-xl lg:sticky lg:top-4 border-2 border-emerald-100/50">
            <h3 className="text-xl font-black mb-8 border-b border-emerald-200/50 pb-4 flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="text-emerald-500" /> Checkout Summary
            </h3>

            <div className="space-y-8">
              {/* Grand Total */}
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border-2 border-emerald-100 shadow-sm">
                <p className="text-emerald-800 font-black text-[10px] uppercase tracking-[0.2em] mb-2 opacity-60">
                  Grand Total
                </p>
                <h3 className="text-4xl font-black text-emerald-900 tabular-nums">
                  Rs.{(totalAmount - discount).toLocaleString()}
                </h3>
                {discount > 0 && (
                  <div className="mt-2 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span className="opacity-50 line-through">Rs.{totalAmount.toLocaleString()}</span>
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      -{discount.toLocaleString()} Discount
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Discount Input */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-emerald-900 font-black uppercase tracking-[0.2em] ml-1 opacity-60">
                    Apply Discount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-sm">Rs.</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      className="w-full bg-white border-2 border-emerald-100 rounded-2xl pl-12 pr-4 py-4 focus:border-emerald-500 outline-none transition-all font-black text-emerald-600 text-lg shadow-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-emerald-900 font-black uppercase tracking-[0.2em] ml-1 opacity-60">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("CASH")}
                      className={`py-4 rounded-2xl font-black text-xs tracking-widest transition-all border-2 ${
                        paymentMethod === "CASH"
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-white border-emerald-100 text-emerald-800 hover:border-emerald-300 shadow-sm"
                      }`}
                    >
                      CASH
                    </button>
                    <button
                      onClick={() => setPaymentMethod("ONLINE")}
                      className={`py-4 rounded-2xl font-black text-xs tracking-widest transition-all border-2 ${
                        paymentMethod === "ONLINE"
                          ? "bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-500/20"
                          : "bg-white border-emerald-100 text-emerald-800 hover:border-emerald-300 shadow-sm"
                      }`}
                    >
                      ONLINE
                    </button>
                  </div>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                disabled={loading || selectedItems.length === 0}
                onClick={handleSubmit}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-100 disabled:text-emerald-300 disabled:cursor-not-allowed rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-600/20 group uppercase tracking-widest text-white mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                    Complete Order
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-emerald-800 font-black opacity-40 uppercase tracking-tighter">
                Tax and receipt will be generated automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleCreationForm;
