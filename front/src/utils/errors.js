export const getErrorMessage = (err) => {
  if (!err.response) return "Server not responding";
  const data = err.response.data;
  if (data.detail) return data.detail;
  return Object.values(data).flat().join(" ");
};