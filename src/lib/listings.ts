import { Briefcase, Building2, Car, Home, Laptop, MapPin } from "lucide-react";

const mediaApiUrl = process.env.NEXT_PUBLIC_MEDIA_API_URL ?? "http://localhost:8001";

export const categories = [
  { name: "Vehicles", count: "24.5k ads", Icon: Car },
  { name: "Property", count: "12.1k ads", Icon: Building2 },
  { name: "Electronics", count: "18.2k ads", Icon: Laptop },
  { name: "Home", count: "8.4k ads", Icon: Home },
  { name: "Jobs", count: "3.2k ads", Icon: Briefcase },
  { name: "Land", count: "2.8k ads", Icon: MapPin }
];

export type PublicListing = {
  id: string;
  title: string;
  price: string;
  category: string;
  meta: string;
  description: string;
  image: string;
  badge: string;
};

type AdvertisementApiResponse = {
  data: {
    id: string;
    title: string;
    price: string;
    category: string;
    location: string;
    description: string;
    image_url: string;
    status: string;
  }[];
  error: null | unknown;
};

export const featuredListings: PublicListing[] = [
  {
    id: "seed-land-cruiser",
    category: "Vehicles",
    description: "Verified premium vehicle listing.",
    title: "Toyota Land Cruiser V8 2018",
    price: "Rs. 45,000,000",
    meta: "Colombo 7 • Used • 35,000 km",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    badge: "Verified"
  },
  {
    id: "seed-house",
    category: "Property",
    description: "Modern family house with garden.",
    title: "Modern 4BR House for Sale",
    price: "Rs. 45,000,000",
    meta: "Kandy • 4 bedrooms • Garden",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80",
    badge: "Premium"
  },
  {
    id: "seed-iphone",
    category: "Electronics",
    description: "Like-new phone with warranty.",
    title: "iPhone 14 Pro 256GB",
    price: "Rs. 265,000",
    meta: "Galle • Like new • Warranty",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=900&q=80",
    badge: "Urgent"
  }
];

export async function getFeaturedListings(): Promise<PublicListing[]> {
  try {
    const response = await fetch(`${mediaApiUrl}/api/v1/advertisements`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return featuredListings;
    }

    const body = (await response.json()) as AdvertisementApiResponse;
    if (body.error || body.data.length === 0) {
      return featuredListings;
    }

    return body.data.map((advertisement) => ({
      id: advertisement.id,
      title: advertisement.title,
      price: advertisement.price,
      category: advertisement.category,
      meta: `${advertisement.location} • ${advertisement.category}`,
      description: advertisement.description,
      image: advertisement.image_url,
      badge: advertisement.status === "active" ? "New" : advertisement.status
    }));
  } catch {
    return featuredListings;
  }
}
