from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://workout_user:gonc2004@localhost/workout_tracker'
db = SQLAlchemy(app)


# Model of each row of the database table
class Workout(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    exercise = db.Column(db.String(50), nullable = False)
    weight = db.Column(db.Float, nullable=False)
    reps = db.Column(db.Integer, nullable = False)
# method to return the workout object dictionary to allow jsonify
    def to_dict(self):
        return {"exercise": self.exercise,
                "weight": self.weight,
                "reps": self.reps}

with app.app_context():
    db.create_all()


@app.route('/workout' , methods = ['GET'])
def getWorkout() :
    workouts = []
    workouts_list = Workout.query.all()
    if not workouts_list:
        return jsonify({"message" : "No workouts have been logged"}), 200
    workouts = [w.to_dict() for w in workouts_list]
    return jsonify(workouts), 200
    
@app.route('/workout' , methods = ['POST'])
def postWorkout():
    try: 
        data = request.json
        workout = Workout(exercise=data["exercise"],weight = data["weight"], reps = data["reps"])
        db.session.add(workout)
        db.session.commit()
        return jsonify({"message": "Workout added", "workout" : workout.to_dict()}), 201
    except KeyError:
        return jsonify({"error": "Missing required field"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/workout/<int:id>', methods =['DELETE'])
def delete_workout(id):
    try:
        workout_id = Workout.query.get(id)
        if not workout_id:
            return jsonify({"message" : "workout was not found"}), 404
        else:
            db.session.delete(workout_id)
            db.session.commit()
            return jsonify({"message" : "workout was successfully deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0' , port=5555, debug=True)