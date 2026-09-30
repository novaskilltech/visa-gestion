const fs = require('fs');

const origReadlink = fs.readlink;
const origReadlinkSync = fs.readlinkSync;
const origPromisesReadlink = fs.promises ? fs.promises.readlink : null;

function fixErr(err) {
  if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
    const newErr = new Error(`EINVAL: invalid argument, readlink '${err.path}'`);
    newErr.code = 'EINVAL';
    newErr.errno = -4071;
    newErr.syscall = 'readlink';
    newErr.path = err.path;
    return newErr;
  }
  return err;
}

fs.readlinkSync = function(...args) {
  try {
    return origReadlinkSync.apply(this, args);
  } catch (err) {
    throw fixErr(err);
  }
};

fs.readlink = function(...args) {
  const lastIdx = args.length - 1;
  const cb = args[lastIdx];
  if (typeof cb === 'function') {
    args[lastIdx] = function(err, result) {
      return cb(fixErr(err), result);
    };
    return origReadlink.apply(this, args);
  }
  return origReadlink.apply(this, args);
};

if (origPromisesReadlink) {
  fs.promises.readlink = async function(...args) {
    try {
      return await origPromisesReadlink.apply(this, args);
    } catch (err) {
      throw fixErr(err);
    }
  };
}
