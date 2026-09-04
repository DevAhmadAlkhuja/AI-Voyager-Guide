declare module "world-countries" {
  const countries: any[];
  export default countries;
}

declare module "country-state-city" {
  export type Country = any;
  export type State = any;
  export type City = any;

  export const Country: {
    getCountryByCode: (isoCode: string) => Country | undefined;
  };

  export const State: {
    getStatesOfCountry: (countryCode: string) => State[];
  };

  export const City: {
    getCitiesOfState: (countryCode: string, stateIsoCode: string) => City[];
    getCitiesOfCountry: (countryCode: string) => City[];
  };
}
