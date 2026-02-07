import { useState } from "react";
import { Plus, X } from "lucide-react";
import Modal from "../modal-template/modalTemplate";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ItemFormData) => void;
}

export interface ItemFormData {
  name: string;
  code: string;
  price: string;
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

  const handleAddColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput("");
    }
  };

  const handleRemoveColor = (color: string) => {
    setColors(colors.filter((c) => c !== color));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, code, price, colors, quantity });
    setName("");
    setCode("");
    setPrice("");
    setQuantity(0);
    setColors([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Item">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label className="block text-md font-bold text-[#4a5a51]  mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74] focus:outline-none focus:ring-2 focus:ring-amber-200/40 focus:border-amber-200 transition-all"
            placeholder="Item Name"
            required
          />
        </div>

        {/* Code */}
        <div>
          <label className="block text-md font-bold text-[#4a5a51]  mb-1">
            Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74] focus:outline-none focus:ring-2 focus:ring-amber-200/40 focus:border-amber-200 transition-all"
            placeholder="Item Code"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-md font-bold text-[#4a5a51]  mb-1">
            Price
          </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74] focus:outline-none focus:ring-2 focus:ring-emerald-200/40 focus:border-emerald-200 transition-all"
            placeholder="Rs.0000"
            required
          />
        </div>

        {/* Colors */}
        <div>
          <label className="block text-md font-bold text-[#4a5a51]  mb-1">
            Colors
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {colors.map((color) => (
              <span
                key={color}
                className="flex items-center gap-1 bg-amber-200/20 text-amber-600 px-3 py-1 rounded-full text-md font-semibold"
              >
                {color}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(color)}
                  className="hover:text-amber-800"
                >
                  <X size={16} />
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
              placeholder="Add color"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="px-4 py-3 bg-amber-500 text-[#161d19] rounded-xl font-semibold hover:bg-amber-600 transition-all flex items-center justify-center gap-1"
            >
              <Plus />
              Add
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-md font-bold text-[#4a5a51] mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={quantity === 0 ? "" : quantity} // show empty string if 0
            onChange={(e) => setQuantity(Number(e.target.value))}
            onFocus={(e) => e.target.select()} // auto-select the text so 0 is replaced
            className="w-full px-4 py-3 bg-[#f5f5f5]/10 border border-[#c1c1c1]/20 rounded-xl text-[#1e2923] placeholder:text-[#6d7e74] focus:outline-none focus:ring-2 focus:ring-emerald-200/40 focus:border-emerald-200 transition-all appearance-none"
            placeholder="0"
            min={0}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-amber-500 text-[#161d19] rounded-2xl font-black uppercase tracking-widest hover:bg-amber-600 shadow-md shadow-amber-200/20 transition-all"
        >
          Save Item
        </button>
      </form>
    </Modal>
  );
};

export default AddItemModal;
