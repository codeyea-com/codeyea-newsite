export const englishOnlyCountries = new Set(
  "US CA MX GT BZ SV HN NI CR PA CU HT DO JM BS BB DM GD AG KN LC VC TT CO VE GY SR EC PE BO BR PY UY AR CL FK GF GP MQ BL MF PM PR VI VG AI BM KY AW CW BQ SX TC MS GL GB IE FR DE ES PT IT NL BE LU CH AT DK NO SE FI IS EE LV LT PL CZ SK HU SI HR BA RS ME AL MK GR BG RO MD UA BY RU VA SM MC AD LI MT CY TR AX FO GG JE IM GI SJ XK".split(
    " ",
  ),
);
export function languageSwitchAllowed(country: string | null) {
  return (
    !!country &&
    /^[A-Z]{2}$/.test(country) &&
    !englishOnlyCountries.has(country)
  );
}
