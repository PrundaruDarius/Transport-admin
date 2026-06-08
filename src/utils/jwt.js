export function jwtDecodeSafe(token) {
  try {
    const payload = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));

    const email =
      decodedPayload.email ||
      decodedPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
      decodedPayload.sub ||
      "";

    const roleClaim =
      decodedPayload.role ||
      decodedPayload.roles ||
      decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    const roles = Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];

    return {
      email,
      roles,
      exp: decodedPayload.exp,
      raw: decodedPayload
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const user = jwtDecodeSafe(token);
  if (!user?.exp) return true;
  return Date.now() >= user.exp * 1000;
}
