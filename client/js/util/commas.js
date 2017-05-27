export default function commas(x) {

  if (isNaN(x)) return 0;

  const n = Math.round(x * 100) / 100;

  const digits = n % 1 === 0 ? 0 : 2;

  const parts = n.toFixed(digits).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");

}
