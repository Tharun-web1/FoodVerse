import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Video25Off from "../../assets/images/offer_25.mp4";
import Video50Off from "../../assets/images/offer_50.mp4";
import Video60Off from "../../assets/images/offer_60.mp4";

const Carousel = ({ restaurants = [], onSlideChange, onSelectOffer }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const slides = useMemo(() => {
    const videoSlides = [];

    // Collect all promoOffer strings from restaurants
    const promoStrings = (restaurants || [])
      .map((r) => (r.promoOffer || "").toUpperCase())
      .filter(Boolean);

    // Check item-level offers
    (restaurants || []).forEach((r) => {
      if (r.items && Array.isArray(r.items)) {
        r.items.forEach((item) => {
          if (item.offerActive && item.discountPercentage > 0) {
            promoStrings.push(`${Math.round(item.discountPercentage)}% OFF`);
          }
        });
      }
    });

    const has25 = promoStrings.some((str) => str.includes("25%"));
    const has50 = promoStrings.some((str) => str.includes("50%"));
    const has60 = promoStrings.some((str) => str.includes("60%"));

    if (has25) {
      videoSlides.push({
        id: "offer-25",
        offerValue: "25%",
        video: Video25Off,
        gradient: "linear-gradient(135deg, #e11d48 0%, #be123c 60%, #881337 100%)"
      });
    }

    if (has50) {
      videoSlides.push({
        id: "offer-50",
        offerValue: "50%",
        video: Video50Off,
        gradient: "linear-gradient(135deg, #d97706 0%, #b45309 60%, #78350f 100%)"
      });
    }

    if (has60) {
      videoSlides.push({
        id: "offer-60",
        offerValue: "60%",
        video: Video60Off,
        gradient: "linear-gradient(135deg, #059669 0%, #047857 60%, #064e3b 100%)"
      });
    }

    // Fallback: If promoStrings exist but didn't match 25/50/60 exactly, map closest
    if (videoSlides.length === 0 && promoStrings.length > 0) {
      promoStrings.forEach((str) => {
        const match = str.match(/(\d+)%/);
        if (match) {
          const val = parseInt(match[1]);
          if (val <= 35 && !videoSlides.some((s) => s.id === "offer-25")) {
            videoSlides.push({
              id: "offer-25",
              offerValue: `${val}%`,
              video: Video25Off,
              gradient: "linear-gradient(135deg, #e11d48 0%, #be123c 60%, #881337 100%)"
            });
          } else if (val <= 55 && !videoSlides.some((s) => s.id === "offer-50")) {
            videoSlides.push({
              id: "offer-50",
              offerValue: `${val}%`,
              video: Video50Off,
              gradient: "linear-gradient(135deg, #d97706 0%, #b45309 60%, #78350f 100%)"
            });
          } else if (!videoSlides.some((s) => s.id === "offer-60")) {
            videoSlides.push({
              id: "offer-60",
              offerValue: `${val}%`,
              video: Video60Off,
              gradient: "linear-gradient(135deg, #059669 0%, #047857 60%, #064e3b 100%)"
            });
          }
        }
      });
    }

    return videoSlides;
  }, [restaurants]);

  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  useEffect(() => {
    if (onSlideChange && slides[current]) {
      onSlideChange(current, slides[current].gradient);
    }
  }, [current, slides, onSlideChange]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleSlideClick = (slide) => {
    navigate(`/offers/${encodeURIComponent(slide.offerValue)}`);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="carousel">
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          className={`carousel-slide ${index === current ? "active" : ""}`}
          onClick={() => handleSlideClick(slide)}
          style={{ cursor: "pointer" }}
        >
          <video
            className="carousel-video"
            src={slide.video}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      ))}

      {/* Controls - Only render if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button
            className="control prev"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Slide"
          >
            ‹
          </button>
          <button
            className="control next"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Slide"
          >
            ›
          </button>

          <div className="dots">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === current ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;
