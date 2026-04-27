import React from 'react';
import hikvisionLogo from '../../assets/brands/security/hikvision.svg';
import dahuaLogo from '../../assets/brands/security/dahua.svg';
import cpPlusLogo from '../../assets/brands/security/cp-plus.svg';
import boschSecurityLogo from '../../assets/brands/security/bosch-security.svg';
import panasonicLogo from '../../assets/brands/lighting/panasonic.svg';
import philipsHueLogo from '../../assets/brands/lighting/philips-hue.svg';
import yaleLogo from '../../assets/brands/locks/yale.svg';
import hafeleLogo from '../../assets/brands/locks/hafele.svg';
import autozonLogo from '../../assets/brands/controls/autozon.svg';
import schneiderLogo from '../../assets/brands/controls/schneider-electric.svg';
import legrandLogo from '../../assets/brands/controls/legrand.svg';

type Brand = {
  name: string;
  category: 'Security' | 'Lighting' | 'Locks' | 'Controls';
  tier: 'core' | 'premium';
  website: string;
  logo: string;
};

const brands: Brand[] = [
  {
    name: 'Hikvision',
    category: 'Security',
    tier: 'core',
    website: 'https://www.hikvision.com',
    logo: hikvisionLogo,
  },
  {
    name: 'Dahua',
    category: 'Security',
    tier: 'core',
    website: 'https://www.dahuasecurity.com',
    logo: dahuaLogo,
  },
  {
    name: 'CP Plus',
    category: 'Security',
    tier: 'core',
    website: 'https://www.cpplusworld.com',
    logo: cpPlusLogo,
  },
  {
    name: 'Panasonic',
    category: 'Lighting',
    tier: 'core',
    website: 'https://www.panasonic.com',
    logo: panasonicLogo,
  },
  {
    name: 'Yale',
    category: 'Locks',
    tier: 'core',
    website: 'https://www.yalehome.com',
    logo: yaleLogo,
  },
  {
    name: 'Autozon',
    category: 'Controls',
    tier: 'core',
    website: 'https://www.autozon.co.in',
    logo: autozonLogo,
  },
  {
    name: 'Bosch Security',
    category: 'Security',
    tier: 'premium',
    website: 'https://www.boschsecurity.com',
    logo: boschSecurityLogo,
  },
  {
    name: 'Philips Hue',
    category: 'Lighting',
    tier: 'premium',
    website: 'https://www.philips-hue.com',
    logo: philipsHueLogo,
  },
  {
    name: 'Hafele',
    category: 'Locks',
    tier: 'premium',
    website: 'https://www.hafele.com',
    logo: hafeleLogo,
  },
  {
    name: 'Schneider Electric',
    category: 'Controls',
    tier: 'premium',
    website: 'https://www.se.com',
    logo: schneiderLogo,
  },
  {
    name: 'Legrand',
    category: 'Controls',
    tier: 'premium',
    website: 'https://www.legrand.com',
    logo: legrandLogo,
  },
];

export default function BrandsMarquee() {
  const coreItems = brands.filter((brand) => brand.tier === 'core');
  const premiumItems = brands.filter((brand) => brand.tier === 'premium');

  const doubledCoreItems = [...coreItems, ...coreItems];
  const doubledPremiumItems = [...premiumItems, ...premiumItems];

  return (
    <section id="brands" className="rounded-[32px] border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] gold-text">Collaborator Brands</p>
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-black">
            Authorized distributors and premium partners
          </h2>
        </div>
        <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Security, Lighting, Locks, Controls
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['Security', 'Lighting', 'Locks', 'Controls'].map((category) => (
          <span
            key={category}
            className="rounded-full border gold-border bg-[#faf8ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-600"
          >
            {category}
          </span>
        ))}
      </div>

      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] gold-text">Core Collaborator Brands</p>
      <div className="brand-marquee-mask relative overflow-hidden rounded-2xl border gold-border bg-[#f8f8f8] py-4">
        <div className="brand-marquee-track flex w-max items-center gap-4 px-4">
          {doubledCoreItems.map((brand, index) => (
            <a
              key={`${brand.name}-${index}`}
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="group flex h-16 min-w-[190px] items-center justify-center rounded-xl border border-gray-200 bg-white px-5 transition-all hover:border-[#d4af37] hover:shadow-sm"
              aria-label={`${brand.name} website`}
              title={brand.name}
            >
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="h-8 w-auto object-contain grayscale transition duration-300 group-hover:grayscale-0"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>

      <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.2em] gold-text">Premium Brand Row</p>
      <div className="brand-marquee-mask relative overflow-hidden rounded-2xl border gold-border bg-[#f8f8f8] py-4">
        <div className="brand-marquee-track brand-marquee-track--reverse flex w-max items-center gap-4 px-4">
          {doubledPremiumItems.map((brand, index) => (
            <a
              key={`${brand.name}-premium-${index}`}
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="group flex h-16 min-w-[210px] items-center justify-center rounded-xl border border-gray-200 bg-white px-5 transition-all hover:border-[#d4af37] hover:shadow-sm"
              aria-label={`${brand.name} website`}
              title={brand.name}
            >
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                className="h-8 w-auto object-contain grayscale transition duration-300 group-hover:grayscale-0"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
