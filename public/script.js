async function loadSystemInfo(){

    try{

        const response = await fetch("/api");

        const data = await response.json();

        document.getElementById("app-status").textContent =
    data.status.charAt(0).toUpperCase() + data.status.slice(1);

        document.getElementById("hostname").textContent = data.hostname;

        document.getElementById("uptime").textContent =
            Math.floor(data.uptime_seconds) + " sec";

        document.getElementById("platform").textContent =
            data.platform;

        document.getElementById("current-time").textContent =
            data.current_time;

        document.getElementById("started-at").textContent =
            data.started_at;

    }

    catch(err){

        console.error(err);

    }

}

loadSystemInfo();

setInterval(loadSystemInfo,5000);

const sidebar=document.getElementById("sidebar");
const menuBtn=document.getElementById("menuBtn");

menuBtn.addEventListener("click",()=>{

    sidebar.classList.toggle("collapsed");

});
