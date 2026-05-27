const url = '/workout'

async function getWorkouts() {
    const response = await fetch(url)
    const data = await response.json()
    console.log(data)
}

getWorkouts()