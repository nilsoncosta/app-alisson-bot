import { firefox, chromium } from 'playwright';
import schedule from 'node-schedule';
import Jogo from './jogo.js';
import JogoEnviado from './jogo-enviado.js';
//import sqlite3 from 'sqlite3';
//import { open } from 'sqlite';
import Database from 'better-sqlite3';
//require('dotenv-safe').config();
import Telegraf from 'telegraf';
import * as TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = '6031378414:AAHiZbVZunvgTf2iRmrFxew8gXowP_O3WXE'
const CHAT_ID = 5455887077

const messageSender = new TelegramBot.default(BOT_TOKEN, { polling: true });

const smiley = "\u{1F604}";
const clock = "\u{23F0}";
const ball = "\u{26BD}";
const divider = "\u{2796}";
const diamond = "\u{1F538}";

const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'America/Sao_Paulo',
});

(async () => {
    const driver = await firefox.launch({
    })

    const page = await driver.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36 Edg/104.0.1293.63',
        extraHTTPHeaders: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'Connection': 'keep-alive',
            'Cookie': 'rmbs=3; aps03=cf=N&cg=1&cst=0&ct=28&hd=N&lng=33&oty=2&tzi=16; cc=1; qBvrxRyB=A45IeaqEAQAAWy947jhK5mBXhZKpg0wmrWpF8YvPIs8kAW3F66ISs9f9JVHIAbtW4TWucm46wH8AAEB3AAAAAA|1|1|95c2dbb2f3558a5131fcb4a3ed6ce2c4fa54a062; _ga=GA1.1.734257009.1669307460; _ga_45M1DQFW2B=GS1.1.1669307459.1.1.1669309006.0.0.0; __cf_bm=.1bioOUncIlhLl66vFpebwEu64aQgKMpmaHf4CurRZc-1673977339-0-AeuOKVMdXQmfrz6vbkvSBxvqGq1Y/U+XQPRpDpMcBbhyYIM5vIcWgPiYlDsMT2yL3zCRMpCQQuJFfcUloPxbuRU=; pstk=689A9290987C448FB07976BB33B1B4DF000003; swt=AbtPT2kmQ9ifaI6zOZfiKAovxtDVn+ZH4oIEsrB7xXPDdRLIEdT9jdKP0EdzUs4Vna7rxfCNaqjLULJ3Q8YFrcFtrBlulVQA3lWAH3REt51Mck3v'
        }
    })
    await page.goto('https://www.bet365.com/#/H0')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    await page.getByText('Ao-Vivo', { exact: true }).first().click()

    await page.waitForTimeout(5000)
    await page.locator('.iip-IntroductoryPopup_Cross').click()

    const db_name = "C:\\Temp\\FutballAnalysisApp\\data\\apptest.db"

    let estrategias = null

    const db = new Database(db_name, { verbose: console.log });

    // const db = new sqlite3.Database(db_name, err => {
    //     if (err) {
    //       return console.error(err.message);
    //     }
    //     console.log("Conexão com banco realizada");
    // });

    // db.query = function (sql, params, callback) {
    //     if (!Array.isArray(params)) throw new Error("params is not an array!");
    //     sql = sql.replace(/SERIAL PRIMARY KEY/, "INTEGER PRIMARY KEY AUTOINCREMENT");
    //     this.all(sql, params, function (err, rows) {
    //       callback(err, { rows: rows });
    //     });
    //   };

    // const ordersDb = await open({
    //     filename: db_name,
    //     driver: sqlite3.Database
    // });

    let jogos = []
    let jogosEnviados = new Array()
    let jogosDia = new Array()

    async function getData() {
        try {
            jogos.length = 0
            estrategias = await getEstrategias();
            //console.log("estrategias")
            //console.log(estrategias)
            if (!CheckHorario()) {
                return
            }

            let listTempoJogo = await page.locator('div.ovm-FixtureDetailsTwoWay_PeriodWrapper > div').allTextContents()
            let listTempoJogo2 = await page.locator('div.ovm-FixtureDetailsTwoWay_PeriodWrapper > div').allInnerTexts()
            // for(let numElementos = 0; numElementos < listTempoJogo.length - 1; numElementos++){
            //     console.log(listTempoJogo[numElementos] + " - " + listTempoJogo2[numElementos] )
            // }

            let listTimeCasa = await page.locator('.ovm-FixtureDetailsTwoWay_TeamsWrapper > div:nth-child(1)').allTextContents()
            let listTimeDesafiante = await page.locator('.ovm-FixtureDetailsTwoWay_TeamsWrapper > div:nth-child(2)').allTextContents()

            for (let countJogos = 0; countJogos <= listTimeCasa.length - 1; countJogos++) {

                let divMain = await page.locator('[class="ovm-Fixture ovm-Fixture-horizontal ovm-Fixture-media "]', { timeout: 500 })
                    .filter({ hasText: listTimeCasa[countJogos], exact: true }, { timeout: 500 })
                    .filter({ hasText: listTimeDesafiante[countJogos], exact: true }, { timeout: 500 })
                if (!divMain) {
                    //console.log("Pulando :" + listTimeCasa[countJogos])
                    continue
                }
                if (listTimeCasa[countJogos].indexOf(") Esports") >= 0) {
                    //console.log("E-sports: " + listTimeCasa[countJogos])
                    continue
                }

                let jogo1 = new Jogo(listTempoJogo[countJogos], listTimeCasa[countJogos], listTimeDesafiante[countJogos], "", "", "", "", "", "", "", "", "", "", "", "", "")
                let tempoJogoAtual = listTempoJogo[countJogos]

                let ltstempoJogo2 = await divMain.locator('div.ovm-FixtureDetailsTwoWay_PeriodWrapper > div').allTextContents()
                let tempoJogo2 = ""
                if (ltstempoJogo2.length === 1) {
                    let tempoJogo2 = ltstempoJogo2[0]
                } else {
                    let tempoJogo2 = ltstempoJogo2[1]
                }

                if (tempoJogoAtual === null || tempoJogoAtual === '' || tempoJogoAtual === undefined) {
                    tempoJogoAtual = tempoJogo2
                }
                if (tempoJogoAtual === null || tempoJogoAtual === '' || tempoJogoAtual === undefined || tempoJogoAtual.indexOf("TE") >= 0) {
                    console.log("Pulou:   " + listTimeCasa[countJogos] + " - " + tempoJogo2)
                    continue
                } else {
                    console.log("Achou:   " + listTimeCasa[countJogos] + " - " + tempoJogoAtual)
                    let tempo = listTempoJogo[countJogos].split(":")
                    let intTempo = parseInt(tempo[0])
                    let atendeCriterio = false
                    for (let count = 0; count < estrategias.length; count++) {
                        let tempoInicial = 0
                        let tempoFinal = 0
                        //console.log(intTempo + " - " + estrategias[count].TempoJogoInicial + " - " + estrategias[count].TempoJogoFinal)
                        if (estrategias[count].TempoJogoInicial !== null && estrategias[count].TempoJogoInicial !== '' && estrategias[count].TempoJogoInicial !== undefined) {
                            tempoInicial = parseInt(estrategias[count].TempoJogoInicial)
                        }
                        if (estrategias[count].TempoJogoFinal !== null && estrategias[count].TempoJogoFinal !== '' && estrategias[count].TempoJogoFinal !== undefined) {
                            tempoFinal = parseInt(estrategias[count].TempoJogoFinal)
                        }
                        //console.log("tempo jogo" + intTempo + ", inicial: " + tempoInicial + ", final: " + tempoFinal)
                        if ((tempoInicial === 0 && tempoFinal === 0) || (intTempo >= tempoInicial && intTempo <= tempoFinal)) {
                            atendeCriterio = true
                            //break
                        }
                    }
                    if (!atendeCriterio) {
                        //console.log("Não atende critério tempo")
                        continue
                    }
                }
                //console.log(divMain.innerHTML)
                let valueTimeCasa = listTimeCasa[countJogos]
                let valueTempoJogo = listTempoJogo[countJogos]
                let valueTimeDesafiante = listTimeDesafiante[countJogos]
                let valuePlacarCasa = await divMain.locator('div.ovm-StandardScoresSoccer_TeamOne').textContent()
                let valuePlacarDesafiante = await divMain.locator('div.ovm-StandardScoresSoccer_TeamTwo').textContent()

                let valueOdds1 = await divMain.locator('div.ovm-MarketGroup > div > div > div:nth-child(1)').textContent()
                let valueOdds2 = await divMain.locator('div.ovm-MarketGroup > div > div > div:nth-child(2)').textContent()
                let valueOdds3 = await divMain.locator('div.ovm-MarketGroup > div > div > div:nth-child(3)').textContent()

                //let listDivButtons = await divMain.locator('div.ovm-MediaIconContainer_Buttons > div')
                let valueChutesGolCasa = ""
                let valueChutesGolDesafiante = ""
                let valueChutesForaCasa = ""
                let valueChutesForaDesafiante = ""
                let valueAtaquesPerigososCasa = ""
                let valueAtaquesPerigososDesafiante = ""
                let valueEscanteiosCasa = ""
                let valueEscanteiosDesafiante = ""

                await divMain.locator('div.ovm-MediaIconContainer_Buttons').click();
                //listDivButtons[countJogos].click()
                await page.waitForTimeout(1000)
                let listChutes = await page.locator('div.ml1-ProgressBarAdvancedDual_SideLabel').allTextContents()

                let qtdPerigososCasa = await page.locator('div.ml1-WheelChartAdvanced_Team1Text').allTextContents()
                let qtdPerigososDesafiante = await page.locator('div.ml1-WheelChartAdvanced_Team2Text').allTextContents()

                let lstEscanteiosCasa = await page.locator('div.ml1-StatsColumnAdvanced_MiniValue').allTextContents()
                //console.log(qtdPerigososCasa)
                //console.log(qtdPerigososDesafiante)

                valueEscanteiosCasa = lstEscanteiosCasa[0]
                valueEscanteiosDesafiante = lstEscanteiosCasa[3]


                if (listChutes.length == 4) {
                    valueChutesGolCasa = listChutes[0]
                    valueChutesGolDesafiante = listChutes[1]
                    valueChutesForaCasa = listChutes[2]
                    valueChutesForaDesafiante = listChutes[3]
                }
                if (qtdPerigososCasa.length == 3) {
                    valueAtaquesPerigososCasa = qtdPerigososCasa[2]
                } else if (qtdPerigososCasa.length == 2) {
                    valueAtaquesPerigososCasa = qtdPerigososCasa[1]
                }
                if (qtdPerigososDesafiante.length == 3) {
                    valueAtaquesPerigososDesafiante = qtdPerigososDesafiante[2]
                } else if (qtdPerigososDesafiante.length == 2) {
                    valueAtaquesPerigososDesafiante = qtdPerigososDesafiante[1]
                }

                let jogo = new Jogo(valueTempoJogo, valueTimeCasa, valueTimeDesafiante, valuePlacarCasa,
                    valuePlacarDesafiante, valueOdds1, valueOdds2, valueOdds3,
                    valueChutesForaCasa, valueChutesForaDesafiante, valueChutesGolCasa, valueChutesGolDesafiante,
                    valueAtaquesPerigososCasa, valueAtaquesPerigososDesafiante, valueEscanteiosCasa, valueEscanteiosDesafiante, "", "")
                if (atendeEstrategia(estrategias, jogo)) {
                    jogos.push(jogo)
                    jogosEnviados.push(new JogoEnviado(jogo.tempoJogo, jogo.TimeCasa, jogo.TimeDesafiante, dataFormatada.format(new Date()), jogo.Estrategias))
                    jogosDia.push(jogo)
                } else {
                    console.log("Não atende critério geral")
                }
            }
            let sendstring = ""
            let header = ""
            let numProcess = 0
            if (jogos.length > 0) {
                await GetLinks()
                //console.log(jogos)
                const dtAtual = new Date();
                header = diamond + diamond + diamond + diamond + diamond + diamond + diamond + diamond + diamond + diamond + "\n" +
                    "Resultados " + clock + " " + dataFormatada.format(dtAtual) + "\n"

                //messageSender.sendMessage(CHAT_ID, diamond + diamond + diamond + diamond + diamond + diamond + diamond + diamond + diamond + diamond);
                //await page.waitForTimeout(100)
                //messageSender.sendMessage(CHAT_ID, "Resultados " +  clock + " " + dataFormatada.format(dtAtual));
                //await page.waitForTimeout(100)
            }
            let sendHeader = false
            for (let count = 0; count < jogos.length; count++) {
                sendstring +=  ball + " " + jogos[count].TimeCasa + " x " + jogos[count].TimeDesafiante + "\n" +
                    jogos[count].Estrategias + "\n" +
                    "Link" + jogos[count].Link + "\n" +
                    "..........................................." + "\n\n";
                numProcess++
                //console.log(sendstring)
                //await page.waitForTimeout(200)
                if (sendHeader === false && numProcess >= 3) {
                    try {
                        await messageSender.sendMessage(CHAT_ID, header + aux_sendstring);
                    } catch (error) { }
                    await page.waitForTimeout(200)
                    //console.log("enviou com header " + numProcess)
                    sendstring = ""
                    sendHeader = true
                    numProcess = 0
                } else {
                    if (sendHeader === true && numProcess >= 3) {
                        try {
                            await messageSender.sendMessage(CHAT_ID, aux_sendstring);
                        } catch (error) { }
                        await page.waitForTimeout(200)
                        //console.log("enviou sem header " + numProcess)
                        sendstring = ""
                        numProcess = 0
                    } else {
                        //numProcess++
                    }
                }
            }
            if (numProcess > 0) {
                try {
                    if (sendHeader === false) {
                        await messageSender.sendMessage(CHAT_ID, header + sendstring);
                    } else {
                        await messageSender.sendMessage(CHAT_ID, sendstring);
                    }
                } catch (error) { }
            }
            await page.waitForTimeout(500)
            sendstring = "";
            limparListaEnviados()
            return jogos

        } catch (exception) {
            console.log(exception)
        }
    }

    function CheckHorario() {
        let isOk = false
        let horaDT = new Date()
        let horaAtualComparacao = horaDT.getHours().toString().padStart(2, '0') + ":" + horaDT.getMinutes().toString().padStart(2, '0')
        //console.log(horaAtualComparacao)
        for (let count = 0; count < estrategias.length; count++) {
            if (((estrategias[count].HoraInicial === null || estrategias[count].HoraInicial.length === 0) && (estrategias[count].HoraFinal === null || estrategias[count].HoraFinal.length === 0)) || (horaAtualComparacao >= estrategias[count].HoraInicial && horaAtualComparacao < estrategias[count].HoraFinal)) {
                isOk = true
            }
        }
        return isOk
    }

    async function GetLinks() {
        for (let count = 0; count < jogos.length; count++) {
            try {
                //let divMain = await page.locator('[class="ovm-Fixture ovm-Fixture-horizontal ovm-Fixture-media "]',{ timeout: 500 })
                //.filter({hasText: jogos[count].TimeCasa, exact: true}, { timeout: 500 })
                //.filter({hasText: jogos[count].TimeDesafiante, exact: true}, { timeout: 500 }).first().click()

                await page.getByText(jogos[count].TimeCasa, { exact: true }).first().click()

                page.waitForTimeout(1000);
                let url = page.url()
                page.waitForTimeout(1500);
                page.goBack()
                page.waitForTimeout(500);
                jogos[count].Link = url
                //await page.getByText('Ao-Vivo', { exact: true }).first().click()
            } catch (exception) {
                console.log(exception)
            }
        }
    }

    function CheckHorarioEstrategia(estrat) {
        let horaDT = new Date()
        let horaAtualComparacao = horaDT.getHours().toString().padStart(2, '0') + ":" + horaDT.getMinutes().toString().padStart(2, '0')
        //console.log(horaAtualComparacao)
        if (((estrat.HoraInicial === null || estrat.HoraInicial.length === 0) && (estrat.HoraFinal === null || estrat.HoraFinal.length === 0))) {
            return true
        }
        if (horaAtualComparacao >= estrat.HoraInicial && horaAtualComparacao < estrat.HoraFinal) {
            return true
        }
        return false
    }

    function limparListaEnviados() {
        let horaAtual = new Date()
        let dataJogo = new Date()
        if (jogosEnviados.length > 0) {
            for (let countEnviados = jogosEnviados.length - 1; countEnviados >= 0; countEnviados--) {
                dataJogo = new Date(jogosEnviados.Hora)
                var diffDate = (horaAtual - dataJogo);
                var diffHrs = Math.floor((diffDate % 86400000) / 3600000);
                var diffMins = Math.round(((diffDate % 86400000) % 3600000) / 60000);
                if (diffHrs > 0 || diffMins > 90) {
                    jogosEnviados.splice(countEnviados, 1)
                }
            }
        }
        //console.log(jogosDia)
        if (jogosDia.length > 0) {
            for (let countEnviados = jogosDia.length - 1; countEnviados >= 0; countEnviados--) {
                dataJogo = new Date(jogosDia.Hora)
                if (dataJogo.getDay() != horaAtual.getDay()) {
                    jogosDia.splice(countEnviados, 1)
                }
            }
        }
    }

    function isExpired() {

    }

    function atendeEstrategia(estrategias, jogo) {
        jogo.Estrategias = ""
        for (let count = 0; count < estrategias.length; count++) {
            let atende = true
            if (!CheckHorarioEstrategia(estrategias[count])) {
                atende = false
                continue
            }
            if (jogosEnviados.length > 0) {
                for (let countEnviados = 0; countEnviados < jogosEnviados.length; countEnviados++) {
                    if (jogosEnviados[countEnviados].TimeCasa === jogo.TimeCasa && jogosEnviados[countEnviados].TimeDesafiante === jogo.TimeDesafiante && jogosEnviados[countEnviados].Estrategias.indexOf(estrategias[count].Descricao) >= 0) {
                        atende = false
                        continue
                    }
                }
            }
            if (!atende) {
                continue
            }
            if (estrategias[count].TempoJogoInicial !== null && estrategias[count].TempoJogoInicial !== '' && estrategias[count].TempoJogoInicial !== undefined &&
                estrategias[count].TempoJogoFinal !== null && estrategias[count].TempoJogoFinal !== '' && estrategias[count].TempoJogoFinal !== undefined) {
                let tempo = jogo.TempoJogo.split(":")
                let tempoJogo = parseInt(tempo[0])
                if (estrategias[count].TemjogoInicial < tempoJogo || estrategias[count].TemjogoFinal > tempoJogo) {
                    atende = false
                }
            }
            //Odds Casa
            if (estrategias[count].oddCasaInicial !== null && estrategias[count].oddCasaInicial !== '' && estrategias[count].oddCasaInicial !== undefined) {
                if (jogo.OddsCasa < estrategias[count].oddCasaInicial) {
                    atende = false
                }
            }
            if (estrategias[count].oddCasaFinal !== null && estrategias[count].oddCasaFinal !== '' && estrategias[count].oddCasaFinal !== undefined) {
                if (jogo.OddsCasa > estrategias[count].oddCasaFinal) {
                    atende = false
                }
            }
            //Odds Visitante
            if (estrategias[count].oddDesafianteInicial !== null && estrategias[count].oddDesafianteInicial !== '' && estrategias[count].oddDesafianteInicial !== undefined) {
                if (jogo.OddsDesafiante < estrategias[count].oddDesafianteInicial) {
                    atende = false
                }
            }
            if (estrategias[count].oddDesafianteFinal !== null && estrategias[count].oddDesafianteFinal !== '' && estrategias[count].oddDesafianteFinal !== undefined) {
                if (jogo.OddsDesafiante > estrategias[count].oddDesafianteFinal) {
                    atende = false
                }
            }
            //Ataques Perigosos Casa
            if (estrategias[count].ataquesCasaInicial !== null && estrategias[count].ataquesCasaInicial !== '' && estrategias[count].ataquesCasaInicial !== undefined) {
                if (jogo.AtaquesPerigososCasa < estrategias[count].ataquesCasaInicial) {
                    atende = false
                }
            }
            if (estrategias[count].ataquesCasaFinal !== null && estrategias[count].ataquesCasaFinal !== '' && estrategias[count].ataquesCasaFinal !== undefined) {
                if (jogo.AtaquesPerigososCasa > estrategias[count].ataquesCasaFinal) {
                    atende = false
                }
            }
            //Ataques Perigosos Visitante
            if (estrategias[count].ataquesDesafianteInicial !== null && estrategias[count].ataquesDesafianteInicial !== '' && estrategias[count].ataquesDesafianteInicial !== undefined) {
                if (jogo.AtaquesPerigososDesafiante < estrategias[count].ataquesDesafianteInicial) {
                    atende = false
                }
            }
            if (estrategias[count].ataquesDesafianteFinal !== null && estrategias[count].ataquesDesafianteFinal !== '' && estrategias[count].ataquesDesafianteFinal !== undefined) {
                if (jogo.AtaquesPerigososDesafiante > estrategias[count].ataquesDesafianteFinal) {
                    atende = false
                }
            }
            //Ataques Perigosos Visitante
            if (estrategias[count].somaCasaInicial !== null && estrategias[count].somaCasaInicial !== '' && estrategias[count].somaCasaInicial !== undefined) {
                if ((jogo.ChutesGolCasa + jogo.ChutesForaCasa + jogo.EscanteiosCasa) < estrategias[count].somaCasaInicial) {
                    atende = false
                }
            }
            if (estrategias[count].somaCasaFinal !== null && estrategias[count].somaCasaFinal !== '' && estrategias[count].somaCasaFinal !== undefined) {
                if ((jogo.ChutesGolDesafiante + jogo.ChutesForaDesafiante + jogo.EscanteiosDesafiante) > estrategias[count].somaCasaFinal) {
                    atende = false
                }
            }
            //Placarfavoravel ou empate
            if (estrategias[count].placarDesafianteFavoravel === 1 && estrategias[count].placarEmpatado === 0) {
                if (jogo.PlacarDesafiante < jogo.PlacarCasa) {
                    atende = false
                }
            }
            if (estrategias[count].placarDesafianteFavoravel === 1 && estrategias[count].placarEmpatado === 1) {
                if (jogo.PlacarDesafiante <= jogo.PlacarCasa) {
                    atende = false
                }
            }
            if (atende === true) {
                jogo.Estrategias += estrategias[count].Descricao + " / "
            }
        }
        if (jogo.Estrategias.length > 0) {
            jogo.Estrategias = jogo.Estrategias.substring(0, jogo.Estrategias.length - 2)
            return true
        }
        return false
    }

    function atendeCriteriotempo(estrategias, tempoJogo) {
        for (let count = 0; count < estrategias.length; count++) {
            if (estrategias[count].TemjogoInicial >= tempo && estrategias[count].TemjogoFinal <= tempo) {
                return true
            }
        }
        return false
    }

    async function getEstrategias() {
        try {
            const query = "SELECT * FROM estrategia Where Ativo = 'S' ORDER BY descricao"
            const rows = await db.prepare(query).all()
            if (rows !== null && rows !== undefined) {
                return rows;
            }
            // await ordersDb.all(query, [], (err, rows) => {
            //   if (err) {
            //     return console.error(err.message);
            //   }
            //   console.log(rows)
            //   estrategias = rows
            //   return rows;
            // });
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    function createDbConnection(filename) {
        return open({
            filename,
            driver: sqlite3.Database
        });
    }

    function showData(data) {
        for (let count = 0; count < data.length; count++) {
            console.log('time Casa: ', data.TimeCasa, 'time Desafiante: ', data.TimeDesafiante, 'Placar: ',
                data.PlacarCasa, ' x ', data.PlacarDesafiante, 'Odds: ', data.OddsCasa, ' ',
                data.OddsDesafiante, ' ', data.OddsEmpate, ' ', data.ChutesForaCasa, ' ', data.ChutesForaDesafiante, ' ',
                data.ChutesGolCasa, ' ', data.ChutesGolDesafiante, ' ', data.AtaquesPerigososCasa, ' ', data.AtaquesPerigososDesafiante);
        }
    }

    const job = schedule.scheduleJob('*/2 * * * *', async () => {
        try {
            const data = (await getData())
            //showData(data)
        } catch (exception) {
            console.log(exception)
        }
    });
    //await driver.close()
})();
