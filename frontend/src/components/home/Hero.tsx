import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-main.jpg";

const Hero = () => {
  return (
    <section className="relative md:mt-10 lg:mt-20 min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={heroImage}
          alt="Streetwear lifestyle"
          className="w-full h-full object-cover scale-110 lg:scale-110 md:scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent object-center" />
      </div>

      {/* Content */}
      <div className="relative container-custom py-32 md:py-0">
        <div className="max-w-2xl text-surface-dark-foreground">
          <p className="text-primary font-medium mt-4 animate-fade-up opacity-0 stagger-1">
            NEW COLLECTION 2026
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up opacity-0 stagger-2">
            Street Comfort.
            <br />
            <span className="text-gradient">Everyday Style.</span>
          </h1>
          <p className="text-lg md:text-xl text-surface-dark-foreground/80 mb-8 max-w-lg animate-fade-up opacity-0 stagger-3">
            Premium joggers and sneakers designed for the modern urban lifestyle.
            Comfort meets confidence on every step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up opacity-0 stagger-4">
            <Link to="/sneakers">
              <Button variant="hero" size="xl">
                Shop Sneakers
              </Button>
            </Link>
            <Link to="/joggers">
              <Button variant="heroOutline" size="xl">
                Shop Joggers
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center md:mb-8 items-center gap-6 mt-12 pt-8 border-t border-white/20 animate-fade-up opacity-0 stagger-5">
            <div className="text-sm">
              <span className="text-primary font-semibold">Free Shipping</span>
              <span className="text-surface-dark-foreground/60 ml-2">Nationwide</span>
            </div>
            <div className="text-sm">
              <span className="text-primary font-semibold">COD</span>
              <span className="text-surface-dark-foreground/60 ml-2">Available</span>
            </div>
            <div className="text-sm">
              <span className="text-primary font-semibold">Easy Returns</span>
              <span className="text-surface-dark-foreground/60 ml-2">7 Days</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
