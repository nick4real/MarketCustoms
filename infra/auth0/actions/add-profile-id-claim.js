exports.onExecutePostLogin = async (event, api) => {
  const profileId = event.user.app_metadata?.profile_id;
  if (profileId) {
    api.accessToken.setCustomClaim("https://marketcustoms/profile_id", profileId);
  }
};
