const mysql = require('promise-mysql')

const createPool = ({ connectionLimit, host, user, password, database }) => {
  const pool = mysql.createPool({ connectionLimit, host, user, password, database })
  return {
    getConnection: () => pool.getConnection(),
    close: () => pool.end()
  }
}

module.exports = {
  createPool
}
