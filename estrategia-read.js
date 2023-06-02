import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
//import Estrategia from './estrategia.js'

const db_name = "C:\\Temp\\FutballAnalysisApp\\data\\apptest.db";
console.log(db_name);
const db = await open({
    filename: db_name,
    driver: sqlite3.Database
})
// const db = new sqlite.Database(db_name, err => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log("Conexão com banco realizada");
// });

async function getEstrategias(){
    const sql = "SELECT * FROM estrategia ORDER BY descricao";
    await db.all(sql, [], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      return rows;
    });
};
export default getEstrategias; 
  