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

function getBody(req){
    return new Promise((resolve, reject)=> {
        const chunks = []
        req.on('data', chunk => chunks.push(chunk))
        req.on('end', ()=> resolve(Buffer.concat(chunks)))
        req.on('error', err=> reject(err))
    })
}
const server = http.createServer(async (req, res)=>{
   const { method, url } = req; 

const fileName = path.basename(url);
   if (fileName === '/' || fileName === '.' || fileName === '..')  {
    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'})
    res.end('Сервер запущено та працює!\n');
  }
const filePath = path.join(cacheDir, fileName);

try {
    switch(method){
        case 'GET':
        try{
            const data = await fs.readFile(filePath);
            res.writeHead(200, {'Content-Type': 'image/jpeg'})
            res.end(data)
        }catch(err){
            if(err.code ==='ENOENT'){
                res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'})
                res.end('404 Not Found: Картинок нема ')
            }else{
                throw err;
            }
        }
        break
        case 'PUT':
            const body = await getBody(req)
            await fs.writeFile(filePath, body)
            res.writeHead(201, {'Content-Type': 'text/plain; charset=utf-8'})
            res.end('201 Created: Картинку оновлено/зБережено')
            break;


            case 'Delete':
                try {
                    await fs.unlink(filePath)
                    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'})
                    res.end('200 Оуйес: Картинку видалено')

                } catch (err) {
                    if (err.code ==='ENOENT'){
                        res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'})
                        res.end('404 Not Found: Картинку для видалення не знайдено')
                    }else{
                        throw err;
                    }
                    
                }
                break;
                default:
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('405 Method Not Allowed');
    }
} catch (serverErr) {
    console.error(`[Server Error] ${serverErr.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Internal Server Error');
}

})

  

  server.listen(port, host, ()=> {
    console.log(`[Success] Сервер успішно запущено за адресою http://${host}:${port}`)
  })

  server.on('error', (err)=> {
    console.error(`[Error] Помилка сервера: ${err.message}`);
  })