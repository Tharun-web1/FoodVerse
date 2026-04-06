import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../RestaurantCss/ViewItem.css";
import Navbar from "../Restaurant/Navbar";
import { API_BASE_URL } from "../../api/api";

export default function ViewItem() {
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

  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!id) {
      navigate("/res/menu");
      return;
    }

    axios.get(`${API_BASE_URL}/restaurants/my-items/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("restaurant_token")}`
      }
    })
      .then(res => setItem(res.data))
      .catch(() => navigate("/res/menu"));

    let currentImageUrl = null;
    const fetchImage = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/restaurants/${id}/itemimg`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("restaurant_token")}`
          },
          responseType: "blob"
        });

        const blob = res.data;
        currentImageUrl = URL.createObjectURL(blob);
        setImageUrl(currentImageUrl);
      } catch (err) {
        console.error("Image loading error:", err);
        setImageUrl(null);
      }
    };

    fetchImage();

    return () => {
      if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    };
  }, [id, navigate]);

  return (
    <>
      <Navbar />

      <div className="view-item-wrapper fade-in">
        <div className="view-item-card">
          {/* Hero Image */}
          <div className="view-item-image">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.itemName}
                className="item-image"
              />
            ) : (
              <div className="no-image-placeholder">
                <p>No Image Available</p>
              </div>
            )}
            <div className={`status-badge ${item.available ? 'available' : 'unavailable'}`}>
              {item.available ? 'Available' : 'Unavailable'}
            </div>
          </div>

          <div className="view-item-body">
            {/* Title & Price */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="item-title">{item.itemName}</h2>
              <span className="item-price">₹{item.price}</span>
            </div>

            {/* Badges */}
            <div className="item-badges mb-3">
              <span className="badge-pill category">{item.category || "Uncategorized"}</span>
              <span className="badge-pill type">{item.type || "General"}</span>
              {item.serves && <span className="badge-pill serves">Serves: {item.serves}</span>}
            </div>

            <hr className="divider" />

            {/* Description */}
            <div className="item-description mb-4">
              <h5 className="section-title">Description</h5>
              <p>{item.description || "No description provided for this item."}</p>
            </div>

            {/* Actions */}
            <div className="view-actions d-flex gap-2 justify-content-center">
              <button
                className="btn btn-outline-secondary px-4"
                onClick={() => navigate("/res/menu")}
              >
                Back to Menu
              </button>
              <Link
                to={`/res/item/edit/${id}`}
                className="btn btn-primary px-4"
              >
                Edit Item
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
