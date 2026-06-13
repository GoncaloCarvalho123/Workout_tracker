from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db = SQLAlchemy(app)


# =============== MODELS ===============

class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    muscle_group = db.Column(db.String(50), nullable=False)
    exercise_name = db.Column(db.String(50), nullable=False, unique=True)
    weight = db.Column(db.Float, nullable=False)
    reps = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "muscle_group": self.muscle_group,
            "exercise_name": self.exercise_name,
            "weight": self.weight,
            "reps": self.reps
        }

with app.app_context():
    db.create_all()


# =============== ROUTES ===============

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/workout', methods=['GET'])
def getWorkout():
    workouts_list = Workout.query.all()
    if not workouts_list:
        return jsonify({"message": "No workouts have been logged"}), 200
    return jsonify([w.to_dict() for w in workouts_list]), 200




@app.route('/workout', methods=['POST'])
def postWorkout():
    try:
        data = request.json
        if not data["muscle_group"] or not data["exercise_name"]:
            return jsonify({"error" : "Fields cannot be empty"}), 400
        
        if float(data["weight"]) <= 0 or float(data["reps"]) <= 0:
            return jsonify({"error": "Weight and reps must be greater than 0"}), 400
        
        workout = Workout(
            muscle_group=data["muscle_group"],
            exercise_name=data["exercise_name"],
            weight=data["weight"],
            reps=data["reps"]
        )
        db.session.add(workout)
        db.session.commit()
        return jsonify({"message": "Workout added", "workout": workout.to_dict()}), 201
    except KeyError:
        return jsonify({"error": "Missing required field"}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Exercise already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500





@app.route('/workout/<int:id>', methods=['DELETE'])
def delete_workout(id):
    try:
        workout = Workout.query.get(id)
        if not workout:
            return jsonify({"message": "workout was not found"}), 404
        db.session.delete(workout)
        db.session.commit()
        return jsonify({"message": "workout was successfully deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400





if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555, debug=True)