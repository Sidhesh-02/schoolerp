let sessionData = null;

const setSession = (data) => {
    sessionData = data;
};

const getSession = () => sessionData;

module.exports = { setSession, getSession };
