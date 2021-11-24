export const SunburstChartColors = [
  "#4CAEEF",
  "#D1D1D1",
  "#F4A490",
  "#5F8070",
  "#FEEAD1",
  "#561735",
  "#D4B59E",
  "#CCDDD5",
  "#023833",
  "#BBA1BF",
  "#FCBB6D"
];

export const sectorMapping = {
  title: "activities",
  color: "",
  children: [
    {
      code: "2",
      title: "Economic sectors",
      color: SunburstChartColors[0],
      children: [
        {
          code: "210",
          title: "Transport & Storage",
          color: SunburstChartColors[0],
          children: [
            {
              code: "21010",
              color: SunburstChartColors[0],
              title: "Transport policy and administrative management"
            },
            {
              code: "21011",
              color: SunburstChartColors[0],
              title: "Transport policy, planning and administration"
            },
            {
              code: "21012",
              color: SunburstChartColors[0],
              title: "Public transport services"
            },
            {
              code: "21013",
              color: SunburstChartColors[0],
              title: "Transport regulation"
            },
            {
              code: "21020",
              color: SunburstChartColors[0],
              title: "Road transport"
            },
            {
              code: "21021",
              color: SunburstChartColors[0],
              title: "Feeder road construction"
            },
            {
              code: "21022",
              color: SunburstChartColors[0],
              title: "Feeder road maintenance"
            },
            {
              code: "21023",
              color: SunburstChartColors[0],
              title: "National road construction"
            },
            {
              code: "21024",
              color: SunburstChartColors[0],
              title: "National road maintenance"
            },
            {
              code: "21030",
              color: SunburstChartColors[0],
              title: "Rail transport"
            },
            {
              code: "21040",
              color: SunburstChartColors[0],
              title: "Water transport"
            },
            {
              code: "21050",
              color: SunburstChartColors[0],
              title: "Air transport"
            },
            {
              code: "21060",
              color: SunburstChartColors[0],
              title: "Storage"
            },
            {
              code: "21081",
              color: SunburstChartColors[0],
              title: "Education and training in transport and storage"
            }
          ]
        },
        {
          code: "220",
          title: "Communications",
          color: SunburstChartColors[0],
          children: [
            {
              code: "22010",
              color: SunburstChartColors[0],
              title: "Communications policy and administrative management"
            },
            {
              code: "22011",
              color: SunburstChartColors[0],
              title: "Communications policy, planning and administration"
            },
            {
              code: "22012",
              color: SunburstChartColors[0],
              title: "Postal services"
            },
            {
              code: "22013",
              color: SunburstChartColors[0],
              title: "Information services"
            },
            {
              code: "22020",
              color: SunburstChartColors[0],
              title: "Telecommunications"
            },
            {
              code: "22030",
              color: SunburstChartColors[0],
              title: "Radio/television/print media"
            },
            {
              code: "22040",
              color: SunburstChartColors[0],
              title: "Information and communication technology (ICT)"
            }
          ]
        },
        {
          code: "230",
          title: "Energy generation, renewable sources",
          color: SunburstChartColors[0],
          children: [
            {
              code: "23010",
              color: SunburstChartColors[0],
              title: "Energy policy and administrative management"
            },
            {
              code: "23020",
              color: SunburstChartColors[0],
              title: "Power generation/non-renewable sources"
            },
            {
              code: "23030",
              color: SunburstChartColors[0],
              title: "Power generation/renewable sources"
            },
            {
              code: "23040",
              color: SunburstChartColors[0],
              title: "Electrical transmission/ distribution"
            },
            {
              code: "23060",
              color: SunburstChartColors[0],
              title: "Gas distribution"
            },
            {
              code: "23061",
              color: SunburstChartColors[0],
              title: "Oil-fired power plants"
            },
            {
              code: "23062",
              color: SunburstChartColors[0],
              title: "Gas-fired power plants"
            },
            {
              code: "23063",
              color: SunburstChartColors[0],
              title: "Coal-fired power plants"
            },
            {
              code: "23064",
              color: SunburstChartColors[0],
              title: "Nuclear power plants"
            },
            {
              code: "23065",
              color: SunburstChartColors[0],
              title: "Hydro-electric power plants"
            },
            {
              code: "23066",
              color: SunburstChartColors[0],
              title: "Geothermal energy"
            },
            {
              code: "23067",
              color: SunburstChartColors[0],
              title: "Solar energy"
            },
            {
              code: "23068",
              color: SunburstChartColors[0],
              title: "Wind power"
            },
            {
              code: "23069",
              color: SunburstChartColors[0],
              title: "Ocean power"
            },
            {
              code: "23070",
              color: SunburstChartColors[0],
              title: "Biomass"
            },
            {
              code: "23081",
              color: SunburstChartColors[0],
              title: "Energy education/training"
            },
            {
              code: "23082",
              color: SunburstChartColors[0],
              title: "Energy research"
            }
          ]
        },
        {
          code: "231",
          color: SunburstChartColors[0],
          title: "Energy Policy",
          children: [
            {
              code: "23110",
              color: SunburstChartColors[0],
              title: "Energy policy and administrative management"
            },
            {
              code: "23183",
              color: SunburstChartColors[0],
              title: "Energy conservation and demand-side efficiency"
            }
          ]
        },
        {
          code: "232",
          color: SunburstChartColors[0],
          title: "Energy generation, renewable sources",
          children: [
            {
              code: "23210",
              color: SunburstChartColors[0],
              title:
                "Energy generation, renewable sources - multiple technologies"
            },
            {
              code: "23220",
              color: SunburstChartColors[0],
              title: "Hydro-electric power plants"
            },
            {
              code: "23230",
              color: SunburstChartColors[0],
              title: "Solar energy for centralised grids"
            },
            {
              code: "23240",
              color: SunburstChartColors[0],
              title: "Wind energy"
            },
            {
              code: "23250",
              color: SunburstChartColors[0],
              title: "Marine energy"
            },
            {
              code: "23270",
              color: SunburstChartColors[0],
              title: "Biofuel-fired power plants"
            }
          ]
        },
        {
          code: "233",
          color: SunburstChartColors[0],
          title: "Energy generation, non-renewable sources",
          children: [
            {
              code: "23310",
              color: SunburstChartColors[0],
              title: "Energy generation, non-renewable sources, unspecified"
            }
          ]
        },
        {
          code: "236",
          color: SunburstChartColors[0],
          title: "Energy distribution",
          children: [
            {
              code: "23630",
              color: SunburstChartColors[0],
              title:
                "Electric power transmission and distribution (centralised grids)"
            }
          ]
        },
        {
          code: "240",
          title: "Banking & Financial Services",
          color: SunburstChartColors[0],
          children: [
            {
              code: "24010",
              color: SunburstChartColors[0],
              title: "Financial policy and administrative management"
            },
            {
              code: "24020",
              color: SunburstChartColors[0],
              title: "Monetary institutions"
            },
            {
              code: "24030",
              color: SunburstChartColors[0],
              title: "Formal sector financial intermediaries"
            },
            {
              code: "24040",
              color: SunburstChartColors[0],
              title: "Informal/semi-formal financial intermediaries"
            },
            {
              code: "24050",
              color: SunburstChartColors[0],
              title: "Remittance facilitation, promotion and optimisation"
            },
            {
              code: "24081",
              color: SunburstChartColors[0],
              title: "Education/training in banking and financial services"
            }
          ]
        },
        {
          code: "250",
          title: "Business & Other Services",
          color: SunburstChartColors[0],
          children: [
            {
              code: "25010",
              color: SunburstChartColors[0],
              title: "Business Policy and Administration"
            },
            {
              code: "25020",
              color: SunburstChartColors[0],
              title: "Privatisation"
            },
            {
              code: "25030",
              color: SunburstChartColors[0],
              title: "Business development services"
            },
            {
              code: "25040",
              color: SunburstChartColors[0],
              title: "Responsible Business Conduct"
            }
          ]
        }
      ]
    },
    {
      code: "3",
      title: "Productive sectors",
      color: SunburstChartColors[1],
      children: [
        {
          code: "311",
          title: "Agriculture",
          color: SunburstChartColors[1],
          children: [
            {
              code: "31110",
              color: SunburstChartColors[1],
              title: "Agricultural policy and administrative management"
            },
            {
              code: "31120",
              color: SunburstChartColors[1],
              title: "Agricultural development"
            },
            {
              code: "31130",
              color: SunburstChartColors[1],
              title: "Agricultural land resources"
            },
            {
              code: "31140",
              color: SunburstChartColors[1],
              title: "Agricultural water resources"
            },
            {
              code: "31150",
              color: SunburstChartColors[1],
              title: "Agricultural inputs"
            },
            {
              code: "31161",
              color: SunburstChartColors[1],
              title: "Food crop production"
            },
            {
              code: "31162",
              color: SunburstChartColors[1],
              title: "Industrial crops/export crops"
            },
            {
              code: "31163",
              color: SunburstChartColors[1],
              title: "Livestock"
            },
            {
              code: "31164",
              color: SunburstChartColors[1],
              title: "Agrarian reform"
            },
            {
              code: "31165",
              color: SunburstChartColors[1],
              title: "Agricultural alternative development"
            },
            {
              code: "31166",
              color: SunburstChartColors[1],
              title: "Agricultural extension"
            },
            {
              code: "31181",
              color: SunburstChartColors[1],
              title: "Agricultural education/training"
            },
            {
              code: "31182",
              color: SunburstChartColors[1],
              title: "Agricultural research"
            },
            {
              code: "31191",
              color: SunburstChartColors[1],
              title: "Agricultural services"
            },
            {
              code: "31192",
              color: SunburstChartColors[1],
              title: "Plant and post-harvest protection and pest control"
            },
            {
              code: "31193",
              color: SunburstChartColors[1],
              title: "Agricultural financial services"
            },
            {
              code: "31194",
              color: SunburstChartColors[1],
              title: "Agricultural co-operatives"
            },
            {
              code: "31195",
              color: SunburstChartColors[1],
              title: "Livestock/veterinary services"
            }
          ]
        },
        {
          code: "312",
          title: "Forestry",
          color: SunburstChartColors[1],
          children: [
            {
              code: "31210",
              color: SunburstChartColors[1],
              title: "Forestry policy and administrative management"
            },
            {
              code: "31220",
              color: SunburstChartColors[1],
              title: "Forestry development"
            },
            {
              code: "31261",
              color: SunburstChartColors[1],
              title: "Fuelwood/charcoal"
            },
            {
              code: "31281",
              color: SunburstChartColors[1],
              title: "Forestry education/training"
            },
            {
              code: "31282",
              color: SunburstChartColors[1],
              title: "Forestry research"
            },
            {
              code: "31291",
              color: SunburstChartColors[1],
              title: "Forestry services"
            }
          ]
        },
        {
          code: "313",
          title: "Fishing",
          color: SunburstChartColors[1],
          children: [
            {
              code: "31310",
              color: SunburstChartColors[1],
              title: "Fishing policy and administrative management"
            },
            {
              code: "31320",
              color: SunburstChartColors[1],
              title: "Fishery development"
            },
            {
              code: "31381",
              color: SunburstChartColors[1],
              title: "Fishery education/training"
            },
            {
              code: "31382",
              color: SunburstChartColors[1],
              title: "Fishery research"
            },
            {
              code: "31391",
              color: SunburstChartColors[1],
              title: "Fishery services"
            }
          ]
        },
        {
          code: "321",
          title: "Industry",
          color: SunburstChartColors[1],
          children: [
            {
              code: "32110",
              color: SunburstChartColors[1],
              title: "Industrial policy and administrative management"
            },
            {
              code: "32120",
              color: SunburstChartColors[1],
              title: "Industrial development"
            },
            {
              code: "32130",
              color: SunburstChartColors[1],
              title: "Small and medium-sized enterprises (SME) development"
            },
            {
              code: "32140",
              color: SunburstChartColors[1],
              title: "Cottage industries and handicraft"
            },
            {
              code: "32161",
              color: SunburstChartColors[1],
              title: "Agro-industries"
            },
            {
              code: "32162",
              color: SunburstChartColors[1],
              title: "Forest industries"
            },
            {
              code: "32163",
              color: SunburstChartColors[1],
              title: "Textiles, leather and substitutes"
            },
            {
              code: "32164",
              color: SunburstChartColors[1],
              title: "Chemicals"
            },
            {
              code: "32165",
              color: SunburstChartColors[1],
              title: "Fertilizer plants"
            },
            {
              code: "32166",
              color: SunburstChartColors[1],
              title: "Cement/lime/plaster"
            },
            {
              code: "32167",
              color: SunburstChartColors[1],
              title: "Energy manufacturing (fossil fuels)"
            },
            {
              code: "32168",
              color: SunburstChartColors[1],
              title: "Pharmaceutical production"
            },
            {
              code: "32169",
              color: SunburstChartColors[1],
              title: "Basic metal industries"
            },
            {
              code: "32170",
              color: SunburstChartColors[1],
              title: "Non-ferrous metal industries"
            },
            {
              code: "32171",
              color: SunburstChartColors[1],
              title: "Engineering"
            },
            {
              code: "32172",
              color: SunburstChartColors[1],
              title: "Transport equipment industry"
            },
            {
              code: "32173",
              color: SunburstChartColors[1],
              title: "Modern biofuels manufacturing"
            },
            {
              code: "32174",
              color: SunburstChartColors[1],
              title: "Clean cooking appliances manufacturing"
            },
            {
              code: "32182",
              category: "321",
              color: SunburstChartColors[1],
              title: "Technological research and development"
            }
          ]
        },
        {
          code: "322",
          title: "Mineral Resources & Mining",
          color: SunburstChartColors[1],
          children: [
            {
              code: "32210",
              color: SunburstChartColors[1],
              title: "Mineral/mining policy and administrative management"
            },
            {
              code: "32220",
              color: SunburstChartColors[1],
              title: "Mineral prospection and exploration"
            }
          ]
        },
        {
          code: "323",
          title: "Construction",
          color: SunburstChartColors[1],
          children: [
            {
              code: "32310",
              color: SunburstChartColors[1],
              title: "Construction policy and administrative management"
            }
          ]
        },
        {
          code: "331",
          title: "Trade Policies & Regulations",
          color: SunburstChartColors[1],
          children: [
            {
              code: "33110",
              color: SunburstChartColors[1],
              title: "Trade policy and administrative management"
            },
            {
              code: "33120",
              color: SunburstChartColors[1],
              title: "Trade facilitation"
            },
            {
              code: "33130",
              color: SunburstChartColors[1],
              title: "Regional trade agreements (RTAs)"
            },
            {
              code: "33140",
              color: SunburstChartColors[1],
              title: "Multilateral trade negotiations"
            },
            {
              code: "33150",
              color: SunburstChartColors[1],
              title: "Trade-related adjustment"
            },
            {
              code: "33181",
              color: SunburstChartColors[1],
              title: "Trade education/training"
            }
          ]
        },
        {
          code: "332",
          title: "Tourism",
          color: SunburstChartColors[1],
          children: [
            {
              code: "33210",
              color: SunburstChartColors[1],
              title: "Tourism policy and administrative management"
            }
          ]
        }
      ]
    },
    {
      code: "4",
      title: "Multi sector",
      color: SunburstChartColors[2],
      children: [
        {
          code: "410",
          title: "General environmental protection",
          color: SunburstChartColors[2],
          children: [
            {
              code: "41010",
              color: SunburstChartColors[2],
              title: "Environmental policy and administrative management"
            },
            {
              code: "41020",
              color: SunburstChartColors[2],
              title: "Biosphere protection"
            },
            {
              code: "41030",
              color: SunburstChartColors[2],
              title: "Bio-diversity"
            },
            {
              code: "41040",
              color: SunburstChartColors[2],
              title: "Site preservation"
            },
            {
              code: "41050",
              color: SunburstChartColors[2],
              title: "Flood prevention/control"
            },
            {
              code: "41081",
              color: SunburstChartColors[2],
              title: "Environmental education/training"
            },
            {
              code: "41082",
              color: SunburstChartColors[2],
              title: "Environmental research"
            }
          ]
        },
        {
          code: "430",
          title: "Other multisector",
          color: SunburstChartColors[2],
          children: [
            {
              code: "43010",
              color: SunburstChartColors[2],
              title: "Multisector aid"
            },
            {
              code: "43030",
              color: SunburstChartColors[2],
              title: "Urban development and management"
            },
            {
              code: "43031",
              color: SunburstChartColors[2],
              title: "Urban land policy and management"
            },
            {
              code: "43032",
              color: SunburstChartColors[2],
              title: "Urban development"
            },
            {
              code: "43040",
              color: SunburstChartColors[2],
              title: "Rural development"
            },
            {
              code: "43041",
              color: SunburstChartColors[2],
              title: "Rural land policy and management"
            },
            {
              code: "43042",
              color: SunburstChartColors[2],
              title: "Rural development"
            },
            {
              code: "43050",
              color: SunburstChartColors[2],
              title: "Non-agricultural alternative development"
            },
            {
              code: "43060",
              color: SunburstChartColors[2],
              title: "Disaster Risk Reduction"
            },
            {
              code: "43071",
              color: SunburstChartColors[2],
              title: "Food security policy and administrative management"
            },
            {
              code: "43072",
              color: SunburstChartColors[2],
              title: "Household food security programmes"
            },
            {
              code: "43073",
              color: SunburstChartColors[2],
              title: "Food safety and quality"
            },
            {
              code: "43081",
              color: SunburstChartColors[2],
              title: "Multisector education/training"
            },
            {
              code: "43082",
              color: SunburstChartColors[2],
              title: "Research/scientific institutions"
            }
          ]
        }
      ]
    },
    {
      code: "7",
      title: "Humanitarian aid ",
      color: SunburstChartColors[3],
      children: [
        {
          code: "720",
          title: "Emergency Response",
          color: SunburstChartColors[3],
          children: [
            {
              code: "72010",
              color: SunburstChartColors[3],
              title: "Material relief assistance and services"
            },
            {
              code: "72011",
              color: SunburstChartColors[3],
              title: "Basic Health Care Services in Emergencies"
            },
            {
              code: "72012",
              color: SunburstChartColors[3],
              title: "Education in emergencies"
            },
            {
              code: "72040",
              color: SunburstChartColors[3],
              title: "Emergency food assistance"
            },
            {
              code: "72050",
              color: SunburstChartColors[3],
              title: "Relief co-ordination and support services"
            }
          ]
        },
        {
          code: "730",
          title: "Reconstruction relief and rehabilitation",
          color: SunburstChartColors[3],
          children: [
            {
              code: "73010",
              color: SunburstChartColors[3],
              title:
                "Immediate post-emergency reconstruction and rehabilitation"
            }
          ]
        },
        {
          code: "740",
          title: "Disaster prevention and preparedness",
          color: SunburstChartColors[3],
          children: [
            {
              code: "74010",
              color: SunburstChartColors[3],
              title: "Disaster prevention and preparedness"
            },
            {
              code: "74020",
              color: SunburstChartColors[3],
              title: "Multi-hazard response preparedness"
            }
          ]
        }
      ]
    },
    {
      code: "9",
      title: "Other aid",
      color: SunburstChartColors[4],
      children: [
        {
          code: "510",
          title: "General budget support",
          color: SunburstChartColors[4],
          children: [
            {
              code: "51010",
              color: SunburstChartColors[4],
              title: "General budget support-related aid"
            }
          ]
        },
        {
          code: "520",
          title: "Development Food Assistance",
          color: SunburstChartColors[4],
          children: [
            {
              code: "52010",
              color: SunburstChartColors[4],
              title: "Food assistance"
            }
          ]
        },
        {
          code: "530",
          title: "Other Commodity Assistance",
          color: SunburstChartColors[4],
          children: [
            {
              code: "53030",
              color: SunburstChartColors[4],
              title: "Import support (capital goods)"
            },
            {
              code: "53040",
              color: SunburstChartColors[4],
              title: "Import support (commodities)"
            }
          ]
        },
        {
          code: "600",
          title: "Action relating to debt",
          color: SunburstChartColors[4],
          children: [
            {
              code: "60010",
              color: SunburstChartColors[4],
              title: "Action relating to debt"
            },
            {
              code: "60020",
              color: SunburstChartColors[4],
              title: "Debt forgiveness"
            },
            {
              code: "60030",
              color: SunburstChartColors[4],
              title: "Relief of multilateral debt"
            },
            {
              code: "60040",
              color: SunburstChartColors[4],
              title: "Rescheduling and refinancing"
            },
            {
              code: "60061",
              color: SunburstChartColors[4],
              title: "Debt for development swap"
            },
            {
              code: "60062",
              color: SunburstChartColors[4],
              title: "Other debt swap"
            },
            {
              code: "60063",
              color: SunburstChartColors[4],
              title: "Debt buy-back"
            }
          ]
        },
        {
          code: "910",
          title: "Administrative costs of donors",
          color: SunburstChartColors[4],
          children: [
            {
              code: "91010",
              color: SunburstChartColors[4],
              title: "Administrative costs (non-sector allocable)"
            }
          ]
        },
        {
          code: "930",
          title: "Refugees in donor countries",
          color: SunburstChartColors[4],
          children: [
            {
              code: "93010",
              color: SunburstChartColors[4],
              title:
                "Refugees/asylum seekers in donor countries (non-sector allocable)"
            },
            {
              code: "93011",
              color: SunburstChartColors[4],
              title:
                "Refugees/asylum seekers in donor countries - food and shelter"
            },
            {
              code: "93012",
              color: SunburstChartColors[4],
              title: "Refugees/asylum seekers in donor countries - training"
            },
            {
              code: "93013",
              color: SunburstChartColors[4],
              title: "Refugees/asylum seekers in donor countries - health"
            },
            {
              code: "93014",
              color: SunburstChartColors[4],
              title:
                "Refugees/asylum seekers in donor countries - other temporary sustenance"
            },
            {
              code: "93015",
              color: SunburstChartColors[4],
              title:
                "Refugees/asylum seekers in donor countries - voluntary repatriation"
            },
            {
              code: "93016",
              color: SunburstChartColors[4],
              title: "Refugees/asylum seekers in donor countries - transport"
            },
            {
              code: "93017",
              color: SunburstChartColors[4],
              title:
                "Refugees/asylum seekers in donor countries - rescue at sea"
            },
            {
              code: "93018",
              color: SunburstChartColors[4],
              title:
                "Refugees/asylum seekers in donor countries - administrative costs"
            }
          ]
        },
        {
          code: "998",
          title: "Unallocated/ Unspecified",
          color: SunburstChartColors[4],
          children: [
            {
              code: "99810",
              color: SunburstChartColors[4],
              title: "Sectors not specified"
            },
            {
              code: "99820",
              color: SunburstChartColors[4],
              title: "Promotion of development awareness"
            }
          ]
        }
      ]
    },
    {
      code: "11",
      title: "Education",
      color: SunburstChartColors[5],
      children: [
        {
          code: "111",
          title: "Education, Level Unspecified",
          color: SunburstChartColors[5],
          children: [
            {
              code: "11110",
              color: SunburstChartColors[5],
              title: "Education policy and administrative management"
            },
            {
              code: "11120",
              color: SunburstChartColors[5],
              title: "Education facilities and training"
            },
            {
              code: "11130",
              color: SunburstChartColors[5],
              title: "Teacher training"
            },
            {
              code: "11182",
              color: SunburstChartColors[5],
              title: "Educational research"
            }
          ]
        },
        {
          code: "112",
          title: "Basic Education",
          color: SunburstChartColors[5],
          children: [
            {
              code: "11220",
              color: SunburstChartColors[5],
              title: "Primary education"
            },
            {
              code: "11230",
              color: SunburstChartColors[5],
              title: "Basic life skills for youth and adults"
            },
            {
              code: "11231",
              color: SunburstChartColors[5],
              title: "Basic life skills for youth"
            },
            {
              code: "11232",
              color: SunburstChartColors[5],
              title: "Primary education equivalent for adults"
            },
            {
              code: "11240",
              color: SunburstChartColors[5],
              title: "Early childhood education"
            },
            {
              code: "11250",
              color: SunburstChartColors[5],
              title: "School feeding"
            }
          ]
        },
        {
          code: "113",
          title: "Secondary Education",
          color: SunburstChartColors[5],
          children: [
            {
              code: "11320",
              color: SunburstChartColors[5],
              title: "Secondary education"
            },
            {
              code: "11321",
              color: SunburstChartColors[5],
              title: "Lower secondary education"
            },
            {
              code: "11322",
              color: SunburstChartColors[5],
              title: "Upper secondary education"
            },
            {
              code: "11330",
              color: SunburstChartColors[5],
              title: "Vocational training"
            }
          ]
        },
        {
          code: "114",
          title: "Post-secondary education",
          color: SunburstChartColors[5],
          children: [
            {
              code: "11420",
              color: SunburstChartColors[5],
              title: "Higher education"
            },
            {
              code: "11430",
              color: SunburstChartColors[5],
              title: "Advanced technical and managerial training"
            }
          ]
        }
      ]
    },
    {
      code: "12",
      title: "Health",
      color: SunburstChartColors[6],
      children: [
        {
          code: "121",
          title: "Health, general",
          color: SunburstChartColors[6],
          children: [
            {
              code: "12110",
              color: SunburstChartColors[6],
              title: "Health policy and administrative management"
            },
            {
              code: "12181",
              color: SunburstChartColors[6],
              title: "Medical education/training"
            },
            {
              code: "12182",
              color: SunburstChartColors[6],
              title: "Medical research"
            },
            {
              code: "12191",
              color: SunburstChartColors[6],
              title: "Medical services"
            },
            {
              code: "12196",
              color: SunburstChartColors[6],
              title: "Health statistics and data"
            }
          ]
        },
        {
          code: "122",
          title: "Basic health",
          color: SunburstChartColors[6],
          children: [
            {
              code: "12220",
              color: SunburstChartColors[6],
              title: "Basic health care"
            },
            {
              code: "12230",
              color: SunburstChartColors[6],
              title: "Basic health infrastructure"
            },
            {
              code: "12240",
              color: SunburstChartColors[6],
              title: "Basic nutrition"
            },
            {
              code: "12250",
              color: SunburstChartColors[6],
              title: "Infectious disease control"
            },
            {
              code: "12261",
              color: SunburstChartColors[6],
              title: "Health education"
            },
            {
              code: "12262",
              color: SunburstChartColors[6],
              title: "Malaria control"
            },
            {
              code: "12263",
              color: SunburstChartColors[6],
              title: "Tuberculosis control"
            },
            {
              code: "12281",
              color: SunburstChartColors[6],
              title: "Health personnel development"
            }
          ]
        },
        {
          code: "123",
          title: "Non-communicable diseases (NCDs)",
          color: SunburstChartColors[6],
          children: [
            {
              code: "12340",
              color: SunburstChartColors[6],
              title: "Promotion of mental health and well-being"
            }
          ]
        }
      ]
    },
    {
      code: "13",
      title: "Population policies / programmes and reproductive health",
      color: SunburstChartColors[7],
      children: [
        {
          code: "130",
          title: "Population Policies/Programmes & Reproductive Health",
          color: SunburstChartColors[7],
          children: [
            {
              code: "13010",
              color: SunburstChartColors[7],
              title: "Population policy and administrative management"
            },
            {
              code: "13020",
              color: SunburstChartColors[7],
              title: "Reproductive health care"
            },
            {
              code: "13030",
              color: SunburstChartColors[7],
              title: "Family planning"
            },
            {
              code: "13040",
              color: SunburstChartColors[7],
              title: "STD control including HIV/AIDS"
            },
            {
              code: "13081",
              color: SunburstChartColors[7],
              title:
                "Personnel development for population and reproductive health"
            },
            {
              code: "13096",
              color: SunburstChartColors[7],
              title: "Population statistics and data"
            }
          ]
        }
      ]
    },
    {
      code: "14",
      title: "Water Supply & Sanitation",
      color: SunburstChartColors[8],
      children: [
        {
          code: "140",
          title: "Water Supply & Sanitation",
          color: SunburstChartColors[8],
          children: [
            {
              code: "14010",
              color: SunburstChartColors[8],
              title: "Water sector policy and administrative management"
            },
            {
              code: "14015",
              color: SunburstChartColors[8],
              title: "Water resources conservation (including data collection)"
            },
            {
              code: "14020",
              color: SunburstChartColors[8],
              title: "Water supply and sanitation - large systems"
            },
            {
              code: "14021",
              color: SunburstChartColors[8],
              title: "Water supply - large systems"
            },
            {
              code: "14022",
              color: SunburstChartColors[8],
              title: "Sanitation - large systems"
            },
            {
              code: "14030",
              color: SunburstChartColors[8],
              title: "Basic drinking water supply and basic sanitation"
            },
            {
              code: "14031",
              color: SunburstChartColors[8],
              title: "Basic drinking water supply"
            },
            {
              code: "14032",
              color: SunburstChartColors[8],
              title: "Basic sanitation"
            },
            {
              code: "14040",
              color: SunburstChartColors[8],
              title: "River basins development"
            },
            {
              code: "14050",
              color: SunburstChartColors[8],
              title: "Waste management/disposal"
            },
            {
              code: "14081",
              color: SunburstChartColors[8],
              title: "Education and training in water supply and sanitation"
            }
          ]
        }
      ]
    },
    {
      code: "15",
      title: "Government and civil society, general",
      color: SunburstChartColors[9],
      children: [
        {
          code: "151",
          title: "Government & Civil Society-general",
          color: SunburstChartColors[9],
          children: [
            {
              code: "15110",
              color: SunburstChartColors[9],
              title: "Public sector policy and administrative management"
            },
            {
              code: "15111",
              color: SunburstChartColors[9],
              title: "Public finance management (PFM)"
            },
            {
              code: "15112",
              color: SunburstChartColors[9],
              title: "Decentralisation and support to subnational government"
            },
            {
              code: "15113",
              color: SunburstChartColors[9],
              title: "Anti-corruption organisations and institutions"
            },
            {
              code: "15114",
              color: SunburstChartColors[9],
              title: "Domestic revenue mobilisation"
            },
            {
              code: "15116",
              color: SunburstChartColors[9],
              title: "Tax collection"
            },
            {
              code: "15117",
              color: SunburstChartColors[9],
              title: "Budget planning"
            },
            {
              code: "15118",
              color: SunburstChartColors[9],
              title: "National audit"
            },
            {
              code: "15119",
              color: SunburstChartColors[9],
              title: "Debt and aid management"
            },
            {
              code: "15120",
              color: SunburstChartColors[9],
              title: "Public sector financial management"
            },
            {
              code: "15121",
              color: SunburstChartColors[9],
              title: "Foreign affairs"
            },
            {
              code: "15122",
              color: SunburstChartColors[9],
              title: "Diplomatic missions"
            },
            {
              code: "15123",
              color: SunburstChartColors[9],
              title: "Administration of developing countries' foreign aid"
            },
            {
              code: "15124",
              color: SunburstChartColors[9],
              title: "General personnel services"
            },
            {
              code: "15125",
              color: SunburstChartColors[9],
              title: "Public Procurement"
            },
            {
              code: "15126",
              color: SunburstChartColors[9],
              title: "Other general public services"
            },
            {
              code: "15127",
              color: SunburstChartColors[9],
              title: "National monitoring and evaluation"
            },
            {
              code: "15128",
              color: SunburstChartColors[9],
              title: "Local government finance"
            },
            {
              code: "15129",
              color: SunburstChartColors[9],
              title: "Other central transfers to institutions"
            },
            {
              code: "15130",
              color: SunburstChartColors[9],
              title: "Legal and judicial development"
            },
            {
              code: "15131",
              color: SunburstChartColors[9],
              title:
                "Justice, law and order policy, planning and administration"
            },
            {
              code: "15132",
              color: SunburstChartColors[9],
              title: "Police"
            },
            {
              code: "15133",
              color: SunburstChartColors[9],
              title: "Fire and rescue services"
            },
            {
              code: "15134",
              color: SunburstChartColors[9],
              title: "Judicial affairs"
            },
            {
              code: "15135",
              color: SunburstChartColors[9],
              title: "Ombudsman"
            },
            {
              code: "15136",
              color: SunburstChartColors[9],
              title: "Immigration"
            },
            {
              code: "15137",
              color: SunburstChartColors[9],
              title: "Prisons"
            },
            {
              code: "15140",
              color: SunburstChartColors[9],
              title: "Government administration"
            },
            {
              code: "15142",
              color: SunburstChartColors[9],
              title: "Macroeconomic policy"
            },
            {
              code: "15143",
              color: SunburstChartColors[9],
              title: "Meteorological services"
            },
            {
              code: "15144",
              color: SunburstChartColors[9],
              title: "National standards development"
            },
            {
              code: "15150",
              color: SunburstChartColors[9],
              title: "Democratic participation and civil society"
            },
            {
              code: "15151",
              color: SunburstChartColors[9],
              title: "Elections"
            },
            {
              code: "15152",
              color: SunburstChartColors[9],
              title: "Legislatures and political parties"
            },
            {
              code: "15153",
              color: SunburstChartColors[9],
              title: "Media and free flow of information"
            },
            {
              code: "15154",
              color: SunburstChartColors[9],
              title: "Executive office"
            },
            {
              code: "15155",
              color: SunburstChartColors[9],
              title: "Tax policy and administration support"
            },
            {
              code: "15156",
              color: SunburstChartColors[9],
              title: "Other non-tax revenue mobilisation"
            },
            {
              code: "15160",
              color: SunburstChartColors[9],
              title: "Human rights"
            },
            {
              code: "15161",
              color: SunburstChartColors[9],
              title: "Elections"
            },
            {
              code: "15162",
              color: SunburstChartColors[9],
              title: "Human rights"
            },
            {
              code: "15163",
              color: SunburstChartColors[9],
              title: "Free flow of information"
            },
            {
              code: "15164",
              color: SunburstChartColors[9],
              title: "Women's equality organisations and institutions"
            },
            {
              code: "15170",
              color: SunburstChartColors[9],
              title:
                "Women’s rights organisations and movements, and government institutions"
            },
            {
              code: "15180",
              color: SunburstChartColors[9],
              title: "Ending violence against women and girls"
            },
            {
              code: "15185",
              color: SunburstChartColors[9],
              title: "Local government administration"
            },
            {
              code: "15190",
              color: SunburstChartColors[9],
              title:
                "Facilitation of orderly, safe, regular and responsible migration and mobility"
            },
            {
              code: "15196",
              color: SunburstChartColors[9],
              title: "Government and civil society statistics and data"
            }
          ]
        },
        {
          code: "152",
          title: "Conflict prevention and resolution, peace and security",
          color: SunburstChartColors[9],
          children: [
            {
              code: "15210",
              color: SunburstChartColors[9],
              title: "Security system management and reform"
            },
            {
              code: "15220",
              color: SunburstChartColors[9],
              title:
                "Civilian peace-building, conflict prevention and resolution"
            },
            {
              code: "15230",
              color: SunburstChartColors[9],
              title: "Participation in international peacekeeping operations"
            },
            {
              code: "15240",
              color: SunburstChartColors[9],
              title: "Reintegration and SALW control"
            },
            {
              code: "15250",
              color: SunburstChartColors[9],
              title: "Removal of land mines and explosive remnants of war"
            },
            {
              code: "15261",
              color: SunburstChartColors[9],
              title: "Child soldiers (prevention and demobilisation)"
            }
          ]
        }
      ]
    },
    {
      code: "16",
      title: "Other Social Infrastructure & Services",
      color: SunburstChartColors[10],
      children: [
        {
          code: "160",
          title: "Other Social Infrastructure and Services",
          color: SunburstChartColors[10],
          children: [
            {
              code: "16010",
              color: SunburstChartColors[10],
              title: "Social Protection"
            },
            {
              code: "16011",
              color: SunburstChartColors[10],
              title:
                "Social protection and welfare services policy, planning and administration"
            },
            {
              code: "16012",
              color: SunburstChartColors[10],
              title: "Social security (excl pensions)"
            },
            {
              code: "16013",
              color: SunburstChartColors[10],
              title: "General pensions"
            },
            {
              code: "16014",
              color: SunburstChartColors[10],
              title: "Civil service pensions"
            },
            {
              code: "16015",
              color: SunburstChartColors[10],
              title:
                "Social services (incl youth development and women+ children)"
            },
            {
              code: "16020",
              color: SunburstChartColors[10],
              title: "Employment creation"
            },
            {
              code: "16030",
              color: SunburstChartColors[10],
              title: "Housing policy and administrative management"
            },
            {
              code: "16040",
              color: SunburstChartColors[10],
              title: "Low-cost housing"
            },
            {
              code: "16050",
              color: SunburstChartColors[10],
              title: "Multisector aid for basic social services"
            },
            {
              code: "16061",
              color: SunburstChartColors[10],
              title: "Culture and recreation"
            },
            {
              code: "16062",
              color: SunburstChartColors[10],
              title: "Statistical capacity building"
            },
            {
              code: "16063",
              color: SunburstChartColors[10],
              title: "Narcotics control"
            },
            {
              code: "16064",
              color: SunburstChartColors[10],
              title: "Social mitigation of HIV/AIDS"
            },
            {
              code: "16065",
              color: SunburstChartColors[10],
              title: "Recreation and sport"
            },
            {
              code: "16066",
              color: SunburstChartColors[10],
              title: "Culture"
            },
            {
              code: "16070",
              color: SunburstChartColors[10],
              title: "Labour Rights"
            },
            {
              code: "16080",
              color: SunburstChartColors[10],
              title: "Social Dialogue"
            }
          ]
        }
      ]
    }
  ]
};
