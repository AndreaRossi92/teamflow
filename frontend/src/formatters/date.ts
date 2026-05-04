export const formatDateTime = (
  dateString: string,
  locale: Intl.LocalesArgument,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString(locale, options);
};
