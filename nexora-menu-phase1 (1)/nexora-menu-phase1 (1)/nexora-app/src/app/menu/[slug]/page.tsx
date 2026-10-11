import type { Metadata } from "next";
import { CustomerMenuView } from "@/components/customer/customer-menu-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fixture data standing in for a Prisma lookup by `restaurant.slug`.
// Phase 2 (Menu CRUD + public data layer) replaces this with a real
// query and calls `notFound()` for unknown slugs.
const fixtureMenu = {
  restaurantName: "Lumière Bistro",
  tagline: "Downtown · Open until 11:00 PM",
  rating: 4.8,
  hoursLabel: "Open now",
  whatsapp: "+15551234567",
  categories: ["Starters", "Mains", "Desserts", "Drinks"],
  products: [
    { id: "1", category: "Starters", name: "Truffle Arancini", description: "Crisp risotto, wild mushroom, parmesan crust.", price: 16, oldPrice: 19, thumb: "from-[#6b4a2f] to-[#3a2717]" },
    { id: "2", category: "Starters", name: "Burrata & Fig", description: "Aged balsamic reduction, toasted sourdough.", price: 14, thumb: "from-emerald-600 to-emerald-950" },
    { id: "3", category: "Starters", name: "Tuna Tartare", description: "Yuzu dressing, avocado, toasted sesame.", price: 19, thumb: "from-electric to-blue-900" },
    { id: "4", category: "Mains", name: "Wagyu Steak Frites", description: "Truffle butter, herb fries.", price: 42, thumb: "from-electric to-blue-900" },
    { id: "5", category: "Mains", name: "Truffle Risotto", description: "Aged parmesan, shaved black truffle.", price: 28, thumb: "from-[#6b4a2f] to-[#3a2717]" },
    { id: "6", category: "Mains", name: "Herb Roasted Chicken", description: "Confit garlic, natural jus.", price: 26, thumb: "from-emerald-600 to-emerald-950" },
    { id: "7", category: "Mains", name: "Seared Sea Bass", description: "Saffron beurre blanc.", price: 34, thumb: "from-violet-600 to-violet-950" },
    { id: "8", category: "Desserts", name: "Dark Chocolate Fondant", description: "Salted caramel, vanilla bean ice cream.", price: 12, thumb: "from-[#6b4a2f] to-[#3a2717]" },
    { id: "9", category: "Drinks", name: "Signature Old Fashioned", description: "Bourbon, orange bitters, smoked oak.", price: 17, thumb: "from-violet-600 to-violet-950" },
  ],
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${fixtureMenu.restaurantName} — Menu`,
    description: `View the live menu for ${fixtureMenu.restaurantName}, powered by NEXORA.`,
    // `slug` will key the real lookup once Phase 2 wires the database.
    other: { "x-nexora-slug": slug },
  };
}

export default async function CustomerMenuPage({ params }: PageProps) {
  await params;
  return <CustomerMenuView {...fixtureMenu} />;
}
