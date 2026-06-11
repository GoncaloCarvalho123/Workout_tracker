// TODO: restructure postWorkout() function to take a workout object to allow different buttons to log workouts by simply creating an object with all attributes and passing it to postWorkout.
//       At the moment, postWorkout handles the log-submit button specifically by reading specific input boxes from that page
//       Once this is done, update the confirm-submit button to post a workout.



// ========================================   DATA   ===================================================

const url = '/workout'
let allWorkouts = []
let currentMuscleGroup = ""
let currentExercise = null

function getMuscleGroupExercises(bodypart)
{
    let exercises = []
    result = allWorkouts.filter(item => item.muscle_group == bodypart)
    return result
}

// ======================= API CALLS ============================

// sends a new workout to POST api
async function postWorkout(event) {
    event.preventDefault()
    const muscle_group = currentMuscleGroup
    const exercise_name = document.getElementById("exercise_name").value
    const weight = document.getElementById("weight").value
    const reps = document.getElementById("reps").value

    data = {"muscle_group" : muscle_group,
        "exercise_name" : exercise_name,
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
    getWorkouts()   
    }
    else {
        document.getElementById("message").textContent = result["error"]
    }

    document.getElementById("exercise_name").value = ""
    document.getElementById("weight").value = ""
    document.getElementById("reps").value = ""

    setTimeout(() => {
        document.getElementById("message").textContent = ""}, 2000
    )

}

// fetches all workouts and stores them for later access
async function getWorkouts() {

    const r = await fetch(url)

    const result = await r.json()
    if (Array.isArray(result)) {
        allWorkouts = result
    }
    else {
        console.log(result["message"])
    }
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

function showExercises(bodypart) {
    currentMuscleGroup = bodypart
    hideMuscleGroupButtons()
    exercises = getMuscleGroupExercises(bodypart)
    populateExerciseList(exercises)
    document.getElementById("exercises-section").classList.remove("hidden")
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
document.getElementById("btn-back").addEventListener("click", () => showExercises("back"))
document.getElementById("btn-chest").addEventListener("click", () => showExercises("chest"))
document.getElementById("btn-legs").addEventListener("click", () => showExercises("legs"))
document.getElementById("btn-arms").addEventListener("click", () => showExercises("arms"))
document.getElementById("btn-shoulders").addEventListener("click", () => showExercises("shoulders"))

// --- Exercise List ---
document.getElementById("return-from-exercises").addEventListener("click", returnToMuscleGroups)
document.getElementById("add").addEventListener("click", () => {
    hideExerciseList()
    document.getElementById("log-section").classList.remove("hidden")
})

// --- Exercise Details ---
document.getElementById("update-button").addEventListener("click", () => {
    document.getElementById("update-exercise").classList.remove("hidden")
})
document.getElementById("return-from-exercise-details").addEventListener("click", returnToExerciseList)
document.getElementById("confirm-update").addEventListener("click", () => {
    const exercise_name = currentExercise.exercise_name
    const muscle_group = currentExercise.muscle_group
    const weight = currentExercise.weight
    const reps = currentExercise.reps
})

// --- Log Workout ---
document.getElementById("log-submit").addEventListener("click", postWorkout)
document.getElementById("return-from-log").addEventListener("click", returnToExerciseList)



getWorkouts()
