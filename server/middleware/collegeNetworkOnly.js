//This program restricts access to college network IPs while allowing localhost during development.

module.exports = function collegeNetworkOnly(req, res, next) {
  //In development, allow all local requests for smoother DX.
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  //Get client IP from x-forwarded-for header or fallback to socket remoteAddress.
  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.connection?.remoteAddress || '').toString();
  console.log('Client IP: ', clientIp);

  //Allow common local addresses and college proxy IPs.
  const allowedFragments = [
    '::1',                 // IPv6 localhost
    '127.0.0.1',           // IPv4 localhost
    '::ffff:127.0.0.1',    // IPv4-mapped IPv6 localhost
    '172.31.2.3',          // College proxy IPs
    '172.31.2.4'
  ];

  const isAllowed =
    allowedFragments.some(frag => clientIp.includes(frag)) ||
    req.hostname === 'localhost';

  if (isAllowed) {
    return next();
  }

  return res.status(403).json({ message: 'Access allowed only from College WiFi or localhost during development.' });
};
