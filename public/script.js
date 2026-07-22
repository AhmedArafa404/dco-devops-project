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
async function loadOptimization() {

    try {

        const response = await fetch("/api/optimization");

        if (!response.ok) {
            throw new Error("Optimization API request failed");
        }

        const data = await response.json();

        document.getElementById("optimization-status").textContent =
            data.status.replaceAll("_", " ");

        document.getElementById("optimization-cpu").textContent =
            data.metrics.cpu_usage_percent + "%";

        document.getElementById("optimization-memory").textContent =
            data.metrics.memory_usage_percent + "%";

        document.getElementById("optimization-disk").textContent =
            data.metrics.disk_usage_percent + "%";

        document.getElementById("optimization-recommendation").textContent =
            data.recommendation;

    } catch (err) {

        console.error("Optimization error:", err);

        document.getElementById("optimization-status").textContent =
            "Unavailable";
    }
}

loadOptimization();

setInterval(loadOptimization, 10000);
