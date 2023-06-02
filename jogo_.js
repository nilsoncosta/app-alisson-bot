import Sequelize from 'sequelize'
import connection from './conection');

const Jogo = database.define('jogo', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    timeCasa: {
        type: Sequelize.STRING,
        allowNull: false
    },
    timeDesafiante: {
        type: Sequelize.STRING,
        allowNull: false
    },
    placarCasa: {
        type: Sequelize.INTEGER
    },
    placarDesafiante: {
        type: Sequelize.INTEGER
    },
    oddsCasa: {
        type: Sequelize.DOUBLE
    },
    oddsDesafiante: {
        type: Sequelize.DOUBLE
    },
    oddsEmpate: {
        type: Sequelize.DOUBLE
    },
    valorItem2: {
        type: Sequelize.INTEGER
    },
    valorItem1: {
        type: Sequelize.INTEGER
    },
    valorItem3: {
        type: Sequelize.INTEGER
    },
    valorItem4: {
        type: Sequelize.INTEGER
    }
})

module.exports = Produto;
