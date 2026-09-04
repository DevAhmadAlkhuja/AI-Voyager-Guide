import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { AiVoyagerEvent, aiVoyagerCreateEvent } from "@/lib/aiVoyagerApi";
import { AiVoyagerCity, AiVoyagerCountry, loadAiVoyagerCitiesByCountry, loadAiVoyagerCountries } from "@/lib/aiVoyagerGeo";
import { Check, ChevronsUpDown } from "lucide-react";

function safeTrim(v: any) {
  const s = String(v ?? "").trim();
  return s;
}

export default function AiVoyagerEventDialog(props: {
  token: string;
  open: boolean;
  date: string;
  prefill: any;
  onOpenChange: (v: boolean) => void;
  onCreated: (e: AiVoyagerEvent) => void;
}) {
  const countries = useMemo(() => loadAiVoyagerCountries(), []);

  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const [selectedCountry, setSelectedCountry] = useState<AiVoyagerCountry | null>(null);
  const [selectedCity, setSelectedCity] = useState<AiVoyagerCity | null>(null);

  const [time, setTime] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!props.open) return;

    setError(null);
    setCountryQuery("");
    setCityQuery("");
    setTime("");
    setTitle("");
    setDescription("");

    const pre = props.prefill || {};

    if (pre.countryCode) {
      const match = countries.find((c) => c.countryCode === String(pre.countryCode).toUpperCase());
      setSelectedCountry(match || null);
      if (match) setCountryQuery(match.name);
    } else if (pre.country) {
      const match = countries.find((c) => c.name.toLowerCase() === String(pre.country).toLowerCase());
      setSelectedCountry(match || null);
      if (match) setCountryQuery(match.name);
    } else {
      setSelectedCountry(null);
    }

    setSelectedCity(null);
    if (pre.city && pre.countryCode) {
      const list = loadAiVoyagerCitiesByCountry(String(pre.countryCode).toUpperCase());
      const match = list.find((c) => c.name.toLowerCase() === String(pre.city).toLowerCase());
      if (match) {
        setSelectedCity(match);
        setCityQuery(match.name);
      }
    }
  }, [props.open]);

  const filteredCountries = useMemo(() => {
    const q = safeTrim(countryQuery).toLowerCase();
    if (!q) return countries.slice(0, 80);
    return countries
      .filter((c) => c.name.toLowerCase().includes(q) || c.countryCode.toLowerCase().includes(q))
      .slice(0, 200);
  }, [countries, countryQuery]);

  const cities = useMemo(() => {
    if (!selectedCountry) return [];
    return loadAiVoyagerCitiesByCountry(selectedCountry.countryCode);
  }, [selectedCountry]);

  const filteredCities = useMemo(() => {
    const q = safeTrim(cityQuery).toLowerCase();
    if (!q) return cities.slice(0, 100);
    return cities.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 250);
  }, [cities, cityQuery]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!selectedCountry) throw new Error("Country is required");
      if (!selectedCity) throw new Error("City is required");
      if (!safeTrim(title)) throw new Error("Event title is required");

      const t = safeTrim(time);
      const payload = {
        date: props.date,
        time: t ? t : null,
        country: selectedCountry.name,
        countryCode: selectedCountry.countryCode,
        city: selectedCity.name,
        latitude: selectedCity.latitude || selectedCountry.latitude,
        longitude: selectedCity.longitude || selectedCountry.longitude,
        title: safeTrim(title),
        description: safeTrim(description) || "",
      };

      const out = await aiVoyagerCreateEvent(props.token, payload);
      props.onCreated(out.event);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Travel Event</DialogTitle>
          <DialogDescription>Create an event for {props.date} and sync it across calendar + globe.</DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Country</p>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={countryOpen}
                  className="w-full justify-between"
                >
                  <span className={cn("truncate", !selectedCountry && "text-muted-foreground")}>
                    {selectedCountry ? `${selectedCountry.name} (${selectedCountry.countryCode})` : "Select a country"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search country..."
                    value={countryQuery}
                    onValueChange={(v) => {
                      setCountryQuery(v);
                      setSelectedCountry(null);
                      setSelectedCity(null);
                      setCityQuery("");
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <ScrollArea className="h-[260px]">
                      {filteredCountries.map((c) => (
                        <CommandItem
                          key={c.countryCode}
                          value={`${c.name} ${c.countryCode}`}
                          onSelect={() => {
                            setSelectedCountry(c);
                            setCountryQuery("");
                            setSelectedCity(null);
                            setCityQuery("");
                            setCountryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCountry?.countryCode === c.countryCode ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="flex-1 truncate">{c.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{c.countryCode}</span>
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">City</p>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={cityOpen}
                  className="w-full justify-between"
                  disabled={!selectedCountry}
                >
                  <span className={cn("truncate", !selectedCity && "text-muted-foreground")}>
                    {selectedCity ? selectedCity.name : selectedCountry ? "Select a city" : "Select country first"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={selectedCountry ? "Search city..." : "Select country first"}
                    value={cityQuery}
                    onValueChange={(v) => {
                      setCityQuery(v);
                      setSelectedCity(null);
                    }}
                    disabled={!selectedCountry}
                  />
                  <CommandList>
                    <CommandEmpty>No city found.</CommandEmpty>
                    <ScrollArea className="h-[260px]">
                      {filteredCities.map((c) => (
                        <CommandItem
                          key={`${c.countryCode}-${c.name}`}
                          value={c.name}
                          onSelect={() => {
                            setSelectedCity(c);
                            setCityQuery("");
                            setCityOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCity?.name === c.name ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="flex-1 truncate">{c.name}</span>
                        </CommandItem>
                      ))}
                      {!selectedCountry && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Select a country first.</div>
                      )}
                    </ScrollArea>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="HH:MM" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event description" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
