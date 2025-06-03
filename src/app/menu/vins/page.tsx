import type { Metadata } from 'next';
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
  title: 'Vins | Indian Coffee',
  description: 'Tous les vins à la carte, que ce soit à emporter ou sur place.',
  openGraph: {
    title: 'Vins | Indian Coffee',
    description:
      'Tous les vins à la carte, que ce soit à emporter ou sur place.',
    siteName: 'Indian Coffee',
    locale: 'fr',
    url: 'https://indiancoffee.fr/',
  },
};

const page = () => {
  return (
    <section className='w-full items-center justify-center text-white pb-24'>
      <div
        className='sm:flex justify-center items-center bg-image-vins absolute rounded-full overflow-hidden
        lg:w-[400px] lg:h-[400px] md:w-[350px] md:h-[350px] sm:w-[300px] sm:h-[300px] hidden
        top-24 lg:top-4 right-4 z-0 border-16 border-[#fdc831]'
      />
      <div className='pl-4 pr-4 pt-24 sm:pt-48'>
        <h1 className='uppercase text-[#e8b755] text-2xl font-bold tracking-wider mb-2'>
          Les vins
        </h1>
        <div className='mb-2'>
          <Plat title='VINS ROSE (75cl)' details='' price='' />
          <SousPlat
            title='Tavel'
            details='(Aoc Prieure Montezague)'
            price='24,00€'
          />
          <SousPlat
            title='Saint-Barthélémy IGP Var'
            details=''
            price='20,00€'
          />
          <SousPlat
            title='Côtes de provence'
            details='(Romain Desbastides)'
            price='27,00€'
          />
        </div>

        <div className='mb-2'>
          <Plat title='VINS BLANC (75cl)' details='' price='' />
          <SousPlat
            title='Muscadet-Sevre et Maine AOC'
            details='(château de la Mouchetière)'
            price='16,50€'
          />
          <SousPlat
            title='Riesling AC'
            details='(Alsace Hans Schaeffer)'
            price='24,00€'
          />
          <SousPlat title='Sancerre AOC' details='(Les Broux)' price='35,00€' />
        </div>

        <div className='mb-2'>
          <Plat title='VINS ROUGE (75cl)' details='' price='' />
          <SousPlat
            title='Bordeaux Supérieur AOC'
            details='(Chapelle De Barbe)'
            price='18,00€'
          />
          <SousPlat
            title='Brouilly Beauvoisie AOC'
            details='(Beaujolais)'
            price='24,00€'
          />
          <SousPlat
            title='Côtes du rhone AC'
            details='(Pure Garrigue Honore Laubanel)'
            price='19,50€'
          />
          <SousPlat
            title='Haut Medoc AOC'
            details='(Château le Bourdieu Vertheuil)'
            price='30,00€'
          />
        </div>

        <div className='mb-2'>
          <Plat title='LES VINS EN PICHET' details='' price='' />
          <SousPlat
            title='Pichet de vin rouge'
            details='(25cl)'
            price='6,50€'
          />
          <SousPlat
            title='Pichet de vin rouge'
            details='(50cl)'
            price='10,00€'
          />
          <SousPlat title='Pichet de vin rose' details='(25cl)' price='6,00€' />
          <SousPlat
            title='Pichet de vin rose'
            details='(50cl)'
            price='10,00€'
          />
          <SousPlat
            title='Pichet de vin blanc'
            details='(25cl)'
            price='6,00€'
          />
          <SousPlat
            title='Pichet de vin blanc'
            details='(50cl)'
            price='10,00€'
          />
        </div>

        <div className='mb-2'>
          <Plat title='LES VINS EN VERRE (14cl)' details='' price='' />
          <SousPlat
            title='Vin Rouge - Richarg Vin et Domaine'
            details=''
            price='4,00€'
          />
          <SousPlat
            title='Vin Rose - Richarg Vin et Domaine'
            details=''
            price='5,00€'
          />
          <SousPlat
            title='Vin Blanc - Richarg Vin et Domaine'
            details=''
            price='4,00€'
          />
        </div>
      </div>
    </section>
  );
};

export default page;
