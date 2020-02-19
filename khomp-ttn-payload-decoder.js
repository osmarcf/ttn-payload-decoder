function toHexString(byteArray) {
  var s = '';
  byteArray.forEach(function(byte) {
    s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
  });
  return s;
}

function Decoder(bytes, port) {
  var decoded = {};

  var temUmidade = false;
  var temTemperatura = false;
  var temVersaoFirmware = false;
  var temRSSI = false;
  var temBateria = false;
  var temSonda = false;
  var quantidadeSondas = 0;
  var temContadorContatoSeco2 = false;
  var temEstadoContatoSeco2 = false;
  var temContadorContatoSeco1 = false;
  var temEstadoContatoSeco1 = false;
  var sondas = [];

  if (port === 4) {
    if ((bytes[0] & 0x10) == 0x10) temUmidade = true;
    if ((bytes[0] & 0x08) == 0x08) temTemperatura = true;
    if ((bytes[0] & 0x04) == 0x04) temVersaoFirmware = true;
    if ((bytes[0] & 0x02) == 0x02) temRSSI = true;
    if ((bytes[0] & 0x01) == 0x01) temBateria = true;
    
    if ((bytes[1] & 0x80) == 0x80) temSonda = true;
    if ((bytes[1] & 0x70) !== 0x00) quantidadeSondas = (bytes[1] & 0x70) >> 4;
    if ((bytes[1] & 0x08) == 0x08) temContadorContatoSeco2 = true;
    if ((bytes[1] & 0x04) == 0x04) temEstadoContatoSeco2 = true;
    if ((bytes[1] & 0x02) == 0x02) temContadorContatoSeco1 = true;
    if ((bytes[1] & 0x01) == 0x01) temEstadoContatoSeco1 = true;
  }
  
  var indice = 2;

  if (temBateria) decoded.bateria = bytes[indice] / 10;
  if (temBateria) indice++;

  if (temVersaoFirmware) decoded.versaoFirmware = (bytes[indice + 2] << 16) + (bytes[indice + 1] << 8) + bytes[indice];
  indice += 3;

  if (temTemperatura) decoded.temperatura = +((((bytes[indice + 1] << 8) + bytes[indice]) / 100) - 273.15 ).toFixed(2);
  indice += 2;

  if (temUmidade) decoded.umidade = ((bytes[indice + 1] << 8) + bytes[indice]) / 10;
  indice += 2;
  
  if (temContadorContatoSeco1) {
    decoded.estadoContatoSeco1 = bytes[indice];
    indice++
    decoded.contadorContatoSeco1 = ((bytes[indice + 1] << 8) + bytes[indice]);
    indice += 2;
  }
  
  if (temContadorContatoSeco2) {
    decoded.estadoContatoSeco2 = bytes[indice];
    indice++
    decoded.contadorContatoSeco2 = ((bytes[indice + 1] << 8) + bytes[indice]);
    indice += 2;
  }
  
  if (temSonda) {
    for (var i = 0; i < quantidadeSondas; i++) {
      var sonda = {} ;
      sonda.temperatura = +((((bytes[indice + 1] << 8) + bytes[indice]) / 100) - 273.15).toFixed(2);
      indice += 2;
      sonda.id = toHexString( bytes.slice(indice, indice + 8).reverse() );
      indice += 8;
      
      sondas.push(sonda);
    }
    decoded.sondas = sondas;
  }

  return decoded;
}

