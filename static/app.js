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

// fetches all workouts and stores them in allWorkouts list for later access
let allWorkouts = []
async function getWorkouts(event) {
    event.preventDefault()
    const r = await fetch(url)

    const result = await r.json()
    if (Array.isArray(result)) {
        allWorkouts = result
    }
    else {
        console.log(result["message"])
    }
}

function hideMenu() {
    document.querySelectorAll(".menu").forEach(btn => btn.classList.add("hidden"))
}

function back() {
    document.querySelectorAll(".section").forEach(btn => btn.classList.add("hidden"))
    document.querySelectorAll(".menu").forEach(btn => btn.classList.remove("hidden"))
    document.getElementById("back-button").classList.add("hidden")
}

// clicking "View Workouts" hides menu and shows muscle group selection
document.getElementById("show-musclegroups").addEventListener("click", (event) => {
    event.preventDefault()
    hideMenu()
    document.getElementById("musclegroups-section").classList.remove("hidden")
    document.getElementById("back-button").classList.remove("hidden")
})


// return to previous page
document.getElementById("back-button").addEventListener("click", back)
// submit new exercise
document.getElementById("log-submit").addEventListener("click", postWorkout)
// view back exercise
document.getElementById("btn-back").addEventListener("click")
// view chest exercise 
document.getElementById("btn-chest").addEventListener("click")
// view leg exercise
document.getElementById("btn-legs").addEventListener("click")
// view arms exercises
document.getElementById("btn-arms").addEventListener("click")
// view shoulder exercises
document.getElementById("btn-shoulders").addEventListener("click")


