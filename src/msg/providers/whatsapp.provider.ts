import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom';
import * as qrcodeterminal from 'qrcode-terminal';
import { whatsAppInterface } from '../interfaces/whatsapp-message.interface';

const QRCode = require('qrcode');
const logger = new Logger('WhatappProvider');

export const WhatsAppProvider = async ({ to, message, session }: whatsAppInterface) => {
  let messageSent = false
  /*  OPCIONES 
  1: enviarmensaje sin validar si exsite en whatsapp
  2: validar exsitencia de numeros y despues enviar los whatsapps
  3: revisar cada whatsapp priemero si existe despues enviar uno por uno 
  */
  const option = 3

  try {
    return await createSocket(to, message, messageSent, session, option)
  } catch (error) {
    logger.error('Error al enviar el mensajes:', error);
    return { Error: `Error al enviar mensaje: ${error}` };
  }

}


const createSocket = async (to?: any, message?: string, messageStatus?: boolean, session?: string, option?: number): Promise<object> => {
  let terminarPoceso = false
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;  // Máximo de intentos de reconexión permitidos
  let messageSent = messageStatus;
  let generetadQr = false
  let sessionName = session // Se traduce en un endpoint /numero de telefono para asegurar que cada session sea diferenciada

  const { state, saveCreds } = await useMultiFileAuthState(`./src/msg/whatsapp_sessions/${session}`);


  return new Promise((resolve, reject) => {
    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      // qrTimeout: 60000,
      // logger: pino
    });


    try {
    socket.ev.on('connection.update', async (update) => {
      
        

     
      console.log({ updateData: update, sessionName })
      const { connection, qr, lastDisconnect } = update;
      let qrCode: string
      logger.log(`Conexión actualizada: ${connection}, última desconexión: ${lastDisconnect}, en sesión de ${session}`);
      if (lastDisconnect?.error.message === "QR refs attempts ended") {
        console.log("Qrs terminado")
        terminarPoceso = true
      }
      if (lastDisconnect?.error.message === "Connection Terminated") {
        logger.warn("lastDisconnect Connection Terminated error")
        terminarPoceso = true
      }
      console.log({ lastDisconnect});

      // >2 GENERAR QRs
      if (qr && !generetadQr) {


        qrcodeterminal.generate(qr, { small: true });
        console.log('QR generado. Escanéalo en WhatsApp.');
        try {
          // Convertir a Base64 utilizando async/await
          qrCode = await QRCode.toDataURL(qr); // Convertir a Base64
          console.log('QR generado. base 64');
          generetadQr = true
          resolve({ QR: qrCode, active: false });  // Devolver el código QR en base64
        } catch (err) {
          console.error('Error al generar el QR:', err);
          resolve(err);
        }
        resolve({ QR: qrCode });
      } else if (qr && generetadQr) {
        console.log('Tiempo de qr terminado');
        socket.ws.close()
        resolve({ error: "Tiempo de qr terminado"});
      }

      // >2 Conexion y envio de mensajes
      if (connection === 'close' && !messageSent && !terminarPoceso) {
        console.log('Conexión cerrada. Intentando reconectar...');
        if (lastDisconnect) {
          const error = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = error !== DisconnectReason.loggedOut;
          console.log(`Estado de desconexión: ${error}, ¿Reconectar? ${shouldReconnect} `);
          
          if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Intento de reconexión #${reconnectAttempts}`);
            setTimeout(() => {
              console.log('Reintentando conexión...');
              createSocket(to, message, messageSent, session);  // Intentar reconectar
            }, 5000 * reconnectAttempts);
          } else if (!shouldReconnect) {
            console.log(`No se reconectará debido a logout. `);
            const deleted = await deleteSessionFolder(`./src/msg/whatsapp_sessions/${session}`, session);
            resolve(deleted);
          } else {
            console.log('Límite de intentos de reconexión alcanzado.');
            reject("Límite de intentos de reconexión alcanzado.");
          }
        }
      } else if (connection === 'open' && !messageSent) {
        logger.verbose('Conexión abierta exitosamente!');
        reconnectAttempts = 0;
        
        // >2 ENVIO DE MESNSAJES
        if (to !== undefined && message !== undefined) {
          try {
            const inicio = performance.now();
            let countEnviados = 0
            let countInexistentes = 0
            
            // Validar todos los numeros
            let nummerosValidos = []
            let numerosInvalidos = []

            // : OPTION 1
            if (option === 1) {
              for (const e of to) {
                console.log({ element: e, message: message });
                const num = Number(e);
                
                if (!isNaN(num) && e.length === 10) {
                  try {
                    const msg = await socket.sendMessage(`521${e}@s.whatsapp.net`, { text: message });
                    countEnviados = countEnviados + 1
                    logger.verbose(`Mensaje numero ${countEnviados} enviado`);
                  } catch (error) {
                    console.log(error);
                    countInexistentes = countInexistentes + 1
                  }
                } else {
                  countInexistentes = countInexistentes + 1
                }
              }

            }

            // : OPTION 2
            if (option === 2) {
              //Validar con onWhatsApp invalidos y validos y enviar validos
              for (const e of to) {
                if (e.length === 10) {
                  try {
                    let idOnWhatsapp = await socket.onWhatsApp(`521${e}@s.whatsapp.net`)
                    if (idOnWhatsapp.length !== 0) {
                      nummerosValidos.push(e)
                    } else if (idOnWhatsapp.length === 0) {
                      numerosInvalidos.push(e)
                      countInexistentes = countInexistentes + 1
                    }
                  } catch (error) {
                    console.error(error)
                  }
                } else if (e.length !== 13) {
                  numerosInvalidos.push(e)
                }
              }
              
              for (const e of nummerosValidos) {
                
                try {
                  const msg = await socket.sendMessage(`521${e}@s.whatsapp.net`, { text: message });
                  countEnviados = countEnviados + 1
                  logger.verbose(`Mensaje numero ${countEnviados} enviado`);
                } catch (error) {
                  console.log(error);
                  countInexistentes = countInexistentes + 1
                }

              }
            }
            // : OPTION 3
            if (option === 3) {
              //  Validar con envio de mensaje
              for (const e of to) {
                console.log({ element: e, message: message });
                const num = Number(e);
                if (!isNaN(num) && e.length === 10) {
                  let idOnWhatsapp = await socket.onWhatsApp(`521${e}@s.whatsapp.net`)  // Check if whatsapp exists
                  if (idOnWhatsapp.length !== 0) {
                    try {
                      const msg = await socket.sendMessage(`521${e}@s.whatsapp.net`, { text: message });
                      countEnviados = countEnviados + 1
                      logger.verbose(`Mensaje numero ${countEnviados} enviado`);

                    } catch (error) {
                      console.log(error);
                      countInexistentes = countInexistentes + 1
                    }
                  } else if (idOnWhatsapp.length === 0) {
                    console.log(`Mensaje no enviado ya que el numero no existe!!!`)
                    countInexistentes = countInexistentes + 1
                  }
                } else {
                  console.log(`Mensaje no enviado ya que el numero no existe!!!`)
                  countInexistentes = countInexistentes + 1
                }
              }
            }

            const fin = performance.now();
            const tiempo = (fin - inicio) / 1000;  // Millisegundos to Segundos
            console.log({ numerosInvalidos: numerosInvalidos.length, nummerosValidos: nummerosValidos.length, performance: tiempo })
            messageSent = true;
            socket.ws.close()
            resolve({
              messageSent: countEnviados,
              messageNotSent: countInexistentes,
              message: `Mensajes enviados correctamente ${countEnviados} por whatsApp con el mensaje: ${message} con un total de ${countInexistentes} numeros no existentes!!!`
            });

          } catch (error) {
            logger.error(error);

            resolve(error);

          }
        } else if (!message && !to) {
          logger.warn("No se envió el mensajes debido a que no existe numero ni mensaje que enviar QR entrance");
          resolve({ message: "Ya existe una cuenta vinculada con este numero", active: true });
          messageSent = true;

        }

        else {
          logger.error("No se envió el mensaje. Destinatario o mensaje inválido.");
          // reject("Destinatario o mensaje inválido.");
          socket.ws.close()
          messageSent = true;
          resolve({ message: "Mensaje de whatsApp no enviado correctamente." });
        }
      }
    });
  } catch (error) {
        logger.error(error)
        return
      }
      socket.ev.on('creds.update', saveCreds);

    // // En caso de que ocurra algún otro error general
    return
  });
}


