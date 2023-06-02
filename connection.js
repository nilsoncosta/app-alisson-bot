import Sequelize from 'sequelize'

const connection = new Sequelize({
    dialect: 'sqlite',
    storage: './dbjg.sqlite'
  })
 
module.exports = connection;
