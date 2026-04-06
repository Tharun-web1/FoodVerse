import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "../RestaurantCss/RestaurantItems.css";
import Navbar from "../Restaurant/Navbar";
import { Link } from "react-router-dom";
import EditItem from "./EditItem";
export default function RestaurantItems() {
  const token = localStorage.getItem("restaurant_token"); // Added this line based on the instruction's snippet
  const restaurantId = localStorage.getItem("restaurantId");
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [item, setItem] = useState({
    itemName: "",
    description: "",
    price: "",
    available: true,
    category: "",
    type: "",
    serves: ""
  });

  const [itemImage, setItemImage] = useState(null);

  const fetchItems = async () => {
    try {
      const res = await api.get('/restaurants/my-items');
      setItems(res.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setItem({
      ...item,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();



    try {
      const res = await api.post('/restaurants/additem', item);
      const itemId = res.data.id;

      if (itemImage) {
        const fd = new FormData();
        fd.append("image", itemImage);

        await api.post(`/restaurants/itemimg/${itemId}`, fd);
      }

      alert("Item added successfully!");

      setItem({
        itemName: "",
        description: "",
        price: "",
        available: true,
        category: "",
        type: "",
        serves: ""
      });
      setItemImage(null);
      setShowForm(false);
      fetchItems();


    } catch (error) {
      console.error(error);
      alert("Failed to add item");
    }
  };
  const handleToggleAvailability = async (item) => {
    try {
      const updatedItem = { ...item, available: !item.available };
      await api.put(`/restaurants/my-items/${item.id}`, updatedItem);
      fetchItems();
    } catch (error) {
      console.error(error);
      alert("Failed to update item availability");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/restaurants/my-items/${id}`);
      alert("Item deleted successfully");
      fetchItems();
    } catch (error) {
      console.error(error);
      alert("Failed to delete item");
    }
  };


  const filteredItems = items.filter((i) =>
    i.itemName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="container mt-5" style={{ minHeight: "56vh" }}>
        <div className="card-premium animate__animated animate__fadeIn">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0" style={{ color: '#1e293b' }}>🍴 Manage Menu</h2>
              <p className="text-muted small mb-0">Customize and manage your restaurant's offerings</p>
            </div>
            <button
              className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "✕ Close" : "+ Add New Item"}
            </button>
          </div>

          {/* ADD ITEM FORM */}
          {showForm && (
            <div className="mb-5 p-4 rounded-4 border-0 bg-light animate__animated animate__slideInDown">
              <h5 className="fw-bold mb-4">✨ New Item Details</h5>
              <form onSubmit={handleSubmit} className="row g-4">
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Item Name</label>
                  <input type="text" name="itemName" className="form-control rounded-3" placeholder="e.g. Butter Chicken" value={item.itemName} onChange={handleChange} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Category</label>
                  <select name="category" className="form-select rounded-3" onChange={handleChange} value={item.category}>
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

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Food Type</label>
                  <select name="type" className="form-select rounded-3" onChange={handleChange} value={item.type}>
                    <option value="">Select type</option>
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="col-md-12">
                  <label className="form-label small fw-bold text-muted">Description</label>
                  <textarea name="description" className="form-control rounded-3" rows="2" placeholder="Briefly describe the item flavor and ingredients..." value={item.description} onChange={handleChange}></textarea>
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted">Price (₹)</label>
                  <input type="number" name="price" className="form-control rounded-3" placeholder="0.00" value={item.price} onChange={handleChange} required />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted">Serves</label>
                  <input type="text" name="serves" className="form-control rounded-3" placeholder="1-2 people" value={item.serves} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted">Item Image</label>
                  <input type="file" className="form-control rounded-3" onChange={handleFileChange} />
                </div>

                <div className="col-md-2 d-flex align-items-end mb-1">
                  <div className="form-check form-switch mb-2">
                    <input type="checkbox" className="form-check-input" name="available" checked={item.available} onChange={handleChange} id="availableCheck" style={{ width: '40px', height: '20px' }} />
                    <label className="form-check-label ms-2 fw-bold small text-muted" htmlFor="availableCheck">Available</label>
                  </div>
                </div>

                <div className="col-12 mt-4 text-end">
                  <button type="button" className="btn btn-light px-4 py-2 me-2 rounded-pill" onClick={() => setShowForm(false)}>Cancel</button>
                  <button className="btn btn-primary px-5 py-2 rounded-pill fw-bold shadow">Save Item</button>
                </div>
              </form>
            </div>
          )}

          <div className="mb-4 position-relative">
            <i className="fa fa-search position-absolute text-muted" style={{ left: '15px', top: '15px' }}></i>
            <input 
              type="text" 
              className="form-control ps-5 py-3 border-0 bg-light rounded-4 shadow-sm" 
              placeholder="Search your menu items..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          <div className="table-responsive">
            <table className="table premium-table align-middle">
              <thead>
                <tr>
                  <th className="ps-4">Item</th>
                  <th className="text-center">Serves</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="text-muted opacity-50">
                        <i className="fa fa-utensils fs-1 mb-3 d-block"></i>
                        No items found matching your search.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((i, index) => (
                    <tr key={i.id} className={!i.available ? "out-of-stock-row" : ""}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <img 
                            src={`http://localhost:8082/restaurants/${i.id}/itemimg`} 
                            alt={i.itemName} 
                            className="item-thumbnail"
                            onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3132/3132693.png"; }}
                          />
                          <div>
                            <div className="item-name-cell">{i.itemName}</div>
                            <small className="text-muted">{i.category}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-center fw-medium text-muted">{i.serves || "Standard"}</td>
                      <td className="text-center fw-bold">₹{i.price}</td>
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center gap-2">
                          <label className="availability-switch">
                            <input 
                              type="checkbox" 
                              checked={i.available} 
                              onChange={() => handleToggleAvailability(i)}
                            />
                            <span className="slider-premium"></span>
                          </label>
                          {!i.available && <span className="status-badge-premium status-outofstock">STOCK OUT</span>}
                        </div>
                      </td>
                      <td>
                        <div className="action-btn-group">
                          <Link className="action-btn btn-view" to={`/res/item/view/${i.id}`} title="View Details">
                            <i className="fa fa-eye"></i>
                          </Link>
                          <Link className="action-btn btn-edit" to={`/res/item/edit/${i.id}`} title="Edit Item">
                            <i className="fa fa-pen"></i>
                          </Link>
                          <button className="action-btn btn-delete" onClick={() => handleDelete(i.id)} title="Delete Item">
                            <i className="fa fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    </>
  );
}
