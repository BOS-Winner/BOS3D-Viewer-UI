import axios from "UIutils/axios";

export function getFamilyInfo(baseUrl, projectKey, familyKey, auth, shareKey) {
  return axios({
    headers: {
      Authorization: auth
    }
  })
    .get(
      `${baseUrl}/api/${projectKey}/components?componentKey=${familyKey}${shareKey ? `&share=${shareKey}` : ""}`
    );
}
