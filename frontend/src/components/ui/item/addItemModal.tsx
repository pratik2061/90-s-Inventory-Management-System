import { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import Modal from "../modal-template/modalTemplate";
import { api } from "@/utils/api/ApiInstance";
import toast from "react-hot-toast";
import type { errorresponse } from "../login/LoginComponent";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: any | null; // Added to support Editing
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form state with initialData when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCode(initialData.code || "");
      setPrice(initialData.price?.toString() || "");
      setQuantity(initialData.quantity || "");
      setColors(initialData.colors || []);
    } else {
      // Reset form if opening in "Add" mode
      setName("");
      setCode("");
      setPrice("");
      setQuantity("");
      setColors([]);
    }
  }, [initialData, open]);

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
      const payload = {
        name,
        code,
        price: parseFloat(price),
        colors,
        quantity: Number(quantity),
      };

      let res;
      if (initialData) {
        // CALL UPDATE ROUTE
        res = await api.patch(`/item/update/${initialData.id}`, payload);
        toast.success("Item updated successfully");
      } else {
        // CALL ADD ROUTE
        res = await api.post("/item/add", payload);
        toast.success("Item added successfully");
      }

      if (res.status === 200 || res.status === 201) {
        onSave();
        onClose();
      }
    } catch (error: any) {
      toast.error(`${error.response.data.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Edit Item" : "Add New Item"}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-md font-bold text-[#4a5a51] mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-200 transition-all"
            placeholder="e.g. Vintage Denim"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-md font-bold text-[#4a5a51] mb-1">
            Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-200 transition-all"
            placeholder="JNS-001"
            required
            disabled={isSubmitting}
          />
        </div>

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
              className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-200 transition-all"
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
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-200 transition-all"
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
        </div>

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
              className="flex-1 px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl focus:ring-2 focus:ring-amber-200 focus:border-amber-200 transition-all"
              placeholder="Add color..."
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddColor())
              }
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-amber-500 text-[#161d19] rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : initialData ? (
            "Update Item"
          ) : (
            "Save Item"
          )}
        </button>
      </form>
    </Modal>
  );
};

export default AddItemModal;
