import fs from "fs";

export const getSecret = (envVar) => {
  const fileVar = `${envVar}_FILE`;
  if (process.env[fileVar] && fs.existsSync(process.env[fileVar])) {
    try {
      return fs.readFileSync(process.env[fileVar], "utf8").trim();
    } catch (err) {
      console.error(`Failed to read secret file at ${process.env[fileVar]}:`, err.message);
    }
  }
  return process.env[envVar];
};
