import Image from 'next/image';
export default function Benefits() {
  const benefits = [
    { title: 'Free Worldwide Shipping', desc: 'On all orders over $150. Fast, tracked delivery to your door.', img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=120&q=80' },
    { title: 'Authentic & Premium', desc: 'Every piece is verified for quality and authenticity before dispatch.', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&q=80' },
    { title: '30-Day Returns', desc: 'Not satisfied? Return within 30 days, no questions asked.', img: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=120&q=80' },
    { title: 'Secure Checkout', desc: 'Your payment and personal data are always protected with us.', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=120&q=80' },
  ];
  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b) => (
            <div key={b.title} className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                <Image src={b.img} alt={b.title} fill className="object-cover" unoptimized />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
                <p className="mt-1 text-sm text-secondary">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
