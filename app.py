from datetime import datetime
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy


load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")

db = SQLAlchemy(app)
migrate = Migrate(app, db)


# ==================== MODELS ====================

class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    muscle_group = db.Column(db.String(50), nullable=False)
    exercise_name = db.Column(db.String(50), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    rm = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "muscle_group": self.muscle_group,
            "exercise_name": self.exercise_name,
            "weight": self.weight,
            "reps": self.reps,
            "date": self.date.isoformat() if self.date else None,
        }


with app.app_context():
    db.create_all()


# ==================== HELPERS ====================

def calculate_rm(weight, reps):
    return weight * (1 + (reps / 30))


# ==================== ROUTES ====================

@app.route("/")
def get_index():
    return render_template("index.html")


@app.route("/workout", methods=["GET"])
def get_workout():
    group = request.args.get("muscle_group")
    latest_workouts = {}

    if group:
        workouts = Workout.query.filter_by(muscle_group=group).all()
    else:
        workouts = Workout.query.all()

    for workout in workouts:
        if workout.exercise_name not in latest_workouts:
            latest_workouts[workout.exercise_name] = workout
        elif workout.date > latest_workouts[workout.exercise_name].date:
            latest_workouts[workout.exercise_name] = workout

    return jsonify([workout.to_dict() for workout in latest_workouts.values()])


@app.route("/workout/history", methods=["GET"])
def get_workout_history():
    name = request.args.get("exercise_name")

    if name:
        workouts = (
            Workout.query
            .filter_by(exercise_name=name)
            .order_by(Workout.date.desc())
            .all()
        )
    else:
        workouts = Workout.query.order_by(Workout.date.desc()).all()

    return jsonify([workout.to_dict() for workout in workouts]), 200


@app.route("/workout", methods=["POST"])
def post_workout():
    try:
        data = request.json

        if not data["muscle_group"] or not data["exercise_name"]:
            return jsonify({"error": "Fields cannot be empty"}), 400

        if float(data["weight"]) <= 0 or float(data["reps"]) <= 0:
            return jsonify({
                "error": "Weight and reps must be greater than 0"
            }), 400

        rep_max = calculate_rm(
            float(data["weight"]),
            int(data["reps"])
        )

        workout = Workout(
            muscle_group=data["muscle_group"],
            exercise_name=data["exercise_name"],
            weight=data["weight"],
            reps=data["reps"],
            rm=rep_max
        )

        new_rm = False

        existing_max = (
            db.session
            .query(db.func.max(Workout.rm))
            .filter_by(exercise_name=data["exercise_name"])
            .scalar()
        )

        if existing_max is not None:
            if workout.rm > existing_max:
                new_rm = True

        db.session.add(workout)
        db.session.commit()

        return jsonify({
            "message": "Workout added",
            "workout": workout.to_dict(),
            "new_rm": new_rm
        }), 201

    except KeyError:
        return jsonify({"error": "Missing required field"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/workout", methods=["DELETE"])
def delete_workout():
    try:
        name = request.args.get("exercise_name")

        Workout.query.filter_by(exercise_name=name).delete()
        db.session.commit()

        return jsonify({
            "message": "workout was successfully deleted"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ==================== APPLICATION ====================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5555,
        debug=True
    )