import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, CheckCircle2, X } from 'lucide-react';

const LocationDetectorModal = ({ isOpen, onClose, onLocationSet }) => {
  const [loading, setLoading] = useState(false);
  const [manualQuery, setManualQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    setLoading(true);
    setErrorMsg('');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // OpenStreetMap Reverse Geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const address = data.address;
          const detectedCity = address.city || address.town || address.village || address.suburb || 'Local Area';
          const detectedState = address.state || '';
          const fullFormatted = `${address.road || address.suburb || detectedCity}, ${detectedCity} (${address.postcode || 'Delivery Zone 1'})`;

          const locationData = {
            formatted: fullFormatted,
            city: detectedCity,
            lat: latitude,
            lon: longitude,
            zone: 'HyperLocal Zone (0-5 km: Free Delivery)',
          };

          localStorage.setItem('dmartx_location', JSON.stringify(locationData));
          onLocationSet(locationData);
          onClose();
        } catch (err) {
          const fallback = {
            formatted: `GPS Coordinates: ${latitude.toFixed(2)}, ${longitude.toFixed(2)} (Zone 1)`,
            city: 'Current Location',
            lat: latitude,
            lon: longitude,
            zone: 'HyperLocal Zone',
          };
          localStorage.setItem('dmartx_location', JSON.stringify(fallback));
          onLocationSet(fallback);
          onClose();
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        setErrorMsg('Location permission denied. Please enter your delivery address manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    const manualLoc = {
      formatted: manualQuery.trim(),
      city: manualQuery.trim().split(',')[0],
      zone: 'City Standard Delivery',
    };
    localStorage.setItem('dmartx_location', JSON.stringify(manualLoc));
    onLocationSet(manualLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-900/10 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Instant Geolocation
            </span>
            <h3 className="text-lg font-black text-emerald-950 mt-1">Delivery in 15-30 Minutes</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Provide your delivery location to view available stock and delivery slots.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleDetectLocation}
            disabled={loading}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-800/20 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Navigation className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Detecting GPS Coordinates...' : 'Detect my current location'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] font-black text-slate-400 uppercase">OR</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <form onSubmit={handleManualSubmit} className="relative">
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Search delivery area, apartment, or pin code..."
              className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:bg-white focus:border-emerald-600 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold transition"
            >
              Confirm
            </button>
          </form>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
          <span>Protected by D-MartX Geofencing Engine</span>
          <span className="text-emerald-700 font-bold">Zone 1 Verified</span>
        </div>
      </div>
    </div>
  );
};

export default LocationDetectorModal;