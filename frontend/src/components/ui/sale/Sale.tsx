import { PlusCircle, ShoppingCart, Calendar } from "lucide-react";

const Sales = () => {
  const sales = [
    {
      id: 1,
      item: "Industrial Gaskets",
      quantity: 20,
      price: "$250.00",
      date: "2025-02-06",
      status: "Completed",
    },
    {
      id: 2,
      item: "Hydraulic Fluid",
      quantity: 5,
      price: "$225.00",
      date: "2025-02-06",
      status: "Completed",
    },
    {
      id: 3,
      item: "Steel Bolts (M8)",
      quantity: 50,
      price: "$40.00",
      date: "2025-02-05",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] p-8 text-[#1f2937] flex-1 w-full">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-600">
            Sales
          </h1>
          <p className="text-[#6b7280] mt-1">
            Track item sales and transactions
          </p>
        </div>

        {/* Add Sale Button */}
        <button className="w-full md:w-auto px-6 py-3 bg-amber-500 text-white font-semibold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-amber-200/40">
          <PlusCircle className="size-5" />
          Add Sale
        </button>
      </header>

      {/* Sales Table */}
      <div className="bg-white border border-[#e2e8e4] rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[#6b7280] text-[11px] uppercase tracking-[0.2em] bg-[#f1f5f3]">
              <th className="px-8 py-4">Item</th>
              <th className="px-8 py-4">Quantity</th>
              <th className="px-8 py-4">Total Price</th>
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {sales.map((sale) => (
              <tr
                key={sale.id}
                className="border-t border-[#e2e8e4] hover:bg-amber-50 transition-colors"
              >
                <td className="px-8 py-5 font-medium flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100">
                    <ShoppingCart className="size-5 text-amber-600" />
                  </div>
                  {sale.item}
                </td>

                <td className="px-8 py-5 font-semibold">{sale.quantity}</td>

                <td className="px-8 py-5 font-mono">{sale.price}</td>

                <td className="px-8 py-5 text-[#6b7280] flex items-center gap-2">
                  <Calendar className="size-4" />
                  {sale.date}
                </td>

                <td className="px-8 py-5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sale.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {sale.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
