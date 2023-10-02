const jobs = {
  printMessage: (data) => {
    console.log({ ...data, runAt: new Date().toISOString() });
    console.log("*".repeat(20));
  },
  // ... You can add more job functions here
};

module.exports = jobs;
