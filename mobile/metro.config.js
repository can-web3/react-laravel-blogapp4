/* eslint-env node */
// @ts-check

const path = require("path");

/** @type {() => Promise<import('expo/metro-config').MetroConfig>} */
module.exports = async function getConfig() {
  const { getDefaultConfig } = require("expo/metro-config");
  const { withNativeWind } = require("nativewind/metro");
  
  const projectRoot = path.resolve(__dirname);
  const config = getDefaultConfig(projectRoot, { isCSSEnabled: true });
  
  return withNativeWind(config, { input: "./global.css" });
};
