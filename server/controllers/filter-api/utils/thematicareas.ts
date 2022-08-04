import axios from "axios";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import orderBy from "lodash/orderBy";
import querystring from "querystring";
import findIndex from "lodash/findIndex";
import { thematicAreaNames } from "../../../static/thematicAreaConsts";
import { AF_TAG_CODE } from "../../../static/apiFilterFields";

export function getThematicAreaOptions(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const url = `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
      {
        q: `${filterString} AND ${AF_TAG_CODE}:Priority*`,
        fl: AF_TAG_CODE,
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
        const actualData = get(callResponse, "data.response.docs", []);
        let items: any = [];
        actualData.forEach((activity: any) => {
          activity[AF_TAG_CODE].forEach((tc: string) => {
            if (tc.indexOf("Priority") > -1) {
              const fItemIndex = findIndex(items, { code: tc });
              if (fItemIndex === -1) {
                items.push({
                  name: get(thematicAreaNames, tc, ""),
                  code: tc
                });
              }
            }
          });
        });
        items = items.map((item: any) => ({
          name: item.name
            .replace(" is the main priority area in this activity", "")
            .replace(" is the secondary priority area in this activity", ""),
          code: item.code.replace(", primary", "").replace(", secondary", "")
        }));
        items = uniqBy(items, "name");
        items = items.map((item: any) => ({
          ...item,
          code: "",
          children: [
            {
              name: `Main priority`,
              code: `${item.code}| primary`
            },
            {
              name: `Secondary priority`,
              code: `${item.code}| secondary`
            }
          ]
        }));
        resolve(orderBy(items, "name", "desc"));
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
