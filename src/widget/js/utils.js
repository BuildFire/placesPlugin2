export const resizeImage = (imageUrl, options) => {
  console.log(options ,'options');
  return buildfire.imageLib.resizeImage(
    imageUrl, options)
}