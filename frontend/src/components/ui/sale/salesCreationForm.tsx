import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ItemFormData } from "../item/addItemModal";
import AddItemModal from "../item/addItemModal";

interface SaleItem extends ItemFormData {
  subtotal: number;
}

const SaleCreationForm = () => {
  // Step navigation
  const [step, setStep] = useState(1);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Sales items
  const [items, setItems] = useState<SaleItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Payment and remark
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [remark, setRemark] = useState("");

  // Total amount
  const totalAmount = items.reduce((acc, item) => acc + item.subtotal, 0);

  // Add item handler
  const handleAddItem = (data: ItemFormData) => {
    setItems([
      ...items,
      { ...data, subtotal: Number(data.price) * data.quantity },
    ]);
  };

  // Remove item handler
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Navigation
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Submit
  const handleSubmit = () => {
    const saleData = {
      customerName,
      customerPhone,
      items,
      paymentMethod,
      totalAmount,
      remark,
    };
    console.log("Sale Created:", saleData);
    alert("Sale Created! Check console for details.");
    // Reset form
    setStep(1);
    setCustomerName("");
    setCustomerPhone("");
    setItems([]);
    setPaymentMethod("Cash");
    setRemark("");
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#f5f5f5]/5 border border-[#c1c1c1]/20 rounded-3xl shadow-xl">
      <h2 className="text-2xl font-bold text-amber-500 mb-6 shadow-sm py-2 rounded-md pl-4">
        Create New Sale
      </h2>

      {/* Step 1: Customer Details */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-md font-bold text-[#4a5a51] mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74]"
              placeholder="Ramesh pandey"
            />
          </div>
          <div>
            <label className="block text-md font-bold text-[#4a5a51] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74]"
              placeholder="+977 9800000000"
            />
          </div>
          <button
            className="px-6 py-3 bg-amber-500 text-[#161d19] rounded-2xl font-bold hover:bg-amber-600 transition-all"
            onClick={nextStep}
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Sales Items & Payment */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-amber-500">
              Sales Items
            </h3>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-[#161d19] rounded-xl hover:bg-amber-600 transition-all"
            >
              <Plus /> Add Item
            </button>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto border border-[#e2e8e4] rounded-2xl shadow-sm">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-amber-50 text-[#6b7280] uppercase text-sm tracking-wide">
                <tr>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Subtotal</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-[#e2e8e4] hover:bg-amber-50 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-[#1f2937]">
                        {item.name}
                      </td>
                      <td className="px-6 py-3 font-medium text-[#1f2937]">
                        {item.code}
                      </td>
                      <td className="px-6 py-3 font-mono text-[#1f2937]">
                        Rs.{item.price}
                      </td>
                      <td className="px-6 py-3 text-[#1f2937]">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-3 font-mono text-[#1f2937]">
                        Rs.{item.subtotal}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-[#6b7280] font-medium"
                    >
                      No items added yet. Click "Add Item" to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total & Payment */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-bold text-amber-600">
              <span className="text-neutral-800">Total: </span>Rs {totalAmount}
            </span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923]"
            >
              <option>Cash</option>
              {/* <option>Card</option> */}
              <option>Online</option>
            </select>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-md font-bold text-[#4a5a51] mb-1">
              Remark
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74]"
              placeholder="Optional remarks"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-2">
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-400 text-[#161d19] rounded-2xl font-bold hover:bg-gray-500 transition-all"
            >
              Previous
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-amber-500 text-[#161d19] rounded-2xl font-bold hover:bg-amber-600 transition-all"
            >
              Submit Sale
            </button>
          </div>

          {/* Add Item Modal */}
          <AddItemModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleAddItem}
          />
        </div>
      )}
    </div>
  );
};

export default SaleCreationForm;
