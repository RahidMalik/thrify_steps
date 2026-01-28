import { Truck, RotateCcw, Shield, CreditCard } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Fast Nationwide Shipping",
    description: "Free delivery on orders above Rs. 5,000",
  },
  {
    icon: CreditCard,
    title: "Cash on Delivery",
    description: "Pay when you receive your order",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day hassle-free return policy",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "100% secure checkout process",
  },
];

const TrustBadges = () => {
  return (
    <section className="py-12 md:py-16 bg-background border-y border-border">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-start gap-4 text-center sm:text-left"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <badge.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  {badge.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
