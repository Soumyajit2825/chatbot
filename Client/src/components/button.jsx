import Arrow from '../assets/dropdownArrow.svg';

// eslint-disable-next-line react/prop-types
const PrimaryButton = ({ title, handleClick, className }) => {
  return (
    <button
      onClick={handleClick}
      className={`${className} pl-8 pr-12 h-fit py-3 rounded-full border border-primary_blue text-white hover relative group overflow-hidden flex items-center gap-2 hover:text-primary_blue duration-500 text-xs md:text-sm xl:text-[16px] z-0 bg-primary_blue active:scale-[.8]`}
      style={{ fontFamily: 'SfLight' }}
    >
      {title}
      <div className="bg-white rounded-full p-[0.18rem] absolute -z-10 right-5 group-hover:scale-[70] duration-[400ms]" />
      <img
        src={Arrow}
        alt="Arrow Icon"
        className="group-hover:stroke-primary_blue absolute -z-10 right-3 -rotate-90 stroke-2"
      />
    </button>
  );
};

export default PrimaryButton;