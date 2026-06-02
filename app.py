from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://workout_user:gonc2004@localhost/workout_tracker'
db = SQLAlchemy(app)


# Model of each row of the database table
class Workout(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    muscle_group = db.Column(db.String(50), nullable = False)
    exercise = db.Column(db.String(50), nullable = False, unique=True)
    weight = db.Column(db.Float, nullable=False)
    reps = db.Column(db.Integer, nullable = False)
# method to return the workout object dictionary to allow jsonify
    def to_dict(self):
        return {"muscle_group" : self.muscle_group,
                "exercise": self.exercise,
                "weight": self.weight,
                "reps": self.reps}

# create database table with db model context
with app.app_context():
    db.create_all()

# render html file with root url
@app.route('/')
def index():
    return render_template('index.html')

# GET route for getting all the workout objects in workouts
@app.route('/workout' , methods = ['GET'])
def getWorkout():
    workouts = []
    workouts_list = Workout.query.all()
    if not workouts_list:
        return jsonify({"message" : "No workouts have been logged"}), 200
    # store each workout object as dict in workouts list
    workouts = [w.to_dict() for w in workouts_list]
    return jsonify(workouts), 200
    
# Post route for posting a new workout 
@app.route('/workout' , methods = ['POST'])
def postWorkout():
    try: 
        # read json that will be sent in from javascript
        data = request.json
        workout = Workout(muscle_group = data["muscle_group"],exercise=data["exercise"],weight = data["weight"], reps = data["reps"])
        # add workout object to database table
        db.session.add(workout)
        db.session.commit()
        # always return success of failure message in json to javascript
        return jsonify({"message": "Workout added", "workout" : workout.to_dict()}), 201
    except KeyError:
        return jsonify({"error": "Missing required field"}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify ({"error" : "Exercise already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete route by capturing workout id
@app.route('/workout/<int:id>', methods =['DELETE'])
def delete_workout(id):
    try:
        workout_id = Workout.query.get(id)
        if not workout_id:
            return jsonify({"message" : "workout was not found"}), 404
        else:
            db.session.delete(workout_id)
            db.session.commit()
            return jsonify({"message" : "workout was successfully deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0' , port=5555, debug=True)