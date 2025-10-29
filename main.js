
import http from 'http';
import * as fsSync from 'fs';           
import { promises as fs } from 'fs';    
import path from 'path';              
import { Command } from 'commander';
import superagent from 'superagent';
const program = new Command();
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

  if (!fsSync.existsSync(cacheDir)){
    try {
       fsSync.mkdirSync(cacheDir, { recursive: true });
    console.log(`[Info] Створено директорію кешу: ${cacheDir}`);

        
    } catch (err) {
        console.error(`[Error] Не вдалося створити директорію кешу: ${err.message}`);
    process.exit(1)
    }
  }else{
    console.log(`[Info] Використовується існуюча директорія кешу: ${cacheDir}`);
  }
//#
 async function getBody(req){
    const chunks = []
    for await(const chunk of req){
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
}
const server = http.createServer(async (req, res)=>{
   const { method, url } = req; 

const fileName = path.basename(url);
   if (fileName === '/' || fileName === '.' || fileName === '..'||fileName === '')  {
    res.writeHead(400, {'Content-Type': 'text/plain; charset=utf-8'})

   return res.end('400 Bad Request: Не вказано код картинки в URL\n');
  }
const filePath = path.join(cacheDir, fileName);

try {
    switch(method){
        case 'GET':
        try{
            const data = await fs.readFile(filePath);
            console.log(`[Cache Hit] Файл ${fileName} знайдено в кеші.`);
            res.writeHead(200, {'Content-Type': 'image/jpeg'})
            res.end(data)
        }catch(err){
            if(err.code ==='ENOENT'){
                const catUrl = `https://http.cat/${fileName}`;
            console.log(`[Cache Miss] Файл ${fileName} не знайдено. Запит до ${catUrl}`);
            try {
              
              const response = await superagent.get(catUrl)
                .buffer(true);

             
              await fs.writeFile(filePath, response.body);
              console.log(`[Cache Write] Картинку ${fileName} збережено в кеш.`);

             
              res.writeHead(200, { 'Content-Type': 'image/jpeg' });
              res.end(response.body);

            } catch (requestError) {
            
              console.error(`[Proxy Error] Помилка запиту до ${catUrl}: ${requestError.status || requestError.message}`);
              res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
              res.end('404 Not Found: Картинку не знайдено ані в кеші, ані на http.cat');
            }
          } 
            else{
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


            case 'DELETE':
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