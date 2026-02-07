import { Package, ShoppingCart, History, PlusCircle } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      label: "Total Inventory Items",
      value: "1,284",
      icon: Package,
      color: "text-amber-600",
    },
    {
      label: "Today's Sales",
      value: "$3,842",
      icon: ShoppingCart,
      color: "text-emerald-600",
    },
  ];

  const recentActivity = [
    { id: 1, item: "Industrial Gaskets", action: "Restocked", qty: "+100" },
    { id: 2, item: "Hydraulic Fluid", action: "Dispatched", qty: "-20" },
    { id: 3, item: "Steel Bolts (M8)", action: "Adjustment", qty: "-5" },
  ];

  const todayDate = new Date();

  return (
    <div className="min-h-screen bg-[#f8faf9] p-8 text-[#1f2937] flex-1 w-full">
      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-600">
            System Overview
          </h1>
          <p className="text-[#6b7280] mt-2 font-medium">
            Inventory status as of{" "}
            <span className="text-amber-600/80">
              {todayDate.toDateString()}
            </span>
          </p>
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
              {stat.value}
            </div>
            <div className="text-base text-[#6b7280] mt-1 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add Sale */}
      <div className="flex justify-end pb-6">
        <button className="w-full md:w-auto px-8 py-3 bg-amber-500 text-white font-semibold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-amber-200/40">
          <PlusCircle className="size-5" />
          New Sale
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-[#e2e8e4] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#e2e8e4] flex items-center bg-[#f1f5f3]">
          <h2 className="text-lg font-semibold flex items-center gap-3 text-[#1f2937]">
            <History className="size-5 text-amber-600" /> Recent Log
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#6b7280] text-[11px] uppercase tracking-[0.2em] bg-[#f8faf9]">
                <th className="px-8 py-4">Asset</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentActivity.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-[#e2e8e4] hover:bg-amber-50 transition-colors"
                >
                  <td className="px-8 py-5 font-medium text-[#1f2937]">
                    {log.item}
                  </td>
                  <td className="px-8 py-5 text-[#6b7280]">{log.action}</td>
                  <td
                    className={`px-8 py-5 text-right font-mono font-bold ${
                      log.qty.startsWith("+")
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {log.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
