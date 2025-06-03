import type { Metadata } from 'next';
import Image from 'next/image';
import { Plat, SousPlat } from '../../../components';

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
  title: 'Desserts | Indian Coffee',
  description:
    'Tous les desserts à la carte, que ce soit à emporter ou sur place.',
  openGraph: {
    title: 'Desserts | Indian Coffee',
    description:
      'Tous les desserts à la carte, que ce soit à emporter ou sur place.',
    siteName: 'Indian Coffee',
    locale: 'fr',
    url: 'https://indiancoffee.fr/',
  },
};

const page = () => {
  return (
    <section className='w-full items-center justify-center text-white pb-24'>
      <Image
        src='/asset-dessert.webp'
        width={400}
        height={150}
        alt='logo'
        className='hidden absolute sm:flex md:hidden top-0 right-0 z-0'
      />
      <Image
        src='/asset-dessert.webp'
        width={500}
        height={150}
        alt='logo'
        className='hidden absolute md:flex xl:hidden top-0 right-0 z-0'
      />
      <Image
        src='/asset-dessert.webp'
        width={700}
        height={150}
        alt='logo'
        className='absolute hidden top-0 right-0 xl:flex'
      />

      <div className='pl-4 pr-4 pt-24 sm:pt-48'>
        <h1 className='uppercase text-[#e8b755] text-2xl font-bold tracking-wider mb-2'>
          Desserts
        </h1>
        <Plat
          title='KESARI'
          details='GÂTEAU DE SEMOULE AUX NOIX DE CAJOU & RAISINS SECS'
          price='4.00€'
        />
        <Plat
          title='GULAB JAMOUNE'
          details="BOULETTE DE PÂTE D'AMANDE DANS UN SIROP DE CARDAMONE"
          price='4,50€'
        />
        <Plat
          title='KULFI'
          details="GLACE À L'INDIENNE À LA MANGUE OU À LA PISTACHE"
          price='4,50€'
        />
        <Plat
          title='PAYASAM'
          details='BILLES DE TAPIOCA, LAIT DE COCO & NOIX DE CAJOU'
          price='4,00€'
        />

        <div className='flex flex-col sm:flex-row-reverse md:flex-col items-start'>
          <div className='sm:w-1/2 sm:pl-16 md:pl-0'>
            <Plat
              title='FALOODA'
              details='LAIT, SIROP DE ROSE, GRAINES DE BASILIC, MORCEAUX DE GÉLATINE, BOULE DE GLACE'
              price='7,00€'
              fullProps
            />
          </div>

          <div className='mb-2 w-full sm:w-1/2'>
            <Plat title='CRÊPES' details='' price='' fullProps />
            <SousPlat title='NATURE' details='' price='3,00€' fullProps />
            <SousPlat title='SUCRE' details='' price='3,50€' fullProps />
            <SousPlat title='NUTELLA' details='' price='5,00€' fullProps />
            <SousPlat
              title='NUTELLA BANANE'
              details=''
              price='5,50€'
              fullProps
            />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row xl:flex-col'>
          <div className='sm:w-1/2'>
            <Plat
              title='FONDANT AU CHOCOLAT'
              details='CŒUR COULANT DE CHOCOLAT, BEURRE, OEUF, FARINE, SUCRE'
              price='5,50€'
              fullProps
            />
          </div>
          <div className='sm:pl-16 sm:w-1/2 xl:pl-0'>
            <Plat
              title='COCKTAIL DE FRUITS'
              details='SALADE DE FRUITS FRAIS AVEC DE LA GLACE À LA VANILLE'
              price='6,50€'
              fullProps
            />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row xl:flex-col'>
          <Plat title='TIRAMISU' details='' price='6,90€' />
        </div>

        <div className='flex flex-col sm:flex-row'>
          <Plat title='THE GOURMAND' details='' price='8,50€' />
          <div className='sm:pl-16 sm:w-1/2'>
            <Plat title='CAFE GOURMAND' details='' price='7,90€' fullProps />
          </div>
        </div>
        <div className='flex flex-col sm:flex-row'>
          <Plat title='BANANA SPLIT' details='' price='7,90€' />
          <div className='sm:pl-16 sm:w-1/2'>
            <Plat title='CHOCOLAT LIEGOIS' details='' price='7,90€' fullProps />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row'>
          <Plat title='DAME BLANCHE' details='' price='7,90€' />
          <div className='sm:pl-16 sm:w-1/2'>
            <Plat title='MANGO COCO' details='' price='7,90€' fullProps />
          </div>
        </div>

        <div className='flex flex-col-reverse sm:flex-row items-start'>
          <div className='mb-2 sm:w-1/2'>
            <Plat
              title='COUPE DE GLACE'
              details='BOULE DE GLACE AU CHOIX: VANILLE, CHOCOLAT, MANGUE, COCO, CAFÉ, PISTACHE OU FRAISE'
              price=''
              fullProps
            />
            <SousPlat title='1 BOULE' details='' price='3,00€' fullProps />
            <SousPlat title='2 BOULES' details='' price='5,00€' fullProps />
          </div>
          <div className='w-full sm:pl-16 sm:w-1/2'>
            <Plat title='DAME BLANCHE' details='' price='7,90€' fullProps />
            <Plat title='BANANA SPLIT' details='' price='7,90€' fullProps />
            <Plat title='MILKSHAKE' details='' price='6,00€' fullProps />
          </div>
        </div>
      </div>
    </section>
  );
};

export default page;
