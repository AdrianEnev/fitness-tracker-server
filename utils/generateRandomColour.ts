export const generateRandomColour = () => {
    const colours = ['[#fd3e54]', '[#3f8aff]', '[#15c48a]', '[#ffca2c]', '[#f053a3]', '[#9263fa]', '[#07c0da]'];
    const randomIndex = Math.floor(Math.random() * colours.length);
    return colours[randomIndex];
};