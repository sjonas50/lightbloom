"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BirthData } from "@/lib/validators/birth-data";

interface LocationResult {
  formatted: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
  isLoading?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function BirthDataForm({ onSubmit, isLoading }: BirthDataFormProps) {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchLocation = useCallback(
    (query: string) => {
      if (searchTimeout) clearTimeout(searchTimeout);
      if (query.length < 3) {
        setLocationResults([]);
        return;
      }
      const timeout = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setLocationResults(data.results || []);
        } catch {
          setLocationResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 400);
      setSearchTimeout(timeout);
    },
    [searchTimeout]
  );

  const handleLocationChange = (value: string) => {
    setLocationQuery(value);
    setSelectedLocation(null);
    searchLocation(value);
  };

  const selectLocation = (loc: LocationResult) => {
    setSelectedLocation(loc);
    setLocationQuery(loc.formatted);
    setLocationResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!year || !month || !day || !selectedLocation) return;

    const m = String(MONTHS.indexOf(month) + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const birthDate = `${year}-${m}-${d}`;

    let birthTime: string | undefined;
    if (!timeUnknown && hour && minute) {
      let h = parseInt(hour);
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      birthTime = `${String(h).padStart(2, "0")}:${minute.padStart(2, "0")}`;
    }

    onSubmit({
      birthDate,
      birthTime,
      birthTimeUnknown: timeUnknown,
      location: selectedLocation.formatted,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      timezone: selectedLocation.timezone,
    });
  };

  const maxDay = year && month ? daysInMonth(parseInt(year), MONTHS.indexOf(month) + 1) : 31;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Birth Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Birth Date</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Year"
                min={1920}
                max={2026}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          {/* Birth Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Birth Time</Label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={timeUnknown}
                  onChange={(e) => setTimeUnknown(e.target.checked)}
                  className="rounded border-border"
                />
                Unknown
              </label>
            </div>
            {!timeUnknown && (
              <div className="grid grid-cols-3 gap-2">
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={minute} onValueChange={setMinute}>
                  <SelectTrigger>
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <SelectItem key={m} value={String(m).padStart(2, "0")}>
                        {String(m).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={ampm} onValueChange={setAmpm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Birth Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Birth Location</Label>
            <div className="relative">
              <Input
                placeholder="City, State/Country..."
                value={locationQuery}
                onChange={(e) => handleLocationChange(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  Searching...
                </div>
              )}
              {locationResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
                  {locationResults.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                      onClick={() => selectLocation(loc)}
                    >
                      {loc.formatted}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedLocation && (
              <p className="text-xs text-muted-foreground">
                {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)} &middot; {selectedLocation.timezone}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!year || !month || !day || !selectedLocation || isLoading}
          >
            {isLoading ? "Calculating..." : "Generate Chart & Reading"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
