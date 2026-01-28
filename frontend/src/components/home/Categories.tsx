import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import sneaker3 from "@/assets/sneaker-3.jpg";
import jogger3 from "@/assets/jogger-3.jpg";

const Categories = () => {
  return (
    <section className="section-padding bg-secondary">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="text-primary font-medium mb-2">COLLECTIONS</p>
          <h2 className="text-3xl md:text-4xl font-bold">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Sneakers Category */}
          <Link
            to="/products/sneakers"
            className="group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/10] card-hover"
          >
            <img
              src={sneaker3}
              alt="Sneakers collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-primary text-sm font-medium mb-2">COLLECTION</p>
              <h3 className="text-surface-dark-foreground text-2xl md:text-3xl font-bold mb-4">
                Sneakers
              </h3>
              <div className="flex items-center gap-2 text-surface-dark-foreground/80 group-hover:text-primary transition-colors">
                <span className="text-sm font-medium">Shop Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </Link>

          {/* Joggers Category */}
          <Link
            to="/products/joggers"
            className="group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-[16/10] card-hover"
          >
            <img
              src={jogger3}
              alt="Joggers collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-primary text-sm font-medium mb-2">COLLECTION</p>
              <h3 className="text-surface-dark-foreground text-2xl md:text-3xl font-bold mb-4">
                Joggers
              </h3>
              <div className="flex items-center gap-2 text-surface-dark-foreground/80 group-hover:text-primary transition-colors">
                <span className="text-sm font-medium">Shop Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;
