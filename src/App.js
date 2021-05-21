import punto from './foto_tarea_3.png';
import inicioFin from './inicio_fin.png';
import './App.css';
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './map.css'
import {Icon} from "leaflet"


const io = require("socket.io-client");

function Position({socket}){
  const [responsePos, setResponsePos] = useState([]);
  const [responseVuelos, setResponseVuelos] = useState("");
  const icono = new Icon({iconUrl:punto, iconSize:[10,10]})
  const icono2 = new Icon({iconUrl:inicioFin, iconSize:[8,8]})
  useEffect(() => {
    socket.on("POSITION", data => {
      setResponsePos((prev)=>[...prev, data]);
    });
    socket.emit("FLIGHTS")
    socket.on("FLIGHTS", data => {
      setResponseVuelos(data);
    });
  }, []);

  if (responsePos != [] & responseVuelos != ""){
    return (
        <div> 
        <p>  
        <h2> &nbsp; &nbsp; Mapa en Vivo </h2>
        <MapContainer center={[-33, -70]} zoom={4} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ul>
          {responsePos.map(pos => 
          <div>
            <Marker position={pos.position} icon={icono}>
            <Popup>
              {pos.code}
            </Popup>
            </Marker>
          </div>)}
        </ul> 

        <ul>
          {responseVuelos.map(vuelo => 
          <div>
            <Marker position={vuelo.origin} icon={icono2}>
            <Popup>
              {vuelo.code}
            </Popup>
            </Marker>
            <Marker position={vuelo.destination} icon={icono2}>
            <Popup>
              {vuelo.code}
            </Popup>
            </Marker>
            <Polyline pathOptions= {{ color:'red' }} positions={[vuelo.origin, vuelo.destination]} />
          </div>)}
        </ul> 
      </MapContainer>
      </p>
      <h2> &nbsp; &nbsp; Información Vuelos </h2>
      
      <ul>
      <div class="field-alignment-row">
          {responseVuelos.map(vuelo =>
            <div> 
              <div class="box"> 
              <div> 
              <h4> Vuelo {vuelo.code} </h4>
              <li> {vuelo.airline} </li>
              <li> {vuelo.origin} </li>
              <li> {vuelo.destination} </li>
              <li> {vuelo.plane} </li>
              <li> {vuelo.seats} </li>
              <p>Pasajeros:</p>
              {vuelo.passengers.map(pasajero => 
                <div>
                  <li> {pasajero.name}, {pasajero.age} </li>
                </div>)}
                </div>
              </div>
            </div>
          )}
          
        </div>
        </ul>
        
      </div>
      )
  } else {
    return(
      "Cargando"
    )
  }
}

function Chat({socket}){
  const [responseChat, setResponseChat] = useState([]);
  const [responseMensaje, setResponseMensaje] = useState("");
  const [responseName, setResponseName] = useState("");
  //const [responseVuelos, setResponseVuelos] = useState("");
  const handleSubmit = (evt) => {
    socket.emit("CHAT", {"name": responseName, "message": responseMensaje})
    evt.preventDefault();}

  useEffect(() => {
    socket.on("CHAT", data => {
      setResponseChat((prev)=>[...prev, data]);
    });
    
  }, []);
  
  if (responseChat != []){
    return (
      <div>
       <h2> &nbsp; &nbsp; Centro de Control </h2>
       <div class="box-chat">  
       <div> 
       <h4> Mensajes: </h4>
       <ul>
        
          {responseChat.map(chat => 
          <div class="box-mini">
          <div>
            <h4> {chat.name} </h4> 
            <p> ({Date(chat.date)}) </p>
            <p> "{chat.message}" </p>
            </div>
          </div>)} 
          
        </ul>
        </div>
        </div>
        <div class="filler"> </div>
        <div class="box"> 
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={responseName}
              onChange={e => setResponseName(e.target.value)}
            />
          </label>
          <label>
            Message:
            <input
              type="text"
              value={responseMensaje}
              onChange={e => setResponseMensaje(e.target.value)}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>
        </div>
      </div>
    )} else {
    return(
      "Cargando"
    )
  } 
}

function App() {
  const [socket, setSocket] = useState(""); 
  useEffect(() => {
    const conexionSocket = io('ws://tarea-3-websocket.2021-1.tallerdeintegracion.cl', {path: '/flights'});
    setSocket(conexionSocket)
  }, []);
  if (socket != ""){
    return(
      <div> 
      <Position socket={socket} />,
      <Chat socket={socket} />
      </div>
    )
  } else {
    return(
      "Cargando"
    )
  }
  
}

export default App;

