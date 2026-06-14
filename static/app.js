// TODO: Fix update logic. Update needs to add a new workout to database table. Change logic for database workout table and GET method. Create new GET method to return history. 
//          Solution: Workout table currently stores only unique workouts. Change structure to store all workouts with their updates with their time. 
//                      /Workout GET api will return a list of only the most recent of each exercise
//                      Create another GET api that will return the entire history

// ========================================   DATA   ===================================================

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
    getWorkouts()   
    }
    else {
        document.getElementById(message).textContent = result["error"]
    }


    setTimeout(() => {
        document.getElementById(message).textContent = ""}, 2000
    )

}

// fetches most recent workouts and stores them for later access
async function getWorkouts() {

    const r = await fetch('/workout')

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
document.getElementById("confirm-update").addEventListener("click", (event) => {
    const workout = {
    exercise_name: currentExercise.exercise_name,
    muscle_group:  currentExercise.muscle_group,
    weight: document.getElementById("new-weight").value,
    reps: document.getElementById("new-reps").value
    }
    
    postWorkout(event,workout, "update-message")

    document.getElementById("current-weight").textContent = `Weight: ${document.getElementById("new-weight").value} lbs`
    document.getElementById("current-reps").textContent = `Reps: ${document.getElementById("new-reps").value}`
    document.getElementById("new-weight").value=""
    document.getElementById("new-reps").value=""
})

// --- Log Workout ---
document.getElementById("log-submit").addEventListener("click", (event) => {
    const workout = {
        exercise_name: document.getElementById("exercise_name").value,
        muscle_group: currentMuscleGroup,
        weight: document.getElementById("weight").value,
        reps: document.getElementById("reps").value
    }

    postWorkout(event,workout, "log-message")

    document.getElementById("exercise_name").value = ""
    document.getElementById("weight").value = ""
    document.getElementById("reps").value = ""
    
}
)
document.getElementById("return-from-log").addEventListener("click", returnToExerciseList)


getWorkouts()
