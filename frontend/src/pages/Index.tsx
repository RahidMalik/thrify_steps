import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Categories from "@/components/home/Categories";
import TrustBadges from "@/components/home/TrustBadges";
import NewArrivals from "@/components/home/NewArrivals";
import Newsletter from "@/components/home/Newsletter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <TrustBadges />
        <FeaturedProducts />
        <Categories />
        <NewArrivals />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
