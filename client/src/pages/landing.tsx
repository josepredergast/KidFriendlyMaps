import { Button } from '@/components/ui/button';
import { MapPin, Heart, Search } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hudson County Kids Map</h1>
          <p className="text-gray-600 text-sm">
            Discover kid-friendly places in Hudson County, NJ
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Search className="h-4 w-4 text-primary" />
            <span>Search playgrounds, parks, museums & more</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <Heart className="h-4 w-4 text-primary" />
            <span>Save your favorite places</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Get directions to any location</span>
          </div>
        </div>

        <Button 
          onClick={handleLogin}
          className="w-full"
          size="lg"
        >
          Sign in to Get Started
        </Button>

        <p className="text-xs text-gray-500 mt-4">
          Sign in with your Replit account to save favorites and access all features
        </p>
      </div>
    </div>
  );
}