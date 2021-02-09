// @ts-nocheck
import get from "lodash/get";
import find from "lodash/find";
import minBy from "lodash/minBy";
import maxBy from "lodash/maxBy";
import sumBy from "lodash/sumBy";
import filter from "lodash/filter";
import orderBy from "lodash/orderBy";
import inRange from "lodash/inRange";
import { locationsMapping } from "../static/locationsMapping";

export const TreemapVizColors = [
  "#E5F0F0",
  "#DCECEC",
  "#D0E5E5",
  "#C1DDDD",
  "#ACD1D1",
  "#8DB7B5"
];

export function getColorsBasedOnValues(data: any) {
  const maxValue = get(maxBy(data, "value"), "value", 0) + 1;
  const minValue = get(minBy(data, "value"), "value", 0);
  const rangeValue = (maxValue - minValue) / 3;
  const hiGroup = [2 * rangeValue, maxValue];
  const midGroup = [rangeValue, 2 * rangeValue];
  const result = orderBy(data, "value", "desc").map(d => {
    let color = "";
    if (inRange(d.value, hiGroup[0], hiGroup[1])) {
      color = TreemapVizColors[1];
    } else if (inRange(d.value, midGroup[0], midGroup[1])) {
      color = TreemapVizColors[3];
    } else {
      color = TreemapVizColors[5];
    }
    const childrenMaxValue = get(maxBy(d.orgs, "value"), "value", 0) + 1;
    const childrenMinValue = get(minBy(d.orgs, "value"), "value", 0);
    const childrenRangeValue = (childrenMaxValue - childrenMinValue) / 3;
    const childrenHiGroup = [2 * childrenRangeValue, childrenMaxValue];
    const childrenMidGroup = [childrenRangeValue, 2 * childrenRangeValue];
    return {
      ...d,
      color,
      orgs: orderBy(d.orgs, "value", "desc").map((child: any) => {
        let childColor = "";
        if (inRange(child.value, childrenHiGroup[0], childrenHiGroup[1])) {
          childColor = TreemapVizColors[1];
        } else if (
          inRange(child.value, childrenMidGroup[0], childrenMidGroup[1])
        ) {
          childColor = TreemapVizColors[3];
        } else {
          childColor = TreemapVizColors[5];
        }
        return {
          ...child,
          color: childColor
        };
      })
    };
  });
  return result;
}

export function calculateRegions(data: any) {
  const result: any = [];

  Object.keys(locationsMapping).forEach((region: string) => {
    const regionCountries = filter(data, (d: any) =>
      find(locationsMapping[region], (m: string) => m === d.ref)
    );
    const value = sumBy(regionCountries, "value");
    const committed = sumBy(regionCountries, "committed");
    if (value > 0) {
      result.push({
        name: region,
        value,
        committed,
        percentage: (value / committed) * 100,
        ref: region,
        orgs: getColorsBasedOnValues(regionCountries)
      });
    }
  });

  return getColorsBasedOnValues(result);
}