// ? FUNCTIONS

interface Socket {
  onWhatsApp: (jid: string) => Promise<any>;
  sendMessage: (jid: string, message: object) => Promise<any>;
  logger?: any;
}



const deleteSessionFolder = async (folderPath: string, session: string) => {
  try {
    fs.rmSync(folderPath, { recursive: true });
    console.log('Carpeta de la sesión eliminada correctamente.');
    return await createSocket(session);
  } catch (err) {
    console.error('Error al intentar eliminar la carpeta de la sesión:', err);
  }
}

async function validarNumeros(to: string[], socket: any): Promise<{ validos: string[], invalidos: string[] }> {
  const numerosValidos: string[] = [];
  const numerosInvalidos: string[] = [];

  for (const numero of to) {
    if (numero.length === 13) {
      const idOnWhatsapp = await socket.onWhatsApp(`${numero}@s.whatsapp.net`);
      if (idOnWhatsapp.length !== 0) {
        numerosValidos.push(numero);
      } else {
        numerosInvalidos.push(numero);
      }
    } else {
      numerosInvalidos.push(numero);
    }
  }
  return { validos: numerosValidos, invalidos: numerosInvalidos };
}

async function enviarNumerosValidos(to: string[], message: string, socket: any): Promise<{ enviados: number, noEnviados: number }> {
  let countEnviados = 0;
  let countInexistentes = 0;

  for (const numero of to) {
    if (numero.length === 13) {
      const idOnWhatsapp = await socket.onWhatsApp(`${numero}@s.whatsapp.net`);
      if (idOnWhatsapp.length !== 0) {
        await socket.sendMessage(`${numero}@s.whatsapp.net`, { text: message });
        countEnviados++;
      } else {
        countInexistentes++;
      }
    }
  }

  return { enviados: countEnviados, noEnviados: countInexistentes };
}

async function enviarTodosLosNumeros(to: string[], message: string, socket: any): Promise<number> {
  let countEnviados = 0;

  for (const numero of to) {
    if (numero.length === 13) {
      await socket.sendMessage(`${numero}@s.whatsapp.net`, { text: message });
      countEnviados++;
    }
  }

  return countEnviados;
}
