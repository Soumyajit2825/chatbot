import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

// eslint-disable-next-line react/prop-types
const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card className="p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow w-[350px]">
    <CardHeader>
      <Icon className="w-12 h-12 text-blue-500 mb-4" />
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

export default FeatureCard;