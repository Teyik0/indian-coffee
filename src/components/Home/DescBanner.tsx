import React from 'react';
import Image from 'next/image';

const DescBanner = () => {
  return (
    <section className='bg-image2 flex flex-col justify-center items-center bg-image w-full min-h-[640px] object-fill text-white'>
      <h2 className='text-6xl sm:text-7xl font-caveat text-[#C6AB71] text-center font-bold'>
        Découvrir l'histoire
      </h2>
      <p className='w-full pl-2 pr-2 sm:p-0 sm:w-[400px] mt-8 text-center font-semibold text-lg'>
        Indian Coffee est un Restaurant crée à l’initiative de passionnés de la
        culture culinaire indienne ayant pour but de faire découvrir aux
        Savigniens et aux habitants avoisinants le vrai goût de la cuisine
        venant du Sud de l’Inde et du Sri Lanka. Venir chez Indian Coffee, c’est
        partager un moment magique et chaleureux avec vos amis et vos familles
        tout en voyageant au cœur de l’Inde.
      </p>
      <Image
        src='/Femme.webp'
        alt='femme'
        width={400}
        height={150}
        className='z-50 absolute left-0 translate-y-48 hidden sm:flex'
      />
      <Image
        src='/Homme.webp'
        alt='homme'
        width={400}
        height={150}
        className='z-50 absolute right-0 translate-y-48 hidden sm:flex'
      />
    </section>
  );
};

export default DescBanner;
