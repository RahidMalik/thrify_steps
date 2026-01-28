import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for subscribing! Check your email for updates.");
      setEmail("");
    }
  };

  return (
    <section className="section-padding bg-surface-dark text-surface-dark-foreground">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-primary font-medium mb-4">STAY UPDATED</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the STRIDE Community
          </h2>
          <p className="text-surface-dark-foreground/70 mb-8">
            Get exclusive access to new drops, special offers, and street style inspiration.
            Be the first to know about our latest collections.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10  text-surface-dark-foreground border-none placeholder:text-surface-dark-foreground/50"
              required
            />
            <Button type="submit" variant="hero" size="lg">
              Subscribe
            </Button>
          </form>
          <p className="text-xs text-surface-dark-foreground/50 mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
