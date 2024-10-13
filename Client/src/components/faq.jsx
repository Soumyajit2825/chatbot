
// eslint-disable-next-line react/prop-types
const FAQItem = ({ question, answer }) => (
  <div className="mb-6 last:mb-0">
    <h4 className="text-lg font-semibold mb-2">{question}</h4>
    <p className="text-gray-600">{answer}</p>
  </div>
);

export default FAQItem;