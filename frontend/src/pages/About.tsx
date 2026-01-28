import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import heroImage from "@/assets/hero-main.jpg";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="About STRIDE"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/70" />
          </div>
          <div className="relative container-custom text-center text-surface-dark-foreground">
            <p className="text-primary font-medium mb-4 animate-fade-up opacity-0 stagger-1">
              OUR STORY
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-up opacity-0 stagger-2">
              About STRIDE
            </h1>
            <p className="text-lg md:text-xl text-surface-dark-foreground/80 max-w-2xl mx-auto animate-fade-up opacity-0 stagger-3">
              We believe comfort and style should never be a compromise.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="section-padding bg-background">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-12">
                {/* Mission */}
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Founded in the heart of Pakistan, STRIDE was born from a simple belief: 
                    that premium streetwear should be accessible to everyone. We're on a mission 
                    to bring the best quality joggers and sneakers to the urban youth of Pakistan, 
                    without the premium price tag.
                  </p>
                </div>

                {/* Quality */}
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold">Quality First</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Every piece in our collection is carefully selected and tested for comfort, 
                    durability, and style. We work directly with manufacturers to ensure the 
                    highest quality standards, using premium materials that feel as good as they look.
                  </p>
                </div>

                {/* Local Pride */}
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold">Made for Pakistan</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We understand the local market. That's why we offer Cash on Delivery, 
                    local sizing that actually fits, and fast nationwide shipping. Whether 
                    you're in Karachi, Lahore, Islamabad, or anywhere in between – we've got you covered.
                  </p>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                  <div className="text-center p-6 bg-card rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">5K+</div>
                    <p className="text-muted-foreground">Happy Customers</p>
                  </div>
                  <div className="text-center p-6 bg-card rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">100+</div>
                    <p className="text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center p-6 bg-card rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">50+</div>
                    <p className="text-muted-foreground">Cities Delivered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
