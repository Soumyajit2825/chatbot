// eslint-disable-next-line react/prop-types
const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-gray-500 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <Icon className="w-12 h-12 text-blue-500 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default FeatureCard;