import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Plat, SousPlat } from '../../components';

const entrees = () => {
  return (
    <>
      <Head>
        <title>Entrées | Indian Coffee</title>
        <meta property='og:title' content='Entrées | Indian Coffee' />
        <meta property='og:site_name' content='Indian Coffee' />
        <meta
          name='description'
          content='Toutes les entrées à la carte, que ce soit à emporter ou sur place.'
        />
        <meta
          property='og:description'
          content='Toutes les entrées à la carte, que ce soit à emporter ou sur place.'
        />
        <meta property='og:locale' content='fr' />
        <meta property='og:locale:alternate' content='en' />
        <meta property='og:type' content='website' />
        <meta
          property='article:publisher'
          content='https://www.facebook.com/profile.php?id=100083047666745'
        />
        <meta property='og:url' content='https://indian-cofee.netlify.app/' />
        <link rel='icon' href='/favicon.png' />
      </Head>
      <section className='w-full items-center justify-center text-white'>
        <Link href='/' className='cursor-pointer'>
          <Image
            src='/IndianCoffee_Logo.png'
            width={150}
            height={150}
            alt='logo'
          />
        </Link>
        <Image
          src='/asset-entry.png'
          width={500}
          height={150}
          alt='logo'
          className='hidden absolute md:flex xl:hidden top-0 right-0 z-0'
        />
        <Image
          src='/asset-entry.png'
          width={700}
          height={150}
          alt='logo'
          className='absolute hidden top-0 right-0 xl:flex'
        />

        <div className='pl-4 pr-4'>
          <h1 className='uppercase text-[#e8b755] text-2xl font-bold tracking-wider mb-2'>
            entrées
          </h1>
          <Plat
            title='SAMOSSA VIANDE - 2P'
            details='CHAUSSON DE VIANDE POULET OU BOEUF, PETITS POIS ET POMMES DE TERRE'
            price='4,00€'
          />
          <Plat
            title='SAMOSSA LÉGUMES - 2P'
            details='CHAUSSON DE LÉGUMES ET POMME DE TERRE'
            price='3,50€'
          />
          <Plat
            title='ROLLS VIANDE - 2P'
            details='ROULEAUX PANÉS DE VIANDE  ET POMME DE TERRE'
            price='4,00€'
          />

          <div className='mb-2'>
            <Plat
              title='BADJI'
              details='BEIGNETS À LA FARINE DE POIS CHICHE'
              price=''
            />
            <SousPlat
              title='BADJI AUX AUBERGINES - 3P'
              price='3,50€'
              details=''
            />
            <SousPlat
              title='BADJI AUX POMMES DE TERRE'
              price='3,50€'
              details=''
            />
            <SousPlat title='BADJI AUX OIGNONS - 3P' price='3,50€' details='' />
            <SousPlat
              title='BADJI AUX CREVETTES - 3P'
              price='7,50€'
              details=''
            />
            <SousPlat
              title='ASSORTISSEMENTS POUR 2 PERSONNES'
              price='9,00€'
              details=''
            />
          </div>

          <div className='mb-2'>
            <Plat title='VADAI' details='BEIGNET AUX LENTILLES' price='' />
            <SousPlat title='VADAI - 2P' price='3,00€' details='' />
            <SousPlat
              title='VADAI AUX EPINARDS - 2P'
              price='3,00€'
              details=''
            />
            <SousPlat title='SAMBAR VADAI - 2P' price='4,50€' details='' />
          </div>

          <div className='mb-2'>
            <Plat title='GRILLADES' details='AU FOUR TANDOOR' price='' />
            <SousPlat
              title='MIXTE TANDOORI (POUR 2 PERSONNES)'
              details='PIÈCE DE POULET TIKKA, TANDOORI ET AGNEAU TIKKA'
              price='18,00€'
            />
            <SousPlat
              title='POULET TANDORI'
              details='CUISSE DE POULET MARINÉE'
              price='5,50€'
            />
            <SousPlat
              title='GAMBAS TANDOORI - 5P'
              details='GAMBAS MARINÉS'
              price='16,90€'
            />
            <SousPlat
              title='POULET TIKKA'
              details='BLANC DE POULET MARINÉ'
              price='8,00€'
            />
            <SousPlat
              title='AGNEAU TIKKA'
              details='AGNEAU MARINÉ'
              price='9,00€'
            />
            <SousPlat
              title='SAUMON TIKKA'
              details='SAUMON MARINÉ'
              price='9,50€'
            />
            <SousPlat
              title='PANEER TIKKA'
              details='BROCHETTES DE FROMAGE INDIEN AVEC DES LÉGUMES'
              price='7,50€'
            />
          </div>

          <div className='mb-2'>
            <Plat
              title='LES SALADES'
              details='SALADE INDIENNE FAIT MAISON'
              price=''
            />
            <SousPlat
              title='SALADE POULET TIKKA'
              details='SALADE, OIGNONS, TOMATES, MAÏS OLIVES, POULET TIKKA  AVEC NAAN NATURE'
              price='13,00€'
            />
            <SousPlat
              title='SALADE SAUMON TIKKA'
              details='SALADE, OIGNONS, TOMATES, MAÏS, OLIVES, SAUMON TIKKA  AVEC NAAN NATURE'
              price='15,00€'
            />
            <SousPlat
              title='SALADE VÉGÉTARIENNE'
              details='SALADE, COMCOMBRES, MAÎS, OLIVES, POMMES DE TERRE AVEC NAAN NATURE'
              price='12,00€'
            />
            <SousPlat
              title='RAITA'
              details='CAROTTES, CONCOMBRES, TOMATES, YAOURT, OIGNONS'
              price='5,00€'
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default entrees;
