import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Discover = () => {
  return (
    <section className='flex flex-col lg:flex-row jutify-center items-center lg:justify-evenly pt-24 pb-24'>
      <div className='flex flex-col justify-center items-center'>
        <h2 className='text-[#C6AB71] text-4xl xl:text-5xl font-caveat text-center'>
          Un restaurant Indien authentique
          <br />à Savigny Le Temple
        </h2>
        <p className='text-white text-2xl font-bold w-full pr-2 pl-2 sm:p-0 sm:w-[600px] mt-4 text-center'>
          Namaste, Vanakam! <br />
          Bienvenue chez <span className='font-samarkan'>
            {' '}
            INDIAN COFFEE
          </span>, <br />
        </p>
        <p className='text-white text-base w-full pr-2 pl-2 sm:p-0 sm:w-[500px] mt-4 text-center'>
          Nous vous proposons des plats traditionnels du Sud de l'Inde et du
          Sri-Lanka, riche en couleurs et saveurs, afin de vous faire voyager
          dans le monde gourmet de la cuisine indienne. <br /> <br />
          <Link href='/menu'>Au MENU</Link> des entrées tel que le Cheese Naan
          fait maison, des plats à base de viande tel que le savoureux Butter
          Chicken, des plats végétariens, des desserts, boissons et pleins
          d'autres belles surprises pour le plaisir de vos papilles et le
          bonheur de vos familles.
        </p>
        <Link href='/contact'>
          <p
            className='uppercase underline text-lg text-[#C6AB71] hover:text-white duration-300 ease-in-out
           font-bold italic tracking-wider mt-4 text-center'
          >
            à propos
          </p>
        </Link>
      </div>
      <Image
        src='/histoire.webp'
        alt='butter-chicken'
        width={600}
        height={50}
        className='sm:rounded-xl mt-16 lg:mt-0'
      />
    </section>
  );
};

export default Discover;
