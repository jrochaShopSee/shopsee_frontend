const isAtLeast14YearsOld = (date: Date) => {
  if (!date) return false;
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();
  const dayDifference = today.getDate() - date.getDate();
  return (
    age > 14 ||
    (age === 14 &&
      (monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0)))
  );
};

export const isAtLeast18YearsOld = (date: Date) => {
  if (!date) return false;
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();
  const dayDifference = today.getDate() - date.getDate();
  return (
    age > 18 ||
    (age === 18 &&
      (monthDifference > 0 || (monthDifference === 0 && dayDifference >= 0)))
  );
};

export default isAtLeast14YearsOld;
