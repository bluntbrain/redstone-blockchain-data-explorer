exports.bufferToReadable = (row) => {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      return [key, value instanceof Buffer ? value.toString("hex") : value];
    })
  );
};
