export function genericError(error: any, res: any) {
  const _error = error.response ? error.response.data : error;
  console.log(_error);
  return res.json(_error);
}
