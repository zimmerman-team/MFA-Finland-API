export const locationsMapping: LocationMappingKeys = {
  Europe: [
    "TR",
    "XK",
    "RS",
    "BA",
    "ME",
    "MK",
    "AL",
    "UA",
    "BY",
    "MD",
    "88",
    "89"
  ],
  "North of Sahara": ["DZ", "LY", "MA", "TN", "EG", "189"],
  "South of Sahara": [
    "ZA",
    "AO",
    "BW",
    "BI",
    "CM",
    "CV",
    "CF",
    "TD",
    "KM",
    "CG",
    "CD",
    "BJ",
    "ET",
    "GA",
    "GH",
    "GN",
    "GW",
    "GQ",
    "CI",
    "KE",
    "LS",
    "LR",
    "MG",
    "MW",
    "ML",
    "MR",
    "MU",
    "MZ",
    "NE",
    "NG",
    "ZW",
    "RW",
    "ST",
    "SN",
    "SC",
    "ER",
    "SL",
    "SO",
    "DJ",
    "NA",
    "SH",
    "SD",
    "SS",
    "SZ",
    "TZ",
    "TG",
    "UG",
    "BF",
    "ZM",
    "289"
  ],
  "North & Central America": [
    "CR",
    "CU",
    "DO",
    "SV",
    "GT",
    "HT",
    "HN",
    "BZ",
    "JM",
    "MX",
    "NI",
    "PA",
    "AG",
    "DM",
    "380",
    "GD",
    "LC",
    "VC",
    "MS",
    "389"
  ],
  "South America": [
    "AR",
    "BO",
    "BR",
    "CL",
    "CO",
    "EC",
    "GY",
    "PY",
    "PE",
    "SR",
    "UY",
    "VE",
    "489",
    "498"
  ],
  "Middle East": ["IR", "IQ", "JO", "LB", "PS", "SY", "YE", "589"],
  "South & Central Asia": [
    "AM",
    "AZ",
    "GE",
    "KZ",
    "KG",
    "TJ",
    "TM",
    "UZ",
    "619",
    "AF",
    "BT",
    "MM",
    "LK",
    "IN",
    "MV",
    "NP",
    "PK",
    "BD",
    "679",
    "689"
  ],
  "Far East Asia": [
    "KH",
    "CN",
    "ID",
    "KP",
    "MY",
    "MN",
    "PH",
    "TH",
    "TL",
    "VN",
    "789",
    "798"
  ],
  Oceania: [
    "CK",
    "FJ",
    "KI",
    "NR",
    "VU",
    "NU",
    "MH",
    "FM",
    "PW",
    "PG",
    "SB",
    "TK",
    "TO",
    "TV",
    "WF",
    "WS",
    "889"
  ],
  "Regional and Unspecified": ["998"]
};

export type LocationMappingKeys = {
  Europe: string[];
  "North of Sahara": string[];
  "South of Sahara": string[];
  "North & Central America": string[];
  "South America": string[];
  "Middle East": string[];
  "South & Central Asia": string[];
  "Far East Asia": string[];
  Oceania: string[];
  "Regional and Unspecified": string[];
};

export const regionTranslations = {
  Europe: {
    name: "Europe",
    name_fi: "Eurooppa",
    name_se: "Europa"
  },
  "North of Sahara": {
    name: "North of Sahara",
    name_fi: "Saharan pohjoispuolinen Afrikka",
    name_se: "Norr om Sahara"
  },
  "South of Sahara": {
    name: "South of Sahara",
    name_fi: "Saharan eteläpuolinen Afrikka",
    name_se: "Söder om Sahara"
  },
  "North & Central America": {
    name: "North & Central America",
    name_fi: "Pohjois- ja Väli-Amerikka",
    name_se: "Nord- och Mellanamerika"
  },
  "South America": {
    name: "South America",
    name_fi: "Etelä-Amerikka",
    name_se: "Sydamerika"
  },
  "Middle East": {
    name: "Middle East",
    name_fi: "Lähi-Itä",
    name_se: "Mellanöstern"
  },
  "South & Central Asia": {
    name: "South & Central Asia",
    name_fi: "Etelä- ja Keski-Aasia",
    name_se: "Syd- och Centralasien"
  },
  "Far East Asia": {
    name: "Far East Asia",
    name_fi: "Itäinen Aasia",
    name_se: "Östasien"
  },
  Oceania: {
    name: "Oceania",
    name_fi: "Oseania",
    name_se: "Oceania"
  },
  "Regional and Unspecified": {
    name: "Regional and Unspecified",
    name_fi: "Alueellinen ja alueellisesti kohdistamaton",
    name_se: "Regional och ospecificerat"
  }
};
