# <<<<<<< HEAD:api/main.py
# from flask import Flask, request, jsonify

# app = Flask(__name__)

# @app.route("/")
# def home():
#     return "Home"

# if __name__ == '__main__':
#     app.run(debug=True)
# =======
from flask import Flask, request, jsonify
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
import psycopg2
import os

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

#Connects to the database (local)
def get_db_connection():
     return psycopg2.connect(
         dbname="localclassmap",
         user="Evan1",
         password="",
         host="localhost"
     )

#connects to the actual database
# def get_db_connection():

#     DATABASE_URL = os.environ.get("DATABASE")  # Render sets this automatically
#     return psycopg2.connect(DATABASE_URL)
#     #return psycopg2.connect("postgresql://postgres.tdfnsrizrhmufotpnozl:mudtyp-fenpim-nuWhe0@aws-0-us-west-1.pooler.supabase.com:6543/postgres")





@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT studentid, password, firstname, lastname FROM Student WHERE studentemail = %s", (email,))
    user = cur.fetchone()
    
    if user and bcrypt.check_password_hash(user[1], password):
        print("User found")
        user_id = user[0]
        user_name = f"{user[2]} {user[3]}"
        
        # Create token with user ID in the identity
        access_token = create_access_token(identity={"UserID": user_id, "email": email, "name": user_name})
        
        # Return both token and user information
        return jsonify({
            "access_token": access_token,
            "name": user_name,
            "userId": user_id
        }), 200
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/SelectSchool")
def get_schools():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT schoolid, schoolname FROM school")
    schools = cur.fetchall()
    return jsonify([{"schoolid": school[0], "schoolname": school[1]} for school in schools]), 200
    
# DO NOT add routes below this line
@app.route("/")
def home():
    return "Home"

# # This must be outside the if __name__ == '__main__' block for Render
port = int(os.environ.get("PORT", 5000))

# # Run the app - this needs to be at the file level for Render
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port)

