export function randomColor() {
  const randomInt = Math.floor(Math.random() * 16777215);

  const color = randomInt.toString(16).padStart(6, "0").toUpperCase();

  //Complementary color
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  const compR = 255 - r;
  const compG = 255 - g;
  const compB = 255 - b;

  const complementColor = (
    compR.toString(16).padStart(2, "0") +
    compG.toString(16).padStart(2, "0") +
    compB.toString(16).padStart(2, "0")
  ).toUpperCase();

  return { color, complementColor };
}
