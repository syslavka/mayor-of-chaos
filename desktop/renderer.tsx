import React from "react";
import {createRoot} from "react-dom/client";
import {Landmark, Minus, Square, X} from "lucide-react";
import Home from "../app/page";
import "@fontsource-variable/golos-text";
import "../app/globals.css";

document.documentElement.dataset.desktop = "true";
try { document.documentElement.dataset.theme = localStorage.getItem("mayor-theme") === "light" ? "light" : "dark"; } catch {}

function DesktopApp() {
  return <>
    <div className="desktop-titlebar">
      <div className="titlebar-name"><Landmark size={14}/><span>Мэрия случайностей</span><span className="titlebar-version">DESKTOP / 1.0</span></div>
      <div className="titlebar-center"><span/>ГОРОД В ВАШИХ РУКАХ</div>
      <div className="window-controls">
        <button onClick={()=>window.mayorDesktop?.minimize()} aria-label="Свернуть окно"><Minus size={15}/></button>
        <button onClick={()=>window.mayorDesktop?.toggleMaximize()} aria-label="Развернуть или восстановить окно"><Square size={12}/></button>
        <button className="window-close" onClick={()=>window.mayorDesktop?.close()} aria-label="Закрыть приложение"><X size={17}/></button>
      </div>
    </div>
    <Home/>
  </>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><DesktopApp/></React.StrictMode>);
