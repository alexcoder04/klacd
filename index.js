
function sortByKey(arr, key, ascending = true) {
    return arr.sort((a, b) => {
        if (a[key] < b[key]) return ascending ? -1 : 1;
        if (a[key] > b[key]) return ascending ? 1 : -1;
        return 0;
    });
}

function unixToStr(unixSecs) {
    const d = new Date(unixSecs * 1000);
    const pad = n => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth())}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function timeUntilStr(unixSecs) {
    const now = Date.now();

    if (now >= unixSecs * 1000) {
        return "Bereits vergangen";
    }

    const diff = Math.max(0, unixSecs * 1000 - now);
    const secondsTotal = Math.floor(diff / 1000);

    const days = Math.floor(secondsTotal / 86400);
    const hours = Math.floor((secondsTotal % 86400) / 3600);
    const minutes = Math.floor((secondsTotal % 3600) / 60);
    const seconds = secondsTotal % 60;

    return `${days} Tage ${hours} Stunden ${minutes} Minuten ${seconds} Sekunden`
}

async function fetchExams(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    return data.exams.map(exam => ({
        name: exam.name,
        id: exam.id,
        time: Number(exam.time)
    }));
}

fetchExams("data.json").then(exams => {
    sortByKey(exams, "time");
    exams.forEach(e => {
        if (e.time * 1000 < Date.now()) {
            return;
        }

        const tr = document.createElement("tr");

        const titleTd = document.createElement("td");
        titleTd.id = `${e.id}-title`;
        titleTd.textContent = e.name;

        const dateTd = document.createElement("td");
        dateTd.id = `${e.id}-date`;
        dateTd.textContent = unixToStr(e.time);

        const countdownTd = document.createElement("td");
        countdownTd.id = `${e.id}-countdown`;

        tr.appendChild(titleTd);
        tr.appendChild(dateTd);
        tr.appendChild(countdownTd);

        document.getElementById("exams-table").appendChild(tr);

        setInterval(() => {
            document.getElementById(`${e.id}-countdown`).innerText = timeUntilStr(e.time);
        }, 1000);
    });
})

// reload after 30min
setTimeout(() => {
    location.reload(true);
}, 30 * 60 * 1000);
