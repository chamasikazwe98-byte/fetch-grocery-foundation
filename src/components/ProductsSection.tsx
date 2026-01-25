import ProductCard from "./ProductCard";

const products = [
  {
    name: "Organic Bananas",
    price: 2.49,
    unit: "1 bunch (~2 lb)",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    badge: "Organic",
  },
  {
    name: "Fresh Strawberries",
    price: 4.99,
    originalPrice: 6.99,
    unit: "16 oz container",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop",
    badge: "Sale",
  },
  {
    name: "Avocados",
    price: 1.29,
    unit: "Each",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop",
  },
  {
    name: "Whole Milk",
    price: 3.99,
    unit: "1 gallon",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
  },
  {
    name: "Free-Range Eggs",
    price: 5.49,
    unit: "12 count",
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
    badge: "Popular",
  },
  {
    name: "Sourdough Bread",
    price: 4.29,
    unit: "1 loaf",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
  },
  {
    name: "Baby Spinach",
    price: 3.99,
    unit: "5 oz bag",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
    badge: "Organic",
  },
  {
    name: "Atlantic Salmon",
    price: 12.99,
    originalPrice: 15.99,
    unit: "1 lb fillet",
    image: "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=400&fit=crop",
    badge: "Fresh",
  },
];

const ProductsSection = () => {
  return (
    <section className="py-16 bg-secondary/20">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Popular right now
            </h2>
            <p className="mt-1 text-muted-foreground">
              Trending items our customers love
            </p>
          </div>
          <button className="text-sm font-semibold text-primary hover:underline">
            View all →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <div
              key={product.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
