import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-surface-dark text-surface-dark-foreground">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tighter">
                Thrifty<span className="text-primary">Steps</span>
              </span>
            </Link>
            <p className="text-surface-dark-foreground/70 text-sm leading-relaxed">
              Discover your perfect pair of thrifted shoes. Quality pre-owned footwear at unbeatable prices.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <div className="flex flex-col gap-3">
              <Link to="/sneakers" className="text-surface-dark-foreground/70 hover:text-primary transition-colors text-sm">
                Sneakers
              </Link>
              <Link to="/joggers" className="text-surface-dark-foreground/70 hover:text-primary transition-colors text-sm">
                Joggers
              </Link>
              <Link to="/about" className="text-surface-dark-foreground/70 hover:text-primary transition-colors text-sm">
                About Us
              </Link>
              <Link to="/contact" className="text-surface-dark-foreground/70 hover:text-primary transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Customer Service</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-surface-dark-foreground/70 hover:text-primary transition-colors text-sm">
                Track Order
              </a>
              <a href="#" className="text-surface-dark-foreground/70 hover:text-primary transition-colors text-sm">
                Shipping Policy
              </a>
              <a href="#" className="text-surface-dark-foreground/70 hover:text-primary transition-colors text-sm">
                Returns & Exchange
              </a>
              <a href="#" className="text-surface-dark-foreground/70 hover:text-primary transition-colors text-sm">
                Size Guide
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-surface-dark-foreground/70 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Lahore, Pakistan</span>
              </div>
              <div className="flex items-center gap-3 text-surface-dark-foreground/70 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-3 text-surface-dark-foreground/70 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>hello@thriftysteps.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-surface-dark-foreground/50 text-sm">
              © 2024 Thrifty Steps. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-surface-dark-foreground/50 text-xs">
              <span>Cash on Delivery</span>
              <span>•</span>
              <span>JazzCash</span>
              <span>•</span>
              <span>EasyPaisa</span>
              <span>•</span>
              <span>Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
