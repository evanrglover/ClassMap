from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
import psycopg2

#flask app
app = Flask(__name__)
#CORS app for handling requests from different domains
CORS(app)
#Used for hashing passwords
bcrypt = Bcrypt(app)
# token for token stuff, the key needs to be changed probably
app.config["JWT_SECRET_KEY"] = "supersecretkey"  
#JWT for token management
jwt = JWTManager(app)

#Connects tot the database
conn = psycopg2.connect(
    dbname="localclassmap",
    user="Evan1",
    password="",
    host="localhost"
)
cur = conn.cursor()


# @app.route("/register", methods=["POST"])
# def register():
#     data = request.get_json()
#     email = data.get("email")
#     password = data.get("password")

#     cur.execute("SELECT * FROM users WHERE email = %s", (email,))
#     if cur.fetchone():
#         return jsonify({"error": "User already exists"}), 400

#     password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
#     cur.execute("INSERT INTO users (email, password_hash) VALUES (%s, %s)", (email, password_hash))
#     conn.commit()

#     return jsonify({"message": "User created successfully"}), 201

# User Login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    hash = data.get("hash")

    cur.execute("SELECT id, password_hash FROM users WHERE email = %s", (email,))
    user = cur.fetchone()

    if user and bcrypt.check_password_hash(hash, password):
        access_token = create_access_token(identity={"id": user[0], "email": email})
        return jsonify({"access_token": access_token})

    return jsonify({"error": "Invalid credentials"}), 401


# School Selection Route
@app.route("/schools", methods=["GET"])
def get_schools():
    cur.execute("SELECT id, name FROM schools")
    schools = cur.fetchall()
    return jsonify([{"id": school[0], "name": school[1]} for school in schools])


@app.route("/")
def home():
    return "Home"

if __name__ == '__main__':
    app.run(debug=True)