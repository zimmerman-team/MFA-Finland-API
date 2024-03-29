import axios from "axios";
import get from "lodash/get";
import querystring from "querystring";
import { formatActivituStatusOptions } from ".";
import { AF_HUMANITARIAN_SCOPE_VOCABULARY } from "../../../static/apiFilterFields";
import { humanitarianScopeVocabularyCodelist } from "./codelists";

export function getHumanitarianScopeVocabs(filterString = "*:*") {
  return new Promise((resolve, reject) => {
    const values = {
      q: filterString,
      "json.facet": JSON.stringify({
        items: {
          type: "terms",
          field: AF_HUMANITARIAN_SCOPE_VOCABULARY,
          limit: -1
        }
      }),
      rows: 0
    };
    const codelistData = humanitarianScopeVocabularyCodelist;
    axios
      .get(
        `${process.env.DS_SOLR_API}/activity/?${querystring.stringify(
          values,
          "&",
          "=",
          {
            encodeURIComponent: (str: string) => str
          }
        )}`
      )
      .then(callResponse => {
        const actualData = get(callResponse, "data.facets.items.buckets", []);
        resolve(formatActivituStatusOptions(actualData, codelistData));
      })
      .catch(error => {
        const _error = error.response ? error.response.data : error;
        console.error(_error);
        resolve([]);
      });
  });
}
