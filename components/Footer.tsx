import Image from 'next/image';
import Link from 'next/link';
import { AiFillFacebook, AiFillInstagram } from 'react-icons/ai';

const Footer = () => {
  return (
    <footer className='flex flex-col bg-[#2a2a2a] pt-12 pb-12'>
      <div className='flex flex-row items-center justify-evenly text-white text-4xl'>
        <Image
          src='/IndianCoffee_Logo.png'
          alt='Indian Coffee'
          width={150}
          height={150}
        />

        <div className='flex text-lg gap-8 text-[#af9065] font-semibold'>
          <Link href='/'>
            <h4 className='hover:text-[#ffffff] duration-300 ease-in-out'>
              Accueil
            </h4>
          </Link>
          <Link href='/menu'>
            <h4 className='hover:text-[#ffffff] duration-300 ease-in-out'>
              Menu
            </h4>
          </Link>
          <Link href='/gallerie'>
            <h4 className='hover:text-[#ffffff] duration-300 ease-in-out'>
              Gallerie
            </h4>
          </Link>
          <Link href='/contact'>
            <h4 className='hover:text-[#ffffff] duration-300 ease-in-out'>
              Contact
            </h4>
          </Link>
        </div>

        <div className='flex flex-row gap-2'>
          <Link
            href='https://www.facebook.com/profile.php?id=100083047666745'
            target='_blank'
          >
            <AiFillFacebook className='hover:text-gray-400 cursor-pointer' />
          </Link>
          <Link
            href='https://www.instagram.com/indiancoffee77/'
            target='_blank'
          >
            <AiFillInstagram className='hover:text-gray-400 cursor-pointer' />
          </Link>
        </div>
      </div>

      <div className='h-[1px] bg-gray-600 w-[800px] m-auto mt-4 mb-4' />
      <span className='text-center text-white'>
        ©INDIAN COFFEE, 2023. All Rights Reserved.
      </span>
    </footer>
  );
};

export default Footer;
