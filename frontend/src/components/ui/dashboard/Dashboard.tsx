import { api } from "@/utils/api/ApiInstance";
import { ArrowRight, Box, History, PlusCircle, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DashboardClock } from "../clock/Clock";
import Modal from "../modal-template/modalTemplate";
import SaleCreationForm from "../sale/salesCreationForm";
import { StatsSkeleton, TableSkeleton } from "../SkeletonComponents";

const Dashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [todaySalesTotal, setTodaySalesTotal] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [recentExchanges, setRecentExchanges] = useState<any[]>([]);

  const getTodayLogs = async () => {
    try {
      setLoading(true);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // Fetch Sales
      const salesRes = await api.get("/sales", {
        params: {
          startDate: startOfToday.toISOString(),
          endDate: endOfToday.toISOString(),
          limit: 100,
        },
      });

      // Fetch Exchanges
      const exchangeRes = await api.get("/exchanges", {
        params: {
          startDate: startOfToday.toISOString(),
          endDate: endOfToday.toISOString(),
          limit: 50,
        },
      });

      setTodaySalesTotal(salesRes.data.totalSales);
      setRecentSales(salesRes.data.data);
      setRecentExchanges(exchangeRes.data.data);
    } catch (error: any) {
      toast.error(
        `${error?.response?.data?.message || "Failed to fetch today's logs"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTodayLogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faf9] p-4 md:p-8 text-[#1f2937] flex-1 w-full animate-in fade-in duration-700">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-amber-600">
            System Overview
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Real-time performance tracking
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full md:w-auto px-8 py-4 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-200"
        >
          <PlusCircle className="size-5" />
          New Sale
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="bg-white border border-[#e2e8e4] rounded-3xl p-8 hover:border-amber-300 transition-all shadow-sm hover:shadow-xl group">
            <div className="mb-6 flex justify-between items-start">
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
                <ShoppingCart className="size-8" />
              </div>
            </div>
            <div className="text-4xl font-black text-[#1f2937] tracking-tighter mb-1">
              Rs {todaySalesTotal.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">
              Today's Revenue
            </div>
          </div>
        )}

        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="bg-white border border-[#e2e8e4] rounded-3xl p-8 hover:border-amber-300 transition-all shadow-sm hover:shadow-xl group">
            <div className="mb-6 flex justify-between items-start">
              <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
                <Box className="size-8" />
              </div>
            </div>
            <div className="text-4xl font-black text-[#1f2937] tracking-tighter mb-1">
              {recentExchanges.length}
            </div>
            <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">
              Today's Exchanges
            </div>
          </div>
        )}

        <div className="bg-white border border-[#e2e8e4] rounded-3xl p-8 hover:border-amber-300 transition-all shadow-sm hover:shadow-xl overflow-hidden relative">
          <DashboardClock />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Section */}
        <div className="bg-white border border-[#e2e8e4] rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-[#e2e8e4] flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-black flex items-center gap-3 text-[#1f2937]">
              <History className="size-6 text-amber-600" /> Today's Sales
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[#6b7280] text-[10px] font-black uppercase tracking-[0.2em] bg-gray-50/30">
                  <th className="px-8 py-5">Items</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {loading ? (
                  <TableSkeleton rows={5} columns={3} />
                ) : recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-20 text-gray-400">
                      <ShoppingCart className="size-12 mx-auto mb-4 opacity-10" />
                      No sales yet.
                    </td>
                  </tr>
                ) : (
                  recentSales.slice(0, 5).map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-t border-[#e2e8e4] hover:bg-amber-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#1f2937] flex items-center gap-2 truncate max-w-[200px]">
                            <Box className="size-4 text-amber-500" />
                            {sale.items
                              ?.slice(0, 2)
                              .map((si: any) => si.item.name)
                              .join(", ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-gray-500">
                        {sale.customer?.name || "Walk-in"}
                      </td>
                      <td className="px-8 py-6 text-right font-black text-emerald-600">
                        Rs {sale.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exchanges Section */}
        <div className="bg-white border border-[#e2e8e4] rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-[#e2e8e4] flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-black flex items-center gap-3 text-[#1f2937]">
              <History className="size-6 text-amber-600" /> Today's Exchanges
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[#6b7280] text-[10px] font-black uppercase tracking-[0.2em] bg-gray-50/30">
                  <th className="px-8 py-5">Exchange Detail</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5 text-right">Qty</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {loading ? (
                  <TableSkeleton rows={5} columns={3} />
                ) : recentExchanges.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-20 text-gray-400">
                      <History className="size-12 mx-auto mb-4 opacity-10" />
                      No exchanges yet.
                    </td>
                  </tr>
                ) : (
                  recentExchanges.slice(0, 5).map((ex) => (
                    <tr
                      key={ex.id}
                      className="border-t border-[#e2e8e4] hover:bg-amber-50/30 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="text-red-500 text-xs font-bold line-through opacity-60">
                            {ex.originalItem.name}
                          </span>
                          <ArrowRight className="size-4 text-amber-500" />
                          <span className="text-emerald-600 text-xs font-bold">
                            {ex.newItem.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-gray-500">
                        {ex.customer?.name}
                      </td>
                      <td className="px-8 py-6 text-right font-black text-amber-600">
                        {ex.quantity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Sale"
      >
        <SaleCreationForm
          onSuccess={() => {
            setModalOpen(false);
            getTodayLogs();
          }}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
