import type { Metadata } from 'next';
import {
  DeliciousSection,
  DescBanner,
  Discover,
  HeroBanner,
  MoreToKnow,
} from '../components';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr-FR',
    },
  },
  icons: {
    icon: '/favicon.webp',
  },
  title: 'Accueil | Indian Coffee - Fast food indien à Savigny le Temple',
  description:
    'Dégustez des plats rapides et délicieux de la cuisine indienne au restaurant fast food Indian Coffee à Savigny le Temple',
  openGraph: {
    title: 'Accueil | Indian Coffee - Fast food indien à Savigny le Temple',
    description:
      'Dégustez des plats rapides et délicieux de la cuisine indienne au restaurant fast food Indian Coffee à Savigny le Temple',
    siteName: 'Indian Coffee',
    locale: 'fr',
    url: 'https://indiancoffee.fr/',
  },
};

const page = () => {
  return (
    <div>
      <HeroBanner />
      <Discover />
      <DescBanner />
      <DeliciousSection />
      {/* <SpecialDay /> */}
      <MoreToKnow />
      <section className='flex justify-center items-center pb-12 sm:px-8 px-4'>
        <iframe
          width='1500'
          height='600'
          id='gmap_canvas'
          src="https://maps.google.com/maps?width=200&amp;height=200&amp;hl=fr&amp;q=8%20impasse%20de%20l'or%C3%A9e%20du%20bois%20Savigny%20Le%20Tempe+(Restaurant%20-%20Indian%20Cofee)&amp;t=&amp;z=12&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
          className='rounded-xl'
          title='Indian Coffee Restaurant Location Map'
        />
      </section>
    </div>
  );
};

export default page;
