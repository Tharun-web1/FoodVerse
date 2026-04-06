import { useEffect, useState } from "react";
import Biryani from "../../assets/images/biryani.jpg";
import Pizza from "../../assets/images/pizza.jpg";
import Starter from "../../assets/images/starter.jpg";
import { useTranslation } from "react-i18next";

const Carousel = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      img: Pizza,
      title: t("carousel_title_1"),
      subtitle: t("carousel_subtitle_1")
    },
    {
      img: Biryani,
      title: t("carousel_title_2"),
      subtitle: t("carousel_subtitle_2")
    },
    {
      img: Starter,
      title: t("carousel_title_3"),
      subtitle: t("carousel_subtitle_3")
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  return (
    <div className="carousel">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`carousel-slide ${index === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.img})` }}
        >
          <div className="carousel-overlay">
            <h2>{slide.title}</h2>
            <p>{slide.subtitle}</p>
            <button>{t("order_now")}</button>
          </div>
        </div>
      ))}

      {/* Controls */}
      <button className="control prev" onClick={prevSlide}>‹</button>
      <button className="control next" onClick={nextSlide}>›</button>

      {/* Dots */}
      <div className="dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
