import { api } from "@/utils/api/ApiInstance";
import { AlertCircle, ArrowLeft, ArrowRight, Calendar, Loader2, Package, RefreshCw, Search, ShoppingCart, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "../skeleton";

// --- Interfaces ---
interface Item {
  id: string;
  name: string;
  code: string;
  price: number;
  colors: string[];
  quantity: number;
}

interface SaleItem {
  id: string;
  saleId: string;
  itemId: string;
  quantity: number;
  price: number;
  item: Item;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

interface Sale {
  id: string;
  customerId: string;
  paymentMode: "CASH" | "ONLINE";
  totalAmount: number;
  discount: number;
  note: string | null;
  createdAt: string;
  items: SaleItem[];
  customer: Customer;
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

const SaleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerExchanges, setCustomerExchanges] = useState<ExchangedItem[]>([]);

  // Exchange States
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeStep, setExchangeStep] = useState(1);
  const [selectedItemToReturn, setSelectedItemToReturn] = useState<SaleItem | null>(null);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNewItem, setSelectedNewItem] = useState<Item | null>(null);
  const [exchangeQuantity, setExchangeQuantity] = useState(1);
  const [exchangeNote, setExchangeNote] = useState("");
  const [submittingExchange, setSubmittingExchange] = useState(false);

  const fetchSaleDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/sales/${id}`);
      const saleData = res.data.data;
      setSale(saleData);

      // Fetch exchanges for this specific sale to reflect them
      if (saleData.id) {
        const exchangeRes = await api.get("/exchanges", {
          params: { saleId: saleData.id, limit: 50 },
        });
        setCustomerExchanges(exchangeRes.data.data);
      }
    } catch (err: any) {
      toast.error("Failed to load sale details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSaleDetail();
  }, [id]);

  const fetchInventory = async () => {
    try {
      const response = await api.get("/item/all");
      setAvailableItems(response.data.data || response.data);
    } catch (error) {
      toast.error("Failed to load items");
    }
  };

  const handleStartExchange = () => {
    setIsExchangeModalOpen(true);
    setExchangeStep(1);
    setSelectedItemToReturn(null);
    setSelectedNewItem(null);
    setExchangeQuantity(1);
    setExchangeNote("");
    fetchInventory();
  };

  const handleExchangeSubmission = async () => {
    if (!sale || !selectedItemToReturn || !selectedNewItem) return;

    if (exchangeQuantity > selectedItemToReturn.quantity) {
      toast.error("Exchange quantity cannot exceed sold quantity");
      return;
    }

    try {
      setSubmittingExchange(true);
      await api.post("/exchanges", {
        customerId: sale.customerId,
        saleId: sale.id,
        originalItemId: selectedItemToReturn.itemId,
        newItemId: selectedNewItem.id,
        quantity: exchangeQuantity,
        note: exchangeNote,
      });
      toast.success("Exchange processed successfully");
      setIsExchangeModalOpen(false);
      fetchSaleDetail(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Exchange failed");
    } finally {
      setSubmittingExchange(false);
    }
  };

  const filteredItems = availableItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="p-4 md:p-8 animate-in fade-in duration-500">
        <div className="mb-10">
           <Skeleton className="h-10 w-40 rounded-xl mb-6" />
           <Skeleton className="h-12 w-64 rounded-2xl mb-2" />
           <Skeleton className="h-4 w-48 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 rounded-[2.5rem]" />
            <Skeleton className="h-96 rounded-[2.5rem]" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-48 rounded-[2.5rem]" />
            <Skeleton className="h-48 rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    );

  // Pleasing "Not Found" State
  if (!sale)
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white border border-[#e2e8e4] rounded-[2rem] p-10 text-center max-w-sm shadow-sm animate-in fade-in zoom-in duration-300">
          <div className="size-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-amber-500 size-8" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">
            Invoice Not Found
          </h2>
          <p className="text-gray-400 text-xs font-medium mb-8 leading-relaxed">
            We couldn't find the transaction details for this ID. It may have
            been archived or the link is incorrect.
          </p>
          <button
            onClick={() => navigate("/sales")}
            className="w-full py-3 bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-200"
          >
            Back to Sales History
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 w-full animate-in fade-in duration-500">
      {/* Header with Back Button */}
      <header className="mb-10">
        {/* <button
          onClick={() => navigate("/sales")}
          className="group flex items-center gap-2 px-2 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600  font-black text-[12px]  flex items-center uppercase tracking-[0.2em] mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Return to History
        </button> */}
        <button
          onClick={() => navigate("/sales")}
          className="w-full md:w-auto px-4 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-200"
        >
          <ArrowLeft className="size-5" />
          Back
        </button>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
               <h1 className="text-4xl font-black tracking-tight text-[#1f2937]">Invoice Details</h1>
               <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest mt-1">
                 TX-{sale.id.slice(-8)}
               </span>
            </div>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <Calendar size={16} /> Recorded on {new Date(sale.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-4 py-2 rounded-2xl text-xs font-black tracking-widest border ${
              sale.paymentMode === "ONLINE" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
            }`}>
              {sale.paymentMode} PAYMENT
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-2xl text-xs font-black tracking-widest border border-gray-200">
              SALE COMPLETED
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SECTION */}
        <div className="lg:col-span-2 space-y-10">
          {/* SALES BILL SUMMARY */}
          <div className="bg-white rounded-[2.5rem] border border-[#e2e8e4] p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-10 -mt-10 opacity-50" />
            
            <div className="flex justify-between items-start mb-10 relative">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
                    <ShoppingCart size={28} />
                 </div>
                 <h3 className="text-xl font-black text-[#1f2937]">Bill Summary</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Bill</p>
                <p className="text-4xl font-black text-amber-600 tabular-nums">
                  Rs {(sale.totalAmount + (sale.discount || 0)).toLocaleString()}
                </p>
                {sale.discount > 0 && (
                  <div className="mt-2 text-right">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Discount: Rs {sale.discount.toLocaleString()}</p>
                     <p className="text-xl font-black text-gray-800">
                      Paid: Rs {sale.totalAmount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4">Line Items ({sale.items.length})</p>
              {sale.items.map((si) => {
                const itemExchanges = customerExchanges.filter(
                  (ex) => ex.originalItemId === si.itemId
                );
                const totalExchangedQty = itemExchanges.reduce(
                  (sum, ex) => sum + ex.quantity,
                  0
                );

                return (
                  <div
                    key={si.id}
                    className="flex justify-between items-center bg-gray-50/50 border border-gray-100 rounded-[1.5rem] p-5 md:p-6 hover:border-amber-200 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-[#1f2937] text-lg">
                            {si.item.name}
                          </p>
                          {totalExchangedQty > 0 && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-amber-200">
                              {totalExchangedQty} EXCHANGED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-mono font-bold mt-0.5">
                          {si.item.code}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-[#1f2937] mb-1">Rs {si.price.toLocaleString()} × {si.quantity}</p>
                      <p className="text-xl font-black text-emerald-600 tabular-nums">
                        Rs {(si.price * si.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXCHANGE HISTORY SECTION */}
          {customerExchanges.length > 0 && (
            <div className="bg-white rounded-[2.5rem] border border-[#e2e8e4] p-8 md:p-10 shadow-sm relative overflow-hidden">
               <div className="flex items-center gap-4 mb-8">
                 <div className="p-4 bg-purple-50 rounded-2xl text-purple-600">
                    <RefreshCw size={24} />
                 </div>
                 <h3 className="text-xl font-black text-[#1f2937]">Return & Exchange History</h3>
              </div>
              
              <div className="space-y-4">
                {customerExchanges.map((ex) => (
                  <div
                    key={ex.id}
                    className="relative overflow-hidden p-6 border border-dashed border-gray-200 rounded-[2rem] bg-gray-50/30"
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="text-center md:text-left flex-1 md:flex-none">
                          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1.5">Returned Asset</p>
                          <p className="text-base font-black text-gray-700">
                            {ex.originalItem.name}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-full shadow-sm border border-gray-100">
                          <ArrowRight size={20} className="text-amber-500" />
                        </div>
                        <div className="text-center md:text-left flex-1 md:flex-none">
                          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">Acquired Asset</p>
                          <p className="text-base font-black text-gray-700">
                            {ex.newItem.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-center md:text-right border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 w-full md:w-auto">
                        <p className="text-xs font-black text-gray-500 mb-1">
                          EXCHANGE QUANTITY: {ex.quantity}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold">
                          PROCESSED ON {new Date(ex.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-10">


          {/* EXCHANGE CARD */}
          <div className="bg-[#1f2937] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 size-40 bg-white/5 rounded-full" />
            
            <h3 className="font-black text-white text-xl mb-3">Return Portal</h3>
            <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">
              Standard 30-day exchange window applies. Ensure assets are in original condition.
            </p>
            <button
              onClick={handleStartExchange}
              className="w-full bg-white text-[#1f2937] font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-amber-500 hover:text-white transition-all active:scale-[0.98] shadow-lg shadow-black/20"
            >
              Start Exchange
            </button>
          </div>
        </div>
      </div>

      {/* Exchange Modal */}
      {isExchangeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Process Exchange
              </h2>
              <button
                onClick={() => setIsExchangeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {exchangeStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-600">
                    Step 1: Select item to return
                  </p>
                  <div className="space-y-2">
                    {sale.items.map((si) => (
                      <button
                        key={si.id}
                        onClick={() => {
                          setSelectedItemToReturn(si);
                          setExchangeStep(2);
                        }}
                        className={`w-full text-left p-4 border rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all ${
                          selectedItemToReturn?.id === si.id
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="font-bold text-gray-800">
                          {si.item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Code: {si.item.code} | Sold Qty: {si.quantity}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {exchangeStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-600">
                    Step 2: Select new item
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedNewItem(item);
                          setExchangeStep(3);
                        }}
                        className={`w-full text-left p-3 border rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all ${
                          selectedNewItem?.id === item.id
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="font-bold text-gray-800 text-sm">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Code: {item.code} | Stock: {item.quantity}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setExchangeStep(1)}
                    className="text-sm text-amber-600 font-semibold hover:underline"
                  >
                    ← Back to step 1
                  </button>
                </div>
              )}

              {exchangeStep === 3 && selectedItemToReturn && selectedNewItem && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-600">
                    Step 3: Confirm details
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-center">
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                        Returning
                      </p>
                      <p className="font-bold text-red-700 text-sm truncate">
                        {selectedItemToReturn.item.name}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        Exchanging with
                      </p>
                      <p className="font-bold text-emerald-700 text-sm truncate">
                        {selectedNewItem.name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      QUANTITY TO EXCHANGE
                    </label>
                    <input
                    disabled
                      type="number"
                      min="1"
                      max={selectedItemToReturn.quantity}
                      value={exchangeQuantity}
                      onChange={(e) =>
                        setExchangeQuantity(parseInt(e.target.value) || 1)
                      }
                      className="w-full p-3 border rounded-xl focus:ring-2 hover:cursor-not-allowed focus:ring-amber-500 outline-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Max available: {selectedItemToReturn.quantity}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      ADDITIONAL NOTE
                    </label>
                    <textarea
                      value={exchangeNote}
                      onChange={(e) => setExchangeNote(e.target.value)}
                      placeholder="Reason for exchange..."
                      className="w-full p-3 border rounded-xl h-24 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setExchangeStep(2)}
                      className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleExchangeSubmission}
                      disabled={submittingExchange}
                      className="flex-3 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                    >
                      {submittingExchange ? (
                        <Loader2 className="animate-spin size-5" />
                      ) : (
                        "Confirm Exchange"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleDetails;
