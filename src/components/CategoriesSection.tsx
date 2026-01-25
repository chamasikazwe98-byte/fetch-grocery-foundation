import CategoryCard from "./CategoryCard";

const categories = [
  { name: "Fruits", emoji: "🍎", itemCount: 156, color: "hsl(0 85% 97%)" },
  { name: "Vegetables", emoji: "🥦", itemCount: 203, color: "hsl(142 60% 95%)" },
  { name: "Dairy", emoji: "🥛", itemCount: 89, color: "hsl(45 90% 96%)" },
  { name: "Bakery", emoji: "🍞", itemCount: 67, color: "hsl(30 80% 95%)" },
  { name: "Meat", emoji: "🥩", itemCount: 124, color: "hsl(0 60% 96%)" },
  { name: "Seafood", emoji: "🐟", itemCount: 78, color: "hsl(200 70% 96%)" },
  { name: "Frozen", emoji: "❄️", itemCount: 145, color: "hsl(210 80% 97%)" },
  { name: "Snacks", emoji: "🍿", itemCount: 234, color: "hsl(50 80% 96%)" },
];

const CategoriesSection = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Shop by category
            </h2>
            <p className="mt-1 text-muted-foreground">
              Browse our most popular categories
            </p>
          </div>
          <button className="text-sm font-semibold text-primary hover:underline">
            View all →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CategoryCard {...category} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
