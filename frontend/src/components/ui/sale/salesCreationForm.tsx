import React, { useState, useEffect } from "react";
import { Plus, X, Loader2, Search, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/utils/api/ApiInstance";

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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState("");
  // Step 2 States
  const [availableItems, setAvailableItems] = useState<BackendItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [remark, setRemark] = useState("");

  // Fetch items from backend
  const fetchInventory = async () => {
    try {
      const response = await api.get("/item/all");
      // Assuming response.data contains the array of items
      setAvailableItems(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to load items");
    }
  };

  useEffect(() => {
    if (step === 2) fetchInventory();
  }, [step]);

  // Handle Step 1: Customer Creation
  const handleNextStep = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Enter customer details");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/customers", {
        name: customerName,
        phone: customerPhone,
      });
      if (res.status === 201) {
        toast.success("Customer ready");

        setCustomerId(res.data.data.id);
      }
      setStep(2);
    } catch (error: any) {
      if (error.response?.status === 400)
        toast.error(`${error.response.data.message}`);
      else toast.error("Customer error");
    } finally {
      setLoading(false);
    }
  };

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
      await api.post("/sales", {
        customerId,
        items: selectedItems.map((si) => ({
          itemId: si.itemId,
          quantity: si.quantity,
          price: si.price,
        })),
        paymentMode: paymentMethod,
        totalAmount,
        note: remark,
      });
      toast.success("Sale completed!");
      window.location.reload();
      if (onSuccess) onSuccess();
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
    )
    .slice(0, 6); // Show top 6 matches

  return (
    <div className="max-w-4xl mx-auto p-2">
      <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b pb-2">
        Create New Sale
      </h2>

      {step === 1 ? (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
          {/* Customer Inputs (Same as before) */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              placeholder="98XXXXXXXX"
            />
          </div>
          <button
            disabled={loading}
            className="w-full px-10 py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all flex justify-center items-center"
            onClick={handleNextStep}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Verify & Continue"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          {/* Step 2 Header */}
          <div className="flex justify-between items-center bg-amber-50 p-4 rounded-2xl">
            <p className="font-bold text-gray-700">
              Billing to: <span className="text-amber-600">{customerName}</span>
            </p>
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-gray-400 hover:text-amber-600 underline"
            >
              Change Customer
            </button>
          </div>

          {/* ITEM SEARCH SECTION */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Code or Item Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-amber-100 rounded-xl focus:border-amber-500 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Quick Select Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredInventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItemSelection(item)}
                  className="p-3 text-left border border-gray-100 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all group relative"
                >
                  <div className="font-bold text-gray-800 text-sm truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono tracking-tighter">
                    {item.code}
                  </div>
                  <div className="mt-1 font-bold text-amber-600 text-xs">
                    Rs.{item.price}
                  </div>
                  <Plus className="absolute right-2 bottom-2 size-4 text-gray-300 group-hover:text-amber-500" />
                </button>
              ))}
            </div>
          </div>

          {/* SELECTED ITEMS TABLE */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-3">Selected Item</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  <th className="px-6 py-3">Subtotal</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {selectedItems.map((si) => (
                  <tr key={si.itemId} className="border-t border-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{si.name}</div>
                      <div className="text-[10px] text-gray-400">{si.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3 bg-gray-100 rounded-lg p-1 w-24 mx-auto">
                        <button
                          onClick={() => updateQuantity(si.itemId, -1)}
                          className="hover:text-amber-600 font-black"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs">{si.quantity}</span>
                        <button
                          onClick={() => updateQuantity(si.itemId, 1)}
                          className="hover:text-amber-600 font-black"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      Rs.{si.subtotal}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => removeItem(si.itemId)}
                        className="text-red-300 hover:text-red-500 mr-4"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTAL & SUBMIT */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900 p-6 rounded-3xl text-white">
            <div>
              <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">
                Grand Total
              </p>
              <h3 className="text-3xl font-black">
                Rs.{totalAmount.toLocaleString()}
              </h3>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none font-bold text-sm"
              >
                <option value="CASH">CASH</option>
                <option value="ONLINE">ONLINE</option>
              </select>
              <button
                disabled={loading || selectedItems.length === 0}
                onClick={handleSubmit}
                className="flex-1 md:flex-none px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleCreationForm;
