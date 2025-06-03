import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

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
  title: 'Menu | Indian Coffee - Notre carte',
  description:
    'La carte du restaurant Indian Coffee à Savigny le Temple, retrouvez tous nos plats que ce soit à emporter ou sur place.',
  openGraph: {
    title: 'Menu | Indian Coffee - Notre carte',
    description:
      'La carte du restaurant Indian Coffee à Savigny le Temple, retrouvez tous nos plats que ce soit à emporter ou sur place.',
    siteName: 'Indian Coffee',
    locale: 'fr',
    url: 'https://indiancoffee.fr/',
  },
};

const menuItems = [
  {
    name: 'Menus',
    link: '/menu/menus',
    img: 'bg-image-menu',
    imgPath: '/Poulet-Tikka.webp',
  },
  {
    name: 'Entrées',
    link: '/menu/entrees',
    img: 'bg-image-entry',
    imgPath: '/Rolls.webp',
  },
  {
    name: 'Plats',
    link: '/menu/plats',
    img: 'bg-image-plats',
    imgPath: '/Kottu-Roti.webp',
  },
  {
    name: 'Spécialités',
    link: '/menu/specialites',
    img: 'bg-image-special',
    imgPath: '/Le-butter-chicken.webp',
  },
  {
    name: 'Plats végétariens',
    link: '/menu/plats-vegetariens',
    img: 'bg-image4',
    imgPath: '/cover4.webp',
  },
  {
    name: 'Desserts',
    link: '/menu/desserts',
    img: 'bg-image-desserts',
    imgPath: '/cover_dessert.webp',
  },
  {
    name: 'Boissons',
    link: '/menu/boissons',
    img: 'bg-image-boissons',
    imgPath: '/Falooda.webp',
  },
  {
    name: 'Les vins',
    link: '/menu/vins',
    img: 'bg-image-vins',
    imgPath: '/img-vins.webp',
  },
];

interface menuProps {
  name: string;
  link: string;
  img: string;
  imgPath: string;
}

const page = () => {
  return (
    <section className='flex flex-col font-caveat py-24 sm:px-8 xl:px-24 px-4'>
      <div className='grid grid-cols-12 w-full gap-6 mt-16'>
        {menuItems.map((item: menuProps) => (
          <Link
            href={item.link}
            key={item.name}
            className='relative col-span-12 sm:col-span-6 lg:col-span-4 h-[250px] hover:scale-105 duration-300 ease-in-out 
            flex justify-center items-center cursor-pointer'
          >
            <Image
              src={item.imgPath}
              alt={item.name}
              fill
              className='rounded-xl opacity-60'
            />
            <h2 className='text-white text-5xl font-bold z-50 text-center'>
              {item.name}
            </h2>
          </Link>
        ))}
      </div>
      <h5 className='text-lg italic text-gray-200 mt-12'>
        *Photos des plats non contractuelles
      </h5>
    </section>
  );
};

export default page;
