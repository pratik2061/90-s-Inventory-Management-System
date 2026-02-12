import { ShoppingCart, History, PlusCircle, Loader2, Box } from "lucide-react";
import Modal from "../modal-template/modalTemplate";
import { useEffect, useState } from "react";
import SaleCreationForm from "../sale/salesCreationForm";
import toast from "react-hot-toast";
import { api } from "@/utils/api/ApiInstance";
import { DashboardClock } from "../clock/Clock";

const Dashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [todaySalesTotal, setTodaySalesTotal] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);

  const todayDate = new Date();

  const getTodaySaleLog = async () => {
    try {
      setLoading(true);

      // Calculate Start and End of Today for the API query
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const res = await api.get("/sales", {
        params: {
          startDate: startOfToday.toISOString(),
          endDate: endOfToday.toISOString(),
          limit: 100, // Fetch all for today to calculate total if needed
        },
      });

      const salesData = res.data.data;
      const totalRevenue = res.data.totalSales;

      setTodaySalesTotal(totalRevenue);
      setRecentSales(salesData);
    } catch (error: any) {
      toast.error(
        `${error?.response?.data?.message || "Failed to fetch today's sales"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTodaySaleLog();
  }, []);

  const stats = [
    {
      label: "Today's Revenue", // Updated Label
      value: `Rs ${todaySalesTotal.toLocaleString()}`,
      icon: ShoppingCart,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] p-4 text-[#1f2937] flex-1 w-full">
      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-600">
            System Overview
          </h1>
          {/* <p className="text-[#6b7280] mt-2 font-medium">
            Daily performance for{" "}
            <span className="text-amber-600/80 font-bold">
              {todayDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p> */}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#e2e8e4] rounded-3xl p-6 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="mb-4">
              <div className="inline-flex p-3 rounded-2xl bg-[#f1f5f3] border border-[#e2e8e4]">
                <stat.icon className={`size-7 ${stat.color}`} />
              </div>
            </div>
            <div className="text-4xl font-bold text-[#1f2937] tracking-tighter">
              {loading ? (
                <Loader2 className="animate-spin size-8 text-gray-300" />
              ) : (
                stat.value
              )}
            </div>
            <div className="text-base text-[#6b7280] mt-1 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
        <div className="bg-white border border-[#e2e8e4] rounded-3xl p-6 hover:border-amber-300 transition-all shadow-sm hover:shadow-md">
          <DashboardClock />
        </div>
      </div>

      <div className="flex justify-end pb-6">
        <button
          onClick={() => setModalOpen(true)}
          className="w-full md:w-auto px-8 py-3 bg-amber-500 text-white font-semibold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-amber-200/40"
        >
          <PlusCircle className="size-5" />
          New Sale
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Sale"
      >
        <SaleCreationForm
          onSuccess={() => {
            setModalOpen(false);
            getTodaySaleLog();
          }}
        />
      </Modal>

      {/* Recent Activity Section */}
      <div className="bg-white border border-[#e2e8e4] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#e2e8e4] flex items-center bg-[#f1f5f3]">
          <h2 className="text-lg font-semibold flex items-center gap-3 text-[#1f2937]">
            <History className="size-5 text-amber-600" /> Today's Sales Log
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#6b7280] text-[11px] uppercase tracking-[0.2em] bg-[#f8faf9]">
                <th className="px-8 py-4">Items</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Mode</th>
                <th className="px-8 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    <Loader2 className="animate-spin mx-auto text-amber-500" />
                  </td>
                </tr>
              ) : recentSales.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-20 text-gray-400 font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="size-8 opacity-20" />
                      <p>No sales recorded yet today.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-t border-[#e2e8e4] hover:bg-amber-50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1f2937] flex items-center gap-1">
                          <Box className="size-3 text-amber-500" />
                          {sale.items
                            ?.slice(0, 2)
                            .map((si: any) => si.item.name)
                            .join(", ")}
                          {sale.items?.length > 2 && " ..."}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          #{sale.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[#6b7280] font-medium">
                      {sale.customer?.name || "Walk-in"}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${
                          sale.paymentMode === "CASH"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}
                      >
                        {sale.paymentMode}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-mono font-bold text-emerald-600">
                      Rs {sale.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
