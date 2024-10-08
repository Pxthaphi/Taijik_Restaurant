import React, { useEffect, useState } from "react";
import { EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import "../assets/css/embla.css";
import { supabase } from "@/lib/supabase";

type PropType = {
  options?: EmblaOptionsType;
};

const OPTIONS: EmblaOptionsType = { loop: true };

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options || OPTIONS, [
    Autoplay(),
  ]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("Promotion_Images");

      if (error) {
        console.error("Error fetching promotions:", error);
      } else {
        // Assuming Promotion_Images is a text field that holds image URLs
        const imageUrls = data
          .map((promotion) => promotion.Promotion_Images)
          .filter(Boolean); // Filter out any undefined values
        setImages(imageUrls);
      }
    };

    fetchPromotions();
  }, []);

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container flex">
          {images.length > 0 ? (
            images.map((imageUrl, index) => (
              <div
                className="embla__slide w-full h-[13rem] flex items-center justify-center"
                key={index}
              >
                <img
                  src={`${imageUrl}?t=${new Date().getTime()}`}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <div className="embla__slide w-full h-64 flex items-center justify-center">
              <p>No images available.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;
