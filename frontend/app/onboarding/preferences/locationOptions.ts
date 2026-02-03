// A minimal country list for dropdowns. Expand as needed.
import { countries as countriesData } from "countries-list";
import cities from "cities-list";

// Convert countries-list to react-select options
export const countries = Object.values(countriesData).map((country: { name: string }) => ({ value: country.name, label: country.name }));

// Convert cities-list to react-select options (limit to top 200 for performance)
export const citiesOptions = Object.keys(cities)
  .slice(0, 500)
  .map((city: string) => ({ value: city, label: city }));
