import { useState } from 'react';
import { X, Menu, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { ACTIVITY_CONFIGS } from '@/lib/overpass';
import type { FilterState } from '@shared/types';

interface SidebarProps {
  filters: FilterState;
  onToggleFilter: (type: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  getPlaceCount: (type: string) => number;
  totalPlaces: number;
  error: string | null;
}

export function Sidebar({
  filters,
  onToggleFilter,
  onRefresh,
  isLoading,
  getPlaceCount,
  totalPlaces,
  error
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hudson County</h1>
              <p className="text-sm text-gray-600 mt-1">Kid-Friendly Places</p>
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Activities</h2>
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {error && (
            <Card className="mb-6 border-destructive">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive">{error}</p>
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
          <div className="space-y-4">
            {Object.entries(ACTIVITY_CONFIGS).map(([type, config]) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <div>
                    <span className="font-medium text-gray-900">{config.label}</span>
                    <p className="text-xs text-gray-500">{getPlaceCount(type)} places</p>
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

          {/* Statistics */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-semibold text-gray-900">Found Places</span>
              </div>
              <div className="text-2xl font-bold text-primary">{totalPlaces}</div>
              <p className="text-sm text-gray-600">kid-friendly locations</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Data from <span className="font-medium">OpenStreetMap</span><br />
            Powered by Leaflet & Overpass API
          </p>
        </div>
      </div>
    </>
  );
}
