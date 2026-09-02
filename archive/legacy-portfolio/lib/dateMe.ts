export const findAndStyleTime = (text: string): string => {
  // Match patterns like "X hours" where X is any number
  const timeRegex = /(\d+)\s+hours?/g;

  // Replace each match with a span that has hover styling
  return text.replace(timeRegex, (match) => {
    return `<span class="time-hover" title="${match}">${match}</span>`;
  });
};

// CSS should be added separately:
// .time-hover {
//   cursor: pointer;
//   text-decoration: underline;
// }
// .time-hover:hover {
//   color: #007bff;
// }
