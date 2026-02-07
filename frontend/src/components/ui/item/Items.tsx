import { PlusCircle, Package, Search } from "lucide-react";
import { useState } from "react";
import AddItemModal, { type ItemFormData } from "./addItemModal";

const Items = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const handleSave = (data: ItemFormData) => {
    console.log("Item saved:", data);
    // TODO: call API to save item
  };
  const items = [
    {
      id: 1,
      name: "Industrial Gaskets",
      category: "Mechanical",
      stock: 240,
      price: "Rs 1250",
    },
    {
      id: 2,
      name: "Hydraulic Fluid",
      category: "Lubricants",
      stock: 120,
      price: "Rs 4500",
    },
    {
      id: 3,
      name: "Steel Bolts (M8)",
      category: "Fasteners",
      stock: 560,
      price: "RS 80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] p-8 text-[#1f2937] flex-1 w-full">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-amber-600">
            Items
          </h1>
          <p className="text-[#6b7280] mt-1">Manage your inventory items</p>
        </div>

        {/* Add Item Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-amber-500 text-white font-semibold rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-amber-200/40"
        >
          <PlusCircle className="size-5" />
          Add Item
        </button>
        <AddItemModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      </header>

      {/* Search Bar */}
      <div className="mb-6 w-[30%] flex items-center gap-3 bg-white border border-[#e2e8e4] rounded-2xl px-4 py-3 shadow-sm">
        <Search className="size-5 text-[#6b7280]" />
        <input
          type="text"
          placeholder="Search items..."
          className=" bg-transparent outline-none text-sm placeholder:text-[#9ca3af] w-full"
        />
      </div>

      {/* Items Table */}
      <div className="bg-white border border-[#e2e8e4] rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[#6b7280] text-[11px] uppercase tracking-[0.2em] bg-[#f1f5f3]">
              <th className="px-8 py-4">Item</th>
              <th className="px-8 py-4">Category</th>
              <th className="px-8 py-4">Stock</th>
              <th className="px-8 py-4">Price</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="text-sm">
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-[#e2e8e4] hover:bg-amber-50 transition-colors"
              >
                <td className="px-8 py-5 font-medium flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100">
                    <Package className="size-5 text-amber-600" />
                  </div>
                  {item.name}
                </td>
                <td className="px-8 py-5 text-[#6b7280]">{item.category}</td>
                <td className="px-8 py-5">
                  <span
                    className={`font-semibold ${
                      item.stock < 150 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {item.stock}
                  </span>
                </td>
                <td className="px-8 py-5 font-mono">{item.price}</td>
                <td className="px-8 py-5 text-right">
                  <button className="text-amber-600 hover:text-amber-700 font-medium">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Items;
