import Sequelize from 'sequelize'
import connection from './conection';

const Estrategia = database.define('estrategia', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    tempoJogoInicial: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    tempoJogoFinal: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    oddCasaInicial: {
        type: Sequelize.INTEGER
    },
    oddCasaFinal: {
        type: Sequelize.INTEGER
    },
    oddDesafianteInicial: {
        type: Sequelize.INTEGER
    },
    oddDesafianteFinal: {
        type: Sequelize.INTEGER
    },
    ataquesCasaInicial: {
        type: Sequelize.INTEGER
    },
    ataquesCasaFinal: {
        type: Sequelize.INTEGER
    },
    ataquesDesafianteInicial: {
        type: Sequelize.INTEGER
    },
    ataquesDesafianteFinal: {
        type: Sequelize.INTEGER
    },
    somaCasaInicial: {
        type: Sequelize.INTEGER
    },
    somaCasaFinal: {
        type: Sequelize.INTEGER
    },
    somaDesafianteInicial: {
        type: Sequelize.INTEGER
    },
    somaDesafianteFinal: {
        type: Sequelize.INTEGER
    },
    placarDesafianteFavoravel: {
        type: Sequelize.INTEGER
    },
    placarEmpatado: {
        type: Sequelize.INTEGER
    },
    ativo: {
        type: Sequelize.INTEGER
    },
})

module.exports = Estrategia;
