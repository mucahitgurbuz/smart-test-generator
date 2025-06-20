/**
 * Simple color utility to replace chalk without ESM/CJS issues
 */

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  // Foreground colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

export const chalk = {
  red: (text: string) => `${colors.red}${text}${colors.reset}`,
  green: (text: string) => `${colors.green}${text}${colors.reset}`,
  blue: (text: string) => `${colors.blue}${text}${colors.reset}`,
  yellow: (text: string) => `${colors.yellow}${text}${colors.reset}`,
  cyan: (text: string) => `${colors.cyan}${text}${colors.reset}`,
  magenta: (text: string) => `${colors.magenta}${text}${colors.reset}`,
  white: (text: string) => `${colors.white}${text}${colors.reset}`,
  bold: (text: string) => `${colors.bright}${text}${colors.reset}`,
  dim: (text: string) => `${colors.dim}${text}${colors.reset}`,
  gray: (text: string) => `${colors.dim}${text}${colors.reset}`,
  grey: (text: string) => `${colors.dim}${text}${colors.reset}`,

  // Chained methods
  greenBold: (text: string) =>
    `${colors.bright}${colors.green}${text}${colors.reset}`,
  redBold: (text: string) =>
    `${colors.bright}${colors.red}${text}${colors.reset}`,
  blueBold: (text: string) =>
    `${colors.bright}${colors.blue}${text}${colors.reset}`,
  yellowBold: (text: string) =>
    `${colors.bright}${colors.yellow}${text}${colors.reset}`,
};

// Simple API to mimic chalk
export default {
  red: chalk.red,
  green: chalk.green,
  blue: chalk.blue,
  yellow: chalk.yellow,
  cyan: chalk.cyan,
  magenta: chalk.magenta,
  white: chalk.white,
  bold: chalk.bold,
  dim: chalk.dim,
  gray: chalk.gray,
  grey: chalk.grey,
};
