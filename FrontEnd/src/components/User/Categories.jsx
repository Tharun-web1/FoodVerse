import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../UserCss/categories.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Biryani from "../../assets/images/biryani.jpg";
import Pizza from "../../assets/images/pizza.jpg";
import Burger from "../../assets/images/burger.jpg";
import Cake from "../../assets/images/cake.jpg";
import IceCream from "../../assets/images/icecream.jpg";
import Chinese from "../../assets/images/chinese.jpg";
import SouthIndian from "../../assets/images/southindian.jpg";
import Starter from "../../assets/images/starter.jpg";
import Desert from "../../assets/images/desert.jpg";
import Juice from "../../assets/images/mocktail.jpg";

const Categories = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const categories = [
    { name: "Biryani", key: "biryani", img: Biryani },
    { name: "Pizza", key: "pizza", img: Pizza },
    { name: "Burger", key: "burger", img: Burger },
    { name: "Cakes", key: "cakes", img: Cake },
    { name: "Desserts", key: "desserts", img: Desert },
    { name: "Ice Cream", key: "ice_cream", img: IceCream },
    { name: "Chinese", key: "chinese", img: Chinese },
    { name: "South Indian", key: "south_indian", img: SouthIndian },
    { name: "Starters", key: "starters", img: Starter },
    { name: "Juice", key: "juice", img: Juice },
  ];

  const scroll = (direction) => {
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h2>{t("whats_on_mind")}</h2>
        <div className="scroll-buttons">
          <button className="scroll-btn" onClick={() => scroll("left")}><FiChevronLeft /></button>
          <button className="scroll-btn" onClick={() => scroll("right")}><FiChevronRight /></button>
        </div>
      </div>

      <div className="categories-wrapper" ref={scrollRef}>
        <div className="categories-list">
          {categories.map((cat, index) => (
            <div
              className="category-item"
              key={index}
              onClick={() =>
                navigate(`/category/${cat.name}`)
              }
            >
              <div className="image-container">
                <img src={cat.img} alt={t(cat.key)} />
                <div className="image-overlay"></div>
              </div>
              <span className="category-name">{t(cat.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
