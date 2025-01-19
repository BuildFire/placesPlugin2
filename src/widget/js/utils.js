export const resizeImage = (imageUrl, size, aspect = '1:1') => buildfire.imageLib.resizeImage(
    imageUrl, { size, aspect }
  );