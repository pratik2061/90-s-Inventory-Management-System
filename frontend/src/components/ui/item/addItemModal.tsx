import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react"; // Added Loader2 for button loading state
import Modal from "../modal-template/modalTemplate";
import { api } from "@/utils/api/ApiInstance"; // Import your api instance
import toast from "react-hot-toast";
import type { errorresponse } from "../login/LoginComponent";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void; // Changed to void because parent just needs to know "it's done"
}

export interface ItemFormData {
  id: string;
  name: string;
  code: string;
  price: number; // Changed to number to match Prisma Float
  colors: string[];
  quantity: number;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [colorInput, setColorInput] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput("");
    }
  };

  const handleRemoveColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // API Integration
      const payload = {
        name,
        code,
        price: parseFloat(price), // Prisma Float needs a number
        colors,
        quantity: Number(quantity),
      };

      const res = await api.post("/item/add", payload);

      if (res.status === 200 || res.status === 201) {
        toast.success("Item added ");

        // Reset local state
        setName("");
        setCode("");
        setPrice("");
        setQuantity(0);
        setColors([]);

        onSave(); // <--- This triggers fetchItemData in the parent (Items.tsx)
        onClose();
      }
    } catch (error) {
      const err = error as errorresponse;
      const message = err.response?.data?.message || "Failed to add item";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Item">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label className="block text-md font-bold text-[#4a5a51] mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74] focus:outline-none focus:ring-2 focus:ring-amber-200/40 focus:border-amber-200 transition-all"
            placeholder="e.g. Vintage Denim"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Code */}
        <div>
          <label className="block text-md font-bold text-[#4a5a51] mb-1">
            Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74] focus:outline-none focus:ring-2 focus:ring-amber-200/40 focus:border-amber-200 transition-all"
            placeholder="JNS-001"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Price & Quantity Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-md font-bold text-[#4a5a51] mb-1">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74] focus:outline-none focus:ring-2 focus:ring-emerald-200/40 focus:border-emerald-200 transition-all"
              placeholder="0.00"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-md font-bold text-[#4a5a51] mb-1">
              Quantity
            </label>
            <input
              type="number"
              // value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] focus:outline-none focus:ring-2 focus:ring-emerald-200/40 focus:border-emerald-200 transition-all"
              // min={0}
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Colors Section */}
        <div>
          <label className="block text-md font-bold text-[#4a5a51] mb-1">
            Colors
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {colors.map((color) => (
              <span
                key={color}
                className="flex items-center gap-1 bg-amber-200/20 text-amber-600 px-3 py-1 rounded-full text-sm font-semibold border border-amber-200/30"
              >
                {color}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(color)}
                  className="hover:text-amber-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74] focus:outline-none focus:ring-2 focus:ring-amber-200/40 focus:border-amber-200 transition-all"
              placeholder="Add color..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddColor();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="px-4 py-3 bg-amber-500 text-[#161d19] rounded-xl font-semibold hover:bg-amber-600 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-amber-500 text-[#161d19] rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 shadow-md shadow-amber-200/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            "Save Item to Inventory"
          )}
        </button>
      </form>
    </Modal>
  );
};

export default AddItemModal;
