import Arrow from '../assets/dropdownArrow.svg';

// eslint-disable-next-line react/prop-types
const SecondaryButton = ({ title, handleClick, className }) => {
  return (
    <button
      onClick={handleClick}
      className={`${className} pl-8 pr-12 h-fit py-3 rounded-full border border-primary_blue text-primary_blue hover:border-white hover relative group overflow-hidden flex items-center gap-2 hover:text-white duration-500 text-xs md:text-sm xl:text-[16px] z-30 bg-white active:scale-[.8]`}
      style={{ fontFamily: 'SfLight' }}
    >
      {title}
      <div className="bg-primary_blue rounded-full p-[0.18rem] absolute -z-10 right-5 group-hover:scale-[60] duration-[400ms]" />
      <img
        src={Arrow}
        alt="Arrow Icon"
        className="group-hover:stroke-white absolute -z-10 right-3 -rotate-90 stroke-2"
      />
    </button>
  );
};

export default SecondaryButton;