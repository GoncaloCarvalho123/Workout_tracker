// TODO: add history display logic
//      Solution: fetch GET /workout/history to store all workouts to display corresponding updates with their dateTime

// ========================================   DATA   ===================================================


let currentMuscleGroup = ""
let currentExercise = null


// ======================= API CALLS ============================

// sends a new workout to POST api
async function postWorkout(event, workout, message) {

    event.preventDefault()

    const r = await fetch('/workout', {
    method: "POST",
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(workout)
    }
    )

    const result = await r.json()
    if (r.ok) {
    document.getElementById(message).textContent = result["message"]
    }
    else {
        document.getElementById(message).textContent = result["error"]
    }


    setTimeout(() => {
        document.getElementById(message).textContent = ""}, 2000
    )
}



async function handleLogSubmit() {
        const workout = {
        exercise_name: document.getElementById("exercise_name").value,
        muscle_group: currentMuscleGroup,
        weight: document.getElementById("weight").value,
        reps: document.getElementById("reps").value
    }

    await postWorkout(event,workout, "log-message")

    document.getElementById("exercise_name").value = ""
    document.getElementById("weight").value = ""
    document.getElementById("reps").value = ""
    
}

async function handleConfirmUpdate() {
    const workout = {
    exercise_name: currentExercise.exercise_name,
    muscle_group:  currentExercise.muscle_group,
    weight: Number(document.getElementById("new-weight").value),
    reps: Number(document.getElementById("new-reps").value)
    }
    
    await postWorkout(event,workout, "update-message")
    currentExercise = workout

    document.getElementById("current-weight").textContent = `Weight: ${document.getElementById("new-weight").value} lbs`
    document.getElementById("current-reps").textContent = `Reps: ${document.getElementById("new-reps").value}`
    document.getElementById("new-weight").value=""
    document.getElementById("new-reps").value=""
    document.getElementById("update-exercise").classList.add("hidden")
}

// ======================= UI HELPERS ======================

function hideMenu() {
    document.querySelectorAll(".menu").forEach(btn => btn.classList.add("hidden"))
}

function hideMuscleGroupButtons() {
    document.getElementById("musclegroups-list").classList.add("hidden")
}

function populateExerciseList(exercises) {
    const ul = document.getElementById("exercise-list")
    ul.innerHTML = ""

    exercises.forEach(exercise => {
        const li = document.createElement("li")
        li.textContent = exercise.exercise_name
        li.dataset.id = exercise.id
        
        li.addEventListener("click", () => {
            currentExercise = exercise
            document.querySelectorAll(".section").forEach(section => section.classList.add("hidden"))
            document.getElementById("exercise-details").classList.remove("hidden")
            document.getElementById("exercise-name").textContent = exercise.exercise_name
            document.getElementById("current-weight").textContent = `Weight: ${exercise.weight} lbs`
            document.getElementById("current-reps").textContent = `Reps: ${exercise.reps}`
        })
        
        ul.appendChild(li)
    })
}
function hideExerciseList() {
    document.getElementById("exercises-section").classList.add("hidden")
}


// ======================= NAVIGATION ========================

function returnToMenu() {
    document.querySelectorAll(".section").forEach(btn => btn.classList.add("hidden"))
    document.querySelectorAll(".menu").forEach(btn => btn.classList.remove("hidden"))
}

function returnToMuscleGroups() {
    document.getElementById("musclegroups-list").classList.remove("hidden")
    document.getElementById("exercises-section").classList.add("hidden")
}

async function showExercises(bodypart) {
    currentMuscleGroup = bodypart
    hideMuscleGroupButtons()
    const r = await fetch(`/workout?muscle_group=${bodypart}`)

    const exercises = await r.json()
    populateExerciseList(exercises)
    document.getElementById("exercises-section").classList.remove("hidden")
}

async function showHistory(exercise_name) {
    const r = await fetch(`/workout/history?exercise_name=${exercise_name}`)
    const exercises = await r.json()

    document.querySelectorAll(".section").forEach(button => button.classList.add("hidden"))
    document.getElementById("history-section").classList.remove("hidden")
    
    const ul = document.getElementById("history-list")
    ul.innerHTML = ""

    document.getElementById("history-exercise-name").textContent = currentExercise.exercise_name
    exercises.forEach(exercise => {
        const date = new Date(exercise.date)
        const month = date.toLocaleString('default', { month: 'short' })
        const day = date.getDate()
        const li = document.createElement("li")
        li.textContent = ` ${month} ${day} - ${exercise.weight} lbs x ${exercise.reps} reps`
        console.log(exercise.date)

        ul.appendChild(li)
    })

}


function returnToExerciseList() {
    document.querySelectorAll(".section").forEach(section => section.classList.add("hidden"))
    showExercises(currentMuscleGroup)
}



// ================= EVENT LISTENERS =====================

// --- Main Menu ---
document.getElementById("show-musclegroups").addEventListener("click", (event) => {
    event.preventDefault()
    hideMenu()
    document.getElementById("musclegroups-list").classList.remove("hidden")
})

// --- Muscle Groups ---
document.getElementById("return-from-MuscleGroups").addEventListener("click", returnToMenu)


const groups = ['back', 'chest', 'legs', 'arms', 'shoulders']
groups.forEach(group => {
    document.getElementById('btn-' + group).addEventListener('click', () => {
        showExercises(group)
    })
})

// --- Exercise List ---
document.getElementById("return-from-exercises").addEventListener("click", returnToMuscleGroups)
document.getElementById("add").addEventListener("click", () => {
    hideExerciseList()
    document.getElementById("log-section").classList.remove("hidden")
})

// --- Exercise Details ---
document.getElementById("history").addEventListener("click",() => {
    showHistory(currentExercise.exercise_name)
})

document.getElementById("return-from-history").addEventListener("click", returnToExerciseList)

document.getElementById("update-button").addEventListener("click", () => {
    document.getElementById("update-exercise").classList.remove("hidden")
})

document.getElementById("return-from-exercise-details").addEventListener("click", returnToExerciseList)

document.getElementById("confirm-update").addEventListener("click", handleConfirmUpdate)

// --- Log Workout ---
document.getElementById("log-submit").addEventListener("click",handleLogSubmit)
document.getElementById("return-from-log").addEventListener("click", returnToExerciseList)


