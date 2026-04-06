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
      navigate("/res/menu");
      return;
    }

    api.get(`/restaurants/my-items/${id}`)
      .then(res => {
        setItem(res.data);
      })
      .catch(() => navigate("/res/menu"));

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
        navigate("/res/menu");
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
                  <label>Serves</label>
                  <input
                    type="text"
                    name="serves"
                    className="form-control"
                    placeholder="e.g. 1-2 people"
                    value={item.serves}
                    onChange={handleChange}
                  />
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
                  <select name="category" className="form-select" onChange={handleChange} value={item.category}>
                    <option value="">Select Category</option>
                    <option value="Starters">Starters</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Biryani">Biryani</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Ice Cream">Ice Cream</option>
                    <option value="Chinese">Chinese</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Juice">Juice</option>
                    <option value="Burger">Burger</option>
                    <option value="Cake">Cake</option>
                    <option value="Others">Others</option>
                  </select>
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
                  onClick={() => navigate("/res/menu")}
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
