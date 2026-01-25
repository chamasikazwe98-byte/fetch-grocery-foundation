const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
                <span className="text-xl font-bold text-primary-foreground">F</span>
              </div>
              <span className="text-xl font-bold text-foreground">Fetch</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Fresh groceries delivered to your door. Fast, reliable, and always fresh.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Safety center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookie policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Accessibility</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 Fetch. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📱</span>
            <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">🍎</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
