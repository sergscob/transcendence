export const getErrorMessage = (err) => {
  if (!err.response) return { common: "Server not responding" };
  const data = err.response.data;
  if (data.detail) 
    return { common: data.detail };

  if (typeof data === "object" && !Array.isArray(data)) {
    const errors = {};
    for (const key in data) {
      errors[key] = Array.isArray(data[key]) ? data[key].join(" ") : data[key];
    }
    return errors;
  }
  
  return { common: JSON.stringify(data) };
};