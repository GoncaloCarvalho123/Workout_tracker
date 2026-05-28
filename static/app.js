const url = '/workout'



async function postWorkout(event) {
    event.preventDefault()
    const exercise = document.getElementById("exercise").value
    const weight = document.getElementById("weight").value
    const reps = document.getElementById("reps").value

    data = {"exercise" : exercise,
    "weight" : weight,
    "reps" : reps
    }

    const r = await fetch(url, {
    method: "POST",
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(data)
    }
    )

    const result = await r.json()
    if (r.ok) {
    document.getElementById("message").textContent = result["message"]
    }
    else {
        document.getElementById("message").textContent = result["error"]
    }

    document.getElementById("exercise").value = ""
    document.getElementById("weight").value = ""
    document.getElementById("reps").value = ""

    setTimeout (() => {
        document.getElementById("message").textContent = ""
    }, 3000)
}

async function viewWorkout() {
    
}

function hideMenu() {
    document.querySelectorAll(".menu").forEach(btn => btn.classList.add("hidden"))
}

function back() {
    document.querySelectorAll(".section").forEach(btn => btn.classList.add("hiddent"))
    document.querySelectorAll(".menu").forEach(btn => btn.classList.remove("hidden"))
}



document.getElementById("show-log").addEventListener("click", (event) => {
    event.preventDefault()
    hideMenu()
    document.getElementById("log-section").classList.remove("hidden")
})
document.getElementById("back").addEventListener("click", back)
document.getElementById("log-submit").addEventListener("click", postWorkout)

