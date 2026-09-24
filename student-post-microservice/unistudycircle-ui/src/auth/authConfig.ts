import { UserManager, WebStorageStateStore } from "oidc-client-ts";
export const oidcSettings = {
  authority: "http://localhost:8085",
  client_id: "iam-test-ui",
  redirect_uri: "http://localhost:3000/auth/callback",
  post_logout_redirect_uri: "http://localhost:3000/",
  response_type: "code",
  scope: "openid profile",
  automaticSilentRenew: false,
  userStore: new WebStorageStateStore({ store: window.sessionStorage })
};
export const userManager = new UserManager(oidcSettings);