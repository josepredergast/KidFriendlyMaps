import { useState } from 'react';
import { X, Menu, MapPin, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ACTIVITY_CONFIGS } from '@/lib/overpass';
import type { FilterState, Place } from '@shared/types';

interface SidebarProps {
  filters: FilterState;
  onToggleFilter: (type: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  getPlaceCount: (type: string) => number;
  totalPlaces: number;
  error: string | null;
  places: Place[];
  onPlaceSelect?: (place: Place) => void;
}

export function Sidebar({
  filters,
  onToggleFilter,
  onRefresh,
  isLoading,
  getPlaceCount,
  totalPlaces,
  error,
  places,
  onPlaceSelect
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  // Filter places based on search query
  const filteredSearchPlaces = (places || []).filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (place.address && place.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePlaceClick = (place: Place) => {
    onPlaceSelect?.(place);
    closeMobile();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
        size="icon"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`
        sidebar-transition w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full
        lg:relative lg:translate-x-0 fixed z-50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hudson County</h1>
              <p className="text-xs text-gray-600 mt-1">Kid-Friendly Places</p>
            </div>
            <Button
              onClick={closeMobile}
              className="lg:hidden"
              variant="ghost"
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Activities Section */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Activities</h2>
              <Button
                onClick={onRefresh}
                disabled={isLoading}
                variant="ghost"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {error && (
              <Card className="mb-4 border-destructive">
                <CardContent className="pt-4">
                  <p className="text-xs text-destructive">{error}</p>
                  <Button
                    onClick={onRefresh}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Activity Filters */}
            <div className="space-y-2">
              {Object.entries(ACTIVITY_CONFIGS).map(([type, config]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <div className="text-sm">{config.icon}</div>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{config.label}</span>
                      <p className="text-xs text-gray-500">{getPlaceCount(type)}</p>
                    </div>
                  </div>
                  <Switch
                    checked={filters[type] || false}
                    onCheckedChange={() => onToggleFilter(type)}
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Search Results / Place List */}
          {searchQuery && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Search Results ({filteredSearchPlaces.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredSearchPlaces.slice(0, 10).map((place) => {
                  const config = ACTIVITY_CONFIGS[place.type];
                  return (
                    <div
                      key={place.id}
                      onClick={() => handlePlaceClick(place)}
                      className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: config.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{place.name}</h4>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">{config.label.slice(0, -1)}</p>
                          {place.address && (
                            <p className="text-xs text-gray-600 truncate mt-1">{place.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredSearchPlaces.length > 10 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    Showing first 10 results
                  </p>
                )}
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">About This Map</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              This map shows kid-friendly places in Hudson County, NJ. Filter locations by type using the toggles above. Click on any marker to see more details about the location.
            </p>
            
            {/* Statistics */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-gray-900">Found Places</span>
              </div>
              <div className="text-lg font-bold text-primary">{totalPlaces}</div>
              <p className="text-xs text-gray-600">kid-friendly locations</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Data from <span className="font-medium">OpenStreetMap</span><br />
            Powered by Leaflet & Overpass API
          </p>
        </div>
      </div>
    </>
  );
}
