import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "../RestaurantCss/Contact.css";
import contactImg from "../../assets/images/contact_illustration.svg";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    restaurantId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("restaurantId");
    if (id) {
      setFormData(prev => ({ ...prev, restaurantId: id }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      alert("Message sent successfully! We will get back to you shortly.");
      setFormData(prev => ({ ...prev, message: "" }));
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <div className="contact-wrapper container-fluid bg-light">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0 overflow-hidden rounded-4">
              <div className="row g-0">
                {/* Image Section */}
                <div className="col-md-6 bg-white d-none d-md-flex align-items-center justify-content-center p-5">
                  <div className="text-center">
                    <img
                      src={contactImg}
                      alt="Contact Support"
                      className="img-fluid mb-4"
                      style={{ maxHeight: "300px" }}
                    />
                    <h3 className="fw-bold text-dark">We're here to help!</h3>
                    <p className="text-muted">
                      Have questions about your orders or account? <br />
                      Our support team is just a message away.
                    </p>
                  </div>
                </div>

                {/* Form Section */}
                <div className="col-md-6 form-section bg-white p-5">
                  <div className="d-flex align-items-center mb-4">
                    <div className=" text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-envelope-fill"></i>
                    </div>
                    <h2 className="fw-bold mb-0">Contact Support</h2>
                  </div>

                  <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">YOUR NAME</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-muted small fw-bold">EMAIL ADDRESS</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-muted small fw-bold">MESSAGE</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
