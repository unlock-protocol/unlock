export const buildLocks = (rawLocks) => {
  const locks = rawLocks.map((raw)=>{
    let split = raw.split(',');
    return {
      address: split[0],
      name: new Buffer(split[1], 'base64').toString(),
      encoded: split[1]
    };
  });
  console.log(locks)
  return locks;
};