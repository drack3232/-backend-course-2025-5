import { Command } from "commander";
import * as fs from "fs/promises"


const program = new Command();
const http = require('http')
const fs = require('fs')
const {program} = require('commander')
program
  .name("WebBack-5")
  .version("1.0.0");

program
  .requiredOption('-h, --host <string>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу');

  program.parse(process.argv)

  const options = program.opts()

  const host = options.host
  const port = parseInt(options.port, 10)
  const cacheDir = options.cache

  if (!fs.existsSync(cacheDir)){
    try {
        fs.mkdirSync(cacheDir, {recursive: true})
        console.log(`[Info] Створено директорію кешу: ${cacheDir}`);

        
    } catch (err) {
        console.error(`[Error] Не вдалося створити директорію кешу: ${err.message}`);
    process.exit(1)
    }
  }else{
    console.log(`[Info] Використовується існуюча директорія кешу: ${cacheDir}`);
  }
  const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'})
    res.end('Сервер запущено та працює!\n');
  })

  server.listen(port, host, ()=> {
    console.log(`[Success] Сервер успішно запущено за адресою http://${host}:${port}`)
  })

  server.on('error', (err)=> {
    console.error(`[Error] Помилка сервера: ${err.message}`);
  })