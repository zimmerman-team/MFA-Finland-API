import axios from "axios";
import get from "lodash/get";
import find from "lodash/find";
import filter from "lodash/filter";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { GOALS } from "../../static/sdgs";
import { genericError } from "../../utils/general";
import { getFormattedFilters } from "../../utils/filters";

export function SDGViz(req: any, res: any) {
  const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
    {
      q: `${getFormattedFilters(
        get(req.body, "filters", {})
      )} AND tag_vocabulary:2 AND (transaction_type:2 OR transaction_type:3)`,
      fl: "tag_code,transaction_type,transaction_value",
      rows: 20000
    },
    "&",
    "=",
    {
      encodeURIComponent: (str: string) => str
    }
  )}`;

  axios
    .get(url)
    .then(callResponse => {
      const activities = get(callResponse, "data.response.docs", []);
      const goals: any = [...GOALS];

      goals.forEach((goal: any, index: number) => {
        const goalActivities = filter(activities, (act: any) =>
          find(act.tag_code, (c: string) => c === goal.code)
        );

        let disbursed = 0;
        let committed = 0;

        goalActivities.forEach((item: any) => {
          if (item.transaction_type && item.transaction_value) {
            const disbTransIndex = findIndex(
              item.transaction_type,
              (tt: string) => tt === "3"
            );
            const comTransIndex = findIndex(
              item.transaction_type,
              (tt: string) => tt === "2"
            );
            if (disbTransIndex > -1) {
              disbursed += get(item, `transaction_value[${disbTransIndex}]`, 0);
            }
            if (comTransIndex > -1) {
              committed += get(item, `transaction_value[${comTransIndex}]`, 0);
            }
          }
        });
        goals[index] = {
          committed,
          disbursed,
          name: goal.name,
          name_fi: getTranslatedSDGS("fi", goal.code),
          name_se: getTranslatedSDGS("se", goal.code),
          icon: `/sdgs/${goal.code}.png`,
          icon_fi: `/sdgs/${goal.code}.png`,
          icon_se: `/sdgs/${goal.code}.png`,
          /* enable this when actual png files are added to the app public/sdgs dir */
          // icon: `/sdgs/en/${goal.code}.png`,
          // icon_fi: `/sdgs/fi/${goal.code}.png`,
          // icon_se: `/sdgs/se/${goal.code}.png`,
          number: parseInt(goal.code, 10),
          disabled: disbursed === 0 || committed === 0
        };
      });

      res.json({
        vizData: goals
      });
    })
    .catch(error => {
      genericError(error, res);
    });
}

export function getTranslatedSDGS(currentLanguage: string, code: number) {
  switch (code) {
    case 1:
      if (currentLanguage === "fi")
        return "Poistaa köyhyys sen kaikissa muodoissa kaikkialta.";
      if (currentLanguage === "se")
        return "Utrota all form av fattigdom överallt.";
      break;
    case 2:
      if (currentLanguage === "fi")
        return "Poistaa nälkä, saavuttaa ruokaturva, parantaa ravitsemusta ja edistää kestävää maataloutta.";
      if (currentLanguage === "se")
        return "Utrota hunger, säkerställa matsäkerhet och förbättrad nutrition och förespråka hållbart jordbruk.";
      break;
    case 3:
      if (currentLanguage === "fi")
        return "Taata terveellinen elämä ja hyvinvointi kaiken ikäisille.";
      if (currentLanguage === "se")
        return "Garantera ett hälsosamt liv och uppmuntra välmående för alla åldrar.";
      break;
    case 4:
      if (currentLanguage === "fi")
        return "Taata kaikille avoin, tasa-arvoinen ja laadukas koulutus sekä elinikäiset oppimismahdollisuudet.";
      if (currentLanguage === "se")
        return "Garantera en inkluderande, rättvis utbildning av god kvalitet och uppmuntra möjligheter till livslångt lärande för alla.";
      break;
    case 5:
      if (currentLanguage === "fi")
        return "Saavuttaa sukupuolten välinen tasa-arvo sekä vahvistaa naisten ja tyttöjen oikeuksia ja mahdollisuuksia.";
      if (currentLanguage === "se")
        return "Uppnå jämställdhet och förstärka alla kvinnors och flickors rättigheter och möjligheter.";
      break;
    case 6:
      if (currentLanguage === "fi")
        return "Varmistaa veden saanti ja kestävä käyttö sekä sanitaatio kaikille.";
      if (currentLanguage === "se")
        return "Garantera tillgång till och ett hållbart användande av vatten och sanitet för alla.";
      break;
    case 7:
      if (currentLanguage === "fi")
        return "Varmistaa edullinen, luotettava, kestävä ja uudenaikainen energia kaikille.";
      if (currentLanguage === "se")
        return "Garantera tillgång till prisvärd, pålitlig, hållbar och modern energi för alla.";
      break;
    case 8:
      if (currentLanguage === "fi")
        return "Edistää kaikkia koskevaa kestävää talouskasvua, täyttä ja tuottavaa työllisyyttä sekä säällisiä työpaikkoja.";
      if (currentLanguage === "se")
        return "Uppmuntra en fortsatt inkluderande och hållbar ekonomisk tillväxt, fullt och produktivt arbete och anständiga jobb.";
      break;
    case 9:
      if (currentLanguage === "fi")
        return "Rakentaa kestävää infrastruktuuria sekä edistää kestävää teollisuutta ja innovaatioita.";
      if (currentLanguage === "se")
        return "Bygga upp en hållbar infrastruktur, förespråka inkluderande och hållbar industrialisering och främja innovation.";
      break;
    case 10:
      if (currentLanguage === "fi")
        return "Vähentää eriarvoisuutta maiden sisällä ja niiden välillä.";
      if (currentLanguage === "se")
        return "Minska ojämlikheter inom och mellan länder.";
      break;
    case 11:
      if (currentLanguage === "fi")
        return "Taata turvalliset ja kestävät kaupungit sekä asuinyhdyskunnat.";
      if (currentLanguage === "se")
        return "Göra städer och mänskliga bosättningar inkluderande, säkra, motståndskraftiga och hållbara.";
      break;
    case 12:
      if (currentLanguage === "fi")
        return "Varmistaa kulutus- ja tuotantotapojen kestävyys.";
      if (currentLanguage === "se")
        return "Garantera hållbara konsumtions- och produktionsmönster.";
      break;
    case 13:
      if (currentLanguage === "fi")
        return "Toimia kiireellisesti ilmastonmuutosta ja sen vaikutuksia vastaan.";
      if (currentLanguage === "se")
        return "Utan dröjsmål agera för att bekämpa klimatförändringen och dess inverkan.";
      break;
    case 14:
      if (currentLanguage === "fi")
        return "Säilyttää meret ja merten tarjoamat luonnonvarat sekä edistää niiden kestävää käyttöä.";
      if (currentLanguage === "se")
        return "Bevara och nyttja haven och marina resurser på hållbart vis.";
      break;
    case 15:
      if (currentLanguage === "fi")
        return "Suojella maaekosysteemejä, palauttaa niitä ennalleen ja edistää niiden kestävää käyttöä; edistää metsien kestävää käyttöä; taistella aavikoitumista vastaan; pysäyttää maaperän köyhtyminen ja luonnon monimuotoisuuden häviäminen.";
      if (currentLanguage === "se")
        return "Skydda, återställa och uppmuntra till hållbar användning av ekosystemen på land, hantera skogen hållbart, bekämpa ökenspridning, stoppa och återställa landdegradering och stoppa förlusten av biologisk mångfald.";
      break;
    case 16:
      if (currentLanguage === "fi")
        return "Edistää rauhanomaisia yhteiskuntia ja taata kaikille pääsy oikeuspalveluiden pariin; rakentaa tehokkaita ja vastuullisia instituutioita kaikilla tasoilla.";
      if (currentLanguage === "se")
        return "Uppmuntra fredliga samhällen, tillgodose tillgång till rättvisa för alla och bygga effektiva, ansvariga och inkluderande institutioner på alla nivåer.";
      break;
    case 17:
      if (currentLanguage === "fi")
        return "Tukea vahvemmin kestävän kehityksen toimeenpanoa ja globaalia kumppanuutta.";
      if (currentLanguage === "se")
        return "Stödja verkställandet av hållbar utveckling i större utsträckning och återuppta det globala partnerskapet för hållbar utveckling.";
      break;
    default:
      return "";
  }
}
