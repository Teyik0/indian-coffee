import type { Metadata } from 'next';
import Image from 'next/image';

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
  title: 'Menus | Indian Coffee - Tous nos menus',
  description:
    'Tous les menus à la carte, que ce soit à emporter ou sur place.',
  openGraph: {
    title: 'Menus | Indian Coffee - Tous nos menus',
    description:
      'Tous les menus à la carte, que ce soit à emporter ou sur place.',
    siteName: 'Indian Coffee',
    locale: 'fr',
    url: 'https://indiancoffee.fr/',
  },
};

const page = () => {
  return (
    <section className='w-full items-center justify-center text-white pb-32'>
      <Image
        src='/asset-menu.webp'
        width={500}
        height={150}
        alt='logo'
        className='hidden absolute xl:flex top-0 right-0 z-0'
      />
      <Image
        src='/asset-menu.webp'
        width={250}
        height={150}
        alt='logo'
        className='hidden absolute md:flex xl:hidden top-0 right-0 z-0'
      />

      <div className='pl-4 pr-4 z-20 justify-center items-center w-full pt-24 sm:pt-48'>
        <h1 className='uppercase text-center text-[#e8b755] text-3xl font-bold tracking-wider mb-2'>
          Menus
        </h1>
        <h2 className='text-center uppercase first-letter:text-3xl font-semibold text-xl text-[#e8be55]'>
          Menu végétarien – 15,90€
        </h2>
        <h3 className='mt-4 text-center first-letter:capitalize font-semibold text-xl text-[#a27e21]'>
          Entrée au choix
        </h3>
        <h4 className='text-center uppercase first-letter:text-xl font-semibold sm:w-1/2 sm:m-auto lg:w-full text-sm text-white'>
          Badji aubergines ou pommes de terre ou oignons ou Samossas légumes
        </h4>
        <h3 className='mt-4 text-center first-letter:capitalize font-semibold text-xl text-[#a27e21]'>
          Plat au choix
        </h3>
        <h4 className='text-center uppercase font-semibold text-sm text-white'>
          <ul>
            <li className='first-letter:text-xl'>Thali ( riz avec 5 sauces)</li>
            <li className='first-letter:text-xl'>
              Dal ( lentilles) avec riz basmati
            </li>
            <li className='first-letter:text-xl'>
              Massala dosa ( crêpe salée avec pommes de terre)
            </li>
          </ul>
        </h4>
        <h3 className='mt-4 text-center first-letter:capitalize font-semibold text-xl text-[#a27e21]'>
          Dessert au choix
        </h3>
        <h4 className='text-center uppercase first-letter:text-xl font-semibold text-sm text-white'>
          Payasam ou kessari (gâteau de semoule)
        </h4>

        <Image
          src='/asset-menu2.webp'
          width={500}
          height={150}
          alt='logo'
          className='hidden absolute xl:flex left-0 z-0'
        />
        <Image
          src='/asset-menu2.webp'
          width={270}
          height={150}
          alt='logo'
          className='hidden absolute md:flex xl:hidden left-0 z-0'
        />

        <h2 className='mt-8 text-center uppercase first-letter:text-3xl font-semibold text-xl text-[#e8be55]'>
          Menu Indian Coffee - 19,90€
        </h2>
        <h3 className='mt-4 text-center first-letter:capitalize font-semibold text-xl text-[#a27e21]'>
          Entrée au choix
        </h3>
        <h4 className='text-center uppercase font-semibold text-sm text-white'>
          <ul>
            <li className='first-letter:text-xl'>Tandoori poulet</li>
            <li className='first-letter:text-xl'>Rolls viande</li>
            <li className='first-letter:text-xl'>Samossa viande</li>
            <li className='first-letter:text-xl'>
              Badji pommes de terre ou oignons
            </li>
          </ul>
        </h4>
        <h3 className='mt-4 text-center first-letter:capitalize font-semibold text-xl text-[#a27e21]'>
          Plat au choix
        </h3>
        <h4 className='text-center uppercase font-semibold text-sm text-white'>
          <ul>
            <li className='first-letter:text-xl'>
              Briyani poulet ou agneau ou légumes
            </li>
            <li className='first-letter:text-xl'>Curry au poulet avec riz</li>
          </ul>
        </h4>
        <h3 className='mt-4 text-center first-letter:capitalize font-semibold text-xl text-[#a27e21]'>
          Dessert au choix
        </h3>
        <h4 className='text-center uppercase font-semibold text-sm text-white'>
          <ul>
            <li className='first-letter:text-xl'>Gulab jamoune</li>
            <li className='first-letter:text-xl'>kesari (gâteau de semoule)</li>
            <li className='first-letter:text-xl'>Payasam</li>
          </ul>
        </h4>

        <Image
          src='/asset-menu4.webp'
          width={300}
          height={150}
          alt='logo'
          className='hidden absolute xl:flex right-10 z-0'
        />
        <Image
          src='/asset-menu4.webp'
          width={240}
          height={150}
          alt='logo'
          className='hidden absolute md:flex xl:hidden right-10 z-0'
        />

        <h2 className='mt-8 text-center uppercase first-letter:text-3xl font-semibold text-xl text-[#e8be55]'>
          Menu Enfant – 8,90€
        </h2>
        <h3 className='mt-4 text-center first-letter:capitalize font-semibold text-xl text-[#a27e21]'>
          Plat au choix
        </h3>
        <h4 className='text-center uppercase font-semibold text-sm text-white'>
          <ul>
            <li className='first-letter:text-xl'>
              Riz Blanc et sauce kourouma
            </li>
            <li className='first-letter:text-xl'>Nuggets et frites</li>
          </ul>
        </h4>
        <h3 className='mt-4 text-center first-letter:capitalize font-semibold text-xl text-[#a27e21]'>
          Dessert au choix
        </h3>
        <h4 className='text-center uppercase font-semibold text-sm text-white'>
          <ul>
            <li className='first-letter:text-xl'>Boule de Glace</li>
            <li className='first-letter:text-xl'>Compote de pomme</li>
          </ul>
        </h4>
        <h3 className='mt-4 text-center first-letter:capitalize font-semibold text-xl text-[#a27e21]'>
          Boisson au choix
        </h3>
        <h4 className='text-center uppercase font-semibold text-sm text-white'>
          <ul>
            <li className='first-letter:text-xl'>Multi fruits</li>
            <li className='first-letter:text-xl'>jus de Pomme</li>
          </ul>
        </h4>
      </div>
    </section>
  );
};

export default page;
