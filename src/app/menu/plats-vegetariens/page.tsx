import { Metadata } from 'next';
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
  title: 'Plats Végétarien | Indian Coffee',
  description:
    'Tous les plats végétarien à la carte, que ce soit à emporter ou sur place.',
  openGraph: {
    title: 'Plats Végétarien | Indian Coffee',
    description:
      'Tous les plats végétarien à la carte, que ce soit à emporter ou sur place.',
    siteName: 'Indian Coffee',
    locale: 'fr',
    url: 'https://indiancoffee.fr/',
  },
};

const page = () => {
  return (
    <section className='w-full items-center justify-center text-white pb-24'>
      <Image
        src='/asset-veget.webp'
        width={400}
        height={150}
        alt='img'
        className='hidden absolute sm:flex md:hidden top-0 right-0 z-0'
      />
      <Image
        src='/asset-veget.webp'
        width={500}
        height={100}
        alt='img'
        className='hidden absolute md:flex xl:hidden top-0 right-0 z-0'
      />
      <Image
        src='/asset-veget.webp'
        width={700}
        height={150}
        alt='img'
        className='absolute hidden top-0 right-0 xl:flex'
      />

      <div className='pl-4 pr-4 pt-24 sm:pt-48'>
        <h1 className='uppercase text-[#e8b755] text-2xl font-bold tracking-wider mb-2'>
          Plats végétariens
        </h1>
        <div className='mb-2'>
          <Plat
            title='SAUCE LÉGUMES'
            details='SAUCE À BASE DE LÉGUMES FRAIS SERVIE SANS ACCOMPAGNEMENT'
            price=''
          />
          <SousPlat title='KOUROUMA' details='' price='8,00€' />
          <SousPlat title='CURRY' details='' price='8,00€' />
          <SousPlat title='VINDALOO' details='' price='8,00€' />
        </div>

        <Plat
          title='DAL'
          details='SAUCE AUX LENTILLES SERVIE AVEC RIZ'
          price='10,00€'
        />
        <Plat
          title='DAL AU PANEER TIKKA'
          details='SAUCE AUX LENTILLES AVEC DES MORCEAUX DE FROMAGE INDIEN PANEER TIKKA SERVI AVEC NAAN NATURE'
          price='12,00€'
        />
        <Plat
          title='THALI'
          details='5 LÉGUMES EN SAUCE ACCOMPAGNÉS DE RIZ BASMATI'
          price='13,00€'
        />
        <Plat
          title='PANEER BUTTER MASALA'
          details="MÉLANGE DE RIZ SAFRANÉ, DE TOMATES, D'OIGNONS AU GINGEMBRE, ÉPICES INDIENNES ET FROMAGE INDIEN"
          price='12,00€'
        />
        <div className='flex flex-col sm:flex-row md:flex-col'>
          <Plat
            title='PALAK PANEER'
            details='ÉPINARDS AVEC DES MORCEAUX DE FROMAGE INDIEN'
            price='11,00€'
          />
          <div className='sm:pl-16 md:pl-0 sm:w-1/2'>
            <Plat
              title='CHANNA MASSALA'
              details='POIS CHICHE RELEVÉ AUX ÉPICES INDIENNES'
              price='11,00€'
              fullProps
            />
          </div>
        </div>

        <Plat
          title='IDLI - 4P'
          details='GÂTEAU DE RIZ CUIT À LA VAPEUR SERVI AVEC DES SAUCES'
          price='12,00€'
        />

        <div className='mb-2'>
          <Plat
            title='DOSAI'
            details='CRÊPE INDIENNE SALÉE SERVIE AVEC DES SAUCES'
            price=''
          />
          <SousPlat
            title='DOSAI CROUSTILLANT'
            details='CRÊPE INDIENNE CROUSTILLANT'
            price='9,90€'
          />
          <SousPlat
            title='MASSALA DOSAI'
            details='GARNIS AUX POMMES DE TERRE'
            price='12,00€'
          />
          <SousPlat
            title='SUPPLÉMENT DOSAI NATURE'
            details='CRÊPE INDIENNE SANS ACCOMPAGNEMENT'
            price='5,00€'
          />
        </div>

        <div className='mb-2'>
          <Plat
            title='DOSAI NON VÉGÉTARIEN'
            details='CRÊPE INDIENNE SALÉE SERVIE AVEC DES SAUCES'
            price=''
          />
          <SousPlat
            title='ROYAL DOSAI'
            details='OEUFS, VIANDE HACHÉE ET POMME DE TERRE'
            price='14,00€'
          />
          <SousPlat
            title='BOLLYWOOD DOSAI'
            details='POMMES DE TERRE, OIGNONS CHAMPIGNONS ET POULET'
            price='14,00€'
          />
        </div>
      </div>
    </section>
  );
};

export default page;
