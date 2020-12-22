import get from "lodash/get";
import minBy from "lodash/minBy";
import maxBy from "lodash/maxBy";
import orderBy from "lodash/orderBy";
import inRange from "lodash/inRange";

export const TreemapVizColors = [
  "#239281",
  "#2AB2A0",
  "#42D1C1",
  "#9CF7EE",
  "#CFFFFF",
  "#F0FFFF"
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
      color = TreemapVizColors[0];
    } else if (inRange(d.value, midGroup[0], midGroup[1])) {
      color = TreemapVizColors[1];
    } else {
      color = TreemapVizColors[2];
    }
    const childrenMaxValue = get(maxBy(d.orgs, "size"), "size", 0) + 1;
    const childrenMinValue = get(minBy(d.orgs, "size"), "size", 0);
    const childrenRangeValue = (childrenMaxValue - childrenMinValue) / 3;
    const childrenHiGroup = [2 * childrenRangeValue, childrenMaxValue];
    const childrenMidGroup = [childrenRangeValue, 2 * childrenRangeValue];
    return {
      ...d,
      color,
      orgs: d.orgs.map((child: any) => {
        let childColor = "";
        if (inRange(child.size, childrenHiGroup[0], childrenHiGroup[1])) {
          childColor = TreemapVizColors[0];
        } else if (
          inRange(child.size, childrenMidGroup[0], childrenMidGroup[1])
        ) {
          childColor = TreemapVizColors[1];
        } else {
          childColor = TreemapVizColors[2];
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
