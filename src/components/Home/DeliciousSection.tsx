import Link from 'next/link';

const DeliciousSection = () => {
  return (
    <section className='pt-16 pb-16 flex flex-col justify-center items-center'>
      <h2 className='text-[#C6AB71] text-7xl font-caveat text-center'>
        Des menus délicieux
      </h2>
      <p className='w-full pr-2 pl-2 sm:p-0 sm:w-[400px] text-center mt-12 text-white font-semibold'>
        Découvrez les saveurs authentiques de l'Inde et du Sri-Lanka. <br />
        Laissez-vous emporter par les épices riches et les parfums subtils de
        nos plats traditionnels, préparés avec soin par notre chef expérimenté.{' '}
        <br />
        Que vous préfériez les plats épicés ou des plats plus doux, nous en
        avons pour tous les goûts. <br /> Profitez de notre cuisine en
        découvrant des plats tel que le tikka masala, biryani et samosas
        accompagnés de naans frais. <br /> Réservez votre table dès maintenant
        pour une expérience culinaire inoubliable
      </p>
      <Link href='/menu'>
        <button
          type="button"
          className='rounded-xl mt-8 pl-8 pr-8 pt-4 pb-4 bg-white text-black 
        font-bold border border-gray-800 hover:scale-110 duration-300 ease-in-out'
        >
          Voir menu
        </button>
      </Link>
    </section>
  );
};

export default DeliciousSection;
