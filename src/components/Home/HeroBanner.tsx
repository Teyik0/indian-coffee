import Link from 'next/link';

const HeroBanner = () => {
  return (
    <section className='flex flex-col justify-center items-center bg-image min-h-[580px] object-fill text-white'>
      <h2 className='flex justify-center items-center text-6xl sm:text-7xl font-bold italic mt-24 font-caveat'>
        Bienvenue
      </h2>
      <h2 className='text-4xl sm:text-5xl font-bold font-caveat capitalize mt-4'>
        à
      </h2>
      <h1 className='text-6xl sm:text-7xl font-bold tracking-wider text-center font-samarkan mt-4'>
        Indian Coffee
      </h1>
      <h2 className='text-3xl sm:text-5xl text-center font-bold font-caveat'>
        Spécialité Indienne
      </h2>
      <h2 className='text-3xl sm:text-5xl text-center font-bold font-caveat'>
        &
      </h2>
      <h2 className='text-3xl sm:text-5xl text-center font-bold font-caveat'>
        Sri-Lankaise
      </h2>
      <Link href='/menu'>
        <button
          type="button"
          className='rounded-xl mt-12 pl-8 pr-8 pt-4 pb-4 bg-white text-black 
        font-bold border-1 border-gray-800 hover:scale-110 duration-300 ease-in-out'
        >
          Voir menu
        </button>
      </Link>
    </section>
  );
};

export default HeroBanner;
