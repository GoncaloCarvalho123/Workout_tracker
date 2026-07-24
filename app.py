from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from datetime import datetime
from flask_migrate import Migrate
from prometheus_flask_exporter import PrometheusMetrics
import os

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db = SQLAlchemy(app)
migrate = Migrate(app, db)
metrics = PrometheusMetrics(app)

# =============== MODELS ===============

class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    muscle_group = db.Column(db.String(50), nullable=False)
    exercise_name = db.Column(db.String(50), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    reps = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "muscle_group": self.muscle_group,
            "exercise_name": self.exercise_name,
            "weight": self.weight,
            "reps": self.reps,
            "date":self.date.isoformat() if self.date else None
        }

with app.app_context():
    db.create_all()


# =============== ROUTES ===============

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/workout', methods=['GET'])
def getWorkout():
    group = request.args.get('muscle_group')
    latest_workouts = {}
    workouts = Workout.query.filter_by(muscle_group=group).all() if group else Workout.query.all()

    for workout in workouts:
        if workout.exercise_name not in latest_workouts:
            latest_workouts[workout.exercise_name] = workout
        elif workout.exercise_name in latest_workouts:
            if workout.date > latest_workouts[workout.exercise_name].date:
                latest_workouts[workout.exercise_name] = workout

    return jsonify([w.to_dict() for w in latest_workouts.values()])



@app.route('/workout/history', methods=['GET'])
def getWorkoutHistory():
    name = request.args.get('exercise_name')
    workouts_list = Workout.query.filter_by(exercise_name = name).order_by(Workout.date.desc()).all() if name else Workout.query.order_by(Workout.date.desc()).all()
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
    app.run(host='0.0.0.0', port=5555, debug=False)