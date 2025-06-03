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
  title: 'Plats | Indian Coffee',
  description:
    'Tous les plats à la carte, que ce soit à emporter ou sur place.',
  openGraph: {
    title: 'Plats | Indian Coffee',
    description:
      'Tous les plats à la carte, que ce soit à emporter ou sur place.',
    siteName: 'Indian Coffee',
    locale: 'fr',
    url: 'https://indiancoffee.fr/',
  },
};

const page = () => {
  return (
    <section className='w-full items-center justify-center text-white pb-24'>
      <Image
        src='/asset-plat.webp'
        width={500}
        height={150}
        alt='logo'
        className='hidden absolute sm:flex xl:hidden top-0 right-0 z-0'
      />
      <Image
        src='/asset-plat.webp'
        width={550}
        height={150}
        alt='logo'
        className='hidden absolute xl:flex top-0 right-0 z-0'
      />
      <div className='pl-4 pr-4 pt-24 sm:pt-48'>
        <h1 className='uppercase text-[#e8b755] text-2xl font-bold tracking-wider mb-2'>
          plats
        </h1>

        <div className='mb-2'>
          <Plat
            title='SAUCE VINDALOO'
            details="SAUCE COMPOSÉE D'ÉPICES, PIMENTÉE POUR LES AMATEURS DE SENSATIONS FORTES SERVIE SANS ACCOMPAGNEMENT"
            price=''
          />
          <SousPlat title='POULET' price='11,00€' details='' />
          <SousPlat title='AGNEAU' price='13,00€' details='' />
          <SousPlat title='CREVETTES' price='13,00€' details='' />
          <SousPlat title='GAMBAS' price='15,00€' details='' />
          <SousPlat title='SAUMON' price='14,00€' details='' />
        </div>

        <div className='mb-2'>
          <Plat
            title='SAUCE CURRY'
            details="SAUCE PARFUMÉE D'ÉPICES TRADITIONNELLES AU GOÛT ENVOUTANT D'INDE SERVIE SANS ACCOMPAGNEMENT"
            price=''
          />
          <SousPlat title='POULET' price='11,00€' details='' />
          <SousPlat title='AGNEAU' price='13,00€' details='' />
          <SousPlat title='CREVETTES' price='13,00€' details='' />
          <SousPlat title='GAMBAS' price='15,00€' details='' />
          <SousPlat title='SAUMON' price='14,00€' details='' />
        </div>

        <div className='flex flex-col sm:flex-row sm:flex-wrap'>
          <div className='mb-2 sm:w-1/2'>
            <Plat
              title='SAUCE KOUROUMA'
              details="SAUCE COMPOSÉE D'ÉPICES DOUCES ET PARFUMÉE AU LAIT DE COCO SERVIE SANS ACCOMPAGNEMENT"
              price=''
              fullProps
            />
            <SousPlat title='POULET' price='12,00€' details='' fullProps />
            <SousPlat title='AGNEAU' price='14,00€' details='' fullProps />
            <SousPlat title='CREVETTES' price='14,00€' details='' fullProps />
            <SousPlat title='GAMBAS' price='16,00€' details='' fullProps />
            <SousPlat title='SAUMON' price='15,00€' details='' fullProps />
          </div>

          <div className='mb-2 sm:w-1/2'>
            <Plat
              title='TIKKA MASSALA'
              details="MÉLANGE D'ÉPICES INDIENNES, OIGNONS ET POIVRONS"
              price=''
              fullProps
            />
            <SousPlat title='POULET' price='14,50€' details='' fullProps />
            <SousPlat title='AGNEAU' price='15,00€' details='' fullProps />
            <SousPlat title='GAMBAS' price='17,00€' details='' fullProps />
            <SousPlat title='SAUMON' price='15,00€' details='' fullProps />
          </div>

          <div className='mb-2 sm:w-1/2'>
            <Plat
              title='BIRYANI'
              details="MÉLANGE DE RIZ SAFRANÉ, DE TOMATES, D'OIGNONS AUX GINGEMBRE ET ÉPICES INDIENNES"
              price=''
              fullProps
            />
            <SousPlat title='POULET' price='13,00€' details='' fullProps />
            <SousPlat title='AGNEAU' price='14,00€' details='' fullProps />
            <SousPlat title='CREVETTES' price='13,00€' details='' fullProps />
            <SousPlat title='GAMBAS' price='15,00€' details='' fullProps />
            <SousPlat title='LÉGUMES' price='10,00€' details='' fullProps />
          </div>

          <div className='mb-2 sm:w-1/2'>
            <Plat
              title='KOTTU'
              details='EMINCÉES DE BAROTTA AVEC OEUF OU VIANDE '
              price=''
              fullProps
            />
            <SousPlat title='AGNEAU' price='12,00€' details='' fullProps />
            <SousPlat title='BOEUF' price='12,00€' details='' fullProps />
            <SousPlat title='OEUFS' price='10,00€' details='' fullProps />
            <SousPlat title='POULET' price='12,00€' details='' fullProps />
            <SousPlat title='LÉGUMES' price='10,00€' details='' fullProps />
          </div>
        </div>
      </div>
    </section>
  );
};

export default page;
