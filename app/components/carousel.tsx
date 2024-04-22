import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import "../assets/css/embla.css";

type PropType = {
  options?: EmblaOptionsType;
}

const OPTIONS: EmblaOptionsType = { loop: true };

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options || OPTIONS, [Autoplay()]);

  // รูปภาพที่ต้องการแสดงใน carousel
  const images = [
    "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/promotions/1.png",
    "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/promotions/2.png",
  ];

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {images.map((imageUrl, index) => (
            <div className="embla__slide" key={index}>
              <img src={imageUrl} alt={`Slide ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EmblaCarousel;
