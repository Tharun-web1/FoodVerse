import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Restaurant/Navbar";
import "../RestaurantCss/EditItem.css";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState({
    itemName: "",
    price: "",
    serves: "",
    category: "",
    type: "",
    description: "",
    available: true
  });

  const [loading, setLoading] = useState(false);
  const [itemImage, setItemImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [isCustomServes, setIsCustomServes] = useState(false);
  const [customServesInput, setCustomServesInput] = useState("");

  const STANDARD_CATEGORIES = [
    "Starters",
    "Desserts",
    "Biryani",
    "Pizza",
    "Ice Cream",
    "Chinese",
    "South Indian",
    "Juice",
    "Burger",
    "Cake",
    "Refresheners & Beverages",
    "Cool Drinks",
    "Main Course",
    "Soups & Salads",
    "Snacks & Fast Food",
    "Combos & Thalis",
    "Others"
  ];

  const getCategoryQuantityOptions = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("biryani") || cat.includes("rice") || cat.includes("thali")) {
      return ["Single", "Full", "Family Pack", "Jumbo", "Half"];
    }
    if (cat.includes("pizza")) {
      return ['Small (7")', 'Medium (10")', 'Large (12")', 'Personal / Regular'];
    }
    if (cat.includes("beverage") || cat.includes("refreshener") || cat.includes("drink") || cat.includes("juice") || cat.includes("soda")) {
      return ["Small (250ml)", "Medium (350ml)", "Large (500ml)", "Can (300ml)", "Bottle (1 Litre)", "Glass"];
    }
    if (cat.includes("burger") || cat.includes("sandwich")) {
      return ["Single / Regular", "Double", "Combo / Meal"];
    }
    if (cat.includes("cake") || cat.includes("ice cream") || cat.includes("dessert")) {
      return ["Single Scoop / Slice", "Double Scoop", "Tub (500ml)", "250 Grams", "500 Grams", "1 Kg"];
    }
    if (cat.includes("starter") || cat.includes("chinese") || cat.includes("snack") || cat.includes("south indian") || cat.includes("main course")) {
      return ["Half", "Full", "1 Portion", "2 Pcs", "4 Pcs", "6 Pcs", "Family Pack"];
    }
    return ["Single", "Half", "Full", "Small", "Medium", "Large", "1 Portion", "2 Pcs", "4 Pcs", "Family Pack", "Jumbo"];
  };

  // Dynamic unique categories list including the current item's category if custom
  const allCategories = Array.from(
    new Set([...STANDARD_CATEGORIES, ...(item.category ? [item.category] : [])])
  );

  const baseQuantityOptions = getCategoryQuantityOptions(item.category);
  const quantityOptions = Array.from(
    new Set([...baseQuantityOptions, ...(item.serves ? [item.serves] : [])])
  );

  const handleCategorySelectChange = (e) => {
    const val = e.target.value;
    if (val === "CUSTOM_NEW") {
      setIsCustomCategory(true);
      setItem(prev => ({ ...prev, category: customCategoryInput }));
    } else {
      setIsCustomCategory(false);
      setItem(prev => ({ ...prev, category: val }));
    }
  };

  const handleCustomCategoryInputChange = (e) => {
    const val = e.target.value;
    setCustomCategoryInput(val);
    setItem(prev => ({ ...prev, category: val }));
  };

  const handleServesSelectChange = (e) => {
    const val = e.target.value;
    if (val === "CUSTOM_SERVES_NEW") {
      setIsCustomServes(true);
      setItem(prev => ({ ...prev, serves: customServesInput }));
    } else {
      setIsCustomServes(false);
      setItem(prev => ({ ...prev, serves: val }));
    }
  };

  const handleCustomServesInputChange = (e) => {
    const val = e.target.value;
    setCustomServesInput(val);
    setItem(prev => ({ ...prev, serves: val }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setItemImage(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  /* ✅ SAFETY GUARD */
  useEffect(() => {
    if (!id) {
      navigate("/restaurant/menu");
      return;
    }

    api.get(`/restaurants/my-items/${id}`)
      .then(res => {
        setItem(res.data);
      })
      .catch(() => navigate("/restaurant/menu"));

    let currentImageUrl = null;
    const fetchImage = async () => {
      try {
        const res = await api.get(`/restaurants/${id}/itemimg`, {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("restaurant_token")}`
          }
        });

        const blob = res.data;
        if (blob.size > 0) {
          currentImageUrl = URL.createObjectURL(blob);
          setPreviewImage(currentImageUrl);
        }
      } catch (err) {
        console.error("Image loading error:", err);
      }
    };

    fetchImage();

    return () => {
      if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    };
  }, [id, navigate]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!item.category || !item.category.trim()) {
      alert("Please select or enter a category");
      return;
    }

    setLoading(true);

    api.put(`/restaurants/my-items/${id}`, item, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("restaurant_token")}`
      }
    })
      .then(async () => {
        if (itemImage) {
          const fd = new FormData();
          fd.append("image", itemImage);
          try {
            await api.post(`/restaurants/${id}/itemimg`, fd, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("restaurant_token")}`
              }
            });
          } catch (error) {
            console.error("Image upload failed", error);
            alert("Item updated, but image upload failed.");
            setLoading(false);
            return;
          }
        }
        alert("Item updated successfully!");
        navigate("/restaurant/menu");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to update item. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Navbar />

      <div className="edit-item-wrapper">
        <div className="edit-item-card fade-in">
          <div className="edit-item-header">
            <h3>Edit Item</h3>
          </div>

          <div className="edit-item-body">
            <form onSubmit={handleSubmit}>
              <div className="image-preview-container">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="image-preview" />
                ) : (
                  <div className="image-placeholder">No Image Selected</div>
                )}
              </div>

              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  className="form-control"
                  placeholder="Enter item name"
                  value={item.itemName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    placeholder="Price"
                    value={item.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label>Quantity / Portion</label>
                  <select
                    name="servesSelect"
                    className="form-select"
                    value={isCustomServes ? "CUSTOM_SERVES_NEW" : item.serves}
                    onChange={handleServesSelectChange}
                  >
                    <option value="">Select Quantity / Size</option>
                    {quantityOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                    <option value="CUSTOM_SERVES_NEW" style={{ fontWeight: "bold", color: "#e11d48" }}>
                      + Add Custom Size...
                    </option>
                  </select>

                  {isCustomServes && (
                    <input 
                      type="text" 
                      className="form-control mt-2" 
                      placeholder="e.g. 250ml, 500g, 6 Pcs, 10 inch..." 
                      value={customServesInput} 
                      onChange={handleCustomServesInputChange} 
                      required 
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Item Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>

              <div className="row">
                <div className="col-md-6 form-group">
                  <label>Category</label>
                  <select 
                    name="categorySelect" 
                    className="form-select" 
                    onChange={handleCategorySelectChange} 
                    value={isCustomCategory ? "CUSTOM_NEW" : item.category}
                    required={!isCustomCategory}
                  >
                    <option value="">Select Category</option>
                    {allCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                    <option value="CUSTOM_NEW" style={{ fontWeight: "bold", color: "#e11d48" }}>
                      + Add Custom Category...
                    </option>
                  </select>

                  {isCustomCategory && (
                    <input 
                      type="text" 
                      className="form-control mt-2" 
                      placeholder="e.g. Refresheners, Cool Drinks, Mocktails..." 
                      value={customCategoryInput} 
                      onChange={handleCustomCategoryInputChange} 
                      required 
                    />
                  )}
                </div>

                <div className="col-md-6 form-group">
                  <label>Type</label>
                  <select name="type" className="form-select" onChange={handleChange} value={item.type}>
                    <option value="">Select type</option>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control textarea"
                  placeholder="Describe the item..."
                  value={item.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-custom btn-cancel"
                  onClick={() => navigate("/restaurant/menu")}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-custom btn-save"
                  disabled={loading}
                >
                  {loading ? (
                    <span>Updating...</span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
