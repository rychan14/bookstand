function getVar(varName){
  if (process.env.hasOwnProperty(varName))
    return process.env[varName];
  throw new Error(varName + " environment variable is not defined");
}

module.exports = {
  getVar: getVar
};
