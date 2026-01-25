interface CategoryCardProps {
  name: string;
  emoji: string;
  itemCount: number;
  color: string;
}

const CategoryCard = ({ name, emoji, itemCount, color }: CategoryCardProps) => {
  return (
    <button
      className="group flex flex-col items-center gap-3 rounded-2xl bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-card hover:scale-[1.02] active:scale-[0.98]"
      style={{ backgroundColor: color }}
    >
      <span className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:animate-float">
        {emoji}
      </span>
      <div className="text-center">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{itemCount} items</p>
      </div>
    </button>
  );
};

export default CategoryCard;
