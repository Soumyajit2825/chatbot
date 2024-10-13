// eslint-disable-next-line react/prop-types
const Section = ({ title, children, className = "" }) => (
  <section className={`mb-16 ${className}`}>
    <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
    {children}
  </section>
);

export default Section;
