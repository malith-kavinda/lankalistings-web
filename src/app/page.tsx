import { ArrowRight, Heart, MapPin, PlusCircle, Search } from "lucide-react";
import { categories, getFeaturedListings } from "@/lib/listings";

export default async function Home() {
  const featuredListings = await getFeaturedListings();

  return (
    <main>
      <header className="sticky top-0 z-20 border-b border-outline-variant bg-surface-lowest/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-content items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-10">
            <div className="text-xl font-extrabold tracking-tight text-navy">LankaListings</div>
            <nav className="hidden items-center gap-6 text-sm font-semibold text-on-surface-variant lg:flex">
              <a href="#">Browse Categories</a>
              <a href="#">How it Works</a>
              <a href="#">Safety Tips</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-md px-4 py-2 text-sm font-bold text-on-surface sm:block">Sign In</button>
            <button className="flex items-center gap-2 rounded-md bg-emerald px-4 py-3 text-sm font-extrabold text-white">
              <PlusCircle size={18} />
              Post Your Ad
            </button>
          </div>
        </div>
      </header>

      <section className="border-b border-surface-highest bg-surface py-16 lg:py-24">
        <div className="mx-auto max-w-content px-5 text-center lg:px-8">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-normal text-on-surface md:text-6xl">
            Find what matters, <span className="text-emerald">close to home.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-on-surface-variant">
            The trusted marketplace for Sri Lanka. Discover verified listings across vehicles, property, jobs, and everyday essentials.
          </p>
          <div className="mx-auto mt-10 grid max-w-5xl gap-2 rounded-xl border border-surface-highest bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] md:grid-cols-[1fr_220px_180px_auto]">
            <label className="flex h-14 items-center gap-3 rounded-md border border-surface-high bg-surface px-4">
              <Search size={20} className="text-on-surface-variant" />
              <input className="w-full bg-transparent outline-none" placeholder="What are you looking for?" />
            </label>
            <select className="h-14 rounded-md border border-surface-high bg-surface px-4 outline-none">
              <option>All Categories</option>
              <option>Vehicles</option>
              <option>Property</option>
              <option>Electronics</option>
            </select>
            <select className="h-14 rounded-md border border-surface-high bg-surface px-4 outline-none">
              <option>All Sri Lanka</option>
              <option>Colombo</option>
              <option>Kandy</option>
              <option>Galle</option>
            </select>
            <button className="flex h-14 items-center justify-center gap-2 rounded-md bg-emerald px-8 font-bold text-white">
              Search <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-5 py-14 lg:px-8">
        <div className="mb-8 flex items-end justify-between border-b border-surface-high pb-3">
          <h2 className="text-3xl font-bold text-on-surface">Explore Categories</h2>
          <a className="flex items-center gap-1 text-sm font-bold text-emerald" href="#">
            View all <ArrowRight size={16} />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map(({ name, count, Icon }) => (
            <a key={name} className="rounded-lg border border-surface-high bg-white p-5 transition hover:border-emerald hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)]" href="#">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint/20 text-emerald">
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-on-surface">{name}</h3>
              <p className="mt-1 font-metadata text-xs text-on-surface-variant">{count}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-surface-low py-14">
        <div className="mx-auto max-w-content px-5 lg:px-8">
          <h2 className="text-3xl font-bold text-on-surface">Premium Deals</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredListings.map((listing) => (
              <article key={listing.id} className="overflow-hidden rounded-lg border border-surface-high bg-white">
                <div className="relative h-56">
                  <img src={listing.image} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-md bg-white/90 px-3 py-1 text-xs font-bold uppercase text-emerald">{listing.badge}</span>
                  <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-on-surface-variant">
                    <Heart size={18} />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-2xl font-extrabold text-navy">{listing.price}</p>
                  <h3 className="mt-2 text-lg font-bold">{listing.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-on-surface-variant">
                    <MapPin size={16} /> {listing.meta}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
