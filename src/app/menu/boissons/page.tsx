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
  title: 'Plats | Indian Coffee',
  description:
    'Toutes les boissons à la carte, que ce soit à emporter ou sur place.',
  openGraph: {
    title: 'Plats | Indian Coffee',
    description:
      'Toutes les boissons à la carte, que ce soit à emporter ou sur place.',
    siteName: 'Indian Coffee',
    locale: 'fr',
    url: 'https://indiancoffee.fr/',
  },
};

const page = () => {
  return (
    <section className='w-full items-center justify-center text-white pb-24'>
      <div className='pl-4 pr-4 pt-24 sm:pt-48'>
        <h1 className='uppercase text-[#e8b755] text-2xl font-bold tracking-wider mb-2'>
          Boissons
        </h1>
        <div className='mb-2'>
          <Plat title='EAUX ET SOFT' details='' price='' />
          <SousPlat
            title='Coca cola/coca zéro (33cl)'
            details=''
            price='3,90€'
          />
          <SousPlat title='Orangina (25cl)' details='' price='3,90€' />
          <SousPlat title='Schweppes (33cl)' details='' price='3,90€' />
          <SousPlat title='Sprite (33cl)' details='' price='3,90€' />
          <SousPlat title='Diablo (25cl)' details='' price='3,50€' />
          <SousPlat
            title='Jus de fruit (25cl)'
            details='(Orange, mangue, ananas, pomme, ananas, fraise, abricot)'
            price='4,00€'
          />
          <SousPlat
            title='Lassy'
            details='(Mangue, banane, pistache, Coco ou rose)'
            price='5,50€'
          />
          <SousPlat title='Rose milk' details='(Lait rose)' price='4,00€' />
          <SousPlat title='Vittel (50cl)' details='' price='3,50€' />
          <SousPlat title='Vittel (1L)' details='' price='6,00€' />
          <SousPlat title='San pellegrino (50cl)' details='' price='3,50€' />
          <SousPlat title='San pellegrino (1L)' details='' price='6,00€' />
        </div>

        <div className='mb-2'>
          <Plat title='COCKTAILS SANS ALCOOL' details='' price='' />
          <SousPlat
            title='Virgin Mojito'
            details='(Feuille de menthe, citron, sucre et glace pilée)'
            price='6,90€'
          />
          <SousPlat
            title='Pinacolada'
            details="(Jus d'ananas, crème de coco)"
            price='6,90€'
          />
          <SousPlat
            title='Sex on the beach'
            details="(Jus d'ananas, Liqueur de pêche, jus de cranberry)"
            price='6,90€'
          />
          <SousPlat
            title='Grenade'
            details='(Jus de litchi, goyave, framboise, citron vert, tonic) '
            price='6,90€'
          />
        </div>

        <div className='mb-2'>
          <Plat title='SODA SRI-LANKAIS' details='' price='' />
          <SousPlat title='Necto' details='' price='3,50€' />
          <SousPlat title='Orange Barley' details='' price='3,50€' />
        </div>

        <div className='mb-2'>
          <Plat title='COCKTAIL AVEC ALCOOL' details='' price='' />
          <SousPlat
            title='Mojito'
            details='(Rhum, citron, menthe, eau pétillante, sirop de sucre de canne, jus de pomme)'
            price='8,90€'
          />
          <SousPlat
            title='Pina colada'
            details='(Rhum, jus d’ananas, crème de coco)'
            price='8,90€'
          />
          <SousPlat
            title='Tequila sun rise'
            details='(tequila, jus d’orange, sirop de grenadine)'
            price='8,90€'
          />
          <SousPlat
            title='Blue lagon'
            details='(vodka, curaçao, citron)'
            price='8,90€'
          />
          <SousPlat
            title='Cosmopolitan'
            details='(vodka, cointreau, jus cranberry, citron)'
            price='8,90€'
          />
          <SousPlat
            title='Margarita'
            details='(tequila, Cointreau, citron)'
            price='8,90€'
          />
          <SousPlat
            title='Ti punch'
            details='(rhum, sirop de sucre de canne, sucre de canne, citron)'
            price='8,90€'
          />
          <SousPlat
            title='Sex on the beach'
            details="(vodka, jus d'ananas, jus de cranberry, liqueur de pêche)"
            price='8,90€'
          />
          <SousPlat
            title='Irish Coffee'
            details='(Whisky, café, crème chantilly, sirop de sucre)'
            price='8,90€'
          />
          <SousPlat
            title='Monaco'
            details='(Bière blanche, Limonade et grenadine)'
            price='8,90€'
          />
        </div>

        <div className='mb-2'>
          <Plat title='BOISSONS CHAUDES' details='' price='' />
          <SousPlat
            title='Chai'
            details='(Thé au lait massala)'
            price='4,00€'
          />
          <SousPlat title='Thé Massala' details='' price='4,50€' />
          <SousPlat title='Thé ceylon' details='' price='4,00€' />
          <SousPlat
            title='Thé Richard'
            details='(Fruit rouge,earl grey,vanille caramel)'
            price='4,00€'
          />
          <SousPlat title='Café' details='' price='2,20€' />
          <SousPlat title='Café crème' details='' price='4,00€' />
          <SousPlat title='Chocolat chaud' details='' price='4,00€' />
          <SousPlat
            title='Ceylon coffee'
            details='(café traditionnel aux épices du Sri-lanka)'
            price='2,50€'
          />
        </div>

        <div className='mb-2'>
          <Plat title='Apéritifs' details='' price='' />
          <SousPlat title='Ricard' details='(2cl)' price='4,50€' />
          <SousPlat title='Kir' details='(12cl)' price='3,50€' />
          <SousPlat title='Kir Royal' details='(12cl)' price='8,00€' />
          <SousPlat title='Gin Tonic' details='(2cl)' price='5,50€' />
          <SousPlat title='Rhum' details='(4cl)' price='6,50€' />
          <SousPlat title='Balantines' details='(4cl)' price='7,00€' />
          <SousPlat title='Jack Daniel' details='' price='8,00€' />
          <SousPlat title='Belvedere' details='' price='8,00€' />
          <SousPlat title='Ciroc' details='' price='9,00€' />
          <SousPlat title='Coupe de champagne' details='(12cl)' price='9,00€' />
          <SousPlat title='Martini' details='(4cl)' price='5,50€' />
          <SousPlat title='Martini blanco' details='(4cl)' price='4,50€' />
          <SousPlat title='Porto' details='' price='5,50€' />
        </div>

        <div className='mb-2'>
          <Plat title='les bières' details='' price='' />
          <SousPlat title='King Fisher (33cl)' details='' price='5,00€' />
          <SousPlat
            title='Lion stout ou lager (33cl)'
            details=''
            price='5,50€'
          />
          <SousPlat
            title='Lion stout ou lager (62,5cl)'
            details=''
            price='9,50€'
          />
          <SousPlat title='Heineken' details='' price='4,50€' />
          <SousPlat title='Desperatos' details='' price='5,00€' />
          <SousPlat title='Kronenbourg 1664' details='' price='4,50€' />
        </div>

        <div className='mb-2'>
          <Plat title='LES CHAMPAGNES (75cl)' details='' price='' />
          <SousPlat title='Nicolas feuillatte' details='' price='47,00€' />
          <SousPlat title='Moet et chandon' details='' price='79,00€' />
          <SousPlat
            title='Ruinart'
            details='(blanc de blanc)'
            price='120,00€'
          />
          <SousPlat title='Ruinart Rosé' details='' price='150,00€' />
        </div>
      </div>
    </section>
  );
};

export default page;
