import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-2xl font-bold">
              Titan<span className="text-gold">.</span>
            </Link>
            <p className="mt-3 text-white/60 text-sm leading-relaxed">
              Timeless elegance, modern craftsmanship. Premium fashion for the discerning individual.
            </p>
          </div>
          {[
            { heading: 'Shop', links: [['All Products', '/shop'], ['Men', '/category/men'], ['Women', '/category/women'], ['Accessories', '/category/accessories']] },
            { heading: 'Account', links: [['Sign In', '/auth/signin'], ['Sign Up', '/auth/signup'], ['My Orders', '/orders'], ['Wishlist', '/wishlist']] },
            { heading: 'Company', links: [['About', '#'], ['Careers', '#'], ['Contact', '#'], ['Privacy Policy', '#']] },
          ].map(section => (
            <div key={section.heading}>
              <h3 className="font-semibold text-sm mb-4">{section.heading}</h3>
              <ul className="space-y-2">
                {section.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-white/60 text-sm hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2025 Titan. All rights reserved.</p>
          <p className="text-white/40 text-xs">Built with Next.js · Designed for excellence</p>
        </div>
      </div>
    </footer>
  );
}
