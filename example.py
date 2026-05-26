from flask import Flask, request, jsonify

app = Flask(__name__)

workouts = []
@app.route('/workout', methods = ['GET'])
def returnWorkouts():
    return jsonify(workouts)

@app.route('/workout', method = ['POST'])
def postWorkouts():
    data = request.json
    workout = {
        "Exercise": data["Exercise"],
        "Reps": data["Reps"],
        
    }