import { AppPageHeader } from "@/components/shared/app-page-header";
import { MenuBuilderView } from "@/components/menu-builder/menu-builder-view";
import { Button } from "@/components/ui/button";
import type { ProductCardData } from "@/components/menu-builder/product-card";

// Fixture data standing in for the Prisma-backed Category/Product
// queries that Phase 2 (Menu CRUD) will introduce.
const categories = [
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Mains" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
];

const productsByCategory: Record<string, ProductCardData[]> = {
  starters: [
    {
      id: "1",
      name: "Truffle Arancini",
      description: "Crisp risotto balls, wild mushroom, parmesan crust.",
      price: 16,
      oldPrice: 19,
      thumb: "from-[#6b4a2f] to-[#3a2717]",
      featured: true,
      available: true,
    },
    {
      id: "2",
      name: "Burrata & Fig",
      description: "Aged balsamic reduction, toasted sourdough.",
      price: 14,
      thumb: "from-emerald-600 to-emerald-950",
      available: true,
    },
    {
      id: "3",
      name: "Tuna Tartare",
      description: "Yuzu dressing, avocado, toasted sesame.",
      price: 19,
      thumb: "from-electric to-blue-900",
      available: false,
    },
    {
      id: "4",
      name: "Charred Octopus",
      description: "Smoked paprika oil, confit lemon, herbs.",
      price: 22,
      oldPrice: 26,
      thumb: "from-violet-600 to-violet-950",
      featured: true,
      available: true,
    },
    {
      id: "5",
      name: "Roasted Beet Salad",
      description: "Whipped goat cheese, candied walnut.",
      price: 13,
      thumb: "from-gold-light to-gold",
      available: true,
    },
  ],
  mains: [
    {
      id: "6",
      name: "Wagyu Steak Frites",
      description: "Truffle butter, herb fries.",
      price: 42,
      thumb: "from-electric to-blue-900",
      featured: true,
      available: true,
    },
    {
      id: "7",
      name: "Herb Roasted Chicken",
      description: "Confit garlic, natural jus.",
      price: 26,
      thumb: "from-emerald-600 to-emerald-950",
      available: true,
    },
  ],
  desserts: [
    {
      id: "8",
      name: "Dark Chocolate Fondant",
      description: "Salted caramel, vanilla bean ice cream.",
      price: 12,
      thumb: "from-[#6b4a2f] to-[#3a2717]",
      available: true,
    },
  ],
  drinks: [
    {
      id: "9",
      name: "Signature Old Fashioned",
      description: "Bourbon, orange bitters, smoked oak.",
      price: 17,
      thumb: "from-violet-600 to-violet-950",
      available: true,
    },
  ],
};

export default function MenuBuilderPage() {
  return (
    <>
      <AppPageHeader
        title="Menu Builder"
        description="Drag to reorder, toggle availability, and manage pricing in real time."
        action={<Button variant="gold">+ Add Product</Button>}
      />
      <MenuBuilderView categories={categories} productsByCategory={productsByCategory} />
    </>
  );
}
