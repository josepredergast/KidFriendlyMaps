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
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Hudson County</h1>
              <p className="text-xs text-gray-600">Kid-Friendly Places</p>
            </div>
            <Button
              onClick={closeMobile}
              className="lg:hidden h-6 w-6"
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm h-8"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Activities Section */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Activities</h2>
              <Button
                onClick={onRefresh}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {error && (
              <Card className="mb-3 border-destructive">
                <CardContent className="pt-3">
                  <p className="text-xs text-destructive">{error}</p>
                  <Button
                    onClick={onRefresh}
                    variant="outline"
                    size="sm"
                    className="mt-2 h-6 text-xs"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Activity Filters */}
            <div className="space-y-0.5">
              {Object.entries(ACTIVITY_CONFIGS).map(([type, config]) => (
                <div
                  key={type}
                  className="flex items-center justify-between px-1 py-1 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-base leading-none">{config.icon}</span>
                    <span className="text-sm font-medium text-gray-900 truncate">{config.label}</span>
                    <span className="text-xs font-bold text-gray-700 ml-auto mr-2">
                      {getPlaceCount(type)}
                    </span>
                  </div>
                  <Switch
                    checked={filters[type] || false}
                    onCheckedChange={() => onToggleFilter(type)}
                    disabled={isLoading}
                    className="scale-75"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Search Results / Place List */}
          {searchQuery && (
            <div className="p-3">
              <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                Results ({filteredSearchPlaces.length})
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredSearchPlaces.slice(0, 8).map((place) => {
                  const config = ACTIVITY_CONFIGS[place.type];
                  return (
                    <div
                      key={place.id}
                      onClick={() => handlePlaceClick(place)}
                      className="p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: config.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-gray-900 truncate">{place.name}</h4>
                          <p className="text-xs text-gray-500">{config.label.slice(0, -1)}</p>
                          {place.address && (
                            <p className="text-xs text-gray-600 truncate">{place.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredSearchPlaces.length > 8 && (
                  <p className="text-xs text-gray-500 text-center py-1">
                    +{filteredSearchPlaces.length - 8} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="p-3">
            <h3 className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">About</h3>
            <p className="text-xs text-gray-600 leading-tight mb-2">
              Kid-friendly places in Hudson County, NJ. Toggle filters and click markers for details.
            </p>
            
            {/* Statistics */}
            <div className="bg-gray-50 rounded p-2">
              <div className="flex items-center space-x-1 mb-0.5">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-gray-900">Total Places</span>
              </div>
              <div className="text-base font-bold text-primary">{totalPlaces}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Data from OpenStreetMap
          </p>
        </div>
      </div>
    </>
  );
}
