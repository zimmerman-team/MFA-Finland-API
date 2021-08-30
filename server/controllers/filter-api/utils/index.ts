// @ts-nocheck
import get from "lodash/get";
import find from "lodash/find";
import some from "lodash/some";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import { countries } from "../../../static/countries";
import { orgMapping } from "../../../static/orgMapping";
import { orgDacChannel } from "../../../static/orgDacChannel";
import { locationsMapping } from "../../../static/locationsMapping";

interface OptionModel {
  name: string;
  code: string;
}

interface SectorOptionsModel {
  dac3: OptionModel[];
  dac5: OptionModel[];
}

export function formatCountryOptions(rawData: any) {
  let result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    const fCountry = find(countries, { code: item.val });
    if (fCountry) {
      result.push({
        name: fCountry.name,
        code: fCountry.code
      });
    }
  });

  return orderBy(result, "name", "asc");
}

export function formatRegionOptions(rawData: any) {
  const result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    result.push({
      name: get(item, "sub.buckets[0].val", item.val.toUpperCase()),
      code: item.val
    });
  });

  return orderBy(result, "name", "asc");
}

export function formatLocationOptions(rawData: any) {
  const result: any = [];

  Object.keys(locationsMapping).forEach((region: string) => {
    const regionCountries = filter(rawData, (d: any) =>
      find(locationsMapping[region], (m: string) => m === d.code)
    );
    result.push({
      name: region,
      code: "",
      children: regionCountries
    });
  });

  return result;
}

export function formatSectorOptions(rawData: any) {
  return rawData.map((item: any) => ({
    name: item.title,
    code: item.code,
    children: get(item, "children", []).map((child: any) => ({
      name: child.title,
      code: child.code,
      children: get(child, "children", []).map((gchild: any) => ({
        name: gchild.title,
        code: gchild.code
      }))
    }))
  }));
}

export function formatOrganisationsOptions(rawData: any, codelistData?: any) {
  const result: any[] = [];

  const codelist = codelistData ?? orgDacChannel;

  const categories = filter(codelist, (item: any) => !item.category);

  categories.forEach((category: any) => {
    const children = filter(
      codelist,
      (item: any) =>
        item.category === category.code || item.code === category.code
    );
    result.push({
      name: category.name,
      code: category.code.toString(),
      children: filter(rawData, (item: any) =>
        find(children, { code: item.val.split("-")[0] })
      ).map((item: any) => {
        let name = "";
        const names = get(item, "names.buckets", []);
        if (names.length > 0) {
          if (names[0].val !== "Ministry for Foreign Affairs of Finland") {
            name = names[0].val;
          } else if (names.length > 1) {
            name = names[1].val;
          }
        }
        return {
          name,
          code: item.val
        };
      })
    });
  });

  return filter(result, (item: any) => item.children.length > 0);
}

export function formatOrganisationsOptions2(rawData: any) {
  const result: any[] = [];
  const codelist = orgMapping;

  const lvl4Orgs = filter(
    codelist,
    (item: any) =>
      item.info.level === 4 &&
      some(
        rawData,
        (dataItem: any) =>
          parseInt(dataItem.val.split("-")[0], 10) === item.code
      )
  );
  const lvl1Orgs = filter(
    codelist,
    (item: any) =>
      item.info.level === 1 &&
      some(lvl4Orgs, (lvl4Item: any) => lvl4Item.info.lvl_1 === item.code)
  );
  const lvl0Orgs = filter(
    codelist,
    (item: any) =>
      item.info.level === 0 &&
      some(lvl1Orgs, (lvl1Item: any) => lvl1Item.info.lvl_0 === item.code)
  );

  lvl0Orgs.forEach((lvl0Item: any) => {
    const lvl0Org = {
      name: lvl0Item.info.name,
      code: lvl0Item.code.toString(),
      children: []
    };

    const lvl1OrgsResult: any[] = [];

    filter(
      lvl1Orgs,
      (lvl1Item: any) => lvl1Item.info.lvl_0 === lvl0Item.code
    ).forEach((lvl1Item: any) => {
      const codelistOrgs = filter(
        lvl4Orgs,
        (lvl4Item: any) => lvl4Item.info.lvl_1 === lvl1Item.code
      ).map((lvl4Item: any) => ({
        name: lvl4Item.info.name,
        code: lvl4Item.code.toString(),
        children: filter(
          rawData,
          (dataItem: any) =>
            parseInt(dataItem.val.split("-")[0], 10) === lvl4Item.code
        ).map((dataItem: any) => {
          let name = "";
          const names = get(dataItem, "names.buckets", []);
          if (names.length > 0) {
            if (names[0].val !== "Ministry for Foreign Affairs of Finland") {
              name = names[0].val;
            } else if (names.length > 1) {
              name = names[1].val;
            }
          }

          return {
            name,
            code: dataItem.val
          };
        })
      }));
      const nonCodelistOrgs = filter(
        rawData,
        (dataItem: any) =>
          parseInt(dataItem.val.split("-")[0], 10) === lvl1Item.code
      ).map((dataItem: any) => {
        let name = "";
        const names = get(dataItem, "names.buckets", []);
        if (names.length > 0) {
          if (names[0].val !== "Ministry for Foreign Affairs of Finland") {
            name = names[0].val;
          } else if (names.length > 1) {
            name = names[1].val;
          }
        }

        return {
          name,
          code: dataItem.val
        };
      });
      lvl1OrgsResult.push({
        name: lvl1Item.info.name,
        code: lvl1Item.code.toString(),
        children: [...codelistOrgs, ...nonCodelistOrgs]
      });
    });

    lvl0Org.children = lvl1OrgsResult as never[];

    result.push(lvl0Org);
  });

  return filter(result, (item: any) => item.children.length > 0);
}

export function formatPublishersOptions(rawData: any) {
  const result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    result.push({
      name: get(item, "sub.buckets[0].val", item.val.toUpperCase()),
      code: item.val.toUpperCase()
    });
  });

  return orderBy(result, "name", "asc");
}

export function formatActivituStatusOptions(rawData: any, codelistData: any) {
  const result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    const fOption = find(codelistData, (org: any) => org.code === item.val);
    if (fOption) {
      result.push({
        name: fOption.name,
        code: fOption.code
      });
    }
  });

  return orderBy(
    result,
    function(o) {
      return new Number(o.code);
    },
    ["asc"]
  );
}

export function formatOrgOptions(rawData: any, codelistData: any) {
  const result: OptionModel[] = [];

  rawData.forEach((item: any) => {
    const fOption = find(
      codelistData,
      (org: any) => org.code.toLowerCase() === item.val.toLowerCase()
    );
    if (fOption) {
      result.push({
        name: fOption.name,
        code: fOption.code
      });
    } else if (
      item.val.length > 1 &&
      item.val[0] !== "(" &&
      item.val[0] !== "&"
    ) {
      result.push({
        name: item.val,
        code: item.val
      });
    }
  });

  return orderBy(result, "name", "asc");
}
