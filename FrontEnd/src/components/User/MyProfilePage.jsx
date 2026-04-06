import { useState } from "react";
import EditProfile from "../User/EditProfile";
import MyAddress from "../User/MyAddress";
import MyOrders from "../User/MyOrders";
import "../UserCss/MyProfilePage.css";
import Navbar from "../User/Navbar";
import FloatingMap from "./FloatingMap";
import { useTranslation } from "react-i18next";

const MyProfilePage = () => {
    const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("profile");

  return (

    <>
      <Navbar />
      <div className="my-profile-page">

        {/* LEFT MENU */}
        <div className="profile-menu">
          <div
            className={`menu-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <i className="fa-solid fa-user-pen"></i>
            <span>{t("edit_profile")}</span>
          </div>

          <div
            className={`menu-item ${activeTab === "address" ? "active" : ""}`}
            onClick={() => setActiveTab("address")}
          >
            <i className="fa-solid fa-location-dot"></i>
            <span>{t("my_addresses")}</span>
          </div>

          <div
            className={`menu-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <i className="fa-solid fa-clipboard-list"></i>
            <span>{t("my_orders")}</span>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="profile-content">
          {activeTab === "profile" && <EditProfile />}
          {activeTab === "address" && <MyAddress />}
          {activeTab === "orders" && <MyOrders isProfile={true} />}
        </div>
      </div>
      <FloatingMap />
    </>
  );
};

export default MyProfilePage;
